import { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { salvarTreino } from '../database/banco';
import type { RootStackParamList } from '../navigation/types';

type NavegacaoProps = NativeStackNavigationProp<RootStackParamList, 'NovoTreino'>;

export default function NovoTreinoScreen() {
  const navigation = useNavigation<NavegacaoProps>();
  const [nome, setNome] = useState('');
  const [grupoMuscular, setGrupoMuscular] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
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
      const treinoId = await salvarTreino(nomeLimpo, grupoLimpo);

      // O treino já nasce com sua tela de exercícios aberta para o cadastro
      // imediato dos movimentos que fazem parte dele.
      navigation.replace('Exercicios', { treinoId });
    } catch (error) {
      console.error('Não foi possível salvar o treino:', error);
      Alert.alert('Erro', 'Não foi possível salvar o treino.');
      setSalvando(false);
    }
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
        <Text style={estilos.titulo}>Monte seu treino</Text>
        <Text style={estilos.descricao}>
          Depois de salvar, você poderá adicionar os exercícios e registrar cada sessão.
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
            onPress={salvar}
            disabled={salvando}
          >
            {salvando ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilos.textoBotao}>Salvar e cadastrar exercícios</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const estilos = StyleSheet.create({
  tela: {
    flex: 1,
    backgroundColor: '#F7F8FA',
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
    minHeight: 48,
    justifyContent: 'center',
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
});
