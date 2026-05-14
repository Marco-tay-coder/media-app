import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export function useAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Récupérer la session directement
    supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user ?? null)
      setLoading(false)
    })

    // Écouter les changements
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      })

    return () => subscription.unsubscribe()
  }, [])

  return { user, loading }
}