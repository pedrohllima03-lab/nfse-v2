/**
 * AppContext — Estado global da aplicação NFS-e
 * Gerencia: lista de notas, inscrição municipal, seleção, drawer
 */

import React, { createContext, useContext, useState, useCallback } from "react";
import type { NotaFiscal } from "@/lib/txtGenerator";
import { notaEmBranco } from "@/lib/constants";

export interface NotaComId extends NotaFiscal {
  _id: string;
  _selecionada: boolean;
}

interface AppState {
  inscricao: string;
  setInscricao: (v: string) => void;

  notas: NotaComId[];
  adicionarNota: (d: NotaFiscal) => void;
  atualizarNota: (id: string, d: NotaFiscal) => void;
  removerNota: (id: string) => void;
  removerSelecionadas: () => void;
  toggleSelecionada: (id: string) => void;
  toggleTodasSelecionadas: () => void;
  todasSelecionadas: boolean;

  // Drawer de formulário
  drawerAberto: boolean;
  notaEditando: NotaComId | null;
  abrirNovaNotaDrawer: () => void;
  abrirEditarNotaDrawer: (nota: NotaComId) => void;
  fecharDrawer: () => void;

  // Aba ativa
  abaAtiva: string;
  setAbaAtiva: (v: string) => void;

  // Registros de verificação
  verifRegistros: VerifRegistro[];
  setVerifRegistros: (v: VerifRegistro[]) => void;
}

export interface VerifRegistro {
  id: string;
  nome: string;
  tipo: string;
  numNf: string;
  dados: NotaFiscal | null;
  avisos: string[];
  erro: string;
  selecionada: boolean;
  importada: boolean; // Marca se já foi importada para evitar duplicação
}

const AppContext = createContext<AppState | null>(null);

let _counter = 0;
function newId() {
  return `nota_${++_counter}_${Date.now()}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [inscricao, setInscricao] = useState("");
  const [notas, setNotas] = useState<NotaComId[]>([]);
  const [drawerAberto, setDrawerAberto] = useState(false);
  const [notaEditando, setNotaEditando] = useState<NotaComId | null>(null);
  const [abaAtiva, setAbaAtiva] = useState("notas");
  const [verifRegistros, setVerifRegistros] = useState<VerifRegistro[]>([]);

  const adicionarNota = useCallback((d: NotaFiscal) => {
    setNotas((prev) => [
      ...prev,
      { ...d, _id: newId(), _selecionada: true },
    ]);
  }, []);

  const atualizarNota = useCallback((id: string, d: NotaFiscal) => {
    setNotas((prev) =>
      prev.map((n) => (n._id === id ? { ...d, _id: id, _selecionada: n._selecionada } : n))
    );
  }, []);

  const removerNota = useCallback((id: string) => {
    setNotas((prev) => prev.filter((n) => n._id !== id));
  }, []);

  const removerSelecionadas = useCallback(() => {
    setNotas((prev) => prev.filter((n) => !n._selecionada));
  }, []);

  const toggleSelecionada = useCallback((id: string) => {
    setNotas((prev) =>
      prev.map((n) => (n._id === id ? { ...n, _selecionada: !n._selecionada } : n))
    );
  }, []);

  const todasSelecionadas = notas.length > 0 && notas.every((n) => n._selecionada);

  const toggleTodasSelecionadas = useCallback(() => {
    const todas = notas.every((n) => n._selecionada);
    setNotas((prev) => prev.map((n) => ({ ...n, _selecionada: !todas })));
  }, [notas]);

  const abrirNovaNotaDrawer = useCallback(() => {
    setNotaEditando(null);
    setDrawerAberto(true);
  }, []);

  const abrirEditarNotaDrawer = useCallback((nota: NotaComId) => {
    setNotaEditando(nota);
    setDrawerAberto(true);
  }, []);

  const fecharDrawer = useCallback(() => {
    setDrawerAberto(false);
    setNotaEditando(null);
  }, []);

  return (
    <AppContext.Provider
      value={{
        inscricao,
        setInscricao,
        notas,
        adicionarNota,
        atualizarNota,
        removerNota,
        removerSelecionadas,
        toggleSelecionada,
        toggleTodasSelecionadas,
        todasSelecionadas,
        drawerAberto,
        notaEditando,
        abrirNovaNotaDrawer,
        abrirEditarNotaDrawer,
        fecharDrawer,
        abaAtiva,
        setAbaAtiva,
        verifRegistros,
        setVerifRegistros,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
