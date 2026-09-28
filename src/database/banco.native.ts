import * as SQLite from 'expo-sqlite';

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

type RegistroComNome = RegistroTreino & {
  exercicioNome: string;
};

let bancoPromise: ReturnType<typeof SQLite.openDatabaseAsync> | null = null;
let tabelasPromise: Promise<void> | null = null;

export function abrirBanco() {
  if (!bancoPromise) {
    bancoPromise = SQLite.openDatabaseAsync('treinos.db');
  }

  return bancoPromise;
}

export function criarTabelas() {
  if (!tabelasPromise) {
    tabelasPromise = (async () => {
      const db = await abrirBanco();

      await db.execAsync(`
        PRAGMA foreign_keys = ON;

        CREATE TABLE IF NOT EXISTS treinos (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL,
          grupoMuscular TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS exercicios (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          treino_id INTEGER NOT NULL,
          nome TEXT NOT NULL,
          FOREIGN KEY (treino_id) REFERENCES treinos(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS registros_treino (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          exercicio_id INTEGER NOT NULL,
          data TEXT NOT NULL,
          carga REAL NOT NULL,
          repeticoes INTEGER NOT NULL,
          FOREIGN KEY (exercicio_id) REFERENCES exercicios(id) ON DELETE CASCADE
        );
      `);
    })().catch((error) => {
      tabelasPromise = null;
      throw error;
    });
  }

  return tabelasPromise;
}

async function bancoPronto() {
  await criarTabelas();
  return abrirBanco();
}

export async function salvarTreino(nome: string, grupoMuscular: string) {
  const db = await bancoPronto();
  const resultado = await db.runAsync(
    'INSERT INTO treinos (nome, grupoMuscular) VALUES (?, ?)',
    nome.trim(),
    grupoMuscular.trim()
  );

  return Number(resultado.lastInsertRowId);
}

export async function buscarTreinos(): Promise<Treino[]> {
  const db = await bancoPronto();

  return db.getAllAsync<Treino>(
    'SELECT id, nome, grupoMuscular FROM treinos ORDER BY id DESC'
  );
}

export async function buscarTreino(id: number): Promise<Treino | null> {
  const db = await bancoPronto();

  const treino = await db.getFirstAsync<Treino>(
    'SELECT id, nome, grupoMuscular FROM treinos WHERE id = ?',
    id
  );

  return treino ?? null;
}

export async function editarTreino(
  id: number,
  nome: string,
  grupoMuscular: string
) {
  const db = await bancoPronto();

  await db.runAsync(
    'UPDATE treinos SET nome = ?, grupoMuscular = ? WHERE id = ?',
    nome.trim(),
    grupoMuscular.trim(),
    id
  );
}

export async function excluirTreino(id: number) {
  const db = await bancoPronto();

  // Mantém a remoção compatível com bancos antigos que foram criados sem
  // as constraints de chave estrangeira da versão atual.
  await db.runAsync(
    'DELETE FROM registros_treino WHERE exercicio_id IN (SELECT id FROM exercicios WHERE treino_id = ?)',
    id
  );
  await db.runAsync('DELETE FROM exercicios WHERE treino_id = ?', id);
  await db.runAsync('DELETE FROM treinos WHERE id = ?', id);
}

export async function salvarExercicio(treinoId: number, nome: string) {
  const db = await bancoPronto();
  const resultado = await db.runAsync(
    'INSERT INTO exercicios (treino_id, nome) VALUES (?, ?)',
    treinoId,
    nome.trim()
  );

  return Number(resultado.lastInsertRowId);
}

export async function buscarExerciciosComHistorico(
  treinoId: number
): Promise<ExercicioComHistorico[]> {
  const db = await bancoPronto();

  const exercicios = await db.getAllAsync<Exercicio>(
    'SELECT id, treino_id, nome FROM exercicios WHERE treino_id = ? ORDER BY id ASC',
    treinoId
  );

  if (exercicios.length === 0) {
    return [];
  }

  // A comparação usa o nome normalizado para também encontrar registros do
  // mesmo exercício quando ele foi cadastrado em outro treino.
  const registros = await db.getAllAsync<RegistroComNome>(
    `
      SELECT
        r.id,
        r.exercicio_id,
        r.data,
        r.carga,
        r.repeticoes,
        e.nome AS exercicioNome
      FROM registros_treino r
      INNER JOIN exercicios e ON e.id = r.exercicio_id
      WHERE LOWER(TRIM(e.nome)) IN (
        SELECT LOWER(TRIM(nome)) FROM exercicios WHERE treino_id = ?
      )
      ORDER BY r.data DESC, r.id DESC
    `,
    treinoId
  );

  const historicoPorNome = new Map<string, RegistroTreino[]>();

  for (const registro of registros) {
    const chave = normalizarNome(registro.exercicioNome);
    const historico = historicoPorNome.get(chave) ?? [];
    historico.push({
      id: registro.id,
      exercicio_id: registro.exercicio_id,
      data: registro.data,
      carga: Number(registro.carga),
      repeticoes: Number(registro.repeticoes),
    });
    historicoPorNome.set(chave, historico);
  }

  return exercicios.map((exercicio) => ({
    ...exercicio,
    historico: historicoPorNome.get(normalizarNome(exercicio.nome)) ?? [],
  }));
}

export async function excluirExercicio(id: number) {
  const db = await bancoPronto();

  await db.runAsync(
    'DELETE FROM registros_treino WHERE exercicio_id = ?',
    id
  );
  await db.runAsync('DELETE FROM exercicios WHERE id = ?', id);
}

export async function salvarRegistro(
  exercicioId: number,
  carga: number,
  repeticoes: number
) {
  const db = await bancoPronto();
  const resultado = await db.runAsync(
    `
      INSERT INTO registros_treino (exercicio_id, data, carga, repeticoes)
      VALUES (?, ?, ?, ?)
    `,
    exercicioId,
    new Date().toISOString(),
    carga,
    repeticoes
  );

  return Number(resultado.lastInsertRowId);
}

function normalizarNome(nome: string) {
  return nome.trim().toLocaleLowerCase();
}
