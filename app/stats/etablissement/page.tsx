// @ts-nocheck
"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { SchoolYearSelector } from "@/components/school-year-selector"
import { LabelInfoModal } from "@/components/label-info-modal"

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

  // Nouveaux états pour les analyses supplémentaires
  const [genderAnalysis, setGenderAnalysis] = useState({
    male: { activities: [], avgDiff: 0 },
    female: { activities: [], avgDiff: 0 },
  })
  const [classAnalysis, setClassAnalysis] = useState({
    girlMajority: { classes: [], avgDiff: 0 },
    boyMajority: { classes: [], avgDiff: 0 },
    balanced: { classes: [], avgDiff: 0 },
  })

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
            class_id,
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
        // Exclure CP5 des activités
        const filteredActivities = allActivities.filter((a) => a.apsa?.cp?.code !== "CP5")
        const totalActivities = filteredActivities.length

        const diffs = filteredActivities.map((a) => {
          const diff = (a.avg_score_girls || 0) - (a.avg_score_boys || 0)
          return diff
        })

        const avgDiffGlobal = diffs.reduce((sum, diff) => sum + Math.abs(diff), 0) / diffs.length

        const activitiesByCP = {}
        filteredActivities.forEach((activity) => {
          const cpCode = activity.apsa?.cp?.code
          if (cpCode && cpCode !== "CP5") {
            if (!activitiesByCP[cpCode]) {
              activitiesByCP[cpCode] = []
            }
            activitiesByCP[cpCode].push(activity)
          }
        })

        const totalCPs = 4 // Collège = CP1 à CP4 (CP5 exclue)
        const coveredCPs = Object.keys(activitiesByCP).length
        const cpCoverage = {
          covered: coveredCPs,
          total: totalCPs,
          percentage: (coveredCPs / totalCPs) * 100,
        }

        const allCPsCovered = coveredCPs === 4
        const lowDiff = avgDiffGlobal < 0.5

        let label = "À renforcer"
        let labelColor = "text-orange-700"
        let labelBg = "bg-orange-100"

        if (allCPsCovered && lowDiff) {
          label = "Équilibré"
          labelColor = "text-green-700"
          labelBg = "bg-green-100"
        } else if (coveredCPs >= 3 || avgDiffGlobal < 1) {
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

        // --- DEBUT ANALYSE SUPPLEMENTAIRE ---

        // Analyse par sexe du professeur
        const teacherProfiles = await supabase
          .from("profiles")
          .select("id, gender")
          .eq("establishment_id", profileData.establishment_id)
          .not("gender", "is", null)

        const localGenderAnalysis = {
          male: { activities: [], avgDiff: 0 },
          female: { activities: [], avgDiff: 0 },
        }

        if (teacherProfiles.data) {
          filteredActivities.forEach((activity) => {
            const teacher = teacherProfiles.data.find(
              (p) => p.id === activity.teacher_classes?.teacher_id
            )
            if (teacher?.gender === "male" || teacher?.gender === "female") {
              localGenderAnalysis[teacher.gender].activities.push(activity)
            }
          })

          // Calculer les moyennes
          if (localGenderAnalysis.male.activities.length > 0) {
            const diffs = localGenderAnalysis.male.activities.map((a) =>
              Math.abs((a.avg_score_girls || 0) - (a.avg_score_boys || 0))
            )
            localGenderAnalysis.male.avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length
          }

          if (localGenderAnalysis.female.activities.length > 0) {
            const diffs = localGenderAnalysis.female.activities.map((a) =>
              Math.abs((a.avg_score_girls || 0) - (a.avg_score_boys || 0))
            )
            localGenderAnalysis.female.avgDiff = diffs.reduce((sum, d) => sum + d, 0) / diffs.length
          }
          setGenderAnalysis(localGenderAnalysis)
        }

        // Analyse répartition F/G dans les classes
        const classData = await supabase
          .from("classes")
          .select("id, nb_students_girls, nb_students_boys")
          .eq("establishment_id", profileData.establishment_id)
          .not("nb_students_girls", "is", null)
          .not("nb_students_boys", "is", null)

        const localClassAnalysis = {
          girlMajority: { classes: [], avgDiff: 0 },
          boyMajority: { classes: [], avgDiff: 0 },
          balanced: { classes: [], avgDiff: 0 },
        }

        if (classData.data) {
          classData.data.forEach((classe) => {
            const girls = classe.nb_students_girls || 0
            const boys = classe.nb_students_boys || 0
            const total = girls + boys
            if (total === 0) return

            const girlsPercent = (girls / total) * 100

            let category
            if (girlsPercent > 60) category = "girlMajority"
            else if (girlsPercent < 40) category = "boyMajority"
            else category = "balanced"

            const classActivities = filteredActivities.filter(
              (a) => a.teacher_classes?.class_id === classe.id
            )

            classActivities.forEach((a) => {
              localClassAnalysis[category].classes.push({
                ...classe,
                activity: a,
                diff: Math.abs((a.avg_score_girls || 0) - (a.avg_score_boys || 0)),
              })
            })
          })

          // Calculer moyennes
          Object.keys(localClassAnalysis).forEach((key) => {
            if (localClassAnalysis[key].classes.length > 0) {
              const avgDiff =
                localClassAnalysis[key].classes.reduce((sum, c) => sum + c.diff, 0) /
                localClassAnalysis[key].classes.length
              localClassAnalysis[key].avgDiff = avgDiff
            }
          })
          setClassAnalysis(localClassAnalysis)
        }
        // --- FIN ANALYSE SUPPLEMENTAIRE ---

      } else {
        setStats({
          totalActivities: 0,
          avgDiffGlobal: 0,
          cpCoverage: { covered: 0, total: 4, percentage: 0 },
          activitiesByCP: {},
          label: "Non calculé",
          labelColor: "text-gray-600",
          labelBg: "bg-gray-100",
        })
        setChartData([])
        setPieChartData([])
        setGenderAnalysis({
          male: { activities: [], avgDiff: 0 },
          female: { activities: [], avgDiff: 0 },
        })
        setClassAnalysis({
          girlMajority: { classes: [], avgDiff: 0 },
          boyMajority: { classes: [], avgDiff: 0 },
          balanced: { classes: [], avgDiff: 0 },
        })
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
              {profile?.establishments?.name} - Niveau Collège (CP1 à CP4)
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
                <div className="flex items-center justify-center">
                  <CardTitle className="text-center text-2xl">
                    Label Égalité - Année {schoolYear}
                  </CardTitle>
                  <LabelInfoModal />
                </div>
                <CardDescription className="text-center">
                  Niveau Collège (CP1 à CP4 - CP5 exclue)
                </CardDescription>
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
                        compétences propres du collège (CP1 à CP4).
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
                    Total établissement (CP5 exclue)
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
                    {stats.cpCoverage.percentage.toFixed(0)}% des CP travaillées (Collège)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bar Chart - Moyennes par CP */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Comparaison Filles/Garçons par CP</CardTitle>
                <CardDescription>
                  Moyennes comparées pour chaque compétence propre (CP1 à CP4)
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
                    Nombre d'activités par CP (CP5 exclue)
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

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Analyse par Compétence Propre</CardTitle>
                <CardDescription>
                  Écarts moyens Filles/Garçons par CP (Collège - CP1 à CP4)
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

                  {stats.cpCoverage.covered < 4 && (
                    <div className="border-2 border-dashed border-yellow-300 rounded-lg p-4 bg-yellow-50">
                      <div className="text-sm text-yellow-800">
                        <strong>CP non couvertes :</strong> Il manque{" "}
                        {4 - stats.cpCoverage.covered} CP pour une couverture
                        complète (Collège - CP1 à CP4).
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analyse par sexe du professeur */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Influence du sexe du professeur</CardTitle>
                <CardDescription>
                  Analyse comparative des écarts F/G selon le sexe de l'enseignant
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      Professeurs hommes
                    </h3>
                    <div className="text-4xl font-bold text-blue-600">
                      {genderAnalysis.male.avgDiff.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Écart moyen sur {genderAnalysis.male.activities.length} activité(s)
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-pink-50">
                    <h3 className="font-semibold text-pink-900 mb-3">
                      Professeures femmes
                    </h3>
                    <div className="text-4xl font-bold text-pink-600">
                      {genderAnalysis.female.avgDiff.toFixed(2)}
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Écart moyen sur {genderAnalysis.female.activities.length} activité(s)
                    </p>
                  </div>
                </div>
                {genderAnalysis.male.activities.length > 0 && genderAnalysis.female.activities.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Analyse :</strong>{" "}
                      {genderAnalysis.male.avgDiff < genderAnalysis.female.avgDiff
                        ? "Les professeurs hommes obtiennent des écarts légèrement plus faibles que les professeures femmes."
                        : genderAnalysis.male.avgDiff > genderAnalysis.female.avgDiff
                        ? "Les professeures femmes obtiennent des écarts légèrement plus faibles que les professeurs hommes."
                        : "Les écarts sont similaires entre professeurs hommes et femmes."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Analyse répartition F/G dans les classes */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Influence de la répartition Filles/Garçons</CardTitle>
                <CardDescription>
                  Impact de la composition des classes sur les écarts de moyennes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="border rounded-lg p-4 bg-pink-50">
                    <h3 className="font-semibold text-pink-900 mb-2 text-sm">
                      Majorité de filles ({">"}60%)
                    </h3>
                    <div className="text-3xl font-bold text-pink-600">
                      {classAnalysis.girlMajority.avgDiff.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {classAnalysis.girlMajority.classes.length} données
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-green-50">
                    <h3 className="font-semibold text-green-900 mb-2 text-sm">
                      Équilibrée (40-60%)
                    </h3>
                    <div className="text-3xl font-bold text-green-600">
                      {classAnalysis.balanced.avgDiff.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {classAnalysis.balanced.classes.length} données
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-blue-50">
                    <h3 className="font-semibold text-blue-900 mb-2 text-sm">
                      Majorité de garçons ({">"}60%)
                    </h3>
                    <div className="text-3xl font-bold text-blue-600">
                      {classAnalysis.boyMajority.avgDiff.toFixed(2)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {classAnalysis.boyMajority.classes.length} données
                    </p>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Analyse :</strong> Les classes équilibrées tendent à présenter
                    {classAnalysis.balanced.avgDiff < Math.min(classAnalysis.girlMajority.avgDiff, classAnalysis.boyMajority.avgDiff)
                      ? " les écarts les plus faibles"
                      : " des écarts comparables aux autres configurations"}.
                  </p>
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
