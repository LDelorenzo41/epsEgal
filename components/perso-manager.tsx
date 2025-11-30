// @ts-nocheck
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Plus, Pencil, Trash2 } from "lucide-react"

type Class = {
  id: string
  name: string
  level_id: string
  nb_students_total: number | null
  nb_students_girls: number | null
  nb_students_boys: number | null
  levels?: { name: string }
}

type TeacherClass = {
  id: string
  teacher_id: string
  class_id: string
  classes?: Class
}

type APSA = {
  id: string
  name: string
  cp_id: string
  cp?: {
    code: string
    label: string
  }
}

type ClassActivity = {
  id: string
  teacher_class_id: string
  apsa_id: string
  period: string | null
  school_year: string | null
  avg_score_total: number | null
  avg_score_girls: number | null
  avg_score_boys: number | null
  teacher_classes?: {
    classes?: {
      name: string
    }
  }
  apsa?: APSA
}

type Props = {
  teacherId: string
  initialTeacherClasses: TeacherClass[]
  initialActivities: ClassActivity[]
  availableClasses: Class[]
  availableApsas: APSA[]
}

const PERIOD_OPTIONS = [
  { value: "Trimestre 1", label: "Trimestre 1" },
  { value: "Trimestre 2", label: "Trimestre 2" },
  { value: "Trimestre 3", label: "Trimestre 3" },
  { value: "Semestre 1", label: "Semestre 1" },
  { value: "Semestre 2", label: "Semestre 2" },
]

export function PersoManager({
  teacherId,
  initialTeacherClasses,
  initialActivities,
  availableClasses,
  availableApsas,
}: Props) {
  const { toast } = useToast()
  const supabase = createClient()

  // Teacher Classes state
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>(initialTeacherClasses)
  const [showClassForm, setShowClassForm] = useState(false)
  const [selectedClassId, setSelectedClassId] = useState("")

  // Activities state
  const [activities, setActivities] = useState<ClassActivity[]>(initialActivities)
  const [showActivityForm, setShowActivityForm] = useState(false)
  const [activityForm, setActivityForm] = useState({
    id: "",
    teacher_class_id: "",
    apsa_id: "",
    period: "",
    school_year: "2025-26",
    avg_score_total: "",
    avg_score_girls: "",
    avg_score_boys: "",
  })

  // ===== TEACHER CLASSES CRUD =====

  const handleAddClass = async () => {
    if (!selectedClassId) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez sélectionner une classe",
      })
      return
    }

    // Check if already assigned
    if (teacherClasses.some((tc) => tc.class_id === selectedClassId)) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Cette classe vous est déjà attribuée",
      })
      return
    }

    const data = {
      teacher_id: teacherId,
      class_id: selectedClassId,
    }

    const { data: newTeacherClass, error } = await supabase
      .from("teacher_classes")
      .insert(data)
      .select(`
        id,
        teacher_id,
        class_id,
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
      .single()

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible d'ajouter la classe",
      })
      return
    }

    setTeacherClasses([...teacherClasses, newTeacherClass])
    toast({ title: "Classe ajoutée avec succès" })
    setShowClassForm(false)
    setSelectedClassId("")
  }

  const handleRemoveClass = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cette classe ?")) return

    const { error } = await supabase.from("teacher_classes").delete().eq("id", id)

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de retirer la classe",
      })
      return
    }

    setTeacherClasses(teacherClasses.filter((tc) => tc.id !== id))
    toast({ title: "Classe retirée avec succès" })
  }

  // ===== ACTIVITIES CRUD =====

  const handleSaveActivity = async () => {
    if (!activityForm.teacher_class_id || !activityForm.apsa_id) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "La classe et l'APSA sont requises",
      })
      return
    }

    const data = {
      teacher_class_id: activityForm.teacher_class_id,
      apsa_id: activityForm.apsa_id,
      period: activityForm.period || null,
      school_year: activityForm.school_year || "2025-26",
      avg_score_total: activityForm.avg_score_total
        ? parseFloat(activityForm.avg_score_total)
        : null,
      avg_score_girls: activityForm.avg_score_girls
        ? parseFloat(activityForm.avg_score_girls)
        : null,
      avg_score_boys: activityForm.avg_score_boys
        ? parseFloat(activityForm.avg_score_boys)
        : null,
    }

    if (activityForm.id) {
      // Update
      const { error } = await supabase
        .from("class_activities")
        .update(data)
        .eq("id", activityForm.id)

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de modifier l'activité",
        })
        return
      }

      // Reload activities to get updated data with relations
      const { data: updatedActivities } = await supabase
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
        .eq("teacher_classes.teacher_id", teacherId)

      setActivities(updatedActivities || [])
      toast({ title: "Activité modifiée avec succès" })
    } else {
      // Insert
      const { data: newActivity, error } = await supabase
        .from("class_activities")
        .insert(data)
        .select(`
          *,
          teacher_classes (
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
        .single()

      if (error) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de créer l'activité",
        })
        return
      }

      setActivities([...activities, newActivity])
      toast({ title: "Activité créée avec succès" })
    }

    setShowActivityForm(false)
    setActivityForm({
      id: "",
      teacher_class_id: "",
      apsa_id: "",
      period: "",
      school_year: "2025-26",
      avg_score_total: "",
      avg_score_girls: "",
      avg_score_boys: "",
    })
  }

  const handleEditActivity = (activity: ClassActivity) => {
    setActivityForm({
      id: activity.id,
      teacher_class_id: activity.teacher_class_id,
      apsa_id: activity.apsa_id,
      period: activity.period || "",
      school_year: activity.school_year || "2025-26",
      avg_score_total: activity.avg_score_total?.toString() || "",
      avg_score_girls: activity.avg_score_girls?.toString() || "",
      avg_score_boys: activity.avg_score_boys?.toString() || "",
    })
    setShowActivityForm(true)
  }

  const handleDeleteActivity = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette activité ?")) return

    const { error } = await supabase.from("class_activities").delete().eq("id", id)

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer l'activité",
      })
      return
    }

    setActivities(activities.filter((a) => a.id !== id))
    toast({ title: "Activité supprimée avec succès" })
  }

  const handleCancelActivity = () => {
    setShowActivityForm(false)
    setActivityForm({
      id: "",
      teacher_class_id: "",
      apsa_id: "",
      period: "",
      school_year: "2025-26",
      avg_score_total: "",
      avg_score_girls: "",
      avg_score_boys: "",
    })
  }

  // Get classes not yet assigned to teacher
  const unassignedClasses = availableClasses.filter(
    (c) => !teacherClasses.some((tc) => tc.class_id === c.id)
  )

  return (
    <div className="space-y-8">
      {/* TEACHER CLASSES */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mes Classes</CardTitle>
              <CardDescription>Classes dont vous avez la charge</CardDescription>
            </div>
            <Button
              onClick={() => setShowClassForm(true)}
              disabled={unassignedClasses.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une classe
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {showClassForm && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="class-select">Sélectionner une classe *</Label>
                  <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                    <SelectTrigger id="class-select">
                      <SelectValue placeholder="Choisir une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {unassignedClasses.map((classe) => (
                        <SelectItem key={classe.id} value={classe.id}>
                          {classe.name} - {classe.levels?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAddClass}>Ajouter</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowClassForm(false)
                      setSelectedClassId("")
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          {teacherClasses.length > 0 ? (
            <div className="space-y-2">
              {teacherClasses.map((tc) => (
                <div
                  key={tc.id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white"
                >
                  <div>
                    <div className="font-semibold text-lg">{tc.classes?.name}</div>
                    <div className="text-sm text-gray-500">{tc.classes?.levels?.name}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-medium">
                        {tc.classes?.nb_students_total || 0} élèves
                      </div>
                      {tc.classes?.nb_students_girls !== null && (
                        <div className="text-sm text-gray-500">
                          {tc.classes?.nb_students_girls} F / {tc.classes?.nb_students_boys} G
                        </div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRemoveClass(tc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              Aucune classe attribuée. Cliquez sur "Ajouter une classe" pour commencer.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACTIVITIES */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Mes Activités / Programmation</CardTitle>
              <CardDescription>
                APSA travaillées avec mes classes et moyennes de notes
              </CardDescription>
            </div>
            <Button
              onClick={() => {
                setActivityForm({
                  id: "",
                  teacher_class_id: "",
                  apsa_id: "",
                  period: "",
                  school_year: "2025-26",
                  avg_score_total: "",
                  avg_score_girls: "",
                  avg_score_boys: "",
                })
                setShowActivityForm(true)
              }}
              disabled={teacherClasses.length === 0}
            >
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une activité
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {teacherClasses.length === 0 && (
            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
              Vous devez d'abord vous attribuer des classes avant de pouvoir ajouter des activités.
            </div>
          )}

          {showActivityForm && (
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-4">
                {activityForm.id ? "Modifier" : "Ajouter"} une activité
              </h3>
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activity-class">Classe *</Label>
                    <Select
                      value={activityForm.teacher_class_id}
                      onValueChange={(value) =>
                        setActivityForm({ ...activityForm, teacher_class_id: value })
                      }
                    >
                      <SelectTrigger id="activity-class">
                        <SelectValue placeholder="Sélectionner une classe" />
                      </SelectTrigger>
                      <SelectContent>
                        {teacherClasses.map((tc) => (
                          <SelectItem key={tc.id} value={tc.id}>
                            {tc.classes?.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="activity-apsa">APSA *</Label>
                    <Select
                      value={activityForm.apsa_id}
                      onValueChange={(value) =>
                        setActivityForm({ ...activityForm, apsa_id: value })
                      }
                    >
                      <SelectTrigger id="activity-apsa">
                        <SelectValue placeholder="Sélectionner une APSA" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableApsas.map((apsa) => (
                          <SelectItem key={apsa.id} value={apsa.id}>
                            {apsa.name} ({apsa.cp?.code})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="activity-period">Période</Label>
                    <Select
                      value={activityForm.period}
                      onValueChange={(value) =>
                        setActivityForm({ ...activityForm, period: value })
                      }
                    >
                      <SelectTrigger id="activity-period">
                        <SelectValue placeholder="Sélectionner une période" />
                      </SelectTrigger>
                      <SelectContent>
                        {PERIOD_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="activity-year">Année scolaire</Label>
                    <Select
                      value={activityForm.school_year}
                      onValueChange={(value) =>
                        setActivityForm({ ...activityForm, school_year: value })
                      }
                    >
                      <SelectTrigger id="activity-year">
                        <SelectValue placeholder="Sélectionner l'année" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2023-24">2023-24</SelectItem>
                        <SelectItem value="2024-25">2024-25</SelectItem>
                        <SelectItem value="2025-26">2025-26 (actuelle)</SelectItem>
                        <SelectItem value="2026-27">2026-27</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="avg-total">Moyenne générale</Label>
                    <Input
                      id="avg-total"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={activityForm.avg_score_total}
                      onChange={(e) =>
                        setActivityForm({ ...activityForm, avg_score_total: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="avg-girls">Moyenne Filles</Label>
                    <Input
                      id="avg-girls"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={activityForm.avg_score_girls}
                      onChange={(e) =>
                        setActivityForm({ ...activityForm, avg_score_girls: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="avg-boys">Moyenne Garçons</Label>
                    <Input
                      id="avg-boys"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={activityForm.avg_score_boys}
                      onChange={(e) =>
                        setActivityForm({ ...activityForm, avg_score_boys: e.target.value })
                      }
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSaveActivity}>
                    {activityForm.id ? "Modifier" : "Ajouter"}
                  </Button>
                  <Button variant="outline" onClick={handleCancelActivity}>
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activities.length > 0 ? (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div key={activity.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-lg">{activity.apsa?.name}</div>
                      <div className="text-sm text-blue-600">
                        {activity.apsa?.cp?.code} - {activity.apsa?.cp?.label}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Classe: {activity.teacher_classes?.classes?.name}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {activity.period && (
                        <div className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded">
                          {activity.period}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditActivity(activity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteActivity(activity.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {(activity.avg_score_total ||
                    activity.avg_score_girls ||
                    activity.avg_score_boys) && (
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Moyenne générale</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {activity.avg_score_total || "-"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Moyenne Filles</div>
                        <div className="text-2xl font-bold text-pink-600">
                          {activity.avg_score_girls || "-"}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500 mb-1">Moyenne Garçons</div>
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
            <div className="text-center py-8 text-gray-500">
              Aucune activité programmée. Cliquez sur "Ajouter une activité" pour commencer.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
