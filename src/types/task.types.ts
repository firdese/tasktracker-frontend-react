export interface Task {
  taskId?: number
  taskDescription?: string
  taskStartAtUtc?: string | null
  taskEndAtUtc?: string | null
  taskCompletedAtUtc?: string | null
  taskDueAtUtc?: string | null
  taskSortOrder?: number
  taskPriority?: number
  taskProgress?: number | null
  taskDependencyTaskIds?: number[] | null
  taskGroupId: number
  taskDeletedAtUtc?: string | null
  taskCreatedAtUtc?: string
  taskUpdatedAtUtc?: string
}
