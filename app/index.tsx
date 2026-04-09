import { useEffect, useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import {
  Dimensions,
  TextInput,
  Alert,
  ScrollView,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-chart-kit";
import axios from "axios";
import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function App() {
  const API_URL = "http://192.168.1.13:5000";

  const [budget, setBudget] = useState("");
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");

  const [data, setData] = useState({
    monthlyBudget: 0,
    totalSpent: 0,
    dailyBudget: 0,
    message: "",
  });

  const [expenses, setExpenses] = useState<
    { _id: string; title: string; amount: number; category: string }[]
  >([]);

  const [loading, setLoading] = useState(false);

  // Fetch data
  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API_URL}/budget`);
      setData(res.data);

      const expRes = await axios.get(`${API_URL}/expenses`);
      setExpenses(expRes.data);
    } catch (err: any) {
      console.error("Axios error:", err.message);
      Alert.alert("Network Error", "Check backend or WiFi");
    } finally {
      setLoading(false);
    }
  };

  // Set monthly budget
  const setMonthlyBudget = async () => {
    if (!budget) return Alert.alert("Error", "Enter budget first");

    try {
      await axios.post(`${API_URL}/budget`, {
        monthlyBudget: Number(budget),
      });
      setBudget("");
      fetchData();
    } catch {
      Alert.alert("Error", "Cannot set budget");
    }
  };

  // Add expense
  const addExpense = async () => {
    if (!title || !amount || !category) {
      return Alert.alert("Error", "Fill all fields");
    }

    try {
      await axios.post(`${API_URL}/expense`, {
        title,
        amount: Number(amount),
        category,
      });

      // IMPORTANT: just refetch instead of manually updating
      setTitle("");
      setAmount("");
      setCategory("");
      fetchData();
    } catch {
      Alert.alert("Error", "Cannot add expense");
    }
  };

  // Delete expense
  const deleteExpense = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/expense/${id}`);
      fetchData();
    } catch {
      Alert.alert("Error", "Cannot delete");
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [])
  );

  useEffect(() => {
    fetchData();
  }, []);

  const primaryColor = useThemeColor({}, "primary");
  const secondaryColor = useThemeColor({}, "secondary");
  const borderColor = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const iconColor = useThemeColor({}, "icon");
  const errorColor = useThemeColor({}, "error");

  const screenWidth = Dimensions.get("window").width - 40;

  const categoryTotals = expenses.reduce((totals, expense) => {
    const category = expense.category || "Other";
    totals[category] = (totals[category] ?? 0) + expense.amount;
    return totals;
  }, {} as Record<string, number>);

  const categoryChartData = Object.entries(categoryTotals).map(
    ([name, amount], index) => ({
      name,
      amount,
      color: ["#0a7ea4", "#ff6b6b", "#ffc107", "#4caf50", "#9c27b0", "#00bcd4"][index % 6],
      legendFontColor: textColor,
      legendFontSize: 12,
    })
  );

  const recentExpenses = expenses.slice(-6);
  const trendData = {
    labels: recentExpenses.map((item, index) =>
      item.category ? item.category.slice(0, 6) : `E${index + 1}`
    ),
    datasets: [
      {
        data: recentExpenses.map((item) => item.amount),
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: secondaryColor,
    backgroundGradientTo: secondaryColor,
    color: (opacity = 1) => `rgba(10, 126, 164, ${opacity})`,
    labelColor: () => textColor,
    decimalPlaces: 0,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "6",
      strokeWidth: "2",
      stroke: primaryColor,
    },
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        <ThemedText type="title" style={styles.header}>
          Budget Tracker
        </ThemedText>

        {/* Summary */}
        <ThemedView
          style={[
            styles.summaryBox,
            { backgroundColor: secondaryColor, borderColor },
          ]}
        >
          <ThemedText
            type="subtitle"
            style={[styles.summaryTitle, { color: primaryColor }]}
          >
            Budget Summary
          </ThemedText>

          <ThemedText style={styles.summaryText}>
            Monthly Budget: ${data.monthlyBudget}
          </ThemedText>

          <ThemedText style={styles.summaryText}>
            Total Spent: ${data.totalSpent}
          </ThemedText>

          {/* ✅ FIXED HERE */}
          <ThemedText style={styles.summaryText}>
            Daily Budget Remaining: ${data.dailyBudget}
          </ThemedText>

          <ThemedText style={styles.summaryText}>
            Status: {data.message}
          </ThemedText>
        </ThemedView>

        {/* Charts */}
        <ThemedText type="subtitle" style={[styles.chartTitle, { color: primaryColor }]}>Spending by Category</ThemedText>
        <PieChart
          data={categoryChartData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="amount"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />

        <ThemedText type="subtitle" style={[styles.chartTitle, { color: primaryColor, marginTop: 20 }]}>Recent Expense Trend</ThemedText>
        <LineChart
          data={trendData}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          bezier
          style={styles.chartStyle}
        />

        {/* Budget Input */}
        <ThemedText style={styles.label}>Set Monthly Budget:</ThemedText>
        <TextInput
          placeholder="Enter budget"
          value={budget}
          onChangeText={setBudget}
          keyboardType="numeric"
          style={[styles.input, { borderColor, color: textColor }]}
          placeholderTextColor={iconColor}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={setMonthlyBudget}
        >
          <Ionicons name="wallet" size={20} color="white" />
          <ThemedText style={styles.buttonText}>Set Budget</ThemedText>
        </TouchableOpacity>

        {/* Add Expense */}
        <ThemedText style={styles.label}>Add Expense:</ThemedText>

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={[styles.input, { borderColor, color: textColor }]}
          placeholderTextColor={iconColor}
        />

        <TextInput
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={[styles.input, { borderColor, color: textColor }]}
          placeholderTextColor={iconColor}
        />

        <TextInput
          placeholder="Category"
          value={category}
          onChangeText={setCategory}
          style={[styles.input, { borderColor, color: textColor }]}
          placeholderTextColor={iconColor}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: primaryColor }]}
          onPress={addExpense}
        >
          <Ionicons name="add-circle" size={20} color="white" />
          <ThemedText style={styles.buttonText}>Add Expense</ThemedText>
        </TouchableOpacity>

        {/* Expenses */}
        <ThemedView style={styles.expenses}>
          <ThemedText type="defaultSemiBold">Expenses:</ThemedText>

          <FlatList
            data={expenses}
            keyExtractor={(item) => item._id}
            renderItem={({ item }) => (
              <ThemedView
                style={[
                  styles.expenseItem,
                  {
                    backgroundColor: secondaryColor,
                    borderColor,
                    borderWidth: 1,
                  },
                ]}
              >
                <ThemedText>
                  [{item.category}] {item.title}: ${item.amount}
                </ThemedText>

                <TouchableOpacity
                  onPress={() => deleteExpense(item._id)}
                >
                  <Ionicons name="trash" size={20} color={errorColor} />
                </TouchableOpacity>
              </ThemedView>
            )}
          />
        </ThemedView>

        {loading && <ThemedText>Loading...</ThemedText>}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 50, padding: 20 },
  header: { marginBottom: 20 },

  summaryBox: {
    marginTop: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
  },

  summaryTitle: {
    marginBottom: 8,
    textAlign: "center",
  },

  summaryText: { marginBottom: 3 },

  label: { marginTop: 20 },

  input: {
    borderWidth: 1,
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
  },

  button: {
    flexDirection: "row",
    justifyContent: "center",
    padding: 10,
    borderRadius: 5,
    marginVertical: 10,
  },

  buttonText: {
    color: "white",
    marginLeft: 5,
  },

  expenses: { marginTop: 20 },

  expenseItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 2,
    borderRadius: 5,
  },
  chartTitle: {
    marginTop: 20,
    marginBottom: 10,
  },
  chartStyle: {
    borderRadius: 16,
    marginVertical: 8,
  },
});