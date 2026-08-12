import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn, signUp } from '@/services/auth.service'

import { type LoginFormValues, loginSchema } from './auth.schema'

export const AuthForm = () => {
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const isLogin = mode === 'login'

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  async function onSubmit(values: LoginFormValues) {
    setError('')
    try {
      if (isLogin) {
        await signIn(values)
      } else {
        await signUp(values)
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Не удалось выполнить запрос',
      )
    }
  }

  return (
    <form className='flex flex-col gap-4' onSubmit={handleSubmit(onSubmit)}>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          {...register('email')}
          id='email'
          type='email'
          placeholder='you@example.com'
          autoComplete='email'
        />
        {errors.email && (
          <p className='text-sm text-destructive'>{errors.email.message}</p>
        )}
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='password'>Пароль</Label>
        <Input
          {...register('password')}
          id='password'
          type='password'
          placeholder='••••••••'
          autoComplete={isLogin ? 'current-password' : 'new-password'}
        />
        {errors.password && (
          <p className='text-sm text-destructive'>{errors.password.message}</p>
        )}
      </div>

      <Button
        disabled={isSubmitting}
        type='submit'
        size='lg'
        className='w-full'
      >
        {isSubmitting
          ? isLogin
            ? 'Вход...'
            : 'Регистрация...'
          : isLogin
            ? 'Войти'
            : 'Зарегистрироваться'}
      </Button>

      {error && <p className='text-sm text-destructive'>{error}</p>}

      <p className='text-center text-sm text-muted-foreground'>
        {isLogin ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
        <button
          type='button'
          onClick={() => {
            setMode(isLogin ? 'register' : 'login')
            reset()
            setError('')
          }}
          className='font-medium text-foreground underline-offset-4 hover:underline'
        >
          {isLogin ? 'Регистрация' : 'Войти'}
        </button>
      </p>
    </form>
  )
}
