(function polyfill() {
  const relList = document.createElement("link").relList;
  if (relList && relList.supports && relList.supports("modulepreload")) return;
  for (const link of document.querySelectorAll('link[rel="modulepreload"]')) processPreload(link);
  new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== "childList") continue;
      for (const node of mutation.addedNodes) if (node.tagName === "LINK" && node.rel === "modulepreload") processPreload(node);
    }
  }).observe(document, {
    childList: true,
    subtree: true
  });
  function getFetchOpts(link) {
    const fetchOpts = {};
    if (link.integrity) fetchOpts.integrity = link.integrity;
    if (link.referrerPolicy) fetchOpts.referrerPolicy = link.referrerPolicy;
    if (link.crossOrigin === "use-credentials") fetchOpts.credentials = "include";
    else if (link.crossOrigin === "anonymous") fetchOpts.credentials = "omit";
    else fetchOpts.credentials = "same-origin";
    return fetchOpts;
  }
  function processPreload(link) {
    if (link.ep) return;
    link.ep = true;
    const fetchOpts = getFetchOpts(link);
    fetch(link.href, fetchOpts);
  }
})();
let slideUp = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = `${target.offsetHeight}px`;
    target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    window.setTimeout(() => {
      target.hidden = !showmore ? true : false;
      !showmore ? target.style.removeProperty("height") : null;
      target.style.removeProperty("padding-top");
      target.style.removeProperty("padding-bottom");
      target.style.removeProperty("margin-top");
      target.style.removeProperty("margin-bottom");
      !showmore ? target.style.removeProperty("overflow") : null;
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideUpDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideDown = (target, duration = 500, showmore = 0) => {
  if (!target.classList.contains("--slide")) {
    target.classList.add("--slide");
    target.hidden = target.hidden ? false : null;
    showmore ? target.style.removeProperty("height") : null;
    let height = target.offsetHeight;
    target.style.overflow = "hidden";
    target.style.height = showmore ? `${showmore}px` : `0px`;
    target.style.paddingTop = 0;
    target.style.paddingBottom = 0;
    target.style.marginTop = 0;
    target.style.marginBottom = 0;
    target.offsetHeight;
    target.style.transitionProperty = "height, margin, padding";
    target.style.transitionDuration = duration + "ms";
    target.style.height = height + "px";
    target.style.removeProperty("padding-top");
    target.style.removeProperty("padding-bottom");
    target.style.removeProperty("margin-top");
    target.style.removeProperty("margin-bottom");
    window.setTimeout(() => {
      target.style.removeProperty("height");
      target.style.removeProperty("overflow");
      target.style.removeProperty("transition-duration");
      target.style.removeProperty("transition-property");
      target.classList.remove("--slide");
      document.dispatchEvent(new CustomEvent("slideDownDone", {
        detail: {
          target
        }
      }));
    }, duration);
  }
};
let slideToggle = (target, duration = 500) => {
  if (target.hidden) {
    return slideDown(target, duration);
  } else {
    return slideUp(target, duration);
  }
};
let bodyLockStatus = true;
let bodyLockToggle = (delay = 500) => {
  if (document.documentElement.hasAttribute("data-fls-scrolllock")) {
    bodyUnlock(delay);
  } else {
    bodyLock(delay);
  }
};
let bodyUnlock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    setTimeout(() => {
      lockPaddingElements.forEach((lockPaddingElement) => {
        lockPaddingElement.style.paddingRight = "";
      });
      document.body.style.paddingRight = "";
      document.documentElement.removeAttribute("data-fls-scrolllock");
    }, delay);
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
let bodyLock = (delay = 500) => {
  if (bodyLockStatus) {
    const lockPaddingElements = document.querySelectorAll("[data-fls-lp]");
    const lockPaddingValue = window.innerWidth - document.body.offsetWidth + "px";
    lockPaddingElements.forEach((lockPaddingElement) => {
      lockPaddingElement.style.paddingRight = lockPaddingValue;
    });
    document.body.style.paddingRight = lockPaddingValue;
    document.documentElement.setAttribute("data-fls-scrolllock", "");
    bodyLockStatus = false;
    setTimeout(function() {
      bodyLockStatus = true;
    }, delay);
  }
};
function dataMediaQueries(array, dataSetValue) {
  const media = Array.from(array).filter((item) => item.dataset[dataSetValue]).map((item) => {
    const [value, type = "max"] = item.dataset[dataSetValue].split(",");
    return { value, type, item };
  });
  if (media.length === 0) return [];
  const breakpointsArray = media.map(({ value, type }) => `(${type}-width: ${value}px),${value},${type}`);
  const uniqueQueries = [...new Set(breakpointsArray)];
  return uniqueQueries.map((query) => {
    const [mediaQuery, mediaBreakpoint, mediaType] = query.split(",");
    const matchMedia = window.matchMedia(mediaQuery);
    const itemsArray = media.filter((item) => item.value === mediaBreakpoint && item.type === mediaType);
    return { itemsArray, matchMedia };
  });
}
function menuInit() {
  document.addEventListener("click", function(e) {
    if (bodyLockStatus && e.target.closest("[data-fls-menu]")) {
      bodyLockToggle();
      document.documentElement.toggleAttribute("data-fls-menu-open");
      const activeCatalog = document.querySelector(".header-catalog._catalog-active");
      if (activeCatalog) {
        activeCatalog.classList.remove("_catalog-active");
      }
    }
  });
}
document.querySelector("[data-fls-menu]") ? window.addEventListener("load", menuInit) : null;
let inited = false;
let lastH = -1;
let controller = null;
let ro = null;
function initHeaderHeight() {
  if (inited) return;
  inited = true;
  const root = document.documentElement;
  const header = document.querySelector(".header");
  if (!header) return;
  const setVar = () => {
    const h = header.getBoundingClientRect().height || 0;
    if (h !== lastH) {
      lastH = h;
      root.style.setProperty("--header-height", `${h}px`);
    }
  };
  setVar();
  controller = new AbortController();
  const { signal } = controller;
  ro = new ResizeObserver(setVar);
  ro.observe(header);
  const onResize = () => requestAnimationFrame(setVar);
  window.addEventListener("resize", onResize, { passive: true, signal });
}
initHeaderHeight();
const isMenuOpen$1 = () => document.documentElement.hasAttribute("data-fls-menu-open");
const catalogButtons = document.querySelectorAll(".header-catalog__toggle");
if (catalogButtons.length > 0) {
  catalogButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!bodyLockStatus) return;
      const parent = btn.closest(".header-catalog");
      if (!parent) return;
      const isOpening = !parent.classList.contains("_catalog-active");
      parent.classList.toggle("_catalog-active");
      if (isOpening) {
        const activeSearch = document.querySelector(".search._search-active");
        if (activeSearch) activeSearch.classList.remove("_search-active");
        if (!isMenuOpen$1()) {
          bodyLock();
        }
        bodyLock();
      } else {
        const stillOpenSearch = document.querySelector(".search._search-active");
        if (!isMenuOpen$1() && !stillOpenSearch) {
          bodyUnlock();
        }
      }
    });
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
    const activeCatalog = document.querySelector(".header-catalog._catalog-active");
    if (activeCatalog) {
      bodyLockToggle();
      activeCatalog.classList.remove("_catalog-active");
    }
  }
});
const DESKTOP_MIN = 768;
const mql = window.matchMedia(`(min-width: ${DESKTOP_MIN}px)`);
document.querySelectorAll(".header-catalog__tabs").forEach(initTabsBlock);
function initTabsBlock(block) {
  const btns = Array.from(block.querySelectorAll("button.header-catalog__title"));
  const bodies = Array.from(block.querySelectorAll(".header-catalog__body"));
  block.addEventListener("click", (e) => {
    const btn = e.target.closest("button.header-catalog__title");
    if (!btn || !block.contains(btn)) return;
    const idx = btns.indexOf(btn);
    if (idx === -1) return;
    btns.forEach((b) => b.classList.remove("_item-active"));
    bodies.forEach((b) => b.classList.remove("_item-active"));
    btn.classList.add("_item-active");
    if (bodies[idx]) {
      bodies[idx].classList.add("_item-active");
    }
  });
  block.addEventListener("pointerover", (e) => {
    const link = e.target.closest(".header-catalog__link");
    if (!link || !block.contains(link)) return;
    const body = link.closest(".header-catalog__body");
    if (!body) return;
    const listItems = Array.from(body.querySelectorAll(".header-catalog__list .header-catalog__item"));
    const blockItems = Array.from(body.querySelectorAll(".header-catalog__block .header-catalog__item"));
    const currentLi = link.closest(".header-catalog__item");
    const idx = listItems.indexOf(currentLi);
    body.querySelectorAll(".header-catalog__item._item-hover").forEach((el) => el.classList.remove("_item-hover"));
    if (currentLi) currentLi.classList.add("_item-hover");
    if (idx > -1 && blockItems[idx]) {
      blockItems[idx].classList.add("_item-hover");
    }
  });
  block.addEventListener("click", (e) => {
    const close = e.target.closest(".header-catalog__close");
    if (!close || !block.contains(close)) return;
    if (mql.matches) return;
    const body = close.closest(".header-catalog__body");
    if (!body) return;
    body.classList.remove("_item-active");
    const idx = bodies.indexOf(body);
    if (idx > -1 && btns[idx]) {
      btns[idx].classList.remove("_item-active");
    }
  });
  function clearAll() {
    btns.forEach((b) => b.classList.remove("_item-active"));
    bodies.forEach((b) => b.classList.remove("_item-active"));
    block.querySelectorAll("._item-hover").forEach((el) => el.classList.remove("_item-hover"));
  }
  function setDesktopDefaults() {
    clearAll();
    if (btns[0]) btns[0].classList.add("_item-active");
    if (bodies[0]) bodies[0].classList.add("_item-active");
    bodies.forEach((body) => {
      const listItems = Array.from(body.querySelectorAll(".header-catalog__list .header-catalog__item"));
      const blockItems = Array.from(body.querySelectorAll(".header-catalog__block .header-catalog__item"));
      if (listItems[0]) listItems[0].classList.add("_item-hover");
      if (blockItems[0]) blockItems[0].classList.add("_item-hover");
    });
  }
  mql.matches ? setDesktopDefaults() : clearAll();
  const onChange = (e) => e.matches ? setDesktopDefaults() : clearAll();
  if (mql.addEventListener) mql.addEventListener("change", onChange);
  else mql.addListener(onChange);
}
class DynamicAdapt {
  constructor() {
    this.type = "max";
    this.init();
  }
  init() {
    this.objects = [];
    this.daClassname = "--dynamic";
    this.nodes = [...document.querySelectorAll("[data-fls-dynamic]")];
    this.nodes.forEach((node) => {
      const data = node.dataset.flsDynamic.trim();
      const dataArray = data.split(`,`);
      const object = {};
      object.element = node;
      object.parent = node.parentNode;
      object.destinationParent = dataArray[3] ? node.closest(dataArray[3].trim()) || document : document;
      dataArray[3] ? dataArray[3].trim() : null;
      const objectSelector = dataArray[0] ? dataArray[0].trim() : null;
      if (objectSelector) {
        const foundDestination = object.destinationParent.querySelector(objectSelector);
        if (foundDestination) {
          object.destination = foundDestination;
        }
      }
      object.breakpoint = dataArray[1] ? dataArray[1].trim() : `767.98`;
      object.place = dataArray[2] ? dataArray[2].trim() : `last`;
      object.index = this.indexInParent(object.parent, object.element);
      this.objects.push(object);
    });
    this.arraySort(this.objects);
    this.mediaQueries = this.objects.map(({ breakpoint }) => `(${this.type}-width: ${breakpoint / 16}em),${breakpoint}`).filter((item, index, self) => self.indexOf(item) === index);
    this.mediaQueries.forEach((media) => {
      const mediaSplit = media.split(",");
      const matchMedia = window.matchMedia(mediaSplit[0]);
      const mediaBreakpoint = mediaSplit[1];
      const objectsFilter = this.objects.filter(({ breakpoint }) => breakpoint === mediaBreakpoint);
      matchMedia.addEventListener("change", () => {
        this.mediaHandler(matchMedia, objectsFilter);
      });
      this.mediaHandler(matchMedia, objectsFilter);
    });
  }
  mediaHandler(matchMedia, objects) {
    if (matchMedia.matches) {
      objects.forEach((object) => {
        if (object.destination) {
          this.moveTo(object.place, object.element, object.destination);
        }
      });
    } else {
      objects.forEach(({ parent, element, index }) => {
        if (element.classList.contains(this.daClassname)) {
          this.moveBack(parent, element, index);
        }
      });
    }
  }
  moveTo(place, element, destination) {
    element.classList.add(this.daClassname);
    const index = place === "last" || place === "first" ? place : parseInt(place, 10);
    if (index === "last" || index >= destination.children.length) {
      destination.append(element);
    } else if (index === "first") {
      destination.prepend(element);
    } else {
      destination.children[index].before(element);
    }
  }
  moveBack(parent, element, index) {
    element.classList.remove(this.daClassname);
    if (parent.children[index] !== void 0) {
      parent.children[index].before(element);
    } else {
      parent.append(element);
    }
  }
  indexInParent(parent, element) {
    return [...parent.children].indexOf(element);
  }
  arraySort(arr) {
    if (this.type === "min") {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return -1;
          }
          if (a.place === "last" || b.place === "first") {
            return 1;
          }
          return 0;
        }
        return a.breakpoint - b.breakpoint;
      });
    } else {
      arr.sort((a, b) => {
        if (a.breakpoint === b.breakpoint) {
          if (a.place === b.place) {
            return 0;
          }
          if (a.place === "first" || b.place === "last") {
            return 1;
          }
          if (a.place === "last" || b.place === "first") {
            return -1;
          }
          return 0;
        }
        return b.breakpoint - a.breakpoint;
      });
      return;
    }
  }
}
if (document.querySelector("[data-fls-dynamic]")) {
  window.addEventListener("load", () => new DynamicAdapt());
}
initHeaderHeight();
const isMenuOpen = () => document.documentElement.hasAttribute("data-fls-menu-open");
const searchButtons = document.querySelectorAll(".search__toggle");
if (searchButtons.length > 0) {
  searchButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (!bodyLockStatus) return;
      const parent = btn.closest(".search");
      if (!parent) return;
      const isOpening = !parent.classList.contains("_search-active");
      parent.classList.toggle("_search-active");
      if (isOpening) {
        const activeCatalog = document.querySelector(".header-catalog._catalog-active");
        if (activeCatalog) {
          activeCatalog.classList.remove("_catalog-active");
          return;
        }
        if (isMenuOpen()) return;
        bodyLock();
      } else {
        const stillOpenCatalog = document.querySelector(".header-catalog._catalog-active");
        if (!stillOpenCatalog && !isMenuOpen()) {
          bodyUnlock();
        }
      }
    });
  });
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" || e.key === "Esc") {
    const activeSearch = document.querySelector(".search._search-active");
    if (activeSearch) {
      bodyLockToggle();
      activeSearch.classList.remove("_search-active");
    }
  }
});
export {
  slideUp as a,
  slideToggle as b,
  dataMediaQueries as d,
  slideDown as s
};
