import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import ExerciciosScreen from '../screens/ExerciciosScreen';
import NovoTreinoScreen from '../screens/NovoTreinoScreen';
import EditarTreinoScreen from '../screens/EditarTreinoScreen';

type RootStackParamList = {
  Home: undefined;
  Exercicios: {
    nome: string;
    grupoMuscular: string;
  };
  NovoTreino: undefined;

  EditarTreino: {
  id: number;
};
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />

        <Stack.Screen
          name="Exercicios"
          component={ExerciciosScreen}
        />

        <Stack.Screen
  name="NovoTreino"
  component={NovoTreinoScreen}
/>

        <Stack.Screen
  name="EditarTreino"
  component={EditarTreinoScreen}
/>
      
      </Stack.Navigator>
    </NavigationContainer>
  );
}