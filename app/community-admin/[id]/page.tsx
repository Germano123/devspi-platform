"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth, type Community, type CommunityMember } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Check, X, UserPlus, Settings, Users, Globe, Lock } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
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

export default function CommunityAdminPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const {
    user,
    getCommunity,
    updateCommunity,
    getCommunityMembers,
    updateMemberRole,
    leaveCommunity,
    isCommunityAdmin,
  } = useAuth()

  const [community, setCommunity] = useState<Community | null>(null)
  const [members, setMembers] = useState<CommunityMember[]>([])
  const [pendingMembers, setPendingMembers] = useState<CommunityMember[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    whatsappLink: "",
    websiteLink: "",
    linkedinLink: "", 
    youtubeLink: "", 
    mastodonLink: "", 
    facebookLink: "", 
    isPrivate: false,
  })

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Verificar se o usuário é admin da comunidade
        const adminStatus = await isCommunityAdmin(user.uid, id)
        setIsAdmin(adminStatus)

        if (!adminStatus) {
          router.push("/communities")
          return
        }

        // Buscar dados da comunidade
        const communityData = await getCommunity(id)
        if (communityData) {
          setCommunity(communityData)
          setFormData({
            name: communityData.name,
            bio: communityData.bio,
            whatsappLink: communityData.whatsappLink || "",
            websiteLink: communityData.websiteLink || "",
            linkedinLink: communityData.linkedinLink || "",
            youtubeLink: communityData.youtubeLink || "",
            mastodonLink: communityData.mastodonLink || "",
            facebookLink: communityData.facebookLink || "",
            isPrivate: communityData.isPrivate || false,
          })
        }

        // Buscar membros da comunidade
        const allMembers = await getCommunityMembers(id)
        setMembers(allMembers.filter((member) => member.role !== "pending"))
        setPendingMembers(allMembers.filter((member) => member.role === "pending"))
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [user, id, getCommunity, getCommunityMembers, isCommunityAdmin, router])

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

  const handleSaveSettings = async () => {
    if (!community) return

    setIsSaving(true)
    try {
      await updateCommunity(id, {
        ...community,
        name: formData.name,
        bio: formData.bio,
        whatsappLink: formData.whatsappLink,
        websiteLink: formData.websiteLink,
        youtubeLink: formData.youtubeLink,
        facebookLink: formData.facebookLink,
        mastodonLink: formData.mastodonLink,
        instagramLink: formData.instagramLink,
        isPrivate: formData.isPrivate,
      })

      // Atualizar o estado local
      setCommunity((prev) => {
        if (!prev) return null
        return {
          ...prev,
          name: formData.name,
          bio: formData.bio,
          whatsappLink: formData.whatsappLink,
          websiteLink: formData.websiteLink,
          youtubeLink: formData.youtubeLink,
          facebookLink: formData.facebookLink,
          mastodonLink: formData.mastodonLink,
          instagramLink: formData.instagramLink,
          isPrivate: formData.isPrivate,
        }
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateMemberRole(id, userId, newRole)

      // Atualizar a lista de membros
      setMembers((prev) => prev.map((member) => (member.userId === userId ? { ...member, role: newRole } : member)))
    } catch (error) {
      console.error("Erro ao atualizar papel do membro:", error)
    }
  }

  const handleRemoveMember = async (userId: string) => {
    try {
      await leaveCommunity(userId, id)

      // Remover o membro da lista
      setMembers((prev) => prev.filter((member) => member.userId !== userId))
    } catch (error) {
      console.error("Erro ao remover membro:", error)
    }
  }

  const handleApproveMember = async (userId: string) => {
    try {
      await updateMemberRole(id, userId, "member")

      // Mover o membro de pendente para aprovado
      const approvedMember = pendingMembers.find((member) => member.userId === userId)
      if (approvedMember) {
        const updatedMember = { ...approvedMember, role: "member" }
        setMembers((prev) => [...prev, updatedMember])
        setPendingMembers((prev) => prev.filter((member) => member.userId !== userId))
      }
    } catch (error) {
      console.error("Erro ao aprovar membro:", error)
    }
  }

  const handleRejectMember = async (userId: string) => {
    try {
      await leaveCommunity(userId, id)

      // Remover o membro pendente da lista
      setPendingMembers((prev) => prev.filter((member) => member.userId !== userId))
    } catch (error) {
      console.error("Erro ao rejeitar membro:", error)
    }
  }

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8 px-4">
          <p className="text-center">Carregando...</p>
        </div>
      </ProtectedRoute>
    )
  }

  if (!isAdmin || !community) {
    return (
      <ProtectedRoute>
        <div className="container mx-auto py-8 px-4">
          <p className="text-center">Você não tem permissão para acessar esta página.</p>
          <div className="flex justify-center mt-4">
            <Button onClick={() => router.push("/communities")}>Voltar para Comunidades</Button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">{community.name}</h1>
            <p className="text-muted-foreground mt-1">Administração da Comunidade</p>
          </div>
          <Button variant="outline" onClick={() => router.push("/communities")}>
            Voltar para Comunidades
          </Button>
        </div>

        <Tabs defaultValue="members">
          <TabsList className="mb-6">
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users size={16} />
              Membros
              {pendingMembers.length > 0 && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  {pendingMembers.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings size={16} />
              Configurações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <div className="space-y-6">
              {/* Solicitações pendentes */}
              {pendingMembers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Solicitações Pendentes</CardTitle>
                    <CardDescription>Usuários que solicitaram participar da comunidade</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pendingMembers.map((member) => (
                        <div
                          key={member.userId}
                          className="flex items-center justify-between p-3 bg-muted/40 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.photoURL || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.firstName?.charAt(0)}
                                {member.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Solicitado em {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1"
                              onClick={() => handleApproveMember(member.userId)}
                            >
                              <Check size={14} /> Aprovar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex items-center gap-1 text-destructive"
                              onClick={() => handleRejectMember(member.userId)}
                            >
                              <X size={14} /> Rejeitar
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Membros atuais */}
              <Card>
                <CardHeader>
                  <CardTitle>Membros da Comunidade</CardTitle>
                  <CardDescription>Gerencie os membros e suas permissões</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {members.length === 0 ? (
                      <p className="text-center text-muted-foreground py-4">Nenhum membro na comunidade ainda.</p>
                    ) : (
                      members.map((member) => (
                        <div
                          key={member.userId}
                          className="flex items-center justify-between p-3 bg-muted/40 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={member.photoURL || "/placeholder.svg"} />
                              <AvatarFallback>
                                {member.firstName?.charAt(0)}
                                {member.lastName?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {member.firstName} {member.lastName}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Entrou em {new Date(member.joinedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Select
                              value={member.role}
                              onValueChange={(value) => handleRoleChange(member.userId, value)}
                              disabled={member.userId === user?.uid} // Não permitir alterar o próprio papel
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="admin">Administrador</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="member">Membro</SelectItem>
                              </SelectContent>
                            </Select>

                            {member.userId !== user?.uid && ( // Não permitir remover a si mesmo
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="icon" className="text-destructive">
                                    <X size={16} />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remover membro</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Tem certeza que deseja remover {member.firstName} {member.lastName} da comunidade?
                                      Esta ação não pode ser desfeita.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleRemoveMember(member.userId)}>
                                      Remover
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2">
                        <UserPlus size={16} /> Adicionar Membro
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Adicionar Membro</DialogTitle>
                        <DialogDescription>Adicione um novo membro à comunidade pelo email.</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="email">Email do usuário</Label>
                          <Input id="email" placeholder="usuario@exemplo.com" />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role">Papel na comunidade</Label>
                          <Select defaultValue="member">
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrador</SelectItem>
                              <SelectItem value="editor">Editor</SelectItem>
                              <SelectItem value="member">Membro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button variant="outline">Cancelar</Button>
                        </DialogClose>
                        <Button>Adicionar</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações da Comunidade</CardTitle>
                <CardDescription>Atualize as informações e configurações da sua comunidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Comunidade</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Descrição</Label>
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

                <div className="space-y-2">
                  <Label htmlFor="linkedinLink">Link do LinkedIn</Label>
                  <Input
                    id="linkedinLink"
                    name="linkedinLink"
                    value={formData.linkedinLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instagramLink">Link do Instagram</Label>
                  <Input
                    id="instagramLink"
                    name="instagramLink"
                    value={formData.instagramLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="facebookLink">Link do Facebook</Label>
                  <Input
                    id="facebookLink"
                    name="facebookLink"
                    value={formData.facebookLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="youtubeLink">Link do YouTube</Label>
                  <Input
                    id="youtubeLink"
                    name="youtubeLink"
                    value={formData.youtubeLink}
                    onChange={handleInputChange}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mastodonLink">Link do Mastodon</Label>
                  <Input
                    id="mastodonLink"
                    name="mastodonLink"
                    value={formData.mastodonLink}
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
              </CardContent>
              <CardFooter>
                <Button onClick={handleSaveSettings} disabled={isSaving} className="ml-auto">
                  {isSaving ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
