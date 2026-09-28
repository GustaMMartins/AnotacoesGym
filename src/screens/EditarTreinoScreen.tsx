import {View,Text,TextInput,Pressable,StyleSheet,} from 'react-native';

export default function EditarTreinoScreen() {
  return (
    <View style={estilos.tela}>
      <Text style={estilos.titulo}>
        Editar Treino
      </Text>

      <Text style={estilos.label}>
        Nome do treino
      </Text>

      <TextInput
        style={estilos.input}
        placeholder="Ex: Treino A"
      />

      <Text style={estilos.label}>
        Grupo muscular
      </Text>

      <TextInput
        style={estilos.input}
        placeholder="Ex: Peito e Tríceps"
      />

      <Pressable style={estilos.botao}>
        <Text style={estilos.textoBotao}>
          Salvar alterações
        </Text>
      </Pressable>
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
    marginBottom: 30,
  },

  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderColor: '#999',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },

  botao: {
    backgroundColor: '#D32F2F',
    padding: 14,
    borderRadius: 8,
  },

  textoBotao: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});