# Criando um curso

> Este é o caminho atual para quem mantém a instância. Pessoas de fora propõem cursos pela plataforma, em **Propor curso** (veja [papeis-e-propostas.md](papeis-e-propostas.md)). Quando o editor de cursos chegar, ele substitui a importação por JSON.

Um curso é um arquivo JSON. Não é preciso mexer em código. O arquivo fica no repositório para revisão em pull request e, depois de aprovado, quem mantém a plataforma importa o curso para o Supabase.

## 1. Crie o arquivo

```
supabase/seed/courses/<slug>.json
```

O `slug` vira o endereço do curso (`/cursos/<slug>`) e a chave do progresso. Use letras minúsculas, números e hífens, e **não troque depois de publicar**: o progresso das pessoas fica preso ao slug.

A forma mais rápida é copiar `supabase/seed/courses/engenharia-de-ia.json` e editar. Mantenha a primeira linha:

```json
"$schema": "../../../contracts/course/course.schema.json",
```

Com ela, o VS Code autocompleta os campos e sublinha erros enquanto você escreve.

## 2. Campos do curso

| Campo | O que é |
|---|---|
| `slug` | Igual ao nome do arquivo, sem o `.json` |
| `title`, `tagline`, `description` | Nome, frase curta e descrição do catálogo |
| `level`, `audience` | Nível e para quem é |
| `version`, `updatedAt` | Versão do conteúdo (`1.0.0`) e data da última revisão (`AAAA-MM-DD`) |
| `rhythm` | Horas de estudo: `weekdayHours` (segunda a sexta), `saturdayHours`, `sundayHours` |
| `kickoff` | Tarefa do primeiro dia (`title`, `detail`) |
| `sundayTrack` | Opcional. Trilha leve dos domingos (veja abaixo) |
| `modules` | Lista de módulos, na ordem de estudo |
| `guide` | Opcional. Diagrama de arquitetura e seções de orientação |

## 3. Campos de cada módulo

| Campo | O que é |
|---|---|
| `id` | Identificador curto e único (`m1`, `m2`...). **Não troque depois de publicar**: o progresso usa o id |
| `shortTitle`, `title` | Nome curto (trilha) e nome completo |
| `kind` | `standard`, `capstone` (projeto de conclusão) ou `continuous` (só domingos, ao longo do curso) |
| `months` | Duração em meses (aceita `1.5`). Módulos `continuous` usam `0` |
| `projectDays` | Opcional. Dias reservados ao projeto; o padrão é 20% do módulo, no mínimo 6 |
| `prerequisite`, `goal`, `caseStudy` | Antes de começar, objetivo e caso de estudo |
| `lowSpecTip` | Opcional. Como fazer o módulo em computador modesto |
| `lessons` | Aulas: `title`, `summary`, `exercise` |
| `drills` | Exercícios de fixação antes do projeto: `title`, `task` |
| `project` | `title`, `brief`, `requirements` (lista) e `doneCriteria` (lista) |
| `selfCheck` | Perguntas de autoavaliação |
| `resources` | Materiais: `type` (ex.: `vídeo`, `docs`), `label`, `url` (sempre `https://`) |

Cada aula e cada exercício de fixação tem um `id` fixo dentro do módulo: aulas começam com `t` e exercícios com `e`, seguidos de letras minúsculas ou números (`t0`, `tpgvector`, `e3`). O progresso de quem estuda é guardado por esse id (`m1-t0`, `m1-e2`, e `m1-cp` para o projeto), então dá para reordenar aulas sem mexer no que as pessoas já concluíram.

- Nunca troque o id de uma aula que já foi publicada: quem a concluiu perde a marcação.
- Aula nova ganha um id novo, que ainda não foi usado no módulo.
- Sem `id`, a aula usa a posição (`t0`, `t1`…). É assim que os cursos antigos continuam funcionando, mas um id explícito é mais seguro.

## 4. Como o plano diário é montado

A plataforma calcula tudo a partir de `months` e `rhythm`:

1. Semanas do módulo: `meses × 52 ÷ 12`, arredondado. Dias de estudo: semanas × 6 (segunda a sábado).
2. Dias de projeto: `projectDays` ou 20% dos dias, no mínimo 6. Um dia por exercício de fixação e um dia de autoavaliação.
3. O que sobra é dividido igualmente entre as aulas. Cada aula tem dias de estudo (cerca de 35%), dias de exercício e, se tiver 3 dias ou mais, um dia de revisão.
4. Ordem de cada módulo: aulas, exercícios de fixação, projeto (planejar, construir, avaliar, publicar) e autoavaliação.
5. Domingos: se houver `sundayTrack`, cada domingo recebe um marco (`milestones`) ou o próximo item da rotação (`rotation`).

### Trilha de domingo

```json
"sundayTrack": {
  "moduleId": "m9",
  "rotation": [{ "title": "Leitura de paper", "detail": "..." }],
  "milestones": [{ "sunday": 6, "title": "Portfólio público", "detail": "...", "lessonIndex": 0 }]
}
```

- `moduleId` aponta para um módulo `continuous`.
- `sunday` é o número do domingo, começando em 0. Números negativos contam do fim: `-1` é o último domingo.
- `lessonIndex` liga o marco a uma aula do módulo da trilha, que pode ser marcada como feita naquele dia.

## 5. Valide

```bash
pnpm test
```

O teste de conteúdo lê todos os arquivos de `supabase/seed/courses/` e falha se algum estiver inválido, mostrando o campo e o motivo.

O schema também confere: ids de módulo repetidos, `months` igual a 0 fora de módulo `continuous`, `sundayTrack` apontando para módulo inexistente e `lessonIndex` fora do intervalo.

## 6. Publique

1. Abra um pull request. O CI valida o conteúdo.
2. Depois do merge, quem mantém a plataforma importa o curso, da própria máquina, com a chave secreta no `.env.local` (veja [configurando-contas.md](configurando-contas.md#7-importe-os-cursos)):

   ```bash
   pnpm content:import -- supabase/seed/courses/<slug>.json            # rascunho, não aparece no catálogo
   pnpm content:import -- supabase/seed/courses/<slug>.json --publish  # publica
   ```

Rodar de novo atualiza o curso. Sem `--publish`, um curso que já estava publicado continua publicado. Para tirar um curso do ar, mude `published` para `false` no painel do Supabase; o banco não deixa apagar um curso que já tem progresso de alguém.

O site e o Cloudflare guardam o curso em cache por alguns minutos, então uma atualização pode levar até uns 5 minutos para aparecer.

## Boas práticas de conteúdo

- Projetos que rodem localmente e sem custo; quando precisar de GPU ou API paga, ofereça alternativa em `lowSpecTip`.
- Exercícios com entrega verificável ("escreva um script que...", "compare X com Y").
- Critérios de pronto objetivos, que a própria pessoa consiga conferir.
- Links para fontes estáveis (documentação oficial, livros, cursos conhecidos).
