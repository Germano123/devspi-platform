"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth, type CommunityData } from "@/contexts/auth-context"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Pencil, Trash2, Plus, Globe, Lock } from "lucide-react"
import AdminRoute from "@/components/admin-route"
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

export default function AdminCommunitiesPage() {
  const [communities, setCommunities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [formData, setFormData] = useState<Omit<CommunityData, "createdBy" | "createdAt">>({
    name: "",
    bio: "",
    whatsappLink: "",
    websiteLink: "",
    isPrivate: false,
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const { user, getAdminCommunities, createCommunity, updateCommunity, deleteCommunity } = useAuth()

  useEffect(() => {
    fetchCommunities()
  }, [user])

  const fetchCommunities = async () => {
    setIsLoading(true)
    try {
      // TODO: get only communities that u r admin
      if (!user) return
      const allCommunities = await getAdminCommunities(user.uid)
      setCommunities(allCommunities)
    } catch (error) {
      console.error("Erro ao buscar comunidades:", error)
    } finally {
      setIsLoading(false)
    }
  }

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
      } else {
        await createCommunity({
          ...formData,
          createdBy: user.uid,
          createdAt: Date.now(),
        })
      }
      resetForm()
      fetchCommunities()
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
      fetchCommunities()
    } catch (error) {
      console.error("Erro ao excluir comunidade:", error)
    }
  }

  return (
    <AdminRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gerenciar Comunidades</h1>
            <p className="text-muted-foreground mt-2">Adicione, edite ou remova comunidades de desenvolvimento</p>
          </div>
          <div className="flex gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-1">
                  <Plus size={16} /> Nova Comunidade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-4/5 sm:max-w-[500px]">
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

        {isLoading ? (
          <div className="flex justify-center py-12">
            <p>Carregando comunidades...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {communities.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    Nenhuma comunidade cadastrada. Clique em "Nova Comunidade" para adicionar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              communities.map((community) => (
                <Card key={community.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="flex items-center gap-2">
                        {community.name}
                        {community.isPrivate ? (
                          <Lock size={16} className="text-muted-foreground" />
                        ) : (
                          <Globe size={16} className="text-muted-foreground" />
                        )}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => handleEdit(community)}
                            >
                              <Pencil size={16} />
                            </Button>
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

                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" size="icon" className="h-8 w-8">
                              <Trash2 size={16} />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Excluir Comunidade</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir a comunidade "{community.name}"? Esta ação não pode ser
                                desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(community.id)}>Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground">{community.bio}</p>
                  </CardContent>
                  <CardFooter className="pt-2 flex flex-col items-start gap-1">
                    {community.whatsappLink && (
                      <p className="text-xs">
                        <span className="font-medium">WhatsApp:</span> {community.whatsappLink}
                      </p>
                    )}
                    {community.websiteLink && (
                      <p className="text-xs">
                        <span className="font-medium">Website:</span> {community.websiteLink}
                      </p>
                    )}
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </AdminRoute>
  )
}
