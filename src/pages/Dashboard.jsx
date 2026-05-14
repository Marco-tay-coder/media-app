import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import Navbar from "../components/Navbar";
import UploadZone from "../components/UploadZone";
import MediaGallery from "../components/MediaGallery";
import EnvoiMedia from "../components/EnvoiMedia";
import Receptions from "../components/Receptions";
import { Images, Send, Inbox } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [medias, setMedias] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [onglet, setOnglet] = useState("galerie");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("medias")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .then(({ data }) => {
        setMedias(data ?? []);
        setFetching(false);
      });
  }, [user]);

  const handleUploaded = async ({ key, url, file }) => {
    const { data } = await supabase
      .from("medias")
      .insert({
        user_id: user.id,
        nom: file.name,
        url,
        type: file.type,
        taille: file.size,
      })
      .select()
      .single();
    if (data) setMedias((prev) => [data, ...prev]);
  };

  const handleDeleted = (id) => {
    setMedias((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-base-200">
      <Navbar user={user} />

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="stats stats-horizontal shadow w-full bg-base-100">
          <div className="stat">
            <div className="stat-title">Fichiers envoyés</div>
            <div className="stat-value text-primary">{medias.length}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Taille totale</div>
            <div className="stat-value text-secondary">
              {(
                medias.reduce((a, m) => a + (m.taille || 0), 0) /
                1024 /
                1024
              ).toFixed(1)}{" "}
              Mo
            </div>
          </div>
          <div className="stat">
            <div className="stat-title">Stockage utilisé</div>
            <div className="stat-value text-accent">
              {(
                (medias.reduce((a, m) => a + (m.taille || 0), 0) /
                  1024 /
                  1024 /
                  10240) *
                100
              ).toFixed(2)}
              %
            </div>
            <div className="stat-desc">sur 10 Go (R2)</div>
          </div>
        </div>

        {/* Onglets */}
        <div role="tablist" className="tabs tabs-boxed bg-base-100 shadow">
          <button
            role="tab"
            className={`tab gap-2 ${onglet === "galerie" ? "tab-active" : ""}`}
            onClick={() => setOnglet("galerie")}
          >
            <Images size={16} /> Ma Galerie
          </button>
          <button
            role="tab"
            className={`tab gap-2 ${onglet === "envoyer" ? "tab-active" : ""}`}
            onClick={() => setOnglet("envoyer")}
          >
            <Send size={16} /> Envoyer
          </button>
          <button
            role="tab"
            className={`tab gap-2 ${onglet === "receptions" ? "tab-active" : ""}`}
            onClick={() => setOnglet("receptions")}
          >
            <Inbox size={16} /> Reçus
          </button>
        </div>

        {/* Contenu selon onglet */}
        {onglet === "galerie" && (
          <>
            <div className="card bg-base-100 shadow p-6">
              <h2 className="text-lg font-medium mb-4">Envoyer un fichier</h2>
              <UploadZone onUploaded={handleUploaded} />
            </div>
            <MediaGallery
              medias={medias}
              loading={fetching}
              onDeleted={handleDeleted}
            />
          </>
        )}

        {onglet === "envoyer" && <EnvoiMedia />}

        {onglet === "receptions" && <Receptions />}
      </main>
    </div>
  );
}
