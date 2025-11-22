import { redirect } from "next/navigation"

export default function StatsPage() {
  // Redirect to personal stats by default
  redirect("/stats/perso")
}
