// ==========================================
// MASTER PANEL SUBSYSTEM (Панель мастера «Окошко»)
// ==========================================

const MASTER_DATA_KEY = 'okoshko_master_data';
const MASTER_APPTS_KEY = 'okoshko_master_appointments';
const MASTER_SCHEDULE_KEY = 'okoshko_master_schedule_slots';

const DEFAULT_MASTER_DATA = {
  id: 'master_1',
  salonId: 'salon_1',
  salonName: 'Салон красоты',
  salonAddress: 'Адрес уточняется',
  name: 'Мастер',
  lastName: '',
  role_title: 'Специалист салона',
  grade_badge: 'PRO',
  rating: 5.0,
  reviews_count: 24,
  experience: '3 года',
  bio: 'Профессиональный уход и индивидуальный подход к каждому клиенту.',
  avatar_url: '',
  notificationsEnabled: true,
  slots: ['10:00', '12:00', '14:30', '16:00', '18:00'],
  services: [
    { id: 'msvc_1', name: 'Маникюр с покрытием гель-лак', price: 2500, duration: 60, desc: 'Полный комплекс: снятие, маникюр, выравнивание и покрытие' },
    { id: 'msvc_2', name: 'Smart-педикюр эстетический', price: 3000, duration: 80, desc: 'Аппаратная обработка стопы и пальчиков с покрытием' }
  ]
};

// Initial realistic demo appointments for master
const DEFAULT_MASTER_APPOINTMENTS = [
  {
    id: 'mappt_101',
    date: getFormattedDateKey(0), // Сегодня
    dateDisplay: 'Сегодня, ' + getFormattedDateDisplay(0),
    time: '11:00',
    timeEnd: '12:30',
    service: 'Маникюр с покрытием гель-лак',
    price: 2500,
    status: 'confirmed',
    client: {
      id: 'cli_1',
      name: 'Анна Смирнова',
      phone: '+7 (925) 345-67-89',
      telegram: '@anna_smirnova',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      visitsCount: 3,
      history: [
        { date: '15 сентября 2026', service: 'Маникюр со снятием Luxio', price: 2500, status: 'Завершен' },
        { date: '18 августа 2026', service: 'Smart-педикюр эстетический', price: 3000, status: 'Завершен' }
      ]
    }
  },
  {
    id: 'mappt_102',
    date: getFormattedDateKey(0), // Сегодня
    dateDisplay: 'Сегодня, ' + getFormattedDateDisplay(0),
    time: '15:00',
    timeEnd: '16:00',
    service: 'Оформление и ламинирование бровей',
    price: 1800,
    status: 'confirmed',
    client: {
      id: 'cli_2',
      name: 'Мария Кузнецова',
      phone: '+7 (916) 888-22-33',
      telegram: '@maria_kuz',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      visitsCount: 1,
      history: [] // Пустая история (первый визит)
    }
  },
  {
    id: 'mappt_103',
    date: getFormattedDateKey(1), // Завтра
    dateDisplay: 'Завтра, ' + getFormattedDateDisplay(1),
    time: '14:00',
    timeEnd: '15:30',
    service: 'Smart-педикюр эстетический',
    price: 3200,
    status: 'confirmed',
    client: {
      id: 'cli_3',
      name: 'Елена Романова',
      phone: '+7 (903) 555-11-22',
      telegram: '@elena_rom',
      avatar: '',
      visitsCount: 1,
      history: []
    }
  }
];

// Helper functions for dates
function getFormattedDateKey(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getFormattedDateDisplay(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
}

// ------------------------------------------
// STATE GETTERS & SETTERS
// ------------------------------------------
function getMasterData() {
  try {
    const raw = localStorage.getItem(MASTER_DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_MASTER_DATA, parsed);
    }
  } catch (e) {
    console.warn('[Master] Error reading master data:', e);
  }
  return Object.assign({}, DEFAULT_MASTER_DATA);
}

function saveMasterData(data) {
  try {
    localStorage.setItem(MASTER_DATA_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('[Master] Error saving master data:', e);
  }

  // Sync to parent salon if available
  try {
    const proData = (typeof getProSalonData === 'function') ? getProSalonData() : null;
    if (proData && Array.isArray(proData.masters)) {
      const idx = proData.masters.findIndex(m => m.id === data.id || m.name === data.name);
      if (idx !== -1) {
        proData.masters[idx] = Object.assign({}, proData.masters[idx], {
          name: data.name,
          lastName: data.lastName,
          role_title: data.role_title,
          avatar_url: data.avatar_url,
          experience: data.experience,
          bio: data.bio,
          slots: data.slots || []
        });
        if (typeof saveProSalonData === 'function') {
          saveProSalonData(proData);
        }
      }
    }
  } catch (e) { }

  // Sync to backend API if possible
  try {
    const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
    fetch('/api/master_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: userTgId,
        master_id: data.id ? String(data.id).replace('db_master_', '') : null,
        salon_id: data.salonId ? String(data.salonId).replace('salon_', '') : 1,
        name: data.name,
        lastName: data.lastName,
        role_title: data.role_title,
        experience: data.experience,
        bio: data.bio,
        avatar_url: data.avatar_url,
        slots: data.slots,
        services: data.services
      })
    }).catch(() => {});
  } catch (e) {}
}

function getMasterAppointments() {
  try {
    const raw = localStorage.getItem(MASTER_APPTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) { }
  return DEFAULT_MASTER_APPOINTMENTS;
}

function saveMasterAppointments(list) {
  try {
    localStorage.setItem(MASTER_APPTS_KEY, JSON.stringify(list));
  } catch (e) { }
}

function getMasterScheduleSlots() {
  try {
    const raw = localStorage.getItem(MASTER_SCHEDULE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) { }
  // Default schedule: today and next few days have preset slots
  const def = {};
  for (let i = 0; i < 7; i++) {
    def[getFormattedDateKey(i)] = ['10:00', '12:00', '14:30', '16:00', '18:00'];
  }
  return def;
}

function saveMasterScheduleSlots(slotsMap) {
  try {
    localStorage.setItem(MASTER_SCHEDULE_KEY, JSON.stringify(slotsMap));
  } catch (e) { }
}

// ------------------------------------------
// INITIALIZATION & URL PARAMETERS
// ------------------------------------------
function initMasterSubsystem() {
  const urlParams = new URLSearchParams(window.location.search);
  const data = getMasterData();

  // 1. Detect if user is linked as a master
  let isMasterUser = false;
  if (urlParams.get('is_master') === '1' || urlParams.get('pro_role') === 'master') {
    isMasterUser = true;
    localStorage.setItem('okoshko_is_master', 'true');
  } else if (localStorage.getItem('okoshko_is_master') === 'true') {
    isMasterUser = true;
  }

  // 2. Parse master info from URL query params
  if (urlParams.has('master_id')) {
    data.id = urlParams.get('master_id');
  }
  if (urlParams.has('master_salon_id')) {
    data.salonId = urlParams.get('master_salon_id');
  }
  if (urlParams.has('master_name')) {
    data.name = decodeURIComponent(urlParams.get('master_name'));
  }
  if (urlParams.has('master_lastname')) {
    data.lastName = decodeURIComponent(urlParams.get('master_lastname'));
  }
  if (urlParams.has('master_role')) {
    data.role_title = decodeURIComponent(urlParams.get('master_role'));
  }
  if (urlParams.has('master_avatar')) {
    data.avatar_url = decodeURIComponent(urlParams.get('master_avatar'));
  }
  if (urlParams.has('master_exp')) {
    data.experience = decodeURIComponent(urlParams.get('master_exp'));
  }
  if (urlParams.has('master_bio')) {
    data.bio = decodeURIComponent(urlParams.get('master_bio'));
  }
  if (urlParams.has('master_slots')) {
    try {
      const s = JSON.parse(decodeURIComponent(urlParams.get('master_slots')));
      if (Array.isArray(s) && s.length) data.slots = s;
    } catch (e) { }
  }
  if (urlParams.has('master_services')) {
    try {
      const svcs = JSON.parse(decodeURIComponent(urlParams.get('master_services')));
      if (Array.isArray(svcs) && svcs.length) data.services = svcs;
    } catch (e) { }
  }

  if (typeof state !== 'undefined') {
    state.isMaster = isMasterUser;
  }

  // Reconcile parent salon name & address
  const proSalon = (typeof getProSalonData === 'function') ? getProSalonData() : null;
  if (proSalon) {
    if (proSalon.name) data.salonName = proSalon.name;
    if (proSalon.address) data.salonAddress = proSalon.address;
  }

  saveMasterData(data);
  checkAndRenderMasterPanelButton();

  // Try background fetch from server
  const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
  fetch(`/api/master_get?user_id=${userTgId}`)
    .then(r => r.json())
    .then(res => {
      if (res && res.found) {
        state.isMaster = true;
        localStorage.setItem('okoshko_is_master', 'true');
        const cur = getMasterData();
        if (res.name) cur.name = res.name;
        if (res.lastName) cur.lastName = res.lastName;
        if (res.role_title) cur.role_title = res.role_title;
        if (res.avatar_url) cur.avatar_url = res.avatar_url;
        if (res.experience) cur.experience = res.experience;
        if (res.bio) cur.bio = res.bio;
        if (Array.isArray(res.services) && res.services.length) cur.services = res.services;
        if (Array.isArray(res.slots) && res.slots.length) cur.slots = res.slots;
        saveMasterData(cur);
        checkAndRenderMasterPanelButton();
      }
    })
    .catch(() => {});
}

// Show/hide "Перейти в панель мастера" button on Client Profile
function checkAndRenderMasterPanelButton() {
  const btnBlock = document.getElementById('masterPanelEntryBlock');
  if (!btnBlock) return;
  const isMaster = (typeof state !== 'undefined' && state.isMaster) || (localStorage.getItem('okoshko_is_master') === 'true');
  if (isMaster) {
    btnBlock.classList.remove('hidden');
    btnBlock.style.display = 'block';
  } else {
    btnBlock.classList.add('hidden');
    btnBlock.style.display = 'none';
  }
}

// ------------------------------------------
// MODE SWITCHING: CLIENT <-> MASTER
// ------------------------------------------
function switchToMasterMode() {
  if (typeof state !== 'undefined') {
    state.isMasterMode = true;
    state.isProMode = false;
  }
  document.body.classList.add('master-mode-active');
  document.body.classList.remove('pro-mode-active');

  router.navigate('master-stats');
  showToast('Добро пожаловать в панель мастера! 💇‍♀️✨');

  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  } catch (e) { }
}

function confirmExitMasterMode() {
  const modal = document.getElementById('masterExitConfirmModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeMasterExitConfirmModal() {
  const modal = document.getElementById('masterExitConfirmModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function exitMasterModeToClient() {
  closeMasterExitConfirmModal();
  if (typeof state !== 'undefined') {
    state.isMasterMode = false;
  }
  document.body.classList.remove('master-mode-active');
  router.navigate('profile');
  showToast('Вы перешли в клиентский профиль 👤');

  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
    }
  } catch (e) { }
}

// ------------------------------------------
// PAGE 1: MASTER STATISTICS (Диаграмма по периодам)
// ------------------------------------------
let currentMasterStatsPeriod = 'day';

function setMasterStatsPeriod(period, btn) {
  currentMasterStatsPeriod = period;
  document.querySelectorAll('.master-stats-period-btn').forEach(b => {
    b.classList.remove('bg-white', 'text-primary', 'shadow-xs', 'font-bold');
    b.classList.add('text-slate-500', 'font-medium');
  });
  if (btn) {
    btn.classList.add('bg-white', 'text-primary', 'shadow-xs', 'font-bold');
    btn.classList.remove('text-slate-500', 'font-medium');
  }
  renderMasterStats(period);
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  } catch (e) { }
}

function renderMasterStats(period = currentMasterStatsPeriod) {
  const master = getMasterData();
  const appts = getMasterAppointments();

  // Header master card
  const avImg = document.getElementById('masterStatsAvatarImg');
  const avFallback = document.getElementById('masterStatsAvatarFallback');
  const nameEl = document.getElementById('masterStatsName');
  const roleEl = document.getElementById('masterStatsRole');
  const salonEl = document.getElementById('masterStatsSalon');

  if (nameEl) nameEl.textContent = `${master.name} ${master.lastName || ''}`.trim();
  if (roleEl) roleEl.textContent = master.role_title || 'Специалист';
  if (salonEl) salonEl.textContent = `Салон: ${master.salonName || 'Студия'}`;

  if (avImg && avFallback) {
    if (master.avatar_url) {
      avImg.src = master.avatar_url;
      avImg.classList.remove('hidden');
      avFallback.classList.add('hidden');
    } else {
      avImg.src = '';
      avImg.classList.add('hidden');
      avFallback.classList.remove('hidden');
    }
  }

  // Chart configuration according to requirement:
  // за день: Часы
  // за неделю: Дни
  // за месяц: Недели
  // за год: Месяцы
  let columns = [];
  let totalAppts = 0;
  let totalRevenue = 0;

  if (period === 'day') {
    columns = [
      { label: '09:00', count: 1 },
      { label: '11:00', count: 2 },
      { label: '13:00', count: 1 },
      { label: '15:00', count: 3 },
      { label: '17:00', count: 2 },
      { label: '19:00', count: 1 },
      { label: '21:00', count: 0 }
    ];
  } else if (period === 'week') {
    columns = [
      { label: 'Пн', count: 4 },
      { label: 'Вт', count: 5 },
      { label: 'Ср', count: 3 },
      { label: 'Чт', count: 6 },
      { label: 'Пт', count: 7 },
      { label: 'Сб', count: 8 },
      { label: 'Вс', count: 5 }
    ];
  } else if (period === 'month') {
    columns = [
      { label: '1-я нед', count: 24 },
      { label: '2-я нед', count: 28 },
      { label: '3-я нед', count: 31 },
      { label: '4-я нед', count: 29 }
    ];
  } else if (period === 'year') {
    columns = [
      { label: 'Янв', count: 82 },
      { label: 'Фев', count: 94 },
      { label: 'Мар', count: 110 },
      { label: 'Апр', count: 105 },
      { label: 'Май', count: 118 },
      { label: 'Июн', count: 124 },
      { label: 'Июл', count: 130 },
      { label: 'Авг', count: 128 },
      { label: 'Сен', count: 115 },
      { label: 'Окт', count: 108 },
      { label: 'Ноя', count: 96 },
      { label: 'Дек', count: 140 }
    ];
  }

  totalAppts = columns.reduce((acc, c) => acc + c.count, 0);
  totalRevenue = totalAppts * 2400;

  const totalEl = document.getElementById('masterStatsTotalAppts');
  const revenueEl = document.getElementById('masterStatsTotalRevenue');
  const chartContainer = document.getElementById('masterStatsChartContainer');
  const periodLabel = document.getElementById('masterStatsPeriodLabel');

  if (totalEl) totalEl.textContent = `${totalAppts}`;
  if (revenueEl) revenueEl.textContent = `${totalRevenue.toLocaleString('ru-RU')} ₽`;
  if (periodLabel) {
    const pNames = { day: 'за сегодня', week: 'за неделю', month: 'за месяц', year: 'за год' };
    periodLabel.textContent = pNames[period] || '';
  }

  if (chartContainer) {
    const maxVal = Math.max(...columns.map(c => c.count), 1);
    chartContainer.innerHTML = columns.map((col, idx) => {
      const heightPercent = Math.max(12, Math.round((col.count / maxVal) * 100));
      const isPeak = col.count === maxVal;
      return `
        <div class="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer active:scale-95 transition-all">
          <span class="text-[10px] font-bold text-slate-500 mb-1 transition-all ${isPeak ? 'text-primary font-extrabold' : ''}">${col.count}</span>
          <div class="w-full max-w-[28px] rounded-t-xl transition-all duration-500 ${isPeak ? 'bg-gradient-to-t from-primary to-indigo-500 shadow-sm' : 'bg-primary-fixed hover:bg-primary-fixed/80'}"
            style="height: ${heightPercent}%;"></div>
          <span class="text-[9px] font-semibold text-slate-400 mt-2 truncate max-w-full text-center">${col.label}</span>
        </div>
      `;
    }).join('');
  }
}

// ------------------------------------------
// PAGE 2: MASTER APPOINTMENTS (Google Calendar Style)
// ------------------------------------------
let currentMasterApptDateKey = getFormattedDateKey(0);

function selectMasterApptDate(dateKey) {
  currentMasterApptDateKey = dateKey;
  renderMasterAppointments(dateKey);
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  } catch (e) { }
}

function renderMasterAppointments(dateKey = currentMasterApptDateKey) {
  const allAppts = getMasterAppointments();
  const dateStrip = document.getElementById('masterApptsDateStrip');
  const timelineContainer = document.getElementById('masterApptsTimelineContainer');
  const countBadge = document.getElementById('masterApptsTodayCountBadge');

  // 1. Build Google Calendar Day Strip (7 days)
  const daysList = [
    { key: getFormattedDateKey(0), title: 'Сегодня', sub: getFormattedDateDisplay(0) },
    { key: getFormattedDateKey(1), title: 'Завтра', sub: getFormattedDateDisplay(1) },
    { key: getFormattedDateKey(2), title: getDayOfWeekName(2), sub: getFormattedDateDisplay(2) },
    { key: getFormattedDateKey(3), title: getDayOfWeekName(3), sub: getFormattedDateDisplay(3) },
    { key: getFormattedDateKey(4), title: getDayOfWeekName(4), sub: getFormattedDateDisplay(4) },
    { key: getFormattedDateKey(5), title: getDayOfWeekName(5), sub: getFormattedDateDisplay(5) },
    { key: getFormattedDateKey(6), title: getDayOfWeekName(6), sub: getFormattedDateDisplay(6) }
  ];

  if (dateStrip) {
    dateStrip.innerHTML = daysList.map(d => {
      const isSelected = (d.key === dateKey);
      const dayApptsCount = allAppts.filter(a => a.date === d.key).length;
      return `
        <button type="button" onclick="selectMasterApptDate('${d.key}')"
          class="flex flex-col items-center justify-center min-w-[70px] py-2 px-2 rounded-2xl border transition-all active:scale-95 shrink-0 relative ${isSelected ? 'bg-primary text-white border-primary shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}">
          <span class="text-[9px] uppercase font-bold tracking-tight ${isSelected ? 'text-white/80' : 'text-slate-400'}">${d.title}</span>
          <span class="text-xs font-extrabold mt-0.5">${d.sub.split(' ')[0]}</span>
          ${dayApptsCount > 0 ? `<span class="w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-primary'} mt-1"></span>` : `<span class="w-1.5 h-1.5 rounded-full bg-transparent mt-1"></span>`}
        </button>
      `;
    }).join('');
  }

  // 2. Filter appointments for this date
  const dayAppts = allAppts.filter(a => a.date === dateKey);
  if (countBadge) countBadge.textContent = `${dayAppts.length} записей`;

  // 3. Render Google Calendar Timeline
  if (timelineContainer) {
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];

    timelineContainer.innerHTML = hours.map(hour => {
      const apptAtHour = dayAppts.find(a => a.time.startsWith(hour.substring(0, 2)));
      return `
        <div class="flex items-start gap-3 py-2 border-b border-slate-100 min-h-[70px]">
          <span class="text-xs font-bold text-slate-400 w-12 shrink-0 pt-1">${hour}</span>
          <div class="flex-1 min-w-0">
            ${apptAtHour ? `
              <div onclick="openMasterAppointmentDetails('${apptAtHour.id}')"
                class="p-3 rounded-2xl bg-gradient-to-r from-primary-fixed/80 to-indigo-50 border-l-4 border-primary shadow-xs active:scale-[0.98] transition-all cursor-pointer flex flex-col gap-1">
                <div class="flex items-center justify-between">
                  <span class="text-xs font-extrabold text-primary flex items-center gap-1">
                    <span class="material-symbols-outlined text-[14px]">schedule</span>
                    <span>${apptAtHour.time} – ${apptAtHour.timeEnd || '12:30'}</span>
                  </span>
                  <span class="text-xs font-bold text-on-surface bg-white/90 px-2 py-0.5 rounded-lg border border-slate-200/50 shadow-2xs">${(apptAtHour.price || 0).toLocaleString('ru-RU')} ₽</span>
                </div>
                <h4 class="text-xs font-bold text-on-surface truncate">${apptAtHour.service}</h4>
                <div class="flex items-center gap-1.5 mt-0.5 text-slate-600">
                  <div class="w-5 h-5 rounded-full overflow-hidden bg-white border border-slate-200 flex items-center justify-center shrink-0 text-primary text-[10px] font-bold">
                    ${apptAtHour.client.avatar ? `<img src="${apptAtHour.client.avatar}" class="w-full h-full object-cover" />` : apptAtHour.client.name.substring(0, 1)}
                  </div>
                  <span class="text-[11px] font-medium text-slate-700 truncate">${apptAtHour.client.name}</span>
                  <span class="text-[10px] text-slate-400">(${apptAtHour.client.telegram})</span>
                </div>
              </div>
            ` : `
              <div class="h-8 border border-dashed border-slate-200/60 rounded-xl flex items-center px-3 text-[11px] text-slate-300">
                Свободное время
              </div>
            `}
          </div>
        </div>
      `;
    }).join('');
  }
}

// Open Appointment Details Modal with Client Plaque
let currentViewingAppointment = null;

function openMasterAppointmentDetails(apptId) {
  const appts = getMasterAppointments();
  const found = appts.find(a => a.id === apptId);
  if (!found) return;
  currentViewingAppointment = found;

  const dateEl = document.getElementById('masterApptModalDate');
  const timeEl = document.getElementById('masterApptModalTime');
  const svcEl = document.getElementById('masterApptModalService');
  const priceEl = document.getElementById('masterApptModalPrice');
  const clientNameEl = document.getElementById('masterApptModalClientName');
  const clientTgEl = document.getElementById('masterApptModalClientTg');
  const clientPhoneEl = document.getElementById('masterApptModalClientPhone');
  const clientAvatarImg = document.getElementById('masterApptModalClientAvatarImg');
  const clientAvatarFallback = document.getElementById('masterApptModalClientAvatarFallback');

  if (dateEl) dateEl.textContent = found.dateDisplay || found.date;
  if (timeEl) timeEl.textContent = `${found.time} – ${found.timeEnd || '12:30'}`;
  if (svcEl) svcEl.textContent = found.service;
  if (priceEl) priceEl.textContent = `${(found.price || 0).toLocaleString('ru-RU')} ₽`;

  if (found.client) {
    if (clientNameEl) clientNameEl.textContent = found.client.name;
    if (clientTgEl) clientTgEl.textContent = found.client.telegram || '@telegram';
    if (clientPhoneEl) clientPhoneEl.textContent = found.client.phone || '+7 (999) 000-00-00';
    if (clientAvatarImg && clientAvatarFallback) {
      if (found.client.avatar) {
        clientAvatarImg.src = found.client.avatar;
        clientAvatarImg.classList.remove('hidden');
        clientAvatarFallback.classList.add('hidden');
      } else {
        clientAvatarImg.src = '';
        clientAvatarImg.classList.add('hidden');
        clientAvatarFallback.classList.remove('hidden');
        clientAvatarFallback.textContent = found.client.name.substring(0, 1);
      }
    }
  }

  const modal = document.getElementById('masterAppointmentDetailsModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  } catch (e) { }
}

function closeMasterAppointmentDetailsModal() {
  const modal = document.getElementById('masterAppointmentDetailsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Open Full Screen Client Profile
function openMasterClientProfileFromAppt() {
  if (!currentViewingAppointment || !currentViewingAppointment.client) return;
  closeMasterAppointmentDetailsModal();
  openMasterClientProfile(currentViewingAppointment.client);
}

function openMasterClientProfile(client) {
  const nameEl = document.getElementById('masterClientProfileName');
  const tgEl = document.getElementById('masterClientProfileTg');
  const phoneEl = document.getElementById('masterClientProfilePhone');
  const avImg = document.getElementById('masterClientProfileAvatarImg');
  const avFallback = document.getElementById('masterClientProfileAvatarFallback');
  const visitsHistoryContainer = document.getElementById('masterClientProfileVisitsHistory');
  const visitsEmptyContainer = document.getElementById('masterClientProfileVisitsEmpty');
  const writeBtn = document.getElementById('masterClientProfileWriteBtn');
  const callBtn = document.getElementById('masterClientProfileCallBtn');

  if (nameEl) nameEl.textContent = client.name;
  if (tgEl) tgEl.textContent = client.telegram || '@telegram_user';
  if (phoneEl) phoneEl.textContent = client.phone || '+7 (999) 000-00-00';

  if (avImg && avFallback) {
    if (client.avatar) {
      avImg.src = client.avatar;
      avImg.classList.remove('hidden');
      avFallback.classList.add('hidden');
    } else {
      avImg.src = '';
      avImg.classList.add('hidden');
      avFallback.classList.remove('hidden');
      avFallback.textContent = client.name ? client.name.substring(0, 1).toUpperCase() : 'К';
    }
  }

  // Telegram action button
  if (writeBtn) {
    const cleanTg = (client.telegram || '').replace('@', '').trim();
    writeBtn.onclick = () => {
      if (cleanTg) {
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(`https://t.me/${cleanTg}`);
        } else {
          window.open(`https://t.me/${cleanTg}`, '_blank');
        }
      } else {
        showToast('У клиента не указан Telegram username');
      }
    };
  }

  // Phone call action button
  if (callBtn) {
    const cleanPhone = (client.phone || '').replace(/[^0-9+]/g, '');
    callBtn.onclick = () => {
      if (cleanPhone) window.open(`tel:${cleanPhone}`);
    };
  }

  // Client Visits History (пустая по умолчанию, если визитов нет)
  const history = Array.isArray(client.history) ? client.history : [];
  if (history.length > 0) {
    if (visitsEmptyContainer) visitsEmptyContainer.classList.add('hidden');
    if (visitsHistoryContainer) {
      visitsHistoryContainer.classList.remove('hidden');
      visitsHistoryContainer.innerHTML = history.map(item => `
        <div class="p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div class="flex flex-col">
            <span class="text-xs font-bold text-on-surface">${item.service}</span>
            <span class="text-[10px] text-slate-400 mt-0.5">${item.date}</span>
          </div>
          <div class="flex flex-col items-end">
            <span class="text-xs font-bold text-primary">${(item.price || 0).toLocaleString('ru-RU')} ₽</span>
            <span class="text-[9px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full mt-0.5">${item.status || 'Завершен'}</span>
          </div>
        </div>
      `).join('');
    }
  } else {
    if (visitsHistoryContainer) {
      visitsHistoryContainer.classList.add('hidden');
      visitsHistoryContainer.innerHTML = '';
    }
    if (visitsEmptyContainer) visitsEmptyContainer.classList.remove('hidden');
  }

  const modal = document.getElementById('masterClientProfileModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeMasterClientProfileModal() {
  const modal = document.getElementById('masterClientProfileModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// ------------------------------------------
// PAGE 3: MASTER WORK SCHEDULE (Календарь работы и добавление окошек)
// ------------------------------------------
let currentMasterScheduleDateKey = getFormattedDateKey(0);

function selectMasterScheduleDate(dateKey) {
  currentMasterScheduleDateKey = dateKey;
  renderMasterSchedule(dateKey);
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.selectionChanged();
    }
  } catch (e) { }
}

function renderMasterSchedule(dateKey = currentMasterScheduleDateKey) {
  const slotsMap = getMasterScheduleSlots();
  const dateSlots = slotsMap[dateKey] || [];
  const dateStrip = document.getElementById('masterScheduleDateStrip');
  const slotsGrid = document.getElementById('masterScheduleSlotsGrid');
  const curDateLabel = document.getElementById('masterScheduleCurrentDateLabel');

  if (curDateLabel) {
    const daysOffset = Math.round((new Date(dateKey) - new Date(getFormattedDateKey(0))) / (1000 * 60 * 60 * 24));
    curDateLabel.textContent = (daysOffset === 0 ? 'Сегодня, ' : (daysOffset === 1 ? 'Завтра, ' : '')) + getFormattedDateDisplay(daysOffset);
  }

  // 1. Date strip
  const daysList = [
    { key: getFormattedDateKey(0), title: 'Сегодня', sub: getFormattedDateDisplay(0) },
    { key: getFormattedDateKey(1), title: 'Завтра', sub: getFormattedDateDisplay(1) },
    { key: getFormattedDateKey(2), title: getDayOfWeekName(2), sub: getFormattedDateDisplay(2) },
    { key: getFormattedDateKey(3), title: getDayOfWeekName(3), sub: getFormattedDateDisplay(3) },
    { key: getFormattedDateKey(4), title: getDayOfWeekName(4), sub: getFormattedDateDisplay(4) },
    { key: getFormattedDateKey(5), title: getDayOfWeekName(5), sub: getFormattedDateDisplay(5) },
    { key: getFormattedDateKey(6), title: getDayOfWeekName(6), sub: getFormattedDateDisplay(6) }
  ];

  if (dateStrip) {
    dateStrip.innerHTML = daysList.map(d => {
      const isSelected = (d.key === dateKey);
      const sCount = (slotsMap[d.key] || []).length;
      return `
        <button type="button" onclick="selectMasterScheduleDate('${d.key}')"
          class="flex flex-col items-center justify-center min-w-[70px] py-2 px-2 rounded-2xl border transition-all active:scale-95 shrink-0 ${isSelected ? 'bg-primary text-white border-primary shadow-xs' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'}">
          <span class="text-[9px] uppercase font-bold tracking-tight ${isSelected ? 'text-white/80' : 'text-slate-400'}">${d.title}</span>
          <span class="text-xs font-extrabold mt-0.5">${d.sub.split(' ')[0]}</span>
          <span class="text-[9px] mt-1 ${isSelected ? 'text-white/90' : 'text-primary font-bold'}">${sCount} ок.</span>
        </button>
      `;
    }).join('');
  }

  // 2. Slots display with Google Calendar timeline
  if (slotsGrid) {
    if (dateSlots.length === 0) {
      slotsGrid.innerHTML = `
        <div class="col-span-full py-8 flex flex-col items-center justify-center text-center text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
          <span class="material-symbols-outlined text-[32px] text-slate-300 mb-1">event_busy</span>
          <span class="text-xs font-semibold text-slate-600">На этот день окошек нет</span>
          <p class="text-[11px] text-slate-400 mt-0.5 mb-3">Добавьте доступные часы для клиентов</p>
          <button type="button" onclick="openMasterAddSlotModal()"
            class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold active:scale-95 transition-all flex items-center gap-1 shadow-xs">
            <span class="material-symbols-outlined text-[16px]">add</span>
            <span>Добавить окошко</span>
          </button>
        </div>
      `;
    } else {
      slotsGrid.innerHTML = dateSlots.map(timeStr => `
        <div class="p-3 rounded-2xl bg-white border border-slate-200/90 shadow-2xs flex items-center justify-between group active:scale-95 transition-all">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-primary-fixed/50 text-primary flex items-center justify-center shrink-0">
              <span class="material-symbols-outlined text-[17px]">schedule</span>
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-bold text-on-surface">${timeStr}</span>
              <span class="text-[10px] text-emerald-600 font-semibold">Доступно для записи</span>
            </div>
          </div>
          <button type="button" onclick="deleteMasterSlot('${timeStr}')" title="Удалить окошко"
            class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors">
            <span class="material-symbols-outlined text-[16px]">close</span>
          </button>
        </div>
      `).join('');
    }
  }
}

function openMasterAddSlotModal() {
  const modal = document.getElementById('masterAddSlotModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeMasterAddSlotModal() {
  const modal = document.getElementById('masterAddSlotModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function selectPresetSlotTime(timeStr) {
  const input = document.getElementById('masterCustomSlotInput');
  if (input) input.value = timeStr;
}

function saveMasterNewSlot() {
  const input = document.getElementById('masterCustomSlotInput');
  const timeStr = input ? input.value.trim() : '';

  if (!timeStr || !/^\d{1,2}:\d{2}$/.test(timeStr)) {
    showToast('Введите корректное время (например: 14:30) ⚠️');
    return;
  }

  const slotsMap = getMasterScheduleSlots();
  if (!Array.isArray(slotsMap[currentMasterScheduleDateKey])) {
    slotsMap[currentMasterScheduleDateKey] = [];
  }

  if (slotsMap[currentMasterScheduleDateKey].includes(timeStr)) {
    showToast('Такое окошко уже добавлено ⚠️');
    return;
  }

  slotsMap[currentMasterScheduleDateKey].push(timeStr);
  slotsMap[currentMasterScheduleDateKey].sort();
  saveMasterScheduleSlots(slotsMap);

  // Sync to masterData.slots
  const mData = getMasterData();
  mData.slots = slotsMap[currentMasterScheduleDateKey];
  saveMasterData(mData);

  closeMasterAddSlotModal();
  renderMasterSchedule(currentMasterScheduleDateKey);
  showToast(`Окошко ${timeStr} успешно добавлено! ⏰`);
}

function deleteMasterSlot(timeStr) {
  const slotsMap = getMasterScheduleSlots();
  if (Array.isArray(slotsMap[currentMasterScheduleDateKey])) {
    slotsMap[currentMasterScheduleDateKey] = slotsMap[currentMasterScheduleDateKey].filter(t => t !== timeStr);
    saveMasterScheduleSlots(slotsMap);

    const mData = getMasterData();
    mData.slots = slotsMap[currentMasterScheduleDateKey];
    saveMasterData(mData);

    renderMasterSchedule(currentMasterScheduleDateKey);
    showToast(`Окошко ${timeStr} удалено 🗑️`);
  }
}

// ------------------------------------------
// PAGE 4: MASTER PROFILE & SERVICES
// ------------------------------------------
function renderMasterProfile() {
  const master = getMasterData();

  const nameInput = document.getElementById('masterProfileNameInput');
  const lastNameInput = document.getElementById('masterProfileLastNameInput');
  const roleInput = document.getElementById('masterProfileRoleInput');
  const expInput = document.getElementById('masterProfileExpInput');
  const bioInput = document.getElementById('masterProfileBioInput');
  const salonNameText = document.getElementById('masterProfileSalonName');
  const salonAddrText = document.getElementById('masterProfileSalonAddress');
  const avImg = document.getElementById('masterProfileAvatarImg');
  const avFallback = document.getElementById('masterProfileAvatarFallback');
  const notifyToggle = document.getElementById('masterNotifyToggle');

  if (nameInput) nameInput.value = master.name || '';
  if (lastNameInput) lastNameInput.value = master.lastName || '';
  if (roleInput) roleInput.value = master.role_title || '';
  if (expInput) expInput.value = master.experience || '3 года';
  if (bioInput) bioInput.value = master.bio || '';
  if (salonNameText) salonNameText.textContent = master.salonName || 'Салон красоты';
  if (salonAddrText) salonAddrText.textContent = master.salonAddress || 'Адрес уточняется';

  if (notifyToggle) {
    notifyToggle.checked = (master.notificationsEnabled !== false);
  }

  if (avImg && avFallback) {
    if (master.avatar_url) {
      avImg.src = master.avatar_url;
      avImg.classList.remove('hidden');
      avFallback.classList.add('hidden');
    } else {
      avImg.src = '';
      avImg.classList.add('hidden');
      avFallback.classList.remove('hidden');
    }
  }

  renderMasterServices();
}

function saveMasterProfileInfo() {
  const data = getMasterData();
  const nameInput = document.getElementById('masterProfileNameInput');
  const lastNameInput = document.getElementById('masterProfileLastNameInput');
  const roleInput = document.getElementById('masterProfileRoleInput');
  const expInput = document.getElementById('masterProfileExpInput');
  const bioInput = document.getElementById('masterProfileBioInput');

  if (nameInput && nameInput.value.trim()) data.name = nameInput.value.trim();
  if (lastNameInput) data.lastName = lastNameInput.value.trim();
  if (roleInput && roleInput.value.trim()) data.role_title = roleInput.value.trim();
  if (expInput && expInput.value.trim()) data.experience = expInput.value.trim();
  if (bioInput) data.bio = bioInput.value.trim();

  saveMasterData(data);
  showToast('Профиль мастера сохранен! ✅');
}

function handleMasterProfileAvatarUploaded(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const dataUrl = e.target.result;
    const data = getMasterData();
    data.avatar_url = dataUrl;
    saveMasterData(data);
    renderMasterProfile();
    showToast('Аватар мастера обновлен! 📸');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function toggleMasterNotifications(enabled) {
  const data = getMasterData();
  data.notificationsEnabled = !!enabled;
  saveMasterData(data);
  showToast(enabled ? 'Уведомления о записях включены 🔔' : 'Уведомления о записях отключены 🔕');
}

// ------------------------------------------
// SERVICES MANAGEMENT & SYNCHRONIZATION WITH SALON
// ------------------------------------------
function getMasterServices() {
  const master = getMasterData();
  const ownServices = Array.isArray(master.services) ? master.services : [];

  // Also pull in any services from parent salon assigned to this master
  const proSalon = (typeof getProSalonData === 'function') ? getProSalonData() : null;
  const salonServices = (proSalon && Array.isArray(proSalon.services)) ? proSalon.services : [];

  const combined = [...ownServices];
  salonServices.forEach(s => {
    const isAssigned = Array.isArray(s.masterIds) && (
      s.masterIds.includes(master.id) ||
      (master.name && s.masterIds.includes(master.name)) ||
      s.masterIds.some(id => String(id) === String(master.id))
    );
    if (isAssigned && !combined.some(c => c.id === s.id || c.name === s.name)) {
      combined.push(s);
    }
  });

  return combined;
}

function renderMasterServices() {
  const container = document.getElementById('masterProfileServicesList');
  if (!container) return;
  const services = getMasterServices();

  if (services.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-xs text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
        У вас пока нет добавленных услуг. Добавьте первую услугу кнопкой выше!
      </div>
    `;
    return;
  }

  container.innerHTML = services.map(svc => `
    <div class="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs flex items-center justify-between">
      <div class="flex flex-col min-w-0 pr-2">
        <span class="text-xs font-bold text-on-surface truncate">${svc.name}</span>
        <span class="text-[11px] text-slate-400 mt-0.5 truncate">${svc.desc || `~${svc.duration || 60} мин`}</span>
        <span class="text-xs font-bold text-primary mt-1">${(svc.price || 0).toLocaleString('ru-RU')} ₽</span>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button type="button" onclick="openMasterEditServiceModal('${svc.id}')" title="Редактировать"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors">
          <span class="material-symbols-outlined text-[16px]">edit</span>
        </button>
        <button type="button" onclick="deleteMasterService('${svc.id}')" title="Удалить услугу"
          class="w-8 h-8 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-400 flex items-center justify-center transition-colors">
          <span class="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    </div>
  `).join('');
}

let editingMasterServiceId = null;

function openAddMasterServiceModal() {
  editingMasterServiceId = null;
  const titleEl = document.getElementById('masterServiceModalTitle');
  const nameInput = document.getElementById('masterServiceNameInput');
  const priceInput = document.getElementById('masterServicePriceInput');
  const durInput = document.getElementById('masterServiceDurationInput');
  const descInput = document.getElementById('masterServiceDescInput');

  if (titleEl) titleEl.textContent = 'Добавить услугу';
  if (nameInput) nameInput.value = '';
  if (priceInput) priceInput.value = '';
  if (durInput) durInput.value = '60';
  if (descInput) descInput.value = '';

  const modal = document.getElementById('masterAddServiceModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function openMasterEditServiceModal(serviceId) {
  const services = getMasterServices();
  const svc = services.find(s => s.id === serviceId);
  if (!svc) return;

  editingMasterServiceId = serviceId;
  const titleEl = document.getElementById('masterServiceModalTitle');
  const nameInput = document.getElementById('masterServiceNameInput');
  const priceInput = document.getElementById('masterServicePriceInput');
  const durInput = document.getElementById('masterServiceDurationInput');
  const descInput = document.getElementById('masterServiceDescInput');

  if (titleEl) titleEl.textContent = 'Редактировать услугу';
  if (nameInput) nameInput.value = svc.name || '';
  if (priceInput) priceInput.value = svc.price || '';
  if (durInput) durInput.value = svc.duration || 60;
  if (descInput) descInput.value = svc.desc || '';

  const modal = document.getElementById('masterAddServiceModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeMasterAddServiceModal() {
  const modal = document.getElementById('masterAddServiceModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function saveMasterService() {
  const nameInput = document.getElementById('masterServiceNameInput');
  const priceInput = document.getElementById('masterServicePriceInput');
  const durInput = document.getElementById('masterServiceDurationInput');
  const descInput = document.getElementById('masterServiceDescInput');

  const name = nameInput ? nameInput.value.trim() : '';
  const price = priceInput ? parseInt(priceInput.value, 10) || 0 : 0;
  const duration = durInput ? parseInt(durInput.value, 10) || 60 : 60;
  const desc = descInput ? descInput.value.trim() : '';

  if (!name) {
    showToast('Введите название услуги ⚠️');
    return;
  }

  const master = getMasterData();
  if (!Array.isArray(master.services)) master.services = [];

  const proSalon = (typeof getProSalonData === 'function') ? getProSalonData() : null;
  if (proSalon && !Array.isArray(proSalon.services)) proSalon.services = [];

  if (editingMasterServiceId) {
    // Edit existing service
    const idx = master.services.findIndex(s => s.id === editingMasterServiceId);
    if (idx !== -1) {
      master.services[idx].name = name;
      master.services[idx].price = price;
      master.services[idx].duration = duration;
      master.services[idx].desc = desc;
    }
    // Also update in parent salon if present
    if (proSalon) {
      const sIdx = proSalon.services.findIndex(s => s.id === editingMasterServiceId || s.name === name);
      if (sIdx !== -1) {
        proSalon.services[sIdx].name = name;
        proSalon.services[sIdx].price = price;
        proSalon.services[sIdx].duration = duration;
        proSalon.services[sIdx].desc = desc;
      }
    }
    showToast('Услуга обновлена и синхронизирована с салоном! ✅');
  } else {
    // Add new service
    const newSvc = {
      id: 'msvc_' + Date.now(),
      name,
      price,
      duration,
      desc,
      masterIds: [master.id]
    };
    master.services.push(newSvc);

    // Synchronize to parent salon
    if (proSalon) {
      const existingInSalon = proSalon.services.find(s => s.name === name);
      if (existingInSalon) {
        if (!Array.isArray(existingInSalon.masterIds)) existingInSalon.masterIds = [];
        if (!existingInSalon.masterIds.includes(master.id)) {
          existingInSalon.masterIds.push(master.id);
        }
      } else {
        proSalon.services.push({
          id: newSvc.id,
          name: newSvc.name,
          price: newSvc.price,
          duration: newSvc.duration,
          desc: newSvc.desc,
          masterIds: [master.id]
        });
      }
    }
    showToast('Новая услуга добавлена в ваш профиль и профиль салона! ✅');
  }

  saveMasterData(master);
  if (proSalon && typeof saveProSalonData === 'function') {
    saveProSalonData(proSalon);
  }

  closeMasterAddServiceModal();
  renderMasterServices();
}

function deleteMasterService(serviceId) {
  const master = getMasterData();
  master.services = (master.services || []).filter(s => s.id !== serviceId);
  saveMasterData(master);

  // Unlink from salon
  const proSalon = (typeof getProSalonData === 'function') ? getProSalonData() : null;
  if (proSalon && Array.isArray(proSalon.services)) {
    proSalon.services.forEach(s => {
      if (s.id === serviceId && Array.isArray(s.masterIds)) {
        s.masterIds = s.masterIds.filter(id => id !== master.id && id !== master.name);
      }
    });
    if (typeof saveProSalonData === 'function') {
      saveProSalonData(proSalon);
    }
  }

  renderMasterServices();
  showToast('Услуга удалена 🗑️');
}

// ------------------------------------------
// PRO INVITE LINK HANDLERS (Добавление только по ссылке)
// ------------------------------------------
function copyMasterInviteLink() {
  if (typeof getMasterInviteLink === 'function') {
    const link = getMasterInviteLink();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(link).then(() => {
        showToast('Ссылка приглашения скопирована! 📋');
      }).catch(() => {
        prompt('Скопируйте ссылку приглашения:', link);
      });
    } else {
      prompt('Скопируйте ссылку приглашения:', link);
    }
  }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
  initMasterSubsystem();
});

// Expose functions globally
window.getMasterData = getMasterData;
window.saveMasterData = saveMasterData;
window.switchToMasterMode = switchToMasterMode;
window.confirmExitMasterMode = confirmExitMasterMode;
window.closeMasterExitConfirmModal = closeMasterExitConfirmModal;
window.exitMasterModeToClient = exitMasterModeToClient;
window.setMasterStatsPeriod = setMasterStatsPeriod;
window.renderMasterStats = renderMasterStats;
window.selectMasterApptDate = selectMasterApptDate;
window.renderMasterAppointments = renderMasterAppointments;
window.openMasterAppointmentDetails = openMasterAppointmentDetails;
window.closeMasterAppointmentDetailsModal = closeMasterAppointmentDetailsModal;
window.openMasterClientProfileFromAppt = openMasterClientProfileFromAppt;
window.openMasterClientProfile = openMasterClientProfile;
window.closeMasterClientProfileModal = closeMasterClientProfileModal;
window.selectMasterScheduleDate = selectMasterScheduleDate;
window.renderMasterSchedule = renderMasterSchedule;
window.openMasterAddSlotModal = openMasterAddSlotModal;
window.closeMasterAddSlotModal = closeMasterAddSlotModal;
window.selectPresetSlotTime = selectPresetSlotTime;
window.saveMasterNewSlot = saveMasterNewSlot;
window.deleteMasterSlot = deleteMasterSlot;
window.renderMasterProfile = renderMasterProfile;
window.saveMasterProfileInfo = saveMasterProfileInfo;
window.handleMasterProfileAvatarUploaded = handleMasterProfileAvatarUploaded;
window.toggleMasterNotifications = toggleMasterNotifications;
window.renderMasterServices = renderMasterServices;
window.openAddMasterServiceModal = openAddMasterServiceModal;
window.openMasterEditServiceModal = openMasterEditServiceModal;
window.closeMasterAddServiceModal = closeMasterAddServiceModal;
window.saveMasterService = saveMasterService;
window.deleteMasterService = deleteMasterService;
window.checkAndRenderMasterPanelButton = checkAndRenderMasterPanelButton;
window.copyMasterInviteLink = copyMasterInviteLink;
