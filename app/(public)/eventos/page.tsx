"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth, type Event } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, ExternalLink, Plus } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function EventosPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [pastEvents, setPastEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { getAllEvents, user, isCommunityAdmin, getUserCommunities } = useAuth()
  const [userCanCreateEvent, setUserCanCreateEvent] = useState(false)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const allEvents = await getAllEvents()

        // Separar eventos passados e futuros
        const now = Date.now()
        const upcoming = allEvents.filter((event) => event.date >= now)
        const past = allEvents.filter((event) => event.date < now)

        setEvents(upcoming)
        setPastEvents(past)
      } catch (error) {
        console.error("Erro ao buscar eventos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [getAllEvents])

  // Verificar se o usuário pode criar eventos (é admin de alguma comunidade)
  useEffect(() => {
    const checkUserPermissions = async () => {
      if (!user) {
        setUserCanCreateEvent(false)
        return
      }

      try {
        // Buscar comunidades do usuário
        const userCommunities = await getUserCommunities(user.uid)

        // Verificar se o usuário é admin de alguma comunidade
        for (const community of userCommunities) {
          if (community.role === "admin") {
            setUserCanCreateEvent(true)
            return
          }
        }

        setUserCanCreateEvent(false)
      } catch (error) {
        console.error("Erro ao verificar permissões:", error)
        setUserCanCreateEvent(false)
      }
    }

    checkUserPermissions()
  }, [user, getUserCommunities])

  const formatEventDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getAttractionTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      palestra: {
        label: "Palestra",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      workshop: {
        label: "Workshop",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      roda_de_conversa: {
        label: "Roda de Conversa",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      },
      oficina: {
        label: "Oficina",
        className: "bg-amber-100 text-amber-800 hover:bg-amber-200",
      },
      meetup: {
        label: "Meetup",
        className: "bg-pink-100 text-pink-800 hover:bg-pink-200",
      },
      hackathon: {
        label: "Hackathon",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      outro: {
        label: "Outro",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      },
    }

    return types[type] || types.outro
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Eventos</h1>
          <p className="text-muted-foreground mt-2">Confira os próximos eventos da comunidade</p>
        </div>
        {userCanCreateEvent && (
          <Button asChild>
            <Link href="/eventos/criar" className="flex items-center gap-1">
              <Plus size={16} /> Criar Evento
            </Link>
          </Button>
        )}
      </div>

      <div className="bg-muted p-6 rounded-lg mb-8">
        <h2 className="text-xl font-semibold mb-2">Quer organizar um evento?</h2>
        <p className="mb-4">
          Se você representa uma comunidade ou empresa e gostaria de organizar um evento, entre em contato conosco.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline">
            <a href="mailto:gdevsociety@gmail.com" className="flex items-center gap-2">
              <ExternalLink size={16} /> gdevsociety@gmail.com
            </a>
          </Button>
          <Button asChild variant="outline">
            <a
              href="https://wa.me/5586999763066"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2"
            >
              <ExternalLink size={16} /> WhatsApp
            </a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming">
        <TabsList className="mb-6">
          <TabsTrigger value="upcoming">Próximos Eventos</TabsTrigger>
          <TabsTrigger value="past">Eventos Passados</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <p>Carregando eventos...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">Nenhum evento programado no momento.</p>
                  <p className="mt-2">Fique de olho, novos eventos serão anunciados em breve!</p>
                </div>
              ) : (
                events.map((event) => (
                  <Card key={event.id} className="overflow-hidden flex flex-col">
                    {event.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={event.imageUrl || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <Calendar size={48} className="text-muted-foreground" />
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                      </div>
                      <CardDescription>
                        <Badge className={getAttractionTypeBadge(event.attractionType).className}>
                          {getAttractionTypeBadge(event.attractionType).label}
                        </Badge>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-2 flex-grow">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="mt-0.5 text-muted-foreground" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="mt-0.5 text-muted-foreground" />
                          <span>{event.isOnline ? "Evento Online" : event.location}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users size={16} className="mt-0.5 text-muted-foreground" />
                          <span>
                            {event.interestedCount} interessados · {event.attendeesCount} confirmados
                          </span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Button asChild className="w-full">
                        <Link href={`/eventos/${event.id}`}>Ver Detalhes</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="past">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <p>Carregando eventos...</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.length === 0 ? (
                <div className="col-span-full py-12 text-center">
                  <p className="text-muted-foreground">Nenhum evento passado registrado.</p>
                </div>
              ) : (
                pastEvents.map((event) => (
                  <Card
                    key={event.id}
                    className="overflow-hidden flex flex-col opacity-75 hover:opacity-100 transition-opacity"
                  >
                    {event.imageUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={event.imageUrl || "/placeholder.svg"}
                          alt={event.title}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-muted flex items-center justify-center">
                        <Calendar size={48} className="text-muted-foreground" />
                      </div>
                    )}

                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl">{event.title}</CardTitle>
                      </div>
                      <CardDescription>
                        <Badge variant="outline">Evento Passado</Badge>{" "}
                        <Badge className={getAttractionTypeBadge(event.attractionType).className}>
                          {getAttractionTypeBadge(event.attractionType).label}
                        </Badge>
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="pb-2 flex-grow">
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2">
                          <Calendar size={16} className="mt-0.5 text-muted-foreground" />
                          <span>{formatEventDate(event.date)}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="mt-0.5 text-muted-foreground" />
                          <span>{event.isOnline ? "Evento Online" : event.location}</span>
                        </div>

                        <div className="flex items-start gap-2">
                          <Users size={16} className="mt-0.5 text-muted-foreground" />
                          <span>{event.attendeesCount} participantes</span>
                        </div>
                      </div>
                    </CardContent>

                    <CardFooter className="pt-2">
                      <Button asChild variant="outline" className="w-full">
                        <Link href={`/eventos/${event.id}`}>Ver Detalhes</Link>
                      </Button>
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
