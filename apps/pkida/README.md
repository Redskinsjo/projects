# PKida

Application candidats du workspace : Next.js 16.2.9, React 19.2.4, TypeScript, Tailwind CSS 4, Prisma 7.8 et PostgreSQL. Node.js >= 20.19 (ou >= 22.12 sur la branche Node 22).

## Activer Neon

1. Créer une base dédiée à PKida sur Neon.
2. Copier la chaîne PostgreSQL **directe** (désactiver « Connection pooling » dans le panneau Connect) et conserver ses paramètres SSL.
3. Ajouter dans `apps/pkida/.env.local` :

```dotenv
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
```

4. Depuis la racine du dépôt, démarrer ou redémarrer :

```sh
pnpm install
pnpm --filter pkida dev
```

Ouvrir http://localhost:3001. La commande `dev` génère le client Prisma puis applique les migrations avec `prisma migrate deploy`. Une seule variable de base de données est nécessaire : `DATABASE_URL`. Le client utilise un pool de cinq connexions maximum ; l’URL directe sert également aux migrations.

Aucune base Neon ni aucun secret ne sont fournis dans le dépôt. Sans `DATABASE_URL`, la vitrine et la connexion restent accessibles, mais la sauvegarde n’est pas disponible. Une migration en erreur interrompt le démarrage plutôt que de lancer l’application sur un schéma incompatible. Pour appliquer les migrations à un serveur déjà lancé :

```sh
pnpm --filter pkida db:migrate
```

Le schéma de référence est dans `prisma/schema.prisma`, avec une migration initiale versionnée dans `prisma/migrations/`. La génération et la compilation ne nécessitent pas d’accès à la base. Les migrations ne sont exécutées ni au build ni à chaque requête.

## Données persistées

| Modèle        | Contenu                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------- |
| `User`        | Identifiant stable du compte OAuth, nom et e-mail du fournisseur                                                 |
| `Profile`     | Nom, e-mail de contact, téléphone, présentation, poste, lieu, salaire brut annuel et années d’expérience         |
| `Research`    | Critères de recherche, contrat, mode de travail, mots-clés, exclusions, fréquence, validation avant candidature et statut |
| `Application` | Entreprise, poste, lieu, statut, date, source, notes et recherche associée facultative                           |
| `Resume`      | CV PDF, nom, taille et date d’import                                                                             |
| `Company`, `JobOffer`, `OfferSource` | Métadonnées d'entreprise, offres collectées et URL/type de source |
| `ResearchMatch`, `SearchRun` | Correspondance privée à une recherche, notifications dans l'espace, historique et statut des collectes |

Chaque enregistrement appartient à un utilisateur. Les requêtes sont limitées au compte authentifié. Une clé étrangère composite interdit aussi en base d’associer une candidature à la recherche d’un autre utilisateur. La suppression d’un utilisateur supprime ses données liées ; aucune interface de suppression de compte n’est encore implémentée.

Le bouton **Enregistrer mon profil** écrit le profil dans PostgreSQL. **Enregistrer ma recherche** crée une recherche et ouvre son détail. Le tableau de bord recharge les profils, recherches et candidatures depuis la base. Chaque modification porte sur son enregistrement, sans réécrire toutes les données du compte.

Le CV PDF (5 Mo maximum) est stocké en `bytea` dans PostgreSQL pour rendre cette version autonome sur Neon. Son contenu n’est pas chargé avec le tableau de bord. L’aperçu nécessite une session et désactive le cache. Un stockage d’objets privé pourra remplacer le stockage binaire en base si le volume augmente.

L’ancien répertoire `.data/` reste ignoré et intact, mais n’est plus lu. Il n’y a pas de transfert automatique des anciens fichiers ou comptes de démonstration dans Neon. Les données doivent rester associées au bon identifiant de compte ; aucun rattachement automatique par e-mail n’est effectué.

## Pages

- `/` : vitrine responsive en français.
- `/connexion` : Google, LinkedIn et démo locale en développement.
- `/espace` : profil, CV, candidatures et recherches préparées.
- `/espace/recherches/nouvelle` : création d’une recherche.
- `/espace/recherches/[id]` : critères et emplacement pour les offres correspondantes.

Les recherches sont créées en état **Préparée**. Depuis une recherche, l’utilisateur peut lancer une collecte web à la demande. Les résultats sont enregistrés et dédupliqués, puis affichés sur sa page de recherche. Aucune candidature n’est envoyée automatiquement.

### Recherche d'offres

Le script `scripts/sync-companies.mjs` alimente `Company` à partir de l'API publique de l'Annuaire des Entreprises, de l'annuaire paginé de Numeum et des profils d'agences Sortlist. Il conserve les identifiants, secteurs, descriptions, lieux, domaines trouvés et la provenance dans `Company.metadata.sources`. Les imports sont dédupliqués par domaine ou nom ; les fiches officielles conservent leur SIREN dans les métadonnées. Les fiches Sortlist complètent seulement les champs encore vides, sans remplacer les informations déjà saisies. Sortlist est chargé avec Puppeteer; si `/explore` renvoie 403, le script parcourt des pages de catégories publiques prédéfinies. Si un profil d'agence renvoie 403, il importe le résumé de la carte de catégorie; le domaine pourra être recherché ensuite avec `db:enrich-company-domains`. Exécuter depuis `apps/pkida` :

```sh
npm run db:sync-companies -- --source=all --pages=all
```

Le script charge `.env.local` et exige `DATABASE_URL`. Node.js 22.6+ est requis pour lancer le client Prisma généré. `--source` accepte `annuaire`, `numeum` ou `sortlist`. Les plafonds peuvent être réglés avec `ANNUAIRE_MAX_PAGES`, `ANNUAIRE_SEARCH_TERMS`, `SORTLIST_MAX_CATEGORIES` et `COMPANY_SCRAPER_MAX_DETAILS`. Numeum est limité à 100 fiches par lancement par défaut (`NUMEUM_MAX_COMPANIES_PER_RUN` pour changer le plafond). `--pages` règle la pagination Numeum. Un curseur local dans `.data/company-sync-state.json` conserve la progression des sources, y compris la position dans une page Numeum ; ce fichier doit être conservé entre deux exécutions.

Puppeteer sert au chargement des pages Sortlist et à la recherche des domaines manquants. Si Chrome n'a pas été téléchargé lors de l'installation des dépendances, installer le navigateur compatible une seule fois :

```sh
npm run db:install-browser
```

Pour rechercher les domaines manquants sans utiliser Brave, `scripts/enrich-company-domains.mjs` pilote Puppeteer sur DuckDuckGo HTML, puis vérifie les résultats candidats à partir du nom, de la description, du secteur et du lieu enregistrés. Il ne renseigne un domaine que si le score d'identité atteint le seuil configuré, sinon il laisse l'entreprise à vérifier. Les conflits avec un domaine déjà attribué sont également ignorés. Après l'installation de Puppeteer et Chrome, lancer :

```sh
npm run db:enrich-company-domains -- --limit=50
```

`COMPANY_DOMAIN_DELAY_MS` règle la pause entre les entreprises et `COMPANY_DOMAIN_MIN_SCORE` le seuil de confiance (défaut : 5). Le script complète les champs vides seulement et conserve la provenance de la recherche dans `Company.metadata.sources`.

Pour importer des entreprises depuis PagesJaunes, `scripts/sync-pagesjaunes.mjs` applique le produit cartésien des mots-clés de recherche avec les 20 villes et les 20 départements les plus peuplés configurés dans le script, remplit les deux champs de recherche, visite les fiches des résultats et collecte les coordonnées professionnelles disponibles : site, numéros de téléphone, adresse, activités/mots-clés, description et horaires. Les informations propres à PagesJaunes sont conservées dans `Company.metadata.sources`; les téléphones, horaires, mots-clés et l'adresse postale sont également agrégés dans `Company.metadata`. Les champs déjà renseignés sur une entreprise sont préservés. Une exécution traite 50 recherches par défaut (1 880 combinaisons au total, jusqu'à 25 fiches par recherche) et reprend au prochain index via `.data/pagesjaunes-state.json` :

```sh
npm run db:sync-pagesjaunes
```

Utiliser `--all` pour traiter toutes les combinaisons restantes ou `--limit=N` pour régler la taille du lot. `PAGESJAUNES_DELAY_MS` et `PAGESJAUNES_DETAIL_DELAY_MS` règlent les pauses entre recherches et fiches. Si PagesJaunes présente un contrôle anti-automatisation, le script arrête le lot et conserve sa position de reprise.

Lorsqu'une recherche est lancée, PKida filtre l'ensemble des entreprises stockées par nom, description, secteur, industrie et lieu, puis visite les sites des entreprises correspondantes qui ont un domaine, par groupes de quatre pour limiter la charge. Pour éviter une consommation excessive de crédits Brave, la recherche du domaine des entreprises qui n'en ont pas est limitée à quatre par lancement ; lancer auparavant `db:enrich-company-domains` pour renseigner progressivement ces domaines. Les offres sont confirmées par leurs données structurées `JobPosting` ou par le contenu de la page avant d'être conservées. Les pages hébergées sur les job boards et ATS connus sont exclues. Les posts LinkedIn publics continuent d'être recherchés séparément avec Brave. Titre, description, entreprise, salaire, lieu, contrat, dates et secteur restent non renseignés si la source ne les fournit pas. Pour les mots-clés, les mots non cités sont séparés (espaces, virgules ou retours à la ligne) ; mettre une expression composée entre guillemets pour la garder groupée, par exemple `node, React, "gestion de projet"`.

L'API de l'Annuaire des Entreprises est un service de recherche textuelle et géographique, pas une exportation exhaustive de Sirene ; l'import l'interroge avec les termes configurés. Sortlist `/explore` est un catalogue de catégories de services : le script visite les pages de catégories, puis les profils d'agences qu'elles référencent.

Les posts LinkedIn proviennent d'un index public et ne garantissent ni l'exhaustivité du flux d'une entreprise ni la vérification de l'identité de son auteur. L'accès à l'API LinkedIn pour les publications d'une organisation nécessite des permissions approuvées et un membre autorisé sur la page de cette organisation ; il ne permet pas de lire arbitrairement les flux de toutes les entreprises. PKida indique donc clairement les posts indexés et demande à l'utilisateur de vérifier le compte à la source.

Après une première collecte, une recherche passe en état **Active** et devient éligible au déclencheur quotidien. L'utilisateur peut la mettre en pause ou la reprendre depuis sa page. Pour le planificateur externe, configurer `PKIDA_CRON_SECRET`, puis appeler `POST /api/cron/researches` avec `Authorization: Bearer <secret>` une fois par jour. La liste des offres dans PKida constitue la notification de l'utilisateur. L'envoi par e-mail n'est pas activé dans cette version.

## API de candidatures

La persistance est disponible pour la future collecte et automatisation, sans ajouter de faux envois :

- `GET /api/applications` : candidatures du compte connecté.
- `POST /api/applications` : création ; champs requis `company`, `role`, `location`, champs facultatifs `researchId`, `sourceUrl`, `date` (ISO), `notes` et `status` (par défaut `En cours`).
- `PATCH /api/applications/[id]` : modification de `status` et/ou `notes`.

Statuts acceptés : `En cours`, `Envoyée`, `Entretien`, `Acceptée`, `Refusée`. Les mutations exigent une session et l’origine définie par `APP_BASE_URL`. La création ou le changement de statut ne déclenche pas d’envoi réel. Aucune interface de saisie manuelle des candidatures n’est ajoutée à cette étape.

## Connexion

Les réglages OAuth sont indépendants de la base. Renseigner `.env.local` à partir de `.env.example` :

- `APP_BASE_URL` : http://localhost:3001, ou l’origine HTTPS en production.
- `SESSION_SECRET` : au moins 32 caractères aléatoires (`openssl rand -hex 32`).
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.
- `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`.

URL de retour à configurer chez les fournisseurs :

```text
http://localhost:3001/api/auth/google/callback
http://localhost:3001/api/auth/linkedin/callback
```

Activer **Sign In with LinkedIn using OpenID Connect** dans LinkedIn. Les scopes sont `openid profile email`. Les jetons des fournisseurs ne sont pas conservés. Références : [Google OAuth](https://developers.google.com/identity/protocols/oauth2/web-server), [LinkedIn OpenID Connect](https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2).

La session dure sept jours avec cookie HttpOnly, SameSite=Lax et Secure en production. La démo locale crée un compte distinct à chaque connexion et ne fonctionne pas en production. Le compte fixe de développement a été remplacé par le compte de session sur toutes les pages de l’espace.

## Vérification et production

```sh
pnpm --filter pkida lint
pnpm --filter pkida check-types
pnpm --filter pkida build
# Avec un serveur de développement relié à une base de test :
pnpm --filter pkida test:integration
# En production : appliquer les migrations et démarrer
pnpm --filter pkida start
```

Les tests créent des comptes distincts et des données de test : utiliser une base dédiée, pas une base de production. Ils couvrent la persistance du profil, des recherches, des candidatures et des CV, les statuts, la validation et l’isolation entre comptes. Pour tester une compilation de production locale, `PKIDA_TEST_URL` définit l’URL du serveur et `PKIDA_TEST_SESSION_SECRET` doit correspondre au secret de cette instance de test uniquement.

Pour explorer les données : `pnpm --filter pkida db:studio`.

En production, renseigner `DATABASE_URL` et les variables d’authentification, utiliser HTTPS et prévoir des sauvegardes Neon. `start` applique les migrations versionnées avant de lancer Next.js. Prisma CLI et dotenv sont donc des dépendances de production.
