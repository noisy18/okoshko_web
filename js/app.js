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
      const bizCard = document.getElementById('bizAccountCard');
      const bizCardTitle = document.getElementById('bizCardTitle');
      const bizCardBadge = document.getElementById('bizCardBadge');
      const bizCardSub = document.getElementById('bizCardSub');
      const bizCardGlow = document.getElementById('bizCardGlow');
      if (user.is_pro) {
        if (bizCard) {
          bizCard.className = 'p-4 rounded-3xl bg-slate-900 text-white border border-slate-700/60 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden';
        }
        if (bizCardGlow) bizCardGlow.classList.add('hidden');
        if (bizCardTitle) bizCardTitle.textContent = 'Войти в бизнес кабинет';
        if (bizCardBadge) {
          bizCardBadge.textContent = 'PRO';
          bizCardBadge.className = 'px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase';
        }
        if (bizCardSub) bizCardSub.textContent = 'Управление салоном, мастерами и онлайн-записями';
      } else {
        if (bizCard) {
          bizCard.className = 'p-4 rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-primary text-white shadow-md flex items-center justify-between cursor-pointer active:scale-[0.98] transition-all relative overflow-hidden';
        }
        if (bizCardGlow) bizCardGlow.classList.remove('hidden');
        if (bizCardTitle) bizCardTitle.textContent = 'Создать Бизнес-аккаунт';
        if (bizCardBadge) {
          bizCardBadge.textContent = 'PRO';
          bizCardBadge.className = 'px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 text-[9px] font-extrabold uppercase';
        }
        if (bizCardSub) bizCardSub.textContent = 'Подключите салон или кабинет мастера';
      }
      if (typeof updateBizCardAvatar === 'function') {
        updateBizCardAvatar();
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
        if (typeof updateFavoritesUI === 'function') {
          updateFavoritesUI();
        }

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
      if (digits.length > 6) {
        formatted += '-' + digits.substring(6, 8);
      }
      if (digits.length > 8) {
        formatted += '-' + digits.substring(8, 10);
      }
      return formatted;
    }

    function handlePhoneInput(input, event) {
      const val = input.value;
      if (!val || val.trim() === '') {
        input.value = '';
        document.getElementById('modalPhoneClearBtn')?.classList.add('hidden');
        const hint = document.getElementById('phoneModalHint');
        if (hint) {
          hint.textContent = 'Введите 10 цифр номера (начиная после +7)';
          hint.className = 'text-[11px] text-slate-400';
        }
        return;
      }

      // Track cursor position by counting digits before the caret
      const selStart = input.selectionStart || val.length;
      let digitsBeforeCaret = 0;
      for (let i = 0; i < selStart; i++) {
        if (/\d/.test(val[i])) {
          digitsBeforeCaret++;
        }
      }

      const formatted = formatPhoneNumber(val);
      input.value = formatted;
      document.getElementById('modalPhoneClearBtn')?.classList.remove('hidden');

      // Place caret right after the same number of digits
      if (selStart < val.length) {
        let count = 0;
        let targetPos = formatted.length;
        for (let i = 0; i < formatted.length; i++) {
          if (/\d/.test(formatted[i])) {
            count++;
          }
          if (count === digitsBeforeCaret) {
            targetPos = i + 1;
            break;
          }
        }
        try {
          input.setSelectionRange(targetPos, targetPos);
        } catch (e) { }
      }

      // Update hint text based on digits count
      let digits = val.replace(/\D/g, '');
      if (digits.startsWith('7') || digits.startsWith('8')) {
        digits = digits.substring(1);
      }
      digits = digits.substring(0, 10);

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
      if (event.key === 'Backspace') {
        const start = input.selectionStart;
        const end = input.selectionEnd;
        if (start === end && start > 0) {
          const charBefore = input.value[start - 1];
          // If right behind a non-digit like '-', ')', ' ', delete preceding digit
          if (!/\d/.test(charBefore)) {
            event.preventDefault();
            let prevDigitIdx = -1;
            for (let i = start - 1; i >= 0; i--) {
              if (/\d/.test(input.value[i])) {
                prevDigitIdx = i;
                break;
              }
            }
            if (prevDigitIdx > 1) { // Don't delete +7 prefix
              const val = input.value.substring(0, prevDigitIdx) + input.value.substring(prevDigitIdx + 1);
              input.value = formatPhoneNumber(val);
              handlePhoneInput(input, event);
            }
            return;
          }
        }
        return;
      }

      // Disallow non-digit keys (except Control, Backspace, Delete, Arrow keys, Tab, Enter)
      const allowedKeys = ['Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Enter', 'Escape'];
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

    function updateProfilePhoneUI(overridePhone) {
      let savedPhone = '';
      try {
        if (overridePhone !== undefined) {
          savedPhone = overridePhone;
        } else {
          savedPhone = localStorage.getItem('okoshko_user_phone') || '';
          if (!savedPhone) {
            const urlParams = new URLSearchParams(window.location.search);
            const urlPhone = urlParams.get('user_phone');
            if (urlPhone) {
              savedPhone = urlPhone;
              localStorage.setItem('okoshko_user_phone', urlPhone);
            }
          }
        }
      } catch (e) { }

      // Sync from CloudStorage if available and not yet loaded
      try {
        if (!savedPhone && window.Telegram?.WebApp?.CloudStorage?.getItem) {
          window.Telegram.WebApp.CloudStorage.getItem('okoshko_user_phone', (err, val) => {
            if (!err && val) {
              localStorage.setItem('okoshko_user_phone', val);
              const pSub = document.getElementById('profilePhoneSub');
              const pBadge = document.getElementById('profilePhoneBadge');
              if (pSub) pSub.textContent = val;
              if (pBadge) pBadge.textContent = 'Изменить';
            }
          });
        }
      } catch (e) { }

      // Also try fetching from API server if still empty
      if (!savedPhone) {
        try {
          const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
          fetch(`http://127.0.0.1:8080/api/user_phone_get?user_id=${userTgId}`)
            .then(r => r.json())
            .then(data => {
              if (data && data.phone) {
                localStorage.setItem('okoshko_user_phone', data.phone);
                const pSub = document.getElementById('profilePhoneSub');
                const pBadge = document.getElementById('profilePhoneBadge');
                if (pSub) pSub.textContent = data.phone;
                if (pBadge) pBadge.textContent = 'Изменить';
              }
            })
            .catch(() => {});
        } catch (e) { }
      }

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
        if (!savedPhone) {
          const urlParams = new URLSearchParams(window.location.search);
          savedPhone = urlParams.get('user_phone') || '';
        }
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

      // Update current browser search params so refresh keeps user_phone
      try {
        if (window.history && window.history.replaceState) {
          const curUrl = new URL(window.location.href);
          curUrl.searchParams.set('user_phone', formatted);
          window.history.replaceState({}, '', curUrl.toString());
        }
      } catch (e) { }

      // 1. Sync to Telegram CloudStorage
      try {
        if (window.Telegram?.WebApp?.CloudStorage?.setItem) {
          window.Telegram.WebApp.CloudStorage.setItem('okoshko_user_phone', formatted, (err, ok) => {
            if (!err) console.log('[App] Phone synced to CloudStorage:', formatted);
          });
        }
      } catch (e) { }

      const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
      const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
      const groupChatId = -5590032342;

      // 2. Direct HTTP API sync to PostgreSQL (localhost / tunnel)
      try {
        fetch('http://127.0.0.1:8080/api/user_phone_update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userTgId,
            phone: formatted
          })
        }).then(r => r.json()).then(res => console.log('[App] Phone saved via API:', res))
          .catch(err => console.log('[App] Local API phone sync skipped:', err.message));
      } catch (e) { }

      // 3. Sync to PostgreSQL via Bot Group channel (works anywhere on mobile/cloud)
      try {
        if (botToken) {
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: groupChatId,
              text: `#user_phone_update|${userTgId}|${formatted}`,
              disable_notification: true
            })
          }).catch(err => console.warn('Group Bot API sync error for phone:', err));
        }
      } catch (e) { }

      // 4. Update Telegram MenuButton URL directly so next open has user_phone
      try {
        if (userTgId && botToken) {
          const menuUrl = new URL(window.location.href);
          menuUrl.searchParams.set('user_phone', formatted);
          fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: userTgId,
              menu_button: {
                type: 'web_app',
                text: '💅 Окошко',
                web_app: { url: menuUrl.toString() }
              }
            })
          }).catch(() => {});
        }
      } catch (e) { }

      updateProfilePhoneUI(formatted);
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

      try {
        if (window.Telegram?.WebApp?.CloudStorage?.removeItem) {
          window.Telegram.WebApp.CloudStorage.removeItem('okoshko_user_phone');
        }
      } catch (e) { }

      try {
        if (window.history && window.history.replaceState) {
          const curUrl = new URL(window.location.href);
          curUrl.searchParams.delete('user_phone');
          window.history.replaceState({}, '', curUrl.toString());
        }
      } catch (e) { }

      const userTgId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id || (typeof state !== 'undefined' && state.user?.id) || 1205557089;
      const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
      const groupChatId = -5590032342;

      try {
        fetch('http://127.0.0.1:8080/api/user_phone_update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userTgId,
            phone: ''
          })
        }).catch(() => {});
      } catch (e) { }

      try {
        if (botToken) {
          fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: groupChatId,
              text: `#user_phone_update|${userTgId}|`,
              disable_notification: true
            })
          }).catch(() => {});
        }
      } catch (e) { }

      try {
        if (userTgId && botToken) {
          const menuUrl = new URL(window.location.href);
          menuUrl.searchParams.delete('user_phone');
          fetch(`https://api.telegram.org/bot${botToken}/setChatMenuButton`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              chat_id: userTgId,
              menu_button: {
                type: 'web_app',
                text: '💅 Окошко',
                web_app: { url: menuUrl.toString() }
              }
            })
          }).catch(() => {});
        }
      } catch (e) { }

      updateProfilePhoneUI('');
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

        if (state.currentScreen === 'pro-gallery') {
          this.navigate('pro-profile', false);
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

        // Navigation dock switching between Client and PRO
        const proNav = document.getElementById('proNav');
        const isProScreen = screen.startsWith('pro-');

        if (screen === 'verify') {
          globalHeader.classList.add('hidden');
          if (globalNav) { globalNav.classList.add('hidden'); globalNav.style.display = 'none'; }
          if (proNav) { proNav.classList.add('hidden'); proNav.style.display = 'none'; }
          return;
        } else {
          globalHeader.classList.remove('hidden');
        }

        if (isProScreen) {
          state.isProMode = true;
          document.body.classList.add('pro-mode-active');
          if (globalNav) {
            globalNav.classList.add('hidden');
            globalNav.style.display = 'none';
          }
          if (proNav) {
            proNav.classList.remove('hidden');
            proNav.style.display = 'block';
          }
        } else {
          state.isProMode = false;
          document.body.classList.remove('pro-mode-active');
          if (proNav) {
            proNav.classList.add('hidden');
            proNav.style.display = 'none';
          }
          if (globalNav) {
            globalNav.classList.remove('hidden');
            globalNav.style.display = '';
          }
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
            'profile': '200%'
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
            'pro-analytics': '0%',
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
        const isSubScreen = (screen === 'salon' || screen === 'master' || screen === 'favorites' || screen === 'reviews' || screen === 'pro-gallery');
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
          if (yandexMapInstance && yandexMapInstance.container) {
            setTimeout(() => yandexMapInstance.container.fitToViewport(), 150);
          }
        } else if (screen === 'salon') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Окошко';
          if (globalNav) { globalNav.classList.add('hidden'); globalNav.style.display = 'none'; }
        } else if (screen === 'master') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          const activeMaster = (typeof getMasterById === 'function') ? getMasterById(state.activeMaster) : null;
          headerTitle.textContent = activeMaster ? activeMaster.name : 'Мастер';
          if (globalNav) { globalNav.classList.add('hidden'); globalNav.style.display = 'none'; }
        } else if (screen === 'appointments') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Окошко';
          renderAppointments();
        } else if (screen === 'favorites') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Избранное';
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
          if (globalNav) { globalNav.classList.add('hidden'); globalNav.style.display = 'none'; }
        } else if (screen === 'profile') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Окошко';
        } else if (screen === 'pro-stats') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Панель PRO';
          if (typeof renderProStats === 'function') renderProStats();
        } else if (screen === 'pro-analytics') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Аналитика';
        } else if (screen === 'pro-appointments') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Панель PRO';
          if (typeof renderProAppointments === 'function') renderProAppointments();
        } else if (screen === 'pro-profile') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Панель PRO';
          if (typeof syncProSalonUI === 'function') syncProSalonUI();
        } else if (screen === 'pro-gallery') {
          if (backIcon) backIcon.textContent = 'arrow_back_ios_new';
          headerTitle.textContent = 'Галерея';
          if (typeof renderProGalleryGrid === 'function') renderProGalleryGrid();
        }
      }
    };
