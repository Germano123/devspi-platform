"use client"

import { useState, useEffect } from "react"
import { useAuth, type Contributor } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Github, Linkedin, ExternalLink } from "lucide-react"

export default function ContribuidoresPage() {
  const [contributors, setContributors] = useState<Contributor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getAllContributors } = useAuth()

  useEffect(() => {
    const fetchContributors = async () => {
      setIsLoading(true)
      try {
        const allContributors = await getAllContributors()
        setContributors(allContributors)
      } catch (error) {
        console.error("Erro ao buscar contribuidores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContributors()
  }, [getAllContributors])

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; className: string }> = {
      founder: {
        label: "Fundador",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      },
      developer: {
        label: "Desenvolvedor",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      designer: {
        label: "Designer",
        className: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      },
      community: {
        label: "Comunidade",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      'quality-assurance': {
        label: "Garantia de Qualidade",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      },
    }

    return roles[role] || { label: role, className: "bg-gray-100 text-gray-800 hover:bg-gray-200" }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Contribuidores</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Conheça as pessoas que tornaram este projeto possível. Agradecemos a todos que contribuíram para o
          desenvolvimento da plataforma Devs Piauí.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Carregando contribuidores...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {contributors.length === 0 ? (
            <div className="col-span-full py-12 text-center">
              <p className="text-muted-foreground">Nenhum contribuidor encontrado.</p>
            </div>
          ) : (
            contributors.map((contributor) => (
              <Card key={contributor.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={contributor.photoURL || ""} />
                      <AvatarFallback>
                        {contributor.firstName?.charAt(0)}
                        {contributor.lastName?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-xl">
                        {contributor.firstName} {contributor.lastName}
                      </CardTitle>
                      <CardDescription className="flex gap-x-4 gap-y-4">
                        {
                          contributor.roles.map((role) => {
                            return <Badge className={getRoleBadge(role).className}>
                              {getRoleBadge(role).label}
                            </Badge>
                          })
                        }
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground">
                    Contribuindo desde {new Date(contributor.joinedAt).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  {contributor.githubUrl && (
                    <a
                      href={contributor.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Github size={20} />
                    </a>
                  )}
                  {contributor.linkedinUrl && (
                    <a
                      href={contributor.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <Linkedin size={20} />
                    </a>
                  )}
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}

      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Quer contribuir?</h2>
        <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
          Este é um projeto de código aberto e estamos sempre procurando por pessoas que queiram contribuir. Se você tem
          interesse em ajudar, entre em contato conosco.
        </p>
        <a
          href="https://github.com/Germano123/devspi-platform"
          className="mb-4 inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ExternalLink size={16} />GitHub
        </a>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:gdevsociety@gmail.com"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink size={16} />gdevsociety@gmail.com
          </a>
          <a
            href="https://wa.me/5586999763066"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            <ExternalLink size={16} />WhatsApp
          </a>
        </div>
      </div>
    </div>
  )
}
