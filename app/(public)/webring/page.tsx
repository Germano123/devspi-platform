"use client";

import { CardDescription } from "@/components/ui/card";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { areasDeAtuacao } from "../../../constants/areas.enum";
import { useProfile } from "@/contexts/profile.context";

interface ProfileWithId {
  id: string;
  firstName: string;
  lastName: string;
  linkedinUrl: string;
  portfolioUrl: string;
  areaAtuacao: string[];
  tempoExperiencia: string;
  nivelEnsino: string;
  photoURL?: string;
}

export default function WebringPage() {
  const [profiles, setProfiles] = useState<ProfileWithId[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithId[]>([]);
  const [displayedProfiles, setDisplayedProfiles] = useState<ProfileWithId[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const itemsPerPage = 20; // Valor fixo de 20 itens por página
  const [totalDevelopers, setTotalDevelopers] = useState<number>(0);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastProfileRef = useRef<HTMLDivElement | null>(null);

  // Estados para os filtros
  const [areaFilters, setAreaFilters] = useState<string[]>([]);
  const [experienceFilter, setExperienceFilter] = useState<string>("");
  const [isFilterActive, setIsFilterActive] = useState(false);
  const [showAreaFilters, setShowAreaFilters] = useState(false);
  const [totalFilteredCount, setTotalFilteredCount] = useState(0);

  const { getAllProfiles } = useProfile();

  useEffect(() => {
    const fetchProfiles = async () => {
      setIsLoading(true);
      try {
        const allProfiles = await getAllProfiles();
        // setProfiles(allProfiles);
        // setFilteredProfiles(allProfiles);
        setTotalFilteredCount(allProfiles.result.length);
        setTotalDevelopers(allProfiles.result.length);

        // Inicializar com os primeiros X perfis
        // setDisplayedProfiles(allProfiles.slice(0, itemsPerPage));
        setHasMore(allProfiles.result.length > itemsPerPage);
      } catch (error) {
        console.error("Erro ao buscar perfis:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, [getAllProfiles]);

  // Função para carregar mais perfis
  const loadMoreProfiles = useCallback(() => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    const nextPage = page + 1;
    const startIndex = (nextPage - 1) * itemsPerPage;
    const endIndex = nextPage * itemsPerPage;

    // Adicionar mais perfis à lista exibida
    const nextProfiles = filteredProfiles.slice(startIndex, endIndex);

    if (nextProfiles.length > 0) {
      setDisplayedProfiles((prev) => [...prev, ...nextProfiles]);
      setPage(nextPage);
      setHasMore(endIndex < filteredProfiles.length);
    } else {
      setHasMore(false);
    }

    setLoadingMore(false);
  }, [filteredProfiles, page, loadingMore, hasMore, itemsPerPage]);

  // Configurar o observador de interseção para o infinite scroll
  useEffect(() => {
    if (isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreProfiles();
        }
      },
      { threshold: 0.5 }
    );

    observerRef.current = observer;

    if (lastProfileRef.current) {
      observer.observe(lastProfileRef.current);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [isLoading, hasMore, loadMoreProfiles, displayedProfiles]);

  // Função para alternar a seleção de uma área no filtro
  const toggleAreaFilter = (areaId: string) => {
    setAreaFilters((prev) => {
      if (prev.includes(areaId)) {
        return prev.filter((id) => id !== areaId);
      } else {
        return [...prev, areaId];
      }
    });
  };

  const parseExperienceToYears = (input: string): number => {
    const lower = input.toLowerCase();
    const monthsMatch = lower.match(/(\d+(?:[\.,]\d+)?)\s*mes/);
    const yearsMatch = lower.match(/(\d+(?:[\.,]\d+)?)\s*ano/);

    const months = monthsMatch
      ? parseFloat(monthsMatch[1].replace(",", "."))
      : 0;
    const years = yearsMatch ? parseFloat(yearsMatch[1].replace(",", ".")) : 0;

    return years + months / 12;
  };

  // Função para aplicar os filtros
  const applyFilters = useCallback(() => {
    let result = [...profiles];

    if (areaFilters.length > 0) {
      result = result.filter((profile) =>
        // Verifica se pelo menos uma das áreas do perfil está nos filtros selecionados
        profile.areaAtuacao.some((area) => areaFilters.includes(area))
      );
    }

    if (experienceFilter) {
      // Extrair apenas o número do tempo de experiência para comparação
      switch (experienceFilter) {
        case "less-than-1":
          result = result.filter((profile) => {
            const years = parseExperienceToYears(profile.tempoExperiencia);
            return years < 1;
          });
          break;
        case "1-3":
          result = result.filter((profile) => {
            const years = parseExperienceToYears(profile.tempoExperiencia);
            return years >= 1 && years <= 3;
          });
          break;
        case "3-5":
          result = result.filter((profile) => {
            const years = parseExperienceToYears(profile.tempoExperiencia);
            return years > 3 && years <= 5;
          });
          break;
        case "more-than-5":
          result = result.filter((profile) => {
            const years = parseExperienceToYears(profile.tempoExperiencia);
            return years > 5;
          });
          break;
      }
    }

    setFilteredProfiles(result);
    setTotalFilteredCount(result.length);

    // Resetar a paginação quando os filtros mudam
    setPage(1);
    setDisplayedProfiles(result.slice(0, itemsPerPage));
    setHasMore(result.length > itemsPerPage);

    setIsFilterActive(areaFilters.length > 0 || experienceFilter !== "");
  }, [areaFilters, experienceFilter, profiles, itemsPerPage]);

  // Aplicar filtros quando os estados de filtro mudarem
  useEffect(() => {
    applyFilters();
  }, [areaFilters, experienceFilter, applyFilters]);

  // Função para limpar os filtros
  const clearFilters = () => {
    setAreaFilters([]);
    setExperienceFilter("");
    setFilteredProfiles(profiles);
    setTotalFilteredCount(profiles.length);

    // Resetar a paginação
    setPage(1);
    setDisplayedProfiles(profiles.slice(0, itemsPerPage));
    setHasMore(profiles.length > itemsPerPage);

    setIsFilterActive(false);
    setShowAreaFilters(false);
  };

  const getNivelEnsinoLabel = (nivel: string) => {
    const labels: Record<string, string> = {
      "medio-incompleto": "Médio Incompleto",
      "medio-completo": "Médio Completo",
      "tecnico-incompleto": "Técnico Incompleto",
      "tecnico-completo": "Técnico Completo",
      "superior-incompleto": "Superior Incompleto",
      "superior-completo": "Superior Completo",
    };
    return labels[nivel] || nivel;
  };

  const getAreaAtuacaoLabel = (area: string) => {
    const labels: Record<string, string> = {
      frontend: "Frontend",
      backend: "Backend",
      fullstack: "Fullstack",
      cybersec: "Cybersec",
      "machine-learning": "Machine Learning",
    };
    return labels[area] || area;
  };

  const getAreaAtuacaoColor = (area: string) => {
    const colors: Record<string, string> = {
      frontend: "bg-blue-100 text-blue-800",
      backend: "bg-green-100 text-green-800",
      fullstack: "bg-purple-100 text-purple-800",
      cybersec: "bg-red-100 text-red-800",
      "machine-learning": "bg-yellow-100 text-yellow-800",
    };
    return colors[area] || "bg-gray-100 text-gray-800";
  };

  const formatExperienceTime = (experienceTime: string): string => {
    if (!experienceTime) return "Não informado";

    const parts = experienceTime.trim().split(" ");
    if (parts.length < 2) return experienceTime;

    const amount = parts[0];
    const unit = parts[1].toLowerCase();

    // Formatação para exibição
    if (unit === "anos" || unit === "ano") {
      return amount === "1"
        ? "1 ano de experiência"
        : `${amount} anos de experiência`;
    } else if (unit === "meses" || unit === "mês") {
      return amount === "1"
        ? "1 mês de experiência"
        : `${amount} meses de experiência`;
    }

    return experienceTime;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Webring de Desenvolvedores</h1>
        <p className="text-muted-foreground mt-2">
          Conecte-se com outros desenvolvedores da comunidade de Piauí
        </p>
      </div>

      {/* Seção de filtros */}
      <div className="mb-8 bg-muted/40 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <Filter size={18} />
            <h2 className="font-medium">Filtrar por:</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:flex gap-4 flex-1">
            <div>
              <Button
                variant="outline"
                onClick={() => setShowAreaFilters(!showAreaFilters)}
                className="w-full md:w-[180px] h-10 px-3 py-2 flex justify-between items-center"
              >
                <span className="truncate">
                  {areaFilters.length === 0
                    ? "Áreas de atuação"
                    : `${areaFilters.length} área${
                        areaFilters.length > 1 ? "s" : ""
                      }`}
                </span>
                <span className="ml-2">{showAreaFilters ? "▲" : "▼"}</span>
              </Button>

              {showAreaFilters && (
                <div className="absolute z-10 mt-1 w-[250px] p-3 bg-white border rounded-md shadow-lg">
                  <div className="space-y-2">
                    {areasDeAtuacao.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`filter-${area.id}`}
                          checked={areaFilters.includes(area.id)}
                          onCheckedChange={() => toggleAreaFilter(area.id)}
                        />
                        <Label
                          htmlFor={`filter-${area.id}`}
                          className="cursor-pointer"
                        >
                          {area.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Select
              value={experienceFilter}
              onValueChange={setExperienceFilter}
            >
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tempo de experiência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="less-than-1">Menos de 1 ano</SelectItem>
                <SelectItem value="1-3">1 a 3 anos</SelectItem>
                <SelectItem value="3-5">3 a 5 anos</SelectItem>
                <SelectItem value="more-than-5">Mais de 5 anos</SelectItem>
              </SelectContent>
            </Select>

            {isFilterActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="flex items-center gap-1"
              >
                <X size={14} /> Limpar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Resumo dos filtros aplicados */}
        {isFilterActive && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Filtros aplicados:
              {areaFilters.length > 0 && (
                <span className="ml-1">
                  Áreas:{" "}
                  <strong>
                    {areaFilters
                      .map((area) => getAreaAtuacaoLabel(area))
                      .join(", ")}
                  </strong>
                </span>
              )}
              {experienceFilter && (
                <span className="ml-1">
                  {areaFilters.length > 0 && " | "}
                  Experiência:{" "}
                  <strong>
                    {experienceFilter === "less-than-1" && "Menos de 1 ano"}
                    {experienceFilter === "1-3" && "1 a 3 anos"}
                    {experienceFilter === "3-5" && "3 a 5 anos"}
                    {experienceFilter === "more-than-5" && "Mais de 5 anos"}
                  </strong>
                </span>
              )}
            </p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <p>Carregando perfis...</p>
        </div>
      ) : (
        <>
          {/* Contador de resultados atualizado - Removido o seletor de itens por página */}
          <div className="mb-4 text-sm text-muted-foreground">
            <p>
              <span className="font-medium">Total na plataforma:</span>{" "}
              {totalDevelopers}{" "}
              {totalDevelopers === 1 ? "desenvolvedor" : "desenvolvedores"}
            </p>
            <p>
              Exibindo {displayedProfiles.length} de {totalFilteredCount}{" "}
              {totalFilteredCount === 1 ? "desenvolvedor" : "desenvolvedores"}
              {isFilterActive && ` selecionados`}
            </p>
          </div>

          {/* Lista de perfis */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedProfiles.length === 0 ? (
              <div className="col-span-full py-12 text-center">
                <p className="text-muted-foreground">
                  Nenhum perfil encontrado com os filtros selecionados.
                </p>
                {isFilterActive && (
                  <Button
                    variant="link"
                    onClick={clearFilters}
                    className="mt-2"
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>
            ) : (
              displayedProfiles.map((profile, index) => (
                <div
                  key={profile.id}
                  ref={
                    index === displayedProfiles.length - 1
                      ? lastProfileRef
                      : null
                  }
                >
                  <Card className="overflow-hidden h-full">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        {profile.photoURL ? (
                          <img
                            src={profile.photoURL || "/placeholder.svg"}
                            alt={`${profile.firstName} ${profile.lastName}`}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                            {profile.firstName.charAt(0)}
                            {profile.lastName.charAt(0)}
                          </div>
                        )}
                        <CardTitle className="text-xl">
                          {profile.firstName} {profile.lastName}
                        </CardTitle>
                      </div>
                      <CardDescription>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          {profile.areaAtuacao.map((area) => (
                            <Badge
                              key={area}
                              className={getAreaAtuacaoColor(area)}
                            >
                              {getAreaAtuacaoLabel(area)}
                            </Badge>
                          ))}
                        </div>
                        <div className="mt-2">
                          <span className="text-sm">
                            {formatExperienceTime(profile.tempoExperiencia)}
                          </span>
                        </div>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="text-sm">
                        <p className="mb-1">
                          <strong>Formação:</strong>{" "}
                          {getNivelEnsinoLabel(profile.nivelEnsino)}
                        </p>
                      </div>
                    </CardContent>
                    <CardFooter className="pt-2 flex justify-between">
                      {profile.linkedinUrl && (
                        <a
                          href={profile.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          Perfil LinkedIn <ExternalLink size={14} />
                        </a>
                      )}

                      {profile.portfolioUrl && (
                        <a
                          href={profile.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1 text-sm"
                        >
                          Portfólio <ExternalLink size={14} />
                        </a>
                      )}
                    </CardFooter>
                  </Card>
                </div>
              ))
            )}
          </div>

          {/* Indicador de carregamento para infinite scroll */}
          {loadingMore && (
            <div className="flex justify-center py-6">
              <p>Carregando mais desenvolvedores...</p>
            </div>
          )}

          {/* Mensagem quando não há mais itens para carregar */}
          {!hasMore && displayedProfiles.length > 0 && (
            <div className="text-center text-muted-foreground py-6">
              <p>Todos os desenvolvedores foram carregados</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
