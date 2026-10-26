# Política de segurança

## Versões com suporte

Só a versão publicada a partir da branch `main` recebe correções.

## Como relatar uma vulnerabilidade

**Não abra issue pública.** Use o relato privado do GitHub: aba **Security**, depois **Report a vulnerability**. Inclua:

- o que acontece e qual o impacto (por exemplo: ler o progresso de outra pessoa);
- passos para reproduzir;
- versão, navegador e, se souber, o trecho de código envolvido.

Resposta inicial em até 7 dias. Quando a correção sair, o relato é publicado com crédito para quem encontrou, se a pessoa quiser.

## Como as chaves são protegidas

- O navegador não recebe nenhuma chave nem token do Supabase. Ele fala só com as rotas `/api` do próprio site.
- A sessão fica em cookies `__Host-` com `HttpOnly`, `Secure` e `SameSite=Lax`. O JavaScript da página não consegue lê-los.
- As functions do Cloudflare usam a chave **publicável** junto com o token de cada pessoa. A proteção dos dados vem das políticas de Row Level Security em `supabase/migrations/`, testadas em `supabase/tests/`.
- A chave **secreta** só existe no `.env.local` de quem importa cursos. As functions recusam essa chave se ela for cadastrada por engano.
- O build falha se encontrar no `dist/` qualquer chave do Supabase (secreta ou publicável), a URL de um projeto, um token do GitHub ou uma chave privada.
- Cabeçalhos de segurança (CSP com `connect-src 'self'` e Trusted Types, HSTS, `frame-ancestors 'none'`) ficam em `public/_headers`.
- Escritas no banco têm limite por pessoa. Os testes de RLS rodam no CI a cada push, e as migrations só chegam a produção depois deles.
- O que precisa ser conferido nos painéis do Supabase, do GitHub e do Cloudflare está em [docs/seguranca.md](docs/seguranca.md).

## Achou uma chave exposta?

Se você encontrar no repositório, no histórico do git ou no site publicado uma chave secreta do Supabase (`sb_secret_...` ou um JWT com `"role": "service_role"`), um token do GitHub ou qualquer outra credencial privada, relate pelo canal acima. Quem mantém o projeto deve:

1. revogar ou rotacionar a chave no painel do provedor imediatamente;
2. conferir os logs do Supabase e do Cloudflare em busca de uso indevido;
3. remover a chave do histórico só depois de revogada (apagar o commit não invalida a chave).

## Fora do escopo

- Ataques que exigem acesso físico ao aparelho ou ao navegador já comprometido.
- Negação de serviço por volume contra o plano gratuito do Supabase ou do Cloudflare.
