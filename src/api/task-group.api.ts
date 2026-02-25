import { apiRequest } from './http'
import type { TaskGroup } from '../types/task-group.types'

const baseTaskGroupPath = '/taskgroup'

export function getTaskGroups(): Promise<TaskGroup[]> {
  return apiRequest<TaskGroup[]>(baseTaskGroupPath, 'GET')
}

export function createTaskGroups(payload: TaskGroup[]): Promise<TaskGroup[]> {
  return apiRequest<TaskGroup[]>(baseTaskGroupPath, 'POST', payload)
}

export function updateTaskGroups(payload: TaskGroup[]): Promise<TaskGroup[]> {
  return apiRequest<TaskGroup[]>(baseTaskGroupPath, 'PUT', payload)
}

export function deleteTaskGroups(taskGroupIds: number[]): Promise<number[]> {
  return apiRequest<number[]>(baseTaskGroupPath, 'DELETE', taskGroupIds)
}
