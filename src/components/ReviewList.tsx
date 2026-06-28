import { Star } from 'lucide-react'
import { AppReview } from '../types'
import { Card } from './ui/Card'

export function ReviewList({ reviews }: { reviews: AppReview[] }) {
  if (reviews.length === 0) {
    return (
      <Card className="p-5 text-sm text-slate-600">
        Belum ada review aplikasi. Guest maupun user login bisa mengirim review.
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {reviews.map((review) => (
        <Card key={review.id} className="grid gap-3 p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-bold text-ink">{review.reviewerName}</p>
              <p className="text-xs text-slate-500">
                {new Date(review.createdAt).toLocaleString('id-ID')}
              </p>
            </div>
            <div className="flex text-signal">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  size={15}
                  fill={index < review.rating ? 'currentColor' : 'none'}
                />
              ))}
            </div>
          </div>
          <p className="break-words text-sm leading-6 text-slate-700">{review.comment}</p>
        </Card>
      ))}
    </div>
  )
}
