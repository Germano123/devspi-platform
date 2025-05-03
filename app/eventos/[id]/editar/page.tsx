"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth, type EventData } from "@/contexts/auth-context"
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
import { CalendarIcon, ArrowLeft, Trash2 } from "lucide-react"
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

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { user, getEvent, getUserCommunities, updateEvent, deleteEvent } = useAuth()

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
  const [createdBy, setCreatedBy] = useState("")
  const [createdAt, setCreatedAt] = useState(0)

  const [communities, setCommunities] = useState<{ id: string; name: string }[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchEventData = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      setIsLoading(true)
      try {
        // Buscar dados do evento
        const eventData = await getEvent(id as string)
        if (!eventData) {
          router.push("/eventos")
          return
        }

        // Verificar se o usuário pode editar o evento
        const userCommunities = await getUserCommunities(user.uid)
        const isAdmin = userCommunities.some((c) => c.communityId === eventData.communityId && c.role === "admin")

        if (!isAdmin && eventData.createdBy !== user.uid) {
          router.push(`/eventos/${id}`)
          return
        }

        // Preencher formulário com dados do evento
        setTitle(eventData.title)
        setDescription(eventData.description)
        setDate(new Date(eventData.date))
        setTime(format(new Date(eventData.date), "HH:mm"))
        setIsOnline(eventData.isOnline)
        setLocation(eventData.location)
        setMeetingUrl(eventData.meetingUrl || "")
        setCommunityId(eventData.communityId)
        setAttractionType(eventData.attractionType)
        setMaxAttendees(eventData.maxAttendees?.toString() || "")
        setImageUrl(eventData.imageUrl || "")
        setCreatedBy(eventData.createdBy)
        setCreatedAt(eventData.createdAt)

        // Buscar comunidades do usuário
        setCommunities(
          userCommunities
            .filter((c) => c.role === "admin")
            .map((c) => ({
              id: c.communityId,
              name: c.name || "",
            })),
        )
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setError("Erro ao carregar dados do evento. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEventData()
  }, [id, user, getEvent, getUserCommunities, router])

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
        createdBy,
        createdAt,
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

      await updateEvent(id as string, eventData as EventData)
      router.push(`/eventos/${id}`)
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
      setError("Erro ao atualizar evento. Tente novamente mais tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      await deleteEvent(id as string)
      router.push("/eventos")
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
      setError("Erro ao excluir evento. Tente novamente mais tarde.")
      setIsDeleting(false)
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
        <Button variant="ghost" onClick={() => router.push(`/eventos/${id}`)} className="flex items-center gap-1">
          <ArrowLeft size={16} /> Voltar para o Evento
        </Button>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Editar Evento</CardTitle>
              <CardDescription>Atualize os detalhes do seu evento</CardDescription>
            </div>

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
                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento e removerá todos os dados
                    associados.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
                    {isDeleting ? "Excluindo..." : "Sim, excluir evento"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
            <Button type="button" variant="outline" onClick={() => router.push(`/eventos/${id}`)} className="mr-2">
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
