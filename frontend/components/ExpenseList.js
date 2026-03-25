import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Button, RefreshControl } from "react-native";
import { getExpenses, deleteExpense } from "../api/expenseApi";

export default function ExpenseList({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    const data = await getExpenses();
    setExpenses(data);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  // ✅ NOW inside component
  const handleDelete = async (id) => {
    const success = await deleteExpense(id);
    if (success) {
      setExpenses(expenses.filter(item => item._id !== id));
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <FlatList
        data={expenses}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={{ marginTop: 10 }}>
            <Text>{item.title} - ${item.amount}</Text>
            <Button
              title="Delete"
              onPress={() => handleDelete(item._id)}
            />
          </View>
        )}
      />
    </View>
  );
}