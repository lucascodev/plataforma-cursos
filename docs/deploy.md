# Deploy no Cloudflare Pages

O site e as rotas `/api` são publicados juntos pelo Cloudflare Pages, conectado ao repositório do GitHub. Cada push na `main` gera um deploy de produção.

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

   Antes do primeiro commit, rode `npm install` para gerar o `package-lock.json` e **inclua o lockfile no commit**. O CI e o Cloudflare usam `npm ci`, que exige o lockfile.

2. No painel do Cloudflare, abra **Workers & Pages > Create > Pages > Connect to Git** e escolha o repositório.
3. Em **Build settings**:

   | Campo | Valor |
   |---|---|
   | Framework preset | None |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | (vazio) |

   A versão do Node vem do arquivo `.nvmrc`. A pasta `functions/` é detectada sozinha e vira as rotas `/api`. O projeto não tem `wrangler.toml` de propósito: assim as variáveis e a data de compatibilidade ficam editáveis no painel.

4. Em **Environment variables**, crie para **Production** (e para **Preview**, se for usar):

   | Variável | Valor |
   |---|---|
   | `SUPABASE_URL` | `https://SEU_PROJECT_REF.supabase.co` |
   | `SUPABASE_PUBLISHABLE_KEY` | a chave publicável (`sb_publishable_...`) |

   **Nunca** cadastre a chave secreta (`sb_secret_...`) nem a `service_role` no Cloudflare. As functions recusam essas chaves e respondem 503 até a configuração ser corrigida.

5. Depois de criado, em **Settings > Runtime**, ajuste **Compatibility date** para `2026-10-01` (a mesma usada no desenvolvimento local).
6. Salve e faça o primeiro deploy. O site fica em `https://plataforma-cursos.pages.dev` (ou no nome que o Cloudflare sugerir).
7. No Supabase, em **Authentication > URL Configuration**, cadastre o endereço final:
   - **Site URL**: `https://plataforma-cursos.pages.dev`
   - **Redirect URLs**: `https://plataforma-cursos.pages.dev/api/auth/callback`
8. Atualize `repositoryUrl` em `content/site.json` e a URL em `package.json` com o seu usuário.

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
- **Branches > Branch protection rules** (ou Rulesets) para `main`: exigir PR, exigir os checks **CI / checks** e **CodeQL**, bloquear force push.
- **Actions > General**: em **Workflow permissions**, deixe **Read repository contents** e desmarque a opção que permite ao Actions criar ou aprovar pull requests.

No Cloudflare, limite quem tem acesso à conta e ative a verificação em duas etapas. Quem pode editar as variáveis de ambiente do projeto pode trocar o Supabase para o qual a API aponta.

## Conferindo o build localmente

```bash
npm run preview
```

Gera o build (com a varredura de chaves no `dist/`) e sobe site e functions juntos em `http://localhost:8788`, com os mesmos cabeçalhos da produção. Erros de CSP aparecem no console do navegador.
