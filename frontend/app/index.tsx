import { View } from 'react-native';
import { Link } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import ExpenseList from '@/components/ExpenseList';

export default function ExpensesScreen() {
  return (
    <ThemedView style={{ flex: 1 }}>
      <ThemedText type="title" style={{ textAlign: 'center', margin: 20 }}>Expenses</ThemedText>
      <ExpenseList />
      <Link href="/add-expense" asChild>
        <TouchableOpacity style={{ backgroundColor: '#2f95dc', padding: 15, margin: 20, borderRadius: 5 }}>
          <ThemedText style={{ color: 'white', textAlign: 'center' }}>Add Expense</ThemedText>
        </TouchableOpacity>
      </Link>
    </ThemedView>
  );
}