// Create a separate types file
export enum TaskStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
}

export type Task = {
  id?: string
  person: string
  date: string
  description?: string
  status?: TaskStatus
}

