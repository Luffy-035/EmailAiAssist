import { auth } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import AutopilotPanel from "@/components/AutopilotPanel";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Autopilot — EmailAssist",
};

export default async function AutopilotPage() {
  const session = await auth();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="w-full px-10 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-[#141413] tracking-tight mb-2">Neural Autopilot</h1>
          <p className="text-gray-400 font-medium text-sm">Configure your AI governance and monitor autonomous activity logs.</p>
        </div>
        
        {/* Expanded to full width for immersive control and history viewing */}
        <div className="w-full">
          <AutopilotPanel />
        </div>
      </main>
    </div>
  );
}
