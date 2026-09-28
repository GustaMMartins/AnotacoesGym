import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import {criarTabelas} from './src/database/banco';

export default function App() {
  useEffect(() => {
    criarTabelas();
  }, []);

  return <AppNavigator />;
}