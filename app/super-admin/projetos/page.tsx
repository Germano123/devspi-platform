"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, MoreHorizontal, Pencil, Trash2, ExternalLink, User, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function ProjectsAdminPage() {
  const { getAllProjects, deleteProject } = useAuth()
  const [projects, setProjects] = useState<any[]>([])
  const [filteredProjects, setFilteredProjects] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const allProjects = await getAllProjects()
        setProjects(allProjects)
        setFilteredProjects(allProjects)
      } catch (error) {
        console.error("Erro ao buscar projetos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProjects()
  }, [getAllProjects])

  useEffect(() => {
    if (searchTerm) {
      const filtered = projects.filter(
        (project) =>
          project.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          project.authorName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredProjects(filtered)
    } else {
      setFilteredProjects(projects)
    }
  }, [searchTerm, projects])

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id)

      // Remover o projeto da lista
      setProjects(projects.filter((project) => project.id !== id))
      setFilteredProjects(filteredProjects.filter((project) => project.id !== id))
    } catch (error) {
      console.error("Erro ao excluir projeto:", error)
    }
  }

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  const getCategoryBadge = (category: string) => {
    const categories: Record<string, { label: string; className: string }> = {
      portfolio: {
        label: "Portfólio",
        className: "bg-blue-100 text-blue-800",
      },
      commercial: {
        label: "Comercial",
        className: "bg-green-100 text-green-800",
      },
      scientific: {
        label: "Científico",
        className: "bg-purple-100 text-purple-800",
      },
    }

    return categories[category] || { label: category, className: "bg-gray-100 text-gray-800" }
  }

  if (isLoading) {
    return <div className="text-center py-10">Carregando projetos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Projetos</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar projetos..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projetos ({filteredProjects.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data de Criação</TableHead>
                <TableHead>Link Externo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum projeto encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <User size={14} className="text-muted-foreground" />
                        <span className="text-sm">{project.authorName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadge(project.category).className}>
                        {getCategoryBadge(project.category).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-sm">{formatDate(project.createdAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {project.externalLink ? (
                        <a
                          href={project.externalLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center text-sm"
                        >
                          <ExternalLink size={14} className="mr-1" /> Link
                        </a>
                      ) : (
                        <span className="text-muted-foreground text-sm">Não disponível</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Abrir menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => window.open(`/made-in-piaui/${project.id}`, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Projeto
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => window.open(`/made-in-piaui/${project.id}/editar`, "_blank")}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Excluir
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto "
                                  {project.title}" e removerá todos os dados associados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(project.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sim, excluir projeto
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
