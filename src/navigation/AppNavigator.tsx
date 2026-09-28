import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ExerciciosScreen from '../screens/ExerciciosScreen';
import NovoTreinoScreen from '../screens/NovoTreinoScreen';
import EditarTreinoScreen from '../screens/EditarTreinoScreen';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#202124',
          headerTitleStyle: { fontWeight: '700' },
          contentStyle: { backgroundColor: '#F7F8FA' },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'Anotações Gym' }}
        />
        <Stack.Screen
          name="NovoTreino"
          component={NovoTreinoScreen}
          options={{ title: 'Novo treino' }}
        />
        <Stack.Screen
          name="Exercicios"
          component={ExerciciosScreen}
          options={{ title: 'Treino' }}
        />
        <Stack.Screen
          name="EditarTreino"
          component={EditarTreinoScreen}
          options={{ title: 'Editar treino' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
