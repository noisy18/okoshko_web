// ==========================================
    // YANDEX MAPS & CLUSTERING INTEGRATION
    // ==========================================
    let yandexMapInstance = null;
    let mapClustererInstance = null;
    let mapPlacemarks = {};
    const userCoordinates = [55.764500, 37.601000];

    // Global pin click handler for pins, gestures, and cards
    window.handlePinClick = function (venueId) {
      if (!venueId) return;
      const isAlreadyActive = (state.activeSalon === venueId);
      selectMapPin(venueId, true);
      const venue = venues.find(v => v.id === venueId);
      if (venue) {
        if (isAlreadyActive) {
          showToast(`Открываем «${venue.name}»... ✨`);
          setTimeout(() => openVenueDetails(venueId), 300);
        } else {
          showToast(`Выбран салон «${venue.name}» 📍`);
        }
      }
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
      } catch (e) { }
    };

    // Fullscreen Map State
    let isMapFullscreen = false;

    function openFullscreenMap(e) {
      if (e) {
        e.stopPropagation();
        e.preventDefault();
      }
      if (isMapFullscreen) return;
      isMapFullscreen = true;

      const mapCard = document.getElementById('mapContainerCard');
      const closeBtn = document.getElementById('closeFullscreenMapBtn');
      const openBtn = document.getElementById('openFullscreenMapBtn');
      const hintBadge = document.getElementById('mapHintBadge');
      const globalHeader = document.getElementById('globalHeader');
      const globalNav = document.getElementById('globalNav');

      const mapCityBtn = document.getElementById('mapFullscreenCityBtn');
      if (mapCard) mapCard.classList.add('is-fullscreen');
      if (closeBtn) closeBtn.classList.remove('hidden');
      if (mapCityBtn) mapCityBtn.classList.remove('hidden');
      if (openBtn) openBtn.classList.add('hidden');
      if (hintBadge) hintBadge.classList.add('hidden');
      if (globalHeader) globalHeader.classList.add('hidden');
      if (globalNav) {
        globalNav.classList.remove('hidden');
        globalNav.style.zIndex = '35'; // ensure bottom menu stays above fullscreen map
      }

      document.body.classList.add('map-fullscreen-mode');

      // Enable scrollZoom in full screen mode for friendly zooming
      try {
        if (yandexMapInstance && yandexMapInstance.behaviors) {
          yandexMapInstance.behaviors.enable('scrollZoom');
        }
      } catch (err) { }

      // Multi-stage trigger fitToViewport for Yandex Map to ensure 100% viewport filling without gaps
      if (yandexMapInstance && yandexMapInstance.container) {
        yandexMapInstance.container.fitToViewport();
        setTimeout(() => { if (yandexMapInstance?.container) yandexMapInstance.container.fitToViewport(); }, 60);
        setTimeout(() => { if (yandexMapInstance?.container) yandexMapInstance.container.fitToViewport(); }, 200);
        setTimeout(() => { if (yandexMapInstance?.container) yandexMapInstance.container.fitToViewport(); }, 400);
      }

      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('medium');
        }
      } catch (err) { }
      showToast('Карта на весь экран 🗺️');
    }

    function closeFullscreenMap(e) {
      if (e) e.stopPropagation();
      if (!isMapFullscreen) return;
      isMapFullscreen = false;

      const mapCard = document.getElementById('mapContainerCard');
      const closeBtn = document.getElementById('closeFullscreenMapBtn');
      const hintBadge = document.getElementById('mapHintBadge');
      const globalHeader = document.getElementById('globalHeader');
      const globalNav = document.getElementById('globalNav');

      if (mapCard) mapCard.classList.remove('is-fullscreen');
      if (closeBtn) closeBtn.classList.add('hidden');
      const mapCityBtn = document.getElementById('mapFullscreenCityBtn');
      if (mapCityBtn) mapCityBtn.classList.add('hidden');
      const openBtn = document.getElementById('openFullscreenMapBtn');
      if (openBtn) openBtn.classList.remove('hidden');
      if (hintBadge) hintBadge.classList.remove('hidden');
      if (globalHeader) globalHeader.classList.remove('hidden');
      if (globalNav) {
        globalNav.style.zIndex = '';
        globalNav.classList.remove('hidden');
      }

      document.body.classList.remove('map-fullscreen-mode');

      // Disable scrollZoom back to avoid page scroll lock in compact mode
      try {
        if (yandexMapInstance && yandexMapInstance.behaviors) {
          yandexMapInstance.behaviors.disable('scrollZoom');
        }
      } catch (err) { }

      // Trigger fitToViewport for compact card
      if (yandexMapInstance && yandexMapInstance.container) {
        yandexMapInstance.container.fitToViewport();
        setTimeout(() => { if (yandexMapInstance?.container) yandexMapInstance.container.fitToViewport(); }, 80);
        setTimeout(() => { if (yandexMapInstance?.container) yandexMapInstance.container.fitToViewport(); }, 250);
      }

      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
      } catch (err) { }
    }

    function initYandexMap() {
      if (yandexMapInstance) {
        if (yandexMapInstance.container) {
          yandexMapInstance.container.fitToViewport();
        }
        return;
      }

      if (typeof ymaps === 'undefined') {
        console.warn('Yandex Maps API is loading...');
        setTimeout(initYandexMap, 500);
        return;
      }

      ymaps.ready(() => {
        const mapContainer = document.getElementById('yandexMap');
        if (!mapContainer || yandexMapInstance) return;

        yandexMapInstance = new ymaps.Map('yandexMap', {
          center: [55.766324, 37.604245],
          zoom: 14,
          controls: []
        }, {
          suppressMapOpenBlock: true
        });

        // Disable scroll zooming on desktop wheel so page scrolling is never blocked
        try {
          yandexMapInstance.behaviors.disable('scrollZoom');
        } catch (e) { }

        // Custom template layout for individual interactive glass pins
        const PinLayout = ymaps.templateLayoutFactory.createClass(
          '<div id="ymap-pin-$[properties.id]" data-venue-id="$[properties.id]" class="ymap-custom-marker $[properties.activeClass]">' +
          '<span class="ymap-pin-star">★</span>' +
          '<span class="ymap-pin-rating">$[properties.rating]</span>' +
          '<span class="ymap-pin-sep">·</span>' +
          '<span class="ymap-pin-name">$[properties.title]</span>' +
          '</div>',
          {
            build: function () {
              PinLayout.superclass.build.call(this);
              this._element = this.getParentElement().querySelector('.ymap-custom-marker');
              if (this._element) {
                this._onPinClick = (e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const venueId = this.getData().properties.get('id');
                  window.handlePinClick(venueId);
                };
                this._element.addEventListener('click', this._onPinClick);
                this._element.addEventListener('touchend', this._onPinClick);
                this._element.addEventListener('pointerdown', (e) => e.stopPropagation());
              }
            },
            clear: function () {
              if (this._element && this._onPinClick) {
                this._element.removeEventListener('click', this._onPinClick);
                this._element.removeEventListener('touchend', this._onPinClick);
              }
              PinLayout.superclass.clear.call(this);
            }
          }
        );

        // Custom template layout for cluster icons showing count and region info on zoom out
        const ClusterLayout = ymaps.templateLayoutFactory.createClass(
          '<div class="ymap-custom-cluster">' +
          '<span class="material-symbols-outlined text-[16px] leading-none">location_on</span>' +
          '<span class="ymap-cluster-count">$[properties.geoObjects.length]</span>' +
          '</div>'
        );

        // Clusterer: groups placemarks when zoomed out to prevent crowding
        mapClustererInstance = new ymaps.Clusterer({
          preset: 'islands#violetClusterIcons',
          groupByCoordinates: false,
          clusterDisableClickZoom: false,
          minClusterSize: 2,
          gridSize: 64,
          maxZoom: 13,
          hasBalloon: false
        });

        // Click on cluster displays friendly notification and zooms in
        mapClustererInstance.events.add('click', (e) => {
          const target = e.get('target');
          if (target && target.getGeoObjects) {
            const count = target.getGeoObjects().length;
            showToast(`В этой области найдено ${count} салонов ✨`);
          }
        });

        // Add clusterer to map once
        yandexMapInstance.geoObjects.add(mapClustererInstance);

        // Register all venues on Yandex Map inside clusterer
        rebuildMapPlacemarks(PinLayout);

        // Container-level fallback delegation to guarantee clicks never miss
        mapContainer.addEventListener('click', (e) => {
          const marker = e.target.closest('.ymap-custom-marker');
          if (marker) {
            e.stopPropagation();
            const venueId = marker.getAttribute('data-venue-id') || marker.id.replace('ymap-pin-', '');
            if (venueId) {
              window.handlePinClick(venueId);
            }
          }
        });

        // Initial carousel rendering and sync
        renderVenuesCarousel();
        selectMapPin(state.activeSalon || 'beauty', true);
        initCarouselScrollListener();
      });
    }

    // Helper: Build or update placemarks inside the Clusterer
    function rebuildMapPlacemarks(PinLayoutClass) {
      if (!yandexMapInstance || !mapClustererInstance) return;

      mapClustererInstance.removeAll();
      mapPlacemarks = {};

      const Layout = PinLayoutClass || ymaps.templateLayoutFactory.createClass(
        '<div id="ymap-pin-$[properties.id]" data-venue-id="$[properties.id]" class="ymap-custom-marker $[properties.activeClass]">' +
        '<span class="ymap-pin-star">★</span>' +
        '<span class="ymap-pin-rating">$[properties.rating]</span>' +
        '<span class="ymap-pin-sep">·</span>' +
        '<span class="ymap-pin-name">$[properties.title]</span>' +
        '</div>'
      );

      const placemarksList = [];

      visibleVenues.forEach(loc => {
        const pm = new ymaps.Placemark(
          loc.coords,
          {
            id: loc.id,
            title: loc.name,
            rating: loc.rating,
            activeClass: (loc.id === state.activeSalon ? 'active' : '')
          },
          {
            iconLayout: Layout,
            iconOffset: [0, 0],
            iconShape: {
              type: 'Rectangle',
              coordinates: [
                [-65, -36], [65, 4]
              ]
            },
            hasBalloon: false,
            cursor: 'pointer'
          }
        );

        pm.events.add('click', (e) => {
          e.stopPropagation();
          window.handlePinClick(loc.id);
        });

        mapPlacemarks[loc.id] = { placemark: pm, coords: loc.coords, venue: loc };
        placemarksList.push(pm);
      });

      mapClustererInstance.add(placemarksList);
    }

    // Render cards in horizontal carousel
    function renderVenuesCarousel() {
      const container = document.getElementById('venuesCarousel');
      if (!container) return;

      if (visibleVenues.length === 0) {
        container.innerHTML = `
          <div class="w-full bg-white/95 backdrop-blur-xl rounded-3xl p-6 text-center border border-white shadow-md flex flex-col items-center gap-3 mx-auto">
            <span class="material-symbols-outlined text-[36px] text-slate-400">search_off</span>
            <div>
              <h3 class="font-bold text-sm text-on-surface">Ничего не найдено</h3>
              <p class="text-xs text-slate-500 mt-1">Попробуйте ввести другой запрос или сбросить поиск</p>
            </div>
            <button onclick="clearSearch()" class="px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-xs active:scale-95 transition-transform">
              Сбросить поиск
            </button>
          </div>
        `;
        updateVenueCounter();
        return;
      }

      container.innerHTML = visibleVenues.map((v) => {
        const isActive = (v.id === state.activeSalon);
        const slotsHtml = v.slots.map((slot, sIdx) => `
          <button onclick="event.stopPropagation(); selectVenueSlot('${v.id}', '${slot}', this)" class="venue-slot-btn py-1.5 px-2 rounded-xl ${sIdx === 0 ? 'bg-primary-fixed text-primary font-bold' : 'bg-surface-container-low text-on-surface'} text-xs active:scale-95 transition-all text-center">
            ${slot}
          </button>
        `).join('');

        return `
          <div id="venue-card-${v.id}" onclick="selectMapPin('${v.id}', true)" class="venue-card-item ${isActive ? 'active' : ''} rounded-3xl p-4 flex flex-col gap-3 cursor-pointer">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-primary' : 'text-slate-400'}">
                ${isActive ? '● Выбрано на карте' : v.type}
              </span>
              <div class="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                <span class="material-symbols-outlined text-[13px]">near_me</span>
                <span>${v.distance}</span>
              </div>
            </div>

            <div class="flex items-start gap-3.5" onclick="event.stopPropagation(); openVenueDetails('${v.id}')">
              <div class="relative w-16 h-16 rounded-2xl overflow-hidden shrink-0 bg-surface-container shadow-xs">
                <img class="w-full h-full object-cover" alt="${v.name}" src="${v.img}"/>
                <div class="absolute bottom-1 right-1 px-1 py-0.2 rounded-full bg-black/60 backdrop-blur-sm text-white text-[9px] flex items-center gap-0.5">
                  <span class="material-symbols-outlined text-[9px]">photo_camera</span>
                  <span>${v.photoCount}</span>
                </div>
              </div>

              <div class="flex flex-col min-w-0 flex-1 justify-center">
                <div class="flex items-center justify-between gap-1">
                  <h2 class="font-bold text-sm text-on-surface truncate">${v.name}</h2>
                  <div class="flex items-center gap-0.5 shrink-0 bg-amber-50 px-1.5 py-0.5 rounded-full border border-amber-200/40">
                    <span class="material-symbols-outlined text-amber-500 text-[13px]" style="font-variation-settings: 'FILL' 1;">star</span>
                    <span class="text-[11px] font-bold text-amber-900">${v.rating}</span>
                    <span class="text-[10px] text-amber-700/70">(${v.reviewsCount})</span>
                  </div>
                </div>
                <p class="text-[11px] text-on-surface-variant mt-0.5 truncate">${v.categoryText}</p>
                <div class="flex items-center gap-1.5 mt-1">
                  <span class="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-medium truncate max-w-[210px]">
                    <span class="material-symbols-outlined text-[11px]">location_on</span>
                    <span class="truncate">${v.regionName || v.address}</span>
                  </span>
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-1 pt-1 border-t border-slate-100">
              <div class="flex items-center justify-between">
                <span class="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Ближайшие окошки</span>
                <span class="text-[10px] text-primary font-bold">${v.priceFrom}</span>
              </div>
              <div class="grid grid-cols-3 gap-1.5">
                ${slotsHtml}
              </div>
            </div>

            <button onclick="event.stopPropagation(); openVenueDetails('${v.id}')" class="w-full mt-0.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary to-primary-container text-white font-semibold text-xs shadow-[0_4px_14px_rgba(95,58,221,0.28)] flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all">
              <span>Записаться в «${v.name}»</span>
              <span class="material-symbols-outlined text-[15px]">arrow_forward</span>
            </button>
          </div>
        `;
      }).join('');

      updateVenueCounter();
    }

    // Direct slot click in card
    function selectVenueSlot(venueId, slotTime, btn) {
      state.activeSalon = venueId;
      state.selectedTime = slotTime;

      const card = document.getElementById(`venue-card-${venueId}`);
      if (card) {
        card.querySelectorAll('.venue-slot-btn').forEach(b => {
          b.className = 'venue-slot-btn py-1.5 px-2 rounded-xl bg-surface-container-low text-on-surface text-xs active:scale-95 transition-all text-center';
        });
        btn.className = 'venue-slot-btn py-1.5 px-2 rounded-xl bg-primary text-white font-bold text-xs active:scale-95 transition-all text-center shadow-xs';
      }

      const venue = venues.find(v => v.id === venueId);
      showToast(`Выбрано время ${slotTime} в ${venue ? venue.name : ''} ⏱`);
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
        }
      } catch (e) { }
    }

    // Open venue details page with full dynamic rendering
    function openVenueDetails(id) {
      state.activeSalon = id;
      renderSalonDetails(id);
      router.navigate('salon');
      updateSalonDetailsHeartUI();
    }

    // Helper to get master object by ID across all venues
    function getMasterById(masterId) {
      if (!masterId) return null;
      for (const v of venues) {
        if (v.masters && Array.isArray(v.masters)) {
          const found = v.masters.find(m => m.id === masterId || m.name === masterId);
          if (found) return { ...found, salonId: v.id, salonName: v.name, salonAddress: v.address };
        }
      }
      return null;
    }

    // Dynamic rendering of Screen 2: Salon Details
    function renderSalonDetails(salonId) {
      const salon = venues.find(v => v.id === salonId) || venues[0];
      if (!salon) return;

      // 1. Hero Image & Badges
      const heroImg = document.getElementById('salonHeroImg');
      if (heroImg) {
        heroImg.src = salon.img || 'https://lh3.googleusercontent.com/aida-public/AB6AXuD68Q2lB-8_fzvF7A5OEHVHVhzif4gV6RJO3v1Pki6C3MDKAe0aVRpFaq2OhI2tIrB-199wxEmoCupVLmA6hNZB-2aghZ_lOnO1YyyoChZAtTcfdODO9ojl_oO6S_ZYBAgjLIx2n_S6TS09jqNtPujm77WTaf7Wy_NwiyDpJ5Qm3T1inuQxRLzxzvPJa64DlATLBAqU-N_vG49gtkadYgOYO1BBb74Voj3HfrL87g';
        heroImg.alt = salon.name;
      }
      const distText = document.getElementById('salonDistanceText');
      if (distText) distText.textContent = salon.distance ? `${salon.distance} от вас` : 'Рядом с вами';

      // 2. Title, Subtitle, Rating, Reviews
      const nameEl = document.getElementById('salonName');
      if (nameEl) nameEl.textContent = salon.name;

      const subEl = document.getElementById('salonCategorySub');
      if (subEl) subEl.textContent = salon.categoryText || salon.type;

      const ratingEl = document.getElementById('salonRating');
      if (ratingEl) ratingEl.textContent = salon.rating || '5.0';

      const reviewsEl = document.getElementById('salonReviewsCount');
      if (reviewsEl) reviewsEl.textContent = `(${salon.reviewsCount || 100})`;

      const descEl = document.getElementById('salonDescText');
      if (descEl) {
        if (salon.description) {
          descEl.textContent = salon.description;
          descEl.classList.remove('hidden');
        } else {
          descEl.classList.add('hidden');
        }
      }

      // 3. Category Tags
      const tagsContainer = document.getElementById('salonCategoryTags');
      if (tagsContainer) {
        const catMap = {
          nails: '💅 Маникюр',
          pedicure: '🦶 Педикюр',
          brows: '✨ Брови',
          hair: '💇‍♀️ Волосы',
          massage: '💆 SPA & Массаж'
        };
        const activeTags = salon.categoryTags || ['nails'];
        tagsContainer.innerHTML = activeTags.map(tag => `
          <span class="px-2.5 py-1 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium whitespace-nowrap shadow-xs">
            ${catMap[tag] || tag}
          </span>
        `).join('');
      }

      // 4. Address
      const addrEl = document.getElementById('salonAddressText');
      if (addrEl) addrEl.textContent = salon.address || 'Адрес уточняется';

      // 5. Hot Slot & Earliest Slot
      const earliestSlot = (salon.slots && salon.slots.length) ? salon.slots[0] : '14:00';
      const hotSlotText = document.getElementById('salonHotSlotText');
      if (hotSlotText) hotSlotText.textContent = `Ближайшее окно: Сегодня в ${earliestSlot}`;

      const bottomSlot = document.getElementById('salonBottomBarSlot');
      if (bottomSlot) bottomSlot.textContent = `Сегодня, ${earliestSlot}`;

      // Wire hot slot & bottom bar button clicks
      const firstMaster = (salon.masters && salon.masters.length) ? salon.masters[0] : { name: 'Любой мастер' };
      const firstService = (salon.services && salon.services.length) ? salon.services[0] : { name: salon.categoryText || 'Услуга', price: 2000 };

      const hotBtn = document.getElementById('salonHotSlotBtn');
      if (hotBtn) {
        hotBtn.onclick = () => openDirectBooking({
          salon: salon.name,
          address: salon.address,
          master: firstMaster.name,
          service: firstService.name,
          price: firstService.price,
          date: 'Сегодня',
          time: earliestSlot
        });
      }

      const bottomBtn = document.getElementById('salonBottomBarBtn');
      if (bottomBtn) {
        bottomBtn.onclick = () => openDirectBooking({
          salon: salon.name,
          address: salon.address,
          master: firstMaster.name,
          service: firstService.name,
          price: firstService.price,
          date: 'Сегодня',
          time: earliestSlot
        });
      }

      // 6. Masters Rail
      const mastersRail = document.getElementById('salonMastersRail');
      const mastersCountLabel = document.getElementById('salonMastersCountLabel');
      const salonMasters = salon.masters || [];
      if (mastersCountLabel) mastersCountLabel.textContent = `Все (${salonMasters.length})`;

      if (mastersRail) {
        let railHTML = '';

        // "Express Any Master" card
        railHTML += `
          <div onclick="openDirectBooking({ salon: '${salon.name}', address: '${salon.address}', master: 'Любой свободный мастер', service: '${firstService.name}', price: ${firstService.price}, date: 'Сегодня', time: '${earliestSlot}' })" class="min-w-[130px] p-3 rounded-2xl bg-white border border-slate-200 shadow-xs flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform shrink-0">
            <div class="w-12 h-12 rounded-full bg-gradient-to-tr from-primary to-primary-container text-white flex items-center justify-center font-bold text-base shadow-xs mb-2">
              ✨
            </div>
            <span class="text-xs font-bold text-on-surface">Любой мастер</span>
            <span class="text-[10px] text-primary font-medium">Экспресс-запись</span>
            <div class="mt-2 text-[10px] bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-full">
              сегодня ${earliestSlot}
            </div>
          </div>
        `;

        // Render each master card
        salonMasters.forEach(m => {
          const mSlotsText = (m.slots && m.slots.length) ? m.slots.slice(0, 2).join(', ') : earliestSlot;
          const isTop = (m.grade_badge && m.grade_badge.includes('TOP'));
          railHTML += `
            <div onclick="openMasterDetails('${m.id}')" class="min-w-[130px] p-3 rounded-2xl bg-white ${isTop ? 'border-2 border-primary/40' : 'border border-slate-200'} shadow-xs flex flex-col items-center text-center cursor-pointer active:scale-95 transition-transform shrink-0 relative">
              <div class="w-12 h-12 rounded-full overflow-hidden bg-primary-fixed mb-2 shadow-xs">
                <img class="w-full h-full object-cover" alt="${m.name}" src="${m.avatar_url}" onerror="this.src='https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw'"/>
              </div>
              <span class="text-xs font-bold text-on-surface truncate w-full">${m.name}</span>
              <div class="flex items-center space-x-0.5 text-[10px] text-amber-500 font-bold">
                <span>⭐</span>
                <span>${m.rating || '5.0'}</span>
                <span class="text-slate-400 font-normal truncate">• ${m.grade_badge || 'PRO'}</span>
              </div>
              <div class="mt-2 text-[10px] bg-primary-fixed text-primary font-semibold px-2 py-0.5 rounded-full truncate max-w-full">
                ${mSlotsText}
              </div>
            </div>
          `;
        });

        mastersRail.innerHTML = railHTML;
      }

      // 7. Services List
      const svcContainer = document.getElementById('salonServicesList');
      if (svcContainer) {
        const salonServices = salon.services || [];
        svcContainer.innerHTML = salonServices.map(svc => `
          <div class="p-3.5 rounded-2xl bg-white border border-slate-200/70 shadow-xs flex items-center justify-between">
            <div class="flex flex-col pr-2 min-w-0">
              <h3 class="text-xs font-bold text-on-surface truncate">${svc.name}</h3>
              <span class="text-[11px] text-slate-400 mt-0.5 truncate">${svc.desc || '~' + (svc.duration || 60) + ' мин'}</span>
              <span class="text-xs font-bold text-primary mt-1">${(svc.price || 0).toLocaleString('ru-RU')} ₽</span>
            </div>
            <button onclick="openDirectBooking({ salon: '${salon.name}', address: '${salon.address}', master: '${firstMaster.name}', service: '${svc.name}', price: ${svc.price}, date: 'Сегодня', time: '${earliestSlot}' })" class="shrink-0 px-3 py-1.5 rounded-xl border border-primary-fixed bg-primary-fixed/40 text-primary text-xs font-semibold active:bg-primary active:text-white transition-all">
              + Окно
            </button>
          </div>
        `).join('');
      }

      // 8. Reviews
      const salonReviews = getSalonReviewsList(salon.id);
      const revCount = salonReviews.length;
      const latestRev = salonReviews[0] || salon.review || { author: 'Клиент', meta: 'Посетил салон недавно', text: '«Замечательный сервис, все стерильно, вернусь снова!»', rating: 5 };
      const revAvatar = document.getElementById('salonReviewAvatar');
      const revAuthor = document.getElementById('salonReviewAuthor');
      const revMeta = document.getElementById('salonReviewMeta');
      const revText = document.getElementById('salonReviewText');
      const revLabel = document.getElementById('salonReviewsLabel');

      if (revLabel) revLabel.innerHTML = `<span>Все (${revCount})</span><span class="material-symbols-outlined text-[14px]">arrow_forward</span>`;
      if (revAuthor) revAuthor.textContent = latestRev.author;
      if (revMeta) revMeta.textContent = latestRev.meta || (latestRev.service ? `Услуга: ${latestRev.service}` : 'Проверенный отзыв');
      if (revText) revText.textContent = latestRev.text;
      if (revAvatar) {
        const initials = latestRev.author.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'КЛ';
        revAvatar.textContent = initials;
      }
    }

    // Open master details page dynamically
    function openMasterDetails(masterId) {
      state.activeMaster = masterId;
      renderMasterDetails(masterId);
      router.navigate('master');
    }

    // Dynamic rendering of Screen 3: Master Profile
    function renderMasterDetails(masterId) {
      const masterInfo = getMasterById(masterId) || {
        id: 'master_beauty_alina',
        name: 'Алина Романова',
        role_title: 'Топ-мастер аппаратного маникюра',
        grade_badge: 'PRO TOP',
        rating: '5.0',
        reviews_count: 156,
        experience: '5 лет',
        retention_rate: '98%',
        bio: 'Создаю эстетику на ваших руках. Стерильный инструмент по СанПиН в крафт-пакетах (вскрываю при вас), премиальные гели Luxio.',
        avatar_url: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDk4gw1UO5MRK6ZgCmtBhgbzfykfvdMi22HxmB42TFZv43Ycfx-fGIgpdWlkDauw_wwkEdituuObvw2bYr3OWyoV7Rqd3KFJr3g1SQM8vQ9ejRqbfexejYKE6z1IcUAVFuonjPm6mZI6Wyfi3KUqpeR2pHxtJfueeBJ_aDmYd4TtueiDxgWXzAv7kB7okWv6LGjfOYzg5WbMcK7hUcST54m7JMjCxVmk0kjDtDoRw',
        slots: ['14:00', '16:30', '18:30'],
        salonId: 'beauty',
        salonName: 'Beauty Studio',
        salonAddress: 'ул. Большая Садовая, 42 • м. Маяковская',
        services: [
          { id: 'ms1', name: 'Аппаратный маникюр + Luxio', desc: 'Снятие, выравнивание, покрытие • 90 мин', price: 2500, duration: 90 },
          { id: 'ms2', name: 'Smart-педикюр полный', desc: 'Обработка стоп, пальцев + гель • 75 мин', price: 2800, duration: 75 },
          { id: 'ms3', name: 'Ремонт / Дизайн френч', desc: 'Укрепление акрилом или пудрой • 20 мин', price: 400, duration: 20 }
        ]
      };

      state.activeMasterSalonId = masterInfo.salonId || state.activeSalon || 'beauty';

      // 1. Master Profile Header
      const avImg = document.getElementById('masterAvatarImg');
      if (avImg) {
        avImg.src = masterInfo.avatar_url;
        avImg.alt = masterInfo.name;
      }
      const gradeEl = document.getElementById('masterGradeBadge');
      if (gradeEl) gradeEl.textContent = masterInfo.grade_badge || 'PRO MASTER';

      const ratEl = document.getElementById('masterRating');
      if (ratEl) ratEl.textContent = masterInfo.rating || '5.0';

      const nameEl = document.getElementById('masterName');
      if (nameEl) nameEl.textContent = masterInfo.name;

      const roleEl = document.getElementById('masterRoleTitle');
      if (roleEl) roleEl.textContent = masterInfo.role_title || 'Специалист';

      const salonLinkText = document.getElementById('masterSalonLinkText');
      if (salonLinkText) salonLinkText.textContent = `${masterInfo.salonName} • ${masterInfo.salonAddress}`;

      const bioEl = document.getElementById('masterBio');
      if (bioEl) bioEl.textContent = masterInfo.bio || 'Индивидуальный подход и премиальное качество услуг.';

      // 2. Stats Grid & Reviews Info
      const { avg, count } = calculateMasterAverageRating(masterInfo.id, masterInfo);
      masterInfo.rating = avg.toFixed(1);
      masterInfo.reviews_count = count;

      const sRat = document.getElementById('masterStatRating');
      if (sRat) sRat.textContent = avg.toFixed(1);

      const sRev = document.getElementById('masterStatReviews');
      if (sRev) sRev.textContent = `${count}`;

      const sExp = document.getElementById('masterStatExp');
      if (sExp) sExp.textContent = masterInfo.experience || '4 года';

      // 3. Time Slots
      const slotsContainer = document.getElementById('masterTimeSlotsContainer');
      const mSlots = masterInfo.slots || ['14:00', '16:30', '18:30'];
      state.selectedTime = mSlots[0] || '14:00';

      if (slotsContainer) {
        slotsContainer.innerHTML = mSlots.map((slot, idx) => `
          <button onclick="selectMasterSlot('${slot}', this)" class="master-slot-btn ${idx === 0 ? 'active bg-primary text-white' : 'bg-primary-fixed text-primary'} px-4 py-2 rounded-full text-xs font-semibold shadow-xs flex items-center gap-1.5 active:scale-95 transition-all">
            ${idx === 0 ? '<span class="material-symbols-outlined text-[14px]">check</span>' : ''}
            ${slot}
          </button>
        `).join('');
      }

      // 4. Master Services
      const mServices = masterInfo.services || [
        { id: 'ms1', name: 'Основная процедура', desc: 'Полный комплекс • 60 мин', price: 2000, duration: 60 }
      ];

      // Set initial selected service
      state.selectedServices = [mServices[0]];

      const servicesContainer = document.getElementById('masterServicesContainer');
      if (servicesContainer) {
        servicesContainer.innerHTML = mServices.map((svc, idx) => {
          const isSelected = (idx === 0);
          return `
            <div onclick="toggleService('${svc.id}', ${svc.price}, '${svc.name}', ${svc.duration || 60}, this)" class="service-item ${isSelected ? 'selected bg-primary-fixed/30 border-2 border-primary' : 'bg-surface-container-low border border-slate-200/50'} p-3.5 rounded-2xl flex items-center justify-between cursor-pointer transition-all">
              <div class="flex items-center gap-3 min-w-0">
                <div class="svc-icon w-6 h-6 rounded-full ${isSelected ? 'bg-primary text-white' : 'bg-surface-container-highest text-slate-500'} flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[15px]">${isSelected ? 'check' : 'add'}</span>
                </div>
                <div class="flex flex-col min-w-0">
                  <span class="text-xs ${isSelected ? 'font-semibold' : 'font-medium'} text-on-surface truncate">${svc.name}</span>
                  <span class="text-[11px] text-slate-400 truncate">${svc.desc || '~' + (svc.duration || 60) + ' мин'}</span>
                </div>
              </div>
              <span class="text-xs font-bold text-primary shrink-0 ml-2">${(svc.price || 0).toLocaleString('ru-RU')} ₽</span>
            </div>
          `;
        }).join('');
      }

      // 5. Master Reviews on Screen
      const masterReviews = getMasterReviewsList(masterInfo.id, masterInfo);
      const revCount = masterReviews.length;
      const latestRev = masterReviews[0] || {
        author: 'Клиент',
        rating: 5,
        service: mServices[0].name,
        userDuration: '1 год на платформе',
        text: '«Невероятная аккуратность и бережное отношение. Маникюр носится уже 4 недели без единого скола!»'
      };

      const mRevLabel = document.getElementById('masterReviewsLabel');
      const mRevAuthor = document.getElementById('masterReviewAuthor');
      const mRevMeta = document.getElementById('masterReviewMeta');
      const mRevText = document.getElementById('masterReviewText');
      const mRevAvatar = document.getElementById('masterReviewAvatar');
      const mRevStars = document.getElementById('masterReviewStars');

      if (mRevLabel) mRevLabel.innerHTML = `<span>Все (${revCount})</span><span class="material-symbols-outlined text-[14px]">arrow_forward</span>`;
      if (mRevAuthor) mRevAuthor.textContent = latestRev.author;
      if (mRevMeta) mRevMeta.textContent = latestRev.userDuration ? `${latestRev.userDuration} • ${latestRev.service || 'Процедура'}` : (latestRev.service || 'Проверенный отзыв');
      if (mRevText) mRevText.textContent = latestRev.text;
      if (mRevStars) mRevStars.textContent = '★'.repeat(latestRev.rating || 5) + '☆'.repeat(5 - (latestRev.rating || 5));
      if (mRevAvatar) {
        const initials = latestRev.author.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase() || 'КЛ';
        mRevAvatar.textContent = initials;
      }

      updateDock();
    }

    // Helper to return from master profile to parent salon
    function openActiveMasterSalon() {
      const sId = state.activeMasterSalonId || state.activeSalon || 'beauty';
      openVenueDetails(sId);
    }
