export type Treino = {
  id: number;
  nome: string;
  grupoMuscular: string;
};

export type Exercicio = {
  id: number;
  treino_id: number;
  nome: string;
};

export type RegistroTreino = {
  id: number;
  exercicio_id: number;
  data: string;
  carga: number;
  repeticoes: number;
};

export type ExercicioComHistorico = Exercicio & {
  historico: RegistroTreino[];
};

type EstadoWeb = {
  treinos: Treino[];
  exercicios: Exercicio[];
  registros: RegistroTreino[];
};

const CHAVE_STORAGE = 'anotacoesgym.dados.v1';
let estado: EstadoWeb | null = null;

/**
 * No navegador não abrimos o expo-sqlite: o WASM do SQLite não é necessário
 * para esta experiência. O localStorage mantém os dados entre recarregamentos
 * e deixa a aplicação funcionando no Expo Web.
 */
export async function abrirBanco() {
  carregarEstado();
}

export async function criarTabelas() {
  carregarEstado();
}

function carregarEstado() {
  if (estado) {
    return estado;
  }

  const storage = obterStorage();

  if (!storage) {
    estado = estadoInicial();
    return estado;
  }

  try {
    const salvo = storage.getItem(CHAVE_STORAGE);
    estado = salvo ? normalizarEstado(JSON.parse(salvo) as Partial<EstadoWeb>) : estadoInicial();
  } catch (error) {
    console.warn('Não foi possível ler os dados locais do navegador:', error);
    estado = estadoInicial();
  }

  return estado;
}

function obterStorage(): Storage | null {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  try {
    return globalThis.localStorage;
  } catch {
    return null;
  }
}

function persistirEstado() {
  const storage = obterStorage();

  if (!storage || !estado) {
    return;
  }

  try {
    storage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
  } catch (error) {
    console.warn('Não foi possível salvar os dados locais do navegador:', error);
  }
}

function estadoInicial(): EstadoWeb {
  return {
    treinos: [],
    exercicios: [],
    registros: [],
  };
}

function normalizarEstado(salvo: Partial<EstadoWeb>): EstadoWeb {
  return {
    treinos: Array.isArray(salvo.treinos) ? salvo.treinos : [],
    exercicios: Array.isArray(salvo.exercicios) ? salvo.exercicios : [],
    registros: Array.isArray(salvo.registros) ? salvo.registros : [],
  };
}

function proximoId() {
  const dados = carregarEstado();
  const ids = [
    ...dados.treinos.map((item) => item.id),
    ...dados.exercicios.map((item) => item.id),
    ...dados.registros.map((item) => item.id),
  ];
  const maiorId = ids.length > 0 ? Math.max(...ids) : 0;

  return Math.max(Date.now(), maiorId + 1);
}

export async function salvarTreino(nome: string, grupoMuscular: string) {
  const dados = carregarEstado();
  const novoTreino: Treino = {
    id: proximoId(),
    nome: nome.trim(),
    grupoMuscular: grupoMuscular.trim(),
  };

  dados.treinos.push(novoTreino);
  persistirEstado();
  return novoTreino.id;
}

export async function buscarTreinos(): Promise<Treino[]> {
  return [...carregarEstado().treinos].sort((a, b) => b.id - a.id);
}

export async function buscarTreino(id: number): Promise<Treino | null> {
  return carregarEstado().treinos.find((treino) => treino.id === id) ?? null;
}

export async function editarTreino(
  id: number,
  nome: string,
  grupoMuscular: string
) {
  const dados = carregarEstado();
  const treino = dados.treinos.find((item) => item.id === id);

  if (treino) {
    treino.nome = nome.trim();
    treino.grupoMuscular = grupoMuscular.trim();
    persistirEstado();
  }
}

export async function excluirTreino(id: number) {
  const dados = carregarEstado();
  const exercicioIds = new Set(
    dados.exercicios
      .filter((exercicio) => exercicio.treino_id === id)
      .map((exercicio) => exercicio.id)
  );

  dados.registros = dados.registros.filter(
    (registro) => !exercicioIds.has(registro.exercicio_id)
  );
  dados.exercicios = dados.exercicios.filter(
    (exercicio) => exercicio.treino_id !== id
  );
  dados.treinos = dados.treinos.filter((treino) => treino.id !== id);
  persistirEstado();
}

export async function salvarExercicio(treinoId: number, nome: string) {
  const dados = carregarEstado();
  const novoExercicio: Exercicio = {
    id: proximoId(),
    treino_id: treinoId,
    nome: nome.trim(),
  };

  dados.exercicios.push(novoExercicio);
  persistirEstado();
  return novoExercicio.id;
}

export async function buscarExerciciosComHistorico(
  treinoId: number
): Promise<ExercicioComHistorico[]> {
  const dados = carregarEstado();
  const exercicios = dados.exercicios
    .filter((exercicio) => exercicio.treino_id === treinoId)
    .sort((a, b) => a.id - b.id);

  const nomesDoTreino = new Set(
    exercicios.map((exercicio) => normalizarNome(exercicio.nome))
  );
  const historicoPorNome = new Map<string, RegistroTreino[]>();

  for (const registro of dados.registros) {
    const exercicioRelacionado = dados.exercicios.find(
      (exercicio) => exercicio.id === registro.exercicio_id
    );

    if (!exercicioRelacionado || !nomesDoTreino.has(normalizarNome(exercicioRelacionado.nome))) {
      continue;
    }

    const chave = normalizarNome(exercicioRelacionado.nome);
    const historico = historicoPorNome.get(chave) ?? [];
    historico.push({
      ...registro,
      carga: Number(registro.carga),
      repeticoes: Number(registro.repeticoes),
    });
    historicoPorNome.set(chave, historico);
  }

  for (const historico of historicoPorNome.values()) {
    historico.sort((a, b) => compararDatas(b.data, a.data) || b.id - a.id);
  }

  return exercicios.map((exercicio) => ({
    ...exercicio,
    historico: historicoPorNome.get(normalizarNome(exercicio.nome)) ?? [],
  }));
}

export async function excluirExercicio(id: number) {
  const dados = carregarEstado();
  dados.registros = dados.registros.filter(
    (registro) => registro.exercicio_id !== id
  );
  dados.exercicios = dados.exercicios.filter((exercicio) => exercicio.id !== id);
  persistirEstado();
}

export async function salvarRegistro(
  exercicioId: number,
  carga: number,
  repeticoes: number
) {
  const dados = carregarEstado();
  const registro: RegistroTreino = {
    id: proximoId(),
    exercicio_id: exercicioId,
    data: new Date().toISOString(),
    carga,
    repeticoes,
  };

  dados.registros.push(registro);
  persistirEstado();
  return registro.id;
}

function normalizarNome(nome: string) {
  return nome.trim().toLocaleLowerCase();
}

function compararDatas(a: string, b: string) {
  const primeira = new Date(a).getTime();
  const segunda = new Date(b).getTime();

  if (Number.isNaN(primeira) || Number.isNaN(segunda)) {
    return 0;
  }

  return primeira - segunda;
}
