import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { Sun, Moon, Home, User, LogOut, FolderOpen } from 'lucide-react'

export default function Navbar({ user }) {
  const [dark, setDark] = useState(
    () => {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia('(prefers-color-scheme: dark)').matches
    }
  )
  const navigate = useNavigate()

  const toggleTheme = () => {
    const next = dark ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    setDark(!dark)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  return (
    <div className="navbar bg-base-100 shadow-sm px-4 sticky top-0 z-50">
      {/* Logo */}
      <div className="flex-1">
        <Link to="/" className="flex items-center gap-2
                                text-xl font-bold text-primary">
          <FolderOpen size={24} />
          MediaShare
        </Link>
      </div>

      {/* Actions */}
      <div className="flex-none flex items-center gap-3">

        {/* Toggle dark / light */}
        <button
          onClick={toggleTheme}
          className="btn btn-ghost btn-circle"
          title="Changer le thème"
        >
          {dark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Menu utilisateur */}
        {user && (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button"
              className="avatar placeholder cursor-pointer">
              <div className="bg-primary text-primary-content
                              rounded-full w-9 overflow-hidden">
                {user.avatarUrl ? (
                  <img src={user.avatarUrl} alt="avatar"
                    className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-bold">
                    {user.email?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            </div>
            <ul tabIndex={0}
              className="dropdown-content menu bg-base-100
                         rounded-box shadow-lg z-50 w-52 p-2 mt-2">
              <li className="menu-title text-xs truncate px-2 py-1">
                {user.email}
              </li>
              <li>
                <Link to="/">
                  <Home size={16} /> Dashboard
                </Link>
              </li>
              <li>
                <Link to="/profil">
                  <User size={16} /> Mon Profil
                </Link>
              </li>
              <li>
                <button onClick={handleLogout} className="text-error">
                  <LogOut size={16} /> Déconnexion
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}