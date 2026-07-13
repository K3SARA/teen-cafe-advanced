const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'db.json');

const initialData = {
  users: [
    { id: 1, username: 'admin',       password: 'admin123',   role: 'Admin' },
    { id: 2, username: 'stockkeeper', password: 'stock123',   role: 'StockKeeper' },
    { id: 3, username: 'cashier',     password: 'cashier123', role: 'Cashier' }
  ],
  dishes: [
    { id: 1, name: 'Espresso',         category: 'Drinks', orders: 124, price: 3.50, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=500&q=80' },
    { id: 2, name: 'Avocado Toast',    category: 'Food',   orders: 98,  price: 8.50, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=500&q=80' },
    { id: 3, name: 'Cappuccino',       category: 'Drinks', orders: 210, price: 4.50, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80' },
    { id: 4, name: 'Blueberry Muffin', category: 'Food',   orders: 85,  price: 3.00, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1607958996333-41aef7caefaa?w=500&q=80' },
    { id: 5, name: 'Latte',            category: 'Drinks', orders: 185, price: 4.00, stock: 0, imageUrl: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=500&q=80' }
  ],
  employees: [
    { id: 1, name: 'Theresa Webb', role: 'Waiter', earnings: 450, shiftDuration: '08:00 AM - 04:00 PM', avatarUrl: 'https://i.pravatar.cc/100?img=1' },
    { id: 2, name: 'Albert Flores', role: 'Manager', earnings: 750, shiftDuration: '09:00 AM - 05:00 PM', avatarUrl: 'https://i.pravatar.cc/100?img=11' },
    { id: 3, name: 'Dianne Russell', role: 'Courier', earnings: 320, shiftDuration: '10:00 AM - 06:00 PM', avatarUrl: 'https://i.pravatar.cc/100?img=5' }
  ],
  sales: [
    { id: 1, timeLabel: '09:00', amount: 45 },
    { id: 2, timeLabel: '10:00', amount: 80 },
    { id: 3, timeLabel: '11:00', amount: 110 },
    { id: 4, timeLabel: '12:00', amount: 205 },
    { id: 5, timeLabel: '13:00', amount: 180 },
    { id: 6, timeLabel: '14:00', amount: 120 },
    { id: 7, timeLabel: '15:00', amount: 90 },
    { id: 8, timeLabel: '16:00', amount: 65 },
    { id: 9, timeLabel: '17:00', amount: 130 },
    { id: 10, timeLabel: '18:00', amount: 160 }
  ],
  bills: [
    // Today (2026-07-10)
    { id: 'ORD-1001', date: '2026-07-10', customer: 'Table 4', amount: 45.00, status: 'Paid', items: [{ id: 1, name: 'Espresso', category: 'Drinks', price: 3.50, quantity: 2 }, { id: 2, name: 'Avocado Toast', category: 'Food', price: 8.50, quantity: 2 }] },
    { id: 'ORD-1002', date: '2026-07-10', customer: 'Takeaway', amount: 18.50, status: 'Paid', items: [{ id: 3, name: 'Cappuccino', category: 'Drinks', price: 4.50, quantity: 2 }, { id: 4, name: 'Blueberry Muffin', category: 'Food', price: 3.00, quantity: 3 }] },
    { id: 'ORD-1003', date: '2026-07-10', customer: 'Table 1', amount: 120.00, status: 'Pending', items: [{ id: 5, name: 'Latte', category: 'Drinks', price: 4.00, quantity: 5 }, { id: 2, name: 'Avocado Toast', category: 'Food', price: 8.50, quantity: 6 }] },
    { id: 'ORD-1004', date: '2026-07-10', customer: 'Table 7', amount: 24.00, status: 'Paid', items: [{ id: 1, name: 'Espresso', category: 'Drinks', price: 3.50, quantity: 4 }, { id: 4, name: 'Blueberry Muffin', category: 'Food', price: 3.00, quantity: 3 }] },
    // Yesterday (2026-07-09)
    { id: 'ORD-0999', date: '2026-07-09', customer: 'Table 2', amount: 35.00, status: 'Paid', items: [{ id: 1, name: 'Espresso', category: 'Drinks', price: 3.50, quantity: 10 }] },
    { id: 'ORD-0998', date: '2026-07-09', customer: 'Takeaway', amount: 55.50, status: 'Paid', items: [{ id: 2, name: 'Avocado Toast', category: 'Food', price: 8.50, quantity: 5 }, { id: 3, name: 'Cappuccino', category: 'Drinks', price: 4.50, quantity: 3 }] },
    // Earlier this Week
    { id: 'ORD-0997', date: '2026-07-07', customer: 'Table 5', amount: 80.00, status: 'Paid' },
    { id: 'ORD-0996', date: '2026-07-06', customer: 'Table 1', amount: 110.00, status: 'Paid' },
    { id: 'ORD-0995', date: '2026-07-05', customer: 'Takeaway', amount: 45.00, status: 'Paid' },
    // Earlier this Month
    { id: 'ORD-0994', date: '2026-06-28', customer: 'Table 3', amount: 95.00, status: 'Paid' },
    { id: 'ORD-0993', date: '2026-06-25', customer: 'Table 4', amount: 150.00, status: 'Paid' },
    { id: 'ORD-0992', date: '2026-06-15', customer: 'Table 2', amount: 70.00, status: 'Paid' },
    // Earlier this Year
    { id: 'ORD-0991', date: '2026-05-10', customer: 'Table 1', amount: 320.00, status: 'Paid' },
    { id: 'ORD-0990', date: '2026-04-12', customer: 'Table 5', amount: 410.00, status: 'Paid' },
    { id: 'ORD-0889', date: '2026-03-22', customer: 'Table 3', amount: 180.00, status: 'Paid' }
  ],
  messages: [
    { id: 1, title: 'Low Stock Alert', text: 'Coffee beans running low in storage.', time: '10 mins ago', type: 'warning' },
    { id: 2, title: 'Shift Updated', text: 'Your shift tomorrow has been changed to 09:00 AM.', time: '2 hours ago', type: 'info' }
  ],
  summary: {
    totalIncome: 77541,
    foodIncome: 35000,
    drinksIncome: 38541,
    othersIncome: 4000,
    totalOrders: 21375,
    ordersGrowth: -2.33,
    newCustomers: 256,
    customersGrowth: 32.40
  }
};

// Initialize DB if not exists
function initDb() {
  if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify(initialData, null, 2), 'utf-8');
    console.log('Database initialized with seed data.');
  }
}

function getDb() {
  initDb();
  const data = fs.readFileSync(dbPath, 'utf-8');
  return JSON.parse(data);
}

function saveDb(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

function addDish(dish) {
  const data = getDb();

  const isDuplicate = data.dishes.some(d => d.name.trim().toLowerCase() === String(dish.name).trim().toLowerCase());
  if (isDuplicate) {
    throw new Error(`"${dish.name}" already exists in the menu`);
  }

  const maxId = data.dishes.length > 0 ? Math.max(...data.dishes.map(d => d.id)) : 0;

  const newDish = {
    id: maxId + 1,
    name: dish.name,
    category: dish.category,
    price: Number(dish.price),
    stock: 0,
    imageUrl: dish.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=100&q=80',
    orders: 0
  };

  data.dishes.push(newDish);
  saveDb(data);
  return newDish;
}

function deleteDish(dishId) {
  const data = getDb();
  const index = data.dishes.findIndex(d => d.id === Number(dishId));
  if (index === -1) return null;
  const deleted = data.dishes.splice(index, 1)[0];
  saveDb(data);
  return deleted;
}

function createOrder(orderData) {
  const data = getDb();
  
  let totalAmount = 0;
  let foodTotal = 0;
  let drinksTotal = 0;
  
  orderData.items.forEach(item => {
    const itemTotal = Number(item.price) * Number(item.quantity);
    totalAmount += itemTotal;
    
    if (item.category === 'Food') {
      foodTotal += itemTotal;
    } else if (item.category === 'Drinks') {
      drinksTotal += itemTotal;
    }
    
    const dbDish = data.dishes.find(d => d.id === Number(item.id));
    if (dbDish) {
      dbDish.orders = (dbDish.orders || 0) + Number(item.quantity);
      // Decrement stock — wire stock keeper → cashier
      if (dbDish.stock !== undefined && dbDish.stock !== null) {
        dbDish.stock = Math.max(0, dbDish.stock - Number(item.quantity));
      }
    }
  });
  
  const finalBillId = 'ORD-' + (1000 + data.bills.length + 1);

  const newBill = {
    id: finalBillId,
    date: new Date().toISOString().split('T')[0],
    customer: orderData.customer || 'Takeaway',
    amount: totalAmount,
    status: 'Paid',
    items: orderData.items
  };
  
  data.bills.unshift(newBill);
  
  data.summary.totalIncome = (data.summary.totalIncome || 0) + totalAmount;
  data.summary.foodIncome = (data.summary.foodIncome || 0) + foodTotal;
  data.summary.drinksIncome = (data.summary.drinksIncome || 0) + drinksTotal;
  data.summary.totalOrders = (data.summary.totalOrders || 0) + 1;
  
  saveDb(data);
  return newBill;
}

function getDashboardStats(period = 'today') {
  const data = getDb();
  const now = new Date('2026-07-10T12:00:00');
  
  let filteredBills = [];
  let startDate = new Date(now);
  
  if (period === 'today') {
    filteredBills = data.bills.filter(b => b.date === '2026-07-10');
  } else if (period === 'yesterday') {
    filteredBills = data.bills.filter(b => b.date === '2026-07-09');
  } else if (period === 'week') {
    startDate.setDate(now.getDate() - 7);
    filteredBills = data.bills.filter(b => new Date(b.date) >= startDate);
  } else if (period === 'month') {
    startDate.setDate(now.getDate() - 30);
    filteredBills = data.bills.filter(b => new Date(b.date) >= startDate);
  } else if (period === 'year') {
    startDate.setDate(now.getDate() - 365);
    filteredBills = data.bills.filter(b => new Date(b.date) >= startDate);
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
    salesChartData = data.sales.map(s => {
      const scale = totalIncome / 207.5;
      return { timeLabel: s.timeLabel, amount: Math.round(s.amount * (scale || 0.8)) };
    });
  } else if (period === 'week') {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const salesMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const dayName = days[d.getDay()];
      salesMap[dayName] = 0;
    }
    filteredBills.forEach(b => {
      const d = new Date(b.date);
      const dayName = days[d.getDay()];
      if (salesMap[dayName] !== undefined) {
        salesMap[dayName] += b.amount;
      }
    });
    salesChartData = Object.keys(salesMap).map(day => ({
      timeLabel: day.substring(0, 3),
      amount: salesMap[day]
    }));
  } else if (period === 'month') {
    const salesMap = { 'Week 1': 0, 'Week 2': 0, 'Week 3': 0, 'Week 4': 0 };
    filteredBills.forEach(b => {
      const dateObj = new Date(b.date);
      const diffTime = Math.abs(now - dateObj);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
      const mName = months[d.getMonth()];
      if (salesMap[mName] !== undefined) {
        salesMap[mName] += b.amount;
      }
    });
    salesChartData = months.map(m => ({ timeLabel: m, amount: salesMap[m] }));
  }

  const dishOrders = {};
  data.dishes.forEach(d => {
    dishOrders[d.id] = { ...d, orders: 0 };
  });

  filteredBills.forEach(b => {
    if (b.items && b.items.length > 0) {
      b.items.forEach(item => {
        if (dishOrders[item.id]) {
          dishOrders[item.id].orders += item.quantity;
        }
      });
    } else {
      const randomDish = data.dishes[Math.floor(Math.random() * data.dishes.length)];
      if (dishOrders[randomDish.id]) {
        dishOrders[randomDish.id].orders += Math.round(b.amount / 10);
      }
    }
  });

  const dishes = Object.values(dishOrders).map(d => ({
    id: d.id,
    name: d.name,
    category: d.category,
    orders: d.orders || 1,
    imageUrl: d.imageUrl,
    price: d.price,
    stock: d.stock   // ← critical: must be passed so Cashier enforces stock limits
  }));

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
    dishes: dishes,
    employees: data.employees,
    bills: data.bills,
    messages: data.messages
  };
}

function updateDish(dishId, updates) {
  const data = getDb();
  const dish = data.dishes.find(d => d.id === Number(dishId));
  if (!dish) return null;
  if (updates.price  !== undefined) dish.price  = Number(updates.price);
  if (updates.stock  !== undefined) dish.stock  = Number(updates.stock);
  if (updates.name   !== undefined) dish.name   = updates.name;
  if (updates.category !== undefined) dish.category = updates.category;
  if (updates.imageUrl !== undefined) dish.imageUrl = updates.imageUrl;
  saveDb(data);
  return dish;
}

function getUsers() {
  const data = getDb();
  return data.users;
}

function addUser(userData) {
  const data = getDb();
  const newId = data.users.length > 0 ? Math.max(...data.users.map(u => u.id)) + 1 : 1;
  const newUser = { id: newId, username: userData.username, password: userData.password, role: userData.role };
  data.users.push(newUser);
  saveDb(data);
  return newUser;
}

function updateUser(userId, updates) {
  const data = getDb();
  const user = data.users.find(u => u.id === Number(userId));
  if (!user) return null;
  if (updates.username !== undefined) user.username = updates.username;
  if (updates.password !== undefined && updates.password.trim() !== '') user.password = updates.password;
  if (updates.role !== undefined) user.role = updates.role;
  saveDb(data);
  return user;
}

function deleteUser(userId) {
  const data = getDb();
  const index = data.users.findIndex(u => u.id === Number(userId));
  if (index !== -1) {
    // Basic protection: do not delete the last Admin
    const user = data.users[index];
    if (user.role === 'Admin' && data.users.filter(u => u.role === 'Admin').length <= 1) {
      throw new Error("Cannot delete the last Admin account");
    }
    const deleted = data.users.splice(index, 1)[0];
    saveDb(data);
    return deleted;
  }
  return null;
}

module.exports = {
  initDb,
  getDb,
  saveDb,
  addDish,
  updateDish,
  deleteDish,
  createOrder,
  getDashboardStats,
  getUsers,
  addUser,
  updateUser,
  deleteUser
};
