import { apiRequest } from './http'
import type { Task } from '../types/task.types'

const baseTaskPath = '/tasks'

export function getTasks(taskGroupId: number): Promise<Task[]> {
  return apiRequest<Task[]>(`${baseTaskPath}?taskGroupId=${taskGroupId}`, 'GET')
}

export function createTasks(payload: Task[]): Promise<Task[]> {
  return apiRequest<Task[]>(baseTaskPath, 'POST', payload)
}

export function updateTasks(payload: Task[]): Promise<Task[]> {
  return apiRequest<Task[]>(baseTaskPath, 'PUT', payload)
}

export function deleteTasks(taskIds: number[]): Promise<number[]> {
  return apiRequest<number[]>(baseTaskPath, 'DELETE', taskIds)
}
