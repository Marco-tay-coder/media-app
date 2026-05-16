import { useState, useCallback } from "react";
import { UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";

const BACKEND = "https://media-backend-bevn.onrender.com"

const ACCEPTED_TYPES = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "image/gif": [],
  "video/mp4": [],
  "video/webm": [],
  "audio/mpeg": [],
  "audio/wav": [],
};

const MAX_SIZE = 50 * 1024 * 1024; // 50 Mo

export default function UploadZone({ onUploaded }) {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = useCallback(
    (file) => {
      setError("");
      setUploading(true);
      setProgress(0);

      const formData = new FormData();
      formData.append("file", file);

      const xhr = new XMLHttpRequest();

      // Suivi de la progression
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      // Upload terminé
      xhr.addEventListener("load", () => {
        setUploading(false);
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          onUploaded({ key: data.key, url: data.url, file });
        } else {
          setError("Erreur lors de l'upload. Réessaie.");
        }
      });

      // Erreur réseau
      xhr.addEventListener("error", () => {
        setUploading(false);
        setError("Erreur réseau. Vérifie ta connexion.");
      });

      xhr.open("POST", `${BACKEND}/api/upload`);
      xhr.send(formData);
    },
    [onUploaded],
  );

  const onDrop = useCallback(
    (accepted, rejected) => {
      if (rejected.length > 0) {
        const reason = rejected[0].errors[0]?.code;
        if (reason === "file-too-large")
          setError("Fichier trop lourd (max 50 Mo).");
        else if (reason === "file-invalid-type")
          setError("Type de fichier non accepté.");
        else setError("Fichier refusé.");
        return;
      }
      if (accepted.length > 0) uploadFile(accepted[0]);
    },
    [uploadFile],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: uploading,
  });


  return (
    <div className="space-y-3">
      {/* Zone de dépôt */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-xl p-10
          text-center cursor-pointer select-none
          transition-all duration-200
          ${uploading ? "opacity-50 cursor-not-allowed" : ""}
          ${
            isDragActive
              ? "border-primary bg-primary/10 scale-[1.01]"
              : "border-base-300 hover:border-primary hover:bg-base-200"
          }
        `}
      >
        <input {...getInputProps()} />
        <div className="flex justify-center mb-3">
          <UploadCloud
            size={48}
            className={isDragActive ? "text-primary" : "text-base-content/40"}
          />
        </div>
        <p className="font-medium text-base-content">
          {isDragActive
            ? "Dépose le fichier ici !"
            : "Glisse un fichier ou clique pour choisir"}
        </p>
        <p className="text-xs text-base-content/50 mt-2">
          Images (JPG, PNG, WebP, GIF) · Vidéos (MP4, WebM) · Audio (MP3, WAV) ·
          max 50 Mo
        </p>
      </div>

      {/* Barre de progression */}
      {uploading && (
        <div className="space-y-1">
          <progress
            className="progress progress-primary w-full"
            value={progress}
            max="100"
          />
          <div className="flex justify-between text-xs text-base-content/60">
            <span>Envoi en cours...</span>
            <span>{progress}%</span>
          </div>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div role="alert" className="alert alert-error text-sm py-2">
          <span>{error}</span>
          <button
            className="btn btn-ghost btn-xs ml-auto"
            onClick={() => setError("")}
          >
            <X size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
