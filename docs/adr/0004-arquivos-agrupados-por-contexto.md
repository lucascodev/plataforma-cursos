# 0004. Arquivos agrupados por contexto em subpastas

- Status: aceita
- Data: 2026-10-27

## Contexto

O projeto segue a regra de um artefato por arquivo. Com o tempo, várias pastas acumularam dezenas de arquivos soltos de assuntos diferentes: 39 em `contracts/`, 23 em `server/shared/http/`, 14 em `src/shared/utils/date/`. Ficou difícil achar o que pertence a quê.

## Decisão

Quando uma pasta passa de cerca de seis arquivos, ou quando dois ou mais arquivos pertencem ao mesmo contexto, eles vão para uma subpasta com o nome desse contexto (por exemplo `server/shared/http/cookies/`, `contracts/proposal/`, `src/modules/courses/domain/rules/plan/tasks/`). Os nomes de subpasta descrevem o assunto, nunca `common`, `misc` ou `helpers`, e as subpastas não ganham `index.ts`. Fora de páginas, componentes e hooks, não se cria subpasta para um arquivo só. Testes que cobrem vários arquivos ficam na pasta de cima.

Exceção: `supabase/migrations/` continua plana, porque o Supabase CLI só lê arquivos nessa pasta.

## Alternativas consideradas

- Manter as pastas planas: cada pasta nova repetiria o problema.
- Agrupar por tipo técnico (`types/`, `utils/`): mistura assuntos e esconde o contexto.

## Consequências

- Positivas: cada assunto fica junto, e a pasta mostra o que o módulo faz.
- Negativas: caminhos de import mais longos.
- O que muda no código: os commits `refactor(...)` de 2026-10-27 só mudaram arquivos de lugar e corrigiram imports, sem mudar comportamento.
