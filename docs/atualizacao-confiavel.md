# Atualização de resultados e cotações

## Falha recorrente identificada em 8 de novembro de 2026

As execuções Daily Update [42458726919](https://github.com/tamoaiapp/hojenoticia-app/actions/runs/42458726919) e [42350406592](https://github.com/tamoaiapp/hojenoticia-app/actions/runs/42350406592) falharam porque a AwesomeAPI retornou HTTP 429 depois das tentativas limitadas. Nas duas execuções, as dez modalidades de loteria foram conferidas sem falhas. As alterações válidas de outros módulos foram publicadas.

## Recuperação das cotações

1. A AwesomeAPI continua sendo consultada primeiro. O secret `AWESOMEAPI_KEY` é opcional e enviado somente à AwesomeAPI.
2. Se a resposta principal falhar ou for inválida, o atualizador consulta fontes públicas independentes, sem credenciais ou assinatura adicional.
3. USD, EUR, GBP e ARS usam compra e venda do arquivo de fechamento do [Banco Central](https://ptax.bcb.gov.br/ptax_internet/consultarTodasAsMoedas.do?method=consultaTodasMoedas). Fins de semana e feriados usam o último arquivo publicado, com busca limitada a dez datas. A data original continua visível; não se anuncia uma nova negociação no fim de semana.
4. BTC e ETH usam os mercados em reais da [API pública de dados de mercado da Binance](https://developers.binance.com/en/docs/products/spot/rest-api), no host documentado `data-api.binance.vision`. Não há autenticação nem operação de compra ou venda. Os preços são desse mercado específico.
5. Máximas, mínimas e variações só são exibidas quando disponíveis com a definição esperada. A PTAX não fornece máximas ou mínimas intradiárias. A variação do último negócio da Binance não é apresentada como variação do preço de compra.
6. A precisão `day` identifica a data do fechamento no CSV. O timestamp normalizado à meia-noite serve apenas ao armazenamento; a página mostra somente a data, sem inventar um horário de negociação.
7. Os seis pares precisam ser válidos antes de escrever os arquivos. Dados antigos não substituem datas mais novas. Históricos de fontes diferentes não são misturados; os snapshots diários já existentes continuam arquivados.

A recuperação produz um aviso identificando a fonte indisponível. Se todas as fontes falharem, a execução continua falhando, preserva os dados anteriores e informa o módulo responsável. A correção não oculta indisponibilidades reais.

## Fluxo e custos

As atualizações diárias e de loteria compartilham a mesma fila de concorrência. Só há commit de conteúdo quando existe diferença. Não foi acrescentado um novo cron, serviço pago ou agente de IA. O GitHub pode atrasar cron; os horários configurados não são uma garantia de execução exata.

Os workflows testam o importador de loterias, as regras de calendário, a continuidade após falhas e a recuperação de cotações. As Actions estão fixadas nos commits usados pelas execuções examinadas. Argumentos inválidos no CLI encerram antes de acessar fontes, escrever conteúdo ou executar Git. O wrapper Windows resolve a pasta a partir do próprio arquivo e devolve o código de saída do atualizador.

Verificação local sem publicar:

```sh
node --test scripts/modules/cambio.test.mjs scripts/modules/cambio-fallback.test.mjs scripts/modules/cambio-recovery.test.mjs scripts/daily-update.test.mjs scripts/modules/loterias.test.mjs
node --test scripts/cambio-freshness.test.mjs
node scripts/daily-update.mjs --only=cambio --no-push
```

O último comando consulta fontes reais e pode alterar `content/cambio/` localmente; ele não faz commit nem push.
