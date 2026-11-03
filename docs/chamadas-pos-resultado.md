# Chamadas depois dos resultados

As páginas de concursos publicados exibem uma chamada logo depois dos números e antes do infográfico. Foto, título e botão levam à página educativa `/loterias/mega-sena/probabilidades`. O nome da modalidade aparece na chamada, inclusive quando ela é apresentada junto ao resultado de outra loteria. As páginas que ainda aguardam resultado mantêm seu fluxo de acompanhamento.

Foram geradas 20 fotos individuais com o **image_gen integrado**: adultos fictícios de idades variadas com bilhetes genéricos. As chamadas tratam de combinações, independência dos sorteios e chances de sena, quina e quadra. A legenda visível identifica cada cena como imagem ilustrativa gerada por IA.

Os arquivos entregues estão em `public/images/post-result/creative-01.webp` até `creative-20.webp`. Cada imagem tem 960 × 640 pixels. O conjunto soma **1.396.714 bytes**; uma imagem é exibida por chamada. A seleção inicial é estável para renderização no servidor, e uma escolha aleatória ocorre uma vez quando o bloco se aproxima da área visível. A foto não fica trocando enquanto o visitante lê. O navegador pode iniciar o download da imagem inicial antes dessa seleção.

O [manifesto de geração](post-result-image-prompts.json) registra os 20 prompts completos, inspeção, hashes e caminhos dos originais preservados em `.codex/generated_images`, além do caminho de cada entrega no projeto. O [manifesto WebP](post-result-web-assets.json) registra dimensões, tamanho e hash dos arquivos publicados. `scripts/prepare-post-result-images.mjs` reproduz a redução e conversão a partir das cópias PNG temporárias ou dos originais registrados, sem alterar a composição das cenas.

## Clique e publicidade

O clique é uma navegação nativa para o conteúdo educativo real. O Popunder previamente configurado continua no layout, com o código do fornecedor preservado. O bloco informa que o site pode abrir publicidade em outra aba. A abertura, frequência e bloqueios do anúncio continuam sob controle do fornecedor e do navegador; a calculadora permanece acessível diretamente.

Essa separação acompanha os [termos de publicidade da Adsterra](https://adsterra.com/publishers-terms-managed/) e a orientação do Google para [preservar o acesso ao conteúdo](https://developers.google.com/search/docs/appearance/avoid-intrusive-interstitials). O evento local `hoje:post-result-click` contém a identificação da imagem, loteria, concurso e destino. Ele é um ponto de integração para medição futura; esta alteração não instala um coletor, não grava esses eventos e não demonstra aumento de conversão.

## Página de destino

A calculadora e a tabela abrangem seleções de 6 a 20 dezenas. As 45 probabilidades arredondadas foram conferidas com a tabela oficial da [Caixa](https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx). A fórmula descreve exatamente quatro, cinco ou seis acertos na seleção completa; a quantidade de prêmios em bilhetes múltiplos é explicada separadamente. A página tem canonical próprio, entrada no sitemap e links no histórico e nas estatísticas da Mega-Sena.

## Verificação

Os 38 testes automatizados passaram. A análise estática dos cinco arquivos principais passou com zero erros e alertas. O build de produção passou. A conferência HTTP local validou a posição da chamada após o resultado, o destino, os 20 arquivos distintos e a ausência do bloco em páginas pendentes. A auditoria geral verificou 67 páginas, 4.936 referências de links internos e 1.823 URLs no sitemap.

Oito cenários de navegador passaram em larguras de 360, 390 e 1280 pixels, incluindo os criativos 01 e 20, clique real na imagem e no botão, navegação com JavaScript desativado e mudanças da calculadora entre 6, 7 e 20 dezenas. Não foram observados erros de execução ou hidratação nem overflow horizontal.

Testes de navegador bloqueiam os servidores publicitários para verificar navegação e layout sem gerar cliques ou impressões de teste nos anúncios reais. Eles não verificam a abertura efetiva de uma oferta do fornecedor nem tentam contornar bloqueadores de pop-ups.
