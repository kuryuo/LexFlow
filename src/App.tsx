import { useEffect } from 'react'

import { Button } from './components/ui/button'
import { supabase } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { StudyPage } from './pages/StudyPage'
import { getSession, signOut } from './services/auth.service'
import { useAuthStore } from './store/auth.store'

function App() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isAuthLoading)
  const setUser = useAuthStore((s) => s.setUser)
  const setLoading = useAuthStore((s) => s.setLoading)

  useEffect(() => {
    async function init() {
      try {
        const session = await getSession()
        setUser(session?.user ?? null)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    init()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <>
      {isLoading ? (
        <p>Загрузка</p>
      ) : user ? (
        <>
          <div className='flex justify-end p-4'>
            <Button type='button' variant='outline' onClick={() => signOut()}>
              Выйти
            </Button>
          </div>
          <StudyPage />
        </>
      ) : (
        <AuthPage />
      )}
    </>
  )
}

export default App
