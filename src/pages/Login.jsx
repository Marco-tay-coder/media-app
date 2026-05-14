import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    setLoading(true)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else navigate('/')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Vérifie ta boîte mail pour confirmer ton compte.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-base-200 flex items-center justify-center p-4">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-4">
          {/* Logo */}
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold text-primary">MediaShare</h1>
            <p className="text-base-content/50 text-sm mt-1">
              Partagez vos médias facilement
            </p>
          </div>

          {/* Tabs login / signup */}
          <div role="tablist" className="tabs tabs-boxed">
            <button
              role="tab"
              className={`tab ${mode === 'login' ? 'tab-active' : ''}`}
              onClick={() => { setMode('login'); setError(''); setMessage('') }}
            >
              Connexion
            </button>
            <button
              role="tab"
              className={`tab ${mode === 'signup' ? 'tab-active' : ''}`}
              onClick={() => { setMode('signup'); setError(''); setMessage('') }}
            >
              Inscription
            </button>
          </div>

          {/* Alertes */}
          {error && (
            <div role="alert" className="alert alert-error text-sm py-2">
              <span>{error}</span>
            </div>
          )}
          {message && (
            <div role="alert" className="alert alert-success text-sm py-2">
              <span>{message}</span>
            </div>
          )}

          {/* Formulaire */}
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Email</span>
            </div>
            <input
              type="email"
              placeholder="toi@exemple.com"
              className="input input-bordered w-full"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </label>

          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Mot de passe</span>
            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="input input-bordered w-full"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </label>

          <button
            className="btn btn-primary w-full mt-2"
            onClick={handleSubmit}
            disabled={loading || !email || !password}
          >
            {loading ? (
              <span className="loading loading-spinner" />
            ) : (
              mode === 'login' ? 'Se connecter' : "S'inscrire"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
