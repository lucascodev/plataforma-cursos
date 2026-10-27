# Cursos Abertos

Plataforma aberta de cursos práticos. Cada curso tem plano de estudo diário, exercícios de fixação antes de cada projeto e um projeto prático por módulo. Para estudar, a pessoa entra com o GitHub e o progresso fica salvo na conta, disponível em qualquer aparelho.

O primeiro curso publicado é **Engenharia de IA**: 9 módulos, 75 aulas, 38 exercícios de fixação e 7 projetos, mais um projeto de conclusão, todos rodando localmente e sem custo.

## O que a plataforma faz

- **Catálogo de cursos**: o conteúdo fica numa tabela do Supabase, validado por schema. Cada curso mostra quem o publicou.
- **Propostas de curso**: qualquer pessoa logada propõe um curso pela plataforma. Um admin aprova, pede ajustes ou recusa; com a aprovação, a pessoa vira professor e recebe um rascunho do curso.
- **Perfis**: perfil de estudante privado (com resumo dos estudos e preferências da conta) e página pública de professor.
- **Área de admin**: fila de propostas, cursos (dono, catálogo), pessoas e papéis, e um histórico de cada ação.
- **Plano diário**: a partir da data de início, a plataforma distribui aulas, exercícios, etapas do projeto e autoavaliação pelos dias da semana, com sessões mais longas no sábado e uma trilha leve aos domingos.
- **Progresso**: itens concluídos, dias feitos, anotações por módulo e diário de estudo, com curva de ritmo (à frente, no ritmo ou atrás do plano).
- **Conta com GitHub**: login pelo Supabase, com a sessão guardada em cookies HttpOnly. O navegador nunca recebe tokens nem chaves do Supabase.
- **Seus dados com você**: exportar e importar backup em JSON, exportar o diário em Markdown e apagar o progresso a qualquer momento.

## Como funciona

```
navegador  ->  Cloudflare Pages (site estático + /api)  ->  Supabase (Auth + Postgres com RLS)
```

O site é uma SPA em React. Tudo o que envolve dados passa pelas rotas `/api/*`, que rodam como Pages Functions no Cloudflare. Elas fazem o login com o GitHub, guardam a sessão em cookies que o JavaScript da página não consegue ler e falam com o Supabase em nome da pessoa, com o token dela, para que as políticas de Row Level Security continuem valendo. Os detalhes estão em [docs/arquitetura.md](docs/arquitetura.md).

## Rodando localmente

Requisitos: Node 24 (ou 22.22 ou mais novo), pnpm (a versão fica em `packageManager`, no `package.json`) e um projeto no Supabase configurado como em [docs/configurando-contas.md](docs/configurando-contas.md).

```bash
git clone https://github.com/lucascodev/plataforma-cursos.git
cd plataforma-cursos
pnpm install
cp .dev.vars.example .dev.vars   # preencha com a URL e a chave publicável
```

```bash
pnpm dev       # sobe a API (functions do Cloudflare, porta 8788) e o site (porta 5173) juntos
```

Abra `http://localhost:5173` no Chrome ou no Firefox. Os cookies de sessão usam o prefixo `__Host-`, que esses navegadores aceitam em `localhost` sem HTTPS.

## Comandos

| Comando | O que faz |
|---|---|
| `pnpm dev` | Site com recarga rápida e API local juntos |
| `pnpm dev:site` | Só o site (Vite) |
| `pnpm dev:api` | Só as functions do Cloudflare (wrangler), lendo `.dev.vars` |
| `pnpm build` | Checa tipos, gera `dist/` e procura chaves vazadas no resultado |
| `pnpm preview` | Gera o build e serve site e functions juntos, como em produção |
| `pnpm check` | Tipos, lint, testes e build, na ordem |
| `pnpm test` | Testes unitários do site e das functions (Vitest) |
| `pnpm content:schema` | Regera `contracts/course/course.schema.json` a partir do schema Zod |
| `pnpm audit:prod` | Auditoria das dependências de produção |

## Estrutura

```
contracts/               schemas Zod usados pelo site e pelas functions
functions/api/           rotas do Cloudflare Pages (só repassam para server/)
server/                  login, sessão em cookies e acesso ao Supabase
src/
  app/                   bootstrap: providers, router, layout
  modules/
    courses/             catálogo, plano de estudo, painel do curso
    progress/            progresso, backup, diário
    auth/                sessão, papel, login e página de entrar
    profiles/            meu perfil, página pública de professor, tema
    proposals/           propor curso e acompanhar propostas
    admin/               área de administração
    legal/               página de privacidade
  shared/                cliente HTTP, utilitários e componentes genéricos
public/                  _headers (segurança), _routes.json e ícone
supabase/
  migrations/            tabelas, políticas RLS e funções do banco
  seed/courses/          cursos de exemplo para o banco local
  tests/                 testes de RLS e das funções (pgTAP)
scripts/                 schema JSON, seed do banco local, varredura de chaves
docs/                    arquitetura e guias
```

O site segue Clean Architecture por módulo (`domain`, `application`, `infra`, `main/factories`, `presentation`). O servidor é organizado pelos mesmos módulos (`auth`, `courses`, `progress`, `profiles`, `proposals`, `admin`), com o código comum em `server/shared`.

## Documentação

- [Arquitetura](docs/arquitetura.md)
- [Papéis e propostas de curso](docs/papeis-e-propostas.md)
- [Criando um curso](docs/criando-um-curso.md)
- [Versões de curso](docs/versoes-de-curso.md)
- [Configurando contas com Supabase e GitHub](docs/configurando-contas.md)
- [Deploy no Cloudflare Pages](docs/deploy.md)
- [Política de segurança](SECURITY.md)
- [Como contribuir](CONTRIBUTING.md)

## Licenças

- Código: [MIT](LICENSE).
- Conteúdo dos cursos (`supabase/seed/courses/`): [CC BY 4.0](LICENSE-CONTENT). Pode copiar, adaptar e redistribuir, inclusive comercialmente, desde que dê o crédito.

Os cursos indicam materiais de terceiros (livros, vídeos, cursos pagos). Esses materiais têm licenças próprias e não fazem parte deste repositório.
