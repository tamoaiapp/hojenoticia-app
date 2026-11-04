# Revisão de SEO e atualização automática — 03/11/2026

O arquivo passou de 1.415 para 1.768 páginas de concursos. As 1.415 URLs anteriores foram preservadas. O estoque futuro passou de 250 para 600 páginas, com reposição automática quando novos concursos forem divulgados. São 1.168 resultados publicados e 600 concursos aguardando confirmação.

O [inventário completo em CSV](seo-paginas-2026-11-03.csv) identifica cada URL, título, descrição, estado, data confirmada e fonte. A auditoria verificou 1.768 títulos e 1.768 descrições distintos, presença de conteúdo, links Markdown internos e formato dos resultados. A revisão dos modelos se aplica a todas essas páginas; ela não representa uma apuração humana individual de cada concurso histórico.

## Cobertura das rotinas

As dez modalidades configuradas passaram a integrar a rotina. Federal, +Milionária e Super Sete ainda não tinham diretórios de conteúdo. A API atual indicada na [configuração do portal oficial da Caixa](https://loterias.caixa.gov.br/Style%20Library/json/params.txt) é `servicebus3.caixa.gov.br`; o servidor anterior continua como alternativa em caso de falha de transporte. A URL da fonte que respondeu é registrada em cada resultado consultado.

| Modalidade | Último concurso verificado | Páginas futuras | Janela inicial |
| --- | ---: | ---: | --- |
| Quina | 7157 | 120 | 7158–7277 |
| Lotofácil | 3819 | 120 | 3820–3939 |
| Mega-Sena | 3080 | 60 | 3081–3140 |
| Dia de Sorte | 1337 | 60 | 1338–1397 |
| Dupla Sena | 3027 | 45 | 3028–3072 |
| Lotomania | 2994 | 45 | 2995–3039 |
| Timemania | 2462 | 45 | 2463–2507 |
| Super Sete | 917 | 45 | 918–962 |
| +Milionária | 403 | 30 | 404–433 |
| Federal | 6114 | 30 | 6115–6144 |
| **Total** | | **600** | |

As consultas programadas ocorrem às 21h20, 22h20 e 23h20 de Brasília, com janelas adicionais aos domingos às 11h20 e 12h20. GitHub Actions pode atrasar execuções; a disponibilidade dos dados depende da Caixa. O processo verifica a numeração oficial, publica os resultados confirmados e preserva os anteriores quando uma consulta falha. Não há promessa de transmissão em tempo real.

Somente o próximo concurso com data explícita na resposta oficial recebe calendário confirmado. As outras futuras são indexáveis, têm canonical próprio, links no histórico e entrada no sitemap comum, sem números sorteados, datas editoriais ou prêmios inventados. A Federal não informou a data da próxima extração nesta consulta, que permanece a confirmar. Futuras não entram no sitemap de notícias nem recebem marcação NewsArticle.

## Manutenção do câmbio — 04/11/2026

O Daily Update mantém cada módulo independente: uma falha no câmbio não descarta resultados confirmados das loterias, mas a execução continua marcada como falha. O resumo do Actions identifica o módulo afetado.

A AwesomeAPI é consultada com até três tentativas para falhas de rede, HTTP 429 ou 5xx. A espera acumulada é limitada a 30 segundos por endpoint; um `Retry-After` maior encerra a consulta sem antecipar a nova tentativa. Falha na consulta principal ou resposta incompleta/inválida preserva os arquivos anteriores. Falha apenas no histórico mantém a série anterior e gera aviso; um 429 esgotado suspende as outras consultas de histórico na mesma execução.

Dados idênticos não recebem nova data de coleta. As páginas exibem separadamente a coleta do registro e o horário da negociação de cada par, em Brasília. O histórico usa o dia de Brasília derivado do timestamp da fonte, inclusive na leitura de arquivos antigos.

Opcionalmente, o proprietário pode configurar o secret `AWESOMEAPI_KEY` no GitHub, com uma chave da própria AwesomeAPI. A rotina envia essa credencial apenas pelo cabeçalho `x-api-key`, conforme a [documentação da fonte](https://docs.awesomeapi.com.br/instrucoes-api-key). Sem esse secret, utiliza o acesso público. Teste local sem publicar: `node scripts/daily-update.mjs --only=cambio --no-push`. Testes sem rede: `node --test scripts/modules/cambio.test.mjs scripts/cambio-freshness.test.mjs` (o teste de leitura requer as dependências do projeto instaladas).

## Textos e navegação

- Os títulos dos concursos publicados identificam modalidade, concurso e data do sorteio. Foram retirados “hoje”, prêmios antigos no título e frases que anunciavam próximos sorteios já passados.
- As descrições usam os números do concurso e linguagem compatível com o formato da modalidade. A revisão editorial local preserva os campos factuais e as datas de publicação existentes; não transforma o dia do sorteio em data de publicação.
- O índice `/loterias` reúne as modalidades e está no sitemap. Os arquivos exibem links HTML para todos os resultados publicados e para as páginas futuras, além dos destaques recentes.
- O rodapé inclui as dez modalidades. Links, metadados e títulos das seções de cotação, horóscopo, feriados e páginas institucionais também foram revisados. A marca deixou de aparecer duas vezes nos títulos.
- Cotações identificam o registro observado e sua data; o horóscopo identifica a edição e seu caráter de entretenimento. Feriados nacionais, locais e pontos facultativos têm rótulos distintos.

## Correções de dados e apresentação

Foram consultados novamente na Caixa 121 concursos antigos da Dupla Sena que tinham 12 números misturados em um único resultado. Os registros passaram a separar primeiro e segundo sorteios, preservando as URLs e a publicação original quando conhecida. Essa é uma reconciliação com a fonte oficial, separada da alteração editorial local.

Federal preserva a ordem e os zeros dos bilhetes por prêmio. Super Sete mantém as sete colunas e dígitos repetidos. +Milionária apresenta os dois trevos. As imagens dos resultados seguem os mesmos formatos.

As estatísticas da Lotomania consideram os 100 números de 00 a 99. A +Milionária considera o universo de 50 dezenas, sem misturar trevos. Intervalos sem aparecer contam somente concursos observados na amostra, que pode ter lacunas. Dupla Sena usa apenas o primeiro sorteio na estatística de dezenas. Federal e Super Sete mostram uma explicação do formato em vez de uma análise que trataria bilhetes e colunas como dezenas intercambiáveis.

## Validação

- 31 testes automatizados de atualização, estoque futuro, preservação editorial, fontes, metadados de notícias e estatísticas passaram.
- A auditoria de conteúdo percorreu as 1.768 páginas sem erros e gerou o CSV completo.
- A comparação com o checkout anterior confirmou a preservação das 1.415 URLs de concursos existentes.
- Dupla Sena: 121 arquivos reconciliados, zero falhas e nenhum `published_at` alterado.
- Segunda execução real das dez modalidades: zero mudanças e zero falhas. Segunda normalização: zero mudanças.
- A migração editorial preservou o hash dos campos factuais: `da41260388fcbedd43b65119d8d752aac1929f5f8c173ea49edf17d11d5fe8fc`.

O volume de páginas não demonstra ganho de tráfego. O Google recomenda [conteúdo útil e confiável](https://developers.google.com/search/docs/fundamentals/creating-helpful-content) e [títulos descritivos e concisos](https://developers.google.com/search/docs/appearance/title-link). A indexação, os títulos exibidos e a posição nas buscas são decisões dos sistemas do Google; os efeitos devem ser acompanhados no Search Console após a publicação.

## Conteúdo por concurso — revisão de 04/11/2026

Os modelos de resultados passaram a produzir um resumo do sorteio com números, complementos e premiação a partir dos campos confirmados. Há conferência específica por modalidade, explicação do formato, perguntas do concurso e navegação por seções. Os títulos de premiação e de resultado identificam modalidade e número do concurso. O leitor calcula títulos e descrições de forma consistente para metadados, cabeçalho, arquivos e feeds. O texto genérico reconhecido é substituído sem remover seções editoriais separadas.

As 1.772 páginas de concursos do inventário atual recebem o modelo: 1.172 publicadas e 600 aguardando confirmação. Futuras continuam indexáveis e têm conteúdo de acompanhamento; datas antigas sem confirmação não entram no título ou na descrição. Bilhetes da Federal mantêm zeros e ordem de prêmio; Super Sete preserva as sete posições; Dupla Sena separa os sorteios e +Milionária mantém os trevos. Ausência de rateio não é apresentada como ausência de ganhadores. Nenhum arquivo de resultados, fonte ou timestamp de publicação foi regravado por esta revisão editorial.

O [CSV de metadados calculados pelo modelo](seo-paginas-2026-11-04.csv) contém as 1.772 URLs, títulos e descrições distintos. A [auditoria HTTP](seo-render-2026-11-04.json) verificou 93 páginas representativas dos modelos e estados, 6.340 referências internas e 1.827 URLs no sitemap, sem falhas, H2 duplicados ou links de seção quebrados. Os 41 testes de dados, editorial, notícias e estatísticas passaram, assim como lint, tipos, build e os smokes de SEO e imagens. As regressões incluem rateio parcial sem a primeira faixa e a identificação explícita do primeiro sorteio na narrativa da Dupla Sena.

Na Quina 7158, a contagem do texto dentro do artigo passou de 467 para 806 palavras, incluindo títulos, números, tabela e navegação. Essa medida registra o aumento de informação disponível, sem estabelecer uma quantidade de palavras necessária para ranquear. O resumo passa a explicar o zero na faixa principal e os dados das faixas de quatro e três acertos do próprio concurso, em vez de apenas repetir sua identificação.
