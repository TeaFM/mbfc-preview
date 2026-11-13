(function () {
'use strict';
var doc = document;
var root = doc.documentElement;
var body = doc.body;
root.classList.add('js');
var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
var hasGsap = typeof window.gsap !== 'undefined';
var isLg = function () { return window.matchMedia('(min-width: 1024px)').matches; };
var $ = function (sel, el) { return (el || doc).querySelector(sel); };
var $$ = function (sel, el) { return Array.prototype.slice.call((el || doc).querySelectorAll(sel)); };
var pad = function (n) { return (n < 10 ? '0' : '') + n; };
var CHARS = 'mbfc';
var header = $('[data-header]');
var menu = $('[data-menu]');
var menuPanel = $('[data-menu-panel]');
var menuToggle = $('[data-menu-toggle]');
var menuLabel = $('[data-menu-label]');
var menuOpen = false;
var menuTimeline = null;
var lastFocus = null;
var hooks = { onMenuOpen: null, onMenuClose: null, lock: function () {}, unlock: function () {} };
function setMenuLabel(open) {
if (!menuLabel) { return; }
menuLabel.textContent = open ? menuLabel.getAttribute('data-close') : menuLabel.getAttribute('data-open');
}
function focusables(el) {
return $$('a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])', el);
}
function trapTab(e) {
if (e.key !== 'Tab' || !menuOpen) { return; }
var items = focusables(menuPanel);
if (!items.length) { return; }
var first = items[0];
var last = items[items.length - 1];
if (e.shiftKey && (doc.activeElement === first || doc.activeElement === menuPanel)) {
e.preventDefault();
last.focus();
} else if (!e.shiftKey && doc.activeElement === last) {
e.preventDefault();
first.focus();
}
}
function openMenu() {
if (!menu || menuOpen) { return; }
menuOpen = true;
lastFocus = doc.activeElement;
menu.hidden = false;
header.classList.add('is-open');
menuToggle.setAttribute('aria-expanded', 'true');
hooks.lock();
if (hooks.onMenuOpen) { hooks.onMenuOpen(); } else { setMenuLabel(true); }
menuPanel.focus({ preventScroll: true });
}
function closeMenu() {
if (!menu || !menuOpen) { return; }
menuOpen = false;
menuToggle.setAttribute('aria-expanded', 'false');
var done = function () {
menu.hidden = true;
header.classList.remove('is-open');
hooks.unlock();
};
if (hooks.onMenuClose) { hooks.onMenuClose(done); } else { setMenuLabel(false); done(); }
if (lastFocus && lastFocus.focus) { lastFocus.focus(); }
}
if (menuToggle && menu) {
menuToggle.addEventListener('click', function () { if (menuOpen) { closeMenu(); } else { openMenu(); } });
doc.addEventListener('keydown', function (e) {
if (e.key === 'Escape' && menuOpen) { closeMenu(); }
trapTab(e);
});
doc.addEventListener('click', function (e) {
if (!menuOpen) { return; }
if (menuPanel.contains(e.target) || menuToggle.contains(e.target)) { return; }
closeMenu();
});
$$('a', menuPanel).forEach(function (a) { a.addEventListener('click', function () { closeMenu(); }); });
}
var accordionHooks = { onToggle: null };
$$('[data-accordion]').forEach(function (acc) {
var items = $$('[data-accordion-item]', acc);
items.forEach(function (item) {
var btn = $('[data-accordion-toggle]', item);
btn.addEventListener('click', function () {
var open = item.classList.contains('is-open');
items.forEach(function (other) {
if (other !== item && other.classList.contains('is-open')) {
other.classList.remove('is-open');
$('[data-accordion-toggle]', other).setAttribute('aria-expanded', 'false');
if (accordionHooks.onToggle) { accordionHooks.onToggle(other, false); }
}
});
item.classList.toggle('is-open', !open);
btn.setAttribute('aria-expanded', open ? 'false' : 'true');
if (accordionHooks.onToggle) { accordionHooks.onToggle(item, !open); }
});
});
});
var carouselHooks = { go: null };
$$('[data-carousel]').forEach(function (car) {
var slides = $$('[data-slide]', car);
var infos = $$('[data-slide-info]', car);
var tabs = $$('[data-tab]', car);
var counter = $('[data-counter]', car);
var current = 0;
var busy = false;
function show(i, instant) {
slides.forEach(function (s, k) {
var on = k === i;
s.classList.toggle('is-active', on);
s.setAttribute('aria-hidden', on ? 'false' : 'true');
if (instant) { s.style.visibility = on ? '' : 'hidden'; }
});
infos.forEach(function (s, k) { s.classList.toggle('is-active', k === i); });
tabs.forEach(function (t, k) {
t.classList.toggle('is-active', k === i);
t.setAttribute('aria-pressed', k === i ? 'true' : 'false');
});
if (counter) { counter.textContent = pad(i + 1); }
}
function go(i) {
if (busy || i === current) { return; }
var next = (i + slides.length) % slides.length;
if (carouselHooks.go) {
busy = true;
carouselHooks.go(car, slides[current], slides[next], function () { busy = false; });
show(next, false);
} else {
show(next, true);
}
current = next;
}
show(0, true);
var prev = $('[data-prev]', car);
var next = $('[data-next]', car);
if (prev) { prev.addEventListener('click', function () { go(current - 1); }); }
if (next) { next.addEventListener('click', function () { go(current + 1); }); }
tabs.forEach(function (t, k) { t.addEventListener('click', function () { go(k); }); });
car._carousel = { slides: slides, show: show };
});
$$('[data-form-tabs]').forEach(function (wrap) {
var tabs = $$('[data-form-tab]', wrap);
var form = $('[data-form]');
tabs.forEach(function (t) {
t.addEventListener('click', function () {
tabs.forEach(function (o) {
o.classList.toggle('is-active', o === t);
o.setAttribute('aria-pressed', o === t ? 'true' : 'false');
});
if (form) { form.action = form.getAttribute('data-mailto') + '?subject=' + encodeURIComponent(t.textContent.trim()); }
});
});
});
var plainBar = !hasGsap || reduced;
$$('[data-rows]').forEach(function (list) {
var bar = $('[data-rows-bar]', list);
var rows = $$('[data-row]', list);
rows.forEach(function (row, i) {
row.addEventListener('mouseenter', function () {
rows.forEach(function (r) { r.classList.toggle('is-active', r === row); });
if (bar && plainBar) { bar.style.gridRowStart = String(i + 1); bar.style.transform = 'scaleX(1.03)'; }
});
});
list.addEventListener('mouseleave', function () {
rows.forEach(function (r) { r.classList.remove('is-active'); });
if (bar && plainBar) { bar.style.transform = ''; }
});
});
if (reduced || !hasGsap) {
body.style.opacity = '';
return;
}
var gsap = window.gsap;
gsap.registerPlugin(window.ScrollTrigger, window.SplitText, window.Flip, window.ScrambleTextPlugin);
var ScrollTrigger = window.ScrollTrigger;
var SplitText = window.SplitText;
var Flip = window.Flip;
var lenis = null;
if (typeof window.Lenis !== 'undefined') {
lenis = new window.Lenis({ syncTouch: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
gsap.ticker.lagSmoothing(0);
}
hooks.lock = function () { if (lenis) { lenis.stop(); } };
hooks.unlock = function () { if (lenis) { lenis.start(); } };
var rail = $('[data-scrollbar]');
var handle = $('[data-scrollbar-handle]');
if (lenis && rail && handle && window.matchMedia('(pointer: fine)').matches) {
root.classList.add('has-scrollbar');
var handleH = 40;
var limit = 0;
var dragging = false;
var dragY = 0;
var dragScroll = 0;
var clamp = function (v) { return Math.max(0, Math.min(limit, v)); };
var sizeHandle = function () {
var vh = window.innerHeight;
limit = lenis.limit;
handleH = Math.max(vh / ((limit + vh) / vh), 40);
handle.style.height = handleH + 'px';
};
var placeHandle = function (scroll) {
var vh = window.innerHeight;
var y = limit ? scroll / limit * (vh - handleH) : 0;
handle.style.transform = 'translate3d(0, ' + y + 'px, 0)';
};
sizeHandle();
window.addEventListener('resize', function () { sizeHandle(); placeHandle(lenis.scroll); });
lenis.on('scroll', function (e) {
if (limit !== lenis.limit) { sizeHandle(); }
placeHandle(e.scroll);
rail.classList.toggle('show', dragging || Math.abs(e.velocity) > 0.1);
});
handle.addEventListener('pointerdown', function (e) {
dragging = true;
dragY = e.clientY;
dragScroll = lenis.scroll;
rail.classList.add('active', 'show');
body.style.userSelect = 'none';
handle.setPointerCapture(e.pointerId);
e.preventDefault();
});
handle.addEventListener('pointermove', function (e) {
if (!dragging) { return; }
var track = window.innerHeight - handleH;
lenis.scrollTo(clamp(dragScroll + (e.clientY - dragY) / track * limit), { immediate: true });
});
var endDrag = function () {
if (!dragging) { return; }
dragging = false;
rail.classList.remove('active');
body.style.userSelect = '';
};
handle.addEventListener('pointerup', endDrag);
handle.addEventListener('pointercancel', endDrag);
rail.addEventListener('pointerdown', function (e) {
if (e.target === handle || dragging) { return; }
var track = window.innerHeight - handleH;
lenis.scrollTo(clamp((e.clientY - handleH / 2) / track * limit));
});
}
var loaderDone = false;
var waiting = [];
function waitForLoader(fn) { if (loaderDone) { fn(); } else { waiting.push(fn); } }
function loaderComplete() {
loaderDone = true;
var fns = waiting.slice();
waiting = [];
fns.forEach(function (fn) { fn(); });
}
function colourOf(sel, prop) {
var el = $(sel);
return el ? getComputedStyle(el)[prop] : '';
}
var lastW = window.innerWidth;
var lastH = root.clientHeight;
var resizeFns = [];
var resizeTimer = null;
window.addEventListener('resize', function () {
clearTimeout(resizeTimer);
resizeTimer = setTimeout(function () {
if (window.innerWidth === lastW && root.clientHeight === lastH) { return; }
lastW = window.innerWidth;
lastH = root.clientHeight;
resizeFns.forEach(function (fn) { fn(); });
requestAnimationFrame(function () { ScrollTrigger.refresh(); });
}, 250);
});
var PRESET = {
fadeIn: { duration: 1, ease: 'power4.out', stagger: 0.1 },
fadeUp: { duration: 1, ease: 'power4.out', stagger: 0.1, y: 30 },
line: { duration: 0.6, ease: 'power4.out', stagger: 0.1 },
lineUp: { duration: 0.8, ease: 'power4.out', stagger: 0.1 },
title: { duration: 1, ease: 'power4.out' }
};
function reveal(el, build, opts) {
opts = opts || {};
var tl = gsap.timeline({ paused: true });
build(tl);
var start = opts.start || 'top 80%';
var st = ScrollTrigger.create({
trigger: opts.trigger || el,
start: start,
once: true,
onEnter: function () { waitForLoader(function () { tl.play(); }); }
});
tl.eventCallback('onComplete', function () { st.kill(); });
return tl;
}
$$('[data-reveal]').forEach(function (el) {
var kind = el.getAttribute('data-reveal') || 'fadeUp';
var p = PRESET[kind] || PRESET.fadeUp;
var delay = parseFloat(el.getAttribute('data-reveal-delay') || '0');
var targets = el.hasAttribute('data-reveal-children') ? $$(':scope > *', el) : [el];
reveal(el, function (tl) {
if (kind === 'line') {
tl.from(targets, { scaleY: 0, transformOrigin: 'top center', duration: p.duration, ease: p.ease, stagger: p.stagger, delay: delay });
} else {
tl.from(targets, { opacity: 0, y: p.y || 0, duration: p.duration, ease: p.ease, stagger: p.stagger, delay: delay });
}
});
});
var splits = [];
function splitAndReveal(el) {
var kind = el.getAttribute('data-split');
var delay = parseFloat(el.getAttribute('data-split-delay') || '0');
var start = el.getAttribute('data-split-start') || (kind === 'title' && el.closest('#hero') ? 'top 100%' : 'top 80%');
var tl = null;
var started = false;
var split = SplitText.create(el, {
type: kind === 'title' ? 'lines, words, chars' : 'lines',
mask: 'lines',
autoSplit: true,
linesClass: 'line-split',
onSplit: function (self) {
var targets = kind === 'title' ? self.chars : self.lines;
var anim = gsap.timeline({ paused: !started });
if (kind === 'title') {
anim.fromTo(targets, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: { amount: 0.2 }, ease: 'power4.out', delay: delay });
} else {
anim.fromTo(targets, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power4.out', delay: delay });
}
tl = anim;
return anim;
}
});
el.classList.add('is-split');
var st = ScrollTrigger.create({
trigger: el,
start: start,
once: true,
onEnter: function () { waitForLoader(function () { started = true; if (tl) { tl.play(); } }); }
});
splits.push({ el: el, split: split, st: st });
}
var heroTitle = $('.hero-title');
if (heroTitle && !isLg()) {
$$('[data-split]', heroTitle).forEach(function (line) { line.removeAttribute('data-split'); });
heroTitle.setAttribute('data-split', 'title');
}
if (doc.fonts && doc.fonts.ready) {
doc.fonts.ready.then(function () { $$('[data-split]').forEach(splitAndReveal); ScrollTrigger.refresh(); });
} else {
$$('[data-split]').forEach(splitAndReveal);
}
var preloader = $('[data-preloader]');
var firstLoad = false;
try { firstLoad = !(doc.referrer && doc.referrer.indexOf(location.origin + '/') === 0); } catch (e) { firstLoad = false; }
var lockup = $('[data-lockup]');
var menuBox = $('[data-menu-box]');
var langBox = $('[data-lang]');
var action = $('[data-action]');
var tools = [menuBox, langBox, action].filter(Boolean);
gsap.set(tools, { opacity: 0 });
function headerIn() {
gsap.to(menuBox, { opacity: 1, duration: 0.5, ease: 'power4.out', delay: 0.3 });
gsap.to([langBox, action], { opacity: 1, duration: 0.5, ease: 'power4.out', delay: 0.4 });
if (navIntro) { navIntro.play(0); }
}
function playPreloader() {
hooks.lock();
preloader.hidden = false;
preloader.setAttribute('aria-hidden', 'false');
preloader.setAttribute('aria-busy', 'true');
var lines = $('[data-preloader-lines]', preloader);
var h = $('.preloader-line-h', preloader);
var v = $('.preloader-line-v', preloader);
var circles = $$('[data-preloader-circle]', preloader);
var mark = $('[data-preloader-mark]', preloader);
var label = $('[data-preloader-label]', preloader);
var paper = colourOf('.surface', 'backgroundColor');
var blue = colourOf('.surface-accent', 'backgroundColor');
var t = mark.clientWidth;
var tl = gsap.timeline({
onComplete: function () {
var state = Flip.getState(preloader);
var markState = Flip.getState(mark);
var markSlot = $('.lockup-mark', lockup) || lockup;
Flip.fit(preloader, lockup, { duration: 1.33, ease: 'power4.inOut', scale: true, absolute: true, getVars: false,
onComplete: function () { preloader.hidden = true; preloader.setAttribute('aria-hidden', 'true'); } });
gsap.set(mark, { position: 'fixed', zIndex: 1600 });
Flip.fit(mark, markSlot, { duration: 1.33, ease: 'power4.inOut', absolute: true,
onComplete: function () { gsap.to(mark, { opacity: 0, duration: 0.2, onComplete: function () { mark.remove(); } }); } });
gsap.to(label, { opacity: 0, duration: 0.4 });
setTimeout(function () { hooks.unlock(); loaderComplete(); headerIn(); }, 500);
void state; void markState;
}
});
gsap.set(preloader, { backgroundColor: paper });
gsap.set([lines, mark], { force3D: true });
tl.to(preloader, { backgroundColor: blue, ease: 'power4.out', duration: 0.66 })
.to(v, { scaleY: t * 0.97 / v.offsetHeight, ease: 'power4.inOut', duration: 1 }, 0)
.to(h, { scaleX: t * 0.97 / h.offsetWidth, ease: 'power4.inOut', duration: 1 }, 0)
.to([lines, mark], { rotate: 360, ease: 'power4.inOut', duration: 1.8 }, 0)
.fromTo(circles[0], { opacity: 1, scale: 0 }, { scale: 1, ease: 'power4.inOut', duration: 1 }, 0)
.fromTo(circles[1], { opacity: 1, scale: 0 }, { scale: 1, ease: 'power4.inOut', duration: 1 }, 0.2)
.addLabel('end')
.to([lines, circles], { display: 'none', opacity: 0, duration: 0 }, 'end-=0.7')
.to(mark, { opacity: 1, rotate: 0, duration: 0 }, 'end-=0.7')
.fromTo(label, { opacity: 1, yPercent: 101 }, { yPercent: 0, ease: 'power4.out', duration: 1 }, 0.66);
}
function fadeIn() {
gsap.set(body, { opacity: 0 });
gsap.to(body, { opacity: 1, ease: 'power2.out', delay: 0.4, duration: 0.5, onComplete: function () { gsap.set(body, { clearProps: 'opacity' }); } });
setTimeout(function () { loaderComplete(); headerIn(); }, 400);
}
window.addEventListener('pageshow', function (e) {
if (e.persisted) {
if (preloader) { preloader.hidden = true; }
gsap.set(body, { clearProps: 'opacity' });
hooks.unlock();
}
});
function sameSite(a) {
var href = a.getAttribute('href') || '';
if (!href || href.charAt(0) === '#' || /^(mailto|tel):/.test(href) || a.target || a.hasAttribute('download')) { return false; }
if (a.hasAttribute('data-mbfc')) { return false; }
var url = new URL(a.href, location.href);
if (url.origin !== location.origin) { return false; }
if (url.pathname === location.pathname && url.hash) { return false; }
return true;
}
doc.addEventListener('click', function (e) {
var a = e.target.closest && e.target.closest('a[href]');
if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) { return; }
if (!sameSite(a)) { return; }
e.preventDefault();
var href = a.href;
closeMenu();
hooks.lock();
gsap.to(body, { opacity: 0, duration: 0.6, ease: 'power2.in', onComplete: function () { location.href = href; } });
});
doc.addEventListener('click', function (e) {
var a = e.target.closest && e.target.closest('a[href]');
if (!a || !lenis) { return; }
var url = new URL(a.href, location.href);
if (url.pathname !== location.pathname || !url.hash) { return; }
var target = $(url.hash);
if (!target) { return; }
e.preventDefault();
if (a.classList.contains('skip')) {
lenis.scrollTo(target, { offset: 0, immediate: true });
target.focus({ preventScroll: true });
return;
}
closeMenu();
lenis.scrollTo(target, { offset: 0 });
});
var navIntro = null;
var navLinks = $$('[data-nav-link]');
var navRules = $$('[data-nav-rule]');
var menuBtn = $('[data-menu-toggle]');
var menuSlide = null;
if (isLg() && navLinks.length) {
navIntro = gsap.timeline({ paused: true, defaults: { ease: 'power4.inOut', duration: 0.5 } });
navIntro.fromTo(navRules, { scaleY: 0, transformOrigin: 'top center' }, { scaleY: 1 }, 0);
navLinks.forEach(function (a, i) {
navIntro.fromTo(a, { scrambleText: { text: '' } }, { scrambleText: { text: a.textContent.trim() }, duration: 0.5 }, (i % 4) * 0.1);
});
if (menuBtn && body.getAttribute('data-page') !== 'home') {
menuSlide = gsap.timeline({ paused: true }).fromTo(menuBtn, { xPercent: 101 }, { xPercent: 0, duration: 0.5, ease: 'power4.inOut' });
}
var shown = false;
var onScroll = function (y) {
var past = y > 20;
if (past === shown) { return; }
shown = past;
if (past) { navIntro.reverse(); if (menuSlide) { menuSlide.play(); } } else { navIntro.play(); if (menuSlide) { menuSlide.reverse(); } }
};
if (lenis) { lenis.on('scroll', function (e) { onScroll(e.scroll); }); } else { window.addEventListener('scroll', function () { onScroll(window.scrollY); }); }
}
if (menu && menuPanel) {
var primary = $$('[data-menu-primary]', menuPanel);
var secondary = $$('[data-menu-secondary]', menuPanel);
var contacts = $$('[data-menu-contact]', menuPanel);
var titles = $$('[data-menu-title]', menuPanel);
var rules = $$('[data-menu-rule]', menuPanel);
var titleTexts = titles.map(function (t) { return t.textContent; });
var dots = $$('.menu-dot', menuPanel);
gsap.set(menuPanel, { xPercent: 101 });
gsap.set(primary.concat(secondary, contacts), { yPercent: 100 });
gsap.set(rules, { scaleX: 0, transformOrigin: 'left center' });
gsap.set(dots, { scale: 0 });
hooks.onMenuOpen = function () {
if (menuTimeline) { menuTimeline.kill(); }
gsap.to(menuLabel, { scrambleText: { text: menuLabel.getAttribute('data-close'), speed: 0.5, chars: CHARS }, duration: 0.4 });
var n = 1;
var m = 'power4.out';
menuTimeline = gsap.timeline();
menuTimeline.to(menuPanel, { xPercent: 0, duration: n, ease: 'power4.inOut' }, 0)
.to(primary, { yPercent: 0, duration: n * 0.3, ease: m, stagger: { amount: n * 0.2 } }, n * 0.5)
.to(secondary, { yPercent: 0, duration: n * 0.5, ease: m }, '<50%')
.to(contacts, { yPercent: 0, duration: n * 0.5, ease: m }, '<15%')
.to(titles[0], { duration: n * 0.5, scrambleText: { text: titleTexts[0], speed: 0.1 } }, n * 0.6)
.to(titles[1], { duration: n * 0.6, scrambleText: { text: titleTexts[1], speed: 0.1 } }, n * 0.7)
.to(rules, { scaleX: 1, transformOrigin: 'left', duration: n * 0.4, ease: m, stagger: { amount: n * 0.2 } }, n * 0.5);
};
hooks.onMenuClose = function (done) {
if (menuTimeline) { menuTimeline.kill(); }
gsap.to(menuLabel, { scrambleText: { text: menuLabel.getAttribute('data-open'), speed: 0.5, chars: CHARS }, duration: 0.4 });
var n = 1;
var m = 'power4.out';
menuTimeline = gsap.timeline({ onComplete: done });
menuTimeline.to(menuPanel, { xPercent: 101, duration: n, ease: m }, 0)
.to(primary, { yPercent: 100, duration: n * 0.9, ease: m, stagger: { amount: n * 0.1 } }, 0)
.to(titles[0], { scrambleText: { text: '' }, duration: n * 0.7 }, 0)
.to(secondary, { yPercent: 100, duration: n * 0.5 }, 0)
.to(titles[1], { scrambleText: { text: '' }, duration: n * 0.6 }, n * 0.4)
.to(contacts, { yPercent: 100, duration: n * 0.5, stagger: { amount: n * 0.1 } }, n * 0.4)
.to(rules, { scaleX: 0, transformOrigin: 'left', duration: n * 0.4, stagger: { amount: n * 0.4 } }, n * 0.2);
};
primary.forEach(function (wrap) {
var link = $('.menu-link', wrap);
var dot = $('.menu-dot', wrap);
if (link.getAttribute('aria-current') === 'page') { gsap.set(link, { opacity: 0.5, x: 12 }); gsap.set(dot, { scale: 1 }); return; }
link.addEventListener('mouseenter', function () { gsap.to(link, { opacity: 0.5, x: 12, duration: 0.3, ease: 'power4.inOut', overwrite: true }); gsap.to(dot, { scale: 1, duration: 0.3 }); });
link.addEventListener('mouseleave', function () { gsap.to(link, { opacity: 1, x: 0, duration: 0.3, ease: 'power4.inOut', overwrite: true }); gsap.to(dot, { scale: 0, duration: 0.3 }); });
});
secondary.concat(contacts).forEach(function (el) {
var text = el.textContent;
if (el.tagName !== 'A') { return; }
el.addEventListener('mouseenter', function () { gsap.to(el, { scrambleText: { text: text, speed: text.length * 0.1, chars: CHARS }, duration: 0.5 }); });
});
}
$$('[data-type], .label-row > span').forEach(function (el) {
var text = el.textContent;
if (!text.trim() || el.children.length) { return; }
var bottom = !!el.closest('footer');
var tl = reveal(el, function (tl) {
tl.fromTo(el, { scrambleText: { text: '_' } }, { scrambleText: { text: text, speed: 2, chars: CHARS }, duration: 2 });
}, { start: bottom ? 'top bottom' : 'top 80%' });
(el.closest('a, button') || el).addEventListener('focus', function () { tl.progress(1); });
});
navLinks.concat($$('footer a')).forEach(function (a) {
var text = a.textContent.trim();
a.addEventListener('mouseenter', function () { gsap.to(a, { scrambleText: { text: text, speed: 1, chars: CHARS }, duration: 0.5, ease: 'power4.inOut' }); });
});
var heroLines = $$('[data-hero-line]');
if (heroLines.length) {
reveal(heroLines[0], function (tl) {
tl.from(heroLines, { scaleY: 0, transformOrigin: 'top center', duration: 0.6, stagger: 0.1, ease: 'power4.out', delay: 0.3 });
}, { start: 'top 100%', trigger: $('#hero') });
}
$$('[data-drift]').forEach(function (wrap) {
var img = $('img', wrap);
if (!img || !window.matchMedia('(hover: hover)').matches) { return; }
var tx = 0, ty = 0, cx = 0, cy = 0;
gsap.set(img, { scale: 1.06 });
wrap.addEventListener('pointermove', function (e) {
var r = wrap.getBoundingClientRect();
tx = ((e.clientX - r.left) / r.width - 0.5) * 0.04 * r.width;
ty = ((e.clientY - r.top) / r.height - 0.5) * 0.04 * r.height;
});
wrap.addEventListener('pointerleave', function () { tx = 0; ty = 0; });
gsap.ticker.add(function () {
cx += (tx - cx) * 0.1;
cy += (ty - cy) * 0.1;
gsap.set(img, { x: cx, y: cy });
});
});
$$('[data-stairs]').forEach(function (stairs) {
gsap.from($$('.stair', stairs), {
scaleX: 0,
transformOrigin: 'left',
stagger: { each: 0.1, from: 'end', ease: 'power2.inOut' },
scrollTrigger: { trigger: stairs, start: 'bottom bottom', end: 'bottom 30%', scrub: true }
});
});
accordionHooks.onToggle = function (item, open) {
var inner = $('[data-accordion-body]', item);
if (open && inner) { gsap.fromTo(inner, { opacity: 0 }, { opacity: 1, ease: 'power4.inOut', delay: 0.2, duration: 0.6 }); }
setTimeout(function () { ScrollTrigger.refresh(); }, 150);
};
$$('[data-accordion-item]').forEach(function (item) {
var icon = $('[data-accordion-icon]', item);
var btn = $('[data-accordion-toggle]', item);
btn.addEventListener('mouseenter', function () { if (!item.classList.contains('is-open')) { gsap.to(icon, { rotate: 90, duration: 0.3, ease: 'power4.inOut', overwrite: true }); } });
btn.addEventListener('mouseleave', function () { if (!item.classList.contains('is-open')) { gsap.to(icon, { rotate: 0, duration: 0.3, ease: 'power4.inOut', overwrite: true }); } });
btn.addEventListener('click', function () { gsap.set(icon, { clearProps: 'rotate' }); });
});
$$('[data-cards]').forEach(function (section) {
var cards = $$('[data-card]', section);
var tween = null;
var build = function () {
if (tween) { tween.kill(); gsap.set(cards, { clearProps: 'all' }); }
var lg = isLg();
tween = gsap.from(cards, {
x: function (i) { return (i + 1) * (lg ? 150 : 75); },
y: function (i) { return (i + 1) * (lg ? 200 : 100); },
rotate: function (i) { return gsap.utils.wrap([-1, 1], i) * gsap.utils.random(10, 25); },
stagger: { each: 0.1, ease: 'power2.out' },
scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom ' + (lg ? '50%' : 'bottom'), scrub: true }
});
};
build();
resizeFns.push(build);
});
$$('[data-cases]').forEach(function (container) {
var cards = $$('[data-case]', container);
var tweens = [];
var build = function () {
tweens.forEach(function (t) { t.kill(); });
tweens = [];
gsap.set(cards, { clearProps: 'y' });
if (!isLg()) { return; }
var top = 30, half = 15;
cards.forEach(function (card, i) {
var odd = i % 2 === 1;
var v = odd ? gsap.utils.random(0, half) : gsap.utils.random(half, top);
var d = gsap.utils.random(10, 15);
var h = odd ? Math.min(v + d, top) : Math.max(v - d, 0);
tweens.push(gsap.fromTo(card, { y: v + 'vh' }, { y: h + 'vh', ease: 'none', scrollTrigger: { trigger: container, start: 'top bottom', end: 'bottom top', scrub: true } }));
});
};
build();
resizeFns.push(build);
});
$$('[data-tiles-grid]').forEach(function (grid) {
var tiles = $$('.span-1[data-tile-parallax]', grid);
var tweens = [];
var build = function () {
tweens.forEach(function (t) { t.kill(); });
tweens = [];
gsap.set(tiles, { clearProps: 'y' });
if (!isLg()) { return; }
tiles.forEach(function (tile, i) {
var g = grid.getBoundingClientRect().bottom - tile.getBoundingClientRect().bottom;
var even = i % 2 === 0;
tweens.push(gsap.fromTo(tile, { y: even ? g : 0 }, { y: even ? 0 : g, ease: 'none', scrollTrigger: { trigger: grid, start: 'top bottom', end: 'bottom top', scrub: true } }));
});
};
build();
resizeFns.push(build);
});
$$('[data-rows]').forEach(function (list) {
var bar = $('[data-rows-bar]', list);
var rows = $$('[data-row]', list);
if (!bar) { return; }
var timer = null;
var placed = false;
gsap.set(bar, { scaleX: 1.03, scaleY: 0, transformOrigin: 'top center' });
if (isLg()) {
rows.forEach(function (row) {
var btn = $('.offer-row-button', row);
if (!btn) { return; }
gsap.set(btn, { opacity: 0 });
row.addEventListener('mouseenter', function () { gsap.to(btn, { opacity: 1, duration: 0.2 }); });
row.addEventListener('mouseleave', function () { gsap.to(btn, { opacity: 0, duration: 0.2 }); });
btn.addEventListener('focus', function () { gsap.set(btn, { opacity: 1 }); });
});
}
rows.forEach(function (row, i) {
row.addEventListener('mouseenter', function () {
clearTimeout(timer);
var state = placed ? Flip.getState(bar) : null;
gsap.set(bar, { gridRowStart: i + 1, scaleY: 1, transformOrigin: 'top center' });
if (state) { Flip.from(state, { duration: 0.3, ease: 'power1.inOut', scale: true }); } else { gsap.fromTo(bar, { scaleY: 0 }, { scaleY: 1, duration: 0.3, ease: 'power1.inOut' }); }
placed = true;
});
});
list.addEventListener('mouseleave', function () {
timer = setTimeout(function () {
var state = Flip.getState(bar);
gsap.set(bar, { scaleY: 0 });
Flip.from(state, { duration: 0.3, ease: 'power1.inOut', scale: true });
placed = false;
}, 200);
});
});
$$('[data-carousel]').forEach(function (car) {
var slides = car._carousel.slides;
var timelines = [];
function build() {
timelines.forEach(function (t) { t.kill(); });
timelines = slides.map(function (slide) {
var text = $('[data-slide-text]', slide);
var split = SplitText.create(text, { type: 'lines', mask: 'lines', linesClass: 'line-split' });
var tl = gsap.timeline({ paused: true });
tl.fromTo(split.lines, { yPercent: 100, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, stagger: 0.05 });
return tl;
});
}
build();
slides.forEach(function (s, k) { s.style.visibility = k === 0 ? '' : 'hidden'; });
ScrollTrigger.create({ trigger: car, start: 'top 50%', onEnter: function (self) { waitForLoader(function () { timelines[0].play(); }); self.kill(); } });
var hoverTimelines = {};
$$('.ctl', car).forEach(function (btn) {
var fill = $('.ctl-fill', btn);
var arrow = $('.ctl-arrow', fill) || null;
var isPrev = btn.hasAttribute('data-prev');
if (!arrow) {
arrow = $('.ctl-arrow', btn).cloneNode(true);
fill.appendChild(arrow);
}
var r = 0.5;
gsap.set(fill, { scale: 0 });
var offset = function () { return isLg() ? { yPercent: isPrev ? -100 : 100 } : { xPercent: isPrev ? -100 : 100 }; };
gsap.set(arrow, offset());
btn.addEventListener('mouseenter', function () {
gsap.set(fill, { transformOrigin: isLg() ? (isPrev ? 'bottom center' : 'top center') : (isPrev ? 'left center' : 'right center') });
hoverTimelines[isPrev] = gsap.timeline({ defaults: { ease: 'power4.out' } })
.to(fill, { scale: 1, duration: r })
.to(arrow, { xPercent: 0, yPercent: 0, duration: r * 0.8 }, r * 0.2);
});
btn.addEventListener('mouseleave', function () {
gsap.timeline({ defaults: { ease: 'power4.out' } })
.to(fill, { scale: 0, duration: r })
.to(arrow, Object.assign({ duration: r * 0.8 }, offset()), 0);
});
});
carouselHooks.go = function (c, from, to, done) {
if (c !== car) { return; }
var i = slides.indexOf(from);
var j = slides.indexOf(to);
timelines[i].reverse().then(function () {
from.style.visibility = 'hidden';
to.style.visibility = '';
timelines[j].play().then(done);
});
};
resizeFns.push(function () {
build();
var active = slides.findIndex(function (s) { return s.classList.contains('is-active'); });
timelines[active < 0 ? 0 : active].progress(1);
});
});
$$('[data-tiles]').forEach(function (section) {
var tiles = $$('[data-tile]', section);
var fill = $('[data-tile-fill]', section);
var corner = $('[data-tile-corner]', section);
var arrow = $('[data-tile-arrow]', section);
if (!fill) { return; }
var m = 0.5, p = 'power4.out';
var shown = false;
var pulsing = false;
gsap.set([corner, arrow], { scale: 0 });
tiles.forEach(function (tile) {
tile.addEventListener('mouseenter', function () {
if (fill.parentNode !== tile) {
var state = Flip.getState(fill);
tile.insertBefore(fill, tile.firstChild);
Flip.from(state, { duration: m, absolute: true, ease: p });
}
if (!shown) {
shown = true;
gsap.timeline().to(corner, { scale: 1, ease: p, duration: 0.5 }).to(arrow, { scale: 1, ease: p, duration: 0.4 }, 0.1);
} else if (!pulsing) {
pulsing = true;
gsap.to(arrow, { keyframes: { scale: [1, 0, 1] }, duration: 0.5, ease: p, onComplete: function () { pulsing = false; } });
}
});
});
section.addEventListener('mouseleave', function () {
shown = false;
gsap.timeline().to(corner, { scale: 0, duration: 0.5, ease: p }).to(arrow, { scale: 0, duration: 0.4, ease: p }, 0);
});
});
$$('[data-bracket]').forEach(function (link) {
var inner = $('.bracket-inner', link);
var text = $('.bracket-text', link);
var arrow2 = $('.icon-arrow', inner);
if (!inner || !text || !arrow2) { return; }
var arrow1 = arrow2.cloneNode(true);
arrow1.classList.add('is-parked');
inner.insertBefore(arrow1, text);
gsap.set(arrow1, { xPercent: -100 });
var label = text.textContent;
link.addEventListener('mouseenter', function () {
var state = Flip.getState(text);
text.style.gridColumn = '2';
Flip.from(state, { duration: 0.5, ease: 'power4.out', scale: true });
gsap.to(arrow1, { xPercent: 0, duration: 0.5, ease: 'power4.out' });
gsap.to(arrow2, { xPercent: 100, duration: 0.5, ease: 'power4.out' });
gsap.to(text, { scrambleText: { text: label, speed: 1, chars: CHARS }, duration: 0.5, ease: 'power4.inOut' });
});
link.addEventListener('mouseleave', function () {
var state = Flip.getState(text);
text.style.gridColumn = '1';
Flip.from(state, { duration: 0.5, ease: 'power4.out', scale: true });
gsap.to(arrow1, { xPercent: -100, duration: 0.5, ease: 'power4.out' });
gsap.to(arrow2, { xPercent: 0, duration: 0.5, ease: 'power4.out' });
});
});
if (body.getAttribute('data-page') === 'contact' && header) {
var content = $('[data-contact]');
if (content) {
ScrollTrigger.create({
trigger: content,
start: 'top top',
onEnter: function () { header.classList.replace('surface-accent', 'surface'); },
onLeaveBack: function () { header.classList.replace('surface', 'surface-accent'); }
});
}
}
if (preloader && firstLoad) {
playPreloader();
} else {
if (preloader) { preloader.hidden = true; }
fadeIn();
}
ScrollTrigger.refresh();
})();
