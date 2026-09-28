import * as SQLite from 'expo-sqlite';

export async function abrirBanco() {
  const db = await SQLite.openDatabaseAsync('treinos.db');

  return db;
}

export async function criarTabelas() {
  const db = await abrirBanco();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS exercicios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      treino_id INTEGER NOT NULL,
      nome TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS registros_treino (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercicio_id INTEGER NOT NULL,
      data TEXT NOT NULL,
      carga REAL NOT NULL,
      repeticoes INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS treinos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT NOT NULL,
  grupoMuscular TEXT NOT NULL
);
  `);
}

export async function salvarExercicio(
  treinoId: number,
  nome: string
) {
  const db = await abrirBanco();

  await db.runAsync(
    'INSERT INTO exercicios (treino_id, nome) VALUES (?, ?)',
    treinoId,
    nome
  );
}

export async function buscarExercicios(treinoId: number) {
  const db = await abrirBanco();

  const exercicios = await db.getAllAsync(
    'SELECT * FROM exercicios WHERE treino_id = ?',
    treinoId
  );

  return exercicios;
}

export async function salvarTreino(
  nome: string,
  grupoMuscular: string
) {
  alert('Entrou no salvarTreino');

  const db = await abrirBanco();

  alert('Banco aberto');

  await db.runAsync(
    'INSERT INTO treinos (nome, grupoMuscular) VALUES (?, ?)',
    nome,
    grupoMuscular
  );

  alert('Treino inserido');
}

export async function buscarTreinos() {
  const db = await abrirBanco();

  const treinos = await db.getAllAsync(
    'SELECT * FROM treinos'
  );

  return treinos;
}

export async function editarTreino(
  id: number,
  nome: string,
  grupoMuscular: string
) {
  const db = await abrirBanco();

  await db.runAsync(
    'UPDATE treinos SET nome = ?, grupoMuscular = ? WHERE id = ?',
    nome,
    grupoMuscular,
    id
  );
}

export async function excluirTreino(id: number) {
  const db = await abrirBanco();

  await db.runAsync(
    'DELETE FROM treinos WHERE id = ?',
    id
  );
}