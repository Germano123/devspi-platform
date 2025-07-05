import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const cards = [
  {
    title: 'Abr/2025 - Lançamento',
    description: 'Fase inicial da plataforma',
    topics: [
      'Lançamento do site da comunidade',
      'Cadastro de desenvolvedores',
      'Listagem de comunidades locais',
      'Sistema de webring para conectar desenvolvedores',
    ],
  },
  {
    title: 'Mai/2025 - Expansão',
    description: 'Novas funcionalidades e melhorias',
    topics: [
      'Sistema de eventos da comunidade',
      'Fórum de discussão',
      'Empresas e instituições',
      'Área de vagas e oportunidades',
      'Made In Piauí - Área de projetos',
    ],
  },
  {
    title: 'Jun/2025 - Revisão',
    description: 'Correção de falhas e ajuste de atrasos',
    topics: [
      'Fórum de discussão',
      'Empresas e instituições',
      'Área de vagas e oportunidades',
    ],
  },
]

export default function RoadmapPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Roadmap</h1>

      <div className="space-y-8">
        {
          cards.map((card) => {
            return <Card>
              <CardHeader>
                <CardTitle>{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="list-disc pl-5 space-y-2">
                  {
                    card.topics.map((topic) => {
                      return <li>{topic}</li>
                    })
                  }
                </ul>
              </CardContent>
            </Card>
          })
        }
      </div>

      <div className="mt-12 bg-muted p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Contribua com o Roadmap</h2>
        <p className="mb-4">
          Este roadmap é um documento vivo e está aberto a sugestões da comunidade. Se você tem ideias para melhorar a
          plataforma, entre em contato conosco.
        </p>
        <a href="https://wa.me/5586999763066" className="text-primary hover:underline">
          Fale conosco
        </a>
      </div>
    </div>
  )
}
