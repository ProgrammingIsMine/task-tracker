import { useState } from 'react'
import { api, setToken } from './api'

type Props = { onAuth: () => void }

export default function AuthForm({ onAuth }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(mode: 'login' | 'register') {
    setError('')
    const res = await api(`/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      if (mode === 'login') setError('Неверный email или пароль')
      else if (res.status === 409) setError('Этот email уже зарегистрирован')
      else setError('Проверьте email и пароль (минимум 6 символов)')
      return
    }
    const data = await res.json()
    setToken(data.token)
    onAuth()
  }

  return (
    <form
      className="form auth"
      onSubmit={(e) => {
        e.preventDefault()
        submit('login')
      }}
    >
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Пароль"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit">Войти</button>
      <button type="button" className="secondary" onClick={() => submit('register')}>
        Зарегистрироваться
      </button>
    </form>
  )
}