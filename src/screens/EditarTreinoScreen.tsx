import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import { buscarTreino, editarTreino } from '../database/banco';
import type { RootStackParamList } from '../navigation/types';

type EditarRouteProp = RouteProp<RootStackParamList, 'EditarTreino'>;
type NavegacaoProps = NativeStackNavigationProp<RootStackParamList, 'EditarTreino'>;

export default function EditarTreinoScreen() {
  const route = useRoute<EditarRouteProp>();
  const navigation = useNavigation<NavegacaoProps>();
  const { treinoId } = route.params;

  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const carregarTreino = useCallback(async () => {
    try {
      const treino = await buscarTreino(treinoId);

      if (!treino) {
        Alert.alert('Treino não encontrado', 'Volte para a lista e tente novamente.');
        navigation.goBack();
        return;
      }

      setNome(treino.nome);
      setGrupoMuscular(treino.grupoMuscular);
    } catch (error) {
      console.error('Não foi possível carregar o treino:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados do treino.');
    } finally {
      setCarregando(false);
    }
  }, [navigation, treinoId]);

  useFocusEffect(
    useCallback(() => {
      carregarTreino();
    }, [carregarTreino])
  );

  async function salvarAlteracoes() {
    const nomeLimpo = nome.trim();
    const grupoLimpo = grupoMuscular.trim();

    if (!nomeLimpo || !grupoLimpo) {
      Alert.alert(
        'Preencha os dados',
        'Informe o nome do treino e o grupo muscular.'
      );
      return;
    }

    try {
      setSalvando(true);
      await editarTreino(treinoId, nomeLimpo, grupoLimpo);
      navigation.goBack();
    } catch (error) {
      console.error('Não foi possível editar o treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações.');
      setSalvando(false);
    }
  }

  if (carregando) {
    return (
      <View style={estilos.estadoCarregando}>
        <ActivityIndicator color="#D32F2F" size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={estilos.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={estilos.conteudo}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={estilos.titulo}>Atualize seu treino</Text>
        <Text style={estilos.descricao}>
          Os exercícios e o histórico de cargas permanecem salvos.
        </Text>

        <View style={estilos.card}>
          <Text style={estilos.label}>Nome do treino</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex.: Treino A"
            placeholderTextColor="#98A2B3"
            value={nome}
            onChangeText={setNome}
            maxLength={60}
            autoCapitalize="sentences"
          />

          <Text style={estilos.label}>Grupo muscular</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex.: Peito e tríceps"
            placeholderTextColor="#98A2B3"
            value={grupoMuscular}
            onChangeText={setGrupoMuscular}
            maxLength={80}
            autoCapitalize="sentences"
          />

          <Pressable
            style={({ pressed }) => [
              estilos.botao,
              (pressed || salvando) && estilos.botaoPressionado,
            ]}
            onPress={salvarAlteracoes}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilos.textoBotao}>Salvar alterações</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    backgroundColor: '#F7F8FA',
    flex: 1,
  },
  conteudo: {
    padding: 20,
    paddingBottom: 36,
  },
  titulo: {
    color: '#202124',
    fontSize: 28,
    fontWeight: '800',
  },
  descricao: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 24,
    padding: 20,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  label: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
    borderRadius: 10,
    borderWidth: 1,
    color: '#202124',
    fontSize: 16,
    marginBottom: 20,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  botao: {
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    justifyContent: 'center',
    minHeight: 48,
    paddingHorizontal: 14,
  },
  textoBotao: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  botaoPressionado: {
    opacity: 0.7,
  },
  estadoCarregando: {
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    flex: 1,
    justifyContent: 'center',
  },
});
