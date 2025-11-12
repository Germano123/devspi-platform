"use client"

import type React from "react"

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
import { Search, MoreHorizontal, Pencil, Trash2, Plus, Globe, Lock, Users, ExternalLink } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"

export default function CommunitiesAdminPage() {
  const { getAllCommunities, createCommunity, updateCommunity, deleteCommunity, user } = useAuth()
  const [communities, setCommunities] = useState<any[]>([])
  const [filteredCommunities, setFilteredCommunities] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    whatsappLink: "",
    websiteLink: "",
    isPrivate: false,
  })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    const fetchCommunities = async () => {
      setIsLoading(true)
      try {
        const allCommunities = await getAllCommunities()
        setCommunities(allCommunities)
        setFilteredCommunities(allCommunities)
      } catch (error) {
        console.error("Erro ao buscar comunidades:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCommunities()
  }, [getAllCommunities])

  useEffect(() => {
    if (searchTerm) {
      const filtered = communities.filter(
        (community) =>
          community.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          community.bio?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredCommunities(filtered)
    } else {
      setFilteredCommunities(communities)
    }
  }, [searchTerm, communities])

  const resetForm = () => {
    setFormData({
      name: "",
      bio: "",
      whatsappLink: "",
      websiteLink: "",
      isPrivate: false,
    })
    setEditingId(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isPrivate: checked,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingId) {
        await updateCommunity(editingId, {
          ...formData,
          createdBy: user.uid,
          createdAt: Date.now(),
        })

        // Atualizar a lista de comunidades
        setCommunities(
          communities.map((community) => (community.id === editingId ? { ...community, ...formData } : community)),
        )
      } else {
        const newCommunity = await createCommunity({
          ...formData,
          createdBy: user.uid,
          createdAt: Date.now(),
        })

        // Adicionar a nova comunidade à lista
        setCommunities([...communities, { id: newCommunity, ...formData }])
      }

      resetForm()
    } catch (error) {
      console.error("Erro ao salvar comunidade:", error)
    }
  }

  const handleEdit = (community: any) => {
    setFormData({
      name: community.name,
      bio: community.bio,
      whatsappLink: community.whatsappLink || "",
      websiteLink: community.websiteLink || "",
      isPrivate: community.isPrivate || false,
    })
    setEditingId(community.id)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCommunity(id)

      // Remover a comunidade da lista
      setCommunities(communities.filter((community) => community.id !== id))
      setFilteredCommunities(filteredCommunities.filter((community) => community.id !== id))
    } catch (error) {
      console.error("Erro ao excluir comunidade:", error)
    }
  }

  if (isLoading) {
    return <div className="text-center py-10">Carregando comunidades...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Comunidades</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar comunidades..."
              className="pl-8 w-[250px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-1">
                <Plus size={16} /> Nova Comunidade
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingId ? "Editar Comunidade" : "Nova Comunidade"}</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da comunidade. Clique em salvar quando terminar.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome da Comunidade</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Biografia</Label>
                    <Textarea id="bio" name="bio" value={formData.bio} onChange={handleInputChange} rows={4} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsappLink">Link do WhatsApp</Label>
                    <Input
                      id="whatsappLink"
                      name="whatsappLink"
                      value={formData.whatsappLink}
                      onChange={handleInputChange}
                      placeholder="https://chat.whatsapp.com/..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="websiteLink">Link do Website</Label>
                    <Input
                      id="websiteLink"
                      name="websiteLink"
                      value={formData.websiteLink}
                      onChange={handleInputChange}
                      placeholder="https://..."
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch id="isPrivate" checked={formData.isPrivate} onCheckedChange={handleSwitchChange} />
                    <div>
                      <Label htmlFor="isPrivate" className="flex items-center gap-2">
                        {formData.isPrivate ? (
                          <>
                            <Lock size={16} /> Comunidade Privada
                          </>
                        ) : (
                          <>
                            <Globe size={16} /> Comunidade Pública
                          </>
                        )}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {formData.isPrivate
                          ? "Novos membros precisam de aprovação para entrar"
                          : "Qualquer pessoa pode entrar na comunidade"}
                      </p>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button type="submit">{editingId ? "Atualizar" : "Criar"}</Button>
                  </DialogClose>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Comunidades ({filteredCommunities.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Links</TableHead>
                <TableHead>Membros</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCommunities.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhuma comunidade encontrada
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommunities.map((community) => (
                  <TableRow key={community.id}>
                    <TableCell className="font-medium">{community.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {community.isPrivate ? (
                          <div className="flex items-center">
                            <Lock size={16} className="mr-1 text-amber-500" />
                            <span>Privada</span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Globe size={16} className="mr-1 text-green-500" />
                            <span>Pública</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {community.whatsappLink && (
                          <a
                            href={community.whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center"
                          >
                            <ExternalLink size={12} className="mr-1" /> WhatsApp
                          </a>
                        )}
                        {community.websiteLink && (
                          <a
                            href={community.websiteLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary hover:underline flex items-center"
                          >
                            <ExternalLink size={12} className="mr-1" /> Website
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-xs"
                        onClick={() => window.open(`/community-admin/${community.id}`, "_blank")}
                      >
                        <Users size={14} /> Ver Membros
                      </Button>
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
                          <Dialog>
                            <DialogTrigger asChild>
                              <DropdownMenuItem
                                onSelect={(e) => {
                                  e.preventDefault()
                                  handleEdit(community)
                                }}
                              >
                                <Pencil className="mr-2 h-4 w-4" />
                                Editar
                              </DropdownMenuItem>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px]">
                              <DialogHeader>
                                <DialogTitle>Editar Comunidade</DialogTitle>
                                <DialogDescription>
                                  Atualize os detalhes da comunidade. Clique em salvar quando terminar.
                                </DialogDescription>
                              </DialogHeader>
                              <form onSubmit={handleSubmit}>
                                <div className="space-y-4 py-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">Nome da Comunidade</Label>
                                    <Input
                                      id="name"
                                      name="name"
                                      value={formData.name}
                                      onChange={handleInputChange}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="bio">Biografia</Label>
                                    <Textarea
                                      id="bio"
                                      name="bio"
                                      value={formData.bio}
                                      onChange={handleInputChange}
                                      rows={4}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="whatsappLink">Link do WhatsApp</Label>
                                    <Input
                                      id="whatsappLink"
                                      name="whatsappLink"
                                      value={formData.whatsappLink}
                                      onChange={handleInputChange}
                                      placeholder="https://chat.whatsapp.com/..."
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="websiteLink">Link do Website</Label>
                                    <Input
                                      id="websiteLink"
                                      name="websiteLink"
                                      value={formData.websiteLink}
                                      onChange={handleInputChange}
                                      placeholder="https://..."
                                    />
                                  </div>
                                  <div className="flex items-center space-x-2 pt-2">
                                    <Switch
                                      id="isPrivate"
                                      checked={formData.isPrivate}
                                      onCheckedChange={handleSwitchChange}
                                    />
                                    <div>
                                      <Label htmlFor="isPrivate" className="flex items-center gap-2">
                                        {formData.isPrivate ? (
                                          <>
                                            <Lock size={16} /> Comunidade Privada
                                          </>
                                        ) : (
                                          <>
                                            <Globe size={16} /> Comunidade Pública
                                          </>
                                        )}
                                      </Label>
                                      <p className="text-sm text-muted-foreground">
                                        {formData.isPrivate
                                          ? "Novos membros precisam de aprovação para entrar"
                                          : "Qualquer pessoa pode entrar na comunidade"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button type="button" variant="outline" onClick={resetForm}>
                                      Cancelar
                                    </Button>
                                  </DialogClose>
                                  <DialogClose asChild>
                                    <Button type="submit">Atualizar</Button>
                                  </DialogClose>
                                </DialogFooter>
                              </form>
                            </DialogContent>
                          </Dialog>
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
                                  Esta ação não pode ser desfeita. Isso excluirá permanentemente a comunidade "
                                  {community.name}" e removerá todos os dados associados.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(community.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Sim, excluir comunidade
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
