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
import { Search, MoreHorizontal, Pencil, Trash2, Calendar, MapPin, Users, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function EventsAdminPage() {
  const { getAllEvents, deleteEvent } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [filteredEvents, setFilteredEvents] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      try {
        const allEvents = await getAllEvents()
        setEvents(allEvents)
        setFilteredEvents(allEvents)
      } catch (error) {
        console.error("Erro ao buscar eventos:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [getAllEvents])

  useEffect(() => {
    if (searchTerm) {
      const filtered = events.filter(
        (event) =>
          event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.location?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredEvents(filtered)
    } else {
      setFilteredEvents(events)
    }
  }, [searchTerm, events])

  const handleDelete = async (id: string) => {
    try {
      await deleteEvent(id)

      // Remover o evento da lista
      setEvents(events.filter((event) => event.id !== id))
      setFilteredEvents(filteredEvents.filter((event) => event.id !== id))
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
    }
  }

  const formatEventDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
  }

  const getAttractionTypeBadge = (type: string) => {
    const types: Record<string, { label: string; className: string }> = {
      palestra: {
        label: "Palestra",
        className: "bg-blue-100 text-blue-800",
      },
      workshop: {
        label: "Workshop",
        className: "bg-green-100 text-green-800",
      },
      roda_de_conversa: {
        label: "Roda de Conversa",
        className: "bg-purple-100 text-purple-800",
      },
      oficina: {
        label: "Oficina",
        className: "bg-amber-100 text-amber-800",
      },
      meetup: {
        label: "Meetup",
        className: "bg-pink-100 text-pink-800",
      },
      hackathon: {
        label: "Hackathon",
        className: "bg-red-100 text-red-800",
      },
      outro: {
        label: "Outro",
        className: "bg-gray-100 text-gray-800",
      },
    }

    return types[type] || types.outro
  }

  if (isLoading) {
    return <div className="text-center py-10">Carregando eventos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Eventos</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar eventos..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button className="flex items-center gap-1" onClick={() => window.open("/eventos/criar", "_blank")}>
            <Calendar size={16} /> Novo Evento
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos ({filteredEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Local</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Participantes</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-4">
                    Nenhum evento encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar size={14} className="text-muted-foreground" />
                        <span className="text-sm">{formatEventDate(event.date)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-muted-foreground" />
                        <span className="text-sm">{event.isOnline ? "Online" : event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getAttractionTypeBadge(event.attractionType).className}>
                        {getAttractionTypeBadge(event.attractionType).label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users size={14} className="text-muted-foreground" />
                        <span className="text-sm">
                          {event.interestedCount} interessados · {event.attendeesCount} confirmados
                        </span>
                      </div>
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
                          <DropdownMenuItem onClick={() => window.open(`/eventos/${event.id}`, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver Evento
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => window.open(`/eventos/${event.id}/editar`, "_blank")}>
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
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento "{event.title}
                                  " e removerá todos os dados associados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(event.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sim, excluir evento
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
