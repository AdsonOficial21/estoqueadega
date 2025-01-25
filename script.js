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

// Move these functions outside of DOMContentLoaded to make them globally accessible
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
      const discount = (quantity * unitPrice) - total;
      
      return {
        name: item.querySelector('.product-name').textContent,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total
      };
    }),
    paymentMethod: paymentMethodText,
    total: parseFloat(grandTotal.replace('R$ ', ''))
  };

  // Create an array of promises for updating product quantities
  const updatePromises = Array.from(selectedProducts).map(item => {
    const productName = item.querySelector('.product-name').textContent;
    const soldQuantity = parseInt(item.querySelector('input[type="number"]').value);
    
    // Find the product in the products array
    const product = window.products.find(p => p.name === productName);
    if (product) {
      // Calculate new quantity
      const newQuantity = product.quantity - soldQuantity;
      
      // Update product quantity in Firebase
      return database.ref('products/' + product.id).update({
        quantity: newQuantity
      });
    }
    return Promise.resolve();
  });

  // Wait for all product updates and sale save to complete
  Promise.all([
    ...updatePromises,
    database.ref('sales').push(saleData)
  ])
    .then(() => {
      console.log('Sale saved and products updated successfully');
      closePaymentModal();
      closeSaleModal();
      updateSalesTable();
    })
    .catch((error) => {
      console.error('Error saving sale or updating products:', error);
      alert('Erro ao salvar venda. Por favor, tente novamente.');
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

  // Check if grand total div exists, if not create it
  let grandTotalDiv = document.getElementById('grandTotal');
  if (!grandTotalDiv) {
    grandTotalDiv = document.createElement('div');
    grandTotalDiv.id = 'grandTotal';
    grandTotalDiv.className = 'grand-total';
    selectedProductsList.parentNode.appendChild(grandTotalDiv);
  }

  // Update grand total display
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
    // First get the sale data
    database.ref('sales/' + saleId).once('value')
      .then((snapshot) => {
        const sale = snapshot.val();
        
        // Create an array of promises for updating product quantities
        const updatePromises = sale.products.map(saleProduct => {
          // Find the product in the products array
          const product = window.products.find(p => p.name === saleProduct.name);
          if (product) {
            // Calculate new quantity by adding back the sold quantity
            const newQuantity = product.quantity + saleProduct.quantity;
            
            // Update product quantity in Firebase
            return database.ref('products/' + product.id).update({
              quantity: newQuantity
            });
          }
          return Promise.resolve();
        });

        // Wait for all product updates and sale deletion to complete
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

function loadSalesTable() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <div class="sales-header">
      <button class="new-sale-btn" onclick="openSaleModal()">
        <i class="fas fa-plus"></i>
        Nova Venda
      </button>
      <h2>Histórico de Vendas</h2>
    </div>
    <table class="sales-table">
      <thead>
        <tr>
          <th>Data</th>
          <th>Hora</th>
          <th>Produtos</th>
          <th>Forma de Pagamento</th>
          <th>Total</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        <!-- Sales data will be loaded here -->
      </tbody>
    </table>

    <!-- Rest of the modal HTML remains the same -->
    ${generateSaleModalHTML()}
  `;

  // Add event listeners for sale modal
  setupSaleModalListeners();
  // Update sales table immediately after loading
  updateSalesTable();
}

function generateSaleModalHTML() {
  // Return the existing sale modal HTML
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

function setupSaleModalListeners() {
  // Add event listener for product search
  const searchInput = document.getElementById('saleProductSearch');
  if (searchInput) {
    searchInput.addEventListener('input', handleSaleProductSearch);
  }

  // Add event listener for select payment button
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

  // Changed the filter to check if product name starts with the search term
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

  // Set selected index to 0 if there are results
  window.selectedIndex = filteredProducts.length > 0 ? 0 : -1;
}

document.addEventListener('DOMContentLoaded', function() {
  // Initialize products array to store the data
  window.products = [];
  
  // Load products from Firebase when the application starts
  loadProductsFromFirebase();
  
  const productsLink = document.querySelector('a[href="https://example.com/produtos"]');
  const salesLink = document.querySelector('a[href="https://example.com/vendas"]');
  const movimentacoesLink = document.querySelector('a[href="https://example.com/movimentacoes"]');
  const cashLink = document.querySelector('a[href="https://example.com/caixa"]');
  
  productsLink.addEventListener('click', function(e) {
    e.preventDefault();
    loadProductsTable();
    
    // Remove active class from all links and add to products
    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
  });
  
  salesLink.addEventListener('click', function(e) {
    e.preventDefault();
    loadSalesTable();
    
    // Remove active class from all links and add to sales
    document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
    this.classList.add('active');
  });

  if (movimentacoesLink) {
    movimentacoesLink.addEventListener('click', function(e) {
      e.preventDefault();
      loadPaymentMethodTotals();
      
      // Remove active class from all links and add to movimentacoes
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
    });
  }

  if (cashLink) {
    cashLink.addEventListener('click', function(e) {
      e.preventDefault();
      loadCashHistory();
      
      // Remove active class from all links and add to cash
      document.querySelectorAll('.menu a').forEach(a => a.classList.remove('active'));
      this.classList.add('active');
    });
  }
  
  // Load sales table by default (only once)
  loadSalesTable();
  
  // Update keydown event listener to handle both modals
  document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
      // Check if any modal is open and close it
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

  // Add keyboard event listener to search input
  const searchInput = document.getElementById('saleProductSearch');
  if (searchInput) {
    searchInput.addEventListener('keydown', function(e) {
      const searchResults = document.getElementById('searchResults');
      const items = searchResults.getElementsByClassName('search-result-item');
      
      if (items.length === 0) return;

      // Initialize selectedIndex if not set
      if (typeof window.selectedIndex === 'undefined') {
        window.selectedIndex = -1;
      }

      switch(e.key) {
        case 'ArrowDown':
          e.preventDefault(); // Prevent cursor movement in input
          window.selectedIndex = Math.min(window.selectedIndex + 1, items.length - 1);
          updateSelection(items);
          break;

        case 'ArrowUp':
          e.preventDefault(); // Prevent cursor movement in input
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
            // If no item is selected but there are results, select the first one
            const productId = items[0].dataset.productId;
            selectProduct(productId);
          }
          break;
      }
    });
  }
});

function updateSelection(items) {
  // Remove highlight from all items
  Array.from(items).forEach(item => {
    item.classList.remove('selected');
  });

  // Add highlight to selected item
  if (window.selectedIndex >= 0 && items[window.selectedIndex]) {
    items[window.selectedIndex].classList.add('selected');
    // Ensure selected item is visible
    items[window.selectedIndex].scrollIntoView({ 
      behavior: 'smooth', 
      block: 'nearest' 
    });
  }
}

function loadProductsFromFirebase() {
  const productsRef = database.ref('products');
  // Remove any existing listeners before adding a new one
  productsRef.off('value');
  productsRef.on('value', (snapshot) => {
    window.products = [];
    snapshot.forEach((childSnapshot) => {
      const product = childSnapshot.val();
      product.id = childSnapshot.key;
      window.products.push(product);
    });
      
    // Sort products alphabetically by name
    window.products.sort((a, b) => a.name.localeCompare(b.name));
      
    // Update the table if we're on the products page
    const productsTable = document.getElementById('productsTableBody');
    if (productsTable) {
      productsTable.innerHTML = renderProductsTable();
    }
  });
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

  // Get form, create single reference and add submit listener ONCE
  const form = document.getElementById('addProductForm');
  // Remove any existing listeners by cloning and replacing the form
  const clonedForm = form.cloneNode(true);
  form.parentNode.replaceChild(clonedForm, form);
  // Add new listener for adding products
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
  
  // Determine which image source to use
  let finalImageUrl;
  if (imageUpload.files && imageUpload.files[0]) {
    const reader = new FileReader();
    reader.onload = function(e) {
      finalImageUrl = e.target.result;
      // Clear the URL input since we're using uploaded image
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
  
  // Remove any existing submit event listeners
  const form = document.getElementById('addProductForm');
  const clonedForm = form.cloneNode(true);
  form.parentNode.replaceChild(clonedForm, form);
  // Add new submit event listener for editing
  clonedForm.addEventListener('submit', (e) => handleFormSubmit(e, id));
  
  document.querySelector('.modal-header h2').textContent = 'Editar Produto';
  document.querySelector('.save-btn').textContent = 'Atualizar';
}

function openModal(isEditing = false) {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.style.display = 'block';
  
  // Reset form if not editing
  if (!isEditing) {
    document.getElementById('addProductForm').reset();
    document.querySelector('.modal-header h2').textContent = 'Adicionar Novo Produto';
    document.querySelector('.save-btn').textContent = 'Salvar';
  }
}

function closeModal() {
  const modalOverlay = document.getElementById('modalOverlay');
  modalOverlay.style.display = 'none';
  
  // Reset form and its submit handler
  const form = document.getElementById('addProductForm');
  form.reset();
  form.onsubmit = (e) => handleFormSubmit(e);
  
  // Reset modal title and button text
  document.querySelector('.modal-header h2').textContent = 'Adicionar Novo Produto';
  document.querySelector('.save-btn').textContent = 'Salvar';
  
  // Remove focus from any active element
  if (document.activeElement) {
    document.activeElement.blur();
  }
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
  
  // Remove "(Cópia)" from the name if it exists, then add it once
  let newName = product.name.replace(/\s*\(Cópia\)*/g, '');
  newName = `${newName} (Cópia)`;
  
  // Create new product data without ID
  const duplicatedProduct = {
    name: newName,
    price: product.price,
    quantity: product.quantity,
    profit: product.profit,
    image: product.image,
    costPrice: product.costPrice
  };
  
  // Add to database
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
  
  // Sort filtered products alphabetically
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

// Close modal when clicking outside
window.onclick = function(event) {
  const modalOverlay = document.getElementById('modalOverlay');
  if (event.target === modalOverlay) {
    closeModal();
  }
}

window.editSale = undefined;

function updateSalesTable() {
  const salesTableBody = document.querySelector('.sales-table tbody');
  if (!salesTableBody) return;

  // Clear existing rows
  salesTableBody.innerHTML = '';

  // Get sales data from Firebase
  database.ref('sales').orderByChild('date').once('value')
    .then((snapshot) => {
      // Convert the snapshot to an array and reverse it to show newest first
      const salesArray = [];
      snapshot.forEach((childSnapshot) => {
        salesArray.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      
      // Reverse array to show newest sales first
      salesArray.reverse().forEach((sale) => {
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
            <td>
              <button onclick="deleteSale('${sale.id}')" class="delete-sale-btn" title="Excluir venda">
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        `;
        salesTableBody.innerHTML += row;
      });
    })
    .catch((error) => {
      console.error('Error loading sales:', error);
    });
}

function loadCashHistory() {
  const content = document.querySelector('.content');
  content.innerHTML = `
    <h2 class="cash-history-title">Histórico de Caixa</h2>
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
  `;

  updateCashHistoryTable();
}

window.deleteCashHistory = function(date) {
  // Get all sales
  database.ref('sales').once('value')
    .then((snapshot) => {
      // Get all sales for the specified date and their keys
      const salesToDelete = [];
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        if (sale.date === date) {
          salesToDelete.push(childSnapshot.key);
        }
      });
      
      // Create an object with all updates to perform
      const updates = {};
      salesToDelete.forEach((saleKey) => {
        updates[`sales/${saleKey}`] = null;
      });
      
      // Perform all deletions in one atomic operation
      return database.ref().update(updates);
    })
    .then(() => {
      console.log('Cash history deleted successfully');
      updateCashHistoryTable();
    })
    .catch((error) => {
      console.error('Error deleting cash history:', error);
      alert('Erro ao excluir histórico. Por favor, tente novamente.');
    });
};

function updateCashHistoryTable() {
  // Get all sales data from Firebase
  database.ref('sales').once('value')
    .then((snapshot) => {
      const salesData = [];
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        const date = sale.date;
        
        // Find existing date entry or create new one
        let dateEntry = salesData.find(entry => entry.date === date);
        if (!dateEntry) {
          dateEntry = { date: date, total: 0, profit: 0 };
          salesData.push(dateEntry);
        }
        
        // Add sale total to date entry
        dateEntry.total += sale.total;

        // Calculate profit for this sale using the products data
        sale.products.forEach(product => {
          const productRef = window.products.find(p => p.name === product.name);
          if (productRef) {
            const productProfit = (product.unitPrice - productRef.costPrice) * product.quantity;
            dateEntry.profit += productProfit;
          }
        });
      });

      // Sort by date (most recent first)
      salesData.sort((a, b) => {
        // Convert dates to comparable format (assuming date format is DD/MM/YYYY)
        const [aDay, aMonth, aYear] = a.date.split('/').map(Number);
        const [bDay, bMonth, bYear] = b.date.split('/').map(Number);
        
        // Create Date objects for comparison
        const dateA = new Date(aYear, aMonth - 1, aDay);
        const dateB = new Date(bYear, bMonth - 1, bDay);
        
        // Sort in descending order (newest first)
        return dateB - dateA;
      });

      // Update the table
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
  // Get current date in DD/MM/YYYY format
  const today = new Date();
  const currentDate = today.toLocaleDateString('pt-BR'); // Will format as DD/MM/YYYY
  
  // Get all sales data from Firebase
  database.ref('sales').once('value')
    .then((snapshot) => {
      const paymentTotals = {};
      
      // Calculate totals for each payment method for current day only
      snapshot.forEach((childSnapshot) => {
        const sale = childSnapshot.val();
        // Only process sales from today
        if (sale.date === currentDate) {
          const paymentMethod = sale.paymentMethod;
          const total = sale.total || 0;
          
          if (paymentMethod) {
            paymentTotals[paymentMethod] = (paymentTotals[paymentMethod] || 0) + total;
          }
        }
      });

      // Update the table
      const tbody = document.querySelector('.payment-totals-table tbody');
      if (Object.keys(paymentTotals).length === 0) {
        // If no sales today, show message
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
      
      // Update the title to show current date with different format for mobile
      const title = document.querySelector('.payment-totals-title');
      if (title) {
        // Check if we're on mobile
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

// Add resize listener to update title format when window size changes
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

  // Only show message if there's a value entered
  if (receivedAmount.trim() !== '') {
    if (received >= 0) {
      const change = received - totalAmount;
      if (received > totalAmount) {
        changeElement.textContent = `Troco: R$ ${change.toFixed(2)}`;
        changeElement.style.color = '#27ae60'; // Green color for positive change
      } else {
        changeElement.textContent = 'Digite o valor recebido corretamente';
        changeElement.style.color = '#e74c3c'; // Red color for warning message
      }
      changeElement.style.display = 'block';
    } else {
      changeElement.style.display = 'none';
    }
  } else {
    changeElement.style.display = 'none';
  }
};