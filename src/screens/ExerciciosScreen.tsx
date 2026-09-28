import { useCallback, useEffect, useState } from 'react';
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
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';

import {
  buscarExerciciosComHistorico,
  buscarTreino,
  excluirExercicio,
  salvarExercicio,
  salvarRegistro,
  type ExercicioComHistorico,
  type RegistroTreino,
  type Treino,
} from '../database/banco';
import type { RootStackParamList } from '../navigation/types';

type ExerciciosRouteProp = RouteProp<RootStackParamList, 'Exercicios'>;
type NavegacaoProps = NativeStackNavigationProp<RootStackParamList, 'Exercicios'>;

export default function ExerciciosScreen() {
  const route = useRoute<ExerciciosRouteProp>();
  const navigation = useNavigation<NavegacaoProps>();
  const { treinoId } = route.params;

  const [treino, setTreino] = useState<Treino | null>(null);
  const [exercicios, setExercicios] = useState<ExercicioComHistorico[]>([]);
  const [novoExercicio, setNovoExercicio] = useState('');
  const [carga, setCarga] = useState('');
  const [repeticoes, setRepeticoes] = useState('');
  const [exercicioAbertoId, setExercicioAbertoId] = useState<number | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [salvandoExercicio, setSalvandoExercicio] = useState(false);
  const [salvandoRegistroId, setSalvandoRegistroId] = useState<number | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  const carregarDados = useCallback(async () => {
    try {
      setErro(null);
      const [treinoEncontrado, exerciciosEncontrados] = await Promise.all([
        buscarTreino(treinoId),
        buscarExerciciosComHistorico(treinoId),
      ]);

      setTreino(treinoEncontrado);
      setExercicios(exerciciosEncontrados);

      if (!treinoEncontrado) {
        setErro('Este treino não foi encontrado.');
      }
    } catch (error) {
      console.error('Não foi possível carregar o treino:', error);
      setErro('Não foi possível carregar os exercícios.');
    } finally {
      setCarregando(false);
    }
  }, [treinoId]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [carregarDados])
  );

  useEffect(() => {
    if (treino) {
      navigation.setOptions({ title: treino.nome });
    }
  }, [navigation, treino]);

  async function adicionarExercicio() {
    const nome = novoExercicio.trim();

    if (!nome) {
      Alert.alert('Informe o exercício', 'Digite o nome do exercício para adicionar.');
      return;
    }

    try {
      setSalvandoExercicio(true);
      const exercicioId = await salvarExercicio(treinoId, nome);
      setNovoExercicio('');
      setExercicioAbertoId(exercicioId);
      await carregarDados();
    } catch (error) {
      console.error('Não foi possível adicionar o exercício:', error);
      Alert.alert('Erro', 'Não foi possível adicionar o exercício.');
    } finally {
      setSalvandoExercicio(false);
    }
  }

  async function registrarTreino(exercicio: ExercicioComHistorico) {
    const cargaNumerica = Number(carga.replace(',', '.'));
    const repeticoesNumericas = Number.parseInt(repeticoes, 10);

    if (!Number.isFinite(cargaNumerica) || cargaNumerica < 0) {
      Alert.alert('Carga inválida', 'Digite uma carga igual ou maior que zero.');
      return;
    }

    if (!Number.isInteger(repeticoesNumericas) || repeticoesNumericas <= 0) {
      Alert.alert('Repetições inválidas', 'Digite um número inteiro maior que zero.');
      return;
    }

    try {
      setSalvandoRegistroId(exercicio.id);
      await salvarRegistro(exercicio.id, cargaNumerica, repeticoesNumericas);
      setCarga('');
      setRepeticoes('');
      await carregarDados();
    } catch (error) {
      console.error('Não foi possível registrar a série:', error);
      Alert.alert('Erro', 'Não foi possível salvar este registro.');
    } finally {
      setSalvandoRegistroId(null);
    }
  }

  function confirmarExclusao(exercicio: ExercicioComHistorico) {
    Alert.alert(
      'Excluir exercício',
      `Excluir “${exercicio.nome}” e os registros dele?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await excluirExercicio(exercicio.id);
              if (exercicioAbertoId === exercicio.id) {
                setExercicioAbertoId(null);
              }
              await carregarDados();
            } catch (error) {
              console.error('Não foi possível excluir o exercício:', error);
              Alert.alert('Erro', 'Não foi possível excluir o exercício.');
            }
          },
        },
      ]
    );
  }

  if (carregando && !treino) {
    return (
      <View style={estilos.estadoCarregando}>
        <ActivityIndicator color="#D32F2F" size="large" />
        <Text style={estilos.textoCarregando}>Carregando treino...</Text>
      </View>
    );
  }

  if (!treino) {
    return (
      <View style={estilos.estadoCarregando}>
        <Text style={estilos.tituloErro}>{erro ?? 'Treino não encontrado.'}</Text>
        <Pressable style={estilos.botaoVoltar} onPress={() => navigation.goBack()}>
          <Text style={estilos.textoBotaoPrincipal}>Voltar</Text>
        </Pressable>
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
        <View style={estilos.cabecalho}>
          <Text style={estilos.titulo}>{treino.nome}</Text>
          <Text style={estilos.subtitulo}>{treino.grupoMuscular}</Text>
          <Text style={estilos.instrucao}>
            Adicione os exercícios e registre carga e repetições a cada sessão.
          </Text>
        </View>

        <View style={estilos.cardAdicionar}>
          <Text style={estilos.rotuloSecao}>Cadastrar exercício</Text>
          <TextInput
            style={estilos.input}
            placeholder="Ex.: Supino reto"
            placeholderTextColor="#98A2B3"
            value={novoExercicio}
            onChangeText={setNovoExercicio}
            maxLength={70}
            autoCapitalize="sentences"
            returnKeyType="done"
            onSubmitEditing={adicionarExercicio}
          />
          <Pressable
            style={({ pressed }) => [
              estilos.botaoAdicionar,
              (pressed || salvandoExercicio) && estilos.botaoPressionado,
            ]}
            onPress={adicionarExercicio}
            disabled={salvandoExercicio}
          >
            {salvandoExercicio ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={estilos.textoBotaoPrincipal}>+ Adicionar exercício</Text>
            )}
          </Pressable>
        </View>

        {erro ? <Text style={estilos.erro}>{erro}</Text> : null}

        <View style={estilos.linhaTituloLista}>
          <Text style={estilos.rotuloSecao}>Exercícios do treino</Text>
          <Text style={estilos.contador}>{exercicios.length}</Text>
        </View>

        {exercicios.length === 0 ? (
          <View style={estilos.estadoVazio}>
            <Text style={estilos.iconeVazio}>＋</Text>
            <Text style={estilos.tituloVazio}>Nenhum exercício cadastrado</Text>
            <Text style={estilos.textoVazio}>
              Use o campo acima para montar este treino.
            </Text>
          </View>
        ) : (
          exercicios.map((exercicio) => {
            const ultimo = exercicio.historico[0];
            const anterior = exercicio.historico[1];
            const aberto = exercicioAbertoId === exercicio.id;

            return (
              <View key={exercicio.id} style={estilos.cardExercicio}>
                <View style={estilos.topoExercicio}>
                  <View style={estilos.nomeContainer}>
                    <Text style={estilos.nomeExercicio}>{exercicio.nome}</Text>
                    <Text style={estilos.quantidadeRegistros}>
                      {exercicio.historico.length === 0
                        ? 'Sem registros ainda'
                        : `${exercicio.historico.length} registro${exercicio.historico.length === 1 ? '' : 's'}`}
                    </Text>
                  </View>
                  <Pressable onPress={() => confirmarExclusao(exercicio)}>
                    <Text style={estilos.excluir}>Excluir</Text>
                  </Pressable>
                </View>

                <View style={estilos.comparacao}>
                  <View style={estilos.colunaComparacao}>
                    <Text style={estilos.rotuloComparacao}>Último registro</Text>
                    <Text style={estilos.valorComparacao}>
                      {ultimo ? `${formatarNumero(ultimo.carga)} kg × ${ultimo.repeticoes}` : '—'}
                    </Text>
                    {ultimo ? <Text style={estilos.data}>{formatarData(ultimo.data)}</Text> : null}
                  </View>
                  <View style={estilos.divisor} />
                  <View style={estilos.colunaComparacao}>
                    <Text style={estilos.rotuloComparacao}>Registro anterior</Text>
                    <Text style={estilos.valorComparacao}>
                      {anterior ? `${formatarNumero(anterior.carga)} kg × ${anterior.repeticoes}` : '—'}
                    </Text>
                    {anterior ? <Text style={estilos.data}>{formatarData(anterior.data)}</Text> : null}
                  </View>
                </View>

                {ultimo && anterior ? (
                  <Text style={estilos[classeVariacao(ultimo, anterior)]}>
                    Variação: {formatarVariacao(ultimo.carga - anterior.carga, ' kg')} e{' '}
                    {formatarVariacao(ultimo.repeticoes - anterior.repeticoes, ' rep.')}
                  </Text>
                ) : (
                  <Text style={estilos.avisoHistorico}>
                    {ultimo
                      ? 'Registre novamente para comparar com esta sessão.'
                      : 'O primeiro registro aparecerá aqui.'}
                  </Text>
                )}

                {exercicio.historico.length > 0 ? (
                  <View style={estilos.historico}>
                    <Text style={estilos.rotuloHistorico}>Histórico recente</Text>
                    {exercicio.historico.slice(0, 4).map((registro) => (
                      <View key={registro.id} style={estilos.linhaHistorico}>
                        <Text style={estilos.dataHistorico}>{formatarData(registro.data)}</Text>
                        <Text style={estilos.valorHistorico}>
                          {formatarNumero(registro.carga)} kg × {registro.repeticoes} reps
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                <Pressable
                  style={({ pressed }) => [
                    estilos.botaoRegistrar,
                    aberto && estilos.botaoRegistrarAberto,
                    pressed && estilos.botaoPressionado,
                  ]}
                  onPress={() => setExercicioAbertoId(aberto ? null : exercicio.id)}
                >
                  <Text style={aberto ? estilos.textoBotaoRegistrarAberto : estilos.textoBotaoRegistrar}>
                    {aberto ? 'Fechar registro' : '+ Registrar carga e reps'}
                  </Text>
                </Pressable>

                {aberto ? (
                  <View style={estilos.formularioRegistro}>
                    <View style={estilos.campoRegistro}>
                      <Text style={estilos.label}>Carga (kg)</Text>
                      <TextInput
                        style={estilos.inputRegistro}
                        placeholder="0"
                        placeholderTextColor="#98A2B3"
                        keyboardType="decimal-pad"
                        value={carga}
                        onChangeText={setCarga}
                      />
                    </View>
                    <View style={estilos.campoRegistro}>
                      <Text style={estilos.label}>Reps</Text>
                      <TextInput
                        style={estilos.inputRegistro}
                        placeholder="10"
                        placeholderTextColor="#98A2B3"
                        keyboardType="number-pad"
                        value={repeticoes}
                        onChangeText={setRepeticoes}
                      />
                    </View>
                    <Pressable
                      style={({ pressed }) => [
                        estilos.botaoSalvarRegistro,
                        (pressed || salvandoRegistroId === exercicio.id) && estilos.botaoPressionado,
                      ]}
                      onPress={() => registrarTreino(exercicio)}
                      disabled={salvandoRegistroId === exercicio.id}
                    >
                      {salvandoRegistroId === exercicio.id ? (
                        <ActivityIndicator color="#FFFFFF" />
                      ) : (
                        <Text style={estilos.textoBotaoPrincipal}>Salvar</Text>
                      )}
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function formatarNumero(numero: number) {
  return numero.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
}

function formatarData(data: string) {
  const dataConvertida = new Date(data);

  if (Number.isNaN(dataConvertida.getTime())) {
    return 'Data desconhecida';
  }

  return dataConvertida.toLocaleDateString('pt-BR');
}

function formatarVariacao(valor: number, unidade: string) {
  const sinal = valor > 0 ? '+' : '';
  return `${sinal}${formatarNumero(valor)}${unidade}`;
}

function classeVariacao(
  ultimo: RegistroTreino,
  anterior: RegistroTreino
): 'variacaoPositiva' | 'variacaoNegativa' | 'variacaoNeutra' {
  const cargaSubiu = ultimo.carga >= anterior.carga;
  const repsSubiram = ultimo.repeticoes >= anterior.repeticoes;
  const cargaCaiu = ultimo.carga <= anterior.carga;
  const repsCairam = ultimo.repeticoes <= anterior.repeticoes;

  if (cargaSubiu && repsSubiram && (ultimo.carga > anterior.carga || ultimo.repeticoes > anterior.repeticoes)) {
    return 'variacaoPositiva';
  }

  if (cargaCaiu && repsCairam && (ultimo.carga < anterior.carga || ultimo.repeticoes < anterior.repeticoes)) {
    return 'variacaoNegativa';
  }

  return 'variacaoNeutra';
}

const estilos = StyleSheet.create({
  tela: {
    backgroundColor: '#F7F8FA',
    flex: 1,
  },
  conteudo: {
    padding: 20,
    paddingBottom: 42,
  },
  cabecalho: {
    marginBottom: 20,
  },
  titulo: {
    color: '#202124',
    fontSize: 28,
    fontWeight: '800',
  },
  subtitulo: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  instrucao: {
    color: '#667085',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 10,
  },
  cardAdicionar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    padding: 18,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  rotuloSecao: {
    color: '#344054',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
    borderRadius: 10,
    borderWidth: 1,
    color: '#202124',
    fontSize: 16,
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
  },
  botaoAdicionar: {
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    justifyContent: 'center',
    marginTop: 12,
    minHeight: 46,
    paddingHorizontal: 14,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
  },
  linhaTituloLista: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  contador: {
    backgroundColor: '#FEE4E2',
    borderRadius: 12,
    color: '#B42318',
    fontSize: 12,
    fontWeight: '800',
    minWidth: 24,
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 3,
    textAlign: 'center',
  },
  cardExercicio: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 14,
    padding: 18,
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 2,
  },
  topoExercicio: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nomeContainer: {
    flex: 1,
    paddingRight: 12,
  },
  nomeExercicio: {
    color: '#202124',
    fontSize: 19,
    fontWeight: '800',
  },
  quantidadeRegistros: {
    color: '#98A2B3',
    fontSize: 13,
    marginTop: 4,
  },
  excluir: {
    color: '#B42318',
    fontSize: 13,
    fontWeight: '700',
    paddingVertical: 3,
  },
  comparacao: {
    alignItems: 'stretch',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    flexDirection: 'row',
    marginTop: 16,
    padding: 13,
  },
  colunaComparacao: {
    flex: 1,
  },
  divisor: {
    backgroundColor: '#E4E7EC',
    marginHorizontal: 12,
    width: 1,
  },
  rotuloComparacao: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
  },
  valorComparacao: {
    color: '#202124',
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
  },
  data: {
    color: '#98A2B3',
    fontSize: 12,
    marginTop: 3,
  },
  variacaoPositiva: {
    color: '#039855',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },
  variacaoNegativa: {
    color: '#D92D20',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },
  variacaoNeutra: {
    color: '#667085',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 12,
  },
  avisoHistorico: {
    color: '#667085',
    fontSize: 13,
    marginTop: 12,
  },
  historico: {
    borderTopColor: '#EAECF0',
    borderTopWidth: 1,
    marginTop: 14,
    paddingTop: 13,
  },
  rotuloHistorico: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  linhaHistorico: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dataHistorico: {
    color: '#98A2B3',
    fontSize: 13,
  },
  valorHistorico: {
    color: '#344054',
    fontSize: 13,
    fontWeight: '700',
  },
  botaoRegistrar: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D32F2F',
    borderRadius: 10,
    borderWidth: 1,
    marginTop: 16,
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  botaoRegistrarAberto: {
    backgroundColor: '#FEF3F2',
  },
  textoBotaoRegistrar: {
    color: '#D32F2F',
    fontWeight: '800',
    textAlign: 'center',
  },
  textoBotaoRegistrarAberto: {
    color: '#B42318',
    fontWeight: '800',
    textAlign: 'center',
  },
  formularioRegistro: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  campoRegistro: {
    flex: 1,
  },
  label: {
    color: '#667085',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 5,
  },
  inputRegistro: {
    backgroundColor: '#F9FAFB',
    borderColor: '#D0D5DD',
    borderRadius: 9,
    borderWidth: 1,
    color: '#202124',
    fontSize: 16,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  botaoSalvarRegistro: {
    alignItems: 'center',
    backgroundColor: '#D32F2F',
    borderRadius: 9,
    justifyContent: 'center',
    minHeight: 44,
    paddingHorizontal: 16,
  },
  botaoPressionado: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  estadoVazio: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 34,
  },
  iconeVazio: {
    alignItems: 'center',
    backgroundColor: '#FEE4E2',
    borderRadius: 26,
    color: '#D32F2F',
    fontSize: 28,
    height: 52,
    lineHeight: 47,
    textAlign: 'center',
    width: 52,
  },
  tituloVazio: {
    color: '#202124',
    fontSize: 17,
    fontWeight: '800',
    marginTop: 14,
  },
  textoVazio: {
    color: '#667085',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 6,
    textAlign: 'center',
  },
  estadoCarregando: {
    alignItems: 'center',
    backgroundColor: '#F7F8FA',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  textoCarregando: {
    color: '#667085',
    fontSize: 15,
    marginTop: 12,
  },
  tituloErro: {
    color: '#B42318',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  erro: {
    color: '#B42318',
    fontSize: 14,
    marginBottom: 12,
  },
  botaoVoltar: {
    backgroundColor: '#D32F2F',
    borderRadius: 10,
    marginTop: 18,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
});
