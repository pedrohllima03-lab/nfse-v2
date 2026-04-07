/**
 * AbaNotas — Aba principal com lista de notas fiscais
 * Design: Dark Slate Pro — tabela densa, toolbar de ações, seleção por checkbox
 */

import { useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import { importarXml, lerArquivo } from "@/lib/xmlParser";
import { gerarTxt, gerarTxtPorNota, downloadTxt, downloadTxtLote } from "@/lib/txtGenerator";
import {
  Plus, Pencil, Trash2, Upload, Download, CheckSquare,
  Square, ArrowUpDown, ArrowUp, ArrowDown, FileText,
  AlertTriangle, CheckCircle2, Info,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { NotaComId } from "@/contexts/AppContext";

type SortKey = "num_nf" | "dt_emissao" | "nome_prestador" | "cpf_cnpj" | "cod_servico" | "vl_servico";
type SortDir = "asc" | "desc" | null;

function fmtValor(v: string): string {
  const n = parseFloat(v?.replace(",", ".") || "0");
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function fmtCpfCnpj(v: string): string {
  const d = (v || "").replace(/\D/g, "");
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5");
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  return v || "—";
}

export default function AbaNotas() {
  const {
    inscricao, setInscricao,
    notas, removerNota, removerSelecionadas,
    toggleSelecionada, toggleTodasSelecionadas, todasSelecionadas,
    abrirNovaNotaDrawer, abrirEditarNotaDrawer,
    adicionarNota,
  } = useApp();

  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [importando, setImportando] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Ordenação
  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : d === "desc" ? null : "asc"));
      if (sortDir === "desc") setSortKey(null);
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const notasOrdenadas = [...notas].sort((a, b) => {
    if (!sortKey || !sortDir) return 0;
    const va = a[sortKey] ?? "";
    const vb = b[sortKey] ?? "";
    const cmp = va.localeCompare(vb, "pt-BR", { numeric: true });
    return sortDir === "asc" ? cmp : -cmp;
  });

  const selecionadas = notas.filter((n) => n._selecionada);

  // Importar XMLs
  async function handleImportarXml(files: FileList | null) {
    if (!files || files.length === 0) return;
    setImportando(true);
    let ok = 0;
    const erros: string[] = [];
    const avisosTodos: string[] = [];

    for (const file of Array.from(files)) {
      try {
        const texto = await lerArquivo(file);
        const { dados, avisos } = importarXml(texto, file.name);
        adicionarNota(dados);
        ok++;
        if (avisos.length > 0) {
          avisosTodos.push(...avisos.map((a) => `[${file.name}] ${a}`));
        }
      } catch (e: any) {
        erros.push(`${file.name}: ${e.message}`);
      }
    }

    setImportando(false);

    if (ok > 0) {
      toast.success(`${ok} nota(s) importada(s) com sucesso.`);
    }
    if (avisosTodos.length > 0) {
      toast.warning("Avisos de importação", {
        description: avisosTodos.slice(0, 3).join("\n") + (avisosTodos.length > 3 ? `\n...e mais ${avisosTodos.length - 3}` : ""),
        duration: 8000,
      });
    }
    if (erros.length > 0) {
      toast.error(`${erros.length} erro(s) na importação`, {
        description: erros.slice(0, 3).join("\n"),
        duration: 8000,
      });
    }
  }

  // Exportar TXT em lote (um arquivo por nota)
  async function handleExportar() {
    if (!inscricao.trim()) {
      toast.error("Informe a Inscrição Municipal antes de exportar.");
      return;
    }
    if (selecionadas.length === 0) {
      toast.error("Nenhuma nota selecionada. Marque ao menos uma nota.");
      return;
    }
    if (selecionadas.length === 1) {
      const conteudo = gerarTxt(inscricao.trim(), selecionadas);
      downloadTxt(conteudo);
      toast.success("Nota exportada para IMPORTA.TXT");
    } else {
      const arquivos = gerarTxtPorNota(inscricao.trim(), selecionadas);
      await downloadTxtLote(arquivos);
      toast.success(`${selecionadas.length} arquivo(s) exportado(s) com sucesso`);
    }
  }

  // Remover selecionadas com confirmação
  function handleRemoverSelecionadas() {
    if (selecionadas.length === 0) {
      toast.error("Nenhuma nota selecionada.");
      return;
    }
    if (window.confirm(`Remover ${selecionadas.length} nota(s) selecionada(s)? Esta ação não pode ser desfeita.`)) {
      removerSelecionadas();
      toast.success(`${selecionadas.length} nota(s) removida(s).`);
    }
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown size={11} className="text-slate-600" />;
    if (sortDir === "asc") return <ArrowUp size={11} className="text-cyan-400" />;
    return <ArrowDown size={11} className="text-cyan-400" />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Barra de inscrição + contador */}
      <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-700/40 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-500 font-medium whitespace-nowrap">
            Inscrição Municipal
          </label>
          <input
            value={inscricao}
            onChange={(e) => setInscricao(e.target.value)}
            placeholder="Informe a inscrição municipal"
            className={cn(
              "h-7 px-2.5 w-56 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm",
              "focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30",
              "placeholder:text-slate-600 font-mono transition-colors"
            )}
          />
        </div>
        <div className="flex-1" />
        <span className="text-xs text-slate-600 font-mono">
          {notas.length} nota{notas.length !== 1 ? "s" : ""}
          {selecionadas.length > 0 && selecionadas.length < notas.length && (
            <span className="text-cyan-500"> · {selecionadas.length} selecionada{selecionadas.length !== 1 ? "s" : ""}</span>
          )}
        </span>
      </div>

      {/* Toolbar de ações */}
      <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-700/40 flex items-center gap-2 shrink-0 flex-wrap">
        {/* Grupo esquerdo */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={abrirNovaNotaDrawer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
          >
            <Plus size={13} /> Adicionar
          </button>

          <button
            onClick={() => {
              const sel = notas.find((n) => n._selecionada);
              if (!sel) { toast.error("Selecione uma nota para editar."); return; }
              if (selecionadas.length > 1) { toast.error("Selecione apenas uma nota para editar."); return; }
              abrirEditarNotaDrawer(sel);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <Pencil size={12} /> Editar
          </button>

          <button
            onClick={handleRemoverSelecionadas}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors"
          >
            <Trash2 size={12} /> Remover
          </button>

          <div className="w-px h-5 bg-slate-700 mx-1" />

          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={importando}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors disabled:opacity-50"
          >
            <Upload size={12} />
            {importando ? "Importando..." : "Importar XML"}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xml"
            multiple
            className="hidden"
            onChange={(e) => handleImportarXml(e.target.files)}
          />
        </div>

        <div className="flex-1" />

        {/* Exportar */}
        <button
          onClick={handleExportar}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors"
        >
          <Download size={13} /> Exportar TXT
          {selecionadas.length > 0 && (
            <span className="ml-1 bg-emerald-900/60 px-1.5 py-0.5 rounded text-[10px]">
              {selecionadas.length}
            </span>
          )}
        </button>
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {notas.length === 0 ? (
          <EmptyState onAdicionar={abrirNovaNotaDrawer} onImportar={() => fileInputRef.current?.click()} />
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-800/90 backdrop-blur-sm">
                <th className="w-9 px-3 py-2.5 text-left">
                  <button onClick={toggleTodasSelecionadas} className="text-slate-400 hover:text-cyan-400 transition-colors">
                    {todasSelecionadas
                      ? <CheckSquare size={14} className="text-cyan-400" />
                      : <Square size={14} />}
                  </button>
                </th>
                {[
                  { key: "num_nf" as SortKey, label: "Nº NF", w: "w-24" },
                  { key: "dt_emissao" as SortKey, label: "Emissão", w: "w-24" },
                  { key: "nome_prestador" as SortKey, label: "Prestador", w: "" },
                  { key: "cpf_cnpj" as SortKey, label: "CPF/CNPJ", w: "w-36" },
                  { key: "cod_servico" as SortKey, label: "Serviço", w: "w-20" },
                  { key: "vl_servico" as SortKey, label: "Valor", w: "w-28" },
                ].map(({ key, label, w }) => (
                  <th
                    key={key}
                    className={cn("px-3 py-2.5 text-left font-semibold text-slate-400 cursor-pointer hover:text-slate-200 transition-colors select-none", w)}
                    onClick={() => handleSort(key)}
                  >
                    <span className="flex items-center gap-1">
                      {label}
                      <SortIcon col={key} />
                    </span>
                  </th>
                ))}
                <th className="w-16 px-3 py-2.5 text-left font-semibold text-slate-400">Ações</th>
              </tr>
            </thead>
            <tbody>
              {notasOrdenadas.map((nota, idx) => (
                <NotaRow
                  key={nota._id}
                  nota={nota}
                  idx={idx}
                  onToggle={() => toggleSelecionada(nota._id)}
                  onEditar={() => abrirEditarNotaDrawer(nota)}
                  onRemover={() => {
                    if (window.confirm(`Remover a nota ${nota.num_nf}?`)) {
                      removerNota(nota._id);
                      toast.success("Nota removida.");
                    }
                  }}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Rodapé com totais */}
      {notas.length > 0 && (
        <div className="px-5 py-2 border-t border-slate-700/40 bg-slate-900/60 flex items-center gap-6 shrink-0">
          <span className="text-xs text-slate-600">
            <span className="text-slate-500">Total selecionado:</span>{" "}
            <span className="text-emerald-400 font-mono">
              {fmtValor(
                selecionadas.reduce((acc, n) => acc + parseFloat(n.vl_servico?.replace(",", ".") || "0"), 0).toString()
              )}
            </span>
            <span className="text-slate-600 ml-2">em {selecionadas.length}/{notas.length} nota{notas.length !== 1 ? "s" : ""}</span>
          </span>
          <div className="flex-1" />
          <span className="text-[10px] text-slate-700">
            Duplo clique em uma linha para editar
          </span>
        </div>
      )}
    </div>
  );
}

function NotaRow({
  nota, idx, onToggle, onEditar, onRemover,
}: {
  nota: NotaComId;
  idx: number;
  onToggle: () => void;
  onEditar: () => void;
  onRemover: () => void;
}) {
  return (
    <tr
      className={cn(
        "border-b border-slate-800/60 transition-colors cursor-default",
        nota._selecionada
          ? "bg-cyan-950/20 hover:bg-cyan-950/30"
          : idx % 2 === 0 ? "bg-slate-900/30 hover:bg-slate-800/40" : "bg-slate-900/10 hover:bg-slate-800/40"
      )}
      onDoubleClick={onEditar}
    >
      <td className="px-3 py-2">
        <button onClick={onToggle} className="text-slate-500 hover:text-cyan-400 transition-colors">
          {nota._selecionada
            ? <CheckSquare size={14} className="text-cyan-400" />
            : <Square size={14} />}
        </button>
      </td>
      <td className="px-3 py-2 font-mono text-slate-300">{nota.num_nf || "—"}</td>
      <td className="px-3 py-2 text-slate-400 font-mono">{nota.dt_emissao || "—"}</td>
      <td className="px-3 py-2 text-slate-200 max-w-xs truncate" title={nota.nome_prestador}>
        {nota.nome_prestador || "—"}
      </td>
      <td className="px-3 py-2 font-mono text-slate-400">{fmtCpfCnpj(nota.cpf_cnpj)}</td>
      <td className="px-3 py-2 font-mono text-slate-400">{nota.cod_servico || "—"}</td>
      <td className="px-3 py-2 font-mono text-emerald-400">{fmtValor(nota.vl_servico)}</td>
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={onEditar}
            className="p-1 rounded text-slate-600 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Editar"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onRemover}
            className="p-1 rounded text-slate-600 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            title="Remover"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </tr>
  );
}

function EmptyState({ onAdicionar, onImportar }: { onAdicionar: () => void; onImportar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center px-8">
      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
        <FileText size={24} className="text-slate-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">Nenhuma nota fiscal</p>
        <p className="text-xs text-slate-600 mt-1">
          Adicione notas manualmente ou importe arquivos XML NFS-e
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onAdicionar}
          className="flex items-center gap-1.5 px-3 py-2 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors"
        >
          <Plus size={13} /> Adicionar nota
        </button>
        <button
          onClick={onImportar}
          className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          <Upload size={13} /> Importar XML
        </button>
      </div>
    </div>
  );
}
