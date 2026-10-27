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

Cada aula ganha um id (`t…`) e cada exercício de fixação um id (`e…`) quando é criado. Perguntas, opções, passos e etapas dos exercícios também têm id (`q…`, `o…`, `p…`, `c…`). O progresso de quem estuda é guardado por esse id, então dá para reordenar, renomear e reescrever aulas sem mexer no que as pessoas já concluíram.

Remover uma aula que já está publicada faz ela deixar de contar no progresso de quem a concluiu, quando a versão nova sair. O editor avisa antes de remover.

### Tipos de exercício

Cada aula tem um exercício. Ele pode ser um texto simples, como antes, ou um dos tipos abaixo. Todos os tipos têm enunciado, tempo estimado, dificuldade, dicas (a pessoa abre uma de cada vez), critérios de "pronto quando", sugestões para quem travou e uma solução opcional, que você escolhe mostrar depois de concluir, depois de 3 tentativas ou nunca.

| Tipo | Como a pessoa faz |
|---|---|
| Entrega | Cola um link, escreve um texto ou os dois |
| Quiz | Responde perguntas de múltipla escolha. Você marca a opção certa, pode escrever uma explicação e define quantos acertos bastam |
| Código com testes | Escreve código no navegador (Python, JavaScript ou SQL) e roda os seus testes |
| Passo a passo | Marca cada passo, que pode ter um comando com botão de copiar |
| Reflexão | Responde uma pergunta no diário |
| Laboratório | Faz uma tarefa maior no navegador, no GitHub Codespaces ou no próprio computador |

A pessoa nunca fica presa: dá para concluir mesmo com algo faltando, e a página mostra o que ficou para trás.

A solução vai junto com o curso. Ela ajuda a estudar, mas não é segredo.

#### Código com testes

O código da pessoa fica num arquivo `solucao.py`, `solucao.js` ou `solucao.sql`. Os testes:

| Linguagem | Como escrever |
|---|---|
| Python | Funções `test_...` com `assert`. Importe o código com `from solucao import ...` |
| JavaScript | `test("nome", () => { ... })` com `assert(condição, mensagem)` ou `assertEqual(atual, esperado)`. O código da pessoa já está carregado |
| SQL (SQLite) | Blocos separados por uma linha `-- test: nome`. Cada bloco é uma consulta que devolve `1` quando está certo |

Escreva a solução de referência no campo de solução e use **Rodar os testes com a solução** para conferir os testes antes de enviar. Os testes rodam no mesmo ambiente isolado que as pessoas usam.

#### Laboratório

| Onde | Como é conferido |
|---|---|
| No navegador | Você escreve os arquivos iniciais e um teste curto por etapa (passa quando não dá erro). **Rodar as etapas com os arquivos iniciais** mostra o que a pessoa vai ver no começo |
| GitHub Codespaces | A pessoa abre o repositório num Codespace da própria conta (usa a cota gratuita dela). O repositório precisa ter um `.devcontainer` |
| No computador | A pessoa clona o repositório e roda os comandos que você listar |

No Codespaces e no computador, o repositório precisa ter um script de verificação. Ele confere o trabalho e, se tudo passar, mostra um **código de conclusão** no formato `LAB-XXXXXXXX`. A pessoa cola o código na página do exercício e a plataforma compara com o código que você cadastrou.

Para o código só aparecer para quem fez certo, calcule-o a partir da **saída** do trabalho, não de um texto fixo: por exemplo, o resultado da busca para perguntas fixas. Modelo em Python:

```python
import hashlib
import json
import sys

from busca import buscar  # o código que a pessoa escreveu

PERGUNTAS = ["gato", "banco de dados", "chuva"]


def conferir():
    resultados = [buscar(pergunta, k=2) for pergunta in PERGUNTAS]
    if any(len(resultado) != 2 for resultado in resultados):
        print("FALHOU: cada busca deve devolver 2 frases")
        sys.exit(1)
    print("OK: as buscas devolvem 2 frases")
    return resultados


saida = json.dumps(conferir(), ensure_ascii=False, sort_keys=True)
resumo = hashlib.sha256(saida.encode("utf-8")).hexdigest()[:8].upper()
print(f"Código de conclusão: LAB-{resumo}")
```

Para cadastrar o código, rode o script com a solução certa e cole o código no campo **Código de conclusão** do laboratório, no editor. O código é salvo na hora, fora do conteúdo do curso, e nunca aparece para quem estuda. Ele começa a valer quando a versão é publicada. Laboratório sem código cadastrado não pode ser concluído.

Como qualquer conferência que roda na máquina de quem estuda, isso é de boa-fé: quem tiver a saída certa consegue o código. Serve para a pessoa saber que terminou, não como prova.

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
