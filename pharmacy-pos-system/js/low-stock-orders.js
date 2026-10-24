function renderLowStockOrdersView() {
  const container = document.getElementById('view-lowStockOrders');
  if (!container) return;

  // Filter items where stock is low (e.g., less than 50 units remaining)
  const threshold = 50;
  const lowStockItems = AppState.items.filter(i => (i.totalUnitsStock || 0) < threshold);

  // Group low stock items by Company Name
  const groupedByCompany = {};
  lowStockItems.forEach(item => {
    const comp = (item.company || 'Unknown Company').trim();
    if (!groupedByCompany[comp]) {
      groupedByCompany[comp] = [];
    }
    groupedByCompany[comp].push(item);
  });

  const companiesList = Object.keys(groupedByCompany);

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Auto Low Stock Orders</h2>
          <p class="text-xs text-slate-500">Automatically groups low stock items (&lt; ${threshold} units) by company to generate restock orders.</p>
        </div>
      </div>

      ${companiesList.length === 0 ? `
        <div class="bg-white p-12 rounded-2xl shadow-sm border border-slate-200 text-center space-y-3">
          <div class="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
            <i class="fa-solid fa-check"></i>
          </div>
          <h3 class="text-lg font-bold text-slate-800">All Stocks Are Healthy!</h3>
          <p class="text-xs text-slate-500">No items are currently below the ${threshold} units threshold. No orders needed right now.</p>
        </div>
      ` : `
        <div class="space-y-6">
          ${companiesList.map(comp => {
            const items = groupedByCompany[comp];
            return `
              <div class="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div class="p-4 border-b bg-emerald-50 flex justify-between items-center">
                  <div>
                    <h3 class="font-extrabold text-emerald-900 text-base"><i class="fa-solid fa-industry mr-2"></i> Company: ${comp}</h3>
                    <p class="text-xs text-emerald-700">${items.length} item(s) running low in stock</p>
                  </div>
                  <button onclick="generateCompanyOrderWhatsApp('${comp}')" class="bg-emerald-600 text-white text-xs px-3 py-2 rounded-xl font-bold hover:bg-emerald-700 shadow">
                    <i class="fa-brands fa-whatsapp mr-1 text-sm"></i> Send Order via WhatsApp
                  </button>
                </div>

                <div class="overflow-x-auto">
                  <table class="w-full text-left text-sm text-slate-600">
                    <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
                      <tr>
                        <th class="p-3">Medicine Name</th>
                        <th class="p-3">Type</th>
                        <th class="p-3">Available Stock</th>
                        <th class="p-3">Box Price</th>
                        <th class="p-3 text-right">Recommended Reorder</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100">
                      ${items.map(item => `
                        <tr>
                          <td class="p-3 font-bold text-slate-800">${item.name}</td>
                          <td class="p-3"><span class="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">${item.type}</span></td>
                          <td class="p-3 font-extrabold text-rose-600">${item.totalUnitsStock} Units</td>
                          <td class="p-3 font-semibold text-slate-800">Rs. ${item.boxPrice}</td>
                          <td class="p-3 text-right font-bold text-emerald-600">10 Boxes</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

function generateCompanyOrderWhatsApp(companyName) {
  const threshold = 50;
  const items = AppState.items.filter(i => (i.company || '').trim().toLowerCase() === companyName.trim().toLowerCase() && (i.totalUnitsStock || 0) < threshold);

  if (items.length === 0) {
    alert('No items found for this company.');
    return;
  }

  let msg = `*Low Stock Purchase Order* %0A`;
  msg += `Pharmacy: *${AppState.currentPharmacy.pharmacyName}* %0A`;
  msg += `Company: *${companyName}* %0A%0A`;
  msg += `Kindly deliver the following low stock items: %0A`;

  items.forEach((item, idx) => {
    msg += `${idx + 1}. *${item.name}* (${item.type}) - Current Stock: ${item.totalUnitsStock} Units (Req: 10 Boxes)%0A`;
  });

  msg += `%0AThank you!`;

  const whatsappUrl = `https://wa.me/?text=${msg}`;
  window.open(whatsappUrl, '_blank');
}