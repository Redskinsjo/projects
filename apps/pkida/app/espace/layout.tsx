import { requireUser } from "@/lib/auth";
import { AppHeader } from "@/components/ui";
export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireUser();
  return (
    <>
      <AppHeader />
      {children}
    </>
  );
}
