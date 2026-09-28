import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import CardTreino from '../components/CardTreino';
import { buscarTreinos, excluirTreino, type Treino } from '../database/banco';
import type { RootStackParamList } from '../navigation/types';

type NavegacaoProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function HomeScreen() {
  const navigation = useNavigation<NavegacaoProps>();
  const [treinos, setTreinos] = useState<Treino[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregarTreinos = useCallback(async () => {
    try {
      setErro(null);
      const dados = await buscarTreinos();
      setTreinos(dados);
    } catch (error) {
      console.error('Não foi possível carregar os treinos:', error);
      setErro('Não foi possível carregar seus treinos.');
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      carregarTreinos();
    }, [carregarTreinos])
  );

  function confirmarExclusao(treino: Treino) {
    Alert.alert(
      'Excluir treino',
      `Tem certeza que deseja excluir “${treino.nome}” e todo o histórico dele?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirTreino(treino.id);
              await carregarTreinos();
            } catch (error) {
              console.error('Não foi possível excluir o treino:', error);
              Alert.alert('Erro', 'Não foi possível excluir o treino.');
            }
          },
        },
      ]
    );
  }

  return (
    <View style={estilos.tela}>
      <FlatList
        contentContainerStyle={estilos.conteudo}
        data={treinos}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View>
            <Text style={estilos.titulo}>Meus treinos</Text>
            <Text style={estilos.subtitulo}>
              Registre sua evolução sem perder o histórico.
            </Text>
            <Pressable
              style={({ pressed }) => [estilos.botaoCriar, pressed && estilos.botaoPressionado]}
              onPress={() => navigation.navigate('NovoTreino')}
            >
              <Text style={estilos.textoBotaoCriar}>+ Criar treino</Text>
            </Pressable>
            <Text style={estilos.rotuloLista}>Treinos salvos</Text>
          </View>
        }
        renderItem={({ item }) => (
          <CardTreino
            nome={item.nome}
            grupoMuscular={item.grupoMuscular}
            onPress={() => navigation.navigate('Exercicios', { treinoId: item.id })}
            onEditar={() => navigation.navigate('EditarTreino', { treinoId: item.id })}
            onExcluir={() => confirmarExclusao(item)}
          />
        )}
        ListEmptyComponent={
          carregando ? (
            <ActivityIndicator color="#D32F2F" style={estilos.carregando} />
          ) : erro ? (
            <View style={estilos.estadoVazio}>
              <Text style={estilos.erro}>{erro}</Text>
              <Pressable onPress={carregarTreinos}>
                <Text style={estilos.link}>Tentar novamente</Text>
              </Pressable>
            </View>
          ) : (
            <View style={estilos.estadoVazio}>
              <Text style={estilos.iconeVazio}>＋</Text>
              <Text style={estilos.tituloVazio}>Nenhum treino ainda</Text>
              <Text style={estilos.textoVazio}>
                Crie seu primeiro treino e cadastre os exercícios que fazem parte dele.
              </Text>
            </View>
          )
        }
        refreshing={carregando && treinos.length > 0}
        onRefresh={carregarTreinos}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  conteudo: {
    padding: 20,
    paddingBottom: 32,
    flexGrow: 1,
  },
  titulo: {
    color: '#202124',
    fontSize: 30,
    fontWeight: '800',
  },
  subtitulo: {
    color: '#667085',
    fontSize: 16,
    lineHeight: 23,
    marginTop: 6,
  },
  botaoCriar: {
    alignSelf: 'flex-start',
    marginTop: 22,
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#D32F2F',
  },
  textoBotaoCriar: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  rotuloLista: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.4,
    marginTop: 28,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  botaoPressionado: {
    opacity: 0.74,
    transform: [{ scale: 0.98 }],
  },
  carregando: {
    marginTop: 30,
  },
  estadoVazio: {
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 42,
  },
  iconeVazio: {
    alignItems: 'center',
    backgroundColor: '#FEE4E2',
    borderRadius: 30,
    color: '#D32F2F',
    fontSize: 32,
    height: 60,
    lineHeight: 54,
    textAlign: 'center',
    width: 60,
  },
  tituloVazio: {
    color: '#202124',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  textoVazio: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
    textAlign: 'center',
  },
  erro: {
    color: '#B42318',
    fontSize: 15,
    textAlign: 'center',
  },
  link: {
    color: '#D32F2F',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 12,
  },
});
