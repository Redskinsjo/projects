"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { Arrow, Field } from "./ui";
import type { UserData } from "@/lib/models";
export function Dashboard({ initial }: { initial: UserData }) {
  const [profile, setProfile] = useState(initial.profile);
  const [cv, setCv] = useState(initial.cv);
  const [filter, setFilter] = useState("Toutes");
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [cvMessage, setCvMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const applications = initial.applications.filter(
    (a) =>
      (filter === "Toutes" ||
        (filter === "En cours"
          ? ["En cours", "Entretien"].includes(a.status)
          : a.status === filter)) &&
      `${a.company} ${a.role}`.toLowerCase().includes(search.toLowerCase()),
  );
  const completed = [profile.name, profile.role, profile.location, cv].filter(
    Boolean,
  ).length;
  async function save(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (!response.ok) throw new Error();
      setMessage("Votre profil a bien été enregistré.");
    } catch {
      setMessage(
        "Impossible d’enregistrer. Vérifiez les champs et votre connexion, puis réessayez.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function upload(file?: File) {
    if (!file) return;
    setCvMessage("");
    if (
      file.size > 5 * 1024 * 1024 ||
      !file.name.toLowerCase().endsWith(".pdf")
    ) {
      setCvMessage("Choisissez un document PDF de 5 Mo maximum.");
      return;
    }
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const response = await fetch("/api/cv", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setCv(result);
      setPreview(false);
      setCvMessage("Votre CV a été ajouté.");
    } catch (error) {
      setCvMessage(
        error instanceof Error ? error.message : "L’ajout du CV a échoué.",
      );
    } finally {
      setUploading(false);
      if (input.current) input.current.value = "";
    }
  }
  async function removeCv() {
    setUploading(true);
    try {
      const response = await fetch("/api/cv", { method: "DELETE" });
      if (!response.ok) throw new Error();
      setCv(undefined);
      setPreview(false);
      setCvMessage("CV supprimé.");
    } catch {
      setCvMessage("Impossible de supprimer le CV. Réessayez.");
    } finally {
      setUploading(false);
    }
  }
  return (
    <main className="container dashboard">
      <div className="page-heading">
        <div>
          <span className="eyebrow">VOTRE PROCHAIN CHAPITRE</span>
          <h1>
            Bonjour{profile.name ? `, ${profile.name.split(" ")[0]}` : ""}
            <span className="greeting-dot">.</span>
          </h1>
          <p>Vos envies, votre profil, vos opportunités. Tout commence ici.</p>
        </div>
        <Link className="button" href="/espace/recherches/nouvelle">
          <span>＋</span> Nouvelle recherche
        </Link>
      </div>
      <div className="stats">
        <article>
          <span>
            Candidatures envoyées <Arrow />
          </span>
          <strong>
            {initial.applications
              .filter((a) => a.status !== "En cours")
              .length.toString()
              .padStart(2, "0")}
          </strong>
          <small>Votre recherche prend forme</small>
        </article>
        <article>
          <span>
            En cours <span>◷</span>
          </span>
          <strong>
            {initial.applications
              .filter((a) => ["En cours", "Entretien"].includes(a.status))
              .length.toString()
              .padStart(2, "0")}
          </strong>
          <small>Les prochaines étapes à suivre</small>
        </article>
        <article>
          <span>
            Recherches préparées <span>✧</span>
          </span>
          <strong>
            {initial.campaigns.length.toString().padStart(2, "0")}
          </strong>
          <small>Prêtes pour la suite</small>
        </article>
        <article className="profile-stat">
          <span>
            Un profil qui vous ressemble <span>◎</span>
          </span>
          <strong>
            {completed * 25}
            <em>%</em>
          </strong>
          <div className="progress-track">
            <span style={{ width: `${completed * 25}%` }} />
          </div>
          <small>
            {completed === 4
              ? "Les essentiels sont renseignés"
              : "Complétez vos essentiels ci-dessous"}
          </small>
        </article>
      </div>
      <div className="workspace-grid">
        <section className="panel profile-panel">
          <div className="panel-title">
            <h2>Mon profil</h2>
            <span className="subtle-icon">◎</span>
          </div>
          <p className="panel-description">
            Faisons ressortir ce qui vous rend unique.
          </p>
          <form onSubmit={save}>
            <h3 className="form-section-title">
              01 <span>Les présentations</span>
            </h3>
            <div className="form-grid">
              <Field label="Nom complet">
                <input
                  required
                  autoComplete="name"
                  value={profile.name}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  maxLength={120}
                  placeholder="Camille Martin"
                />
              </Field>
              <Field label="Adresse e-mail">
                <input
                  type="email"
                  autoComplete="email"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  placeholder="camille@exemple.fr"
                />
              </Field>
              <Field label="Téléphone" wide>
                <input
                  type="tel"
                  autoComplete="tel"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  maxLength={40}
                  placeholder="06 12 34 56 78"
                />
              </Field>
            </div>
            <h3 className="form-section-title">
              02 <span>Votre prochain poste</span>
            </h3>
            <div className="form-grid">
              <Field label="Poste recherché" wide>
                <input
                  value={profile.role}
                  onChange={(e) =>
                    setProfile({ ...profile, role: e.target.value })
                  }
                  maxLength={150}
                  placeholder="Ex. Product designer"
                />
              </Field>
              <Field label="Lieu de recherche" wide>
                <input
                  value={profile.location}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  maxLength={150}
                  placeholder="Ex. Paris, Lyon, France…"
                />
              </Field>
              <Field label="Salaire brut annuel (€)">
                <input
                  type="number"
                  min={0}
                  max={1000000}
                  value={profile.salary}
                  onChange={(e) =>
                    setProfile({ ...profile, salary: Number(e.target.value) })
                  }
                />
              </Field>
              <Field label="Expérience (années)">
                <input
                  type="number"
                  min={0}
                  max={70}
                  step={0.5}
                  value={profile.experience}
                  onChange={(e) =>
                    setProfile({
                      ...profile,
                      experience: Number(e.target.value),
                    })
                  }
                />
              </Field>
              <Field label="Quelques mots sur vous" wide>
                <textarea
                  rows={3}
                  maxLength={3000}
                  value={profile.about}
                  onChange={(e) =>
                    setProfile({ ...profile, about: e.target.value })
                  }
                  placeholder="Vos points forts, vos envies, ce qui vous motive…"
                />
              </Field>
            </div>
            <button className="button full-width" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer mon profil"}{" "}
              <Arrow>✓</Arrow>
            </button>
            <p className="feedback" role="status">
              {message}
            </p>
          </form>
        </section>
        <div className="workspace-right">
          <section className="panel cv-panel">
            <div className="panel-title">
              <h2>Mon CV</h2>
              <span className="subtle-icon">▤</span>
            </div>
            <p className="panel-description">
              Toute votre expérience, au bon endroit.
            </p>
            <input
              ref={input}
              type="file"
              accept="application/pdf,.pdf"
              className="sr-only"
              aria-label="Importer mon CV PDF"
              onChange={(e) => upload(e.target.files?.[0])}
            />
            {cv ? (
              <div className="cv-file">
                <span className="pdf-icon">PDF</span>
                <div>
                  <strong>{cv.name}</strong>
                  <small>
                    {Math.ceil(cv.size / 1024)} Ko · Ajouté le{" "}
                    {new Date(cv.uploadedAt).toLocaleDateString("fr-FR")}
                  </small>
                </div>
                <button
                  className="text-button"
                  disabled={uploading}
                  onClick={() => setPreview(!preview)}
                >
                  {preview ? "Fermer" : "Visualiser"} ↗
                </button>
              </div>
            ) : (
              <button
                className="upload-zone"
                disabled={uploading}
                onClick={() => input.current?.click()}
              >
                <span>↑</span>
                <strong>
                  {uploading ? "Importation…" : "Ajoutez votre CV"}
                </strong>
                <small>Cliquez pour choisir un fichier · PDF, 5 Mo max.</small>
              </button>
            )}
            {cv && (
              <div className="cv-actions">
                <button
                  className="text-button"
                  disabled={uploading}
                  onClick={() => input.current?.click()}
                >
                  Remplacer le CV
                </button>
                <button
                  className="text-button muted"
                  disabled={uploading}
                  onClick={removeCv}
                >
                  Supprimer
                </button>
              </div>
            )}
            {preview && (
              <div className="pdf-preview">
                <iframe
                  title="Aperçu de votre CV"
                  src={`/api/cv?v=${encodeURIComponent(cv?.uploadedAt || "")}`}
                />
                <a
                  className="text-button"
                  href="/api/cv"
                  target="_blank"
                  rel="noreferrer"
                >
                  Ouvrir le PDF dans un nouvel onglet ↗
                </a>
              </div>
            )}
            <p role="status" className="feedback">
              {cvMessage}
            </p>
          </section>
          <section className="panel applications-panel">
            <div className="panel-title">
              <h2>
                Mes candidatures{" "}
                <span className="count-pill">
                  {initial.applications.length}
                </span>
              </h2>
            </div>
            <p className="panel-description">
              Une vue d’ensemble pour ne rien perdre de vue.
            </p>
            <div className="table-toolbar">
              <div
                className="tabs"
                role="group"
                aria-label="Filtrer les candidatures"
              >
                {["Toutes", "En cours", "Envoyée"].map((f) => (
                  <button
                    aria-pressed={filter === f}
                    className={filter === f ? "selected" : ""}
                    onClick={() => setFilter(f)}
                    key={f}
                  >
                    {f === "Envoyée" ? "Envoyées" : f}
                  </button>
                ))}
              </div>
              <input
                type="search"
                aria-label="Rechercher une candidature"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {applications.length ? (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Poste / entreprise</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((a) => (
                      <tr key={a.id}>
                        <td>
                          <strong>{a.role}</strong>
                          <small>
                            {a.company} · {a.location}
                          </small>
                        </td>
                        <td>{new Date(a.date).toLocaleDateString("fr-FR")}</td>
                        <td>
                          <span className="badge">{a.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">↗</span>
                <h3>
                  {search || filter !== "Toutes"
                    ? "Aucun résultat pour le moment"
                    : "Votre prochain chapitre est à écrire"}
                </h3>
                <p>
                  {search || filter !== "Toutes"
                    ? "Essayez un autre filtre ou une autre recherche."
                    : "Vos candidatures apparaîtront ici dès les premiers envois. En attendant, préparez votre première recherche."}
                </p>
                <Link
                  href="/espace/recherches/nouvelle"
                  className="text-button"
                >
                  Créer une recherche <Arrow />
                </Link>
              </div>
            )}
          </section>
          <section className="panel">
            <div className="panel-title">
              <h2>Mes recherches préparées</h2>
              <span className="count-pill">{initial.campaigns.length}</span>
            </div>
            <p className="panel-description">
              Les paramètres de vos futures candidatures automatisées.
            </p>
            {initial.campaigns.length ? (
              <div className="campaign-list">
                {initial.campaigns.map((c) => (
                  <article key={c.id}>
                    <div>
                      <strong>
                        <Link
                          className="research-title-link"
                          href={`/espace/recherches/${c.id}`}
                        >
                          {c.title} ↗
                        </Link>
                      </strong>
                      <p>
                        {c.role} · {c.location}
                      </p>
                      <small>
                        {c.contract} · {c.remote} ·{" "}
                        {c.salary.toLocaleString("fr-FR")} € / an · {c.pace}{" "}
                        candidatures / jour
                      </small>
                    </div>
                    <span className="badge">Préparée</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="quiet-empty">
                Aucune recherche préparée pour le moment.
              </p>
            )}
            <div className="inline-note">
              <span>✧</span> L’envoi automatique sera disponible dans une
              prochaine étape. Aucune candidature n’est envoyée pour le moment.
            </div>
          </section>
        </div>
      </div>
      <footer className="workspace-footer">
        Une étape après l’autre. Vous avancez.
      </footer>
    </main>
  );
}
