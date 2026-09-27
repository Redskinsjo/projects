import { requireUser } from "@/lib/auth";
import { readData } from "@/lib/store";
import { CampaignForm } from "@/components/campaign-form";
export const metadata = { title: "Nouvelle recherche" };
export default async function Page() {
  const user = await requireUser();
  return <CampaignForm profile={(await readData(user)).profile} />;
}
