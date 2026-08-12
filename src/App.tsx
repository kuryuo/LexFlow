import { useEffect } from 'react'

import { Flashcard } from './components/flashcards/Flashcard'
import { LevelStatsCard } from './components/stats/LevelStatsCard'
import { Button } from './components/ui/button'
import { supabase } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { getSession, signOut } from './services/auth.service'
import { useAuthStore } from './store/auth.store'

function App() {
  const user = useAuthStore((s) => s.user)
  const isLoading = useAuthStore((s) => s.isLoading)
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
          <LevelStatsCard
            stats={{
              level: 'A1',
              newCount: 120,
              learningCount: 40,
              knownCount: 30,
              totalCount: 190,
            }}
          />
          <Flashcard level='A2' front='привет' back='hi' transcription='hai:' />
        </>
      ) : (
        <AuthPage />
      )}
    </>
  )
}

export default App
