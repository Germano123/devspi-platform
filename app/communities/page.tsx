"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, UserPlus, Settings, Users, Globe, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"

export default function CommunitiesPage() {
  const router = useRouter()
  const [communities, setCommunities] = useState<any[]>([])
  const [userCommunities, setUserCommunities] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)
  const { user, getAllCommunities, isAdmin, joinCommunity, isCommunityMember, isCommunityAdmin, getUserCommunities } =
    useAuth()

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true)
      try {
        const allCommunities = await getAllCommunities()
        setCommunities(allCommunities)

        // Se o usuário estiver logado, verificar de quais comunidades ele faz parte
        if (user) {
          const userComms = await getUserCommunities(user.uid)
          const communitiesMap: Record<string, string> = {}

          userComms.forEach((comm) => {
            communitiesMap[comm.communityId] = comm.role
          })

          setUserCommunities(communitiesMap)
        }
      } catch (error) {
        console.error("Erro ao buscar comunidades:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunities()
  }, [getAllCommunities, user, getUserCommunities])

  const handleJoinCommunity = async (communityId: string, isPrivate: boolean) => {
    if (!user) {
      router.push("/login")
      return
    }

    try {
      await joinCommunity(user.uid, communityId)

      // Atualizar o estado local
      setUserCommunities((prev) => ({
        ...prev,
        [communityId]: isPrivate ? "pending" : "member",
      }))
    } catch (error) {
      console.error("Erro ao entrar na comunidade:", error)
    }
  }

  const getMembershipStatus = (communityId: string) => {
    const role = userCommunities[communityId]

    if (!role) return null

    if (role === "pending") {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
          Pendente
        </Badge>
      )
    } else if (role === "admin") {
      return (
        <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200">
          Administrador
        </Badge>
      )
    } else if (role === "editor") {
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
          Editor
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
          Membro
        </Badge>
      )
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Comunidades de Desenvolvimento</h1>
          <p className="text-muted-foreground mt-2">Conheça as comunidades de desenvolvimento do Piauí</p>
        </div>
        {isAdmin && (
          <Button asChild>
            <Link href="/admin/communities">Gerenciar Comunidades</Link>
          </Button>
        )}
      </div>

      {/* CTA para administradores de comunidades */}
      <div className="w-full bg-muted py-8 px-4 mb-8 text-center rounded-lg">
        <h2 className="text-xl font-semibold mb-3">Você é admin da sua comunidade e não encontrou ela por aqui?</h2>
        <p className="mb-4">Entre em contato conosco.</p>
        <Button asChild variant="default">
          <a href="https://wa.me/5586999763066" target="_blank" rel="noopener noreferrer">
            Falar pelo WhatsApp
          </a>
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Carregando comunidades...</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {communities.length === 0 ? (
            <p>Nenhuma comunidade encontrada.</p>
          ) : (
            communities.map((community) => (
              <Card key={community.id} className="flex flex-col">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="flex items-center gap-2">
                      {community.name}
                      {community.isPrivate ? (
                        <Lock size={16} className="text-muted-foreground" />
                      ) : (
                        <Globe size={16} className="text-muted-foreground" />
                      )}
                    </CardTitle>
                    {getMembershipStatus(community.id)}
                  </div>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground mb-4">{community.bio}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-start gap-2 border-t pt-4">
                  <div className="flex flex-wrap gap-2 w-full">
                    {userCommunities[community.id] === "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => router.push(`/community-admin/${community.id}`)}
                      >
                        <Settings size={14} /> Gerenciar
                      </Button>
                    )}

                    {!userCommunities[community.id] && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                        onClick={() => handleJoinCommunity(community.id, community.isPrivate)}
                      >
                        <UserPlus size={14} />
                        {community.isPrivate ? "Solicitar Participação" : "Participar"}
                      </Button>
                    )}

                    {userCommunities[community.id] && userCommunities[community.id] !== "pending" && (
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Users size={14} /> Ver Membros
                      </Button>
                    )}
                  </div>

                  <div className="flex flex-col w-full gap-1 mt-2">
                    {community.whatsappLink && (
                      <a
                        href={community.whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        Grupo no WhatsApp <ExternalLink size={14} />
                      </a>
                    )}
                    {community.websiteLink && (
                      <a
                        href={community.websiteLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1 text-sm"
                      >
                        Website <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
