"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
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
import { Search, MoreHorizontal, Pencil, Trash2, Plus, ExternalLink, Github, Linkedin, Award } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Checkbox } from "@/components/ui/checkbox"

export default function ContributorsAdminPage() {
  const { getAllContributors, getAllProfiles } = useAuth()
  const [contributors, setContributors] = useState<any[]>([])
  const [filteredContributors, setFilteredContributors] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [availableUsers, setAvailableUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])

  const { createContributor } = useAuth()

  useEffect(() => {
    const fetchContributors = async () => {
      setIsLoading(true)
      try {
        const [allContributors, allProfiles] = await Promise.all([getAllContributors(), getAllProfiles()])

        setContributors(allContributors)
        setFilteredContributors(allContributors)

        // Filter out users who are already contributors
        const contributorIds = allContributors.map((c) => c.userId)
        const availableUsers = allProfiles.filter((user) => !contributorIds.includes(user.id))
        setAvailableUsers(availableUsers)
      } catch (error) {
        console.error("Erro ao buscar contribuidores:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchContributors()
  }, [getAllContributors, getAllProfiles])

  useEffect(() => {
    if (searchTerm) {
      const filtered = contributors.filter(
        (contributor) =>
          contributor.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contributor.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          contributor.roles?.some((role: string) => role.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredContributors(filtered)
    } else {
      setFilteredContributors(contributors)
    }
  }, [searchTerm, contributors])

  const handleAddContributor = async () => {
    if (!selectedUser || selectedRoles.length === 0) return

    // Implementação futura: Adicionar contribuidor
    console.log("Adicionar contribuidor:", selectedUser, selectedRoles)
    createContributor({
      userId: selectedUser,
      roles: selectedRoles,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      joinedAt: Date.now(),
    })

    // Reset form
    setSelectedUser("")
    setSelectedRoles([])
  }

  const handleDeleteContributor = async (id: string) => {
    // Implementação futura: Deletar contribuidor
    console.log("Deletar contribuidor:", id)

    // Atualizar a lista de contribuidores após a exclusão
    setContributors(contributors.filter((contributor) => contributor.id !== id))
    setFilteredContributors(filteredContributors.filter((contributor) => contributor.id !== id))
  }

  const handleRoleToggle = (role: string) => {
    setSelectedRoles((prev) => (prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]))
  }

  const getRoleBadge = (role: string) => {
    const roles: Record<string, { label: string; className: string }> = {
      founder: {
        label: "Fundador",
        className: "bg-purple-100 text-purple-800",
      },
      developer: {
        label: "Desenvolvedor",
        className: "bg-blue-100 text-blue-800",
      },
      designer: {
        label: "Designer",
        className: "bg-pink-100 text-pink-800",
      },
      community: {
        label: "Comunidade",
        className: "bg-green-100 text-green-800",
      },
      "quality-assurance": {
        label: "Garantia de Qualidade",
        className: "bg-amber-100 text-amber-800",
      },
    }

    return roles[role] || { label: role, className: "bg-gray-100 text-gray-800" }
  }

  const formatDate = (timestamp: number) => {
    return format(new Date(timestamp), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  if (isLoading) {
    return <div className="text-center py-10">Carregando contribuidores...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Contribuidores</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar contribuidores..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus size={16} /> Novo Contribuidor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Contribuidor</DialogTitle>
                <DialogDescription>Selecione um usuário e atribua papéis de contribuidor.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="user">Usuário</Label>
                  <select
                    id="user"
                    className="w-full p-2 border rounded-md"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">Selecione um usuário</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Papéis</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {/* TODO: refactor this into roles for contributors */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-founder"
                        checked={selectedRoles.includes("founder")}
                        onCheckedChange={() => handleRoleToggle("founder")}
                      />
                      <Label htmlFor="role-founder">Fundador</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-developer"
                        checked={selectedRoles.includes("developer")}
                        onCheckedChange={() => handleRoleToggle("developer")}
                      />
                      <Label htmlFor="role-developer">Desenvolvedor</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-designer"
                        checked={selectedRoles.includes("designer")}
                        onCheckedChange={() => handleRoleToggle("designer")}
                      />
                      <Label htmlFor="role-designer">Designer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-community"
                        checked={selectedRoles.includes("community")}
                        onCheckedChange={() => handleRoleToggle("community")}
                      />
                      <Label htmlFor="role-community">Comunidade</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="role-qa"
                        checked={selectedRoles.includes("quality-assurance")}
                        onCheckedChange={() => handleRoleToggle("quality-assurance")}
                      />
                      <Label htmlFor="role-qa">Garantia de Qualidade</Label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button
                    type="button"
                    onClick={handleAddContributor}
                    disabled={!selectedUser || selectedRoles.length === 0}
                  >
                    Adicionar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contribuidores ({filteredContributors.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Papéis</TableHead>
                <TableHead>Desde</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContributors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum contribuidor encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredContributors.map((contributor) => (
                  <TableRow key={contributor.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={contributor.photoURL || ""} />
                          <AvatarFallback>
                            {contributor.firstName?.charAt(0)}
                            {contributor.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {contributor.firstName} {contributor.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">{contributor.userId}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {contributor.roles?.map((role: string) => (
                          <Badge key={role} className={getRoleBadge(role).className}>
                            {getRoleBadge(role).label}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Award size={14} className="text-muted-foreground" />
                        <span className="text-sm">{formatDate(contributor.joinedAt)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {contributor.githubUrl && (
                          <a
                            href={contributor.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Github size={16} />
                          </a>
                        )}
                        {contributor.linkedinUrl && (
                          <a
                            href={contributor.linkedinUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-foreground"
                          >
                            <Linkedin size={16} />
                          </a>
                        )}
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
                          <DropdownMenuItem onClick={() => window.open(`/contribuidores`, "_blank")}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Ver na Página
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => console.log("Editar contribuidor:", contributor.id)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Editar Papéis
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Remover
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação removerá {contributor.firstName} {contributor.lastName} da lista de
                                  contribuidores. Isso não exclui a conta do usuário.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteContributor(contributor.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sim, remover
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
