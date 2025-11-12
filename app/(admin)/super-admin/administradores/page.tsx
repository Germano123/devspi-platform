"use client"

import { useState, useEffect } from "react"
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
import { Search, MoreHorizontal, Trash2, Plus, Mail } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

// Lista de emails de super admins
const SUPER_ADMIN_EMAILS = ["admin@devspi.com.br", "root@devspi.com.br"]

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([])
  const [filteredAdmins, setFilteredAdmins] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [newAdminEmail, setNewAdminEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Simulação de dados de administradores
  useEffect(() => {
    const mockAdmins = [
      { id: "1", email: "admin@devspi.com.br", role: "super-admin", lastLogin: new Date().getTime() - 86400000 },
      { id: "2", email: "root@devspi.com.br", role: "super-admin", lastLogin: new Date().getTime() - 172800000 },
      { id: "3", email: "moderator@devspi.com.br", role: "admin", lastLogin: new Date().getTime() - 259200000 },
    ]

    setAdmins(mockAdmins)
    setFilteredAdmins(mockAdmins)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = admins.filter(
        (admin) =>
          admin.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          admin.role?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredAdmins(filtered)
    } else {
      setFilteredAdmins(admins)
    }
  }, [searchTerm, admins])

  const handleAddAdmin = () => {
    if (!newAdminEmail) return

    // Implementação futura: Adicionar administrador
    const newAdmin = {
      id: `${admins.length + 1}`,
      email: newAdminEmail,
      role: "admin",
      lastLogin: null,
    }

    setAdmins([...admins, newAdmin])
    setFilteredAdmins([...filteredAdmins, newAdmin])
    setNewAdminEmail("")
  }

  const handleRemoveAdmin = (id: string) => {
    // Implementação futura: Remover administrador
    setAdmins(admins.filter((admin) => admin.id !== id))
    setFilteredAdmins(filteredAdmins.filter((admin) => admin.id !== id))
  }

  const handleSendInvite = (email: string) => {
    // Implementação futura: Enviar convite
    console.log("Enviando convite para:", email)
  }

  const isSuperAdmin = (email: string) => {
    return SUPER_ADMIN_EMAILS.includes(email)
  }

  if (isLoading) {
    return <div className="text-center py-10">Carregando administradores...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Administradores</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar administradores..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus size={16} /> Novo Admin
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Administrador</DialogTitle>
                <DialogDescription>
                  Adicione um novo administrador ao sistema. Um email de convite será enviado.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@exemplo.com"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
                <DialogClose asChild>
                  <Button type="button" onClick={handleAddAdmin} disabled={!newAdminEmail}>
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
          <CardTitle>Administradores ({filteredAdmins.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAdmins.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum administrador encontrado
                  </TableCell>
                </TableRow>
              ) : (
                filteredAdmins.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell className="font-medium">{admin.email}</TableCell>
                    <TableCell>
                      <Badge variant={admin.role === "super-admin" ? "default" : "outline"}>
                        {admin.role === "super-admin" ? "Super Admin" : "Admin"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {admin.lastLogin ? (
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200">
                          Ativo
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200">
                          Pendente
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {admin.lastLogin ? (
                        <span className="text-sm">{new Date(admin.lastLogin).toLocaleDateString()}</span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Nunca</span>
                      )}
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
                          {!admin.lastLogin && (
                            <DropdownMenuItem onClick={() => handleSendInvite(admin.email)}>
                              <Mail className="mr-2 h-4 w-4" />
                              Reenviar Convite
                            </DropdownMenuItem>
                          )}
                          {!isSuperAdmin(admin.email) && (
                            <>
                              <DropdownMenuSeparator />
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Remover Admin
                                  </DropdownMenuItem>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta ação removerá os privilégios de administrador de {admin.email}.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleRemoveAdmin(admin.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Sim, remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </>
                          )}
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
