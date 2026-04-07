# Ideias de Design — NFS-e Serviços Tomados

## Contexto
Ferramenta interna de uso fiscal/contábil para geração de arquivo TXT posicional para importação de NFS-e na Prefeitura de João Pessoa. Usuários são contadores e auxiliares administrativos que precisam de clareza, precisão e eficiência.

---

<response>
<text>
## Ideia 1 — "Fiscal Precision" (Governo Técnico Moderno)

**Design Movement:** Swiss International Style adaptado para software fiscal — clareza absoluta, hierarquia tipográfica rigorosa, sem ornamentos desnecessários.

**Core Principles:**
- Informação acima de tudo: cada pixel serve a uma função
- Densidade controlada: formulários densos mas respiráveis
- Feedback imediato: estados visuais claros para cada ação
- Confiança institucional: paleta sóbria que transmite seriedade

**Color Philosophy:** Azul-marinho profundo (#0f172a) como base, com azul-cobalto (#1d4ed8) como acento principal. Verde-esmeralda (#059669) para ações de exportação/sucesso. Cinza-ardósia para backgrounds de formulário. Transmite seriedade fiscal sem ser pesado.

**Layout Paradigm:** Sidebar fixa à esquerda com navegação entre seções. Área de conteúdo principal com cabeçalho sticky. Formulários em duas colunas com labels acima dos campos (não ao lado).

**Signature Elements:**
- Linha divisória azul-cobalto de 3px no topo da sidebar
- Badges de campo obrigatório em vermelho discreto
- Tabela com linhas alternadas em tons muito sutis de azul

**Interaction Philosophy:** Transições rápidas (150ms). Foco visível em todos os campos. Validação inline ao sair do campo.

**Animation:** Slide-in suave ao abrir formulários. Fade-in nas linhas da tabela ao adicionar registros.

**Typography System:** IBM Plex Sans (corpo) + IBM Plex Mono (valores monetários e campos de código). Hierarquia clara: 14px corpo, 12px labels, 11px hints.
</text>
<probability>0.08</probability>
</response>

<response>
<text>
## Ideia 2 — "Dark Slate Pro" (Ferramenta Profissional Dark)

**Design Movement:** Material Design 3 Dark com influência de ferramentas como VS Code e Linear — interface escura de alta densidade para uso prolongado.

**Core Principles:**
- Dark-first: fundo escuro reduz fadiga ocular em uso prolongado
- Densidade informacional alta: tabelas compactas, formulários eficientes
- Acento vibrante em fundo escuro: cria hierarquia sem peso visual
- Consistência de componentes: cada elemento segue o mesmo sistema

**Color Philosophy:** Slate-950 (#020617) como fundo principal. Slate-800/900 para cards e painéis. Azul-ciano (#06b6d4) como acento vibrante. Emerald para sucesso, rose para erro. Contraste WCAG AA em todos os textos.

**Layout Paradigm:** Layout de painel único com abas horizontais no topo. Toolbar de ações flutuante acima da tabela. Formulário em drawer lateral deslizante (não modal).

**Signature Elements:**
- Glow sutil azul-ciano nos campos em foco
- Separadores com gradiente fade-out nas extremidades
- Números monetários em fonte mono com cor de destaque

**Interaction Philosophy:** Hover states com transição de 100ms. Drawer lateral para formulários mantém contexto da lista visível. Ações destrutivas com confirmação inline.

**Animation:** Drawer desliza da direita em 200ms com easing ease-out. Rows da tabela aparecem com stagger de 30ms.

**Typography System:** JetBrains Mono para campos de código/valores + Inter para texto geral. Labels em uppercase tracking-wide para seções.
</text>
<probability>0.07</probability>
</response>

<response>
<text>
## Ideia 3 — "Clean Government" (Clareza Institucional Light)

**Design Movement:** Flat Design 2.0 com influência de gov.br e sistemas tributários modernos — limpo, acessível, sem ambiguidade.

**Core Principles:**
- Clareza máxima: formulários com labels explícitos e hints visíveis
- Acessibilidade como prioridade: contraste alto, foco visível, tamanhos generosos
- Workflow linear: guia o usuário passo a passo sem distrações
- Feedback explícito: mensagens de erro e sucesso claras e contextuais

**Color Philosophy:** Branco puro (#ffffff) como fundo. Azul-governo (#1351b4 — cor do gov.br) como primário. Cinza-claro (#f8f9fa) para áreas de formulário. Verde (#168821) para exportação. Amarelo-âmbar (#ffcd07) para avisos.

**Layout Paradigm:** Layout de página única com seções claramente delimitadas. Abas com indicador de progresso. Formulário em modal centralizado com scroll interno.

**Signature Elements:**
- Barra de progresso entre as abas do formulário
- Cards com borda-esquerda colorida por categoria
- Tooltips de ajuda com ícone de interrogação ao lado dos labels

**Interaction Philosophy:** Validação em tempo real com mensagens abaixo dos campos. Botões com estados loading explícitos. Confirmações com dialog claro.

**Animation:** Fade suave entre abas. Shake animation em campos com erro. Scale-up em botões de ação primária.

**Typography System:** Rawline (fonte do gov.br) ou Roboto como fallback. Tamanhos generosos: 16px corpo, 14px labels, 13px hints. Peso 600 para labels.
</text>
<probability>0.06</probability>
</response>

---

## Escolha Final: Ideia 2 — "Dark Slate Pro"

Escolhida por ser a mais adequada para uma ferramenta de uso intensivo por profissionais contábeis. O tema escuro reduz a fadiga ocular, o drawer lateral mantém o contexto da lista visível durante o preenchimento, e a densidade informacional alta permite trabalhar com muitas notas sem perder a visão geral.
