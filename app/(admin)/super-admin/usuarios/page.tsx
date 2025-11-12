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
import { Search, MoreHorizontal, UserX, Mail, Eye, Filter, ChevronLeft, ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { areasDeAtuacao } from "@/constants/areas.enum"

export default function UsersAdminPage() {
  const { getAllProfiles } = useAuth()
  const [users, setUsers] = useState<any[]>([])
  const [filteredUsers, setFilteredUsers] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  // Estados para paginação
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Estados para colunas visíveis
  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    id: true,
    areas: true,
    experience: true,
  })

  // Estados para filtros adicionais
  const [areaFilter, setAreaFilter] = useState<string[]>([])
  const [experienceFilter, setExperienceFilter] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true)
      try {
        const allUsers = await getAllProfiles()
        setUsers(allUsers)
        setFilteredUsers(allUsers)
      } catch (error) {
        console.error("Erro ao buscar usuários:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsers()
  }, [getAllProfiles])

  useEffect(() => {
    let filtered = users

    // Aplicar filtro de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Aplicar filtro de área de atuação
    if (areaFilter.length > 0) {
      filtered = filtered.filter((user) => user.areaAtuacao?.some((area: string) => areaFilter.includes(area)))
    }

    // Aplicar filtro de experiência
    if (experienceFilter) {
      filtered = filtered.filter((user) => user.tempoExperiencia === experienceFilter)
    }

    setFilteredUsers(filtered)
  }, [searchTerm, users, areaFilter, experienceFilter])

  const handleDeleteUser = async (userId: string) => {
    // Implementação futura: Deletar usuário
    console.log("Deletar usuário:", userId)

    // Atualizar a lista de usuários após a exclusão
    setUsers(users.filter((user) => user.id !== userId))
    setFilteredUsers(filteredUsers.filter((user) => user.id !== userId))
  }

  const handleSendEmail = (userId: string) => {
    // Implementação futura: Enviar email para o usuário
    console.log("Enviar email para:", userId)
  }

  // Cálculos para paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentUsers = filteredUsers.slice(startIndex, endIndex)

  // Função para alternar para a próxima página
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
    }
  }

  // Função para alternar para a página anterior
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
    }
  }

  // Função para alternar visibilidade das colunas
  const toggleColumn = (column: keyof typeof visibleColumns) => {
    setVisibleColumns({
      ...visibleColumns,
      [column]: !visibleColumns[column],
    })
  }

  // Função para alternar filtro de área
  const toggleAreaFilter = (area: string) => {
    setAreaFilter((prev) => (prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]))
  }

  if (isLoading) {
    return <div className="text-center py-10">Carregando usuários...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar usuários..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Usuários ({filteredUsers.length})</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(value) => {
                setItemsPerPage(Number.parseInt(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="10 por página" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 por página</SelectItem>
                <SelectItem value="10">10 por página</SelectItem>
                <SelectItem value="20">20 por página</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        {showFilters && (
          <div className="px-6 py-3 border-b">
            <div className="mb-4">
              <h3 className="text-sm font-medium mb-2">Colunas visíveis</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <Switch id="column-name" checked={visibleColumns.name} onCheckedChange={() => toggleColumn("name")} />
                  <Label htmlFor="column-name">Nome</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="column-id" checked={visibleColumns.id} onCheckedChange={() => toggleColumn("id")} />
                  <Label htmlFor="column-id">ID</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="column-areas"
                    checked={visibleColumns.areas}
                    onCheckedChange={() => toggleColumn("areas")}
                  />
                  <Label htmlFor="column-areas">Áreas de Atuação</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="column-experience"
                    checked={visibleColumns.experience}
                    onCheckedChange={() => toggleColumn("experience")}
                  />
                  <Label htmlFor="column-experience">Experiência</Label>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Áreas de Atuação</h3>
                <div className="flex flex-wrap gap-2 max-h-[150px] overflow-y-auto">
                  {areasDeAtuacao.map((area) => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${area.id}`}
                        checked={areaFilter.includes(area.id)}
                        onCheckedChange={() => toggleAreaFilter(area.id)}
                      />
                      <label htmlFor={`area-${area.id}`} className="text-sm cursor-pointer">
                        {area.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Tempo de Experiência</h3>
                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione a experiência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="Menos de 1 ano">Menos de 1 ano</SelectItem>
                    <SelectItem value="1-3 anos">1-3 anos</SelectItem>
                    <SelectItem value="3-5 anos">3-5 anos</SelectItem>
                    <SelectItem value="5-10 anos">5-10 anos</SelectItem>
                    <SelectItem value="Mais de 10 anos">Mais de 10 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {visibleColumns.name && <TableHead>Nome</TableHead>}
                {visibleColumns.id && <TableHead>ID</TableHead>}
                {visibleColumns.areas && <TableHead>Áreas de Atuação</TableHead>}
                {visibleColumns.experience && <TableHead>Experiência</TableHead>}
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentUsers.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={Object.values(visibleColumns).filter(Boolean).length + 1}
                    className="text-center py-4"
                  >
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                currentUsers.map((user) => (
                  <TableRow key={user.id}>
                    {visibleColumns.name && (
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                    )}
                    {visibleColumns.id && <TableCell className="text-xs text-muted-foreground">{user.id}</TableCell>}
                    {visibleColumns.areas && (
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {user.areaAtuacao?.slice(0, 2).map((area: string) => (
                            <Badge key={area} variant="outline" className="text-xs">
                              {area}
                            </Badge>
                          ))}
                          {user.areaAtuacao?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{user.areaAtuacao.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    )}
                    {visibleColumns.experience && <TableCell>{user.tempoExperiencia || "Não informado"}</TableCell>}
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
                          <DropdownMenuItem onClick={() => window.open(`/profile/${user.id}`, "_blank")}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Perfil
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(user.id)}>
                            <Mail className="mr-2 h-4 w-4" />
                            Enviar Email
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                <UserX className="mr-2 h-4 w-4" />
                                Excluir Usuário
                              </DropdownMenuItem>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a conta do usuário e
                                  removerá seus dados de nossos servidores.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sim, excluir usuário
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

          {/* Controles de paginação */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {startIndex + 1}-{Math.min(endIndex, filteredUsers.length)} de {filteredUsers.length} usuários
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={prevPage} disabled={currentPage === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="text-sm">
                Página {currentPage} de {totalPages || 1}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={nextPage}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
