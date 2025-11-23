// @ts-nocheck
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { NavBar } from "@/components/nav-bar"
import { PersoManager } from "@/components/perso-manager"

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

  // Get all available classes from the establishment
  const { data: availableClasses } = await supabase
    .from("classes")
    .select(`
      id,
      name,
      nb_students_total,
      nb_students_girls,
      nb_students_boys,
      levels (
        name
      )
    `)
    .eq("establishment_id", profile.establishment_id)
    .order("name")

  // Get all available APSA from the establishment
  const { data: availableApsas } = await supabase
    .from("apsa")
    .select(`
      id,
      name,
      cp (
        id,
        code,
        label
      )
    `)
    .eq("establishment_id", profile.establishment_id)
    .order("name")

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

        <PersoManager
          teacherId={user.id}
          initialTeacherClasses={teacherClasses || []}
          initialActivities={activities || []}
          availableClasses={availableClasses || []}
          availableApsas={availableApsas || []}
        />
      </main>
    </div>
  )
}
