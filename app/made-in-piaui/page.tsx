"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth, type Project } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, Plus, User, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function MakeInPiauiPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const { user, getAllProjects } = useAuth()

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const allProjects = await getAllProjects()
        setProjects(allProjects)
      } catch (error) {
        console.error("Erro ao buscar projetos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [getAllProjects])

  const filteredProjects =
    activeCategory === "all" ? projects : projects.filter((project) => project.category === activeCategory)

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; className: string }> = {
      portfolio: {
        label: "Portfólio",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      commercial: {
        label: "Comercial",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      scientific: {
        label: "Científico",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      },
    }

    return categories[category] || { label: category, className: "bg-gray-100 text-gray-800 hover:bg-gray-200" }
  }

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Made In Piauí</h1>
          <p className="text-muted-foreground mt-2">Projetos desenvolvidos por talentos piauienses</p>
        </div>
        {user && (
          <Button asChild>
            <Link href="/made-in-piaui/criar" className="flex items-center gap-1">
              <Plus size={16} /> Adicionar Projeto
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Sobre o Made In Piauí</h2>
        <p className="mb-4">
          O Made In Piauí é uma vitrine para projetos desenvolvidos por talentos piauienses. Aqui você encontra
          portfólios, projetos comerciais e científicos criados pela comunidade local de tecnologia.
        </p>
        {!user && (
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild variant="outline">
              <Link href="/login">Faça login para adicionar seu projeto</Link>
            </Button>
          </div>
        )}
      </div>

      <Tabs defaultValue="all" onValueChange={setActiveCategory}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">Todos</TabsTrigger>
          <TabsTrigger value="portfolio">Portfólio</TabsTrigger>
          <TabsTrigger value="commercial">Comercial</TabsTrigger>
          <TabsTrigger value="scientific">Científico</TabsTrigger>
        </TabsList>

        <TabsContent value={activeCategory}>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <p>Carregando projetos...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredProjects.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">Nenhum projeto encontrado nesta categoria.</p>
                  {user && (
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/made-in-piaui/criar">Adicione o primeiro projeto</Link>
                    </Button>
                  )}
                </div>
              ) : (
                filteredProjects.map((project) => (
                  <Card key={project.id} className="overflow-hidden flex flex-col">
                    {project.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={project.imageUrl || "/placeholder.svg"}
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <span className="text-muted-foreground text-lg">Sem imagem</span>
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{project.title}</CardTitle>
                      </div>
                      <CardDescription>
                        <Badge className={getCategoryBadge(project.category).className}>
                          {getCategoryBadge(project.category).label}
                        </Badge>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-2 flex-grow">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <User size={16} className="mt-0.5 text-muted-foreground" />
                          <span>{project.authorName}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="mt-0.5 text-muted-foreground" />
                          <span>{formatDate(project.createdAt)}</span>
                        </div>

                        <p className="line-clamp-3 text-muted-foreground mt-2">{project.description}</p>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2 flex gap-2">
                      <Button asChild variant="default" className="flex-1">
                        <Link href={`/made-in-piaui/${project.id}`}>Ver Detalhes</Link>
                      </Button>

                      {project.externalLink && (
                        <Button asChild variant="outline" size="icon">
                          <a href={project.externalLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink size={16} />
                          </a>
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
