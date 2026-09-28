type Treino = {
  id: number;
  nome: string;
  grupoMuscular: string;
};

export let treinos: Treino[] = [];

export function salvarTreinoTemporario(
  nome: string,
  grupoMuscular: string
) {
  const novoTreino = {
    id: Date.now(),
    nome: nome,
    grupoMuscular: grupoMuscular,
  };

  treinos.push(novoTreino);
}

export function excluirTreinoTemporario(id: number) {
  const indice = treinos.findIndex(
    (treino) => treino.id === id
  );

  if (indice !== -1) {
    treinos.splice(indice, 1);
  }
}

export function editarTreinoTemporario(
  id: number,
  nome: string,
  grupoMuscular: string
) {
  const treino = treinos.find(
    (treino) => treino.id === id
  );

  if (treino) {
    treino.nome = nome;
    treino.grupoMuscular = grupoMuscular;
  }
}