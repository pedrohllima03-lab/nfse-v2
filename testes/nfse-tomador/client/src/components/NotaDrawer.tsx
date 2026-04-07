/**
 * NotaDrawer — Drawer lateral para criar/editar notas fiscais
 * Design: Dark Slate Pro — slide da direita, sub-abas internas
 * 4 abas: Documento | Prestador | Serviço/Local | Valores/ISS
 */

import { useEffect, useState, useRef } from "react";
import { useApp } from "@/contexts/AppContext";
import type { NotaFiscal } from "@/lib/txtGenerator";
import {
  MODELOS, EXIGIBILIDADE, RECOLHIMENTO, MOTIVO_NAO_RETENCAO,
  TIPO_PRESTADOR, LOCAL_PRESTACAO, LOCAL_RESULTADO, SN_OPCOES,
  CAMPOS_OBRIGATORIOS, notaEmBranco,
} from "@/lib/constants";
import { X, Save, ChevronRight, ChevronLeft, AlertCircle, FileText, Building2, MapPin, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const ABAS = [
  { id: "documento",  label: "Documento",    icon: FileText,  campos: ["num_nf","dt_emissao","dt_competencia","modelo"] },
  { id: "prestador",  label: "Prestador",     icon: Building2, campos: ["cpf_cnpj","nome_prestador"] },
  { id: "servico",    label: "Serviço/Local", icon: MapPin,    campos: ["cod_servico"] },
  { id: "valores",    label: "Valores/ISS",   icon: DollarSign,campos: ["vl_servico"] },
];

interface FieldProps {
  label: string;
  required?: boolean;
  tip?: string;
  children: React.ReactNode;
  className?: string;
}

function Field({ label, required, tip, children, className }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
        {label}
        {required && <span className="text-rose-400">*</span>}
      </label>
      {children}
      {tip && <p className="text-[10px] text-slate-600 leading-tight">{tip}</p>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  mono?: boolean;
}

function Input({ mono, className, ...props }: InputProps) {
  return (
    <input
      {...props}
      className={cn(
        "h-8 px-2.5 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm",
        "focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30",
        "placeholder:text-slate-600 transition-colors",
        mono && "font-mono",
        props.disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

function Select({ className, children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      className={cn(
        "h-8 px-2.5 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm",
        "focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30",
        "transition-colors",
        className
      )}
    >
      {children}
    </select>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      {...props}
      className={cn(
        "px-2.5 py-2 rounded bg-slate-800 border border-slate-700 text-slate-100 text-sm",
        "focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30",
        "placeholder:text-slate-600 transition-colors resize-none",
        className
      )}
    />
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="col-span-full flex items-center gap-2 pt-2 pb-1">
      <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">{children}</span>
      <div className="flex-1 h-px bg-slate-700/60" />
    </div>
  );
}

export default function NotaDrawer() {
  const { drawerAberto, notaEditando, fecharDrawer, adicionarNota, atualizarNota } = useApp();
  const [abaAtiva, setAbaAtiva] = useState("documento");
  const [form, setForm] = useState<NotaFiscal>(notaEmBranco());
  const [erros, setErros] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Controla animação de entrada/saída
  useEffect(() => {
    if (drawerAberto) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 200);
      return () => clearTimeout(t);
    }
  }, [drawerAberto]);

  // Preenche o form ao abrir
  useEffect(() => {
    if (drawerAberto) {
      setAbaAtiva("documento");
      setErros([]);
      if (notaEditando) {
        const { _id, _selecionada, ...dados } = notaEditando;
        setForm(dados);
      } else {
        setForm(notaEmBranco());
      }
    }
  }, [drawerAberto, notaEditando]);

  const set = (key: keyof NotaFiscal) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  function validar(): boolean {
    const faltando = CAMPOS_OBRIGATORIOS
      .filter(({ key }) => !form[key as keyof NotaFiscal]?.toString().trim())
      .map(({ label }) => label);
    setErros(faltando);
    return faltando.length === 0;
  }

  function salvar() {
    if (!validar()) {
      setAbaAtiva("documento");
      toast.error("Preencha os campos obrigatórios antes de salvar.");
      return;
    }
    const d: NotaFiscal = {
      ...form,
      tipo_prestador: form.tipo_prestador[0] ?? "1",
      exigibilidade: form.exigibilidade[0] ?? "1",
    };
    if (notaEditando) {
      atualizarNota(notaEditando._id, d);
      toast.success(`Nota ${d.num_nf} atualizada.`);
    } else {
      adicionarNota(d);
      toast.success(`Nota ${d.num_nf} adicionada.`);
    }
    fecharDrawer();
  }

  const abaIdx = ABAS.findIndex((a) => a.id === abaAtiva);
  const podeAvancar = abaIdx < ABAS.length - 1;
  const podeVoltar = abaIdx > 0;

  if (!visible) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-200",
          drawerAberto ? "opacity-100" : "opacity-0"
        )}
        onClick={fecharDrawer}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={cn(
          "fixed right-0 top-0 h-full z-50 w-full max-w-2xl",
          "bg-slate-900 border-l border-slate-700/60 shadow-2xl",
          "flex flex-col",
          drawerAberto ? "drawer-enter" : "drawer-exit"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-sm shrink-0">
          <div>
            <h2 className="text-base font-semibold text-slate-100">
              {notaEditando ? `Editar Nota ${notaEditando.num_nf}` : "Nova Nota Fiscal"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              NFS-e · Serviços Tomados · Prefeitura de João Pessoa
            </p>
          </div>
          <button
            onClick={fecharDrawer}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Sub-abas */}
        <div className="flex border-b border-slate-700/60 bg-slate-900/60 shrink-0 overflow-x-auto">
          {ABAS.map((aba, idx) => {
            const Icon = aba.icon;
            const ativa = abaAtiva === aba.id;
            // Verifica se a aba tem campos preenchidos
            const preenchida = aba.campos.some((c) => !!form[c as keyof NotaFiscal]?.toString().trim());
            return (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-3 text-xs font-medium whitespace-nowrap relative",
                  "border-b-2 transition-colors",
                  ativa
                    ? "border-cyan-500 text-cyan-400 bg-slate-800/40"
                    : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800/20"
                )}
              >
                <Icon size={13} />
                <span>{idx + 1}. {aba.label}</span>
                {preenchida && !ativa && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-2 right-2" />
                )}
              </button>
            );
          })}
        </div>

        {/* Erros */}
        {erros.length > 0 && (
          <div className="mx-5 mt-3 p-3 rounded-md bg-rose-950/40 border border-rose-800/50 flex gap-2 shrink-0">
            <AlertCircle size={14} className="text-rose-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-medium text-rose-300">Campos obrigatórios:</p>
              <p className="text-xs text-rose-400 mt-0.5">{erros.join(" · ")}</p>
            </div>
          </div>
        )}

        {/* Conteúdo da aba */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {abaAtiva === "documento" && <AbaDocumento form={form} set={set} />}
          {abaAtiva === "prestador" && <AbaPrestador form={form} set={set} />}
          {abaAtiva === "servico" && <AbaServico form={form} set={set} />}
          {abaAtiva === "valores" && <AbaValores form={form} set={set} />}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-700/60 bg-slate-900/80 backdrop-blur-sm shrink-0">
          <div className="flex items-center justify-between">
            {/* Navegação entre abas */}
            <div className="flex gap-2">
              <button
                onClick={() => podeVoltar && setAbaAtiva(ABAS[abaIdx - 1].id)}
                disabled={!podeVoltar}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                  podeVoltar
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    : "opacity-30 cursor-not-allowed bg-slate-800/50 text-slate-500"
                )}
              >
                <ChevronLeft size={13} /> Anterior
              </button>
              <button
                onClick={() => podeAvancar && setAbaAtiva(ABAS[abaIdx + 1].id)}
                disabled={!podeAvancar}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-colors",
                  podeAvancar
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100"
                    : "opacity-30 cursor-not-allowed bg-slate-800/50 text-slate-500"
                )}
              >
                Próxima <ChevronRight size={13} />
              </button>
            </div>

            {/* Ações */}
            <div className="flex gap-2">
              <button
                onClick={fecharDrawer}
                className="px-4 py-2 rounded text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                className="flex items-center gap-1.5 px-4 py-2 rounded text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-colors"
              >
                <Save size={13} />
                {notaEditando ? "Salvar Alterações" : "Adicionar Nota"}
              </button>
            </div>
          </div>

          {/* Indicador de progresso */}
          <div className="flex gap-1 mt-3">
            {ABAS.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={cn(
                  "h-1 rounded-full flex-1 transition-all duration-200",
                  abaAtiva === aba.id ? "bg-cyan-500" : "bg-slate-700 hover:bg-slate-600"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Aba 1: Documento ─────────────────────────────────────────────────────── */
function AbaDocumento({ form, set }: AbaProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <SectionTitle>Identificação do Documento</SectionTitle>

      <Field label="Data de Emissão" required tip="Campo 02 · DD/MM/AAAA">
        <Input value={form.dt_emissao} onChange={set("dt_emissao")} placeholder="15/03/2026" mono />
      </Field>

      <Field label="Competência" required tip="Campo 03 · MM/AAAA">
        <Input value={form.dt_competencia} onChange={set("dt_competencia")} placeholder="03/2026" mono />
      </Field>

      <Field label="Nº do Documento Fiscal" required tip="Campo 04 · apenas números">
        <Input value={form.num_nf} onChange={set("num_nf")} placeholder="12345" mono />
      </Field>

      <Field label="Série" tip="Campo 05 · opcional">
        <Input value={form.serie} onChange={set("serie")} placeholder="—" />
      </Field>

      <Field label="Modelo" required tip="Campo 06">
        <Select value={form.modelo} onChange={set("modelo")}>
          {MODELOS.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </Select>
      </Field>

      <SectionTitle>Discriminação dos Serviços</SectionTitle>

      <Field label="Discriminação" tip="Quebras de linha são removidas ao gerar o TXT" className="col-span-full">
        <Textarea
          value={form.discriminacao}
          onChange={set("discriminacao")}
          rows={5}
          placeholder="Descrição detalhada dos serviços prestados..."
        />
      </Field>
    </div>
  );
}

/* ── Aba 2: Prestador ─────────────────────────────────────────────────────── */
function AbaPrestador({ form, set }: AbaProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <SectionTitle>Identificação</SectionTitle>

      <Field label="Tipo Prestador" required tip="Campo 07">
        <Select value={form.tipo_prestador} onChange={set("tipo_prestador")}>
          {TIPO_PRESTADOR.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </Select>
      </Field>

      <Field label="CPF/CNPJ" required tip="Campo 08 · só dígitos; exterior: zeros">
        <Input value={form.cpf_cnpj} onChange={set("cpf_cnpj")} placeholder="00000000000000" mono />
      </Field>

      <Field label="Doc. Identificação (Exterior)" tip="Campo 09 · somente prestador exterior" className="col-span-full">
        <Input value={form.doc_ext} onChange={set("doc_ext")} placeholder="—" />
      </Field>

      <Field label="Nome / Razão Social" required tip="Campo 10" className="col-span-full">
        <Input value={form.nome_prestador} onChange={set("nome_prestador")} placeholder="EMPRESA PRESTADORA LTDA" />
      </Field>

      <Field label="Cód. Município (IBGE)" tip="Campo 11 · 7 dígitos; exterior: 9999999">
        <Input value={form.cod_mun_prest} onChange={set("cod_mun_prest")} placeholder="2507507" mono />
      </Field>

      <div className="grid grid-cols-3 gap-2 col-span-full">
        <Field label="Simples Nacional" tip="Campo 12">
          <Select value={form.simples} onChange={set("simples")}>
            {SN_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="MEI" tip="Campo 13">
          <Select value={form.mei} onChange={set("mei")}>
            {SN_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
        <Field label="Estab. no Município" tip="Campo 14">
          <Select value={form.est_municipio} onChange={set("est_municipio")}>
            {SN_OPCOES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </Select>
        </Field>
      </div>

      <SectionTitle>Endereço</SectionTitle>

      <Field label="CEP" tip="Campo 15 · só dígitos">
        <Input value={form.cep} onChange={set("cep")} placeholder="58000000" mono />
      </Field>

      <Field label="Tipo Logradouro" tip="Campo 16 · ex: Rua, Avenida">
        <Input value={form.tipo_logr} onChange={set("tipo_logr")} placeholder="Rua" />
      </Field>

      <Field label="Nome Logradouro" tip="Campo 17" className="col-span-full">
        <Input value={form.nome_logr} onChange={set("nome_logr")} placeholder="Nome da rua" />
      </Field>

      <Field label="Número" tip="Campo 18">
        <Input value={form.num_logr} onChange={set("num_logr")} placeholder="123" mono />
      </Field>

      <Field label="Complemento" tip="Campo 19 · ex: SALA:2, ANDAR:3">
        <Input value={form.complemento} onChange={set("complemento")} placeholder="SALA 2" />
      </Field>

      <Field label="Bairro" tip="Campo 20" className="col-span-full">
        <Input value={form.bairro} onChange={set("bairro")} placeholder="Centro" />
      </Field>

      <Field label="UF" tip="Campo 21 · ex: PB">
        <Input value={form.uf_prest} onChange={set("uf_prest")} placeholder="PB" maxLength={2} />
      </Field>

      <Field label="País (cód. BACEN)" tip="Campo 22 · somente exterior">
        <Input value={form.pais_prest} onChange={set("pais_prest")} placeholder="—" mono />
      </Field>

      <Field label="Cidade" tip="Campo 23" className="col-span-full">
        <Input value={form.cidade_prest} onChange={set("cidade_prest")} placeholder="João Pessoa" />
      </Field>
    </div>
  );
}

/* ── Aba 3: Serviço / Local ───────────────────────────────────────────────── */
function AbaServico({ form, set }: AbaProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <SectionTitle>Serviço</SectionTitle>

      <Field label="Código do Serviço" required tip="Campo 24 · 5 dígitos">
        <Input value={form.cod_servico} onChange={set("cod_servico")} placeholder="01400" mono />
      </Field>

      <Field label="CNAE (9 dígitos)" tip="Campo 25 · formato 999999999">
        <Input value={form.cnae} onChange={set("cnae")} placeholder="620010000" mono />
      </Field>

      <Field label="Código da Obra" tip="Campo 26 · opcional" className="col-span-full">
        <Input value={form.cod_obra} onChange={set("cod_obra")} placeholder="—" />
      </Field>

      <SectionTitle>Local da Prestação</SectionTitle>

      <Field label="Local da Prestação" tip="Campo 27 · LOC / EXT">
        <Select value={form.local_prest} onChange={set("local_prest")}>
          {LOCAL_PRESTACAO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>

      <Field label="Cód. Município (IBGE)" tip="Campo 28">
        <Input value={form.cod_mun_prest2} onChange={set("cod_mun_prest2")} placeholder="2507507" mono />
      </Field>

      <Field label="UF Prestação" tip="Campo 29 · somente LOC">
        <Input value={form.uf_prest2} onChange={set("uf_prest2")} placeholder="PB" maxLength={2} />
      </Field>

      <Field label="Município Exterior" tip="Campo 30 · somente EXT">
        <Input value={form.mun_ext_prest} onChange={set("mun_ext_prest")} placeholder="—" />
      </Field>

      <Field label="Estado Exterior" tip="Campo 31">
        <Input value={form.est_ext_prest} onChange={set("est_ext_prest")} placeholder="—" />
      </Field>

      <Field label="País (BACEN)" tip="Campo 32 · somente EXT">
        <Input value={form.pais_prest2} onChange={set("pais_prest2")} placeholder="—" mono />
      </Field>

      <SectionTitle>Local do Resultado</SectionTitle>

      <Field label="Local do Resultado" tip="Campo 33 · BRA / EXT">
        <Select value={form.local_result} onChange={set("local_result")}>
          {LOCAL_RESULTADO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>

      <Field label="Cód. Município (IBGE)" tip="Campo 34">
        <Input value={form.cod_mun_res} onChange={set("cod_mun_res")} placeholder="2507507" mono />
      </Field>

      <Field label="UF Resultado" tip="Campo 35">
        <Input value={form.uf_res} onChange={set("uf_res")} placeholder="PB" maxLength={2} />
      </Field>

      <Field label="Município Exterior" tip="Campo 36">
        <Input value={form.mun_ext_res} onChange={set("mun_ext_res")} placeholder="—" />
      </Field>

      <Field label="Estado Exterior" tip="Campo 37">
        <Input value={form.est_ext_res} onChange={set("est_ext_res")} placeholder="—" />
      </Field>

      <Field label="País (BACEN)" tip="Campo 38">
        <Input value={form.pais_res} onChange={set("pais_res")} placeholder="—" mono />
      </Field>

      <Field label="Motivo Não Retenção" tip="Campo 39 · somente se Campo 41 = RNF" className="col-span-full">
        <Select value={form.motivo_nret} onChange={set("motivo_nret")}>
          {MOTIVO_NAO_RETENCAO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>
    </div>
  );
}

/* ── Aba 4: Valores / ISS ─────────────────────────────────────────────────── */
function AbaValores({ form, set }: AbaProps) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
      <SectionTitle>ISS e Recolhimento</SectionTitle>

      <Field label="Exigibilidade ISS" tip="Campo 40" className="col-span-full">
        <Select value={form.exigibilidade} onChange={set("exigibilidade")}>
          {EXIGIBILIDADE.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>

      <Field label="Tipo Recolhimento" tip="Campo 41 · RPP / RNF / NAP">
        <Select value={form.recolhimento} onChange={set("recolhimento")}>
          {RECOLHIMENTO.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
      </Field>

      <Field label="Alíquota ISS (%)" tip="Campo 42 · ex: 5.00">
        <Input value={form.aliquota} onChange={set("aliquota")} placeholder="5.00" mono />
      </Field>

      <SectionTitle>Valores Monetários</SectionTitle>

      <Field label="Valor dos Serviços" required tip="Campo 43 · ex: 1500.00">
        <Input value={form.vl_servico} onChange={set("vl_servico")} placeholder="0.00" mono />
      </Field>

      <Field label="Valor das Deduções" tip="Campo 44">
        <Input value={form.vl_deducao} onChange={set("vl_deducao")} placeholder="0.00" mono />
      </Field>

      <Field label="Desconto Incondicionado" tip="Campo 45">
        <Input value={form.desc_incond} onChange={set("desc_incond")} placeholder="0.00" mono />
      </Field>

      <Field label="Desconto Condicionado" tip="Campo 46">
        <Input value={form.desc_cond} onChange={set("desc_cond")} placeholder="0.00" mono />
      </Field>

      <Field label="Base de Cálculo" tip="Campo 47 · VlServiços − Deduções − Desc. Incond.">
        <Input value={form.base_calculo} onChange={set("base_calculo")} placeholder="0.00" mono />
      </Field>

      <SectionTitle>Retenções Federais</SectionTitle>

      <Field label="Valor PIS" tip="Campo 48">
        <Input value={form.vl_pis} onChange={set("vl_pis")} placeholder="0.00" mono />
      </Field>

      <Field label="Valor COFINS" tip="Campo 49">
        <Input value={form.vl_cofins} onChange={set("vl_cofins")} placeholder="0.00" mono />
      </Field>

      <Field label="Valor INSS" tip="Campo 50">
        <Input value={form.vl_inss} onChange={set("vl_inss")} placeholder="0.00" mono />
      </Field>

      <Field label="Valor IR" tip="Campo 51">
        <Input value={form.vl_ir} onChange={set("vl_ir")} placeholder="0.00" mono />
      </Field>

      <Field label="Valor CSLL" tip="Campo 52">
        <Input value={form.vl_csll} onChange={set("vl_csll")} placeholder="0.00" mono />
      </Field>

      <Field label="Outras Retenções" tip="Campo 53">
        <Input value={form.outras_ret} onChange={set("outras_ret")} placeholder="0.00" mono />
      </Field>

      <Field label="Valor do ISS" tip="Campo 54 · Base de Cálculo × Alíquota">
        <Input value={form.vl_iss} onChange={set("vl_iss")} placeholder="0.00" mono />
      </Field>
    </div>
  );
}

interface AbaProps {
  form: NotaFiscal;
  set: (key: keyof NotaFiscal) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}
