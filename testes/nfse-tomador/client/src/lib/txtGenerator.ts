/**
 * NFS-e Serviços Tomados — Gerador de TXT Posicional
 * Layout: Prefeitura de João Pessoa
 *
 * Regras mantidas exatamente como no programa Python original.
 */

export interface NotaFiscal {
  dt_emissao: string;
  dt_competencia: string;
  num_nf: string;
  serie: string;
  modelo: string;
  tipo_prestador: string;
  cpf_cnpj: string;
  doc_ext: string;
  nome_prestador: string;
  cod_mun_prest: string;
  simples: string;
  mei: string;
  est_municipio: string;
  cep: string;
  tipo_logr: string;
  nome_logr: string;
  num_logr: string;
  complemento: string;
  bairro: string;
  uf_prest: string;
  pais_prest: string;
  cidade_prest: string;
  cod_servico: string;
  cnae: string;
  cod_obra: string;
  local_prest: string;
  cod_mun_prest2: string;
  uf_prest2: string;
  mun_ext_prest: string;
  est_ext_prest: string;
  pais_prest2: string;
  local_result: string;
  cod_mun_res: string;
  uf_res: string;
  mun_ext_res: string;
  est_ext_res: string;
  pais_res: string;
  motivo_nret: string;
  exigibilidade: string;
  recolhimento: string;
  aliquota: string;
  vl_servico: string;
  vl_deducao: string;
  desc_incond: string;
  desc_cond: string;
  base_calculo: string;
  vl_pis: string;
  vl_cofins: string;
  vl_inss: string;
  vl_ir: string;
  vl_csll: string;
  outras_ret: string;
  vl_iss: string;
  discriminacao: string;
}

/** Alinha à esquerda e trunca/preenche com espaços */
function fmtStr(v: string | undefined | null, size: number): string {
  return String(v ?? "").padEnd(size).slice(0, size);
}

/** Formata valor monetário: "1234.56" → "1234.56         " (15 chars) */
function fmtVal(v: string | undefined | null, size: number): string {
  let s = String(v ?? "0").trim().replace(",", ".");
  if (!s.includes(".")) {
    s = s.padStart(3, "0");
    s = s.slice(0, -2) + "." + s.slice(-2);
  }
  const parts = s.split(".");
  const cents = (parts[1] + "00").slice(0, 2);
  return ((parts[0] || "0") + "." + cents).padEnd(size).slice(0, size);
}

/** Formata alíquota: "5" → "05.00" */
function fmtAliq(v: string | undefined | null, size = 5): string {
  let s = String(v ?? "0").trim().replace(",", ".");
  if (!s.includes(".")) s = s + ".00";
  const parts = s.split(".");
  return (parts[0].padStart(2, "0") + "." + (parts[1] + "00").slice(0, 2))
    .padEnd(size)
    .slice(0, size);
}

/** Gera a linha de cabeçalho H */
export function buildHeader(inscricao: string): string {
  return "H" + fmtStr(inscricao, 30);
}

/** Gera uma linha de registro T */
export function buildRegistro(d: NotaFiscal): string {
  let r = "T";
  r += fmtStr(d.dt_emissao, 10);
  r += fmtStr(d.dt_competencia, 7);
  r += fmtStr(d.num_nf, 15);
  r += fmtStr(d.serie, 5);
  r += fmtStr(d.modelo, 2);
  r += String(d.tipo_prestador ?? "1")[0];
  r += fmtStr(d.cpf_cnpj, 14);
  r += fmtStr(d.doc_ext, 20);
  r += fmtStr(d.nome_prestador, 150);
  r += fmtStr(d.cod_mun_prest, 7);
  r += (d.simples || "N")[0];
  r += (d.mei || "N")[0];
  r += (d.est_municipio || "N")[0];
  r += fmtStr(d.cep, 8);
  r += fmtStr(d.tipo_logr, 25);
  r += fmtStr(d.nome_logr, 50);
  r += fmtStr(d.num_logr, 10);
  r += fmtStr(d.complemento, 60);
  r += fmtStr(d.bairro, 60);
  r += fmtStr(d.uf_prest, 2);
  r += fmtStr(d.pais_prest, 4);
  r += fmtStr(d.cidade_prest, 50);
  r += fmtStr(d.cod_servico, 5);
  r += fmtStr(d.cnae, 9);
  r += fmtStr(d.cod_obra, 15);
  r += fmtStr(d.local_prest, 3);
  r += fmtStr(d.cod_mun_prest2, 7);
  r += fmtStr(d.uf_prest2, 2);
  r += fmtStr(d.mun_ext_prest, 50);
  r += fmtStr(d.est_ext_prest, 50);
  r += fmtStr(d.pais_prest2, 4);
  r += fmtStr(d.local_result, 3);
  r += fmtStr(d.cod_mun_res, 7);
  r += fmtStr(d.uf_res, 2);
  r += fmtStr(d.mun_ext_res, 50);
  r += fmtStr(d.est_ext_res, 50);
  r += fmtStr(d.pais_res, 4);
  r += fmtStr(d.motivo_nret, 1);
  r += String(d.exigibilidade ?? "1")[0];
  r += fmtStr(d.recolhimento, 3);
  r += fmtAliq(d.aliquota, 5);
  r += fmtVal(d.vl_servico, 15);
  r += fmtVal(d.vl_deducao, 15);
  r += fmtVal(d.desc_incond, 15);
  r += fmtVal(d.desc_cond, 15);
  r += fmtVal(d.base_calculo, 15);
  r += fmtVal(d.vl_pis, 15);
  r += fmtVal(d.vl_cofins, 15);
  r += fmtVal(d.vl_inss, 15);
  r += fmtVal(d.vl_ir, 15);
  r += fmtVal(d.vl_csll, 15);
  r += fmtVal(d.outras_ret, 15);
  r += fmtVal(d.vl_iss, 15);

  // Discriminação: remove quebras de linha, colapsa espaços
  let disc = d.discriminacao ?? "";
  disc = disc.split("\n").join(" ");
  disc = disc.replace(/\s+/g, " ").trim();
  r += fmtStr(disc, 2000);

  return r;
}

/** Gera o conteúdo completo do arquivo TXT (sem o último \r\n) */
export function gerarTxt(inscricao: string, notas: NotaFiscal[]): string {
  const linhas = [buildHeader(inscricao)];
  for (const nota of notas) {
    linhas.push(buildRegistro(nota));
  }
  return linhas.join("\r\n");
}

/** Gera múltiplos arquivos TXT, um por nota (para exportação em lote) */
export function gerarTxtPorNota(inscricao: string, notas: NotaFiscal[]): Array<{ nome: string; conteudo: string }> {
  return notas.map((nota, idx) => ({
    nome: `IMPORTA_${String(idx + 1).padStart(3, "0")}.TXT`,
    conteudo: gerarTxt(inscricao, [nota]),
  }));
}

/** Faz download do arquivo TXT no browser */
export function downloadTxt(conteudo: string, nomeArquivo = "IMPORTA.TXT"): void {
  const blob = new Blob([conteudo], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Faz download de múltiplos arquivos TXT em lote com delay entre downloads */
export async function downloadTxtLote(arquivos: Array<{ nome: string; conteudo: string }>): Promise<void> {
  for (const arquivo of arquivos) {
    downloadTxt(arquivo.conteudo, arquivo.nome);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
}
