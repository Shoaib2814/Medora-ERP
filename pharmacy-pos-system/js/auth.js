document.addEventListener('DOMContentLoaded', () => {
  setupAuthEventListeners();
});

function setupAuthEventListeners() {
  // Navigation & Hero Buttons
  const navSignIn = document.getElementById('navSignInBtn');
  const navRegister = document.getElementById('navRegisterBtn');
  const heroSignIn = document.getElementById('heroSignInBtn');
  const heroRegister = document.getElementById('heroRegisterBtn');
  const closeAuth = document.getElementById('closeAuthModalBtn');
  const closeSecret = document.getElementById('closeSecretAdminModalBtn');

  if (navSignIn) navSignIn.addEventListener('click', () => openAuthModal('login'));
  if (navRegister) navRegister.addEventListener('click', () => openAuthModal('register'));
  if (heroSignIn) heroSignIn.addEventListener('click', () => openAuthModal('login'));
  if (heroRegister) heroRegister.addEventListener('click', () => openAuthModal('register'));
  if (closeAuth) closeAuth.addEventListener('click', closeAuthModal);
  if (closeSecret) closeSecret.addEventListener('click', closeSecretAdminModal);

  // Modal Tabs
  const tabLogin = document.getElementById('modalTabLogin');
  const tabRegister = document.getElementById('modalTabRegister');
  if (tabLogin) tabLogin.addEventListener('click', () => switchAuthModalTab('login'));
  if (tabRegister) tabRegister.addEventListener('click', () => switchAuthModalTab('register'));

  // Form Submissions
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const adminForm = document.getElementById('adminForm');
  const smsBtn = document.getElementById('smsResetBtn');

  if (loginForm) loginForm.addEventListener('submit', handleLoginSubmit);
  if (registerForm) registerForm.addEventListener('submit', handleRegisterSubmit);
  if (adminForm) adminForm.addEventListener('submit', handleAdminSubmit);
  if (smsBtn) smsBtn.addEventListener('click', () => {
    alert('SMS Alert: Password reset verification code sent to developer number 03327809739.');
  });
}

function openAuthModal(mode) {
  const modal = document.getElementById('authModal');
  if (modal) {
    modal.classList.remove('hidden');
    switchAuthModalTab(mode);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.classList.add('hidden');
}

function switchAuthModalTab(tab) {
  const loginTab = document.getElementById('modalTabLogin');
  const regTab = document.getElementById('modalTabRegister');
  const loginForm = document.getElementById('loginForm');
  const regForm = document.getElementById('registerForm');

  if (!loginTab || !regTab || !loginForm || !regForm) return;

  loginTab.classList.remove('border-emerald-600', 'text-emerald-600');
  regTab.classList.remove('border-emerald-600', 'text-emerald-600');
  loginForm.classList.add('hidden');
  regForm.classList.add('hidden');

  if (tab === 'login') {
    loginTab.classList.add('border-emerald-600', 'text-emerald-600');
    loginForm.classList.remove('hidden');
  } else if (tab === 'register') {
    regTab.classList.add('border-emerald-600', 'text-emerald-600');
    regForm.classList.remove('hidden');
  }
}

function handleRegisterSubmit(e) {
  e.preventDefault();

  const ownerName = document.getElementById('regOwnerName').value.trim();
  const pharmacyName = document.getElementById('regPharmacyName').value.trim();
  const ownerPhone = document.getElementById('regOwnerPhone').value.trim();
  const pharmacyPhone = document.getElementById('regPharmacyPhone').value.trim();
  const location = document.getElementById('regLocation').value.trim();
  const password = document.getElementById('regPassword').value.trim();

  const exists = AppState.pharmacies.some(p => p.ownerPhone === ownerPhone || p.pharmacyPhone === pharmacyPhone);
  if (exists) {
    alert('An account with this phone number already exists!');
    return;
  }

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
    isApproved: true, // AUTO-APPROVED FOR INSTANT LOGIN
    subscriptionPaidUntil: nextMonth.toISOString(),
    items: [],
    sales: [],
    purchases: []
  };

  AppState.pharmacies.push(newPharmacy);
  savePharmacies();

  alert('Registration successful! Logging you in now...');
  closeAuthModal();
  loginPharmacySession(newPharmacy);
}

function handleLoginSubmit(e) {
  e.preventDefault();
  const phone = document.getElementById('loginPhone').value.trim();
  const password = document.getElementById('loginPassword').value.trim();

  const found = AppState.pharmacies.find(p => 
    !p.isAdmin && (p.ownerPhone === phone || p.pharmacyPhone === phone) && p.password === password
  );

  if (!found) {
    alert('Invalid phone number or password!');
    return;
  }

  loginPharmacySession(found);
}

function handleAdminSubmit(e) {
  e.preventDefault();
  const user = document.getElementById('adminUser').value.trim();
  const pass = document.getElementById('adminPassword').value.trim();

  if (user === 'shoaib2814' && pass === 'sho@ib_admin') {
    const adminObj = AppState.pharmacies.find(p => p.isAdmin);
    loginPharmacySession(adminObj);
  } else {
    alert('Access Denied: Invalid Super Admin credentials!');
  }
}