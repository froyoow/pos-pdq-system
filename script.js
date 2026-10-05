const products = [
  { id: 1, name: 'Coffee', price: 2.5 },
  { id: 2, name: 'Sandwich', price: 5.8 },
  { id: 3, name: 'Tea', price: 2.1 },
  { id: 4, name: 'Cake', price: 3.6 },
  { id: 5, name: 'Burger', price: 7.2 },
  { id: 6, name: 'Smoothie', price: 4.4 }
];

let cart = [];
let planCart = [];
let cryptoCart = [];
let transactions = [];

const testCards = {
  '5555555555554444': { type: 'Mastercard', status: 'approved' },
  '4242424242424242': { type: 'Visa', status: 'approved' },
  '4000000000000002': { type: 'Card', status: 'declined' }
};

function initProducts() {
  ['productList', 'planProductList', 'cryptoProductList'].forEach(id => {
    const list = document.getElementById(id);
    list.innerHTML = products.map(p => `
      <div class="product-item">
        <div>
          <div class="product-name">${p.name}</div>
          <div class="product-price">$${p.price.toFixed(2)}</div>
        </div>
        <button class="product-btn" onclick="addToCart('${id}', ${p.id})">Add</button>
      </div>
    `).join('');
  });
}

function addToCart(listId, id) {
  const product = products.find(p => p.id === id);
  let cart;
  let totalElem;

  if (listId === 'productList') {
    cart = window.cart;
    totalElem = 'saleTotal';
  } else if (listId === 'planProductList') {
    cart = window.planCart;
    totalElem = 'planSaleTotal';
  } else {
    cart = window.cryptoCart;
    totalElem = 'cryptoTotal';
  }

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id, qty: 1, price: product.price });
  }

  updateTotal(totalElem, cart);
}

function updateTotal(elemId, cart) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById(elemId).textContent = `$${total.toFixed(2)}`;
}

// TAB SWITCHING
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const tabName = btn.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(tabName).classList.add('active');
  });
});

// CARD FORM
document.getElementById('cardForm').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!cart.length) {
    alert('Cart is empty');
    return;
  }

  const name = document.getElementById('cardName').value.trim();
  const cardNum = document.getElementById('cardNumber').value.replace(/\s+/g, '');
  const expiry = document.getElementById('expiry').value;
  const cvv = document.getElementById('cvv').value;

  if (!name || !cardNum || !expiry || !cvv) {
    alert('Please fill all fields');
    return;
  }

  const cardInfo = testCards[cardNum];
  if (!cardInfo) {
    addTransaction('Card', 'Payment', cart, cardNum, 'N/A', 'Declined');
    alert('Card declined - invalid test card');
    return;
  }

  if (cardInfo.status === 'declined') {
    addTransaction('Card', 'Payment', cart, cardNum, 'N/A', 'Declined');
    alert('Card declined');
    return;
  }

  addTransaction('Card', 'Payment', cart, cardNum.slice(-4), 'N/A', 'Approved');
  cart = [];
  updateTotal('saleTotal', cart);
  document.getElementById('cardForm').reset();
});

// PAYMENT PLAN FORM
document.getElementById('planForm').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!planCart.length) {
    alert('Cart is empty');
    return;
  }

  const name = document.getElementById('planCardName').value.trim();
  const cardNum = document.getElementById('planCardNumber').value.replace(/\s+/g, '');
  const expiry = document.getElementById('planExpiry').value;
  const cvv = document.getElementById('planCvv').value;
  const installments = document.getElementById('installments').value;

  if (!name || !cardNum || !expiry || !cvv) {
    alert('Please fill all fields');
    return;
  }

  const cardInfo = testCards[cardNum];
  if (!cardInfo || cardInfo.status === 'declined') {
    addTransaction('Plan', `Payment (${installments}x)`, planCart, cardNum, 'N/A', 'Declined');
    alert('Card declined');
    return;
  }

  addTransaction('Plan', `Payment (${installments}x)`, planCart, cardNum.slice(-4), 'N/A', 'Approved');
  planCart = [];
  updateTotal('planSaleTotal', planCart);
  document.getElementById('planForm').reset();
});

// CRYPTO PAYOUT FORM
document.getElementById('cryptoForm').addEventListener('submit', (e) => {
  e.preventDefault();

  if (!cryptoCart.length) {
    alert('Payout amount is empty');
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

  addTransaction('Crypto', `Payout (${network})`, cryptoCart, wallet.substring(0, 12) + '...', approvalCode, 'Approved');
  cryptoCart = [];
  updateTotal('cryptoTotal', cryptoCart);
  document.getElementById('cryptoForm').reset();
});

function addTransaction(mode, type, cart, account, code, status) {
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const timestamp = new Date().toLocaleTimeString();

  const tx = {
    time: timestamp,
    mode: mode,
    type: type,
    amount: `$${total.toFixed(2)}`,
    account: account,
    code: code !== 'N/A' ? code : '--',
    status: status
  };

  transactions.push(tx);
  renderTransactions();
}

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
      <td>${tx.account}</td>
      <td>${tx.code}</td>
      <td>${tx.status}</td>
    </tr>
  `).join('');
}

initProducts();
updateTotal('saleTotal', cart);
updateTotal('planSaleTotal', planCart);
updateTotal('cryptoTotal', cryptoCart);
