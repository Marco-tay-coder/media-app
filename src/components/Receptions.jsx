import { useState, useEffect } from "react";
import { Download, Trash2, Inbox } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function Receptions() {
  const { user } = useAuth();
  const [receptions, setReceptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("envois")
      .select("*")
      .eq("destinataire_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setReceptions(data ?? []);
        setLoading(false);
      });
  }, [user]);

  const handleSupprimer = async (id) => {
    if (!confirm("Supprimer ce fichier reçu ?")) return;
    await supabase.from("envois").delete().eq("id", id);
    setReceptions((prev) => prev.filter((r) => r.id !== id));
  };

  const handleTelecharger = (url, nom) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = nom;
    a.target = "_blank";
    a.click();
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} Ko`;
    return `${(bytes / 1024 / 1024).toFixed(1)} Mo`;
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );

  if (receptions.length === 0)
    return (
      <div className="card bg-base-100 shadow-md">
        <div className="card-body text-center py-16">
          <p className="text-5xl mb-3">📭</p>
          <p className="text-base-content/60">
            Aucun fichier reçu pour l'instant
          </p>
        </div>
      </div>
    );

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body gap-4">
        <h2 className="card-title text-lg">
          <Inbox size={20} /> Fichiers reçus
          <span className="badge badge-primary">{receptions.length}</span>
        </h2>

        <div className="flex flex-col gap-3">
          {receptions.map((r) => (
            <div
              key={r.id}
              className="flex items-center gap-4 p-3
                         bg-base-200 rounded-xl"
            >
              {/* Aperçu */}
              <div
                className="w-14 h-14 rounded-lg overflow-hidden
                              bg-base-300 flex-shrink-0 flex items-center
                              justify-center"
              >
                {r.media_type?.startsWith("image") ? (
                  <img
                    src={r.media_url}
                    alt={r.media_nom}
                    className="w-full h-full object-cover"
                  />
                ) : r.media_type?.startsWith("video") ? (
                  <span className="text-2xl">🎬</span>
                ) : (
                  <span className="text-2xl">🎵</span>
                )}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{r.media_nom}</p>
                {r.message && (
                  <p className="text-xs text-base-content/60 truncate">
                    💬 {r.message}
                  </p>
                )}
                <div className="flex gap-2 text-xs text-base-content/40 mt-1">
                  <span>{formatSize(r.media_taille)}</span>
                  <span>·</span>
                  <span>{formatDate(r.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => handleTelecharger(r.media_url, r.media_nom)}
                  className="btn btn-sm btn-outline btn-primary"
                  title="Télécharger"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={() => handleSupprimer(r.id)}
                  className="btn btn-sm btn-ghost text-error"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
