// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts"
import { SchoolYearSelector } from "@/components/school-year-selector"

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function StatsEtablissementPage() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [stats, setStats] = useState({
    totalActivities: 0,
    avgDiffGlobal: 0,
    cpCoverage: {},
    activitiesByCP: {},
    label: "Non calculé",
    labelColor: "text-gray-600",
    labelBg: "bg-gray-100",
  })
  const [chartData, setChartData] = useState([])
  const [pieChartData, setPieChartData] = useState([])
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
        .select("*, establishments(*)")
        .eq("id", user.id)
        .single()

      if (!profileData?.establishment_id) {
        router.push("/dashboard")
        return
      }

      setProfile(profileData)

      const { data: allActivities } = await supabase
        .from("class_activities")
        .select(`
          *,
          teacher_classes!inner (
            teacher_id,
            classes!inner (
              establishment_id,
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
        .eq("teacher_classes.classes.establishment_id", profileData.establishment_id)
        .eq("school_year", schoolYear)
        .not("avg_score_girls", "is", null)
        .not("avg_score_boys", "is", null)

      if (allActivities && allActivities.length > 0) {
        const totalActivities = allActivities.length

        const diffs = allActivities.map((a) => {
          const diff = (a.avg_score_girls || 0) - (a.avg_score_boys || 0)
          return diff
        })

        const avgDiffGlobal = diffs.reduce((sum, diff) => sum + Math.abs(diff), 0) / diffs.length

        const activitiesByCP = {}
        allActivities.forEach((activity) => {
          const cpCode = activity.apsa?.cp?.code
          if (cpCode) {
            if (!activitiesByCP[cpCode]) {
              activitiesByCP[cpCode] = []
            }
            activitiesByCP[cpCode].push(activity)
          }
        })

        const totalCPs = 5
        const coveredCPs = Object.keys(activitiesByCP).length
        const cpCoverage = {
          covered: coveredCPs,
          total: totalCPs,
          percentage: (coveredCPs / totalCPs) * 100,
        }

        const allCPsCovered = coveredCPs === totalCPs
        const lowDiff = avgDiffGlobal < 0.5

        let label = "À renforcer"
        let labelColor = "text-orange-700"
        let labelBg = "bg-orange-100"

        if (allCPsCovered && lowDiff) {
          label = "Équilibré"
          labelColor = "text-green-700"
          labelBg = "bg-green-100"
        } else if (coveredCPs >= 4 || avgDiffGlobal < 1) {
          label = "En progrès"
          labelColor = "text-yellow-700"
          labelBg = "bg-yellow-100"
        }

        setStats({
          totalActivities,
          avgDiffGlobal,
          cpCoverage,
          activitiesByCP,
          label,
          labelColor,
          labelBg,
        })

        // Prepare chart data
        const chartDataArray = Object.entries(activitiesByCP).map(([cpCode, cpActivities]) => {
          const avgGirls = cpActivities.reduce((sum, a) => sum + (a.avg_score_girls || 0), 0) / cpActivities.length
          const avgBoys = cpActivities.reduce((sum, a) => sum + (a.avg_score_boys || 0), 0) / cpActivities.length
          const avgDiff = cpActivities.reduce((sum, a) => sum + Math.abs((a.avg_score_girls || 0) - (a.avg_score_boys || 0)), 0) / cpActivities.length

          return {
            name: cpCode,
            "Moy. Filles": parseFloat(avgGirls.toFixed(2)),
            "Moy. Garçons": parseFloat(avgBoys.toFixed(2)),
            "Écart": parseFloat(avgDiff.toFixed(2)),
          }
        })
        setChartData(chartDataArray)

        // Prepare pie chart data
        const pieData = Object.entries(activitiesByCP).map(([cpCode, cpActivities]) => ({
          name: cpCode,
          value: cpActivities.length,
        }))
        setPieChartData(pieData)
      } else {
        setStats({
          totalActivities: 0,
          avgDiffGlobal: 0,
          cpCoverage: { covered: 0, total: 5, percentage: 0 },
          activitiesByCP: {},
          label: "Non calculé",
          labelColor: "text-gray-600",
          labelBg: "bg-gray-100",
        })
        setChartData([])
        setPieChartData([])
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
              Statistiques Établissement
            </h1>
            <p className="text-gray-600">
              {profile?.establishments?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <SchoolYearSelector value={schoolYear} onChange={setSchoolYear} />
            <Link href="/stats/perso">
              <Button variant="outline">Voir mes stats perso</Button>
            </Link>
          </div>
        </div>

        {stats.totalActivities > 0 ? (
          <>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-center text-2xl">
                  Label Égalité - Année {schoolYear}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`${stats.labelBg} rounded-lg p-8 text-center border-2`}>
                  <div className={`text-4xl font-bold mb-4 ${stats.labelColor}`}>
                    {stats.label}
                  </div>
                  <div className="text-sm text-gray-600 max-w-2xl mx-auto">
                    {stats.label === "Équilibré" && (
                      <p>
                        Félicitations ! Votre établissement présente un bon équilibre
                        entre les moyennes Filles/Garçons et couvre l'ensemble des
                        compétences propres.
                      </p>
                    )}
                    {stats.label === "En progrès" && (
                      <p>
                        Votre établissement progresse dans l'égalité Filles/Garçons.
                        Continuez vos efforts pour couvrir toutes les CP et réduire
                        les écarts de moyennes.
                      </p>
                    )}
                    {stats.label === "À renforcer" && (
                      <p>
                        Des efforts sont nécessaires pour améliorer l'égalité
                        Filles/Garçons. Travaillez sur la diversification des CP et
                        la réduction des écarts de moyennes.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    Total établissement
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

            {/* Bar Chart - Moyennes par CP */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Comparaison Filles/Garçons par CP</CardTitle>
                <CardDescription>
                  Moyennes comparées pour chaque compétence propre
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 20]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Moy. Filles" fill="#ec4899" />
                    <Bar dataKey="Moy. Garçons" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Pie Chart - Répartition des activités par CP */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition des activités</CardTitle>
                  <CardDescription>
                    Nombre d'activités par CP
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Bar Chart - Écarts par CP */}
              <Card>
                <CardHeader>
                  <CardTitle>Écarts moyens par CP</CardTitle>
                  <CardDescription>
                    Différence absolue Filles/Garçons
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="Écart" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Analyse par Compétence Propre</CardTitle>
                <CardDescription>
                  Écarts moyens Filles/Garçons par CP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(stats.activitiesByCP).map(([cpCode, cpActivities]) => {
                    const avgDiff = cpActivities.reduce((sum, a) => {
                      return sum + Math.abs((a.avg_score_girls || 0) - (a.avg_score_boys || 0))
                    }, 0) / cpActivities.length

                    const avgGirls = cpActivities.reduce((sum, a) => sum + (a.avg_score_girls || 0), 0) / cpActivities.length
                    const avgBoys = cpActivities.reduce((sum, a) => sum + (a.avg_score_boys || 0), 0) / cpActivities.length
                    const cpLabel = cpActivities[0]?.apsa?.cp?.label

                    const diffColor = avgDiff < 0.5 ? "text-green-600" : avgDiff < 1 ? "text-yellow-600" : "text-red-600"

                    return (
                      <div key={cpCode} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-lg text-blue-600">
                              {cpCode}
                            </div>
                            <div className="text-sm text-gray-600">
                              {cpLabel}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {cpActivities.length} activité(s) analysée(s)
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-center">
                              <div className="text-xs text-gray-500">
                                Moy. Filles
                              </div>
                              <div className="text-xl font-semibold text-pink-600">
                                {avgGirls.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500">
                                Moy. Garçons
                              </div>
                              <div className="text-xl font-semibold text-blue-700">
                                {avgBoys.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-center min-w-[100px]">
                              <div className="text-xs text-gray-500">
                                Écart moyen
                              </div>
                              <div className={`text-2xl font-bold ${diffColor}`}>
                                {avgDiff.toFixed(2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {stats.cpCoverage.covered < 5 && (
                    <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 bg-yellow-50">
                      <div className="text-sm text-yellow-800">
                        <strong>CP non couvertes :</strong> Il manque{" "}
                        {5 - stats.cpCoverage.covered} CP pour une couverture
                        complète.
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">
                Aucune donnée statistique disponible pour l'année {schoolYear}.
              </p>
              <p className="text-sm text-gray-400 mb-6">
                Les professeurs doivent commencer à saisir des moyennes de notes
                dans leur page personnelle.
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
