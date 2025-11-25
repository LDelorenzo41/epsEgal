import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EpsInfoModal } from "@/components/eps-info-modal"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-blue-600">EPS Égalité</h1>
            <EpsInfoModal />
          </div>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Connexion</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Inscription</Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center">
            <h2 className="text-4xl font-bold text-gray-900">
              EPS Égalité
            </h2>
            <EpsInfoModal />
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mt-4">
            Faites un état des lieux de l'égalité Filles/Garçons en EPS et de la répartition des compétences propres travaillées dans votre établissement
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Programmation</CardTitle>
              <CardDescription>
                Définissez votre programmation commune des APSA et leur répartition par CP
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Suivi personnel</CardTitle>
              <CardDescription>
                Gérez vos classes et saisissez les moyennes de notes par sexe
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-blue-600">Statistiques</CardTitle>
              <CardDescription>
                Visualisez les écarts et obtenez un label d'égalité pour votre établissement
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        <div className="text-center">
          <Link href="/auth/signup">
            <Button size="lg" className="text-lg px-8">
              Commencer maintenant
            </Button>
          </Link>
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Comment ça marche ?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Créez ou rejoignez un établissement</h3>
                  <p className="text-gray-600">
                    Le premier professeur crée l'établissement et obtient un code à partager avec ses collègues
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Configurez votre établissement</h3>
                  <p className="text-gray-600">
                    Définissez les niveaux, les classes et la programmation commune des APSA
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Saisissez vos données</h3>
                  <p className="text-gray-600">
                    Chaque professeur saisit ses moyennes de notes par sexe pour ses classes
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Consultez les statistiques</h3>
                  <p className="text-gray-600">
                    Visualisez les écarts et obtenez un label d'égalité pour votre établissement
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <footer className="border-t mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>EPS Égalité - Outil d'analyse de l'égalité Filles/Garçons en EPS</p>
        </div>
      </footer>
    </div>
  )
}
