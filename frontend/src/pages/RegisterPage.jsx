import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useRegisterMutation } from '@/app/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const navigate = useNavigate()
  const [register, { isLoading, error }] = useRegisterMutation()
  const [form, setForm] = useState({ fullName: '', username: '', email: '', password: '' })
  const [avatar, setAvatar] = useState(null)
  const [coverImage, setCoverImage] = useState(null)

  const onSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    if (avatar) fd.append('avatar', avatar)
    if (coverImage) fd.append('coverImage', coverImage)
    await register(fd).unwrap()
    navigate('/login')
  }

  return (
    <Card className='max-w-2xl mx-auto'>
      <CardHeader><CardTitle>Create your Vidora account</CardTitle></CardHeader>
      <CardContent>
        <form className='grid sm:grid-cols-2 gap-4' onSubmit={onSubmit}>
          <Input placeholder='Full name' value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
          <Input placeholder='Username' value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required />
          <Input type='email' placeholder='Email' value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <Input type='password' placeholder='Password' value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          <div><p className='text-sm mb-2'>Avatar *</p><Input type='file' accept='image/*' onChange={(e) => setAvatar(e.target.files?.[0])} required/></div>
          <div><p className='text-sm mb-2'>Cover Image</p><Input type='file' accept='image/*' onChange={(e) => setCoverImage(e.target.files?.[0])}/></div>
          {error && <p className='col-span-2 text-sm text-destructive'>Registration failed. Verify fields/files.</p>}
          <Button className='col-span-2' disabled={isLoading}>{isLoading ? 'Creating account...' : 'Create Account'}</Button>
          <p className='col-span-2 text-sm text-muted-foreground'>Have an account? <Link className='text-primary' to='/login'>Sign in</Link></p>
        </form>
      </CardContent>
    </Card>
  )
}
