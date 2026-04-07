import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { addExpense } from "../api/expenseApi";

export default function AddExpense({ navigation }) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");

  const handleAdd = async () => {
    if (!title || !amount) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const result = await addExpense({ title, amount: Number(amount) });
    if (result) {
      navigation.goBack();
    } else {
      Alert.alert("Error", "Failed to add expense");
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ marginBottom: 10, borderWidth: 1, padding: 5 }}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ marginBottom: 10, borderWidth: 1, padding: 5 }}
      />
      <Button title="Add Expense" onPress={handleAdd} />
    </View>
  );
}