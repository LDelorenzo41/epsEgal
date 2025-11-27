"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronUp, ExternalLink } from "lucide-react"

export function Footer() {
  const [appsMenuOpen, setAppsMenuOpen] = useState(false)

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-sm">
              © {new Date().getFullYear()} <span className="font-semibold text-white">LD Teach & Tech</span>
              {" "}- Tous droits réservés
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm">
            {/* Menu Mes autres applications */}
            <div className="relative">
              <button
                onClick={() => setAppsMenuOpen(!appsMenuOpen)}
                className="flex items-center gap-1 hover:text-white transition-colors"
              >
                Mes autres applications
                <ChevronUp className={`h-4 w-4 transition-transform ${appsMenuOpen ? '' : 'rotate-180'}`} />
              </button>
              
              {appsMenuOpen && (
                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 rounded-lg shadow-lg py-2 min-w-[180px] border border-gray-700">
                  <a
                    href="https://profassist.net"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <span>ProfAssist</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                  <a
                    href="https://demifond.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-700 transition-colors"
                  >
                    <span>Demi-fond</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>

            <span className="hidden md:inline">•</span>
            
            <a 
              href="mailto:lionel.delorenzo@teachtech.fr" 
              className="hover:text-white transition-colors"
            >
              Contact : lionel.delorenzo@teachtech.fr
            </a>
            <span className="hidden md:inline">•</span>
            <Link 
              href="/legal" 
              className="hover:text-white transition-colors"
            >
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}