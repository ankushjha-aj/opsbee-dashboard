"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
//import { addTask } from "./app/actions"
import { type Task, TaskStatus } from "../types"
import { format } from "date-fns"

interface TaskModalProps {
  user: string
  date: string
  onClose: () => void
  onTaskCreated: (task: Task) => void
}

export default function TaskModal({ user, date, onClose, onTaskCreated }: TaskModalProps) {
  const [description, setDescription] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!description.trim()) return

    setIsSubmitting(true)

    try {
      // const newTask = await addTask({
      //   user,
      //   date,
      //   description,
      //   status: TaskStatus.NOT_STARTED,
      // })

      // if (newTask) {
      //   onTaskCreated(newTask)
      // }
    } catch (error) {
      console.error("Failed to add task:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Task for {user}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="text-sm text-muted-foreground mb-4">Date: {format(new Date(date), "EEEE, MMMM d, yyyy")}</div>

          <div className="space-y-2">
            <Label htmlFor="description">Task Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task details..."
              className="min-h-[100px]"
              required
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

