import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InfoIcon } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">Comunidade de Desenvolvedores do Piauí</h1>
        <p className="text-xl text-muted-foreground">
          Conecte-se com desenvolvedores locais, compartilhe conhecimento e cresça profissionalmente.
        </p>

        {!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && (
          <Alert className="my-4 text-left">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Configuração necessária</AlertTitle>
            <AlertDescription>
              Para usar todos os recursos, configure as variáveis de ambiente do Firebase. Algumas funcionalidades estão
              limitadas no modo de demonstração.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link href="/register">Criar Conta</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Entrar</Link>
          </Button>
        </div>

        <div className="pt-8 border-t">
          <h2 className="text-2xl font-semibold mb-4">Explore sem precisar de login</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild variant="secondary" size="lg">
              <Link href="/webring">Ver Desenvolvedores</Link>
            </Button>
            <Button asChild variant="secondary" size="lg">
              <Link href="/communities">Ver Comunidades</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
