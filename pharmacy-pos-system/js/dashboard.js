function renderDashboardView() {
  const container = document.getElementById('view-dashboard');
  if (AppState.currentPharmacy.isAdmin) {
    renderSuperAdminCommandCenter();
  } else {
    renderPharmacyDashboard(container);
  }
}

function renderPharmacyDashboard(container) {
  const totalItems = AppState.items.length;
  const totalStockVal = AppState.items.reduce((acc, item) => acc + (item.totalUnitsStock * (item.unitPrice || 0)), 0);
  const lowStock = AppState.items.filter(i => i.totalUnitsStock < 50).length;
  const totalRevenue = AppState.sales.reduce((acc, sale) => acc + sale.grandTotal, 0);
  
  const totalBillsPaid = AppState.purchases.reduce((acc, p) => acc + Number(p.amount), 0);
  const netProfit = totalRevenue - totalBillsPaid;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold text-slate-800">Pharmacy Dashboard & Analytics</h2>
        <button onclick="openPaymentSubmissionModal()" class="bg-emerald-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-emerald-700">
          <i class="fa-solid fa-receipt mr-1"></i> Pay Monthly Fee (Rs.3000)
        </button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">Total Sales Revenue</p>
          <p class="text-2xl font-extrabold text-blue-600 mt-1">Rs. ${totalRevenue.toFixed(2)}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">Total Bills Paid</p>
          <p class="text-2xl font-extrabold text-rose-500 mt-1">Rs. ${totalBillsPaid.toFixed(2)}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">Net Profit / Margin</p>
          <p class="text-2xl font-extrabold ${netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'} mt-1">Rs. ${netProfit.toFixed(2)}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">Available Inventory Value</p>
          <p class="text-2xl font-extrabold text-teal-600 mt-1">Rs. ${totalStockVal.toFixed(2)}</p>
        </div>
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <p class="text-xs font-bold text-slate-400 uppercase">Low Stock Alerts</p>
          <p class="text-2xl font-extrabold text-amber-500 mt-1">${lowStock}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-bold text-slate-800 mb-4">Recent Sales Invoices</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th class="p-3">Invoice</th>
                  <th class="p-3">Date</th>
                  <th class="p-3">Grand Total</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${AppState.sales.length === 0 ? '<tr><td colspan="3" class="p-4 text-center text-slate-400">No sales recorded yet.</td></tr>' : 
                  AppState.sales.slice(-5).reverse().map(s => `
                    <tr>
                      <td class="p-3 font-semibold text-emerald-600">${s.id}</td>
                      <td class="p-3">${s.date}</td>
                      <td class="p-3 font-bold text-slate-800">Rs. ${s.grandTotal.toFixed(2)}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
          <h3 class="font-bold text-slate-800 mb-4">Recent Bill Payments to Companies</h3>
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm text-slate-600">
              <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th class="p-3">Date</th>
                  <th class="p-3">Company Name</th>
                  <th class="p-3">Amount Paid</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                ${AppState.purchases.length === 0 ? '<tr><td colspan="3" class="p-4 text-center text-slate-400">No bill payments recorded yet.</td></tr>' : 
                  AppState.purchases.slice(-5).reverse().map(p => `
                    <tr>
                      <td class="p-3">${p.date}</td>
                      <td class="p-3 font-bold text-slate-800">${p.companyName}</td>
                      <td class="p-3 font-semibold text-rose-600">Rs. ${Number(p.amount).toFixed(2)}</td>
                    </tr>
                  `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

// SUPER ADMIN COMMAND CENTER
function renderSuperAdminCommandCenter() {
  const container = document.getElementById('adminMainContainer');
  if (!container) return;

  const activePharmacies = AppState.pharmacies.filter(p => !p.isAdmin && p.isApproved);
  const pendingPayments = AppState.payments;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 uppercase">Total Pharmacies</p>
          <p class="text-3xl font-extrabold text-white mt-1">${AppState.pharmacies.filter(p => !p.isAdmin).length}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 uppercase">Active Accounts</p>
          <p class="text-3xl font-extrabold text-emerald-400 mt-1">${activePharmacies.length}</p>
        </div>
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl">
          <p class="text-xs font-bold text-slate-400 uppercase">Pending Fee Verification</p>
          <p class="text-3xl font-extrabold text-cyan-400 mt-1">${pendingPayments.length}</p>
        </div>
      </div>

      <!-- PAYMENT SUBMISSIONS -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div class="p-4 border-b border-slate-800 font-bold text-white bg-slate-900/80 flex justify-between items-center">
          <span><i class="fa-solid fa-money-bill-transfer mr-2 text-emerald-400"></i> EasyPaisa / JazzCash Payment Submissions (${pendingPayments.length})</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th class="p-3">Pharmacy</th>
                <th class="p-3">TRX ID & Method</th>
                <th class="p-3">Amount & Date</th>
                <th class="p-3">Receipt Screenshot</th>
                <th class="p-3">Status</th>
                <th class="p-3 text-right">Approval Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${pendingPayments.length === 0 ? '<tr><td colspan="6" class="p-4 text-center text-slate-500">No payment transaction submissions found.</td></tr>' : 
                pendingPayments.map(pay => `
                  <tr>
                    <td class="p-3 font-bold text-white">${pay.pharmacyName}</td>
                    <td class="p-3 font-mono text-xs">
                      <p class="font-bold text-emerald-400">${pay.trxId}</p>
                      <p class="text-slate-400">${pay.method}</p>
                    </td>
                    <td class="p-3 text-xs">
                      <p class="font-bold text-white">Rs. ${pay.amount}</p>
                      <p class="text-slate-400">${pay.date}</p>
                    </td>
                    <td class="p-3">
                      ${pay.receiptImg ? `<img src="${pay.receiptImg}" onclick="window.open('${pay.receiptImg}')" class="h-10 w-16 rounded object-cover border border-slate-700 cursor-pointer hover:opacity-80" />` : 'No Image'}
                    </td>
                    <td class="p-3"><span class="text-xs bg-amber-500/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-500/30">${pay.status}</span></td>
                    <td class="p-3 text-right space-x-1">
                      <button onclick="approvePayment('${pay.id}', '${pay.pharmacyId}')" class="bg-emerald-500 text-slate-950 text-xs px-2.5 py-1 rounded-lg font-extrabold hover:bg-emerald-400">Approve</button>
                      <button onclick="rejectPayment('${pay.id}')" class="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold hover:bg-rose-700">Reject</button>
                    </td>
                  </tr>
                `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- ACTIVE PHARMACIES -->
      <div class="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
        <div class="p-4 border-b border-slate-800 font-bold text-white flex justify-between items-center">
          <span>Active Pharmacy Accounts (${activePharmacies.length})</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-300">
            <thead class="bg-slate-950 text-slate-400 uppercase text-xs">
              <tr>
                <th class="p-3">Pharmacy & Owner</th>
                <th class="p-3">Phone</th>
                <th class="p-3">Subscription Active Until</th>
                <th class="p-3 text-right">Master Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800">
              ${activePharmacies.length === 0 ? '<tr><td colspan="4" class="p-4 text-center text-slate-500">No active verified pharmacies found.</td></tr>' : 
                activePharmacies.map(p => `
                  <tr>
                    <td class="p-3">
                      <p class="font-bold text-white">${p.pharmacyName}</p>
                      <p class="text-xs text-slate-400">Owner: ${p.ownerName}</p>
                    </td>
                    <td class="p-3 text-xs font-mono text-slate-300">${p.ownerPhone}</td>
                    <td class="p-3 text-xs font-bold text-emerald-400">
                      ${p.subscriptionPaidUntil ? new Date(p.subscriptionPaidUntil).toLocaleDateString() : 'Fee Pending'}
                    </td>
                    <td class="p-3 text-right space-x-1">
                      <button onclick="waivePharmacyFee('${p.id}')" class="bg-cyan-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold hover:bg-cyan-500">
                        <i class="fa-solid fa-gift mr-1"></i> Waive Fee
                      </button>
                      <button onclick="promptChangePassword('${p.id}')" class="bg-slate-800 text-slate-200 border border-slate-700 text-xs px-2.5 py-1 rounded-lg font-bold hover:bg-slate-700">
                        Change Password
                      </button>
                      <button onclick="deletePharmacy('${p.id}')" class="bg-rose-600 text-white text-xs px-2.5 py-1 rounded-lg font-bold hover:bg-rose-700">
                        Delete
                      </button>
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

function waivePharmacyFee(pharmacyId) {
  const pharmacy = AppState.pharmacies.find(p => p.id === pharmacyId);
  if (pharmacy) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    pharmacy.subscriptionPaidUntil = nextMonth.toISOString();
    savePharmacies();
    alert(`Fees Maaf Kar Di Gayi Hai! ${pharmacy.pharmacyName} unlocked until ${nextMonth.toLocaleDateString()}.`);
    renderSuperAdminCommandCenter();
  }
}

function approvePayment(payId, pharmacyId) {
  const pharmacy = AppState.pharmacies.find(p => p.id === pharmacyId);
  const pay = AppState.payments.find(p => p.id === payId);

  if (pharmacy && pay) {
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    pharmacy.subscriptionPaidUntil = nextMonth.toISOString();
    pay.status = 'Approved';

    savePharmacies();
    alert(`Payment Approved! ${pharmacy.pharmacyName} extended until ${nextMonth.toLocaleDateString()}.`);
    renderSuperAdminCommandCenter();
  }
}

function rejectPayment(payId) {
  AppState.payments = AppState.payments.filter(p => p.id !== payId);
  savePharmacies();
  alert('Payment rejected.');
  renderSuperAdminCommandCenter();
}

function promptChangePassword(pharmacyId) {
  const target = AppState.pharmacies.find(p => p.id === pharmacyId);
  if (!target) return;

  const newPass = prompt(`Enter new password for ${target.pharmacyName}:`);
  if (newPass && newPass.trim() !== '') {
    target.password = newPass.trim();
    savePharmacies();
    alert(`Password updated!`);
  }
}

function deletePharmacy(pharmacyId) {
  if (confirm('Permanently delete this pharmacy account?')) {
    AppState.pharmacies = AppState.pharmacies.filter(p => p.id !== pharmacyId);
    savePharmacies();
    renderSuperAdminCommandCenter();
  }
}

function handleAdminCreatePharmacySubmit(e) {
  e.preventDefault();

  const ownerName = document.getElementById('admRegOwnerName').value;
  const pharmacyName = document.getElementById('admRegPharmacyName').value;
  const ownerPhone = document.getElementById('admRegOwnerPhone').value;
  const pharmacyPhone = document.getElementById('admRegPharmacyPhone').value;
  const location = document.getElementById('admRegLocation').value;
  const password = document.getElementById('admRegPassword').value;

  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  const newPharmacy = {
    id: `PHARM-${Date.now().toString().slice(-5)}`,
    ownerName,
    pharmacyName,
    ownerPhone,
    pharmacyPhone,
    location,
    password,
    isAdmin: false,
    isApproved: true,
    subscriptionPaidUntil: nextMonth.toISOString(),
    items: [],
    sales: [],
    purchases: []
  };

  AppState.pharmacies.push(newPharmacy);
  savePharmacies();

  alert(`Account Created & Auto-Approved! Phone: ${ownerPhone}, Password: ${password}`);
  closeAdminCreatePharmacyModal();
  renderSuperAdminCommandCenter();
}