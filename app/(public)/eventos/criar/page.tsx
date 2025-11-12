"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, ArrowLeft } from "lucide-react"

interface EventData {
  title: string
  description: string
  date: number
  location: string
  communityId: string
  createdBy: string
  createdAt: number
  attractionType: string
  isOnline: boolean
  meetingUrl?: string
  imageUrl?: string
  maxAttendees?: number
}

export default function CreateEventPage() {
  const router = useRouter()
  const { user, getUserCommunities, createEvent } = useAuth()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [time, setTime] = useState("")
  const [location, setLocation] = useState("")
  const [isOnline, setIsOnline] = useState(false)
  const [meetingUrl, setMeetingUrl] = useState("")
  const [communityId, setCommunityId] = useState("")
  const [attractionType, setAttractionType] = useState("")
  const [maxAttendees, setMaxAttendees] = useState("")
  const [imageUrl, setImageUrl] = useState("")

  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchUserCommunities = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      setIsLoading(true)
      try {
        // Buscar comunidades do usuário onde ele é admin
        const userCommunities = await getUserCommunities(user.uid)
        const adminCommunities = userCommunities.filter((c) => c.role === "admin")

        if (adminCommunities.length === 0) {
          router.push("/eventos")
          return
        }

        setCommunities(
          adminCommunities.map((c) => ({
            id: c.communityId,
            name: c.name || "",
          })),
        )

        // Pré-selecionar a primeira comunidade
        if (adminCommunities.length > 0) {
          setCommunityId(adminCommunities[0].communityId)
        }
      } catch (error) {
        console.error("Erro ao buscar comunidades:", error)
        setError("Erro ao carregar suas comunidades. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserCommunities()
  }, [user, getUserCommunities, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !date || !time || !communityId || !attractionType) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    // Converter data e hora para timestamp
    const [hours, minutes] = time.split(":").map(Number)
    const eventDate = new Date(date)
    eventDate.setHours(hours, minutes)

    setIsSubmitting(true)
    setError("")

    try {
      // Create event data object with only defined values
      const eventData: Record<string, any> = {
        title,
        description,
        date: eventDate.getTime(),
        location: isOnline ? "Online" : location,
        communityId,
        createdBy: user.uid,
        createdAt: Date.now(),
        attractionType,
        isOnline,
      }

      // Only add optional fields if they have values
      if (isOnline && meetingUrl) {
        eventData.meetingUrl = meetingUrl
      }

      if (imageUrl) {
        eventData.imageUrl = imageUrl
      }

      if (maxAttendees) {
        eventData.maxAttendees = Number.parseInt(maxAttendees)
      }

      const eventId = await createEvent(eventData as EventData)
      router.push(`/eventos/${eventId}`)
    } catch (error) {
      console.error("Erro ao criar evento:", error)
      setError("Erro ao criar evento. Tente novamente mais tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-12">
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => router.push("/eventos")} className="flex items-center gap-1">
          <ArrowLeft size={16} /> Voltar para Eventos
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Criar Novo Evento</CardTitle>
          <CardDescription>Preencha os detalhes do evento que sua comunidade irá organizar</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Evento *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Workshop de React"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o evento, seus objetivos e o que os participantes podem esperar"
                rows={5}
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={date} onSelect={setDate} initialFocus locale={ptBR} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Horário *</Label>
                <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="isOnline">Evento Online</Label>
                <Switch id="isOnline" checked={isOnline} onCheckedChange={setIsOnline} />
              </div>
            </div>

            {isOnline ? (
              <div className="space-y-2">
                <Label htmlFor="meetingUrl">Link da Reunião *</Label>
                <Input
                  id="meetingUrl"
                  type="url"
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  placeholder="https://meet.google.com/..."
                  required={isOnline}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="location">Local *</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Ex: Auditório da Universidade"
                  required={!isOnline}
                />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="community">Comunidade Organizadora *</Label>
                <Select value={communityId} onValueChange={setCommunityId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma comunidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((community) => (
                      <SelectItem key={community.id} value={community.id}>
                        {community.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="attractionType">Tipo de Atração *</Label>
                <Select value={attractionType} onValueChange={setAttractionType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="palestra">Palestra</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="roda_de_conversa">Roda de Conversa</SelectItem>
                    <SelectItem value="oficina">Oficina</SelectItem>
                    <SelectItem value="meetup">Meetup</SelectItem>
                    <SelectItem value="hackathon">Hackathon</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAttendees">Número Máximo de Participantes (opcional)</Label>
              <Input
                id="maxAttendees"
                type="number"
                min="1"
                value={maxAttendees}
                onChange={(e) => setMaxAttendees(e.target.value)}
                placeholder="Deixe em branco para ilimitado"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL da Imagem (opcional)</Label>
              <Input
                id="imageUrl"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemplo.com/imagem.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Adicione uma URL de imagem para ilustrar seu evento. Recomendamos usar imagens de 1200x630 pixels.
              </p>
            </div>

            {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}
          </CardContent>
          <CardFooter>
            <Button type="button" variant="outline" onClick={() => router.push("/eventos")} className="mr-2">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Evento"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
