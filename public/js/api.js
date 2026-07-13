const API_BASE = '/api';

// Failover check
let useLocalDB = false;
if (window.location.hostname.includes('netlify.app') || window.location.hostname.includes('github.io') || window.location.hostname.includes('localhost') === false) {
  useLocalDB = true;
}

const LocalPOSDB = {
  getDb() {
    let db = localStorage.getItem('smartpos_db');
    if (!db) {
      db = this.initDb();
    } else {
      db = JSON.parse(db);
      // Migration: Inject users if missing (for returning visitors with old cache)
      if (!db.users) {
        db.users = [
          { id: 1, username: 'admin',       password: 'admin123',   role: 'Admin' },
          { id: 2, username: 'stockkeeper', password: 'stock123',   role: 'StockKeeper' },
          { id: 3, username: 'cashier',     password: 'cashier123', role: 'Cashier' }
        ];
        this.saveDb(db);
      }
    }
    return db;
  },
  saveDb(db) {
    localStorage.setItem('smartpos_db', JSON.stringify(db));
  },
  initDb() {
    const seed = {
      users: [
        { id: 1, username: 'admin',       password: 'admin123',   role: 'Admin' },
        { id: 2, username: 'stockkeeper', password: 'stock123',   role: 'StockKeeper' },
        { id: 3, username: 'cashier',     password: 'cashier123', role: 'Cashier' }
      ],
      dishes: [
        { id: 1, name: 'Espresso', category: 'Drinks', orders: 124, price: 3.50, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80' },
        { id: 2, name: 'Avocado Toast', category: 'Food', orders: 98, price: 8.50, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&q=80' },
        { id: 3, name: 'Cappuccino', category: 'Drinks', orders: 210, price: 4.50, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80' },
        { id: 4, name: 'Blueberry Muffin', category: 'Food', orders: 85, price: 3.00, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&q=80' },
        { id: 5, name: 'Latte', category: 'Drinks', orders: 185, price: 4.00, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80' }
      ],
      employees: [
        { id: 1, name: 'Theresa Webb', role: 'Waiter', earnings: 450, shiftDuration: '08:00 AM - 04:00 PM', avatarUrl: 'https://i.pravatar.cc/100?img=1' },
        { id: 2, name: 'Albert Flores', role: 'Manager', earnings: 750, shiftDuration: '09:00 AM - 05:00 PM', avatarUrl: 'https://i.pravatar.cc/100?img=11' }
      ],
      messages: [
        { id: 1, title: 'Low Stock Alert', text: 'Coffee beans running low in storage.', time: '10 mins ago', type: 'warning' },
        { id: 2, title: 'Shift Updated', text: 'Your shift tomorrow has been changed to 09:00 AM.', time: '2 hours ago', type: 'info' }
      ],
      sales: [
        { timeLabel: '08:00 AM', amount: 35 },
        { timeLabel: '10:00 AM', amount: 75 },
        { timeLabel: '12:00 PM', amount: 120 },
        { timeLabel: '02:00 PM', amount: 95 },
        { timeLabel: '04:00 PM', amount: 45 },
        { timeLabel: '06:00 PM', amount: 110 }
      ],
      bills: [
        { id: 'ORD-1001', date: '2026-07-10', customer: 'Table 4', amount: 45.00, status: 'Paid', items: [{ id: 1, name: 'Espresso', category: 'Drinks', price: 3.50, quantity: 2 }, { id: 2, name: 'Avocado Toast', category: 'Food', price: 8.50, quantity: 2 }] },
        { id: 'ORD-1002', date: '2026-07-10', customer: 'Takeaway', amount: 15.00, status: 'Paid', items: [{ id: 4, name: 'Blueberry Muffin', category: 'Food', price: 3.00, quantity: 5 }] },
        { id: 'ORD-1003', date: '2026-07-10', customer: 'Table 1', amount: 120.00, status: 'Pending', items: [{ id: 5, name: 'Latte', category: 'Drinks', price: 4.00, quantity: 5 }, { id: 2, name: 'Avocado Toast', category: 'Food', price: 8.50, quantity: 6 }] },
        { id: 'ORD-0999', date: '2026-07-09', customer: 'Table 3', amount: 80.00, status: 'Paid', items: [{ id: 1, name: 'Espresso', category: 'Drinks', price: 3.50, quantity: 4 }, { id: 3, name: 'Cappuccino', category: 'Drinks', price: 4.50, quantity: 4 }] },
        { id: 'ORD-0998', date: '2026-07-09', customer: 'Takeaway', amount: 55.50, status: 'Paid', items: [{ id: 2, name: 'Avocado Toast', category: 'Food', price: 8.50, quantity: 5 }, { id: 3, name: 'Cappuccino', category: 'Drinks', price: 4.50, quantity: 3 }] },
        { id: 'ORD-0997', date: '2026-07-07', customer: 'Table 2', amount: 62.00, status: 'Paid', items: [{ id: 3, name: 'Cappuccino', category: 'Drinks', price: 4.50, quantity: 2 }, { id: 2, name: 'Avocado Toast', category: 'Food', price: 8.50, quantity: 3 }] },
        { id: 'ORD-0996', date: '2026-06-25', customer: 'Table 5', amount: 110.00, status: 'Paid', items: [{ id: 5, name: 'Latte', category: 'Drinks', price: 4.00, quantity: 10 }, { id: 4, name: 'Blueberry Muffin', category: 'Food', price: 3.00, quantity: 5 }] },
        { id: 'ORD-0995', date: '2026-06-12', customer: 'Takeaway', amount: 35.00, status: 'Paid', items: [{ id: 1, name: 'Espresso', category: 'Drinks', price: 3.50, quantity: 10 }] }
      ]
    };
    this.saveDb(seed);
    return seed;
  },
  login(username, password) {
    const db = this.getDb();
    const user = db.users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (user) {
      return { success: true, user: { id: user.id, username: user.username, role: user.role } };
    }
    return { success: false, message: 'Invalid credentials' };
  },
  addDish(dish) {
    const db = this.getDb();
    const maxId = db.dishes.length > 0 ? Math.max(...db.dishes.map(d => d.id)) : 0;
    const newDish = {
      id: maxId + 1,
      name: dish.name,
      category: dish.category,
      price: Number(dish.price),
      stock: 0,
      imageUrl: dish.imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80',
      orders: 0
    };
    db.dishes.push(newDish);
    this.saveDb(db);
    return newDish;
  },
  checkout(orderData) {
    const db = this.getDb();
    let totalAmount = 0;
    
    orderData.items.forEach(item => {
      totalAmount += Number(item.price) * Number(item.quantity);
      const dbDish = db.dishes.find(d => d.id === Number(item.id));
      if (dbDish) {
        dbDish.orders = (dbDish.orders || 0) + Number(item.quantity);
        // Decrement stock — wire stock keeper → cashier
        if (dbDish.stock !== undefined && dbDish.stock !== null) {
          dbDish.stock = Math.max(0, dbDish.stock - Number(item.quantity));
        }
      }
    });

    const newBill = {
      id: 'ORD-' + (1000 + db.bills.length + 1),
      date: new Date().toISOString().split('T')[0],
      customer: orderData.customer || 'Takeaway',
      amount: totalAmount,
      status: 'Paid',
      items: orderData.items
    };

    db.bills.unshift(newBill);
    this.saveDb(db);
    return newBill;
  },
  updateEmployee(name, role, originalName) {
    const db = this.getDb();
    const emp = db.employees.find(e => e.name.toLowerCase() === originalName.toLowerCase());
    if (emp) {
      emp.name = name;
      emp.role = role;
      
      const user = db.users.find(u => u.username.toLowerCase() === originalName.toLowerCase().split(' ')[0]);
      if (user) {
        user.username = name.split(' ')[0].toLowerCase();
        user.role = role;
      }
      
      this.saveDb(db);
      return { success: true, employee: emp };
    }
    return { success: false, message: 'Employee not found' };
  },
  updateDish(dishId, updates) {
    const db = this.getDb();
    const dish = db.dishes.find(d => d.id === Number(dishId));
    if (!dish) return null;
    if (updates.price    !== undefined) dish.price    = Number(updates.price);
    if (updates.stock    !== undefined) dish.stock    = Number(updates.stock);
    if (updates.name     !== undefined) dish.name     = updates.name;
    if (updates.category !== undefined) dish.category = updates.category;
    if (updates.imageUrl !== undefined) dish.imageUrl = updates.imageUrl;
    this.saveDb(db);
    return dish;
  },
  getUsers() {
    const db = this.getDb();
    return db.users.map(u => ({ id: u.id, username: u.username, role: u.role }));
  },
  addUser(userData) {
    const db = this.getDb();
    const newId = db.users.length > 0 ? Math.max(...db.users.map(u => u.id)) + 1 : 1;
    const newUser = { id: newId, username: userData.username, password: userData.password, role: userData.role };
    db.users.push(newUser);
    this.saveDb(db);
    return { id: newUser.id, username: newUser.username, role: newUser.role };
  },
  updateUser(userId, updates) {
    const db = this.getDb();
    const user = db.users.find(u => u.id === Number(userId));
    if (!user) return null;
    if (updates.username !== undefined) user.username = updates.username;
    if (updates.password !== undefined && updates.password.trim() !== '') user.password = updates.password;
    if (updates.role !== undefined) user.role = updates.role;
    this.saveDb(db);
    return { id: user.id, username: user.username, role: user.role };
  },
  deleteUser(userId) {
    const db = this.getDb();
    const index = db.users.findIndex(u => u.id === Number(userId));
    if (index !== -1) {
      if (db.users[index].role === 'Admin' && db.users.filter(u => u.role === 'Admin').length <= 1) {
        throw new Error("Cannot delete the last Admin account");
      }
      const deleted = db.users.splice(index, 1)[0];
      this.saveDb(db);
      return { id: deleted.id, username: deleted.username, role: deleted.role };
    }
    return null;
  },
  getDashboardStats(period = 'today') {
    const db = this.getDb();
    const now = new Date('2026-07-10T12:00:00');
    let filteredBills = [];
    let startDate = new Date(now);
    
    if (period === 'today') {
      filteredBills = db.bills.filter(b => b.date === '2026-07-10');
    } else if (period === 'yesterday') {
      filteredBills = db.bills.filter(b => b.date === '2026-07-09');
    } else if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
      filteredBills = db.bills.filter(b => new Date(b.date) >= startDate);
    } else if (period === 'month') {
      startDate.setDate(now.getDate() - 30);
      filteredBills = db.bills.filter(b => new Date(b.date) >= startDate);
    } else if (period === 'year') {
      startDate.setDate(now.getDate() - 365);
      filteredBills = db.bills.filter(b => new Date(b.date) >= startDate);
    }

    const totalOrders = filteredBills.length;
    const totalIncome = filteredBills.reduce((sum, b) => sum + Number(b.amount), 0);
    
    let foodIncome = 0;
    let drinksIncome = 0;
    let othersIncome = 0;
    
    filteredBills.forEach(b => {
      if (b.items && b.items.length > 0) {
        b.items.forEach(item => {
          const itemVal = Number(item.price) * Number(item.quantity);
          if (item.category === 'Food') foodIncome += itemVal;
          else if (item.category === 'Drinks') drinksIncome += itemVal;
          else othersIncome += itemVal;
        });
      } else {
        foodIncome += b.amount * 0.45;
        drinksIncome += b.amount * 0.50;
        othersIncome += b.amount * 0.05;
      }
    });

    let salesChartData = [];
    if (period === 'today' || period === 'yesterday') {
      salesChartData = db.sales.map(s => {
        const scale = totalIncome / 207.5;
        return { timeLabel: s.timeLabel, amount: Math.round(s.amount * (scale || 0.8)) };
      });
    } else if (period === 'week') {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const salesMap = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        salesMap[days[d.getDay()]] = 0;
      }
      filteredBills.forEach(b => {
        const d = new Date(b.date);
        const dayName = days[d.getDay()];
        if (salesMap[dayName] !== undefined) salesMap[dayName] += b.amount;
      });
      salesChartData = Object.keys(salesMap).map(day => ({ timeLabel: day.substring(0,3), amount: salesMap[day] }));
    } else if (period === 'month') {
      const salesMap = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
      filteredBills.forEach(b => {
        const dateObj = new Date(b.date);
        const diffDays = Math.ceil(Math.abs(now - dateObj) / (1000 * 3600 * 24));
        if (diffDays <= 7) salesMap['Week 4'] += b.amount;
        else if (diffDays <= 14) salesMap['Week 3'] += b.amount;
        else if (diffDays <= 21) salesMap['Week 2'] += b.amount;
        else salesMap['Week 1'] += b.amount;
      });
      salesChartData = Object.keys(salesMap).map(w => ({ timeLabel: w, amount: salesMap[w] }));
    } else if (period === 'year') {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const salesMap = {};
      months.forEach(m => salesMap[m] = 0);
      filteredBills.forEach(b => {
        const d = new Date(b.date);
        salesMap[months[d.getMonth()]] += b.amount;
      });
      salesChartData = months.map(m => ({ timeLabel: m, amount: salesMap[m] }));
    }

    const dishOrders = {};
    db.dishes.forEach(d => dishOrders[d.id] = { ...d, orders: 0 });
    filteredBills.forEach(b => {
      if (b.items) {
        b.items.forEach(item => {
          if (dishOrders[item.id]) dishOrders[item.id].orders += item.quantity;
        });
      }
    });

    return {
      summary: {
        totalIncome: Math.round(totalIncome),
        foodIncome: Math.round(foodIncome),
        drinksIncome: Math.round(drinksIncome),
        othersIncome: Math.round(othersIncome),
        totalOrders: totalOrders,
        ordersGrowth: period === 'today' ? 12.5 : -2.3,
        newCustomers: Math.round(totalOrders * 0.4),
        customersGrowth: period === 'today' ? 8.2 : 5.1
      },
      sales: salesChartData,
      // Use spread so ALL dish fields (including stock) are preserved
      dishes: Object.values(dishOrders),
      employees: db.employees,
      bills: db.bills,
      messages: db.messages
    };
  }
};

const API = {
  async login(username, password) {
    if (useLocalDB) return LocalPOSDB.login(username, password);
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      console.warn("API Failover to LocalStorageDB triggered:", error);
      useLocalDB = true;
      return LocalPOSDB.login(username, password);
    }
  },

  async getDashboardData(period = 'today') {
    if (useLocalDB) return LocalPOSDB.getDashboardStats(period);
    try {
      const response = await fetch(`${API_BASE}/dashboard?period=${period}`);
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      console.warn("API Failover to LocalStorageDB triggered:", error);
      useLocalDB = true;
      return LocalPOSDB.getDashboardStats(period);
    }
  },

  async updateEmployee(name, role, originalName) {
    if (useLocalDB) return LocalPOSDB.updateEmployee(name, role, originalName);
    try {
      const response = await fetch(`${API_BASE}/employees/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, originalName })
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      console.warn("API Failover to LocalStorageDB triggered:", error);
      useLocalDB = true;
      return LocalPOSDB.updateEmployee(name, role, originalName);
    }
  },

  async addDish(dishData) {
    if (useLocalDB) {
      const dish = LocalPOSDB.addDish(dishData);
      return { success: true, dish };
    }
    try {
      const response = await fetch(`${API_BASE}/dishes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dishData)
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      console.warn("API Failover to LocalStorageDB triggered:", error);
      useLocalDB = true;
      const dish = LocalPOSDB.addDish(dishData);
      return { success: true, dish };
    }
  },

  async checkout(orderData) {
    if (useLocalDB) {
      const bill = LocalPOSDB.checkout(orderData);
      return { success: true, bill };
    }
    try {
      const response = await fetch(`${API_BASE}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      console.warn("API Failover to LocalStorageDB triggered:", error);
      useLocalDB = true;
      const bill = LocalPOSDB.checkout(orderData);
      return { success: true, bill };
    }
  },

  async updateDish(dishId, updates) {
    if (useLocalDB) {
      const dish = LocalPOSDB.updateDish(dishId, updates);
      return dish ? { success: true, dish } : { success: false, message: 'Dish not found' };
    }
    try {
      const response = await fetch(`${API_BASE}/dishes/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dishId, ...updates })
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      console.warn("API Failover to LocalStorageDB triggered:", error);
      useLocalDB = true;
      const dish = LocalPOSDB.updateDish(dishId, updates);
      return dish ? { success: true, dish } : { success: false, message: 'Dish not found' };
    }
  },

  // -- User (Role) Management Methods --
  async getUsers() {
    if (useLocalDB) return { success: true, users: LocalPOSDB.getUsers() };
    try {
      const response = await fetch(`${API_BASE}/users`);
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      useLocalDB = true;
      return { success: true, users: LocalPOSDB.getUsers() };
    }
  },
  async addUser(userData) {
    if (useLocalDB) {
      const user = LocalPOSDB.addUser(userData);
      return { success: true, user };
    }
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      useLocalDB = true;
      const user = LocalPOSDB.addUser(userData);
      return { success: true, user };
    }
  },
  async updateUser(userId, updates) {
    if (useLocalDB) {
      const user = LocalPOSDB.updateUser(userId, updates);
      return user ? { success: true, user } : { success: false, message: 'User not found' };
    }
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (!response.ok) throw new Error("HTTP " + response.status);
      return await response.json();
    } catch (error) {
      useLocalDB = true;
      const user = LocalPOSDB.updateUser(userId, updates);
      return user ? { success: true, user } : { success: false, message: 'User not found' };
    }
  },
  async deleteUser(userId) {
    if (useLocalDB) {
      try {
        const user = LocalPOSDB.deleteUser(userId);
        return user ? { success: true, user } : { success: false, message: 'User not found' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok && !data.message) throw new Error("HTTP " + response.status);
      return data;
    } catch (error) {
      useLocalDB = true;
      try {
        const user = LocalPOSDB.deleteUser(userId);
        return user ? { success: true, user } : { success: false, message: 'User not found' };
      } catch (err) {
        return { success: false, message: err.message };
      }
    }
  }
};
