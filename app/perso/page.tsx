import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function PersoPage() {
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

  // Get teacher's classes with class details
  const { data: teacherClasses } = await supabase
    .from("teacher_classes")
    .select(`
      id,
      classes (
        id,
        name,
        nb_students_total,
        nb_students_girls,
        nb_students_boys,
        levels (
          name
        )
      )
    `)
    .eq("teacher_id", user.id)

  // Get class activities for the teacher
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
        cp (
          code,
          label
        )
      )
    `)
    .eq("teacher_classes.teacher_id", user.id)

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Ma Page Personnelle
          </h1>
          <p className="text-gray-600">
            Gérez vos classes et votre programmation
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes Classes</CardTitle>
              <CardDescription>
                Classes dont vous avez la charge
              </CardDescription>
            </CardHeader>
            <CardContent>
              {teacherClasses && teacherClasses.length > 0 ? (
                <div className="space-y-3">
                  {teacherClasses.map((tc: any) => (
                    <div
                      key={tc.id}
                      className="flex items-center justify-between p-4 border rounded-lg bg-white hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className="font-semibold text-lg">
                          {tc.classes.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {tc.classes.levels?.name}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {tc.classes.nb_students_total || 0} élèves
                        </div>
                        {tc.classes.nb_students_girls !== null && (
                          <div className="text-sm text-gray-500">
                            {tc.classes.nb_students_girls} F /{" "}
                            {tc.classes.nb_students_boys} G
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">Vous n'avez pas encore de classes attribuées.</p>
                  <p className="text-sm">
                    Cette fonctionnalité sera disponible prochainement pour ajouter des classes.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Mes Activités / Programmation</CardTitle>
              <CardDescription>
                APSA travaillées avec mes classes et moyennes de notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {activities && activities.length > 0 ? (
                <div className="space-y-4">
                  {activities.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="border rounded-lg p-4 bg-white"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="font-semibold text-lg">
                            {activity.apsa?.name}
                          </div>
                          <div className="text-sm text-blue-600">
                            {activity.apsa?.cp?.code} - {activity.apsa?.cp?.label}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            Classe: {activity.teacher_classes?.classes?.name}
                          </div>
                        </div>
                        {activity.period && (
                          <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                            {activity.period}
                          </div>
                        )}
                      </div>

                      {activity.avg_score_total && (
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">
                              Moyenne générale
                            </div>
                            <div className="text-2xl font-bold text-blue-600">
                              {activity.avg_score_total}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">
                              Moyenne Filles
                            </div>
                            <div className="text-2xl font-bold text-pink-600">
                              {activity.avg_score_girls || "-"}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-sm text-gray-500 mb-1">
                              Moyenne Garçons
                            </div>
                            <div className="text-2xl font-bold text-blue-700">
                              {activity.avg_score_boys || "-"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p className="mb-2">Aucune activité programmée pour le moment.</p>
                  <p className="text-sm">
                    Cette fonctionnalité sera disponible prochainement pour ajouter des activités.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
