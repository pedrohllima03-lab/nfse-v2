/**
 * NFS-e — Parser XML padrão SPED Nacional
 * Namespace: http://www.sped.fazenda.gov.br/nfse
 *
 * Portado do Python original, mantendo toda a lógica de extração.
 */

import type { NotaFiscal } from "./txtGenerator";

const NS = "http://www.sped.fazenda.gov.br/nfse";

function findEl(el: Element | null, tag: string): Element | null {
  if (!el) return null;
  // Com namespace
  let found = el.querySelector(`*|${tag}`);
  if (found) return found;
  // Sem namespace (fallback)
  found = el.querySelector(tag);
  return found;
}

function getText(el: Element | null, tag: string, def = ""): string {
  if (!el) return def;
  const child = findEl(el, tag);
  return child?.textContent?.trim() ?? def;
}

function getTextNS(el: Element | null, path: string, def = ""): string {
  if (!el) return def;
  const parts = path.split("/");
  let cur: Element | null = el;
  for (const part of parts) {
    if (!cur) return def;
    // Tenta com namespace
    cur =
      cur.getElementsByTagNameNS(NS, part)[0] ??
      cur.getElementsByTagName(part)[0] ??
      null;
  }
  return cur?.textContent?.trim() ?? def;
}

function fmtData(iso: string): string {
  const d = iso.slice(0, 10);
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function fmtCompetencia(iso: string): string {
  const d = iso.slice(0, 10);
  const [y, m] = d.split("-");
  return `${m}/${y}`;
}

function simples(op: string): [string, string] {
  if (op === "1") return ["S", "N"];
  if (op === "6") return ["N", "S"];
  return ["N", "N"];
}

function exigibilidade(trib: string): string {
  const map: Record<string, string> = {
    "1": "1", "2": "2", "3": "3", "4": "4",
    "5": "5", "6": "6", "7": "7",
  };
  return map[trib] ?? "1";
}

function recolhimento(tpRet: string): string {
  const map: Record<string, string> = { "1": "RPP", "2": "RNF" };
  return map[tpRet] ?? "NAP";
}

export interface ParseResult {
  dados: NotaFiscal;
  avisos: string[];
}

export interface VerifResult {
  nome: string;
  tipo: string;
  numNf: string;
  dados: NotaFiscal | null;
  avisos: string[];
  erro: string;
}

/** Detecta o tipo de namespace do XML */
export function detectarTipo(xmlText: string): string {
  const header = xmlText.slice(0, 1024);
  if (header.includes('xmlns:ns2="http://www.w3.org/2000/09/xmldsig#"')) {
    return "ns2 (João Pessoa / SPED+Assinatura)";
  }
  if (header.includes(`xmlns="${NS}"`) || header.includes(`xmlns='${NS}'`)) {
    return "SPED Nacional (sem ns2)";
  }
  return "Outro / Desconhecido";
}

/** Extrai o número da NF do XML (aceita Document ou cria um novo) */
export function extrairNumNf(doc: Document): string {
  // Caminho 1: nNFSe em infNFSe
  const infNFSe =
    doc.getElementsByTagNameNS(NS, "infNFSe")[0] ??
    doc.getElementsByTagName("infNFSe")[0];
  if (infNFSe) {
    const nNFSe =
      infNFSe.getElementsByTagNameNS(NS, "nNFSe")[0] ??
      infNFSe.getElementsByTagName("nNFSe")[0];
    if (nNFSe?.textContent?.trim()) return nNFSe.textContent.trim();
  }

  // Caminho 2: nDPS em infDPS
  const infDPS =
    doc.getElementsByTagNameNS(NS, "infDPS")[0] ??
    doc.getElementsByTagName("infDPS")[0];
  if (infDPS) {
    const nDPS =
      infDPS.getElementsByTagNameNS(NS, "nDPS")[0] ??
      infDPS.getElementsByTagName("nDPS")[0];
    if (nDPS?.textContent?.trim()) return nDPS.textContent.trim();
  }

  // Caminho 3: busca global
  for (const tag of ["nNFSe", "nDPS"]) {
    const els = doc.getElementsByTagNameNS(NS, tag);
    for (let i = 0; i < els.length; i++) {
      if (els[i].textContent?.trim()) return els[i].textContent!.trim();
    }
    const els2 = doc.getElementsByTagName(tag);
    for (let i = 0; i < els2.length; i++) {
      if (els2[i].textContent?.trim()) return els2[i].textContent!.trim();
    }
  }
  return "";
}

/** Importa os dados de uma NFS-e XML */
export function importarXml(xmlText: string, fileName: string): ParseResult {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const parseErr = doc.querySelector("parsererror");
  if (parseErr) throw new Error("XML inválido: " + parseErr.textContent);

  const root = doc.documentElement;
  const rootTag = root.localName;
  if (rootTag !== "NFSe") {
    throw new Error("Arquivo não parece ser uma NFS-e padrão SPED (tag raiz: " + rootTag + ").");
  }

  const inf = root.getElementsByTagNameNS(NS, "infNFSe")[0] ?? null;
  const dpsEl = inf?.getElementsByTagNameNS(NS, "DPS")[0] ?? null;
  const dps = dpsEl?.getElementsByTagNameNS(NS, "infDPS")[0] ?? null;
  const emit = inf?.getElementsByTagNameNS(NS, "emit")[0] ?? null;
  const serv = dps?.getElementsByTagNameNS(NS, "serv")[0] ?? null;
  const vals = dps?.getElementsByTagNameNS(NS, "valores")[0] ?? null;
  const trib = vals?.getElementsByTagNameNS(NS, "trib")[0] ?? null;
  const tribM = trib?.getElementsByTagNameNS(NS, "tribMun")[0] ?? null;
  const tribF = trib?.getElementsByTagNameNS(NS, "tribFed")[0] ?? null;
  const enderNac = emit?.getElementsByTagNameNS(NS, "enderNac")[0] ?? null;

  const ex = (el: Element | null, path: string, def = "") =>
    el ? getTextNS(el, path, def) : def;

  const dhEmi = ex(dps, "dhEmi") || ex(inf, "dhProc");
  const dCompet = ex(dps, "dCompet");
  const cnpjEmit = ex(emit, "CNPJ");
  const opSimp = ex(dps, "prest/regTrib/opSimpNac");
  const [simplesVal, meiVal] = simples(opSimp);
  const codMunEmit = ex(enderNac, "cMun");
  const codServ = ex(serv, "cServ/cTribMun");
  const cnaeRaw = ex(serv, "cServ/cTribNac", "");
  const cnae = cnaeRaw.replace(/\./g, "").padEnd(9, "0").slice(0, 9);
  const descServ = ex(serv, "cServ/xDescServ");
  const codLocP = ex(serv, "locPrest/cLocPrestacao");
  const tribISSQN = ex(tribM, "tribISSQN", "1");
  const tpRetISSQN = ex(tribM, "tpRetISSQN", "1");
  const aliqRaw = ex(inf, "valores/pAliqAplic", "0");
  const vlServ = ex(vals, "vServPrest/vServ", "0");
  const vlIss = ex(inf, "valores/vISSQN", "0");
  const vlInss = tribF ? ex(tribF, "vRetCP", "0") : "0";
  const ufPrest2 = ex(enderNac, "UF");

  const numNf = ex(inf, "nNFSe") || ex(dps, "nDPS");

  const dados: NotaFiscal = {
    dt_emissao: dhEmi ? fmtData(dhEmi) : "",
    dt_competencia: dCompet ? fmtCompetencia(dCompet) : "",
    num_nf: numNf,
    serie: ex(dps, "serie", ""),
    modelo: "OM",
    tipo_prestador: "1-Nacional",
    cpf_cnpj: cnpjEmit,
    doc_ext: "",
    nome_prestador: ex(emit, "xNome"),
    cod_mun_prest: codMunEmit,
    simples: simplesVal,
    mei: meiVal,
    est_municipio: "N",
    cep: ex(enderNac, "CEP"),
    tipo_logr: "Rua",
    nome_logr: ex(enderNac, "xLgr"),
    num_logr: ex(enderNac, "nro"),
    complemento: "",
    bairro: ex(enderNac, "xBairro"),
    uf_prest: ex(enderNac, "UF"),
    pais_prest: "",
    cidade_prest: ex(inf, "xLocEmi"),
    cod_servico: codServ.padStart(5, "0").slice(0, 5),
    cnae,
    cod_obra: "",
    local_prest: "LOC",
    cod_mun_prest2: codLocP,
    uf_prest2: ufPrest2,
    mun_ext_prest: "",
    est_ext_prest: "",
    pais_prest2: "",
    local_result: "BRA",
    cod_mun_res: codLocP,
    uf_res: "PB",
    mun_ext_res: "",
    est_ext_res: "",
    pais_res: "",
    motivo_nret: "",
    exigibilidade: exigibilidade(tribISSQN),
    recolhimento: recolhimento(tpRetISSQN),
    aliquota: aliqRaw,
    vl_servico: vlServ,
    vl_deducao: "0",
    desc_incond: "0",
    desc_cond: "0",
    base_calculo: vlServ,
    vl_pis: "0",
    vl_cofins: "0",
    vl_inss: vlInss,
    vl_ir: "0",
    vl_csll: "0",
    outras_ret: "0",
    vl_iss: vlIss,
    discriminacao: descServ,
  };

  const avisos: string[] = [];
  if (!dados.cod_servico || dados.cod_servico === "00000") {
    avisos.push("Código do serviço (cTribMun) não encontrado — preencha manualmente.");
  }
  if (!dados.cnae || dados.cnae === "000000000") {
    avisos.push("CNAE (cTribNac) não mapeado — verifique o campo 25.");
  }

  return { dados, avisos };
}

/** Lê um arquivo como texto */
export function lerArquivo(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = () => reject(new Error("Erro ao ler o arquivo."));
    reader.readAsText(file, "utf-8");
  });
}
