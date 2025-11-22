import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function EtablissementPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with establishment
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, establishments(*)")
    .eq("id", user.id)
    .single()

  if (!profile?.establishment_id) {
    redirect("/dashboard")
  }

  // Get levels
  const { data: levels } = await supabase
    .from("levels")
    .select("*")
    .eq("establishment_id", profile.establishment_id)
    .order("name")

  // Get classes
  const { data: classes } = await supabase
    .from("classes")
    .select("*, levels(*)")
    .eq("establishment_id", profile.establishment_id)
    .order("name")

  // Get CP
  const { data: cps } = await supabase.from("cp").select("*").order("code")

  // Get APSA
  const { data: apsas } = await supabase
    .from("apsa")
    .select("*, cp(*)")
    .eq("establishment_id", profile.establishment_id)
    .order("name")

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Établissement
          </h1>
          <p className="text-gray-600">
            {profile.establishments?.name}
          </p>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="levels">Niveaux</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="apsa">APSA</TabsTrigger>
          </TabsList>

          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'établissement</CardTitle>
                <CardDescription>
                  Détails et configuration de l'établissement
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Nom de l'établissement
                  </div>
                  <div className="text-lg font-semibold">
                    {profile.establishments?.name}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Code établissement
                  </div>
                  <div className="text-lg font-mono font-semibold text-blue-600">
                    {profile.establishments?.identification_code}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Partagez ce code avec vos collègues
                  </p>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Nombre maximum de professeurs
                  </div>
                  <div className="text-lg font-semibold">
                    {profile.establishments?.max_teachers}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Effectifs totaux
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total:</span>{" "}
                      {profile.establishments?.nb_students_total || "Non renseigné"}
                    </div>
                    <div>
                      <span className="font-medium">Filles:</span>{" "}
                      {profile.establishments?.nb_students_girls || "Non renseigné"}
                    </div>
                    <div>
                      <span className="font-medium">Garçons:</span>{" "}
                      {profile.establishments?.nb_students_boys || "Non renseigné"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="levels">
            <Card>
              <CardHeader>
                <CardTitle>Niveaux</CardTitle>
                <CardDescription>
                  Liste des niveaux de l'établissement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {levels && levels.length > 0 ? (
                  <div className="space-y-2">
                    {levels.map((level) => (
                      <div
                        key={level.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-semibold">{level.name}</div>
                          <div className="text-sm text-gray-500">
                            {level.nb_classes || 0} classe(s)
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucun niveau configuré pour le moment.
                    <br />
                    <span className="text-sm">
                      Cette fonctionnalité sera disponible prochainement.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <CardTitle>Classes</CardTitle>
                <CardDescription>
                  Liste des classes de l'établissement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {classes && classes.length > 0 ? (
                  <div className="space-y-2">
                    {classes.map((classe) => (
                      <div
                        key={classe.id}
                        className="flex items-center justify-between p-3 border rounded-lg"
                      >
                        <div>
                          <div className="font-semibold">{classe.name}</div>
                          <div className="text-sm text-gray-500">
                            {classe.levels?.name}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {classe.nb_students_total || 0} élèves
                          {classe.nb_students_girls !== null &&
                            ` (${classe.nb_students_girls}F / ${classe.nb_students_boys}G)`}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune classe configurée pour le moment.
                    <br />
                    <span className="text-sm">
                      Cette fonctionnalité sera disponible prochainement.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="apsa">
            <Card>
              <CardHeader>
                <CardTitle>APSA (Activités Physiques Sportives et Artistiques)</CardTitle>
                <CardDescription>
                  Programmation commune des APSA de l'établissement
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apsas && apsas.length > 0 ? (
                  <div className="space-y-3">
                    {cps?.map((cp) => {
                      const cpApsas = apsas.filter((a) => a.cp_id === cp.id)
                      if (cpApsas.length === 0) return null

                      return (
                        <div key={cp.id} className="border rounded-lg p-4">
                          <div className="font-semibold text-blue-600 mb-2">
                            {cp.code} - {cp.label}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {cpApsas.map((apsa) => (
                              <div
                                key={apsa.id}
                                className="text-sm p-2 bg-gray-50 rounded border"
                              >
                                {apsa.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Aucune APSA configurée pour le moment.
                    <br />
                    <span className="text-sm">
                      Cette fonctionnalité sera disponible prochainement.
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
