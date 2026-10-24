function renderStockUpdateView() {
  const container = document.getElementById('view-stockUpdate');
  container.innerHTML = `
    <div class="space-y-6">
      <h2 class="text-2xl font-bold text-slate-800">Stock Update & Replenishment</h2>

      <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <form onsubmit="handleStockUpdate(event)" class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Select Medicine *</label>
            <select id="stockItemSelect" onchange="populateStockItemDetails()" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="">-- Choose Item --</option>
              ${AppState.items.map(i => `<option value="${i.id}">${i.name} (${i.type}) - Current Stock:${i.totalUnitsStock} Units</option>`).join('')}
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Add Boxes Stock *</label>
            <input type="number" id="addBoxes" min="1" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="10" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Batch Number *</label>
            <input type="text" id="stockBatchNo" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="BAT-2026-001" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Expiry Date *</label>
            <input type="date" id="stockExpiry" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Purchase Cost Per Box (Rs.) *</label>
            <input type="number" id="stockPurchaseCost" required min="0" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="200" />
          </div>

          <div class="flex items-end">
            <button type="submit" class="w-full bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition">
              <i class="fa-solid fa-arrows-rotate mr-1"></i> Add Stock & Update Batch
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function populateStockItemDetails() {
  const selectedId = document.getElementById('stockItemSelect').value;
  const item = AppState.items.find(i => i.id === selectedId);
  if (!item) return;

  const batchSeq = Math.floor(10 + Math.random() * 90);
  document.getElementById('stockBatchNo').value = item.batchNo ? `${item.batchNo.slice(0, 8)}-${batchSeq}` : `BAT-${item.name.slice(0,3).toUpperCase()}-${batchSeq}`;
  document.getElementById('stockPurchaseCost').value = item.purchaseCost || (item.boxPrice * 0.8);
  document.getElementById('stockExpiry').value = item.expiryDate || '2027-12-31';
}

function handleStockUpdate(e) {
  e.preventDefault();
  const itemId = document.getElementById('stockItemSelect').value;
  const addBoxes = parseInt(document.getElementById('addBoxes').value) || 0;
  const batchNo = document.getElementById('stockBatchNo').value;
  const expiryDate = document.getElementById('stockExpiry').value;
  const purchaseCost = parseFloat(document.getElementById('stockPurchaseCost').value) || 0;

  const item = AppState.items.find(i => i.id === itemId);
  if (item) {
    const newUnitsAdded = addBoxes * item.totalUnitsPerBox;
    item.totalUnitsStock = (item.totalUnitsStock || 0) + newUnitsAdded;
    
    item.batchNo = batchNo;
    item.expiryDate = expiryDate;
    item.purchaseCost = purchaseCost;

    savePharmacies();
    alert(`Successfully added ${addBoxes} Boxes to "${item.name}". Total stock is now ${item.totalUnitsStock} Units.`);
    renderStockUpdateView();
  }
}