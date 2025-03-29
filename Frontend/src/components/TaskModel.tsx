import React, { useState } from "react";
import { format } from "date-fns";
import axios from "axios";
import { Task } from "../types";

const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
};

interface TaskModal extends Task {
  onTaskCreated: (task: Task) => void;
  onClose: () => void;
}

export const TaskModal: React.FC<TaskModal> = ({
  person,
  date,
  onClose,
  onTaskCreated,
}) => {
  console.log("task modal me hu!");

  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("submit handler me hu!");

    if (!description.trim()) return;

    setIsSubmitting(true);

    try {
      const taskData = {
        person,
        date,
        description,
        status: TaskStatus.PENDING,
      };
      console.log("ha aaya ");

      const newTask : Task = await axios.post(
        `${import.meta.env.VITE_SERVER_URI}/api/tasks`,
        taskData
      );
      console.log(newTask);

      if (newTask) {
        onTaskCreated(newTask);
      }
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content  p-8 bg-zinc-200 w-[26vw] rounded-md space-y-8 ">
        <div className="modal-header flex justify-between">
          <h2 className="text-2xl font-semibold">Add Task for {person}</h2>
          <button
            className="close-button w-7 h-7 font-semibold bg-zinc-300 rounded-full "
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="task-form flex flex-col gap-4">
          <div className="date-info text-zinc-500">
            Date: {format(new Date(date), "EEEE, MMMM d, yyyy")}
          </div>

          <div className="form-group flex flex-col gap-3 ">
            <label htmlFor="description " className="font-semibold">
              Task Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task details..."
              className="task-textarea outline-none border-2 border-zinc-400 h-30 px-3 py-2 rounded-lg resize-none "
              required
            />
          </div>

          <div className="form-actions flex flex-row-reverse gap-3 ">
            <button
              type="submit"
              className="submit-button px-4 py-2 rounded-md bg-black text-white "
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Task"}
            </button>
            <button
              type="button"
              className="cancel-button px-4 py-2 rounded-md border border-zinc-500"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
