import { useEffect, useState } from 'react'
import './App.css'
import { api, getToken, setToken } from './api'
import AuthForm from './AuthForm'
import Board from './Board'
import type { Status, Task } from './types'

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

  async function handleMove(id: number, status: Status) {
    const previous = tasks
    setTasks(tasks.map((t) => (t.id === id ? { ...t, status } : t)))
    const res = await api(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    if (!res.ok) {
      setTasks(previous)
      setError('Не удалось переместить задачу')
    }
  }

  async function handleDelete(id: number) {
    const previous = tasks
    setTasks(tasks.filter((t) => t.id !== id))
    const res = await api(`/tasks/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      setTasks(previous)
      setError('Не удалось удалить задачу')
    }
  }

  if (!loggedIn) {
    return (
      <div className="app narrow">
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
      <Board tasks={tasks} onMove={handleMove} onDelete={handleDelete} />
    </div>
  )
}

export default App