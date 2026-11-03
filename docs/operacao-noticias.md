# Publicação de resultados e Google Notícias

O Google considera automaticamente páginas para Google Notícias, aba Notícias e Principais notícias. Não existe inscrição ou marcação que garanta inclusão, posição ou prazo. Desde março de 2025, páginas de publicação são geradas automaticamente; enviar feeds no Publisher Center não é um caminho de aprovação.

## O que o site publica

Os resultados são boletins automatizados a partir da Caixa. Hoje Notícia é a organização autora; Tiago Oliveira é o responsável informado pelo proprietário. Isso não significa revisão humana de cada boletim. Contato e correções: tiago.mo@outlook.com.

- `draw_date` identifica o sorteio.
- `published_at` registra a primeira publicação real de um resultado; permanece estável nas correções.
- `updated_at` indica mudança material no conteúdo.
- `source_checked_at` registra a consulta que produziu a versão publicada. Uma consulta sem mudança não renova a data.
- Registros antigos sem publicação original conhecida permanecem sem essa data. A data do sorteio nunca a substitui.

Novos boletins recentes com fonte oficial e publicação registrada podem usar `NewsArticle`. Arquivos antigos permanecem `Article`; concursos aguardando resultado não recebem marcação de artigo nem entram nos feeds. A classificação interna não representa aprovação do Google.

## Descoberta

- `/noticias`: publicações com datas e fontes identificadas.
- `/news-sitemap.xml`: somente publicações originais das últimas 48 horas, até 1.000 entradas. Pode ficar vazio sem erro do site.
- `/rss.xml`: últimos boletins com publicação registrada, para leitores e ferramentas de acompanhamento. Não é um formulário de inscrição no Google Notícias.
- `/robots.txt`: divulga os dois sitemaps e permite rastreamento.
- URLs de concurso permanecem estáveis. Não criar cópias para parecerem notícias novas.

## Atualização

Os workflows consultam a Caixa às 21h20, 22h20 e 23h20 de Brasília; aos domingos há janelas extras às 11h20 e 12h20. São horários de melhores esforços do GitHub Actions, sujeitos a atraso. Só dados confirmados são publicados; falhas são registradas e podem ser rechecadas nas janelas seguintes.

Execução manual sem publicar commits:

```sh
node scripts/daily-update.mjs --only=loterias --no-push
node --test scripts/modules/loterias.test.mjs scripts/news-metadata.test.mjs
npm run build
```

## Acompanhamento editorial

No Search Console, conferir inspeção de URLs, sitemaps, ações manuais, tipo de pesquisa Notícias e relatório Google Notícias quando disponível. Nenhuma submissão ao Search Console é presumida pela existência destes arquivos. A Indexing API não se destina a notícias comuns.

Os ajustes técnicos ajudam o Google a entender a publicação. A qualidade precisa continuar existindo: dados completos e corretos, fonte verificável, correções transparentes e conteúdo útil e original. Não inventar apuração humana, credenciais, fotos de eventos, datas ou fatos para preencher requisitos. As imagens atuais são infográficos próprios com dados da Caixa, identificados como tal.

O popunder foi mantido por escolha expressa do proprietário. Sua presença não é tratada como veto automático do Google; a experiência de leitura e a proporção entre publicidade e conteúdo devem ser acompanhadas. Nas matérias, há um único banner incorporado após o conteúdo.

## Fontes oficiais

- [Consideração e páginas automáticas do Google Notícias](https://support.google.com/news/publisher-center/answer/15898024?hl=pt-BR)
- [Políticas de notícias e transparência](https://support.google.com/news/publisher-center/answer/6204050?hl=pt-BR)
- [Dados estruturados Article](https://developers.google.com/search/docs/appearance/structured-data/article)
- [Datas de publicação](https://developers.google.com/search/docs/appearance/publication-dates)
- [News sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap)
- [Conteúdo útil e confiável](https://developers.google.com/search/docs/fundamentals/creating-helpful-content)
- [Interrupções na leitura](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials)
