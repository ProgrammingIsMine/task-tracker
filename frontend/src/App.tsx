import { useEffect, useState } from 'react'
import './App.css'
import { api, getToken, setToken } from './api'
import AuthForm from './AuthForm'

type Task = {
  id: number
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!getToken())
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  function logout() {
    setToken(null)
    setTasks([])
    setLoggedIn(false)
  }

  async function loadTasks() {
    const res = await api('/tasks')
    if (res.status === 401) {
      logout()
      return
    }
    setTasks(await res.json())
  }

  useEffect(() => {
    if (loggedIn) {
      loadTasks().catch(() => setError('Не удалось загрузить задачи'))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loggedIn])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await api('/tasks', {
      method: 'POST',
      body: JSON.stringify({ title }),
    })
    if (res.status === 401) {
      logout()
      return
    }
    if (!res.ok) {
      setError('Название задачи не может быть пустым')
      return
    }
    setTitle('')
    await loadTasks()
  }

  if (!loggedIn) {
    return (
      <div className="app">
        <h1>Task Tracker</h1>
        <AuthForm onAuth={() => setLoggedIn(true)} />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="header">
        <h1>Task Tracker</h1>
        <button className="link" onClick={logout}>
          Выйти
        </button>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Новая задача"
        />
        <button type="submit">Добавить</button>
      </form>
      {error && <p className="error">{error}</p>}
      <ul className="list">
        {tasks.map((t) => (
          <li key={t.id} className="task">
            <span>{t.title}</span>
            <span className="status">{t.status}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default App