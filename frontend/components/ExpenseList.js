import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Button, RefreshControl } from "react-native";
import { getExpenses, deleteExpense } from "../api/expenseApi";
import { useRouter } from 'expo-router';

export default function ExpenseList({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

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

  const handleEdit = (id) => {
    router.push(`/edit-expense?id=${id}`);
  };

  const total = expenses.reduce((sum, item) => {
    return sum + Number(item.amount);
  }, 0);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontWeight: 'bold', marginBottom: 10 }}>Total: {total}</Text>
      {expenses.length === 0 ? (
        <Text>No expenses yet</Text>
      ) : (
        <FlatList
          data={expenses}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          renderItem={({ item }) => (
            <View style={{ marginTop: 10 }}>
              <Text>{item.title} - ${item.amount}</Text>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Button
                  title="Edit"
                  onPress={() => handleEdit(item._id)}
                />
                <Button
                  title="Delete"
                  onPress={() => handleDelete(item._id)}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}