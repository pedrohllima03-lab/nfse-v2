/**
 * Home — Página principal do NFS-e Serviços Tomados
 * Design: Dark Slate Pro
 * Layout: Header fixo + abas principais + drawer lateral
 */

import { useApp } from "@/contexts/AppContext";
import AbaNotas from "@/components/AbaNotas";
import AbaVerificar from "@/components/AbaVerificar";
import NotaDrawer from "@/components/NotaDrawer";
import { FileText, Search, Info, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const ABAS_PRINCIPAIS = [
  { id: "notas", label: "Notas", icon: FileText, desc: "Lista e exportação" },
  { id: "verificar", label: "Verificar XMLs", icon: Search, desc: "Análise de namespace" },
  { id: "ajuda", label: "Ajuda", icon: Info, desc: "Documentação" },
];

export default function Home() {
  const { abaAtiva, setAbaAtiva, notas } = useApp();

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <header className="shrink-0 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-sm">
        {/* Linha de acento */}
        <div className="h-0.5 bg-gradient-to-r from-cyan-500 via-cyan-400 to-transparent" />

        <div className="flex items-center px-5 py-3 gap-4">
          {/* Logo / Título */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center">
              <FileText size={15} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-100 leading-tight">
                NFS-e · Serviços Tomados
              </h1>
              <p className="text-[10px] text-slate-600 leading-tight">
                Prefeitura de João Pessoa · Layout SPED Nacional
              </p>
            </div>
          </div>

          <div className="flex-1" />

          {/* Estatísticas rápidas */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/60 border border-slate-700/40">
              <span className="text-slate-500">Notas:</span>
              <span className="font-mono text-slate-300">{notas.length}</span>
            </div>
            {notas.filter((n) => n._selecionada).length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-900/30 border border-cyan-700/30">
                <span className="text-cyan-600">Selecionadas:</span>
                <span className="font-mono text-cyan-400">{notas.filter((n) => n._selecionada).length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Abas principais */}
        <nav className="flex px-5 gap-0">
          {ABAS_PRINCIPAIS.map((aba) => {
            const Icon = aba.icon;
            const ativa = abaAtiva === aba.id;
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 text-xs font-medium",
                  "border-b-2 transition-all duration-150",
                  ativa
                    ? "border-cyan-500 text-cyan-400 bg-slate-800/30"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20"
                )}
              >
                <Icon size={13} />
                {aba.label}
              </button>
            );
          })}
        </nav>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 overflow-hidden">
        {abaAtiva === "notas" && <AbaNotas />}
        {abaAtiva === "verificar" && <AbaVerificar />}
        {abaAtiva === "ajuda" && <AbaAjuda />}
      </main>

      {/* Drawer de formulário */}
      <NotaDrawer />
    </div>
  );
}

/* ── Aba de Ajuda ─────────────────────────────────────────────────────────── */
function AbaAjuda() {
  return (
    <div className="h-full overflow-auto px-6 py-6 max-w-3xl">
      <h2 className="text-base font-semibold text-slate-200 mb-1">Documentação</h2>
      <p className="text-xs text-slate-500 mb-6">
        Gerador de arquivo TXT para importação de NFS-e (Serviços Tomados) — Prefeitura de João Pessoa
      </p>

      <Section title="Fluxo de Trabalho">
        <ol className="space-y-3">
          {[
            { n: "1", t: "Informe a Inscrição Municipal", d: "Campo obrigatório para o cabeçalho do arquivo TXT. Fica no topo da aba Notas." },
            { n: "2", t: "Adicione as notas fiscais", d: "Use o botão \"Adicionar\" para inserir manualmente, ou \"Importar XML\" para carregar arquivos NFS-e no padrão SPED Nacional." },
            { n: "3", t: "Selecione as notas para exportar", d: "Marque as notas desejadas usando os checkboxes. Use o checkbox do cabeçalho para selecionar/desmarcar todas." },
            { n: "4", t: "Exporte o arquivo TXT", d: "Clique em \"Exportar TXT\" para baixar o arquivo IMPORTA.TXT com o layout posicional da Prefeitura." },
          ].map((item) => (
            <li key={item.n} className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-[10px] font-bold text-cyan-400 shrink-0 mt-0.5">
                {item.n}
              </span>
              <div>
                <p className="text-xs font-medium text-slate-300">{item.t}</p>
                <p className="text-xs text-slate-500 mt-0.5">{item.d}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Aba Verificar XMLs">
        <p className="text-xs text-slate-400 mb-3">
          Use esta aba para analisar arquivos XML antes de importar. Ela detecta o tipo de namespace e tenta extrair os dados da nota.
        </p>
        <div className="space-y-2">
          {[
            { cor: "bg-emerald-900/40 text-emerald-300", label: "ns2 (João Pessoa / SPED+Assinatura)", desc: "Formato emitido pela Prefeitura de João Pessoa com assinatura digital." },
            { cor: "bg-cyan-900/40 text-cyan-300", label: "SPED Nacional (sem ns2)", desc: "Formato padrão nacional sem assinatura digital." },
            { cor: "bg-rose-900/40 text-rose-300", label: "Outro / Desconhecido", desc: "Formato não reconhecido. Verifique se o arquivo é uma NFS-e válida." },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-2">
              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-mono shrink-0 mt-0.5", item.cor)}>
                {item.label}
              </span>
              <p className="text-xs text-slate-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Formulário de Nota — Sub-abas">
        <div className="space-y-2">
          {[
            { t: "1. Documento", d: "Data de emissão, competência, número, série, modelo e discriminação dos serviços." },
            { t: "2. Prestador", d: "Identificação (tipo, CPF/CNPJ, nome) e endereço completo do prestador de serviços." },
            { t: "3. Serviço/Local", d: "Código do serviço, CNAE, local de prestação e local do resultado." },
            { t: "4. Valores/ISS", d: "Exigibilidade, tipo de recolhimento, alíquota, valores monetários e retenções federais." },
          ].map((item) => (
            <div key={item.t} className="flex gap-2">
              <ChevronRight size={12} className="text-cyan-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-medium text-slate-300">{item.t}</span>
                <span className="text-xs text-slate-500 ml-1">— {item.d}</span>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Formato do Arquivo TXT">
        <p className="text-xs text-slate-400 mb-3">
          O arquivo gerado segue o layout posicional da Prefeitura de João Pessoa:
        </p>
        <div className="bg-slate-800/60 rounded-md p-3 font-mono text-[11px] text-slate-400 space-y-1">
          <p><span className="text-cyan-400">H</span><span className="text-slate-500">[Inscrição Municipal — 30 chars]</span></p>
          <p><span className="text-emerald-400">T</span><span className="text-slate-500">[Data Emissão][Competência][Nº NF]...[Discriminação — 2000 chars]</span></p>
          <p className="text-slate-600">— Uma linha T por nota fiscal —</p>
        </div>
        <p className="text-xs text-slate-600 mt-2">
          Separador de linha: CRLF (\r\n) · Codificação: UTF-8
        </p>
      </Section>

      <Section title="Campos Obrigatórios">
        <div className="grid grid-cols-2 gap-1.5">
          {[
            "Nº do Documento Fiscal",
            "Data de Emissão",
            "Competência",
            "Modelo do Documento",
            "CPF/CNPJ do Prestador",
            "Nome / Razão Social",
            "Código do Serviço",
            "Valor dos Serviços",
          ].map((campo) => (
            <div key={campo} className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="text-rose-400">*</span> {campo}
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-cyan-500">{title}</h3>
        <div className="flex-1 h-px bg-slate-800" />
      </div>
      {children}
    </div>
  );
}
