import InterviewClient from "@/app/components/InterviewClient";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <main className="mx-auto max-w-3xl">
        <InterviewClient token={token} />
      </main>
    </div>
  );
}
