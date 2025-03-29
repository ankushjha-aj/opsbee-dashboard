import axios from "axios";
import { useState, useEffect } from "react";
// import { Calendar } from "./components/ui/Calendar";

import { Button } from "./components/ui/button";
import {
  PlusCircle,
  CheckCircle,
  Circle,
  MinusCircle,
  Trash,
} from "lucide-react";
//import { getTasks, updateTaskStatus } from "./app/actions"
import { format } from "date-fns";
import { TaskModal } from "./components/TaskModel";
import { type Task, TaskStatus } from "./types";
import "./index.css";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";
import { AddMembers } from "./components/AddMembers";

// Team members
const URL = import.meta.env.VITE_SERVER_URI;

export default function App() {
  const [date, setDate] = useState<Date>(new Date());
  const [teamMembersState, setTeamMembersState] =
    useState<{ name: string }[]>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddMembersOpen, setIsAddMembersOpen] = useState<boolean>(false);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [visibleDates, setVisibleDates] = useState<string[]>([]);

  // Generate 7 days starting from the selected date
  useEffect(() => {
    const dates: string[] = [];
    const currentDate = new Date(date);
    const dateFormat: string = "yyyy-MM-dd";
    for (let i = 0; i < 7; i++) {
      const newDate = new Date(currentDate);
      newDate.setDate(newDate.getDate() + i);
      dates.push(format(newDate, dateFormat));
    }

    setVisibleDates(dates);
  }, [date]);

  // Fetch tasks when visible dates change
  useEffect(() => {
    const fetchTasks = async () => {
      if (visibleDates.length > 0) {
        const response = await axios.get(
          `${URL}/api/tasks/date/${visibleDates[0]}`
        );

        setTasks((prevTask) => {
          const mergedTasks = [...prevTask, ...response.data];
          const updatedTasks = Array.from(
            new Map(mergedTasks.map((task) => [task.id, task])).values()
          );
          return updatedTasks;
        });
      }
    };

    const fetchMembers = async () => {
      const response = await axios.get(`${URL}/api/person`);
      setTeamMembersState(() => [...response.data]);
    };

    fetchMembers();
    fetchTasks();
  }, [visibleDates]);

  // Open modal to add a new task
  const handleAddTask = (user: string, date: string) => {
    setSelectedUser(user);
    setSelectedDate(date);
    setIsModalOpen(true);
  };

  // Handle task creation
  const handleTaskCreated = (newTask: Task) => {
    setTasks([...tasks, newTask]);
    setIsModalOpen(false);
    window.location.reload();
  };

  // Update task status
  const handleStatusChange = async (task: Task) => {
    let newStatus: TaskStatus;

    // Cycle through statuses
    switch (task.status) {
      case TaskStatus.PENDING:
        newStatus = TaskStatus.IN_PROGRESS;
        break;
      case TaskStatus.IN_PROGRESS:
        newStatus = TaskStatus.COMPLETED;
        break;
      case TaskStatus.COMPLETED:
        newStatus = TaskStatus.PENDING;
        break;
      default:
        newStatus = TaskStatus.PENDING;
    }

    const updatedTask = { ...task, status: newStatus };
    const response = await axios.put(`${URL}/api/tasks/${task.id}`, {
      status: updatedTask.status,
      description: updatedTask.description,
    });
    window.location.reload();
    console.log(response);
  };
  function formatDateToISO(dateStr: string) {
    try {
      // If it's already in YYYY-MM-DD format, return as is
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        return dateStr;
      }

      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateStr);
        return null;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error("Error formatting date:", dateStr, error);
      return null;
    }
  }

  // Get tasks for a specific user and date
  const getUserTasks = (person: string, date: string) => {
    return tasks.filter((task) => {
      if (task.person === person && formatDateToISO(task.date) === date) {
        return task;
      }
    });
  };

  const deleteTask = async (task: Task) => {
    const response = await axios.delete(`${URL}/api/tasks/${task.id}`);
    setTasks(() => {
      return response.data;
    });
    window.location.reload();
  };

  const handleAddMember = async (newMember: string) => {
    console.log(newMember);
    await axios.post(`${URL}/api/person/${newMember}`);
    setIsAddMembersOpen(false);
    setTeamMembersState((prevMembers) => [
      ...prevMembers!,
      { name: newMember },
    ]);
  };

  // Render status icon based on task status
  const renderStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case TaskStatus.IN_PROGRESS:
        return <MinusCircle className="h-5 w-5 text-amber-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <div className="container h-full mx-auto py-8 overflow-y-scroll">
      <h1 className="text-3xl font-bold mb-6">OpsBee Dashboard</h1>

      <div className="flex flex-col md:flex-row gap-6 mb-8">
        <div className="border rounded-md p-4">
          {/* <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && setDate(newDate)}
            className="rounded-md "
          /> */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateCalendar
              // value={date}
              onChange={(newDate) => newDate && setDate(newDate)}
            />
          </LocalizationProvider>
        </div>

        <div className="flex-1">
          <h2 className="text-xl font-semibold mb-4">
            Viewing tasks from{" "}
            {format(new Date(visibleDates[0] || date), "MMM d, yyyy")} to{" "}
            {format(
              new Date(visibleDates[visibleDates.length - 1] || date),
              "MMM d, yyyy"
            )}
          </h2>
          <p className="text-muted-foreground mb-2">
            Click on + to add a task. Click on status icons to cycle through:
            not started → in progress → completed.
          </p>
          <p className="text-muted-foreground mb-2">
            Embrace the future with confidence as we navigate the ever-evolving tech landscape together ensuring <br/>your operations are not just efficient but at the forefront of innovation.
          </p> 
          <p className="text-muted-foreground mb-2">
          OpsBee stands as a leading force in the DevOps and Cloud Solutions arena, with a strategic presence in<br/> India and the USA. Boasting decades of collective expertise, our seasoned engineers have successfully<br/> served 50+ clients, including 30+ Fortune MNCs, shaping success stories through profound industry <br/>knowledge. 
          </p> 
        </div>
      </div>

      <div className="border-collapse rounded-md">
        <table className="border-collapse border border-zinc-200">
          <thead>
            <tr className="bg-zinc-100">
              <th className="border p-3 min-w-[100px] text-left">
                Team Member
              </th>
              {visibleDates.map((date) => (
                <th key={date} className="border p-3 min-w-[200px] text-left">
                  {format(new Date(date), "EEE, MMM d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {teamMembersState?.map((user) => (
              <tr key={user.name}>
                <td className="border p-3 font-semibold">{user.name}</td>
                {visibleDates.map((date) => {
                  const userTasks = getUserTasks(user.name, date);

                  return (
                    <td
                      key={`${user}-${date}`}
                      className="border p-3 align-top"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-zinc-600 text-muted-foreground">
                          {userTasks.length} tasks
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAddTask(user.name, date)}
                          className="h-6 w-6 p-0 cursor-pointer"
                        >
                          <PlusCircle className="h-5 w-5 hover:cursor-pointer" />
                          <span className="sr-only">Add task</span>
                        </Button>
                      </div>

                      <div className="space-y-2">
                        {userTasks.map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-x-2 p-2 rounded-md bg-zinc-100"
                          >
                            <div className="flex items-center gap-x-2">
                              <button
                                onClick={() => handleStatusChange(task)}
                                className="flex-shrink-0 cursor-pointer bg-white rounded-full"
                              >
                                {renderStatusIcon(task.status!)}
                              </button>
                              <span className="text-sm">
                                {task.description}
                              </span>
                            </div>
                            <Trash
                              onClick={() => deleteTask(task)}
                              className="text-black size-5 cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={() => setIsAddMembersOpen(true)}
          className="px-3 py-1 mt-2 cursor-pointer bg-zinc-100 rounded-lg font-bold"
        >
          {" "}
          + Add Members
        </button>
      </div>
      {isAddMembersOpen && (
        <div className=" h-full w-full bg-[#2e2e2ebf]  top-0 left-0 fixed flex items-center justify-center">
          <AddMembers
            person={selectedUser}
            onClose={() => setIsModalOpen(false)}
            onAddPerson={handleAddMember}
          />
        </div>
      )}

      {isModalOpen && (
        <div className=" h-full w-full bg-[#2e2e2ebf]  top-0 left-0 fixed flex items-center justify-center">
          <TaskModal
            person={selectedUser}
            date={selectedDate}
            onClose={() => setIsModalOpen(false)}
            onTaskCreated={handleTaskCreated}
          />
        </div>
      )}
    </div>
  );
}
