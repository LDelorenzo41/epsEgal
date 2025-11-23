// @ts-nocheck
"use client"


import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/components/ui/use-toast"
import { Plus, Pencil, Trash2 } from "lucide-react"

interface Profile {
  id: string
  establishment_id: string | null
  establishments?: {
    id: string
    name: string
    identification_code: string
    max_teachers: number
    nb_students_total: number | null
    nb_students_girls: number | null
    nb_students_boys: number | null
  }
}

interface Level {
  id: string
  establishment_id: string
  name: string
  nb_classes: number | null
}

interface Class {
  id: string
  establishment_id: string
  level_id: string
  name: string
  nb_students_total: number | null
  nb_students_girls: number | null
  nb_students_boys: number | null
  levels?: {
    name: string
  }
}

interface CP {
  id: string
  code: string
  label: string
}

interface APSA {
  id: string
  establishment_id: string
  cp_id: string
  name: string
  description: string | null
  cp?: {
    code: string
    label: string
  }
}

export default function EtablissementPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [levels, setLevels] = useState<Level[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [cps, setCps] = useState<CP[]>([])
  const [apsas, setApsas] = useState<APSA[]>([])
  const [loading, setLoading] = useState(true)

  // Forms state
  const [showLevelForm, setShowLevelForm] = useState(false)
  const [showClassForm, setShowClassForm] = useState(false)
  const [showApsaForm, setShowApsaForm] = useState(false)

  const [levelForm, setLevelForm] = useState({ id: "", name: "", nb_classes: "" })
  const [classForm, setClassForm] = useState({
    id: "",
    level_id: "",
    name: "",
    nb_students_total: "",
    nb_students_girls: "",
    nb_students_boys: "",
  })
  const [apsaForm, setApsaForm] = useState({
    id: "",
    cp_id: "",
    name: "",
    description: "",
  })

  const supabase = createClient()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/auth/login")
        return
      }

      // Get profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*, establishments(*)")
        .eq("id", user.id)
        .single()

      // @ts-ignore
      if (!profileData?.establishment_id) {
        router.push("/dashboard")
        return
      }

      // @ts-ignore
      setProfile(profileData)

      // Get levels
      const { data: levelsData } = await supabase
        .from("levels")
        .select("*")
        // @ts-ignore
        .eq("establishment_id", profileData.establishment_id)
        .order("name")

      // @ts-ignore
      setLevels(levelsData || [])

      // Get classes
      const { data: classesData } = await supabase
        .from("classes")
        .select("*, levels(*)")
        // @ts-ignore
        .eq("establishment_id", profileData.establishment_id)
        .order("name")

      // @ts-ignore
      setClasses(classesData || [])

      // Get CP
      const { data: cpsData } = await supabase.from("cp").select("*").order("code")
      // @ts-ignore
      setCps(cpsData || [])

      // Get APSA
      const { data: apsasData } = await supabase
        .from("apsa")
        .select("*, cp(*)")
        // @ts-ignore
        .eq("establishment_id", profileData.establishment_id)
        .order("name")

      // @ts-ignore
      setApsas(apsasData || [])
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  // LEVELS
  const handleSaveLevel = async () => {
    if (!levelForm.name || !profile?.establishment_id) return

    try {
      // @ts-ignore
      const data = {
        establishment_id: profile.establishment_id,
        name: levelForm.name,
        nb_classes: levelForm.nb_classes ? parseInt(levelForm.nb_classes) : null,
      }

      if (levelForm.id) {
        // Update
        // @ts-ignore
        const { error } = await supabase
          .from("levels")
          .update(data)
          .eq("id", levelForm.id)

        if (error) throw error
        toast({ title: "Niveau modifié avec succès" })
      } else {
        // Insert
        // @ts-ignore
        const { error } = await supabase.from("levels").insert(data)

        if (error) throw error
        toast({ title: "Niveau ajouté avec succès" })
      }

      setShowLevelForm(false)
      setLevelForm({ id: "", name: "", nb_classes: "" })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    }
  }

  const handleDeleteLevel = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce niveau ?")) return

    try {
      const { error } = await supabase.from("levels").delete().eq("id", id)

      if (error) throw error

      toast({ title: "Niveau supprimé avec succès" })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    }
  }

  // CLASSES
  const handleSaveClass = async () => {
    if (!classForm.level_id || !classForm.name || !profile?.establishment_id) return

    try {
      // @ts-ignore
      const data = {
        establishment_id: profile.establishment_id,
        level_id: classForm.level_id,
        name: classForm.name,
        nb_students_total: classForm.nb_students_total
          ? parseInt(classForm.nb_students_total)
          : null,
        nb_students_girls: classForm.nb_students_girls
          ? parseInt(classForm.nb_students_girls)
          : null,
        nb_students_boys: classForm.nb_students_boys
          ? parseInt(classForm.nb_students_boys)
          : null,
      }

      if (classForm.id) {
        // Update
        // @ts-ignore
        const { error } = await supabase
          .from("classes")
          .update(data)
          .eq("id", classForm.id)

        if (error) throw error
        toast({ title: "Classe modifiée avec succès" })
      } else {
        // Insert
        // @ts-ignore
        const { error } = await supabase.from("classes").insert(data)

        if (error) throw error
        toast({ title: "Classe ajoutée avec succès" })
      }

      setShowClassForm(false)
      setClassForm({
        id: "",
        level_id: "",
        name: "",
        nb_students_total: "",
        nb_students_girls: "",
        nb_students_boys: "",
      })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    }
  }

  const handleDeleteClass = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette classe ?")) return

    try {
      const { error } = await supabase.from("classes").delete().eq("id", id)

      if (error) throw error

      toast({ title: "Classe supprimée avec succès" })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    }
  }

  // APSA
  const handleSaveApsa = async () => {
    if (!apsaForm.cp_id || !apsaForm.name || !profile?.establishment_id) return

    try {
      // @ts-ignore
      const data = {
        establishment_id: profile.establishment_id,
        cp_id: apsaForm.cp_id,
        name: apsaForm.name,
        description: apsaForm.description || null,
      }

      if (apsaForm.id) {
        // Update
        // @ts-ignore
        const { error } = await supabase.from("apsa").update(data).eq("id", apsaForm.id)

        if (error) throw error
        toast({ title: "APSA modifiée avec succès" })
      } else {
        // Insert
        // @ts-ignore
        const { error } = await supabase.from("apsa").insert(data)

        if (error) throw error
        toast({ title: "APSA ajoutée avec succès" })
      }

      setShowApsaForm(false)
      setApsaForm({ id: "", cp_id: "", name: "", description: "" })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
    }
  }

  const handleDeleteApsa = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette APSA ?")) return

    try {
      const { error } = await supabase.from("apsa").delete().eq("id", id)

      if (error) throw error

      toast({ title: "APSA supprimée avec succès" })
      loadData()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      })
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Établissement</h1>
          <p className="text-gray-600">{profile?.establishments?.name}</p>
        </div>

        <Tabs defaultValue="info" className="space-y-4">
          <TabsList>
            <TabsTrigger value="info">Informations</TabsTrigger>
            <TabsTrigger value="levels">Niveaux</TabsTrigger>
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="apsa">APSA</TabsTrigger>
          </TabsList>

          {/* INFORMATIONS */}
          <TabsContent value="info">
            <Card>
              <CardHeader>
                <CardTitle>Informations de l'établissement</CardTitle>
                <CardDescription>Détails et configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Nom de l'établissement
                  </div>
                  <div className="text-lg font-semibold">
                    {profile?.establishments?.name}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">
                    Code établissement
                  </div>
                  <div className="text-lg font-mono font-semibold text-blue-600">
                    {profile?.establishments?.identification_code}
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
                    {profile?.establishments?.max_teachers}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* NIVEAUX */}
          <TabsContent value="levels">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Niveaux</CardTitle>
                    <CardDescription>Gérer les niveaux de l'établissement</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setLevelForm({ id: "", name: "", nb_classes: "" })
                      setShowLevelForm(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un niveau
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showLevelForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold mb-4">
                      {levelForm.id ? "Modifier" : "Ajouter"} un niveau
                    </h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="level-name">Nom du niveau *</Label>
                        <Input
                          id="level-name"
                          placeholder="Ex: 6e, 5e, 2nde..."
                          value={levelForm.name}
                          onChange={(e) =>
                            setLevelForm({ ...levelForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="level-nb">Nombre de classes (optionnel)</Label>
                        <Input
                          id="level-nb"
                          type="number"
                          placeholder="Ex: 4"
                          value={levelForm.nb_classes}
                          onChange={(e) =>
                            setLevelForm({ ...levelForm, nb_classes: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveLevel}>
                          {levelForm.id ? "Modifier" : "Ajouter"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowLevelForm(false)
                            setLevelForm({ id: "", name: "", nb_classes: "" })
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {levels.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Nombre de classes</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {levels.map((level) => (
                        <TableRow key={level.id}>
                          <TableCell className="font-medium">{level.name}</TableCell>
                          <TableCell>{level.nb_classes || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setLevelForm({
                                    id: level.id,
                                    name: level.name,
                                    nb_classes: level.nb_classes?.toString() || "",
                                  })
                                  setShowLevelForm(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteLevel(level.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucun niveau configuré. Cliquez sur "Ajouter un niveau" pour commencer.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* CLASSES */}
          <TabsContent value="classes">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Classes</CardTitle>
                    <CardDescription>Gérer les classes de l'établissement</CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setClassForm({
                        id: "",
                        level_id: "",
                        name: "",
                        nb_students_total: "",
                        nb_students_girls: "",
                        nb_students_boys: "",
                      })
                      setShowClassForm(true)
                    }}
                    disabled={levels.length === 0}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une classe
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {levels.length === 0 && (
                  <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                    Vous devez d'abord créer des niveaux avant de pouvoir ajouter des classes.
                  </div>
                )}

                {showClassForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold mb-4">
                      {classForm.id ? "Modifier" : "Ajouter"} une classe
                    </h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="class-level">Niveau *</Label>
                        <Select
                          value={classForm.level_id}
                          onValueChange={(value) =>
                            setClassForm({ ...classForm, level_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un niveau" />
                          </SelectTrigger>
                          <SelectContent>
                            {levels.map((level) => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="class-name">Nom de la classe *</Label>
                        <Input
                          id="class-name"
                          placeholder="Ex: 6e1, 3eC..."
                          value={classForm.name}
                          onChange={(e) =>
                            setClassForm({ ...classForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="class-total">Total élèves</Label>
                          <Input
                            id="class-total"
                            type="number"
                            value={classForm.nb_students_total}
                            onChange={(e) =>
                              setClassForm({
                                ...classForm,
                                nb_students_total: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="class-girls">Filles</Label>
                          <Input
                            id="class-girls"
                            type="number"
                            value={classForm.nb_students_girls}
                            onChange={(e) =>
                              setClassForm({
                                ...classForm,
                                nb_students_girls: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <Label htmlFor="class-boys">Garçons</Label>
                          <Input
                            id="class-boys"
                            type="number"
                            value={classForm.nb_students_boys}
                            onChange={(e) =>
                              setClassForm({
                                ...classForm,
                                nb_students_boys: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveClass}>
                          {classForm.id ? "Modifier" : "Ajouter"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowClassForm(false)
                            setClassForm({
                              id: "",
                              level_id: "",
                              name: "",
                              nb_students_total: "",
                              nb_students_girls: "",
                              nb_students_boys: "",
                            })
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {classes.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Niveau</TableHead>
                        <TableHead>Effectif total</TableHead>
                        <TableHead>Filles</TableHead>
                        <TableHead>Garçons</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {classes.map((classe) => (
                        <TableRow key={classe.id}>
                          <TableCell className="font-medium">{classe.name}</TableCell>
                          <TableCell>{classe.levels?.name}</TableCell>
                          <TableCell>{classe.nb_students_total || "-"}</TableCell>
                          <TableCell>{classe.nb_students_girls || "-"}</TableCell>
                          <TableCell>{classe.nb_students_boys || "-"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex gap-2 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setClassForm({
                                    id: classe.id,
                                    level_id: classe.level_id,
                                    name: classe.name,
                                    nb_students_total:
                                      classe.nb_students_total?.toString() || "",
                                    nb_students_girls:
                                      classe.nb_students_girls?.toString() || "",
                                    nb_students_boys:
                                      classe.nb_students_boys?.toString() || "",
                                  })
                                  setShowClassForm(true)
                                }}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteClass(classe.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucune classe configurée. Cliquez sur "Ajouter une classe" pour commencer.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* APSA */}
          <TabsContent value="apsa">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>APSA</CardTitle>
                    <CardDescription>
                      Activités Physiques Sportives et Artistiques
                    </CardDescription>
                  </div>
                  <Button
                    onClick={() => {
                      setApsaForm({ id: "", cp_id: "", name: "", description: "" })
                      setShowApsaForm(true)
                    }}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une APSA
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showApsaForm && (
                  <div className="mb-6 p-4 border rounded-lg bg-blue-50">
                    <h3 className="font-semibold mb-4">
                      {apsaForm.id ? "Modifier" : "Ajouter"} une APSA
                    </h3>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="apsa-cp">Compétence Propre *</Label>
                        <Select
                          value={apsaForm.cp_id}
                          onValueChange={(value) =>
                            setApsaForm({ ...apsaForm, cp_id: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une CP" />
                          </SelectTrigger>
                          <SelectContent>
                            {cps.map((cp) => (
                              <SelectItem key={cp.id} value={cp.id}>
                                {cp.code} - {cp.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="apsa-name">Nom de l'APSA *</Label>
                        <Input
                          id="apsa-name"
                          placeholder="Ex: Badminton, Demi-fond..."
                          value={apsaForm.name}
                          onChange={(e) =>
                            setApsaForm({ ...apsaForm, name: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="apsa-desc">Description (optionnel)</Label>
                        <Input
                          id="apsa-desc"
                          placeholder="Description de l'activité"
                          value={apsaForm.description}
                          onChange={(e) =>
                            setApsaForm({ ...apsaForm, description: e.target.value })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveApsa}>
                          {apsaForm.id ? "Modifier" : "Ajouter"}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowApsaForm(false)
                            setApsaForm({ id: "", cp_id: "", name: "", description: "" })
                          }}
                        >
                          Annuler
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {apsas.length > 0 ? (
                  <div className="space-y-3">
                    {cps.map((cp) => {
                      const cpApsas = apsas.filter((a) => a.cp_id === cp.id)
                      if (cpApsas.length === 0) return null

                      return (
                        <div key={cp.id} className="border rounded-lg p-4">
                          <div className="font-semibold text-blue-600 mb-3">
                            {cp.code} - {cp.label}
                          </div>
                          <div className="grid gap-2">
                            {cpApsas.map((apsa) => (
                              <div
                                key={apsa.id}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                              >
                                <div>
                                  <div className="font-medium">{apsa.name}</div>
                                  {apsa.description && (
                                    <div className="text-sm text-gray-500">
                                      {apsa.description}
                                    </div>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setApsaForm({
                                        id: apsa.id,
                                        cp_id: apsa.cp_id,
                                        name: apsa.name,
                                        description: apsa.description || "",
                                      })
                                      setShowApsaForm(true)
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleDeleteApsa(apsa.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Aucune APSA configurée. Cliquez sur "Ajouter une APSA" pour commencer.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
