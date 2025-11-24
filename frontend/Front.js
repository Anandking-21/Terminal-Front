/* Front.js — Neon purple dashboard logic
   Requires Chart.js loaded in HTML
*/

/* Utility */
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));
const clamp = (v,a,b) => Math.max(a,Math.min(b,v));

/* ----------------------------
   Data (India states + Global)
   ---------------------------- */
const stateLeakage = {
  "Maharashtra": {2019:38,2020:40,2021:45,2022:42,2023:44,2024:46},
  "Gujarat": {2019:25,2020:29,2021:27,2022:31,2023:30,2024:32},
  "Rajasthan": {2019:30,2020:33,2021:36,2022:34,2023:35,2024:37},
  "Kerala": {2019:18,2020:19,2021:17,2022:20,2023:22,2024:23},
  "Tamil Nadu": {2019:22,2020:25,2021:27,2022:28,2023:29,2024:31}
};

const globalLeakage = {
  "United States": 950,
  "China": 1100,
  "India": 870,
  "Brazil": 760,
  "Indonesia": 680,
  "Mexico": 640,
  "Russia": 720,
  "Japan": 510,
  "Germany": 460,
  "United Kingdom": 420
};

/* Chart instances */
let stateChart = null;
let globalChart = null;

/* Years label for states */
const years = [2019,2020,2021,2022,2023,2024];

/* ----------------------------
   Modal controls
   ---------------------------- */
function openLogin(){ const m = $('#loginModal'); if(!m) return; m.setAttribute('aria-hidden','false'); }
function closeLogin(){ const m = $('#loginModal'); if(!m) return; m.setAttribute('aria-hidden','true'); }
function openSignup(){ const m = $('#signupModal'); if(!m) return; m.setAttribute('aria-hidden','false'); }
function closeSignup(){ const m = $('#signupModal'); if(!m) return; m.setAttribute('aria-hidden','true'); }

/* ----------------------------
   State chart function (destroy before create)
   ---------------------------- */
function renderStateChart(stateName){
  const dataObj = stateLeakage[stateName];
  if(!dataObj) return;
  const labels = years;
  const data = labels.map(y => dataObj[y]);

  // destroy old
  if(stateChart) { stateChart.destroy(); stateChart = null; }

  const ctx = $('#stateChart').getContext('2d');
  stateChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${stateName} Leakage (MLD)`,
        data,
        borderColor: '#00f6ff',
        backgroundColor: (ctx.createLinearGradient) ? (() => {
          const g = ctx.createLinearGradient(0,0,0,400);
          g.addColorStop(0,'rgba(0,246,255,0.24)');
          g.addColorStop(1,'rgba(0,246,255,0.02)');
          return g;
        })() : '#00f6ff',
        tension: 0.32,
        borderWidth: 3,
        pointRadius: 4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.95)' } },
        y: { ticks: { color: 'rgba(255,255,255,0.95)' } }
      },
      plugins: { legend: { labels: { color: 'rgba(255,255,255,0.95)' } } }
    }
  });
}

/* ----------------------------
   Global chart (in its own section) + ranking list
   ---------------------------- */
function renderGlobalChart(){
  const labels = Object.keys(globalLeakage);
  const values = Object.values(globalLeakage);

  // destroy old chart
  if(globalChart){ globalChart.destroy(); globalChart = null; }

  const ctx = $('#globalChart').getContext('2d');
  globalChart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets: [{
      label: 'Annual Leakage (MLD)',
      data: values,
      backgroundColor: labels.map((l,i) => (values[i] > 900 ? 'rgba(255,120,90,0.95)' : 'rgba(0,246,255,0.92)')),
      borderColor: '#00f6ff',
      borderWidth: 1,
      borderRadius: 8
    }]},
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 1100, easing: 'easeOutCubic' },
      scales: {
        x: { ticks: { color: 'rgba(255,255,255,0.9)', maxRotation: 45, minRotation: 45 } },
        y: { ticks: { color: 'rgba(255,255,255,0.9)' }, beginAtZero: true }
      },
      plugins: { legend: { display: false } }
    }
  });

  populateRankingList(labels, values);
}

/* Animated ranking list (stagger + bar fill + top-3 glow) */
function populateRankingList(labels, values){
  const container = $('#rankingList');
  container.innerHTML = '';
  const items = labels.map((label,i) => ({country: label, leak: values[i]}));
  // sort descending
  items.sort((a,b)=> b.leak - a.leak);
  const max = items[0].leak;

  items.forEach((it, idx) => {
    const div = document.createElement('div');
    div.className = 'rank-item' + (idx < 3 ? ' top3' : '');
    div.innerHTML = `
      <div class="place">${idx+1}</div>
      <div class="meta">
        <strong>${it.country}</strong>
        <div class="small muted">${it.leak.toLocaleString()} MLD</div>
        <div class="barwrap"><div class="bar" style="width:0%"></div></div>
      </div>
    `;
    container.appendChild(div);
    // staggered animation
    setTimeout(()=>{
      const bar = div.querySelector('.bar');
      const pct = Math.round((it.leak/max) * 100);
      bar.style.transition = 'width 900ms cubic-bezier(.2,.9,.2,1)';
      bar.style.width = pct + '%';
      div.classList.add('show');
    }, 140 * idx + 300);
  });
}

/* ----------------------------
   KPI animated counters
   ---------------------------- */
function animateCountUp(el, from, to, duration = 1000, decimals = 0){
  const start = performance.now();
  function tick(now){
    const p = Math.min(1, (now - start)/duration);
    const eased = 1 - Math.pow(1-p,3);
    const val = from + (to - from) * eased;
    el.textContent = decimals ? val.toFixed(decimals) : Math.round(val).toLocaleString();
    if(p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

/* ----------------------------
   Entrance & micro interactions
   ---------------------------- */
function initInteractions(){
  // entrance reveal
  setTimeout(()=> document.querySelector('.topbar')?.classList.add('visible'), 80);
  setTimeout(()=> document.querySelector('.container')?.classList.add('visible'), 160);

  // KPIs demo values
  animateCountUp($('#kpi-total'), 0, 18560, 1400);
  animateCountUp($('#kpi-rate'), 0, 11.2, 1000, 1);
  animateCountUp($('#kpi-alerts'), 0, 24, 1000);

  // attach ripple to CTA buttons
  $$('.btn').forEach(b => {
    b.addEventListener('click', (e) => {
      const rect = b.getBoundingClientRect();
      const circle = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      circle.style.width = circle.style.height = size + 'px';
      circle.style.position = 'absolute';
      circle.style.left = (e.clientX - rect.left - size/2) + 'px';
      circle.style.top = (e.clientY - rect.top - size/2) + 'px';
      circle.style.borderRadius = '50%';
      circle.style.background = 'rgba(255,255,255,0.18)';
      circle.style.transform = 'scale(0)';
      circle.style.transition = 'transform 600ms ease, opacity 600ms ease';
      circle.style.pointerEvents = 'none';
      b.style.position = 'relative';
      b.appendChild(circle);
      requestAnimationFrame(()=> circle.style.transform = 'scale(1.8)');
      setTimeout(()=> circle.style.opacity = 0, 420);
      setTimeout(()=> circle.remove(), 900);
    });
  });

  // attach tilt to cards
  $$('.card.tilt').forEach(card=>{
    card.addEventListener('mousemove', (e)=>{
      const r = card.getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width/2)) / r.width;
      const dy = (e.clientY - (r.top + r.height/2)) / r.height;
      const rx = clamp(dy * 6, -8, 8);
      const ry = clamp(-dx * 6, -8, 8);
      card.style.transform = `translateY(6px) rotateX(${rx}deg) rotateY(${ry}deg)`;
    });
    card.addEventListener('mouseleave', ()=> card.style.transform = '');
  });
}

/* ----------------------------
   Init everything on DOM ready
   ---------------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  initInteractions();
  renderGlobalChart();

  // prepare canvases size
  $('#stateChart').height = 320;
  $('#globalChart').height = 320;

  // state select hook
  $('#stateSelect')?.addEventListener('change', (e)=>{
    const s = e.target.value;
    if(s) renderStateChart(s);
    // small fade/scale on chart wrap
    const wrap = document.querySelector('.chart-wrap');
    wrap?.animate([{opacity:0.0, transform:'scale(.98)'},{opacity:1, transform:'scale(1)'}], {duration:420, easing:'ease-out'});
  });
});

/* Close modals on backdrop click */
window.addEventListener('click', function(e){
  const login = $('#loginModal'), signup = $('#signupModal');
  if(e.target === login) closeLogin();
  if(e.target === signup) closeSignup();
});
/* ===== Global Highlights: Counters + News auto-scroll ===== */

/* COUNTERS demo numbers (you can replace with real data/API) */
const ghData = {
  totalPerDay: 340000000,      // liters -> we'll display as MLD (million liters/day)
  countriesCritical: 27,
  pipelinesKm: 12400000,       // km
  economicLossMillions: 32000  // USD millions
};

/* News items (2020-2024 events + ongoing hotspots) */
const ghNews = [
  "2024 – Thames Water (UK): Record leakage spikes due to aging pipelines.",
  "2024 – California: >150,000 pipe bursts reported yearly on average.",
  "2023 – Italy: Northern drought & leakage caused severe water stress.",
  "2023 – South Africa: Johannesburg outages driven by leaking networks.",
  "2022 – Jackson, Mississippi: system collapse after decades of leakage.",
  "2021 – São Paulo: ~40% non-revenue water from leaks during drought.",
  "2020 – Sydney: major network bursts & enforcement actions.",
  "Ongoing – Middle East: Jordan & Lebanon report >50% system leakage."
];

/* Format helper for large numbers (MLD = million liters/day) */
function formatMLD(liters){
  const mld = liters / 1_000_000;
  return mld.toLocaleString(undefined, {maximumFractionDigits:0}) + " MLD";
}

/* Counters animation (uses same easing used earlier) */
function ghAnimateCounters(){
  const totalEl = document.getElementById('gh-total');
  const countriesEl = document.getElementById('gh-countries');
  const pipelinesEl = document.getElementById('gh-pipelines');
  const econEl = document.getElementById('gh-economic');

  // animate numbers (simple ease-out)
  animateNumber(totalEl, 0, ghData.totalPerDay / 1_000_000, 1200, true); // will display in MLD
  animateNumber(countriesEl, 0, ghData.countriesCritical, 1000, false);
  animateNumber(pipelinesEl, 0, ghData.pipelinesKm, 1200, false, true); // show with separators
  animateNumber(econEl, 0, ghData.economicLossMillions, 1200, false, true);
}

function animateNumber(el, start, end, duration, showMLD=false, useSeparators=false){
  const startTime = performance.now();
  function step(now){
    const t = Math.min(1, (now - startTime)/duration);
    const ease = 1 - Math.pow(1 - t, 3);
    const val = start + (end - start) * ease;
    if(showMLD){
      el.textContent = Math.round(val).toLocaleString() + " MLD";
    } else {
      if(useSeparators){
        el.textContent = Math.round(val).toLocaleString();
      } else {
        el.textContent = (Math.round(val));
      }
    }
    if(t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* Populate news list and start auto-scroll (looping) */
function ghPopulateNews(){
  const list = document.getElementById('ghNewsList');
  if(!list) return;
  list.innerHTML = '';
  ghNews.forEach(item => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });

  // Start auto-scroll animation (translateY)
  let index = 0;
  const itemHeight = 48; // px approx (depends on font); we'll compute dynamically
  const visibleCount = 4; // number of visible items before looping

  // compute exact height of one item for smooth scroll
  const firstItem = list.querySelector('li');
  const actualHeight = firstItem ? firstItem.offsetHeight + 2 : itemHeight;

  function scrollStep(){
    index++;
    list.style.transition = 'transform 700ms cubic-bezier(.2,.9,.2,1)';
    list.style.transform = `translateY(-${actualHeight * index}px)`;

    // when we reach the end, reset after animation
    if(index >= ghNews.length){
      setTimeout(()=>{
        list.style.transition = 'none';
        list.style.transform = 'translateY(0)';
        index = 0;
        // small timeout to re-enable transition for next cycle
        setTimeout(scrollStep, 1800);
      }, 900);
    } else {
      setTimeout(scrollStep, 2200);
    }
  }

  // start after a short delay so user sees top items first
  setTimeout(scrollStep, 2400);
}

/* init runner for Global Highlights - call from DOMContentLoaded */
function initGlobalHighlights(){
  ghAnimateCounters();
  ghPopulateNews();
}

/* Call initGlobalHighlights on DOM ready (append-safe) */
document.addEventListener('DOMContentLoaded', () => {
  // Small safety if content already loaded earlier
  setTimeout(() => {
    initGlobalHighlights();
  }, 350);
});
