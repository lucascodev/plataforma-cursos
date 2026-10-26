# 0002. Deploy de produção pedido pelo CI por Deploy Hook

- Status: aceita
- Data: 2026-10-27

## Contexto

O Cloudflare Pages publicava a `main` sozinho a cada push, ao mesmo tempo em que as migrations eram aplicadas (ou esquecidas). Código novo podia entrar no ar antes do banco que ele usa. O projeto precisa continuar no plano gratuito e no endereço `*.pages.dev`.

## Decisão

Desligar o deploy automático de produção no Cloudflare. O job `release` do CI aplica as migrations e então chama um Deploy Hook do Cloudflare, mas só se a `main` ainda aponta para o commit migrado. As execuções do `release` ficam numa fila (`concurrency: production`), sem cancelamento. Os previews de branch continuam com o Cloudflare.

## Alternativas consideradas

- `wrangler pages deploy` a partir do Actions: um projeto criado pela integração com o Git não aceita esse tipo de deploy. Seria preciso criar outro projeto e trocar o endereço do site.
- Rodar as migrations no build do Cloudflare: a senha do banco ficaria nas variáveis do projeto, que também chegam às functions em produção.
- Manter o deploy automático: deixa a ordem banco antes do código ao acaso.

## Consequências

- Positivas: o banco nunca fica atrás do código, o endereço não muda e tudo continua gratuito.
- Negativas: o Cloudflare faz o build do HEAD da `main` na hora do hook. Se alguém empurrar outro commit nesse intervalo, sai o código mais novo. Isso é coberto pela regra de migration compatível com o código no ar e pela execução seguinte, que migra e publica de novo.
- O que muda no código: job `release` em `.github/workflows/ci.yml`, environment `production` com secrets e o passo a passo em [deploy.md](../deploy.md#deploy-pela-pipeline).
