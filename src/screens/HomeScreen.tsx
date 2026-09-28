import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CardTreino from '../components/CardTreino';
import { treinos, excluirTreinoTemporario, } from '../database/dadosTemporarios';

type RootStackParamList = {
    Home: undefined;
    Exercicios: {
        nome: string;
        grupoMuscular: string;
    };
    NovoTreino: undefined;

    editarTreino: {
        id: number;
    };
};

type NavegacaoProps = NativeStackNavigationProp<RootStackParamList>;


export default function HomeScreen() {
    const navigation = useNavigation<NavegacaoProps>();
    const [, atualizarTela] = useState(0);

    useFocusEffect(
        useCallback(() => {
            atualizarTela(valor => valor + 1);
        }, [])
    );

    return (
        <View style={estilos.tela}>
            <Text style={estilos.titulo}>Anotações Gym</Text>

            <Text style={estilos.subtitulo}>Meus treinos</Text>

            <Pressable
                style={estilos.botao}
                onPress={() => navigation.navigate('NovoTreino')}
            >
                <Text style={estilos.textoBotao}>
                    + Criar treino
                </Text>
            </Pressable>


            <FlatList
                data={treinos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <CardTreino
                        nome={item.nome}
                        grupoMuscular={item.grupoMuscular}
                        onPress={() =>
                            navigation.navigate('Exercicios', {
                                nome: item.nome,
                                grupoMuscular: item.grupoMuscular,
                            })
                        }
                        onExcluir={() => {
                            excluirTreinoTemporario(item.id);
                            atualizarTela(valor => valor + 1);
                        }}
                        onEditar={() => {
                            navigation.navigate('EditarTreino', {
                                id: item.id,
                            });
                        }}
                    />
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
        fontSize: 20,
        marginTop: 20,
    },
    botao: {
        backgroundColor: '#D32F2F',
        padding: 14,
        borderRadius: 8,
        marginBottom: 20,
    },

    textoBotao: {
        color: '#FFFFFF',
        textAlign: 'center',
        fontWeight: 'bold',
    },
});