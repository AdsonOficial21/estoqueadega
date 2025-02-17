// Firebase configuration and initialization
const firebaseConfig = {
  apiKey: "AIzaSyAnm-EmgmbiUYOyPIAQllZTKPpoZgp1M6o",
  authDomain: "estoque-bf8eb.firebaseapp.com",
  databaseURL: "https://estoque-bf8eb-default-rtdb.firebaseio.com",
  projectId: "estoque-bf8eb",
  storageBucket: "estoque-bf8eb.firebasestorage.app",
  messagingSenderId: "477486729632",
  appId: "1:477486729632:web:2e8faf41acd0bb6fb17cc5"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

const SALES_PER_PAGE = 20;

window.openSaleModal = function() {
  const modalOverlay = document.getElementById('saleModalOverlay');
  modalOverlay.style.display = 'block';
  
  // Clear all product selections and search results
  const searchResults = document.getElementById('searchResults');
  const selectedProducts = document.querySelector('.selected-products-list');
  const searchInput = document.getElementById('saleProductSearch');
  const selectedProductsSection = document.getElementById('selectedProducts');
  const saleFormButtons = document.querySelector('.sale-form-buttons');
  const grandTotal = document.getElementById('grandTotal');

  // Clear all content
  searchResults.innerHTML = '';
  if (selectedProducts) selectedProducts.innerHTML = '';
  if (searchInput) searchInput.value = '';
  if (selectedProductsSection) selectedProductsSection.style.display = 'none';
  if (saleFormButtons) saleFormButtons.style.display = 'none';
  if (grandTotal) grandTotal.remove();
  
  // Add autofocus to the search input
  setTimeout(() => {
    if (searchInput) {
      searchInput.focus();
    }
  }, 100);
};

window.closeSaleModal = function() {
  const modalOverlay = document.getElementById('saleModalOverlay');
  modalOverlay.style.display = 'none';
  // Clear all content
  document.getElementById('searchResults').innerHTML = '';
  document.querySelector('.selected-products-list').innerHTML = '';
  const paymentInfo = document.querySelector('.payment-info');
  if (paymentInfo) paymentInfo.remove();
};

window.openQuantityModal = function(productId) {
  const product = window.products.find(p => p.id === productId);
  if (!product) return;

  const modalHTML = `
    <div class="quantity-modal">
      <div class="quantity-modal-content">
        <h2>Digite a quantidade</h2>
        <input type="number" class="quantity-input" id="quantityInput" 
               min="1" max="${product.quantity}">
        <div class="quantity-modal-buttons">
          <button class="quantity-modal-button confirm-button" 
                  onclick="confirmQuantity('${productId}')">
            Confirmar
          </button>
          <button class="quantity-modal-button back-button" 
                  onclick="closeQuantityModal()">
            Voltar
          </button>
        </div>
        <div class="error-message"></div>
      </div>
    </div>
  `;

  const quantityModalOverlay = document.createElement('div');
  quantityModalOverlay.className = 'quantity-modal-overlay';
  quantityModalOverlay.id = 'quantityModalOverlay';
  quantityModalOverlay.innerHTML = modalHTML;
  document.body.appendChild(quantityModalOverlay);
  quantityModalOverlay.style.display = 'block';
  
  // Add autofocus and input event listener to the quantity input
  setTimeout(() => {
    const quantityInput = document.getElementById('quantityInput');
    const errorMessage = document.querySelector('.error-message');
    
    if (quantityInput) {
      quantityInput.focus();
      
      // Add keypress event listener for Enter key
      quantityInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault(); // Prevent default form submission
          confirmQuantity(productId);
        }
      });
      
      // Remove blinking effect when user starts typing
      quantityInput.addEventListener('input', function() {
        this.classList.remove('blink');
        errorMessage.style.display = 'none';
        this.classList.remove('input-error');
        
        const value = this.value.trim();
        if (value !== '') {
          const numValue = parseInt(value);
          if (numValue > product.quantity) {
            errorMessage.textContent = `Quantidade inválida. Máximo: ${product.quantity}`;
            errorMessage.style.display = 'block';
            this.classList.add('input-error');
          }
        }
      });
    }
  }, 100);
};

window.closeQuantityModal = function() {
  const modalOverlay = document.getElementById('quantityModalOverlay');
  if (modalOverlay) {
    modalOverlay.remove();
  }
  
  // Clear search input and results when closing quantity modal
  const searchInput = document.getElementById('saleProductSearch');
  const searchResults = document.getElementById('searchResults');
  if (searchInput) {
    searchInput.value = '';
    // Add focus after a slight delay to ensure proper focus
    setTimeout(() => {
      searchInput.focus();
    }, 100);
  }
  if (searchResults) searchResults.innerHTML = '';
};

window.confirmQuantity = function(productId) {
  const product = window.products.find(p => p.id === productId);
  const quantityInput = document.getElementById('quantityInput');
  const quantity = parseInt(quantityInput.value);
  const errorMessage = document.querySelector('.error-message');

  // Check if quantity is empty or zero
  if (!quantityInput.value.trim() || quantity === 0) {
    errorMessage.textContent = 'Por favor, digite uma quantidade';
    errorMessage.style.display = 'block';
    quantityInput.classList.add('input-error');
    quantityInput.classList.add('blink'); // Add blinking effect
    quantityInput.focus(); // Keep focus on the input
    return;
  }

  // Remove blinking effect if value is valid
  quantityInput.classList.remove('blink');

  // Rest of the existing confirmQuantity function code...
  if (!product || isNaN(quantity) || quantity < 1 || quantity > product.quantity) {
    // Show error message
    errorMessage.textContent = `Quantidade inválida. Máximo: ${product.quantity}`;
    errorMessage.style.display = 'block';
    quantityInput.classList.add('input-error');
    return;
  }

  // Clear error state if valid
  errorMessage.style.display = 'none';
  quantityInput.classList.remove('input-error');

  const selectedProductsList = document.querySelector('.selected-products-list');
  const existingProduct = selectedProductsList.querySelector(`[data-product-id="${productId}"]`);

  // Get references to the elements
  const selectedProductsSection = document.getElementById('selectedProducts');
  const saleFormButtons = document.querySelector('.sale-form-buttons');

  // Show the selected products section and buttons if they're hidden
  if (selectedProductsSection.style.display === 'none') {
    selectedProductsSection.style.display = 'block';
    saleFormButtons.style.display = 'flex'; // Show buttons when products are selected
  }

  if (!existingProduct) {
    selectedProductsList.innerHTML += `
      <div class="selected-product-item" data-product-id="${productId}">
        <div class="selected-product-info">
          <img src="${product.image}" alt="${product.name}" class="selected-product-image">
          <span class="product-name">${product.name}</span>
          <span class="separator">|</span>
          <span class="product-price">
            R$ <span class="unit-price">${product.price.toFixed(2)}</span>
          </span>
          <span class="separator">|</span>
          <span class="quantity-label">Quantidade: </span>
          <input type="number" value="${quantity}" min="1" max="${product.quantity}" 
                 oninput="updateQuantityRealTime('${productId}', this.value)"
                 onfocus="this.select()">
          <span class="separator">|</span>
          <span class="total-price">
            Total: R$ <span class="total-value">${(product.price * quantity).toFixed(2)}</span>
          </span>
          <div class="discount-wrapper">
            <span class="discount-label">Digite o valor do desconto:</span>
            <input type="number" 
                   class="discount-input" 
                   value="" 
                   min="0" 
                   step="0.01"
                   oninput="updateDiscount('${productId}', this.value)"
                   onfocus="this.select()"
                   placeholder="Desconto?">
          </div>
        </div>
        <button class="remove-product" onclick="removeSelectedProduct('${productId}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
  }

  // Update the grand total
  updateGrandTotal();

  // Add payment info section if it doesn't exist
  let paymentInfo = document.querySelector('.payment-info');
  if (!paymentInfo) {
    paymentInfo = document.createElement('div');
    paymentInfo.className = 'payment-info';
    paymentInfo.innerHTML = `
      <div class="payment-info-content">
        <span class="payment-label">Valor Recebido: R$</span>
        <input type="number" class="customer-payment-input" 
               min="0" step="0.01" oninput="calculateChange(this.value)">
      </div>
      <div class="change-amount" style="display: none;"></div>
    `;
    
    // Insert payment info before grand total
    const grandTotal = document.getElementById('grandTotal');
    grandTotal.parentNode.insertBefore(paymentInfo, grandTotal);
  }

  // Clear search results and search input
  document.getElementById('searchResults').innerHTML = '';
  document.getElementById('saleProductSearch').value = '';
  
  // Close both modals
  closeQuantityModal();
};

// Add new function to handle real-time quantity updates
window.updateQuantityRealTime = function(productId, newQuantity) {
  const product = window.products.find(p => p.id === productId) || {
    price: parseFloat(document.querySelector(`[data-product-id="${productId}"] .unit-price`).textContent)
  };
  
  const productElement = document.querySelector(`.selected-product-item[data-product-id="${productId}"]`);
  const quantityInput = productElement.querySelector('input[type="number"]');
  const totalValueElement = productElement.querySelector('.total-value');
  const discountInput = productElement.querySelector('.discount-input');
  
  // Ensure the new value is a number and within bounds
  let quantity = parseInt(newQuantity);
  if (isNaN(quantity)) quantity = 1;
  
  // Get the maximum quantity from the input's max attribute or product quantity
  const maxQuantity = parseInt(quantityInput.getAttribute('max')) || product.quantity || 999;
  quantity = Math.max(1, Math.min(quantity, maxQuantity));
  
  // Update quantity input if it was adjusted
  if (quantity !== parseInt(newQuantity)) {
    quantityInput.value = quantity;
  }
  
  // Calculate subtotal without discount
  const subtotal = product.price * quantity;
  
  // Keep existing discount value (if any)
  const existingDiscount = parseFloat(discountInput.value) || 0;
  
  // Ensure discount doesn't exceed new subtotal
  const finalDiscount = Math.min(existingDiscount, subtotal);
  if (finalDiscount !== existingDiscount) {
    discountInput.value = finalDiscount.toFixed(2);
  }
  
  // Calculate final total
  const finalTotal = subtotal - finalDiscount;
  totalValueElement.textContent = finalTotal.toFixed(2);
  
  // Update the grand total
  updateGrandTotal();
};

window.updateDiscount = function(productId, discountValue) {
  const productElement = document.querySelector(`.selected-product-item[data-product-id="${productId}"]`);
  const totalValueElement = productElement.querySelector('.total-value');
  const quantityInput = productElement.querySelector('input[type="number"]');
  const unitPriceElement = productElement.querySelector('.unit-price');
  
  let discount = parseFloat(discountValue) || 0;
  const quantity = parseInt(quantityInput.value);
  const unitPrice = parseFloat(unitPriceElement.textContent);
  const subtotal = unitPrice * quantity;
  
  // Ensure discount cannot exceed subtotal
  if (discount > subtotal) {
    discount = subtotal;
    productElement.querySelector('.discount-input').value = subtotal.toFixed(2);
  }
  
  // Calculate final total with discount
  const finalTotal = subtotal - discount;
  totalValueElement.textContent = finalTotal.toFixed(2);
  
  // Update grand total
  updateGrandTotal();
};

window.removeSelectedProduct = function(productId) {
  const productElement = document.querySelector(`.selected-product-item[data-product-id="${productId}"]`);
  if (productElement) {
    productElement.remove();
    
    // Check if there are any remaining products
    const selectedProductsList = document.querySelector('.selected-products-list');
    const saleFormButtons = document.querySelector('.sale-form-buttons');
    
    if (!selectedProductsList.children.length) {
      document.getElementById('selectedProducts').style.display = 'none';
      saleFormButtons.style.display = 'none'; // Hide buttons
      // Remove payment info and grand total
      const paymentInfo = document.querySelector('.payment-info');
      if (paymentInfo) paymentInfo.remove();
      const grandTotal = document.getElementById('grandTotal');
      if (grandTotal) grandTotal.remove();
    } else {
      // Update grand total if there are still products
      updateGrandTotal();
    }
  }
};

window.selectProduct = function(productId) {
  openQuantityModal(productId);
};

window.openPaymentModal = function() {
  const modalHTML = `
    <div class="payment-modal">
      <div class="payment-modal-content">
        <h2>Selecione a forma de pagamento</h2>
        <button class="payment-method-btn" onclick="selectPaymentMethod('cash')">
          <i class="fas fa-money-bill-wave"></i>
          Dinheiro
        </button>
        <button class="payment-method-btn" onclick="selectPaymentMethod('debit')">
          <i class="fas fa-credit-card"></i>
          Cartão de Débito
        </button>
        <button class="payment-method-btn" onclick="selectPaymentMethod('pix')">
          <i class="fas fa-qrcode"></i>
          Pix
        </button>
        <button class="payment-method-btn" onclick="selectPaymentMethod('credit')">
          <i class="fas fa-credit-card"></i>
          Cartão de Crédito
        </button>
        <button class="payment-modal-close" onclick="closePaymentModal()">
          Voltar
        </button>
      </div>
    </div>
  `;

  const paymentModalOverlay = document.createElement('div');
  paymentModalOverlay.className = 'payment-modal-overlay';
  paymentModalOverlay.id = 'paymentModalOverlay';
  paymentModalOverlay.innerHTML = modalHTML;
  document.body.appendChild(paymentModalOverlay);
  paymentModalOverlay.style.display = 'block';
};

window.closePaymentModal = function() {
  const modalOverlay = document.getElementById('paymentModalOverlay');
  if (modalOverlay) {
    modalOverlay.remove();
  }
};

window.selectPaymentMethod = function(method) {
  const selectedProducts = document.querySelectorAll('.selected-product-item');
  const grandTotal = document.querySelector('.grand-total-value').textContent;
  const modalElement = document.querySelector('.modal');
  const editingSaleId = modalElement.dataset.editingSaleId;
  
  const paymentMethodText = {
    'cash': 'Dinheiro',
    'debit': 'Cartão de Débito',
    'pix': 'Pix',
    'credit': 'Cartão de Crédito'
  }[method];

  const now = new Date();
  const saleData = {
    date: now.toLocaleDateString(),
    time: modalElement.dataset.originalTime || now.toLocaleTimeString(),
    products: Array.from(selectedProducts).map(item => {
      const quantity = parseInt(item.querySelector('input[type="number"]').value);
      const unitPrice = parseFloat(item.querySelector('.unit-price').textContent);
      const total = parseFloat(item.querySelector('.total-value').textContent);
      const productName = item.querySelector('.product-name').textContent;
      const product = window.products.find(p => p.name === productName);
      
      // Calculate and store profit per product at time of sale
      let productProfit = (unitPrice - product.costPrice) * quantity;
      
      // Apply payment method fees
      if (method === 'debit') {
        productProfit *= (1 - 0.0145); // 1.45% fee for debit
      } else if (method === 'credit') {
        productProfit *= (1 - 0.0339); // 3.39% fee for credit
      } else if (method === 'pix') {
        productProfit *= (1 - 0.0099); // 0.99% fee for pix
      }

      return {
        name: productName,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total,
        profit: productProfit // Store the calculated profit
      };
    }),
    paymentMethod: paymentMethodText,
    total: parseFloat(grandTotal.replace('R$ ', ''))
  };

  // Calculate and store total profit for the sale
  saleData.totalProfit = saleData.products.reduce((sum, product) => sum + product.profit, 0);

  const updatePromises = Array.from(selectedProducts).map(item => {
    const productName = item.querySelector('.product-name').textContent;
    const soldQuantity = parseInt(item.querySelector('input[type="number"]').value);
    
    const product = window.products.find(p => p.name === productName);
    if (product) {
      const newQuantity = product.quantity - soldQuantity;
      return database.ref('products/' + product.id).update({
        quantity: newQuantity
      });
    }
    return Promise.resolve();
  });

  let savePromise;
  if (editingSaleId) {
    savePromise = database.ref('sales/' + editingSaleId).update(saleData);
  } else {
    const newSaleRef = database.ref('sales').push();
    savePromise = newSaleRef.set(saleData);
  }

  Promise.all([
    ...updatePromises,
    savePromise
  ])
    .then(() => {
      console.log(editingSaleId ? 'Sale updated successfully' : 'Sale saved successfully');
      closePaymentModal();
      closeSaleModal();
      updateSalesTable();
    })
    .catch((error) => {
      console.error('Error saving/updating sale:', error);
      alert('Erro ao salvar/atualizar venda. Por favor, tente novamente.');
    });
};

// Add new function to handle grand total update
function updateGrandTotal() {
  const selectedProductsList = document.querySelector('.selected-products-list');
  const totalValues = selectedProductsList.querySelectorAll('.total-value');
  let grandTotal = 0;

  totalValues.forEach(totalElement => {
    grandTotal += parseFloat(totalElement.textContent);
  });

  let grandTotalDiv = document.getElementById('grandTotal');
  if (!grandTotalDiv) {
    grandTotalDiv = document.createElement('div');
    grandTotalDiv.id = 'grandTotal';
    grandTotalDiv.className = 'grand-total';
    selectedProductsList.parentNode.appendChild(grandTotalDiv);
  }

  grandTotalDiv.innerHTML = `
    <div class="grand-total-line"></div>
    <div class="grand-total-content">
      <span class="grand-total-label">Total Geral:</span>
      <span class="grand-total-value">R$ ${grandTotal.toFixed(2)}</span>
    </div>
  `;
}

window.updateQuantity = undefined;

window.deleteSale = function(saleId) {
  if (confirm('Tem certeza que deseja excluir esta venda?')) {
    database.ref('sales/' + saleId).once('value')
      .then((snapshot) => {
        const sale = snapshot.val();
        
        const updatePromises = sale.products.map(saleProduct => {
          const product = window.products.find(p => p.name === saleProduct.name);
          if (product) {
            const newQuantity = product.quantity + saleProduct.quantity;
            
            return database.ref('products/' + product.id).update({
              quantity: newQuantity
            });
          }
          return Promise.resolve();
        });

        return Promise.all([
          ...updatePromises,
          database.ref('sales/' + saleId).remove()
        ]);
      })
      .then(() => {
        console.log('Sale deleted and products restored successfully');
        updateSalesTable();
      })
      .catch((error) => {
        console.error('Error deleting sale:', error);
        alert('Erro ao excluir venda. Por favor, tente novamente.');
      });
  }
};

function updateSalesTable(page = 1) {
  const salesTableBody = document.querySelector('.sales-table tbody');
  if (!salesTableBody) return;

  salesTableBody.innerHTML = '';

  database.ref('sales').orderByChild('date').once('value')
    .then((snapshot) => {
      const salesArray = [];
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        
        salesArray.push({
          id: childSnapshot.key,
          ...sale,
          profit: sale.totalProfit || 0
        });
      });
      
      // Sort by date and time in reverse chronological order
      salesArray.sort((a, b) => {
        const [aDay, aMonth, aYear] = a.date.split('/').map(Number);
        const [bDay, bMonth, bYear] = b.date.split('/').map(Number);
        
        // Create Date objects with time
        const [aHour, aMinute, aSecond] = (a.time || '00:00:00').split(':').map(Number);
        const [bHour, bMinute, bSecond] = (b.time || '00:00:00').split(':').map(Number);
        
        const dateA = new Date(aYear, aMonth - 1, aDay, aHour, aMinute, aSecond);
        const dateB = new Date(bYear, bMonth - 1, bDay, bHour, bMinute, bSecond);
        
        return dateB - dateA; // Most recent dates first
      });

      // Calculate pagination
      const totalSales = salesArray.length;
      const totalPages = Math.ceil(totalSales / SALES_PER_PAGE);
      const startIndex = (page - 1) * SALES_PER_PAGE;
      const endIndex = startIndex + SALES_PER_PAGE;
      const currentPageSales = salesArray.slice(startIndex, endIndex);

      // Update table with current page sales
      currentPageSales.forEach((sale) => {
        const productsText = sale.products.map(p => 
          `${p.quantity}x ${p.name}`  
        ).join(', ');

        const row = `
          <tr>
            <td>${sale.date}</td>
            <td>${sale.time}</td>
            <td>${productsText}</td>
            <td data-payment-method>${sale.paymentMethod}</td>
            <td>R$ ${sale.total.toFixed(2)}</td>
            <td>R$ ${sale.profit.toFixed(2)}</td>
            <td>
              <button onclick="editSale('${sale.id}')" class="edit-sale-btn" title="Editar venda">
                <i class="fas fa-edit"></i>
              </button>
              <button onclick="deleteSale('${sale.id}')" class="delete-sale-btn" title="Excluir venda">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
        salesTableBody.innerHTML += row;
      });

      // Create pagination controls
      updatePagination(page, totalPages);
    })
    .catch((error) => {
      console.error('Error loading sales:', error);
    });
}

// Add this new function to filter sales by date
function filterSalesByDate(selectedDate) {
  const salesTableBody = document.querySelector('.sales-table tbody');
  if (!salesTableBody) return;

  salesTableBody.innerHTML = '';

  database.ref('sales').orderByChild('date').once('value')
    .then((snapshot) => {
      const salesArray = [];
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        if (sale.date === selectedDate) {
          let saleProfit = sale.totalProfit || 0;
          salesArray.push({
            id: childSnapshot.key,
            ...sale,
            profit: saleProfit
          });
        }
      });
      
      salesArray.reverse();

      // Remove existing no-sales message if it exists
      const existingMessage = document.querySelector('.no-sales-message');
      if (existingMessage) {
        existingMessage.remove();
      }

      if (salesArray.length === 0) {
        // Only show no sales message if a date is actually selected
        const datePicker = document.getElementById('datePicker');
        const isCalendarOpen = datePicker && datePicker.classList.contains('filter-active');
        
        if (isCalendarOpen) {
          const noSalesMessage = document.createElement('div');
          noSalesMessage.className = 'no-sales-message';
          noSalesMessage.innerHTML = `
            <i class="fas fa-calendar-times"></i>
            Nenhuma venda realizada em ${selectedDate}
          `;
          salesTableBody.parentElement.insertAdjacentElement('afterend', noSalesMessage);
        }
      } else {
        // Display filtered sales without pagination
        salesArray.forEach((sale) => {
          const productsText = sale.products.map(p => 
            `${p.quantity}x ${p.name}`  
          ).join(', ');

          const row = `
            <tr>
              <td>${sale.date}</td>
              <td>${sale.time}</td>
              <td>${productsText}</td>
              <td data-payment-method>${sale.paymentMethod}</td>
              <td>R$ ${sale.total.toFixed(2)}</td>
              <td>R$ ${sale.profit.toFixed(2)}</td>
              <td>
                <button onclick="editSale('${sale.id}')" class="edit-sale-btn" title="Editar venda">
                  <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteSale('${sale.id}')" class="delete-sale-btn" title="Excluir venda">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>
          `;
          salesTableBody.innerHTML += row;
        });

        // Remove any existing pagination
        const existingPagination = document.querySelector('.pagination');
        if (existingPagination) {
          existingPagination.remove();
        }
      }
    })
    .catch((error) => {
      console.error('Error loading sales:', error);
    });
}

function loadSalesTable() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div class="sales-header">
      <button class="new-sale-btn" onclick="openSaleModal()">
        <i class="fas fa-plus"></i>
        Nova Venda
      </button>
      <div class="calendar-controls">
        <button class="calendar-icon" id="datePicker">
          <i class="fas fa-calendar-alt"></i>
        </button>
        <button class="calendar-close" id="clearDateFilter">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
    <h2>Histórico de Vendas</h2>
    <table class="sales-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Hora</th>
          <th>Produtos</th>
          <th>Forma de Pagamento</th>
          <th>Total</th>
          <th>Lucro</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <!-- Sales data will be loaded here -->
      </tbody>
    </table>

    ${generateSaleModalHTML()}
  `;

  // Initialize Flatpickr date picker
  const datePicker = document.getElementById('datePicker');
  const clearDateFilter = document.getElementById('clearDateFilter');
  
  if (datePicker) {
    const fp = flatpickr(datePicker, {
      dateFormat: "d/m/Y",
      locale: {
        firstDayOfWeek: 0,
        weekdays: {
          shorthand: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
          longhand: ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
        },
        months: {
          shorthand: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
          longhand: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro']
        }
      },
      onChange: function(selectedDates, dateStr) {
        filterSalesByDate(dateStr);
        datePicker.classList.add('filter-active');
        clearDateFilter.classList.add('visible');
      }
    });

    // Add click event for clear filter button
    clearDateFilter.addEventListener('click', function() {
      fp.clear();
      updateSalesTable();
      datePicker.classList.remove('filter-active');
      clearDateFilter.classList.remove('visible');
    });
  }

  setupSaleModalListeners();
  updateSalesTable();
}

// Add this new function to filter sales by date
function setupSaleModalListeners() {
  const searchInput = document.getElementById('saleProductSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleSaleProductSearch);
  }

  const selectPaymentBtn = document.querySelector('.select-payment');
  if (selectPaymentBtn) {
    selectPaymentBtn.addEventListener('click', openPaymentModal);
  }
}

function handleSaleProductSearch(e) {
  const searchTerm = normalizeString(e.target.value.toLowerCase());
  const searchResults = document.getElementById('searchResults');
  
  if (searchTerm === '') {
    searchResults.innerHTML = '';
    return;
  }

  const filteredProducts = window.products.filter(product => 
    normalizeString(product.name.toLowerCase()).startsWith(searchTerm)
  );

  searchResults.innerHTML = filteredProducts.map((product, index) => `
    <div class="search-result-item ${index === 0 ? 'selected' : ''} ${product.quantity === 0 ? 'out-of-stock' : ''}" 
         data-product-id="${product.id}" 
         tabindex="0" 
         data-index="${index}">
      <div class="product-image">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-price">
          ${product.quantity === 0 
            ? 'Sem estoque'
            : `R$ ${product.price.toFixed(2)} | Estoque: ${product.quantity}`
          }
        </div>
      </div>
      <button class="select-product-btn" onclick="selectProduct('${product.id}')" ${product.quantity === 0 ? 'disabled' : ''}>
        Selecionar
      </button>
    </div>
  `).join('');

  window.selectedIndex = filteredProducts.length > 0 ? 0 : -1;
}

document.addEventListener('DOMContentLoaded', function() {
  window.products = [];
  
  loadProductsFromFirebase();
  
  const productsLink = document.querySelector('a[href="https://example.com/produtos"]');
  const salesLink = document.querySelector('a[href="https://example.com/vendas"]');
  const movimentacoesLink = document.querySelector('a[href="https://example.com/movimentacoes"]');
  const cashLink = document.querySelector('a[href="https://example.com/caixa"]');
  const receitaLink = document.querySelector('a[href="https://example.com/receita"]');
  const relatorioLink = document.querySelector('a[href="https://example.com/relatorio"]');
  const stockLink = document.querySelector('a[href="https://example.com/estoque"]');
  
  productsLink.addEventListener('click', function(e) {
    e.preventDefault();
    loadProductsTable();
    
    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
  });
  
  salesLink.addEventListener('click', function(e) {
    e.preventDefault();
    loadSalesTable();
    
    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
  });

  if (movimentacoesLink) {
    movimentacoesLink.addEventListener('click', function(e) {
      e.preventDefault();
      loadPaymentMethodTotals();
      
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
    });
  }

  if (cashLink) {
    cashLink.addEventListener('click', function(e) {
      e.preventDefault();
      loadCashHistory();
      
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
    });
  }

  if (receitaLink) {
    receitaLink.addEventListener('click', function(e) {
      e.preventDefault();
      loadReceita();
      
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
    });
  }

  if (relatorioLink) {
    relatorioLink.addEventListener('click', function(e) {
      e.preventDefault();
      loadProductReport();
      
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
    });
  }

  if (stockLink) {
    stockLink.addEventListener('click', function(e) {
      e.preventDefault();
      loadStock();
      
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
    });
  }
  
  loadSalesTable();

  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      const saleModal = document.getElementById('saleModalOverlay');
      const quantityModal = document.getElementById('quantityModalOverlay');
      const paymentModal = document.getElementById('paymentModalOverlay');
      const productModal = document.getElementById('modalOverlay');
      
      if (paymentModal && paymentModal.style.display === 'block') {
        closePaymentModal();
      } else if (quantityModal && quantityModal.style.display === 'block') {
        closeQuantityModal();
      } else if (saleModal && saleModal.style.display === 'block') {
        closeSaleModal();
      } else if (productModal && productModal.style.display === 'block') {
        closeModal();
      }
    }
  });

  const searchInput = document.getElementById('saleProductSearch');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      const searchResults = document.getElementById('searchResults');
      const items = searchResults.getElementsByClassName('search-result-item');
      
      if (items.length === 0) return;

      if (typeof window.selectedIndex === 'undefined') {
        window.selectedIndex = -1;
      }

      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault(); 
          window.selectedIndex = Math.min(window.selectedIndex + 1, items.length - 1);
          updateSelection(items);
          break;

        case 'ArrowUp':
          e.preventDefault(); 
          window.selectedIndex = Math.max(window.selectedIndex - 1, 0);
          updateSelection(items);
          break;

        case 'Enter':
          e.preventDefault();
          if (window.selectedIndex >= 0 && window.selectedIndex < items.length) {
            const selectedItem = items[window.selectedIndex];
            const productId = selectedItem.dataset.productId;
            selectProduct(productId);
          } else if (items.length > 0) {
            const productId = items[0].dataset.productId;
            selectProduct(productId);
          }
          break;
      }
    });
  }
});

function updateSelection(items) {
  Array.from(items).forEach(item => {
    item.classList.remove('selected');
  });

  if (window.selectedIndex >= 0 && items[window.selectedIndex]) {
    items[window.selectedIndex].classList.add('selected');
    items[window.selectedIndex].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }
}

function loadProductsFromFirebase() {
  const productsRef = database.ref('products');
  productsRef.off('value');
  productsRef.on('value', (snapshot) => {
    window.products = [];
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      product.id = childSnapshot.key;
      window.products.push(product);
    });
      
    window.products.sort((a, b) => a.name.localeCompare(b.name));
      
    const productsTable = document.getElementById('productsTableBody');
    if (productsTable) {
      productsTable.innerHTML = renderProductsTable();
    }
    
    updateStockNotification();
  });
}

// Add this new function to check and update stock notifications
function updateStockNotification() {
  const lowStockProducts = window.products.filter(product => 
    product.quantity >= 0 && 
    product.quantity <= 5 && 
    product.priority === true // Only count products with priority checked
  );
  
  const notification = document.getElementById('stockNotification');
  
  if (lowStockProducts.length > 0) {
    notification.style.display = 'flex';
    notification.textContent = lowStockProducts.length;
  } else {
    notification.style.display = 'none';
  }
}

function loadProductsTable() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div class="table-header">
      <button class="add-product-btn" onclick="openModal()">
        <i class="fas fa-plus"></i>
        Adicionar Produto
      </button>
      <div class="search-container">
        <input type="text" class="search-input" placeholder="Pesquisar produtos...">
        <i class="fas fa-search search-icon"></i>
      </div>
    </div>
    <table class="products-table">
      <thead>
        <tr>
          <th>Nome do Produto</th>
          <th>Preço</th>
          <th>Quantidade</th>
          <th>Lucro</th>
          <th>Imagem</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody id="productsTableBody">
        ${renderProductsTable()}
      </tbody>
    </table>

    <div class="modal-overlay" id="modalOverlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Adicionar Novo Produto</h2>
          <button class="modal-close" onclick="closeModal()">×</button>
        </div>
        <div class="modal-content">
          <form id="addProductForm">
            <div class="form-group">
              <label for="productName">Nome do produto</label>
              <input type="text" id="productName" required placeholder="Digite o nome do produto">
            </div>
            <div class="form-group">
              <label for="salePrice">Preço de venda</label>
              <input type="number" id="salePrice" step="0.01" required placeholder="R$ 0,00">
            </div>
            <div class="form-group">
              <label for="costPrice">Preço de custo</label>
              <input type="number" id="costPrice" step="0.01" required placeholder="R$ 0,00">
            </div>
            <div class="form-group">
              <label for="quantity">Quantidade</label>
              <input type="number" id="quantity" required placeholder="0">
            </div>
            <div class="form-group">
              <label for="imageUpload">Upload da imagem</label>
              <input type="file" id="imageUpload" accept="image/*">
            </div>
            <div class="form-group">
              <label for="imageUrl">Link da imagem</label>
              <input type="url" id="imageUrl" placeholder="https://...">
            </div>
            <div class="modal-buttons">
              <button type="submit" class="save-btn">Salvar</button>
              <button type="button" class="close-btn" onclick="closeModal()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `;

  const form = document.getElementById('addProductForm');
  const clonedForm = form.cloneNode(true);
  form.parentNode.replaceChild(clonedForm, form);
  clonedForm.addEventListener('submit', (e) => handleFormSubmit(e));
    
  const searchInput = document.querySelector('.search-input');
  searchInput.addEventListener('input', handleSearch);
}

function handleFormSubmit(e, editId = null) {
  e.preventDefault();
  
  const productName = document.getElementById('productName').value;
  const salePrice = parseFloat(document.getElementById('salePrice').value);
  const costPrice = parseFloat(document.getElementById('costPrice').value);
  const quantity = parseInt(document.getElementById('quantity').value);
  const imageUrl = document.getElementById('imageUrl');
  const imageUpload = document.getElementById('imageUpload');
  
  const profit = salePrice - costPrice;
  
  let finalImageUrl;
  if (imageUpload.files && imageUpload.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      finalImageUrl = e.target.result;
      imageUrl.value = '';
      
      const productData = {
        name: productName,
        price: salePrice,
        quantity: quantity,
        profit: profit,
        image: finalImageUrl,
        costPrice: costPrice
      };
      
      if (editId) {
        database.ref('products/' + editId).update(productData)
          .then(() => {
            console.log('Product updated successfully');
            closeModal();
          })
          .catch((error) => {
            console.error('Error:', error);
            alert('Erro ao atualizar produto. Por favor, tente novamente.');
          });
      } else {
        database.ref('products').push(productData)
          .then(() => {
            console.log('Product added successfully');
            closeModal();
          })
          .catch((error) => {
            console.error('Error:', error);
            alert('Erro ao salvar produto. Por favor, tente novamente.');
          });
      }
    };
    reader.readAsDataURL(imageUpload.files[0]);
  } else {
    finalImageUrl = imageUrl.value || 'https://via.placeholder.com/50';
    
    const productData = {
      name: productName,
      price: salePrice,
      quantity: quantity,
      profit: profit,
      image: finalImageUrl,
      costPrice: costPrice
    };
    
    if (editId) {
      database.ref('products/' + editId).update(productData)
        .then(() => {
          console.log('Product updated successfully');
          closeModal();
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Erro ao atualizar produto. Por favor, tente novamente.');
        });
    } else {
      database.ref('products').push(productData)
        .then(() => {
          console.log('Product added successfully');
          closeModal();
        })
        .catch((error) => {
          console.error('Error:', error);
          alert('Erro ao salvar produto. Por favor, tente novamente.');
        });
    }
  }
}

function editProduct(id) {
  const product = window.products.find(p => p.id === id);
  if (!product) return;
  
  openModal(true);
  document.getElementById('productName').value = product.name;
  document.getElementById('salePrice').value = product.price;
  document.getElementById('costPrice').value = product.costPrice;
  document.getElementById('quantity').value = product.quantity;
  document.getElementById('imageUrl').value = product.image;
  
  const form = document.getElementById('addProductForm');
  const clonedForm = form.cloneNode(true);
  form.parentNode.replaceChild(clonedForm, form);
  clonedForm.addEventListener('submit', (e) => handleFormSubmit(e, id));
  
  document.querySelector('.modal-header h2').textContent = 'Editar Produto';
  document.querySelector('.save-btn').textContent = 'Atualizar';

  // Scroll modal content to top
  const modalContent = document.querySelector('.modal-content');
  if (modalContent) {
    modalContent.scrollTop = 0;
  }
}

function openModal(isEditing = false) {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.style.display = 'block';
  
  if (!isEditing) {
    document.getElementById('addProductForm').reset();
    document.querySelector('.modal-header h2').textContent = 'Adicionar Novo Produto';
    document.querySelector('.save-btn').textContent = 'Salvar';
  }
}

function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.style.display = 'none';
  
  const form = document.getElementById('addProductForm');
  form.reset();
  form.onsubmit = (e) => handleFormSubmit(e);
  
  // Clear the search input when closing the modal
  const searchInput = document.querySelector('.search-input');
  if (searchInput) {
    searchInput.value = '';
  }
  
  document.querySelector('.modal-header h2').textContent = 'Adicionar Novo Produto';
  document.querySelector('.save-btn').textContent = 'Salvar';
  
  if (document.activeElement) {
    document.activeElement.blur();
  }
  
  // Trigger the search function to reset the table view
  handleSearch({ target: { value: '' } });
}

function deleteProduct(id) {
  database.ref('products/' + id).remove()
    .then(() => {
      console.log('Product deleted successfully');
    })
    .catch((error) => {
      console.error('Error deleting product:', error);
      alert('Erro ao excluir produto. Por favor, tente novamente.');
    });
}

function duplicateProduct(id) {
  const product = window.products.find(p => p.id === id);
  if (!product) return;
  
  let newName = product.name.replace(/\s*\(Cópia\)*/g, '');
  newName = `${newName} (Cópia)`;
  
  const duplicatedProduct = {
    name: newName,
    price: product.price,
    quantity: product.quantity,
    profit: product.profit,
    image: product.image,
    costPrice: product.costPrice
  };
  
  database.ref('products').push(duplicatedProduct)
    .then(() => {
      console.log('Product duplicated successfully');
    })
    .catch((error) => {
      console.error('Error duplicating product:', error);
      alert('Erro ao duplicar produto. Por favor, tente novamente.');
    });
}

function renderProductsTable() {
  if (!window.products) {
    window.products = [];
  }
  
  return window.products.map(product => `
    <tr>
      <td>${product.name}</td>
      <td>R$ ${product.price.toFixed(2)}</td>
      <td>${product.quantity}</td>
      <td>R$ ${product.profit.toFixed(2)}</td>
      <td>
        <div class="image-container">
          <img src="${product.image}" alt="${product.name}">
        </div>
      </td>
      <td class="actions-column">
        <button onclick="editProduct('${product.id}')" style="background: none; border: none; cursor: pointer;">
          <i class="fas fa-edit" style="color: #2c3e50;"></i>
        </button>
        <button onclick="duplicateProduct('${product.id}')" style="background: none; border: none; cursor: pointer;">
          <i class="fas fa-copy" style="color: #3498db;"></i>
        </button>
        <button onclick="deleteProduct('${product.id}')" style="background: none; border: none; cursor: pointer;">
          <i class="fas fa-trash" style="color: #e74c3c;"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function handleSearch(e) {
  const searchTerm = normalizeString(e.target.value.toLowerCase());
  const filteredProducts = window.products.filter(product => 
    normalizeString(product.name.toLowerCase()).includes(searchTerm)
  );
  
  filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  
  const tbody = document.getElementById('productsTableBody');
  tbody.innerHTML = filteredProducts.map(product => `
    <tr>
      <td>${product.name}</td>
      <td>R$ ${product.price.toFixed(2)}</td>
      <td>${product.quantity}</td>
      <td>R$ ${product.profit.toFixed(2)}</td>
      <td>
        <div class="image-container">
          <img src="${product.image}" alt="${product.name}">
        </div>
      </td>
      <td class="actions-column">
        <button onclick="editProduct('${product.id}')" style="background: none; border: none; cursor: pointer;">
          <i class="fas fa-edit" style="color: #2c3e50;"></i>
        </button>
        <button onclick="duplicateProduct('${product.id}')" style="background: none; border: none; cursor: pointer;">
          <i class="fas fa-copy" style="color: #3498db;"></i>
        </button>
        <button onclick="deleteProduct('${product.id}')" style="background: none; border: none; cursor: pointer;">
          <i class="fas fa-trash" style="color: #e74c3c;"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

function normalizeString(str) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

window.onclick = function(event) {
  const modalOverlay = document.getElementById('modalOverlay');
  if (event.target === modalOverlay) {
    closeModal();
  }
}

function loadCashHistory() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <h2 class="cash-history-title">Histórico de Caixa</h2>
      <button onclick="openTrashModal()" class="trash-icon-btn" title="Histórico Excluído">
        <i class="fas fa-trash-alt"></i>
      </button>
    </div>
    <table class="cash-history-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Total Feito</th>
          <th>Lucro</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <!-- Cash history data will be loaded here -->
      </tbody>
    </table>

    <!-- Add Trash Modal -->
    <div id="trashModal" class="trash-modal">
      <div class="trash-modal-content">
        <div class="trash-modal-header">
          <h2>Histórico Excluído</h2>
          <button class="modal-close" onclick="closeTrashModal()">×</button>
        </div>
        <div class="trash-history-container">
          <!-- Deleted history will be loaded here -->
        </div>
      </div>
    </div>
  `;

  updateCashHistoryTable();
}

window.deleteCashHistory = function(date) {
  if (confirm('Tem certeza que deseja mover este histórico para a lixeira?')) {
    database.ref('sales').once('value')
      .then((snapshot) => {
        const salesToMove = [];
        snapshot.forEach((childSnapshot) => {
          const sale = childSnapshot.val();
          if (sale.date === date) {
            salesToMove.push({
              id: childSnapshot.key,
              ...sale,
              deletedAt: new Date().toISOString()
            });
          }
        });
        
        // Move to trash first
        const trashUpdates = {};
        salesToMove.forEach((sale) => {
          trashUpdates[`trash/sales/${sale.id}`] = sale;
        });
        
        // Then delete from main sales
        const salesUpdates = {};
        salesToMove.forEach((sale) => {
          salesUpdates[`sales/${sale.id}`] = null;
        });
        
        // Execute both operations
        return database.ref().update({
          ...trashUpdates,
          ...salesUpdates
        });
      })
      .then(() => {
        console.log('Cash history moved to trash successfully');
        updateCashHistoryTable();
      })
      .catch((error) => {
        console.error('Error moving cash history to trash:', error);
        alert('Erro ao mover histórico para lixeira. Por favor, tente novamente.');
      });
  }
};

window.openTrashModal = function() {
  const modal = document.getElementById('trashModal');
  modal.style.display = 'block';
  loadTrashHistory();
};

window.closeTrashModal = function() {
  const modal = document.getElementById('trashModal');
  modal.style.display = 'none';
};

window.restoreFromTrash = function(date) {
  if (confirm('Deseja restaurar este histórico?')) {
    database.ref('trash/sales').once('value')
      .then((snapshot) => {
        const salesToRestore = [];
        snapshot.forEach((childSnapshot) => {
          const sale = childSnapshot.val();
          if (sale.date === date) {
            salesToRestore.push({
              id: childSnapshot.key,
              ...sale
            });
          }
        });
        
        // Remove deletedAt and restore to main sales
        const updates = {};
        salesToRestore.forEach((sale) => {
          const { deletedAt, ...cleanSale } = sale;
          updates[`sales/${sale.id}`] = cleanSale;
          updates[`trash/sales/${sale.id}`] = null;
        });
        
        return database.ref().update(updates);
      })
      .then(() => {
        console.log('History restored successfully');
        updateCashHistoryTable();
        loadTrashHistory();
      })
      .catch((error) => {
        console.error('Error restoring history:', error);
        alert('Erro ao restaurar histórico. Por favor, tente novamente.');
      });
  }
};

function loadTrashHistory() {
  const container = document.querySelector('.trash-history-container');
  
  database.ref('trash/sales').once('value')
    .then((snapshot) => {
      const trashedData = {};
      
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        const date = sale.date;
        
        if (!trashedData[date]) {
          trashedData[date] = {
            total: 0,
            profit: 0,
            deletedAt: sale.deletedAt
          };
        }
        
        trashedData[date].total += sale.total;
        trashedData[date].profit += sale.totalProfit || 0;
      });
      
      // Convert to array and sort by deletedAt (most recent first)
      const sortedTrash = Object.entries(trashedData)
        .sort(([, a], [, b]) => new Date(b.deletedAt) - new Date(a.deletedAt));
      
      if (sortedTrash.length === 0) {
        container.innerHTML = `
          <div class="no-trash-message">
            <i class="fas fa-trash-alt"></i>
            Nenhum histórico na lixeira
          </div>
        `;
        return;
      }
      
      container.innerHTML = `
        <table class="trash-history-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Total</th>
              <th>Lucro</th>
              <th>Excluído em</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            ${sortedTrash.map(([date, data]) => `
              <tr>
                <td>${date}</td>
                <td>R$ ${data.total.toFixed(2)}</td>
                <td>R$ ${data.profit.toFixed(2)}</td>
                <td>${new Date(data.deletedAt).toLocaleDateString('pt-BR')} ${new Date(data.deletedAt).toLocaleTimeString('pt-BR')}</td>
                <td>
                  <button onclick="restoreFromTrash('${date}')" class="restore-btn" title="Restaurar">
                    <i class="fas fa-undo"></i>
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    })
    .catch(error => {
      console.error('Error loading trash history:', error);
      container.innerHTML = '<p>Erro ao carregar histórico da lixeira</p>';
    });
}

function updateCashHistoryTable() {
  database.ref('sales').once('value')
    .then((snapshot) => {
      const salesData = [];
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        const date = sale.date;
        
        let dateEntry = salesData.find(entry => entry.date === date);
        if (!dateEntry) {
          dateEntry = { date: date, total: 0, profit: 0 };
          salesData.push(dateEntry);
        }
        
        dateEntry.total += sale.total;
        // Use the stored totalProfit from the sale instead of recalculating
        dateEntry.profit += sale.totalProfit || 0;
      });

      // Sort the data by date (most recent first)
      salesData.sort((a, b) => {
        const [aDay, aMonth, aYear] = a.date.split('/').map(Number);
        const [bDay, bMonth, bYear] = b.date.split('/').map(Number);
        
        const dateA = new Date(aYear, aMonth - 1, aDay);
        const dateB = new Date(bYear, bMonth - 1, bDay);
        
        return dateB - dateA;
      });

      const tbody = document.querySelector('.cash-history-table tbody');
      tbody.innerHTML = salesData.map(entry => `
        <tr>
          <td>${entry.date}</td>
          <td>R$ ${entry.total.toFixed(2)}</td>
          <td>R$ ${entry.profit.toFixed(2)}</td>
          <td>
            <button onclick="deleteCashHistory('${entry.date}')" class="delete-history-btn">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      `).join('');
    })
    .catch(error => {
      console.error('Error loading cash history:', error);
    });
}

function loadPaymentMethodTotals() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <h2 class="payment-totals-title">Totais por forma de pagamento</h2>
    <table class="payment-totals-table">
      <thead>
        <tr>
          <th>Forma de pagamento</th>
          <th>Total vendido</th>
        </tr>
      </thead>
      <tbody>
        <!-- Payment method totals will be loaded here -->
      </tbody>
    </table>
  `;

  updatePaymentTotalsTable();
}

function updatePaymentTotalsTable() {
  const today = new Date();
  const currentDate = today.toLocaleDateString('pt-BR'); 
  
  database.ref('sales').once('value')
    .then((snapshot) => {
      const paymentTotals = {};
      
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        if (sale.date === currentDate) {
          const paymentMethod = sale.paymentMethod;
          const total = sale.total || 0;
          
          if (paymentMethod) {
            paymentTotals[paymentMethod] = (paymentTotals[paymentMethod] || 0) + total;
          }
        }
      });

      const tbody = document.querySelector('.payment-totals-table tbody');
      if (Object.keys(paymentTotals).length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="2">Nenhuma venda registrada hoje</td>
          </tr>
        `;
      } else {
        tbody.innerHTML = Object.entries(paymentTotals).map(([method, total]) => `
          <tr>
            <td>${method}</td>
            <td>R$ ${total.toFixed(2)}</td>
          </tr>
        `).join('');
      }
      
      const title = document.querySelector('.payment-totals-title');
      if (title) {
        const isMobile = window.innerWidth <= 768;
        if (isMobile) {
          title.textContent = `Pagamentos do dia ${currentDate}`;
        } else {
          title.textContent = `Totais por forma de pagamento - ${currentDate}`;
        }
      }
    })
    .catch(error => {
      console.error('Error loading payment method totals:', error);
    });
}

window.addEventListener('resize', () => {
  const title = document.querySelector('.payment-totals-title');
  const currentDate = new Date().toLocaleDateString('pt-BR');
  
  if (title) {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      title.textContent = `Pagamentos do dia ${currentDate}`;
    } else {
      title.textContent = `Totais por forma de pagamento - ${currentDate}`;
    }
  }
});

window.calculateChange = function(receivedAmount) {
  const grandTotalElement = document.querySelector('.grand-total-value');
  const changeElement = document.querySelector('.change-amount');
  
  if (!grandTotalElement || !changeElement) return;
  
  const totalAmount = parseFloat(grandTotalElement.textContent.replace('R$ ', ''));
  const received = parseFloat(receivedAmount) || 0;

  if (receivedAmount.trim() !== '') {
    if (received >= 0) {
      const change = received - totalAmount;
      if (received > totalAmount) {
        changeElement.textContent = `Troco: R$ ${change.toFixed(2)}`;
        changeElement.style.color = '#27ae60'; 
      } else {
        changeElement.textContent = 'Digite o valor recebido corretamente';
        changeElement.style.color = '#e74c3c'; 
      }
      changeElement.style.display = 'block';
    } else {
      changeElement.style.display = 'none';
    }
  } else {
    changeElement.style.display = 'none';
  }
};

function loadReceita() {
  const content = document.querySelector('.content');
  const startYear = 2025;
  const yearOptions = Array.from({length: 6}, (_, i) => startYear + i);
  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  
  content.innerHTML = `
    <h2 class="receita-title">Receita Total</h2>
    <div class="date-filter">
      <select id="yearFilter">
        ${yearOptions.map(year => 
          `<option value="${year}">${year}</option>`
        ).join('')}
      </select>
      <select id="receitaFilter">
        <option value="all" selected>Todo Período</option>
        <option value="day">Por Dia</option>
        <option value="week">Por Semana</option>
        <option value="month">Por Mês</option>
      </select>
      <div id="monthSelector" style="display: none;">
        <select id="monthNumber">
          ${months.map((month, index) => 
            `<option value="${index}">${month}</option>`
          ).join('')}
        </select>
      </div>
      <div id="weekSelector" style="display: none;">
        <select id="weekNumber">
          <option value="1">Semana 1 (1-7)</option>
          <option value="2">Semana 2 (8-14)</option>
          <option value="3">Semana 3 (15-21)</option>
          <option value="4">Semana 4 (22-31)</option>
        </select>
      </div>
      <div id="daySelector" style="display: none;">
        <select id="dayNumber">
          ${Array.from({length: 31}, (_, i) => 
            `<option value="${i + 1}">Dia ${i + 1}</option>`
          ).join('')}
        </select>
      </div>
    </div>
    <div class="receita-container">
      <!-- Receita content will be loaded here -->
    </div>
  `;

  // Add event listeners for filters
  const receitaFilter = document.getElementById('receitaFilter');
  const weekSelector = document.getElementById('weekSelector');
  const daySelector = document.getElementById('daySelector');
  const monthSelector = document.getElementById('monthSelector');
  const weekNumber = document.getElementById('weekNumber');
  const dayNumber = document.getElementById('dayNumber');
  const monthNumber = document.getElementById('monthNumber');
  const yearFilter = document.getElementById('yearFilter');

  receitaFilter.addEventListener('change', (e) => {
    weekSelector.style.display = 'none';
    daySelector.style.display = 'none';
    monthSelector.style.display = 'none';
    
    if (e.target.value === 'week') {
      weekSelector.style.display = 'block';
      updateReceita('week', weekNumber.value, yearFilter.value);
    } else if (e.target.value === 'day') {
      daySelector.style.display = 'block';
      updateReceita('day', dayNumber.value, yearFilter.value);
    } else if (e.target.value === 'month') {
      monthSelector.style.display = 'block';
      updateReceita('month', monthNumber.value, yearFilter.value);
    } else {
      updateReceita(e.target.value, null, yearFilter.value);
    }
  });

  weekNumber.addEventListener('change', (e) => {
    updateReceita('week', e.target.value, yearFilter.value);
  });

  dayNumber.addEventListener('change', (e) => {
    updateReceita('day', e.target.value, yearFilter.value);
  });

  monthNumber.addEventListener('change', (e) => {
    updateReceita('month', e.target.value, yearFilter.value);
  });

  yearFilter.addEventListener('change', () => {
    const filterValue = receitaFilter.value;
    if (filterValue === 'week') {
      updateReceita('week', weekNumber.value, yearFilter.value);
    } else if (filterValue === 'day') {
      updateReceita('day', dayNumber.value, yearFilter.value);
    } else if (filterValue === 'month') {
      updateReceita('month', monthNumber.value, yearFilter.value);
    } else {
      updateReceita(filterValue, null, yearFilter.value);
    }
  });

  // Initial load with 'all' filter
  updateReceita('all', null, startYear.toString());
}

function updateReceita(filterType = 'all', filterValue = null, selectedYear = new Date().getFullYear().toString()) {
  database.ref('sales').once('value')
    .then((snapshot) => {
      let totalRevenue = 0;
      let totalProfit = 0;
      const now = new Date();
      const today = now.toLocaleDateString('pt-BR');

      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        const [day, month, year] = sale.date.split('/').map(Number);
        const saleDate = new Date(year, month - 1, day);
        
        // Only process sales from selected year
        if (year.toString() !== selectedYear) return;
        
        let includeRecord = false;

        switch(filterType) {
          case 'day':
            if (filterValue) {
              // When specific day is selected
              includeRecord = day === parseInt(filterValue) &&
                            saleDate.getMonth() === now.getMonth() &&
                            saleDate.getFullYear() === parseInt(selectedYear);
            } else {
              // Today's sales
              includeRecord = sale.date === today;
            }
            break;
          case 'week':
            const weekOfMonth = Math.ceil(day / 7);
            includeRecord = weekOfMonth === parseInt(filterValue) && 
                          saleDate.getMonth() === now.getMonth() && 
                          saleDate.getFullYear() === parseInt(selectedYear);
            break;
          case 'month':
            includeRecord = saleDate.getMonth() === parseInt(filterValue) && 
                          saleDate.getFullYear() === parseInt(selectedYear);
            break;
          case 'all':
            includeRecord = true;
            break;
        }

        if (includeRecord) {
          totalRevenue += sale.total || 0;
          totalProfit += sale.totalProfit || 0;
        }
      });

      const receitaContainer = document.querySelector('.receita-container');
      receitaContainer.innerHTML = `
        <div class="receita-card">
          <div class="receita-item">
            <i class="fas fa-money-bill-wave"></i>
            <div class="receita-info">
              <h3>Receita Bruta</h3>
              <p>R$ ${totalRevenue.toFixed(2)}</p>
            </div>
          </div>
          <div class="receita-item">
            <i class="fas fa-chart-line"></i>
            <div class="receita-info">
              <h3>Lucro Total</h3>
              <p>R$ ${totalProfit.toFixed(2)}</p>
            </div>
          </div>
        </div>
      `;
    })
    .catch(error => {
      console.error('Error loading revenue:', error);
    });
}

// Helper functions for date comparison
function isSameDay(date1, date2) {
  return date1.getDate() === date2.getDate() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

function isThisWeek(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const diffDays = Math.round(Math.abs((date2 - date1) / oneDay));
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return diffDays <= 7 && d1.getDay() <= d2.getDay();
}

function isSameMonth(date1, date2) {
  return date1.getMonth() === date2.getMonth() &&
         date1.getFullYear() === date2.getFullYear();
}

function isSameYear(date1, date2) {
  return date1.getFullYear() === date2.getFullYear();
}

function updatePagination(currentPage, totalPages) {
  const salesTable = document.querySelector('.sales-table');
  let paginationDiv = document.querySelector('.pagination');
  
  if (paginationDiv) {
    paginationDiv.remove();
  }

  paginationDiv = document.createElement('div');
  paginationDiv.className = 'pagination';
  
  // Only show pagination if there's more than one page
  if (totalPages > 1) {
    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
    prevButton.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => updateSalesTable(currentPage - 1);
    paginationDiv.appendChild(prevButton);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || 
        i === totalPages || 
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.onclick = () => updateSalesTable(i);
        paginationDiv.appendChild(pageButton);
      } else if (
        i === currentPage - 2 || 
        i === currentPage + 2
      ) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.style.color = '#2c3e50';
        paginationDiv.appendChild(ellipsis);
      }
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
    nextButton.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => updateSalesTable(currentPage + 1);
    paginationDiv.appendChild(nextButton);

    // Add pagination controls after the table
    salesTable.parentNode.insertBefore(paginationDiv, salesTable.nextSibling);
  }
}

window.editSale = function(saleId) {
  database.ref('sales/' + saleId).once('value')
    .then((snapshot) => {
      const sale = snapshot.val();
      if (!sale) return;
      
      openSaleModal();

      document.querySelector('.modal').dataset.originalTime = sale.time;

      const selectedProductsList = document.querySelector('.selected-products-list');
      const selectedProductsSection = document.getElementById('selectedProducts');
      const saleFormButtons = document.querySelector('.sale-form-buttons');

      selectedProductsSection.style.display = 'block';
      saleFormButtons.style.display = 'flex';

      sale.products.forEach(product => {
        selectedProductsList.innerHTML += `
          <div class="selected-product-item" data-product-id="${product.id || 'legacy'}">
            <div class="selected-product-info">
              <img src="${product.image || window.products.find(p => p.name === product.name)?.image || 'placeholder.png'}" 
                   alt="${product.name}" class="selected-product-image">
              <span class="product-name">${product.name}</span>
              <span class="separator">|</span>
              <span class="product-price">
                R$ <span class="unit-price">${product.unitPrice.toFixed(2)}</span>
              </span>
              <span class="separator">|</span>
              <span class="quantity-label">Quantidade: </span>
              <input type="number" value="${product.quantity}" min="1" 
                     oninput="updateQuantityRealTime('${product.id || 'legacy'}', this.value)"
                     onfocus="this.select()">
              <span class="separator">|</span>
              <span class="total-price">
                Total: R$ <span class="total-value">${(product.unitPrice * product.quantity).toFixed(2)}</span>
              </span>
            </div>
            <button class="remove-product" onclick="removeSelectedProduct('${product.id || 'legacy'}')">
              <i class="fas fa-times"></i>
            </button>
          </div>
        `;
      });

      updateGrandTotal();

      document.querySelector('.modal-header h2').textContent = 'Editar Venda';

      document.querySelector('.modal').dataset.editingSaleId = saleId;
    })
    .catch((error) => {
      console.error('Error loading sale for editing:', error);
      alert('Erro ao carregar venda para edição. Por favor, tente novamente.');
    });
};

function generateSaleModalHTML() {
  return `
    <div class="modal-overlay" id="saleModalOverlay">
      <div class="modal">
        <div class="modal-header">
          <h2>Nova Venda</h2>
          <button class="modal-close" onclick="closeSaleModal()">×</button>
        </div>
        <div class="modal-content">
          <div class="sale-form">
            <div class="product-search-container">
              <div class="search-wrapper">
                <input 
                  type="text" 
                  class="product-search-input" 
                  placeholder="Pesquisar produto..."
                  id="saleProductSearch"
                >
                <i class="fas fa-search product-search-icon"></i>
              </div>
              <div class="search-results" id="searchResults"></div>
            </div>
            <div class="selected-products" id="selectedProducts" style="display: none;">
              <h3>Produtos Selecionados</h3>
              <div class="selected-products-list"></div>
            </div>
            <div class="sale-form-buttons">
              <button class="payment-button select-payment">
                Selecionar forma de pagamento
              </button>
              <button class="payment-button close-sale" onclick="closeSaleModal()">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function loadProductReport() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <h2 class="product-report-title">Relatório de Vendas dos Produtos</h2>
    <div class="product-report-container">
      <table class="product-report-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade Vendida</th>
            <th>Último Vendido</th>
            <th>Total Vendido (R$)</th>
          </tr>
        </thead>
        <tbody>
          <!-- Product report data will be loaded here -->
        </tbody>
      </table>
    </div>
  `;

  updateProductReport();
}

function updateProductReport() {
  database.ref('sales').once('value')
    .then((snapshot) => {
      const productStats = {};
      
      // Process all sales
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        const [day, month, year] = sale.date.split('/').map(Number);
        const saleDate = new Date(year, month - 1, day);
        
        sale.products.forEach(product => {
          if (!productStats[product.name]) {
            productStats[product.name] = {
              totalQuantity: 0,
              lastSold: saleDate,
              totalAmount: 0
            };
          }
          
          const stats = productStats[product.name];
          stats.totalQuantity += product.quantity;
          stats.totalAmount += product.total;
          
          // Update last sold date if this sale is more recent
          if (saleDate > stats.lastSold) {
            stats.lastSold = saleDate;
          }
        });
      });

      // Sort products by total quantity sold (descending)
      const sortedProducts = Object.entries(productStats)
        .sort(([, a], [, b]) => b.totalQuantity - a.totalQuantity);

      const tbody = document.querySelector('.product-report-table tbody');
      tbody.innerHTML = sortedProducts.map(([productName, stats]) => `
        <tr>
          <td>${productName}</td>
          <td>${stats.totalQuantity}</td>
          <td>${stats.lastSold.toLocaleDateString('pt-BR')}</td>
          <td>R$ ${stats.totalAmount.toFixed(2)}</td>
        </tr>
      `).join('');
    })
    .catch(error => {
      console.error('Error loading product report:', error);
    });
}

function loadStock() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <h2 class="stock-title">Controle de Estoque</h2>
    <div class="stock-container">
      <table class="stock-table">
        <thead>
          <tr>
            <th>Produto</th>
            <th>Quantidade em Estoque</th>
            <th>Status</th>
            <th>Prioridade</th>
          </tr>
        </thead>
        <tbody>
          <!-- Stock data will be loaded here -->
        </tbody>
      </table>
    </div>
  `;

  updateStockTable();
}

function updateStockTable() {
  const tbody = document.querySelector('.stock-table tbody');
  
  // Update product sorting to include priority
  const sortedProducts = [...window.products].sort((a, b) => {
    // First sort by priority
    if (a.priority && !b.priority) return -1;
    if (!a.priority && b.priority) return 1;
    // Then sort by quantity
    return a.quantity - b.quantity;
  });
  
  tbody.innerHTML = sortedProducts.map(product => {
    let statusClass, statusText;
    
    if (product.quantity === 0) {
      statusClass = 'low';
      statusText = 'Sem Estoque';
    } else if (product.quantity <= 5) {
      statusClass = 'low';
      statusText = 'Estoque Baixo';
    } else if (product.quantity <= 10) {
      statusClass = 'medium';
      statusText = 'Estoque Médio';
    } else {
      statusClass = 'good';
      statusText = 'Estoque Bom';
    }
    
    return `
      <tr>
        <td>${product.name}</td>
        <td>${product.quantity}</td>
        <td>
          <span class="stock-status ${statusClass}">
            ${statusText}
          </span>
        </td>
        <td>
          <input type="checkbox" 
                 class="priority-checkbox" 
                 ${product.priority ? 'checked' : ''} 
                 onchange="togglePriority('${product.id}', this.checked)">
        </td>
      </tr>
    `;
  }).join('');
}

window.togglePriority = function(productId, isPriority) {
  database.ref('products/' + productId).update({
    priority: isPriority
  })
  .then(() => {
    console.log('Priority updated successfully');
    updateStockTable();
  })
  .catch((error) => {
    console.error('Error updating priority:', error);
  });
}