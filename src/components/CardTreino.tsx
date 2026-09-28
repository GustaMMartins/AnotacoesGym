import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  nome: string;
  grupoMuscular: string;
  onPress?: () => void;
  onExcluir: () => void;
  onEditar?: () => void;
};

export default function CardTreino({ nome, grupoMuscular, onPress, onExcluir, onEditar }: Props) {
  return (
    <View style={estilos.card}>
      <Text style={estilos.titulo}>{nome}</Text>

      <Text style={estilos.grupoMuscular}>
        {grupoMuscular}
      </Text>

      <Pressable
  style={estilos.botao}
  onPress={onPress}>
        <Text style={estilos.textoBotao}>Começar</Text>
      </Pressable>

      <Pressable
  style={estilos.botaoExcluir}
  onPress={onExcluir}>
        <Text style={estilos.textoBotaoExcluir}>Excluir</Text>
      </Pressable>

      <Pressable
  style={estilos.botaoEditar}
  onPress={onEditar}>
        <Text style={estilos.textoBotaoEditar}>Editar</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    padding: 20,
    marginTop: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },

  titulo: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  grupoMuscular: {
    fontSize: 16,
    marginTop: 5,
  },

  botao: {
    marginTop: 15,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#D32F2F',
  },

  textoBotao: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  botaoExcluir: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F44336',
  },

  textoBotaoExcluir: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },

  botaoEditar: {
    marginTop: 10,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2196F3',
  },

  textoBotaoEditar: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});