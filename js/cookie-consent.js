/* Devlin cookie consent — shared across all pages. Self-injects CSS + banner HTML + logic. */
(function () {
  if (!document.getElementById("dw-cookie-style")) {
    var st = document.createElement("style");
    st.id = "dw-cookie-style";
    st.textContent =
      '/* Cookie Banner Widget */\n    .cookie-banner-widget {\n      position: fixed;\n      bottom: 20px;\n      left: 20px;\n      right: 20px;\n      max-width: 500px;\n      margin: 0 auto;\n      background: #fff;\n      border-radius: 3px;\n      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.14);\n      border: 1px solid #e9ecef;\n      z-index: 9999;\n      transform: translateY(100px);\n      opacity: 0;\n      transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);\n    }\n\n    .cookie-banner-widget.show {\n      transform: translateY(0);\n      opacity: 1;\n    }\n\n    .cookie-banner-content {\n      padding: 16px 20px;\n    }\n\n    .banner-flex {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n    }\n\n    .cookie-icon {\n      font-size: 1.5rem;\n      flex-shrink: 0;\n    }\n\n    .banner-text {\n      white-space: nowrap;\n      /* Keep text in one line */\n      text-align: center;\n      /* Center the text */\n      margin-bottom: 10px;\n      /* Space between text and buttons */\n    }\n\n    .banner-text p {\n      white-space: nowrap;\n      /* Keep in one line by default */\n      margin: 0 0 10px 0;\n      overflow: hidden;\n      text-overflow: ellipsis;\n      /* Optional: add ... if text is too long */\n    }\n\n    .learn-more-link {\n      color: #031e2b;\n      text-decoration: none;\n    }\n\n    .learn-more-link:hover {\n      color: #031e2b;\n      text-decoration: underline;\n    }\n\n    .cookie-actions {\n      display: flex;\n      justify-content: center;\n      gap: 15px;\n    }\n\n    .btn {\n      padding: 6px 12px;\n      font-size: 0.8rem;\n      border-radius: 2px;\n      border: 1px solid;\n      cursor: pointer;\n      transition: all 0.2s ease;\n      font-weight: 500;\n    }\n\n    .btn-decline {\n      background: #fff;\n      border-color: #6c757d;\n      color: #6c757d;\n    }\n\n    .btn-decline:hover {\n      background: #6c757d;\n      color: #fff;\n    }\n\n    .btn-customize {\n      background: #fff;\n      border-color: #031e2b;\n      color: #031e2b;\n    }\n\n    .btn-customize:hover {\n      background: #031e2b;\n      color: #fff;\n    }\n\n    .btn-accept {\n      background: #031e2b;\n      border-color: #031e2b;\n      color: #fff;\n    }\n\n    .btn-accept:hover {\n      background: #0b3347;\n      border-color: #0b3347;\n      color: #fff;\n    }\n\n    .btn-accept:focus,\n    .btn-accept:active {\n      background: #0b3347;\n      border-color: #0b3347;\n      color: #fff;\n    }\n\n    .btn-save {\n      background: #fff;\n      border-color: #031e2b;\n      color: #031e2b;\n    }\n\n    .btn-save:hover {\n      background: #031e2b;\n      border-color: #031e2b;\n      color: #fff;\n    }\n\n    /* Cookie Widget Modal */\n    .cookie-widget {\n      position: fixed;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      z-index: 10000;\n      display: none;\n      align-items: center;\n      justify-content: center;\n      padding: 20px;\n    }\n\n    .cookie-widget.show {\n      display: flex;\n      animation: fadeIn 0.3s ease-out;\n    }\n\n    .cookie-widget-overlay {\n      position: absolute;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      background: rgba(0, 0, 0, 0.5);\n    }\n\n    .cookie-widget-content {\n      background: #fff;\n      border-radius: 3px;\n      width: 100%;\n      max-width: 840px;\n      max-height: 90vh;\n      overflow: hidden;\n      display: flex;\n      flex-direction: column;\n      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22);\n      animation: slideUp 0.3s ease-out;\n      position: relative;\n      z-index: 1;\n    }\n\n    .cookie-widget-header {\n      padding: 20px;\n      border-bottom: 1px solid #e9ecef;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n    }\n\n    .cookie-widget-header h5 {\n      margin: 0;\n      font-weight: 600;\n      color: #333;\n      font-size: 1.25rem;\n      line-height: 1.2;\n    }\n\n    .close-btn {\n      background: none;\n      border: none;\n      font-size: 24px;\n      cursor: pointer;\n      color: #6c757d;\n      width: 30px;\n      height: 30px;\n      display: flex;\n      align-items: center;\n      justify-content: center;\n    }\n\n    .close-btn:hover {\n      color: #333;\n    }\n\n    .cookie-widget-body {\n      padding: 20px;\n      overflow-y: auto;\n      flex: 1;\n    }\n\n    .description {\n      color: #6c757d;\n      font-size: 0.9rem;\n      line-height: 1.5;\n      margin-bottom: 24px;\n    }\n\n    .cookie-widget-footer {\n      padding: 20px;\n      border-top: 1px solid #e9ecef;\n      background: #f8f9fa;\n    }\n\n    .footer-actions {\n      display: flex;\n      gap: 12px;\n      justify-content: flex-end;\n      width: 100%;\n    }\n\n    .footer-actions .btn {\n      flex: 1 1 0;\n      min-width: 0;\n      text-align: center;\n    }\n\n    /* Cookie Categories */\n    .cookie-category {\n      border: 1px solid #e9ecef;\n      border-radius: 2px;\n      overflow: hidden;\n      margin-bottom: 12px;\n    }\n\n    .cookie-category-header {\n      padding: 16px;\n      background: #f8f9fa;\n      cursor: pointer;\n      transition: background-color 0.2s ease;\n      display: flex;\n      align-items: center;\n      justify-content: space-between;\n    }\n\n    .cookie-category-header:hover {\n      background: #e9ecef;\n    }\n\n    .category-info {\n      flex: 1;\n    }\n\n    .category-leading {\n      width: 24px;\n      display: flex;\n      align-items: center;\n      justify-content: flex-start;\n      margin-right: 8px;\n      flex-shrink: 0;\n    }\n\n    .category-title {\n      display: flex;\n      align-items: center;\n      gap: 8px;\n    }\n\n    .category-icon {\n      width: 16px;\n      height: 16px;\n    }\n\n    .category-icon.necessary {\n      color: #28a745;\n    }\n\n    .category-icon.functional {\n      color: #031e2b;\n    }\n\n    .category-icon.analytics {\n      color: #ffc107;\n    }\n\n    .category-icon.performance {\n      color: #031e2b;\n    }\n\n    .always-active-badge {\n      color: #28a745;\n      font-size: 0.78rem;\n      font-weight: 600;\n      margin-left: 8px;\n      white-space: nowrap;\n    }\n\n    .category-controls {\n      display: flex;\n      align-items: center;\n      gap: 12px;\n    }\n\n    .expand-icon {\n      transition: transform 0.2s ease;\n      font-size: 0.8rem;\n      color: #6c757d;\n    }\n\n    .cookie-category-header.expanded .expand-icon {\n      transform: rotate(180deg);\n    }\n\n    .cookie-category-details {\n      padding: 16px;\n      background: #fff;\n      border-top: 1px solid #e9ecef;\n      display: none;\n    }\n\n    .cookie-category-details.show {\n      display: block;\n    }\n\n    .cookie-category-details p {\n      margin: 0;\n      font-size: 0.9rem;\n      color: #6c757d;\n      line-height: 1.5;\n    }\n\n    /* Toggle Switch */\n    .toggle-switch {\n      position: relative;\n      display: inline-block;\n      width: 40px;\n      height: 20px;\n    }\n\n    .toggle-switch input {\n      opacity: 0;\n      width: 0;\n      height: 0;\n    }\n\n    .toggle-switch .toggle-label {\n      position: absolute;\n      cursor: pointer;\n      top: 0;\n      left: 0;\n      right: 0;\n      bottom: 0;\n      background-color: #ccc;\n      transition: 0.2s;\n      border-radius: 20px;\n      margin: 0;\n    }\n\n    .toggle-switch .toggle-label:before {\n      position: absolute;\n      content: "";\n      height: 16px;\n      width: 16px;\n      left: 2px;\n      bottom: 2px;\n      background-color: white;\n      transition: 0.2s;\n      border-radius: 50%;\n    }\n\n    .toggle-switch input:checked+.toggle-label {\n      background-color: #28a745;\n    }\n\n    .toggle-switch input:checked+.toggle-label:before {\n      transform: translateX(20px);\n    }\n\n    .toggle-switch input:disabled+.disabled-label {\n      background-color: #28a745 !important;\n      opacity: 1;\n      cursor: not-allowed;\n    }\n\n    .toggle-switch input:disabled+.disabled-label:before {\n      transform: translateX(20px);\n    }\n\n    /* Yes/No Radio Group */\n    .yesno-group {\n      display: flex;\n      gap: 8px;\n      align-items: center;\n    }\n\n    .yesno-group label {\n      display: flex;\n      align-items: center;\n      gap: 4px;\n      font-size: 0.85rem;\n      cursor: pointer;\n      margin: 0;\n    }\n\n    .yesno-group input[type="radio"] {\n      margin: 0;\n      width: 14px;\n      height: 14px;\n    }\n\n    /* Animations */\n    @keyframes fadeIn {\n      from {\n        opacity: 0;\n      }\n\n      to {\n        opacity: 1;\n      }\n    }\n\n    @keyframes slideUp {\n      from {\n        opacity: 0;\n        transform: translateY(50px) scale(0.95);\n      }\n\n      to {\n        opacity: 1;\n        transform: translateY(0) scale(1);\n      }\n    }\n\n    /* Mobile Responsiveness */\n    @media (max-width: 768px) {\n      .cookie-banner-widget {\n        left: 10px;\n        right: 10px;\n        bottom: 10px;\n        max-width: none;\n      }\n\n      .banner-flex {\n        flex-direction: column;\n        align-items: flex-start;\n        gap: 12px;\n      }\n\n      .cookie-actions {\n        width: 100%;\n        justify-content: center;\n      }\n\n      .cookie-widget {\n        padding: 10px;\n      }\n\n      .cookie-widget-content {\n        max-height: 95vh;\n      }\n\n      .cookie-widget-header,\n      .cookie-widget-body,\n      .cookie-widget-footer {\n        padding: 16px;\n      }\n\n      .footer-actions {\n        flex-direction: column;\n      }\n\n      .footer-actions .btn {\n        margin-bottom: 8px;\n      }\n    }\n\n    @media (max-width: 480px) {\n      .cookie-banner-content {\n        padding: 12px 16px;\n      }\n\n      .btn {\n        font-size: 0.75rem;\n        padding: 6px 10px;\n      }\n\n      .category-title span {\n        font-size: 0.9rem;\n      }\n\n      .cookie-category-header {\n        padding: 12px;\n      }\n\n      .cookie-category-details {\n        padding: 12px;\n      }\n\n      .banner-text p {\n        white-space: normal;\n\n      }\n    }';
    st.textContent +=
      "\n    .btn-decline {\n      background: #fff;\n      border-color: #031e2b;\n      color: #031e2b;\n    }\n\n    .btn-decline:hover {\n      background: #031e2b;\n      color: #fff;\n    }";
    document.head.appendChild(st);
  }
  if (document.body && !document.getElementById("cookieBanner")) {
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="cookieBanner" class="cookie-banner-widget">\n    <div class="cookie-banner-content">\n      <div class="banner-flex">\n        <div class="banner-text">\n          <p>\n            <strong>We use cookies</strong> to improve your experience.\n            <a href="cookie-policy.html" class="learn-more-link">Learn more</a>\n          </p>\n          <div class="cookie-actions">\n            <button class="btn btn-customize" onclick="showCookieWidget()">Customize</button>\n            <button class="btn btn-decline" onclick="rejectAllCookies()">Reject All</button>\n            <button class="btn btn-accept" onclick="acceptAllCookies()">Accept All</button>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n\n  <!-- Cookie Preferences Widget Modal -->\n  <div id="cookieWidget" class="cookie-widget">\n    <div class="cookie-widget-overlay" onclick="hideCookieWidget()"></div>\n    <div class="cookie-widget-content">\n      <div class="cookie-widget-header">\n        <h5 class="modal-title">Cookie Preferences</h5>\n        <button class="close-btn" onclick="hideCookieWidget()" aria-label="Close">\u00d7</button>\n      </div>\n\n      <div class="cookie-widget-body">\n        <p class="description">\n          We use cookies to help you navigate efficiently and perform certain functions. You will find detailed\n          information about all cookies under each consent category below. The cookies that are categorised as\n          "Necessary" are stored on your browser as they are essential for enabling the basic functionalities of the\n          site.\n        </p>\n\n        <!-- Cookie Categories -->\n        <div class="cookie-categories">\n          <!-- Necessary -->\n          <div class="cookie-category">\n            <div class="cookie-category-header" onclick="toggleCategory(\'necessaryDetails\')">\n              <div class="category-leading">\n                <i class="fas fa-chevron-down expand-icon"></i>\n              </div>\n              <div class="category-info">\n                <div class="category-title">\n                  <span>Strictly Necessary</span>\n                </div>\n              </div>\n              <div class="category-controls">\n                <div class="toggle-switch" onclick="event.stopPropagation();">\n                  <input type="checkbox" id="necessaryCookies" checked disabled>\n                  <label for="necessaryCookies" class="disabled-label"></label>\n                </div>\n                <span class="always-active-badge">Always Active</span>\n              </div>\n            </div>\n            <div class="cookie-category-details" id="necessaryDetails">\n              <p>\n  Strictly necessary cookies are essential for our website to function correctly. They enable core features such as remembering your cookie consent preferences and ensuring the website loads and navigates properly. These cookies do not store any personally identifiable information and cannot be switched off.\n              </p>\n            </div>\n          </div>\n\n          <!-- Functional -->\n          <div class="cookie-category">\n            <div class="cookie-category-header" onclick="toggleCategory(\'functionalDetails\')">\n              <div class="category-leading">\n                <i class="fas fa-chevron-down expand-icon"></i>\n              </div>\n              <div class="category-info">\n                <div class="category-title">\n                  <span>Functional</span>\n                </div>\n              </div>\n              <div class="category-controls" onclick="event.stopPropagation();">\n                <form class="yesno-group">\n                  <label>\n                    <input type="radio" name="functionalCookies" value="yes" />\n                    Yes\n                  </label>\n                  <label>\n                    <input type="radio" name="functionalCookies" value="no" checked />\n                    No\n                  </label>\n                </form>\n              </div>\n            </div>\n            <div class="cookie-category-details" id="functionalDetails">\n              <p>\n                Functional cookies enable key features on our website including our interactive showroom map, virtual tour, and any social sharing or feedback tools. These cookies are provided by trusted third party services and are only activated with your explicit consent. Declining these cookies will not affect your ability to browse our website..\n              </p>\n            </div>\n          </div>\n\n          <!-- Analytics -->\n          <div class="cookie-category">\n            <div class="cookie-category-header" onclick="toggleCategory(\'analyticsDetails\')">\n              <div class="category-leading">\n                <i class="fas fa-chevron-down expand-icon"></i>\n              </div>\n              <div class="category-info">\n                <div class="category-title">\n                  <span>Analytics</span>\n                </div>\n              </div>\n              <div class="category-controls" onclick="event.stopPropagation();">\n                <form class="yesno-group">\n                  <label>\n                    <input type="radio" name="analyticsCookies" value="yes" checked />\n                    Yes\n                  </label>\n                  <label>\n                    <input type="radio" name="analyticsCookies" value="no" />\n                    No\n                  </label>\n                </form>\n              </div>\n            </div>\n            <div class="cookie-category-details" id="analyticsDetails">\n              <p>\n          We do not currently use analytics cookies on this website. Should this change in the future we will update our cookie settings and ask for your consent before any analytics cookies are set.   \n              </p>\n            </div>\n          </div>\n\n          <!-- Performance -->\n          <div class="cookie-category">\n            <div class="cookie-category-header" onclick="toggleCategory(\'performanceDetails\')">\n              <div class="category-leading">\n                <i class="fas fa-chevron-down expand-icon"></i>\n              </div>\n              <div class="category-info">\n                <div class="category-title">\n                  Performance\n                </div>\n              </div>\n              <div class="category-controls" onclick="event.stopPropagation();">\n                <form class="yesno-group">\n                  <label>\n                    <input type="radio" name="performanceCookies" value="yes" />\n                    Yes\n                  </label>\n                  <label>\n                    <input type="radio" name="performanceCookies" value="no" checked />\n                    No\n                  </label>\n                </form>\n              </div>\n            </div>\n            <div class="cookie-category-details" id="performanceDetails">\n              <p>\n                We currently do not use performance cookies on this website. Should this change in the future, we will update this policy and ask for your consent before any performance cookies are set.\n              </p>\n            </div>\n          </div>\n        </div>\n      </div>\n\n      <div class="cookie-widget-footer">\n        <div class="footer-actions">\n          <button class="btn btn-decline" onclick="rejectAllCookies()">\n            Reject All\n          </button>\n          <button class="btn btn-save" onclick="savePreferences()">\n            Save My Preferences\n          </button>\n          <button class="btn btn-accept" onclick="acceptAllCookies()">\n            Accept All\n          </button>\n        </div>\n      </div>\n    </div>\n  </div>',
    );
  }
})();

/* ---- cookie logic (from index.html, unchanged) ---- */
// Cookie management functions
function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie =
    name +
    "=" +
    encodeURIComponent(value) +
    "; expires=" +
    expires +
    "; path=/; SameSite=Lax";
}

function getCookie(name) {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[2]) : null;
}

const DEFAULT_COOKIE_PREFERENCES = {
  necessary: true,
  functional: false,
  analytics: false,
  performance: false,
};

const COOKIE_CATEGORY_AVAILABILITY = {
  functional: true,
  analytics: false,
  performance: false,
};

function normalizeCookiePreferences(preferences = {}) {
  return {
    necessary: true,
    functional:
      COOKIE_CATEGORY_AVAILABILITY.functional && preferences.functional === true,
    analytics:
      COOKIE_CATEGORY_AVAILABILITY.analytics && preferences.analytics === true,
    performance:
      COOKIE_CATEGORY_AVAILABILITY.performance &&
      preferences.performance === true,
  };
}

function getCookiePreferences() {
  const prefs = getCookie("cookiePreferences");
  if (prefs) {
    try {
      return normalizeCookiePreferences(JSON.parse(prefs));
    } catch (e) {
      return null;
    }
  }
  return null;
}

function saveCookiePreferences(preferences, consentValue = "custom") {
  setCookie(
    "cookiePreferences",
    JSON.stringify(normalizeCookiePreferences(preferences)),
    365,
  );
  setCookie("cookieConsent", consentValue, 365);
}

// Widget control functions
function showCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  banner.classList.add("show");
}

function hideCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  banner.classList.remove("show");
}

function showCookieWidget() {
  const widget = document.getElementById("cookieWidget");
  widget.classList.add("show");
  hideCookieBanner();
  document.body.style.overflow = "hidden";
}

function hideCookieWidget() {
  const widget = document.getElementById("cookieWidget");
  widget.classList.remove("show");
  document.body.style.overflow = "";
}

function disableUnavailableCookieControls() {
  ["analyticsCookies", "performanceCookies"].forEach((name) => {
    document
      .querySelectorAll(`input[name="${name}"]`)
      .forEach((input) => {
        input.disabled = true;
        input.closest("label").style.opacity = "0.55";
        input.closest("label").style.cursor = "not-allowed";
      });

    const noOption = document.querySelector(
      `input[name="${name}"][value="no"]`,
    );

    if (noOption) {
      noOption.checked = true;
    }
  });
}

// Toggle category details
function toggleCategory(id) {
  const details = document.getElementById(id);
  const header = details.previousElementSibling;
  const isShown = details.classList.contains("show");

  if (isShown) {
    details.classList.remove("show");
    header.classList.remove("expanded");
  } else {
    details.classList.add("show");
    header.classList.add("expanded");
  }
}

// Cookie action functions
function acceptAllCookies() {
  const preferences = {
    necessary: true,
    functional: COOKIE_CATEGORY_AVAILABILITY.functional,
    analytics: COOKIE_CATEGORY_AVAILABILITY.analytics,
    performance: COOKIE_CATEGORY_AVAILABILITY.performance,
  };

  // isFirstDecision = true if no prior consent cookie existed
  const isFirstDecision = !getCookie("cookieConsent");

  saveCookiePreferences(preferences, "all");
  updateUIFromPreferences(preferences);
  hideCookieBanner();
  hideCookieWidget();

  console.log("All cookies accepted", preferences);
  initializeServices(preferences, isFirstDecision);
}

function rejectAllCookies() {
  const preferences = { ...DEFAULT_COOKIE_PREFERENCES };

  saveCookiePreferences(preferences, "necessary");
  updateUIFromPreferences(preferences);
  hideCookieBanner();
  hideCookieWidget();

  console.log("Only necessary cookies accepted", preferences);
  initializeServices(preferences, false);
}

// FIXED savePreferences function
function savePreferences() {
  // Get radio button values for each category
  const functionalRadio = document.querySelector(
    'input[name="functionalCookies"]:checked',
  );
  const analyticsRadio = document.querySelector(
    'input[name="analyticsCookies"]:checked',
  );
  const performanceRadio = document.querySelector(
    'input[name="performanceCookies"]:checked',
  );

  const preferences = {
    necessary: true, // Always true
    functional: functionalRadio ? functionalRadio.value === "yes" : false,
    analytics: COOKIE_CATEGORY_AVAILABILITY.analytics
      ? analyticsRadio?.value === "yes"
      : false,
    performance: COOKIE_CATEGORY_AVAILABILITY.performance
      ? performanceRadio?.value === "yes"
      : false,
  };

  saveCookiePreferences(preferences);
  hideCookieBanner();
  hideCookieWidget();

  console.log("Custom preferences saved", preferences);
  initializeServices(preferences, false);

  // Show success message
  // alert("Cookie preferences saved successfully!");
}

// Initialize services based on cookie preferences
function initializeServices(preferences, isFirstDecision) {
  console.log("Initializing services with preferences:", preferences);

  if (preferences.analytics) {
    console.log("✅ Analytics cookies enabled - initializing analytics");
  } else {
    console.log("❌ Analytics cookies disabled");
  }

  if (preferences.functional) {
    console.log("✅ Functional cookies enabled - initializing functional features");
    if (isFirstDecision) {
      // First-ever acceptance on a clean page — load embeds directly, no reload needed
      if (typeof loadCoverageMap === "function") loadCoverageMap();
      if (typeof loadMatterport === "function") loadMatterport();
    } else {
      // Preference changed mid-session — reload so page initialises cleanly
      sessionStorage.setItem("dwConsentReload", "1");
      window.location.reload();
    }
  } else {
    console.log("❌ Functional cookies disabled");
    // Reload only if embeds are already live in the DOM
    var mapIframe = document.getElementById("coverageMapIframe");
    var mpIframe  = document.getElementById("matterportIframe");
    var eitherLoaded = (mapIframe && mapIframe.getAttribute("src")) ||
                       (mpIframe  && mpIframe.getAttribute("src"));
    if (eitherLoaded) {
      sessionStorage.setItem("dwConsentReload", "1");
      window.location.reload();
    }
  }

  if (preferences.performance) {
    console.log("✅ Performance cookies enabled - initializing performance monitoring");
  } else {
    console.log("❌ Performance cookies disabled");
  }
}

// Function to update UI based on saved preferences
function updateUIFromPreferences(preferences) {
  if (preferences) {
    console.log("Updating UI with saved preferences:", preferences);

    // Set radio buttons for functional cookies
    const functionalYes = document.querySelector(
      'input[name="functionalCookies"][value="yes"]',
    );
    const functionalNo = document.querySelector(
      'input[name="functionalCookies"][value="no"]',
    );
    if (preferences.functional) {
      functionalYes.checked = true;
    } else {
      functionalNo.checked = true;
    }

    // Set radio buttons for analytics cookies
    const analyticsYes = document.querySelector(
      'input[name="analyticsCookies"][value="yes"]',
    );
    const analyticsNo = document.querySelector(
      'input[name="analyticsCookies"][value="no"]',
    );
    if (preferences.analytics && COOKIE_CATEGORY_AVAILABILITY.analytics) {
      analyticsYes.checked = true;
    } else {
      analyticsNo.checked = true;
    }

    // Set radio buttons for performance cookies
    const performanceYes = document.querySelector(
      'input[name="performanceCookies"][value="yes"]',
    );
    const performanceNo = document.querySelector(
      'input[name="performanceCookies"][value="no"]',
    );
    if (preferences.performance && COOKIE_CATEGORY_AVAILABILITY.performance) {
      performanceYes.checked = true;
    } else {
      performanceNo.checked = true;
    }

    disableUnavailableCookieControls();
  }
}

// Test function to clear all cookies
function clearAllCookies() {
  // Clear specific cookies
  setCookie("cookieConsent", "", -1);
  setCookie("cookiePreferences", "", -1);

  // Reset UI to defaults
  document
    .querySelectorAll('input[name="functionalCookies"][value="no"]')
    .forEach((el) => (el.checked = true));
  document
    .querySelectorAll('input[name="analyticsCookies"][value="no"]')
    .forEach((el) => (el.checked = true));
  document
    .querySelectorAll('input[name="performanceCookies"][value="no"]')
    .forEach((el) => (el.checked = true));

  console.log("All cookies cleared");
  // alert("All cookies cleared! The banner will show again.");
}

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  const consent = getCookie("cookieConsent");
  const preferences = getCookiePreferences();

  // Clear the one-shot reload flag immediately so we never loop
  const justReloaded = sessionStorage.getItem("dwConsentReload");
  sessionStorage.removeItem("dwConsentReload");

  disableUnavailableCookieControls();
  updateUIFromPreferences(preferences || DEFAULT_COOKIE_PREFERENCES);

  if (!consent || consent === "necessary") {
    // No positive consent yet — show banner (unless we just reloaded after a
    // reject/decline, in which case the banner will show after the 400ms delay
    // but won't trigger another reload since initializeServices won't be called
    // from DOMContentLoaded)
    if (!justReloaded) {
      setTimeout(() => {
        const currentConsent = getCookie("cookieConsent");
        if (!currentConsent || currentConsent === "necessary") {
          showCookieBanner();
        }
      }, 400);
    }
  } else {
    // Positive consent exists — initialise services without triggering reload
    if (preferences) {
      console.log("Loaded existing preferences", preferences);
      if (preferences.functional) {
        if (typeof loadCoverageMap === "function") loadCoverageMap();
        if (typeof loadMatterport === "function") loadMatterport();
      }
    }
  }

  // Close widget when clicking outside (on overlay)
  document.addEventListener("click", function (e) {
    const widget = document.getElementById("cookieWidget");
    if (widget.classList.contains("show")) {
      const overlay = widget.querySelector(".cookie-widget-overlay");
      if (e.target === overlay) {
        hideCookieWidget();
      }
    }
  });

  // Keyboard navigation
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const widget = document.getElementById("cookieWidget");
      if (widget.classList.contains("show")) {
        hideCookieWidget();
      }
    }
  });
});

// Listen for changes in radio buttons
document.addEventListener("change", function (event) {
  if (event.target.type === "radio") {
    if (event.target.name === "functionalCookies") {
      console.log("Functional Cookies selection changed:", event.target.value);
    }
    if (event.target.name === "analyticsCookies") {
      console.log("Analytics Cookies selection changed:", event.target.value);
    }
    if (event.target.name === "performanceCookies") {
      console.log("Performance Cookies selection changed:", event.target.value);
    }
  }
});
