"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AiAgentChat from "@/components/dashboard/ai-agent/AiAgentChat";

export default async function AiAgentPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const role = user.user_metadata?.role || 'organizer'; // Default to organizer for dashboard context? Or check.
  const table = role === 'organizer' ? 'organizers' : 'customers';

  const { data: profile } = await supabase
    .from(table)
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="h-full">
      <AiAgentChat userProfile={profile} />
    </div>
  );
}
