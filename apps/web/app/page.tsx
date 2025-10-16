import dynamic from "next/dynamic";

const DashboardHero = dynamic(() => import("@/components/dashboard-hero").then(mod => mod.DashboardHero), { ssr: false });

export default function Page() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <DashboardHero />
    </main>
  );
}
