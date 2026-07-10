const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Initialize Database
db.initDb();

// Routes
// Authentication
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const data = db.getDb();
  const user = data.users.find(u => (u.username === username || u.email === username) && u.password === password);
  
  if (user) {
    res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
  } else {
    res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
});

// Dashboard Data
app.get('/api/dashboard', (req, res) => {
  const period = req.query.period || 'today';
  const data = db.getDashboardStats(period);
  res.json(data);
});

app.post('/api/employees/update', (req, res) => {
  try {
    const { name, role, originalName } = req.body;
    const data = db.getDb();
    
    // Find employee index matching originalName
    const employeeIndex = data.employees.findIndex(e => e.name.toLowerCase() === originalName.toLowerCase());
    if (employeeIndex !== -1) {
      data.employees[employeeIndex].name = name;
      data.employees[employeeIndex].role = role;
      
      // Also update username/role in users if matched
      const userIndex = data.users.findIndex(u => u.username.toLowerCase() === originalName.toLowerCase().split(' ')[0] || u.role === data.employees[employeeIndex].role);
      if (userIndex !== -1) {
        data.users[userIndex].username = name.split(' ')[0].toLowerCase();
        data.users[userIndex].role = role;
      }

      db.saveDb(data);
      return res.json({ success: true, employee: data.employees[employeeIndex] });
    }
    
    res.status(404).json({ success: false, message: 'Employee not found' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update employee profile' });
  }
});

app.post('/api/dishes', (req, res) => {
  try {
    const newDish = db.addDish(req.body);
    res.json({ success: true, dish: newDish });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add dish' });
  }
});

app.post('/api/checkout', (req, res) => {
  try {
    const newBill = db.createOrder(req.body);
    res.json({ success: true, bill: newBill });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to process checkout' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`SmartPOS Server is running on http://localhost:${PORT}`);
});
