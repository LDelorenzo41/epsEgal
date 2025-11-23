// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { SchoolYearSelector } from "@/components/school-year-selector"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function StatsPersoPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [activities, setActivities] = useState([])
  const [stats, setStats] = useState({
    totalActivities: 0,
    avgDiffGlobal: 0,
    cpCoverage: {},
    activitiesByCP: {},
  })
  const [chartData, setChartData] = useState([])
  const [trendData, setTrendData] = useState([])
  const [pieData, setPieData] = useState([])
  const [schoolYear, setSchoolYear] = useState("2025-26")

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [schoolYear])

  const loadData = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
        return
      }

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

      if (!profileData?.establishment_id) {
        router.push("/dashboard")
        return
      }

      setProfile(profileData)

      const { data: activitiesData } = await supabase
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
        .eq("school_year", schoolYear)
        .not("avg_score_girls", "is", null)
        .not("avg_score_boys", "is", null)

      if (activitiesData && activitiesData.length > 0) {
        setActivities(activitiesData)

        const totalActivities = activitiesData.length

        const diffs = activitiesData.map((a) => {
          const diff = (a.avg_score_girls || 0) - (a.avg_score_boys || 0)
          return diff
        })

        const avgDiffGlobal = diffs.reduce((sum, diff) => sum + Math.abs(diff), 0) / diffs.length

        const activitiesByCP = {}
        activitiesData.forEach((activity) => {
          const cpCode = activity.apsa?.cp?.code
          if (cpCode) {
            if (!activitiesByCP[cpCode]) {
              activitiesByCP[cpCode] = []
            }
            activitiesByCP[cpCode].push(activity)
          }
        })

        const totalCPs = 5
        const cpCoverage = {
          covered: Object.keys(activitiesByCP).length,
          total: totalCPs,
          percentage: (Object.keys(activitiesByCP).length / totalCPs) * 100,
        }

        setStats({
          totalActivities,
          avgDiffGlobal,
          cpCoverage,
          activitiesByCP,
        })

        // Prepare bar chart data (by APSA)
        const chartDataArray = activitiesData.map((activity) => ({
          name: activity.apsa?.name || "N/A",
          "Moy. Filles": parseFloat((activity.avg_score_girls || 0).toFixed(2)),
          "Moy. Garçons": parseFloat((activity.avg_score_boys || 0).toFixed(2)),
          "Écart": parseFloat(Math.abs((activity.avg_score_girls || 0) - (activity.avg_score_boys || 0)).toFixed(2)),
        }))
        setChartData(chartDataArray)

        // Prepare trend chart data (by period)
        const activitiesByPeriod = {}
        activitiesData.forEach((activity) => {
          const period = activity.period || "Non défini"
          if (!activitiesByPeriod[period]) {
            activitiesByPeriod[period] = []
          }
          activitiesByPeriod[period].push(activity)
        })

        const trendDataArray = Object.entries(activitiesByPeriod).map(([period, periodActivities]) => {
          const avgGirls = periodActivities.reduce((sum, a) => sum + (a.avg_score_girls || 0), 0) / periodActivities.length
          const avgBoys = periodActivities.reduce((sum, a) => sum + (a.avg_score_boys || 0), 0) / periodActivities.length
          const avgTotal = periodActivities.reduce((sum, a) => sum + (a.avg_score_total || 0), 0) / periodActivities.length

          return {
            period,
            "Filles": parseFloat(avgGirls.toFixed(2)),
            "Garçons": parseFloat(avgBoys.toFixed(2)),
            "Moyenne": parseFloat(avgTotal.toFixed(2)),
          }
        })
        setTrendData(trendDataArray)

        // Prepare pie chart data
        const pieDataArray = Object.entries(activitiesByCP).map(([cpCode, cpActivities]) => ({
          name: cpCode,
          value: cpActivities.length,
        }))
        setPieData(pieDataArray)
      } else {
        setActivities([])
        setStats({
          totalActivities: 0,
          avgDiffGlobal: 0,
          cpCoverage: { covered: 0, total: 5, percentage: 0 },
          activitiesByCP: {},
        })
        setChartData([])
        setTrendData([])
        setPieData([])
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavBar />
        <main className="container mx-auto px-4 py-8">
          <p>Chargement...</p>
        </main>
      </div>
    )
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
          <div className="flex items-center gap-4">
            <SchoolYearSelector value={schoolYear} onChange={setSchoolYear} />
            <Link href="/stats/etablissement">
              <Button variant="outline">
                Voir stats établissement
              </Button>
            </Link>
          </div>
        </div>

        {activities.length > 0 ? (
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

            {/* Graphiques */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Line Chart - Tendances par période */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution par période</CardTitle>
                  <CardDescription>
                    Tendances des moyennes Filles/Garçons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis domain={[0, 20]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Filles" stroke="#ec4899" strokeWidth={2} />
                        <Line type="monotone" dataKey="Garçons" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="Moyenne" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[350px] flex items-center justify-center text-gray-500">
                      <p>Aucune donnée de période disponible</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pie Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des activités</CardTitle>
                  <CardDescription>
                    Nombre d'activités par CP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart - Comparaison par APSA */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Comparaison Filles/Garçons par APSA</CardTitle>
                <CardDescription>
                  Moyennes détaillées pour chaque activité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Moy. Filles" fill="#ec4899" />
                    <Bar dataKey="Moy. Garçons" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

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
                      {activities.map((activity) => {
                        const diff = (activity.avg_score_girls || 0) - (activity.avg_score_boys || 0)
                        const absDiff = Math.abs(diff)
                        const diffColor = absDiff < 0.5 ? "text-green-600" : absDiff < 1 ? "text-yellow-600" : "text-red-600"

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
                                {activity.period && (
                                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                    {activity.period}
                                  </span>
                                )}
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
                      {Object.entries(stats.activitiesByCP).map(([cpCode, cpActivities]) => {
                        const avgDiff = cpActivities.reduce((sum, a) => {
                          return sum + Math.abs((a.avg_score_girls || 0) - (a.avg_score_boys || 0))
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
                      })}
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
                Aucune donnée statistique disponible pour l'année {schoolYear}.
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
