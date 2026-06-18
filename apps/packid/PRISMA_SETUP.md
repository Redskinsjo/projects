# Prisma Setup Guide

Cette application utilise **Prisma 7** pour gérer la base de données PostgreSQL.

## Installation

Assurez-vous que les dépendances sont installées :

```bash
pnpm install
```

## Configuration de la base de données

### 1. Configurer DATABASE_URL

Créez un fichier `.env.local` à la racine du projet avec votre chaîne de connexion PostgreSQL :

```
DATABASE_URL="postgresql://user:password@localhost:5432/packid?schema=public"
```

**Exemple avec PostgreSQL local :**

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/packid?schema=public"
```

**Exemple avec Docker :**

```bash
docker run --name packid-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:latest
# Puis créer la base de données:
# docker exec packid-db createdb -U postgres packid
```

### 2. Configuration Prisma 7

La configuration de Prisma est définie dans :

- **prisma/schema.prisma** - Définition du schéma de la base de données
- **prisma.config.ts** - Configuration de la connexion à la base de données

## Commandes Prisma

### Générer le client Prisma

```bash
pnpm prisma:generate
```

### Créer une migration

```bash
pnpm prisma:migrate
```

Cela va :

1. Créer un fichier de migration basé sur les changements du schéma
2. Appliquer la migration à la base de données
3. Régénérer le client Prisma

### Voir les données avec Prisma Studio

```bash
pnpm prisma:studio
```

Cela ouvre une UI web pour consulter et modifier les données directement.

## Structure du schéma

Le modèle `Candidate` inclut :

- **Informations de base** : id, name, title, role
- **Qualification** : match, cv, cvLink, conversation, keyword, references, referent
- **Mots clés de conversation** : conversationKeywords (tableau JSON)
- **Informations personnelles** : email, phone, location, experience, availability, summary
- **Historique** : history (objet JSON contenant les candidatures antérieures)
- **Timestamps** : createdAt, updatedAt

## Utilisation dans l'application

### Importer et utiliser le client Prisma

```typescript
import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

// Créer un candidat
const candidate = await prisma.candidate.create({
  data: {
    name: "John Doe",
    email: "john@example.com",
    // ... autres champs
  },
});

// Récupérer un candidat
const candidate = await prisma.candidate.findUnique({
  where: { id: "..." },
});

// Lister tous les candidats
const candidates = await prisma.candidate.findMany();

// Mettre à jour
const updated = await prisma.candidate.update({
  where: { id: "..." },
  data: {
    /* changements */
  },
});

// Supprimer
await prisma.candidate.delete({
  where: { id: "..." },
});
```

## Dépannage

**Erreur : "database "packid" does not exist"**

- Créez la base de données : `createdb packid`

**Erreur de migration**

- Vérifiez que la chaîne DATABASE_URL est correcte
- Assurez-vous que PostgreSQL est en cours d'exécution

**Erreur Prisma Client**

- Régénérez le client : `pnpm prisma:generate`
- Vérifiez les imports : `import { PrismaClient } from "@/app/generated/prisma/client"`
