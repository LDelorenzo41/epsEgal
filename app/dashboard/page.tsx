import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, BarChart, BookOpen } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, establishments(*)")
    .eq("id", user.id)
    .single()

  // Get teacher's classes count
  const { count: classesCount } = await supabase
    .from("teacher_classes")
    .select("*", { count: "exact", head: true })
    .eq("teacher_id", user.id)

  // Get establishment stats
  const { count: teachersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("establishment_id", profile?.establishment_id)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Tableau de bord
          </h1>
          <p className="text-gray-600">
            Bienvenue, {profile?.full_name || user.email}
          </p>
        </div>

        {profile?.establishments && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-2">
              {profile.establishments.name}
            </h2>
            <div className="flex items-center gap-4 text-sm text-blue-700">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{teachersCount || 0} / {profile.establishments.max_teachers} professeurs</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono font-semibold">
                  Code: {profile.establishments.identification_code}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Mes classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {classesCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Classes attribuées</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Établissement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {teachersCount || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">Professeurs inscrits</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-400">-</div>
              <p className="text-xs text-gray-500 mt-1">À venir</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Label égalité
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-400">-</div>
              <p className="text-xs text-gray-500 mt-1">Non calculé</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/etablissement">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>Établissement</CardTitle>
                    <CardDescription>
                      Configurer les niveaux, classes et APSA
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Gérer l'établissement
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/perso">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>Page Perso</CardTitle>
                    <CardDescription>
                      Gérer mes classes et ma programmation
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Accéder à ma page
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/stats/perso">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <BarChart className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>Statistiques Perso</CardTitle>
                    <CardDescription>
                      Mes écarts Filles/Garçons et répartition CP
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Voir mes stats
                </Button>
              </CardContent>
            </Card>
          </Link>

          <Link href="/stats/etablissement">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <BarChart className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>Statistiques Établissement</CardTitle>
                    <CardDescription>
                      Vue globale et label égalité
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full">
                  Voir les stats
                </Button>
              </CardContent>
            </Card>
          </Link>
        </div>
      </main>
    </div>
  )
}
