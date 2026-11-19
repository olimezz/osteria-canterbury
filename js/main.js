/**
 * L'Osteria di Canterbury — Piazza Leonardo, 18, 80129 Napoli (NA)
 * Script Dinamico Mobile-First:
 * 1. Tilt 3D fluido su desktop (dispositivi con mouse)
 * 2. Menu mobile responsive con chiusura su click link o tasto Esc
 * 3. Galleria dinamica filtrabile con contatori aggiornati e Lightbox accessibile
 * 4. Mini Cookie Banner ultra-compatto in basso + pannello "Più informazioni" espandibile a richiesta
 * 5. Toast discreto recensioni verificate con pausa su hover e limite di sessione
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', function () {
    initCurrentYear();
    initDynamicTiltEffect();
    initMobileNav();
    initGalleryAndLightbox();
    initCookieConsentAndMap();
    initVerifiedReviewsToast();
  });

  /* ==========================================================================
     0. ANNO CORRENTE
     ========================================================================== */
  function initCurrentYear() {
    var yearEl = document.getElementById('currentYear');
    if (yearEl) {
      yearEl.textContent = new Date().getFullYear();
    }
  }

  /* ==========================================================================
     1. EFFETTO DINAMICO TILT 3D SULLE CARD (SOLO DESKTOP CON MOUSE)
     ========================================================================== */
  function initDynamicTiltEffect() {
    if (
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      !window.matchMedia('(hover: hover) and (pointer: fine)').matches
    ) {
      return;
    }

    var tiltCards = document.querySelectorAll('.dynamic-tilt-card');
    tiltCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;

        var centerX = rect.width / 2;
        var centerY = rect.height / 2;

        var rotateX = ((y - centerY) / centerY) * -5;
        var rotateY = ((x - centerX) / centerX) * 5;

        card.style.transform =
          'perspective(1000px) rotateX(' +
          rotateX.toFixed(2) +
          'deg) rotateY(' +
          rotateY.toFixed(2) +
          'deg) translateY(-6px)';
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  /* ==========================================================================
     2. MENU MOBILE RESPONSIVE
     ========================================================================== */
  function initMobileNav() {
    var menuToggle = document.getElementById('menuToggle');
    var mainNav = document.getElementById('mainNav');
    if (!menuToggle || !mainNav) return;

    function closeMenu() {
      menuToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
    }

    function toggleMenu() {
      var isExpanded = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isExpanded));
      mainNav.classList.toggle('is-open', !isExpanded);
    }

    menuToggle.addEventListener('click', toggleMenu);

    var navLinks = mainNav.querySelectorAll('a');
    navLinks.forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
        closeMenu();
        menuToggle.focus();
      }
    });
  }

  /* ==========================================================================
     3. GALLERIA DINAMICA CON FILTRI & LIGHTBOX
     ========================================================================== */
  function initGalleryAndLightbox() {
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('.filter-btn'));
    var galleryItems = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var lightbox = document.getElementById('galleryLightbox');
    var lightboxBackdrop = document.getElementById('lightboxBackdrop');
    var lightboxClose = document.getElementById('lightboxClose');
    var lightboxPrev = document.getElementById('lightboxPrev');
    var lightboxNext = document.getElementById('lightboxNext');
    var lightboxImg = document.getElementById('lightboxImg');
    var lightboxCat = document.getElementById('lightboxCat');
    var lightboxCounter = document.getElementById('lightboxCounter');
    var lightboxTitle = document.getElementById('lightboxTitle');
    var lightboxDesc = document.getElementById('lightboxDesc');

    if (!galleryItems.length || !lightbox) return;

    var activeTriggers = [];
    var currentIndex = 0;
    var lastFocusedElement = null;

    function updateFilterCounts() {
      var counts = { tutti: galleryItems.length, locale: 0, piatti: 0, dettagli: 0 };
      galleryItems.forEach(function (item) {
        var cat = item.getAttribute('data-category');
        if (counts[cat] !== undefined) {
          counts[cat] += 1;
        }
      });

      Object.keys(counts).forEach(function (key) {
        var badge = document.querySelector('[data-count-for="' + key + '"]');
        if (badge) badge.textContent = String(counts[key]);
      });
    }

    function refreshActiveTriggers() {
      activeTriggers = galleryItems
        .filter(function (item) {
          return !item.classList.contains('is-hidden');
        })
        .map(function (item) {
          return item.querySelector('.gallery-trigger');
        })
        .filter(Boolean);
    }

    filterButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var selectedFilter = btn.getAttribute('data-filter');

        filterButtons.forEach(function (b) {
          var isCurrent = b === btn;
          b.classList.toggle('active', isCurrent);
          b.setAttribute('aria-selected', String(isCurrent));
        });

        galleryItems.forEach(function (item) {
          var itemCat = item.getAttribute('data-category');
          var shouldShow = selectedFilter === 'tutti' || itemCat === selectedFilter;
          item.classList.toggle('is-hidden', !shouldShow);
        });

        refreshActiveTriggers();
      });
    });

    function renderLightboxSlide(index) {
      if (!activeTriggers.length) return;
      currentIndex = (index + activeTriggers.length) % activeTriggers.length;
      var trigger = activeTriggers[currentIndex];

      var src = trigger.getAttribute('data-full-src') || '';
      var categoryLabel = trigger.getAttribute('data-category-label') || 'Galleria';
      var title = trigger.getAttribute('data-title') || '';
      var caption = trigger.getAttribute('data-caption') || '';

      lightboxImg.setAttribute('src', src);
      lightboxImg.setAttribute('alt', title);
      lightboxCat.textContent = categoryLabel;
      lightboxCounter.textContent = currentIndex + 1 + ' / ' + activeTriggers.length;
      lightboxTitle.textContent = title;
      lightboxDesc.textContent = caption;
    }

    function openLightbox(triggerEl) {
      refreshActiveTriggers();
      var idx = activeTriggers.indexOf(triggerEl);
      if (idx === -1) idx = 0;

      lastFocusedElement = document.activeElement;
      renderLightboxSlide(idx);
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      lightboxClose.focus();
    }

    function closeLightbox() {
      lightbox.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
        lastFocusedElement.focus();
      }
    }

    galleryItems.forEach(function (item) {
      var trigger = item.querySelector('.gallery-trigger');
      if (trigger) {
        trigger.addEventListener('click', function () {
          openLightbox(trigger);
        });
      }
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

    if (lightboxPrev) {
      lightboxPrev.addEventListener('click', function () {
        renderLightboxSlide(currentIndex - 1);
      });
    }

    if (lightboxNext) {
      lightboxNext.addEventListener('click', function () {
        renderLightboxSlide(currentIndex + 1);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (lightbox.getAttribute('aria-hidden') !== 'false') return;

      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        renderLightboxSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        renderLightboxSlide(currentIndex + 1);
      }
    });

    updateFilterCounts();
    refreshActiveTriggers();
  }

  /* ==========================================================================
     4. MINI BANNER COOKIE COMPATTO & INTEGRAZIONE GOOGLE MAPS
     ========================================================================== */
  function initCookieConsentAndMap() {
    var STORAGE_KEY = 'osteria_canterbury_cookie_consent_v2';

    var cookieBanner = document.getElementById('cookieBanner');
    var customizePanel = document.getElementById('cookieCustomizePanel');
    var acceptAllBtn = document.getElementById('cookieAcceptAllBtn');
    var rejectBtn = document.getElementById('cookieRejectBtn');
    var customizeBtn = document.getElementById('cookieCustomizeBtn');
    var closeDetailsBtn = document.getElementById('cookieCloseDetailsBtn');
    var saveCustomBtn = document.getElementById('cookieSaveCustomBtn');
    var openFooterBtn = document.getElementById('openCookieSettingsFooter');
    var enableMapConsentBtn = document.getElementById('enableMapConsentBtn');

    var toggleExternalMedia = document.getElementById('consentExternalMedia');
    var toggleAnalytics = document.getElementById('consentAnalytics');

    var mapContainer = document.getElementById('mapContainer');
    var mapFallback = document.getElementById('mapConsentFallback');

    function getSavedConsent() {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return null;
      }
    }

    function saveConsent(preferences) {
      var payload = {
        essential: true,
        externalMedia: Boolean(preferences.externalMedia),
        analytics: Boolean(preferences.analytics),
        updatedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (err) {
        // Ignora errori storage
      }

      applyConsentPreferences(payload);
      hideCookieBanner();
    }

    function applyConsentPreferences(consent) {
      if (!consent) return;

      if (toggleExternalMedia) toggleExternalMedia.checked = Boolean(consent.externalMedia);
      if (toggleAnalytics) toggleAnalytics.checked = Boolean(consent.analytics);

      if (mapContainer) {
        var existingIframe = mapContainer.querySelector('iframe');

        if (consent.externalMedia) {
          if (mapFallback) mapFallback.hidden = true;
          if (!existingIframe) {
            var iframe = document.createElement('iframe');
            iframe.setAttribute('src', mapContainer.getAttribute('data-map-src') || '');
            iframe.setAttribute(
              'title',
              "Mappa Google Maps - L'Osteria di Canterbury, Piazza Leonardo, 18, 80129 Napoli"
            );
            iframe.setAttribute('loading', 'lazy');
            iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
            iframe.setAttribute('allowfullscreen', '');
            mapContainer.appendChild(iframe);
          }
        } else {
          if (existingIframe) {
            existingIframe.remove();
          }
          if (mapFallback) mapFallback.hidden = false;
        }
      }
    }

    function showCookieBanner(openCustomizeDirectly) {
      if (!cookieBanner) return;
      cookieBanner.hidden = false;
      document.body.classList.add('cookie-bar-active');

      if (openCustomizeDirectly && customizePanel && customizeBtn) {
        customizePanel.hidden = false;
        customizeBtn.setAttribute('aria-expanded', 'true');
      }
    }

    function hideCookieBanner() {
      if (!cookieBanner) return;
      cookieBanner.hidden = true;
      document.body.classList.remove('cookie-bar-active');
      if (customizePanel && customizeBtn) {
        customizePanel.hidden = true;
        customizeBtn.setAttribute('aria-expanded', 'false');
      }
    }

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener('click', function () {
        saveConsent({ externalMedia: true, analytics: true });
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        saveConsent({ externalMedia: false, analytics: false });
      });
    }

    if (customizeBtn && customizePanel) {
      customizeBtn.addEventListener('click', function () {
        var isHidden = customizePanel.hidden;
        customizePanel.hidden = !isHidden;
        customizeBtn.setAttribute('aria-expanded', String(isHidden));
      });
    }

    if (closeDetailsBtn && customizePanel && customizeBtn) {
      closeDetailsBtn.addEventListener('click', function () {
        customizePanel.hidden = true;
        customizeBtn.setAttribute('aria-expanded', 'false');
      });
    }

    if (saveCustomBtn) {
      saveCustomBtn.addEventListener('click', function () {
        saveConsent({
          externalMedia: toggleExternalMedia ? toggleExternalMedia.checked : false,
          analytics: toggleAnalytics ? toggleAnalytics.checked : false
        });
      });
    }

    if (openFooterBtn) {
      openFooterBtn.addEventListener('click', function () {
        var current = getSavedConsent();
        if (current) {
          if (toggleExternalMedia) toggleExternalMedia.checked = Boolean(current.externalMedia);
          if (toggleAnalytics) toggleAnalytics.checked = Boolean(current.analytics);
        }
        showCookieBanner(true);
      });
    }

    if (enableMapConsentBtn) {
      enableMapConsentBtn.addEventListener('click', function () {
        var current = getSavedConsent() || { analytics: false };
        saveConsent({
          externalMedia: true,
          analytics: Boolean(current.analytics)
        });
      });
    }

    var existingConsent = getSavedConsent();
    if (existingConsent) {
      applyConsentPreferences(existingConsent);
    } else {
      showCookieBanner(false);
    }
  }

  /* ==========================================================================
     5. NOTIFICA ROTANTE RECENSIONI VERIFICATE
     ========================================================================== */
  function initVerifiedReviewsToast() {
    var toast = document.getElementById('reviewToast');
    var closeBtn = document.getElementById('reviewToastClose');
    var quoteEl = document.getElementById('reviewToastQuote');
    var metaEl = document.getElementById('reviewToastMeta');
    var linkEl = document.getElementById('reviewToastLink');
    var cookieBanner = document.getElementById('cookieBanner');

    if (!toast || !quoteEl || !metaEl) return;

    var verifiedExcerpts = [
      {
        quote:
          '“La Genovese napoletana con cipolle cotte piano e la parmigiana di melanzane sono esattamente come a casa di nonna.”',
        meta: 'Valutazione 4,6/5 su 213 recensioni verificate'
      },
      {
        quote:
          '“Atmosfera raccolta e conduzione familiare genuina: conto onesto nella fascia 20–30 € per una cena splendida a Napoli.”',
        meta: 'Sintesi verificata • Scheda locale Piazza Leonardo'
      },
      {
        quote:
          '“Locale intimo e curato con posti limitati e piatti del giorno freschi: consigliamo vivamente la prenotazione via WhatsApp.”',
        meta: 'Nota pratica verificata • Scheda Google'
      }
    ];

    var SESSION_COUNT_KEY = 'osteria_canterbury_toast_count_v2';
    var SESSION_DISMISSED_KEY = 'osteria_canterbury_toast_dismissed_v2';
    var MAX_SHOWS_PER_SESSION = 3;
    var INITIAL_DELAY_MS = 10000;
    var DISPLAY_DURATION_MS = 7500;
    var INTERVAL_BETWEEN_MS = 18000;

    var isHovered = false;
    var activeTimer = null;
    var hideTimer = null;
    var itemIndex = 0;

    function getShownCount() {
      try {
        return parseInt(sessionStorage.getItem(SESSION_COUNT_KEY) || '0', 10);
      } catch (e) {
        return 0;
      }
    }

    function incrementShownCount() {
      try {
        var next = getShownCount() + 1;
        sessionStorage.setItem(SESSION_COUNT_KEY, String(next));
        return next;
      } catch (e) {
        return MAX_SHOWS_PER_SESSION;
      }
    }

    function isDismissedByUser() {
      try {
        return sessionStorage.getItem(SESSION_DISMISSED_KEY) === 'true';
      } catch (e) {
        return false;
      }
    }

    function markDismissedByUser() {
      try {
        sessionStorage.setItem(SESSION_DISMISSED_KEY, 'true');
      } catch (e) {
        // Ignora
      }
    }

    function hideToast(scheduleNext) {
      toast.classList.remove('is-visible');
      setTimeout(function () {
        if (!toast.classList.contains('is-visible')) {
          toast.hidden = true;
        }
      }, 400);

      if (scheduleNext && !isDismissedByUser() && getShownCount() < MAX_SHOWS_PER_SESSION) {
        clearTimeout(activeTimer);
        activeTimer = setTimeout(showNextToast, INTERVAL_BETWEEN_MS);
      }
    }

    function scheduleAutoHide() {
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function () {
        if (!isHovered) {
          hideToast(true);
        }
      }, DISPLAY_DURATION_MS);
    }

    function showNextToast() {
      if (isDismissedByUser() || getShownCount() >= MAX_SHOWS_PER_SESSION) {
        return;
      }

      if (cookieBanner && !cookieBanner.hidden) {
        activeTimer = setTimeout(showNextToast, 6000);
        return;
      }

      var data = verifiedExcerpts[itemIndex % verifiedExcerpts.length];
      itemIndex += 1;

      quoteEl.textContent = data.quote;
      metaEl.textContent = data.meta;

      toast.hidden = false;
      void toast.offsetWidth;
      toast.classList.add('is-visible');

      incrementShownCount();
      scheduleAutoHide();
    }

    toast.addEventListener('mouseenter', function () {
      isHovered = true;
      clearTimeout(hideTimer);
    });

    toast.addEventListener('mouseleave', function () {
      isHovered = false;
      scheduleAutoHide();
    });

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        markDismissedByUser();
        clearTimeout(activeTimer);
        clearTimeout(hideTimer);
        hideToast(false);
      });
    }

    if (linkEl) {
      linkEl.addEventListener('click', function () {
        hideToast(false);
      });
    }

    if (!isDismissedByUser() && getShownCount() < MAX_SHOWS_PER_SESSION) {
      activeTimer = setTimeout(showNextToast, INITIAL_DELAY_MS);
    }
  }
})();
