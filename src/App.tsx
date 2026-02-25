import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Navigate, NavLink, Route, Routes, useNavigate, useParams } from 'react-router-dom'
import './App.css'
import keycloak from './keycloak'
import { createTaskGroups, deleteTaskGroups, getTaskGroups, updateTaskGroups } from './api/task-group.api'
import { createTasks, deleteTasks, getTasks, updateTasks } from './api/task.api'
import type { TaskGroup } from './types/task-group.types'
import type { Task } from './types/task.types'

type TaskMap = Record<number, Task[]>

type TaskGroupPageProps = {
  taskGroups: TaskGroup[]
  taskMap: TaskMap
  onLoadTasks: (taskGroupId: number, forceRefresh?: boolean) => Promise<void>
}

function TaskGroupPage({ taskGroups, taskMap, onLoadTasks }: TaskGroupPageProps) {
  const { groupId } = useParams<{ groupId: string }>()
  const selectedGroupId = Number(groupId)

  const selectedGroup = useMemo(
    () => taskGroups.find((group) => group.taskGroupId === selectedGroupId),
    [taskGroups, selectedGroupId],
  )

  useEffect(() => {
    if (selectedGroupId > 0) {
      void onLoadTasks(selectedGroupId)
    }
  }, [onLoadTasks, selectedGroupId])

  if (!selectedGroup) {
    if (taskGroups.length === 0) {
      return (
        <section className="task-group-view">
          <h2>No Task Groups</h2>
          <p>Create a task group from the sidebar.</p>
        </section>
      )
    }
    return <Navigate to={`/group/${taskGroups[0].taskGroupId}`} replace />
  }

  const tasks = taskMap[selectedGroupId] ?? selectedGroup.tasks ?? []

  const handleCreateTask = async () => {
    const taskDescription = window.prompt('Task description')
    if (!taskDescription || !taskDescription.trim()) {
      return
    }

    await createTasks([
      {
        taskGroupId: selectedGroupId,
        taskDescription: taskDescription.trim(),
        taskSortOrder: tasks.length + 1,
        taskPriority: 1,
      },
    ])
    await onLoadTasks(selectedGroupId, true)
  }

  const handleUpdateTask = async (task: Task) => {
    if (!task.taskId) {
      return
    }
    const nextDescription = window.prompt('Edit task description', task.taskDescription ?? '')
    if (!nextDescription || !nextDescription.trim()) {
      return
    }

    await updateTasks([
      {
        ...task,
        taskDescription: nextDescription.trim(),
      },
    ])
    await onLoadTasks(selectedGroupId, true)
  }

  const handleDeleteTask = async (taskId?: number) => {
    if (!taskId) {
      return
    }
    const shouldDelete = window.confirm('Delete this task?')
    if (!shouldDelete) {
      return
    }

    await deleteTasks([taskId])
    await onLoadTasks(selectedGroupId, true)
  }

  return (
    <section className="task-group-view">
      <div className="content-header">
        <h2>{selectedGroup.taskGroupDescription ?? 'Untitled Group'} Tasks</h2>
        <button type="button" className="inline-btn" onClick={() => void handleCreateTask()}>
          Add Task
        </button>
      </div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.taskId} className="task-item">
            <div>
              <div className="task-title">{task.taskDescription ?? 'Untitled Task'}</div>
              <div className="task-meta">Priority: {task.taskPriority ?? 0}</div>
            </div>
            <div className="row-actions">
              <button type="button" className="inline-btn" onClick={() => void handleUpdateTask(task)}>
                Edit
              </button>
              <button
                type="button"
                className="inline-btn danger-btn"
                onClick={() => void handleDeleteTask(task.taskId)}
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}

function App() {
  const navigate = useNavigate()
  const [taskGroups, setTaskGroups] = useState<TaskGroup[]>([])
  const [taskMap, setTaskMap] = useState<TaskMap>({})
  const [newTaskGroupDescription, setNewTaskGroupDescription] = useState('')
  const [isCreatingTaskGroup, setIsCreatingTaskGroup] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    const interval = window.setInterval(() => {
      keycloak.updateToken(30).catch(() => {
        keycloak.login()
      })
    }, 15000)

    return () => {
      window.clearInterval(interval)
    }
  }, [])

  const loadTaskGroups = async () => {
    try {
      const groups = await getTaskGroups()
      setTaskGroups(groups)
      setErrorMessage(null)
      if (groups.length > 0) {
        const firstGroupId = groups[0].taskGroupId
        if (firstGroupId) {
          await loadTasks(firstGroupId)
        }
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to load task groups')
    }
  }

  useEffect(() => {
    void loadTaskGroups()
  }, [])

  const loadTasks = async (taskGroupId: number, forceRefresh = false) => {
    if (!forceRefresh && taskMap[taskGroupId]) {
      return
    }
    try {
      const tasks = await getTasks(taskGroupId)
      setTaskMap((current) => ({
        ...current,
        [taskGroupId]: tasks,
      }))
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to load tasks')
    }
  }

  const handleCreateTaskGroup = async () => {
    const description = newTaskGroupDescription.trim()
    if (!description) {
      setErrorMessage('Task group description is required.')
      return
    }

    try {
      setIsCreatingTaskGroup(true)
      const created = await createTaskGroups([
        {
          taskGroupDescription: description,
        },
      ])
      const createdTaskGroup = created[0]
      const createdId = createdTaskGroup?.taskGroupId
      setNewTaskGroupDescription('')
      setErrorMessage(null)
      await loadTaskGroups()

      if (createdId) {
        navigate(`/group/${createdId}`)
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to create task group')
    } finally {
      setIsCreatingTaskGroup(false)
    }
  }

  const handleEditTaskGroup = async (taskGroup: TaskGroup) => {
    if (!taskGroup.taskGroupId) {
      return
    }
    const nextDescription = window.prompt(
      'Edit task group description',
      taskGroup.taskGroupDescription ?? '',
    )
    if (!nextDescription || !nextDescription.trim()) {
      return
    }

    try {
      const updated = await updateTaskGroups([
        {
          ...taskGroup,
          taskGroupDescription: nextDescription.trim(),
        },
      ])
      const updatedTaskGroup = updated[0]
      if (!updatedTaskGroup?.taskGroupId) {
        return
      }
      setTaskGroups((current) =>
        current.map((group) =>
          group.taskGroupId === updatedTaskGroup.taskGroupId ? updatedTaskGroup : group,
        ),
      )
      setErrorMessage(null)
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to update task group')
    }
  }

  const handleDeleteTaskGroup = async (taskGroup: TaskGroup) => {
    if (!taskGroup.taskGroupId) {
      return
    }
    const shouldDelete = window.confirm('Delete this task group?')
    if (!shouldDelete) {
      return
    }

    try {
      await deleteTaskGroups([taskGroup.taskGroupId])
      const remaining = taskGroups.filter((group) => group.taskGroupId !== taskGroup.taskGroupId)
      setTaskGroups(remaining)
      setTaskMap((current) => {
        const clone = { ...current }
        delete clone[taskGroup.taskGroupId as number]
        return clone
      })
      setErrorMessage(null)
      if (remaining.length > 0 && remaining[0].taskGroupId) {
        navigate(`/group/${remaining[0].taskGroupId}`)
      } else {
        navigate('/')
      }
    } catch (error) {
      setErrorMessage((error as Error).message || 'Unable to delete task group')
    }
  }

  const firstTaskGroupId = taskGroups[0]?.taskGroupId

  const displayName =
    keycloak.tokenParsed?.name ??
    keycloak.tokenParsed?.preferred_username ??
    keycloak.tokenParsed?.email ??
    'User'

  const handleLogout = () => {
    void keycloak.logout({
      redirectUri: window.location.origin,
    })
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>TaskTracker App</h1>
        <div className="auth-actions">
          <span className="auth-user">{displayName}</span>
          <button type="button" className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <h2>Task Groups</h2>
          <form
            className="group-form"
            onSubmit={(event: FormEvent<HTMLFormElement>) => {
              event.preventDefault()
              void handleCreateTaskGroup()
            }}
          >
            <input
              className="group-input"
              type="text"
              placeholder="New task group"
              value={newTaskGroupDescription}
              onChange={(event) => setNewTaskGroupDescription(event.target.value)}
            />
            <button
              className="inline-btn"
              type="button"
              disabled={isCreatingTaskGroup}
              onClick={() => void handleCreateTaskGroup()}
            >
              {isCreatingTaskGroup ? 'Adding...' : 'Add'}
            </button>
          </form>
          <nav>
            <ul>
              {taskGroups.map((group) => (
                <li key={group.taskGroupId} className="group-row">
                  <NavLink
                    to={`/group/${group.taskGroupId}`}
                    className={({ isActive }) => (isActive ? 'group-link active' : 'group-link')}
                  >
                    {group.taskGroupDescription ?? 'Untitled Group'}
                  </NavLink>
                  <div className="row-actions">
                    <button type="button" className="inline-btn" onClick={() => void handleEditTaskGroup(group)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="inline-btn danger-btn"
                      onClick={() => void handleDeleteTaskGroup(group)}
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          {errorMessage ? <p className="error-text">{errorMessage}</p> : null}
          <Routes>
            <Route
              path="/"
              element={firstTaskGroupId ? <Navigate to={`/group/${firstTaskGroupId}`} replace /> : <div />}
            />
            <Route
              path="/group/:groupId"
              element={<TaskGroupPage taskGroups={taskGroups} taskMap={taskMap} onLoadTasks={loadTasks} />}
            />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
