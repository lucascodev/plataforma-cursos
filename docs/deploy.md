# Deploy no Cloudflare Pages

O site e as rotas `/api` são publicados juntos pelo Cloudflare Pages, conectado ao repositório do GitHub. O deploy de produção é pedido pelo GitHub Actions depois que as migrations do banco foram aplicadas (veja [Deploy pela pipeline](#deploy-pela-pipeline)). Branches e pull requests continuam ganhando um preview do próprio Cloudflare.

Antes, configure o Supabase e o GitHub como em [configurando-contas.md](configurando-contas.md).

## Primeira vez

1. Crie o repositório público no GitHub e envie o código:

   ```bash
   git init
   git add .
   git commit -m "feat: plataforma de cursos"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/plataforma-cursos.git
   git push -u origin main
   ```

   Antes do primeiro commit, rode `pnpm install` para gerar o `pnpm-lock.yaml` e **inclua o lockfile no commit**. O CI usa `pnpm install --frozen-lockfile`, que exige o lockfile. A versão do pnpm fica no campo `packageManager` do `package.json`.

2. No painel do Cloudflare, abra **Workers & Pages > Create > Pages > Connect to Git** e escolha o repositório.
3. Em **Build settings**:

   | Campo | Valor |
   |---|---|
   | Framework preset | None |
   | Build command | `pnpm build` |
   | Build output directory | `dist` |
   | Root directory | (vazio) |

   A versão do Node vem do arquivo `.nvmrc`. A pasta `functions/` é detectada sozinha e vira as rotas `/api`. O projeto não tem `wrangler.toml` de propósito: assim as variáveis e a data de compatibilidade ficam editáveis no painel.

4. Em **Environment variables**, crie para **Production** (e para **Preview**, se for usar):

   | Variável | Valor |
   |---|---|
   | `SUPABASE_URL` | `https://SEU_PROJECT_REF.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | a chave publicável (`sb_publishable_...`) |
   | `PNPM_VERSION` | a mesma versão do `packageManager` no `package.json` (hoje `12.15.0`) |

   **Nunca** cadastre a chave secreta (`sb_secret_...`) nem a `service_role` no Cloudflare. As functions recusam essas chaves e respondem 503 até a configuração ser corrigida.

5. Depois de criado, em **Settings > Runtime**, ajuste **Compatibility date** para `2026-10-01` (a mesma usada no desenvolvimento local).
6. Salve e faça o primeiro deploy. O site fica em `https://plataforma-cursos.pages.dev` (ou no nome que o Cloudflare sugerir).
7. No Supabase, em **Authentication > URL Configuration**, cadastre o endereço final:
   - **Site URL**: `https://plataforma-cursos.pages.dev`
   - **Redirect URLs**: `https://plataforma-cursos.pages.dev/api/auth/callback`
8. Num fork, troque `repositoryUrl` em `content/site.json` e a URL em `package.json` pelo seu repositório. O build falha enquanto houver `SEU-USUARIO` no resultado.
9. Configure o deploy pela pipeline, abaixo.

## Deploy pela pipeline

O banco precisa estar na versão nova antes de o código novo entrar no ar. Por isso quem pede o deploy de produção é o job `release` do CI, depois do `db push` (detalhes em [migracoes.md](migracoes.md)).

1. No Cloudflare, abra o projeto e vá em **Settings > Builds & deployments**.
2. Em **Branch control**, desligue **Enable automatic production branch deployments**. Deixe os previews ligados.
3. Em **Deploy hooks**, crie um hook chamado `github-actions` para a branch `main` e copie a URL.
4. No GitHub, cadastre a URL como o secret `CLOUDFLARE_DEPLOY_HOOK` do environment `production`.

Quem tem a URL do hook consegue disparar um deploy da `main`. Trate como senha: se vazar, apague o hook e crie outro.

Com o deploy automático desligado, um push na `main` só vai ao ar quando o CI passar inteiro: testes, testes do banco e migrations. Para publicar de novo sem commit novo, rode o workflow de novo no GitHub ou chame o hook com `curl -X POST "$URL_DO_HOOK"`.

## O que o Cloudflare usa do repositório

| Arquivo | Para que serve |
|---|---|
| `public/_headers` | Cabeçalhos de segurança: Content Security Policy, HSTS, `frame-ancestors 'none'`, `nosniff` e cache longo para `/assets/*` |
| `public/_routes.json` | Diz que só `/api/*` passa pelas functions; o resto é arquivo estático, sem custo de invocação |
| `functions/api/` | As rotas da API, uma por arquivo |

Rotas como `/cursos/engenharia-de-ia` funcionam ao recarregar a página porque o Pages serve o `index.html` para caminhos que não são arquivo.

## Deploys de preview

Cada branch e cada pull request ganham um endereço próprio (`https://<hash>.plataforma-cursos.pages.dev`). O login com GitHub só funciona nos endereços cadastrados em **Redirect URLs** do Supabase. Há dois caminhos:

- **Recomendado**: deixe os previews sem login. Eles servem para conferir layout e conteúdo público.
- Se precisar testar o login num preview, use um alias fixo de branch (por exemplo `https://staging.plataforma-cursos.pages.dev`) e cadastre só esse endereço. Evite curingas amplos nas Redirect URLs.

Em **Settings > Builds & deployments**, você pode limitar os previews a branches específicas ou desligá-los.

## Domínio próprio (opcional)

Em **Custom domains**, adicione o domínio e siga as instruções de DNS. Depois:

- troque **Site URL** e **Redirect URLs** no Supabase para o domínio novo;
- troque a **Homepage URL** do OAuth App no GitHub.

Os cookies usam o prefixo `__Host-`, então ficam presos ao domínio exato do site e não vazam para subdomínios.

## Proteções recomendadas no repositório

Em **Settings** do GitHub:

- **Code security**: ative **Dependabot alerts**, **Dependabot security updates**, **Secret scanning** e **Push protection**. O push protection bloqueia o push quando detecta uma chave conhecida, inclusive chaves secretas do Supabase.
- **Code security > Private vulnerability reporting**: ative, para o fluxo do [SECURITY.md](../SECURITY.md).
- **Branches > Branch protection rules** (ou Rulesets) para `main`: exigir PR, exigir os checks **CI / checks**, **CI / db** e **CodeQL**, bloquear force push.
- **Actions > General**: em **Workflow permissions**, deixe **Read repository contents** e desmarque a opção que permite ao Actions criar ou aprovar pull requests.

No Cloudflare, limite quem tem acesso à conta e ative a verificação em duas etapas. Quem pode editar as variáveis de ambiente do projeto pode trocar o Supabase para o qual a API aponta.

## Conferindo o build localmente

```bash
pnpm preview
```

Gera o build (com a varredura de chaves no `dist/`) e sobe site e functions juntos em `http://localhost:8788`, com os mesmos cabeçalhos da produção. Erros de CSP aparecem no console do navegador.
