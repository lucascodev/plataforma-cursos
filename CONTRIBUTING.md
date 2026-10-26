# Como contribuir

Obrigado pelo interesse. Contribuições de código e de conteúdo são bem-vindas.

## Antes de começar

1. Leia [docs/arquitetura.md](docs/arquitetura.md).
2. Para mudanças grandes, abra uma issue antes para combinar a abordagem.
3. Rode `pnpm install` e `pnpm check` para ter certeza de que tudo passa na sua máquina.

## Conteúdo

- Para criar ou corrigir um curso, siga [docs/criando-um-curso.md](docs/criando-um-curso.md). O PR muda só o JSON em `supabase/seed/courses/`; a importação para o Supabase é feita por quem mantém a plataforma.
- Textos em português, diretos, sem jargão desnecessário.
- Links sempre `https://` e para fontes estáveis.
- Projetos e exercícios precisam rodar localmente e sem custo, com alternativa para computador modesto quando fizer sentido.

## Código

- Siga a estrutura de camadas: `domain` não importa nada de fora; `presentation` usa as factories de `main`; um artefato por arquivo; páginas, componentes e hooks em pasta própria.
- Nomes de arquivos, pastas, símbolos e comentários de código em inglês. Documentação em português.
- Sem comentários que repetem o código. Comente só o porquê de decisões não óbvias.
- Toda regra de negócio nova vem com teste unitário.
- Mudança no desenho da aplicação: explique o motivo na descrição do PR e atualize `docs/arquitetura.md`.

## Segurança

- O navegador fala só com `/api`. Não adicione cliente do Supabase, variáveis `VITE_` nem uso de `localStorage`, `sessionStorage` ou `document.cookie` em `src/` (o lint bloqueia).
- Nunca coloque chaves em código ou em arquivo versionado. Locais: `.dev.vars` (chave publicável) e `.env.local` (chave secreta, só para importar cursos).
- As functions usam o token da pessoa. Não use a chave secreta em `server/`.
- Toda rota nova em `/api` que altera dados passa pelo middleware (checagem de origem) e valida o corpo com um schema de `contracts/`.
- Mudança no banco vai em uma migration nova em `supabase/migrations/`, com RLS e com teste em `supabase/tests/`.
- Não use `pull_request_target` nos workflows.

## Pull requests

- Uma mudança por PR, com descrição do que muda e por quê.
- `pnpm check` precisa passar.
- Atualize o `CHANGELOG.md` na seção "Não lançado".

Ao contribuir, você concorda que o código fica sob a licença MIT e o conteúdo sob a CC BY 4.0.
