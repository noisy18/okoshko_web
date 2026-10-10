// ==========================================
    // BUSINESS ACCOUNT MODAL
    // ==========================================
    let currentBizType = 'salon';

    function openBusinessModal() {
      const modal = document.getElementById('businessModal');
      if (modal) {
        const contactInput = document.getElementById('bizContactInput');
        if (contactInput && state.user?.username && !contactInput.value) {
          contactInput.value = `@${state.user.username}`;
        }
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function closeBusinessModal() {
      const modal = document.getElementById('businessModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function setBizType(type) {
      currentBizType = type;
      const salonBtn = document.getElementById('bizTypeSalonBtn');
      const masterBtn = document.getElementById('bizTypeMasterBtn');
      if (type === 'salon') {
        salonBtn.className = 'flex-1 py-2 rounded-xl bg-white text-primary shadow-xs transition-all';
        masterBtn.className = 'flex-1 py-2 rounded-xl text-slate-500 hover:text-on-surface transition-all';
      } else {
        masterBtn.className = 'flex-1 py-2 rounded-xl bg-white text-primary shadow-xs transition-all';
        salonBtn.className = 'flex-1 py-2 rounded-xl text-slate-500 hover:text-on-surface transition-all';
      }
    }

    function submitBusinessApplication() {
      const name = (document.getElementById('bizNameInput')?.value || '').trim();
      const contact = (document.getElementById('bizContactInput')?.value || '').trim();
      const category = document.getElementById('bizCategorySelect')?.value || 'Салон красоты';
      const address = (document.getElementById('bizAddressInput')?.value || '').trim();
      const bizType = currentBizType || 'salon';

      if (!name) {
        showToast('Пожалуйста, укажите название предприятия или ваше имя');
        return;
      }
      if (!contact) {
        showToast('Пожалуйста, укажите контакт для связи');
        return;
      }

      closeBusinessModal();

      const cardTitle = document.getElementById('bizCardTitle');
      const cardBadge = document.getElementById('bizCardBadge');
      const cardSub = document.getElementById('bizCardSub');
      if (cardTitle) cardTitle.textContent = 'Заявка на Бизнес-аккаунт';
      if (cardBadge) {
        cardBadge.textContent = 'На рассмотрении';
        cardBadge.className = 'px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[9px] font-extrabold uppercase';
      }
      if (cardSub) cardSub.textContent = `${name} (${category}) • Менеджер скоро свяжется`;

      showToast('🎉 Заявка принята! Мы свяжемся с вами в Telegram');

      // 1. Формируем текст уведомления для Telegram группы
      const typeLabel = (bizType === 'salon') ? '🏢 Салон красоты' : '💇 Частный мастер';
      const userTg = state.user?.username ? `@${state.user.username} (ID: <code>${state.user.id}</code>)` : `ID: <code>${state.user?.id || 'не указан'}</code>`;
      const notifText =
        `🔥 <b>Новая заявка на PRO Бизнес-аккаунт!</b>\n\n` +
        `🏷 <b>Тип:</b> ${typeLabel}\n` +
        `🏢 <b>Название / Имя:</b> <b>${name}</b>\n` +
        `💅 <b>Категория:</b> ${category}\n` +
        `📍 <b>Адрес:</b> ${address || 'Не указан'}\n` +
        `📞 <b>Контакт для связи:</b> <code>${contact}</code>\n` +
        `👤 <b>Отправитель в TG:</b> ${userTg}\n\n` +
        `⚡ <i>Свяжитесь с партнером для подключения и настройки профиля!</i>`;

      // 2. Прямая отправка в группу через Telegram Bot API (работает при открытии через Menu Button, Inline Button и прямую ссылку)
      const botToken = '8949973080:AAHxM52F3FGr2agJEw9xm8526ffvVubsYMI';
      const targetGroup = '-5590032342';
      try {
        fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: targetGroup,
            text: notifText,
            parse_mode: 'HTML'
          })
        }).then(r => r.json()).then(res => {
          console.log('Direct Bot API notification response:', res);
        }).catch(err => {
          console.warn('Direct Bot API fetch error:', err);
        });
      } catch (e) {
        console.warn('Bot API fetch exception:', e);
      }

      // 3. Отправка боту через Telegram WebApp sendData (работает если WebApp открыт через Reply-клавиатуру)
      try {
        if (window.Telegram?.WebApp?.sendData) {
          window.Telegram.WebApp.sendData(JSON.stringify({
            action: 'business_application_submitted',
            biz_type: bizType,
            name: name,
            category: category,
            address: address,
            contact: contact
          }));
        }
      } catch (e) {
        console.log('sendData biz application error:', e);
      }

      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } catch (e) { }
    }
