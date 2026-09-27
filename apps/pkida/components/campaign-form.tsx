"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Field } from "./ui";
import type { CampaignInput, Profile } from "@/lib/models";
export function CampaignForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<CampaignInput>({
    title: "",
    role: profile.role,
    location: profile.location,
    salary: profile.salary,
    experience: profile.experience,
    contract: "CDI",
    remote: "Hybride",
    pace: 5,
    keywords: "",
    exclusions: "",
    review: true,
  });
  function set<K extends keyof CampaignInput>(key: K, value: CampaignInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) throw new Error();
      const created = await response.json();
      router.push(`/espace/recherches/${created.id}`);
      router.refresh();
    } catch {
      setError(
        "La recherche n’a pas pu être enregistrée. Vérifiez vos informations et réessayez.",
      );
      setBusy(false);
    }
  }
  return (
    <main className="container campaign-page">
      <Link className="back-link" href="/espace">
        ← Mon espace
      </Link>
      <div className="page-heading">
        <div>
          <span className="eyebrow">UN NOUVEL ÉLAN</span>
          <h1>Votre nouvelle recherche.</h1>
          <p>Définissez le cap. Nous gardons vos préférences pour la suite.</p>
        </div>
      </div>
      <form className="campaign-grid" onSubmit={submit}>
        <div className="panel">
          <h2>Ce que vous recherchez</h2>
          <p className="panel-description">
            Vos critères sont préremplis à partir de votre profil.
          </p>
          <div className="form-grid">
            <Field wide label="Nom de cette recherche">
              <input
                required
                minLength={2}
                maxLength={150}
                placeholder="Ex. Mon prochain poste en design"
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field wide label="Poste recherché">
              <input
                required
                minLength={2}
                maxLength={150}
                placeholder="Ex. Product designer"
                value={form.role}
                onChange={(e) => set("role", e.target.value)}
              />
            </Field>
            <Field wide label="Lieu de recherche">
              <input
                required
                minLength={2}
                maxLength={150}
                placeholder="Ex. Paris, France"
                value={form.location}
                onChange={(e) => set("location", e.target.value)}
              />
            </Field>
            <Field label="Salaire minimum brut annuel (€)">
              <input
                required
                type="number"
                min={0}
                max={1000000}
                value={form.salary}
                onChange={(e) => set("salary", Number(e.target.value))}
              />
            </Field>
            <Field label="Années d’expérience">
              <input
                required
                type="number"
                min={0}
                max={70}
                step={0.5}
                value={form.experience}
                onChange={(e) => set("experience", Number(e.target.value))}
              />
            </Field>
            <Field label="Type de contrat">
              <select
                value={form.contract}
                onChange={(e) =>
                  set("contract", e.target.value as CampaignInput["contract"])
                }
              >
                {["CDI", "CDD", "Freelance", "Alternance", "Stage"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field label="Mode de travail">
              <select
                value={form.remote}
                onChange={(e) =>
                  set("remote", e.target.value as CampaignInput["remote"])
                }
              >
                {["Hybride", "Sur site", "Télétravail"].map((v) => (
                  <option key={v}>{v}</option>
                ))}
              </select>
            </Field>
            <Field wide label="Mots-clés à privilégier (facultatif)">
              <input
                maxLength={500}
                placeholder="Ex. SaaS, impact, petite équipe…"
                value={form.keywords}
                onChange={(e) => set("keywords", e.target.value)}
              />
            </Field>
            <Field wide label="Entreprises ou mots-clés à exclure (facultatif)">
              <input
                maxLength={500}
                placeholder="Séparez les éléments par une virgule"
                value={form.exclusions}
                onChange={(e) => set("exclusions", e.target.value)}
              />
            </Field>
          </div>
          <h3 className="form-section-title">
            02 <span>Votre rythme, votre contrôle</span>
          </h3>
          <Field
            label={`Maximum souhaité : ${form.pace} candidatures par jour`}
          >
            <input
              type="range"
              min={1}
              max={20}
              value={form.pace}
              onChange={(e) => set("pace", Number(e.target.value))}
            />
          </Field>
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={form.review}
              onChange={(e) => set("review", e.target.checked)}
            />
            <span>
              <strong>Valider chaque candidature avant envoi</strong>
              <small>Préférence pour la future automatisation.</small>
            </span>
          </label>
        </div>
        <aside>
          <div className="panel recap">
            <span className="eyebrow">VOTRE FEUILLE DE ROUTE</span>
            <h2>Le prochain chapitre</h2>
            <div className="recap-icon">↗</div>
            <h3>{form.role || "Votre futur poste"}</h3>
            <p>{form.location || "Le lieu de votre choix"}</p>
            <dl>
              <div>
                <dt>Contrat</dt>
                <dd>{form.contract}</dd>
              </div>
              <div>
                <dt>Organisation</dt>
                <dd>{form.remote}</dd>
              </div>
              <div>
                <dt>Salaire minimum</dt>
                <dd>{form.salary.toLocaleString("fr-FR")} € / an</dd>
              </div>
              <div>
                <dt>Rythme maximal</dt>
                <dd>{form.pace} / jour</dd>
              </div>
              <div>
                <dt>Validation avant envoi</dt>
                <dd>{form.review ? "Oui" : "Non"}</dd>
              </div>
            </dl>
            <div className="inline-note">
              ✧ Cette recherche sera enregistrée comme « Préparée ».
              L’automatisation sera ajoutée ultérieurement ; aucun envoi ne sera
              effectué.
            </div>
            <button disabled={busy} className="button full-width">
              {busy ? "Enregistrement…" : "Enregistrer ma recherche"}
              <span>↗</span>
            </button>
            <Link className="cancel-link" href="/espace">
              Annuler
            </Link>
            <p className="feedback error-text" role="alert">
              {error}
            </p>
          </div>
        </aside>
      </form>
    </main>
  );
}
