import { useEffect, useState } from 'react'
import './App.css'

const API_URL = 'http://localhost:8081/api/tasks'

type Task = {
  id: number
  title: string
  description: string | null
  status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  createdAt: string
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [title, setTitle] = useState('')
  const [error, setError] = useState('')

  async function loadTasks() {
    const res = await fetch(API_URL)
    setTasks(await res.json())
  }

  useEffect(() => {
    loadTasks().catch(() => setError('Не удалось загрузить задачи'))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    })
    if (!res.ok) {
      setError('Название задачи не может быть пустым')
      return
    }
    setTitle('')
    await loadTasks()
  }

  return (
    <div className="app">
      <h1>Task Tracker</h1>
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