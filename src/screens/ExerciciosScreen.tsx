import {useEffect, useState  } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { buscarExercicios} from '../database/banco';



type RootStackParamList = {
  Home: undefined;
  Exercicios: {
    nome: string;
    grupoMuscular: string;
  };
};

type ExerciciosRouteProp = RouteProp<
  RootStackParamList,
  'Exercicios'
>;



export default function ExerciciosScreen() {
  const route = useRoute<ExerciciosRouteProp>();
  const { nome, grupoMuscular } = route.params;
  const [exercicios, setExercicios] = useState<any[]>([]);

useEffect(() => {
  async function carregarExercicios() {
    const dados = await buscarExercicios(1);

    setExercicios(dados);
  }

  carregarExercicios();
}, []);

  return (
    <View style={estilos.tela}>

      <Text style={estilos.titulo}>{nome}</Text>

      <Text style={estilos.subtitulo}>{grupoMuscular}</Text>

      <FlatList
        data={exercicios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={estilos.card}>
            <Text style={estilos.nomeExercicio}>
              {item.nome}
            </Text>

            <Text>
              Última carga: 0 kg
            </Text>
          </View>
        )}
      />

    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    padding: 20,
  },

  titulo: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  subtitulo: {
    fontSize: 18,
    marginTop: 5,
    marginBottom: 20,
  },

  card: {
    padding: 20,
    marginBottom: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  nomeExercicio: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});