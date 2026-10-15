// ==========================================
// OKOSHKO PRO BUSINESS PANEL LOGIC & STORE
// ==========================================

const PRO_DATA_STORAGE_KEY = 'okoshko_pro_salon_data_v1';
const PRO_APPOINTMENTS_STORAGE_KEY = 'okoshko_pro_clients_appointments_v1';
const BOT_LINK = 'https://t.me/okooshko_bot';

// Default initial state for PRO Salon (Beauty Studio as baseline partner)
const DEFAULT_PRO_SALON = {
  name: 'Beauty Studio',
  city: 'Москва',
  cityKey: 'moscow',
  address: 'ул. Большая Садовая, 42 • м. Маяковская',
  phone: '+7 (999) 123-45-67',
  creatorTag: '@maximtepin',
  adminTag: '', // Не назначен по умолчанию
  notificationsEnabled: true,
  categoryText: 'Маникюр · Брови · Педикюр',
  rating: '4.9',
  reviewsCount: 148,
  avatarUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=300&q=80',
  coverUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
  services: [
    {
      id: 'bs_s1',
      name: 'Маникюр с покрытием гель-лак Luxio',
      category: 'Маникюр',
      desc: 'Снятие старого покрытия, аппаратный маникюр, выравнивание базой, цветное покрытие Luxio',
      price: 2500,
      duration: 90,
      masterIds: ['master_beauty_alina'],
      photos: ['https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80']
    },
    {
      id: 'bs_s2',
      name: 'Архитектура и окрашивание бровей',
      category: 'Ресницы & Брови',
      desc: 'Построение правильной формы, коррекция пинцетом/воском, стойкое окрашивание Levissime',
      price: 1800,
      duration: 60,
      masterIds: ['master_beauty_daria'],
      photos: ['https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=400&q=80']
    },
    {
      id: 'bs_s3',
      name: 'Smart-педикюр эстетический',
      category: 'Педикюр',
      desc: 'Аппаратная обработка стопы smart-дисками, пальчики, покрытие лечебным лаком',
      price: 2800,
      duration: 75,
      masterIds: ['master_beauty_alina'],
      photos: []
    },
    {
      id: 'bs_s4',
      name: 'Ремонт / Дизайн френч',
      category: 'Маникюр',
      desc: 'Укрепление акрилом или пудрой одного ногтя / французский дизайн',
      price: 400,
      duration: 20,
      masterIds: ['master_beauty_alina'],
      photos: []
    }
  ],
  masters: [
    {
      id: 'master_beauty_alina',
      name: 'Алина',
      lastName: 'Романова',
      role_title: 'Мастер аппаратного маникюра',
      experience: '5 лет',
      avatar_url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      portfolio_photos: [
        'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=400&q=80'
      ]
    },
    {
      id: 'master_beauty_daria',
      name: 'Дарья',
      lastName: 'Мельникова',
      role_title: 'Бровист-лэшмейкер',
      experience: '3 года',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      portfolio_photos: [
        'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=400&q=80'
      ]
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

  // Sync to Telegram CloudStorage across devices (PC <-> Mobile)
  try {
    if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
      window.Telegram.WebApp.CloudStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(data), (err, stored) => {
        if (!err && stored) {
          console.log('[PRO] Salon data synced to Telegram CloudStorage');
        }
      });
    }
  } catch (e) { }

  // Send update to Telegram bot backend (supports both sendData and direct Bot API for desktop/mobile clients)
  const updatePayload = {
    action: 'pro_salon_updated',
    salon_name: data.name,
    address: data.address,
    phone: data.phone,
    city: data.city,
    avatar_url: data.avatarUrl,
    cover_url: data.coverUrl,
    admin_tag: data.adminTag,
    creator_tag: data.creatorTag
  };

  try {
    if (window.Telegram?.WebApp?.sendData) {
      window.Telegram.WebApp.sendData(JSON.stringify(updatePayload));
    }
  } catch (e) {
    console.log('sendData not available or ignored by client:', e);
  }

  // Backup sync via Bot API for Telegram Desktop and Mobile when opened via MenuButton or direct URL
  try {
    const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
    const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
    if (userTgId && botToken) {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userTgId,
          text: JSON.stringify(updatePayload)
        })
      }).catch(err => console.warn('Direct Bot API sync error:', err));
    }
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

  // Sync appointments to Telegram CloudStorage across devices
  try {
    if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
      window.Telegram.WebApp.CloudStorage.setItem(PRO_APPOINTMENTS_STORAGE_KEY, JSON.stringify(appts), (err, stored) => {
        if (!err && stored) {
          console.log('[PRO] Appointments synced to Telegram CloudStorage');
        }
      });
    }
  } catch (e) { }

  renderProAppointments();
  renderProStats();
}

// Cross-device synchronization on launch from Telegram CloudStorage and URL params
function initProCloudSync() {
  // 1. Проверяем URL параметры (если WebApp открыт по кнопке от бота с параметрами салона)
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const urlAdminTag = urlParams.get('admin_tag');
    const urlSalonName = urlParams.get('salon_name');
    const urlAddress = urlParams.get('address');
    const urlPhone = urlParams.get('phone');
    const urlCity = urlParams.get('city');

    let needSave = false;
    const data = getProSalonData();

    if (urlAdminTag && data.adminTag !== urlAdminTag) {
      data.adminTag = urlAdminTag;
      needSave = true;
    }
    if (urlSalonName && data.name !== urlSalonName) {
      data.name = urlSalonName;
      needSave = true;
    }
    if (urlAddress && data.address !== urlAddress) {
      data.address = urlAddress;
      needSave = true;
    }
    if (urlPhone && data.phone !== urlPhone) {
      data.phone = urlPhone;
      needSave = true;
    }
    if (urlCity && data.city !== urlCity) {
      data.city = urlCity;
      needSave = true;
    }

    if (needSave) {
      saveProSalonData(data);
    }
  } catch (e) { }

  // 2. Синхронизация из CloudStorage Telegram
  try {
    if (window.Telegram?.WebApp?.CloudStorage?.getItems) {
      window.Telegram.WebApp.CloudStorage.getItems([PRO_DATA_STORAGE_KEY, PRO_APPOINTMENTS_STORAGE_KEY], (err, values) => {
        if (!err && values) {
          let updated = false;
          if (values[PRO_DATA_STORAGE_KEY]) {
            try {
              const cloudSalon = JSON.parse(values[PRO_DATA_STORAGE_KEY]);
              if (cloudSalon && typeof cloudSalon === 'object') {
                localStorage.setItem(PRO_DATA_STORAGE_KEY, values[PRO_DATA_STORAGE_KEY]);
                updated = true;
              }
            } catch (e) { }
          }
          if (values[PRO_APPOINTMENTS_STORAGE_KEY]) {
            try {
              const cloudAppts = JSON.parse(values[PRO_APPOINTMENTS_STORAGE_KEY]);
              if (Array.isArray(cloudAppts)) {
                localStorage.setItem(PRO_APPOINTMENTS_STORAGE_KEY, values[PRO_APPOINTMENTS_STORAGE_KEY]);
                updated = true;
              }
            } catch (e) { }
          }
          if (updated) {
            syncProSalonUI();
            if (typeof renderProAppointments === 'function') renderProAppointments();
            if (typeof renderProStats === 'function') renderProStats();
          }
        }
      });
    }
  } catch (e) { }
  // 3. Автоматический вход в бизнес-аккаунт, если перешли по кнопке «Войти в бизнес-аккаунт»
  try {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('pro_entry') === '1') {
      setTimeout(() => {
        if (typeof enterProMode === 'function') {
          enterProMode();
        }
      }, 250);
    }
  } catch (e) { }
}

// Auto-run sync on script initialization
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initProCloudSync);
  } else {
    initProCloudSync();
  }
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

  // City
  const citySubEl = document.getElementById('proProfileCitySub');
  const cityBadgeEl = document.getElementById('proProfileCityBadge');
  if (citySubEl) citySubEl.textContent = data.city || 'Москва';
  if (cityBadgeEl) cityBadgeEl.textContent = 'Изменить';

  // Address
  const addrEl = document.getElementById('proSalonAddress');
  const addrSubEl = document.getElementById('proProfileAddressSub');
  if (addrEl) addrEl.textContent = data.address;
  if (addrSubEl) addrSubEl.textContent = data.address;

  // Phone
  const phoneEl = document.getElementById('proProfilePhoneSub');
  if (phoneEl) phoneEl.textContent = data.phone || 'Не указан';

  // Creator Tag (Fixed)
  const creatorEl = document.getElementById('proProfileCreatorTag');
  if (creatorEl) {
    const userHandle = state.user?.username ? `@${state.user.username}` : (data.creatorTag || '@maximtepin');
    creatorEl.textContent = userHandle;
  }

  // Admin Tag (Optional, bound via link)
  const adminEl = document.getElementById('proProfileAdminSub');
  const adminBadge = document.getElementById('proAdminStatusBadge');
  const unbindBtn = document.getElementById('proAdminUnbindBtn');
  if (adminEl) {
    if (data.adminTag) {
      adminEl.textContent = data.adminTag;
      if (adminBadge) adminBadge.innerHTML = '<span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold">Привязан</span>';
      unbindBtn?.classList.remove('hidden');
    } else {
      adminEl.textContent = 'Не привязан (нажмите «Отправить ссылку»)';
      if (adminBadge) adminBadge.innerHTML = '<span class="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">Свободно</span>';
      unbindBtn?.classList.add('hidden');
    }
  }

  // Counts
  const svcCountEl = document.getElementById('proServicesCountBadge');
  if (svcCountEl) svcCountEl.textContent = `${data.services.length} услуг`;

  const mastersCountEl = document.getElementById('proMastersCountBadge');
  if (mastersCountEl) mastersCountEl.textContent = `${data.masters.length} мастеров`;

  // Notifications switch
  const notifToggle = document.getElementById('proTgNotificationsToggle');
  if (notifToggle) notifToggle.checked = !!data.notificationsEnabled;

  // Avatar & Cover
  const avatarImg = document.getElementById('proSalonAvatarImg');
  if (avatarImg && data.avatarUrl) avatarImg.src = data.avatarUrl;

  const coverImg = document.getElementById('proSalonCoverImg');
  if (coverImg && data.coverUrl) coverImg.src = data.coverUrl;
}

// ------------------------------------------
// PRO CITY SELECTOR
// ------------------------------------------
let isProCitySelection = false;

function openProCityModal() {
  isProCitySelection = true;
  openCityModal();
}

function handleProCitySelected(cityKey, cityName) {
  const data = getProSalonData();
  data.city = cityName;
  data.cityKey = cityKey;
  saveProSalonData(data);
  showToast(`Город изменен на ${cityName} ✓`);
  isProCitySelection = false;
}

function cyrillicToLatin(text) {
  if (!text) return 'salon';
  const map = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
    'я': 'ya'
  };
  return text.toLowerCase().split('').map(ch => map[ch] !== undefined ? map[ch] : ch)
    .join('')
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'salon';
}

// ------------------------------------------
// ADMIN INVITE LINK HANDLERS
// ------------------------------------------
function getAdminInviteLink() {
  const data = getProSalonData();
  const salonSlug = cyrillicToLatin(data.name || 'salon');
  // Point to https://t.me/okooshko_bot
  return `${BOT_LINK}?start=bind_admin_${salonSlug}`;
}

function sendAdminInviteLink() {
  const link = getAdminInviteLink();
  const text = `Привет! Приглашаю тебя стать администратором салона в приложении «Окошко» для управления записями и клиентами:\n${link}`;

  if (window.Telegram?.WebApp?.openTelegramLink) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Приглашение администратора салона в Okoshko PRO')}`;
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else if (navigator.share) {
    navigator.share({
      title: 'Приглашение администратора',
      text: text,
      url: link
    }).catch(() => copyAdminInviteLink());
  } else {
    copyAdminInviteLink();
  }
}

function copyAdminInviteLink() {
  const link = getAdminInviteLink();
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(() => {
      showToast('Ссылка на привязку скопирована 📋');
    }).catch(() => {
      prompt('Скопируйте ссылку администратора:', link);
    });
  } else {
    prompt('Скопируйте ссылку администратора:', link);
  }
  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  } catch (e) { }
}

function resetProAdminBinding() {
  const data = getProSalonData();
  data.adminTag = '';
  saveProSalonData(data);
  showToast('Администратор отвязан ✓');
}

// ------------------------------------------
// CONFIRMATION MODAL HELPER
// ------------------------------------------
let pendingProConfirmedAction = null;

function confirmProAction(title, desc, actionFn) {
  pendingProConfirmedAction = actionFn;
  const modal = document.getElementById('proConfirmModal');
  const tEl = document.getElementById('proConfirmTitle');
  const dEl = document.getElementById('proConfirmDesc');

  if (tEl) tEl.textContent = title;
  if (dEl) dEl.textContent = desc;

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeProConfirmModal() {
  const modal = document.getElementById('proConfirmModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  pendingProConfirmedAction = null;
}

function executeProConfirmedAction() {
  if (typeof pendingProConfirmedAction === 'function') {
    pendingProConfirmedAction();
  }
  closeProConfirmModal();
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
  const validationHint = document.getElementById('proFieldEditValidationHint');
  const data = getProSalonData();

  if (!modal || !input) return;

  if (validationHint) validationHint.classList.add('hidden');
  input.oninput = null;
  input.onkeydown = null;
  input.type = 'text';

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
    input.type = 'tel';
    input.value = data.phone || '';
    hint.textContent = 'Номер для звонков и клиентской связи';
    if (validationHint) {
      validationHint.classList.remove('hidden');
      validationHint.textContent = 'Введите 10 цифр номера (начиная после +7)';
    }

    input.oninput = function() {
      const formatted = formatPhoneNumber(this.value);
      this.value = formatted;
      const digits = this.value.replace(/\D/g, '').replace(/^[78]/, '');
      if (validationHint) {
        if (digits.length === 10) {
          validationHint.textContent = '✓ Номер введен полностью';
          validationHint.className = 'text-[11px] text-emerald-600 font-semibold px-1';
        } else {
          validationHint.textContent = `Осталось ввести ${10 - digits.length} цифр`;
          validationHint.className = 'text-[11px] text-slate-400 px-1';
        }
      }
    };
    input.onkeydown = function(e) {
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'];
      if (allowedKeys.includes(e.key) || e.ctrlKey || e.metaKey) return;
      if (!/^\d$/.test(e.key)) e.preventDefault();
    };
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

  if (activeProEditField === 'phone') {
    const digits = val.replace(/\D/g, '').replace(/^[78]/, '');
    if (digits.length < 10) {
      showToast('Пожалуйста, введите полный номер из 10 цифр ⚠️');
      input.focus();
      return;
    }
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
  }
  saveProSalonData(data);
  closeProFieldModal();
}

function toggleProNotifications(enabled) {
  const data = getProSalonData();
  data.notificationsEnabled = enabled;
  saveProSalonData(data);
  const msg = enabled ? 'Уведомления о записях включены 🔔' : 'Уведомления о записях отключены 🔕';
  showToast(msg);
}

// ------------------------------------------
// SALON AVATAR & COVER UPLOAD HANDLERS
// ------------------------------------------
function triggerSalonAvatarUpload() {
  document.getElementById('proSalonAvatarInput')?.click();
}

function handleSalonAvatarUploaded(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const data = getProSalonData();
    data.avatarUrl = base64;
    saveProSalonData(data);
    showToast('Аватарка салона обновлена 🖼️');
  };
  reader.readAsDataURL(file);
}

function triggerSalonCoverUpload() {
  document.getElementById('proSalonCoverInput')?.click();
}

function handleSalonCoverUploaded(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    const base64 = e.target.result;
    const data = getProSalonData();
    data.coverUrl = base64;
    saveProSalonData(data);
    showToast('Фоновое изображение обновлено 📸');
  };
  reader.readAsDataURL(file);
}

// ------------------------------------------
// PRO SERVICES MANAGEMENT
// ------------------------------------------
let uploadedServicePhotos = [];

function openProServicesListModal() {
  const modal = document.getElementById('proServicesListModal');
  if (!modal) return;
  renderProServicesList();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProServicesListModal() {
  const modal = document.getElementById('proServicesListModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openProAddServiceModal() {
  const modal = document.getElementById('proAddServiceModal');
  if (!modal) return;
  uploadedServicePhotos = [];
  renderServiceMastersSelection();
  renderServicePhotosPreview();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProAddServiceModal() {
  const modal = document.getElementById('proAddServiceModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Backward compatibility alias
function openProServicesModal() {
  openProServicesListModal();
}

function closeProServicesModal() {
  closeProServicesListModal();
}

function renderServiceMastersSelection() {
  const container = document.getElementById('newServiceMastersCheckboxes');
  if (!container) return;
  const data = getProSalonData();

  if (data.masters.length === 0) {
    container.innerHTML = '<span class="text-[11px] text-slate-400">Сначала добавьте мастеров</span>';
    return;
  }

  container.innerHTML = data.masters.map(m => `
    <label class="flex items-center gap-2 cursor-pointer py-0.5">
      <input type="checkbox" name="serviceMasterIds" value="${m.id}" class="accent-primary rounded" />
      <span class="text-xs text-on-surface font-medium">${m.name} ${m.lastName || ''}</span>
      <span class="text-[10px] text-slate-400">(${m.role_title})</span>
    </label>
  `).join('');
}

function handleServicePhotoUploaded(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedServicePhotos.push(e.target.result);
    renderServicePhotosPreview();
  };
  reader.readAsDataURL(file);
}

function renderServicePhotosPreview() {
  const container = document.getElementById('newServicePhotosPreview');
  if (!container) return;

  container.innerHTML = uploadedServicePhotos.map((src, idx) => `
    <div class="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-300 group">
      <img src="${src}" class="w-full h-full object-cover" />
      <button onclick="uploadedServicePhotos.splice(${idx}, 1); renderServicePhotosPreview();"
        class="absolute top-0 right-0 w-4 h-4 bg-black/60 text-white flex items-center justify-center text-[9px] rounded-bl-lg">✕</button>
    </div>
  `).join('');
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
        <div class="flex items-center gap-1.5">
          <span class="font-bold text-xs text-on-surface truncate">${svc.name}</span>
          ${svc.category ? `<span class="px-1.5 py-0.2 rounded-full bg-slate-200/60 text-slate-600 text-[9px] font-semibold">${svc.category}</span>` : ''}
        </div>
        <span class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">${svc.desc || ''}</span>
        <div class="flex items-center gap-2 mt-1">
          <span class="text-xs font-extrabold text-primary">${(svc.price || 0).toLocaleString('ru-RU')} ₽</span>
          <span class="text-[10px] text-slate-400">• ${svc.duration || 60} мин</span>
          ${svc.photos?.length ? `<span class="text-[10px] text-slate-400">📷 ${svc.photos.length} фото</span>` : ''}
        </div>
      </div>
      <button onclick="confirmProAction('Удалить услугу?', 'Вы действительно хотите удалить эту позицию из прайс-листа?', () => deleteProService(${idx}))"
        class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center shrink-0 active:scale-90 transition-transform">
        <span class="material-symbols-outlined text-[17px]">delete</span>
      </button>
    </div>
  `).join('');
}

function addProService() {
  const nameInput = document.getElementById('newServiceNameInput');
  const descInput = document.getElementById('newServiceDescInput');
  const catSelect = document.getElementById('newServiceCategorySelect');
  const priceInput = document.getElementById('newServicePriceInput');
  const durSelect = document.getElementById('newServiceDurationSelect');

  const name = nameInput?.value?.trim();
  const desc = descInput?.value?.trim() || '';
  const category = catSelect?.value || 'Маникюр';
  const price = parseInt(priceInput?.value || '0', 10);
  const dur = parseInt(durSelect?.value || '60', 10);

  if (!name || isNaN(price) || price <= 0) {
    showToast('Укажите название и корректную стоимость');
    return;
  }

  // Selected masters
  const masterCheckboxes = document.querySelectorAll('input[name="serviceMasterIds"]:checked');
  const masterIds = Array.from(masterCheckboxes).map(cb => cb.value);

  confirmProAction('Добавить услугу в каталог?', `Услуга «${name}» (${price} ₽) будет доступна клиентам при записи.`, () => {
    const data = getProSalonData();
    data.services.push({
      id: 'svc_' + Date.now(),
      name: name,
      desc: desc,
      category: category,
      price: price,
      duration: dur,
      masterIds: masterIds,
      photos: [...uploadedServicePhotos]
    });

    saveProSalonData(data);
    if (nameInput) nameInput.value = '';
    if (descInput) descInput.value = '';
    if (priceInput) priceInput.value = '';
    uploadedServicePhotos = [];
    renderServicePhotosPreview();
    renderProServicesList();
    closeProAddServiceModal();
    openProServicesListModal();
    showToast('Услуга успешно добавлена 💅');
  });
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
// PRO MASTERS MANAGEMENT
// ------------------------------------------
let uploadedMasterPortfolio = [];
let uploadedMasterAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';

function openProMastersListModal() {
  const modal = document.getElementById('proMastersListModal');
  if (!modal) return;
  renderProMastersList();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProMastersListModal() {
  const modal = document.getElementById('proMastersListModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function openProAddMasterModal() {
  const modal = document.getElementById('proAddMasterModal');
  if (!modal) return;
  uploadedMasterPortfolio = [];
  uploadedMasterAvatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
  const img = document.getElementById('newMasterAvatarPreviewImg');
  if (img) img.src = uploadedMasterAvatar;
  renderMasterPortfolioPreview();
  modal.classList.remove('hidden');
  modal.classList.add('flex');
}

function closeProAddMasterModal() {
  const modal = document.getElementById('proAddMasterModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

// Backward compatibility aliases
function openProMastersModal() {
  openProMastersListModal();
}

function closeProMastersModal() {
  closeProMastersListModal();
}

function getMasterInviteLink(masterName = '') {
  const data = getProSalonData();
  const salonSlug = cyrillicToLatin(data.name || 'salon');
  const masterSlug = cyrillicToLatin(masterName || 'spec');
  return `${BOT_LINK}?start=bind_master_${salonSlug}_${masterSlug}`;
}

function sendMasterInviteLink(masterName = '') {
  const link = getMasterInviteLink(masterName);
  const text = `Привет! Приглашаю тебя подключиться в качестве мастера в «Окошко» для получения записей:\n${link}`;

  if (window.Telegram?.WebApp?.openTelegramLink) {
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Приглашение мастера в команду Okoshko')}`;
    window.Telegram.WebApp.openTelegramLink(shareUrl);
  } else if (navigator.share) {
    navigator.share({
      title: 'Приглашение мастера',
      text: text,
      url: link
    }).catch(() => {
      prompt('Скопируйте ссылку мастера:', link);
    });
  } else {
    prompt('Скопируйте ссылку мастера:', link);
  }
}

function handleMasterAvatarUploaded(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedMasterAvatar = e.target.result;
    const img = document.getElementById('newMasterAvatarPreviewImg');
    if (img) img.src = uploadedMasterAvatar;
  };
  reader.readAsDataURL(file);
}

function handleMasterPortfolioUploaded(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    uploadedMasterPortfolio.push(e.target.result);
    renderMasterPortfolioPreview();
  };
  reader.readAsDataURL(file);
}

function renderMasterPortfolioPreview() {
  const container = document.getElementById('newMasterPortfolioPreview');
  if (!container) return;

  container.innerHTML = uploadedMasterPortfolio.map((src, idx) => `
    <div class="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-300 group">
      <img src="${src}" class="w-full h-full object-cover" />
      <button onclick="uploadedMasterPortfolio.splice(${idx}, 1); renderMasterPortfolioPreview();"
        class="absolute top-0 right-0 w-4 h-4 bg-black/60 text-white flex items-center justify-center text-[9px] rounded-bl-lg">✕</button>
    </div>
  `).join('');
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
      <div class="w-12 h-12 rounded-2xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300/60">
        <img src="${m.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}" alt="${m.name}" class="w-full h-full object-cover"/>
      </div>
      <div class="flex flex-col min-w-0 flex-1">
        <span class="font-bold text-xs text-on-surface truncate">${m.name} ${m.lastName || ''}</span>
        <span class="text-[11px] text-slate-500 mt-0.5 truncate">${m.role_title}</span>
        <div class="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
          <span>Опыт: ${m.experience}</span>
          ${m.portfolio_photos?.length ? `<span>• 📷 ${m.portfolio_photos.length} работ</span>` : ''}
        </div>
      </div>
      <div class="flex items-center gap-1.5 shrink-0">
        <button onclick="sendMasterInviteLink('${m.name}')" title="Отправить ссылку в Telegram"
          class="w-8 h-8 rounded-xl bg-indigo-50 text-primary hover:bg-indigo-100 flex items-center justify-center active:scale-90 transition-transform">
          <span class="material-symbols-outlined text-[16px]">share</span>
        </button>
        <button onclick="openProMasterEditModal(${idx})" title="Редактировать"
          class="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 flex items-center justify-center active:scale-90 transition-transform">
          <span class="material-symbols-outlined text-[16px]">edit</span>
        </button>
        <button onclick="confirmProAction('Удалить мастера?', 'Вы уверены, что хотите удалить этого мастера из команды салона?', () => deleteProMaster(${idx}))" title="Удалить"
          class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center active:scale-90 transition-transform">
          <span class="material-symbols-outlined text-[16px]">delete</span>
        </button>
      </div>
    </div>
  `).join('');
}

function addProMaster() {
  const firstInput = document.getElementById('newMasterFirstNameInput');
  const lastInput = document.getElementById('newMasterLastNameInput');
  const roleInput = document.getElementById('newMasterRoleInput');
  const expInput = document.getElementById('newMasterExpInput');

  const firstName = firstInput?.value?.trim();
  const lastName = lastInput?.value?.trim() || '';
  const role = roleInput?.value?.trim();
  const exp = expInput?.value?.trim() || '2 года';

  if (!firstName || !role) {
    showToast('Укажите имя и специализацию мастера');
    return;
  }

  confirmProAction('Добавить мастера?', `Добавить специалиста ${firstName} ${lastName} в команду салона?`, () => {
    const data = getProSalonData();
    data.masters.push({
      id: 'master_' + Date.now(),
      name: firstName,
      lastName: lastName,
      role_title: role,
      experience: exp,
      avatar_url: uploadedMasterAvatar,
      portfolio_photos: [...uploadedMasterPortfolio]
    });

    saveProSalonData(data);
    if (firstInput) firstInput.value = '';
    if (lastInput) lastInput.value = '';
    if (roleInput) roleInput.value = '';
    if (expInput) expInput.value = '';
    uploadedMasterPortfolio = [];
    renderMasterPortfolioPreview();
    renderProMastersList();
    closeProAddMasterModal();
    openProMastersListModal();
    showToast('Мастер успешно добавлен 💇');
  });
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
// PRO MASTER EDIT MODAL
// ------------------------------------------
function openProMasterEditModal(idx) {
  const data = getProSalonData();
  const master = data.masters[idx];
  if (!master) return;

  const modal = document.getElementById('proMasterEditModal');
  const idxInput = document.getElementById('editMasterIdxInput');
  const firstInput = document.getElementById('editMasterFirstNameInput');
  const lastInput = document.getElementById('editMasterLastNameInput');
  const roleInput = document.getElementById('editMasterRoleInput');
  const expInput = document.getElementById('editMasterExpInput');

  if (idxInput) idxInput.value = idx;
  if (firstInput) firstInput.value = master.name;
  if (lastInput) lastInput.value = master.lastName || '';
  if (roleInput) roleInput.value = master.role_title;
  if (expInput) expInput.value = master.experience || '2 года';

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeProMasterEditModal() {
  const modal = document.getElementById('proMasterEditModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function sendMasterInviteLinkFromModal() {
  const firstInput = document.getElementById('editMasterFirstNameInput');
  sendMasterInviteLink(firstInput?.value || '');
}

function saveProMasterEdit() {
  const idxInput = document.getElementById('editMasterIdxInput');
  const firstInput = document.getElementById('editMasterFirstNameInput');
  const lastInput = document.getElementById('editMasterLastNameInput');
  const roleInput = document.getElementById('editMasterRoleInput');
  const expInput = document.getElementById('editMasterExpInput');

  const idx = parseInt(idxInput?.value || '-1', 10);
  const firstName = firstInput?.value?.trim();
  const lastName = lastInput?.value?.trim();
  const role = roleInput?.value?.trim();
  const exp = expInput?.value?.trim();

  if (!firstName || !role) {
    showToast('Заполните имя и специализацию');
    return;
  }

  confirmProAction('Сохранить данные мастера?', 'Обновить профиль специалиста в системе?', () => {
    const data = getProSalonData();
    if (data.masters[idx]) {
      data.masters[idx].name = firstName;
      data.masters[idx].lastName = lastName;
      data.masters[idx].role_title = role;
      data.masters[idx].experience = exp;
      saveProSalonData(data);
      renderProMastersList();
      closeProMasterEditModal();
      showToast('Данные мастера сохранены ✓');
    }
  });
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
            <button onclick="confirmProAction('Завершить визит?', 'Отметить визит клиента как успешно завершенный?', () => completeProAppointment('${a.id}'))"
              class="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1">
              <span class="material-symbols-outlined text-[15px]">done_all</span>
              <span>Визит завершен</span>
            </button>
            <button onclick="confirmProAction('Отменить запись?', 'Вы уверены, что хотите отменить эту запись клиента?', () => cancelProAppointment('${a.id}'))"
              class="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold text-xs active:scale-95 transition-all">
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
