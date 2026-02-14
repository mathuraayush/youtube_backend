import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUploadVideoMutation } from '@/app/services'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function UploadPage() {
  const [upload, { isLoading, error }] = useUploadVideoMutation()
  const [form, setForm] = useState({ title: '', description: '', tags: '', visibility: 'public' })
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const navigate = useNavigate()

  const onSubmit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    Object.entries(form).forEach(([k, v]) => fd.append(k, v))
    fd.append('videoFile', videoFile)
    fd.append('thumbnail', thumbnail)
    const res = await upload(fd).unwrap()
    navigate(`/video/${res.data._id}`)
  }

  return (
    <Card className='max-w-3xl mx-auto'>
      <CardHeader><CardTitle>Upload video</CardTitle></CardHeader>
      <CardContent>
        <form className='space-y-4' onSubmit={onSubmit}>
          <Input placeholder='Title' value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <Textarea placeholder='Description' value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <Input placeholder='Tags (comma separated)' value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          <select className='h-10 rounded-md border border-input bg-background px-3 text-sm' value={form.visibility} onChange={(e) => setForm({ ...form, visibility: e.target.value })}>
            <option value='public'>Public</option>
            <option value='private'>Private</option>
          </select>
          <div><p className='text-sm mb-2'>Video file</p><Input type='file' accept='video/*' onChange={(e) => setVideoFile(e.target.files?.[0])} required /></div>
          <div><p className='text-sm mb-2'>Thumbnail</p><Input type='file' accept='image/*' onChange={(e) => setThumbnail(e.target.files?.[0])} required /></div>
          {error && <p className='text-sm text-destructive'>Upload failed. Please retry.</p>}
          <Button disabled={isLoading}>{isLoading ? 'Uploading...' : 'Publish Video'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}
