# Chamadas depois dos resultados

As páginas de concursos publicados exibem uma chamada logo depois dos números e antes do infográfico. Somente a foto leva ao conteúdo educativo: probabilidades na Mega-Sena, histórico na Federal/Super Sete e estatísticas da própria modalidade nos demais jogos. O título e os textos são informativos, com uma indicação para clicar na imagem. As páginas que ainda aguardam resultado mantêm seu fluxo de acompanhamento.

Foram geradas 20 fotos individuais com o **image_gen integrado**: adultos fictícios de idades variadas com bilhetes genéricos. As chamadas tratam de combinações, independência dos sorteios e chances de sena, quina e quadra. A legenda visível identifica cada cena como imagem ilustrativa gerada por IA.

Na revisão de 04/11, os títulos e as frases sobre as fotos passaram a usar perguntas de curiosidade. São 20 variações de probabilidades para Mega-Sena, 20 de estatísticas para as demais modalidades com essa análise e oito de histórico para Federal/Super Sete. Exemplos: “10 anos apostando: a chance do próximo bilhete muda?” e “Esses números saíram mais. Os seus estão na lista?”. Os destinos respondem às perguntas; a calculadora ganhou uma explicação específica sobre anos repetindo o mesmo jogo. As pessoas ilustradas não recebem depoimentos ou vitórias inventadas.

Os arquivos entregues estão em `public/images/post-result/creative-01.webp` até `creative-20.webp`. Cada imagem tem 960 × 640 pixels. O conjunto soma **1.396.714 bytes**; uma imagem é exibida por chamada. A seleção inicial é estável para renderização no servidor, e uma escolha aleatória ocorre uma vez quando o bloco se aproxima da área visível. A foto não fica trocando enquanto o visitante lê. O navegador pode iniciar o download da imagem inicial antes dessa seleção.

O [manifesto de geração](post-result-image-prompts.json) registra os 20 prompts completos, inspeção, hashes e caminhos dos originais preservados em `.codex/generated_images`, além do caminho de cada entrega no projeto. O [manifesto WebP](post-result-web-assets.json) registra dimensões, tamanho e hash dos arquivos publicados. `scripts/prepare-post-result-images.mjs` reproduz a redução e conversão a partir das cópias PNG temporárias ou dos originais registrados, sem alterar a composição das cenas.

## Clique e publicidade

Configuração central: `lib/post-result-ad.ts`. A abertura publicitária permanece desativada até a confirmação de uma unidade Mainstream apropriada ao site. A chave de consulta não é incluída no projeto nem enviada ao navegador. A imagem continua navegando ao conteúdo educativo enquanto a publicidade está desativada.

Quando habilitado, somente o clique primário na imagem abre o Smartlink configurado. A abertura usa `window.open` com `noopener,noreferrer`; o `href` nativo continua levando ao conteúdo na aba atual. Se a nova aba for bloqueada ou a abertura falhar, a navegação educativa permanece disponível. Cliques com Ctrl, Command, Shift ou Alt seguem o comportamento nativo do link, sem abrir um anúncio adicional. A imagem pode ser acionada por teclado. O parâmetro público `psid` distingue site, modalidade e imagem, conforme a [API da Adsterra](https://adsterra.com/blog/how-to-use-adsterra-publishers-api/); não identifica o visitante.

O Popunder global continua removido: menus, textos e outras áreas da página não abrem o Smartlink. Não há carregamento do antigo script de popunder nem tentativa de contornar bloqueios do navegador. A legenda, a indicação de clique e o nome acessível da imagem informam que há publicidade em outra aba. Os banners e anúncios nativos continuam em seus próprios espaços. A calculadora também permanece acessível diretamente. O uso de Smartlink em imagem segue a [orientação da Adsterra](https://adsterra.com/blog/how-to-add-ads-to-wix-website-with-ad-codes/).

Essa separação acompanha os [termos de publicidade da Adsterra](https://adsterra.com/publishers-terms-managed/) e a orientação do Google para [preservar o acesso ao conteúdo](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials). O evento local `hoje:post-result-click` contém a identificação da imagem, loteria, concurso, destino e unidade publicitária. Ele é um ponto de integração para medição futura; esta alteração não instala um coletor, não grava esses eventos e não demonstra aumento de conversão.

## Página de destino

A calculadora e a tabela abrangem seleções de 6 a 20 dezenas. Os atalhos de 6, 7, 8 e 10 dezenas atualizam a comparação sem abrir publicidade. As 45 probabilidades arredondadas foram conferidas com a tabela oficial da [Caixa](https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx). A fórmula descreve exatamente quatro, cinco ou seis acertos na seleção completa; a quantidade de prêmios em bilhetes múltiplos é explicada separadamente. A página tem canonical próprio, entrada no sitemap e links no histórico e nas estatísticas da Mega-Sena. Os concursos também oferecem cartões de continuação para o histórico e as estatísticas, sem acionar anúncios.

## Verificação

Os 38 testes automatizados passaram. A análise estática dos cinco arquivos principais passou com zero erros e alertas. O build de produção passou. A conferência HTTP local validou a posição da chamada após o resultado, o destino, os 20 arquivos distintos e a ausência do bloco em páginas pendentes. A auditoria geral verificou 67 páginas, 4.936 referências de links internos e 1.823 URLs no sitemap.

Na validação inicial, oito cenários de navegador passaram em larguras de 360, 390 e 1280 pixels, incluindo os criativos 01 e 20, navegação com JavaScript desativado e mudanças da calculadora entre 6, 7 e 20 dezenas. Na versão atual, a chamada tem um único link, na imagem.

Testes de navegador substituem `window.open` por uma função local que registra o endereço e os argumentos sem acessar a oferta. Também bloqueiam todos os servidores externos antes da transmissão. Conferem que só a imagem chama o Smartlink, a navegação à calculadora funciona e os casos de aba bloqueada ou falha não impedem a leitura. Não geram cliques ou impressões de teste nos anúncios reais nem verificam a abertura efetiva de uma oferta do fornecedor.
