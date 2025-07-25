# Work Sync - Sistema de Controle de Ponto e Registros

Work Sync é um sistema moderno e intuitivo para controle de ponto e gestão de registros de trabalho, desenvolvido com foco na experiência do usuário e facilidade de manutenção.

## 📋 Descrição do Projeto

O Work Sync permite que usuários registrem suas horas de trabalho, organizem projetos por etapas e tarefas, e mantenham um controle detalhado de suas atividades diárias. O sistema oferece uma interface limpa e responsiva, com funcionalidades de edição inline e visualização em calendário.

### Principais Funcionalidades

- **Autenticação de Usuários**: Sistema completo com login/registro via Supabase Auth
- **Dashboard Interativo**: Calendário visual com status dos dias e painel de registros
- **Gestão de Projetos**: Criação e organização de projetos, etapas e tarefas
- **Controle de Ponto**: Registro diário de horas trabalhadas
- **Edição Inline**: Permite editar registros diretamente na lista
- **Gestão de Usuários**: Controle de perfis e permissões (admin/colaborador)

## 🛠 Tecnologias Utilizadas

### Frontend
- **React 18** - Framework JavaScript para interfaces de usuário
- **TypeScript** - Tipagem estática para JavaScript
- **Vite** - Build tool moderna e rápida
- **Tailwind CSS** - Framework CSS utility-first
- **Shadcn/ui** - Biblioteca de componentes acessíveis
- **React Router DOM** - Roteamento para SPAs
- **Date-fns** - Manipulação de datas
- **Lucide React** - Ícones modernos

### Backend & Database
- **Supabase** - Backend as a Service
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança em nível de linha
- **Supabase Auth** - Autenticação e autorização

### Ferramentas de Desenvolvimento
- **ESLint** - Linting de código
- **PostCSS** - Processamento de CSS
- **Class Variance Authority** - Variantes de componentes

## 📁 Estrutura de Pastas

```
src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes de interface base (shadcn)
│   ├── shared/          # Componentes compartilhados
│   ├── records/         # Componentes específicos de registros
│   ├── Calendar.tsx     # Componente de calendário
│   ├── DayRecords.tsx   # Painel de registros diários
│   ├── Layout.tsx       # Layout principal da aplicação
│   └── ...
├── contexts/            # Contextos do React
│   └── AuthContext.tsx  # Contexto de autenticação
├── hooks/               # Custom hooks
│   ├── useRecords.ts    # Hook para gestão de registros
│   └── use-toast.ts     # Hook para notificações
├── pages/               # Páginas da aplicação
│   ├── Auth.tsx         # Página de autenticação
│   ├── Dashboard.tsx    # Dashboard principal
│   ├── Projects.tsx     # Gestão de projetos
│   └── Users.tsx        # Gestão de usuários
├── services/            # Serviços e API
│   └── recordsService.ts # Serviço para registros
├── types/               # Definições de tipos TypeScript
│   └── records.ts       # Tipos relacionados a registros
├── lib/                 # Utilitários
│   └── utils.ts         # Funções utilitárias
└── integrations/        # Integrações externas
    └── supabase/        # Configuração do Supabase
```

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- Conta no Supabase

### Passo a Passo

1. **Clone o repositório**
```bash
git clone [URL_DO_REPOSITORIO]
cd work-sync
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
# As configurações do Supabase já estão no código
# Verifique se as URLs e chaves estão corretas em:
# src/integrations/supabase/client.ts
```

4. **Execute o projeto**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:5173
```

## 🔧 Como Conectar ao Supabase

### Configuração do Banco de Dados

O projeto utiliza as seguintes tabelas principais:

- **profiles**: Perfis de usuários
- **projects**: Projetos
- **stages**: Etapas dos projetos
- **tasks**: Tarefas das etapas
- **records**: Registros de trabalho
- **horasponto**: Controle de ponto diário

### Row Level Security (RLS)

Todas as tabelas possuem políticas RLS configuradas para garantir que:
- Usuários só acessem seus próprios dados
- Administradores tenham acesso amplo quando necessário
- Dados públicos (projetos, etapas, tarefas) sejam acessíveis a todos

### Autenticação

- **Email/Senha**: Registro e login tradicionais
- **Auto-confirmação**: Emails são confirmados automaticamente
- **Perfis**: Criados automaticamente após registro

## 📊 Fluxo de Ponto e Registros

### 1. Ponto Diário
- Usuário deve primeiro registrar seu ponto do dia (total de horas)
- Sem o ponto, não é possível criar registros de atividades
- O ponto define o limite de horas para o dia

### 2. Registros de Atividades
- Cada registro vincula horas a um projeto/etapa/tarefa
- Soma das horas dos registros não deve exceder o ponto
- Indicação visual quando há excesso de horas

### 3. Visualização
- **Calendário**: Status visual dos dias (completo/incompleto/vazio)
- **Lista**: Registros detalhados com edição inline
- **Totais**: Somatória de horas e percentuais

## 🔒 Permissões e Segurança

### Níveis de Usuário
- **Colaborador**: Acesso aos próprios registros e dados básicos
- **Administrador**: Acesso completo ao sistema

### Segurança Implementada
- **RLS**: Políticas de segurança em nível de banco
- **Validação**: Validações no frontend e backend
- **Autenticação**: Rotas protegidas e contexto de autenticação

## 🎨 Design System

O projeto utiliza um sistema de design consistente baseado em:

### Cores Semânticas (HSL)
```css
--primary: 210 100% 50%     /* Azul principal */
--secondary: 0 0% 15%       /* Cinza escuro */
--accent: 210 100% 60%      /* Azul claro */
--background: 0 0% 100%     /* Branco */
--foreground: 0 0% 5%       /* Preto */
```

### Componentes Reutilizáveis
- Botões com variantes (primary, secondary, destructive, outline)
- Inputs padronizados
- Seletores personalizados
- Cards e layouts consistentes

## 🧹 Boas Práticas e Manutenção

### Código Limpo (Clean Code)
- **Nomes descritivos**: Variáveis e funções com nomes claros
- **Funções pequenas**: Responsabilidade única
- **Componentização**: Componentes reutilizáveis e focados
- **Separação de responsabilidades**: Hooks, services, tipos separados

### Arquitetura
- **Custom Hooks**: Lógica de negócio isolada
- **Services**: Comunicação com APIs centralizadas
- **Types**: Tipagem forte e consistente
- **Utils**: Funções utilitárias reutilizáveis

### Performance
- **Lazy Loading**: Importações dinâmicas quando necessário
- **Memoização**: React.memo e useMemo em componentes críticos
- **Otimização de re-renders**: useCallback para funções

### Testes e Qualidade
- **TypeScript**: Tipagem estática previne erros
- **ESLint**: Padronização de código
- **Estrutura modular**: Facilita testes unitários

## 📝 Comandos Úteis

```bash
# Desenvolvimento
npm run dev          # Inicia servidor de desenvolvimento
npm run build        # Build para produção
npm run preview      # Preview da build
npm run lint         # Executa linting

# Supabase (se configurado localmente)
npx supabase start   # Inicia Supabase local
npx supabase stop    # Para Supabase local
```

## 🤝 Contribuindo

1. Siga as convenções de nomenclatura estabelecidas
2. Mantenha a tipagem TypeScript rigorosa
3. Teste funcionalidades antes de fazer commit
4. Documente mudanças significativas

## 📄 Licença

Este projeto está sob licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para otimizar o controle de tempo e produtividade**