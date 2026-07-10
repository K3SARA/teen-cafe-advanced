document.addEventListener('DOMContentLoaded', () => {
  const loginPage = document.getElementById('login-page');
  const appDashboard = document.getElementById('app-dashboard');
  const loginForm = document.getElementById('login-form');

  // Chart instances
  let salesChart = null;
  let incomeChart = null;
  let dashboardData = null;
  let notificationsList = [];

  // -- Login Logic --
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    
    const loginError = document.getElementById('login-error');
    const loginErrorText = document.getElementById('login-error-text');
    if (loginError) loginError.classList.add('hidden');

    // Attempt Login
    const result = await API.login(usernameInput, passwordInput);
    if (result.success) {
      // Store user session info in memory or localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Hide login, show dashboard
      loginPage.classList.add('hidden');
      appDashboard.classList.remove('hidden');
      
      // Load Dashboard
      loadDashboard();
    } else {
      if (loginError && loginErrorText) {
        loginErrorText.textContent = result.message || "Incorrect username or password.";
        loginError.classList.remove('hidden');
      } else {
        alert("Login failed: " + result.message);
      }
    }
  });

  // Check if already logged in (optional persistence)
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    // loginPage.classList.add('hidden');
    // appDashboard.classList.remove('hidden');
    // loadDashboard();
    // For demo purposes, we will always show the login screen initially so user can see it
  }

  // -- Dashboard Logic --
  async function loadDashboard() {
    const data = await API.getDashboardData();
    if (!data) return;
    dashboardData = data;

    // 1. Populate Profile
    const user = JSON.parse(localStorage.getItem('user'));
    // Find employee info from DB to show proper details
    const employee = data.employees.find(e => e.name.toLowerCase().includes(user.username.toLowerCase()) || e.role === user.role);
    
    if (employee) {
      document.getElementById('profile-name').textContent = employee.name;
      document.getElementById('profile-role').textContent = `${employee.role} • ${employee.shiftDuration}`;
      document.getElementById('profile-avatar').src = employee.avatarUrl;

      // Prefill Settings
      const settingsName = document.getElementById('settings-name');
      const settingsRole = document.getElementById('settings-role');
      if (settingsName) settingsName.value = employee.name;
      if (settingsRole) settingsRole.value = employee.role;
    } else {
      document.getElementById('profile-name').textContent = user.username;
      document.getElementById('profile-role').textContent = user.role;
    }

    // 2. Populate Summary Cards
    document.getElementById('total-orders-value').textContent = data.summary.totalOrders.toLocaleString();
    const ordersGrowthEl = document.getElementById('orders-growth');
    ordersGrowthEl.textContent = `${data.summary.ordersGrowth > 0 ? '+' : ''}${data.summary.ordersGrowth}%`;
    
    document.getElementById('new-customers-value').textContent = data.summary.newCustomers.toLocaleString();
    const customersGrowthEl = document.getElementById('customers-growth');
    customersGrowthEl.textContent = `${data.summary.customersGrowth > 0 ? '+' : ''}${data.summary.customersGrowth}%`;
    
    document.getElementById('total-income-value').textContent = `Rs. ${data.summary.totalIncome.toLocaleString()}`;
    
    // 3. Populate Tables
    renderDishesTable(data.dishes);
    renderEmployeesTable(data.employees);

    // 4. Render Charts
    renderSalesChart(data.sales);
    renderIncomeChart(data.summary);

    // 5. Render New Views
    renderNewViews(data);
  }

  function renderDishesTable(dishes) {
    const tbody = document.querySelector('#dishes-table tbody');
    tbody.innerHTML = '';
    
    // Sort by orders desc
    const sorted = [...dishes].sort((a, b) => b.orders - a.orders);

    sorted.forEach(dish => {
      const tagClass = dish.category === 'Food' ? 'tag-food' : (dish.category === 'Drinks' ? 'tag-drinks' : 'tag-other');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="item-row">
            <img src="${dish.imageUrl}" alt="${dish.name}" class="item-image">
            <span class="item-name">${dish.name}</span>
          </div>
        </td>
        <td><span class="category-tag ${tagClass}">${dish.category}</span></td>
        <td>${dish.orders.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  function renderEmployeesTable(employees) {
    const tbody = document.querySelector('#employees-table tbody');
    tbody.innerHTML = '';
    
    // Sort by earnings desc
    const sorted = [...employees].sort((a, b) => b.earnings - a.earnings);

    sorted.forEach(emp => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div class="item-row">
            <img src="${emp.avatarUrl}" alt="${emp.name}" class="item-image">
            <span class="item-name">${emp.name}</span>
          </div>
        </td>
        <td>${emp.role}</td>
        <td class="earnings-text">Rs. ${emp.earnings.toLocaleString()}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Chart Rendering with Chart.js
  function renderSalesChart(salesData) {
    const ctx = document.getElementById('salesChart').getContext('2d');
    
    if (salesChart) {
      salesChart.destroy();
    }

    const labels = salesData.map(d => d.timeLabel);
    const dataPoints = salesData.map(d => d.amount);

    salesChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Sales',
          data: dataPoints,
          borderColor: '#800000', /* Dark Red matching logo */
          backgroundColor: 'rgba(128, 0, 0, 0.1)',
          borderWidth: 3,
          tension: 0.4, /* Curved smooth line */
          fill: true,
          pointBackgroundColor: '#fff',
          pointBorderColor: '#800000',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: '#1E1E1E',
            padding: 10,
            displayColors: false,
            callbacks: {
              label: (context) => `${context.parsed.y} Orders`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#EAEAEA', borderDash: [5, 5] },
            border: { display: false }
          },
          x: {
            grid: { display: false },
            border: { display: false }
          }
        }
      }
    });
  }

  function renderIncomeChart(summaryData) {
    const ctx = document.getElementById('incomeChart').getContext('2d');
    
    if (incomeChart) {
      incomeChart.destroy();
    }

    document.getElementById('total-income-value').textContent = `Rs. ${summaryData.totalIncome.toLocaleString()}`;

    incomeChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Food', 'Drinks', 'Others'],
        datasets: [{
          data: [summaryData.foodIncome, summaryData.drinksIncome, summaryData.othersIncome],
          backgroundColor: ['#800000', '#EAB308', '#2C2C2C'],
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%', // Inner hole size
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => ` Rs. ${context.parsed.toLocaleString()}`
            }
          }
        }
      }
    });
  }

  // Dashboard Time Filter Click Handlers (Fetches Real Period Analytics)
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      const period = e.target.textContent.trim().toLowerCase();
      const freshData = await API.getDashboardData(period);
      if (freshData) {
        // Update summary numbers
        document.getElementById('total-orders-value').textContent = freshData.summary.totalOrders.toLocaleString();
        document.getElementById('orders-growth').textContent = `${freshData.summary.ordersGrowth > 0 ? '+' : ''}${freshData.summary.ordersGrowth}%`;
        document.getElementById('orders-growth').className = `summary-badge ${freshData.summary.ordersGrowth > 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('new-customers-value').textContent = freshData.summary.newCustomers.toLocaleString();
        document.getElementById('customers-growth').textContent = `${freshData.summary.customersGrowth > 0 ? '+' : ''}${freshData.summary.customersGrowth}%`;
        document.getElementById('customers-growth').className = `summary-badge ${freshData.summary.customersGrowth > 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('total-income-value').textContent = `Rs. ${freshData.summary.totalIncome.toLocaleString()}`;

        // Re-render trending dishes for that period
        renderDishesTable(freshData.dishes);

        // Update charts in place
        updateCharts(freshData);
      }
    });
  });

  // -- View Router --
  const views = document.querySelectorAll('.view-section');
  const navLinks = document.querySelectorAll('.sidebar-menu a[data-view]');
  const breadcrumbCurrent = document.querySelector('.breadcrumbs .current');
  const subHeaderTitle = document.querySelector('.sub-header h1');

  function switchView(viewId, title) {
    // Update active nav link
    document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
    const activeLink = document.querySelector(`.sidebar-menu a[data-view="${viewId}"]`);
    if (activeLink) activeLink.parentElement.classList.add('active');

    // Hide all views, show target
    views.forEach(view => view.classList.add('hidden'));
    document.getElementById(`view-${viewId}`).classList.remove('hidden');

    // Update Header
    breadcrumbCurrent.textContent = title;
    subHeaderTitle.textContent = title;

    // Special logic per view
    const timeFilters = document.querySelector('.time-filters');
    if (viewId === 'dashboard') {
      if (timeFilters) timeFilters.style.display = 'flex';
      if (salesChart && incomeChart) {
        salesChart.update();
        incomeChart.update();
      }
    } else {
      if (timeFilters) timeFilters.style.display = 'none';
    }
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewId = link.getAttribute('data-view');
      
      // Get title by filtering out children like badge
      let title = '';
      link.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
          title += node.textContent.trim() + ' ';
        }
      });
      title = title.trim();
      
      switchView(viewId, title);
    });
  });

  document.getElementById('open-profile-btn').addEventListener('click', () => {
    switchView('settings', 'Profile Settings');
  });

  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('user');
      appDashboard.classList.add('hidden');
      loginPage.classList.remove('hidden');
    });
  }
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', async () => {
      const newName = document.getElementById('settings-name').value;
      const newRole = document.getElementById('settings-role').value;
      const originalName = document.getElementById('profile-name').textContent;
      
      const result = await API.updateEmployee(newName, newRole, originalName);
      if (result.success) {
        alert('Profile settings saved successfully!');
        
        // Also update local storage session if user matching
        const user = JSON.parse(localStorage.getItem('user'));
        if (user) {
          user.username = newName.split(' ')[0].toLowerCase();
          user.role = newRole;
          localStorage.setItem('user', JSON.stringify(user));
        }

        // Refresh dashboard data & profile sidebar
        loadDashboard();
      } else {
        alert('Failed to update settings: ' + result.message);
      }
    });
  }
  // -- Render New Views --
  async function renderNewViews(data) {
    // Render Catalog (Food & Drinks)
    const catalogGrid = document.getElementById('catalog-grid');
    let currentFilter = 'All';
    const searchInput = document.querySelector('.search-bar input');

    function drawCatalog(filter = 'All', searchQuery = '') {
      catalogGrid.innerHTML = '';
      let filteredDishes = data.dishes;
      
      if (filter !== 'All') {
        filteredDishes = data.dishes.filter(d => d.category === filter);
      }
      
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        filteredDishes = filteredDishes.filter(d => d.name.toLowerCase().includes(q));
      }

      filteredDishes.forEach(dish => {
        catalogGrid.innerHTML += `
          <div class="catalog-item">
            <img src="${dish.imageUrl}" alt="${dish.name}">
            <div class="catalog-item-info">
              <div class="catalog-item-name">${dish.name}</div>
              <div class="catalog-item-price">Rs. ${Number(dish.price || 0).toFixed(2)}</div>
              <button class="btn-outline" onclick="window.addToCart(${dish.id})"><i class="fa-solid fa-cart-plus"></i> Add to Order</button>
            </div>
          </div>
        `;
      });
    }
    
    drawCatalog();

    if (searchInput) {
      searchInput.value = '';
      searchInput.addEventListener('input', (e) => {
        drawCatalog(currentFilter, e.target.value);
      });
    }
    
    // Catalog Filters
    const catalogFilters = document.querySelectorAll('.catalog-filter-btn');
    catalogFilters.forEach(btn => {
      btn.addEventListener('click', (e) => {
        catalogFilters.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.getAttribute('data-filter');
        drawCatalog(currentFilter, searchInput ? searchInput.value : '');
      });
    });

    // Render Bills
    const billsTbody = document.querySelector('#bills-table tbody');
    if (data.bills) {
      billsTbody.innerHTML = data.bills.map(bill => `
        <tr>
          <td><button class="btn-link" onclick="window.previewBill('${bill.id}')"><strong>${bill.id}</strong></button></td>
          <td>${bill.date}</td>
          <td>${bill.customer}</td>
          <td>Rs. ${bill.amount.toFixed(2)}</td>
          <td><span class="summary-badge ${bill.status === 'Paid' ? 'positive' : 'negative'}">${bill.status}</span></td>
        </tr>
      `).join('');
    }

    // Render Messages
    if (data.messages && notificationsList.length === 0 && (!window.hasInitializedNotifications)) {
      notificationsList = [...data.messages];
      window.hasInitializedNotifications = true;
    }
    renderNotifications();
  }

  // -- Modal Logic --
  const addItemModal = document.getElementById('add-item-modal');
  const addItemBtn = document.getElementById('add-item-btn');
  const closeModalBtns = [document.getElementById('close-modal-btn'), document.getElementById('cancel-modal-btn')];
  const addItemForm = document.getElementById('add-item-form');

  if (addItemBtn) {
    addItemBtn.addEventListener('click', () => addItemModal.classList.add('show'));
    closeModalBtns.forEach(btn => btn.addEventListener('click', () => addItemModal.classList.remove('show')));
    
    addItemForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newDish = {
        name: document.getElementById('item-name').value,
        category: document.getElementById('item-category').value,
        price: document.getElementById('item-price').value,
        imageUrl: document.getElementById('item-image').value
      };
      
      const result = await API.addDish(newDish);
      if (result.success) {
        // Refresh dashboard data
        const data = await API.getDashboardData();
        if(data) renderNewViews(data);
        addItemModal.classList.remove('show');
        addItemForm.reset();
      } else {
        alert('Failed to add item.');
      }
    });
  }

  // -- Cart & Order Checkout System --
  let cart = [];
  
  window.addToCart = function(dishId) {
    if (!dashboardData) return;
    const dish = dashboardData.dishes.find(d => d.id === dishId);
    if (!dish) return;

    const existing = cart.find(item => item.id === dishId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({
        id: dish.id,
        name: dish.name,
        category: dish.category,
        price: Number(dish.price || 0),
        quantity: 1
      });
    }
    renderCart();
  };

  window.updateQuantity = function(dishId, change) {
    const item = cart.find(item => item.id === dishId);
    if (!item) return;
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(item => item.id !== dishId);
    }
    renderCart();
  };

  window.removeFromCart = function(dishId) {
    cart = cart.filter(item => item.id !== dishId);
    renderCart();
  };

  function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTax = document.getElementById('cart-tax');
    const cartTotal = document.getElementById('cart-total');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (cart.length === 0) {
      cartItems.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding-top: 3.5rem;" id="empty-cart-message">
          <i class="fa-solid fa-basket-shopping" style="font-size: 2.2rem; margin-bottom: 0.75rem; color: #e5e7eb;"></i>
          <p style="font-size: 0.85rem;">No items in this order</p>
        </div>
      `;
      cartCount.textContent = '0';
      cartSubtotal.textContent = 'Rs. 0.00';
      cartTax.textContent = 'Rs. 0.00';
      cartTotal.textContent = 'Rs. 0.00';
      checkoutBtn.disabled = true;
      return;
    }

    checkoutBtn.disabled = false;
    let subtotal = 0;
    cartItems.innerHTML = '';
    
    cart.forEach(item => {
      const totalItemPrice = item.price * item.quantity;
      subtotal += totalItemPrice;
      
      cartItems.innerHTML += `
        <div class="cart-item-row">
          <div class="cart-item-details">
            <div class="cart-item-name">${item.name}</div>
            <div class="cart-item-price">Rs. ${item.price.toFixed(2)} x ${item.quantity}</div>
          </div>
          <div class="cart-item-qty-control">
            <button class="qty-btn" onclick="window.updateQuantity(${item.id}, -1)"><i class="fa-solid fa-minus"></i></button>
            <span class="cart-item-qty">${item.quantity}</span>
            <button class="qty-btn" onclick="window.updateQuantity(${item.id}, 1)"><i class="fa-solid fa-plus"></i></button>
            <button class="qty-btn-delete" onclick="window.removeFromCart(${item.id})"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
      `;
    });

    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartSubtotal.textContent = `Rs. ${subtotal.toFixed(2)}`;
    cartTax.textContent = `Rs. ${tax.toFixed(2)}`;
    cartTotal.textContent = `Rs. ${total.toFixed(2)}`;
  }

  function updateCharts(data) {
    if (salesChart) {
      salesChart.data.labels = data.sales.map(s => s.timeLabel);
      salesChart.data.datasets[0].data = data.sales.map(s => s.amount);
      salesChart.update();
    }
    if (incomeChart) {
      incomeChart.data.datasets[0].data = [data.summary.foodIncome, data.summary.drinksIncome, data.summary.othersIncome];
      incomeChart.update();
    }
  }

  // -- Checkout Modal Logic --
  const checkoutModal = document.getElementById('checkout-modal');
  const checkoutBtn = document.getElementById('checkout-btn');
  const closeCheckoutBtns = [
    document.getElementById('close-checkout-modal-btn'), 
    document.getElementById('cancel-checkout-modal-btn')
  ];
  const checkoutForm = document.getElementById('checkout-form');
  const modalPayable = document.getElementById('modal-payable');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      let subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
      let tax = subtotal * 0.10;
      let total = subtotal + tax;
      modalPayable.textContent = `Rs. ${total.toFixed(2)}`;
      checkoutModal.classList.add('show');
    });

    closeCheckoutBtns.forEach(btn => btn.addEventListener('click', () => checkoutModal.classList.remove('show')));

    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const orderType = document.getElementById('checkout-type').value;
      const orderCustomer = document.getElementById('checkout-customer').value;
      const paymentMethod = document.getElementById('checkout-payment').value;

      const orderData = {
        items: cart,
        customer: orderType === 'Takeaway' ? 'Takeaway' : `${orderType} (${orderCustomer})`,
        paymentMethod: paymentMethod
      };

      const cartCopy = [...cart];

      const result = await API.checkout(orderData);
      if (result.success) {
        // Print Receipt!
        printReceipt(result.bill, cartCopy);

        checkoutModal.classList.remove('show');
        cart = [];
        renderCart();
        
        // Refresh application data
        const freshData = await API.getDashboardData();
        if (freshData) {
          dashboardData = freshData;
          renderDishesTable(freshData.dishes);
          renderEmployeesTable(freshData.employees);
          renderNewViews(freshData);
          updateCharts(freshData);
          
          // Re-populate dashboard summary values
          document.getElementById('total-orders-value').textContent = freshData.summary.totalOrders.toLocaleString();
          document.getElementById('total-income-value').textContent = `Rs. ${freshData.summary.totalIncome.toLocaleString()}`;
        }
      } else {
        alert('Checkout failed!');
      }
    });
  }

  function printReceipt(bill, cartItems) {
    const printWindow = window.open('', '_blank', 'width=350,height=600');
    if (!printWindow) {
      alert("Popup blocker active! Please allow popups to print receipts.");
      return;
    }

    const itemsHtml = cartItems.map(item => `
      <tr>
        <td style="text-align: left; padding: 4px 0;">${item.name} x${item.quantity}</td>
        <td style="text-align: right; padding: 4px 0;">Rs. ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = subtotal * 0.10;
    const total = subtotal + tax;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt - ${bill.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
            body {
              font-family: 'Outfit', sans-serif;
              font-size: 12px;
              color: #333;
              padding: 20px;
              max-width: 300px;
              margin: 0 auto;
              text-align: center;
            }
            .logo {
              width: 80px;
              height: 80px;
              object-fit: contain;
              margin-bottom: 5px;
            }
            .title {
              font-size: 16px;
              font-weight: 700;
              margin-bottom: 5px;
              color: #800000;
            }
            .info {
              font-size: 10px;
              color: #666;
              margin-bottom: 15px;
              line-height: 1.4;
            }
            .divider {
              border-top: 1px dashed #ccc;
              margin: 10px 0;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              font-size: 11px;
              margin-bottom: 10px;
            }
            .totals-table td {
              padding: 2px 0;
            }
            .total-row {
              font-weight: 700;
              font-size: 13px;
              color: #000;
            }
            .footer {
              margin-top: 25px;
              font-size: 9px;
              color: #888;
            }
          </style>
        </head>
        <body>
          <img class="logo" src="images/logo.png" alt="Logo">
          <div class="title">Teen's Cafe - Anuradhapura</div>
          <div class="info">
            Stage 3, Anuradhapura, Sri Lanka<br>
            Tel: 0711853911 / 0762043911
          </div>
          
          <div class="divider"></div>
          
          <div style="display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 5px;">
            <span><strong>Bill ID:</strong> ${bill.id}</span>
            <span><strong>Date:</strong> ${bill.date}</span>
          </div>
          <div style="text-align: left; font-size: 10px; margin-bottom: 10px;">
            <strong>Order Details:</strong> ${bill.customer}
          </div>
          
          <div class="divider"></div>
          
          <table>
            <thead>
              <tr style="border-bottom: 1px solid #eee;">
                <th style="text-align: left; padding-bottom: 4px;">Item</th>
                <th style="text-align: right; padding-bottom: 4px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div class="divider"></div>
          
          <table class="totals-table">
            <tr>
              <td style="text-align: left;">Subtotal</td>
              <td style="text-align: right;">Rs. ${subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="text-align: left;">Tax (10%)</td>
              <td style="text-align: right;">Rs. ${tax.toFixed(2)}</td>
            </tr>
            <tr class="total-row">
              <td style="text-align: left; padding-top: 6px;">Total Paid</td>
              <td style="text-align: right; padding-top: 6px; color: #800000;">Rs. ${total.toFixed(2)}</td>
            </tr>
          </table>
          
          <div class="divider"></div>
          
          <div class="footer">
            Thank you for dining with us!<br>
            Powered by j&co. software solutions
          </div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            }
          <\/script>
        </body>
      </html>
    `);
    printWindow.document.close();
  }

  // -- Bill Preview Modal Logic --
  window.previewBill = function(billId) {
    if (!dashboardData || !dashboardData.bills) return;
    const bill = dashboardData.bills.find(b => b.id === billId);
    if (!bill) return;

    const modal = document.getElementById('bill-preview-modal');
    const content = document.getElementById('bill-preview-content');

    const itemsListHtml = bill.items && bill.items.length > 0
      ? bill.items.map(item => `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.85rem; border-bottom: 1px dashed rgba(0,0,0,0.05); padding-bottom: 0.25rem;">
            <span>${item.name} <strong>x${item.quantity}</strong></span>
            <span>Rs. ${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `).join('')
      : `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.4rem; font-size: 0.85rem;">
            <span>Cafe Service (Food & Drinks)</span>
            <span>Rs. ${Number(bill.amount * 0.9).toFixed(2)}</span>
          </div>
        `;

    const subtotal = bill.items && bill.items.length > 0
      ? bill.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
      : bill.amount * 0.9;
    const tax = subtotal * 0.10;

    content.innerHTML = `
      <div style="text-align: center; margin-bottom: 1.25rem;">
        <h4 style="margin: 0; color: var(--primary); font-size: 1.1rem; font-weight: 700;">Teen's Cafe - Anuradhapura</h4>
        <p style="font-size: 0.75rem; color: var(--text-muted); margin: 0.25rem 0 0 0;">Stage 3, Anuradhapura</p>
      </div>
      <div style="border-bottom: 1px dashed var(--border-color); padding-bottom: 0.75rem; margin-bottom: 0.75rem; font-size: 0.8rem; display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.4rem; line-height: 1.4;">
        <div><strong>Bill ID:</strong> ${bill.id}</div>
        <div style="text-align: right;"><strong>Date:</strong> ${bill.date}</div>
        <div><strong>Customer:</strong> ${bill.customer}</div>
        <div style="text-align: right;"><strong>Status:</strong> <span class="summary-badge positive">${bill.status}</span></div>
      </div>
      <div style="max-height: 150px; overflow-y: auto; margin-bottom: 0.75rem; padding-right: 0.25rem;">
        ${itemsListHtml}
      </div>
      <div style="border-top: 1px dashed var(--border-color); padding-top: 0.75rem; font-size: 0.85rem; line-height: 1.5;">
        <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
          <span>Subtotal:</span>
          <span>Rs. ${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; color: var(--text-muted);">
          <span>Tax (10%):</span>
          <span>Rs. ${tax.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--primary); font-size: 1.05rem; margin-top: 0.4rem;">
          <span>Total Paid:</span>
          <span>Rs. ${Number(bill.amount).toFixed(2)}</span>
        </div>
      </div>
    `;

    const reprintBtn = document.getElementById('print-preview-bill-btn');
    reprintBtn.onclick = () => {
      const printItems = bill.items && bill.items.length > 0 
        ? bill.items 
        : [{ name: 'Cafe Service', price: bill.amount * 0.9, quantity: 1 }];
      printReceipt(bill, printItems);
    };

    modal.classList.add('show');
  };

  const closePreviewModalBtns = [
    document.getElementById('close-preview-modal-btn'),
    document.getElementById('close-preview-modal-btn-2')
  ];
  closePreviewModalBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => {
      document.getElementById('bill-preview-modal').classList.remove('show');
    });
  });

  // -- Shift Attendance Logic (Clock Icon) --
  const shiftModal = document.getElementById('shift-modal');
  const clockBtn = document.getElementById('header-clock-btn');
  const closeShiftModalBtn = document.getElementById('close-shift-modal-btn');
  const shiftToggleBtn = document.getElementById('shift-toggle-btn');
  const shiftTimerEl = document.getElementById('shift-timer');
  const shiftStatusEl = document.getElementById('shift-status');

  let shiftTimer = null;
  let elapsedSeconds = 4 * 3600 + 15 * 60 + 32;
  let isClockedIn = true;

  function formatTime(secs) {
    const hours = String(Math.floor(secs / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((secs % 3600) / 60)).padStart(2, '0');
    const seconds = String(secs % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  }

  function startShiftTimer() {
    if (shiftTimer) clearInterval(shiftTimer);
    shiftTimer = setInterval(() => {
      elapsedSeconds++;
      if (shiftTimerEl) shiftTimerEl.textContent = formatTime(elapsedSeconds);
    }, 1000);
  }

  function stopShiftTimer() {
    if (shiftTimer) clearInterval(shiftTimer);
  }

  startShiftTimer();

  if (clockBtn) {
    clockBtn.addEventListener('click', () => {
      const profileName = document.getElementById('profile-name').textContent;
      const profileRole = document.getElementById('profile-role').textContent.split(' • ')[0];
      
      document.getElementById('shift-emp-name').textContent = profileName;
      document.getElementById('shift-emp-role').textContent = profileRole;
      
      shiftModal.classList.add('show');
    });

    closeShiftModalBtn.addEventListener('click', () => shiftModal.classList.remove('show'));

    shiftToggleBtn.addEventListener('click', () => {
      const profileRoleEl = document.getElementById('profile-role');
      const profileRoleText = profileRoleEl.textContent.split(' • ')[0];

      if (isClockedIn) {
        isClockedIn = false;
        stopShiftTimer();
        shiftStatusEl.textContent = 'Clocked Out';
        shiftStatusEl.className = 'summary-badge negative';
        shiftToggleBtn.textContent = 'Clock In';
        profileRoleEl.textContent = `${profileRoleText} • Off Duty`;
      } else {
        isClockedIn = true;
        startShiftTimer();
        shiftStatusEl.textContent = 'Clocked In';
        shiftStatusEl.className = 'summary-badge positive';
        shiftToggleBtn.textContent = 'Clock Out';
        profileRoleEl.textContent = `${profileRoleText} • Active`;
      }
    });
  }

  // -- Notification Dropdown Logic (Bell Icon) --
  const notificationBtn = document.getElementById('header-notification-btn');
  const notificationDropdown = document.getElementById('notification-dropdown');
  const dropdownNotificationsList = document.getElementById('dropdown-notifications-list');
  const dropdownBadgeCount = document.getElementById('dropdown-badge-count');
  const clearNotificationsBtn = document.getElementById('clear-notifications-btn');
  const bellBadgeDot = document.querySelector('#header-notification-btn .dot');

  function renderNotifications() {
    // 1. Sidebar Badge Count
    const sidebarCountEl = document.getElementById('sidebar-notifications-count');
    if (sidebarCountEl) {
      sidebarCountEl.textContent = notificationsList.length;
      sidebarCountEl.style.display = notificationsList.length > 0 ? 'inline-block' : 'none';
    }

    // 2. Header Bell Badge Dot
    if (bellBadgeDot) {
      bellBadgeDot.style.display = notificationsList.length > 0 ? 'block' : 'none';
    }

    // 3. Header Dropdown Count
    if (dropdownBadgeCount) {
      dropdownBadgeCount.textContent = notificationsList.length;
    }

    // 4. Header Dropdown List
    if (dropdownNotificationsList) {
      if (notificationsList.length === 0) {
        dropdownNotificationsList.innerHTML = `
          <div style="padding: 2rem; text-align: center; color: var(--text-muted); font-size: 0.8rem;">
            No new alerts
          </div>
        `;
      } else {
        dropdownNotificationsList.innerHTML = notificationsList.map(noti => `
          <div class="dropdown-item" onclick="window.removeNotification(${noti.id}, event)">
            <div class="dropdown-item-icon ${noti.type}">
              <i class="fa-solid ${noti.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-bell'}"></i>
            </div>
            <div class="dropdown-item-content">
              <h5>${noti.title}</h5>
              <p>${noti.text}</p>
              <span class="dropdown-item-time"><i class="fa-regular fa-clock"></i> ${noti.time}</span>
            </div>
          </div>
        `).join('');
      }
    }

    // 5. Main Messages Tab Page List
    const messagesList = document.getElementById('messages-list');
    if (messagesList) {
      if (notificationsList.length === 0) {
        messagesList.innerHTML = `
          <div style="padding: 3rem; text-align: center; color: var(--text-muted); width: 100%;">
            <i class="fa-regular fa-bell-slash" style="font-size: 3rem; margin-bottom: 1rem; color: var(--border-color); display: block;"></i>
            <p>No new system notifications</p>
          </div>
        `;
      } else {
        messagesList.innerHTML = notificationsList.map(msg => `
          <div class="message-item" style="position: relative;">
            <button class="qty-btn-delete" onclick="window.removeNotification(${msg.id}, event)" style="position: absolute; right: 1.5rem; top: 1.5rem; background: none; border: none; font-size: 1.1rem; cursor: pointer; color: var(--text-muted); transition: color 0.2s;"><i class="fa-regular fa-trash-can"></i></button>
            <div class="message-icon ${msg.type}">
              <i class="fa-solid ${msg.type === 'warning' ? 'fa-triangle-exclamation' : 'fa-bell'}"></i>
            </div>
            <div class="message-content">
              <h4>${msg.title}</h4>
              <p>${msg.text}</p>
              <span class="message-time"><i class="fa-regular fa-clock"></i> ${msg.time}</span>
            </div>
          </div>
        `).join('');
      }
    }
  }

  window.removeNotification = function(id, event) {
    if (event) event.stopPropagation();
    notificationsList = notificationsList.filter(n => n.id !== id);
    renderNotifications();
  };

  if (notificationBtn) {
    notificationBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notificationDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (notificationDropdown && !notificationDropdown.contains(e.target) && !notificationBtn.contains(e.target)) {
        notificationDropdown.classList.remove('show');
      }
    });

    if (clearNotificationsBtn) {
      clearNotificationsBtn.addEventListener('click', (e) => {
        e.preventDefault();
        notificationsList = [];
        renderNotifications();
      });
    }
  }

});
