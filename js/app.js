const AppState = {
  currentPharmacy: null,
  pharmacies: JSON.parse(localStorage.getItem('registeredPharmacies')) || [],
  payments: JSON.parse(localStorage.getItem('registeredPayments')) || [],
  items: [],
  sales: [],
  companyPurchases: []
};

let base64ReceiptImg = '';
let currentActiveView = 'dashboard';
let billingCart = [];
let discountPercent = 0;

document.addEventListener('DOMContentLoaded', () => {
  setupSidebarToggle();
  setupSecretAdminHotkey();
  checkSession();
});

function setupSidebarToggle() {
  const btn = document.getElementById('toggleSidebarBtn');
  const sidebar = document.getElementById('sidebar');
  if (btn && sidebar) btn.addEventListener('click', () => sidebar.classList.toggle('hidden'));
}

function setupSecretAdminHotkey() {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      document.getElementById('secretAdminModal').classList.remove('hidden');
    }
  });
}

function handleAdminLogin(e) {
  e.preventDefault();
  const u = document.getElementById('adminUser').value.trim();
  const p = document.getElementById('adminPassword').value.trim();
  if (u === 'shoaib2814' && p === 'Sho@ib_admin') {
    document.getElementById('secretAdminModal').classList.add('hidden');
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('appShell').classList.add('hidden');
    document.getElementById('superAdminShell').classList.remove('hidden');
    renderSuperAdmin();
  } else {
    alert('Invalid Super Admin credentials!');
  }
}

function triggerForgotPassword() {
  const phone = prompt('Enter registered owner phone for Medora account reset:');
  if (!phone || !phone.trim()) return;
  alert(`Reset SMS triggered to ${phone}. Direct support available via 03327809739.`);
}

function openAuthModal(mode) {
  document.getElementById('authModal').classList.remove('hidden');
  switchAuthTab(mode);
}

function switchAuthTab(tab) {
  const isLogin = tab === 'login';
  document.getElementById('modalTabLogin').className = `flex-1 py-3 border-b-2 ${isLogin ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`;
  document.getElementById('modalTabRegister').className = `flex-1 py-3 border-b-2 ${!isLogin ? 'border-emerald-400 text-emerald-400' : 'border-transparent text-slate-400'}`;
  document.getElementById('loginForm').classList.toggle('hidden', !isLogin);
  document.getElementById('registerForm').classList.toggle('hidden', isLogin);
}

function checkSession() {
  const activeId = localStorage.getItem('activePharmacyId');
  if (activeId) {
    const found = AppState.pharmacies.find(p => p.id === activeId);
    if (found) { loginSession(found); return; }
  }
  document.getElementById('landingPage').classList.remove('hidden');
}

function loginSession(pharmacy) {
  if (pharmacy.isDeactivated) {
    document.getElementById('landingPage').classList.add('hidden');
    document.getElementById('appShell').classList.remove('hidden');
    document.getElementById('subscriptionLockout').classList.remove('hidden');
    document.getElementById('lockoutTitle').innerText = 'Account Suspended / Frozen';
    document.getElementById('lockoutDesc').innerText = 'Your Medora account has been temporarily frozen. Contact developer at 03327809739.';
    return;
  }

  AppState.currentPharmacy = pharmacy;
  AppState.items = pharmacy.items || [];
  AppState.sales = pharmacy.sales || [];
  AppState.companyPurchases = pharmacy.companyPurchases || [];

  localStorage.setItem('activePharmacyId', pharmacy.id);
  document.getElementById('landingPage').classList.add('hidden');
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('superAdminShell').classList.add('hidden');
  document.getElementById('appShell').classList.remove('hidden');

  document.getElementById('pharmacyNameHeader').innerText = `${pharmacy.pharmacyName} (Medora)`;
  document.getElementById('pharmacyDetailsHeader').innerText = `${pharmacy.ownerName} | ${pharmacy.location}`;

  const isExpired = !pharmacy.feeWaived && (!pharmacy.subscriptionPaidUntil || new Date(pharmacy.subscriptionPaidUntil) < new Date());
  document.getElementById('subscriptionLockout').classList.toggle('hidden', !isExpired);

  switchView('dashboard');
}

function handleLogin(e) {
  e.preventDefault();
  const phone = document.getElementById('loginPhone').value.trim();
  const pass = document.getElementById('loginPassword').value.trim();
  const found = AppState.pharmacies.find(p => (p.ownerPhone === phone || p.pharmacyPhone === phone) && p.password === pass);
  if (!found) { alert('Invalid phone or password!'); return; }
  loginSession(found);
}

function handleRegister(e) {
  e.preventDefault();
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const newPharmacy = {
    id: `MED-${Date.now().toString().slice(-5)}`,
    ownerName: document.getElementById('regOwnerName').value.trim(),
    pharmacyName: document.getElementById('regPharmacyName').value.trim(),
    ownerPhone: document.getElementById('regOwnerPhone').value.trim(),
    pharmacyPhone: document.getElementById('regPharmacyPhone').value.trim(),
    location: document.getElementById('regLocation').value.trim(),
    password: document.getElementById('regPassword').value.trim(),
    regDate: new Date().toLocaleDateString(),
    isDeactivated: false,
    feeWaived: false,
    paymentStatus: 'Pending',
    subscriptionPaidUntil: nextMonth.toISOString(),
    items: [], sales: [], companyPurchases: []
  };

  AppState.pharmacies.push(newPharmacy);
  saveData();
  alert('Registration on Medora Successful!');
  loginSession(newPharmacy);
}

function handleLogout() {
  localStorage.removeItem('activePharmacyId');
  document.getElementById('appShell').classList.add('hidden');
  document.getElementById('superAdminShell').classList.add('hidden');
  document.getElementById('landingPage').classList.remove('hidden');
}

function saveData() {
  if (AppState.currentPharmacy) {
    AppState.currentPharmacy.items = AppState.items;
    AppState.currentPharmacy.sales = AppState.sales;
    AppState.currentPharmacy.companyPurchases = AppState.companyPurchases;
    const idx = AppState.pharmacies.findIndex(p => p.id === AppState.currentPharmacy.id);
    if (idx !== -1) AppState.pharmacies[idx] = AppState.currentPharmacy;
  }
  localStorage.setItem('registeredPharmacies', JSON.stringify(AppState.pharmacies));
  localStorage.setItem('registeredPayments', JSON.stringify(AppState.payments));
}

function openPaymentModal() { document.getElementById('paymentModal').classList.remove('hidden'); }

function previewReceiptScreenshot(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(event) {
    base64ReceiptImg = event.target.result;
    document.getElementById('receiptPreviewImg').src = base64ReceiptImg;
    document.getElementById('receiptPreviewBox').classList.remove('hidden');
  };
  reader.readAsDataURL(file);
}

function submitMonthlyPayment(e) {
  e.preventDefault();
  const trxId = document.getElementById('payTrxId').value.trim();
  const method = document.getElementById('payMethod').value;
  if (!base64ReceiptImg) { alert('Please upload receipt screenshot!'); return; }

  AppState.currentPharmacy.paymentStatus = 'Verification Pending';
  AppState.payments.push({
    id: `PAY-${Date.now()}`,
    pharmacyId: AppState.currentPharmacy.id,
    pharmacyName: AppState.currentPharmacy.pharmacyName,
    trxId, method, amount: 3000, receiptImg: base64ReceiptImg,
    date: new Date().toLocaleDateString(), status: 'Verification Pending'
  });
  saveData();
  document.getElementById('paymentModal').classList.add('hidden');
  alert('Payment submitted for verification!');
}

function switchView(viewName) {
  currentActiveView = viewName;
  document.querySelectorAll('.view-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('bg-slate-800', 'text-white'));
  
  const target = document.getElementById(`view-${viewName}`);
  if (target) {
    target.classList.remove('hidden');
    if (viewName === 'dashboard') renderDashboard();
    if (viewName === 'billing') renderBilling();
    if (viewName === 'salesHistory') renderSalesHistory();
    if (viewName === 'itemOpening') renderItemOpening();
    if (viewName === 'stockUpdate') renderStockUpdate();
    if (viewName === 'companyPurchases') renderCompanyPurchases();
    if (viewName === 'lowStockOrders') renderLowStockOrders();
  }
}

// Check Expiry Notifications (Within 30 Days)
function getExpiringItems() {
  const now = new Date();
  const thirtyDaysAhead = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
  
  return AppState.items.filter(i => {
    if (!i.expiryDate) return false;
    const exp = new Date(i.expiryDate);
    return exp <= thirtyDaysAhead;
  });
}

// ================= 1. DASHBOARD =================
function renderDashboard() {
  const container = document.getElementById('view-dashboard');
  const totalInvestment = AppState.companyPurchases.reduce((acc, p) => acc + (p.amountPaid || 0), 0);
  const totalCostSold = AppState.sales.reduce((acc, s) => acc + (s.totalCost || 0), 0);
  const totalRevenue = AppState.sales.reduce((acc, s) => acc + (s.netTotal || 0), 0);
  const totalProfit = totalRevenue - totalCostSold;

  const expiringList = getExpiringItems();

  container.innerHTML = `
    <div class="space-y-6">
      ${expiringList.length === 0 ? '' : `
        <div class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-amber-300 flex items-start gap-3 shadow-sm">
          <i class="fa-solid fa-triangle-exclamation text-amber-400 text-xl mt-0.5"></i>
          <div class="flex-1">
            <h4 class="font-extrabold text-sm text-amber-300">Medora Expiry Warning: ${expiringList.length} Medicine(s) Expiring Within 30 Days!</h4>
            <div class="mt-2 flex flex-wrap gap-2">
              ${expiringList.map(exp => `
                <span class="bg-amber-500/20 text-amber-300 text-[11px] px-3 py-1 rounded-lg border border-amber-500/30 font-bold">
                  ${exp.type} ${exp.name} (${exp.company}) — Expires: ${exp.expiryDate}
                </span>
              `).join('')}
            </div>
          </div>
        </div>
      `}

      <h2 class="text-2xl font-bold text-white">Dashboard & Financial Analytics</h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-slate-900 p-5 rounded-2xl border border-slate-800"><p class="text-xs font-bold text-slate-400 uppercase">Total Investment</p><p class="text-2xl font-black text-blue-400 mt-1">Rs. ${totalInvestment.toFixed(2)}</p></div>
        <div class="bg-slate-900 p-5 rounded-2xl border border-slate-800"><p class="text-xs font-bold text-slate-400 uppercase">Total Sales Revenue</p><p class="text-2xl font-black text-emerald-400 mt-1">Rs. ${totalRevenue.toFixed(2)}</p></div>
        <div class="bg-slate-900 p-5 rounded-2xl border border-slate-800"><p class="text-xs font-bold text-slate-400 uppercase">Cost of Sold Goods</p><p class="text-2xl font-black text-amber-400 mt-1">Rs. ${totalCostSold.toFixed(2)}</p></div>
        <div class="bg-slate-900 p-5 rounded-2xl border border-slate-800"><p class="text-xs font-bold text-slate-400 uppercase">Net Profit / Loss</p><p class="text-2xl font-black ${totalProfit >= 0 ? 'text-teal-400' : 'text-rose-400'} mt-1">Rs. ${totalProfit.toFixed(2)}</p></div>
      </div>

      <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <h3 class="font-extrabold text-white text-base"><i class="fa-solid fa-chart-line mr-2 text-emerald-400"></i> Medora Profit & Loss Performance Graph</h3>
        <div class="h-80 w-full relative">
          <canvas id="profitGraphCanvas"></canvas>
        </div>
      </div>
    </div>
  `;

  setTimeout(() => renderProfitGraph(totalInvestment, totalRevenue, totalProfit), 100);
}

function renderProfitGraph(inv, rev, prof) {
  const ctx = document.getElementById('profitGraphCanvas')?.getContext('2d');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Total Investment', 'Total Revenue', 'Net Profit'],
      datasets: [{
        label: 'PKR Amount (Rs.)',
        data: [inv, rev, prof],
        backgroundColor: ['#3b82f6', '#10b981', prof >= 0 ? '#0d9488' : '#f43f5e'],
        borderRadius: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } }
    }
  });
}

// ================= 2. ITEM MASTER OPENING =================
function renderItemOpening() {
  const container = document.getElementById('view-itemOpening');
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white">1. Item Master Opening</h2>

      <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <form onsubmit="handleSaveItem(event)" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Item / Medicine Name *</label><input type="text" id="itemName" required placeholder="Panadol 500mg" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Company Name *</label><input type="text" id="itemCompany" required placeholder="GSK" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div>
            <label class="block text-xs font-bold text-slate-400 mb-1">Dosage Form / Type *</label>
            <select id="itemType" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white">
              <option value="Tab">Tab (Tablet)</option>
              <option value="Cap">Cap (Capsule)</option>
              <option value="Syr">Syr (Syrup)</option>
              <option value="Inj">Inj (Injection)</option>
              <option value="Sachet">Sachet</option>
              <option value="Cream">Cream / Ointment</option>
              <option value="Drops">Drops</option>
              <option value="Surgical">Surgical</option>
            </select>
          </div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Strips Per Box *</label><input type="number" id="stripsPerBox" required min="1" value="10" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Units Per Strip *</label><input type="number" id="unitsPerStrip" required min="1" value="10" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div class="md:col-span-3 flex items-end"><button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition">Save Item Specification</button></div>
        </form>
      </div>

      <div class="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-950 text-xs text-slate-400 uppercase">
            <tr>
              <th class="p-4">Product Name</th>
              <th class="p-4">Company</th>
              <th class="p-4">Type</th>
              <th class="p-4">Pack Config</th>
              <th class="p-4">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${AppState.items.length === 0 ? '<tr><td colspan="5" class="p-4 text-center text-slate-500">No items opened yet.</td></tr>' :
              AppState.items.map(i => `
                <tr>
                  <td class="p-4 font-bold text-white">${i.name}</td>
                  <td class="p-4 font-bold text-emerald-400">${i.company}</td>
                  <td class="p-4 text-slate-300">${i.type}</td>
                  <td class="p-4 font-mono text-xs text-slate-400">${i.stripsPerBox} strips × ${i.unitsPerStrip} pcs (${i.totalUnitsPerBox} total pcs)</td>
                  <td class="p-4"><button onclick="deleteItemRecord('${i.id}')" class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1 rounded-xl text-xs font-bold">Delete</button></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleSaveItem(e) {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const company = document.getElementById('itemCompany').value.trim();
  const type = document.getElementById('itemType').value;
  const stripsPerBox = parseInt(document.getElementById('stripsPerBox').value) || 10;
  const unitsPerStrip = parseInt(document.getElementById('unitsPerStrip').value) || 10;
  const totalUnitsPerBox = stripsPerBox * unitsPerStrip;

  AppState.items.push({
    id: `ITM-${Date.now()}`,
    name, company, type, stripsPerBox, unitsPerStrip, totalUnitsPerBox,
    boxRetailPrice: 0, boxCostPrice: 0, unitRetailPrice: 0, unitCostPrice: 0, totalUnitsStock: 0, batchNo: '', expiryDate: ''
  });

  saveData();
  alert('Item specification saved successfully!');
  renderItemOpening();
}

function deleteItemRecord(id) {
  if (confirm('Delete item?')) {
    AppState.items = AppState.items.filter(i => i.id !== id);
    saveData();
    renderItemOpening();
  }
}

// ================= 3. STOCK PURCHASE WITH EXPIRY DATE =================
let activeStockItem = null;
function renderStockUpdate() {
  const container = document.getElementById('view-stockUpdate');
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white">2. Stock Inward & Expiry Management</h2>

      <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-4">
        <div class="relative">
          <label class="block text-xs font-bold uppercase text-slate-400 mb-1">Search Item Name or Company</label>
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-500 text-sm"></i>
            <input type="text" id="stockSearchInput" onkeyup="filterStockSearchResults(this.value)" placeholder="Type item name..." class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white" />
          </div>
          <div id="stockSearchResults" class="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl z-25 hidden max-h-48 overflow-y-auto divide-y divide-slate-800"></div>
        </div>

        <form onsubmit="handleStockInward(event)" class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2">
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Selected Product</label><input type="text" id="foundItemName" readonly placeholder="Select item above" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-bold text-emerald-400" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Batch Number *</label><input type="text" id="stockBatchNo" required value="BATCH-${Math.floor(100000 + Math.random() * 900000)}" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono font-bold text-amber-400" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Expiry Date *</label><input type="date" id="stockExpiryDate" required class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-bold text-amber-400" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Boxes Arrived *</label><input type="number" id="inwardBoxes" required min="1" value="10" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Box Cost Price (Rs.) *</label><input type="number" id="boxCostPrice" required min="0" step="0.01" placeholder="250" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Box Retail Price (Rs.) *</label><input type="number" id="boxRetailPrice" required min="0" step="0.01" placeholder="300" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div class="md:col-span-2 flex items-end"><button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition">Update Stock & Save Expiry</button></div>
        </form>
      </div>
    </div>
  `;
}

function filterStockSearchResults(query) {
  const box = document.getElementById('stockSearchResults');
  if (!query.trim()) { box.classList.add('hidden'); return; }
  const q = query.toLowerCase();
  const matches = AppState.items.filter(i => i.name.toLowerCase().includes(q) || i.company.toLowerCase().includes(q));

  box.innerHTML = matches.length === 0 ? `<div class="p-3 text-xs text-slate-500">No items found</div>` :
    matches.map(m => `<div onclick="selectItemForStock('${m.id}')" class="p-3 hover:bg-slate-800 cursor-pointer flex justify-between text-xs font-bold"><span>${m.name} (${m.company})</span><span class="text-emerald-400">${m.type}</span></div>`).join('');
  box.classList.remove('hidden');
}

function selectItemForStock(id) {
  const item = AppState.items.find(i => i.id === id);
  if (!item) return;
  activeStockItem = item;
  document.getElementById('foundItemName').value = `${item.name} [${item.company}]`;
  document.getElementById('stockSearchResults').classList.add('hidden');
  document.getElementById('stockSearchInput').value = item.name;
}

function handleStockInward(e) {
  e.preventDefault();
  if (!activeStockItem) { alert('Select item first!'); return; }

  const boxes = parseInt(document.getElementById('inwardBoxes').value) || 0;
  const boxCost = parseFloat(document.getElementById('boxCostPrice').value) || 0;
  const boxRetail = parseFloat(document.getElementById('boxRetailPrice').value) || 0;
  const batchNo = document.getElementById('stockBatchNo').value.trim();
  const expiryDate = document.getElementById('stockExpiryDate').value;

  const totalUnits = boxes * activeStockItem.totalUnitsPerBox;
  activeStockItem.batchNo = batchNo;
  activeStockItem.expiryDate = expiryDate;
  activeStockItem.boxCostPrice = boxCost;
  activeStockItem.boxRetailPrice = boxRetail;
  activeStockItem.unitCostPrice = activeStockItem.totalUnitsPerBox > 0 ? boxCost / activeStockItem.totalUnitsPerBox : boxCost;
  activeStockItem.unitRetailPrice = activeStockItem.totalUnitsPerBox > 0 ? boxRetail / activeStockItem.totalUnitsPerBox : boxRetail;
  activeStockItem.totalUnitsStock = (activeStockItem.totalUnitsStock || 0) + totalUnits;

  saveData();
  alert(`Stock Updated on Medora!\nExpiry Date set to ${expiryDate}.\nBatch: ${batchNo}`);
  renderStockUpdate();
}

// ================= 4. COMPANY BILL LEDGER =================
function renderCompanyPurchases() {
  const container = document.getElementById('view-companyPurchases');
  const totalInvestment = AppState.companyPurchases.reduce((a, b) => a + (b.amountPaid || 0), 0);

  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white">3. Company Bill Payments & Total Investment</h2>

      <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <form onsubmit="handleSaveCompanyBill(event)" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Date *</label><input type="date" id="billDate" required value="${new Date().toISOString().split('T')[0]}" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Company Name *</label><input type="text" id="billCompany" required placeholder="GSK Distributor" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Invoice Number *</label><input type="text" id="billInvoiceNo" required placeholder="INV-99281" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-white" /></div>
          <div><label class="block text-xs font-bold text-slate-400 mb-1">Amount Paid (Rs.) *</label><input type="number" id="billAmount" required min="0" step="0.01" placeholder="45000" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" /></div>
          <div class="md:col-span-4 flex items-end"><button type="submit" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl transition">Save Company Bill</button></div>
        </form>
      </div>

      <div class="bg-emerald-500/10 border border-emerald-500/20 p-5 rounded-2xl flex justify-between items-center text-emerald-300">
        <span class="font-extrabold uppercase text-xs">Total Store Investment:</span>
        <span class="font-black text-2xl text-emerald-400">Rs. ${totalInvestment.toFixed(2)}</span>
      </div>

      <div class="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-950 text-xs text-slate-400 uppercase">
            <tr>
              <th class="p-4">Date</th>
              <th class="p-4">Company</th>
              <th class="p-4">Invoice Number</th>
              <th class="p-4">Amount Paid</th>
              <th class="p-4">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            ${AppState.companyPurchases.length === 0 ? '<tr><td colspan="5" class="p-4 text-center text-slate-500">No company bills recorded.</td></tr>' :
              AppState.companyPurchases.map(p => `
                <tr>
                  <td class="p-4 text-slate-300">${p.date}</td>
                  <td class="p-4 font-bold text-white">${p.company}</td>
                  <td class="p-4 font-mono text-emerald-400">${p.invoiceNo}</td>
                  <td class="p-4 font-bold text-white">Rs. ${(p.amountPaid || 0).toFixed(2)}</td>
                  <td class="p-4"><button onclick="deleteCompanyBill('${p.id}')" class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1 rounded-xl text-xs font-bold">Delete</button></td>
                </tr>
              `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function handleSaveCompanyBill(e) {
  e.preventDefault();
  const date = document.getElementById('billDate').value;
  const company = document.getElementById('billCompany').value.trim();
  const invoiceNo = document.getElementById('billInvoiceNo').value.trim();
  const amountPaid = parseFloat(document.getElementById('billAmount').value) || 0;

  AppState.companyPurchases.push({ id: `CP-${Date.now()}`, date, company, invoiceNo, amountPaid });
  saveData();
  alert('Company bill recorded!');
  renderCompanyPurchases();
}

function deleteCompanyBill(id) {
  if (confirm('Delete bill?')) {
    AppState.companyPurchases = AppState.companyPurchases.filter(p => p.id !== id);
    saveData();
    renderCompanyPurchases();
  }
}

// ================= 5. POS BILLING & PERFECT-FIT RECEIPT =================
function renderBilling() {
  const container = document.getElementById('view-billing');
  const grossSubTotal = billingCart.reduce((a, b) => a + (b.price * b.qty), 0);
  const discountAmount = (grossSubTotal * (discountPercent / 100));
  const netGrandTotal = Math.max(0, grossSubTotal - discountAmount);

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div class="lg:col-span-7 space-y-4">
        <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3 relative">
          <label class="block text-xs font-bold uppercase text-slate-400">Search Product Name for Billing</label>
          <div class="relative">
            <i class="fa-solid fa-magnifying-glass absolute left-4 top-3.5 text-slate-500 text-sm"></i>
            <input type="text" id="posSearchInput" onkeyup="filterPOSSearchResults(this.value)" placeholder="Type item name to search..." autofocus class="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white" />
          </div>
          <div id="posSearchResults" class="absolute left-5 right-5 top-full mt-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-20 hidden max-h-56 overflow-y-auto divide-y divide-slate-800"></div>
        </div>

        <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 space-y-3">
          <h3 class="text-xs font-bold uppercase text-slate-400">Quick Store Products (Click to Add)</h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto p-1">
            ${AppState.items.map(i => `
              <div onclick="addBillingItemById('${i.id}')" class="bg-slate-950 hover:bg-slate-800/80 border border-slate-800 p-3 rounded-2xl cursor-pointer flex flex-col justify-between transition hover:border-emerald-500/30">
                <p class="font-bold text-xs text-white truncate">${i.type} ${i.name}</p>
                <div class="flex justify-between items-center text-[11px] pt-2">
                  <span class="font-extrabold text-emerald-400">Rs. ${(i.unitRetailPrice || 0).toFixed(2)}</span>
                  <span class="text-slate-400 text-[10px] bg-slate-800 px-2 py-0.5 rounded-lg font-mono">${i.totalUnitsStock || 0} pcs</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <div class="lg:col-span-5 bg-slate-900 p-5 rounded-3xl border border-slate-800 flex flex-col justify-between">
        <div>
          <div class="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 class="font-extrabold text-white text-base">POS Billing Cart</h3>
            <span class="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2.5 py-0.5 rounded-full">${billingCart.length} Items</span>
          </div>
          <div class="mt-3 overflow-y-auto max-h-60 divide-y divide-slate-800/60">
            ${billingCart.length === 0 ? '<p class="text-xs text-slate-500 text-center py-10">Cart is empty. Select products from left drawer.</p>' :
              billingCart.map((c, idx) => `
                <div class="py-3 flex justify-between items-center text-xs">
                  <div><p class="font-bold text-white">${c.displayName}</p><p class="text-[11px] text-slate-400 mt-0.5">Rs. ${c.price.toFixed(2)} × ${c.qty} pcs</p></div>
                  <div class="flex items-center gap-3"><span class="font-black text-emerald-400">Rs. ${(c.price * c.qty).toFixed(2)}</span><button onclick="removeFromCart(${idx})" class="text-rose-400 hover:text-rose-300"><i class="fa-solid fa-trash"></i></button></div>
                </div>
              `).join('')}
          </div>
        </div>

        <div class="border-t border-slate-800 pt-4 space-y-3">
          <div class="flex justify-between text-xs text-slate-400"><span>Sub Total:</span><span class="font-bold text-white">Rs. ${grossSubTotal.toFixed(2)}</span></div>
          <div class="flex justify-between items-center text-xs">
            <span class="font-bold text-slate-300">Discount Percentage (%):</span>
            <div class="w-24 relative">
              <input type="number" min="0" max="100" value="${discountPercent}" onchange="updateDiscountPercent(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-right font-bold text-emerald-400" />
              <span class="absolute left-2 top-1 text-slate-500">%</span>
            </div>
          </div>
          <div class="flex justify-between text-xs text-rose-400"><span>Discount Off Amount:</span><span class="font-bold">- Rs. ${discountAmount.toFixed(2)}</span></div>
          <div class="flex justify-between font-black text-lg border-t border-slate-800 pt-3"><span>NET PAY AMOUNT:</span><span class="text-emerald-400">Rs. ${netGrandTotal.toFixed(2)}</span></div>
          
          <div class="grid grid-cols-2 gap-2">
            <button onclick="completePOS(false)" class="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 rounded-xl text-xs transition">💾 Save Only</button>
            <button onclick="completePOS(true)" class="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition">🖨️ Save & Print Bill</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function updateDiscountPercent(val) {
  discountPercent = Math.max(0, Math.min(100, parseFloat(val) || 0));
  renderBilling();
}

function filterPOSSearchResults(query) {
  const box = document.getElementById('posSearchResults');
  if (!query.trim()) { box.classList.add('hidden'); return; }
  const q = query.toLowerCase();
  const matches = AppState.items.filter(i => i.name.toLowerCase().includes(q) || i.company.toLowerCase().includes(q));

  box.innerHTML = matches.map(m => `
    <div onclick="addBillingItemById('${m.id}')" class="p-3 hover:bg-slate-800 cursor-pointer flex justify-between text-xs">
      <span>${m.type} ${m.name} (${m.company})</span>
      <span class="font-bold text-emerald-400">Rs. ${(m.unitRetailPrice || 0).toFixed(2)}</span>
    </div>
  `).join('');
  box.classList.remove('hidden');
}

function addBillingItemById(id) {
  const item = AppState.items.find(i => i.id === id);
  if (!item) return;

  const existing = billingCart.find(c => c.id === item.id);
  if (existing) {
    existing.qty += 1;
  } else {
    billingCart.push({
      id: item.id,
      displayName: `${item.type} ${item.name}`,
      price: item.unitRetailPrice || 0,
      costPrice: item.unitCostPrice || 0,
      qty: 1
    });
  }

  const box = document.getElementById('posSearchResults');
  if (box) box.classList.add('hidden');
  const input = document.getElementById('posSearchInput');
  if (input) input.value = '';

  renderBilling();
}

function removeFromCart(idx) {
  billingCart.splice(idx, 1);
  renderBilling();
}

function completePOS(shouldPrint) {
  if (billingCart.length === 0) { alert('Cart is empty!'); return; }

  const grossSubTotal = billingCart.reduce((a, b) => a + (b.price * b.qty), 0);
  const totalCost = billingCart.reduce((a, b) => a + (b.costPrice * b.qty), 0);
  const discountAmount = (grossSubTotal * (discountPercent / 100));
  const netTotal = Math.max(0, grossSubTotal - discountAmount);

  const now = new Date();
  const sale = {
    id: `INV-${Date.now().toString().slice(-6)}`,
    date: now.toLocaleDateString(),
    time: now.toLocaleTimeString(),
    isoDate: now.toISOString().split('T')[0],
    timestamp: now.getTime(),
    items: [...billingCart],
    subTotal: grossSubTotal,
    discountPercent,
    discountAmount,
    netTotal,
    totalCost
  };

  AppState.sales.push(sale);
  
  billingCart.forEach(c => {
    const item = AppState.items.find(i => i.id === c.id);
    if (item) item.totalUnitsStock = Math.max(0, (item.totalUnitsStock || 0) - c.qty);
  });

  saveData();

  if (shouldPrint) {
    printThermalReceipt(sale);
  } else {
    alert(`Bill ${sale.id} saved successfully!`);
  }

  billingCart = [];
  discountPercent = 0;
  renderBilling();
}

// REDESIGNED THERMAL RECEIPT WITH MEDORA BRANDING
function printThermalReceipt(sale) {
  const pName = AppState.currentPharmacy ? AppState.currentPharmacy.pharmacyName : 'Medora Pharmacy';
  const pPhone = AppState.currentPharmacy ? AppState.currentPharmacy.pharmacyPhone : '03327809739';
  const pLoc = AppState.currentPharmacy ? AppState.currentPharmacy.location : 'Jhuddo, Sindh';

  const win = window.open('', '_blank', 'width=350,height=600');
  win.document.write(`
    <html>
      <head>
        <title>Medora Invoice ${sale.id}</title>
        <style>
          @page { size: auto; margin: 0; }
          body { font-family: 'Courier New', monospace; width: 270px; padding: 12px; font-size: 11px; margin: 0 auto; color: #000; line-height: 1.4; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .line { border-bottom: 1px dashed #000; margin: 10px 0; }
          .flex { display: flex; justify-content: space-between; margin-bottom: 3px; }
          .item-row { margin-bottom: 6px; }
          .net-pay-box { font-size: 13px; font-weight: bold; margin-top: 8px; padding: 4px 0; }
        </style>
      </head>
      <body>
        <div class="center bold" style="font-size:16px; text-transform:uppercase;">${pName}</div>
        <div class="center" style="font-size:9px; margin-bottom:2px;">Medora - Smarter Pharmacy. Better Business</div>
        <div class="center">${pLoc}</div>
        <div class="center">Ph: ${pPhone}</div>
        <div class="line"></div>
        <div class="flex"><span>Invoice #: <span class="bold">${sale.id}</span></span><span>${sale.date}</span></div>
        <div class="flex"><span>Time: ${sale.time}</span></div>
        <div class="line"></div>
        
        <div style="margin-bottom: 8px;">
          ${sale.items.map(i => `
            <div class="item-row">
              <div class="bold">${i.displayName}</div>
              <div class="flex" style="padding-left: 8px;">
                <span>${i.qty} x Rs.${i.price.toFixed(2)}</span>
                <span class="bold">Rs. ${(i.price * i.qty).toFixed(2)}</span>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="line"></div>
        <div class="flex"><span>Sub Total:</span><span>Rs. ${sale.subTotal.toFixed(2)}</span></div>
        <div class="flex"><span>Discount (${sale.discountPercent}%):</span><span>- Rs. ${sale.discountAmount.toFixed(2)}</span></div>
        
        <div class="line"></div>
        <div class="flex bold net-pay-box">
          <span>NET PAY:</span>
          <span>Rs. ${sale.netTotal.toFixed(2)}</span>
        </div>
        <div class="line"></div>

        <div class="center bold" style="margin-top: 10px;">THANK YOU FOR YOUR VISIT!</div>
        <div class="center" style="font-size:9px; margin-top:4px;">
          Get well soon! Powered by Medora ERP.
        </div>
      </body>
    </html>
  `);
  win.document.close();
  setTimeout(() => { win.print(); win.close(); }, 250);
}

// ================= 6. SALES HISTORY =================
function renderSalesHistory() {
  const container = document.getElementById('view-salesHistory');
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white">Sales History & Invoice Ledger</h2>

      <div class="bg-slate-900 p-5 rounded-3xl border border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Search by Invoice Number</label>
          <input type="text" id="historyInvoiceSearch" onkeyup="filterSalesHistoryTable()" placeholder="e.g. INV-10293" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm font-mono text-white" />
        </div>
        <div>
          <label class="block text-xs font-bold text-slate-400 mb-1">Filter by Specific Date</label>
          <input type="date" id="historyDateSearch" onchange="filterSalesHistoryTable()" class="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-sm text-white" />
        </div>
      </div>

      <div class="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <table class="w-full text-left text-sm">
          <thead class="bg-slate-950 text-xs text-slate-400 uppercase">
            <tr>
              <th class="p-4">Invoice ID</th>
              <th class="p-4">Date & Time</th>
              <th class="p-4">Items Sold</th>
              <th class="p-4">Net Total</th>
              <th class="p-4">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800" id="salesHistoryTbody">
            ${renderSalesRows(AppState.sales)}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderSalesRows(salesList) {
  if (salesList.length === 0) return '<tr><td colspan="5" class="p-4 text-center text-slate-500">No sales history found.</td></tr>';
  return salesList.map(s => `
    <tr>
      <td class="p-4 font-mono font-bold text-emerald-400">${s.id}</td>
      <td class="p-4 text-xs text-slate-300"><span class="font-bold">${s.date}</span> <span class="text-slate-500">${s.time || ''}</span></td>
      <td class="p-4 text-xs text-slate-300">${(s.items || []).map(i => `${i.displayName} (${i.qty}x)`).join(', ')}</td>
      <td class="p-4 font-bold text-emerald-400">Rs. ${(s.netTotal || 0).toFixed(2)}</td>
      <td class="p-4 flex items-center gap-2">
        <button onclick='printThermalReceipt(${JSON.stringify(s)})' class="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold px-3 py-1.5 rounded-xl text-xs"><i class="fa-solid fa-print"></i></button>
        <button onclick="deleteSalesRecord('${s.id}')" class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1.5 rounded-xl text-xs font-bold"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>
  `).join('');
}

function filterSalesHistoryTable() {
  const invQuery = (document.getElementById('historyInvoiceSearch').value || '').toLowerCase().trim();
  const dateQuery = document.getElementById('historyDateSearch').value;

  const filtered = AppState.sales.filter(s => {
    const matchInv = !invQuery || s.id.toLowerCase().includes(invQuery);
    const matchDate = !dateQuery || s.isoDate === dateQuery;
    return matchInv && matchDate;
  });

  document.getElementById('salesHistoryTbody').innerHTML = renderSalesRows(filtered);
}

function deleteSalesRecord(id) {
  if (confirm('Delete invoice record?')) {
    AppState.sales = AppState.sales.filter(s => s.id !== id);
    saveData();
    renderSalesHistory();
  }
}

// ================= 7. LOW STOCK WHATSAPP ORDERS =================
function renderLowStockOrders() {
  const container = document.getElementById('view-lowStockOrders');
  const lowItems = AppState.items.filter(i => (i.totalUnitsStock || 0) < 50);

  const grouped = {};
  lowItems.forEach(i => {
    if (!grouped[i.company]) grouped[i.company] = [];
    grouped[i.company].push(i);
  });

  let html = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-white">Company-Wise Low Stock WhatsApp Orders</h2>
  `;

  if (Object.keys(grouped).length === 0) {
    html += `<div class="bg-slate-900 p-8 rounded-3xl border border-slate-800 text-center text-slate-500">All inventory stock levels are healthy!</div>`;
  } else {
    for (const [company, items] of Object.entries(grouped)) {
      const msg = encodeURIComponent(`Hello ${company} Distributor,\nWe need an urgent stock refill for:\n` + items.map(i => `- ${i.type} ${i.name} (${i.totalUnitsStock} pcs left)`).join('\n'));
      
      html += `
        <div class="bg-slate-900 p-6 rounded-3xl border border-slate-800 space-y-3">
          <div class="flex justify-between items-center border-b border-slate-800 pb-3">
            <h3 class="font-extrabold text-white text-lg"><i class="fa-solid fa-building mr-2 text-emerald-400"></i> ${company}</h3>
            <a href="https://wa.me/?text=${msg}" target="_blank" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center gap-2 transition">
              <i class="fa-brands fa-whatsapp text-sm"></i> Send WhatsApp Order
            </a>
          </div>
          <div class="divide-y divide-slate-800 text-xs">
            ${items.map(i => `
              <div class="py-2.5 flex justify-between">
                <span class="font-bold text-slate-200">${i.type} ${i.name}</span>
                <span class="text-rose-400 font-bold">Only ${i.totalUnitsStock} pcs left</span>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  html += `</div>`;
  container.innerHTML = html;
}

// ================= SUPER ADMIN COMMAND CENTER =================
function renderSuperAdmin() {
  const container = document.getElementById('adminMainContainer');
  const pharmacies = AppState.pharmacies;
  const payments = AppState.payments;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-amber-400">Medora Super Admin Center</h2>
        <span class="text-xs bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full border border-amber-500/30">Total Pharmacies: ${pharmacies.length}</span>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 class="font-extrabold text-sm text-slate-300 uppercase tracking-wider"><i class="fa-solid fa-receipt mr-2 text-amber-400"></i> Subscription Payments Verification Ledger</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 uppercase">
              <tr>
                <th class="p-3">Pharmacy</th>
                <th class="p-3">TRX ID</th>
                <th class="p-3">Amount</th>
                <th class="p-3">Receipt</th>
                <th class="p-3">Status</th>
                <th class="p-3">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${payments.length === 0 ? '<tr><td colspan="6" class="p-4 text-center text-slate-500">No payment submissions.</td></tr>' :
                payments.map(p => `
                  <tr>
                    <td class="p-3 font-bold text-white">${p.pharmacyName}</td>
                    <td class="p-3 font-mono text-amber-400">${p.trxId}</td>
                    <td class="p-3 text-slate-300">${p.method} (Rs. ${p.amount})</td>
                    <td class="p-3"><a href="${p.receiptImg}" target="_blank" class="text-emerald-400 underline font-bold">View Image</a></td>
                    <td class="p-3"><span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'Cleared' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}">${p.status}</span></td>
                    <td class="p-3 flex gap-2">
                      <button onclick="adminClearPayment('${p.id}')" class="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-3 py-1 rounded-xl font-extrabold">Clear</button>
                      <button onclick="adminRejectPayment('${p.id}')" class="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 px-3 py-1 rounded-xl font-bold">Reject</button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <h3 class="font-extrabold text-sm text-slate-300 uppercase tracking-wider"><i class="fa-solid fa-hospital mr-2 text-emerald-400"></i> Registered Pharmacies Control</h3>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead class="bg-slate-950 text-slate-400 uppercase">
              <tr>
                <th class="p-3">Pharmacy & Owner</th>
                <th class="p-3">Phone</th>
                <th class="p-3">Credentials</th>
                <th class="p-3">Status</th>
                <th class="p-3">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${pharmacies.length === 0 ? '<tr><td colspan="5" class="p-4 text-center text-slate-500">No pharmacies registered yet.</td></tr>' :
                pharmacies.map(ph => `
                  <tr>
                    <td class="p-3 font-bold text-white">${ph.pharmacyName} <span class="block text-[10px] text-slate-400">${ph.ownerName}</span></td>
                    <td class="p-3 font-mono text-slate-300">${ph.ownerPhone}</td>
                    <td class="p-3 font-mono text-amber-400">••••••••</td>
                    <td class="p-3">
                      <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${ph.isDeactivated ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'}">
                        ${ph.isDeactivated ? 'Frozen' : 'Active'}
                      </span>
                    </td>
                    <td class="p-3 flex flex-wrap gap-1.5">
                      <button onclick="adminChangePassword('${ph.id}')" class="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded-xl font-bold">Password</button>
                      <button onclick="adminToggleFeeWaiver('${ph.id}')" class="bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2.5 py-1 rounded-xl font-bold">Waiver</button>
                      <button onclick="adminToggleFreeze('${ph.id}')" class="${ph.isDeactivated ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-rose-500/20 text-rose-400 font-bold'} px-2.5 py-1 rounded-xl">${ph.isDeactivated ? 'Unfreeze' : 'Freeze'}</button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

function adminClearPayment(payId) {
  const p = AppState.payments.find(x => x.id === payId);
  if (p) {
    p.status = 'Cleared';
    const ph = AppState.pharmacies.find(x => x.id === p.pharmacyId);
    if (ph) {
      ph.paymentStatus = 'Cleared';
      const nextM = new Date();
      nextM.setMonth(nextM.getMonth() + 1);
      ph.subscriptionPaidUntil = nextM.toISOString();
      ph.isDeactivated = false;
    }
    saveData();
    renderSuperAdmin();
    alert('Payment cleared!');
  }
}

function adminRejectPayment(payId) {
  const p = AppState.payments.find(x => x.id === payId);
  if (p) {
    p.status = 'Rejected / Invalid';
    saveData();
    renderSuperAdmin();
    alert('Payment marked as invalid.');
  }
}

function adminChangePassword(phId) {
  const ph = AppState.pharmacies.find(x => x.id === phId);
  if (!ph) return;
  const newPass = prompt(`Enter new password for ${ph.pharmacyName}:`);
  if (newPass && newPass.trim()) {
    ph.password = newPass.trim();
    saveData();
    alert('Password updated.');
    renderSuperAdmin();
  }
}

function adminToggleFeeWaiver(phId) {
  const ph = AppState.pharmacies.find(x => x.id === phId);
  if (!ph) return;
  ph.feeWaived = !ph.feeWaived;
  saveData();
  renderSuperAdmin();
  alert('Fee waiver toggled.');
}

function adminToggleFreeze(phId) {
  const ph = AppState.pharmacies.find(x => x.id === phId);
  if (!ph) return;
  ph.isDeactivated = !ph.isDeactivated;
  saveData();
  renderSuperAdmin();
  alert('Account freeze status toggled.');
}