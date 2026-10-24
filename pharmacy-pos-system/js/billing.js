let billingCart = [];

function renderBillingView() {
  const container = document.getElementById('view-billing');
  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
      <!-- LEFT: ITEM SEARCH & SELECTION (SPAN 7) -->
      <div class="lg:col-span-7 space-y-4">
        <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-3.5 top-3.5 text-slate-400"></i>
            <input type="text" id="billingSearchInput" oninput="searchBillingItems(event)" placeholder="Search medicine by name or company..." class="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div id="searchResultsContainer" class="max-h-60 overflow-y-auto divide-y divide-slate-100 hidden border border-slate-200 rounded-xl"></div>
        </div>

        <!-- SEARCHED / QUICK CATALOG TABLE -->
        <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div class="p-3 bg-slate-50 border-b font-bold text-xs text-slate-700">Available Medicines Stock</div>
          <div class="max-h-96 overflow-y-auto">
            <table class="w-full text-left text-xs text-slate-600">
              <thead class="bg-slate-100 text-slate-500 uppercase sticky top-0">
                <tr>
                  <th class="p-2.5">Item Name</th>
                  <th class="p-2.5">Type</th>
                  <th class="p-2.5">Available Units</th>
                  <th class="p-2.5">Prices (Box / Strip / Loose)</th>
                  <th class="p-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${AppState.items.length === 0 ? '<tr><td colspan="5" class="p-4 text-center text-slate-400">No stock available. Add items in Stock Update first.</td></tr>' :
                  AppState.items.map(item => `
                    <tr>
                      <td class="p-2.5 font-bold text-slate-800">${item.name} <span class="text-[10px] text-emerald-600 block font-normal">${item.company || ''}</span></td>
                      <td class="p-2.5"><span class="bg-slate-100 text-slate-600 text-[10px] px-1.5 py-0.5 rounded">${item.type}</span></td>
                      <td class="p-2.5 font-bold ${item.totalUnitsStock > 20 ? 'text-emerald-600' : 'text-rose-600'}">${item.totalUnitsStock} Units</td>
                      <td class="p-2.5 text-[11px]">
                        Rs. ${item.boxPrice} / Rs.${item.stripPrice ? item.stripPrice.toFixed(1) : ''} / <span class="text-emerald-600 font-bold">Rs. ${item.unitPrice.toFixed(2)}</span>
                      </td>
                      <td class="p-2.5 text-right">
                        <button onclick="addBillingItemToCart('${item.id}')" class="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold hover:bg-emerald-700">
                          <i class="fa-solid fa-plus mr-1"></i> Add
                        </button>
                      </td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- RIGHT: CART & POS BILLING (SPAN 5) -->
      <div class="lg:col-span-5 bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
        <div>
          <div class="flex justify-between items-center border-b pb-3">
            <h3 class="font-extrabold text-slate-800 text-base"><i class="fa-solid fa-cart-shopping text-emerald-600 mr-2"></i> POS Cart</h3>
            <button onclick="clearBillingCart()" class="text-xs text-rose-600 font-bold hover:underline">Clear Cart</button>
          </div>

          <div class="mt-3 overflow-y-auto max-h-64 divide-y divide-slate-100" id="cartItemsContainer">
            ${renderCartItems()}
          </div>
        </div>

        <!-- CART TOTALS & DUAL PAYMENT ACTION BUTTONS -->
        <div class="border-t pt-4 space-y-3 bg-slate-50 -mx-5 -mb-5 p-5 rounded-b-xl">
          <div class="flex justify-between text-xs text-slate-600">
            <span>Subtotal</span>
            <span id="cartSubtotal" class="font-bold">Rs. ${calculateCartSubtotal().toFixed(2)}</span>
          </div>

          <div class="flex items-center justify-between text-xs">
            <label class="text-slate-600 font-semibold">Discount (Rs.)</label>
            <input type="number" id="cartDiscountInput" min="0" value="0" oninput="updateCartTotals()" class="w-24 border border-slate-300 rounded p-1 text-right text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div class="flex justify-between text-base font-extrabold text-slate-800 border-t pt-2">
            <span>Grand Total</span>
            <span id="cartGrandTotal" class="text-emerald-600">Rs. ${calculateCartSubtotal().toFixed(2)}</span>
          </div>

          <!-- ACTION BUTTONS: PAY ONLY vs PAY & PRINT -->
          <div class="grid grid-cols-2 gap-2 pt-2">
            <button onclick="processPOSPayment(false)" class="bg-slate-800 text-white font-extrabold py-3 rounded-xl hover:bg-slate-700 transition shadow text-xs flex items-center justify-center gap-1">
              <i class="fa-solid fa-check text-emerald-400"></i> Pay & Save (No Print)
            </button>
            <button onclick="processPOSPayment(true)" class="bg-emerald-600 text-white font-extrabold py-3 rounded-xl hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20 text-xs flex items-center justify-center gap-1">
              <i class="fa-solid fa-print"></i> Pay & Print Bill
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderCartItems() {
  if (billingCart.length === 0) {
    return `<p class="text-center text-xs text-slate-400 py-8">Cart is empty. Click "+ Add" on medicines to bill.</p>`;
  }

  return billingCart.map((cartItem, idx) => `
    <div class="py-2.5 space-y-1.5">
      <div class="flex justify-between items-center text-xs">
        <span class="font-bold text-slate-800">${cartItem.name} <span class="text-[10px] text-slate-400">(${cartItem.type})</span></span>
        <button onclick="removeCartItem(${idx})" class="text-rose-500 hover:text-rose-700"><i class="fa-solid fa-xmark"></i></button>
      </div>

      <div class="grid grid-cols-3 gap-2 items-center text-xs">
        <div>
          <select onchange="updateCartUnitType(${idx}, this.value)" class="w-full border rounded p-1 text-[11px]">
            <option value="Loose" ${cartItem.selectedUnit === 'Loose' ? 'selected' : ''}>Loose Tab</option>
            <option value="Strip" ${cartItem.selectedUnit === 'Strip' ? 'selected' : ''}>Strip</option>
            <option value="Box" ${cartItem.selectedUnit === 'Box' ? 'selected' : ''}>Full Box</option>
          </select>
        </div>

        <div>
          <input type="number" min="1" value="${cartItem.qty}" onchange="updateCartQty(${idx}, this.value)" class="w-full border rounded p-1 text-center text-xs" />
        </div>

        <div class="text-right font-bold text-slate-800">
          Rs. ${(cartItem.price * cartItem.qty).toFixed(2)}
        </div>
      </div>
    </div>
  `).join('');
}

function searchBillingItems(e) {
  const query = e.target.value.toLowerCase().trim();
  const resultsContainer = document.getElementById('searchResultsContainer');

  if (!query) {
    resultsContainer.classList.add('hidden');
    resultsContainer.innerHTML = '';
    return;
  }

  const matches = AppState.items.filter(i => i.name.toLowerCase().includes(query) || (i.company && i.company.toLowerCase().includes(query)));
  
  if (matches.length === 0) {
    resultsContainer.innerHTML = `<div class="p-3 text-xs text-slate-400 text-center">No medicines matched your query.</div>`;
  } else {
    resultsContainer.innerHTML = matches.map(m => `
      <div onclick="addBillingItemToCart('${m.id}')" class="p-2.5 hover:bg-emerald-50 cursor-pointer flex justify-between items-center text-xs">
        <div>
          <p class="font-bold text-slate-800">${m.name}</p>
          <p class="text-[10px] text-slate-400">${m.company || ''} | ${m.type} | Stock: ${m.totalUnitsStock} Units</p>
        </div>
        <span class="font-bold text-emerald-600">Rs. ${m.unitPrice.toFixed(2)}/tab</span>
      </div>
    `).join('');
  }

  resultsContainer.classList.remove('hidden');
}

function addBillingItemToCart(itemId) {
  const item = AppState.items.find(i => i.id === itemId);
  if (!item) return;

  if (item.totalUnitsStock <= 0) {
    alert(`Out of stock! "${item.name}" has 0 available units.`);
    return;
  }

  const existingIdx = billingCart.findIndex(c => c.itemId === itemId && c.selectedUnit === 'Loose');
  if (existingIdx !== -1) {
    billingCart[existingIdx].qty += 1;
  } else {
    billingCart.push({
      itemId: item.id,
      name: item.name,
      type: item.type,
      selectedUnit: 'Loose',
      unitRatio: 1,
      price: item.unitPrice,
      qty: 1
    });
  }

  document.getElementById('searchResultsContainer').classList.add('hidden');
  document.getElementById('billingSearchInput').value = '';
  renderBillingView();
}

function updateCartUnitType(idx, unitType) {
  const cartItem = billingCart[idx];
  const item = AppState.items.find(i => i.id === cartItem.itemId);
  if (!item) return;

  cartItem.selectedUnit = unitType;
  if (unitType === 'Box') {
    cartItem.price = item.boxPrice;
    cartItem.unitRatio = item.totalUnitsPerBox;
  } else if (unitType === 'Strip') {
    cartItem.price = item.stripPrice;
    cartItem.unitRatio = item.unitsPerStrip;
  } else {
    cartItem.price = item.unitPrice;
    cartItem.unitRatio = 1;
  }

  renderBillingView();
}

function updateCartQty(idx, qtyVal) {
  const qty = parseInt(qtyVal) || 1;
  billingCart[idx].qty = qty;
  renderBillingView();
}

function removeCartItem(idx) {
  billingCart.splice(idx, 1);
  renderBillingView();
}

function clearBillingCart() {
  billingCart = [];
  renderBillingView();
}

function calculateCartSubtotal() {
  return billingCart.reduce((acc, item) => acc + (item.price * item.qty), 0);
}

function updateCartTotals() {
  const subtotal = calculateCartSubtotal();
  const discount = parseFloat(document.getElementById('cartDiscountInput').value) || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  document.getElementById('cartSubtotal').innerText = `Rs. ${subtotal.toFixed(2)}`;
  document.getElementById('cartGrandTotal').innerText = `Rs. ${grandTotal.toFixed(2)}`;
}

// POS PAYMENT PROCESSOR (HANDLES BOTH PRINT & NO-PRINT)
function processPOSPayment(shouldPrint) {
  if (billingCart.length === 0) {
    alert('POS Cart is empty! Add items before completing payment.');
    return;
  }

  // Stock deduction check
  for (const cItem of billingCart) {
    const item = AppState.items.find(i => i.id === cItem.itemId);
    const requiredUnits = cItem.qty * cItem.unitRatio;
    if (!item || item.totalUnitsStock < requiredUnits) {
      alert(`Insufficient stock for "${cItem.name}". Available: ${item ? item.totalUnitsStock : 0} units.`);
      return;
    }
  }

  // Deduct Inventory Stock
  billingCart.forEach(cItem => {
    const item = AppState.items.find(i => i.id === cItem.itemId);
    if (item) {
      item.totalUnitsStock -= (cItem.qty * cItem.unitRatio);
    }
  });

  const subtotal = calculateCartSubtotal();
  const discount = parseFloat(document.getElementById('cartDiscountInput').value) || 0;
  const grandTotal = Math.max(0, subtotal - discount);

  const saleRecord = {
    id: `INV-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    items: [...billingCart],
    subtotal,
    discount,
    grandTotal
  };

  AppState.sales.push(saleRecord);
  savePharmacies();

  if (shouldPrint) {
    printThermalReceipt(saleRecord);
  } else {
    alert(`Payment Recorded Successfully! Invoice ${saleRecord.id} saved.`);
  }

  billingCart = [];
  renderBillingView();
}

// CUSTOM CLEAN THERMAL RECEIPT PRINT ENGINE
function printThermalReceipt(sale) {
  const pharmacy = AppState.currentPharmacy;
  const printWindow = window.open('', '_blank', 'width=350,height=600');

  const receiptHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Receipt ${sale.id}</title>
      <style>
        @page { size: 80mm auto; margin: 0; }
        body {
          font-family: 'Courier New', Courier, monospace;
          width: 76mm;
          margin: 0 auto;
          padding: 8px;
          font-size: 11px;
          color: #000;
        }
        .text-center { text-align: center; }
        .text-right { text-align: right; }
        .bold { font-weight: bold; }
        .border-top { border-top: 1px dashed #000; padding-top: 4px; margin-top: 4px; }
        .border-bottom { border-bottom: 1px dashed #000; padding-bottom: 4px; margin-bottom: 4px; }
        table { width: 100%; border-collapse: collapse; margin: 6px 0; }
        th, td { text-align: left; padding: 2px 0; font-size: 10px; }
      </style>
    </head>
    <body>
      <div class="text-center border-bottom">
        <h2 class="bold" style="margin: 0; font-size: 14px;">${pharmacy.pharmacyName}</h2>
        <p style="margin: 2px 0;">${pharmacy.location}</p>
        <p style="margin: 2px 0;">Ph: ${pharmacy.pharmacyPhone}</p>
        <p style="margin: 2px 0; font-size: 9px;">Lic No: ${pharmacy.licenseNo}</p>
      </div>

      <div style="margin: 4px 0; font-size: 10px;">
        <div><b>Inv No:</b> ${sale.id}</div>
        <div><b>Date:</b> ${sale.date}</div>
      </div>

      <table class="border-top border-bottom">
        <thead>
          <tr>
            <th>Item (Type)</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Price</th>
          </tr>
        </thead>
        <tbody>
          ${sale.items.map(item => `
            <tr>
              <td>${item.name} <br><span style="font-size: 8px;">(${item.type} -${item.selectedUnit})</span></td>
              <td class="text-center">${item.qty}</td>
              <td class="text-right">Rs.${(item.price * item.qty).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="border-bottom" style="font-size: 11px;">
        <div style="display:flex; justify-content:space-between;">
          <span>Subtotal:</span>
          <span>Rs. ${sale.subtotal.toFixed(2)}</span>
        </div>
        ${sale.discount > 0 ? `
          <div style="display:flex; justify-content:space-between;">
            <span>Discount:</span>
            <span>- Rs. ${sale.discount.toFixed(2)}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between;" class="bold">
          <span>Grand Total:</span>
          <span>Rs. ${sale.grandTotal.toFixed(2)}</span>
        </div>
      </div>

      <div class="text-center" style="margin-top: 8px; font-size: 9px;">
        <p style="margin:2px 0;">Thank you for visiting!</p>
        <p style="margin:2px 0;">Software by Muhammad Shoaib (03327809739)</p>
      </div>

      <script>
        window.onload = function() {
          window.print();
          setTimeout(function() { window.close(); }, 500);
        };
      <\/script>
    </body>
    </html>
  `;

  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}