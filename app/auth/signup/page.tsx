// @ts-nocheck
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Info } from "lucide-react"

export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    establishmentName: "",
    establishmentType: "",
    maxTeachers: "10",
    gender: "",
  })

  const [joinForm, setJoinForm] = useState({
    email: "",
    password: "",
    fullName: "",
    code: "",
    gender: "",
  })

  const handleCreateEstablishment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!createForm.gender) {
        throw new Error("Veuillez sélectionner votre sexe")
      }

      if (!createForm.establishmentType) {
        throw new Error("Veuillez sélectionner le type d'établissement")
      }

      // 1. Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Échec de la création du compte")

      // 2. Generate unique code
      const identificationCode = Math.random().toString(36).substring(2, 10).toUpperCase()

      // 3. Create establishment
      const { data: establishment, error: estError } = await supabase
        .from("establishments")
        .insert({
          name: createForm.establishmentName,
          identification_code: identificationCode,
          max_teachers: parseInt(createForm.maxTeachers),
          type: createForm.establishmentType,
        })
        .select()
        .single()

      if (estError) throw estError

      // 4. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: createForm.fullName,
        role: "teacher",
        establishment_id: establishment.id,
        gender: createForm.gender,
      })

      if (profileError) throw profileError

      router.push("/dashboard")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEstablishment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!joinForm.gender) {
        throw new Error("Veuillez sélectionner votre sexe")
      }

      // 1. Check if establishment exists
      const { data: establishment, error: estError } = await supabase
        .from("establishments")
        .select("id, max_teachers")
        .eq("identification_code", joinForm.code)
        .single()

      if (estError || !establishment) {
        throw new Error("Code établissement invalide")
      }

      // 2. Check if max teachers not reached
      const { count, error: countError } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("establishment_id", establishment.id)

      if (countError) throw countError

      if (count && count >= establishment.max_teachers) {
        throw new Error("Nombre maximum de professeurs atteint pour cet établissement")
      }

      // 3. Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: joinForm.email,
        password: joinForm.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Échec de la création du compte")

      // 4. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: joinForm.fullName,
        role: "teacher",
        establishment_id: establishment.id,
        gender: joinForm.gender,
      })

      if (profileError) throw profileError

      router.push("/dashboard")
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-blue-900">
            EPS Égalité
          </CardTitle>
          <CardDescription>
            Créez votre compte pour suivre l'égalité filles-garçons en EPS
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Créer un établissement</TabsTrigger>
              <TabsTrigger value="join">Rejoindre un établissement</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <form onSubmit={handleCreateEstablishment} className="space-y-4">
                <div>
                  <Label htmlFor="create-name">Nom complet *</Label>
                  <Input
                    id="create-name"
                    required
                    value={createForm.fullName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="create-gender">Sexe *</Label>
                  <Select
                    value={createForm.gender}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, gender: value })
                    }
                  >
                    <SelectTrigger id="create-gender">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                      <SelectItem value="prefer_not_to_say">Préfère ne pas répondre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="create-email">Email *</Label>
                  <Input
                    id="create-email"
                    type="email"
                    required
                    value={createForm.email}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="create-password">Mot de passe *</Label>
                  <Input
                    id="create-password"
                    type="password"
                    required
                    minLength={6}
                    value={createForm.password}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, password: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="create-establishment">Nom de l'établissement *</Label>
                  <Input
                    id="create-establishment"
                    required
                    placeholder="Ex: Collège Victor Hugo"
                    value={createForm.establishmentName}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, establishmentName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="create-type">Type d'établissement *</Label>
                  <Select
                    value={createForm.establishmentType}
                    onValueChange={(value) =>
                      setCreateForm({ ...createForm, establishmentType: value })
                    }
                  >
                    <SelectTrigger id="create-type">
                      <SelectValue placeholder="Sélectionner le type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="college">Collège</SelectItem>
                      <SelectItem value="lycee_gt">Lycée Général et Technologique</SelectItem>
                      <SelectItem value="lycee_pro">Lycée Professionnel</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-start gap-2 mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                    <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Collège :</strong> CP1 à CP4 (CP5 exclue du Label)<br />
                      <strong>Lycée :</strong> CP1 à CP5 (toutes les CP incluses)
                    </span>
                  </div>
                </div>

                <div>
                  <Label htmlFor="create-max">Nombre maximum de professeurs *</Label>
                  <Input
                    id="create-max"
                    type="number"
                    required
                    min="1"
                    max="50"
                    value={createForm.maxTeachers}
                    onChange={(e) =>
                      setCreateForm({ ...createForm, maxTeachers: e.target.value })
                    }
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Création..." : "Créer l'établissement"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="join">
              <form onSubmit={handleJoinEstablishment} className="space-y-4">
                <div>
                  <Label htmlFor="join-name">Nom complet *</Label>
                  <Input
                    id="join-name"
                    required
                    value={joinForm.fullName}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, fullName: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="join-gender">Sexe *</Label>
                  <Select
                    value={joinForm.gender}
                    onValueChange={(value) =>
                      setJoinForm({ ...joinForm, gender: value })
                    }
                  >
                    <SelectTrigger id="join-gender">
                      <SelectValue placeholder="Sélectionner" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Homme</SelectItem>
                      <SelectItem value="female">Femme</SelectItem>
                      <SelectItem value="other">Autre</SelectItem>
                      <SelectItem value="prefer_not_to_say">Préfère ne pas répondre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="join-email">Email *</Label>
                  <Input
                    id="join-email"
                    type="email"
                    required
                    value={joinForm.email}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, email: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="join-password">Mot de passe *</Label>
                  <Input
                    id="join-password"
                    type="password"
                    required
                    minLength={6}
                    value={joinForm.password}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, password: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="join-code">Code établissement *</Label>
                  <Input
                    id="join-code"
                    required
                    placeholder="Ex: A1B2C3D4"
                    value={joinForm.code}
                    onChange={(e) =>
                      setJoinForm({ ...joinForm, code: e.target.value.toUpperCase() })
                    }
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Demandez le code à un collègue déjà inscrit
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Inscription..." : "Rejoindre l'établissement"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">Vous avez déjà un compte ? </span>
            <Link href="/auth/login" className="text-blue-600 hover:underline font-semibold">
              Se connecter
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


