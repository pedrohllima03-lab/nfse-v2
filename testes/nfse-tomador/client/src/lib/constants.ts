/**
 * Constantes do domínio NFS-e — Prefeitura de João Pessoa
 */

export const MODELOS = [
  "RD", "A", "E", "A1", "A1 F", "BB", "CE", "G", "AV", "RP", "OT", "R", "OM",
];

export const EXIGIBILIDADE = [
  { value: "1", label: "1 — Exigível" },
  { value: "2", label: "2 — Não incidência" },
  { value: "3", label: "3 — Isenção" },
  { value: "4", label: "4 — Exportação" },
  { value: "5", label: "5 — Imunidade" },
  { value: "6", label: "6 — Susp. Dec. Judicial" },
  { value: "7", label: "7 — Susp. Proc. Adm." },
];

export const RECOLHIMENTO = [
  { value: "RPP", label: "RPP — Pelo Prestador" },
  { value: "RNF", label: "RNF — Pelo Tomador (Retenção)" },
  { value: "NAP", label: "NAP — Não Aplicável" },
];

export const MOTIVO_NAO_RETENCAO = [
  { value: "", label: "— Não aplicável —" },
  { value: "A", label: "A — Microempresa Municipal" },
  { value: "B", label: "B — Estimativa" },
  { value: "C", label: "C — Sociedade de Profissionais" },
  { value: "D", label: "D — Cooperativa" },
  { value: "E", label: "E — Microempresário Individual" },
  { value: "F", label: "F — Microempresa ou Empresa de Pequeno Porte" },
  { value: "G", label: "G — Serviço Diversificado" },
  { value: "H", label: "H — Serviço de Comunicação" },
  { value: "I", label: "I — Serviço de Transporte" },
  { value: "J", label: "J — Simples Nacional" },
  { value: "V", label: "V — Outros" },
];

export const TIPO_PRESTADOR = [
  { value: "1", label: "1 — Nacional" },
  { value: "2", label: "2 — Exterior" },
];

export const LOCAL_PRESTACAO = [
  { value: "LOC", label: "LOC — Local" },
  { value: "EXT", label: "EXT — Exterior" },
];

export const LOCAL_RESULTADO = [
  { value: "BRA", label: "BRA — Brasil" },
  { value: "EXT", label: "EXT — Exterior" },
];

export const SN_OPCOES = [
  { value: "S", label: "S — Sim" },
  { value: "N", label: "N — Não" },
];

/** Campos obrigatórios para validação */
export const CAMPOS_OBRIGATORIOS: Array<{ key: string; label: string }> = [
  { key: "num_nf", label: "Nº do Documento Fiscal" },
  { key: "dt_emissao", label: "Data de Emissão" },
  { key: "dt_competencia", label: "Competência" },
  { key: "modelo", label: "Modelo do Documento" },
  { key: "cpf_cnpj", label: "CPF/CNPJ do Prestador" },
  { key: "nome_prestador", label: "Nome / Razão Social" },
  { key: "cod_servico", label: "Código do Serviço" },
  { key: "vl_servico", label: "Valor dos Serviços" },
];

/** Nota em branco para novo formulário */
export function notaEmBranco() {
  return {
    dt_emissao: "",
    dt_competencia: "",
    num_nf: "",
    serie: "",
    modelo: "OM",
    tipo_prestador: "1",
    cpf_cnpj: "",
    doc_ext: "",
    nome_prestador: "",
    cod_mun_prest: "",
    simples: "N",
    mei: "N",
    est_municipio: "N",
    cep: "",
    tipo_logr: "Rua",
    nome_logr: "",
    num_logr: "",
    complemento: "",
    bairro: "",
    uf_prest: "",
    pais_prest: "",
    cidade_prest: "",
    cod_servico: "",
    cnae: "",
    cod_obra: "",
    local_prest: "LOC",
    cod_mun_prest2: "",
    uf_prest2: "",
    mun_ext_prest: "",
    est_ext_prest: "",
    pais_prest2: "",
    local_result: "BRA",
    cod_mun_res: "",
    uf_res: "PB",
    mun_ext_res: "",
    est_ext_res: "",
    pais_res: "",
    motivo_nret: "",
    exigibilidade: "1",
    recolhimento: "RPP",
    aliquota: "5.00",
    vl_servico: "",
    vl_deducao: "0",
    desc_incond: "0",
    desc_cond: "0",
    base_calculo: "",
    vl_pis: "0",
    vl_cofins: "0",
    vl_inss: "0",
    vl_ir: "0",
    vl_csll: "0",
    outras_ret: "0",
    vl_iss: "",
    discriminacao: "",
  };
}
