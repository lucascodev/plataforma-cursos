# 0003. Limite de escrita por pessoa no banco

- Status: aceita
- Data: 2026-10-27

## Contexto

A API não tinha limite de requisições. As regras de rate limit do WAF do Cloudflare exigem um domínio próprio e não funcionam em `*.pages.dev`, e o projeto não vai ter domínio tão cedo. A chave publicável é pública, então qualquer pessoa com conta pode escrever direto pelo PostgREST, sem passar pelas functions.

## Decisão

Contar as escritas no próprio banco: tabela `rate_limits` sem acesso pela API e função `consume_rate_limit(bucket, max, window)`, chamada por triggers nas tabelas que recebem escrita. Janela fixa por pessoa e por ação. Quem passa recebe `PT429`, que a API devolve como `429 rate-limited`.

## Alternativas consideradas

- Rate limit do WAF: indisponível sem domínio próprio.
- Limite nas functions (memória ou KV): não vale para quem escreve direto pelo PostgREST, e a memória de um Worker não é compartilhada entre instâncias.

## Consequências

- Positivas: vale para qualquer caminho de escrita, inclusive direto pela API do Supabase. Sem serviço extra, sem custo.
- Negativas: cada escrita faz mais um `insert ... on conflict` no banco. Visitantes sem conta não são limitados aqui: pedidos que forcem chamadas ao Auth continuam dependendo dos limites do próprio Supabase (veja [seguranca.md](../seguranca.md#riscos-conhecidos)).
- O que muda no código: migration `20261027090100_harden_writes.sql`, mapeamento do hint `rate-limited` em `server/shared/http/upstream/upstream-problem.ts`. Novas tabelas com escrita ganham o trigger `rate_limit_writes`.
