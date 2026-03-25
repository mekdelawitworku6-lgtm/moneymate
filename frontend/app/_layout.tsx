import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <ThemeProvider value={DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ title: 'Expenses' }} />
        <Stack.Screen name="add-expense" options={{ title: 'Add Expense' }} />
        {/* Add more screens here */}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
