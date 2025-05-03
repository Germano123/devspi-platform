"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type Project } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, ExternalLink, Calendar, User, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
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

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, getProject, deleteProject } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchProject = async () => {
      setIsLoading(true)
      try {
        const projectData = await getProject(id as string)
        if (projectData) {
          setProject(projectData)
        } else {
          router.push("/made-in-piaui")
        }
      } catch (error) {
        console.error("Erro ao buscar projeto:", error)
        setError("Erro ao carregar o projeto. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProject()
  }, [id, getProject, router])

  const handleDelete = async () => {
    if (!user || !project) return

    setIsDeleting(true)
    try {
      await deleteProject(id as string)
      router.push("/made-in-piaui")
    } catch (error) {
      console.error("Erro ao excluir projeto:", error)
      setError("Erro ao excluir projeto. Tente novamente mais tarde.")
      setIsDeleting(false)
    }
  }

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

  const canEdit = user && project && user.uid === project.authorId

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <p>Carregando projeto...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <p>Projeto não encontrado.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/made-in-piaui")} className="flex items-center gap-1">
          <ArrowLeft size={16} /> Voltar para Projetos
        </Button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm mb-6">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getCategoryBadge(project.category).className}>
                    {getCategoryBadge(project.category).label}
                  </Badge>
                </div>
              </div>

              {canEdit && (
                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex items-center gap-1">
                    <Link href={`/made-in-piaui/${project.id}/editar`}>
                      <Edit size={16} /> Editar
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="sm" className="flex items-center gap-1">
                        <Trash2 size={16} /> Excluir
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta ação não pode ser desfeita. Isso excluirá permanentemente o projeto e removerá todos os
                          dados associados.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                          {isDeleting ? "Excluindo..." : "Sim, excluir projeto"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </div>

            {project.imageUrl && (
              <div className="rounded-lg overflow-hidden mb-6">
                <img
                  src={project.imageUrl || "/placeholder.svg"}
                  alt={project.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <User size={20} className="mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Autor</div>
                  <div>{project.authorName}</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar size={20} className="mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Data de Criação</div>
                  <div>{formatDate(project.createdAt)}</div>
                </div>
              </div>

              {project.externalLink && (
                <div className="flex items-start gap-3">
                  <ExternalLink size={20} className="mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Link Externo</div>
                    <a
                      href={project.externalLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {project.externalLink}
                    </a>
                  </div>
                </div>
              )}
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4">Descrição do Projeto</h2>
              <div className="whitespace-pre-line">{project.description}</div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-muted p-6 rounded-lg sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Sobre o Made In Piauí</h2>
            <p className="text-sm text-muted-foreground mb-6">
              O Made In Piauí é uma vitrine para projetos desenvolvidos por talentos piauienses. Aqui você encontra
              portfólios, projetos comerciais e científicos criados pela comunidade local de tecnologia.
            </p>

            {user ? (
              <Button asChild className="w-full">
                <Link href="/made-in-piaui/criar">Adicionar Meu Projeto</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">Faça login para adicionar seu projeto</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
