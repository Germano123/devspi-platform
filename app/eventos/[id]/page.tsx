"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth, type Event, type EventParticipant } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, MapPin, Users, ExternalLink, Edit, Flame, Check, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const {
    getEvent,
    getCommunity,
    user,
    showInterestInEvent,
    confirmAttendanceToEvent,
    removeInterestFromEvent,
    removeAttendanceFromEvent,
    getEventInterested,
    getEventAttendees,
    isCommunityAdmin,
    getUserProfile,
  } = useAuth()

  const [event, setEvent] = useState<Event | null>(null)
  const [communityName, setCommunityName] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [interested, setInterested] = useState<EventParticipant[]>([])
  const [attendees, setAttendees] = useState<EventParticipant[]>([])
  const [userIsInterested, setUserIsInterested] = useState(false)
  const [userIsAttending, setUserIsAttending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canEdit, setCanEdit] = useState(false)

  useEffect(() => {
    const fetchEventData = async () => {
      setIsLoading(true)
      try {
        const eventData = await getEvent(id as string)
        if (eventData) {
          setEvent(eventData)

          // Buscar nome da comunidade
          const community = await getCommunity(eventData.communityId)
          setCommunityName(community?.name || "")

          // Buscar interessados e confirmados
          const interestedData = await getEventInterested(id as string)
          const attendeesData = await getEventAttendees(id as string)

          setInterested(interestedData)
          setAttendees(attendeesData)

          // Verificar se o usuário está interessado ou confirmado
          if (user) {
            setUserIsInterested(interestedData.some((p) => p.userId === user.uid))
            setUserIsAttending(attendeesData.some((p) => p.userId === user.uid))

            // Verificar se o usuário pode editar o evento (criador ou admin da comunidade)
            const canEditEvent =
              eventData.createdBy === user.uid || (await isCommunityAdmin(user.uid, eventData.communityId))
            setCanEdit(canEditEvent)
          }
        } else {
          router.push("/eventos")
        }
      } catch (error) {
        console.error("Erro ao buscar dados do evento:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventData()
  }, [
    id,
    getEvent,
    getCommunity,
    getEventInterested,
    getEventAttendees,
    user,
    router,
    isCommunityAdmin,
    getUserProfile,
  ])

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

  const handleShowInterest = async () => {
    if (!user || !event) return

    setIsSubmitting(true)
    try {
      if (userIsInterested) {
        await removeInterestFromEvent(user.uid, event.id)
        setUserIsInterested(false)
        setInterested((prev) => prev.filter((p) => p.userId !== user.uid))
      } else {
        await showInterestInEvent(user.uid, event.id)
        setUserIsInterested(true)

        // Adicionar usuário à lista de interessados
        const userProfile = await getUserProfile(user.uid)
        if (userProfile) {
          setInterested((prev) => [
            ...prev,
            {
              userId: user.uid,
              joinedAt: Date.now(),
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              photoURL: userProfile.photoURL,
            },
          ])
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar interesse:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleConfirmAttendance = async () => {
    if (!user || !event) return

    setIsSubmitting(true)
    try {
      if (userIsAttending) {
        await removeAttendanceFromEvent(user.uid, event.id)
        setUserIsAttending(false)
        setAttendees((prev) => prev.filter((p) => p.userId !== user.uid))
      } else {
        await confirmAttendanceToEvent(user.uid, event.id)
        setUserIsAttending(true)

        // Adicionar usuário à lista de confirmados
        const userProfile = await getUserProfile(user.uid)
        if (userProfile) {
          setAttendees((prev) => [
            ...prev,
            {
              userId: user.uid,
              joinedAt: Date.now(),
              firstName: userProfile.firstName,
              lastName: userProfile.lastName,
              photoURL: userProfile.photoURL,
            },
          ])
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar presença:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <p>Carregando evento...</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <p>Evento não encontrado.</p>
        </div>
      </div>
    )
  }

  const isPastEvent = event.date < Date.now()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/eventos")} className="flex items-center gap-1">
          <ArrowLeft size={16} /> Voltar para Eventos
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getAttractionTypeBadge(event.attractionType).className}>
                    {getAttractionTypeBadge(event.attractionType).label}
                  </Badge>
                  {isPastEvent && <Badge variant="outline">Evento Passado</Badge>}
                  <Badge variant="outline">Organizado por {communityName}</Badge>
                </div>
              </div>

              {canEdit && (
                <Button asChild variant="outline" className="flex items-center gap-1">
                  <Link href={`/eventos/${event.id}/editar`}>
                    <Edit size={16} /> Editar
                  </Link>
                </Button>
              )}
            </div>

            {event.imageUrl && (
              <div className="rounded-lg overflow-hidden mb-6">
                <img
                  src={event.imageUrl || "/placeholder.svg"}
                  alt={event.title}
                  className={`w-full h-64 object-cover ${isPastEvent ? "grayscale" : ""}`}
                />
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <Calendar size={20} className="mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Data e Hora</div>
                  <div>{formatEventDate(event.date)}</div>
                  {event.endDate && <div className="text-muted-foreground">Até {formatEventDate(event.endDate)}</div>}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin size={20} className="mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Local</div>
                  <div>{event.isOnline ? "Evento Online" : event.location}</div>
                  {event.isOnline && event.meetingUrl && (
                    <a
                      href={event.meetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 mt-1"
                    >
                      <ExternalLink size={14} /> Link para o evento
                    </a>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users size={20} className="mt-0.5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Participantes</div>
                  <div>
                    {interested.length} interessados · {attendees.length} confirmados
                    {event.maxAttendees && ` · Máximo de ${event.maxAttendees} participantes`}
                  </div>
                </div>
              </div>
            </div>

            <div className="prose max-w-none">
              <h2 className="text-xl font-semibold mb-4">Sobre o evento</h2>
              <div className="whitespace-pre-line">{event.description}</div>
            </div>
          </div>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              {!isPastEvent && (
                <div className="space-y-4 mb-6">
                  {user ? (
                    <>
                      <Button
                        onClick={handleShowInterest}
                        disabled={isSubmitting}
                        variant={userIsInterested ? "outline" : "default"}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Flame size={16} />
                        {userIsInterested ? "Remover interesse" : "Tópico quente"}
                      </Button>

                      <Button
                        onClick={handleConfirmAttendance}
                        disabled={isSubmitting}
                        variant={userIsAttending ? "outline" : "default"}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        <Check size={16} />
                        {userIsAttending ? "Cancelar presença" : "Confirmar presença"}
                      </Button>
                    </>
                  ) : (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="mb-2">Faça login para confirmar sua presença</p>
                      <Button asChild>
                        <Link href="/login">Entrar</Link>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <Tabs defaultValue="attendees">
                <TabsList className="w-full">
                  <TabsTrigger value="attendees" className="flex-1">
                    Confirmados
                  </TabsTrigger>
                  <TabsTrigger value="interested" className="flex-1">
                    Interessados
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="attendees" className="mt-4">
                  {attendees.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Ninguém confirmou presença ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {attendees.map((attendee) => (
                        <div key={attendee.userId} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={attendee.photoURL || ""} />
                            <AvatarFallback>
                              {attendee.firstName?.charAt(0)}
                              {attendee.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {attendee.firstName} {attendee.lastName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="interested" className="mt-4">
                  {interested.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">Ninguém demonstrou interesse ainda.</p>
                  ) : (
                    <div className="space-y-3">
                      {interested.map((person) => (
                        <div key={person.userId} className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={person.photoURL || ""} />
                            <AvatarFallback>
                              {person.firstName?.charAt(0)}
                              {person.lastName?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {person.firstName} {person.lastName}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
