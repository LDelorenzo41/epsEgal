import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function StatsPersoPage() {
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
    .select("*")
    .eq("id", user.id)
    .single()

  if (!profile?.establishment_id) {
    redirect("/dashboard")
  }

  // Get class activities for the teacher with all related data
  const { data: activities } = await supabase
    .from("class_activities")
    .select(`
      *,
      teacher_classes!inner (
        teacher_id,
        classes (
          name
        )
      ),
      apsa (
        name,
        cp_id,
        cp (
          code,
          label
        )
      )
    `)
    .eq("teacher_classes.teacher_id", user.id)
    .not("avg_score_girls", "is", null)
    .not("avg_score_boys", "is", null)

  // Calculate statistics
  let stats = {
    totalActivities: 0,
    avgDiffGlobal: 0,
    cpCoverage: {} as Record<string, number>,
    activitiesByCP: {} as Record<string, any[]>,
  }

  if (activities && activities.length > 0) {
    stats.totalActivities = activities.length

    // Calculate average difference F/G
    const diffs = activities.map((a: any) => {
      const diff = (a.avg_score_girls || 0) - (a.avg_score_boys || 0)
      return diff
    })

    stats.avgDiffGlobal =
      diffs.reduce((sum, diff) => sum + Math.abs(diff), 0) / diffs.length

    // Group by CP
    activities.forEach((activity: any) => {
      const cpCode = activity.apsa?.cp?.code
      if (cpCode) {
        if (!stats.activitiesByCP[cpCode]) {
          stats.activitiesByCP[cpCode] = []
        }
        stats.activitiesByCP[cpCode].push(activity)
      }
    })

    // Calculate CP coverage
    const totalCPs = 5
    stats.cpCoverage = {
      covered: Object.keys(stats.activitiesByCP).length,
      total: totalCPs,
      percentage:
        (Object.keys(stats.activitiesByCP).length / totalCPs) * 100,
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Statistiques Personnelles
            </h1>
            <p className="text-gray-600">
              Analyse de vos données d'égalité Filles/Garçons
            </p>
          </div>
          <Link href="/stats/etablissement">
            <Button variant="outline">
              Voir stats établissement
            </Button>
          </Link>
        </div>

        {activities && activities.length > 0 ? (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Activités analysées
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {stats.totalActivities}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Activités avec moyennes F/G
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Écart moyen F/G
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {stats.avgDiffGlobal.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Points d'écart absolu
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Couverture CP
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {stats.cpCoverage.covered} / {stats.cpCoverage.total}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {stats.cpCoverage.percentage.toFixed(0)}% des CP travaillées
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="by-apsa" className="space-y-4">
              <TabsList>
                <TabsTrigger value="by-apsa">Par APSA</TabsTrigger>
                <TabsTrigger value="by-cp">Par CP</TabsTrigger>
              </TabsList>

              <TabsContent value="by-apsa">
                <Card>
                  <CardHeader>
                    <CardTitle>Écarts Filles/Garçons par APSA</CardTitle>
                    <CardDescription>
                      Différence de moyennes pour chaque activité
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {activities.map((activity: any) => {
                        const diff =
                          (activity.avg_score_girls || 0) -
                          (activity.avg_score_boys || 0)
                        const absDiff = Math.abs(diff)
                        const diffColor =
                          absDiff < 0.5
                            ? "text-green-600"
                            : absDiff < 1
                            ? "text-yellow-600"
                            : "text-red-600"

                        return (
                          <div
                            key={activity.id}
                            className="flex items-center justify-between p-4 border rounded-lg bg-white"
                          >
                            <div className="flex-1">
                              <div className="font-semibold">
                                {activity.apsa?.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {activity.apsa?.cp?.code} -{" "}
                                {activity.teacher_classes?.classes?.name}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-sm text-center">
                                <div className="text-xs text-gray-500">Filles</div>
                                <div className="font-semibold text-pink-600">
                                  {activity.avg_score_girls?.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-sm text-center">
                                <div className="text-xs text-gray-500">
                                  Garçons
                                </div>
                                <div className="font-semibold text-blue-700">
                                  {activity.avg_score_boys?.toFixed(2)}
                                </div>
                              </div>
                              <div className="text-center min-w-[80px]">
                                <div className="text-xs text-gray-500">Écart</div>
                                <div className={`font-bold text-lg ${diffColor}`}>
                                  {diff > 0 ? "+" : ""}
                                  {diff.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="by-cp">
                <Card>
                  <CardHeader>
                    <CardTitle>Écarts Filles/Garçons par CP</CardTitle>
                    <CardDescription>
                      Analyse par compétence propre
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(stats.activitiesByCP).map(
                        ([cpCode, cpActivities]) => {
                          const avgDiff =
                            cpActivities.reduce((sum, a: any) => {
                              return (
                                sum +
                                Math.abs(
                                  (a.avg_score_girls || 0) -
                                    (a.avg_score_boys || 0)
                                )
                              )
                            }, 0) / cpActivities.length

                          const cpLabel = cpActivities[0]?.apsa?.cp?.label

                          return (
                            <div
                              key={cpCode}
                              className="border rounded-lg p-4 bg-white"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <div className="font-semibold text-blue-600">
                                    {cpCode}
                                  </div>
                                  <div className="text-sm text-gray-600">
                                    {cpLabel}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-xs text-gray-500">
                                    Écart moyen
                                  </div>
                                  <div className="text-2xl font-bold text-purple-600">
                                    {avgDiff.toFixed(2)}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm text-gray-500">
                                {cpActivities.length} activité(s) analysée(s)
                              </div>
                            </div>
                          )
                        }
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Aucune donnée statistique disponible pour le moment.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Commencez par saisir des moyennes de notes pour vos activités dans la page Perso.
              </p>
              <Link href="/perso">
                <Button>Accéder à ma page perso</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
