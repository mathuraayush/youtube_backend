import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { setCredentials } from '@/app/authSlice'
import { useLoginMutation } from '@/app/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [login, { isLoading, error }] = useLoginMutation()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const res = await login(form).unwrap()
    dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }))
    navigate('/')
  }

  return (
    <Card className='max-w-md mx-auto'>
      <CardHeader><CardTitle>Welcome back</CardTitle></CardHeader>
      <CardContent>
        <form className='space-y-4' onSubmit={onSubmit}>
          <Input placeholder='Username or Email' value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input type='password' placeholder='Password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          {error && <p className='text-sm text-destructive'>Login failed.</p>}
          <Button className='w-full' disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign In'}</Button>
          <p className='text-sm text-muted-foreground'>No account? <Link className='text-primary' to='/register'>Create one</Link></p>
        </form>
      </CardContent>
    </Card>
  )
}
