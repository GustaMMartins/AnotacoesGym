import { View, Text, TextInput, Pressable, StyleSheet, } from 'react-native';
import { useRoute } from '@react-navigation/native';
import type { RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useState } from 'react';
import { treinos, editarTreinoTemporario } from '../database/dadosTemporarios';

type RootStackParamList = {
    EditarTreino: {
        id: number;
    };
};

type EditarTreinoRouteProp = RouteProp<
    RootStackParamList,
    'EditarTreino'
>;

export default function EditarTreinoScreen() {
    const route = useRoute<EditarTreinoRouteProp>();
    const { id } = route.params;

    const treino = treinos.find(
        (treino) => treino.id === id
    );

    const [nome, setNome] = useState(treino?.nome ?? '');
    const [grupoMuscular, setGrupoMuscular] = useState(
        treino?.grupoMuscular ?? ''
    );
    const navigation = useNavigation();

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
                value={nome}
                onChangeText={setNome}
            />

            <Text style={estilos.label}>
                Grupo muscular
            </Text>

            <TextInput
                style={estilos.input}
                value={grupoMuscular}
                onChangeText={setGrupoMuscular}
            />

            <Pressable style={estilos.botao} onPress={() => {
                editarTreinoTemporario(id, nome, grupoMuscular);
                navigation.goBack();
            }}>
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