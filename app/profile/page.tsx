"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useAuth, type ProfileData } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import ProtectedRoute from "@/components/protected-route"
import { areasDeAtuacao } from '../../constants/areas.enum'

export default function ProfilePage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [linkedinUrl, setLinkedinUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [photoURL, setPhotoURL] = useState<string | undefined>("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // Alterar para array de áreas selecionadas
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [tempoExperiencia, setTempoExperiencia] = useState("")
  const [nivelEnsino, setNivelEnsino] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, logout, getUserProfile, updateUserProfile, uploadProfilePhoto, deleteProfilePhoto } = useAuth()
  const router = useRouter()

  // Atualizar o useEffect para carregar os novos campos
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setIsLoading(true)
        try {
          const profile = await getUserProfile(user.uid)
          if (profile) {
            setFirstName(profile.firstName || "")
            setLastName(profile.lastName || "")
            setLinkedinUrl(profile.linkedinUrl || "")
            setSelectedAreas(profile.areaAtuacao || [])
            setTempoExperiencia(profile.tempoExperiencia || "")
            setNivelEnsino(profile.nivelEnsino || "")
            // setPhotoURL(profile.photoURL)
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()
  }, [user, getUserProfile])

  // Função para alternar a seleção de uma área
  const toggleArea = (areaId: string) => {
    setSelectedAreas((prev) => {
      if (prev.includes(areaId)) {
        return prev.filter((id) => id !== areaId)
      } else {
        return [...prev, areaId]
      }
    })
  }

  // Atualizar o handleSubmit para incluir os novos campos
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true)
    setIsSaved(false)

    try {
      const profileData: ProfileData = {
        firstName,
        lastName,
        linkedinUrl,
        areaAtuacao: selectedAreas,
        tempoExperiencia,
        nivelEnsino,
        // photoURL,
      }

      await updateUserProfile(user.uid, profileData)
      setIsSaved(true)

      // Reset saved message after 3 seconds
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/login")
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
    }
  }

  const handlePhotoClick = () => {
    // fileInputRef.current?.click()
  }

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user || !e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    setIsUploadingPhoto(true)

    try {
      const url = await uploadProfilePhoto(user.uid, file)
      // setPhotoURL(url)
    } catch (error) {
      console.error("Erro ao fazer upload da foto:", error)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleRemovePhoto = async () => {
    if (!user || !photoURL) return

    setIsUploadingPhoto(true)

    try {
      await deleteProfilePhoto(user.uid, photoURL)
      setPhotoURL(undefined)
    } catch (error) {
      console.error("Erro ao remover foto:", error)
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Seu Perfil</h1>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            {/*
            <div className="flex flex-col items-center mb-4">
              <div className="relative group">
                <div
                  className="w-24 h-24 rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer"
                  onClick={handlePhotoClick}
                >
                  { photoURL ? (
                    <img
                      src={photoURL || "/placeholder.svg"}
                      alt="Foto de perfil"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-2xl text-muted-foreground">
                      {firstName && lastName ? `${firstName.charAt(0)}${lastName.charAt(0)}` : "?"}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white" size={24} />
                  </div>
                </div>
                { photoURL && (
                  <button
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleRemovePhoto}
                    disabled={isUploadingPhoto}
                    type="button"
                  >
                    <X size={14} />
                  </button>
                ) }
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  disabled={isUploadingPhoto}
                />
              </div>
              {isUploadingPhoto && <p className="text-sm mt-2">Processando imagem...</p>}
            </div>
            */}

            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações de perfil</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Seu nome"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Seu sobrenome"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedinUrl">URL do LinkedIn</Label>
                <Input
                  id="linkedinUrl"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/seu-perfil"
                  type="url"
                />
              </div>

              {/* Área de atuação com múltipla seleção */}
              <div className="space-y-3">
                <Label>Áreas de Atuação (selecione uma ou mais)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {areasDeAtuacao.map((area) => (
                    <div key={area.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`area-${area.id}`}
                        checked={selectedAreas.includes(area.id)}
                        onCheckedChange={() => toggleArea(area.id)}
                      />
                      <Label htmlFor={`area-${area.id}`} className="cursor-pointer">
                        {area.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {selectedAreas.length === 0 && (
                  <p className="text-sm text-red-500">Selecione pelo menos uma área de atuação</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempoExperiencia">Tempo de Experiência</Label>
                <Input
                  id="tempoExperiencia"
                  value={tempoExperiencia}
                  onChange={(e) => setTempoExperiencia(e.target.value)}
                  placeholder="Ex: 2 anos"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nivelEnsino">Nível de Ensino</Label>
                <select
                  id="nivelEnsino"
                  value={nivelEnsino}
                  onChange={(e) => setNivelEnsino(e.target.value)}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Selecione um nível</option>
                  <option value="medio-incompleto">Médio Incompleto</option>
                  <option value="medio-completo">Médio Completo</option>
                  <option value="tecnico-incompleto">Técnico Incompleto</option>
                  <option value="tecnico-completo">Técnico Completo</option>
                  <option value="superior-incompleto">Superior Incompleto</option>
                  <option value="superior-completo">Superior Completo</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {isSaved && <p className="text-sm text-green-500">Perfil salvo com sucesso!</p>}
              <Button type="submit" disabled={isLoading || selectedAreas.length === 0} className="ml-auto">
                {isLoading ? "Salvando..." : "Salvar Perfil"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
