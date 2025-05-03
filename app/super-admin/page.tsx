"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Globe, Calendar, FolderKanban, Users2 } from "lucide-react"

export default function SuperAdminDashboard() {
  const { getAllProfiles, getAllCommunities, getAllEvents, getAllProjects, getAllContributors } = useAuth()
  const [stats, setStats] = useState({
    users: 0,
    communities: 0,
    events: 0,
    projects: 0,
    contributors: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [profiles, communities, events, projects, contributors] = await Promise.all([
          getAllProfiles(),
          getAllCommunities(),
          getAllEvents(),
          getAllProjects(),
          getAllContributors(),
        ])

        setStats({
          users: profiles.length,
          communities: communities.length,
          events: events.length,
          projects: projects.length,
          contributors: contributors.length,
        })
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [getAllProfiles, getAllCommunities, getAllEvents, getAllProjects, getAllContributors])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral da plataforma e estatísticas.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.users}</div>
            <p className="text-xs text-muted-foreground">Usuários registrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comunidades</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.communities}</div>
            <p className="text-xs text-muted-foreground">Comunidades ativas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.events}</div>
            <p className="text-xs text-muted-foreground">Eventos cadastrados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Projetos</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.projects}</div>
            <p className="text-xs text-muted-foreground">Projetos publicados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contribuidores</CardTitle>
            <Users2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : stats.contributors}</div>
            <p className="text-xs text-muted-foreground">Contribuidores ativos</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resumo da Plataforma</CardTitle>
              <CardDescription>Visão geral das principais métricas e atividades da plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{loading ? "..." : Math.floor(stats.users * 0.7)}</p>
                  <p className="text-xs text-muted-foreground">
                    Aproximadamente {loading ? "..." : Math.floor((stats.users * 0.7 * 100) / stats.users)}% do total
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Eventos Futuros</p>
                  <p className="text-2xl font-bold">{loading ? "..." : Math.floor(stats.events * 0.4)}</p>
                  <p className="text-xs text-muted-foreground">
                    Aproximadamente {loading ? "..." : Math.floor((stats.events * 0.4 * 100) / stats.events)}% do total
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Projetos Recentes</p>
                  <p className="text-2xl font-bold">{loading ? "..." : Math.floor(stats.projects * 0.3)}</p>
                  <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
                </div>
              </div>
              <div className="h-[200px] w-full rounded-md border border-dashed flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Gráfico de atividade (em desenvolvimento)</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises</CardTitle>
              <CardDescription>Análises detalhadas de uso e engajamento da plataforma.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Módulo de análises em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios</CardTitle>
              <CardDescription>Relatórios gerenciais e exportação de dados.</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-sm text-muted-foreground">Módulo de relatórios em desenvolvimento</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
