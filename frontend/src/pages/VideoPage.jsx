import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useGetVideoByIdQuery, useIncrementViewsMutation } from '@/app/services'
import { Card, CardContent } from '@/components/ui/card'

export default function VideoPage() {
  const { id } = useParams()
  const { data, isLoading } = useGetVideoByIdQuery(id)
  const [increment] = useIncrementViewsMutation()
  const video = data?.data

  useEffect(() => { if (id) increment(id) }, [id, increment])

  if (isLoading || !video) return <p>Loading video...</p>

  return (
    <div className='space-y-6'>
      <video src={video.videoFile} controls className='w-full max-h-[70vh] rounded-xl bg-black' />
      <Card>
        <CardContent className='pt-6'>
          <h1 className='text-2xl font-semibold'>{video.title}</h1>
          <p className='text-muted-foreground mt-1'>{video.views || 0} views • @{video.owner?.username}</p>
          <p className='mt-4 whitespace-pre-wrap'>{video.description}</p>
        </CardContent>
      </Card>
    </div>
  )
}
