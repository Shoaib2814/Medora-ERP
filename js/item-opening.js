let editingItemId = null;

function renderItemOpeningView() {
  const container = document.getElementById('view-itemOpening');
  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-slate-800">Item Master Opening</h2>
          <p class="text-xs text-slate-500">Manage catalog items, company names, prices, or delete items.</p>
        </div>
        <div class="flex gap-2">
          <button onclick="exportItemsToExcel()" class="bg-slate-800 text-white px-3 py-2 rounded-lg text-xs font-semibold hover:bg-slate-700 transition">
            <i class="fa-solid fa-file-excel mr-1"></i> Export Excel
          </button>
          <label class="bg-emerald-600 text-white px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer hover:bg-emerald-700 transition">
            <i class="fa-solid fa-file-import mr-1"></i> Import Excel
            <input type="file" accept=".xlsx, .csv" class="hidden" onchange="importItemsFromExcel(event)" />
          </label>
        </div>
      </div>

      <div class="bg-white p-5 rounded-xl shadow-sm border border-slate-200">
        <h3 id="formTitle" class="font-bold text-sm text-slate-800 mb-3">Add New Item</h3>
        <form onsubmit="handleSaveItem(event)" class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Item Name *</label>
            <input type="text" id="itemName" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="e.g. Panadol Extra" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Company / Manufacturer *</label>
            <input type="text" id="itemCompany" required class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="e.g. GSK / Getz" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Item Type</label>
            <select id="itemType" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none">
              <option value="Tablet">Tablet</option>
              <option value="Capsule">Capsule</option>
              <option value="Syrup">Syrup</option>
              <option value="Injection">Injection</option>
              <option value="Cream">Cream</option>
              <option value="Drops">Drops</option>
              <option value="Drip">Drip</option>
              <option value="Lotion">Lotion</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Strips Per Box</label>
            <input type="number" id="stripsPerBox" min="1" value="10" oninput="calculateUnitRatios()" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Tablets/Units Per Strip</label>
            <input type="number" id="unitsPerStrip" min="1" value="10" oninput="calculateUnitRatios()" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Box Price (Rs.) *</label>
            <input type="number" id="boxPrice" min="0" step="0.01" required oninput="calculateUnitRatios()" class="w-full border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none" placeholder="300" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Calculated Strip Price</label>
            <input type="text" id="calculatedStripPrice" readonly class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-sm font-semibold text-slate-700" />
          </div>

          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Calculated Loose Price</label>
            <input type="text" id="calculatedUnitPrice" readonly class="w-full bg-slate-100 border border-slate-300 rounded-lg p-2 text-sm font-semibold text-slate-700" />
          </div>

          <div class="flex items-end gap-2 md:col-span-2">
            <button type="submit" id="saveItemBtn" class="flex-1 bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-emerald-700 transition">
              <i class="fa-solid fa-plus mr-1"></i> Save Item
            </button>
            <button type="button" id="cancelEditBtn" onclick="resetItemForm()" class="hidden bg-slate-200 text-slate-700 font-bold px-3 py-2 rounded-lg hover:bg-slate-300 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>

      <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div class="p-4 border-b font-bold text-slate-800 flex justify-between items-center">
          <span>Master Item Catalog (${AppState.items.length})</span>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm text-slate-600">
            <thead class="bg-slate-50 text-slate-500 uppercase text-xs">
              <tr>
                <th class="p-3">ID</th>
                <th class="p-3">Name & Company</th>
                <th class="p-3">Type</th>
                <th class="p-3">Packaging Ratio</th>
                <th class="p-3">Box Price</th>
                <th class="p-3">Loose Price</th>
                <th class="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${AppState.items.length === 0 ? '<tr><td colspan="7" class="p-4 text-center text-slate-400">No items in catalog. Add one above.</td></tr>' : 
                AppState.items.map(item => `
                  <tr>
                    <td class="p-3 font-semibold text-slate-400">${item.id}</td>
                    <td class="p-3">
                      <p class="font-bold text-slate-800">${item.name}</p>
                      <p class="text-xs text-emerald-600 font-medium">Company: ${item.company || 'N/A'}</p>
                    </td>
                    <td class="p-3"><span class="bg-slate-100 text-slate-600 text-xs px-2 py-0.5 rounded-full">${item.type}</span></td>
                    <td class="p-3 text-xs">${item.stripsPerBox} Strips × ${item.unitsPerStrip} Tabs (${item.totalUnitsPerBox} total)</td>
                    <td class="p-3 font-semibold text-slate-800">Rs. ${item.boxPrice}</td>
                    <td class="p-3 text-emerald-600 font-bold">Rs. ${item.unitPrice.toFixed(2)}</td>
                    <td class="p-3 text-right space-x-1">
                      <button onclick="editItem('${item.id}')" class="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded font-bold hover:bg-amber-200"><i class="fa-solid fa-pen"></i></button>
                      <button onclick="deleteItem('${item.id}')" class="bg-rose-600 text-white text-xs px-2.5 py-1 rounded font-bold hover:bg-rose-700"><i class="fa-solid fa-trash mr-1"></i> Delete</button>
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

function calculateUnitRatios() {
  const boxPrice = parseFloat(document.getElementById('boxPrice').value) || 0;
  const stripsPerBox = parseInt(document.getElementById('stripsPerBox').value) || 1;
  const unitsPerStrip = parseInt(document.getElementById('unitsPerStrip').value) || 1;

  const totalUnits = stripsPerBox * unitsPerStrip;
  const unitPrice = boxPrice / (totalUnits || 1);
  const stripPrice = unitPrice * unitsPerStrip;

  document.getElementById('calculatedStripPrice').value = `Rs. ${stripPrice.toFixed(2)}`;
  document.getElementById('calculatedUnitPrice').value = `Rs. ${unitPrice.toFixed(2)}`;
}

function handleSaveItem(e) {
  e.preventDefault();
  const name = document.getElementById('itemName').value.trim();
  const company = document.getElementById('itemCompany').value.trim();
  const type = document.getElementById('itemType').value;
  const stripsPerBox = parseInt(document.getElementById('stripsPerBox').value) || 1;
  const unitsPerStrip = parseInt(document.getElementById('unitsPerStrip').value) || 1;
  const boxPrice = parseFloat(document.getElementById('boxPrice').value) || 0;

  const totalUnitsPerBox = stripsPerBox * unitsPerStrip;
  const unitPrice = boxPrice / totalUnitsPerBox;
  const stripPrice = unitPrice * unitsPerStrip;

  if (editingItemId) {
    const item = AppState.items.find(i => i.id === editingItemId);
    if (item) {
      item.name = name;
      item.company = company;
      item.type = type;
      item.stripsPerBox = stripsPerBox;
      item.unitsPerStrip = unitsPerStrip;
      item.totalUnitsPerBox = totalUnitsPerBox;
      item.boxPrice = boxPrice;
      item.stripPrice = stripPrice;
      item.unitPrice = unitPrice;
    }
  } else {
    const newItem = {
      id: `ITM-${Date.now().toString().slice(-4)}`,
      name,
      company,
      type,
      stripsPerBox,
      unitsPerStrip,
      totalUnitsPerBox,
      boxPrice,
      stripPrice,
      unitPrice,
      purchaseCost: boxPrice * 0.8,
      batchNo: `BAT-${Math.floor(1000 + Math.random() * 9000)}`,
      expiryDate: '2027-12-31',
      totalUnitsStock: 0
    };
    AppState.items.push(newItem);
  }

  savePharmacies();
  resetItemForm();
  renderItemOpeningView();
}

function editItem(itemId) {
  const item = AppState.items.find(i => i.id === itemId);
  if (!item) return;

  editingItemId = item.id;
  document.getElementById('formTitle').innerText = `Edit Item (${item.id})`;
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemCompany').value = item.company || '';
  document.getElementById('itemType').value = item.type;
  document.getElementById('stripsPerBox').value = item.stripsPerBox;
  document.getElementById('unitsPerStrip').value = item.unitsPerStrip;
  document.getElementById('boxPrice').value = item.boxPrice;

  calculateUnitRatios();
  document.getElementById('saveItemBtn').innerHTML = '<i class="fa-solid fa-floppy-disk mr-1"></i> Update Item';
  document.getElementById('cancelEditBtn').classList.remove('hidden');
}

function deleteItem(itemId) {
  const item = AppState.items.find(i => i.id === itemId);
  if (!item) return;

  if (confirm(`Delete "${item.name}"?`)) {
    AppState.items = AppState.items.filter(i => i.id !== itemId);
    savePharmacies();
    renderItemOpeningView();
  }
}

function resetItemForm() {
  editingItemId = null;
  const form = document.querySelector('#view-itemOpening form');
  if (form) form.reset();
  const saveBtn = document.getElementById('saveItemBtn');
  if (saveBtn) saveBtn.innerHTML = '<i class="fa-solid fa-plus mr-1"></i> Save Item';
  const cancelBtn = document.getElementById('cancelEditBtn');
  if (cancelBtn) cancelBtn.classList.add('hidden');
}

function exportItemsToExcel() {
  const ws = XLSX.utils.json_to_sheet(AppState.items);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Items");
  XLSX.writeFile(wb, `${AppState.currentPharmacy.pharmacyName}_Catalog.xlsx`);
}

function importItemsFromExcel(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (evt) => {
    const data = new Uint8Array(evt.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const sheetName = workbook.SheetNames[0];
    const importedData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (importedData.length > 0) {
      AppState.items = importedData.map((item, idx) => ({
        id: item.id || `ITM-IMP-${idx + 1}`,
        name: item.name || 'Imported Medicine',
        company: item.company || 'General Pharma',
        type: item.type || 'Tablet',
        stripsPerBox: Number(item.stripsPerBox) || 10,
        unitsPerStrip: Number(item.unitsPerStrip) || 10,
        totalUnitsPerBox: (Number(item.stripsPerBox) || 10) * (Number(item.unitsPerStrip) || 10),
        boxPrice: Number(item.boxPrice) || 100,
        stripPrice: Number(item.stripPrice) || 10,
        unitPrice: Number(item.unitPrice) || 1,
        purchaseCost: Number(item.purchaseCost) || 80,
        batchNo: item.batchNo || 'BAT-IMP',
        expiryDate: item.expiryDate || '2027-12-31',
        totalUnitsStock: Number(item.totalUnitsStock) || 0
      }));
      savePharmacies();
      renderItemOpeningView();
      alert('Items Imported Successfully!');
    }
  };
  reader.readAsArrayBuffer(file);
}