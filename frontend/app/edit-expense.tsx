import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { getExpenses, updateExpense } from '@/api/expenseApi';

export default function EditExpenseScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const router = useRouter();
  const { id } = useLocalSearchParams();

  useEffect(() => {
    const fetchExpense = async () => {
      const expenses = await getExpenses();
      const expense = expenses.find(exp => exp._id === id);
      if (expense) {
        setTitle(expense.title);
        setAmount(expense.amount.toString());
      }
    };
    if (id) {
      fetchExpense();
    }
  }, [id]);

  const updateExpenseHandler = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const response = await updateExpense(id, {
        title,
        amount: parseFloat(amount),
        date: new Date().toISOString(),
      });

      if (response) {
        Alert.alert('Success', 'Expense updated!');
        router.push('/');
      } else {
        Alert.alert('Error', 'Failed to update expense');
      }
    } catch (error) {
      console.error('Error updating expense:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: 20 }}>
      <ThemedText type="title" style={{ marginBottom: 20 }}>Edit Expense</ThemedText>

      <TextInput
        placeholder="Expense Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 }}
      />

      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20 }}
      />

      <TouchableOpacity onPress={updateExpenseHandler} style={{ backgroundColor: '#2f95dc', padding: 15, borderRadius: 5 }}>
        <ThemedText style={{ color: 'white', textAlign: 'center' }}>Update Expense</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}