import { View, Text, Pressable, StyleSheet } from 'react-native';

type Props = {
  nome: string;
  grupoMuscular: string;
  onPress: () => void;
  onExcluir: () => void;
  onEditar: () => void;
};

export default function CardTreino({
  nome,
  grupoMuscular,
  onPress,
  onExcluir,
  onEditar,
}: Props) {
  return (
    <View style={estilos.card}>
      <Text style={estilos.titulo}>{nome}</Text>
      <Text style={estilos.grupoMuscular}>{grupoMuscular}</Text>

      <Pressable
        style={({ pressed }) => [estilos.botaoPrincipal, pressed && estilos.botaoPressionado]}
        onPress={onPress}
      >
        <Text style={estilos.textoBotaoPrincipal}>Abrir treino</Text>
      </Pressable>

      <View style={estilos.linhaAcoes}>
        <Pressable
          style={({ pressed }) => [estilos.botaoEditar, pressed && estilos.botaoPressionado]}
          onPress={onEditar}
        >
          <Text style={estilos.textoBotaoEditar}>Editar</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [estilos.botaoExcluir, pressed && estilos.botaoPressionado]}
          onPress={onExcluir}
        >
          <Text style={estilos.textoBotaoExcluir}>Excluir</Text>
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  card: {
    padding: 20,
    marginBottom: 14,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#172033',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2,
  },
  titulo: {
    color: '#202124',
    fontSize: 20,
    fontWeight: '800',
  },
  grupoMuscular: {
    color: '#667085',
    fontSize: 15,
    marginTop: 5,
  },
  botaoPrincipal: {
    marginTop: 18,
    paddingVertical: 13,
    borderRadius: 10,
    backgroundColor: '#D32F2F',
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '800',
  },
  linhaAcoes: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  botaoEditar: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F2F4F7',
  },
  textoBotaoEditar: {
    color: '#344054',
    textAlign: 'center',
    fontWeight: '700',
  },
  botaoExcluir: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#FEF3F2',
  },
  textoBotaoExcluir: {
    color: '#B42318',
    textAlign: 'center',
    fontWeight: '700',
  },
  botaoPressionado: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
