/**
 * Nav external-link tooltip.
 * Shows a tooltip for any element with `.js-nav-tooltip[data-tooltip]`.
 * Uses a single fixed-position element appended to <body>, so the header's
 * overflow:hidden can't clip it. Hidden on screens <= 1024px (no hover).
 */
(function () {
  "use strict";

  // Inject styles once.
  var STYLE_ID = "js-nav-tooltip-style";
  if (!document.getElementById(STYLE_ID)) {
    var style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = [
      "#js-nav-tooltip{",
      "position:fixed;z-index:100000;max-width:300px;padding:10px 16px;",
      "background-color:rgba(21,21,21,.75);color:#fff;font-size:12px;line-height:1.5;",
      "text-align:center;border-radius:6px;",
      "box-shadow:0 4px 12px rgba(0,0,0,.3),0 2px 4px rgba(0,0,0,.2);",
      "pointer-events:none;opacity:0;",
      "transition:opacity .2s ease,transform .2s ease;}",
      "#js-nav-tooltip.is-visible{opacity:1;}",
      "#js-nav-tooltip::after{content:'';position:absolute;bottom:100%;left:50%;",
      "transform:translateX(-50%);border:6px solid transparent;",
      "border-bottom-color:rgba(21,21,21,.75);}"
    ].join("");
    document.head.appendChild(style);
  }

  var tip;
  function ensureTip() {
    if (!tip) {
      tip = document.createElement("div");
      tip.id = "js-nav-tooltip";
      document.body.appendChild(tip);
    }
    return tip;
  }

  function init() {
    document.querySelectorAll(".js-nav-tooltip[data-tooltip]").forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        if (window.innerWidth <= 1024) return;
        var t = ensureTip();
        t.textContent = el.getAttribute("data-tooltip");
        var r = el.getBoundingClientRect();
        t.style.left = (r.left + r.width / 2) + "px";
        t.style.top = (r.bottom + 12) + "px";
        t.style.transform = "translateX(-50%) translateY(-5px)";
        void t.offsetWidth; // reflow so the transform animates
        t.classList.add("is-visible");
        t.style.transform = "translateX(-50%) translateY(0)";
      });
      el.addEventListener("mouseleave", function () {
        if (tip) tip.classList.remove("is-visible");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
