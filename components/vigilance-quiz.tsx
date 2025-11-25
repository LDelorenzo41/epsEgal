// @ts-nocheck
"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Scale, CheckCircle2, AlertCircle, Loader2 } from "lucide-react"

interface QuizQuestion {
  id: string
  title: string
  question: string
}

interface QuizAnswer {
  questionId: string
  value: number
}

interface QuizResult {
  score: number
  level: number
  levelLabel: string
  levelDescription: string
  percentage: number
}

interface ExistingScore {
  score: number
  level: number
  completed_at: string
  school_year: string
}

interface SchoolStats {
  average_score: number
  total_respondents: number
}

const QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    title: "Interactions verbales",
    question: "Dans mes régulations et mes retours (gestion des contenus), est-ce que je m'assure activement d'adresser une attention et des interactions de qualité équivalentes aux filles et aux garçons ?"
  },
  {
    id: "q2",
    title: "Évaluation",
    question: "Mes référentiels d'évaluation valorisent-ils systématiquement le processus d'apprentissage (procédures, savoirs fondamentaux) et la progression auto-référencée plutôt que la seule performance athlétique maximale ou le résultat brut ?"
  },
  {
    id: "q3",
    title: "Choix des APSA",
    question: "Lorsque je programme des activités traditionnellement connotées masculines (ex : sports collectifs, athlétisme), est-ce que j'utilise des formes de pratique scolaire (FPS) explicitement conçues pour déconstruire les stéréotypes de genre et favoriser l'engagement équitable (ex : règles de non-contact, rôles tournants) ?"
  },
  {
    id: "q4",
    title: "Rôles et groupement",
    question: "J'évite de laisser les élèves constituer eux-mêmes les équipes, et j'impose une rotation stricte des rôles socio-participatifs (arbitre, observateur, secrétaire, preneur de décision) pour empêcher l'assignation stéréotypée par sexe ?"
  },
  {
    id: "q5",
    title: "Intervention immédiate",
    question: "J'intercepte et j'utilise immédiatement toute remarque ou comportement sexiste ou homophobe comme un objet d'éducation civique, plutôt que de laisser passer ou de tolérer l'indiscipline."
  }
]

const LEVEL_INFO: Record<number, { label: string; description: string; color: string; bgColor: string }> = {
  1: {
    label: "Vigilance absente",
    description: "Ce résultat suggère que les pratiques actuelles ne prennent pas encore suffisamment en compte les enjeux d'égalité filles-garçons. C'est une opportunité de développement professionnel importante.",
    color: "text-red-600",
    bgColor: "bg-red-100"
  },
  2: {
    label: "Vigilance réactive",
    description: "Vous êtes sensible aux questions d'égalité et réagissez ponctuellement. Pour progresser, il s'agit de passer d'une posture réactive à une démarche plus systématique et anticipée.",
    color: "text-orange-600",
    bgColor: "bg-orange-100"
  },
  3: {
    label: "Vigilance réflexive",
    description: "Vous intégrez régulièrement la dimension égalitaire dans votre enseignement. Votre pratique témoigne d'une réflexion professionnelle solide sur ces enjeux.",
    color: "text-blue-600",
    bgColor: "bg-blue-100"
  },
  4: {
    label: "Vigilance systémique",
    description: "Votre pratique intègre pleinement et systématiquement les enjeux d'égalité. Vous êtes un moteur de transformation pour l'équipe pédagogique.",
    color: "text-green-600",
    bgColor: "bg-green-100"
  }
}

function getCurrentSchoolYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  
  if (month >= 9) {
    return `${year}-${year + 1}`
  }
  return `${year - 1}-${year}`
}

interface VigilanceQuizProps {
  userId: string
  schoolId: string
}

export function VigilanceQuiz({ userId, schoolId }: VigilanceQuizProps) {
  const [open, setOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<"intro" | "quiz" | "result">("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [result, setResult] = useState<QuizResult | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingScore, setExistingScore] = useState<ExistingScore | null>(null)
  const [schoolStats, setSchoolStats] = useState<SchoolStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const supabase = createClient()
  const schoolYear = getCurrentSchoolYear()

  useEffect(() => {
    if (open) {
      loadExistingData()
    }
  }, [open])

  async function loadExistingData() {
    setIsLoading(true)
    try {
      // Charger le score existant du professeur
      const { data: scoreData, error: scoreError } = await supabase
        .from("teachers_quiz_scores")
        .select("score, level, completed_at, school_year")
        .eq("user_id", userId)
        .eq("school_year", schoolYear)
        .maybeSingle()

      if (scoreError) {
        console.error("Error loading score:", scoreError)
      }

      if (scoreData) {
        const typedScoreData: ExistingScore = {
          score: scoreData.score as number,
          level: scoreData.level as number,
          completed_at: scoreData.completed_at as string,
          school_year: scoreData.school_year as string
        }
        setExistingScore(typedScoreData)
        setCurrentStep("result")
        setResult({
          score: typedScoreData.score,
          level: typedScoreData.level,
          levelLabel: LEVEL_INFO[typedScoreData.level].label,
          levelDescription: LEVEL_INFO[typedScoreData.level].description,
          percentage: Math.round((typedScoreData.score / 15) * 100)
        })
      }

      // Charger les stats de l'établissement
      const { data: statsData, error: statsError } = await supabase
        .from("school_quiz_stats")
        .select("average_score, total_respondents")
        .eq("school_id", schoolId)
        .eq("school_year", schoolYear)
        .maybeSingle()

      if (statsError) {
        console.error("Error loading stats:", statsError)
      }

      if (statsData) {
        setSchoolStats({
          average_score: Number(statsData.average_score),
          total_respondents: statsData.total_respondents as number
        })
      }
    } catch (error) {
      console.error("Error loading quiz data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleAnswer(value: number) {
    const newAnswers = [...answers]
    const existingIndex = newAnswers.findIndex(a => a.questionId === QUESTIONS[currentQuestion].id)
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex].value = value
    } else {
      newAnswers.push({ questionId: QUESTIONS[currentQuestion].id, value })
    }
    
    setAnswers(newAnswers)
  }

  function getCurrentAnswer(): number | undefined {
    return answers.find(a => a.questionId === QUESTIONS[currentQuestion].id)?.value
  }

  function handleNext() {
    if (currentQuestion < QUESTIONS.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    
    const score = answers.reduce((sum, a) => sum + a.value, 0)
    const level = score <= 4 ? 1 : score <= 8 ? 2 : score <= 12 ? 3 : 4
    const percentage = Math.round((score / 15) * 100)

    try {
      // Vérifier si un score existe déjà
      const { data: existing } = await supabase
        .from("teachers_quiz_scores")
        .select("id")
        .eq("user_id", userId)
        .eq("school_year", schoolYear)
        .maybeSingle()

      let error

      if (existing) {
        // Mettre à jour
        const { error: updateError } = await supabase
          .from("teachers_quiz_scores")
          .update({
            score,
            level,
            answers: answers,
            completed_at: new Date().toISOString()
          })
          .eq("user_id", userId)
          .eq("school_year", schoolYear)
        
        error = updateError
      } else {
        // Insérer
        const { error: insertError } = await supabase
          .from("teachers_quiz_scores")
          .insert({
            user_id: userId,
            school_id: schoolId,
            score,
            level,
            school_year: schoolYear,
            answers: answers,
            completed_at: new Date().toISOString()
          })
        
        error = insertError
      }

      if (error) throw error

      setResult({
        score,
        level,
        levelLabel: LEVEL_INFO[level].label,
        levelDescription: LEVEL_INFO[level].description,
        percentage
      })
      setCurrentStep("result")
      
      // Recharger les stats après un court délai pour laisser le trigger s'exécuter
      setTimeout(() => {
        loadExistingData()
      }, 500)
    } catch (error) {
      console.error("Error saving quiz:", error)
      alert("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.")
    } finally {
      setIsSubmitting(false)
    }
  }

  function resetQuiz() {
    setCurrentStep("intro")
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
    setExistingScore(null)
  }

  function handleOpenChange(isOpen: boolean) {
    setOpen(isOpen)
    if (!isOpen) {
      // Reset si on ferme sans avoir terminé
      if (currentStep === "quiz") {
        setCurrentStep("intro")
        setCurrentQuestion(0)
        setAnswers([])
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full border-2 border-violet-200 hover:border-violet-400">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="p-4 bg-violet-100 rounded-full">
                <Scale className="h-12 w-12 text-violet-600" />
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">
                  Quiz de vigilance Égalité
                </h4>
                <p className="text-sm text-gray-600">
                  Évaluez votre niveau de vigilance face aux stéréotypes de genre en EPS
                </p>
                {existingScore && (
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    <CheckCircle2 className="h-3 w-3" />
                    Complété ({existingScore.score}/15)
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-violet-900 flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Test de vigilance didactique et pédagogique en EPS
          </DialogTitle>
          <DialogDescription className="sr-only">
            Quiz d'auto-évaluation sur l'égalité filles-garçons en EPS
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
          </div>
        ) : (
          <ScrollArea className="max-h-[70vh]">
            {/* Introduction */}
            {currentStep === "intro" && (
              <div className="space-y-6 p-1">
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">
                    Ce test a pour objectif de mesurer votre <span className="font-semibold">niveau de vigilance réflexive</span> face aux stéréotypes de genre en EPS.
                    Il ne s'agit pas d'un jugement mais d'un <span className="font-semibold">outil d'auto-positionnement professionnel</span> contribuant à l'attribution du Label Égalité de votre établissement.
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900">Comment ça fonctionne ?</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                      <span>5 questions sur vos pratiques pédagogiques</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                      <span>Répondez honnêtement : OUI (3 pts), Parfois (1 pt), NON (0 pt)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                      <span>Score sur 15 points, 4 niveaux de vigilance</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="flex-shrink-0 w-5 h-5 bg-violet-100 text-violet-600 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                      <span>Contribue à 10% du Label Égalité de l'établissement</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Le quiz est complétable une seule fois par année scolaire ({schoolYear}).
                  </p>
                </div>

                <Button 
                  onClick={() => setCurrentStep("quiz")} 
                  className="w-full bg-violet-600 hover:bg-violet-700"
                >
                  Commencer le test
                </Button>
              </div>
            )}

            {/* Questions */}
            {currentStep === "quiz" && (
              <div className="space-y-6 p-1">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Question {currentQuestion + 1} sur {QUESTIONS.length}</span>
                    <span>{Math.round(((currentQuestion + 1) / QUESTIONS.length) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-violet-600 transition-all duration-300"
                      style={{ width: `${((currentQuestion + 1) / QUESTIONS.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="space-y-4">
                  <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                    <h4 className="font-semibold text-violet-900 mb-2">
                      {QUESTIONS[currentQuestion].title}
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {QUESTIONS[currentQuestion].question}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    {[
                      { value: 3, label: "OUI", description: "Je le fais systématiquement", color: "border-green-300 bg-green-50 hover:border-green-500" },
                      { value: 1, label: "Parfois", description: "Je le fais de temps en temps", color: "border-amber-300 bg-amber-50 hover:border-amber-500" },
                      { value: 0, label: "NON", description: "Je ne le fais pas ou rarement", color: "border-red-300 bg-red-50 hover:border-red-500" }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleAnswer(option.value)}
                        className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                          getCurrentAnswer() === option.value
                            ? "border-violet-500 bg-violet-50 ring-2 ring-violet-200"
                            : option.color
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-semibold text-gray-900">{option.label}</span>
                            <span className="text-gray-500 text-sm ml-2">({option.value} pt{option.value > 1 ? "s" : ""})</span>
                          </div>
                          {getCurrentAnswer() === option.value && (
                            <CheckCircle2 className="h-5 w-5 text-violet-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Navigation */}
                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    variant="outline"
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                  >
                    Précédent
                  </Button>
                  
                  {currentQuestion < QUESTIONS.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={getCurrentAnswer() === undefined}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      Suivant
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={getCurrentAnswer() === undefined || isSubmitting || answers.length < QUESTIONS.length}
                      className="bg-violet-600 hover:bg-violet-700"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Calcul en cours...
                        </>
                      ) : (
                        "Voir mon résultat"
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Résultat */}
            {currentStep === "result" && result && (
              <div className="space-y-6 p-1">
                {/* Score principal */}
                <div className="text-center space-y-4">
                  <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${LEVEL_INFO[result.level].bgColor}`}>
                    <span className={`text-3xl font-bold ${LEVEL_INFO[result.level].color}`}>
                      {result.score}/15
                    </span>
                  </div>
                  
                  <div>
                    <h3 className={`text-xl font-bold ${LEVEL_INFO[result.level].color}`}>
                      Niveau {result.level} : {result.levelLabel}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">
                      {result.percentage}% de vigilance
                    </p>
                  </div>
                </div>

                {/* Jauge de progression */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Niveau 1</span>
                    <span>Niveau 2</span>
                    <span>Niveau 3</span>
                    <span>Niveau 4</span>
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden flex">
                    <div className="w-1/4 bg-red-400 border-r border-white" />
                    <div className="w-1/4 bg-orange-400 border-r border-white" />
                    <div className="w-1/4 bg-blue-400 border-r border-white" />
                    <div className="w-1/4 bg-green-400" />
                  </div>
                  <div className="relative h-2">
                    <div 
                      className="absolute w-3 h-3 bg-violet-600 rounded-full -top-0.5 transform -translate-x-1/2 ring-2 ring-white"
                      style={{ left: `${result.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Interprétation */}
                <div className={`p-4 rounded-lg border ${LEVEL_INFO[result.level].bgColor} border-opacity-50`}>
                  <p className="text-gray-700 leading-relaxed">
                    {result.levelDescription}
                  </p>
                </div>

                {/* Stats établissement */}
                {schoolStats && schoolStats.total_respondents > 0 && (
                  <div className="bg-gray-50 border rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Comparaison établissement</h4>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-violet-600">
                          {schoolStats.average_score.toFixed(1)}/15
                        </p>
                        <p className="text-xs text-gray-500">Moyenne établissement</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-600">
                          {schoolStats.total_respondents}
                        </p>
                        <p className="text-xs text-gray-500">Professeurs évalués</p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-sm text-gray-600 text-center">
                        {result.score > schoolStats.average_score 
                          ? "Votre score est supérieur à la moyenne de l'établissement."
                          : result.score < schoolStats.average_score
                          ? "Votre score est inférieur à la moyenne de l'établissement."
                          : "Votre score correspond à la moyenne de l'établissement."
                        }
                      </p>
                    </div>
                  </div>
                )}

                {/* Contribution au label */}
                <div className="bg-violet-50 border border-violet-200 rounded-lg p-4">
                  <h4 className="font-semibold text-violet-900 mb-2">Contribution au Label Égalité</h4>
                  <p className="text-sm text-gray-700">
                    Ce score représente <span className="font-bold">10%</span> du calcul du Label Égalité de votre établissement.
                    Votre contribution : <span className="font-bold text-violet-600">{(result.percentage * 0.1).toFixed(1)} points</span> sur 10.
                  </p>
                </div>

                {existingScore && (
                  <p className="text-xs text-gray-500 text-center">
                    Quiz complété le {new Date(existingScore.completed_at).toLocaleDateString("fr-FR")} pour l'année {existingScore.school_year}
                  </p>
                )}

                <Button 
                  onClick={() => setOpen(false)} 
                  className="w-full"
                  variant="outline"
                >
                  Fermer
                </Button>
              </div>
            )}
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
