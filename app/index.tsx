import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  ScrollView,
  FlatList,
  StyleSheet,
} from "react-native";
import axios from "axios";

export default function App() {
  const API_URL = "http://192.168.1.13:5000"; // Your PC IP + backend port

  const [budget, setBudget] = useState<string>("");
  const [title, setTitle] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");

  const [data, setData] = useState({
    monthlyBudget: 0,
    totalSpent: 0,
    dailyBudget: 0,
    message: "",
  });

  const [expenses, setExpenses] = useState<
    { title: string; amount: number; category: string }[]
  >([]);

  const [loading, setLoading] = useState<boolean>(false);

  // Fetch budget + totals + expenses
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/budget`);
      setData(res.data);

      const expRes = await axios.get(`${API_URL}/expenses`);
      setExpenses(expRes.data); // assume backend returns array
    } catch (err: any) {
      console.error("Axios error:", err.message);
      Alert.alert("Network Error", "Cannot reach backend. Check IP & WiFi.");
    } finally {
      setLoading(false);
    }
  };

  // Set monthly budget
  const setMonthlyBudget = async () => {
    if (!budget) return Alert.alert("Error", "Enter budget first");

    try {
      await axios.post(`${API_URL}/budget`, { monthlyBudget: Number(budget) });
      setBudget("");
      fetchData();
    } catch (err: any) {
      console.error("Axios error:", err.message);
      Alert.alert("Network Error", "Cannot set budget");
    }
  };

  // Add expense
  const addExpense = async () => {
    if (!title || !amount || !category)
      return Alert.alert("Error", "Enter title, amount, and category");

    const newExpense = {
      title,
      amount: Number(amount),
      category,
    };

    try {
      await axios.post(`${API_URL}/expense`, newExpense);
      setExpenses(prev => [...prev, newExpense]); // update local state
      setTitle("");
      setAmount("");
      setCategory("");
      fetchData();
    } catch (err: any) {
      console.error("Axios error:", err.message);
      Alert.alert("Network Error", "Cannot add expense");
    }
  };

  // Calculate daily budget remaining
  const calculateDailyBudget = () => {
    const today = new Date();
    const daysInMonth =
      new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const daysLeft = daysInMonth - today.getDate() + 1;
    const remaining = data.monthlyBudget - data.totalSpent;
    return (remaining / daysLeft).toFixed(2);
  };

  useFocusEffect(useCallback(() => { fetchData(); }, []));
  useEffect(() => { fetchData(); }, []);

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <Text style={styles.header}>Budget Tracker</Text>

      {/* Styled Summary */}
      <View style={styles.summaryBox}>
        <Text style={styles.summaryTitle}>Budget Summary</Text>
        <Text style={styles.summaryText}>Monthly Budget: {data.monthlyBudget}</Text>
        <Text style={styles.summaryText}>Total Spent: {data.totalSpent}</Text>
        <Text style={styles.summaryText}>
          Daily Budget Remaining: {calculateDailyBudget()}
        </Text>
        <Text style={styles.summaryText}>Status: {data.message}</Text>
      </View>

      {/* Monthly Budget Input */}
      <Text style={styles.label}>Set Monthly Budget:</Text>
      <TextInput
        placeholder="Enter budget"
        value={budget}
        onChangeText={setBudget}
        keyboardType="numeric"
        style={styles.input}
      />
      <Button title="Set Budget" onPress={setMonthlyBudget} />

      {/* Add Expense */}
      <Text style={styles.label}>Add Expense:</Text>
      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={styles.input}
      />
      <TextInput
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Category (Food, Transport, etc.)"
        value={category}
        onChangeText={setCategory}
        style={styles.input}
      />
      <Button title="Add Expense" onPress={addExpense} />

      {/* Expenses List */}
      <View style={styles.expenses}>
        <Text style={{ fontWeight: "bold", fontSize: 16 }}>Expenses:</Text>
        <FlatList
          data={expenses}
          keyExtractor={(_, index) => index.toString()}
          renderItem={({ item }) => (
            <Text>
              [{item.category}] {item.title}: {item.amount}
            </Text>
          )}
        />
      </View>

      {loading && <Text style={{ marginTop: 10 }}>Loading...</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 50, padding: 20 },
  header: { fontSize: 24, fontWeight: "bold" },
  summaryBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: "#f0f8ff",
    borderWidth: 1,
    borderColor: "#1e90ff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#1e90ff",
    textAlign: "center",
  },
  summaryText: { fontSize: 16, marginBottom: 3 },
  label: { marginTop: 20, fontSize: 16 },
  input: { borderWidth: 1, padding: 8, marginVertical: 5, borderRadius: 5 },
  expenses: { marginTop: 20 },
});