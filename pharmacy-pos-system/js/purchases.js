function renderPurchasesView() {
  const container = document.getElementById('view-purchases');
  if (!container) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  let todayTotal = 0;
  let monthTotal = 0;
  let yearTotal = 0;
  let grandTotal = 0;

  if (AppState.purchases && AppState.purchases.length > 0) {
    AppState.purchases.forEach(p => {
      const amt = Number(p.amount) || 0;
      grandTotal += amt;

      const pDate = new Date(p.date);
      const pDateStr = p.date;

      if (pDateStr === todayStr) {
        todayTotal += amt;
      }
      if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
        monthTotal += amt;
      }
      if (pDate.getFullYear() === currentYear) {
        yearTotal += amt;
      }
    });
  }

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Company Bill Payments & Purchases</h2>
          <p class="text-xs text-slate-500">Record payments made to pharmaceutical companies for stock purchases.</p>
        </div>
      </div>

      <!-- ANALYTICS CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">Today's Bills Paid</p>
          <p class="text-2xl font-extrabold text-emerald-600 mt-1">Rs. ${todayTotal.toFixed(2)}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">This Month's Bills Paid</p>
          <p class="text-2xl font-extrabold text-blue-600 mt-1">Rs. ${monthTotal.toFixed(2)}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">This Year's Bills Paid</p>
          <p class="text-2xl font-extrabold text-purple-600 mt-1">Rs. ${yearTotal.toFixed(2)}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">Total All-Time Bills Paid</p>
          <p class="text-2xl font-extrabold text-rose-600 mt-1">Rs. ${grandTotal.toFixed(2)}</p>
        </div>
      </div>

      <!-- ADD BILL PAYMENT FORM -->
      <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 class="font-bold text-sm text-slate-800 mb-3"><i class="fa-solid fa-plus-circle text-emerald-600 mr-1"></i> Record New Company Bill Payment</h3>
        <form id="addPurchaseBillForm" onsubmit="handleSavePurchaseBill(event)" class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Payment Date *</label>
            <input type="date" id="billDate" required value="${todayStr}" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Company / Supplier Name *</label>
            <input type="text" id="billCompanyName" required placeholder="e.g. Getz Pharma / Searle" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Bill Pay Amount (Rs.) *</label>
            <input type="number" id="billAmount" required min="0" step="0.01" placeholder="15000" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div class="flex items-end">
            <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-2.5 rounded-lg hover:bg-emerald-700 transition shadow">
              <i class="fa-solid fa-floppy-disk mr-1"></i> Save Bill Payment
            </button>
          </div>
        </form>
      </div>

      <!-- BILL PAYMENTS HISTORY TABLE -->
      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 border-b font-bold text-slate-800 flex justify-between items-center bg-slate-50">
          <span>Bill Payments History (${AppState.purchases ? AppState.purchases.length : 0})</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-100 text-slate-500 uppercase text-xs">
              <tr>
                <th class="p-3">Payment ID</th>
                <th class="p-3">Date</th>
                <th class="p-3">Company Name</th>
                <th class="p-3">Amount Paid</th>
                <th class="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${(!AppState.purchases || AppState.purchases.length === 0) ? 
                '<tr><td colspan="5" class="p-4 text-center text-slate-400">No bill payments recorded yet. Add one above.</td></tr>' : 
                AppState.purchases.slice().reverse().map((p) => `
                  <tr>
                    <td class="p-3 font-semibold text-slate-400">${p.id}</td>
                    <td class="p-3 font-medium text-slate-700">${p.date}</td>
                    <td class="p-3 font-bold text-slate-800">${p.companyName}</td>
                    <td class="p-3 font-bold text-emerald-600">Rs. ${Number(p.amount).toFixed(2)}</td>
                    <td class="p-3 text-right">
                      <button onclick="deletePurchaseBill('${p.id}')" class="bg-rose-600 text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-rose-700"><i class="fa-solid fa-trash mr-1"></i> Delete</button>
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

function handleSavePurchaseBill(e) {
  e.preventDefault();
  const date = document.getElementById('billDate').value;
  const companyName = document.getElementById('billCompanyName').value.trim();
  const amount = parseFloat(document.getElementById('billAmount').value) || 0;

  if (!companyName || amount <= 0) {
    alert('Please enter valid company name and amount!');
    return;
  }

  const newBill = {
    id: `BILL-${Date.now().toString().slice(-6)}`,
    date,
    companyName,
    amount
  };

  if (!AppState.purchases) AppState.purchases = [];
  AppState.purchases.push(newBill);
  
  savePharmacies();
  renderPurchasesView();
  alert('Bill payment successfully recorded!');
}

function deletePurchaseBill(billId) {
  if (confirm('Are you sure you want to delete this bill payment record?')) {
    AppState.purchases = AppState.purchases.filter(p => p.id !== billId);
    savePharmacies();
    renderPurchasesView();
  }
}