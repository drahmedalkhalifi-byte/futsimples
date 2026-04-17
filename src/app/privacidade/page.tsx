import Link from "next/link";
import { Trophy } from "lucide-react";

export default function PrivacidadePage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-2.5">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-violet-600">
              <Trophy className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">FutSimples</span>
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Política de Privacidade</h1>
          <p className="text-sm text-muted-foreground">Última atualização: abril de 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Quem somos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O FutSimples é um sistema de gestão para escolinhas de futebol. Nosso objetivo é ajudar treinadores e administradores a gerenciar alunos, pagamentos, presença e agenda de forma simples e segura.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. Quais dados coletamos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Coletamos apenas os dados necessários para o funcionamento do sistema:</p>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Nome, email e senha do administrador da escola</li>
            <li>Nome da escolinha</li>
            <li>Dados dos alunos: nome, idade, categoria, nome do responsável e telefone</li>
            <li>Registros de pagamento, presença e despesas</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Como usamos seus dados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Os dados são usados exclusivamente para o funcionamento do sistema. Não vendemos, compartilhamos ou usamos seus dados para fins comerciais ou de marketing. Cada escola acessa apenas seus próprios dados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Onde os dados são armazenados</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Os dados são armazenados de forma segura no Google Firebase, infraestrutura certificada e com criptografia em trânsito e em repouso. Os servidores ficam nos Estados Unidos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Seus direitos (LGPD)</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            De acordo com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
          </p>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Acessar seus dados pessoais</li>
            <li>Corrigir dados incompletos ou incorretos</li>
            <li>Solicitar a exclusão dos seus dados</li>
            <li>Revogar o consentimento a qualquer momento</li>
          </ul>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Para exercer esses direitos, entre em contato pelo email <strong>dr.ahmedalkhalifi@gmail.com</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dúvidas sobre esta política? Entre em contato: <strong>dr.ahmedalkhalifi@gmail.com</strong>
          </p>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <Link href="/termos" className="hover:text-foreground transition-colors">Termos de Uso</Link>
          <span className="mx-2">·</span>
          <Link href="/" className="hover:text-foreground transition-colors">Voltar ao início</Link>
        </div>
      </footer>
    </div>
  );
}
