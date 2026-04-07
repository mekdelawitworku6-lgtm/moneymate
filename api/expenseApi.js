const API_BASE = 'http://192.168.1.100:5000'; // replace with your PC local IP

export const getExpenses = async () => {
  try {
    const response = await fetch(`${API_BASE}/expense`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }
};

export const deleteExpense = async (id) => {
  try {
    const response = await fetch(`${API_BASE}/expense/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Error deleting expense:', error);
    return false;
  }
};

export const updateExpense = async (id, data) => {
  try {
    const response = await fetch(`${API_BASE}/expense/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error('Error updating expense:', error);
    return null;
  }
};