# Análise das 500 consultas do Search Console — Hoje Notícia

## Base e recorte

Anexo local: `C:/Users/Notebook/.codex/attachments/4ba1fc1b-c35a-4616-b4fe-fc08de883d67/Pasted text.txt`. SHA-256: `a731727f32e7572fc4acaca34dd8d645420076a1f4c6f58f02c61eb386ead252`. O texto informa **27/04/2026 a 01/11/2026** e **linhas 1–500 de 1.000**. Apesar de conter o texto de um botão “3 meses”, o período explícito do gráfico é este. Não foi misturado ao print anterior de três meses. Todas as 500 linhas tabulares foram analisadas, sem amostragem ou descarte. Dados processados somente nesta máquina.

Snapshot do checkout em `2026-11-03T13:54:03.528Z`; HEAD `5743e9e0b469508f107a22b47357c2a8b7ff9142`. Baseline anterior à recuperação: `9a7c960bed8d63dfa5701f972ab3099b5b9e282c`. O checkout não demonstra o estado de uma URL na data de cada clique. A restauração das futuras é alteração autorizada e deve ser preservada.

O [CSV linha por linha](seo-consultas-2026-11-03.csv) mantém as 500 consultas na ordem original, número da linha no anexo, texto integral, contagens originais, CTR individual, grupo normalizado, estados dos arquivos e ação sugerida. Formato: CSV padrão separado por vírgula, UTF-8 com BOM, decimais com ponto.

## Números do recorte

- **500 consultas**, **4.489 cliques**, **199.979 impressões** e **2,24% de CTR ponderada**. Fórmula: cliques ÷ impressões × 100. A taxa agregada usa as somas, não a média simples das taxas individuais.
- **162 grupos modalidade/concurso**: 161 identificados e uma consulta ambígua. As variantes acrescentam 338 linhas ao conjunto de grupos; isso não justifica duplicar páginas.
- Lotofácil, Quina e Mega-Sena somam **4.324 cliques (96,32%)** e **194.329 impressões (97,17%)**.
- 253 linhas contêm resultado (1.943 cliques/98.672 impressões). Apenas 2 contêm hoje (9 cliques/99 impressões). Atender o concurso específico não exige chamar resultados históricos de atuais.
- **concurso 7051** é a única consulta sem modalidade explícita: 2 cliques, 327 impressões, 0,61% de CTR. Não foi somada automaticamente à Quina.

| Modalidade | Consultas | Cliques | Impressões | CTR |
| --- | --- | --- | --- | --- |
| Lotofácil | 252 | 2.113 | 83.951 | 2,52% |
| Quina | 161 | 1.693 | 84.559 | 2,00% |
| Mega-Sena | 54 | 518 | 25.819 | 2,01% |
| Lotomania | 18 | 92 | 2.977 | 3,09% |
| Dupla Sena | 8 | 49 | 1.784 | 2,75% |
| Dia de Sorte | 3 | 11 | 354 | 3,11% |
| Loteca | 2 | 9 | 138 | 6,52% |
| Não identificada | 1 | 2 | 327 | 0,61% |
| Timemania | 1 | 2 | 70 | 2,86% |

## Grupos com mais cliques

Variações de acento, hífen, espaço e termos auxiliares foram agrupadas pela mesma modalidade/concurso. A normalização serve à análise e à busca interna; não recomenda repetir termos no texto nem criar URLs de sinônimos.

| Grupo | Variantes | Cliques | Impressões | CTR | Estado checkout | Data no arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| Quina 7052 | 8 | 302 | 5.125 | 5,89% | publicado | 2026-06-29 |
| Lotofácil 3790 | 13 | 299 | 20.370 | 1,47% | publicado | 2026-09-27 |
| Mega-Sena 3007 | 14 | 152 | 9.556 | 1,59% | publicado | 2026-05-12 |
| Lotofácil 3792 | 8 | 146 | 2.675 | 5,46% | publicado | 2026-09-29 |
| Mega-Sena 3018 | 6 | 126 | 5.018 | 2,51% | publicado | 2026-06-14 |
| Quina 7051 | 7 | 106 | 5.627 | 1,88% | publicado | 2026-06-28 |
| Lotofácil 3709 | 8 | 104 | 7.546 | 1,38% | publicado | 2026-06-12 |
| Lotofácil 3780 | 8 | 102 | 1.325 | 7,70% | publicado | 2026-09-15 |
| Mega-Sena 3029 | 7 | 97 | 6.152 | 1,58% | publicado | 2026-07-09 |
| Lotofácil 3719 | 8 | 95 | 4.043 | 2,35% | publicado | 2026-06-25 |
| Quina 7053 | 4 | 95 | 1.389 | 6,84% | publicado | 2026-06-30 |
| Lotofácil 3727 | 9 | 76 | 4.710 | 1,61% | publicado | 2026-07-04 |
| Lotofácil 3704 | 7 | 75 | 2.170 | 3,46% | publicado | 2026-06-06 |
| Mega-Sena 3008 | 11 | 75 | 1.880 | 3,99% | publicado | 2026-05-14 |
| Lotofácil 3715 | 9 | 72 | 3.073 | 2,34% | publicado | 2026-06-20 |
| Lotofácil 3744 | 7 | 69 | 2.422 | 2,85% | publicado | 2026-07-24 |
| Lotofácil 3794 | 4 | 66 | 856 | 7,71% | publicado | 2026-10-01 |
| Quina 7054 | 3 | 65 | 3.699 | 1,76% | publicado | 2026-07-01 |
| Lotofácil 3716 | 7 | 62 | 2.308 | 2,69% | publicado | 2026-06-20 |
| Lotofácil 3723 | 6 | 61 | 1.678 | 3,64% | publicado | 2026-06-30 |
| Lotofácil 3711 | 7 | 60 | 2.528 | 2,37% | publicado | 2026-06-15 |
| Lotofácil 3708 | 5 | 60 | 1.585 | 3,79% | publicado | 2026-06-11 |
| Lotofácil 3689 | 6 | 53 | 931 | 5,69% | publicado | 2026-05-19 |
| Lotofácil 3705 | 5 | 52 | 1.816 | 2,86% | publicado | 2026-06-08 |
| Quina 7062 | 4 | 51 | 6.701 | 0,76% | publicado | 2026-07-10 |

Lotofácil 3790 reúne **13 variantes, 299 cliques e 20.370 impressões**. Quina 7052 reúne **8 variantes e 302 cliques**. Mega-Sena 3007 reúne **14 variantes e 152 cliques**. São alvos concretos para busca tolerante e navegação histórica. Diferenças de CTR entre concursos não comprovam problema no título: posição, dispositivo e momento podem variar.

## Exposição alta e CTR abaixo do filtro operacional

O filtro de triagem por consulta é **pelo menos 1.000 impressões e CTR inferior a 1%**. Há **19 consultas**, **228 cliques** e **47.224 impressões**. O limiar organiza a investigação; não é referência universal de desempenho. A posição não foi fornecida, então não há causa comprovada de CTR menor.

| Consulta original | Cliques | Impressões | CTR | Grupo |
| --- | --- | --- | --- | --- |
| resultado da quina 7098 | 20 | 5.079 | 0,39% | Quina 7098 |
| quina 7059 | 21 | 4.061 | 0,52% | Quina 7059 |
| lotofácil 3810 | 14 | 3.862 | 0,36% | Lotofácil 3810 |
| resultado da quina concurso 7091 | 11 | 3.692 | 0,30% | Quina 7091 |
| resultado da quina concurso 7098 | 8 | 3.455 | 0,23% | Quina 7098 |
| quina 7062 | 21 | 3.217 | 0,65% | Quina 7062 |
| resultado da lotofácil 3709 | 25 | 2.506 | 1,00% | Lotofácil 3709 |
| quina 7092 | 3 | 2.362 | 0,13% | Quina 7092 |
| quina 7039 | 16 | 2.235 | 0,72% | Quina 7039 |
| quina 7026 | 15 | 2.234 | 0,67% | Quina 7026 |
| resultado da lotofácil concurso 3709 | 16 | 2.064 | 0,78% | Lotofácil 3709 |
| resultado da quina 7074 | 5 | 2.019 | 0,25% | Quina 7074 |
| resultado da quina 7062 | 18 | 1.997 | 0,90% | Quina 7062 |
| resultado da lotofácil concurso 3750 | 2 | 1.952 | 0,10% | Lotofácil 3750 |
| resultado da quina concurso 7062 | 9 | 1.476 | 0,61% | Quina 7062 |
| resultado da lotofácil concurso 3727 | 7 | 1.474 | 0,47% | Lotofácil 3727 |
| resultado da quina concurso 7065 | 3 | 1.381 | 0,22% | Quina 7065 |
| resultado da quina 7090 | 5 | 1.113 | 0,45% | Quina 7090 |
| resultado da quina 7026 | 9 | 1.045 | 0,86% | Quina 7026 |

Após agrupar variantes, o filtro **pelo menos 2.000 impressões e CTR inferior a 1%** encontra **10 grupos**, **283 cliques/42.839 impressões** e CTR ponderada **0,66%**. Priorizar o volume observado, sem prometer ganho.

| Grupo | Variantes | Cliques | Impressões | CTR | Estado checkout | Data no arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| Quina 7098 | 3 | 49 | 8.647 | 0,57% | publicado | 2026-08-21 |
| Quina 7062 | 4 | 51 | 6.701 | 0,76% | publicado | 2026-07-10 |
| Lotofácil 3810 | 4 | 35 | 5.181 | 0,68% | publicado | 2026-10-21 |
| Quina 7059 | 3 | 27 | 4.206 | 0,64% | publicado | 2026-07-07 |
| Quina 7091 | 2 | 22 | 3.857 | 0,57% | publicado | 2026-08-13 |
| Quina 7026 | 3 | 31 | 3.785 | 0,82% | publicado | 2026-05-15 |
| Quina 7039 | 3 | 24 | 3.039 | 0,79% | publicado | 2026-05-30 |
| Quina 7090 | 3 | 28 | 2.878 | 0,97% | publicado | 2026-08-12 |
| Quina 7092 | 1 | 3 | 2.362 | 0,13% | publicado | 2026-08-14 |
| Quina 7074 | 2 | 13 | 2.183 | 0,60% | publicado | 2026-07-24 |

## Concursos futuros: conservar a finalidade pré-sorteio

**Cinco grupos atualmente aguardando acima do último número publicado da modalidade** somam **7 consultas, 25 cliques e 227 impressões**. Há demanda e cliques nas consultas desses concursos. **Sem a dimensão Página, não se comprova a URL de destino de cada clique.** A recomendação é preservar as URLs futuras e seu estado honesto, de acordo com a estratégia confirmada pelo proprietário; não remover ou aplicar noindex geral.

| Grupo | Consultas | Cliques | Impressões | CTR | Último publicado checkout | Data nominal arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| Quina 7163 | 3 | 12 | 121 | 9,92% | 7157 | 2026-10-22 |
| Lotomania 2995 | 1 | 5 | 23 | 21,74% | 2994 | 2026-11-04 |
| Lotofácil 3910 | 1 | 3 | 41 | 7,32% | 3819 | 2026-12-25 |
| Lotofácil 3882 | 1 | 3 | 8 | 37,50% | 3819 | 2026-11-27 |
| Lotofácil 3887 | 1 | 2 | 34 | 5,88% | 3819 | 2026-12-02 |

A data nominal isolada não resolve o estado: **Quina 7163 está aguardando acima da Quina 7157 publicada**, mas o arquivo conserva 22/10/2026. Confirmar a programação e identificar a projeção; isso não autoriza inventar um resultado. Lotomania 2995 tem 04/11 no checkout e data nominal diferente no baseline. Lotofácil 3882 apresenta CTR de 37,50% em apenas oito impressões; a amostra é pequena para extrapolação.

No baseline anterior à recuperação, **seis grupos** estavam aguardando e somam **12 consultas, 61 cliques e 2.881 impressões**. Mega-Sena 3070 era uma previsão incorreta para 16/12 e agora está publicada com sorteio de 14/10. O comparativo não reconstrói a página em cada dia da busca.

| Grupo | Cliques | Impressões | CTR | Baseline | Checkout |
| --- | --- | --- | --- | --- | --- |
| Mega-Sena 3070 | 36 | 2.654 | 1,36% | aguardando / 2026-12-16 | publicado / 2026-10-14 |
| Quina 7163 | 12 | 121 | 9,92% | aguardando / 2026-10-22 | aguardando / 2026-10-22 |
| Lotomania 2995 | 5 | 23 | 21,74% | aguardando / 2026-10-28 | aguardando / 2026-11-04 |
| Lotofácil 3910 | 3 | 41 | 7,32% | aguardando / 2026-12-25 | aguardando / 2026-12-25 |
| Lotofácil 3882 | 3 | 8 | 37,50% | aguardando / 2026-11-27 | aguardando / 2026-11-27 |
| Lotofácil 3887 | 2 | 34 | 5,88% | aguardando / 2026-12-02 | aguardando / 2026-12-02 |

## Ações de SEO e uso do site

| Prioridade | Ação | Aplicação |
| --- | --- | --- |
| P0 | Preservar URLs de concursos futuros | Manter as páginas planejadas na estrutura de resultados, rastreáveis e com canonical estável. A estratégia de futuras foi confirmada pelo proprietário. Mostrar aguardando confirmação, distinguir data oficial de projeção e não inventar dezenas, prêmio ou horário. A mesma URL recebe o resultado depois da confirmação. |
| P1 | Busca por modalidade e concurso | Aceitar acentos, hífens, espaços e nomes colados. quina7051, mega sena 3007, megasena3007, loto facil 3790 e lotofacil3810 devem localizar a rota correta. concurso 7051 precisa de desambiguação por modalidade. Usar variantes no mecanismo de busca, sem amontoá-las no texto visível. |
| P1 | Histórico completo e navegável | Filtros de modalidade, número, data e estado publicado/aguardando; ordenação e paginação com links HTML para o acervo. A demanda por muitos concursos antigos não é atendida por uma lista restrita aos últimos resultados. |
| P1 | Investigar exposição alta com CTR menor | Começar por Quina 7098, Quina 7062 e Lotofácil 3810. No GSC, cruzar cada grupo com Página, posição, dispositivo e data. Só depois escolher se é preciso corrigir título, destino, cobertura dos dados ou posição. A causa não está neste anexo. |
| P1 | Título factual por estado | Publicado: Resultado da Quina 7098: dezenas e rateio, somente se houver rateio real. Futuro: Lotofácil 3910: informações e resultado do concurso, com descrição explícita de aguardando confirmação. Manter H1/título coerentes. Não chamar arquivo antigo de hoje nem criar páginas de sinônimos. |
| P2 | Interlinks úteis | Cada resultado liga ao anterior/próximo existente, ao histórico e ao último confirmado da modalidade. Diferenciar último resultado atual do concurso histórico. Futuras ligam ao arquivo e à programação confirmada disponível. |
| P2 | Experiência depois do clique | Mostrar modalidade, número, estado e data antes dos anúncios; dezenas e rateio confirmado em seguida. Reservar espaço para anúncios. O recorte não mede preenchimento, CPM nem efeito do popunder, portanto não permite atribuir receita a esses fatores. |
| P2 | Mensurar uso da busca e do histórico | Se já houver analytics configurado, medir envio da busca, abertura de resultado, filtros e links relacionados; calcular proporção de buscas que encontram resultado. Receita e impressões de anúncios precisam do painel da rede. Não inventar eventos históricos nem conversão financeira. |
| P3 | Investigar Loteca antes de criar seção | Loteca 1257 e 1254 somam 9 cliques/138 impressões sem arquivos localizados. Consultar Página no GSC para descobrir o destino real; não concluir que houve 404 ou que uma seção nova é necessária apenas pelas consultas. |

## Conversão e medição

O anexo mede conversão de impressão de pesquisa em clique (CTR), não conversão em receita. Não contém usuários únicos, sessões, páginas por sessão, engajamento, preenchimento, visibilidade ou CPM. Não permite calcular receita esperada nem provar que anúncios causam saída.

Para avaliar mudanças, comparar períodos equivalentes com Página, posição, dispositivo e dia no GSC. Para a consulta interna, medir busca enviada e abertura de resultado encontrado. Para monetização, usar receita, impressões e CPM da própria rede. Estas frentes precisam de denominadores diferentes; não misturar clique orgânico com impressão de anúncio.

## Limitações e decisões

- São **500 de 1.000 linhas** visíveis no relatório entregue; os totais pertencem somente a este recorte. Não se extrapolaram as 500 faltantes ou o total da propriedade.
- Não há posição, URL, dispositivo, país ou série diária. Não se demonstram causalidade, canibalização, penalidade, curva de queda ou destino de cada clique.
- O período explícito é **27/04–01/11/2026**. Não comparar diretamente seus totais ao print anterior de três meses.
- A comparação de arquivos usa o checkout em um instante e um commit fixo. Não corresponde a uma captura histórica do Google. Data de sorteio, publicação do arquivo e primeira impressão são eventos distintos.
- Aguardando com data nominal passada não prova que já exista resultado. Calendários projetados podem estar errados. As futuras mantêm sua finalidade pré-sorteio.
- Loteca 1257/1254 somam **9 cliques/138 impressões** sem arquivo correspondente localizado; investigar Página antes de concluir que houve erro de destino ou criar uma modalidade nova.
- A consulta concurso 7051 ficou sem modalidade em vez de ser atribuída por suposição.
- O filtro CTR <1% só prioriza investigação. Mudanças na posição ou composição de consultas podem alterar a taxa sem mudança na página.
- Todos os dados foram processados localmente. Esta análise escreveu apenas os dois arquivos em docs, sem alterar app/lib/scripts/content e sem envio a serviço externo.

## Apêndice: todos os 162 grupos normalizados

O CSV contém cada linha individual, incluindo variantes. A tabela abaixo reconcilia todos os grupos com os totais do recorte.

| Grupo | Variantes | Cliques | Impressões | CTR | Estado checkout | Data no arquivo |
| --- | --- | --- | --- | --- | --- | --- |
| Quina 7052 | 8 | 302 | 5.125 | 5,89% | publicado | 2026-06-29 |
| Lotofácil 3790 | 13 | 299 | 20.370 | 1,47% | publicado | 2026-09-27 |
| Mega-Sena 3007 | 14 | 152 | 9.556 | 1,59% | publicado | 2026-05-12 |
| Lotofácil 3792 | 8 | 146 | 2.675 | 5,46% | publicado | 2026-09-29 |
| Mega-Sena 3018 | 6 | 126 | 5.018 | 2,51% | publicado | 2026-06-14 |
| Quina 7051 | 7 | 106 | 5.627 | 1,88% | publicado | 2026-06-28 |
| Lotofácil 3709 | 8 | 104 | 7.546 | 1,38% | publicado | 2026-06-12 |
| Lotofácil 3780 | 8 | 102 | 1.325 | 7,70% | publicado | 2026-09-15 |
| Mega-Sena 3029 | 7 | 97 | 6.152 | 1,58% | publicado | 2026-07-09 |
| Lotofácil 3719 | 8 | 95 | 4.043 | 2,35% | publicado | 2026-06-25 |
| Quina 7053 | 4 | 95 | 1.389 | 6,84% | publicado | 2026-06-30 |
| Lotofácil 3727 | 9 | 76 | 4.710 | 1,61% | publicado | 2026-07-04 |
| Lotofácil 3704 | 7 | 75 | 2.170 | 3,46% | publicado | 2026-06-06 |
| Mega-Sena 3008 | 11 | 75 | 1.880 | 3,99% | publicado | 2026-05-14 |
| Lotofácil 3715 | 9 | 72 | 3.073 | 2,34% | publicado | 2026-06-20 |
| Lotofácil 3744 | 7 | 69 | 2.422 | 2,85% | publicado | 2026-07-24 |
| Lotofácil 3794 | 4 | 66 | 856 | 7,71% | publicado | 2026-10-01 |
| Quina 7054 | 3 | 65 | 3.699 | 1,76% | publicado | 2026-07-01 |
| Lotofácil 3716 | 7 | 62 | 2.308 | 2,69% | publicado | 2026-06-20 |
| Lotofácil 3723 | 6 | 61 | 1.678 | 3,64% | publicado | 2026-06-30 |
| Lotofácil 3711 | 7 | 60 | 2.528 | 2,37% | publicado | 2026-06-15 |
| Lotofácil 3708 | 5 | 60 | 1.585 | 3,79% | publicado | 2026-06-11 |
| Lotofácil 3689 | 6 | 53 | 931 | 5,69% | publicado | 2026-05-19 |
| Lotofácil 3705 | 5 | 52 | 1.816 | 2,86% | publicado | 2026-06-08 |
| Quina 7062 | 4 | 51 | 6.701 | 0,76% | publicado | 2026-07-10 |
| Lotofácil 3714 | 7 | 51 | 1.488 | 3,43% | publicado | 2026-06-18 |
| Quina 7098 | 3 | 49 | 8.647 | 0,57% | publicado | 2026-08-21 |
| Quina 7045 | 5 | 46 | 1.970 | 2,34% | publicado | 2026-06-08 |
| Quina 7078 | 4 | 46 | 1.443 | 3,19% | publicado | 2026-07-29 |
| Lotofácil 3768 | 4 | 45 | 505 | 8,91% | publicado | 2026-08-21 |
| Quina 7075 | 3 | 44 | 1.977 | 2,23% | publicado | 2026-07-26 |
| Lotofácil 3684 | 6 | 43 | 388 | 11,08% | publicado | 2026-05-13 |
| Quina 7072 | 4 | 40 | 1.336 | 2,99% | publicado | 2026-07-22 |
| Lotofácil 3680 | 7 | 37 | 738 | 5,01% | publicado | 2026-05-08 |
| Quina 7079 | 3 | 37 | 457 | 8,10% | publicado | 2026-07-30 |
| Mega-Sena 3070 | 5 | 36 | 2.654 | 1,36% | publicado | 2026-10-14 |
| Quina 7058 | 3 | 36 | 947 | 3,80% | publicado | 2026-07-06 |
| Lotofácil 3810 | 4 | 35 | 5.181 | 0,68% | publicado | 2026-10-21 |
| Lotofácil 3696 | 4 | 34 | 1.408 | 2,41% | publicado | 2026-05-27 |
| Quina 7026 | 3 | 31 | 3.785 | 0,82% | publicado | 2026-05-15 |
| Lotofácil 3695 | 6 | 31 | 812 | 3,82% | publicado | 2026-05-26 |
| Lotofácil 3698 | 5 | 31 | 504 | 6,15% | publicado | 2026-05-29 |
| Lotofácil 3725 | 3 | 30 | 884 | 3,39% | publicado | 2026-07-02 |
| Quina 7049 | 3 | 29 | 919 | 3,16% | publicado | 2026-06-12 |
| Quina 7036 | 2 | 29 | 319 | 9,09% | publicado | 2026-05-27 |
| Quina 7090 | 3 | 28 | 2.878 | 0,97% | publicado | 2026-08-12 |
| Lotofácil 3687 | 5 | 28 | 1.129 | 2,48% | publicado | 2026-05-16 |
| Quina 7059 | 3 | 27 | 4.206 | 0,64% | publicado | 2026-07-07 |
| Quina 7065 | 3 | 27 | 2.451 | 1,10% | publicado | 2026-07-14 |
| Dupla Sena 2972 | 4 | 27 | 1.356 | 1,99% | publicado | 2026-06-20 |
| Quina 7044 | 3 | 27 | 943 | 2,86% | publicado | 2026-06-06 |
| Lotofácil 3690 | 5 | 27 | 724 | 3,73% | publicado | 2026-05-20 |
| Quina 7095 | 2 | 26 | 529 | 4,91% | publicado | 2026-08-18 |
| Quina 7073 | 3 | 26 | 449 | 5,79% | publicado | 2026-07-23 |
| Lotofácil 3678 | 6 | 25 | 512 | 4,88% | publicado | 2026-05-06 |
| Quina 7035 | 3 | 25 | 239 | 10,46% | publicado | 2026-05-26 |
| Quina 7039 | 3 | 24 | 3.039 | 0,79% | publicado | 2026-05-30 |
| Lotofácil 3699 | 6 | 23 | 1.753 | 1,31% | publicado | 2026-05-30 |
| Quina 7056 | 3 | 23 | 988 | 2,33% | publicado | 2026-07-03 |
| Lotofácil 3693 | 6 | 23 | 790 | 2,91% | publicado | 2026-05-23 |
| Lotofácil 3700 | 5 | 23 | 401 | 5,74% | publicado | 2026-06-01 |
| Quina 7091 | 2 | 22 | 3.857 | 0,57% | publicado | 2026-08-13 |
| Quina 7050 | 2 | 21 | 879 | 2,39% | publicado | 2026-06-14 |
| Quina 7088 | 2 | 20 | 1.089 | 1,84% | publicado | 2026-08-10 |
| Lotomania 2930 | 4 | 20 | 1.013 | 1,97% | publicado | 2026-05-29 |
| Quina 7070 | 2 | 20 | 820 | 2,44% | publicado | 2026-07-20 |
| Quina 7077 | 2 | 20 | 224 | 8,93% | publicado | 2026-07-28 |
| Quina 7028 | 3 | 19 | 776 | 2,45% | publicado | 2026-05-18 |
| Lotofácil 3793 | 4 | 19 | 295 | 6,44% | publicado | 2026-09-30 |
| Quina 7043 | 1 | 18 | 890 | 2,02% | publicado | 2026-06-05 |
| Quina 7038 | 2 | 18 | 390 | 4,62% | publicado | 2026-05-29 |
| Quina 7042 | 2 | 17 | 472 | 3,60% | publicado | 2026-06-03 |
| Lotofácil 3799 | 4 | 17 | 289 | 5,88% | publicado | 2026-10-07 |
| Quina 7023 | 4 | 16 | 796 | 2,01% | publicado | 2026-05-12 |
| Lotomania 2929 | 2 | 16 | 347 | 4,61% | publicado | 2026-05-27 |
| Quina 7055 | 2 | 15 | 1.053 | 1,42% | publicado | 2026-07-02 |
| Quina 7046 | 2 | 15 | 414 | 3,62% | publicado | 2026-06-09 |
| Lotofácil 3682 | 5 | 15 | 251 | 5,98% | publicado | 2026-05-11 |
| Quina 7061 | 4 | 14 | 1.755 | 0,80% | publicado | 2026-07-09 |
| Quina 7057 | 2 | 14 | 455 | 3,08% | publicado | 2026-07-04 |
| Quina 7034 | 1 | 14 | 347 | 4,03% | publicado | 2026-05-25 |
| Quina 7029 | 2 | 14 | 179 | 7,82% | publicado | 2026-05-19 |
| Quina 7074 | 2 | 13 | 2.183 | 0,60% | publicado | 2026-07-24 |
| Quina 7085 | 2 | 13 | 1.697 | 0,77% | publicado | 2026-08-06 |
| Lotomania 2923 | 2 | 13 | 348 | 3,74% | publicado | 2026-05-13 |
| Dupla Sena 2975 | 2 | 13 | 190 | 6,84% | publicado | 2026-06-26 |
| Quina 7089 | 2 | 12 | 578 | 2,08% | publicado | 2026-08-11 |
| Quina 7163 | 3 | 12 | 121 | 9,92% | aguardando | 2026-10-22 |
| Lotofácil 3694 | 3 | 12 | 81 | 14,81% | publicado | 2026-05-25 |
| Lotofácil 3775 | 3 | 11 | 856 | 1,29% | publicado | 2026-08-30 |
| Quina 7048 | 2 | 11 | 493 | 2,23% | publicado | 2026-06-11 |
| Quina 7047 | 1 | 11 | 290 | 3,79% | publicado | 2026-06-10 |
| Lotofácil 3721 | 3 | 11 | 220 | 5,00% | publicado | 2026-06-27 |
| Lotofácil 3691 | 3 | 10 | 156 | 6,41% | publicado | 2026-05-21 |
| Quina 7037 | 3 | 10 | 156 | 6,41% | publicado | 2026-05-28 |
| Quina 7097 | 1 | 9 | 329 | 2,74% | publicado | 2026-08-20 |
| Quina 7083 | 2 | 9 | 89 | 10,11% | publicado | 2026-08-04 |
| Lotomania 2937 | 2 | 8 | 494 | 1,62% | publicado | 2026-06-15 |
| Lotofácil 3743 | 2 | 8 | 477 | 1,68% | publicado | 2026-07-23 |
| Lotomania 2932 | 2 | 8 | 284 | 2,82% | publicado | 2026-06-03 |
| Lotomania 2924 | 1 | 8 | 206 | 3,88% | publicado | 2026-05-15 |
| Quina 7020 | 2 | 8 | 130 | 6,15% | publicado | 2026-05-08 |
| Quina 7040 | 1 | 7 | 176 | 3,98% | publicado | 2026-06-01 |
| Quina 7031 | 2 | 7 | 161 | 4,35% | publicado | 2026-05-21 |
| Quina 7076 | 2 | 7 | 117 | 5,98% | publicado | 2026-07-27 |
| Quina 7033 | 1 | 7 | 82 | 8,54% | publicado | 2026-05-23 |
| Loteca 1257 | 1 | 7 | 66 | 10,61% | ausente | — |
| Dia de Sorte 1236 | 1 | 6 | 315 | 1,90% | publicado | 2026-07-03 |
| Lotofácil 3718 | 2 | 6 | 164 | 3,66% | publicado | 2026-06-23 |
| Quina 7024 | 1 | 6 | 147 | 4,08% | publicado | 2026-05-13 |
| Lotomania 2935 | 1 | 6 | 89 | 6,74% | publicado | 2026-06-10 |
| Dupla Sena 2960 | 1 | 6 | 87 | 6,90% | publicado | 2026-05-22 |
| Mega-Sena 3031 | 2 | 6 | 76 | 7,89% | publicado | 2026-07-14 |
| Lotofácil 3785 | 3 | 6 | 60 | 10,00% | publicado | 2026-09-21 |
| Quina 7017 | 2 | 6 | 54 | 11,11% | publicado | 2026-05-05 |
| Lotofácil 3697 | 2 | 5 | 304 | 1,64% | publicado | 2026-05-28 |
| Mega-Sena 3015 | 2 | 5 | 118 | 4,24% | publicado | 2026-06-06 |
| Mega-Sena 3011 | 1 | 5 | 109 | 4,59% | publicado | 2026-05-26 |
| Lotofácil 3789 | 2 | 5 | 83 | 6,02% | publicado | 2026-09-25 |
| Mega-Sena 3009 | 2 | 5 | 71 | 7,04% | publicado | 2026-05-16 |
| Lotomania 2995 | 1 | 5 | 23 | 21,74% | aguardando | 2026-11-04 |
| Lotofácil 3736 | 2 | 4 | 506 | 0,79% | publicado | 2026-07-15 |
| Quina 7071 | 2 | 4 | 310 | 1,29% | publicado | 2026-07-21 |
| Quina 7060 | 1 | 4 | 187 | 2,14% | publicado | 2026-07-08 |
| Lotofácil 3800 | 2 | 4 | 142 | 2,82% | publicado | 2026-10-08 |
| Quina 7027 | 2 | 4 | 100 | 4,00% | publicado | 2026-05-16 |
| Lotofácil 3814 | 1 | 4 | 72 | 5,56% | publicado | 2026-10-26 |
| Mega-Sena 3020 | 1 | 4 | 69 | 5,80% | publicado | 2026-06-18 |
| Lotofácil 3787 | 1 | 4 | 26 | 15,38% | publicado | 2026-09-23 |
| Quina 7092 | 1 | 3 | 2.362 | 0,13% | publicado | 2026-08-14 |
| Dupla Sena 2967 | 1 | 3 | 151 | 1,99% | publicado | 2026-06-08 |
| Quina 7084 | 1 | 3 | 137 | 2,19% | publicado | 2026-08-05 |
| Lotomania 2933 | 1 | 3 | 131 | 2,29% | publicado | 2026-06-05 |
| Lotofácil 3720 | 1 | 3 | 109 | 2,75% | publicado | 2026-06-26 |
| Lotofácil 3739 | 1 | 3 | 88 | 3,41% | publicado | 2026-07-19 |
| Lotofácil 3791 | 1 | 3 | 41 | 7,32% | publicado | 2026-09-28 |
| Lotofácil 3910 | 1 | 3 | 41 | 7,32% | aguardando | 2026-12-25 |
| Mega-Sena 3040 | 1 | 3 | 34 | 8,82% | publicado | 2026-08-04 |
| Quina 7094 | 1 | 3 | 30 | 10,00% | publicado | 2026-08-17 |
| Lotomania 2928 | 1 | 3 | 20 | 15,00% | publicado | 2026-05-25 |
| Dia de Sorte 1219 | 1 | 3 | 12 | 25,00% | publicado | 2026-05-28 |
| Lotofácil 3882 | 1 | 3 | 8 | 37,50% | aguardando | 2026-11-27 |
| Lotofácil 3782 | 1 | 3 | 8 | 37,50% | publicado | 2026-09-17 |
| Lotofácil 3750 | 1 | 2 | 1.952 | 0,10% | publicado | 2026-07-31 |
| Não identificada 7051 | 1 | 2 | 327 | 0,61% | ausente | — |
| Lotofácil 3811 | 1 | 2 | 203 | 0,99% | publicado | 2026-10-22 |
| Lotofácil 3685 | 1 | 2 | 103 | 1,94% | publicado | 2026-05-14 |
| Quina 7032 | 1 | 2 | 86 | 2,33% | publicado | 2026-05-22 |
| Loteca 1254 | 1 | 2 | 72 | 2,78% | ausente | — |
| Timemania 2396 | 1 | 2 | 70 | 2,86% | publicado | 2026-05-26 |
| Mega-Sena 3012 | 1 | 2 | 59 | 3,39% | publicado | 2026-05-28 |
| Lotofácil 3713 | 1 | 2 | 47 | 4,26% | publicado | 2026-06-17 |
| Lotofácil 3762 | 1 | 2 | 35 | 5,71% | publicado | 2026-08-14 |
| Lotofácil 3887 | 1 | 2 | 34 | 5,88% | aguardando | 2026-12-02 |
| Quina 7080 | 1 | 2 | 34 | 5,88% | publicado | 2026-07-31 |
| Quina 7093 | 1 | 2 | 31 | 6,45% | publicado | 2026-08-16 |
| Dia de Sorte 1213 | 1 | 2 | 27 | 7,41% | publicado | 2026-05-14 |
| Lotofácil 3740 | 1 | 2 | 27 | 7,41% | publicado | 2026-07-20 |
| Mega-Sena 3013 | 1 | 2 | 23 | 8,70% | publicado | 2026-05-30 |
| Lotomania 2927 | 1 | 2 | 22 | 9,09% | publicado | 2026-05-22 |
| Quina 7099 | 1 | 2 | 20 | 10,00% | publicado | 2026-08-23 |
| Lotofácil 3777 | 1 | 2 | 20 | 10,00% | publicado | 2026-09-01 |
