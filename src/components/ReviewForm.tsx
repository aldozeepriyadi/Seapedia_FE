import { FormEvent, useState } from 'react'
import { Star } from 'lucide-react'
import { apiFetch } from '../lib/api'
import { showError, showToast } from '../lib/alerts'
import { AppReview } from '../types'
import { Button } from './ui/Button'
import { Card } from './ui/Card'
import { Input } from './ui/Input'

export function ReviewForm({ onCreated }: { onCreated: (review: AppReview) => void }) {
  const [reviewerName, setReviewerName] = useState('')
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await apiFetch<{ review: AppReview }>('/reviews', {
        method: 'POST',
        body: JSON.stringify({ reviewerName, rating, comment }),
      })
      onCreated(response.review)
      setReviewerName('')
      setRating(5)
      setComment('')
      await showToast('success', 'Review berhasil disimpan.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Review gagal dikirim.'
      setError(message)
      await showError('Review gagal', message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="p-5 shadow-soft">
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <div>
          <h2 className="text-lg font-bold text-ink">Application review</h2>
          <p className="mt-1 text-sm text-slate-600">
            Review ini untuk pengalaman menggunakan SEAPEDIA, bukan produk tertentu.
          </p>
        </div>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Nama
          <Input
            value={reviewerName}
            onChange={(event) => setReviewerName(event.target.value)}
            placeholder="Nama reviewer"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Rating
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                aria-label={`Rating ${value}`}
                className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 bg-white text-signal transition hover:bg-amber-50"
                onClick={() => setRating(value)}
              >
                <Star size={18} fill={value <= rating ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Komentar
          <textarea
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            placeholder="Tulis pengalaman kamu memakai aplikasi ini"
            className="min-h-28 w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-ink outline-none transition placeholder:text-slate-400 focus:border-harbor focus:ring-2 focus:ring-emerald-100"
          />
        </label>
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <Button disabled={submitting}>{submitting ? 'Mengirim...' : 'Kirim review'}</Button>
      </form>
    </Card>
  )
}
