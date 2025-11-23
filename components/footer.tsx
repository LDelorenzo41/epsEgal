import Link from "next/link"

export function Footer() {
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