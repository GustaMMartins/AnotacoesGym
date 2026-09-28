import { useEffect } from 'react';

import AppNavigator from './src/navigation/AppNavigator';
import { criarTabelas } from './src/database/banco';

export default function App() {
  useEffect(() => {
    criarTabelas().catch((error) => {
      console.error('Não foi possível inicializar o banco de dados:', error);
    });
  }, []);

  return <AppNavigator />;
}
