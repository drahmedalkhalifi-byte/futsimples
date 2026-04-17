import Link from "next/link";
import { Trophy } from "lucide-react";

export default function TermosPage() {
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
          <h1 className="text-3xl font-extrabold text-foreground mb-2">Termos de Uso</h1>
          <p className="text-sm text-muted-foreground">Última atualização: abril de 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">1. Aceitação dos termos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ao criar uma conta no FutSimples, você concorda com estes Termos de Uso. Se não concordar, não utilize o sistema.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">2. O que é o FutSimples</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            O FutSimples é um sistema online de gestão para escolinhas de futebol, que permite cadastrar alunos, controlar pagamentos, registrar presença, organizar agenda e gerar relatórios.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">3. Uso permitido</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">Você pode usar o FutSimples para:</p>
          <ul className="text-sm text-muted-foreground space-y-1.5 list-disc list-inside">
            <li>Gerenciar sua própria escolinha de futebol</li>
            <li>Cadastrar alunos e responsáveis</li>
            <li>Controlar pagamentos e despesas da sua escola</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">4. Responsabilidades do usuário</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você é responsável pela veracidade dos dados cadastrados e pelo uso adequado do sistema. O FutSimples não se responsabiliza por dados incorretos inseridos pelo usuário.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">5. Disponibilidade</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Nos esforçamos para manter o sistema disponível, mas não garantimos disponibilidade ininterrupta. Podem ocorrer períodos de manutenção ou instabilidade.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">6. Encerramento de conta</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Você pode solicitar o encerramento da sua conta e exclusão dos dados a qualquer momento pelo email <strong>dr.ahmedalkhalifi@gmail.com</strong>.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">7. Alterações nos termos</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Podemos atualizar estes termos a qualquer momento. Notificaremos usuários sobre mudanças significativas. O uso continuado após as alterações implica aceitação dos novos termos.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">8. Contato</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Dúvidas? Entre em contato: <strong>dr.ahmedalkhalifi@gmail.com</strong>
          </p>
        </section>
      </main>

      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="max-w-3xl mx-auto px-4 text-center text-xs text-muted-foreground">
          <Link href="/privacidade" className="hover:text-foreground transition-colors">Política de Privacidade</Link>
          <span className="mx-2">·</span>
          <Link href="/" className="hover:text-foreground transition-colors">Voltar ao início</Link>
        </div>
      </footer>
    </div>
  );
}
