# Resumo dos Projetos

## OpenClaude
- **Localização**: `openclaude-main/`
- **Descrição**: CLI de agentes de código para múltiplos provedores de LLM
- **Status**: Estável, projeto bem completo

## NFS-e Tomador v2
- **Localização**: `nfse-tomador-v2/`
- **Descrição**: Versão modernizada da ferramenta de geração de TXT NFS-e para João Pessoa
- **Status**: Estrutura completa criada, aguardando implementação final das funcionalidades

### Principais Melhorias em relação à v1:

1. **Next.js 15 App Router** vs Vite
2. **Tailwind CSS 4** com CSS-first configuration
3. **Zustand** para state management com persistência automática
4. **Design system consistente** com componentes reutilizáveis (shadcn/ui-inspired)
5. **Tema claro/escuro** com next-themes
6. **Pronto para Vercel** + Supabase
7. **TypeScript** mais rigoroso
8. **Responsivo** (mobile-first)
9. **Melhor UX/UI**: drawer lateral, tabs, validação inline

### Funcionalidades Implementadas:

- ✅ Estrutura completa do Projeto Next.js
- ✅ Componentes UI base (button, input, select, checkbox, table, tabs, etc.)
- ✅ Layout com sidebar responsiva
- ✅ Formulário completo em 4 abas
- ✅ Tabela ordenável com seleção múltipla
- ✅ State management com Zustand + localStorage
- ✅ Gerador de TXT idêntico ao original
- ✅ Configuração Vercel + Supabase pronta
- ✅ Documentação completa (README, DEPLOY, CONTRIBUTING, SUPPORT)

### Pendente (para futura implementação):

- [ ] Importação XML completa
- [ ] Testes unitários
- [ ] Validação de CPF/CNPJ
- [ ] Máscaras de input
- [ ] Paginação da tabela (para muitas notas)
- [ ] Filtros e busca
- [ ] Histórico de exportações
- [ ] Dashboard com estatísticas
- [ ] Autenticação com Supabase
- [ ] Página de ajuda detalhada
- [ ] Google Analytics

### Como Executar:

```bash
cd nfse-tomador-v2
pnpm install
cp .env.local.example .env.local
pnpm dev
```

A aplicação estará disponível em `http://localhost:3000`

### Deploy no Vercel:

```bash
# Push para GitHub e importar no Vercel, ou:
vercel --prod
```

---

Última atualização: 2025-04-06
