"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"

export default function CreateProjectPage() {
  const router = useRouter()
  const { user, createProject } = useAuth()

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<"portfolio" | "commercial" | "scientific" | "">("")
  const [imageUrl, setImageUrl] = useState("")
  const [externalLink, setExternalLink] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !title || !description || !category) {
      setError("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const projectData = {
        title,
        description,
        category: category as "portfolio" | "commercial" | "scientific",
        authorId: user.uid,
        createdAt: Date.now(),
        imageUrl: imageUrl || "",
        externalLink: externalLink || "",
      }

      const projectId = await createProject(projectData)
      router.push(`/made-in-piaui/${projectId}`)
    } catch (error) {
      console.error("Erro ao criar projeto:", error)
      setError("Erro ao criar projeto. Tente novamente mais tarde.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/made-in-piaui")} className="flex items-center gap-1">
            <ArrowLeft size={16} /> Voltar para Projetos
          </Button>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Adicionar Novo Projeto</CardTitle>
            <CardDescription>Compartilhe seu projeto com a comunidade</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Projeto *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Sistema de Gestão Escolar"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descreva seu projeto, seus objetivos, tecnologias utilizadas e resultados alcançados"
                  rows={5}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select
                  value={category}
                  onValueChange={(value: "portfolio" | "commercial" | "scientific") => setCategory(value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portfolio">Portfólio</SelectItem>
                    <SelectItem value="commercial">Comercial</SelectItem>
                    <SelectItem value="scientific">Científico</SelectItem>
                  </SelectContent>
                </Select>
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
                  Adicione uma URL de imagem para ilustrar seu projeto. Recomendamos usar imagens de 1200x630 pixels.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="externalLink">Link Externo (opcional)</Label>
                <Input
                  id="externalLink"
                  type="url"
                  value={externalLink}
                  onChange={(e) => setExternalLink(e.target.value)}
                  placeholder="https://meu-projeto.com"
                />
                <p className="text-xs text-muted-foreground">
                  Adicione um link para o projeto, repositório, artigo ou qualquer outro recurso externo relacionado.
                </p>
              </div>

              {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}
            </CardContent>
            <CardFooter>
              <Button type="button" variant="outline" onClick={() => router.push("/made-in-piaui")} className="mr-2">
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Enviando..." : "Adicionar Projeto"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
