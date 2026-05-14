import { useState } from "react";
import { Send, Search, CheckCircle } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";

export default function EnvoiMedia() {
  const { user } = useAuth();
  const [recherche, setRecherche] = useState("");
  const [resultats, setResultats] = useState([]);
  const [destinataire, setDestinataire] = useState(null);
  const [message, setMessage] = useState("");
  const [fichier, setFichier] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [succes, setSucces] = useState("");
  const [erreur, setErreur] = useState("");

  // Rechercher un utilisateur par nom ou email
  const handleRecherche = async (val) => {
    setRecherche(val);
    setDestinataire(null);
    if (val.length < 2) {
      setResultats([]);
      return;
    }

    const { data } = await supabase
      .from("profils")
      .select("id, nom, avatar_url")
      .or(`nom.ilike.%${val}%`)
      .neq("id", user.id)
      .limit(5);

    // Chercher aussi par email dans auth.users via RPC
    const { data: parEmail } = await supabase.rpc("chercher_utilisateur", {
      recherche: val,
    });

    const tous = [...(data ?? []), ...(parEmail ?? [])].filter(
      (v, i, a) => a.findIndex((t) => t.id === v.id) === i,
    );

    setResultats(tous);
  };

  // Sélectionner un destinataire
  const selectionner = (u) => {
    setDestinataire(u);
    setRecherche(u.nom || u.email || u.id);
    setResultats([]);
  };

  // Envoyer le média
  const handleEnvoi = async () => {
    if (!destinataire || !fichier) {
      setErreur("Choisis un destinataire et un fichier.");
      return;
    }
    setErreur("");
    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", fichier);

    const xhr = new XMLHttpRequest();
    xhr.upload.onprogress = (e) =>
      setProgress(Math.round((e.loaded / e.total) * 100));

    xhr.onload = async () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);

        // Enregistrer l'envoi dans Supabase
        const { error } = await supabase.from("envois").insert({
          expediteur_id: user.id,
          destinataire_id: destinataire.id,
          media_url: data.url,
          media_nom: fichier.name,
          media_type: fichier.type,
          media_taille: fichier.size,
          message,
        });

        if (error) setErreur("Erreur lors de l'envoi.");
        else {
          setSucces(
            `Fichier envoyé à ${destinataire.nom || destinataire.id} !`,
          );
          setFichier(null);
          setMessage("");
          setDestinataire(null);
          setRecherche("");
          setTimeout(() => setSucces(""), 3000);
        }
      } else {
        setErreur("Erreur upload.");
      }
      setUploading(false);
    };

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  };

  return (
    <div className="card bg-base-100 shadow-md">
      <div className="card-body gap-4">
        <h2 className="card-title text-lg">
          <Send size={20} /> Envoyer un média
        </h2>

        {/* Recherche utilisateur */}
        <div className="relative">
          <label className="form-control w-full">
            <div className="label">
              <span className="label-text">Destinataire</span>
            </div>
            <input
              type="text"
              placeholder="Rechercher par nom..."
              className="input input-bordered w-full"
              value={recherche}
              onChange={(e) => handleRecherche(e.target.value)}
            />
          </label>

          {/* Résultats de recherche */}
          {resultats.length > 0 && (
            <ul
              className="absolute z-50 w-full bg-base-100 shadow-lg
                           rounded-box border border-base-300 mt-1"
            >
              {resultats.map((u) => (
                <li key={u.id}>
                  <button
                    className="w-full flex items-center gap-3 p-3
                               hover:bg-base-200 text-left"
                    onClick={() => selectionner(u)}
                  >
                    <div className="avatar placeholder">
                      <div
                        className="bg-primary text-primary-content
                                      rounded-full w-8"
                      >
                        {u.avatar_url ? (
                          <img src={u.avatar_url} alt="" />
                        ) : (
                          <span className="text-xs">
                            {(u.nom || "?")[0].toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {u.nom || "Sans nom"}
                      </p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Destinataire sélectionné */}
        {destinataire && (
          <div className="alert alert-info py-2 text-sm">
            <CheckCircle size={16} /> Envoi à : <b>{destinataire.nom || destinataire.id}</b>
          </div>
        )}

        {/* Choisir un fichier */}
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Fichier à envoyer</span>
          </div>
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            className="file-input file-input-bordered w-full"
            onChange={(e) => setFichier(e.target.files[0])}
          />
        </label>

        {/* Message optionnel */}
        <label className="form-control w-full">
          <div className="label">
            <span className="label-text">Message (optionnel)</span>
          </div>
          <textarea
            placeholder="Ajoute un message..."
            className="textarea textarea-bordered w-full"
            rows={2}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </label>

        {/* Progression */}
        {uploading && (
          <div>
            <progress
              className="progress progress-primary w-full"
              value={progress}
              max="100"
            />
            <p className="text-xs text-center mt-1">{progress}%</p>
          </div>
        )}

        {/* Alertes */}
        {erreur && (
          <div className="alert alert-error text-sm py-2">{erreur}</div>
        )}
        {succes && (
          <div className="alert alert-success text-sm py-2">{succes}</div>
        )}

        {/* Bouton envoyer */}
        <button
          className="btn btn-primary w-full"
          onClick={handleEnvoi}
          disabled={uploading || !destinataire || !fichier}
        >
          {uploading ? (
            <span className="loading loading-spinner" />
          ) : (
            <span className="flex items-center gap-2">
              <Send size={16} /> Envoyer
            </span>
          )}
        </button>
      </div>
    </div>
  );
}
