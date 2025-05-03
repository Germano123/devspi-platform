"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Menu, Calendar } from "lucide-react"

export default function Navbar() {
  const pathname = usePathname()
  const { user, logout, isAdmin } = useAuth()
  const [error, setError] = useState<string | null>(null)

  // Handle logout errors
  const handleLogout = async () => {
    try {
      await logout()
    } catch (error) {
      console.error("Logout error:", error)
      setError("Falha ao fazer logout. Firebase pode não estar configurado corretamente.")
      // Auto-dismiss error after 5 seconds
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <header className="border-b">
      <div className="container flex items-center justify-between h-16 mx-auto px-4">
        <Link href="/" className="text-xl font-bold">
          Devs Piauí
        </Link>

        {error && (
          <div className="absolute top-16 left-0 right-0 bg-red-100 text-red-800 text-sm p-2 text-center">{error}</div>
        )}

        <nav className="flex items-center gap-4">
          {/* Links públicos (sempre visíveis) */}
          <Link
            href="/made-in-piaui"
            className={`text-sm ${pathname === "/made-in-piaui" ? "text-primary font-medium" : "text-muted-foreground"}`}
          >
            Made In Piauí
          </Link>
          <Link
            href="/webring"
            className={`text-sm ${pathname === "/webring" ? "text-primary font-medium" : "text-muted-foreground"}`}
          >
            Webring
          </Link>
          <Link
            href="/communities"
            className={`text-sm ${pathname === "/communities" ? "text-primary font-medium" : "text-muted-foreground"}`}
          >
            Comunidades
          </Link>
          <Link
            href="/eventos"
            className={`text-sm flex items-center gap-1 ${
              pathname.startsWith("/eventos") ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            <Calendar size={16} /> Eventos
          </Link>
          <Link
            href="/contribuidores"
            className={`text-sm ${
              pathname === "/contribuidores" ? "text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            Contribuidores
          </Link>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mais Informações</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/roadmap" className="w-full cursor-pointer">
                  Roadmap
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/termos-de-uso" className="w-full cursor-pointer">
                  Termos de Uso
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/politica-de-cookies" className="w-full cursor-pointer">
                  Política de Cookies
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/politica-de-privacidade" className="w-full cursor-pointer">
                  Política de Privacidade
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin/communities"
                  className={`text-sm ${
                    pathname === "/admin/communities" ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  Admin
                </Link>
              )}
              <Link
                href="/profile"
                className={`text-sm ${pathname === "/profile" ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                Perfil
              </Link>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={`text-sm ${pathname === "/login" ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                Login
              </Link>
              <Button asChild size="sm">
                <Link href="/register">Registrar</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
