import { AuthForm } from '@/components/auth/AuthForm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

export const AuthPage = () => {
  return (
    <div className='flex min-h-svh items-center justify-center p-4'>
      <Card className='w-full max-w-sm'>
        <CardHeader className='text-center'>
          <CardTitle className='text-2xl font-semibold'>LexFlow</CardTitle>
          <CardDescription>Войдите, чтобы продолжить обучение</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
    </div>
  )
}
