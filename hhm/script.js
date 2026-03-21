
// ── CONFIG ──
const ADMIN_PASS = 'highway2025';
const WA_NUM = '919876543210';

// ── JSONBIN CONFIG ──
const BIN_ID = '69bd80a3aa77b81da9026353';
const MASTER_KEY = '$2a$10$VM.F.wVc8BUH2VJTnzDOyujTY3zLO5UOYQ8attzqzSdZ5ftrIINz6';
const BIN_URL = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

// ── DEFAULT PHOTOS (hardcoded, no admin upload) ──
const DEF_SD = [
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1560347876-aeef00ee58a1?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=700&auto=format&fit=crop'
];
const DEF_PM = [
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=700&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=700&auto=format&fit=crop'
];

// ── DATA ──
let D = {
  sdPrice: 2500,
  pmPrice: 5500,
  sd: Object.fromEntries(Array.from({length:34},(_,i)=>[101+i,true])),
  pm: {201:true}
};

// ── JSONBIN: LOAD DATA ──
async function loadData() {
  try {
    const res = await fetch(BIN_URL + '/latest', {
      headers: { 'X-Master-Key': MASTER_KEY }
    });
    const json = await res.json();
    const record = json.record;
    if (record && record.sd) {
      D = record;
    }
  } catch(e) {
    console.log('Load error, using defaults:', e);
  }
  syncPrices();
  syncSliders();
  showLoader(false);
}

// ── JSONBIN: SAVE DATA ──
async function saveData() {
  try {
    await fetch(BIN_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Master-Key': MASTER_KEY
      },
      body: JSON.stringify(D)
    });
  } catch(e) {
    console.log('Save error:', e);
    alert('Save failed! Check internet connection.');
  }
}

// ── LOADER ──
function showLoader(show) {
  const loader = document.getElementById('pageLoader');
  if (loader) loader.style.display = show ? 'flex' : 'none';
}

// ── INIT ──
showLoader(true);
loadData();

// ── SLIDERS ──
const sState = {SD:0, PM:0};

function buildSlider(id, photos) {
  const cont = document.getElementById('slides'+id);
  const dotsEl = document.getElementById('dots'+id);
  if (!cont || !dotsEl) return;
  cont.innerHTML = '';
  dotsEl.innerHTML = '';
  photos.forEach((src, i) => {
    const sl = document.createElement('div');
    sl.className = 'slide';
    const img = document.createElement('img');
    img.src = src; img.alt = 'Room photo';
    sl.appendChild(img);
    cont.appendChild(sl);
    const d = document.createElement('div');
    d.className = 'sdot' + (i===0?' on':'');
    d.onclick = () => goSlide(id, i);
    dotsEl.appendChild(d);
  });
  sState[id] = 0;
  cont.style.transform = 'translateX(0)';
}

function goSlide(id, idx) {
  const cont = document.getElementById('slides'+id);
  if (!cont) return;
  const n = cont.children.length;
  if (!n) return;
  sState[id] = (idx + n) % n;
  cont.style.transform = 'translateX(-' + (sState[id]*100) + '%)';
  document.querySelectorAll('#dots'+id+' .sdot').forEach((d,i) => d.classList.toggle('on', i===sState[id]));
}

function slideCard(id, dir) { goSlide(id, sState[id]+dir); }

function syncSliders() {
  buildSlider('SD', DEF_SD);
  buildSlider('PM', DEF_PM);
}

setInterval(() => { goSlide('SD', sState.SD+1); goSlide('PM', sState.PM+1); }, 4000);

// ── PRICES ──
function syncPrices() {
  const sdEl = document.getElementById('sdPrice');
  const pmEl = document.getElementById('pmPrice');
  if (sdEl) sdEl.innerHTML = '₹' + D.sdPrice.toLocaleString('en-IN') + ' <small>/ night</small>';
  if (pmEl) pmEl.innerHTML = '₹' + D.pmPrice.toLocaleString('en-IN') + ' <small>/ night</small>';
}

// ── NAV ──
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => navEl.classList.toggle('sc', scrollY > 50));
document.getElementById('hbtn').onclick = () => document.getElementById('mobMenu').classList.add('open');
document.getElementById('mobCls').onclick = () => document.getElementById('mobMenu').classList.remove('open');
document.querySelectorAll('.mob-lnk').forEach(a => a.onclick = () => document.getElementById('mobMenu').classList.remove('open'));

// ── MODAL ──
let mType = null, sel = [];

function openModal(type) {
  mType = type; sel = [];
  ['mName','mPhone','mCheckIn','mCheckOut','mRequests'].forEach(id => { document.getElementById(id).value=''; });
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('mCheckIn').min = today;
  document.getElementById('mCheckOut').min = today;
  document.getElementById('mCheckIn').onchange = function() { document.getElementById('mCheckOut').min = this.value; };
  document.getElementById('reqNote').style.display = 'none';
  renderModal();
  document.getElementById('availModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('availModal').classList.remove('open');
  document.body.style.overflow = '';
}

document.getElementById('availModal').onclick = function(e) {
  if (e.target === this) closeModal();
};

function renderModal() {
  const isSD = mType === 'super';
  const rooms = isSD ? D.sd : D.pm;
  const price = isSD ? D.sdPrice : D.pmPrice;
  const label = isSD ? 'Super Deluxe' : 'Premium Suite';
  const nums = Object.keys(rooms).map(Number).sort((a,b)=>a-b);

  document.getElementById('modalTitle').textContent = label + ' — Room Availability';
  document.getElementById('modalSub').textContent = 'Fill your details, select rooms, then book via WhatsApp';

  const cont = document.getElementById('pillsCont');
  cont.innerHTML = '';
  nums.forEach(n => {
    const avail = rooms[n];
    const pill = document.createElement('div');
    pill.className = 'pill ' + (avail ? 'a' : 'o');
    pill.dataset.room = n;
    pill.innerHTML = '<span style="font-size:.72rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.72rem;line-height:1">'+(avail?'🛏':'🔒')+'</span>';
    if (avail) pill.onclick = () => togglePill(n, pill, price, label);
    cont.appendChild(pill);
  });

  const tot = nums.length, av = nums.filter(n=>rooms[n]).length;
  document.getElementById('sTot').textContent = tot;
  document.getElementById('sAvail').textContent = av;
  document.getElementById('sOccup').textContent = tot - av;
  document.getElementById('sSel').textContent = 0;
  refreshBar(price, label);
}

function togglePill(n, pill, price, label) {
  const idx = sel.indexOf(n);
  if (idx === -1) {
    sel.push(n);
    pill.className = 'pill sel';
    pill.innerHTML = '<span style="font-size:.72rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.8rem;line-height:1">✓</span>';
  } else {
    sel.splice(idx, 1);
    pill.className = 'pill a';
    pill.innerHTML = '<span style="font-size:.72rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.72rem;line-height:1">🛏</span>';
  }
  document.getElementById('sSel').textContent = sel.length;
  refreshBar(price, label);
}

function refreshBar(price, label) {
  const bar = document.getElementById('selBar');
  const cnt = sel.length;
  if (cnt === 0) {
    bar.classList.add('hidden');
    document.getElementById('mNote').textContent = 'Fill details · Select rooms · Confirm via WhatsApp';
  } else {
    bar.classList.remove('hidden');
    const sorted = [...sel].sort((a,b)=>a-b);
    document.getElementById('sbType').textContent = label;
    document.getElementById('sbCnt').textContent = cnt + ' room' + (cnt>1?'s':'');
    document.getElementById('sbTotal').textContent = '₹' + (cnt*price).toLocaleString('en-IN');
    document.getElementById('sbNums').textContent = 'Rooms: ' + sorted.join(', ');
    document.getElementById('mNote').textContent = cnt+' room'+(cnt>1?'s':'')+' · ₹'+(cnt*price).toLocaleString('en-IN')+'/night';
  }
}

function clearSel() {
  const rooms = mType==='super'?D.sd:D.pm;
  const price = mType==='super'?D.sdPrice:D.pmPrice;
  const label = mType==='super'?'Super Deluxe':'Premium Suite';
  sel = [];
  document.querySelectorAll('#pillsCont .pill').forEach(pill => {
    const n = parseInt(pill.dataset.room), av = rooms[n];
    pill.className = 'pill ' + (av?'a':'o');
    pill.innerHTML = '<span style="font-size:.72rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.72rem;line-height:1">'+(av?'🛏':'🔒')+'</span>';
  });
  document.getElementById('sSel').textContent = 0;
  refreshBar(price, label);
}

function bookWA() {
  const name = document.getElementById('mName').value.trim();
  const phone = document.getElementById('mPhone').value.trim();
  const ci = document.getElementById('mCheckIn').value;
  const co = document.getElementById('mCheckOut').value;
  const req = document.getElementById('mRequests').value.trim();
  if (!name || !phone || !ci || !co) {
    document.getElementById('reqNote').style.display = 'block';
    document.getElementById('mName').scrollIntoView({behavior:'smooth',block:'center'});
    return;
  }
  document.getElementById('reqNote').style.display = 'none';
  const isSD = mType==='super';
  const price = isSD?D.sdPrice:D.pmPrice;
  const label = isSD?'Super Deluxe Room':'Premium Suite';
  const sorted = [...sel].sort((a,b)=>a-b);
  const nights = Math.max(1, Math.round((new Date(co)-new Date(ci))/(1000*60*60*24)));
  const cnt = sorted.length || 1;
  const total = cnt * price * nights;
  const roomLine = sorted.length > 0
    ? '🔢 Selected Rooms: *'+sorted.join(', ')+'* ('+cnt+' room'+(cnt>1?'s':'')+')'
    : '🔢 Rooms: 1';
  const msg = '🏨 *Hotel Highway Memory — Booking Request*\n\n'
    + '👤 Name: *'+name+'*\n'
    + '📞 Phone: *'+phone+'*\n'
    + '🛏 Room Type: *'+label+'*\n'
    + roomLine+'\n'
    + '📅 Check-in: *'+ci+'*\n'
    + '📅 Check-out: *'+co+'*\n'
    + '🌙 Nights: *'+nights+'*\n'
    + '💰 Rate: ₹'+price.toLocaleString('en-IN')+'/room/night\n'
    + '💳 Total: *₹'+total.toLocaleString('en-IN')+'*\n'
    + (req ? '✨ Requests: '+req+'\n' : '')
    + '\nPlease confirm my booking. Thank you!';
  window.open('https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(msg), '_blank');
}

// ── CONTACT FORM ──
const today = new Date().toISOString().split('T')[0];
document.getElementById('bci').min = today;
document.getElementById('bco').min = today;
document.getElementById('bci').onchange = function() { document.getElementById('bco').min = this.value; };

function sendFormWA(e) {
  e.preventDefault();
  const n=document.getElementById('bn').value, ph=document.getElementById('bp').value;
  const rt=document.getElementById('brt').value, ci=document.getElementById('bci').value;
  const co=document.getElementById('bco').value, nr=document.getElementById('bnr').value;
  const sr=document.getElementById('bsr').value;
  const nights = Math.max(1, Math.round((new Date(co)-new Date(ci))/(1000*60*60*24)));
  const msg = '🏨 *Hotel Highway Memory — Booking Request*\n\n'
    + '👤 Name: *'+n+'*\n📞 Phone: *'+ph+'*\n🛏 Room: *'+rt+'*\n'
    + '🔢 Rooms: '+nr+'\n📅 Check-in: *'+ci+'*\n📅 Check-out: *'+co+'*\n'
    + '🌙 Nights: *'+nights+'*'+(sr?'\n✨ Requests: '+sr:'')+'\n\nPlease confirm. Thank you!';
  window.open('https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(msg), '_blank');
}

// ── ADMIN ──
let adminW = null;

function openAdminLogin() {
  document.getElementById('adminPwd').value = '';
  document.getElementById('adminErr').style.display = 'none';
  document.getElementById('adminLoginOv').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeAdminLogin() {
  document.getElementById('adminLoginOv').classList.remove('open');
  document.body.style.overflow = '';
}
function doLogin() {
  if (document.getElementById('adminPwd').value === ADMIN_PASS) {
    closeAdminLogin();
    openAdminDash();
  } else {
    document.getElementById('adminErr').style.display = 'block';
    document.getElementById('adminPwd').select();
  }
}
function doLogout() { closeAdminDash(); }

function openAdminDash() {
  adminW = JSON.parse(JSON.stringify(D));
  document.getElementById('aSD').value = adminW.sdPrice;
  document.getElementById('aPM').value = adminW.pmPrice;

  // SD pills
  const sdc = document.getElementById('aSDPills'); sdc.innerHTML = '';
  Object.keys(adminW.sd).map(Number).sort((a,b)=>a-b).forEach(n => {
    const p = mkPill(n, adminW.sd[n], () => {
      adminW.sd[n] = !adminW.sd[n];
      p.className = 'adm-pill ' + (adminW.sd[n]?'a':'o');
      p.innerHTML = pillHTML(n, adminW.sd[n]);
    });
    sdc.appendChild(p);
  });

  // PM pills
  const pmc = document.getElementById('aPMPills'); pmc.innerHTML = '';
  Object.keys(adminW.pm).map(Number).sort((a,b)=>a-b).forEach(n => {
    const p = mkPill(n, adminW.pm[n], () => {
      adminW.pm[n] = !adminW.pm[n];
      p.className = 'adm-pill ' + (adminW.pm[n]?'a':'o');
      p.innerHTML = pillHTML(n, adminW.pm[n]);
    });
    pmc.appendChild(p);
  });

  document.getElementById('adminDashOv').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdminDash() {
  document.getElementById('adminDashOv').classList.remove('open');
  document.body.style.overflow = '';
}

function mkPill(n, avail, cb) {
  const p = document.createElement('div');
  p.className = 'adm-pill ' + (avail?'a':'o');
  p.innerHTML = pillHTML(n, avail);
  p.title = 'Room '+n+': '+(avail?'Available — tap to mark occupied':'Occupied — tap to mark available');
  p.onclick = cb;
  return p;
}
function pillHTML(n, av) {
  return '<span style="font-size:.66rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.7rem;line-height:1">'+(av?'✓':'✕')+'</span>';
}

// ── SAVE ADMIN (JSONBin) ──
async function saveAdmin() {
  const sdP = parseInt(document.getElementById('aSD').value);
  const pmP = parseInt(document.getElementById('aPM').value);
  if (sdP > 0) adminW.sdPrice = sdP;
  if (pmP > 0) adminW.pmPrice = pmP;

  D = JSON.parse(JSON.stringify(adminW));

  // Show saving indicator
  const t = document.getElementById('toast');
  t.textContent = '⏳ Saving...';
  t.style.display = 'block';

  await saveData();

  syncPrices();
  syncSliders();

  t.textContent = '✅ Saved! All devices will update.';
  clearTimeout(t._t);
  t._t = setTimeout(() => t.style.display='none', 3000);
}

// ── ESC KEY ──
document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  closeModal(); closeAdminDash(); closeAdminLogin();
  document.body.style.overflow = '';
})
