import { supabase } from '@/lib/supabase'

interface SignInParams {
  email: string
  password: string
}

export async function signIn({ email, password }: SignInParams) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(`Не удалось войти: ${error.message}`)
  }

  return data
}

export async function signUp({ email, password }: SignInParams) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) {
    throw new Error(`Не удалось зарегистрироваться: ${error.message}`)
  }

  return data
}
