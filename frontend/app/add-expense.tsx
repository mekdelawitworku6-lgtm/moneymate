import { View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export default function AddExpenseScreen() {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const router = useRouter();

  const addExpense = async () => {
    if (!title || !amount) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/expense', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          amount: parseFloat(amount),
          date: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        Alert.alert('Success', 'Expense added!');
        router.push('/'); // Navigate to expenses list
      } else {
        Alert.alert('Error', 'Failed to add expense');
      }
    } catch (error) {
      console.error('Error adding expense:', error);
      Alert.alert('Error', 'Network error');
    }
  };

  return (
    <ThemedView style={{ flex: 1, padding: 20 }}>
      <ThemedText type="title" style={{ marginBottom: 20 }}>Add Expense</ThemedText>

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

      <TouchableOpacity onPress={addExpense} style={{ backgroundColor: '#2f95dc', padding: 15, borderRadius: 5 }}>
        <ThemedText style={{ color: 'white', textAlign: 'center' }}>Add Expense</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}