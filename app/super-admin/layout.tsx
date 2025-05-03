"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { BarChart3, Users, Globe, Calendar, FolderKanban, Users2, Shield, Menu, Home, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import AdminRoute from "@/components/admin-route"

interface SuperAdminLayoutProps {
  children: React.ReactNode
}

export default function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const { user, logout } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/super-admin",
      icon: BarChart3,
    },
    {
      title: "Usuários",
      href: "/super-admin/usuarios",
      icon: Users,
    },
    {
      title: "Comunidades",
      href: "/super-admin/comunidades",
      icon: Globe,
    },
    {
      title: "Eventos",
      href: "/super-admin/eventos",
      icon: Calendar,
    },
    {
      title: "Projetos",
      href: "/super-admin/projetos",
      icon: FolderKanban,
    },
    {
      title: "Contribuidores",
      href: "/super-admin/contribuidores",
      icon: Users2,
    },
    {
      title: "Administradores",
      href: "/super-admin/administradores",
      icon: Shield,
    },
  ]

  return (
    <AdminRoute>
      <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Sidebar para desktop */}
        <aside className="hidden md:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800">
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold text-xl">Admin</span>
            </Link>
          </div>
          <ScrollArea className="flex-1 py-4">
            <nav className="space-y-1 px-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-gray-100 dark:hover:bg-gray-800",
                    "focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.title}
                </Link>
              ))}
            </nav>
          </ScrollArea>
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                {user?.email?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Início
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </aside>

        {/* Sidebar para mobile */}
        <Sheet>
          <div className="md:hidden flex items-center p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="mr-4">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Abrir menu</span>
              </Button>
            </SheetTrigger>
            <Link href="/" className="flex items-center gap-2">
              <Shield className="h-6 w-6" />
              <span className="font-bold text-xl">Admin</span>
            </Link>
          </div>
          <SheetContent side="left" className="p-0 w-64">
            <div className="p-6 border-b border-gray-200 dark:border-gray-800">
              <Link href="/" className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                <span className="font-bold text-xl">Admin</span>
              </Link>
            </div>
            <ScrollArea className="flex-1 py-4 h-[calc(100vh-180px)]">
              <nav className="space-y-1 px-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      "hover:bg-gray-100 dark:hover:bg-gray-800",
                      "focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-700",
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                  </Link>
                ))}
              </nav>
            </ScrollArea>
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="overflow-hidden">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Administrador</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href="/">
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Link>
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Conteúdo principal */}
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto py-6 px-4">{children}</div>
        </main>
      </div>
    </AdminRoute>
  )
}
