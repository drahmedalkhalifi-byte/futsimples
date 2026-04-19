# FutSimples — Handover Completo

**Data:** Abril 2026  
**Produto:** FutSimples — SaaS de gestão de escolas de futebol  
**URL produção:** https://futsimples.netlify.app  
**Repositório:** https://github.com/drahmedalkhalifi-byte/futsimples  

---

## Stack Técnica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16.2.3 (App Router, Turbopack) |
| Banco de dados | Firebase Firestore |
| Autenticação | Firebase Auth |
| Pagamentos | Stripe Checkout + Webhooks + Customer Portal |
| E-mails | Resend API (via fetch nativo) |
| Deploy | Netlify (CI/CD via GitHub) |
| Cron job | Netlify Scheduled Functions |

---

## Funcionalidades Construídas

### 1. Autenticação e Contas
- Cadastro de escola com Firebase Auth
- Roles: `admin` e `coach` (professor)
- Convite de professores por e-mail com link de acesso
- Página de setup (`/setup`) cria escola + usuário admin no Firestore

### 2. Alunos
- Cadastro completo (nome, turma, responsável, telefone, endereço)
- Ficha médica (alergias, plano de saúde, contato de emergência)
- Portal do responsável (acesso via link, sem login)
- Desativar aluno (ex-aluno) com histórico preservado
- Paginação na listagem

### 3. Presença
- Registro por turma e data
- Histórico com filtros de mês e categoria
- Visualização de frequência por aluno

### 4. Pagamentos
- Registro manual de mensalidades
- Status: pendente / pago / atrasado
- Cobrança em lote via WhatsApp com link PIX
- Sistema de prioridade visual (urgente, atrasado, em dia)
- Paginação na listagem
- Exportação de relatório em PDF

### 5. Agenda
- Eventos por turma
- Aba de Campeonatos

### 6. Gastos
- Registro de despesas da escola
- Categorias personalizáveis

### 7. Relatório
- Visão geral financeira
- Gráfico de receita
- Exportação PDF

### 8. Onboarding Checklist
- Aparece no dashboard para novos usuários
- 5 passos: criar conta ✅, cadastrar aluno, marcar presença, registrar pagamento, convidar professor
- Progresso em círculo SVG, colapsável, dispensável
- Some automaticamente quando tudo está completo

### 9. Configurações
- Dados da escola
- Gestão de professores
- **Aba de Assinatura**: mostra status (trial/ativo/expirado), botão para o Stripe Portal

---

## Sistema de Trial e Assinatura

### Trial
- 14 dias gratuitos, sem cartão
- Contado a partir de `trialStartedAt` no Firestore (campo da escola)
- Lógica em `src/contexts/auth-context.tsx`
- Exibe banner com dias restantes no dashboard

### Planos
| Plano | Valor | Stripe interval |
|---|---|---|
| Mensal | R$ 59,90/mês | `month` |
| Anual | R$ 599,00/ano | `year` |

### Fluxo de Pagamento
1. Usuário clica em "Assinar" → vai para `/assinar`
2. Escolhe mensal ou anual
3. POST para `/api/stripe/checkout` → redireciona para Stripe Checkout
4. Stripe processa e chama webhook `/api/stripe/webhook`
5. Webhook atualiza Firestore: `subscriptionStatus: "active"`, salva `stripeCustomerId` e `stripeSubscriptionId`
6. Webhook também envia e-mail de boas-vindas via Resend

### Métodos de Pagamento aceitos
- Cartão de crédito/débito
- Boleto bancário (vence em 3 dias)

### Gerenciar Assinatura
- Botão "Gerenciar assinatura no Stripe" em `/configuracoes`
- Chama `/api/stripe/portal` → abre Stripe Customer Portal
- Usuário pode cancelar, trocar plano, atualizar cartão

---

## APIs (Route Handlers)

| Rota | Método | Função |
|---|---|---|
| `/api/stripe/checkout` | POST | Cria sessão de checkout Stripe |
| `/api/stripe/webhook` | POST | Recebe eventos do Stripe |
| `/api/stripe/portal` | POST | Abre Customer Portal do Stripe |
| `/api/email/welcome` | POST | Envia e-mail de boas-vindas |
| `/api/email/trial-reminder` | POST | Envia lembrete de trial (protegido por cron secret) |

---

## Webhooks Stripe Configurados

| Evento | Ação |
|---|---|
| `checkout.session.completed` | Ativa assinatura + envia e-mail de boas-vindas |
| `invoice.payment_succeeded` | Renova status `active` |
| `invoice.payment_failed` | Marca status `expired` |
| `customer.subscription.deleted` | Marca status `expired` |

---

## E-mails Automáticos (Resend)

- **Boas-vindas**: enviado quando assinatura é confirmada pelo webhook
- **Lembrete D-3**: enviado 3 dias antes do trial acabar
- **Lembrete D-1**: enviado 1 dia antes do trial acabar
- Campo `lastReminderDaysLeft` no Firestore evita duplicatas
- Cron job diário em `netlify/functions/trial-reminder-cron.mts` (roda às 9h)

> **Nota:** Resend está configurado mas e-mails só chegam para o domínio verificado. Enquanto não tiver domínio próprio, usar `onboarding@resend.dev` como remetente (funciona mas cai em spam).

---

## Variáveis de Ambiente (Netlify)

Todas configuradas em Netlify → Site → Environment variables:

```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL
FIREBASE_PRIVATE_KEY
STRIPE_SECRET_KEY              ← chave sk_live_... completa
STRIPE_WEBHOOK_SECRET          ← whsec_... do Stripe Dashboard
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RESEND_API_KEY
EMAIL_FROM                     ← ex: FutSimples <onboarding@resend.dev>
CRON_SECRET                    ← string aleatória para proteger o cron
NEXT_PUBLIC_APP_URL            ← https://futsimples.netlify.app
```

---

## Deploy

- **CI/CD automático**: cada `git push origin main` aciona deploy no Netlify
- **Deploy manual**: Netlify → Deploys → Trigger deploy → Deploy site
- **Comando de build**: `npm run build`
- **Pasta publicada**: `.next`
- **Plugin**: `@netlify/plugin-nextjs`

---

## Estrutura de Pastas Principais

```
src/
├── app/
│   ├── (dashboard)/       # Páginas autenticadas
│   │   ├── dashboard/
│   │   ├── alunos/
│   │   ├── presenca/
│   │   ├── pagamentos/
│   │   ├── agenda/
│   │   ├── gastos/
│   │   ├── relatorio/
│   │   └── configuracoes/
│   ├── api/
│   │   ├── stripe/        # checkout, webhook, portal
│   │   └── email/         # welcome, trial-reminder
│   ├── assinar/           # Página de planos/assinatura
│   ├── setup/             # Criação de conta
│   └── page.tsx           # Landing page
├── components/
│   └── dashboard/
│       ├── onboarding-checklist.tsx
│       ├── stat-card.tsx
│       ├── revenue-chart.tsx
│       └── alerts-section.tsx
├── contexts/
│   └── auth-context.tsx   # Trial logic, subscriptionStatus
└── lib/
    ├── firebase.ts
    ├── firebase-admin.ts
    └── email.ts            # sendWelcomeEmail, sendTrialReminderEmail
netlify/
└── functions/
    └── trial-reminder-cron.mts
```

---

## Firestore — Estrutura de Dados

### Coleção `schools`
```
{
  name: string,
  subscriptionStatus: "trial" | "active" | "expired",
  trialStartedAt: Timestamp,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  subscriptionActivatedAt: Timestamp,
  lastReminderDaysLeft: number,
  updatedAt: Timestamp
}
```

### Coleção `users`
```
{
  name: string,
  email: string,
  role: "admin" | "coach",
  schoolId: string
}
```

---

## Próximos Passos Sugeridos

1. **Domínio próprio** — conectar `futsimples.com.br` no Netlify e Resend para e-mails profissionais
2. **Boleto com CPF** — Stripe exige CPF do cliente para boleto em produção; coletar na tela de checkout
3. **Dashboard de métricas** — gráfico de MRR, churn, novos cadastros por mês
4. **App mobile** — PWA ou React Native para professores registrarem presença no celular
5. **Notificações WhatsApp automáticas** — integrar Twilio ou Z-API para cobranças automáticas
6. **Multi-escola** — um admin gerenciar várias unidades

---

*Documento gerado em abril de 2026. Projeto em produção em https://futsimples.netlify.app*
