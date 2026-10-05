const products = [
  { id: 1, name: 'Coffee', price: 2.5 },
  { id: 2, name: 'Sandwich', price: 5.8 },
  { id: 3, name: 'Tea', price: 2.1 },
  { id: 4, name: 'Cake', price: 3.6 },
  { id: 5, name: 'Burger', price: 7.2 },
  { id: 6, name: 'Smoothie', price: 4.4 }
];

let cart = [];
let transactions = [];

function renderProducts() {
  const list = document.getElementById('productList');
  list.innerHTML = products.map(p => `
    <div class="product-item">
      <div>
        <div class="product-name">${p.name}</div>
        <div class="product-price">$${p.price.toFixed(2)}</div>
      </div>
      <button class="product-btn" onclick="addToCart(${p.id})">Add</button>
    </div>
  `).join('');
}

function addToCart(id) {
  const product = products.find(p => p.id === id);
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1, price: product.price });
  }
  updateTotal();
}

function updateTotal() {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById('saleTotal').textContent = `$${total.toFixed(2)}`;
}

document.getElementById('paymentForm').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!cart.length) {
    alert('Cart is empty');
    return;
  }

  const wallet = document.getElementById('walletAddr').value.trim();
  const network = document.getElementById('network').value;
  const cryptoAmount = document.getElementById('cryptoAmount').value.trim();
  const approvalCode = document.getElementById('approvalCode').value.trim();

  if (!wallet || !cryptoAmount || !approvalCode) {
    alert('Please fill all fields');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const timestamp = new Date().toLocaleTimeString();

  const tx = {
    time: timestamp,
    mode: 'Crypto',
    type: 'Deposit',
    amount: `$${total.toFixed(2)}`,
    wallet: wallet.substring(0, 12) + '...',
    approvalCode: approvalCode,
    status: 'Approved'
  };

  transactions.push(tx);
  renderTransactions();
  cart = [];
  updateTotal();
  document.getElementById('paymentForm').reset();
});

function renderTransactions() {
  const tbody = document.getElementById('txTable');
  if (!transactions.length) {
    tbody.innerHTML = '<tr class="empty-msg"><td colspan="7">No sales yet. Take a payment to fill the store.</td></tr>';
    return;
  }
  tbody.innerHTML = transactions.map(tx => `
    <tr>
      <td>${tx.time}</td>
      <td>${tx.mode}</td>
      <td>${tx.type}</td>
      <td>${tx.amount}</td>
      <td>${tx.wallet}</td>
      <td>${tx.approvalCode}</td>
      <td>${tx.status}</td>
    </tr>
  `).join('');
}

renderProducts();
