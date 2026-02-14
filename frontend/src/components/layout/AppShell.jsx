import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Moon, Sun, Upload, UserCircle2, LogOut, Home } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { clearCredentials, setTheme } from '@/app/authSlice'
import { useLogoutMutation } from '@/app/services'
import { Button } from '@/components/ui/button'

export default function AppShell() {
  const { user, theme } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [logout] = useLogoutMutation()

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    dispatch(setTheme(next))
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  const onLogout = async () => {
    try { await logout().unwrap() } catch {}
    dispatch(clearCredentials())
    navigate('/login')
  }

  return (
    <div className='min-h-screen'>
      <header className='border-b border-border/70 backdrop-blur sticky top-0 z-50 bg-background/85'>
        <div className='container flex h-16 items-center justify-between'>
          <Link to='/' className='font-semibold text-xl tracking-tight'>Vidora</Link>
          <nav className='flex items-center gap-1'>
            <NavLink to='/'><Button variant='ghost' size='sm'><Home className='h-4 w-4'/>Home</Button></NavLink>
            {user && <NavLink to='/upload'><Button variant='ghost' size='sm'><Upload className='h-4 w-4'/>Upload</Button></NavLink>}
            {user && <NavLink to='/dashboard'><Button variant='ghost' size='sm'><UserCircle2 className='h-4 w-4'/>Dashboard</Button></NavLink>}
            <Button variant='outline' size='icon' onClick={toggleTheme}>{theme === 'dark' ? <Sun className='h-4 w-4'/> : <Moon className='h-4 w-4'/>}</Button>
            {user ? (
              <Button variant='destructive' size='sm' onClick={onLogout}><LogOut className='h-4 w-4'/>Logout</Button>
            ) : (
              <>
                <NavLink to='/login'><Button variant='secondary' size='sm'>Login</Button></NavLink>
                <NavLink to='/register'><Button size='sm'>Register</Button></NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className='container py-8'>
        <Outlet />
      </main>
    </div>
  )
}
