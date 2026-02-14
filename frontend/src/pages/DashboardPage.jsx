import { useSelector } from 'react-redux'
import {
  useChangePasswordMutation,
  useDeleteVideoMutation,
  useGetChannelVideosQuery,
  useGetHistoryQuery,
  useUpdateAccountMutation,
} from '@/app/services'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function DashboardPage() {
  const user = useSelector((state) => state.auth.user)
  const { data: uploads } = useGetChannelVideosQuery({ userId: user?._id, page: 1, limit: 20 }, { skip: !user?._id })
  const { data: history } = useGetHistoryQuery()
  const [updateAccount] = useUpdateAccountMutation()
  const [changePassword] = useChangePasswordMutation()
  const [deleteVideo] = useDeleteVideoMutation()

  const [profile, setProfile] = useState({ fullName: user?.fullName || '', email: user?.email || '' })
  const [pass, setPass] = useState({ oldPassword: '', newPassword: '' })

  return (
    <div className='grid lg:grid-cols-2 gap-5'>
      <Card>
        <CardHeader><CardTitle>Profile Settings</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <Input value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
          <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <Button onClick={() => updateAccount(profile)}>Update account</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Change Password</CardTitle></CardHeader>
        <CardContent className='space-y-3'>
          <Input type='password' placeholder='Old password' value={pass.oldPassword} onChange={(e) => setPass({ ...pass, oldPassword: e.target.value })} />
          <Input type='password' placeholder='New password' value={pass.newPassword} onChange={(e) => setPass({ ...pass, newPassword: e.target.value })} />
          <Button onClick={() => changePassword(pass)}>Change password</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>My uploads</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {uploads?.data?.docs?.map((v) => (
            <div key={v._id} className='flex items-center justify-between rounded-md border p-3'>
              <p className='font-medium line-clamp-1'>{v.title}</p>
              <Button variant='destructive' size='sm' onClick={() => deleteVideo(v._id)}>Delete</Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Watch history</CardTitle></CardHeader>
        <CardContent className='space-y-2'>
          {history?.data?.map((item) => (
            <div key={item._id} className='rounded-md border p-3'>
              <p className='font-medium line-clamp-1'>{item.video?.title}</p>
              <p className='text-xs text-muted-foreground'>@{item.video?.owner?.username}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
