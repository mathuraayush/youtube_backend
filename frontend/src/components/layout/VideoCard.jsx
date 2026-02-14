import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function VideoCard({ video }) {
  return (
    <Card className='overflow-hidden hover:shadow-lg transition-shadow'>
      <Link to={`/video/${video._id}`}>
        <img src={video.thumbnail} alt={video.title} className='h-48 w-full object-cover' />
      </Link>
      <CardContent className='pt-4 space-y-2'>
        <p className='font-medium line-clamp-2'>{video.title}</p>
        <div className='flex items-center justify-between text-sm text-muted-foreground'>
          <span>@{video.owner?.username || 'channel'}</span>
          <span>{video.views || 0} views</span>
        </div>
        <Badge>{Math.round(video.duration || 0)}s</Badge>
      </CardContent>
    </Card>
  )
}
