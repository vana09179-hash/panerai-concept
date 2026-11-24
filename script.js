/* =========================================================
   PANERAI — слайдер + раскрытие карточки + видео-модалка
   Анимации: GSAP 3
   Чтобы добавить часы — добавь объект в массив SLIDES.
   ========================================================= */

const SLIDES = [
  {
    color: '#666A40',
    L: 82.5,            // где начинается цветная панель (% ширины)
    T: 53.55,           // где начинается текстовый блок (%)
    title: ['Submersible', 'Automatic'],
    sub: '42MM Carbotech™',
    campaign: ['Official', 'Campaign'],
    ref: 'PAM01561 Special Edition',
    desc: 'Please note that images are stock photographs and that colors and sizes may not exactly correspond to actual products',
    discover: 'Discover Submersible',
    hero: 'assets/submersible-hero.jpg',
    // фото «анфас» в цветной панели
    front: { src: 'assets/submersible-hero.jpg', mode: 'blend', h: 560, ratio: 1280 / 1080, wx: 0.19, wc: 0.53, cy: 0.56 },
    peek: 170,          // сколько макетных px от края панели до часов
    dTitle: ['Submersible', 'Carbotech™'],
    dSize: '42MM',
    price: '£9,900',
    video: 'assets/video-campaign.mp4',
  },
  {
    color: '#4897CE',
    L: 71.9,
    T: 45.86,
    title: ['Luminor Marina', 'Carbotech™'],
    sub: '44MM',
    campaign: ['Made to Rule', 'the Darkness'],
    ref: 'PAM01661 Special Edition',
    desc: 'Please note that images are stock photographs and that colors and sizes may not exactly correspond to actual products',
    discover: 'Discover Luminor',
    hero: 'assets/luminor-hero.jpg',
    front: { src: 'assets/luminor-front.jpg', mode: 'soft', h: 600, ratio: 720 / 1200, wx: 0.14, wc: 0.5, cy: 0.5 },
    peek: 270,
    dTitle: ['Luminor Marina', 'Carbotech™'],
    dSize: '44MM',
    price: '£10,800',
    video: 'assets/video-darkness.mp4',
  },
];

/* ---------- helpers ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app'), stage = $('#stage'), slidesWrap = $('#slides');
const detail = $('#detail'), aside = $('#aside');
const mqMobile = matchMedia('(max-width: 760px) and (orientation: portrait)');
const isMobile = () => mqMobile.matches;
const U = () => isMobile() ? innerWidth / 420 : Math.min(innerWidth / 1352, innerHeight / 760);
const SPLIT = () => isMobile() ? 1 : 0.645;

const clip = {
  peek: s => isMobile() ? 'inset(0% 0% 0% 100%)' : `inset(0% 0% 0% ${s.L}%)`,
  hidden: () => 'inset(0% 0% 0% 100%)',
  full: () => 'inset(0% 0% 0% 0%)',
  detail: () => isMobile() ? 'inset(0% 0% 0% 0%)' : 'inset(0% 35.5% 0% 0%)',
  wipeFrom: dir => isMobile() ? 'inset(0% 0% 0% 100%)'
    : dir > 0 ? 'inset(0% 35.5% 0% 64.5%)' : 'inset(0% 100% 0% 0%)',
};

let current = 0;
let mode = 'slider';   // slider | detail
let busy = false;

/* ---------- render slides ---------- */
const lines = arr => arr.map(t => `<span class="line"><span>${t}</span></span>`).join('');
const chev = '<svg viewBox="0 0 12 20"><path d="M10 2 2 10l8 8"/></svg>';

SLIDES.forEach((s, i) => {
  const el = document.createElement('section');
  el.className = 'slide';
  el.style.setProperty('--c', s.color);
  el.style.setProperty('--L', s.L + '%');
  el.style.setProperty('--T', s.T + '%');
  el.innerHTML = `
    <div class="hero"><img src="${s.hero}" alt=""></div>
    <div class="panel" data-cursor="fill">
      <div class="front ${s.front.mode}"><img src="${s.front.src}" alt="${s.title.join(' ')}"><span class="shadow"></span></div>
      <span class="panel-chev" style="left:calc(${s.L}% + 131 * var(--u))">${chev}</span>
    </div>
    <div class="info">
      <h1 class="title">${lines(s.title)}</h1>
      <div class="sub">${lines([s.sub])}</div>
      <div class="hr"></div>
      <button class="campaign" data-play data-cursor="fill">
        <span class="ring"><svg viewBox="0 0 24 24"><path d="M9 7v10l8-5-8-5Z"/></svg></span>
        <span><span class="c-title">${s.campaign.join('<br>')}</span><span class="c-sub" style="display:block">Watch video</span></span>
      </button>
      <div class="hr"></div>
      <div class="ref" data-cursor="pill">${s.ref}</div>
      <p class="desc">${s.desc}</p>
      <a href="#" class="discover" data-open data-cursor="pill">${s.discover}
        <span class="line-arrow"><span class="stem"></span><span class="head"></span><span class="circ"></span></span>
      </a>
    </div>
    <div class="s-nav">
      <button class="arr prev" data-dir="-1" aria-label="Previous" data-cursor="dot"><svg viewBox="0 0 12 20"><path d="M10 2 2 10l8 8"/></svg></button>
      <span class="sep"></span>
      <button class="arr next" data-dir="1" aria-label="Next" data-cursor="dot"><svg viewBox="0 0 12 20"><path d="m2 2 8 8-8 8"/></svg></button>
    </div>`;
  slidesWrap.appendChild(el);
  s.el = el;
  s.hero$ = $('.hero', el);
  s.panel = $('.panel', el);
  s.front$ = $('.front', el);
  s.chev = $('.panel-chev', el);
  s.info = $('.info', el);
  s.nav = $('.s-nav', el);
  s.words = $$('.title .line > span, .sub .line > span', el);
  s.hrs = $$('.hr', el);
  s.rest = $$('.campaign, .ref, .desc, .discover', el);
});

const dotsWrap = $('#dots');
dotsWrap.innerHTML = SLIDES.map((_, i) => `<button class="dot" data-i="${i}" aria-label="Slide ${i + 1}" data-cursor="dot"><i></i></button>`).join('');
const setDots = i => $$('.dot', dotsWrap).forEach((d, k) => d.classList.toggle('is-active', k === i));

/* ---------- позиции фото в панели ---------- */
function frontBox(s, state) {
  const W = stage.clientWidth, H = stage.clientHeight, u = U(), f = s.front;
  const h = isMobile() ? H * 0.46 : f.h * u;
  const w = h * f.ratio;
  let left, top = (isMobile() ? H * 0.27 : 302 * u) - f.cy * h;
  if (state === 'peek') left = (s.L / 100) * W + s.peek * u - f.wx * w;
  else if (state === 'full') left = W / 2 - f.wc * w;
  else left = (W * SPLIT()) / 2 - f.wc * w;
  return { left, top, height: h, width: w };
}

function layout() {
  SLIDES.forEach((s, i) => {
    const state = mode === 'detail' && i === current ? 'detail' : 'peek';
    gsap.set(s.front$, frontBox(s, state));
    gsap.set(s.panel, { clipPath: state === 'detail' ? clip.detail() : clip.peek(s) });
  });
}

/* ---------- состояние «по умолчанию» для слайда ---------- */
function resetSlide(s) {
  gsap.set(s.el, { xPercent: 0, zIndex: 0 });
  gsap.set(s.hero$, { xPercent: 0, opacity: 1, scale: 1 });
  gsap.set(s.info, { x: 0, opacity: 1 });
  gsap.set(s.words, { yPercent: 0 });
  gsap.set(s.hrs, { scaleX: 1 });
  gsap.set(s.rest, { opacity: 1, y: 0 });
  gsap.set([s.nav, s.chev], { opacity: 1, x: 0 });
  gsap.set(s.front$, { ...frontBox(s, 'peek'), x: 0, opacity: 1, scale: 1, rotationY: 0 });
  gsap.set(s.panel, { clipPath: clip.peek(s) });
}

/* =========================================================
   1. INTRO
   ========================================================= */
function intro() {
  const s = SLIDES[current];
  SLIDES.forEach(resetSlide);
  s.el.classList.add('is-active');
  setDots(current);
  const u = U();

  gsap.set(s.panel, { clipPath: clip.hidden() });
  gsap.set(s.words, { yPercent: 110 });
  gsap.set(s.hrs, { scaleX: 0 });
  gsap.set(s.rest, { opacity: 0, y: 20 * u });
  gsap.set(s.hero$, { opacity: 0, scale: 1.12 });
  gsap.set(s.front$, { x: 140 * u });
  gsap.set([s.nav, s.chev, '.share-btn', '.dots', '.chat-btn'], { opacity: 0 });

  gsap.timeline({ defaults: { ease: 'power4.out' } })
    .from('.header', { yPercent: -100, duration: 1 })
    .from('.logo, .nav a, .header-icons > *', { opacity: 0, y: -12, stagger: 0.04, duration: 0.8 }, 0.3)
    .to(s.hero$, { opacity: 1, scale: 1, duration: 2, ease: 'power3.out' }, 0.3)
    .to(s.panel, { clipPath: clip.peek(s), duration: 1.3, ease: 'power3.inOut' }, 0.5)
    .to(s.front$, { x: 0, duration: 1.6 }, 0.8)
    .to(s.words, { yPercent: 0, stagger: 0.09, duration: 1.2 }, 0.9)
    .to(s.hrs, { scaleX: 1, duration: 1.2, stagger: 0.1, ease: 'power3.inOut' }, 1.1)
    .to(s.rest, { opacity: 1, y: 0, stagger: 0.08, duration: 1 }, 1.2)
    .to([s.nav, s.chev, '.share-btn', '.dots', '.chat-btn'], { opacity: 1, duration: 0.8, stagger: 0.05 }, 1.4);
}

/* =========================================================
   2. СМЕНА СЛАЙДА (слайдер)
   ========================================================= */
function goTo(index, dir) {
  if (busy || mode !== 'slider') return;
  index = (index + SLIDES.length) % SLIDES.length;
  if (index === current) return;
  dir = dir || (index > current ? 1 : -1);
  busy = true;

  const u = U();
  const cur = SLIDES[current], nxt = SLIDES[index];
  resetSlide(nxt);
  nxt.el.classList.add('is-active');
  gsap.set(nxt.el, { xPercent: 100 * dir, zIndex: 2 });
  gsap.set(cur.el, { zIndex: 1 });
  gsap.set(nxt.panel, { clipPath: clip.hidden() });
  gsap.set(nxt.hero$, { xPercent: 30 * dir });
  gsap.set(nxt.info, { x: 220 * u * dir });
  gsap.set(nxt.words, { yPercent: 110 });
  gsap.set(nxt.hrs, { scaleX: 0 });
  gsap.set(nxt.rest, { opacity: 0, y: 16 * u });
  gsap.set(nxt.front$, { x: 160 * u });
  gsap.set([nxt.nav, nxt.chev], { opacity: 0 });
  setDots(index);

  gsap.timeline({
    onComplete() {
      cur.el.classList.remove('is-active');
      resetSlide(cur);
      current = index;
      busy = false;
    },
  })
    // старый слайд уезжает целиком вместе со своей панелью
    .to(cur.el, { xPercent: -100 * dir, duration: 1.25, ease: 'power3.inOut' }, 0)
    .to(cur.hero$, { xPercent: -25 * dir, duration: 1.25, ease: 'power3.inOut' }, 0)
    .to(cur.info, { x: -120 * u * dir, duration: 1.25, ease: 'power3.inOut' }, 0)
    // новый — заезжает, внутренние слои с параллаксом
    .to(nxt.el, { xPercent: 0, duration: 1.25, ease: 'power3.inOut' }, 0)
    .to(nxt.hero$, { xPercent: 0, duration: 1.6, ease: 'power3.out' }, 0.15)
    .to(nxt.info, { x: 0, duration: 1.7, ease: 'power4.out' }, 0.3)
    .to(nxt.words, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: 'power4.out' }, 0.45)
    .to(nxt.hrs, { scaleX: 1, duration: 1.1, stagger: 0.1, ease: 'power3.inOut' }, 0.6)
    .to(nxt.rest, { opacity: 1, y: 0, duration: 0.9, stagger: 0.07, ease: 'power3.out' }, 0.75)
    // цветная панель «выдвигается» справа уже после приезда слайда
    .to(nxt.panel, { clipPath: clip.peek(nxt), duration: 1.2, ease: 'power3.inOut' }, 0.75)
    .to(nxt.front$, { x: 0, duration: 1.5, ease: 'power4.out' }, 0.95)
    .to([nxt.nav, nxt.chev], { opacity: 1, duration: 0.6 }, 1.3);
}

/* =========================================================
   3. РАСКРЫТИЕ КАРТОЧКИ ТОВАРА
   ========================================================= */
const dControls = $$('.d-back, .d-tools, .d-play, .d-nav, .d-theme', detail);
const asideItems = () => $$('[data-a]', aside);

function fillAside(s) {
  $('.a-title', aside).innerHTML = s.dTitle.join('<br>');
  $('.a-size', aside).textContent = s.dSize;
  $('.a-ref', aside).textContent = s.ref;
  $('.price b', aside).textContent = s.price;
  detail.style.setProperty('--accent', s.color);
  $('#wishBtn').classList.toggle('on', !!s.wished);
}

function openDetail() {
  if (busy || mode !== 'slider') return;
  busy = true; mode = 'detail';
  const s = SLIDES[current], u = U();
  fillAside(s);
  app.classList.add('is-detail');
  gsap.killTweensOf(s.front$);

  gsap.set(aside, { autoAlpha: 1, xPercent: 100 });
  gsap.set(asideItems(), { opacity: 0, y: 24 * u });
  gsap.set(dControls, { autoAlpha: 0, y: 14 * u });

  gsap.timeline({ onComplete() { busy = false; detail.classList.add('is-open'); } })
    // текст и стрелки уходят
    .to(s.info, { x: -70 * u, opacity: 0, duration: 0.6, ease: 'power3.in' }, 0)
    .to([s.nav, s.chev], { opacity: 0, duration: 0.3 }, 0)
    // панель заливает весь экран, часы едут в центр
    .to(s.panel, { clipPath: clip.full(), duration: 1.1, ease: 'power3.inOut' }, 0.05)
    .to(s.hero$, { xPercent: -18, opacity: 0.3, duration: 1.1, ease: 'power3.inOut' }, 0.05)
    .to(s.front$, { ...frontBox(s, 'full'), x: 0, duration: 1.1, ease: 'power3.inOut' }, 0.05)
    // справа въезжает белая колонка, синяя зона сужается
    .to(s.panel, { clipPath: clip.detail(), duration: 1, ease: 'power3.inOut' }, 1.05)
    .to(aside, { xPercent: 0, duration: 1, ease: 'power3.inOut' }, 1.05)
    .to(s.front$, { ...frontBox(s, 'detail'), duration: 1, ease: 'power3.inOut' }, 1.05)
    // контент колонки и инструменты
    .to(asideItems(), { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out' }, 1.55)
    .to(dControls, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06, ease: 'power3.out' }, 1.6);
}

function closeDetail() {
  if (busy || mode !== 'detail') return;
  busy = true;
  const s = SLIDES[current], u = U();
  detail.classList.remove('is-open');
  resetTools(s);

  gsap.timeline({
    onComplete() {
      mode = 'slider'; busy = false;
      app.classList.remove('is-detail');
      gsap.set(aside, { autoAlpha: 0 });
    },
  })
    .to(dControls, { autoAlpha: 0, y: 10 * u, duration: 0.35, stagger: 0.03 }, 0)
    .to(asideItems(), { opacity: 0, y: -14 * u, duration: 0.35, stagger: 0.02 }, 0)
    .to(aside, { xPercent: 100, duration: 1, ease: 'power3.inOut' }, 0.2)
    // 1) белая колонка уезжает, синяя зона снова на весь экран
    .to(s.panel, { clipPath: clip.full(), duration: 1, ease: 'power3.inOut' }, 0.2)
    .to(s.front$, { ...frontBox(s, 'full'), duration: 1, ease: 'power3.inOut' }, 0.2)
    // 2) синяя панель «уползает» вправо, открывая слайд
    .to(s.panel, { clipPath: clip.peek(s), duration: 1.2, ease: 'power3.inOut' }, 1.05)
    .to(s.front$, { ...frontBox(s, 'peek'), x: 0, opacity: 1, duration: 1.2, ease: 'power3.inOut' }, 1.05)
    .to(s.hero$, { xPercent: 0, opacity: 1, duration: 1.3, ease: 'power3.inOut' }, 1)
    .fromTo(s.info, { x: 90 * u }, { x: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }, 1.45)
    .fromTo(s.words, { yPercent: 110 }, { yPercent: 0, duration: 1, stagger: 0.07, ease: 'power4.out' }, 1.5)
    .to([s.nav, s.chev], { opacity: 1, duration: 0.6 }, 1.9);
}

/* смена часов прямо в режиме карточки */
function detailSwitch(dir) {
  if (busy || mode !== 'detail') return;
  busy = true;
  const u = U();
  const cur = SLIDES[current];
  const index = (current + dir + SLIDES.length) % SLIDES.length;
  const nxt = SLIDES[index];
  resetTools(cur);

  resetSlide(nxt);
  nxt.el.classList.add('is-active');
  gsap.set(nxt.el, { zIndex: 2 });
  gsap.set(cur.el, { zIndex: 1 });
  gsap.set(nxt.info, { opacity: 0 });
  gsap.set(nxt.hero$, { opacity: 0 });
  gsap.set([nxt.nav, nxt.chev], { opacity: 0 });
  gsap.set(nxt.panel, { clipPath: clip.wipeFrom(dir) });
  gsap.set(nxt.front$, { ...frontBox(nxt, 'detail'), x: 120 * u * dir, opacity: 0 });
  setDots(index);

  gsap.timeline({
    onComplete() {
      cur.el.classList.remove('is-active');
      resetSlide(cur);
      current = index; busy = false;
    },
  })
    .to(asideItems(), { opacity: 0, y: -16 * u, duration: 0.4, stagger: 0.03, ease: 'power2.in' }, 0)
    .to(cur.front$, { x: -120 * u * dir, opacity: 0, duration: 0.7, ease: 'power3.in' }, 0)
    .to(nxt.panel, { clipPath: clip.detail(), duration: 1.1, ease: 'power3.inOut' }, 0.15)
    .add(() => fillAside(nxt), 0.5)
    .to(nxt.front$, { x: 0, opacity: 1, duration: 1.2, ease: 'power4.out' }, 0.6)
    .fromTo(asideItems(), { y: 24 * u }, { opacity: 1, y: 0, duration: 0.8, stagger: 0.05, ease: 'power3.out' }, 0.6);
}

/* ---------- инструменты слева ---------- */
let zoomed = false;
function resetTools(s) {
  zoomed = false;
  $$('.d-tools button').forEach(b => b.classList.remove('on'));
  gsap.to(s.front$, { scale: 1, rotationY: 0, duration: 0.6, ease: 'power3.out' });
}
$$('.d-tools button').forEach(b => b.addEventListener('click', () => {
  const s = SLIDES[current];
  const t = b.dataset.tool;
  if (t === 'full') {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  }
  if (t === 'zoom') {
    zoomed = !zoomed;
    b.classList.toggle('on', zoomed);
    gsap.to(s.front$, { scale: zoomed ? 1.55 : 1, duration: 0.9, ease: 'power3.inOut' });
  }
  if (t === 'rotate') {
    gsap.to(s.front$, { rotationY: '+=360', transformPerspective: 1400, duration: 1.6, ease: 'power3.inOut' });
  }
}));
// при зуме — «лупа» следует за мышью
stage.addEventListener('mousemove', e => {
  if (!zoomed || mode !== 'detail') return;
  const s = SLIDES[current], r = s.front$.getBoundingClientRect();
  const ox = gsap.utils.clamp(0, 100, ((e.clientX - r.left) / r.width) * 100);
  const oy = gsap.utils.clamp(0, 100, ((e.clientY - r.top) / r.height) * 100);
  gsap.to(s.front$, { transformOrigin: `${ox}% ${oy}%`, duration: 0.6, ease: 'power2.out' });
});

/* ---------- тема ---------- */
$('#themeSwitch').addEventListener('click', () => app.classList.toggle('is-dark'));

/* ---------- wishlist / bag / share ---------- */
const toast = (t) => {
  const el = $('#toast'); el.textContent = t; el.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800);
};
$('#wishBtn').addEventListener('click', e => {
  const s = SLIDES[current]; s.wished = !s.wished;
  e.currentTarget.classList.toggle('on', s.wished);
  gsap.fromTo($('svg', e.currentTarget), { scale: 0.6 }, { scale: s.wished ? 1.15 : 1, duration: 0.6, ease: 'back.out(3)' });
  toast(s.wished ? 'Added to wishlist' : 'Removed from wishlist');
});
let bag = 0;
$('#addBtn').addEventListener('click', e => {
  bag++;
  const cnt = $('.bag-count'); cnt.textContent = bag;
  gsap.fromTo(cnt, { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(3)' });
  gsap.fromTo('.bag svg', { rotation: -12 }, { rotation: 0, duration: 0.8, ease: 'elastic.out(1, .3)' });
  const sp = $('span', e.currentTarget);
  sp.textContent = 'Added ✓';
  setTimeout(() => (sp.textContent = 'Add to bag'), 1600);
});
$('#shareBtn').addEventListener('click', async () => {
  try { await navigator.clipboard.writeText(location.href); toast('Link copied'); } catch { toast('Link copied'); }
});

/* =========================================================
   4. ВИДЕО-МОДАЛКА
   ========================================================= */
const vm = $('#vmodal'), video = $('#video'), spinner = $('.v-spinner', vm);
const vFill = $('#vFill'), vTime = $('#vTime'), vProg = $('.v-pp .p', vm);
const fmt = t => { t = Math.max(0, Math.floor(t || 0)); return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };

function openVideo() {
  const s = SLIDES[current];
  video.src = s.video;
  video.currentTime = 0;
  vm.classList.remove('playing');
  gsap.set(video, { opacity: 0, scale: 1.06 });
  gsap.set(spinner, { opacity: 1 });
  vm.setAttribute('aria-hidden', 'false');

  const tl = gsap.timeline()
    .to(vm, { autoAlpha: 1, duration: 0.6, ease: 'power2.out' })
    .from('.v-logo', { y: -30, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.2)
    .from('.v-close', { rotation: -90, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.25)
    .from('.v-bar', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.3);

  // спиннер крутится минимум 0.9с — как в примере
  const minWait = new Promise(r => setTimeout(r, 900));
  const ready = new Promise(r => video.readyState >= 3 ? r() : video.addEventListener('canplay', r, { once: true }));
  Promise.all([minWait, ready]).then(() => {
    if (vm.getAttribute('aria-hidden') === 'true') return;
    gsap.to(spinner, { opacity: 0, duration: 0.4 });
    gsap.to(video, { opacity: 1, scale: 1, duration: 1.4, ease: 'power3.out' });
    video.play().catch(() => { video.muted = true; vm.classList.add('muted'); video.play(); });
  });
  return tl;
}
function closeVideo() {
  vm.setAttribute('aria-hidden', 'true');
  video.pause();
  gsap.to(video, { opacity: 0, duration: 0.4 });
  gsap.to(vm, {
    autoAlpha: 0, duration: 0.7, delay: 0.2, ease: 'power2.inOut',
    onComplete() { video.removeAttribute('src'); video.load(); gsap.set('.v-logo, .v-close, .v-bar', { clearProps: 'all' }); },
  });
}
video.addEventListener('play', () => vm.classList.add('playing'));
video.addEventListener('pause', () => vm.classList.remove('playing'));
video.addEventListener('timeupdate', () => {
  const p = video.duration ? video.currentTime / video.duration : 0;
  vFill.style.width = p * 100 + '%';
  vProg.style.strokeDashoffset = 125.7 * (1 - p);
  vTime.textContent = fmt((video.duration || 0) - video.currentTime);
});
video.addEventListener('loadedmetadata', () => (vTime.textContent = fmt(video.duration)));
video.addEventListener('ended', () => setTimeout(closeVideo, 400));
$('#vPlay').addEventListener('click', () => (video.paused ? video.play() : video.pause()));
video.addEventListener('click', () => (video.paused ? video.play() : video.pause()));
$('#vVol').addEventListener('click', () => { video.muted = !video.muted; vm.classList.toggle('muted', video.muted); });
$('#vTrack').addEventListener('click', e => {
  const r = e.currentTarget.getBoundingClientRect();
  if (video.duration) video.currentTime = ((e.clientX - r.left) / r.width) * video.duration;
});
$('#vClose').addEventListener('click', closeVideo);

/* =========================================================
   5. СОБЫТИЯ
   ========================================================= */
stage.addEventListener('click', e => {
  const t = e.target;
  if (t.closest('[data-play]')) { e.preventDefault(); openVideo(); return; }
  if (t.closest('[data-open]')) { e.preventDefault(); openDetail(); return; }
  const arr = t.closest('.arr');
  if (arr) { const d = +arr.dataset.dir; mode === 'detail' ? detailSwitch(d) : goTo(current + d, d); return; }
  const dot = t.closest('.dot');
  if (dot) {
    const i = +dot.dataset.i;
    if (i === current) return;
    mode === 'detail' ? detailSwitch(i > current ? 1 : -1) : goTo(i);
    return;
  }
  if (t.closest('#backBtn')) { closeDetail(); return; }
  if (mode === 'slider' && t.closest('.panel')) openDetail();
});

// «подглядывание» часов при наведении на панель
SLIDES.forEach(s => {
  s.panel.addEventListener('mouseenter', () => mode === 'slider' && !busy && gsap.to(s.front$, { x: -24 * U(), duration: 0.8, ease: 'power3.out' }));
  s.panel.addEventListener('mouseleave', () => mode === 'slider' && !busy && gsap.to(s.front$, { x: 0, duration: 0.8, ease: 'power3.out' }));
});

addEventListener('keydown', e => {
  if (vm.getAttribute('aria-hidden') === 'false') { if (e.key === 'Escape') closeVideo(); if (e.key === ' ') { e.preventDefault(); video.paused ? video.play() : video.pause(); } return; }
  if (e.key === 'ArrowRight') mode === 'detail' ? detailSwitch(1) : goTo(current + 1, 1);
  if (e.key === 'ArrowLeft') mode === 'detail' ? detailSwitch(-1) : goTo(current - 1, -1);
  if (e.key === 'Enter' && mode === 'slider') openDetail();
  if (e.key === 'Escape' && mode === 'detail') closeDetail();
});

// колесо мыши
let wheelLock = 0;
stage.addEventListener('wheel', e => {
  if (mode !== 'slider' || Date.now() < wheelLock || Math.abs(e.deltaY) + Math.abs(e.deltaX) < 25) return;
  wheelLock = Date.now() + 1400;
  const d = (e.deltaY || e.deltaX) > 0 ? 1 : -1;
  goTo(current + d, d);
}, { passive: true });

// свайп
let sx = null;
stage.addEventListener('pointerdown', e => (sx = e.clientX));
stage.addEventListener('pointerup', e => {
  if (sx === null) return;
  const dx = e.clientX - sx; sx = null;
  if (Math.abs(dx) < 60) return;
  const d = dx < 0 ? 1 : -1;
  mode === 'detail' ? detailSwitch(d) : goTo(current + d, d);
});

addEventListener('resize', () => { if (!busy) layout(); });

/* =========================================================
   6. КАСТОМНЫЙ КУРСОР
   ========================================================= */
(function cursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const c = $('#cursor');
  gsap.set(c, { xPercent: -50, yPercent: -50 });
  const qx = gsap.quickTo(c, 'x', { duration: 0.35, ease: 'power3.out' });
  const qy = gsap.quickTo(c, 'y', { duration: 0.35, ease: 'power3.out' });
  let shown = false;

  addEventListener('mousemove', e => {
    if (!shown) { gsap.set(c, { x: e.clientX, y: e.clientY }); c.style.opacity = 1; shown = true; }
    const el = e.target.closest('[data-cursor]');
    const type = el?.dataset.cursor;
    c.classList.toggle('is-fill', type === 'fill');
    c.classList.toggle('is-dot', type === 'dot');
    if (type === 'pill') {
      // курсор «обнимает» элемент
      const r = el.getBoundingClientRect();
      c.style.width = r.width + 26 + 'px';
      c.style.height = Math.max(r.height + 14, 28) + 'px';
      qx(r.left + r.width / 2 + (e.clientX - (r.left + r.width / 2)) * 0.12);
      qy(r.top + r.height / 2 + (e.clientY - (r.top + r.height / 2)) * 0.12);
    } else {
      c.style.width = c.style.height = '';
      qx(e.clientX); qy(e.clientY);
    }
  });
  addEventListener('mousedown', () => gsap.to(c, { scale: 0.8, duration: 0.2 }));
  addEventListener('mouseup', () => gsap.to(c, { scale: 1, duration: 0.4, ease: 'back.out(3)' }));
  document.addEventListener('mouseleave', () => { c.style.opacity = 0; shown = false; });
})();

/* ---------- старт ---------- */
gsap.set(aside, { autoAlpha: 0 });
gsap.set(dControls, { autoAlpha: 0 });
const imgs = $$('img');
Promise.all(imgs.map(i => i.complete ? 1 : new Promise(r => { i.onload = i.onerror = r; }))).then(() => {
  document.fonts.ready.then(intro);
});
