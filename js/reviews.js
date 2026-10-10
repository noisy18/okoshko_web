// ==========================================
    // REVIEWS STORE & DYNAMIC SCREEN LOGIC
    // ==========================================
    const REVIEWS_STORAGE_KEY = 'okoshko_salon_reviews_v1';
    let currentReviewRating = 5;

    // Initial seed reviews for salons
    const INITIAL_SALON_REVIEWS = {
      beauty: [
        {
          id: 'rev_b1',
          author: 'Елена Васильева',
          rating: 5,
          service: 'Маникюр с покрытием гель-лак Luxio',
          userDuration: '1 год 2 мес. на платформе',
          date: 'Вчера, 14:30',
          text: 'Невероятная атмосфера в салоне, очень светло и стильно! Инструмент при мне достали из крафт-пакета. Маникюр сделали идеально за 1:15 с покрытием. Однозначно вернусь к Алине снова!'
        },
        {
          id: 'rev_b2',
          author: 'Мария Селезнева',
          rating: 5,
          service: 'Архитектура и окрашивание бровей',
          userDuration: '9 месяцев на платформе',
          date: '3 дня назад',
          text: 'Дарья сделала брови мечты! Очень натурально, краска легла ровно, без эффекта маркера. В салоне подают вкусный капучино с сиропом.'
        },
        {
          id: 'rev_b3',
          author: 'Анастасия К.',
          rating: 5,
          service: 'Smart-педикюр эстетический',
          userDuration: '5 месяцев на платформе',
          date: '1 неделя назад',
          text: 'Педикюр просто супер, пяточки как у младенца. Очень удобные кресла реклайнеры, можно даже вздремнуть во время процедуры.'
        }
      ],
      mono: [
        {
          id: 'rev_m1',
          author: 'Ирина Полякова',
          rating: 5,
          service: 'Японский эко-глянец P.Shine',
          userDuration: '8 месяцев на платформе',
          date: '2 дня назад',
          text: 'Студия минимализма, идеальная эстетика! Ногти после японского маникюра блестят и здоровые. София — лучший мастер.'
        },
        {
          id: 'rev_m2',
          author: 'Ольга Смирнова',
          rating: 5,
          service: 'Пилочный маникюр без режущих',
          userDuration: '1 год на платформе',
          date: '5 дней назад',
          text: 'Для чувствительной кутикулы пилочный маникюр — спасение. Ни единого пореза, все мягко и чисто.'
        }
      ],
      alina: [
        {
          id: 'rev_a1',
          author: 'Валерия Д.',
          rating: 5,
          service: 'Сложное окрашивание Airtouch / Шатуш',
          userDuration: '1 год на платформе',
          date: 'Вчера',
          text: 'Алина — богиня блонда! Плавнейший переход, волосы шелковые, цвет играет на солнце. Стоит каждого рубля.'
        }
      ],
      kristina: [
        {
          id: 'rev_k1',
          author: 'Светлана М.',
          rating: 5,
          service: 'Ламинирование бровей + уход кератин',
          userDuration: '6 месяцев на платформе',
          date: '3 дня назад',
          text: 'Кристина — топ мастер взгляда! Брови держат форму идеально, волоски мягкие и послушные.'
        }
      ],
      glam: [
        {
          id: 'rev_g1',
          author: 'Екатерина Н.',
          rating: 5,
          service: 'SPA ритуал "Свежесть мяты"',
          userDuration: '10 месяцев на платформе',
          date: 'Вчера',
          text: 'Полное расслабление после рабочей недели. Приятный травяной чай, массаж ног просто восхитительный.'
        }
      ],
      rnd_don_beauty: [
        {
          id: 'rev_rnd1',
          author: 'Дарья Шевченко',
          rating: 5,
          service: 'Маникюр с укреплением гелем',
          userDuration: '1 год 4 мес. на платформе',
          date: 'Вчера',
          text: 'Любимый салон на Большой Садовой! Быстро, качественно, ношу покрытие по 4 недели без сколов.'
        }
      ],
      spb_nevsky_glam: [
        {
          id: 'rev_spb1',
          author: 'Виктория Федорова',
          rating: 5,
          service: 'Сложное окрашивание Airtouch',
          userDuration: '1 год на платформе',
          date: '2 дня назад',
          text: 'Мария — волшебница колористики! Сложный переход, волосы светятся, цвет превзошел все ожидания.'
        }
      ]
    };

    // Master reviews initial seed data
    const INITIAL_MASTER_REVIEWS = {
      master_beauty_alina: [
        {
          id: 'rev_ma1',
          author: 'Елена Васильева',
          rating: 5,
          service: 'Аппаратный маникюр + Luxio',
          userDuration: '1 год 2 мес. на платформе',
          date: 'Вчера, 14:30',
          text: 'Невероятная аккуратность и бережное отношение к кутикуле. Маникюр носится уже 4 недели без единого скола! Алина — настоящий мастер своего дела.'
        },
        {
          id: 'rev_ma2',
          author: 'Ольга Кузнецова',
          rating: 5,
          service: 'Smart-педикюр полный',
          userDuration: '8 месяцев на платформе',
          date: '4 дня назад',
          text: 'Очень нежно, бережно и стерильно. Пяточки гладкие, покрытие идеальное под кутикулу.'
        }
      ],
      master_beauty_daria: [
        {
          id: 'rev_md1',
          author: 'Мария Селезнева',
          rating: 5,
          service: 'Архитектура и окрашивание бровей',
          userDuration: '9 месяцев на платформе',
          date: '3 дня назад',
          text: 'Дарья сделала брови мечты! Очень натурально, краска легла ровно, без эффекта маркера.'
        }
      ]
    };

    function getAllStoredReviews() {
      try {
        const raw = localStorage.getItem(REVIEWS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) { }
      const combined = { ...INITIAL_SALON_REVIEWS, ...INITIAL_MASTER_REVIEWS };
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(combined));
      } catch (e) { }
      return combined;
    }

    function saveAllStoredReviews(data) {
      try {
        localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(data));
      } catch (e) { }
    }

    function getSalonReviewsList(salonId) {
      const all = getAllStoredReviews();
      let list = all[salonId] || [];
      if (list.length === 0) {
        const venue = venues.find(v => v.id === salonId);
        if (venue && venue.review) {
          list = [
            {
              id: `rev_def_${salonId}`,
              author: venue.review.author || 'Клиент',
              rating: 5,
              service: venue.services && venue.services[0] ? venue.services[0].name : (venue.categoryText || 'Услуга'),
              userDuration: '9 месяцев на платформе',
              date: 'Недавно',
              text: venue.review.text || 'Отличный салон, профессиональные мастера и приятный сервис!'
            }
          ];
        }
      }
      return list;
    }

    function getMasterReviewsList(masterId, fallbackMaster) {
      const all = getAllStoredReviews();
      let list = all[masterId] || [];
      if (list.length === 0) {
        const m = fallbackMaster || (typeof getMasterById === 'function' ? getMasterById(masterId) : null);
        const svcName = (m && m.services && m.services[0]) ? m.services[0].name : 'Процедура';
        list = [
          {
            id: `rev_def_m_${masterId}`,
            author: 'Елена Васильева',
            rating: 5,
            service: svcName,
            userDuration: '1 год 2 мес. на платформе',
            date: 'Вчера',
            text: 'Невероятная аккуратность и бережное отношение. Маникюр носится уже 4 недели без единого скола!'
          }
        ];
      }
      return list;
    }

    // Check if current user already left a review for target (salon or master)
    function hasUserReviewedTarget(targetId) {
      const all = getAllStoredReviews();
      const list = all[targetId] || [];
      const currentUserId = state.user?.id || 8949973080;
      return list.some(r => r.userId === currentUserId);
    }

    function hasUserReviewedSalon(salonId) {
      return hasUserReviewedTarget(salonId);
    }

    // Calculate arithmetic mean rating for salon
    function calculateSalonAverageRating(salonId) {
      const reviews = getSalonReviewsList(salonId);
      if (!reviews || reviews.length === 0) {
        const venue = venues.find(v => v.id === salonId);
        return {
          avg: parseFloat(venue?.rating || '5.0'),
          count: venue?.reviewsCount || 0
        };
      }
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      const avg = (sum / reviews.length).toFixed(1);
      return {
        avg: parseFloat(avg),
        count: reviews.length
      };
    }

    // Calculate arithmetic mean rating for master
    function calculateMasterAverageRating(masterId, fallbackMaster) {
      const reviews = getMasterReviewsList(masterId, fallbackMaster);
      if (!reviews || reviews.length === 0) {
        const m = fallbackMaster || (typeof getMasterById === 'function' ? getMasterById(masterId) : null);
        return {
          avg: parseFloat(m?.rating || '5.0'),
          count: m?.reviews_count || 1
        };
      }
      const sum = reviews.reduce((acc, r) => acc + (parseFloat(r.rating) || 5), 0);
      const avg = (sum / reviews.length).toFixed(1);
      return {
        avg: parseFloat(avg),
        count: reviews.length
      };
    }

    // Open Screen: Reviews for salon
    function openSalonReviews(salonId) {
      const targetId = salonId || state.activeSalon || 'beauty';
      state.activeSalon = targetId;
      state.reviewsTargetType = 'salon';
      router.navigate('reviews');
    }

    // Open Screen: Reviews for master
    function openMasterReviews(masterId) {
      const targetId = masterId || state.activeMaster || 'master_beauty_alina';
      state.activeMaster = targetId;
      state.reviewsTargetType = 'master';
      router.navigate('reviews');
    }

    // Render Screen: Reviews for Salon
    function renderSalonReviewsScreen(salonId) {
      state.reviewsTargetType = 'salon';
      const targetId = salonId || state.activeSalon || 'beauty';
      const venue = venues.find(v => v.id === targetId) || venues[0];
      const reviews = getSalonReviewsList(targetId);
      const { avg, count } = calculateSalonAverageRating(targetId);

      venue.rating = avg.toFixed(1);
      venue.reviewsCount = count;

      const sName = document.getElementById('reviewsSalonName');
      const sAvg = document.getElementById('reviewsAverageRating');
      const sBadge = document.getElementById('reviewsCountBadge');
      const sNotice = document.getElementById('reviewsAverageNotice');

      if (sName) sName.textContent = venue.name;
      if (sAvg) sAvg.textContent = avg.toFixed(1);
      if (sBadge) sBadge.textContent = `(${count})`;
      if (sNotice) sNotice.textContent = `Средний балл ${avg.toFixed(1)} на основе ${count} отзывов`;

      const userAlreadyReviewed = hasUserReviewedTarget(targetId);
      const topBtn = document.getElementById('openAddReviewTopBtn');
      const bottomBanner = document.getElementById('addReviewBottomBanner');

      if (topBtn) {
        if (userAlreadyReviewed) {
          topBtn.disabled = true;
          topBtn.classList.add('opacity-50', 'cursor-not-allowed');
          topBtn.innerHTML = '<span class="material-symbols-outlined text-[15px]">check</span><span>Отзыв оставлен</span>';
        } else {
          topBtn.disabled = false;
          topBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          topBtn.innerHTML = '<span class="material-symbols-outlined text-[15px]">rate_review</span><span>Написать</span>';
        }
      }

      if (bottomBanner) {
        if (userAlreadyReviewed) {
          bottomBanner.innerHTML = `
            <div class="flex items-center gap-2 text-emerald-800">
              <span class="material-symbols-outlined text-emerald-600">verified</span>
              <span class="text-xs font-semibold">Вы уже оставили отзыв об этом салоне. Спасибо за вашу оценку!</span>
            </div>
          `;
          bottomBanner.className = 'rounded-2xl p-3.5 bg-emerald-50 border border-emerald-200/60 flex items-center justify-between';
        } else {
          bottomBanner.innerHTML = `
            <div class="flex flex-col pr-2">
              <span class="text-xs font-bold text-on-surface">Были в салоне «${venue.name}»?</span>
              <span class="text-[11px] text-slate-500 mt-0.5">Поделитесь впечатлениями и оценкой мастеров</span>
            </div>
            <button onclick="openAddReviewModal()" class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0">
              Оставить отзыв
            </button>
          `;
          bottomBanner.className = 'rounded-2xl p-4 bg-primary-fixed/30 border border-primary/20 flex items-center justify-between';
        }
      }

      renderReviewsListHTML(reviews, venue.name);
    }

    // Render Screen: Reviews for Master
    function renderMasterReviewsScreen(masterId) {
      state.reviewsTargetType = 'master';
      const targetId = masterId || state.activeMaster || 'master_beauty_alina';
      const master = (typeof getMasterById === 'function') ? getMasterById(targetId) : null;
      const mName = master ? master.name : 'Мастер';
      const reviews = getMasterReviewsList(targetId, master);
      const { avg, count } = calculateMasterAverageRating(targetId, master);

      if (master) {
        master.rating = avg.toFixed(1);
        master.reviews_count = count;
      }

      const sName = document.getElementById('reviewsSalonName');
      const sAvg = document.getElementById('reviewsAverageRating');
      const sBadge = document.getElementById('reviewsCountBadge');
      const sNotice = document.getElementById('reviewsAverageNotice');

      if (sName) sName.textContent = `${mName} • ${master ? master.role_title : 'Специалист'}`;
      if (sAvg) sAvg.textContent = avg.toFixed(1);
      if (sBadge) sBadge.textContent = `(${count})`;
      if (sNotice) sNotice.textContent = `Средний балл ${avg.toFixed(1)} на основе ${count} отзывов`;

      const userAlreadyReviewed = hasUserReviewedTarget(targetId);
      const topBtn = document.getElementById('openAddReviewTopBtn');
      const bottomBanner = document.getElementById('addReviewBottomBanner');

      if (topBtn) {
        if (userAlreadyReviewed) {
          topBtn.disabled = true;
          topBtn.classList.add('opacity-50', 'cursor-not-allowed');
          topBtn.innerHTML = '<span class="material-symbols-outlined text-[15px]">check</span><span>Отзыв оставлен</span>';
        } else {
          topBtn.disabled = false;
          topBtn.classList.remove('opacity-50', 'cursor-not-allowed');
          topBtn.innerHTML = '<span class="material-symbols-outlined text-[15px]">rate_review</span><span>Написать</span>';
        }
      }

      if (bottomBanner) {
        if (userAlreadyReviewed) {
          bottomBanner.innerHTML = `
            <div class="flex items-center gap-2 text-emerald-800">
              <span class="material-symbols-outlined text-emerald-600">verified</span>
              <span class="text-xs font-semibold">Вы уже оставили отзыв об этом мастере. Спасибо за вашу оценку!</span>
            </div>
          `;
          bottomBanner.className = 'rounded-2xl p-3.5 bg-emerald-50 border border-emerald-200/60 flex items-center justify-between';
        } else {
          bottomBanner.innerHTML = `
            <div class="flex flex-col pr-2">
              <span class="text-xs font-bold text-on-surface">Были на процедуре у мастера ${mName}?</span>
              <span class="text-[11px] text-slate-500 mt-0.5">Поделитесь впечатлениями и качеством работы</span>
            </div>
            <button onclick="openAddReviewModal()" class="px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0">
              Оставить отзыв
            </button>
          `;
          bottomBanner.className = 'rounded-2xl p-4 bg-primary-fixed/30 border border-primary/20 flex items-center justify-between';
        }
      }

      renderReviewsListHTML(reviews, mName);
    }

    function renderReviewsListHTML(reviews, targetTitle) {
      const listContainer = document.getElementById('salonReviewsFullList');
      if (!listContainer) return;

      if (!reviews || reviews.length === 0) {
        listContainer.innerHTML = `
          <div class="rounded-3xl bg-white p-6 shadow-xs border border-slate-200/70 text-center flex flex-col items-center gap-3">
            <div class="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
              <span class="material-symbols-outlined text-[28px]">rate_review</span>
            </div>
            <div>
              <h3 class="font-bold text-sm text-on-surface">Пока нет отзывов</h3>
              <p class="text-xs text-slate-400 mt-1 max-w-[240px]">Станьте первым, кто поделится впечатлением о «${targetTitle}»</p>
            </div>
            <button onclick="openAddReviewModal()" class="mt-1 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold shadow-xs active:scale-95 transition-transform flex items-center gap-1.5">
              <span>Оставить первый отзыв</span>
              <span class="material-symbols-outlined text-[16px]">add</span>
            </button>
          </div>
        `;
        return;
      }

      listContainer.innerHTML = reviews.map(r => {
        const initials = r.author.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'КЛ';
        const starsStr = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
        const isMine = (r.userId && r.userId === (state.user?.id || 8949973080));

        return `
          <div class="p-4 rounded-3xl bg-white border border-slate-200/70 shadow-xs flex flex-col gap-2.5 transition-all">
            <!-- Review Header: Avatar, Name, User Duration, Stars -->
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-primary-fixed/60 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                  ${initials}
                </div>
                <div class="flex flex-col min-w-0">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs font-bold text-on-surface">${r.author}</span>
                    ${isMine ? '<span class="text-[9px] bg-primary-fixed text-primary px-1.5 py-0.2 rounded-full font-bold">Вы</span>' : ''}
                  </div>
                  <div class="flex items-center gap-1 text-[10px] text-slate-400">
                    <span class="material-symbols-outlined text-[12px]">schedule</span>
                    <span>${r.userDuration || 'Клиент сервиса'}</span>
                  </div>
                </div>
              </div>
              <div class="flex flex-col items-end">
                <span class="text-amber-400 text-sm tracking-widest">${starsStr}</span>
                <span class="text-[10px] text-slate-400 mt-0.5">${r.date || 'Недавно'}</span>
              </div>
            </div>

            <!-- Service Tag -->
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface-container-low text-slate-600 text-[11px] font-semibold w-fit">
              <span class="material-symbols-outlined text-[13px] text-primary">spa</span>
              <span>${r.service || 'Услуга'}</span>
            </div>

            <!-- Review Text -->
            <p class="text-xs text-slate-700 leading-relaxed break-words">
              ${r.text}
            </p>
          </div>
        `;
      }).join('');
    }

    // Modal: Open Add Review (Unified for Salon and Master)
    function openAddReviewModal() {
      const isMaster = (state.reviewsTargetType === 'master');
      const targetId = isMaster ? (state.activeMaster || 'master_beauty_alina') : (state.activeSalon || 'beauty');

      if (hasUserReviewedTarget(targetId)) {
        showToast(isMaster ? 'Вы уже оставили отзыв об этом мастере ⚠️ (лимит: 1 отзыв)' : 'Вы уже оставили отзыв об этом салоне ⚠️ (лимит: 1 отзыв)');
        return;
      }

      const modal = document.getElementById('addReviewModal');
      if (!modal) return;

      const sSub = document.getElementById('addReviewSalonSubtitle');
      const svcSelect = document.getElementById('addReviewServiceSelect');

      if (isMaster) {
        const master = (typeof getMasterById === 'function') ? getMasterById(targetId) : null;
        if (sSub) sSub.textContent = master ? `Мастер: ${master.name}` : 'Мастер';
        if (svcSelect) {
          const services = (master && master.services) ? master.services : [];
          if (services.length > 0) {
            svcSelect.innerHTML = services.map(s => `
              <option value="${s.name}">${s.name} (${s.price.toLocaleString('ru-RU')} ₽)</option>
            `).join('');
          } else {
            svcSelect.innerHTML = '<option value="Процедура">Процедура мастера</option>';
          }
        }
      } else {
        const venue = venues.find(v => v.id === targetId) || venues[0];
        if (sSub) sSub.textContent = venue.name;
        if (svcSelect) {
          const salonServices = venue.services || [];
          if (salonServices.length > 0) {
            svcSelect.innerHTML = salonServices.map(s => `
              <option value="${s.name}">${s.name} (${s.price.toLocaleString('ru-RU')} ₽)</option>
            `).join('');
          } else {
            svcSelect.innerHTML = `<option value="${venue.categoryText || 'Услуга'}">${venue.categoryText || 'Услуга салона'}</option>`;
          }
        }
      }

      // Populate User Info & Platform Duration
      const regDate = getUserRegistrationDate();
      const userDur = formatUserDuration(regDate);
      const uName = [state.user?.first_name, state.user?.last_name].filter(Boolean).join(' ') || 'Пользователь';
      const initials = ((state.user?.first_name ? state.user.first_name[0] : 'Т') + (state.user?.last_name ? state.user.last_name[0] : 'Г')).toUpperCase();

      const nameEl = document.getElementById('addReviewUserName');
      const regEl = document.getElementById('addReviewUserRegisteredAt');
      const avEl = document.getElementById('addReviewUserAvatar');

      if (nameEl) nameEl.textContent = uName;
      if (regEl) regEl.textContent = `На платформе: ${userDur}`;
      if (avEl) avEl.textContent = initials;

      // Reset fields
      setReviewRating(5);
      const textarea = document.getElementById('addReviewText');
      if (textarea) textarea.value = '';
      const charCount = document.getElementById('reviewCharCount');
      if (charCount) charCount.textContent = '0 / 600';

      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    function closeAddReviewModal() {
      const modal = document.getElementById('addReviewModal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    function setReviewRating(r) {
      currentReviewRating = r;
      const labels = {
        1: '1 из 5 (Ужасно)',
        2: '2 из 5 (Плохо)',
        3: '3 из 5 (Нормально)',
        4: '4 из 5 (Хорошо)',
        5: '5 из 5 (Отлично)'
      };
      const labelEl = document.getElementById('starRatingLabel');
      if (labelEl) labelEl.textContent = labels[r] || `${r} из 5`;

      document.querySelectorAll('#starPickerContainer .star-btn').forEach(btn => {
        const starNum = parseInt(btn.getAttribute('data-star'), 10);
        if (starNum <= r) {
          btn.textContent = '★';
          btn.classList.add('text-amber-400');
          btn.classList.remove('text-slate-300');
        } else {
          btn.textContent = '☆';
          btn.classList.remove('text-amber-400');
          btn.classList.add('text-slate-300');
        }
      });

      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
      } catch (e) { }
    }

    // Submit review with 1-review restriction & average rating update (Salon or Master)
    function submitSalonReview() {
      const isMaster = (state.reviewsTargetType === 'master');
      const targetId = isMaster ? (state.activeMaster || 'master_beauty_alina') : (state.activeSalon || 'beauty');

      // Check restriction: only 1 review per salon/master per user
      if (hasUserReviewedTarget(targetId)) {
        showToast(isMaster ? 'Вы уже оставили отзыв об этом мастере ⚠️' : 'Вы уже оставили отзыв об этом салоне ⚠️');
        closeAddReviewModal();
        return;
      }

      const textInput = document.getElementById('addReviewText');
      const textVal = (textInput?.value || '').trim();
      if (!textVal || textVal.length < 5) {
        showToast('Пожалуйста, напишите отзыв подробнее (от 5 символов)');
        textInput?.focus();
        return;
      }

      const svcSelect = document.getElementById('addReviewServiceSelect');
      const chosenService = svcSelect?.value || 'Процедура';

      const regDate = getUserRegistrationDate();
      const userDur = formatUserDuration(regDate);
      const uName = [state.user?.first_name, state.user?.last_name].filter(Boolean).join(' ') || 'Пользователь';
      const currentUserId = state.user?.id || 8949973080;

      const newReview = {
        id: 'rev_' + Date.now(),
        userId: currentUserId,
        author: uName,
        rating: currentReviewRating,
        service: chosenService,
        userDuration: userDur,
        date: 'Только что',
        text: textVal
      };

      const all = getAllStoredReviews();
      if (!all[targetId]) all[targetId] = [];
      all[targetId].unshift(newReview);
      saveAllStoredReviews(all);

      if (isMaster) {
        const master = (typeof getMasterById === 'function') ? getMasterById(targetId) : null;
        const { avg, count } = calculateMasterAverageRating(targetId, master);
        if (master) {
          master.rating = avg.toFixed(1);
          master.reviews_count = count;
        }
        renderMasterDetails(targetId);
        renderMasterReviewsScreen(targetId);
      } else {
        const venue = venues.find(v => v.id === targetId) || venues[0];
        const { avg, count } = calculateSalonAverageRating(targetId);
        venue.rating = avg.toFixed(1);
        venue.reviewsCount = count;
        renderSalonDetails(targetId);
        renderSalonReviewsScreen(targetId);
      }

      closeAddReviewModal();
      showToast('🎉 Спасибо! Ваш отзыв опубликован');

      // Send review to backend bot handler
      try {
        if (window.Telegram?.WebApp?.sendData) {
          window.Telegram.WebApp.sendData(JSON.stringify({
            action: 'review_added',
            target_type: isMaster ? 'master' : 'salon',
            target_id: targetId,
            user_name: uName,
            service_name: chosenService,
            rating: currentReviewRating,
            text: textVal
          }));
        }
      } catch (e) {
        console.log('sendData review note:', e);
      }

      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } catch (e) { }
    }

    // Update active counter and venue badge
    function updateVenueCounter() {
      const counterText = document.getElementById('venueCounterText');
      const nameBadge = document.getElementById('venueActiveNameBadge');
      if (!counterText || !nameBadge) return;

      if (visibleVenues.length === 0) {
        counterText.textContent = '0 из 0';
        nameBadge.textContent = 'Ничего не найдено';
        return;
      }

      const activeIdx = visibleVenues.findIndex(v => v.id === state.activeSalon);
      const displayIdx = (activeIdx >= 0) ? (activeIdx + 1) : 1;
      counterText.textContent = `${displayIdx} из ${visibleVenues.length}`;

      const activeVenue = visibleVenues[activeIdx >= 0 ? activeIdx : 0];
      nameBadge.textContent = activeVenue ? activeVenue.name : '';
    }

    // Navigate to Prev / Next venue
    function navigateVenue(direction) {
      if (!visibleVenues.length) return;
      const currentIndex = visibleVenues.findIndex(v => v.id === state.activeSalon);
      const safeIndex = (currentIndex >= 0) ? currentIndex : 0;
      const nextIndex = (safeIndex + direction + visibleVenues.length) % visibleVenues.length;
      const nextVenue = visibleVenues[nextIndex];
      selectMapPin(nextVenue.id, true);
    }

    // Bidirectional pin selection (Cards <-> Placemarks)
    function selectMapPin(type, scrollCarousel = true) {
      state.activeSalon = type;
      const venue = venues.find(v => v.id === type) || venues[0];

      // Update active marker styles on Yandex Map
      document.querySelectorAll('.ymap-custom-marker').forEach(el => el.classList.remove('active'));
      const pinEl = document.getElementById(`ymap-pin-${type}`);
      if (pinEl) pinEl.classList.add('active');

      if (mapPlacemarks) {
        Object.keys(mapPlacemarks).forEach(k => {
          mapPlacemarks[k].placemark.properties.set('activeClass', (k === type ? 'active' : ''));
        });
      }

      // Update active card styling in carousel
      document.querySelectorAll('.venue-card-item').forEach(card => card.classList.remove('active'));
      const activeCard = document.getElementById(`venue-card-${type}`);
      if (activeCard) {
        activeCard.classList.add('active');
        if (scrollCarousel) {
          activeCard.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
        }
      }

      updateVenueCounter();

      // Pan Yandex Map to coordinates without shifting or dropping the marker in compact view
      if (yandexMapInstance && venue) {
        try {
          if (!isMapFullscreen) {
            // In compact card mode: if pin is already within the map bounds, don't change center to prevent pin jumping down
            const bounds = yandexMapInstance.getBounds ? yandexMapInstance.getBounds() : null;
            let isInsideBounds = false;
            if (bounds && bounds[0] && bounds[1]) {
              const [minLat, minLng] = bounds[0];
              const [maxLat, maxLng] = bounds[1];
              const [lat, lng] = venue.coords;
              isInsideBounds = (lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng);
            }

            if (!isInsideBounds) {
              // Smooth pan without sudden zoom changes
              if (yandexMapInstance.panTo) {
                yandexMapInstance.panTo(venue.coords, { flying: false, duration: 300 });
              } else {
                yandexMapInstance.setCenter(venue.coords, yandexMapInstance.getZoom(), { duration: 300 });
              }
            }
          } else {
            // Fullscreen mode: comfortable center and view
            const curZoom = yandexMapInstance.getZoom ? yandexMapInstance.getZoom() : 14;
            const targetZoom = Math.max(curZoom, 13);
            yandexMapInstance.setCenter(venue.coords, targetZoom, { flying: true, duration: 450 });
          }
        } catch (err) {
          console.error('Error centering map:', err);
        }
      }
    }

    // Scroll listener on carousel to sync active pin when swiping
    let isCarouselScrolling = null;
    function initCarouselScrollListener() {
      const carousel = document.getElementById('venuesCarousel');
      if (!carousel || carousel._hasScrollListener) return;
      carousel._hasScrollListener = true;

      carousel.addEventListener('scroll', () => {
        clearTimeout(isCarouselScrolling);
        isCarouselScrolling = setTimeout(() => {
          const cards = Array.from(carousel.querySelectorAll('.venue-card-item'));
          if (!cards.length) return;

          const carouselRect = carousel.getBoundingClientRect();
          const carouselCenter = carouselRect.left + carouselRect.width / 2;

          let closestCard = null;
          let minDiff = Infinity;

          cards.forEach(card => {
            const cardRect = card.getBoundingClientRect();
            const cardCenter = cardRect.left + cardRect.width / 2;
            const diff = Math.abs(cardCenter - carouselCenter);
            if (diff < minDiff) {
              minDiff = diff;
              closestCard = card;
            }
          });

          if (closestCard) {
            const cardId = closestCard.id.replace('venue-card-', '');
            if (cardId && cardId !== state.activeSalon) {
              selectMapPin(cardId, false);
            }
          }
        }, 120);
      }, { passive: true });
    }

    function selectMapSlot(time, el) {
      document.querySelectorAll('.map-slot-btn').forEach(btn => {
        btn.classList.remove('bg-primary-fixed', 'text-primary', 'active');
        btn.classList.add('bg-surface-container-low', 'text-on-surface');
      });
      el.classList.add('bg-primary-fixed', 'text-primary', 'active');
      el.classList.remove('bg-surface-container-low', 'text-on-surface');
      state.selectedTime = time;
      showToast(`Выбрано время ${time}`);
    }

    // Master date selection
    function selectBookingDate(dateStr, label, el) {
      document.querySelectorAll('.date-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white', 'active');
        b.classList.add('bg-surface-container-low', 'text-on-surface');
      });
      el.classList.add('bg-primary', 'text-white', 'active');
      el.classList.remove('bg-surface-container-low', 'text-on-surface');
      state.selectedDate = label;
      document.getElementById('selectedDateLabel').textContent = `Время на ${label}:`;
      updateDock();
    }

    function selectMasterSlot(time, el) {
      document.querySelectorAll('.master-slot-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white', 'active');
        b.classList.add('bg-primary-fixed', 'text-primary');
      });
      el.classList.add('bg-primary', 'text-white', 'active');
      el.classList.remove('bg-primary-fixed', 'text-primary');
      state.selectedTime = time;
      updateDock();
    }

    // Service selector in master view
    function toggleService(id, price, name, duration, el) {
      const idx = state.selectedServices.findIndex(s => s.id === id);
      const icon = el.querySelector('.svc-icon');

      if (idx >= 0) {
        // Remove if not the only one
        if (state.selectedServices.length > 1) {
          state.selectedServices.splice(idx, 1);
          el.classList.remove('bg-primary-fixed/30', 'border-primary', 'border-2');
          el.classList.add('bg-surface-container-low');
          icon.className = 'svc-icon w-6 h-6 rounded-full bg-surface-container-highest text-slate-500 flex items-center justify-center shrink-0';
          icon.innerHTML = '<span class="material-symbols-outlined text-[15px]">add</span>';
        } else {
          showToast('Выберите хотя бы одну услугу');
          return;
        }
      } else {
        // Add
        state.selectedServices.push({ id, price, name, duration });
        el.classList.add('bg-primary-fixed/30', 'border-primary', 'border-2');
        el.classList.remove('bg-surface-container-low');
        icon.className = 'svc-icon w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center shrink-0';
        icon.innerHTML = '<span class="material-symbols-outlined text-[15px]">check</span>';
      }
      updateDock();
    }

    function updateDock() {
      const total = state.selectedServices.reduce((sum, s) => sum + s.price, 0);
      const totalDur = state.selectedServices.reduce((sum, s) => sum + s.duration, 0);
      const names = state.selectedServices.map(s => s.name).join(' + ');

      document.getElementById('dockTotalPrice').textContent = `${total.toLocaleString('ru-RU')} ₽`;
      document.getElementById('dockSummaryText').textContent = `${names} • ${state.selectedTime}`;
      document.getElementById('estimatedDuration').textContent = `~${totalDur} мин`;
    }

    // Booking modal
    function openBookingConfirmationModal() {
      const total = state.selectedServices.reduce((sum, s) => sum + s.price, 0);
      const names = state.selectedServices.map(s => s.name).join(' + ');

      document.getElementById('modalDateTime').textContent = `${state.selectedDate} в ${state.selectedTime}`;
      document.getElementById('modalServices').textContent = names;
      document.getElementById('modalTotalPrice').textContent = `${total.toLocaleString('ru-RU')} ₽`;

      const modal = document.getElementById('bookingModal');
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }

    // ==========================================
    // APPOINTMENTS STORE & DYNAMIC RENDERING
    // ==========================================
    const APPOINTMENTS_STORAGE_KEY = 'okoshko_appointments_v1';

    function getStoredAppointments() {
      try {
        const raw = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error('Error reading appointments:', e);
      }
      const initial = [
        {
          id: 'bk_1',
          salon: 'Beauty Studio',
          address: 'ул. Большая Садовая, 42',
          master: 'Алина Романова (Топ)',
          service: 'Маникюр с покрытием гель-лак Luxio',
          date: 'Сегодня',
          time: '14:00',
          total: 2500,
          status: 'active',
          img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw',
          rating: '4.9'
        },
        {
          id: 'bk_0',
          salon: 'Beauty Studio',
          address: 'ул. Большая Садовая, 42',
          master: 'Кристина Ли',
          service: 'Smart-педикюр эстетический',
          date: '24 октября',
          time: '15:30',
          total: 2800,
          status: 'completed',
          img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw',
          rating: '4.9'
        }
      ];
      try {
        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(initial));
      } catch (e) { }
      return initial;
    }

    function saveStoredAppointments(list) {
      try {
        localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(list));
      } catch (e) {
        console.error('Error saving appointments:', e);
      }
    }

    function renderAppointments() {
      const allAppts = getStoredAppointments();
      const activeList = allAppts.filter(a => a.status === 'active');
      const historyList = allAppts.filter(a => a.status !== 'active');

      const badge = document.getElementById('activeApptCountBadge');
      if (badge) {
        badge.textContent = `${activeList.length} ${pluralizeVisits(activeList.length)}`;
      }
      const profileApptsCount = document.getElementById('profileApptsCount');
      if (profileApptsCount) {
        profileApptsCount.textContent = allAppts.length;
      }

      // Render Active Appointments
      const activeContainer = document.getElementById('activeAppointmentsList');
      if (activeContainer) {
        if (activeList.length === 0) {
          activeContainer.innerHTML = `
            <div class="rounded-3xl bg-white p-6 shadow-xs border border-slate-200/70 text-center flex flex-col items-center gap-3">
              <div class="w-14 h-14 rounded-2xl bg-primary-fixed/40 text-primary flex items-center justify-center">
                <span class="material-symbols-outlined text-[28px]">calendar_today</span>
              </div>
              <div>
                <h3 class="font-bold text-sm text-on-surface">Нет активных записей</h3>
                <p class="text-xs text-slate-400 mt-1 max-w-[240px]">Выберите салон или услугу на карте и забронируйте удобное окошко</p>
              </div>
              <button onclick="router.navigate('map')" class="mt-1 px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold shadow-xs active:scale-95 transition-transform flex items-center gap-1.5">
                <span>Найти салон на карте</span>
                <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
              </button>
            </div>
          `;
        } else {
          activeContainer.innerHTML = activeList.map(a => `
            <div id="appt-card-${a.id}" class="rounded-3xl bg-white p-4 shadow-xs border border-primary/20 flex flex-col gap-3 relative overflow-hidden animate-in fade-in duration-200">
              <div class="flex items-center justify-between">
                <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-fixed text-primary font-semibold text-xs">
                  <span class="material-symbols-outlined text-[14px]">schedule</span>
                  <span>${a.date} в ${a.time}</span>
                </div>
                <div class="flex items-center gap-1">
                  <span class="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">Подтверждено</span>
                  <button onclick="router.navigate('map')" aria-label="Маршрут на карте" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-primary active:scale-90 transition-transform">
                    <span class="material-symbols-outlined text-[17px]">near_me</span>
                  </button>
                </div>
              </div>

              <!-- Studio & Master Info -->
              <div class="flex gap-3 items-center">
                <div class="w-14 h-14 rounded-2xl overflow-hidden bg-surface-container shrink-0">
                  <img class="w-full h-full object-cover" alt="${a.salon}" src="${a.img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw'}"/>
                </div>
                <div class="flex flex-col min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <span class="font-bold text-sm text-on-surface truncate">${a.salon}</span>
                    <span class="text-xs text-amber-500 font-bold">★ ${a.rating || '4.9'}</span>
                  </div>
                  <span class="text-xs text-on-surface-variant font-medium truncate mt-0.5">${a.service}</span>
                  <div class="flex items-center justify-between mt-0.5">
                    <span class="text-xs text-slate-500 truncate">${a.master}</span>
                    <span class="text-xs font-bold text-primary">${a.total ? a.total.toLocaleString('ru-RU') + ' ₽' : ''}</span>
                  </div>
                </div>
              </div>

              <!-- Action buttons -->
              <div class="flex items-center gap-2 pt-1 border-t border-slate-100">
                <button onclick="rescheduleAppointment('${a.id}')" class="flex-1 py-2 px-3 rounded-full bg-surface-container text-on-surface font-semibold text-xs active:scale-95 transition-all text-center">
                  Перенести
                </button>
                <button onclick="cancelAppointment('${a.id}')" class="py-2 px-4 rounded-full bg-rose-50 text-rose-600 font-semibold text-xs active:scale-95 transition-all text-center">
                  Отменить
                </button>
                <button onclick="showTelegramChatAlert()" aria-label="Чат в Telegram" class="w-9 h-9 rounded-full bg-primary-fixed text-primary flex items-center justify-center active:scale-95 transition-all shrink-0">
                  <span class="material-symbols-outlined text-[17px]">chat_bubble_outline</span>
                </button>
              </div>
            </div>
          `).join('');
        }
      }

      // Render History
      const historyContainer = document.getElementById('historyAppointmentsList');
      const historySection = document.getElementById('historyAppointmentsSection');
      if (historyContainer && historySection) {
        if (historyList.length === 0) {
          historySection.classList.add('hidden');
        } else {
          historySection.classList.remove('hidden');
          historyContainer.innerHTML = historyList.map(h => {
            const isCancelled = (h.status === 'cancelled');
            const iconBg = isCancelled ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-600';
            const iconText = isCancelled ? '✕' : '✓';
            const statusLabel = isCancelled ? 'Отменена' : 'Завершена';

            return `
              <div class="bg-white rounded-3xl p-3.5 shadow-xs border border-slate-200/60 flex items-center justify-between">
                <div class="flex items-center gap-3 min-w-0 flex-1 pr-2">
                  <div class="w-10 h-10 rounded-2xl ${iconBg} flex items-center justify-center font-bold text-sm shrink-0">
                    ${iconText}
                  </div>
                  <div class="flex flex-col min-w-0">
                    <span class="text-xs font-bold text-on-surface truncate">${h.service}</span>
                    <span class="text-[11px] text-slate-400 mt-0.5 truncate">${h.date} • ${h.salon} • ${statusLabel}</span>
                  </div>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                  <button onclick="repeatAppointment('${h.id}')" class="px-2.5 py-1 rounded-full bg-primary-fixed text-primary text-[11px] font-semibold active:scale-95 transition-all">
                    Повторить
                  </button>
                  <button onclick="deleteAppointment('${h.id}')" aria-label="Удалить" class="w-7 h-7 rounded-full text-slate-400 hover:text-rose-500 flex items-center justify-center active:scale-90 transition-all">
                    <span class="material-symbols-outlined text-[16px]">delete</span>
                  </button>
                </div>
              </div>
            `;
          }).join('');
        }
      }
    }

    function pluralizeVisits(n) {
      if (n % 10 === 1 && n % 100 !== 11) return 'активная';
      if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return 'активные';
      return 'активных';
    }

    function cancelAppointment(id) {
      if (!confirm('Вы уверены, что хотите отменить эту запись?')) return;
      const allAppts = getStoredAppointments();
      const appt = allAppts.find(a => a.id === id);
      if (appt) {
        appt.status = 'cancelled';
        saveStoredAppointments(allAppts);
        renderAppointments();
        showToast('Запись отменена и перемещена в историю');
        try {
          if (window.Telegram?.WebApp?.HapticFeedback) {
            window.Telegram.WebApp.HapticFeedback.notificationOccurred('warning');
          }
        } catch (e) { }
      }
    }

    function deleteAppointment(id) {
      const allAppts = getStoredAppointments();
      const filtered = allAppts.filter(a => a.id !== id);
      saveStoredAppointments(filtered);
      renderAppointments();
      showToast('Запись удалена');
    }

    function clearCompletedHistory() {
      if (!confirm('Очистить всю историю завершенных и отмененных записей?')) return;
      const allAppts = getStoredAppointments();
      const activeOnly = allAppts.filter(a => a.status === 'active');
      saveStoredAppointments(activeOnly);
      renderAppointments();
      showToast('История визитов очищена');
    }

    function rescheduleAppointment(id) {
      showToast('Выберите новое время в салоне');
      setTimeout(() => router.navigate('salon'), 300);
    }

    function repeatAppointment(id) {
      const allAppts = getStoredAppointments();
      const appt = allAppts.find(a => a.id === id);
      if (appt) {
        openDirectBooking({
          salon: appt.salon,
          master: appt.master,
          service: appt.service,
          price: appt.total,
          date: 'Сегодня',
          time: '14:00'
        });
      } else {
        router.navigate('salon');
      }
    }

    // Direct booking helper
    function selectSalonMaster(masterName) {
      state.currentBooking = state.currentBooking || {};
      state.currentBooking.master = masterName;
      showToast(`Выбран мастер: ${masterName} ✨`);
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
      } catch (e) { }
    }

    function openDirectBooking(opts) {
      state.currentBooking = {
        salon: opts.salon || 'Beauty Studio',
        address: opts.address || 'ул. Большая Садовая, 42',
        master: opts.master || (state.currentBooking?.master || 'Алина Романова'),
        service: opts.service || 'Маникюр с покрытием гель-лак Luxio',
        price: opts.price || 2500,
        date: opts.date || state.selectedDate || 'Сегодня',
        time: opts.time || state.selectedTime || '14:00'
      };

      const mSalon = document.getElementById('modalSalon');
      const mMaster = document.getElementById('modalMaster');
      const mDate = document.getElementById('modalDateTime');
      const mService = document.getElementById('modalServices');
      const mPrice = document.getElementById('modalTotalPrice');

      if (mSalon) mSalon.textContent = state.currentBooking.salon;
      if (mMaster) mMaster.textContent = state.currentBooking.master;
      if (mDate) mDate.textContent = `${state.currentBooking.date} в ${state.currentBooking.time}`;
      if (mService) mService.textContent = state.currentBooking.service;
      if (mPrice) mPrice.textContent = `${state.currentBooking.price.toLocaleString('ru-RU')} ₽`;

      const modal = document.getElementById('bookingModal');
      if (modal) {
        modal.classList.remove('hidden');
        modal.classList.add('flex');
      }
    }

    function openBookingConfirmationModal() {
      openDirectBooking({
        salon: 'Beauty Studio',
        master: 'Алина Романова',
        service: state.selectedServices.map(s => s.name).join(' + '),
        price: state.selectedServices.reduce((sum, s) => sum + s.price, 0),
        date: state.selectedDate,
        time: state.selectedTime
      });
    }

    function closeBookingModal() {
      const modal = document.getElementById('bookingModal');
      if (modal) {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    }

    function confirmBooking() {
      closeBookingModal();

      const bookingData = state.currentBooking || {
        salon: 'Beauty Studio',
        address: 'ул. Большая Садовая, 42',
        master: 'Алина Романова',
        service: 'Маникюр с покрытием гель-лак Luxio',
        price: 2500,
        date: 'Сегодня',
        time: '14:00'
      };

      const newAppt = {
        id: 'bk_' + Date.now(),
        salon: bookingData.salon,
        address: bookingData.address || 'ул. Большая Садовая, 42',
        master: bookingData.master,
        service: bookingData.service,
        date: bookingData.date,
        time: bookingData.time,
        total: bookingData.price,
        status: 'active',
        img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAcCxWme6ULSpQ44tJiz4tQHu4YUpsONV_LbIPwYQ7F26j9eLjQH3DxXwCFKuXmEg-GAdD5l167fJ914D7wMIfLygqAWKTg0UbacsMAEvp04kKtm0CS8wzbbWTrzRqI5-qgi0_kzzDS106FjHN8m8IB73sqELUJHQHEfTeIngb2cQJHzPk7uGk018G7mBHpA6axq-QqQxuVTuk2fdkSj7cH3IreFxih-Q7Yo2PZxw',
        rating: '4.9'
      };

      const all = getStoredAppointments();
      all.unshift(newAppt);
      saveStoredAppointments(all);
      renderAppointments();

      showToast('🎉 Запись успешно подтверждена!');

      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.notificationOccurred('success');
        }
      } catch (e) { }

      // Send to bot backend via Telegram WebApp sendData
      try {
        if (window.Telegram?.WebApp?.sendData) {
          window.Telegram.WebApp.sendData(JSON.stringify({
            action: 'booking_confirmed',
            salon: newAppt.salon,
            master: newAppt.master,
            date: newAppt.date,
            time: newAppt.time,
            services: newAppt.service,
            total: newAppt.total
          }));
        }
      } catch (e) {
        console.log('sendData note:', e);
      }

      setTimeout(() => {
        router.navigate('appointments');
      }, 500);
    }
