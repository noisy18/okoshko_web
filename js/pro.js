// ==========================================
// OKOSHKO PRO BUSINESS PANEL LOGIC & STORE
// ==========================================

const PRO_DATA_STORAGE_KEY = 'okoshko_pro_salon_data_v1';
const PRO_APPOINTMENTS_STORAGE_KEY = 'okoshko_pro_clients_appointments_v1';

// Default initial state for PRO Salon (Beauty Studio as baseline partner)
const DEFAULT_PRO_SALON = {
  name: 'Beauty Studio',
  address: 'ул. Большая Садовая, 42 • м. Маяковская',
  phone: '+7 (999) 123-45-67',
  creatorTag: '@maximtepin',
  adminTag: '@okoshko_admin',
  notificationsEnabled: true,
  categoryText: 'Маникюр · Брови · Педикюр',
  rating: '4.9',
  reviewsCount: 148,
  services: [
    { id: 'bs_s1', name: 'Маникюр с покрытием гель-лак Luxio', desc: 'Снятие, выравнивание, покрытие • 90 мин', price: 2500, duration: 90 },
    { id: 'bs_s2', name: 'Архитектура и окрашивание бровей', desc: 'Хна или премиум-краситель Levissime • 60 мин', price: 1800, duration: 60 },
    { id: 'bs_s3', name: 'Smart-педикюр эстетический', desc: 'Аппаратная обработка стопы + пальчики • 75 мин', price: 2800, duration: 75 },
    { id: 'bs_s4', name: 'Ремонт / Дизайн френч', desc: 'Укрепление акрилом или пудрой • 20 мин', price: 400, duration: 20 }
  ],
  masters: [
    {
      id: 'master_beauty_alina',
      name: 'Алина Романова',
      role_title: 'Топ-мастер аппаратного маникюра',
      grade_badge: 'PRO TOP',
      experience: '5 лет',
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw'
    },
    {
      id: 'master_beauty_daria',
      name: 'Дарья Мельникова',
      role_title: 'Бровист-лэшмейкер PRO',
      grade_badge: 'PRO BROW',
      experience: '3 года',
      avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCH0Y8FhK0i_d2lU1h52Jg3-vBfE3xQ194Z3U4tF9-3-P21l6E2GgZ4rX2v7FmZ0H3qL2kM-6z7VpW4eR2A7y'
    }
  ]
};

// Default initial client appointments for PRO partner
const DEFAULT_PRO_APPOINTMENTS = [
  {
    id: 'pro_app_1',
    clientName: 'Анна Смирнова',
    clientPhone: '+7 (916) 450-22-11',
    clientHandle: '@anna_smirnova',
    service: 'Маникюр с покрытием гель-лак Luxio',
    master: 'Алина Романова',
    date: 'Сегодня, 10 октября',
    time: '15:30',
    price: 2500,
    status: 'active'
  },
  {
    id: 'pro_app_2',
    clientName: 'Екатерина Власова',
    clientPhone: '+7 (925) 789-01-23',
    clientHandle: '@katya_vlasova',
    service: 'Архитектура и окрашивание бровей',
    master: 'Дарья Мельникова',
    date: 'Сегодня, 10 октября',
    time: '17:00',
    price: 1800,
    status: 'active'
  },
  {
    id: 'pro_app_3',
    clientName: 'Мария Лебедева',
    clientPhone: '+7 (903) 111-44-55',
    clientHandle: '@maria_lebedeva',
    service: 'Smart-педикюр эстетический',
    master: 'Алина Романова',
    date: 'Завтра, 11 октября',
    time: '12:00',
    price: 2800,
    status: 'active'
  },
  {
    id: 'pro_app_4',
    clientName: 'Ольга Кузнецова',
    clientPhone: '+7 (915) 333-88-99',
    clientHandle: '@olga_kuz',
    service: 'Маникюр с покрытием гель-лак Luxio',
    master: 'Алина Романова',
    date: '8 октября 2026',
    time: '14:00',
    price: 2500,
    status: 'completed'
  }
];

function getProSalonData() {
  try {
    const raw = localStorage.getItem(PRO_DATA_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return JSON.parse(JSON.stringify(DEFAULT_PRO_SALON));
}

function saveProSalonData(data) {
  try {
    localStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (e) { }
  syncProSalonUI();
}

function getProAppointments() {
  try {
    const raw = localStorage.getItem(PRO_APPOINTMENTS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  return JSON.parse(JSON.stringify(DEFAULT_PRO_APPOINTMENTS));
}

function saveProAppointments(appts) {
  try {
    localStorage.setItem(PRO_APPOINTMENTS_STORAGE_KEY, JSON.stringify(appts));
  } catch (e) { }
  renderProAppointments();
  renderProStats();
}

// ------------------------------------------
// PRO MODE SWITCHING
// ------------------------------------------
function enterProMode() {
  state.isProMode = true;
  document.body.classList.add('pro-mode-active');
  router.navigate('pro-stats');
  showToast('Добро пожаловать в Okoshko PRO 💼');
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  } catch (e) { }
}

function exitProMode() {
  state.isProMode = false;
  document.body.classList.remove('pro-mode-active');
  router.navigate('profile');
  showToast('Возврат в профиль клиента');
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  } catch (e) { }
}

// ------------------------------------------
// SYNC PRO SALON PROFILE UI
// ------------------------------------------
function syncProSalonUI() {
  const data = getProSalonData();
  
  // Name
  const nameEl = document.getElementById('proSalonName');
  const nameSubEl = document.getElementById('proProfileNameSub');
  if (nameEl) nameEl.textContent = data.name;
  if (nameSubEl) nameSubEl.textContent = data.name;
  
  // Address
  const addrEl = document.getElementById('proSalonAddress');
  const addrSubEl = document.getElementById('proProfileAddressSub');
  if (addrEl) addrEl.textContent = data.address;
  if (addrSubEl) addrSubEl.textContent = data.address;

  // Phone
  const phoneEl = document.getElementById('proProfilePhoneSub');
  if (phoneEl) phoneEl.textContent = data.phone || 'Не указан';

  // Tags
  const creatorEl = document.getElementById('proProfileCreatorTag');
  if (creatorEl) {
    const userHandle = state.user?.username ? `@${state.user.username}` : (data.creatorTag || '@maximtepin');
    creatorEl.textContent = userHandle;
  }

  const adminEl = document.getElementById('proProfileAdminSub');
  if (adminEl) adminEl.textContent = data.adminTag || 'Не назначен';

  // Counts
  const svcCountEl = document.getElementById('proServicesCountBadge');
  if (svcCountEl) svcCountEl.textContent = `${data.services.length} услуг`;

  const mastersCountEl = document.getElementById('proMastersCountBadge');
  if (mastersCountEl) mastersCountEl.textContent = `${data.masters.length} мастеров`;

  // Notifications switch
  const notifToggle = document.getElementById('proTgNotificationsToggle');
  if (notifToggle) notifToggle.checked = !!data.notificationsEnabled;
}

// ------------------------------------------
// PRO PROFILE EDITING MODALS
// ------------------------------------------
let activeProEditField = null;

function openProFieldModal(fieldKey) {
  activeProEditField = fieldKey;
  const modal = document.getElementById('proFieldEditModal');
  const title = document.getElementById('proFieldEditTitle');
  const input = document.getElementById('proFieldEditInput');
  const hint = document.getElementById('proFieldEditHint');
  const data = getProSalonData();

  if (!modal || !input) return;

  if (fieldKey === 'name') {
    title.textContent = 'Название предприятия';
    input.placeholder = 'Например: Beauty Studio';
    input.value = data.name;
    hint.textContent = 'Отображается на карточке и в каталоге сервиса';
  } else if (fieldKey === 'address') {
    title.textContent = 'Адрес салона';
    input.placeholder = 'Город, улица, дом, метро';
    input.value = data.address;
    hint.textContent = 'Клиенты увидят адрес при бронировании';
  } else if (fieldKey === 'phone') {
    title.textContent = 'Контактный телефон';
    input.placeholder = '+7 (999) 000-00-00';
    input.value = data.phone || '';
    hint.textContent = 'Номер для звонков и клиентской связи';
  } else if (fieldKey === 'admin') {
    title.textContent = 'Тег администратора';
    input.placeholder = '@admin_username';
    input.value = data.adminTag || '';
    hint.textContent = 'В Telegram этого администратора будут приходить уведомления о записях';
  }

  modal.classList.remove('hidden');
  modal.classList.add('flex');
  setTimeout(() => input.focus(), 150);
}

function closeProFieldModal() {
  const modal = document.getElementById('proFieldEditModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  activeProEditField = null;
}

function saveProFieldEdit() {
  const input = document.getElementById('proFieldEditInput');
  if (!input || !activeProEditField) return;
  const val = input.value.trim();

  if (!val) {
    showToast('Пожалуйста, заполните поле');
    return;
  }

  const data = getProSalonData();
  if (activeProEditField === 'name') {
    data.name = val;
    showToast('Название обновлено ✓');
  } else if (activeProEditField === 'address') {
    data.address = val;
    showToast('Адрес обновлен ✓');
  } else if (activeProEditField === 'phone') {
    data.phone = val;
    showToast('Телефон обновлен ✓');
  } else if (activeProEditField === 'admin') {
    data.adminTag = val.startsWith('@') ? val : `@${val}`;
    showToast('Администратор обновлен ✓');
  }

  saveProSalonData(data);
  closeProFieldModal();
}

function toggleProNotifications(enabled) {
  const data = getProSalonData();
  data.notificationsEnabled = enabled;
  saveProSalonData(data);
  const msg = enabled ? 'Уведомления администратору включены 🔔' : 'Уведомления отключены 🔕';
  showToast(msg);
}

// ------------------------------------------
// PRO SERVICES MANAGEMENT MODAL
// ------------------------------------------
function openProServicesModal() {
  const modal = document.getElementById('proServicesModal');
  if (!modal) return;
  renderProServicesList();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProServicesModal() {
  const modal = document.getElementById('proServicesModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderProServicesList() {
  const container = document.getElementById('proServicesListContainer');
  if (!container) return;
  const data = getProSalonData();

  if (data.services.length === 0) {
    container.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs">Список услуг пока пуст</div>';
    return;
  }

  container.innerHTML = data.services.map((svc, idx) => `
    <div class="p-3.5 rounded-2xl bg-surface-container-low border border-slate-200/70 flex items-center justify-between gap-2">
      <div class="flex flex-col min-w-0 flex-1">
        <span class="font-bold text-xs text-on-surface truncate">${svc.name}</span>
        <span class="text-[10px] text-slate-400 mt-0.5 truncate">${svc.desc || (svc.duration + ' мин')}</span>
        <span class="text-xs font-extrabold text-primary mt-1">${(svc.price || 0).toLocaleString('ru-RU')} ₽</span>
      </div>
      <button onclick="deleteProService(${idx})" class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center shrink-0 active:scale-90 transition-transform">
        <span class="material-symbols-outlined text-[17px]">delete</span>
      </button>
    </div>
  `).join('');
}

function addProService() {
  const nameInput = document.getElementById('newServiceNameInput');
  const priceInput = document.getElementById('newServicePriceInput');
  const durInput = document.getElementById('newServiceDurationInput');

  const name = nameInput?.value?.trim();
  const price = parseInt(priceInput?.value || '0', 10);
  const dur = parseInt(durInput?.value || '60', 10);

  if (!name || isNaN(price) || price <= 0) {
    showToast('Укажите название и корректную стоимость');
    return;
  }

  const data = getProSalonData();
  data.services.push({
    id: 'svc_' + Date.now(),
    name: name,
    desc: `${dur} мин`,
    price: price,
    duration: dur
  });

  saveProSalonData(data);
  if (nameInput) nameInput.value = '';
  if (priceInput) priceInput.value = '';
  renderProServicesList();
  showToast('Услуга успешно добавлена 💅');
}

function deleteProService(idx) {
  const data = getProSalonData();
  if (data.services[idx]) {
    data.services.splice(idx, 1);
    saveProSalonData(data);
    renderProServicesList();
    showToast('Услуга удалена');
  }
}

// ------------------------------------------
// PRO MASTERS MANAGEMENT MODAL
// ------------------------------------------
function openProMastersModal() {
  const modal = document.getElementById('proMastersModal');
  if (!modal) return;
  renderProMastersList();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProMastersModal() {
  const modal = document.getElementById('proMastersModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function renderProMastersList() {
  const container = document.getElementById('proMastersListContainer');
  if (!container) return;
  const data = getProSalonData();

  if (data.masters.length === 0) {
    container.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs">Список мастеров пока пуст</div>';
    return;
  }

  container.innerHTML = data.masters.map((m, idx) => `
    <div class="p-3.5 rounded-2xl bg-surface-container-low border border-slate-200/70 flex items-center justify-between gap-3">
      <div class="w-11 h-11 rounded-2xl overflow-hidden bg-slate-200 shrink-0">
        <img src="${m.avatar_url}" alt="${m.name}" class="w-full h-full object-cover"/>
      </div>
      <div class="flex flex-col min-w-0 flex-1">
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-xs text-on-surface truncate">${m.name}</span>
          <span class="px-1.5 py-0.2 rounded-full bg-primary-fixed text-primary text-[9px] font-bold">${m.grade_badge || 'PRO'}</span>
        </div>
        <span class="text-[11px] text-slate-500 mt-0.5 truncate">${m.role_title}</span>
        <span class="text-[10px] text-slate-400">Опыт: ${m.experience}</span>
      </div>
      <button onclick="deleteProMaster(${idx})" class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center shrink-0 active:scale-90 transition-transform">
        <span class="material-symbols-outlined text-[17px]">delete</span>
      </button>
    </div>
  `).join('');
}

function addProMaster() {
  const nameInput = document.getElementById('newMasterNameInput');
  const roleInput = document.getElementById('newMasterRoleInput');
  const expInput = document.getElementById('newMasterExpInput');

  const name = nameInput?.value?.trim();
  const role = roleInput?.value?.trim();
  const exp = expInput?.value?.trim() || '2 года';

  if (!name || !role) {
    showToast('Укажите имя и специализацию мастера');
    return;
  }

  const data = getProSalonData();
  data.masters.push({
    id: 'master_' + Date.now(),
    name: name,
    role_title: role,
    grade_badge: 'PRO',
    experience: exp,
    avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw'
  });

  saveProSalonData(data);
  if (nameInput) nameInput.value = '';
  if (roleInput) roleInput.value = '';
  renderProMastersList();
  showToast('Мастер успешно добавлен 💇');
}

function deleteProMaster(idx) {
  const data = getProSalonData();
  if (data.masters[idx]) {
    data.masters.splice(idx, 1);
    saveProSalonData(data);
    renderProMastersList();
    showToast('Мастер удален');
  }
}

// ------------------------------------------
// PRO CLIENT APPOINTMENTS RENDERING
// ------------------------------------------
function renderProAppointments() {
  const allAppts = getProAppointments();
  const activeContainer = document.getElementById('proActiveAppointmentsList');
  const historyContainer = document.getElementById('proHistoryAppointmentsList');
  const badge = document.getElementById('proActiveApptCountBadge');

  const activeList = allAppts.filter(a => a.status === 'active');
  const historyList = allAppts.filter(a => a.status !== 'active');

  if (badge) {
    badge.textContent = `${activeList.length} активных`;
  }

  if (activeContainer) {
    if (activeList.length === 0) {
      activeContainer.innerHTML = `
        <div class="rounded-3xl bg-white p-6 shadow-xs border border-slate-200/70 text-center flex flex-col items-center gap-3">
          <div class="w-14 h-14 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
            <span class="material-symbols-outlined text-[28px]">event_available</span>
          </div>
          <div>
            <h3 class="font-bold text-sm text-on-surface">Нет активных записей</h3>
            <p class="text-xs text-slate-400 mt-1">Новые записи клиентов на процедуры появятся здесь</p>
          </div>
        </div>
      `;
    } else {
      activeContainer.innerHTML = activeList.map(a => `
        <div class="p-4 rounded-3xl bg-white shadow-xs border border-slate-200/80 flex flex-col gap-3">
          <div class="flex items-start justify-between">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center font-bold text-sm shadow-xs">
                ${a.clientName ? a.clientName[0] : 'К'}
              </div>
              <div class="flex flex-col">
                <span class="font-bold text-sm text-on-surface">${a.clientName}</span>
                <span class="text-[11px] text-slate-400 mt-0.5">${a.clientHandle || a.clientPhone}</span>
              </div>
            </div>
            <span class="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold border border-emerald-200">
              Подтверждена
            </span>
          </div>

          <div class="p-3 rounded-2xl bg-surface-container-low flex flex-col gap-1 text-xs">
            <div class="flex justify-between items-center text-slate-700">
              <span class="font-medium">${a.service}</span>
              <span class="font-bold text-primary">${a.price.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div class="flex justify-between items-center text-slate-400 text-[11px] mt-0.5">
              <span>Мастер: <b class="text-slate-600">${a.master}</b></span>
              <span>🗓 ${a.date} • <b>${a.time}</b></span>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-1">
            <button onclick="completeProAppointment('${a.id}')" class="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[15px]">done_all</span>
              <span>Визит завершен</span>
            </button>
            <button onclick="cancelProAppointment('${a.id}')" class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs active:scale-95 transition-all">
              Отмена
            </button>
          </div>
        </div>
      `).join('');
    }
  }

  if (historyContainer) {
    if (historyList.length === 0) {
      historyContainer.innerHTML = '<div class="text-center py-4 text-slate-400 text-xs">История завершенных визитов пуста</div>';
    } else {
      historyContainer.innerHTML = historyList.map(a => `
        <div class="p-3 rounded-2xl bg-white border border-slate-200/60 flex items-center justify-between text-xs">
          <div class="flex flex-col">
            <span class="font-bold text-slate-700">${a.clientName}</span>
            <span class="text-[10px] text-slate-400">${a.service} • ${a.date}</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="font-bold text-slate-800">${a.price.toLocaleString('ru-RU')} ₽</span>
            <span class="px-1.5 py-0.5 rounded-full ${a.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'} text-[10px] font-semibold">
              ${a.status === 'completed' ? 'Завершен' : 'Отменен'}
            </span>
          </div>
        </div>
      `).join('');
    }
  }
}

function completeProAppointment(id) {
  const appts = getProAppointments();
  const target = appts.find(a => a.id === id);
  if (target) {
    target.status = 'completed';
    saveProAppointments(appts);
    showToast('Визит отмечен как завершенный 🎉');
  }
}

function cancelProAppointment(id) {
  const appts = getProAppointments();
  const target = appts.find(a => a.id === id);
  if (target) {
    target.status = 'cancelled';
    saveProAppointments(appts);
    showToast('Запись отменена');
  }
}

// ------------------------------------------
// PRO STATS & ANALYTICS RENDERING
// ------------------------------------------
function renderProStats() {
  const appts = getProAppointments();
  const completed = appts.filter(a => a.status === 'completed');
  const active = appts.filter(a => a.status === 'active');

  const baseRevenue = completed.reduce((sum, a) => sum + (a.price || 0), 0) + 18400; // baseline
  const totalBookingsCount = appts.length + 12;
  const viewsCount = 284;
  const avgCheck = Math.round(baseRevenue / (completed.length + 7));

  const revEl = document.getElementById('proStatRevenue');
  const bookingsEl = document.getElementById('proStatBookings');
  const viewsEl = document.getElementById('proStatViews');
  const avgCheckEl = document.getElementById('proStatAvgCheck');

  if (revEl) revEl.textContent = `${baseRevenue.toLocaleString('ru-RU')} ₽`;
  if (bookingsEl) bookingsEl.textContent = totalBookingsCount;
  if (viewsEl) viewsEl.textContent = viewsCount;
  if (avgCheckEl) avgCheckEl.textContent = `${avgCheck.toLocaleString('ru-RU')} ₽`;
}
