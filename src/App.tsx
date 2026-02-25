import { Navigate, NavLink, Route, Routes, useParams } from 'react-router-dom'
import './App.css'

type Task = {
  id: string
  title: string
  status: 'Todo' | 'In Progress' | 'Done'
}

type TaskGroup = {
  id: string
  name: string
  tasks: Task[]
}

const taskGroups: TaskGroup[] = [
  {
    id: 'personal',
    name: 'Personal',
    tasks: [
      { id: 'p-1', title: 'Go for evening run', status: 'Todo' },
      { id: 'p-2', title: 'Read 20 pages', status: 'In Progress' },
      { id: 'p-3', title: 'Call parents', status: 'Done' },
    ],
  },
  {
    id: 'work',
    name: 'Work',
    tasks: [
      { id: 'w-1', title: 'Prepare sprint board', status: 'In Progress' },
      { id: 'w-2', title: 'Review pull requests', status: 'Todo' },
      { id: 'w-3', title: 'Update deployment notes', status: 'Done' },
    ],
  },
  {
    id: 'study',
    name: 'Study',
    tasks: [
      { id: 's-1', title: 'Practice React hooks', status: 'Todo' },
      { id: 's-2', title: 'Implement form validation', status: 'Todo' },
      { id: 's-3', title: 'Read TypeScript utility types', status: 'In Progress' },
    ],
  },
]

function TaskGroupPage() {
  const { groupId } = useParams<{ groupId: string }>()
  const selectedGroup = taskGroups.find((group) => group.id === groupId)

  if (!selectedGroup) {
    return <Navigate to={`/group/${taskGroups[0].id}`} replace />
  }

  return (
    <section className="task-group-view">
      <h2>{selectedGroup.name} Tasks</h2>
      <ul className="task-list">
        {selectedGroup.tasks.map((task) => (
          <li key={task.id} className="task-item">
            <span>{task.title}</span>
            <span className={`task-status status-${task.status.toLowerCase().replace(' ', '-')}`}>
              {task.status}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>TaskTracker App</h1>
      </header>

      <div className="app-layout">
        <aside className="sidebar">
          <h2>Task Groups</h2>
          <nav>
            <ul>
              {taskGroups.map((group) => (
                <li key={group.id}>
                  <NavLink
                    to={`/group/${group.id}`}
                    className={({ isActive }) => (isActive ? 'group-link active' : 'group-link')}
                  >
                    {group.name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to={`/group/${taskGroups[0].id}`} replace />} />
            <Route path="/group/:groupId" element={<TaskGroupPage />} />
          </Routes>
        </main>
      </div>
    </div>
  )
}

export default App
