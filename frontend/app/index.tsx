import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, TextInput, Button, Alert, ScrollView } from "react-native";
import axios from "axios";

export default function App() {
  // ✅ Set to your PC local network IP (or 10.0.2.2 for Android emulator)
  const API_URL = "http:// 10.47.10.15:5000"; // <-- replace with your actual host IP

  const [budget, setBudget] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [title, setTitle] = useState<string>("");

  const [data, setData] = useState({
    monthlyBudget: 0,
    totalSpent: 0,
    dailyBudget: 0,
    message: "",
  });

  const [loading, setLoading] = useState<boolean>(false);

  // fetch budget + totals
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/budget`);
      console.log("fetchData /budget response", res.data);
      setData(res.data);
    } catch (err: any) {
      console.error("Axios error:", err.message);
      Alert.alert("Network Error", "Cannot reach backend. Check your IP and WiFi.");
    } finally {
      setLoading(false);
    }
  };

  // set monthly budget
  const setMonthlyBudget = async () => {
    if (!budget) return Alert.alert("Error", "Enter budget first");

    try {
      await axios.post(`${API_URL}/budget`, {
        monthlyBudget: Number(budget),
      });
      setBudget("");
      fetchData();
    } catch (err: any) {
      console.error("Axios error:", err.message);
      Alert.alert("Network Error", "Cannot set budget");
    }
  };

  // add expense
  const addExpense = async () => {
    if (!title || !amount) return Alert.alert("Error", "Enter title and amount");

    try {
      await axios.post(`${API_URL}/expense`, {
        title,
        amount: Number(amount),
      });
      setTitle("");
      setAmount("");
      fetchData();
    } catch (err: any) {
      console.error("Axios error:", err.message);
      Alert.alert("Network Error", "Cannot add expense");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    // keep initial load for non-navigation behavior
    fetchData();
  }, []);

  return (
    <ScrollView style={{ marginTop: 50, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold" }}>Budget Tracker</Text>

      <Text style={{ marginTop: 20 }}>Monthly Budget:</Text>
      <TextInput
        placeholder="Enter budget"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 5, marginVertical: 5 }}
      />
      <Button title="Set Budget" onPress={setMonthlyBudget} />

      <Text style={{ marginTop: 20 }}>Add Expense:</Text>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{ borderWidth: 1, padding: 5, marginVertical: 5 }}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{ borderWidth: 1, padding: 5, marginVertical: 5 }}
      />
      <Button title="Add Expense" onPress={addExpense} />

      <View style={{ marginTop: 30 }}>
        <Text>Total Spent: {data.totalSpent}</Text>
        <Text>Monthly Budget: {data.monthlyBudget}</Text>
        <Text>Daily Budget: {data.dailyBudget.toFixed(2)}</Text>
        <Text>Status: {data.message}</Text>
      </View>

      {loading && <Text style={{ marginTop: 10 }}>Loading...</Text>}
    </ScrollView>
  );
}