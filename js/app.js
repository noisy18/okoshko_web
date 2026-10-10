// State management
    const state = {
      currentScreen: 'verify',
      screenHistory: [],
      userRole: 'client',
      selectedDate: 'Ср, 8 ноября',
      selectedTime: '14:00',
      selectedServices: [
        { id: 's1', name: 'Аппаратный маникюр + Luxio', price: 2500, duration: 90 }
      ],
      activeSalon: 'beauty',
      verified: false,
      isCaptchaVerified: false,
      user: null
    };

    // User profile extractor from Telegram WebApp
    function getTelegramUser() {
      const defaultUser = {
        id: 1205557089,
        first_name: "Максим",
        last_name: "",
        username: "maximtepin",
        is_premium: true,
        is_pro: true,
        photo_url: ""
      };

      // Check URL search params for is_pro
      let isProFromUrl = false;
      try {
        const urlParams = new URLSearchParams(window.location.search);
        isProFromUrl = (urlParams.get('is_pro') === '1');
      } catch (e) { }

      const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
      if (tgUser && (tgUser.first_name || tgUser.username || tgUser.id)) {
        const userId = tgUser.id || defaultUser.id;
        const isUserPro = isProFromUrl || (userId === 1205557089);
        return {
          id: userId,
          first_name: tgUser.first_name || 'Пользователь',
          last_name: tgUser.last_name || '',
          username: tgUser.username || '',
          is_premium: !!tgUser.is_premium,
          is_pro: isUserPro,
          photo_url: tgUser.photo_url || ''
        };
      }
      return defaultUser;
    }

    // Sync all user profile displays across screens
    function syncUserProfileUI(user) {
      if (!user) return;
      const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ') || 'Пользователь';
      const handle = user.username ? `@${user.username}` : `ID: ${user.id}`;
      const initials = ((user.first_name ? user.first_name[0] : 'Т') + (user.last_name ? user.last_name[0] : 'Г')).toUpperCase();

      // Screen 0: Verify Screen
      const vName = document.getElementById('verifyUserName');
      const vHandle = document.getElementById('verifyUserHandle');
      const vId = document.getElementById('verifyUserId');
      const vBtn = document.getElementById('verifyBtnText');
      const vPrem = document.getElementById('verifyPremiumBadge');
      const vInit = document.getElementById('verifyAvatarInitials');
      const vImg = document.getElementById('verifyAvatarImg');

      if (vName) vName.textContent = fullName;
      if (vHandle) vHandle.textContent = handle;
      if (vId) vId.textContent = `ID: ${user.id}`;
      if (vBtn) vBtn.textContent = `Продолжить как ${user.first_name || 'Пользователь'}`;
      if (vPrem) vPrem.classList.toggle('hidden', !user.is_premium);

      if (user.photo_url) {
        if (vImg) { vImg.src = user.photo_url; vImg.classList.remove('hidden'); }
        if (vInit) vInit.classList.add('hidden');
      } else {
        if (vInit) { vInit.textContent = initials; vInit.classList.remove('hidden'); }
        if (vImg) vImg.classList.add('hidden');
      }

      // Screen 5: Profile Screen
      const pName = document.getElementById('profileUserName');
      const pHandle = document.getElementById('profileUserHandle');
      const pTgId = document.getElementById('profileTgIdText');
      const pPrem = document.getElementById('profilePremiumStar');
      const pInit = document.getElementById('profileAvatarInitials');
      const pImg = document.getElementById('profileAvatarImg');

      if (pName) pName.textContent = fullName;
      if (pHandle) pHandle.textContent = handle;
      if (pTgId) pTgId.textContent = `ID: ${user.id}`;
      if (pPrem) pPrem.classList.toggle('hidden', !user.is_premium);

      if (user.photo_url) {
        if (pImg) { pImg.src = user.photo_url; pImg.classList.remove('hidden'); }
        if (pInit) pInit.classList.add('hidden');
      } else {
        if (pInit) { pInit.textContent = initials; pInit.classList.remove('hidden'); }
        if (pImg) pImg.classList.add('hidden');
      }

      // If user has PRO status in DB / Telegram
      const bizCardTitle = document.getElementById('bizCardTitle');
      const bizCardBadge = document.getElementById('bizCardBadge');
      const bizCardSub = document.getElementById('bizCardSub');
      if (user.is_pro) {
        if (bizCardTitle) bizCardTitle.textContent = 'Войти в бизнес-аккаунт';
        if (bizCardBadge) {
          bizCardBadge.textContent = 'PRO';
          bizCardBadge.className = 'px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase';
        }
        if (bizCardSub) bizCardSub.textContent = 'Управление салоном, мастерами и онлайн-записями';
      }

      // Top Header Avatar
      const hInit = document.getElementById('headerUserInitials');
      const hPhoto = document.getElementById('headerUserPhoto');
      if (user.photo_url) {
        if (hPhoto) { hPhoto.src = user.photo_url; hPhoto.classList.remove('hidden'); }
        if (hInit) hInit.classList.add('hidden');
      } else {
        if (hInit) { hInit.textContent = initials; hInit.classList.remove('hidden'); }
        if (hPhoto) hPhoto.classList.add('hidden');
      }

      // Restore saved phone & notification preferences & registration date
      try {
        updateProfilePhoneUI();
        updateProfileRegistrationDateUI();

        const savedNotif = localStorage.getItem('okoshko_tg_notifications');
        const notifToggle = document.getElementById('tgNotificationsToggle');
        if (notifToggle && savedNotif !== null) {
          notifToggle.checked = (savedNotif === 'true');
        }
      } catch (e) { }
    }

    // ==========================================
    // PHONE NUMBER MODAL & VALIDATION LOGIC
    // ==========================================
    function formatPhoneNumber(raw) {
      if (!raw) return '';
      // Extract digits only
      let digits = raw.replace(/\D/g, '');
      if (digits.length === 0) return '';
      // If starts with 7 or 8, trim the first digit because +7 is the prefix
      if (digits.startsWith('7') || digits.startsWith('8')) {
        digits = digits.substring(1);
      }
      // Limit to 10 digits
      digits = digits.substring(0, 10);

      // Build formatted string: +7 (XXX) XXX-XX-XX
      let formatted = '+7';
      if (digits.length > 0) {
        formatted += ' (' + digits.substring(0, 3);
      }
      if (digits.length >= 3) {
        formatted += ') ';
      }
      if (digits.length > 3) {
        formatted += digits.substring(3, 6);
      }
      if (digits.length >= 6) {
        formatted += '-';
      }
      if (digits.length > 6) {
        formatted += digits.substring(6, 8);
      }
      if (digits.length >= 8) {
        formatted += '-';
      }
      if (digits.length > 8) {
        formatted += digits.substring(8, 10);
      }
      return formatted;
    }

    function handlePhoneInput(input, event) {
      const val = input.value;
      if (!val || val.trim() === '') {
        input.value = '';
        document.getElementById('modalPhoneClearBtn')?.classList.add('hidden');
        return;
      }

      const formatted = formatPhoneNumber(val);
      input.value = formatted;
      document.getElementById('modalPhoneClearBtn')?.classList.remove('hidden');

      // Update hint text based on digits count
      const digits = val.replace(/\D/g, '').replace(/^[78]/, '');
      const hint = document.getElementById('phoneModalHint');
      if (hint) {
        if (digits.length === 10) {
          hint.textContent = '✓ Номер введен полностью';
          hint.className = 'text-[11px] text-emerald-600 font-semibold';
        } else {
          hint.textContent = `Осталось ввести ${10 - digits.length} цифр`;
          hint.className = 'text-[11px] text-slate-400';
        }
      }
    }

    function handlePhoneKeyDown(input, event) {
      // Disallow non-digit keys (except Control, Backspace, Delete, Arrow keys, Tab, Enter)
      const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'];
      if (allowedKeys.includes(event.key) || event.ctrlKey || event.metaKey) {
        return;
      }
      // If key is not a digit 0-9, prevent typing
      if (!/^\d$/.test(event.key)) {
        event.preventDefault();
      }
    }

    function clearModalPhone() {
      const input = document.getElementById('modalPhoneInput');
      if (input) {
        input.value = '';
        input.focus();
      }
      document.getElementById('modalPhoneClearBtn')?.classList.add('hidden');
      const hint = document.getElementById('phoneModalHint');
      if (hint) {
        hint.textContent = 'Введите 10 цифр номера (начиная после +7)';
        hint.className = 'text-[11px] text-slate-400';
      }
    }

    function updateProfilePhoneUI() {
      let savedPhone = '';
      try {
        savedPhone = localStorage.getItem('okoshko_user_phone') || '';
      } catch (e) { }

      const pSub = document.getElementById('profilePhoneSub');
      const pBadge = document.getElementById('profilePhoneBadge');
      if (savedPhone) {
        if (pSub) pSub.textContent = savedPhone;
        if (pBadge) pBadge.textContent = 'Изменить';
      } else {
        if (pSub) pSub.textContent = 'Не указан (для связи с мастером)';
        if (pBadge) pBadge.textContent = 'Указать';
      }
    }

    function openPhoneModal() {
      const modal = document.getElementById('phoneSelectModal');
      if (!modal) return;
      modal.classList.remove('hidden');
      modal.classList.add('flex');

      let savedPhone = '';
      try {
        savedPhone = localStorage.getItem('okoshko_user_phone') || '';
      } catch (e) { }

      const input = document.getElementById('modalPhoneInput');
      const removeBtn = document.getElementById('modalPhoneRemoveBtn');
      const clearBtn = document.getElementById('modalPhoneClearBtn');
      const hint = document.getElementById('phoneModalHint');

      if (input) {
        input.value = savedPhone;
        if (savedPhone) {
          clearBtn?.classList.remove('hidden');
          removeBtn?.classList.remove('hidden');
          if (hint) {
            hint.textContent = '✓ Номер сохранен';
            hint.className = 'text-[11px] text-emerald-600 font-semibold';
          }
        } else {
          clearBtn?.classList.add('hidden');
          removeBtn?.classList.add('hidden');
          if (hint) {
            hint.textContent = 'Введите 10 цифр номера (начиная после +7)';
            hint.className = 'text-[11px] text-slate-400';
          }
        }
        setTimeout(() => input.focus(), 150);
      }
    }

    function closePhoneModal() {
      const modal = document.getElementById('phoneSelectModal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    // Close phone modal when clicking backdrop
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('phoneSelectModal');
      if (modal && e.target === modal) {
        closePhoneModal();
      }
    });

    function saveModalPhone() {
      const input = document.getElementById('modalPhoneInput');
      const raw = input ? input.value : '';
      const digits = raw.replace(/\D/g, '').replace(/^[78]/, '');

      if (digits.length === 0) {
        removeModalPhone();
        return;
      }

      if (digits.length < 10) {
        showToast('Пожалуйста, введите полный номер из 10 цифр ⚠️');
        input?.focus();
        return;
      }

      const formatted = formatPhoneNumber(raw);
      try {
        localStorage.setItem('okoshko_user_phone', formatted);
      } catch (e) { }

      updateProfilePhoneUI();
      closePhoneModal();
      showToast('Номер сохранен 📱');
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } catch (e) { }
    }

    function removeModalPhone() {
      try {
        localStorage.removeItem('okoshko_user_phone');
      } catch (e) { }
      updateProfilePhoneUI();
      closePhoneModal();
      showToast('Номер удален');
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
      } catch (e) { }
    }

    // User Registration Date Management (Real dynamic tracking from DB / Telegram)
    function getUserRegistrationDate() {
      let regTimestamp = null;

      // 1. Check if passed from Telegram Bot / URL query params (e.g. ?registered_at=1728518400000)
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const urlReg = urlParams.get('registered_at');
        if (urlReg) {
          const parsed = parseInt(urlReg, 10);
          if (!isNaN(parsed) && parsed > 0) {
            regTimestamp = parsed;
            // Persist the real DB created_at timestamp
            localStorage.setItem('okoshko_user_registered_at', regTimestamp.toString());
          }
        }
      } catch (e) { }

      // 2. Check if already stored in localStorage
      if (!regTimestamp) {
        try {
          const stored = localStorage.getItem('okoshko_user_registered_at');
          if (stored) {
            const parsed = parseInt(stored, 10);
            if (!isNaN(parsed) && parsed > 0) {
              regTimestamp = parsed;
            }
          }
        } catch (e) { }
      }

      // 3. Check Telegram WebApp user object if available
      if (!regTimestamp && window.Telegram?.WebApp?.initDataUnsafe?.auth_date) {
        // auth_date is in seconds
        regTimestamp = window.Telegram.WebApp.initDataUnsafe.auth_date * 1000;
        try {
          localStorage.setItem('okoshko_user_registered_at', regTimestamp.toString());
        } catch (e) { }
      }

      // 4. If new user without recorded date, assign now (actual first visit timestamp)
      if (!regTimestamp || isNaN(regTimestamp)) {
        regTimestamp = Date.now();
        try {
          localStorage.setItem('okoshko_user_registered_at', regTimestamp.toString());
        } catch (e) { }
      }

      return new Date(regTimestamp);
    }

    function formatRegistrationDate(date) {
      const months = [
        'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
        'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
      ];
      return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    }

    function formatUserDuration(date) {
      const now = new Date();
      const diffMs = Math.max(0, now - date);
      const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const months = Math.floor(days / 30);
      const years = Math.floor(days / 365);

      if (years >= 1) {
        const remMonths = months % 12;
        if (remMonths > 0) return `${years} г. ${remMonths} мес. на платформе`;
        return `${years} ${pluralizeYears(years)} на платформе`;
      }
      if (months >= 1) {
        return `${months} ${pluralizeMonths(months)} на платформе`;
      }
      if (days >= 1) {
        return `${days} ${pluralizeDays(days)} на платформе`;
      }
      return 'Новый пользователь';
    }

    function pluralizeYears(n) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod100 >= 11 && mod100 <= 19) return 'лет';
      if (mod10 === 1) return 'год';
      if (mod10 >= 2 && mod10 <= 4) return 'года';
      return 'лет';
    }

    function pluralizeMonths(n) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod100 >= 11 && mod100 <= 19) return 'месяцев';
      if (mod10 === 1) return 'месяц';
      if (mod10 >= 2 && mod10 <= 4) return 'месяца';
      return 'месяцев';
    }

    function pluralizeDays(n) {
      const mod10 = n % 10;
      const mod100 = n % 100;
      if (mod100 >= 11 && mod100 <= 19) return 'дней';
      if (mod10 === 1) return 'день';
      if (mod10 >= 2 && mod10 <= 4) return 'дня';
      return 'дней';
    }

    function updateProfileRegistrationDateUI() {
      const regDate = getUserRegistrationDate();
      const dateFormatted = formatRegistrationDate(regDate);
      const durationText = formatUserDuration(regDate);

      const clientSinceEl = document.getElementById('profileClientSince');
      if (clientSinceEl) {
        clientSinceEl.textContent = `В Окошке с ${dateFormatted}`;
      }

      const regBadgeEl = document.getElementById('profileRegDateBadge');
      if (regBadgeEl) {
        regBadgeEl.textContent = dateFormatted;
      }

      const regSubEl = document.getElementById('profileRegDateSub');
      if (regSubEl) {
        regSubEl.textContent = durationText;
      }
    }

    // Toggle Telegram notifications
    function toggleTgNotifications(checked) {
      try {
        localStorage.setItem('okoshko_tg_notifications', checked ? 'true' : 'false');
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
        showToast(checked ? 'Уведомления включены 🔔' : 'Уведомления отключены 🔕');
      } catch (e) { }
    }

    // reCAPTCHA / Anti-robot verification handler
    function handleCaptchaToggle(checkbox) {
      if (!checkbox.checked) {
        state.isCaptchaVerified = false;
        updateVerifyContinueBtn();
        return;
      }

      // Checkbox was checked: simulate verification challenge
      const spinner = document.getElementById('captchaSpinner');
      const box = document.getElementById('captchaBox');
      const checkIcon = document.getElementById('captchaCheckIcon');
      const label = document.getElementById('captchaLabel');
      const card = document.getElementById('captchaCard');

      // Temporarily show spinning state
      checkbox.disabled = true;
      if (spinner) spinner.classList.remove('hidden');
      if (box) box.classList.add('border-primary/50');
      if (label) label.textContent = 'Проверка...';

      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
      } catch (e) { }

      setTimeout(() => {
        state.isCaptchaVerified = true;
        checkbox.disabled = false;
        if (spinner) spinner.classList.add('hidden');
        if (checkIcon) checkIcon.classList.remove('hidden');
        if (box) {
          box.classList.remove('border-primary/50', 'border-slate-300');
          box.classList.add('bg-emerald-500', 'border-emerald-500');
        }
        if (label) {
          label.textContent = 'Проверка пройдена ✓';
          label.classList.add('text-emerald-600');
        }
        if (card) {
          card.classList.add('border-emerald-200', 'bg-emerald-50/20');
        }

        try {
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
          }
        } catch (e) { }

        updateVerifyContinueBtn();
      }, 700);
    }

    function updateVerifyContinueBtn() {
      const btn = document.getElementById('verifyContinueBtn');
      if (!btn) return;

      if (state.isCaptchaVerified) {
        btn.disabled = false;
        btn.classList.remove('bg-slate-300', 'text-slate-500', 'cursor-not-allowed', 'shadow-none');
        btn.classList.add('bg-primary', 'text-white', 'shadow-[0_12px_28px_rgba(95,58,221,0.35)]', 'active:scale-[0.98]');
      } else {
        btn.disabled = true;
        btn.classList.add('bg-slate-300', 'text-slate-500', 'cursor-not-allowed', 'shadow-none');
        btn.classList.remove('bg-primary', 'text-white', 'shadow-[0_12px_28px_rgba(95,58,221,0.35)]', 'active:scale-[0.98]');
      }
    }

    // Complete initial Telegram verification
    function completeVerification() {
      if (!state.isCaptchaVerified) {
        showToast('Пожалуйста, подтвердите, что вы не робот 🛡️');
        return;
      }

      state.verified = true;
      try {
        localStorage.setItem('okoshko_verified', 'true');
        // Ensure real registration timestamp is stored upon first verification if missing
        if (!localStorage.getItem('okoshko_user_registered_at')) {
          localStorage.setItem('okoshko_user_registered_at', Date.now().toString());
        }
      } catch (e) { }
      updateProfileRegistrationDateUI();
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } catch (e) { }

      showToast(`Добро пожаловать, ${state.user.first_name}! ✨`);
      // Reset history so verification screen cannot be navigated back to
      state.screenHistory = ['map'];
      router.navigate('map', false);
      setTimeout(initYandexMap, 200);
    }

    // Quick re-verification from profile
    function reverifyTelegram() {
      state.isCaptchaVerified = false;
      const cb = document.getElementById('captchaCheckbox');
      if (cb) cb.checked = false;
      const checkIcon = document.getElementById('captchaCheckIcon');
      if (checkIcon) checkIcon.classList.add('hidden');
      const box = document.getElementById('captchaBox');
      if (box) {
        box.className = 'w-6 h-6 rounded-md border-2 border-slate-300 bg-white peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all shadow-2xs';
      }
      const label = document.getElementById('captchaLabel');
      if (label) {
        label.textContent = 'Я не робот';
        label.className = 'text-xs font-semibold text-on-surface';
      }
      const card = document.getElementById('captchaCard');
      if (card) {
        card.className = 'mt-4 w-full p-3.5 rounded-2xl bg-white shadow-xs border border-slate-200/80 flex items-center justify-between transition-all select-none';
      }
      updateVerifyContinueBtn();
      router.navigate('verify');
    }

    // Router
    const router = {
      navigate(screenName, addToHistory = true) {
        if (!screenName) return;

        // If map was in fullscreen mode and we navigate away from map, close fullscreen mode
        if (typeof isMapFullscreen !== 'undefined' && isMapFullscreen && screenName !== 'map') {
          closeFullscreenMap();
        }

        // Hide all screens strictly - guarantees 0 height / 0 space
        document.querySelectorAll('.screen').forEach(s => {
          s.classList.remove('active');
          s.style.display = 'none';
        });

        // Show target screen
        const target = document.getElementById(`screen-${screenName}`);
        if (target) {
          target.classList.add('active');
          target.style.display = 'block';
        }

        // Scroll to top of viewport
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        if (addToHistory && state.currentScreen !== screenName) {
          // Never push 'verify' into history if user is verified
          if (screenName !== 'verify' || !state.verified) {
            state.screenHistory.push(screenName);
          }
        }
        state.currentScreen = screenName;

        // Update header & nav UI
        this.updateHeaderAndNav(screenName);
      },

      goBack() {
        // If map is currently in fullscreen mode, exit fullscreen first
        if (typeof isMapFullscreen !== 'undefined' && isMapFullscreen) {
          closeFullscreenMap();
          return;
        }

        // If we are currently on the root screen ('map'), pressing the close/back button
        // should close the Telegram MiniApp or keep user on map, NOT kick back to verification!
        if (state.currentScreen === 'map') {
          try {
            if (window.Telegram?.WebApp?.close) {
              window.Telegram.WebApp.close();
              return;
            }
          } catch (e) { }
          showToast('Вы на главном экране');
          return;
        }

        // Filter out 'verify' screen from history if the user is already verified
        if (state.verified) {
          state.screenHistory = state.screenHistory.filter(s => s !== 'verify');
        }

        if (state.screenHistory.length > 1) {
          state.screenHistory.pop();
          let prev = state.screenHistory[state.screenHistory.length - 1];
          if (prev === 'verify' && state.verified) {
            prev = 'map';
          }
          this.navigate(prev || 'map', false);
        } else {
          this.navigate('map', false);
        }
      },

      updateHeaderAndNav(screen) {
        const backIcon = document.getElementById('headerBackIcon');
        const headerTitle = document.getElementById('headerTitle');
        const headerSubtitle = document.getElementById('headerSubtitle');
        const globalHeader = document.getElementById('globalHeader');
        const globalNav = document.getElementById('globalNav');

        // On verification screen, hide header and bottom navigation
        if (screen === 'verify') {
          globalHeader.classList.add('hidden');
          globalNav.classList.add('hidden');
          return;
        } else {
          globalHeader.classList.remove('hidden');
        }

        // Update Nav button active states & sliding glass bubble indicator
        document.querySelectorAll('.nav-btn').forEach(btn => {
          btn.classList.remove('text-primary');
          btn.classList.add('text-slate-500');
          const spanText = btn.querySelector('span:last-child');
          if (spanText) spanText.classList.replace('font-bold', 'font-semibold');
        });

        const activeNavBtn = document.getElementById(`nav-${screen}`);
        if (activeNavBtn) {
          activeNavBtn.classList.add('text-primary');
          activeNavBtn.classList.remove('text-slate-500');
          const spanText = activeNavBtn.querySelector('span:last-child');
          if (spanText) spanText.classList.replace('font-semibold', 'font-bold');
        }

        // Slide the telegram liquid lens indicator
        const indicator = document.getElementById('navActiveIndicator');
        if (indicator) {
          const tabPositions = {
            'map': '0%',
            'appointments': '100%',
            'profile': '200%',
            'pro-stats': '0%',
            'pro-appointments': '100%',
            'pro-profile': '200%'
          };
          if (tabPositions[screen] !== undefined) {
            indicator.style.transform = `translateX(${tabPositions[screen]})`;
            indicator.style.display = 'block';
          }
        }

        // PRO Nav bubble indicator
        const proIndicator = document.getElementById('proNavActiveIndicator');
        if (proIndicator) {
          const proPositions = {
            'pro-stats': '0%',
            'pro-appointments': '100%',
            'pro-profile': '200%'
          };
          if (proPositions[screen] !== undefined) {
            proIndicator.style.transform = `translateX(${proPositions[screen]})`;
            proIndicator.style.display = 'block';
          }
        }

        // Update Pro Nav buttons
        document.querySelectorAll('.pro-nav-btn').forEach(btn => {
          btn.classList.remove('text-primary');
          btn.classList.add('text-slate-500');
          const spanText = btn.querySelector('span:last-child');
          if (spanText) spanText.classList.replace('font-bold', 'font-semibold');
        });
        const activeProBtn = document.getElementById(`nav-${screen}`);
        if (activeProBtn) {
          activeProBtn.classList.add('text-primary');
          activeProBtn.classList.remove('text-slate-500');
          const spanText = activeProBtn.querySelector('span:last-child');
          if (spanText) spanText.classList.replace('font-semibold', 'font-bold');
        }

        const backBtn = document.getElementById('headerBackBtn');
        if (headerSubtitle) headerSubtitle.textContent = '';

        // Only show back button on inner detail sub-screens, never on main screens
        const isSubScreen = (screen === 'salon' || screen === 'master' || screen === 'favorites' || screen === 'reviews');
        if (backBtn) {
          if (isSubScreen) {
            backBtn.classList.remove('hidden');
            backBtn.classList.add('flex');
          } else {
            backBtn.classList.add('hidden');
            backBtn.classList.remove('flex');
          }
        }

        if (screen === 'map') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Окошко';
          globalNav.classList.remove('hidden');
          if (yandexMapInstance && yandexMapInstance.container) {
            setTimeout(() => yandexMapInstance.container.fitToViewport(), 150);
          }
        } else if (screen === 'salon') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          const currentVenue = (typeof venues !== 'undefined') ? venues.find(v => v.id === state.activeSalon) : null;
          headerTitle.textContent = currentVenue ? currentVenue.name : 'Салон красоты';
          globalNav.classList.add('hidden');
        } else if (screen === 'master') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          const activeMaster = (typeof getMasterById === 'function') ? getMasterById(state.activeMaster) : null;
          headerTitle.textContent = activeMaster ? activeMaster.name : 'Мастер';
          globalNav.classList.add('hidden');
        } else if (screen === 'appointments') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Окошко';
          globalNav.classList.remove('hidden');
          renderAppointments();
        } else if (screen === 'favorites') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Избранное';
          globalNav.classList.remove('hidden');
          renderFavorites();
        } else if (screen === 'reviews') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          if (state.reviewsTargetType === 'master') {
            const activeMaster = (typeof getMasterById === 'function') ? getMasterById(state.activeMaster) : null;
            headerTitle.textContent = 'Отзывы о мастере';
            renderMasterReviewsScreen(state.activeMaster);
          } else {
            const currentVenue = (typeof venues !== 'undefined') ? venues.find(v => v.id === state.activeSalon) : null;
            headerTitle.textContent = 'Отзывы клиентов';
            renderSalonReviewsScreen(state.activeSalon);
          }
          globalNav.classList.add('hidden');
        } else if (screen === 'profile') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Окошко';
          globalNav.classList.remove('hidden');
        } else if (screen === 'pro-stats') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Панель PRO';
          globalNav.classList.remove('hidden');
          if (typeof renderProStats === 'function') renderProStats();
        } else if (screen === 'pro-appointments') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Панель PRO';
          globalNav.classList.remove('hidden');
          if (typeof renderProAppointments === 'function') renderProAppointments();
        } else if (screen === 'pro-profile') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Панель PRO';
          globalNav.classList.remove('hidden');
          if (typeof syncProSalonUI === 'function') syncProSalonUI();
        }
      }
    };
