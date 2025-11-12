"use client"

import type React from "react"

import { useState, useEffect, useRef, FormEvent } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import ProtectedRoute from "@/components/protected-route"
import { areasDeAtuacao } from "@/constants/areas.enum"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
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
import { Download, Shield } from "lucide-react"
import { jsPDF } from "jspdf"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Link from "next/link"
import { useProfile } from "@/contexts/profile.context"
import { Profile } from "@/lib/interfaces/profile.interface"

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaved, setIsSaved] = useState(false)

  const [formData, setFormData] = useState<Partial<Profile>>({});

  const [photoURL, setPhotoURL] = useState<string | undefined>("")
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)

  // Alterar para array de áreas selecionadas
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [nivelEnsino, setNivelEnsino] = useState("")

  const [experienceAmount, setExperienceAmount] = useState<string>("")
  const [experienceUnit, setExperienceUnit] = useState<string>("anos")

  // Cookie preferences
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true, // Essential cookies are always required
    performance: true,
    analytics: true,
    advertising: false,
  })

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    emailMarketing: true,
    newsletter: true,
  })

  // Loading states for actions
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user, logout } = useAuth()
  const { userProfile, getProfile, updateProfile, uploadProfilePhoto, deleteProfilePhoto } = useProfile();
  const router = useRouter()

  const combineExperienceValues = (): string => {
    if (!experienceAmount) return ""
    return `${experienceAmount} ${experienceUnit}`
  }

  const parseExperienceTime = (experienceTime: string): [string, string] => {
    if (!experienceTime) return ["", "anos"]

    const parts = experienceTime.trim().split(" ")
    if (parts.length >= 2) {
      return [parts[0], parts[1].toLowerCase() === "meses" ? "meses" : "anos"]
    }

    // Se não conseguir fazer o parse, retorna o valor original como quantidade e "anos" como unidade padrão
    return [experienceTime, "anos"]
  }

  // Atualizar o useEffect para carregar os novos campos
  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        setIsLoading(true);

        try {
          const profile = await getProfile(user.uid)
          if (profile) {
            setFormData(profile);

            setSelectedAreas(profile.areaAtuacao || [])
            setNivelEnsino(profile.nivelEnsino || "")
            setIsAdmin(profile.isAdmin)

            // Parse do tempo de experiência
            if (profile.tempoExperiencia) {
              const [amount, unit] = parseExperienceTime(profile.tempoExperiencia)
              setExperienceAmount(amount)
              setExperienceUnit(unit || "anos")
            }

            // Load cookie preferences if they exist
            if (profile.cookiePreferences) {
              setCookiePreferences({
                ...cookiePreferences,
                ...profile.cookiePreferences,
              })
            }

            // Load privacy settings if they exist
            if (profile.privacySettings) {
              setPrivacySettings({
                ...privacySettings,
                ...profile.privacySettings,
              })
            }
          }
        } catch (error) {
          console.error("Erro ao buscar perfil:", error)
        } finally {
          setIsLoading(false)
        }
      }
    }

    fetchProfile()
  }, [user, getProfile])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setIsLoading(true);
    setIsSaved(false);

    try {
      const formData = new FormData(e.currentTarget);

      const profileUpdate: Partial<Profile> = {
        firstName: formData.get("firstName") as string,
        lastName: formData.get("lastName") as string,
        githubUrl: formData.get("githubUrl") as string,
        linkedinUrl: formData.get("linkedinUrl") as string,
        portfolioUrl: formData.get("portfolioUrl") as string,
        nivelEnsino: formData.get("nivelEnsino") as string,
        areaAtuacao: selectedAreas,
        tempoExperiencia: combineExperienceValues(),
        cookiePreferences,
        privacySettings,
      }

      await updateProfile(user.uid, profileUpdate);
      setIsSaved(true);

      setTimeout(() => setIsSaved(false), 1000);
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
    } finally {
      setIsLoading(false);
    }
  }

  // const handlePhotoClick = () => {
  //   fileInputRef.current?.click()
  // }

  // const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   if (!user || !e.target.files || e.target.files.length === 0) return

  //   const file = e.target.files[0]
  //   setIsUploadingPhoto(true)

  //   try {
  //     const url = await uploadProfilePhoto(user.uid, file);
  //     if (url) setPhotoURL(url);
  //   } catch (error) {
  //     console.error("Erro ao fazer upload da foto:", error)
  //   } finally {
  //     setIsUploadingPhoto(false)
  //   }
  // }

  // const handleRemovePhoto = async () => {
  //   if (!user || !photoURL) return

  //   setIsUploadingPhoto(true)

  //   try {
  //     await deleteProfilePhoto(user.uid, photoURL)
  //     setPhotoURL(undefined)
  //   } catch (error) {
  //     console.error("Erro ao remover foto:", error)
  //   } finally {
  //     setIsUploadingPhoto(false)
  //   }
  // }

  // Handle cookie preference changes
  const handleCookiePreferenceChange = (type: keyof typeof cookiePreferences, checked: boolean) => {
    setCookiePreferences((prev) => ({
      ...prev,
      [type]: checked,
    }))
  }

  // Handle privacy setting changes
  const handlePrivacySettingChange = (type: keyof typeof privacySettings, checked: boolean) => {
    setPrivacySettings((prev) => ({
      ...prev,
      [type]: checked,
    }))
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!user) return

    setIsDeleting(true)
    try {
      // Here you would implement the actual account deletion logic
      // For now, we'll just log out the user
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Erro ao excluir conta:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  // Generate and download PDF with user data
  const handleDownloadPersonalData = async () => {
    if (!user || !userProfile) return

    setIsGeneratingPdf(true)
    try {
      const doc = new jsPDF()

      // Add title
      doc.setFontSize(20)
      doc.text("Seus Dados Pessoais", 20, 20)

      // Add user info
      doc.setFontSize(12)
      doc.text(`Nome: ${userProfile.firstName} ${userProfile.lastName}`, 20, 40)
      doc.text(`Email: ${user.email || "Não informado"}`, 20, 50)
      doc.text(`Github: ${userProfile.githubUrl || "Não informado"}`, 20, 60)
      doc.text(`LinkedIn: ${userProfile.linkedinUrl || "Não informado"}`, 20, 60)
      doc.text(`Portfólio: ${userProfile.portfolioUrl || "Não informado"}`, 20, 60)
      doc.text(`Tempo de Experiência: ${combineExperienceValues() || "Não informado"}`, 20, 70)
      doc.text(`Nível de Ensino: ${nivelEnsino || "Não informado"}`, 20, 80)

      // Add areas of expertise
      doc.text("Áreas de Atuação:", 20, 90)
      let yPosition = 100
      if (selectedAreas.length > 0) {
        selectedAreas.forEach((areaId) => {
          const area = areasDeAtuacao.find((a) => a.id === areaId)
          if (area) {
            doc.text(`- ${area.label}`, 25, yPosition)
            yPosition += 10
          }
        })
      } else {
        doc.text("- Nenhuma área selecionada", 25, yPosition)
      }

      // Add privacy settings
      yPosition += 10
      doc.text("Configurações de Privacidade:", 20, yPosition)
      yPosition += 10
      doc.text(`- Receber email marketing: ${privacySettings.emailMarketing ? "Sim" : "Não"}`, 25, yPosition)
      yPosition += 10
      doc.text(`- Inscrito na newsletter: ${privacySettings.newsletter ? "Sim" : "Não"}`, 25, yPosition)

      // Add cookie preferences
      yPosition += 10
      doc.text("Preferências de Cookies:", 20, yPosition)
      yPosition += 10
      doc.text(`- Cookies essenciais: ${cookiePreferences.essential ? "Aceito" : "Recusado"}`, 25, yPosition)
      yPosition += 10
      doc.text(`- Cookies de desempenho: ${cookiePreferences.performance ? "Aceito" : "Recusado"}`, 25, yPosition)
      yPosition += 10
      doc.text(`- Cookies analíticos: ${cookiePreferences.analytics ? "Aceito" : "Recusado"}`, 25, yPosition)
      yPosition += 10
      doc.text(`- Cookies de publicidade: ${cookiePreferences.advertising ? "Aceito" : "Recusado"}`, 25, yPosition)

      // Add footer
      doc.setFontSize(10)
      doc.text(`Dados gerados em ${new Date().toLocaleDateString()} às ${new Date().toLocaleTimeString()}`, 20, 280)

      // Save the PDF
      doc.save(`dados-pessoais-${userProfile.firstName.toLowerCase()}-${userProfile.lastName.toLowerCase()}.pdf`)
    } catch (error) {
      console.error("Erro ao gerar PDF:", error)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Save cookie preferences and privacy settings
  const handleSaveSettings = async () => {
    if (!user) return

    setIsLoading(true)
    try {
      await updateProfile(user.uid, {
        cookiePreferences,
        privacySettings,
      } as any)
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Seu Perfil</h1>
          {isAdmin && (
            <Link href="/super-admin">
              <Button variant="outline" className="flex items-center gap-2">
                <Shield size={16} />
                Área de Administração
              </Button>
            </Link>
          )}
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="settings">Configurações</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Atualize suas informações de perfil</CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Nome</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName || ""}
                      placeholder="Seu nome"
                      onChange={handleChange}
                      required
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Sobrenome</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName || ""}
                      placeholder={userProfile?.lastName || "Seu sobrenome"}
                      onChange={handleChange}
                      required
                      />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="linkedinUrl">URL do LinkedIn</Label>
                    <Input
                      id="linkedinUrl"
                      name="linkedinUrl"
                      value={formData.linkedinUrl || "https://www.linkedin.com/in"}
                      placeholder={userProfile?.linkedinUrl || "https://linkedin.com/in/seu-perfil"}
                      onChange={handleChange}
                      type="url"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="githubUrl">URL do Github</Label>
                    <Input
                      id="githubUrl"
                      name="githubUrl"
                      value={formData.githubUrl || "https://github.com/"}
                      placeholder={userProfile?.githubUrl || "https://github.com/seu-perfil"}
                      onChange={handleChange}
                      type="url"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="portfolioUrl">Portfólio</Label>
                    <Input
                      id="portfolioUrl"
                      name="portfolioUrl"
                      value={formData.portfolioUrl || ""}
                      placeholder={userProfile?.portfolioUrl || "https://portfolio.com/seu-portfolio"}
                      onChange={handleChange}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="experienceAmount">Tempo de Experiência</Label>
                      <Input
                        id="experienceAmount"
                        type="number"
                        min="0"
                        value={experienceAmount}
                        onChange={(e) => setExperienceAmount(e.target.value)}
                        placeholder="Ex: 2"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="experienceUnit">Unidade</Label>
                      <Select value={experienceUnit} onValueChange={setExperienceUnit}>
                        <SelectTrigger id="experienceUnit">
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="anos">Anos</SelectItem>
                          <SelectItem value="meses">Meses</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <option value="superior-andamento">Superior em Andamento</option>
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
          </TabsContent>

          <TabsContent value="settings">
            <div className="space-y-6 max-w-2xl mx-auto">
              {/* Cookie Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Preferências de Cookies</CardTitle>
                  <CardDescription>
                    Escolha quais tipos de cookies você permite que sejam usados ao navegar em nossa plataforma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cookies-essential"
                      checked={cookiePreferences.essential}
                      disabled={true} // Essential cookies cannot be disabled
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="cookies-essential" className="font-medium">
                        Cookies Essenciais
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Necessários para o funcionamento básico do site. Não podem ser desativados.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cookies-performance"
                      checked={cookiePreferences.performance}
                      onCheckedChange={(checked) => handleCookiePreferenceChange("performance", checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="cookies-performance" className="font-medium">
                        Cookies de Desempenho e Funcionalidade
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Ajudam a melhorar o desempenho e a funcionalidade do site, mas não são essenciais.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cookies-analytics"
                      checked={cookiePreferences.analytics}
                      onCheckedChange={(checked) => handleCookiePreferenceChange("analytics", checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="cookies-analytics" className="font-medium">
                        Cookies Analíticos e de Personalização
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Coletam informações sobre como você usa o site e nos ajudam a personalizar sua experiência.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cookies-advertising"
                      checked={cookiePreferences.advertising}
                      onCheckedChange={(checked) => handleCookiePreferenceChange("advertising", checked === true)}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="cookies-advertising" className="font-medium">
                        Cookies de Publicidade
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Usados para exibir anúncios relevantes com base em seus interesses.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Privacy Settings */}
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Privacidade</CardTitle>
                  <CardDescription>Gerencie suas preferências de privacidade e dados pessoais</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="email-marketing">Receber Email Marketing</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba emails sobre novidades, eventos e oportunidades
                        </p>
                      </div>
                      <Switch
                        id="email-marketing"
                        checked={privacySettings.emailMarketing}
                        onCheckedChange={(checked) => handlePrivacySettingChange("emailMarketing", checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="newsletter">Inscrição na Newsletter</Label>
                        <p className="text-sm text-muted-foreground">
                          Receba nossa newsletter mensal com conteúdos exclusivos
                        </p>
                      </div>
                      <Switch
                        id="newsletter"
                        checked={privacySettings.newsletter}
                        onCheckedChange={(checked) => handlePrivacySettingChange("newsletter", checked)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Solicitar Cópia das Informações Pessoais</Label>
                        <p className="text-sm text-muted-foreground">
                          Baixe uma cópia de todos os seus dados pessoais armazenados em nossa plataforma
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadPersonalData}
                        disabled={isGeneratingPdf}
                        className="flex items-center gap-2"
                      >
                        <Download size={16} />
                        {isGeneratingPdf ? "Gerando..." : "Baixar Dados"}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label className="text-destructive">Solicitar Exclusão de Conta</Label>
                        <p className="text-sm text-muted-foreground">
                          Exclua permanentemente sua conta e todos os dados associados
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" size="sm">
                            Excluir Conta
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente sua conta e removerá seus
                              dados de nossos servidores.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={handleDeleteAccount}
                              className="bg-destructive text-destructive-foreground"
                            >
                              {isDeleting ? "Excluindo..." : "Sim, excluir minha conta"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Save Settings Button */}
              <div className="flex justify-end">
                {isSaved && (
                  <p className="text-sm text-green-500 mr-4 self-center">Configurações salvas com sucesso!</p>
                )}
                <Button onClick={handleSaveSettings} disabled={isLoading}>
                  {isLoading ? "Salvando..." : "Salvar Configurações"}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ProtectedRoute>
  )
}
