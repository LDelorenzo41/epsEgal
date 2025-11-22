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
import { useToast } from "@/components/ui/use-toast"
import { Copy } from "lucide-react"

export default function SignupPage() {
  const [mode, setMode] = useState<"create" | "join">("create")
  const [loading, setLoading] = useState(false)
  const [establishmentCode, setEstablishmentCode] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Create establishment form
  const [createForm, setCreateForm] = useState({
    email: "",
    password: "",
    fullName: "",
    establishmentName: "",
    maxTeachers: "5",
  })

  // Join establishment form
  const [joinForm, setJoinForm] = useState({
    email: "",
    password: "",
    fullName: "",
    code: "",
  })

  const handleCreateEstablishment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Create user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: createForm.email,
        password: createForm.password,
      })

      if (authError) throw authError
      if (!authData.user) throw new Error("Échec de la création du compte")

      // 2. Generate establishment code
      const { data: codeData, error: codeError } = await supabase.rpc(
        "generate_establishment_code"
      )

      if (codeError) throw codeError

      const generatedCode = codeData as string

      // 3. Create establishment
      const { data: establishmentData, error: establishmentError } = await supabase
        .from("establishments")
        .insert({
          name: createForm.establishmentName,
          identification_code: generatedCode,
          max_teachers: parseInt(createForm.maxTeachers),
        })
        .select()
        .single()

      if (establishmentError) throw establishmentError

      // 4. Create profile
      const { error: profileError } = await supabase.from("profiles").insert({
        id: authData.user.id,
        full_name: createForm.fullName,
        role: "teacher",
        establishment_id: establishmentData.id,
      })

      if (profileError) throw profileError

      // Success - show code
      setEstablishmentCode(generatedCode)

      toast({
        title: "Compte créé avec succès !",
        description: "Votre établissement a été créé.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleJoinEstablishment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
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
      })

      if (profileError) throw profileError

      toast({
        title: "Compte créé avec succès !",
        description: "Vous avez rejoint l'établissement.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
      })
    } finally {
      setLoading(false)
    }
  }

  const copyCode = () => {
    if (establishmentCode) {
      navigator.clipboard.writeText(establishmentCode)
      toast({
        title: "Code copié !",
        description: "Le code établissement a été copié dans le presse-papier",
      })
    }
  }

  const goToDashboard = () => {
    router.push("/dashboard")
    router.refresh()
  }

  if (establishmentCode) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Établissement créé !</CardTitle>
            <CardDescription className="text-center">
              Votre code établissement à partager avec vos collègues
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 text-center">
              <div className="text-sm text-gray-600 mb-2">Code établissement</div>
              <div className="text-3xl font-bold text-blue-600 mb-4 tracking-wider">
                {establishmentCode}
              </div>
              <Button onClick={copyCode} className="gap-2">
                <Copy className="h-4 w-4" />
                Copier le code
              </Button>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-gray-700">
              <p className="font-semibold mb-1">Important :</p>
              <p>Partagez ce code avec vos collègues pour qu'ils puissent rejoindre votre établissement.</p>
            </div>

            <Button onClick={goToDashboard} className="w-full" size="lg">
              Accéder au tableau de bord
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/">
            <h1 className="text-3xl font-bold text-blue-600 mb-2">EPS Égalité</h1>
          </Link>
          <p className="text-gray-600">Créez votre compte</p>
        </div>

        <Tabs value={mode} onValueChange={(v) => setMode(v as "create" | "join")}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="create">Créer un établissement</TabsTrigger>
            <TabsTrigger value="join">Rejoindre un établissement</TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Créer un établissement</CardTitle>
                <CardDescription>
                  Vous êtes le premier professeur de votre équipe à utiliser EPS Égalité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateEstablishment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="establishmentName">Nom de l'établissement *</Label>
                    <Input
                      id="establishmentName"
                      placeholder="Collège/Lycée..."
                      value={createForm.establishmentName}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, establishmentName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxTeachers">Nombre de professeurs EPS *</Label>
                    <Input
                      id="maxTeachers"
                      type="number"
                      min="1"
                      max="50"
                      value={createForm.maxTeachers}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, maxTeachers: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName">Votre nom complet *</Label>
                    <Input
                      id="fullName"
                      placeholder="Prénom Nom"
                      value={createForm.fullName}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, fullName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre.email@example.com"
                      value={createForm.email}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={createForm.password}
                      onChange={(e) =>
                        setCreateForm({ ...createForm, password: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Création..." : "Créer l'établissement"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="join">
            <Card>
              <CardHeader>
                <CardTitle>Rejoindre un établissement</CardTitle>
                <CardDescription>
                  Utilisez le code fourni par votre collègue pour rejoindre votre établissement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleJoinEstablishment} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Code établissement *</Label>
                    <Input
                      id="code"
                      placeholder="Ex: ABC12345"
                      value={joinForm.code}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, code: e.target.value.toUpperCase() })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinFullName">Votre nom complet *</Label>
                    <Input
                      id="joinFullName"
                      placeholder="Prénom Nom"
                      value={joinForm.fullName}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, fullName: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinEmail">Email *</Label>
                    <Input
                      id="joinEmail"
                      type="email"
                      placeholder="votre.email@example.com"
                      value={joinForm.email}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="joinPassword">Mot de passe *</Label>
                    <Input
                      id="joinPassword"
                      type="password"
                      placeholder="••••••••"
                      value={joinForm.password}
                      onChange={(e) =>
                        setJoinForm({ ...joinForm, password: e.target.value })
                      }
                      required
                      minLength={6}
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Inscription..." : "Rejoindre l'établissement"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center mt-4 text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  )
}
