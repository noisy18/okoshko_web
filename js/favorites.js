// ==========================================
    // FAVORITES (ИЗБРАННОЕ) SYSTEM
    // ==========================================
    const DEFAULT_FAVORITE_IDS = ['beauty', 'mono', 'spb_nevsky_glam', 'rostov_golden_blade'];

    function getStoredFavorites() {
      try {
        const raw = localStorage.getItem('okoshko_favorites');
        if (raw) return JSON.parse(raw);
      } catch (e) { }
      return [...DEFAULT_FAVORITE_IDS];
    }

    function setStoredFavorites(favIds) {
      try {
        localStorage.setItem('okoshko_favorites', JSON.stringify(favIds));
      } catch (e) { }
      updateFavoritesUI();
    }

    function isVenueFavorite(venueId) {
      const favs = getStoredFavorites();
      return favs.includes(venueId);
    }

    function toggleFavoriteSalon(btn, venueId) {
      const targetId = venueId || state.activeSalon || 'beauty';
      let favs = getStoredFavorites();
      const exists = favs.includes(targetId);
      const venue = venues.find(v => v.id === targetId);
      const venueName = venue ? venue.name : 'Салон';

      if (exists) {
        favs = favs.filter(id => id !== targetId);
        showToast(`«${venueName}» убран из Избранного`);
      } else {
        favs.push(targetId);
        showToast(`«${venueName}» добавлен в Избранное ❤️`);
      }

      setStoredFavorites(favs);

      // Trigger Haptic Feedback
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred(exists ? 'warning' : 'success');
        }
      } catch (e) { }

      // Update screen-salon favorite heart icon if on salon screen
      updateSalonDetailsHeartUI();

      // If currently on favorites screen, re-render
      if (state.currentScreen === 'favorites') {
        renderFavorites();
      }
    }

    function updateFavoritesUI() {
      const favs = getStoredFavorites();
      const count = favs.length;

      const pCount = document.getElementById('profileFavsCount');
      if (pCount) pCount.textContent = count;

      const pRow = document.getElementById('profileFavsRowBadge');
      if (pRow) pRow.textContent = `${count} ${pluralizePlaces(count)} ›`;

      const bBadge = document.getElementById('favoritesCountBadge');
      if (bBadge) bBadge.textContent = `${count} ${pluralizePlaces(count)}`;
    }

    function pluralizePlaces(n) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod100 >= 11 && mod100 <= 19) return 'мест';
      if (mod10 === 1) return 'место';
      if (mod10 >= 2 && mod10 <= 4) return 'места';
      return 'мест';
    }

    function updateSalonDetailsHeartUI() {
      const salonHeart = document.querySelector('#screen-salon button[aria-label="Избранное"] span');
      if (salonHeart) {
        const isFav = isVenueFavorite(state.activeSalon);
        salonHeart.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
        salonHeart.className = `material-symbols-outlined text-[18px] ${isFav ? 'text-rose-500' : 'text-slate-400'}`;
      }
    }

    function renderFavorites() {
      const favIds = getStoredFavorites();
      const container = document.getElementById('favoritesList');
      updateFavoritesUI();
      if (!container) return;

      const favVenues = favIds.map(id => venues.find(v => v.id === id)).filter(Boolean);

      if (favVenues.length === 0) {
        container.innerHTML = `
          <div class="rounded-3xl bg-white p-6 shadow-xs border border-slate-200/70 text-center flex flex-col items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
              <span class="material-symbols-outlined text-[28px]">favorite_border</span>
            </div>
            <div>
              <h3 class="font-bold text-sm text-on-surface">Список избранного пуст</h3>
              <p class="text-xs text-slate-400 mt-1 max-w-[240px]">Добавляйте понравившиеся салоны и мастеров, нажимая на сердечко</p>
            </div>
            <button onclick="router.navigate('map')" class="mt-1 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold shadow-xs active:scale-95 transition-transform flex items-center gap-1.5">
              <span>Смотреть салоны на карте</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
        `;
        return;
      }

      container.innerHTML = favVenues.map(v => `
        <div id="fav-card-${v.id}" class="rounded-3xl bg-white p-4 shadow-xs border border-slate-200/70 flex flex-col gap-3 relative overflow-hidden animate-in fade-in duration-200">
          <div class="flex items-center justify-between">
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-semibold">
              <span class="material-symbols-outlined text-[12px]">location_on</span>
              <span>${v.regionName || v.address}</span>
            </span>
            <div class="flex items-center gap-1.5">
              <div class="flex items-center gap-0.5 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/40">
                <span class="material-symbols-outlined text-amber-500 text-[13px]" style="font-variation-settings: 'FILL' 1;">star</span>
                <span class="text-xs font-bold text-amber-900">${v.rating}</span>
                <span class="text-[10px] text-amber-700/70">(${v.reviewsCount})</span>
              </div>
              <!-- Heart toggle button -->
              <button onclick="toggleFavoriteSalon(this, '${v.id}')" aria-label="Убрать из избранного" class="w-8 h-8 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center active:scale-90 transition-all shadow-2xs">
                <span class="material-symbols-outlined text-[18px]" style="font-variation-settings: 'FILL' 1;">favorite</span>
              </button>
            </div>
          </div>

          <!-- Studio Info Row -->
          <div class="flex gap-3.5 items-center cursor-pointer" onclick="openVenueDetails('${v.id}')">
            <div class="relative w-16 h-16 rounded-2xl overflow-hidden bg-surface-container shrink-0 shadow-xs">
              <img class="w-full h-full object-cover" alt="${v.name}" src="${v.img}"/>
              <div class="absolute bottom-1 right-1 px-1 py-0.2 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] flex items-center gap-0.5">
                <span class="material-symbols-outlined text-[9px]">photo_camera</span>
                <span>${v.photoCount}</span>
              </div>
            </div>
            <div class="flex flex-col min-w-0 flex-1 justify-center">
              <h2 class="font-bold text-sm text-on-surface truncate">${v.name}</h2>
              <span class="text-[11px] text-primary font-medium mt-0.5 truncate">${v.type}</span>
              <p class="text-[11px] text-slate-400 mt-0.5 truncate">${v.categoryText}</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <span class="text-xs font-bold text-primary">${v.priceFrom}</span>
            <div class="flex items-center gap-2">
              <button onclick="event.stopPropagation(); selectMapPin('${v.id}', true); router.navigate('map')" class="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs active:scale-95 transition-all flex items-center gap-1">
                <span class="material-symbols-outlined text-[15px]">explore</span>
                <span>На карте</span>
              </button>
              <button onclick="openVenueDetails('${v.id}')" class="py-2 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-semibold text-xs active:scale-95 transition-all flex items-center gap-1 shadow-xs">
                <span>Записаться</span>
                <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      `).join('');
    }

    // Quick Options Dropdown in Top Header
    function toggleQuickOptionsDropdown(e) {
      if (e) e.stopPropagation();
      const menu = document.getElementById('headerQuickOptionsMenu');
      if (!menu) return;
      const isHidden = menu.classList.contains('hidden');
      if (isHidden) {
        menu.classList.remove('hidden');
        menu.classList.add('flex');
        try {
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
          }
        } catch (err) { }
      } else {
        closeQuickOptionsDropdown();
      }
    }

    function closeQuickOptionsDropdown() {
      const menu = document.getElementById('headerQuickOptionsMenu');
      if (menu) {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
      }
    }

    // Close dropdown on outside tap / click
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('headerQuickOptionsMenu');
      const btn = document.getElementById('headerMoreBtn');
      if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && !btn?.contains(e.target)) {
          closeQuickOptionsDropdown();
        }
      }
    });

    // Share Mini App action
    function shareMiniApp() {
      closeQuickOptionsDropdown();
      const shareUrl = 'https://t.me/okooshko_bot';
      const shareText = '💅 Записывайся в лучшие салоны красоты и к мастерам города в сервисе «Окошко» через Telegram!';
      const tgShareLink = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;

      try {
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(tgShareLink);
          return;
        }
      } catch (e) { }

      // Fallback for browser or if WebApp method unavailable
      if (navigator.share) {
        navigator.share({
          title: 'Сервис «Окошко»',
          text: shareText,
          url: shareUrl
        }).catch(() => { });
      } else {
        window.open(tgShareLink, '_blank');
        showToast('Ссылка скопирована для отправки 🔗');
      }
    }

    // Open Support Chat with prefilled text: "Здравствуйте! У меня есть вопрос"
    function openSupportChat() {
      closeQuickOptionsDropdown();
      const supportUsername = 'okooshko_support';
      const prefilledText = 'Здравствуйте! У меня есть вопрос';
      const supportUrl = `https://t.me/${supportUsername}?text=${encodeURIComponent(prefilledText)}`;

      try {
        if (window.Telegram?.WebApp?.openTelegramLink) {
          window.Telegram.WebApp.openTelegramLink(supportUrl);
          return;
        }
      } catch (e) { }

      // Fallback: standard open
      window.open(supportUrl, '_blank');
    }

    function showTelegramChatAlert() {
      openSupportChat();
    }

    function openPhotoModal(el) {
      showToast('Просмотр фото салона (HD)');
    }

    // Toast helper
    function showToast(msg) {
      const toast = document.getElementById('toast');
      const text = document.getElementById('toastMessage');
      text.textContent = msg;
      toast.classList.remove('-translate-y-20', 'opacity-0');
      toast.classList.add('translate-y-0', 'opacity-100');

      clearTimeout(window._toastTimeout);
      window._toastTimeout = setTimeout(() => {
        toast.classList.add('-translate-y-20', 'opacity-0');
        toast.classList.remove('translate-y-0', 'opacity-100');
      }, 2400);
    }

    // Mock Telegram WebApp SDK if running outside Telegram
    if (!window.Telegram) {
      window.Telegram = {
        WebApp: {
          ready: () => console.log('Telegram.WebApp.ready()'),
          expand: () => console.log('Telegram.WebApp.expand()'),
          close: () => console.log('Telegram.WebApp.close()'),
          HapticFeedback: {
            impactOccurred: (style) => console.log('Haptic impact:', style),
            notificationOccurred: (type) => console.log('Haptic notification:', type)
          },
          initDataUnsafe: {
            user: {
              id: 8949973080,
              first_name: "Пользователь",
              last_name: "Telegram",
              username: "okoshko_user",
              is_premium: true
            }
          }
        }
      };
    }

    if (window.Telegram?.WebApp) {
      window.Telegram.WebApp.ready();
      window.Telegram.WebApp.expand();
    }

    // Restore saved default city
    try {
      const savedCity = localStorage.getItem('okoshko_default_city');
      if (savedCity && CITY_CONFIG[savedCity]) {
        currentFilterRegion = savedCity;
      }
    } catch (e) { }
    updateHeaderAndProfileCityUI();

    // Initialize user profile from Telegram
    state.user = getTelegramUser();
    syncUserProfileUI(state.user);
    updateProfileRegistrationDateUI();
    renderVenuesCarousel();
    renderAppointments();
    updateFavoritesUI();

    let isAlreadyVerified = false;
    try {
      isAlreadyVerified = (localStorage.getItem('okoshko_verified') === 'true');
    } catch (e) { }

    state.verified = isAlreadyVerified;
    if (isAlreadyVerified) {
      state.screenHistory = ['map'];
      applyCombinedFilters();
      router.navigate('map', false);
      setTimeout(initYandexMap, 200);
    } else {
      state.screenHistory = [];
      router.navigate('verify', false);
    }
