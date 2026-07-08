/**
 * ============================================
 * Campaign Widgets - Standalone JS
 * 
 * Usage: 
 *   1. Include campaign-widgets.css in <head>
 *   2. Include this script at end of <body>
 *   3. It auto-fetches config & renders widgets
 * 
 * Config URL can be overridden:
 *   window.CW_CONFIG_URL = 'https://your-url.com/config.json';
 *
 * Local development (auto on localhost):
 *   ./campaign-widgets/campaign-config.dev.json
 * ============================================
 */

(function () {
  'use strict';

  // ---- Configuration ----
  const CONFIG_URL = window.CW_CONFIG_URL || 'https://cdn.aairavx.com/campaign-config.json';
  const MARQUEE_SPEED = 60; // pixels per second
  const ANNOUNCEMENT_SLOT_SELECTOR = window.CW_ANNOUNCEMENT_SLOT_SELECTOR || '.cw-announcement-slot';
  const ENABLE_PROMO_CARD = window.CW_ENABLE_PROMO_CARD !== false;

  // SessionStorage key for caching the config (persists until tab/browser closes)
  const CACHE_KEY = 'cw_config_cache';

  // ---- Utility Functions ----

  /**
   * Check if a campaign is within its scheduled date range
   */
  function isWithinDateRange(startDate, endDate) {
    if (!startDate && !endDate) return true;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      if (today < start) return false;
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      if (today > end) return false;
    }
    return true;
  }

  /**
   * Check if a campaign should be shown (active flag + date range)
   */
  function shouldShow(config) {
    if (!config || !config.active) return false;
    return isWithinDateRange(config.startDate, config.endDate);
  }

  /**
   * Create an HTML element with attributes and children
   */
  function createElement(tag, attrs, children) {
    const el = document.createElement(tag);
    var hasInnerHTML = false;

    if (attrs) {
      Object.keys(attrs).forEach(function (key) {
        if (key === 'className') {
          el.className = attrs[key];
        } else if (key === 'style' && typeof attrs[key] === 'object') {
          Object.assign(el.style, attrs[key]);
        } else if (key.startsWith('on') && typeof attrs[key] === 'function') {
          el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
        } else if (key === 'innerHTML') {
          el.innerHTML = attrs[key];
          hasInnerHTML = true;
        } else {
          el.setAttribute(key, attrs[key]);
        }
      });
    }

    // Only set children if innerHTML was not already set (innerHTML takes priority)
    if (children && !hasInnerHTML) {
      if (typeof children === 'string') {
        el.textContent = children;
      } else if (Array.isArray(children)) {
        children.forEach(function (child) {
          if (child) el.appendChild(child);
        });
      } else if (children instanceof Node) {
        el.appendChild(children);
      }
    }

    return el;
  }

  // ---- Helper function for HTML sanitization ----
  
  function sanitizeHTML(html) {
    // Create a temporary element to parse HTML
    var temp = document.createElement('div');
    temp.innerHTML = html;
    
    // Allow only safe tags and attributes
    var allowedTags = ['span', 'strong', 'em', 'b', 'i', 'u', 'br'];
    var allowedAttributes = ['style', 'class'];
    // Keep the inline typography the admin editor actually supports. NOTE:
    // `letter-spacing` is intentionally NOT here — the tool has no letter-spacing
    // control, so it's not a real styling concept; the tool's preview now strips
    // it too, so both render plain and stay WYSIWYG.
    var allowedStyles = ['font-size', 'color', 'font-weight', 'font-style', 'text-decoration', 'text-align', 'line-height', 'text-transform', 'vertical-align'];
    
    function sanitizeNode(node) {
      if (node.nodeType === 3) return node; // Text node - safe
      
      if (node.nodeType === 1) { // Element node
        var tagName = node.tagName.toLowerCase();
        
        // Remove disallowed tags
        if (allowedTags.indexOf(tagName) === -1) {
          var textNode = document.createTextNode(node.textContent);
          node.parentNode.replaceChild(textNode, node);
          return textNode;
        }
        
        // Sanitize attributes
        var attrs = Array.from(node.attributes);
        attrs.forEach(function(attr) {
          if (allowedAttributes.indexOf(attr.name) === -1) {
            node.removeAttribute(attr.name);
          } else if (attr.name === 'style') {
            // Sanitize inline styles and preserve them
            var styles = attr.value.split(';').filter(function(style) {
              if (!style.trim()) return false;
              var prop = style.split(':')[0].trim();
              return allowedStyles.indexOf(prop) !== -1;
            }).join(';');
            // Ensure styles end with semicolon for proper parsing
            if (styles && !styles.endsWith(';')) styles += ';';
            node.setAttribute('style', styles);
          }
        });
        
        // Recursively sanitize children
        Array.from(node.childNodes).forEach(sanitizeNode);
      }
      
      return node;
    }
    
    Array.from(temp.childNodes).forEach(sanitizeNode);
    return temp.innerHTML;
  }

  // ---- Helper function for background styles ----
  
  function getBackgroundStyle(background) {
    if (!background) return '#dc2626';
    
    if (background.type === 'radial') {
      return 'radial-gradient(circle, ' + background.startColor + ', ' + background.endColor + ')';
    } else if (background.type === 'linear') {
      var direction = background.direction || '90deg';
      var midpoint = background.midpoint || 50;
      return 'linear-gradient(' + direction + ', ' + background.startColor + ' ' + midpoint + '%, ' + background.endColor + ')';
    } else if (background.type === 'solid') {
      return background.startColor;
    }
    return background.startColor || '#dc2626';
  }

  // ---- Announcement Bar (Marquee Ticker) ----

  function mountAnnouncementBar(bar, _config) {
    var target = null;
    
    // Dedicated placeholder section/div (e.g. <section class="cw-announcement-slot"></section>)
    if (typeof ANNOUNCEMENT_SLOT_SELECTOR === 'string' && ANNOUNCEMENT_SLOT_SELECTOR.trim()) {
      target = document.querySelector(ANNOUNCEMENT_SLOT_SELECTOR.trim());
      if (target) {
        target.innerHTML = '';
        target.appendChild(bar);
        return target;
      }
    }
    return null;
  }

  function renderAnnouncementBar(config) {
    if (!shouldShow(config)) return;
    if (document.getElementById('cw-announcement-bar')) return;

    var announcements = config.announcements;
    if (!announcements || announcements.length === 0) return;

    // Filter announcements by their individual schedule
    var visibleAnnouncements = announcements.filter(function(ann) {
      if (typeof ann === 'string') return true;
      return isWithinDateRange(ann.startDate, ann.endDate);
    });
    if (visibleAnnouncements.length === 0) return;

    var isLoopOn = config.loop !== false;
    var style = config.style || {};

    // Build the bar
    var bar = createElement('div', {
      className: 'cw-announcement-bar',
      id: 'cw-announcement-bar',
      style: {
        background: getBackgroundStyle(style.background) || '#dc2626',
        color: style.textColor || '#ffffff',
      },
    });

    // Track (continuous scrolling container)
    var track = createElement('div', {
      className: 'cw-announcement-bar__track',
    });

    // Build one set of announcement items
    function buildAnnouncementSet() {
      var fragment = document.createDocumentFragment();
      visibleAnnouncements.forEach(function (announcement) {
        // Handle both old string format and new object format
        var text = typeof announcement === 'string' ? announcement : announcement.text;
        var url = typeof announcement === 'object' && announcement.url ? announcement.url : null;
        var openInNewTab = typeof announcement === 'object' && announcement.openInNewTab ? true : false;
        // Auto-detect rich text if it contains HTML tags, or use explicit richText flag
        var isRichText = typeof announcement === 'object' && 
                        (announcement.richText === true || /<[^>]+>/.test(text));

        var tag = url ? 'a' : 'span';
        var attrs = { className: 'cw-announcement-bar__item' };

        if (url) {
          attrs.className += ' cw-announcement-link';
          attrs.href = url;
          attrs.target = openInNewTab ? '_blank' : '_self';
          if (openInNewTab) attrs.rel = 'noopener noreferrer';
          attrs.style = { textDecoration: 'underline', color: 'inherit' };
        }

        // Rich text: sanitize and render HTML via innerHTML; plain text: safe textContent via children
        if (isRichText) {
          attrs.innerHTML = sanitizeHTML(text);
          fragment.appendChild(createElement(tag, attrs));
        } else {
          fragment.appendChild(createElement(tag, attrs, text));
        }
      });
      return fragment;
    }

    // Build sets and add to track
    function buildWrappedSet(minWidth) {
      var wrapper = createElement('span', {
        className: 'cw-announcement-bar__set',
        style: minWidth ? { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: minWidth } : { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
      });
      var fragment = buildAnnouncementSet();
      wrapper.appendChild(fragment);
      return wrapper;
    }

    bar.appendChild(track);

    // Insert into page only if slot exists
    var slotElement = mountAnnouncementBar(bar, config);
    if (!slotElement) {
      console.warn('[Campaign Widgets] Announcement slot not found. Add ' + ANNOUNCEMENT_SLOT_SELECTOR + ' to your page.');
      return;
    }

    // Bar height is fixed at 40px via CSS — use constant instead of measuring
    var BAR_HEIGHT = 40;

    requestAnimationFrame(function () {
      var containerWidth = bar.clientWidth;

      if (isLoopOn) {
        // Loop ON: add enough copies to fill container, then double for seamless scroll
        // First add 2 sets to measure
        track.appendChild(buildWrappedSet(null));
        track.appendChild(buildWrappedSet(null));
        var halfWidth = track.scrollWidth / 2;

        if (halfWidth > 0 && containerWidth > 0) {
          var needed = Math.max(1, Math.ceil(containerWidth / halfWidth));
          if (needed > 1) {
            track.innerHTML = '';
            for (var i = 0; i < needed * 2; i++) {
              track.appendChild(buildWrappedSet(null));
            }
            halfWidth = track.scrollWidth / 2;
          }
        }

        var duration = Math.max(5, halfWidth / MARQUEE_SPEED);
        bar.style.setProperty('--cw-marquee-duration', duration + 's');
      } else {
        // Loop OFF: 2 sets, each fills the full bar width
        track.appendChild(buildWrappedSet(containerWidth + 'px'));
        track.appendChild(buildWrappedSet(containerWidth + 'px'));
        var halfWidth = track.scrollWidth / 2;
        var duration = Math.max(5, halfWidth / MARQUEE_SPEED);
        bar.style.setProperty('--cw-marquee-duration', duration + 's');
      }

      document.body.style.setProperty('--cw-bar-height', BAR_HEIGHT + 'px');
      document.body.classList.add('cw-has-announcement-bar');
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var slotTop = slotElement.getBoundingClientRect().top + scrollTop;
      var TOP_ZONE_THRESHOLD = 140;
      if (slotTop <= TOP_ZONE_THRESHOLD) {
        document.body.classList.add('cw-should-offset-fixed');

        // Collapse reserved top space as the bar scrolls away.
        var scrollTimeout = null;
        var lastScrollY = -1;

        function updateTopBarSpace() {
          var y = window.pageYOffset || document.documentElement.scrollTop;
          if (y === lastScrollY) return;
          var visibleBarHeight = Math.max(0, BAR_HEIGHT - y);
          document.body.style.setProperty('--cw-bar-height', visibleBarHeight + 'px');
          lastScrollY = y;
        }

        updateTopBarSpace();
        window.addEventListener('scroll', function () {
          if (scrollTimeout) return;
          scrollTimeout = setTimeout(function () {
            updateTopBarSpace();
            scrollTimeout = null;
          }, 16);
        }, { passive: true });
      } else {
        document.body.style.setProperty('--cw-bar-height', BAR_HEIGHT + 'px');
        document.body.classList.remove('cw-should-offset-fixed');
      }
    });
  }

  // ---- Promo Card ----

  // The admin editor stores inline font sizes as `rem` (e.g. 0.75rem, 1.6rem).
  // `rem` resolves against the SITE's root font-size, which may not be the 16px
  // the tool measured/rendered with — so the same content can render at different
  // sizes on the site. Convert rem→px at 16px base so the widget matches the tool
  // regardless of the host page's root font-size.
  function normalizeRemToPx(html) {
    if (!html) return html;
    return String(html).replace(/font-size\s*:\s*([\d.]+)\s*rem/gi, function (_m, n) {
      return 'font-size:' + (parseFloat(n) * 16) + 'px';
    });
  }

  function renderPromoCard(config) {
    if (!shouldShow(config)) return;

    const style = config.style || {};
    const position = style.position || 'bottom-right';
    
    // Timer interval reference for cleanup (declare at function scope)
    var timerInterval = null;

    // Build the card. Respect the admin's adjustable card width (config.cardWidth,
    // e.g. 400–440); the CSS width is only a fallback when it's not set.
    const cardStyle = {
      background: getBackgroundStyle(style.background) || '#1f2937',
      color: style.textColor || '#ffffff',
    };
    if (config.cardWidth) {
      cardStyle.width = config.cardWidth + 'px';
    }
    const card = createElement('div', {
      className: 'cw-promo-card cw-promo-card--' + position,
      id: 'cw-promo-card',
      style: cardStyle,
    });

    // Shimmer effect
    card.appendChild(createElement('div', { className: 'cw-promo-card__shimmer' }));

    // Close button
    const closeBtn = createElement('button', {
      className: 'cw-promo-card__close',
      'aria-label': 'Close promotional card',
      innerHTML: '&times;',
      onClick: function () {
        // Cleanup timer if exists
        if (timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
        // Animate out and remove
        card.classList.add('cw-closing');
        setTimeout(function () {
          card.remove();
        }, 350);
      },
    });
    card.appendChild(closeBtn);

    // Title with individual styling
    if (config.title) {
      const titleStyle = style.titleStyle || {};
      const titleElement = createElement('div', {
        className: 'cw-promo-card__title',
        style: {
          background: getBackgroundStyle(titleStyle.background) || 'transparent',
          color: titleStyle.textColor || style.textColor || '#ffffff',
          textAlign: titleStyle.textAlign || 'center',
          fontWeight: titleStyle.fontWeight || '400',
        },
      });
      titleElement.innerHTML = normalizeRemToPx(sanitizeHTML(config.title));
      card.appendChild(titleElement);
    }

    // Subtitle with individual styling
    if (config.subtitle) {
      const subheadingStyle = style.subheadingStyle || {};
      const subtitleElement = createElement('div', {
        className: 'cw-promo-card__subtitle',
        style: {
          background: getBackgroundStyle(subheadingStyle.background) || 'transparent',
          color: subheadingStyle.textColor || style.textColor || '#ffffff',
          textAlign: subheadingStyle.textAlign || 'center',
          fontWeight: subheadingStyle.fontWeight || '400',
        },
      });
      subtitleElement.innerHTML = normalizeRemToPx(sanitizeHTML(config.subtitle));
      card.appendChild(subtitleElement);
    }

    // Description with individual styling
    if (config.description) {
      const descriptionStyle = style.descriptionStyle || {};
      const descriptionElement = createElement('div', {
        className: 'cw-promo-card__description',
        style: {
          background: getBackgroundStyle(descriptionStyle.background) || 'transparent',
          color: descriptionStyle.textColor || style.textColor || '#ffffff',
          textAlign: descriptionStyle.textAlign || 'left',
          fontWeight: descriptionStyle.fontWeight || '400',
        },
      });
      descriptionElement.innerHTML = normalizeRemToPx(sanitizeHTML(config.description));
      card.appendChild(descriptionElement);
    }

    // Timer
    if (config.showTimer && config.timerText) {
      const timerContainer = createElement('div', {
        className: 'cw-promo-card__timer',
        style: {
          background: getBackgroundStyle(style.dateStyle?.background) || 'transparent',
          color: style.dateStyle?.textColor || style.textColor || '#ffffff',
          textAlign: style.dateStyle?.textAlign || 'center',
          fontWeight: style.dateStyle?.fontWeight || '400',
        },
      });

      // Sanitize timer template once
      const formattedTemplate = normalizeRemToPx(sanitizeHTML(config.timerText));
      const timerText = createElement('span', {});
      timerContainer.appendChild(timerText);
      card.appendChild(timerContainer);
      
      // Remaining time — mirrors the admin's calculateTimeRemaining (a date-only
      // endDate counts down to LOCAL end-of-day 23:59:59).
      function getRemaining() {
        var ed = config.endDate || '';
        var end;
        if (/^\d{4}-\d{2}-\d{2}$/.test(ed)) {
          var p = ed.split('-');
          end = new Date(+p[0], +p[1] - 1, +p[2], 23, 59, 59, 999);
        } else {
          end = new Date(ed);
        }
        var diff = end.getTime() - Date.now();
        if (isNaN(diff) || diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true };
        return {
          days: Math.floor(diff / 86400000),
          hours: Math.floor((diff % 86400000) / 3600000),
          minutes: Math.floor((diff % 3600000) / 60000),
          seconds: Math.floor((diff % 60000) / 1000),
          done: false
        };
      }

      function pad(n, w) { n = String(n); while (n.length < w) n = '0' + n; return n; }

      // Expand the timer template — matches the admin's timerUtils:
      //  {timer}  → "D days : H hours : M mins"
      //  tokens   → {ddd}{dd}{d} {hhh}{hh}{h} {mmm}{mm}{m} {sss}{ss}{s}
      // When no day token is used, days roll up into hours (like formatTimerText).
      function fillTimer(tpl, v) {
        // Wrap the {timer} countdown block in a nowrap span so "D days : H hours :
        // M mins" never breaks mid-countdown when the surrounding text wraps —
        // mirrors the tool's nowrap TimerChipNode.
        var chip = '<span class="cw-timer-value">' + v.days + ' days : ' + v.hours + ' hours : ' + v.minutes + ' mins</span>';
        var out = tpl.split('{timer}').join(chip);
        var hasDayTok = /\{ddd\}|\{dd\}|\{d\}/.test(out);
        var dh = hasDayTok ? v.hours : (v.days * 24 + v.hours);
        return out
          .replace(/\{ddd\}/g, pad(v.days, 3)).replace(/\{dd\}/g, pad(v.days, 2)).replace(/\{d\}/g, String(v.days))
          .replace(/\{hhh\}/g, pad(dh, 3)).replace(/\{hh\}/g, pad(dh, 2)).replace(/\{h\}/g, String(dh))
          .replace(/\{mmm\}/g, pad(v.minutes, 3)).replace(/\{mm\}/g, pad(v.minutes, 2)).replace(/\{m\}/g, String(v.minutes))
          .replace(/\{sss\}/g, pad(v.seconds, 3)).replace(/\{ss\}/g, pad(v.seconds, 2)).replace(/\{s\}/g, String(v.seconds));
      }

      // Shrink the timer font just enough to keep it on ONE line, matching the
      // tool (which never lets the timer wrap). Only kicks in when the text is
      // slightly wider than the card interior — a font-metric boundary case —
      // so in the normal case nothing changes and it renders at the full 16px.
      function fitTimer() {
        if (!timerContainer.clientWidth) return; // not laid out yet
        timerText.style.fontSize = ''; // reset so we measure at the base size
        var cs = window.getComputedStyle(timerContainer);
        var avail = timerContainer.clientWidth
          - parseFloat(cs.paddingLeft || '0')
          - parseFloat(cs.paddingRight || '0');
        // getBoundingClientRect works for an inline span (scrollWidth does not).
        var textW = timerText.getBoundingClientRect().width;
        if (avail > 0 && textW > avail) {
          // Base size is 16px (inherited from the card). Scale down to fit,
          // with a sensible floor so it never becomes unreadable.
          var size = Math.max(11, Math.floor(16 * (avail / textW) * 10) / 10);
          timerText.style.fontSize = size + 'px';
        }
      }

      function updateTimer() {
        var v = getRemaining();
        timerText.innerHTML = fillTimer(formattedTemplate, v);
        fitTimer();
        if (v.done && timerInterval) {
          clearInterval(timerInterval);
          timerInterval = null;
        }
      }

      // Render immediately on first load to prevent layout shift
      updateTimer();
      // Fit once the card is actually in the layout, and again once Geist loads
      // (font swap changes text width).
      if (typeof requestAnimationFrame !== 'undefined') {
        requestAnimationFrame(function () { requestAnimationFrame(fitTimer); });
      }
      if (typeof document !== 'undefined' && document.fonts && document.fonts.ready) {
        document.fonts.ready.then(fitTimer);
      }

      // Then update every second
      timerInterval = setInterval(updateTimer, 1000);
    }

    // Button — render whenever enabled and there's text. Only make it a real
    // link when a destination URL exists; the "text" CTA type has no URL by
    // design, so it renders as a styled, non-clickable button.
    if (config.showButton && (config.buttonText || config.buttonUrl)) {
      const buttonStyle = style.buttonStyle || {};

      // Create button wrapper for alignment control
      const buttonWrapper = createElement('div', {
        className: 'cw-promo-card__btn-wrapper',
        style: {
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }
      });

      const btnAttrs = {
        className: 'cw-promo-card__btn' + (config.buttonFullWidth ? ' cw-promo-card__btn--full' : ''),
        style: {
          background: getBackgroundStyle(buttonStyle.background) || style.buttonColor || '#6366f1',
          color: buttonStyle.textColor || style.buttonTextColor || '#ffffff',
          textAlign: buttonStyle.textAlign || 'center',
        },
        innerHTML: normalizeRemToPx(sanitizeHTML(config.buttonText || 'Shop Now')),
      };

      var btn;
      if (config.buttonUrl) {
        // Clickable CTA (whatsapp / link)
        btnAttrs.href = config.buttonUrl;
        btnAttrs.target = '_blank';
        btnAttrs.rel = 'noopener noreferrer';
        btn = createElement('a', btnAttrs);
      } else {
        // "text" CTA — shown on the card but not clickable
        btnAttrs.style.cursor = 'default';
        btn = createElement('span', btnAttrs);
      }

      buttonWrapper.appendChild(btn);
      card.appendChild(buttonWrapper);
    }

    // Insert into page
    document.body.appendChild(card);
  }

  // ---- Main: Fetch config & initialize ----

  /**
   * Render widgets from the config data
   */
  function renderWidgets(data) {
    // Render announcement bar
    if (data.announcementBar) {
      renderAnnouncementBar(data.announcementBar);
    }

    // Render promo card
    if (ENABLE_PROMO_CARD && data.promoCard) {
      renderPromoCard(data.promoCard);
    }
  }

  function init() {
    // Check sessionStorage for cached config
    try {
      var cached = sessionStorage.getItem(CACHE_KEY);
      if (cached) {
        var data = JSON.parse(cached);
        renderWidgets(data);
        return; // Skip API call
      }
    } catch (e) {
      // sessionStorage unavailable or corrupted — fall through to fetch
    }

    // No cache — fetch from API
    fetch(CONFIG_URL, {
      cache: 'no-cache',
      headers: { 'Accept': 'application/json' },
    })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Campaign config fetch failed: ' + response.status);
        }
        return response.json();
      })
      .then(function (data) {
        // Store in sessionStorage for the rest of this session
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
        } catch (e) {
          // Storage full or unavailable — continue without caching
        }

        renderWidgets(data);
      })
      .catch(function (error) {
        console.warn('[Campaign Widgets] Could not load campaign config:', error.message);
      });
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
