/**
 * AbaVerificar — Aba de verificação de namespace de XMLs NFS-e
 * Design: Dark Slate Pro
 */

import { useRef, useState } from "react";
import { useApp, type VerifRegistro } from "@/contexts/AppContext";
import { importarXml, detectarTipo, lerArquivo, extrairNumNf } from "@/lib/xmlParser";
import { toast } from "sonner";
import {
  FolderOpen, Search, Upload, Trash2, CheckCircle2,
  AlertTriangle, XCircle, Info, FileCode2, Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { nanoid } from "nanoid";

type FiltroTipo = "Todos" | string;

export default function AbaVerificar() {
  const { verifRegistros, setVerifRegistros, adicionarNota, setAbaAtiva } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [verificando, setVerificando] = useState(false);
  const [filtro, setFiltro] = useState<FiltroTipo>("Todos");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  // Tipos únicos para o filtro
  const tiposUnicos = ["Todos", ...Array.from(new Set(verifRegistros.map((r) => r.tipo).filter(Boolean)))];

  const registrosFiltrados = filtro === "Todos"
    ? verifRegistros
    : verifRegistros.filter((r) => r.tipo === filtro);

  // Mapa de id -> File para acesso durante verificação
  const fileMapRef = useRef<Map<string, File>>(new Map());

  async function selecionarArquivos(files: FileList | null) {
    if (!files || files.length === 0) return;
    const novos: VerifRegistro[] = Array.from(files).map((f) => {
      const id = nanoid();
      fileMapRef.current.set(id, f);
      return {
        id,
        nome: f.name,
        tipo: "",
        numNf: "",
        dados: null,
        avisos: [],
        erro: "",
        selecionada: false,
        importada: false,
      };
    });
    setVerifRegistros([...verifRegistros, ...novos]);
    toast.info(`${files.length} arquivo(s) adicionado(s). Clique em "Verificar" para analisar.`);
  }

  async function verificar() {
    if (verifRegistros.length === 0) {
      toast.error("Nenhum arquivo selecionado.");
      return;
    }
    setVerificando(true);
    const atualizados = await Promise.all(
      verifRegistros.map(async (reg) => {
        if (reg.tipo && !reg.erro) return reg; // já verificado
        const file = fileMapRef.current.get(reg.id);
        if (!file) return { ...reg, tipo: "Erro", erro: "Arquivo não encontrado no cache." };
        try {
          const texto = await lerArquivo(file);
          const tipo = detectarTipo(texto);

          // Tenta extrair dados
          const parser = new DOMParser();
          const doc = parser.parseFromString(texto, "application/xml");
          const numNf = extrairNumNf(doc);

          let dados = null;
          let avisos: string[] = [];
          let erro = "";

          try {
            const result = importarXml(texto, reg.nome);
            dados = result.dados;
            avisos = result.avisos;
          } catch (e: any) {
            erro = e.message;
          }

          return { ...reg, tipo, numNf, dados, avisos, erro };
        } catch (e: any) {
          return { ...reg, tipo: "Erro ao ler", erro: e.message };
        }
      })
    );
    setVerifRegistros(atualizados);
    setVerificando(false);
    const ok = atualizados.filter((r) => !r.erro).length;
    const erros = atualizados.filter((r) => r.erro).length;
    toast.success(`Verificação concluída: ${ok} OK${erros > 0 ? `, ${erros} com erro` : ""}`);
  }

  function importarVerificados() {
    const importaveis = verifRegistros.filter((r) => r.dados && !r.erro && !r.importada);
    if (importaveis.length === 0) {
      toast.error("Nenhum arquivo verificado com sucesso para importar ou todos já foram importados.");
      return;
    }
    for (const reg of importaveis) {
      if (reg.dados) adicionarNota(reg.dados);
    }
    setVerifRegistros(
      verifRegistros.map((r) =>
        importaveis.some((imp) => imp.id === r.id) ? { ...r, importada: true } : r
      )
    );
    toast.success(`${importaveis.length} nota(s) importada(s) para a aba Notas.`);
    setAbaAtiva("notas");
  }

  function limpar() {
    setVerifRegistros([]);
    setFiltro("Todos");
    toast.info("Lista limpa.");
  }

  function toggleSelecionada(id: string) {
    setVerifRegistros(
      verifRegistros.map((r) => r.id === id ? { ...r, selecionada: !r.selecionada } : r)
    );
  }

  function StatusIcon({ reg }: { reg: VerifRegistro }) {
    if (reg.importada) return <CheckCircle2 size={13} className="text-cyan-400" />;
    if (!reg.tipo) return <div className="w-2 h-2 rounded-full bg-slate-600" />;
    if (reg.erro) return <XCircle size={13} className="text-rose-400" />;
    if (reg.avisos.length > 0) return <AlertTriangle size={13} className="text-amber-400" />;
    return <CheckCircle2 size={13} className="text-emerald-400" />;
  }

  function TipoBadge({ tipo }: { tipo: string }) {
    if (!tipo) return <span className="text-slate-600 text-[10px]">—</span>;
    const isNs2 = tipo.includes("ns2");
    const isSped = tipo.includes("SPED Nacional");
    const isErro = tipo.includes("Erro") || tipo.includes("Outro");
    return (
      <span className={cn(
        "text-[10px] px-1.5 py-0.5 rounded font-mono",
        isNs2 ? "bg-emerald-900/40 text-emerald-300" :
        isSped ? "bg-cyan-900/40 text-cyan-300" :
        "bg-rose-900/40 text-rose-300"
      )}>
        {tipo}
      </span>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-700/40 flex items-center gap-2 shrink-0 flex-wrap">
        <p className="text-xs text-slate-500 mr-2">
          Verifique o tipo de namespace dos XMLs antes de importar.
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          <FolderOpen size={12} /> Selecionar XMLs
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          multiple
          className="hidden"
          onChange={(e) => selecionarArquivos(e.target.files)}
        />

        <button
          onClick={verificar}
          disabled={verificando || verifRegistros.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <Search size={12} />
          {verificando ? "Verificando..." : "Verificar"}
        </button>

        <button
          onClick={importarVerificados}
          disabled={verifRegistros.filter((r) => r.dados && !r.erro).length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-semibold transition-colors disabled:opacity-50"
        >
          <Upload size={12} /> Importar verificados
        </button>

        <button
          onClick={limpar}
          disabled={verifRegistros.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 text-xs font-medium transition-colors disabled:opacity-50"
        >
          <Trash2 size={12} /> Limpar
        </button>

        <div className="flex-1" />

        {/* Filtro */}
        {tiposUnicos.length > 1 && (
          <div className="flex items-center gap-2">
            <Filter size={11} className="text-slate-600" />
            <select
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="h-7 px-2 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs focus:outline-none focus:border-cyan-500"
            >
              {tiposUnicos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Tabela */}
      <div className="flex-1 overflow-auto">
        {verifRegistros.length === 0 ? (
          <EmptyVerif onSelecionar={() => fileInputRef.current?.click()} />
        ) : (
          <table className="w-full text-xs border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="bg-slate-800/90 backdrop-blur-sm">
                <th className="w-8 px-3 py-2.5" />
                <th className="px-3 py-2.5 text-left font-semibold text-slate-400 w-24">Nº NF</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-400">Arquivo XML</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-400 w-72">Tipo de Namespace</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-400 w-40">Status</th>
              </tr>
            </thead>
            <tbody>
              {registrosFiltrados.map((reg, idx) => (
                <tr
                  key={reg.id}
                  className={cn(
                    "border-b border-slate-800/60 transition-colors",
                    idx % 2 === 0 ? "bg-slate-900/30" : "bg-slate-900/10",
                    "hover:bg-slate-800/40"
                  )}
                >
                  <td className="px-3 py-2 text-center">
                    <StatusIcon reg={reg} />
                  </td>
                  <td className="px-3 py-2 font-mono text-slate-300">{reg.numNf || "—"}</td>
                  <td className="px-3 py-2 text-slate-400 font-mono text-[11px]">{reg.nome}</td>
                  <td className="px-3 py-2">
                    <TipoBadge tipo={reg.tipo} />
                  </td>
                  <td className="px-3 py-2">
                    {reg.erro ? (
                      <span className="text-rose-400 text-[10px]" title={reg.erro}>
                        Erro: {reg.erro.slice(0, 40)}{reg.erro.length > 40 ? "..." : ""}
                      </span>
                    ) : reg.avisos.length > 0 ? (
                      <span className="text-amber-400 text-[10px]" title={reg.avisos.join("\n")}>
                        {reg.avisos.length} aviso(s)
                      </span>
                    ) : reg.tipo ? (
                      <span className="text-emerald-400 text-[10px]">OK</span>
                    ) : (
                      <span className="text-slate-600 text-[10px]">Aguardando verificação</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Legenda */}
      {verifRegistros.length > 0 && (
        <div className="px-5 py-2 border-t border-slate-700/40 bg-slate-900/60 flex items-center gap-5 shrink-0">
          <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <CheckCircle2 size={11} className="text-emerald-400" /> OK
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <AlertTriangle size={11} className="text-amber-400" /> Avisos (verifique campos)
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-slate-600">
            <XCircle size={11} className="text-rose-400" /> Erro de leitura
          </span>
          <span className="text-[10px] text-slate-600 ml-auto">
            Duplo clique em uma linha para editar · Use "Importar verificados" para adicionar à aba Notas
          </span>
        </div>
      )}
    </div>
  );
}

function EmptyVerif({ onSelecionar }: { onSelecionar: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-64 gap-4 text-center px-8">
      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center">
        <FileCode2 size={24} className="text-slate-600" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-400">Nenhum XML selecionado</p>
        <p className="text-xs text-slate-600 mt-1">
          Selecione arquivos XML NFS-e para verificar o tipo de namespace e extrair os dados
        </p>
      </div>
      <button
        onClick={onSelecionar}
        className="flex items-center gap-1.5 px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
      >
        <FolderOpen size={13} /> Selecionar XMLs
      </button>
    </div>
  );
}
