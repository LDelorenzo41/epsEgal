import { NavBar } from "@/components/nav-bar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au tableau de bord
          </Button>
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Mentions Légales et Politique de Confidentialité
        </h1>

        <div className="space-y-6">
          {/* Éditeur */}
          <Card>
            <CardHeader>
              <CardTitle>1. Éditeur de l'application</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                <strong>Nom :</strong> LD Teach & Tech
              </p>
              <p>
                <strong>Contact :</strong>{" "}
                <a 
                  href="mailto:lionel.delorenzo@teachtech.fr" 
                  className="text-blue-600 hover:underline"
                >
                  lionel.delorenzo@teachtech.fr
                </a>
              </p>
              <p>
                <strong>Application :</strong> EPS Égalité
              </p>
              <p className="text-sm text-gray-600">
                Application web destinée au suivi de l'égalité filles-garçons dans l'enseignement de l'Éducation Physique et Sportive.
              </p>
            </CardContent>
          </Card>

          {/* Hébergement */}
          <Card>
            <CardHeader>
              <CardTitle>2. Hébergement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="font-semibold mb-2">Application web :</p>
                <p>
                  <strong>Hébergeur :</strong> Netlify, Inc.
                </p>
                <p className="text-sm text-gray-600">
                  2325 3rd Street, Suite 215, San Francisco, CA 94107, USA
                </p>
              </div>
              <div>
                <p className="font-semibold mb-2">Base de données :</p>
                <p>
                  <strong>Service :</strong> Supabase
                </p>
                <p className="text-sm text-gray-600">
                  Supabase Inc., 970 Toa Payoh North, Singapore 318992
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Protection des données */}
          <Card>
            <CardHeader>
              <CardTitle>3. Protection des données personnelles (RGPD)</CardTitle>
              <CardDescription>
                Conformité au Règlement Général sur la Protection des Données
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">3.1 Responsable du traitement</h3>
                <p className="text-gray-700">
                  LD Teach & Tech est responsable du traitement des données personnelles collectées via l'application EPS Égalité.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3.2 Données collectées</h3>
                <p className="text-gray-700 mb-2">
                  L'application collecte et traite les données suivantes :
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Informations d'identification : nom complet, adresse e-mail</li>
                  <li>Informations professionnelles : établissement d'enseignement, rôle</li>
                  <li>Données pédagogiques : classes, activités sportives, moyennes d'élèves (anonymisées par genre)</li>
                  <li>Données techniques : adresse IP, cookies de session</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3.3 Finalités du traitement</h3>
                <p className="text-gray-700 mb-2">
                  Les données sont collectées pour :
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Permettre la création et la gestion de votre compte utilisateur</li>
                  <li>Faciliter le suivi de l'égalité filles-garçons en EPS</li>
                  <li>Générer des statistiques et rapports pour votre établissement</li>
                  <li>Améliorer la qualité de l'enseignement en identifiant les écarts de performance</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3.4 Base légale</h3>
                <p className="text-gray-700">
                  Le traitement des données repose sur le consentement de l'utilisateur (Article 6.1.a du RGPD) 
                  et l'exécution d'une mission d'intérêt public dans le domaine de l'éducation (Article 6.1.e du RGPD).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3.5 Durée de conservation</h3>
                <p className="text-gray-700">
                  Les données personnelles sont conservées pendant toute la durée d'utilisation active du compte, 
                  puis archivées pour une durée maximale de 3 ans après la dernière connexion, 
                  conformément aux obligations légales en matière d'éducation.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">3.6 Destinataires des données</h3>
                <p className="text-gray-700 mb-2">
                  Les données sont accessibles uniquement :
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                  <li>Aux professeurs d'un même établissement (données partagées de l'établissement)</li>
                  <li>À l'administrateur de l'application (maintenance technique)</li>
                  <li>Aux prestataires techniques (hébergement) sous contrat de confidentialité</li>
                </ul>
                <p className="text-gray-700 mt-2">
                  <strong>Aucune donnée n'est vendue ou transmise à des tiers à des fins commerciales.</strong>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card>
            <CardHeader>
              <CardTitle>4. Sécurité des données</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                LD Teach & Tech met en œuvre toutes les mesures techniques et organisationnelles appropriées 
                pour garantir la sécurité et la confidentialité des données personnelles :
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>
                  <strong>Chiffrement :</strong> Toutes les connexions utilisent le protocole HTTPS (SSL/TLS)
                </li>
                <li>
                  <strong>Authentification :</strong> Système d'authentification sécurisé par Supabase Auth
                </li>
                <li>
                  <strong>Isolation des données :</strong> Politique de sécurité au niveau des lignes (RLS) 
                  garantissant que chaque établissement ne peut accéder qu'à ses propres données
                </li>
                <li>
                  <strong>Sauvegarde :</strong> Sauvegardes automatiques quotidiennes de la base de données
                </li>
                <li>
                  <strong>Accès restreint :</strong> Accès à l'infrastructure limité aux personnes autorisées
                </li>
              </ul>
              <p className="text-gray-700 mt-3">
                En cas de violation de données personnelles susceptible d'engendrer un risque élevé pour vos droits et libertés, 
                vous serez informé dans les 72 heures conformément à l'Article 33 du RGPD.
              </p>
            </CardContent>
          </Card>

          {/* Droits des utilisateurs */}
          <Card>
            <CardHeader>
              <CardTitle>5. Vos droits</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700 mb-2">
                Conformément au RGPD, vous disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>
                  <strong>Droit d'accès (Art. 15) :</strong> Obtenir une copie de vos données personnelles
                </li>
                <li>
                  <strong>Droit de rectification (Art. 16) :</strong> Corriger vos données inexactes ou incomplètes
                </li>
                <li>
                  <strong>Droit à l'effacement (Art. 17) :</strong> Demander la suppression de vos données
                </li>
                <li>
                  <strong>Droit à la limitation (Art. 18) :</strong> Limiter le traitement de vos données
                </li>
                <li>
                  <strong>Droit à la portabilité (Art. 20) :</strong> Récupérer vos données dans un format structuré
                </li>
                <li>
                  <strong>Droit d'opposition (Art. 21) :</strong> S'opposer au traitement de vos données
                </li>
                <li>
                  <strong>Droit de retirer votre consentement :</strong> À tout moment
                </li>
              </ul>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-900">
                  <strong>Pour exercer vos droits :</strong> Contactez-nous à{" "}
                  <a 
                    href="mailto:lionel.delorenzo@teachtech.fr" 
                    className="underline font-semibold"
                  >
                    lionel.delorenzo@teachtech.fr
                  </a>
                  <br />
                  Nous nous engageons à répondre dans un délai d'un mois.
                </p>
              </div>
              <p className="text-gray-700 text-sm mt-3">
                Vous disposez également du droit d'introduire une réclamation auprès de la CNIL 
                (Commission Nationale de l'Informatique et des Libertés) : 
                <a 
                  href="https://www.cnil.fr" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  www.cnil.fr
                </a>
              </p>
            </CardContent>
          </Card>

          {/* Cookies */}
          <Card>
            <CardHeader>
              <CardTitle>6. Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                L'application utilise uniquement des cookies strictement nécessaires à son fonctionnement :
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>
                  <strong>Cookies de session :</strong> Maintenir votre connexion sécurisée
                </li>
                <li>
                  <strong>Cookies d'authentification :</strong> Gérer votre identification
                </li>
              </ul>
              <p className="text-gray-700">
                <strong>Aucun cookie de traçage publicitaire n'est utilisé.</strong> Ces cookies techniques sont 
                exemptés de consentement selon les lignes directrices de la CNIL.
              </p>
            </CardContent>
          </Card>

          {/* Propriété intellectuelle */}
          <Card>
            <CardHeader>
              <CardTitle>7. Propriété intellectuelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                L'ensemble du contenu de l'application EPS Égalité (structure, design, textes, graphiques, logos) 
                est la propriété exclusive de LD Teach & Tech, sauf mention contraire.
              </p>
              <p className="text-gray-700">
                Toute reproduction, représentation, modification, publication, ou adaptation de tout ou partie 
                des éléments de l'application, quel que soit le moyen ou le procédé utilisé, est interdite, 
                sauf autorisation écrite préalable.
              </p>
            </CardContent>
          </Card>

          {/* Limitation de responsabilité */}
          <Card>
            <CardHeader>
              <CardTitle>8. Limitation de responsabilité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-gray-700">
                LD Teach & Tech met tout en œuvre pour assurer la disponibilité et la fiabilité de l'application. 
                Toutefois, nous ne pouvons garantir :
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 ml-4">
                <li>L'absence d'interruptions ou d'erreurs de fonctionnement</li>
                <li>La correction de tous les dysfonctionnements</li>
                <li>La compatibilité avec tous les équipements et navigateurs</li>
              </ul>
              <p className="text-gray-700">
                L'utilisateur est responsable de la protection de ses identifiants de connexion 
                et de l'utilisation qui en est faite.
              </p>
            </CardContent>
          </Card>

          {/* Modification */}
          <Card>
            <CardHeader>
              <CardTitle>9. Modifications des mentions légales</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                LD Teach & Tech se réserve le droit de modifier les présentes mentions légales à tout moment. 
                Les utilisateurs seront informés de toute modification substantielle par e-mail ou via une notification 
                dans l'application.
              </p>
              <p className="text-gray-700 mt-3">
                <strong>Date de dernière mise à jour :</strong> {new Date().toLocaleDateString('fr-FR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>10. Nous contacter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-3">
                Pour toute question concernant les présentes mentions légales, la protection de vos données 
                ou l'utilisation de l'application :
              </p>
              <div className="space-y-2">
                <p>
                  <strong>E-mail :</strong>{" "}
                  <a 
                    href="mailto:lionel.delorenzo@teachtech.fr" 
                    className="text-blue-600 hover:underline"
                  >
                    lionel.delorenzo@teachtech.fr
                  </a>
                </p>
                <p>
                  <strong>Responsable :</strong> LD Teach & Tech
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}