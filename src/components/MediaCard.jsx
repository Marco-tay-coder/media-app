import { useState } from "react";
import { Copy, Check, Trash2 } from "lucide-react";
import { supabase } from "../lib/supabase";

export default function MediaCard({ media, onDeleted }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isImage = media.type?.startsWith("image");
  const isVideo = media.type?.startsWith("video");
  const isAudio = media.type?.startsWith("audio");

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const copyLink = () => {
    navigator.clipboard.writeText(media.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDelete = async () => {
    if (!confirm(`Supprimer "${media.nom}" ?`)) return;
    setDeleting(true);
    await supabase.from("medias").delete().eq("id", media.id);
    onDeleted?.(media.id);
  };

  return (
    <div className="card bg-base-100 shadow hover:shadow-lg transition-shadow group">
      {/* Aperçu */}
      <figure className="h-44 bg-base-200 overflow-hidden relative">
        {isImage && (
          <img
            src={media.url}
            alt={media.nom}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        )}
        {isVideo && (
          <video
            src={media.url}
            className="w-full h-full object-cover"
            muted
            onMouseEnter={(e) => e.target.play()}
            onMouseLeave={(e) => {
              e.target.pause();
              e.target.currentTime = 0;
            }}
          />
        )}
        {isAudio && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
            <span className="text-5xl">🎵</span>
            <audio src={media.url} controls className="w-4/5" />
          </div>
        )}
        {!isImage && !isVideo && !isAudio && (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl">📄</span>
          </div>
        )}

        {/* Badge type */}
        <div className="absolute top-2 left-2">
          <span className="badge badge-neutral badge-sm opacity-80">
            {media.type?.split("/")[1]?.toUpperCase() ?? "Fichier"}
          </span>
        </div>
      </figure>

      {/* Infos */}
      <div className="card-body p-4 gap-2">
        <p className="font-medium text-sm truncate" title={media.nom}>
          {media.nom}
        </p>
        <div className="flex items-center justify-between text-xs text-base-content/50">
          <span>{formatSize(media.taille)}</span>
          <span>{formatDate(media.created_at)}</span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={copyLink}
            className={`btn btn-sm flex-1 ${
              copied ? "btn-success" : "btn-outline btn-primary"
            }`}
          >
            {copied ? (
              <span className="flex items-center gap-1">
                <Check size={14} /> Copié !
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Copy size={14} /> Copier le lien
              </span>
            )}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="btn btn-sm btn-ghost btn-error text-error"
            title="Supprimer"
          >
            {deleting ? (
              <span className="loading loading-spinner loading-xs" />
            ) : (
              <Trash2 size={14} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
