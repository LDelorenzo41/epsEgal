"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut, Home, Building, User, BarChart, ExternalLink, ChevronDown, Wrench } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"

export function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [toolsMenuOpen, setToolsMenuOpen] = useState(false)

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de se déconnecter",
      })
    } else {
      router.push("/")
      router.refresh()
    }
  }

  const navItems = [
    {
      href: "/dashboard",
      label: "Tableau de bord",
      icon: Home,
    },
    {
      href: "/etablissement",
      label: "Établissement",
      icon: Building,
    },
    {
      href: "/perso",
      label: "Page Perso",
      icon: User,
    },
    {
      href: "/stats",
      label: "Statistiques",
      icon: BarChart,
    },
  ]

  return (
    <nav className="border-b bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-blue-600">
              EPS Égalité
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      className="gap-2"
                    >
                      <Icon className="h-4 w-4" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Menu Suite d'outils */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
              >
                <Wrench className="h-4 w-4" />
                Suite d'outils
                <ChevronDown className={`h-4 w-4 transition-transform ${toolsMenuOpen ? 'rotate-180' : ''}`} />
              </Button>

              {toolsMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg py-2 min-w-[180px] border z-50">
                  <a
                    href="https://profassist.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                    onClick={() => setToolsMenuOpen(false)}
                  >
                    <span>ProfAssist</span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </a>
                  <a
                    href="https://demifond.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 transition-colors text-sm"
                    onClick={() => setToolsMenuOpen(false)}
                  >
                    <span>Demi-fond</span>
                    <ExternalLink className="h-3 w-3 text-gray-400" />
                  </a>
                </div>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </div>

        {/* Mobile navigation */}
        <div className="md:hidden pb-4 flex gap-2 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/")

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "default" : "outline"}
                  size="sm"
                  className="gap-2 whitespace-nowrap"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
          
          {/* Menu Suite d'outils pour mobile */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 whitespace-nowrap"
              onClick={() => setToolsMenuOpen(!toolsMenuOpen)}
            >
              <Wrench className="h-4 w-4" />
              Outils
            </Button>
          </div>
        </div>
      </div>
      
      {/* Overlay pour fermer le menu */}
      {toolsMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setToolsMenuOpen(false)}
        />
      )}
    </nav>
  )
}
