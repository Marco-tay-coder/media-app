import { useState } from 'react'
import { Copy, Check, Trash2 } from 'lucide-react'
import MediaCard from './MediaCard'

const FILTERS = [
  { label: 'Tous', value: 'all' },
  { label: '🖼 Images', value: 'image' },
  { label: '🎬 Vidéos', value: 'video' },
  { label: '🎵 Audio', value: 'audio' },
]

export default function MediaGallery({ medias, loading, onDeleted }) {
  const [filter, setFilter] = useState('all')

  const filtered = medias.filter(m =>
    filter === 'all' ? true : m.type?.startsWith(filter)
  )

  // État chargement
  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  // État vide (aucun fichier du tout)
  if (medias.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-6xl mb-4">📭</p>
        <p className="text-xl font-medium text-base-content/70">
          Aucun fichier pour l'instant
        </p>
        <p className="text-sm text-base-content/40 mt-2">
          Envoie ton premier média ci-dessus !
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filtres */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`btn btn-sm ${
              filter === f.value ? 'btn-primary' : 'btn-ghost'
            }`}
          >
            {f.label}
          </button>
        ))}
        <span className="ml-auto text-sm text-base-content/50 self-center">
          {filtered.length} fichier{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grille ou état vide filtré */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-base-content/40">
          <p className="text-4xl mb-3">🔍</p>
          <p>Aucun fichier dans cette catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(m => (
            <MediaCard
              key={m.id}
              media={m}
              onDeleted={onDeleted}
            />
          ))}
        </div>
      )}
    </div>
  )
}
