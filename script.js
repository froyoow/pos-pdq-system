const products = [
  { id: 1, name: 'Coffee', price: 2.5, icon: '☕' },
  { id: 2, name: 'Sandwich', price: 5.8, icon: '🥪' },
  { id: 3, name: 'Tea', price: 2.1, icon: '🫖' },
  { id: 4, name: 'Cake', price: 3.6, icon: '🍰' },
  { id: 5, name: 'Burger', price: 7.2, icon: '🍔' },
  { id: 6, name: 'Smoothie', price: 4.4, icon: '🥤' }
];

const state = {
  currency: 'USD',
  cart: []
};

const productList = document.getElementById('productList');
const cartItems = document.getElementById('cartItems');
const subtotalValue = document.getElementById('subtotalValue');
const taxValue = document.getElementById('taxValue');
const totalValue = document.getElementById('totalValue');
const terminalCurrency = document.getElementById('terminalCurrency');
const terminalAmount = document.getElementById('terminalAmount');
const terminalCard = document.getElementById('terminalCard');
const terminalRef = document.getElementById('terminalRef');
const terminalMessage = document.getElementById('terminalMessage');
const receiptContent = document.getElementById('receiptContent');
const paymentForm = document.getElementById('paymentForm');
const clearCartBtn = document.getElementById('clearCartBtn');
const orderNumber = document.getElementById('orderNumber');

const cardNumberInput = document.getElementById('cardNumber');
const expiryInput = document.getElementById('expiry');
const cvvInput = document.getElementById('cvv');

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: state.currency,
    minimumFractionDigits: 2
  }).format(amount);
}

function formatReceiptAmount(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: state.currency,
    minimumFractionDigits: 2
  }).format(amount);
}

function getCurrencyRate() {
  return state.currency === 'USD' ? 1 : 0.92;
}

function renderProducts() {
  productList.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
          <div class="product-info">
            <div class="product-icon">${product.icon}</div>
            <div>
              <p class="product-name">${product.name}</p>
              <p class="product-meta">Fresh item</p>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="product-price">${formatCurrency(product.price * getCurrencyRate())}</span>
            <button class="add-btn" data-id="${product.id}" type="button">Add</button>
          </div>
        </div>
      `
    )
    .join('');

  document.querySelectorAll('.add-btn').forEach((button) => {
    button.addEventListener('click', () => addToCart(Number(button.dataset.id)));
  });
}

function addToCart(productId) {
  const existing = state.cart.find((item) => item.id === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    state.cart.push({ id: productId, quantity: 1 });
  }
  renderCart();
}

function removeCartItem(productId) {
  state.cart = state.cart.filter((item) => item.id !== productId);
  renderCart();
}

function renderCart() {
  if (!state.cart.length) {
    cartItems.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
    updateTotals();
    return;
  }

  const items = state.cart
    .map((item) => {
      const product = products.find((p) => p.id === item.id);
      if (!product) return '';
      const itemTotal = product.price * item.quantity * getCurrencyRate();
      return `
        <div class="cart-item">
          <div class="cart-item-details">
            <span class="qty-pill">${item.quantity}</span>
            <div>
              <div class="cart-item-name">${product.name}</div>
              <small>${formatCurrency(product.price * getCurrencyRate())} each</small>
            </div>
          </div>
          <div style="display:flex; align-items:center; gap:12px;">
            <span class="cart-item-total">${formatCurrency(itemTotal)}</span>
            <button class="text-btn" type="button" data-remove-id="${product.id}" aria-label="Remove ${product.name}">Remove</button>
          </div>
        </div>
      `;
    })
    .join('');

  cartItems.innerHTML = items;

  document.querySelectorAll('[data-remove-id]').forEach((button) => {
    button.addEventListener('click', () => removeCartItem(Number(button.dataset.removeId)));
  });

  updateTotals();
}

function updateTotals() {
  const subtotal = state.cart.reduce((sum, cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    return sum + (product ? product.price * cartItem.quantity : 0) * getCurrencyRate();
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  subtotalValue.textContent = formatCurrency(subtotal);
  taxValue.textContent = formatCurrency(tax);
  totalValue.textContent = formatCurrency(total);
  terminalAmount.textContent = formatCurrency(total);
  terminalCurrency.textContent = state.currency;
}

function setCurrency(currency) {
  state.currency = currency;
  document.querySelectorAll('.currency-btn').forEach((button) => {
    button.classList.toggle('active', button.dataset.currency === currency);
  });
  renderProducts();
  renderCart();
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function detectCardType(cardNumber) {
  const digits = cardNumber.replace(/\s+/g, '');
  if (/^4/.test(digits)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  return 'Unsupported';
}

function isValidLuhn(cardNumber) {
  const digits = cardNumber.replace(/\s+/g, '');
  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i--) {
    let digit = parseInt(digits.charAt(i), 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function showTerminal(status, message) {
  terminalMessage.className = `terminal-message ${status}`;
  terminalMessage.textContent = message;
}

function updateReceipt(record) {
  receiptContent.innerHTML = `
    <div class="receipt-item"><span>Card</span><strong>${record.cardType}</strong></div>
    <div class="receipt-item"><span>Currency</span><strong>${state.currency}</strong></div>
    <div class="receipt-item"><span>Reference</span><strong>${record.ref}</strong></div>
    <div class="receipt-item"><span>Status</span><strong>${record.status}</strong></div>
    <div class="receipt-total">Total: ${formatReceiptAmount(record.total)}</div>
  `;
}

function generateOrderNumber() {
  return `#${Math.floor(1000 + Math.random() * 9000)}`;
}

function paymentSuccess(response) {
  showTerminal('success', `Approved: ${response.cardType} payment`);
  updateReceipt(response);
}

function paymentFailure(message) {
  showTerminal('error', message);
  receiptContent.innerHTML = `<p>${message}</p>`;
}

paymentForm.addEventListener('submit', (event) => {
  event.preventDefault();

  if (!state.cart.length) {
    paymentFailure('Cart is empty. Add at least one product.');
    return;
  }

  const name = document.getElementById('cardName').value.trim();
  const rawCardNumber = cardNumberInput.value.trim();
  const expiry = expiryInput.value.trim();
  const cvv = cvvInput.value.trim();

  const cardType = detectCardType(rawCardNumber);
  const cleanCardNumber = rawCardNumber.replace(/\s+/g, '');

  if (!name || !rawCardNumber || !expiry || !cvv) {
    paymentFailure('Please complete all card fields.');
    return;
  }

  if (cardType === 'Unsupported') {
    paymentFailure('Only Visa and Mastercard are accepted.');
    return;
  }

  if (!isValidLuhn(cleanCardNumber)) {
    paymentFailure('Card number is invalid.');
    return;
  }

  if (!/^(0[1-9]|1[0-2])\/?\d{2}$/.test(expiry)) {
    paymentFailure('Expiry date is invalid.');
    return;
  }

  if (!/^\d{3,4}$/.test(cvv)) {
    paymentFailure('CVV is invalid.');
    return;
  }

  const subtotal = state.cart.reduce((sum, cartItem) => {
    const product = products.find((p) => p.id === cartItem.id);
    return sum + (product ? product.price * cartItem.quantity : 0) * getCurrencyRate();
  }, 0);

  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const ref = `PDQ-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

  terminalCard.textContent = cardType;
  terminalRef.textContent = ref;

  const approved = {
    cardType,
    ref,
    status: 'Approved',
    total,
    name
  };

  paymentSuccess(approved);
  orderNumber.textContent = generateOrderNumber();
  state.cart = [];
  renderCart();
  paymentForm.reset();
});

clearCartBtn.addEventListener('click', () => {
  state.cart = [];
  renderCart();
  showTerminal('active', 'Ready for card payment');
  terminalCard.textContent = '--';
  terminalRef.textContent = '--';
});

document.querySelectorAll('.currency-btn').forEach((button) => {
  button.addEventListener('click', () => setCurrency(button.dataset.currency));
});

cardNumberInput.addEventListener('input', (event) => {
  event.target.value = formatCardNumber(event.target.value);
});

expiryInput.addEventListener('input', (event) => {
  event.target.value = formatExpiry(event.target.value);
});

renderProducts();
renderCart();
updateTotals();
showTerminal('active', 'Ready for card payment');







































































































































































