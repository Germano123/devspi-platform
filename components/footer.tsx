import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">Devs Piauí</h3>
            <p className="text-sm text-muted-foreground">
              Conectando desenvolvedores e comunidades de tecnologia no Piauí e região.
            </p>
          </div>

          <div>
            <h3 className="font-bold mb-4">Navegação</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/webring" className="text-sm text-muted-foreground hover:text-foreground">
                  Webring
                </Link>
              </li>
              <li>
                <Link href="/communities" className="text-sm text-muted-foreground hover:text-foreground">
                  Comunidades
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Informações</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/roadmap" className="text-sm text-muted-foreground hover:text-foreground">
                  Roadmap
                </Link>
              </li>
              <li>
                <Link href="/termos-de-uso" className="text-sm text-muted-foreground hover:text-foreground">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link href="/politica-de-cookies" className="text-sm text-muted-foreground hover:text-foreground">
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link href="/politica-de-privacidade" className="text-sm text-muted-foreground hover:text-foreground">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold mb-4">Contato</h3>
            <p className="text-sm text-muted-foreground mb-2">Entre em contato conosco para mais informações.</p>
            <a href="mailto:gdevsociety@gmail.com" className="text-sm text-primary hover:underline">
              gdevsociety@gmail.com
            </a>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Devs Piauí. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
