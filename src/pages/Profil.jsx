import { useState, useEffect } from "react";
import { User, Mail, Save, BarChart2 } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";

export default function Profil() {
  const { user } = useAuth();
  const [nom, setNom] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [stats, setStats] = useState({ total: 0, taille: 0 });

  // Charger le profil
  useEffect(() => {
    if (!user) return;
    Promise.all([
      supabase.from("profils").select("*").eq("id", user.id).single(),
      supabase.from("medias").select("taille").eq("user_id", user.id),
    ]).then(([{ data: profil }, { data: medias }]) => {
      if (profil) {
        setNom(profil.nom ?? "");
        setAvatarUrl(profil.avatar_url ?? "");
      }
      if (medias) {
        setStats({
          total: medias.length,
          taille: medias.reduce((acc, m) => acc + (m.taille || 0), 0),
        });
      }
      setLoading(false);
    });
  }, [user]);

  // Sauvegarder le profil
  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("profils").upsert({
      id: user.id,
      nom,
      avatar_url: avatarUrl,
    });
    if (error) setMessage("Erreur lors de la sauvegarde.");
    else setMessage("Profil mis à jour avec succès !");
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  };

  // Upload avatar
  const handleAvatar = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const data = JSON.parse(xhr.responseText);
      setAvatarUrl(data.url);
    };
    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    );

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar user={user} />
      <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Carte profil */}
        <div className="card bg-base-100 shadow-md">
          <div className="card-body gap-6">
            <h2 className="card-title text-xl">
              <User size={22} /> Mon Profil
            </h2>

            {/* Avatar */}
            <div className="flex items-center gap-6">
              <div className="avatar placeholder">
                <div
                  className="w-20 h-20 rounded-full bg-primary
                                text-primary-content overflow-hidden"
                >
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-bold">
                      {(nom || user?.email)?.[0]?.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-sm text-base-content/60 mb-2">
                  Photo de profil
                </p>
                <input
                  type="file"
                  accept="image/*"
                  className="file-input file-input-bordered file-input-sm w-full"
                  onChange={handleAvatar}
                />
              </div>
            </div>

            {/* Nom */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text flex items-center gap-1">
                  <User size={14} /> Nom d'affichage
                </span>
              </div>
              <input
                type="text"
                placeholder="Ton nom"
                className="input input-bordered w-full"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
              />
            </label>

            {/* Email (non modifiable) */}
            <label className="form-control w-full">
              <div className="label">
                <span className="label-text flex items-center gap-1">
                  <Mail size={14} /> Email
                </span>
              </div>
              <input
                type="email"
                className="input input-bordered w-full opacity-60"
                value={user?.email ?? ""}
                disabled
              />
            </label>

            {/* Message */}
            {message && (
              <div
                className={`alert text-sm py-2 ${
                  message.includes("Erreur") ? "alert-error" : "alert-success"
                }`}
              >
                {message}
              </div>
            )}

            {/* Bouton sauvegarder */}
            <button
              className="btn btn-primary w-full"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <span className="loading loading-spinner" />
              ) : (
                <span className="flex items-center gap-2">
                  <Save size={16} /> Sauvegarder
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="stats stats-horizontal shadow w-full bg-base-100">
          <div className="stat">
            <div className="stat-title">Fichiers envoyés</div>
            <div className="stat-value text-primary">{stats.total}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Taille totale</div>
            <div className="stat-value text-secondary">
              {(stats.taille / 1024 / 1024).toFixed(1)} Mo
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Stockage utilisé</div>
            <div className="stat-value text-accent">
              {((stats.taille / 1024 / 1024 / 10240) * 100).toFixed(2)}%
            </div>
            <div className="stat-desc">sur 10 Go gratuits</div>
          </div>
        </div>
      </main>
    </div>
  );
}
