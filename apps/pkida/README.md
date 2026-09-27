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
| `Research`    | Critères de recherche, contrat, mode de travail, mots-clés, exclusions, rythme, validation avant envoi et statut |
| `Application` | Entreprise, poste, lieu, statut, date, source, notes et recherche associée facultative                           |
| `Resume`      | CV PDF, nom, taille et date d’import                                                                             |

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

Les recherches restent **Préparées**. Aucune collecte d’offres ou candidature automatique n’est lancée.

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
