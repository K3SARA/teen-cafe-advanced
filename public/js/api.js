const API_BASE = '/api';

const API = {
  async login(username, password) {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      return await response.json();
    } catch (error) {
      console.error("Login API Error:", error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  async getDashboardData(period = 'today') {
    try {
      const response = await fetch(`${API_BASE}/dashboard?period=${period}`);
      return await response.json();
    } catch (error) {
      console.error("Dashboard API Error:", error);
      return null;
    }
  },

  async updateEmployee(name, role, originalName) {
    try {
      const response = await fetch(`${API_BASE}/employees/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, originalName })
      });
      return await response.json();
    } catch (error) {
      console.error("Update Employee Error:", error);
      return { success: false, message: "Network error" };
    }
  },

  async addDish(dishData) {
    try {
      const response = await fetch(`${API_BASE}/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData)
      });
      return await response.json();
    } catch (error) {
      console.error("Add Dish API Error:", error);
      return { success: false, message: 'Network error occurred' };
    }
  },

  async checkout(orderData) {
    try {
      const response = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      return await response.json();
    } catch (error) {
      console.error("Checkout API Error:", error);
      return { success: false, message: 'Network error occurred' };
    }
  }
};
