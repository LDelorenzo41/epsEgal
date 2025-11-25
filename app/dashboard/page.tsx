// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building, Users, BarChart, BookOpen, TrendingUp, Award, Podcast } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SourcesModal } from "@/components/sources-modal"
import { VigilanceQuiz } from "@/components/vigilance-quiz"

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

  // Get teacher's activities count
  const { count: myActivitiesCount } = await supabase
    .from("class_activities")
    .select("teacher_classes!inner(*)", { count: "exact", head: true })
    .eq("teacher_classes.teacher_id", user.id)

  // Get establishment stats
  const { count: teachersCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("establishment_id", profile?.establishment_id)

  // Get establishment total classes
  const { count: totalClassesCount } = await supabase
    .from("classes")
    .select("*", { count: "exact", head: true })
    .eq("establishment_id", profile?.establishment_id)

  // Get establishment total levels
  const { count: totalLevelsCount } = await supabase
    .from("levels")
    .select("*", { count: "exact", head: true })
    .eq("establishment_id", profile?.establishment_id)

  // Get establishment total APSA
  const { count: totalApsaCount } = await supabase
    .from("apsa")
    .select("*", { count: "exact", head: true })
    .eq("establishment_id", profile?.establishment_id)

  // Get establishment total activities with scores
  const { data: allActivities } = await supabase
    .from("class_activities")
    .select(`
      *,
      teacher_classes!inner (
        classes!inner (
          establishment_id
        )
      )
    `)
    .eq("teacher_classes.classes.establishment_id", profile?.establishment_id)
    .not("avg_score_girls", "is", null)
    .not("avg_score_boys", "is", null)

  // Calculate establishment average gap
  let establishmentAvgGap = 0
  let establishmentLabel = "Non calculé"
  let establishmentLabelColor = "text-gray-600"
  let establishmentLabelBg = "bg-gray-100"

  if (allActivities && allActivities.length > 0) {
    const gaps = allActivities.map((a) => 
      Math.abs((a.avg_score_girls || 0) - (a.avg_score_boys || 0))
    )
    establishmentAvgGap = gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length

    // Determine label
    if (establishmentAvgGap < 0.5) {
      establishmentLabel = "Équilibré"
      establishmentLabelColor = "text-green-600"
      establishmentLabelBg = "bg-green-100"
    } else if (establishmentAvgGap < 1) {
      establishmentLabel = "En progrès"
      establishmentLabelColor = "text-yellow-600"
      establishmentLabelBg = "bg-yellow-100"
    } else {
      establishmentLabel = "À renforcer"
      establishmentLabelColor = "text-orange-600"
      establishmentLabelBg = "bg-orange-100"
    }
  }

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

        {/* Personal Stats */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mes statistiques</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Mes classes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {classesCount || 0}
                    </div>
                    <p className="text-xs text-gray-500">Classes attribuées</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Mes activités
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600">
                      {myActivitiesCount || 0}
                    </div>
                    <p className="text-xs text-gray-500">APSA enseignées</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Niveaux établissement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Building className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {totalLevelsCount || 0}
                    </div>
                    <p className="text-xs text-gray-500">Niveaux configurés</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Classes établissement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-indigo-600">
                      {totalClassesCount || 0}
                    </div>
                    <p className="text-xs text-gray-500">Classes totales</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Establishment Stats */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques de l'établissement</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  APSA configurées
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <BarChart className="h-5 w-5 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-pink-600">
                      {totalApsaCount || 0}
                    </div>
                    <p className="text-xs text-gray-500">Activités disponibles</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Professeurs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Users className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-cyan-600">
                      {teachersCount || 0}
                    </div>
                    <p className="text-xs text-gray-500">Inscrits</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Écart moyen F/G
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-amber-600">
                      {allActivities?.length > 0 ? establishmentAvgGap.toFixed(2) : "-"}
                    </div>
                    <p className="text-xs text-gray-500">
                      {allActivities?.length > 0 ? "Points d'écart" : "Pas de données"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Label égalité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className={`p-2 ${establishmentLabelBg} rounded-lg`}>
                    <Award className={`h-5 w-5 ${establishmentLabelColor}`} />
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${establishmentLabelColor}`}>
                      {establishmentLabel}
                    </div>
                    <p className="text-xs text-gray-500">
                      {allActivities?.length || 0} activité(s)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Ressources Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Ressources pédagogiques</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <a 
              href="https://drive.google.com/file/d/1pEMfIaLvKr-ilwzHiJqxjGw4F4w6rPJY/view?usp=sharing"
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-purple-200 hover:border-purple-400">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center gap-4">
                    <div className="p-4 bg-purple-100 rounded-full">
                      <Podcast className="h-12 w-12 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        État des lieux de l'égalité filles / garçons en EPS en France
                      </h4>
                      <p className="text-sm text-gray-600">
                        Podcast audio sur l'égalité en EPS (créé avec NotebookLM)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </a>

            <Card className="border-2 border-indigo-200">
              <CardContent className="pt-6">
                <SourcesModal />
              </CardContent>
            </Card>

            {/* Quiz de vigilance */}
            {profile?.establishment_id && (
              <VigilanceQuiz 
                userId={user.id} 
                schoolId={profile.establishment_id} 
              />
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Accès rapide</h3>
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
        </div>
      </main>
    </div>
  )
}
