import { RecordNotFoundError } from "./store";
export function databaseError(error: unknown) {
  if (error instanceof RecordNotFoundError)
    return Response.json({ error: error.message }, { status: 404 });
  // Never expose connection strings, SQL, profile contents or provider subjects.
  return Response.json(
    {
      error: process.env.DATABASE_URL
        ? "La base de données est indisponible. Réessayez dans un instant."
        : "La sauvegarde nécessite DATABASE_URL dans la configuration de PKida.",
    },
    { status: 503 },
  );
}
