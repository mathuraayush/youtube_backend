import { useMemo } from 'react'
import { useGetVideosQuery } from '@/app/services'
import VideoCard from '@/components/layout/VideoCard'

export default function HomePage() {
  const { data, isLoading, isError } = useGetVideosQuery({ page: 1, limit: 18 })
  const videos = useMemo(() => data?.data?.docs || [], [data])

  if (isLoading) return <p>Loading videos...</p>
  if (isError) return <p>Unable to load videos currently.</p>

  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-3xl font-bold'>Discover videos</h1>
        <p className='text-muted-foreground mt-2'>Fresh uploads from the Vidora community.</p>
      </div>
      <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
        {videos.map((video) => <VideoCard key={video._id} video={video} />)}
      </div>
    </div>
  )
}
