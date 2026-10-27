# Versões de curso

Todo curso é publicado em versões. Quem dá aula escreve uma versão nova no editor enquanto a anterior continua no ar; a equipe revisa e publica. Este documento descreve os estados, as regras e onde cada uma é garantida. Para o passo a passo de quem ensina, veja [criando-um-curso.md](criando-um-curso.md).

## Onde fica cada coisa

| Tabela | O que guarda |
|---|---|
| `courses` | O curso e o conteúdo **publicado** (`content`). É o que o catálogo, a página do curso e o plano leem |
| `course_versions` | Cada versão: o rascunho aberto, a que está em revisão, a publicada e as anteriores, com recado de envio, ajustes pedidos e nota da versão |

`course_versions` não tem permissão nenhuma pela API. Só as funções do banco leem e gravam, e cada uma confere quem está chamando: o dono do curso nas funções `teacher_*`, um admin nas `admin_*`. Para qualquer outra pessoa, o curso de outro professor simplesmente "não existe" (404), então um rascunho nunca revela que existe.

`courses.content` só muda numa publicação (`admin_publish_version`). Com isso, a página pública, o RLS e o cache continuam como antes.

## Estados

```
rascunho ──enviar──▶ em revisão ──publicar──▶ publicada ──nova publicação──▶ anterior
   ▲                     │
   └──retirar────────────┤
                         └──pedir ajustes──▶ ajustes pedidos ──reenviar──▶ em revisão
```

| Estado | Quem mexe | O que dá para fazer |
|---|---|---|
| `draft` | Dono | Editar, enviar |
| `in_review` | Admin | Publicar, pedir ajustes. O dono só retira da revisão; o editor fica travado |
| `changes_requested` | Dono | Editar, marcar os ajustes como feitos, reenviar (só com todos marcados) |
| `published` | Admin | Restaurar como rascunho |
| `superseded` | Admin | Restaurar como rascunho |

Índices únicos garantem no máximo **uma versão aberta** (rascunho, em revisão ou com ajustes) e **uma publicada** por curso.

## Número da versão

O número é calculado no envio, a partir da versão publicada e do tipo escolhido: correção sobe o terceiro número, novidade o segundo e mudança grande o primeiro. A primeira publicação é sempre `1.0.0`. A regra existe duas vezes, com o mesmo resultado: `private.next_semver` no banco e `contracts/version/next-semver.ts` no editor, que mostra o número antes do envio.

## Conflitos

Cada versão tem um número de revisão, que sobe a cada gravação. O editor manda a revisão que leu; se outra aba ou aparelho gravou antes, o banco recusa com `version-conflict` (409) e o editor para de salvar até a pessoa recarregar. Enviar, retirar, pedir ajustes e publicar conferem a revisão do mesmo jeito.

## Validação

O conteúdo de um rascunho pode estar incompleto. A validação completa usa o mesmo schema do site (`contracts/course/course-content.schema.ts`), com as mensagens em português de `contracts/course/checks/`:

1. no editor, a cada mudança, para mostrar erros e avisos;
2. na API, antes de enviar para revisão, contra a revisão exata que está sendo enviada;
3. na API, antes de publicar.

Por isso uma versão publicada sempre abre na página do curso.

Na publicação, o banco também completa os ids de aulas e exercícios que faltarem (`private.course_content_with_item_ids`) e grava o número da versão e a data no conteúdo.

## Efeito em quem estuda

O progresso guarda as aulas pelo id (`<módulo>-<aula>`), então reordenar e reescrever não muda nada para ninguém. Remover uma aula ou um exercício publicado faz o item deixar de contar no progresso de quem já o concluiu (a marca fica guardada, mas o item não existe mais no curso). O editor e a tela de revisão mostram quantos itens publicados saem na versão.

## Histórico público

`public_course_releases` lista as versões publicadas de um curso publicado (número, tipo, nota e data), sem rascunhos nem recados. A API responde em `GET /api/courses/<slug>/releases`.

## Números para quem ensina

`teacher_course_stats` devolve só contagens somadas: pessoas estudando, ativas nos últimos 7 dias, projetos entregues, quantas concluíram e em que módulo as pessoas estão. Qualquer número abaixo de 5 vem como `null` e aparece como "menos de 5". A distribuição por módulo só aparece com pelo menos 5 pessoas no curso. Nenhum nome, anotação ou diário sai de `course_progress`.

## Histórico de administração

Enviar, retirar, pedir ajustes, publicar e restaurar gravam uma linha em `audit_log` (`version.*`), com o curso como alvo e só ids e números da versão nos dados.

## API

| Rota | Quem | O que faz |
|---|---|---|
| `GET /api/teaching/courses` | Professor | Seus cursos, com versão publicada, versão aberta e número de estudantes |
| `GET /api/teaching/courses/<slug>` | Dono | Versão aberta com o conteúdo e o conteúdo publicado, para comparar |
| `GET /api/teaching/courses/<slug>/stats` | Dono ou admin | Números do curso |
| `POST /api/teaching/courses/<slug>/draft` | Dono | Abre um rascunho a partir da versão publicada |
| `PUT /api/teaching/courses/<slug>/draft` | Dono | Salva o rascunho (`versionId`, `revision`, `content`) |
| `POST /api/teaching/courses/<slug>/submit` | Dono | Envia para revisão (`versionId`, `revision`, `kind`, `message`) |
| `POST /api/teaching/courses/<slug>/withdraw` | Dono | Retira da revisão |
| `PUT /api/teaching/courses/<slug>/review-items/<id>` | Dono | Marca um ajuste como feito |
| `GET /api/admin/courses/<slug>/versions` | Admin | Versões do curso |
| `GET /api/admin/versions/<id>` | Admin | Uma versão, com o conteúdo publicado para comparar |
| `POST /api/admin/versions/<id>/publish` | Admin | Publica (`revision`, `releaseNote`) |
| `POST /api/admin/versions/<id>/request-changes` | Admin | Pede ajustes (`revision`, `items`) |
| `POST /api/admin/versions/<id>/restore` | Admin | Restaura uma versão publicada como rascunho |
