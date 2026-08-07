import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export const AuthForm = () => {
  return (
    <form className='flex flex-col gap-4'>
      <div className='flex flex-col gap-2'>
        <Label htmlFor='email'>Email</Label>
        <Input
          id='email'
          type='email'
          placeholder='you@example.com'
          autoComplete='email'
        />
      </div>

      <div className='flex flex-col gap-2'>
        <Label htmlFor='password'>Пароль</Label>
        <Input
          id='password'
          type='password'
          placeholder='••••••••'
          autoComplete='current-password'
        />
      </div>

      <Button type='submit' size='lg' className='w-full'>
        Войти
      </Button>

      <p className='text-center text-sm text-muted-foreground'>
        Нет аккаунта?{' '}
        <button
          type='button'
          className='font-medium text-foreground underline-offset-4 hover:underline'
        >
          Регистрация
        </button>
      </p>
    </form>
  )
}
