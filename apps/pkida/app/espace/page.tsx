import { requireUser } from "@/lib/auth";
import { readData } from "@/lib/store";
import { Dashboard } from "@/components/dashboard";
export const metadata = { title: "Mon espace" };
export default async function Page() {
  const user = await requireUser();
  return <Dashboard initial={await readData(user)} />;
}
