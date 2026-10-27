# Criando um curso

Um curso nasce de uma proposta e é escrito no editor da plataforma. Não existe outro caminho: nada de arquivo JSON, pull request ou importação. Este guia é para quem vai ensinar.

## 1. Proponha

Em **Propor curso**, conte do que trata o curso, para quem é, o nível, a duração estimada e os módulos previstos, e aceite os três compromissos:

- o conteúdo publicado fica aberto, sob a licença CC BY 4.0, e o curso é gratuito para quem estuda;
- os projetos rodam no computador de quem estuda, sem custo, ou indicam uma alternativa barata;
- cada versão do curso passa por revisão antes de ser publicada.

A equipe responde na página da proposta. Quando ela é aprovada, você vira professor, ganha um perfil público e o curso aparece em **Área do professor** como rascunho, já com os módulos que você listou. Veja [papeis-e-propostas.md](papeis-e-propostas.md) para o fluxo completo da proposta.

## 2. Escreva no editor

Em **Área do professor**, abra o curso. O editor tem quatro abas:

| Aba | O que tem |
|---|---|
| Informações | Título, frase curta (aparece no catálogo), descrição, nível e para quem é. O endereço (`/cursos/<slug>`) é fixo |
| Módulos e aulas | Para cada módulo: nome, tipo, objetivo, pré-requisito, caso de estudo, aulas, exercícios de fixação, projeto, autoavaliação e material de apoio |
| Guia | Seções de orientação que aparecem na página do curso, abaixo dos módulos |
| Ritmo e plano | Horas de segunda a sexta, sábado e domingo, duração de cada módulo em meses e a tarefa do primeiro dia |

O rascunho é salvo sozinho, um instante depois de você parar de digitar. O cabeçalho mostra se está salvo. Se a mesma versão for editada em outra aba ou aparelho, o editor avisa e para de salvar até você recarregar: nada é sobrescrito sem você saber.

Só você e a equipe veem o rascunho. Enquanto ele não é publicado, quem estuda continua vendo a versão que está no ar.

### Tipos de módulo

| Tipo | Uso |
|---|---|
| Módulo normal | Aulas, exercícios de fixação e um projeto |
| Projeto de conclusão | O projeto final que junta o curso. Quem entrega este projeto conta como "concluiu o curso" nos números |
| Contínuo (só domingos) | Acompanha o curso todo, sempre aos domingos (por exemplo, carreira). Fica com 0 meses |

### Aulas e exercícios têm id fixo

Cada aula ganha um id (`t…`) e cada exercício de fixação um id (`e…`) quando é criado. O progresso de quem estuda é guardado por esse id, então dá para reordenar, renomear e reescrever aulas sem mexer no que as pessoas já concluíram.

Remover uma aula que já está publicada faz ela deixar de contar no progresso de quem a concluiu, quando a versão nova sair. O editor avisa antes de remover.

## 3. Confira a checagem automática

O painel ao lado mostra:

- **Erros**: campos obrigatórios vazios ou fora do formato. Impedem o envio. É o mesmo schema que o site usa para abrir o curso, então um curso sem erros sempre abre.
- **Avisos**: o que costuma deixar o curso mais fraco, como descrição curta, módulo sem exercícios de fixação ou sem material de apoio e curso sem guia. Não impedem o envio.
- **Mudanças nesta versão**: o que muda em relação à versão publicada, módulo por módulo.

## 4. Envie para revisão

Com zero erros, use **Enviar para revisão**. Escolha o tipo da versão e, se quiser, deixe um recado para quem revisa:

| Tipo | Quando usar | Exemplo |
|---|---|---|
| Correção | Texto revisado, links consertados | 1.2.0 → 1.2.1 |
| Novidade | Aulas, exercícios ou módulos novos | 1.2.0 → 1.3.0 |
| Mudança grande | O curso muda de estrutura ou de rumo | 1.2.0 → 2.0.0 |

A primeira publicação é sempre a 1.0.0. Enquanto a versão está em revisão, o editor fica travado; para mexer de novo, use **Retirar da revisão**.

## 5. Ajustes e publicação

A equipe publica a versão ou pede ajustes. Os ajustes aparecem no editor como uma lista: faça cada um, marque como feito e reenvie. Só dá para reenviar com todos marcados.

Quando a versão é publicada, ela substitui a anterior no catálogo e entra no histórico de versões do curso. Quem já estuda recebe o plano novo; dias marcados como feitos continuam feitos. O site guarda o curso em cache por alguns minutos, então a mudança pode levar uns 5 minutos para aparecer.

Os detalhes de cada estado de uma versão estão em [versoes-de-curso.md](versoes-de-curso.md).

## Como o plano diário é montado

A plataforma calcula o plano de cada pessoa a partir da duração dos módulos e do ritmo:

1. Semanas do módulo: `meses × 52 ÷ 12`, arredondado. Dias de estudo: semanas × 6 (segunda a sábado).
2. Dias de projeto: 20% dos dias, no mínimo 6. Um dia por exercício de fixação e um dia de autoavaliação.
3. O que sobra é dividido igualmente entre as aulas. Cada aula tem dias de estudo (cerca de 35%), dias de exercício e, se tiver 3 dias ou mais, um dia de revisão.
4. Ordem de cada módulo: aulas, exercícios de fixação, projeto (planejar, construir, avaliar, publicar) e autoavaliação.
5. Domingos: se o curso tiver trilha de domingo, cada domingo recebe um marco ou o próximo item do rodízio. A trilha de domingo e o diagrama de arquitetura do guia são mantidos como estão pelo editor; o editor deles chega numa próxima versão da plataforma.

## Boas práticas de conteúdo

- Projetos que rodem localmente e sem custo; quando precisar de GPU ou API paga, ofereça uma alternativa na dica para computador modesto.
- Exercícios com entrega verificável ("escreva um script que...", "compare X com Y").
- Critérios de pronto objetivos, que a própria pessoa consiga conferir.
- Links para fontes estáveis (documentação oficial, livros, cursos conhecidos). Material de terceiros entra como link, nunca copiado.

## Para quem desenvolve a plataforma

O banco local (`pnpm db:reset`) é criado com os cursos de exemplo de `supabase/seed/courses/`. Esses arquivos não vão para produção: servem para testar o site e o editor na sua máquina.
