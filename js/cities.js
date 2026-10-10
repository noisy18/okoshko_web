// ==========================================
    // CITY & REGION SELECTION MANAGEMENT
    // ==========================================
    const CITY_CONFIG = {
      all: { name: 'Все регионы России', short: 'Все', icon: '🗺️', sub: 'Вся география сервиса' },
      moscow: { name: 'Москва', short: 'Москва', icon: '🏙️', sub: 'Москва и Московская область' },
      spb: { name: 'Санкт-Петербург', short: 'СПб', icon: '🏛️', sub: 'Санкт-Петербург и ЛО' },
      kazan: { name: 'Казань', short: 'Казань', icon: '🕌', sub: 'Республика Татарстан' },
      samara: { name: 'Самара', short: 'Самара', icon: '⛵', sub: 'Самарская область' },
      rostov: { name: 'Ростов-на-Дону', short: 'Ростов', icon: '🌾', sub: 'Ростовская область' },
      krasnodar: { name: 'Краснодар', short: 'Краснодар', icon: '☀️', sub: 'Краснодарский край' },
      voronezh: { name: 'Воронеж', short: 'Воронеж', icon: '🌳', sub: 'Воронежская область' },
      volgograd: { name: 'Волгоград', short: 'Волгоград', icon: '⚓', sub: 'Волгоградская область' },
      sochi: { name: 'Сочи', short: 'Сочи', icon: '🌴', sub: 'Курортный район и Сириус' },
      stavropol: { name: 'Ставрополь', short: 'Ставрополь', icon: '⛰️', sub: 'Ставропольский край' },
      anapa: { name: 'Анапа', short: 'Анапа', icon: '🏖️', sub: 'Черноморское побережье' },
      tuapse: { name: 'Туапсе', short: 'Туапсе', icon: '🚢', sub: 'Туапсинский район' },
      novorossiysk: { name: 'Новороссийск', short: 'Новороссийск', icon: '🌊', sub: 'Цемесская бухта' }
    };

    let citySearchQuery = '';

    function openCityModal() {
      const modal = document.getElementById('citySelectModal');
      if (!modal) return;
      citySearchQuery = '';
      const input = document.getElementById('citySearchInput');
      if (input) input.value = '';
      const clearBtn = document.getElementById('citySearchClearBtn');
      if (clearBtn) clearBtn.classList.add('hidden');

      modal.classList.remove('hidden');
      modal.classList.add('flex');
      renderCityOptions();
      setTimeout(() => input?.focus(), 100);
    }

    function closeCityModal() {
      const modal = document.getElementById('citySelectModal');
      if (!modal) return;
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }

    // Close city modal when clicking backdrop
    window.addEventListener('click', (e) => {
      const modal = document.getElementById('citySelectModal');
      if (modal && e.target === modal) {
        closeCityModal();
      }
    });

    // Handle city search input with smart prefix/match highlight
    function handleCitySearchInput(val) {
      citySearchQuery = (val || '').trim().toLowerCase();
      const clearBtn = document.getElementById('citySearchClearBtn');
      if (clearBtn) {
        clearBtn.classList.toggle('hidden', !citySearchQuery);
      }
      renderCityOptions();
    }

    function clearCitySearch() {
      const input = document.getElementById('citySearchInput');
      if (input) {
        input.value = '';
        input.focus();
      }
      citySearchQuery = '';
      const clearBtn = document.getElementById('citySearchClearBtn');
      if (clearBtn) clearBtn.classList.add('hidden');
      renderCityOptions();
    }

    // Render city list with prefix matching
    function renderCityOptions() {
      const container = document.getElementById('cityOptionsList');
      if (!container) return;

      const entries = Object.entries(CITY_CONFIG);

      // Filter: prioritize matches at the beginning of the city name, then anywhere in name/sub
      const filtered = entries.filter(([key, info]) => {
        if (!citySearchQuery) return true;
        const nameLower = info.name.toLowerCase();
        const shortLower = info.short.toLowerCase();
        const subLower = (info.sub || '').toLowerCase();
        return nameLower.startsWith(citySearchQuery) ||
          shortLower.startsWith(citySearchQuery) ||
          nameLower.includes(citySearchQuery) ||
          subLower.includes(citySearchQuery);
      });

      // Sort so exact prefix matches come first
      if (citySearchQuery) {
        filtered.sort((a, b) => {
          const aStarts = a[1].name.toLowerCase().startsWith(citySearchQuery);
          const bStarts = b[1].name.toLowerCase().startsWith(citySearchQuery);
          if (aStarts && !bStarts) return -1;
          if (!aStarts && bStarts) return 1;
          return 0;
        });
      }

      if (filtered.length === 0) {
        container.innerHTML = `
          <div class="py-8 flex flex-col items-center justify-center text-center text-slate-400">
            <span class="material-symbols-outlined text-3xl mb-1 text-slate-300">location_off</span>
            <p class="text-xs font-semibold">Город не найден</p>
            <p class="text-[10px] mt-0.5">Попробуйте ввести другое название или выберите «Все регионы»</p>
          </div>
        `;
        return;
      }

      container.innerHTML = filtered.map(([key, info]) => {
        const isSelected = (key === currentFilterRegion);
        const activeClasses = isSelected
          ? 'bg-primary-fixed/30 border-primary ring-1 ring-primary/40'
          : 'border-slate-200/80 hover:border-primary/40 bg-white';

        // Highlight matching prefix letters
        let displayName = info.name;
        if (citySearchQuery && info.name.toLowerCase().includes(citySearchQuery)) {
          const idx = info.name.toLowerCase().indexOf(citySearchQuery);
          const before = info.name.slice(0, idx);
          const match = info.name.slice(idx, idx + citySearchQuery.length);
          const after = info.name.slice(idx + citySearchQuery.length);
          displayName = `${before}<span class="text-primary font-extrabold underline decoration-primary/40">${match}</span>${after}`;
        }

        return `
          <div onclick="selectCityOption('${key}')" data-city="${key}" class="city-option-item p-3 rounded-2xl border ${activeClasses} flex items-center justify-between cursor-pointer active:scale-[0.99] transition-all">
            <div class="flex items-center gap-3 min-w-0">
              <span class="text-xl shrink-0">${info.icon}</span>
              <div class="flex flex-col min-w-0">
                <span class="font-bold text-xs text-on-surface truncate">${displayName}</span>
                <span class="text-[10px] text-slate-400 truncate">${info.sub}</span>
              </div>
            </div>
            <span class="city-check-icon material-symbols-outlined text-primary text-[20px] ${isSelected ? '' : 'hidden'} shrink-0 ml-2">check_circle</span>
          </div>
        `;
      }).join('');
    }

    function updateCityModalUI() {
      renderCityOptions();
    }

    function updateHeaderAndProfileCityUI() {
      const info = CITY_CONFIG[currentFilterRegion] || CITY_CONFIG['all'];

      // Update Header Pill
      const hName = document.getElementById('headerCityName');
      const hIcon = document.getElementById('headerCityIcon');
      if (hName) hName.textContent = info.short;
      if (hIcon) hIcon.textContent = info.icon;

      // Update Fullscreen Map Pill
      const mName = document.getElementById('mapFullscreenCityName');
      const mIcon = document.getElementById('mapFullscreenCityIcon');
      if (mName) mName.textContent = info.short;
      if (mIcon) mIcon.textContent = info.icon;

      // Update Profile settings row
      const pBadge = document.getElementById('profileCityBadge');
      const pSub = document.getElementById('profileCitySub');
      if (pBadge) pBadge.textContent = info.name;
      if (pSub) pSub.textContent = info.name;

      // Update Welcome screen select if present
      const vSelect = document.getElementById('verifyCitySelect');
      if (vSelect) vSelect.value = currentFilterRegion;
    }

    // Called when user selects a city from the bottom sheet modal
    function selectCityOption(cityId) {
      if (!CITY_CONFIG[cityId]) cityId = 'all';
      currentFilterRegion = cityId;

      const saveDefault = document.getElementById('saveAsDefaultCityCheck');
      if (saveDefault && saveDefault.checked) {
        try {
          localStorage.setItem('okoshko_default_city', cityId);
        } catch (e) { }
      }

      updateHeaderAndProfileCityUI();
      closeCityModal();

      applyCombinedFilters();

      // Pan & Zoom map to selected region
      if (yandexMapInstance && REGION_CENTERS[cityId]) {
        const rc = REGION_CENTERS[cityId];
        yandexMapInstance.setCenter(rc.center, rc.zoom, {
          flying: true,
          duration: 700
        });
      }

      showToast(`Выбран город: ${CITY_CONFIG[cityId].name} 📍`);
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
      } catch (e) { }
    }

    // Called from initial verify welcome screen select
    function setDefaultCity(cityId) {
      if (!CITY_CONFIG[cityId]) cityId = 'all';
      currentFilterRegion = cityId;
      try {
        localStorage.setItem('okoshko_default_city', cityId);
      } catch (e) { }
      updateHeaderAndProfileCityUI();
    }

    // Backward compatibility helper
    function filterRegion(regionId) {
      selectCityOption(regionId);
    }

    // Category filter in map
    function filterCategory(cat, el) {
      document.querySelectorAll('.cat-pill').forEach(p => {
        p.classList.remove('bg-primary', 'text-white', 'shadow-xs');
        p.classList.add('bg-white/90', 'text-on-surface');
      });
      if (el) {
        el.classList.add('bg-primary', 'text-white', 'shadow-xs');
        el.classList.remove('bg-white/90', 'text-on-surface');
      }

      currentFilterCategory = cat;

      // Reset text search when switching category
      const searchInput = document.getElementById('searchInput');
      if (searchInput) searchInput.value = '';
      const clearBtn = document.getElementById('searchClearBtn');
      if (clearBtn) clearBtn.classList.add('hidden');
      currentSearchQuery = '';

      applyCombinedFilters();

      if (visibleVenues.length > 0) {
        showToast(`Категория: ${el ? el.innerText.trim() : cat}`);
      } else {
        showToast('В этой категории пока нет мастеров');
      }
    }

    // Live Search for Enterprises / Salons / Masters
    function handleSearch(val) {
      currentSearchQuery = (val || '').trim().toLowerCase();
      const clearBtn = document.getElementById('searchClearBtn');
      if (clearBtn) {
        clearBtn.classList.toggle('hidden', !currentSearchQuery);
      }

      applyCombinedFilters();
    }

    // Sorting Option State: 'default' | 'rating' | 'reviews' | 'price_asc' | 'price_desc'
    let currentSortOption = 'default';

    // Helper: calculate effective average rating for a venue (from calculated reviews or fallback)
    function getVenueEffectiveRating(venue) {
      if (typeof calculateSalonAverageRating === 'function') {
        const stats = calculateSalonAverageRating(venue.id);
        if (stats && !isNaN(stats.avg)) return stats.avg;
      }
      return parseFloat(venue.rating) || 0;
    }

    // Helper: calculate total review count for a venue
    function getVenueEffectiveReviewsCount(venue) {
      if (typeof calculateSalonAverageRating === 'function') {
        const stats = calculateSalonAverageRating(venue.id);
        if (stats && !isNaN(stats.count) && stats.count > 0) return stats.count;
      }
      return parseInt(venue.reviewsCount, 10) || 0;
    }

    // Helper: extract numeric base price from venue
    function getVenueBasePrice(venue) {
      if (venue.services && venue.services.length > 0) {
        const prices = venue.services.map(s => s.price).filter(p => typeof p === 'number' && p > 0);
        if (prices.length > 0) return Math.min(...prices);
      }
      if (venue.priceFrom) {
        const cleaned = venue.priceFrom.replace(/\s+/g, '').replace(/[^\d]/g, '');
        const parsed = parseInt(cleaned, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 2000;
    }

    // Central combined filtering and sorting handler
    function applyCombinedFilters() {
      // 1. Filter by Region, Category and Search Query
      visibleVenues = venues.filter(v => {
        const matchRegion = (currentFilterRegion === 'all' || v.region === currentFilterRegion);
        const matchCategory = (currentFilterCategory === 'all' || v.categoryTags.includes(currentFilterCategory));
        let matchSearch = true;
        if (currentSearchQuery) {
          const fullText = (v.name + ' ' + v.type + ' ' + v.categoryText + ' ' + v.address + ' ' + (v.regionName || '') + ' ' + v.services.join(' ')).toLowerCase();
          matchSearch = fullText.includes(currentSearchQuery);
        }
        return matchRegion && matchCategory && matchSearch;
      });

      // 2. Sort visible venues according to selected criteria (на понижение / по возрастанию цены)
      if (currentSortOption === 'rating') {
        // С лучшей оценкой (средняя оценка на понижение)
        visibleVenues.sort((a, b) => getVenueEffectiveRating(b) - getVenueEffectiveRating(a));
      } else if (currentSortOption === 'reviews') {
        // По количеству отзывов (на понижение)
        visibleVenues.sort((a, b) => getVenueEffectiveReviewsCount(b) - getVenueEffectiveReviewsCount(a));
      } else if (currentSortOption === 'price_asc') {
        // Сначала недорогие (по возрастанию цены)
        visibleVenues.sort((a, b) => getVenueEffectiveBasePrice(a) - getVenueEffectiveBasePrice(b));
      } else if (currentSortOption === 'price_desc') {
        // Сначала дорогие (по убыванию цены)
        visibleVenues.sort((a, b) => getVenueEffectiveBasePrice(b) - getVenueEffectiveBasePrice(a));
      }

      // Update placemarks inside clusterer
      if (yandexMapInstance && typeof rebuildMapPlacemarks === 'function') {
        rebuildMapPlacemarks();
      }

      renderVenuesCarousel();

      if (visibleVenues.length > 0) {
        const isCurrentActive = visibleVenues.some(v => v.id === state.activeSalon);
        const targetId = isCurrentActive ? state.activeSalon : visibleVenues[0].id;
        selectMapPin(targetId, true);
      }
    }

    function getVenueEffectiveBasePrice(venue) {
      return getVenueBasePrice(venue);
    }

    // Toggle Search Filter / Sort Dropdown
    function toggleSearchFilterDropdown(e) {
      if (e) e.stopPropagation();
      const menu = document.getElementById('searchFilterDropdown');
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
        closeSearchFilterDropdown();
      }
    }

    function closeSearchFilterDropdown() {
      const menu = document.getElementById('searchFilterDropdown');
      if (menu) {
        menu.classList.add('hidden');
        menu.classList.remove('flex');
      }
    }

    // Select sort option
    function selectSortOption(sortKey, e) {
      if (e) e.stopPropagation();
      currentSortOption = sortKey;
      updateSortDropdownUI();
      closeSearchFilterDropdown();
      applyCombinedFilters();

      const labels = {
        rating: 'С лучшей оценкой ⭐',
        reviews: 'По количеству отзывов 💬',
        price_asc: 'Сначала недорогие 📉',
        price_desc: 'Сначала дорогие 📈'
      };
      showToast(`Сортировка: ${labels[sortKey] || 'Выбрана'}`);
      try {
        if (window.Telegram?.WebApp?.HapticFeedback) {
          window.Telegram.WebApp.HapticFeedback.selectionChanged();
        }
      } catch (err) { }
    }

    // Reset sort option
    function resetSortOption(e) {
      if (e) e.stopPropagation();
      currentSortOption = 'default';
      updateSortDropdownUI();
      closeSearchFilterDropdown();
      applyCombinedFilters();
      showToast('Сортировка сброшена');
    }

    function updateSortDropdownUI() {
      const activeDot = document.getElementById('searchFilterActiveDot');
      if (activeDot) {
        activeDot.classList.toggle('hidden', currentSortOption === 'default');
      }

      document.querySelectorAll('.sort-option-btn').forEach(btn => {
        const sortType = btn.getAttribute('data-sort');
        const isSelected = (sortType === currentSortOption);
        const check = btn.querySelector('.sort-check');
        if (check) {
          check.classList.toggle('hidden', !isSelected);
        }
        if (isSelected) {
          btn.classList.add('bg-primary-fixed/40', 'text-primary');
        } else {
          btn.classList.remove('bg-primary-fixed/40', 'text-primary');
        }
      });
    }

    // Close sort dropdown when tapping outside
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('searchFilterDropdown');
      const btn = document.getElementById('searchFilterBtn');
      if (menu && !menu.classList.contains('hidden')) {
        if (!menu.contains(e.target) && !btn?.contains(e.target)) {
          closeSearchFilterDropdown();
        }
      }
    });

    // Clear Search Input
    function clearSearch() {
      const input = document.getElementById('searchInput');
      if (input) input.value = '';
      const clearBtn = document.getElementById('searchClearBtn');
      if (clearBtn) clearBtn.classList.add('hidden');
      currentSearchQuery = '';
      applyCombinedFilters();
      showToast('Поиск сброшен');
    }

    function toggleFiltersModal(e) {
      toggleSearchFilterDropdown(e);
    }

    function showClusterAlert() {
      showToast('В этом районе еще 4 проверенных мастера');
    }
