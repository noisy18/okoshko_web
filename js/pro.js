// ==========================================
// OKOSHKO PRO BUSINESS PANEL LOGIC & STORE
// ==========================================

const PRO_DATA_STORAGE_KEY = 'okoshko_pro_salon_data_v1';
const PRO_CLOUD_META_KEY = 'okoshko_pro_salon_meta_v1';
const PRO_CLOUD_SERVICES_KEY = 'okoshko_pro_services_v1';
const PRO_CLOUD_MASTERS_KEY = 'okoshko_pro_masters_v1';
const PRO_CLOUD_AVATAR_KEY = 'okoshko_pro_avatar_v1';
const PRO_CLOUD_COVER_KEY = 'okoshko_pro_cover_v1';
const PRO_APPOINTMENTS_STORAGE_KEY = 'okoshko_pro_clients_appointments_v1';
const BOT_LINK = 'https://t.me/okooshko_bot';

// Default initial state for PRO Salon (Clean baseline partner, no mock data)
const DEFAULT_PRO_SALON = {
  name: '',
  city: 'Москва',
  cityKey: 'moscow',
  address: '',
  latitude: 55.755800,
  longitude: 37.617300,
  phone: '',
  creatorTag: '@maximtepin',
  adminTag: '', // Не назначен по умолчанию
  notificationsEnabled: true,
  categoryText: '',
  rating: '5.0',
  reviewsCount: 0,
  avatarUrl: '',
  coverUrl: '',
  updatedAt: 0,
  services: [],
  masters: [],
  photos: []
};

// Default initial client appointments for PRO partner (Clean baseline)
const DEFAULT_PRO_APPOINTMENTS = [];

function getProSalonData() {
  try {
    const raw = localStorage.getItem(PRO_DATA_STORAGE_KEY) || sessionStorage.getItem(PRO_DATA_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        return Object.assign({}, DEFAULT_PRO_SALON, parsed);
      }
    }
  } catch (e) { }
  return JSON.parse(JSON.stringify(DEFAULT_PRO_SALON));
}

function syncVenuesWithProSalon(data) {
  if (!data) return;
  if (typeof venues !== 'undefined' && Array.isArray(venues)) {
    if (data.name || data.address) {
      const salonObj = {
        id: 'salon_1',
        name: data.name || 'Салон красоты',
        type: 'Салон красоты',
        region: data.cityKey || 'moscow',
        regionName: data.city || 'Москва',
        categoryTags: ['nails', 'hair', 'brows', 'pedicure'],
        categoryText: data.categoryText || '',
        rating: data.rating || '5.0',
        reviewsCount: data.reviewsCount || 0,
        address: data.address || '',
        distance: 'рядом',
        hotSlot: 'Окно сегодня',
        slots: ['10:00', '12:00', '14:00', '16:00', '18:00'],
        priceFrom: 'от 1 500 ₽',
        target: 'salon',
        photoCount: 1,
        img: data.avatarUrl || '',
        coords: [Number(data.latitude || 55.7558), Number(data.longitude || 37.6173)],
        description: data.description || '',
        services: data.services || [],
        masters: data.masters || []
      };
      if (venues.length === 0) {
        venues.push(salonObj);
      } else {
        venues[0] = Object.assign(venues[0], salonObj);
      }
    } else {
      venues.length = 0;
    }
    if (typeof applyCombinedFilters === 'function') {
      applyCombinedFilters();
    }
  }
}

function saveProSalonData(data) {
  data.updatedAt = Date.now();
  try {
    localStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(data));
  } catch (e) { }

  // Update browser URL query params in-place so F5/reload in same session preserves the new data
  try {
    if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
      const curUrl = new URL(window.location.href);
      if (data.name) curUrl.searchParams.set('salon_name', data.name);
      if (data.address) curUrl.searchParams.set('address', data.address);
      if (data.phone) curUrl.searchParams.set('phone', data.phone);
      if (data.city) curUrl.searchParams.set('city', data.city);
      if (data.latitude) curUrl.searchParams.set('lat', String(data.latitude));
      if (data.longitude) curUrl.searchParams.set('lon', String(data.longitude));
      if (data.adminTag) curUrl.searchParams.set('admin_tag', data.adminTag);
      if (data.avatarUrl && (data.avatarUrl.startsWith('http://') || data.avatarUrl.startsWith('https://'))) {
        curUrl.searchParams.set('avatar_url', data.avatarUrl);
      } else if (!data.avatarUrl) {
        curUrl.searchParams.delete('avatar_url');
      }
      if (data.coverUrl && (data.coverUrl.startsWith('http://') || data.coverUrl.startsWith('https://'))) {
        curUrl.searchParams.set('cover_url', data.coverUrl);
      } else if (!data.coverUrl) {
        curUrl.searchParams.delete('cover_url');
      }
      if (data.services && Array.isArray(data.services) && data.services.length) {
        curUrl.searchParams.set('services_json', JSON.stringify(data.services));
      }
      if (data.masters && Array.isArray(data.masters) && data.masters.length) {
        const compactMasters = data.masters.map(m => ({
          id: m.id,
          name: m.name,
          lastName: m.lastName || '',
          role_title: m.role_title || '',
          experience: m.experience || '',
          avatar_url: (m.avatar_url && m.avatar_url.startsWith('http')) ? m.avatar_url : '',
          telegram_handle: m.telegram_handle || '',
          telegram_id: m.telegram_id || null
        }));
        curUrl.searchParams.set('masters_json', JSON.stringify(compactMasters));
      }
      curUrl.searchParams.set('v', String(data.updatedAt));
      window.history.replaceState(null, '', curUrl.toString());
    }
  } catch (e) { }

  // 1. Sync compact metadata to Telegram CloudStorage (<4KB limit guaranteed!)
  try {
    if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
      const cloudMeta = {
        id: data.id || 1,
        name: data.name || '',
        address: data.address || '',
        phone: data.phone || '',
        city: data.city || 'Москва',
        cityKey: data.cityKey || 'moscow',
        latitude: data.latitude,
        longitude: data.longitude,
        adminTag: data.adminTag || '',
        creatorTag: data.creatorTag || '@maximtepin',
        notificationsEnabled: !!data.notificationsEnabled,
        updatedAt: data.updatedAt
      };
      window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_META_KEY, JSON.stringify(cloudMeta), (err, stored) => {
        if (!err && stored) console.log('[PRO] Salon meta synced to Telegram CloudStorage');
      });
      if (data.services && data.services.length) {
        window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_SERVICES_KEY, JSON.stringify(data.services), () => {});
      }
      if (data.masters && Array.isArray(data.masters) && data.masters.length) {
        const safeMasters = data.masters.map(m => ({
          id: m.id,
          name: m.name,
          lastName: m.lastName || '',
          role_title: m.role_title || '',
          experience: m.experience || '',
          avatar_url: (m.avatar_url && m.avatar_url.startsWith('http')) ? m.avatar_url : '',
          telegram_handle: m.telegram_handle || '',
          telegram_id: m.telegram_id || null
        }));
        window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_MASTERS_KEY, JSON.stringify(safeMasters), () => {});
      } else {
        window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_MASTERS_KEY, '[]', () => {});
      }
      // Sync CDN photo URLs via CloudStorage for cross-device sync
      if (data.avatarUrl && data.avatarUrl.startsWith('http')) {
        window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_AVATAR_KEY, data.avatarUrl, () => {});
      } else if (!data.avatarUrl) {
        window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_AVATAR_KEY, '', () => {});
      }
      if (data.coverUrl && data.coverUrl.startsWith('http')) {
        window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_COVER_KEY, data.coverUrl, () => {});
      } else if (!data.coverUrl) {
        window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_COVER_KEY, '', () => {});
      }
    }
  } catch (e) { }

  // 2. Direct real-time sync with local PostgreSQL API backend (port 8080)
  const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
  const updatePayload = {
    salon_id: data.id || 1,
    user_id: userTgId,
    salon_name: data.name || '',
    address: data.address || '',
    phone: data.phone || '',
    city: data.city || 'Москва',
    latitude: data.latitude,
    longitude: data.longitude,
    avatar_url: data.avatarUrl || '',
    cover_url: data.coverUrl || '',
    admin_tag: data.adminTag || '',
    creator_tag: data.creatorTag || '@maximtepin',
    masters: data.masters || [],
    services: data.services || []
  };

  try {
    fetch('http://127.0.0.1:8080/api/pro_salon_update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatePayload)
    }).then(res => res.json())
      .then(res => console.log('[PRO] PostgreSQL sync response:', res))
      .catch(err => {
        console.log('[PRO] Local API sync skipped/unavailable:', err.message);
      });
  } catch (e) { }

  // 3. Update MenuButton in Telegram via Bot API so the bot menu button opens with latest saved address, phone and masters
  try {
    const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
    if (userTgId && botToken) {
      const baseUrl = 'https://noisy18.github.io/okoshko_web/';
      const freshParams = new URLSearchParams();
      freshParams.set('is_pro', '1');
      if (data.name) freshParams.set('salon_name', data.name);
      if (data.address) freshParams.set('address', data.address);
      if (data.phone) freshParams.set('phone', data.phone);
      if (data.city) freshParams.set('city', data.city);
      if (data.latitude) freshParams.set('lat', String(data.latitude));
      if (data.longitude) freshParams.set('lon', String(data.longitude));
      if (data.adminTag) freshParams.set('admin_tag', data.adminTag);
      if (data.avatarUrl && (data.avatarUrl.startsWith('http://') || data.avatarUrl.startsWith('https://'))) {
        freshParams.set('avatar_url', data.avatarUrl);
      }
      if (data.coverUrl && (data.coverUrl.startsWith('http://') || data.coverUrl.startsWith('https://'))) {
        freshParams.set('cover_url', data.coverUrl);
      }
      if (data.services && Array.isArray(data.services) && data.services.length) {
        freshParams.set('services_json', JSON.stringify(data.services));
      }
      if (data.masters && Array.isArray(data.masters) && data.masters.length) {
        const compactMasters = data.masters.map(m => ({
          id: m.id,
          name: m.name,
          lastName: m.lastName || '',
          role_title: m.role_title || '',
          experience: m.experience || '',
          avatar_url: (m.avatar_url && m.avatar_url.startsWith('http')) ? m.avatar_url : '',
          telegram_handle: m.telegram_handle || '',
          telegram_id: m.telegram_id || null
        }));
        freshParams.set('masters_json', JSON.stringify(compactMasters));
      }
      freshParams.set('v', String(data.updatedAt));

      // Обновляем текущий URL в истории браузера, чтобы при обычном F5/обновлении страницы мастера и данные сохранялись
      if (window.history && window.history.replaceState) {
        const curSearch = freshParams.toString();
        window.history.replaceState({}, '', `${window.location.pathname}?${curSearch}`);
      }

      const updatedMenuUrl = `${baseUrl}?${freshParams.toString()}`;
      fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userTgId,
          menu_button: {
            type: 'web_app',
            text: '💅 Окошко',
            web_app: { url: updatedMenuUrl }
          }
        })
      }).catch(() => {});
    }
  } catch (e) { }

  syncProSalonUI();
  syncVenuesWithProSalon(data);
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

function applyUrlParamsToData(data, urlParams, timestamp) {
  if (!data || !urlParams) return;
  if (urlParams.has('admin_tag')) {
    const at = urlParams.get('admin_tag');
    if (at !== null) data.adminTag = at;
  }
  if (urlParams.has('salon_name')) {
    const sn = urlParams.get('salon_name');
    if (sn && sn.trim()) data.name = sn.trim();
  }
  if (urlParams.has('address')) {
    const addr = urlParams.get('address');
    if (addr && addr.trim()) data.address = addr.trim();
  }
  if (urlParams.has('phone')) {
    const ph = urlParams.get('phone');
    if (ph && ph.trim()) data.phone = ph.trim();
  }
  if (urlParams.has('city')) {
    const ct = urlParams.get('city');
    if (ct && ct.trim()) data.city = ct.trim();
  }
  if (urlParams.has('lat')) {
    const lat = parseFloat(urlParams.get('lat'));
    if (!isNaN(lat) && lat !== 0) data.latitude = lat;
  }
  if (urlParams.has('lon')) {
    const lon = parseFloat(urlParams.get('lon'));
    if (!isNaN(lon) && lon !== 0) data.longitude = lon;
  }
  if (urlParams.has('avatar_url')) {
    const av = urlParams.get('avatar_url');
    if (av && av.trim()) data.avatarUrl = av.trim();
  }
  if (urlParams.has('cover_url')) {
    const cv = urlParams.get('cover_url');
    if (cv && cv.trim()) data.coverUrl = cv.trim();
  }
  if (timestamp) data.updatedAt = timestamp;

  if (urlParams.has('services_json')) {
    try {
      const sv = JSON.parse(urlParams.get('services_json'));
      if (Array.isArray(sv) && sv.length) {
        data.services = sv;
      }
    } catch (e) {
      console.warn('[PRO] Error parsing services_json:', e);
    }
  }

  if (urlParams.has('masters_json')) {
    try {
      const dbMasters = JSON.parse(urlParams.get('masters_json'));
      if (Array.isArray(dbMasters)) {
        if (!Array.isArray(data.masters)) {
          data.masters = [];
        }
        dbMasters.forEach(dbm => {
          const normName = (dbm.name || '').trim().toLowerCase();
          const normLast = (dbm.lastName || '').trim().toLowerCase();

          const existingIdx = data.masters.findIndex(m => {
            if (dbm.telegram_id && m.telegram_id && Number(m.telegram_id) === Number(dbm.telegram_id)) return true;
            if (m.id && (m.id === dbm.id || m.id === `db_master_${dbm.id}` || dbm.id === `db_master_${m.id}`)) return true;
            const mName = (m.name || '').trim().toLowerCase();
            const mLast = (m.lastName || '').trim().toLowerCase();
            return Boolean(normName && normName === mName && (!normLast || !mLast || normLast === mLast));
          });

          if (existingIdx >= 0) {
            const current = data.masters[existingIdx];
            current.id = dbm.id || current.id;
            if (dbm.name) current.name = dbm.name;
            if (dbm.lastName !== undefined) current.lastName = dbm.lastName;
            if (dbm.role_title) current.role_title = dbm.role_title;
            if (dbm.experience) current.experience = dbm.experience;
            if (dbm.telegram_handle) current.telegram_handle = dbm.telegram_handle;
            if (dbm.telegram_id) current.telegram_id = dbm.telegram_id;
            if (dbm.avatar_url) current.avatar_url = dbm.avatar_url;
          } else {
            data.masters.push({
              id: dbm.id || ('master_' + Date.now()),
              name: dbm.name,
              lastName: dbm.lastName || '',
              role_title: dbm.role_title || 'Специалист салона',
              experience: dbm.experience || '3 года',
              avatar_url: dbm.avatar_url || '',
              telegram_handle: dbm.telegram_handle || '',
              telegram_id: dbm.telegram_id || null,
              portfolio_photos: []
            });
          }
        });
      }
    } catch (parseErr) {
      console.warn('[PRO] Error parsing masters_json:', parseErr);
    }
  }
}

// Cross-device synchronization on launch from Telegram CloudStorage, local API and URL params
function initProCloudSync() {
  let urlParams = null;
  let urlTime = 0;
  let hasUrlParams = false;

  // 1. Считываем свежие URL параметры (если WebApp открыт по MenuButton)
  try {
    if (window.location.search) {
      urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('v')) {
        urlTime = Number(urlParams.get('v')) || 0;
        if (urlTime > 0 && urlTime < 1e11) urlTime *= 1000;
      }
      if (urlParams.has('salon_name') || urlParams.has('address') || urlParams.has('phone') || urlParams.has('admin_tag') || urlParams.has('masters_json') || urlParams.has('services_json') || urlParams.has('avatar_url') || urlParams.has('cover_url')) {
        hasUrlParams = true;
      }
    }
  } catch (e) { }

  let localData = getProSalonData();
  const localTime = Number(localData.updatedAt) || 0;

  // Применяем параметры если они свежее или если содержат мастеров/услуги/актуальный профиль
  if (hasUrlParams && urlParams && (urlTime >= localTime || !localData.address || !localData.name || !localData.avatarUrl || urlParams.has('masters_json') || urlParams.has('services_json'))) {
    applyUrlParamsToData(localData, urlParams, urlTime);
    try {
      localStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(localData));
      sessionStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(localData));
    } catch (e) { }
  }

  // Обновляем интерфейс текущими данными синхронно
  syncProSalonUI();
  syncVenuesWithProSalon(localData);
  if (typeof renderProMastersList === 'function') renderProMastersList();
  if (typeof renderProServicesList === 'function') renderProServicesList();

  // 2. Асинхронно запрашиваем актуальные данные из PostgreSQL через локальный API сервер
  const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
  try {
    fetch(`http://127.0.0.1:8080/api/pro_salon_get?user_id=${userTgId}`)
      .then(res => res.json())
      .then(dbData => {
        if (dbData && dbData.id) {
          const currentData = getProSalonData();
          const curTime = Number(currentData.updatedAt) || 0;
          const dbTime = Number(dbData.updatedAt) || 0;

          // Восстанавливаем данные из базы, если они свежее или если локальный профиль пуст (например, после чистки кеша)
          if (dbTime >= curTime || !currentData.address || !currentData.name || !currentData.avatarUrl) {
            if (dbData.name) currentData.name = dbData.name;
            if (dbData.address) currentData.address = dbData.address;
            if (dbData.phone) currentData.phone = dbData.phone;
            if (dbData.city) currentData.city = dbData.city;
            if (dbData.cityKey) currentData.cityKey = dbData.cityKey;
            if (dbData.latitude) currentData.latitude = dbData.latitude;
            if (dbData.longitude) currentData.longitude = dbData.longitude;
            if (dbData.avatar_url) currentData.avatarUrl = dbData.avatar_url;
            if (dbData.cover_url) currentData.coverUrl = dbData.cover_url;
            if (dbData.admin_tag) currentData.adminTag = dbData.admin_tag;
            if (dbData.services && dbData.services.length) currentData.services = dbData.services;
            if (dbData.masters && dbData.masters.length) currentData.masters = dbData.masters;
            if (dbTime) currentData.updatedAt = dbTime;

            localStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(currentData));
            sessionStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(currentData));
            syncProSalonUI();
            syncVenuesWithProSalon(currentData);
            if (typeof renderProMastersList === 'function') renderProMastersList();
            if (typeof renderProServicesList === 'function') renderProServicesList();
          }
        }
      })
      .catch(() => {});
  } catch (e) { }

  // 3. Синхронизация из CloudStorage Telegram (сохраняется в облаке Telegram даже при полной чистке кеша)
  try {
    if (window.Telegram?.WebApp?.CloudStorage?.getItems) {
      window.Telegram.WebApp.CloudStorage.getItems([
        PRO_CLOUD_META_KEY,
        PRO_CLOUD_SERVICES_KEY,
        PRO_CLOUD_MASTERS_KEY,
        PRO_CLOUD_AVATAR_KEY,
        PRO_CLOUD_COVER_KEY,
        PRO_DATA_STORAGE_KEY,
        PRO_APPOINTMENTS_STORAGE_KEY
      ], (err, values) => {
        if (!err && values) {
          let updated = false;
          let cloudMeta = null;

          if (values[PRO_CLOUD_META_KEY]) {
            try { cloudMeta = JSON.parse(values[PRO_CLOUD_META_KEY]); } catch(e) {}
          }
          if (!cloudMeta && values[PRO_DATA_STORAGE_KEY]) {
            try { cloudMeta = JSON.parse(values[PRO_DATA_STORAGE_KEY]); } catch(e) {}
          }

          const currentData = getProSalonData();

          if (cloudMeta && typeof cloudMeta === 'object') {
            const curTime = Number(currentData.updatedAt) || 0;
            const cloudTime = Number(cloudMeta.updatedAt) || 0;

            if (cloudTime > curTime || !currentData.address || !currentData.name) {
              if (cloudMeta.name) currentData.name = cloudMeta.name;
              if (cloudMeta.address) currentData.address = cloudMeta.address;
              if (cloudMeta.phone) currentData.phone = cloudMeta.phone;
              if (cloudMeta.city) currentData.city = cloudMeta.city;
              if (cloudMeta.cityKey) currentData.cityKey = cloudMeta.cityKey;
              if (cloudMeta.latitude) currentData.latitude = cloudMeta.latitude;
              if (cloudMeta.longitude) currentData.longitude = cloudMeta.longitude;
              if (cloudMeta.adminTag) currentData.adminTag = cloudMeta.adminTag;
              if (cloudMeta.creatorTag) currentData.creatorTag = cloudMeta.creatorTag;
              if (cloudTime) currentData.updatedAt = cloudTime;
              updated = true;
            }
          }

          if (values[PRO_CLOUD_SERVICES_KEY]) {
            try {
              const sv = JSON.parse(values[PRO_CLOUD_SERVICES_KEY]);
              if (Array.isArray(sv) && sv.length) {
                currentData.services = sv;
                updated = true;
              }
            } catch(e) {}
          }

          if (values[PRO_CLOUD_MASTERS_KEY]) {
            try {
              const ms = JSON.parse(values[PRO_CLOUD_MASTERS_KEY]);
              if (Array.isArray(ms) && ms.length) {
                if (!Array.isArray(currentData.masters) || currentData.masters.length === 0) {
                  currentData.masters = ms;
                  updated = true;
                } else {
                  // Мерджим карточки из CloudStorage, НИКОГДА не затирая мастеров из базы данных
                  ms.forEach(m => {
                    const exists = currentData.masters.some(cur =>
                      (m.telegram_id && cur.telegram_id && Number(m.telegram_id) === Number(cur.telegram_id)) ||
                      (m.id && cur.id && m.id === cur.id) ||
                      (m.name && cur.name && m.name.trim().toLowerCase() === cur.name.trim().toLowerCase())
                    );
                    if (!exists) {
                      currentData.masters.push(m);
                      updated = true;
                    }
                  });
                }
              }
            } catch(e) {}
          }

          // Restore avatar & cover from CloudStorage if available
          if (values[PRO_CLOUD_AVATAR_KEY] !== undefined && values[PRO_CLOUD_AVATAR_KEY] !== null) {
            const cloudAv = values[PRO_CLOUD_AVATAR_KEY];
            if (cloudAv && cloudAv !== currentData.avatarUrl) {
              currentData.avatarUrl = cloudAv;
              updated = true;
            }
          }
          if (values[PRO_CLOUD_COVER_KEY] !== undefined && values[PRO_CLOUD_COVER_KEY] !== null) {
            const cloudCv = values[PRO_CLOUD_COVER_KEY];
            if (cloudCv && cloudCv !== currentData.coverUrl) {
              currentData.coverUrl = cloudCv;
              updated = true;
            }
          }

          if (updated) {
            localStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(currentData));
            sessionStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(currentData));
            syncProSalonUI();
            syncVenuesWithProSalon(currentData);
            if (typeof renderProMastersList === 'function') renderProMastersList();
            if (typeof renderProServicesList === 'function') renderProServicesList();
          }

          if (values[PRO_APPOINTMENTS_STORAGE_KEY]) {
            try {
              const cloudAppts = JSON.parse(values[PRO_APPOINTMENTS_STORAGE_KEY]);
              if (Array.isArray(cloudAppts)) {
                localStorage.setItem(PRO_APPOINTMENTS_STORAGE_KEY, values[PRO_APPOINTMENTS_STORAGE_KEY]);
              }
            } catch (e) { }
          }
        }
      });
    }
  } catch (e) { }

  // 4. Запрашиваем актуальные данные из Telegram Bot API для 100% надежной синхронизации PostgreSQL на любом устройстве
  const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
  if (userTgId && botToken) {
    fetch(`https://api.telegram.org/bot${botToken}/getChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: userTgId })
    })
      .then(res => res.json())
      .then(menuRes => {
        const freshMenuUrl = menuRes?.result?.web_app?.url;
        if (freshMenuUrl && freshMenuUrl.includes('?')) {
          const freshSearch = freshMenuUrl.substring(freshMenuUrl.indexOf('?'));
          const freshParams = new URLSearchParams(freshSearch);
          if (freshParams.has('masters_json')) {
            const dataToUpdate = getProSalonData();
            applyUrlParamsToData(dataToUpdate, freshParams, Number(freshParams.get('v')) || Date.now());
            localStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(dataToUpdate));
            sessionStorage.setItem(PRO_DATA_STORAGE_KEY, JSON.stringify(dataToUpdate));
            syncProSalonUI();
            syncVenuesWithProSalon(dataToUpdate);
            if (typeof renderProMastersList === 'function') renderProMastersList();
            if (typeof renderProServicesList === 'function') renderProServicesList();
          }
        }
      })
      .catch(err => console.log('[PRO] getChatMenuButton sync skipped:', err));
  }

  // 5. Автоматический вход в бизнес-аккаунт, если перешли по кнопке «Войти в бизнес-аккаунт»
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

function confirmExitProMode() {
  confirmProAction(
    'Вернуться в клиентский режим?',
    'Вы действительно хотите выйти из кабинета PRO и перейти в клиентский профиль?',
    () => exitProMode(),
    {
      type: 'primary',
      icon: 'logout',
      confirmText: 'Вернуться в клиент'
    }
  );
}

function handleHeaderLogoClick() {
  if (state.isProMode) {
    // In PRO mode, clicking "Панель PRO" in the top-left corner does nothing
    return;
  }
  router.navigate('map');
}

function handleHeaderProfileClick() {
  if (state.isProMode) {
    confirmExitProMode();
  } else {
    router.navigate('profile');
  }
}

function openSupportProject() {
  showToast('Ссылка на поддержку проекта скоро появится ✨');
}

// ------------------------------------------
// SYNC PRO SALON PROFILE UI
// ------------------------------------------
function syncProSalonUI() {
  const data = getProSalonData();

  // Name
  const nameEl = document.getElementById('proSalonName');
  const nameSubEl = document.getElementById('proProfileNameSub');
  if (nameEl) nameEl.textContent = data.name || 'Название салона';
  if (nameSubEl) nameSubEl.textContent = data.name || 'Не указано';

  // City
  const citySubEl = document.getElementById('proProfileCitySub');
  const cityBadgeEl = document.getElementById('proProfileCityBadge');
  if (citySubEl) citySubEl.textContent = data.city || 'Москва';
  if (cityBadgeEl) cityBadgeEl.textContent = 'Изменить';

  // Address
  const addrEl = document.getElementById('proSalonAddress');
  const addrSubEl = document.getElementById('proProfileAddressSub');
  if (addrEl) addrEl.textContent = data.address || 'Не указан (выберите на карте)';
  if (addrSubEl) {
    if (data.address) {
      addrSubEl.textContent = data.address;
      addrSubEl.classList.remove('text-slate-400');
      addrSubEl.classList.add('text-slate-700');
    } else {
      addrSubEl.textContent = 'Не указан (выберите на карте)';
      addrSubEl.classList.remove('text-slate-700');
      addrSubEl.classList.add('text-slate-400');
    }
  }

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
  if (svcCountEl) svcCountEl.textContent = `${(data.services || []).length} услуг`;

  const mastersCountEl = document.getElementById('proMastersCountBadge');
  if (mastersCountEl) mastersCountEl.textContent = `${(data.masters || []).length} мастеров`;

  // Notifications switch
  const notifToggle = document.getElementById('proTgNotificationsToggle');
  if (notifToggle) notifToggle.checked = !!data.notificationsEnabled;

  // Avatar & Cover Fallbacks
  const avatarImg = document.getElementById('proSalonAvatarImg');
  const avatarFallback = document.getElementById('proSalonAvatarFallback');
  if (avatarImg) {
    if (data.avatarUrl) {
      avatarImg.src = data.avatarUrl;
      avatarImg.classList.remove('hidden');
      if (avatarFallback) avatarFallback.classList.add('hidden');
    } else {
      avatarImg.src = '';
      avatarImg.classList.add('hidden');
      if (avatarFallback) avatarFallback.classList.remove('hidden');
    }
  }

  const coverImg = document.getElementById('proSalonCoverImg');
  const coverFallback = document.getElementById('proSalonCoverFallback');
  if (coverImg) {
    if (data.coverUrl) {
      coverImg.src = data.coverUrl;
      coverImg.classList.remove('hidden');
      if (coverFallback) coverFallback.classList.add('hidden');
    } else {
      coverImg.src = '';
      coverImg.classList.add('hidden');
      if (coverFallback) coverFallback.classList.remove('hidden');
    }
  }

  // Delete buttons visibility
  const avatarDelBtn = document.getElementById('proSalonAvatarDeleteBtn');
  if (avatarDelBtn) {
    if (data.avatarUrl) avatarDelBtn.classList.remove('hidden');
    else avatarDelBtn.classList.add('hidden');
  }

  const coverDelBtn = document.getElementById('proSalonCoverDeleteBtn');
  if (coverDelBtn) {
    if (data.coverUrl) coverDelBtn.classList.remove('hidden');
    else coverDelBtn.classList.add('hidden');
  }

  // Sync client business card avatar
  if (typeof updateBizCardAvatar === 'function') {
    updateBizCardAvatar();
  }
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

function confirmProAction(title, desc, actionFn, options = {}) {
  pendingProConfirmedAction = actionFn;
  const modal = document.getElementById('proConfirmModal');
  const tEl = document.getElementById('proConfirmTitle');
  const dEl = document.getElementById('proConfirmDesc');
  const iconContainer = document.getElementById('proConfirmIconContainer');
  const iconEl = document.getElementById('proConfirmIcon');
  const submitBtn = document.getElementById('proConfirmSubmitBtn');

  if (tEl) tEl.textContent = title;
  if (dEl) dEl.textContent = desc;

  const isPrimary = options.type === 'primary' || options.btnClass?.includes('primary');

  if (iconContainer && iconEl) {
    if (options.icon) {
      iconEl.textContent = options.icon;
      if (isPrimary) {
        iconContainer.className = 'w-12 h-12 rounded-2xl bg-indigo-50 text-primary flex items-center justify-center';
      } else {
        iconContainer.className = options.iconClass || 'w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center';
      }
    } else {
      iconEl.textContent = 'warning';
      iconContainer.className = 'w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center';
    }
  }

  if (submitBtn) {
    submitBtn.textContent = options.confirmText || 'Подтвердить';
    if (options.btnClass) {
      submitBtn.className = `flex-1 py-3 rounded-2xl font-bold text-xs active:scale-95 transition-all shadow-md ${options.btnClass}`;
    } else if (isPrimary) {
      submitBtn.className = 'flex-1 py-3 rounded-2xl bg-primary hover:bg-primary-hover text-white font-bold text-xs active:scale-95 transition-all shadow-md';
    } else {
      submitBtn.className = 'flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs active:scale-95 transition-all shadow-md';
    }
  }

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
  const iconContainer = document.getElementById('proConfirmIconContainer');
  const iconEl = document.getElementById('proConfirmIcon');
  const submitBtn = document.getElementById('proConfirmSubmitBtn');
  if (iconContainer) iconContainer.className = 'w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center';
  if (iconEl) iconEl.textContent = 'warning';
  if (submitBtn) {
    submitBtn.textContent = 'Подтвердить';
    submitBtn.className = 'flex-1 py-3 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs active:scale-95 transition-all shadow-md';
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

    input.oninput = function(e) {
      const val = this.value;
      if (!val || val.trim() === '') {
        this.value = '';
        if (validationHint) {
          validationHint.textContent = 'Введите 10 цифр номера (начиная после +7)';
          validationHint.className = 'text-[11px] text-slate-400 px-1';
        }
        return;
      }
      const formatted = formatPhoneNumber(val);
      this.value = formatted;
      const digits = val.replace(/\D/g, '').replace(/^[78]/, '');
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
      if (e.key === 'Backspace') {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        // If cursor is right after a non-digit like '-', ')', ' ', delete preceding digit
        if (start === end && start > 0) {
          const charBefore = this.value[start - 1];
          if (!/\d/.test(charBefore)) {
            e.preventDefault();
            let prevDigitIdx = -1;
            for (let i = start - 1; i >= 0; i--) {
              if (/\d/.test(this.value[i])) {
                prevDigitIdx = i;
                break;
              }
            }
            if (prevDigitIdx > 1) { // Don't delete the +7 prefix
              const val = this.value.substring(0, prevDigitIdx) + this.value.substring(prevDigitIdx + 1);
              const formatted = formatPhoneNumber(val);
              this.value = formatted;
              this.setSelectionRange(prevDigitIdx, prevDigitIdx);
              this.dispatchEvent(new Event('input'));
            }
            return;
          }
        }
        return;
      }
      const allowedKeys = ['Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'];
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
// SALON AVATAR & COVER MODAL OPTIONS & CONFIRMATIONS
// ------------------------------------------
function openSalonAvatarOptions() {
  const data = getProSalonData();
  const delBtn = document.getElementById('salonAvatarModalDeleteBtn');
  if (delBtn) {
    if (data.avatarUrl) delBtn.classList.remove('hidden');
    else delBtn.classList.add('hidden');
  }
  const modal = document.getElementById('salonAvatarOptionsModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
  }
}

function closeSalonAvatarOptions() {
  const modal = document.getElementById('salonAvatarOptionsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
}

function openSalonCoverOptions() {
  const data = getProSalonData();
  const delBtn = document.getElementById('salonCoverModalDeleteBtn');
  if (delBtn) {
    if (data.coverUrl) delBtn.classList.remove('hidden');
    else delBtn.classList.add('hidden');
  }
  const modal = document.getElementById('salonCoverOptionsModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
  }
}

function closeSalonCoverOptions() {
  const modal = document.getElementById('salonCoverOptionsModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
}

function confirmDeleteSalonAvatar(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  closeSalonAvatarOptions();
  const modal = document.getElementById('confirmDeleteAvatarModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
  }
}

function closeConfirmDeleteAvatarModal() {
  const modal = document.getElementById('confirmDeleteAvatarModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
}

function executeRemoveSalonAvatar() {
  closeConfirmDeleteAvatarModal();
  closeSalonAvatarOptions();
  try {
    removeSalonAvatar();
  } catch (err) {
    console.error('Error removing salon avatar:', err);
  }
}

function confirmDeleteSalonCover(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  closeSalonCoverOptions();
  const modal = document.getElementById('confirmDeleteCoverModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    modal.style.display = 'flex';
  }
}

function closeConfirmDeleteCoverModal() {
  const modal = document.getElementById('confirmDeleteCoverModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    modal.style.display = 'none';
  }
}

function executeRemoveSalonCover() {
  closeConfirmDeleteCoverModal();
  closeSalonCoverOptions();
  try {
    removeSalonCover();
  } catch (err) {
    console.error('Error removing salon cover:', err);
  }
}

function openAvatarCropperPicker() {
  closeSalonAvatarOptions();
  document.getElementById('proSalonAvatarInput')?.click();
}

function openCoverCropperPicker() {
  closeSalonCoverOptions();
  document.getElementById('proSalonCoverInput')?.click();
}

function handleSalonAvatarSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    openImageCropper(e.target.result, 'avatar');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function handleSalonCoverSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function(e) {
    openImageCropper(e.target.result, 'cover');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeSalonAvatar(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const data = getProSalonData();
  data.avatarUrl = '';
  data.updatedAt = Date.now();
  const input = document.getElementById('proSalonAvatarInput');
  if (input) input.value = '';

  // 1. Очищаем в CloudStorage Telegram
  try {
    if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
      window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_AVATAR_KEY, '', () => {});
    }
  } catch (e) {}

  // 2. Уведомляем бота в Telegram для удаления в PostgreSQL (актуально и для мобильных устройств)
  try {
    const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
    const groupChatId = -5590032342;
    const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupChatId,
        text: `#pro_salon_remove_photo|avatar|${userTgId}|${data.id || 1}`,
        disable_notification: true
      })
    }).catch(() => {});
  } catch (e) {}

  saveProSalonData(data);
  showToast('Аватарка салона удалена 🗑️');
  syncProSalonUI();
  if (typeof updateBizCardAvatar === 'function') {
    updateBizCardAvatar();
  }
}

function removeSalonCover(event) {
  if (event) {
    event.stopPropagation();
    event.preventDefault();
  }
  const data = getProSalonData();
  data.coverUrl = '';
  data.updatedAt = Date.now();
  const input = document.getElementById('proSalonCoverInput');
  if (input) input.value = '';

  // 1. Очищаем в CloudStorage Telegram
  try {
    if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
      window.Telegram.WebApp.CloudStorage.setItem(PRO_CLOUD_COVER_KEY, '', () => {});
    }
  } catch (e) {}

  // 2. Уведомляем бота в Telegram для удаления в PostgreSQL (актуально и для мобильных устройств)
  try {
    const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
    const groupChatId = -5590032342;
    const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
    fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: groupChatId,
        text: `#pro_salon_remove_photo|cover|${userTgId}|${data.id || 1}`,
        disable_notification: true
      })
    }).catch(() => {});
  } catch (e) {}

  saveProSalonData(data);
  showToast('Фон профиля удален 🗑️');
  syncProSalonUI();
}

function renderProProfile() {
  if (typeof syncProSalonUI === 'function') {
    syncProSalonUI();
  }
}

// ------------------------------------------
// INTERACTIVE IMAGE CROPPER ENGINE (Кадрирование)
// ------------------------------------------
let cropperState = {
  type: 'avatar', // 'avatar' | 'cover'
  rawImage: null,
  imgWidth: 0,
  imgHeight: 0,
  cropBoxW: 260,
  cropBoxH: 260,
  x: 0,
  y: 0,
  scale: 1,
  baseScale: 1,
  rotation: 0,
  isDragging: false,
  dragStartX: 0,
  dragStartY: 0,
  initialX: 0,
  initialY: 0,
  initialPinchDist: 0,
  initialScaleOnPinch: 1
};
let cropperEventsAttached = false;

// Ограничивает перемещение и масштаб строго границами фотографии (без черных полос и пустых полей)
function clampCropperPosition() {
  if (!cropperState.rawImage) return;

  const isRotated = (cropperState.rotation % 180 !== 0);
  const effW = isRotated ? cropperState.imgHeight : cropperState.imgWidth;
  const effH = isRotated ? cropperState.imgWidth : cropperState.imgHeight;

  if (!effW || !effH) return;

  // 1. Минимальный масштаб гарантирует, что фото полностью перекрывает область рамки по ширине и высоте
  const minScale = Math.max(cropperState.cropBoxW / effW, cropperState.cropBoxH / effH);
  cropperState.baseScale = minScale;
  if (!cropperState.scale || cropperState.scale < minScale || isNaN(cropperState.scale)) {
    cropperState.scale = minScale;
  }

  // 2. Фактические отображаемые размеры фото при текущем зуме
  const dispW = effW * cropperState.scale;
  const dispH = effH * cropperState.scale;

  // 3. Максимально допустимый сдвиг от центра: края фото никогда не заходят внутрь рамки
  const maxDragX = Math.max(0, (dispW - cropperState.cropBoxW) / 2);
  const maxDragY = Math.max(0, (dispH - cropperState.cropBoxH) / 2);

  cropperState.x = Math.max(-maxDragX, Math.min(maxDragX, cropperState.x || 0));
  cropperState.y = Math.max(-maxDragY, Math.min(maxDragY, cropperState.y || 0));
}

function initCropperEventListeners() {
  if (cropperEventsAttached) return;
  const viewport = document.getElementById('cropperViewport');
  if (!viewport) return;
  cropperEventsAttached = true;

  // Pointer Dragging (Pointer Events handle mouse and touch)
  viewport.addEventListener('pointerdown', (e) => {
    cropperState.isDragging = true;
    cropperState.dragStartX = e.clientX;
    cropperState.dragStartY = e.clientY;
    cropperState.initialX = cropperState.x;
    cropperState.initialY = cropperState.y;
    try { viewport.setPointerCapture(e.pointerId); } catch(err) {}
  });

  viewport.addEventListener('pointermove', (e) => {
    if (!cropperState.isDragging) return;
    const dx = e.clientX - cropperState.dragStartX;
    const dy = e.clientY - cropperState.dragStartY;
    cropperState.x = cropperState.initialX + dx;
    cropperState.y = cropperState.initialY + dy;
    clampCropperPosition();
    updateCropperTransform();
  });

  const stopDrag = (e) => {
    cropperState.isDragging = false;
    try { viewport.releasePointerCapture(e.pointerId); } catch(err) {}
  };
  viewport.addEventListener('pointerup', stopDrag);
  viewport.addEventListener('pointercancel', stopDrag);

  // Multi-touch Pinch to Zoom on mobile devices
  viewport.addEventListener('touchstart', (e) => {
    if (e.touches.length === 2) {
      cropperState.isDragging = false;
      cropperState.initialPinchDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      cropperState.initialScaleOnPinch = cropperState.scale;
    }
  }, { passive: false });

  viewport.addEventListener('touchmove', (e) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      if (cropperState.initialPinchDist > 0) {
        const factor = dist / cropperState.initialPinchDist;
        const minScale = cropperState.baseScale;
        const maxScale = cropperState.baseScale * 3.5;
        const nextScale = Math.max(minScale, Math.min(maxScale, cropperState.initialScaleOnPinch * factor));
        cropperState.scale = nextScale;
        const slider = document.getElementById('cropperZoomSlider');
        if (slider) {
          slider.value = (nextScale / cropperState.baseScale).toFixed(2);
        }
        clampCropperPosition();
        updateCropperTransform();
      }
    }
  }, { passive: false });

  // Mouse wheel zoom
  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 0.08 : -0.08;
    const slider = document.getElementById('cropperZoomSlider');
    let currentVal = slider ? parseFloat(slider.value) : 1;
    currentVal = Math.max(1, Math.min(3, currentVal + delta));
    if (slider) slider.value = currentVal.toFixed(2);
    onCropperZoomSlider(currentVal);
  }, { passive: false });
}

function openImageCropper(imageSource, type) {
  initCropperEventListeners();
  cropperState.type = type;

  // 1. Показываем модальное окно сразу, чтобы элементы получили реальные размеры в DOM
  const modal = document.getElementById('imageCropperModal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  const viewport = document.getElementById('cropperViewport');
  // Безопасное вычисление размеров области кадрирования
  const screenW = window.innerWidth || document.documentElement.clientWidth || 360;
  const screenH = window.innerHeight || document.documentElement.clientHeight || 640;
  const viewW = (viewport && viewport.clientWidth > 50) ? viewport.clientWidth : screenW;
  const viewH = (viewport && viewport.clientHeight > 50) ? viewport.clientHeight : (screenH - 160);

  if (type === 'avatar' || type === 'master') {
    // 1:1 Aspect Ratio (Квадрат с круглой направляющей)
    const boxSize = Math.max(220, Math.min(280, Math.floor(viewW * 0.75), Math.floor(viewH * 0.55)));
    cropperState.cropBoxW = boxSize;
    cropperState.cropBoxH = boxSize;
    const titleEl = document.getElementById('cropperTitle');
    if (titleEl) titleEl.textContent = (type === 'master') ? 'Кадрирование фото мастера' : 'Кадрирование аватарки';
    const badgeEl = document.getElementById('cropperRatioBadge');
    if (badgeEl) badgeEl.textContent = '1:1 (Круг / Квадрат)';
    document.getElementById('cropperCircleGuide')?.classList.remove('hidden');
    document.getElementById('cropperGuideBorder')?.classList.add('rounded-full');
  } else {
    // 16:9 Aspect Ratio (Широкая обложка витрины)
    const boxW = Math.max(270, Math.min(340, Math.floor(viewW * 0.90)));
    const boxH = Math.round(boxW * 9 / 16);
    cropperState.cropBoxW = boxW;
    cropperState.cropBoxH = boxH;
    const titleEl = document.getElementById('cropperTitle');
    if (titleEl) titleEl.textContent = 'Кадрирование обложки';
    const badgeEl = document.getElementById('cropperRatioBadge');
    if (badgeEl) badgeEl.textContent = '16:9 (Широкий баннер)';
    document.getElementById('cropperCircleGuide')?.classList.add('hidden');
    document.getElementById('cropperGuideBorder')?.classList.remove('rounded-full');
  }

  const boxEl = document.getElementById('cropperBox');
  if (boxEl) {
    boxEl.style.width = cropperState.cropBoxW + 'px';
    boxEl.style.height = cropperState.cropBoxH + 'px';
  }

  const img = new Image();
  img.onload = function() {
    cropperState.rawImage = img;
    cropperState.imgWidth = img.naturalWidth || img.width || 800;
    cropperState.imgHeight = img.naturalHeight || img.height || 600;
    cropperState.rotation = 0;
    cropperState.scale = 1;
    cropperState.x = 0;
    cropperState.y = 0;

    // Гарантированно вычисляем минимальный масштаб и центрируем фото
    clampCropperPosition();
    cropperState.scale = cropperState.baseScale;
    cropperState.x = 0;
    cropperState.y = 0;
    clampCropperPosition();

    const slider = document.getElementById('cropperZoomSlider');
    if (slider) slider.value = '1';

    const cropperImgEl = document.getElementById('cropperImage');
    if (cropperImgEl) {
      cropperImgEl.src = imageSource;
      cropperImgEl.style.width = cropperState.imgWidth + 'px';
      cropperImgEl.style.height = cropperState.imgHeight + 'px';
      cropperImgEl.style.maxWidth = 'none';
      cropperImgEl.style.maxHeight = 'none';
      cropperImgEl.style.display = 'block';
    }

    updateCropperTransform();
  };
  img.src = imageSource;
}

function closeImageCropper() {
  const modal = document.getElementById('imageCropperModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function updateCropperTransform() {
  const cropperImgEl = document.getElementById('cropperImage');
  if (!cropperImgEl) return;
  clampCropperPosition();
  cropperImgEl.style.transform = `translate(${cropperState.x}px, ${cropperState.y}px) rotate(${cropperState.rotation}deg) scale(${cropperState.scale})`;
}

function onCropperZoomSlider(val) {
  const multiplier = Math.max(1, parseFloat(val) || 1);
  cropperState.scale = cropperState.baseScale * multiplier;
  clampCropperPosition();
  updateCropperTransform();
}

function cropperRotate90() {
  cropperState.rotation = (cropperState.rotation + 90) % 360;
  clampCropperPosition();
  updateCropperTransform();
}

// Загружает Blob фотографии в CDN Telegram (sendPhoto -> getFile) для получения постоянного публичного HTTPS URL
async function uploadSalonPhotoToTelegram(blob, type) {
  const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
  const groupChatId = -5590032342;
  const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
  const salonData = getProSalonData();
  const salonId = salonData.id || 1;

  const formData = new FormData();
  formData.append('chat_id', groupChatId);
  formData.append('caption', `#pro_salon_photo|${type}|${userTgId}|${salonId}`);
  formData.append('disable_notification', 'true');
  formData.append('photo', blob, `${type}_${Date.now()}.jpg`);

  const resp = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: 'POST',
    body: formData
  });
  const resData = await resp.json();
  if (!resData.ok || !resData.result?.photo?.length) {
    throw new Error(resData.description || 'Не удалось отправить фото в Telegram');
  }

  const bestPhoto = resData.result.photo[resData.result.photo.length - 1];
  const fileResp = await fetch(`https://api.telegram.org/bot${botToken}/getFile?file_id=${bestPhoto.file_id}`);
  const fileData = await fileResp.json();
  if (!fileData.ok || !fileData.result?.file_path) {
    throw new Error('Не удалось получить file_path из Telegram');
  }

  return `https://api.telegram.org/file/bot${botToken}/${fileData.result.file_path}`;
}

function applyCroppedImage() {
  if (!cropperState.rawImage) return;

  const isMaster = (cropperState.type === 'master');
  const isAvatar = (cropperState.type === 'avatar');
  const is1to1 = isMaster || isAvatar;
  const outW = is1to1 ? 512 : 960;
  const outH = is1to1 ? 512 : 540;

  const canvas = document.createElement('canvas');
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  clampCropperPosition();

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.clearRect(0, 0, outW, outH);

  const canvasRatio = outW / cropperState.cropBoxW;

  ctx.translate(outW / 2, outH / 2);
  ctx.scale(canvasRatio, canvasRatio);
  ctx.translate(cropperState.x, cropperState.y);
  ctx.rotate(cropperState.rotation * Math.PI / 180);
  ctx.scale(cropperState.scale, cropperState.scale);

  ctx.drawImage(
    cropperState.rawImage,
    -cropperState.imgWidth / 2,
    -cropperState.imgHeight / 2,
    cropperState.imgWidth,
    cropperState.imgHeight
  );

  const croppedDataUrl = canvas.toDataURL('image/jpeg', 0.90);
  const data = getProSalonData();

  // Отдельная ветка обработки для фото мастера
  if (isMaster) {
    uploadedMasterAvatar = croppedDataUrl;
    const previewImg = document.getElementById('newMasterAvatarPreviewImg');
    if (previewImg) {
      previewImg.src = croppedDataUrl;
      previewImg.classList.remove('hidden');
    }
    const editIdxVal = document.getElementById('editMasterIdxInput')?.value;
    if (editIdxVal !== undefined && editIdxVal !== '') {
      const idx = parseInt(editIdxVal);
      if (data.masters && data.masters[idx]) {
        data.masters[idx].avatar_url = croppedDataUrl;
        saveProSalonData(data);
        renderProMastersList();
      }
      const editAvatarEl = document.getElementById('editMasterCardAvatar');
      if (editAvatarEl) {
        editAvatarEl.src = croppedDataUrl;
        editAvatarEl.classList.remove('hidden');
      }
    }
    closeImageCropper();
    showToast('Кадрирование фото мастера выполнено ✂️');

    // Фоновая отправка в CDN Telegram
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      try {
        const cdnUrl = await uploadSalonPhotoToTelegram(blob, 'master');
        console.log('[PRO] Master avatar uploaded to CDN:', cdnUrl);
        uploadedMasterAvatar = cdnUrl;
        const img = document.getElementById('newMasterAvatarPreviewImg');
        if (img) img.src = cdnUrl;
        const freshIdxVal = document.getElementById('editMasterIdxInput')?.value;
        if (freshIdxVal !== undefined && freshIdxVal !== '') {
          const idxNum = parseInt(freshIdxVal);
          const freshData = getProSalonData();
          if (freshData.masters && freshData.masters[idxNum]) {
            freshData.masters[idxNum].avatar_url = cdnUrl;
            saveProSalonData(freshData);
            renderProMastersList();
          }
          const editAvatar = document.getElementById('editMasterCardAvatar');
          if (editAvatar) editAvatar.src = cdnUrl;
        }
        showToast('Фото мастера загружено в облако! ✅');
      } catch (err) {
        console.warn('[PRO] Master photo cloud upload failed:', err);
      }
    }, 'image/jpeg', 0.90);
    return;
  }

  // 1. Оптимистичное локальное обновление UI (мгновенное отображение без ожидания сети)
  if (isAvatar) {
    data.avatarUrl = croppedDataUrl;
    showToast('Сохранение фото в облако и БД... ⏳');
  } else {
    data.coverUrl = croppedDataUrl;
    showToast('Сохранение фона в облако и БД... ⏳');
  }
  data.updatedAt = Date.now();
  saveProSalonData(data);
  closeImageCropper();
  syncProSalonUI();
  if (typeof updateBizCardAvatar === 'function') {
    updateBizCardAvatar();
  }

  // 2. Фоновая загрузка в Telegram CDN -> сохранение в PostgreSQL и CloudStorage для доступности на всех устройствах
  canvas.toBlob(async (blob) => {
    if (!blob) return;
    try {
      const type = isAvatar ? 'avatar' : 'cover';
      const cdnUrl = await uploadSalonPhotoToTelegram(blob, type);
      console.log(`[PRO] Photo (${type}) uploaded to CDN:`, cdnUrl);

      const freshData = getProSalonData();
      if (isAvatar) {
        freshData.avatarUrl = cdnUrl;
      } else {
        freshData.coverUrl = cdnUrl;
      }
      freshData.updatedAt = Date.now();

      // Сохраняем в CloudStorage Telegram
      try {
        if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
          const cloudKey = isAvatar ? PRO_CLOUD_AVATAR_KEY : PRO_CLOUD_COVER_KEY;
          window.Telegram.WebApp.CloudStorage.setItem(cloudKey, cdnUrl, () => {});
        }
      } catch (e) {}

      saveProSalonData(freshData);
      syncProSalonUI();
      if (typeof updateBizCardAvatar === 'function') {
        updateBizCardAvatar();
      }
      showToast(isAvatar ? 'Аватарка сохранена в БД! ✅' : 'Фон профиля сохранен в БД! ✅');
    } catch (err) {
      console.warn('[PRO] Cloud photo upload failed, fallback to local storage:', err);
      showToast(isAvatar ? 'Аватарка сохранена 🖼️' : 'Фон профиля сохранен 📸');
    }
  }, 'image/jpeg', 0.90);
}

// ------------------------------------------
// PRO ANALYTICS PERIOD FILTER HANDLER
// ------------------------------------------
function setAnalyticsPeriod(period, btn) {
  document.querySelectorAll('.analytics-period-btn').forEach(b => {
    b.classList.remove('active', 'bg-white', 'text-primary', 'shadow-xs');
    b.classList.add('text-slate-500');
  });
  if (btn) {
    btn.classList.add('active', 'bg-white', 'text-primary', 'shadow-xs');
    btn.classList.remove('text-slate-500');
  }
  const revenueEl = document.getElementById('analyticsRevenueTotal');
  if (revenueEl) {
    const dataMap = {
      week: '128 400 ₽',
      month: '542 000 ₽',
      quarter: '1 620 000 ₽',
      year: '6 480 000 ₽'
    };
    revenueEl.textContent = dataMap[period] || '128 400 ₽';
  }
}

// ------------------------------------------
// CLIENT BIZ CARD AVATAR SYNCHRONIZATION
// ------------------------------------------
function updateBizCardAvatar() {
  const bizCardImg = document.getElementById('bizCardAvatarImg');
  const bizCardFallback = document.getElementById('bizCardAvatarFallback');
  if (!bizCardImg && !bizCardFallback) return;

  let avatarUrl = '';
  try {
    const data = getProSalonData();
    if (data && data.avatarUrl) avatarUrl = data.avatarUrl;
  } catch (e) { }

  if (!avatarUrl && typeof venues !== 'undefined' && venues.length && (venues[0]?.avatarUrl || venues[0]?.avatar_url)) {
    avatarUrl = venues[0].avatarUrl || venues[0].avatar_url;
  }

  if (avatarUrl) {
    if (bizCardImg) {
      bizCardImg.src = avatarUrl;
      bizCardImg.classList.remove('hidden');
    }
    if (bizCardFallback) bizCardFallback.classList.add('hidden');
  } else {
    if (bizCardImg) {
      bizCardImg.src = '';
      bizCardImg.classList.add('hidden');
    }
    if (bizCardFallback) bizCardFallback.classList.remove('hidden');
  }
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

function formatMasterCount(count) {
  if (count === 0) return 'Мастера не назначены';
  const lastDigit = count % 10;
  const lastTwo = count % 100;
  if (lastTwo >= 11 && lastTwo <= 19) return `${count} мастеров`;
  if (lastDigit === 1) return `${count} мастер`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} мастера`;
  return `${count} мастеров`;
}

function renderProServicesList() {
  const container = document.getElementById('proServicesListContainer');
  if (!container) return;
  const data = getProSalonData();

  if (data.services.length === 0) {
    container.innerHTML = '<div class="text-center py-6 text-slate-400 text-xs">Список услуг пока пуст</div>';
    return;
  }

  container.innerHTML = data.services.map((svc, idx) => {
    const assignedMasters = (data.masters || []).filter(m =>
      Array.isArray(svc.masterIds) && (
        (m.id && svc.masterIds.includes(m.id)) ||
        (m.name && svc.masterIds.includes(m.name))
      )
    );
    const hasAssigned = assignedMasters.length > 0;
    const assignedText = formatMasterCount(assignedMasters.length);

    return `
      <div onclick="openProServiceMastersModal(${idx})"
        class="p-3.5 rounded-2xl bg-surface-container-low border border-slate-200/70 hover:border-primary/50 cursor-pointer flex items-center justify-between gap-2.5 transition-all active:scale-[0.99] group">
        <div class="flex flex-col min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-xs text-on-surface truncate group-hover:text-primary transition-colors">${svc.name}</span>
            ${svc.category ? `<span class="px-1.5 py-0.2 rounded-full bg-slate-200/60 text-slate-600 text-[9px] font-semibold">${svc.category}</span>` : ''}
          </div>
          <span class="text-[10px] text-slate-400 mt-0.5 line-clamp-1">${svc.desc || ''}</span>
          <div class="flex items-center flex-wrap gap-2 mt-1">
            <span class="text-xs font-extrabold text-primary">${(svc.price || 0).toLocaleString('ru-RU')} ₽</span>
            <span class="text-[10px] text-slate-400">• ${svc.duration || 60} мин</span>
            ${svc.photos?.length ? `<span class="text-[10px] text-slate-400">• 📷 ${svc.photos.length}</span>` : ''}
            <span class="inline-flex items-center gap-0.5 text-[10px] ${hasAssigned ? 'text-indigo-600 font-semibold bg-indigo-50/90 px-1.5 py-0.5 rounded-md' : 'text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-md'}">
              <span class="material-symbols-outlined text-[12px]">group</span>
              <span>${assignedText}</span>
            </span>
          </div>
        </div>
        <div class="flex items-center gap-1.5 shrink-0" onclick="event.stopPropagation()">
          <button onclick="openProServiceMastersModal(${idx})" title="Закрепить мастеров за услугой"
            class="w-8 h-8 rounded-xl bg-indigo-50 text-primary hover:bg-indigo-100 flex items-center justify-center active:scale-90 transition-transform">
            <span class="material-symbols-outlined text-[16px]">group</span>
          </button>
          <button onclick="confirmProAction('Удалить услугу?', 'Вы действительно хотите удалить эту позицию из прайс-листа?', () => deleteProService(${idx}))" title="Удалить услугу"
            class="w-8 h-8 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-100 flex items-center justify-center active:scale-90 transition-transform">
            <span class="material-symbols-outlined text-[17px]">delete</span>
          </button>
        </div>
      </div>
    `;
  }).join('');
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
let uploadedMasterAvatar = '';

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
  uploadedMasterAvatar = '';
  const img = document.getElementById('newMasterAvatarPreviewImg');
  if (img) img.src = '';
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
  const salonIdent = data.id || 1;
  const masterSlug = cyrillicToLatin(masterName || 'spec');
  return `${BOT_LINK}?start=bind_master_${salonIdent}_${masterSlug}`;
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
    // Открываем модальное окно кадрирования фото с круглой направляющей 1:1
    openImageCropper(e.target.result, 'master');
  };
  reader.readAsDataURL(file);
  event.target.value = '';
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
      <div class="w-12 h-12 rounded-2xl overflow-hidden bg-indigo-50 shrink-0 border border-slate-200 flex items-center justify-center text-primary">
        ${m.avatar_url ? `<img src="${m.avatar_url}" alt="${m.name}" class="w-full h-full object-cover"/>` : `<span class="material-symbols-outlined text-[24px]">person</span>`}
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
        <button onclick="openProMasterEditModal(${idx})" title="Закрепить услуги за мастером"
          class="w-8 h-8 rounded-xl bg-indigo-50 text-primary hover:bg-indigo-100 flex items-center justify-center active:scale-90 transition-transform">
          <span class="material-symbols-outlined text-[16px]">design_services</span>
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
    const newMaster = {
      id: 'master_' + Date.now(),
      name: firstName,
      lastName: lastName,
      role_title: role,
      experience: exp,
      avatar_url: uploadedMasterAvatar,
      portfolio_photos: [...uploadedMasterPortfolio]
    };
    data.masters.push(newMaster);

    saveProSalonData(data);

    // Отправляем уведомление и синхронизацию в Telegram Bot
    const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
    const groupChatId = -5590032342;
    const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
    const salonId = data.id || 1;
    const inviteLink = getMasterInviteLink(firstName);

    // 1. Системное сообщение для сохранения мастера в PostgreSQL
    try {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupChatId,
          text: `#pro_salon_add_master|${userTgId}|${salonId}|${JSON.stringify({
            name: firstName,
            lastName: lastName,
            role_title: role,
            experience: exp,
            avatar_url: (uploadedMasterAvatar && uploadedMasterAvatar.startsWith('http')) ? uploadedMasterAvatar : ''
          })}`
        })
      }).catch(err => console.warn('[PRO] Backend master add sync error:', err));
    } catch (e) { }

    // 2. Личное уведомление в чат с ботом для владельца салона
    try {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: userTgId,
          parse_mode: 'HTML',
          text: `💇 <b>В команду салона добавлен новый мастер!</b>\n\n` +
                `🏢 Салон: <b>${data.name || 'Салон'}</b>\n` +
                `👤 Мастер: <b>${firstName} ${lastName}</b>\n` +
                `✂️ Специализация: <i>${role}</i>\n` +
                `⏳ Опыт работы: ${exp}\n\n` +
                `🔗 <i>Ссылка для привязки мастера в Telegram:</i>\n<code>${inviteLink}</code>`
        })
      }).catch(err => console.warn('[PRO] Telegram master add notification error:', err));
    } catch (e) { }

    if (firstInput) firstInput.value = '';
    if (lastInput) lastInput.value = '';
    if (roleInput) roleInput.value = '';
    if (expInput) expInput.value = '';
    uploadedMasterAvatar = '';
    const previewImg = document.getElementById('newMasterAvatarPreviewImg');
    if (previewImg) {
      previewImg.src = '';
      previewImg.classList.add('hidden');
    }
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
  const deletedMaster = data.masters[idx];
  if (deletedMaster) {
    data.masters.splice(idx, 1);
    saveProSalonData(data);
    renderProMastersList();
    showToast('Мастер удален');

    // Системное сообщение на удаление из PostgreSQL
    const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
    const groupChatId = -5590032342;
    const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
    const salonId = data.id || 1;
    try {
      fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: groupChatId,
          text: `#pro_salon_delete_master|${userTgId}|${salonId}|${deletedMaster.id || ''}|${encodeURIComponent(deletedMaster.name || '')}`
        })
      }).catch(err => console.warn('[PRO] Backend master delete sync error:', err));
    } catch (e) { }
  }
}

// ------------------------------------------
// PRO MASTER SERVICES ASSIGNMENT MODAL
// ------------------------------------------
function openProMasterEditModal(idx) {
  const data = getProSalonData();
  const master = data.masters[idx];
  if (!master) return;

  const modal = document.getElementById('proMasterEditModal');
  const idxInput = document.getElementById('editMasterIdxInput');
  const avatarEl = document.getElementById('editMasterCardAvatar');
  const nameEl = document.getElementById('editMasterCardName');
  const roleEl = document.getElementById('editMasterCardRole');
  const expEl = document.getElementById('editMasterCardExp');
  const tgEl = document.getElementById('editMasterCardTg');
  const servicesList = document.getElementById('editMasterServicesList');

  if (idxInput) idxInput.value = idx;
  if (avatarEl) {
    avatarEl.src = master.avatar_url || '';
    if (!master.avatar_url) avatarEl.classList.add('hidden');
    else avatarEl.classList.remove('hidden');
  }
  if (nameEl) nameEl.textContent = `${master.name} ${master.lastName || ''}`.trim();
  if (roleEl) roleEl.textContent = master.role_title || 'Специалист салона';
  if (expEl) expEl.textContent = `Опыт: ${master.experience || '3 года'}`;
  if (tgEl) tgEl.textContent = master.telegram_handle ? master.telegram_handle : (master.telegram_id ? `ID: ${master.telegram_id}` : 'Не привязан');

  // Render list of salon services with checkboxes
  if (servicesList) {
    if (!data.services || data.services.length === 0) {
      servicesList.innerHTML = '<div class="text-center py-4 text-xs text-slate-400">В салоне пока нет добавленных услуг. Добавьте услуги во вкладке «Услуги».</div>';
    } else {
      servicesList.innerHTML = data.services.map((svc) => {
        const isAssigned = Array.isArray(svc.masterIds) && (svc.masterIds.includes(master.id) || (master.name && svc.masterIds.includes(master.name)));
        return `
          <label class="p-2.5 rounded-xl bg-surface-container-low border border-slate-200/80 hover:border-primary/50 flex items-center justify-between gap-2 cursor-pointer transition-all">
            <div class="flex items-center gap-2.5 min-w-0">
              <input type="checkbox" name="assignServiceIds" value="${svc.id}" ${isAssigned ? 'checked' : ''} class="w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0" />
              <div class="flex flex-col min-w-0">
                <span class="text-xs font-semibold text-on-surface truncate">${svc.name}</span>
                <span class="text-[10px] text-slate-400 truncate">${svc.category || 'Услуга'} • ${svc.duration || 60} мин</span>
              </div>
            </div>
            <span class="text-xs font-bold text-primary shrink-0">${(svc.price || 0).toLocaleString('ru-RU')} ₽</span>
          </label>
        `;
      }).join('');
    }
  }

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
  const idxInput = document.getElementById('editMasterIdxInput');
  const idx = parseInt(idxInput?.value || '-1', 10);
  const data = getProSalonData();
  const master = data.masters[idx];
  sendMasterInviteLink(master ? master.name : '');
}

function saveProMasterEdit() {
  const idxInput = document.getElementById('editMasterIdxInput');
  const idx = parseInt(idxInput?.value || '-1', 10);
  const data = getProSalonData();
  const master = data.masters[idx];

  if (!master) {
    showToast('Мастер не найден');
    return;
  }

  // Получаем отмеченные чекбоксы услуг
  const checkedBoxes = document.querySelectorAll('input[name="assignServiceIds"]:checked');
  const selectedServiceIds = Array.from(checkedBoxes).map(cb => cb.value);

  // Обновляем привязку во всех услугах салона
  data.services.forEach(svc => {
    if (!Array.isArray(svc.masterIds)) {
      svc.masterIds = [];
    }
    const shouldHave = selectedServiceIds.includes(svc.id);
    const hasId = svc.masterIds.includes(master.id);
    const hasName = master.name && svc.masterIds.includes(master.name);

    if (shouldHave) {
      if (!hasId) {
        svc.masterIds.push(master.id);
      }
    } else {
      svc.masterIds = svc.masterIds.filter(id => id !== master.id && id !== master.name);
    }
  });

  saveProSalonData(data);
  syncProSalonUI();
  if (typeof renderProServicesList === 'function') {
    renderProServicesList();
  }
  closeProMasterEditModal();
  showToast(`Услуги для мастера ${master.name} закреплены ✓`);
}

// ------------------------------------------
// PRO SERVICE MASTERS ASSIGNMENT MODAL
// ------------------------------------------
function openProServiceMastersModal(idx) {
  const data = getProSalonData();
  const svc = data.services[idx];
  if (!svc) return;

  const modal = document.getElementById('proServiceMastersModal');
  const idxInput = document.getElementById('editServiceIdxInput');
  const nameEl = document.getElementById('editServiceCardName');
  const catEl = document.getElementById('editServiceCardCategory');
  const descEl = document.getElementById('editServiceCardDesc');
  const priceEl = document.getElementById('editServiceCardPrice');
  const durEl = document.getElementById('editServiceCardDuration');
  const photoEl = document.getElementById('editServiceCardPhoto');
  const iconEl = document.getElementById('editServiceCardIcon');
  const mastersList = document.getElementById('editServiceMastersList');

  if (idxInput) idxInput.value = idx;
  if (nameEl) nameEl.textContent = svc.name || 'Без названия';
  if (catEl) {
    catEl.textContent = svc.category || 'Услуга';
    catEl.style.display = svc.category ? 'inline-block' : 'none';
  }
  if (descEl) {
    descEl.textContent = svc.desc || 'Описание отсутствует';
  }
  if (priceEl) {
    priceEl.textContent = `${(svc.price || 0).toLocaleString('ru-RU')} ₽`;
  }
  if (durEl) {
    durEl.textContent = `• ${svc.duration || 60} мин`;
  }
  if (photoEl && iconEl) {
    if (svc.photos && svc.photos.length > 0 && svc.photos[0]) {
      photoEl.src = svc.photos[0];
      photoEl.classList.remove('hidden');
      iconEl.classList.add('hidden');
    } else {
      photoEl.src = '';
      photoEl.classList.add('hidden');
      iconEl.classList.remove('hidden');
    }
  }

  // Render list of masters with checkboxes
  if (mastersList) {
    if (!data.masters || data.masters.length === 0) {
      mastersList.innerHTML = `
        <div class="text-center py-6 px-4 flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <span class="material-symbols-outlined text-[20px]">person_off</span>
          </div>
          <span class="text-xs text-slate-400 font-medium">В салоне пока нет добавленных мастеров</span>
          <button type="button" onclick="closeProServiceMastersModal(); openProAddMasterModal();"
            class="text-[11px] text-primary font-bold hover:underline mt-1">
            + Добавить мастера в команду
          </button>
        </div>
      `;
    } else {
      mastersList.innerHTML = data.masters.map((m) => {
        const isAssigned = Array.isArray(svc.masterIds) && (
          (m.id && svc.masterIds.includes(m.id)) ||
          (m.name && svc.masterIds.includes(m.name))
        );
        return `
          <label class="p-2.5 rounded-xl bg-surface-container-low border border-slate-200/80 hover:border-primary/50 flex items-center justify-between gap-2.5 cursor-pointer transition-all">
            <div class="flex items-center gap-2.5 min-w-0 flex-1">
              <input type="checkbox" name="assignMasterIds" value="${m.id}" ${isAssigned ? 'checked' : ''}
                class="w-4 h-4 rounded text-primary accent-primary cursor-pointer shrink-0" />
              <div class="w-10 h-10 rounded-2xl overflow-hidden bg-indigo-50 shrink-0 border border-slate-200 flex items-center justify-center text-primary">
                ${m.avatar_url ? `<img src="${m.avatar_url}" alt="${m.name}" class="w-full h-full object-cover"/>` : `<span class="material-symbols-outlined text-[20px]">person</span>`}
              </div>
              <div class="flex flex-col min-w-0 flex-1">
                <span class="text-xs font-semibold text-on-surface truncate">${m.name} ${m.lastName || ''}</span>
                <span class="text-[10px] text-slate-400 truncate">${m.role_title || 'Специалист'} • Опыт: ${m.experience || '—'}</span>
              </div>
            </div>
            ${m.telegram_handle ? `<span class="text-[10px] font-semibold text-primary bg-indigo-50/80 px-2 py-0.5 rounded-md shrink-0">${m.telegram_handle}</span>` : ''}
          </label>
        `;
      }).join('');
    }
  }

  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function closeProServiceMastersModal() {
  const modal = document.getElementById('proServiceMastersModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

function saveProServiceMastersEdit() {
  const idxInput = document.getElementById('editServiceIdxInput');
  const idx = parseInt(idxInput?.value || '-1', 10);
  const data = getProSalonData();
  const svc = data.services[idx];

  if (!svc) {
    showToast('Услуга не найдена');
    return;
  }

  // Получаем отмеченные чекбоксы мастеров
  const checkedBoxes = document.querySelectorAll('input[name="assignMasterIds"]:checked');
  const selectedMasterIds = Array.from(checkedBoxes).map(cb => cb.value);

  // Обновляем список мастеров для данной услуги
  svc.masterIds = selectedMasterIds;

  saveProSalonData(data);
  syncProSalonUI();
  renderProServicesList();
  if (typeof renderProMastersList === 'function') {
    renderProMastersList();
  }
  closeProServiceMastersModal();
  showToast(`Мастера для услуги «${svc.name}» закреплены ✓`);
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

// ------------------------------------------
// PRO SALON ADDRESS PICKER MAP LOGIC
// ------------------------------------------
let proAddressPickerMap = null;
let currentPickedAddress = '';
let currentPickedCoords = [55.767500, 37.607800];
let currentPickedCity = '';
let currentPickedCityKey = 'moscow';
let geocodeDebounceTimer = null;
let proMapSearchDebounceTimer = null;

function openProAddressPickerModal() {
  const modal = document.getElementById('proAddressPickerModal');
  if (!modal) return;

  const data = getProSalonData();
  
  // Set initial coordinates
  if (data.latitude && data.longitude) {
    currentPickedCoords = [Number(data.latitude), Number(data.longitude)];
  } else if (data.cityKey && typeof REGION_CENTERS !== 'undefined' && REGION_CENTERS[data.cityKey]) {
    currentPickedCoords = [...REGION_CENTERS[data.cityKey].center];
    currentPickedCityKey = data.cityKey;
  } else {
    currentPickedCoords = [55.767500, 37.607800];
    currentPickedCityKey = 'moscow';
  }

  currentPickedAddress = data.address || '';
  currentPickedCity = data.city || '';

  modal.classList.remove('hidden');
  modal.classList.add('flex');

  // Render city dropdown items
  renderProMapCityDropdown();
  updateProMapCityButtonUI();

  // Update initial labels
  const selAddrEl = document.getElementById('proMapSelectedAddressText');
  const selCoordsEl = document.getElementById('proMapSelectedCoordsText');
  const badgeTextEl = document.getElementById('proMapPinBadgeText');

  if (selAddrEl) {
    selAddrEl.textContent = currentPickedAddress || 'Перемещайте карту для выбора адреса...';
  }
  if (selCoordsEl) {
    selCoordsEl.textContent = `Координаты: ${currentPickedCoords[0].toFixed(6)}, ${currentPickedCoords[1].toFixed(6)}`;
  }
  if (badgeTextEl) {
    badgeTextEl.textContent = currentPickedAddress || 'Определяем адрес...';
  }

  // Clear search input
  const searchInput = document.getElementById('proMapSearchInput');
  if (searchInput) searchInput.value = '';
  const searchClearBtn = document.getElementById('proMapSearchClearBtn');
  if (searchClearBtn) searchClearBtn.classList.add('hidden');
  const suggestionsBox = document.getElementById('proMapSearchSuggestions');
  if (suggestionsBox) {
    suggestionsBox.classList.add('hidden');
    suggestionsBox.innerHTML = '';
  }

  // Init or resize map
  setTimeout(() => {
    initProAddressPickerMap();
  }, 100);
}

function closeProAddressPickerModal() {
  const modal = document.getElementById('proAddressPickerModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
  closeProMapCityDropdown();
  const suggestionsBox = document.getElementById('proMapSearchSuggestions');
  if (suggestionsBox) suggestionsBox.classList.add('hidden');
}

function initProAddressPickerMap() {
  if (typeof ymaps === 'undefined') {
    console.warn('[PRO Map] Yandex Maps API not loaded yet');
    return;
  }

  ymaps.ready(() => {
    const container = document.getElementById('proAddressPickerMap');
    if (!container) return;

    if (!proAddressPickerMap) {
      proAddressPickerMap = new ymaps.Map('proAddressPickerMap', {
        center: currentPickedCoords,
        zoom: 16,
        controls: ['zoomControl', 'geolocationControl']
      }, {
        suppressMapOpenBlock: true
      });

      // Listen to map bounds change / panning stop
      proAddressPickerMap.events.add('actionend', () => {
        onProMapMoved();
      });

      proAddressPickerMap.events.add('boundschange', () => {
        onProMapMoved();
      });
    } else {
      proAddressPickerMap.container.fitToViewport();
      proAddressPickerMap.setCenter(currentPickedCoords, 16, { checkZoomRange: true });
    }

    // Trigger initial reverse geocode
    onProMapMoved(true);
  });
}

function onProMapMoved(immediate = false) {
  if (!proAddressPickerMap) return;

  const center = proAddressPickerMap.getCenter();
  currentPickedCoords = [center[0], center[1]];

  const selCoordsEl = document.getElementById('proMapSelectedCoordsText');
  if (selCoordsEl) {
    selCoordsEl.textContent = `Координаты: ${center[0].toFixed(6)}, ${center[1].toFixed(6)}`;
  }

  const badgeTextEl = document.getElementById('proMapPinBadgeText');
  if (badgeTextEl && !immediate) {
    badgeTextEl.textContent = 'Определяем адрес...';
  }

  if (geocodeDebounceTimer) {
    clearTimeout(geocodeDebounceTimer);
  }

  const delay = immediate ? 0 : 300;
  geocodeDebounceTimer = setTimeout(() => {
    reverseGeocodeProMapCoords(center);
  }, delay);
}

function reverseGeocodeProMapCoords(coords) {
  if (!coords || !Array.isArray(coords) || coords.length < 2) return;
  const lat = Number(coords[0]);
  const lon = Number(coords[1]);

  const updateUIWithAddress = (fullAddress, shortAddress, city) => {
    currentPickedAddress = fullAddress;
    if (city) currentPickedCity = city;

    const selAddrEl = document.getElementById('proMapSelectedAddressText');
    if (selAddrEl) {
      selAddrEl.textContent = fullAddress;
    }

    const badgeTextEl = document.getElementById('proMapPinBadgeText');
    if (badgeTextEl) {
      badgeTextEl.textContent = shortAddress || fullAddress;
    }
  };

  // 1. Попытка через Yandex Maps API 2.1
  if (typeof ymaps !== 'undefined' && ymaps.geocode) {
    ymaps.geocode([lat, lon], { results: 1, json: false }).then((res) => {
      const firstGeoObject = res.geoObjects.get(0);
      if (firstGeoObject) {
        let fullAddress = '';
        if (typeof firstGeoObject.getAddressLine === 'function') {
          fullAddress = firstGeoObject.getAddressLine();
        }
        if (!fullAddress && firstGeoObject.properties) {
          fullAddress = firstGeoObject.properties.get('text') || firstGeoObject.properties.get('name') || '';
        }

        // Краткое название (улица + дом или имя объекта)
        let shortAddress = '';
        if (firstGeoObject.properties) {
          shortAddress = firstGeoObject.properties.get('name') || '';
        }
        if (!shortAddress && typeof firstGeoObject.getThoroughfare === 'function') {
          const street = firstGeoObject.getThoroughfare();
          const house = typeof firstGeoObject.getPremiseNumber === 'function' ? firstGeoObject.getPremiseNumber() : '';
          if (street) shortAddress = street + (house ? `, ${house}` : '');
        }

        // Город
        let detectedCity = '';
        if (typeof firstGeoObject.getLocalities === 'function') {
          const locs = firstGeoObject.getLocalities();
          if (locs && locs.length) detectedCity = locs[0];
        }
        if (!detectedCity && firstGeoObject.properties) {
          const meta = firstGeoObject.properties.get('metaDataProperty')?.GeocoderMetaData?.AddressDetails;
          detectedCity = meta?.Country?.AdministrativeArea?.SubAdministrativeArea?.Locality?.LocalityName || '';
        }

        if (fullAddress) {
          updateUIWithAddress(fullAddress, shortAddress || fullAddress, detectedCity);
          return;
        }
      }

      // Если Яндекс вернул пустой результат, пробуем запасной быстрый геокодер
      fallbackReverseGeocode(lat, lon, updateUIWithAddress);
    }).catch((err) => {
      console.warn('[PRO Map] Yandex geocode error, switching to fallback:', err);
      fallbackReverseGeocode(lat, lon, updateUIWithAddress);
    });
  } else {
    fallbackReverseGeocode(lat, lon, updateUIWithAddress);
  }
}

// Запасной быстрый реверс-геокодинг по координатам (OpenStreetMap / Nominatim)
function fallbackReverseGeocode(lat, lon, callback) {
  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&addressdetails=1&accept-language=ru`)
    .then(r => r.json())
    .then(data => {
      if (!data || !data.display_name) return;
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.state || '';
      const street = addr.road || addr.street || '';
      const house = addr.house_number || '';

      let short = '';
      if (street) {
        short = street + (house ? `, ${house}` : '');
      } else {
        short = data.name || data.display_name.split(',')[0];
      }

      // Формируем чистый российский адрес (Город, Улица, Дом)
      let full = '';
      if (city && short) {
        full = `${city}, ${short}`;
      } else {
        full = data.display_name;
      }

      callback(full, short, city);
    })
    .catch(err => {
      console.warn('[PRO Map] Fallback geocode error:', err);
      const selAddrEl = document.getElementById('proMapSelectedAddressText');
      if (selAddrEl && (!currentPickedAddress || currentPickedAddress === 'Перемещайте карту для выбора адреса...')) {
        selAddrEl.textContent = `Точка: ${lat.toFixed(6)}, ${lon.toFixed(6)}`;
      }
    });
}

// Top-left City Selector
function toggleProMapCityDropdown(e) {
  if (e) e.stopPropagation();
  const dropdown = document.getElementById('proMapCityDropdown');
  if (!dropdown) return;
  const isHidden = dropdown.classList.contains('hidden');
  if (isHidden) {
    dropdown.classList.remove('hidden');
    dropdown.classList.add('flex');
  } else {
    dropdown.classList.add('hidden');
    dropdown.classList.remove('flex');
  }
}

function closeProMapCityDropdown() {
  const dropdown = document.getElementById('proMapCityDropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
    dropdown.classList.remove('flex');
  }
}

function renderProMapCityDropdown() {
  const dropdown = document.getElementById('proMapCityDropdown');
  if (!dropdown || typeof CITY_CONFIG === 'undefined') return;

  const cityKeys = Object.keys(CITY_CONFIG);

  dropdown.innerHTML = cityKeys.map(k => {
    const c = CITY_CONFIG[k];
    const isSelected = k === currentPickedCityKey;
    return `
      <button type="button" onclick="selectProMapCity('${k}')"
        class="w-full text-left px-3 py-2 rounded-xl flex items-center justify-between transition-all ${isSelected ? 'bg-primary/10 text-primary font-bold' : 'text-slate-700 hover:bg-slate-50 font-medium'} text-xs">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-sm shrink-0">${c.icon || '📍'}</span>
          <span class="truncate">${c.name}</span>
        </div>
        ${isSelected ? '<span class="material-symbols-outlined text-[16px] text-primary">check</span>' : ''}
      </button>
    `;
  }).join('');
}

function updateProMapCityButtonUI() {
  const nameEl = document.getElementById('proMapCityName');
  const iconEl = document.getElementById('proMapCityIcon');
  if (typeof CITY_CONFIG !== 'undefined' && CITY_CONFIG[currentPickedCityKey]) {
    const c = CITY_CONFIG[currentPickedCityKey];
    if (nameEl) nameEl.textContent = c.short || c.name;
    if (iconEl) iconEl.textContent = c.icon || '📍';
  }
}

function selectProMapCity(cityKey) {
  currentPickedCityKey = cityKey;
  closeProMapCityDropdown();
  updateProMapCityButtonUI();

  if (typeof CITY_CONFIG !== 'undefined' && CITY_CONFIG[cityKey]) {
    currentPickedCity = CITY_CONFIG[cityKey].name;
  }

  if (typeof REGION_CENTERS !== 'undefined' && REGION_CENTERS[cityKey] && proAddressPickerMap) {
    const target = REGION_CENTERS[cityKey];
    proAddressPickerMap.setCenter(target.center, target.zoom || 13, {
      duration: 500,
      timingFunction: 'ease-in-out'
    });
  }
}

// Search & Autocomplete
function handleProMapSearchInput(query) {
  const clearBtn = document.getElementById('proMapSearchClearBtn');
  const suggestionsBox = document.getElementById('proMapSearchSuggestions');
  const cleanQ = (query || '').trim();

  if (clearBtn) {
    clearBtn.classList.toggle('hidden', !cleanQ);
  }

  if (!cleanQ) {
    if (suggestionsBox) {
      suggestionsBox.classList.add('hidden');
      suggestionsBox.innerHTML = '';
    }
    return;
  }

  if (proMapSearchDebounceTimer) clearTimeout(proMapSearchDebounceTimer);

  proMapSearchDebounceTimer = setTimeout(() => {
    fetchProMapSuggestions(cleanQ);
  }, 300);
}

function clearProMapSearch() {
  const input = document.getElementById('proMapSearchInput');
  if (input) input.value = '';
  handleProMapSearchInput('');
}

function fetchProMapSuggestions(query) {
  const suggestionsBox = document.getElementById('proMapSearchSuggestions');
  if (!suggestionsBox) return;

  const renderSuggestions = (items) => {
    if (!items || items.length === 0) {
      suggestionsBox.innerHTML = '<div class="px-3 py-2 text-xs text-slate-400">Ничего не найдено</div>';
      suggestionsBox.classList.remove('hidden');
      suggestionsBox.classList.add('flex');
      return;
    }

    suggestionsBox.innerHTML = items.map((item) => {
      const title = (item.title || item.value || item.displayName || '').replace(/"/g, '&quot;');
      const subtitle = (item.subtitle || '').replace(/"/g, '&quot;');
      const lat = item.lat || '';
      const lon = item.lon || '';
      return `
        <button type="button" onclick="selectProMapSuggestion('${title.replace(/'/g, "\\'")}', '${lat}', '${lon}')"
          class="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-50 active:bg-primary/10 transition-colors flex items-center gap-2 border-b border-slate-100 last:border-b-0 text-xs">
          <span class="material-symbols-outlined text-[16px] text-primary shrink-0">location_on</span>
          <div class="flex flex-col min-w-0">
            <span class="truncate font-medium text-slate-800">${title}</span>
            ${subtitle ? `<span class="truncate text-[10px] text-slate-400">${subtitle}</span>` : ''}
          </div>
        </button>
      `;
    }).join('');
    suggestionsBox.classList.remove('hidden');
    suggestionsBox.classList.add('flex');
  };

  // Формируем поисковый запрос с учетом выбранного города
  const isCityScoped = currentPickedCityKey && currentPickedCityKey !== 'all';
  const cityName = isCityScoped && typeof CITY_CONFIG !== 'undefined' && CITY_CONFIG[currentPickedCityKey]
    ? CITY_CONFIG[currentPickedCityKey].name
    : '';

  // Если выбран конкретный город и пользователь еще не набрал название города, добавляем префикс для точности
  let searchQuery = query;
  if (isCityScoped && cityName && !query.toLowerCase().includes(cityName.toLowerCase())) {
    searchQuery = `${cityName}, ${query}`;
  }

  // 1. Попытка через ymaps.suggest
  if (typeof ymaps !== 'undefined' && ymaps.suggest) {
    const opts = { results: 5 };

    // Если выбран конкретный город, ограничиваем поиск границами этого региона
    if (isCityScoped && typeof REGION_CENTERS !== 'undefined' && REGION_CENTERS[currentPickedCityKey]) {
      const rc = REGION_CENTERS[currentPickedCityKey].center;
      const d = 0.25; // Примерно 25-30 км вокруг центра города
      opts.boundedBy = [
        [rc[0] - d, rc[1] - d],
        [rc[0] + d, rc[1] + d]
      ];
      opts.strictBounds = true;
    } else if (proAddressPickerMap) {
      opts.boundedBy = proAddressPickerMap.getBounds();
    }

    ymaps.suggest(searchQuery, opts).then((res) => {
      if (res && res.length > 0) {
        // Фильтруем результаты, чтобы они соответствовали выбранному городу
        let filtered = res;
        if (isCityScoped && cityName) {
          const cityLower = cityName.toLowerCase();
          const strictMatches = res.filter(i => {
            const desc = (i.description || '').toLowerCase();
            const val = (i.value || i.displayName || '').toLowerCase();
            return desc.includes(cityLower) || val.includes(cityLower);
          });
          if (strictMatches.length > 0) {
            filtered = strictMatches;
          }
        }

        const formatted = filtered.map(i => ({
          title: i.displayName || i.value,
          value: i.value,
          subtitle: i.description || ''
        }));
        renderSuggestions(formatted);
      } else {
        fallbackSearchGeocode(searchQuery, renderSuggestions);
      }
    }).catch(() => {
      fallbackSearchGeocode(searchQuery, renderSuggestions);
    });
  } else {
    fallbackSearchGeocode(searchQuery, renderSuggestions);
  }
}

function fallbackSearchGeocode(query, callback) {
  const isCityScoped = currentPickedCityKey && currentPickedCityKey !== 'all';
  const cityName = isCityScoped && typeof CITY_CONFIG !== 'undefined' && CITY_CONFIG[currentPickedCityKey]
    ? CITY_CONFIG[currentPickedCityKey].name
    : '';

  // Попытка через ymaps.geocode
  if (typeof ymaps !== 'undefined' && ymaps.geocode) {
    const geoOpts = { results: 5 };
    if (isCityScoped && typeof REGION_CENTERS !== 'undefined' && REGION_CENTERS[currentPickedCityKey]) {
      const rc = REGION_CENTERS[currentPickedCityKey].center;
      const d = 0.3;
      geoOpts.boundedBy = [
        [rc[0] - d, rc[1] - d],
        [rc[0] + d, rc[1] + d]
      ];
      geoOpts.strictBounds = true;
    }

    ymaps.geocode(query, geoOpts).then((res) => {
      let geoObjects = res.geoObjects.toArray();
      if (isCityScoped && cityName && geoObjects.length > 0) {
        const cityLower = cityName.toLowerCase();
        const cityFiltered = geoObjects.filter(obj => {
          const line = (obj.getAddressLine() || '').toLowerCase();
          const desc = (obj.properties.get('description') || '').toLowerCase();
          return line.includes(cityLower) || desc.includes(cityLower);
        });
        if (cityFiltered.length > 0) {
          geoObjects = cityFiltered;
        }
      }

      if (geoObjects && geoObjects.length > 0) {
        const formatted = geoObjects.map(obj => {
          const coords = obj.geometry.getCoordinates();
          return {
            title: obj.getAddressLine() || obj.properties.get('name') || query,
            subtitle: obj.properties.get('description') || '',
            lat: coords ? coords[0] : '',
            lon: coords ? coords[1] : ''
          };
        });
        callback(formatted);
        return;
      }
      nominatimSearch(query, callback);
    }).catch(() => {
      nominatimSearch(query, callback);
    });
  } else {
    nominatimSearch(query, callback);
  }
}

function nominatimSearch(query, callback) {
  const isCityScoped = currentPickedCityKey && currentPickedCityKey !== 'all';
  let viewboxParam = '';
  if (isCityScoped && typeof REGION_CENTERS !== 'undefined' && REGION_CENTERS[currentPickedCityKey]) {
    const rc = REGION_CENTERS[currentPickedCityKey].center;
    const d = 0.3;
    // Nominatim viewbox format: left,top,right,bottom (lon1,lat1,lon2,lat2)
    viewboxParam = `&viewbox=${rc[1] - d},${rc[0] + d},${rc[1] + d},${rc[0] - d}&bounded=1`;
  }

  fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&accept-language=ru&countrycodes=ru${viewboxParam}`)
    .then(r => r.json())
    .then(items => {
      if (!items || !items.length) {
        callback([]);
        return;
      }
      const formatted = items.map(i => ({
        title: i.display_name.split(',')[0],
        subtitle: i.display_name.split(',').slice(1, 4).join(',').trim(),
        lat: parseFloat(i.lat),
        lon: parseFloat(i.lon)
      }));
      callback(formatted);
    })
    .catch(() => callback([]));
}

function selectProMapSuggestion(address, lat, lon) {
  const input = document.getElementById('proMapSearchInput');
  if (input) input.value = address;
  const suggestionsBox = document.getElementById('proMapSearchSuggestions');
  if (suggestionsBox) {
    suggestionsBox.classList.add('hidden');
    suggestionsBox.classList.remove('flex');
  }

  // Если координаты переданы напрямую
  if (lat && lon && proAddressPickerMap) {
    const coords = [parseFloat(lat), parseFloat(lon)];
    proAddressPickerMap.setCenter(coords, 16, {
      duration: 600,
      flying: true
    });
    return;
  }

  if (typeof ymaps === 'undefined' || !ymaps.geocode || !proAddressPickerMap) return;

  ymaps.geocode(address, { results: 1 }).then((res) => {
    const firstGeoObject = res.geoObjects.get(0);
    if (!firstGeoObject) return;

    const coords = firstGeoObject.geometry.getCoordinates();
    proAddressPickerMap.setCenter(coords, 16, {
      duration: 600,
      flying: true
    });
  }).catch(err => console.warn('[PRO Map] Geocode suggestion error:', err));
}

// Confirmation
function confirmProMapSelectedAddress() {
  if (!currentPickedAddress) {
    showToast('Пожалуйста, выберите корректный адрес на карте');
    return;
  }

  const data = getProSalonData();
  data.address = currentPickedAddress;
  data.latitude = currentPickedCoords[0];
  data.longitude = currentPickedCoords[1];
  if (currentPickedCity) {
    data.city = currentPickedCity;
  }
  if (currentPickedCityKey) {
    data.cityKey = currentPickedCityKey;
  }

  saveProSalonData(data);
  closeProAddressPickerModal();
  showToast('Адрес салона успешно сохранен ✓');

  try {
    if (window.Telegram?.WebApp?.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
    }
  } catch (e) { }
}
