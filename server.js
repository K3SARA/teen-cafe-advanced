const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
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
      const userIndex = data.users.findIndex(u => u.username.toLowerCase() === originalName.toLowerCase().split(' ')[0]);
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

function handleImageUpload(reqBody) {
  if (reqBody.imageBase64) {
    const matches = reqBody.imageBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const ext = matches[1].split('/')[1] || 'png';
      const fileName = `upload_${Date.now()}.${ext}`;
      const filePath = path.join(__dirname, 'public', 'images', fileName);
      try {
        fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
        return `images/${fileName}`;
      } catch (err) {
        console.error("Failed to write image:", err);
      }
    }
  }
  return reqBody.imageUrl;
}

app.post('/api/dishes', (req, res) => {
  try {
    const dishData = { ...req.body };
    dishData.imageUrl = handleImageUpload(req.body) || dishData.imageUrl;
    const newDish = db.addDish(dishData);
    res.json({ success: true, dish: newDish });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message || 'Failed to add dish' });
  }
});

app.delete('/api/dishes/:id', (req, res) => {
  try {
    const deleted = db.deleteDish(req.params.id);
    if (deleted) {
      res.json({ success: true, dish: deleted });
    } else {
      res.status(404).json({ success: false, message: 'Dish not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete dish' });
  }
});

app.post('/api/dishes/update', (req, res) => {
  try {
    const { dishId, price, stock, name, category } = req.body;
    const imageUrl = handleImageUpload(req.body);
    const updated = db.updateDish(dishId, { price, stock, name, category, imageUrl });
    if (updated) {
      res.json({ success: true, dish: updated });
    } else {
      res.status(404).json({ success: false, message: 'Dish not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update dish' });
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

// User (Role) Management Routes
app.get('/api/users', (req, res) => {
  try {
    const users = db.getUsers();
    // Do not return passwords for security
    const safeUsers = users.map(u => ({ id: u.id, username: u.username, role: u.role }));
    res.json({ success: true, users: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch users' });
  }
});

app.post('/api/users', (req, res) => {
  try {
    const newUser = db.addUser(req.body);
    res.json({ success: true, user: { id: newUser.id, username: newUser.username, role: newUser.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to add user' });
  }
});

app.put('/api/users/:id', (req, res) => {
  try {
    const { username, password, role } = req.body;
    const updated = db.updateUser(req.params.id, { username, password, role });
    if (updated) {
      res.json({ success: true, user: { id: updated.id, username: updated.username, role: updated.role } });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update user' });
  }
});

app.delete('/api/users/:id', (req, res) => {
  try {
    const deleted = db.deleteUser(req.params.id);
    if (deleted) {
      res.json({ success: true, user: { id: deleted.id, username: deleted.username, role: deleted.role } });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to delete user' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`SmartPOS Server is running on http://localhost:${PORT}`);
});
