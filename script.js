/* ================================================================
   CONFIG
================================================================ */
const ADMIN_PASS = 'highway2025';
const WA_NUM    = '918005712743';
const BIN_ID    = '69bd80a3aa77b81da9026353';
const MASTER_KEY= '$2a$10$VM.F.wVc8BUH2VJTnzDOyujTY3zLO5UOYQ8attzqzSdZ5ftrIINz6';
const BIN_URL   = `https://api.jsonbin.io/v3/b/${BIN_ID}`;

const SD_SLIDES = [
  {label:'Super Deluxe — Photo 1',file:'room2.jpeg'},
  {label:'Super Deluxe — Photo 2',file:'room4.jpeg'},
  {label:'Super Deluxe — Photo 3',file:'room3.jpeg'},
  {label:'Super Deluxe — Photo 4',file:'room6.jpeg'},
  {label:'Super Deluxe — Photo 5',file:'room8.jpeg'},
];
const TR_SLIDES = [
  {label:'Triple Room — Photo 1',file:'room4.jpeg'},
  {label:'Triple Room — Photo 2',file:'room2.jpeg'},
  {label:'Triple Room — Photo 3',file:'room8.jpeg'},
  {label:'Triple Room — Photo 4',file:'room3.jpeg'},
  {label:'Triple Room — Photo 5',file:'room6.jpeg'},
];
const PM_SLIDES = [
  {label:'Family Suite — Photo 1',file:'room9.jpeg'},
  {label:'Family Suite — Photo 2',file:'room7.jpeg'},
  {label:'Family Suite — Photo 3',file:'room5.jpeg'},
  {label:'Family Suite — Photo 4',file:'romm1.jpeg'},
  {label:'Family Suite — Photo 5',file:'room3.jpeg'},
];

// Family Suite rooms: 101A,101B ... 106A,106B, 201A,201B ... 206A,206B
const PM_ROOM_KEYS = [
  '101A','101B','102A','102B','103A','103B','104A','104B','105A','105B','106A','106B',
  '201A','201B','202A','202B','203A','203B','204A','204B','205A','205B','206A','206B'
];
// Super Deluxe rooms: 301,302,303,305,306,308,309,401,403
const SD_ROOM_KEYS = [301,302,303,305,306,308,309,401,403];
// Triple rooms: 304,307
const TR_ROOM_KEYS = [304,307];

let D = {
  sdPrice: 2500,
  trPrice: 3500,
  pmPrice: 4500,
  sd: Object.fromEntries(SD_ROOM_KEYS.map(k=>[k,true])),
  tr: Object.fromEntries(TR_ROOM_KEYS.map(k=>[k,true])),
  pm: Object.fromEntries(PM_ROOM_KEYS.map(k=>[k,true]))
};

/* ── LOAD / SAVE (JSONBin) ── */
async function loadData() {
  try {
    const res  = await fetch(BIN_URL+'/latest', {headers:{'X-Master-Key':MASTER_KEY}});
    const json = await res.json();
    if (json.record && json.record.sd) {
      D = json.record;
      // Ensure new keys exist if old data loaded
      if (!D.trPrice) D.trPrice = 3500;
      if (!D.pmPrice) D.pmPrice = 4500;
      // Re-init rooms if keys don't match new structure
      const sdKeys = Object.keys(D.sd||{});
      if (!sdKeys.includes('301')) {
        D.sd = Object.fromEntries(SD_ROOM_KEYS.map(k=>[k,true]));
      }
      const trKeys = Object.keys(D.tr||{});
      if (!trKeys.includes('304')) {
        D.tr = Object.fromEntries(TR_ROOM_KEYS.map(k=>[k,true]));
      }
      const pmKeys = Object.keys(D.pm||{});
      if (!pmKeys.includes('101A')) {
        D.pm = Object.fromEntries(PM_ROOM_KEYS.map(k=>[k,true]));
      }
    }
  } catch(e) { console.log('Load failed, using defaults'); }
  syncPrices(); syncSliders();
  document.getElementById('loader').classList.add('done');
}
async function saveData() {
  try {
    await fetch(BIN_URL, {method:'PUT',headers:{'Content-Type':'application/json','X-Master-Key':MASTER_KEY},body:JSON.stringify(D)});
  } catch(e) { alert('Save failed! Check connection.'); }
}
loadData();

/* ── HERO SLIDER ── */
let heroIdx = 0;
const heroSlides = document.querySelectorAll('.hero-slide');
const heroDots   = document.querySelectorAll('.hero-dot');
let heroTimer;

function heroGoTo(idx) {
  heroSlides[heroIdx].classList.remove('active');
  heroDots[heroIdx].classList.remove('on');
  heroIdx = (idx + heroSlides.length) % heroSlides.length;
  heroSlides[heroIdx].classList.add('active');
  heroDots[heroIdx].classList.add('on');
}
function heroSlide(dir) {
  clearInterval(heroTimer);
  heroGoTo(heroIdx + dir);
  heroTimer = setInterval(() => heroGoTo(heroIdx + 1), 5500);
}
heroDots.forEach((d, i) => d.addEventListener('click', () => {
  clearInterval(heroTimer);
  heroGoTo(i);
  heroTimer = setInterval(() => heroGoTo(heroIdx + 1), 5500);
}));
heroTimer = setInterval(() => heroGoTo(heroIdx + 1), 5500);

(function() {
  const el = document.getElementById('hero');
  let sx = 0;
  el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
  el.addEventListener('touchend', e => {
    const diff = sx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) heroSlide(diff > 0 ? 1 : -1);
  }, {passive:true});
})();

/* ── CURSOR GLOW ── */
(function() {
  if (window.matchMedia('(hover:hover)').matches) {
    const glow = document.createElement('div');
    glow.style.cssText = 'position:fixed;width:280px;height:280px;background:radial-gradient(circle,rgba(139,117,53,.04) 0%,transparent 70%);border-radius:50%;pointer-events:none;z-index:1;transform:translate(-50%,-50%);transition:opacity .3s;';
    document.body.appendChild(glow);
    document.addEventListener('mousemove', e => {
      glow.style.left = e.clientX + 'px';
      glow.style.top  = e.clientY + 'px';
    });
  }
})();

/* ── NAV ── */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => navEl.classList.toggle('sc', scrollY > 60));

const hamBtn  = document.getElementById('hamBtn');
const mobMenu = document.getElementById('mobMenu');

function openMobMenu() { mobMenu.classList.add('open'); hamBtn.classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeMobMenu() { mobMenu.classList.remove('open'); hamBtn.classList.remove('open'); document.body.style.overflow = ''; }

hamBtn.addEventListener('click', openMobMenu);
document.getElementById('mobClose').addEventListener('click', closeMobMenu);
document.querySelectorAll('.mob-lnk').forEach(a => a.addEventListener('click', closeMobMenu));

/* ── SCROLL REVEAL ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const siblings = e.target.parentElement.querySelectorAll('.reveal:not(.visible)');
      siblings.forEach((sib, idx) => { setTimeout(() => sib.classList.add('visible'), idx * 80); });
      e.target.classList.add('visible');
      revObs.unobserve(e.target);
    }
  });
}, {threshold: .12, rootMargin: '0px 0px -40px 0px'});
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ── ROOM SLIDERS ── */
const sState = {SD:0, TR:0, PM:0};
function buildSlider(id, slides) {
  const cont  = document.getElementById('slides'+id);
  const dotsEl= document.getElementById('dots'+id);
  if (!cont || !dotsEl) return;
  cont.innerHTML = ''; dotsEl.innerHTML = '';
  slides.forEach((s,i) => {
    const sl = document.createElement('div'); sl.className = 'slide';
    const img= document.createElement('img'); img.src = s.file; img.alt = s.label;
    img.onerror = function() {
      this.style.display = 'none';
      const ph = document.createElement('div'); ph.className = 'slide-ph';
      ph.textContent = s.label; sl.appendChild(ph);
    };
    sl.appendChild(img); cont.appendChild(sl);
    const d = document.createElement('div'); d.className = 'sdot'+(i===0?' on':'');
    d.onclick = () => goSlide(id, i); dotsEl.appendChild(d);
  });
  sState[id] = 0; cont.style.transform = 'translateX(0)';
}
function goSlide(id, idx) {
  const cont = document.getElementById('slides'+id); if (!cont) return;
  const n = cont.children.length; if (!n) return;
  sState[id] = (idx+n)%n;
  cont.style.transform = 'translateX(-'+(sState[id]*100)+'%)';
  document.querySelectorAll('#dots'+id+' .sdot').forEach((d,i) => d.classList.toggle('on', i===sState[id]));
}
function slideCard(id,dir){ goSlide(id, sState[id]+dir); }
function syncSliders() { buildSlider('SD', SD_SLIDES); buildSlider('TR', TR_SLIDES); buildSlider('PM', PM_SLIDES); }
setInterval(() => { goSlide('SD', sState.SD+1); goSlide('TR', sState.TR+1); goSlide('PM', sState.PM+1); }, 4500);

(function addSwipe() {
  ['SD','TR','PM'].forEach(id => {
    let startX = 0;
    const el = document.getElementById('slides'+id);
    if (!el) return;
    el.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, {passive:true});
    el.addEventListener('touchend', e => {
      const diff = startX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 40) slideCard(id, diff > 0 ? 1 : -1);
    }, {passive:true});
  });
})();

/* ── PRICES ── */
function syncPrices(){
  const sd = document.getElementById('sdPrice');
  const tr = document.getElementById('trPrice');
  const pm = document.getElementById('pmPrice');
  if (sd) sd.innerHTML = '₹'+D.sdPrice.toLocaleString('en-IN')+' <small>/ night</small>';
  if (tr) tr.innerHTML = '₹'+D.trPrice.toLocaleString('en-IN')+' <small>/ night</small>';
  if (pm) pm.innerHTML = '₹'+D.pmPrice.toLocaleString('en-IN')+' <small>/ night</small>';
}

/* ── GALLERY SLIDER ── */
let galIdx = 0;
const galSlides = document.querySelectorAll('.gal-slide');
const galThumbsEl = document.querySelectorAll('.gal-thumb');
const galTotEl = galSlides.length;
document.getElementById('galTot').textContent = galTotEl;

function galGoTo(idx) {
  galSlides[galIdx].classList.remove('active');
  galThumbsEl[galIdx].classList.remove('active');
  galIdx = (idx + galTotEl) % galTotEl;
  galSlides[galIdx].classList.add('active');
  galThumbsEl[galIdx].classList.add('active');
  document.getElementById('galCur').textContent = galIdx + 1;
}
function galSlide(dir) { galGoTo(galIdx + dir); }

(function() {
  const el = document.querySelector('.gallery-main');
  if (!el) return;
  let sx = 0;
  el.addEventListener('touchstart', e => { sx = e.touches[0].clientX; }, {passive:true});
  el.addEventListener('touchend', e => {
    const diff = sx - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) galSlide(diff > 0 ? 1 : -1);
  }, {passive:true});
})();
setInterval(() => galSlide(1), 5000);

/* ── AVAILABILITY MODAL ── */
let mType=null, sel=[];
function openModal(type){
  mType=type; sel=[];
  ['mName','mPhone','mCheckIn','mCheckOut','mRequests'].forEach(id=>{document.getElementById(id).value='';});
  const today=new Date().toISOString().split('T')[0];
  document.getElementById('mCheckIn').min=today;
  document.getElementById('mCheckOut').min=today;
  document.getElementById('mCheckIn').onchange=function(){document.getElementById('mCheckOut').min=this.value;};
  document.getElementById('reqNote').style.display='none';
  renderModal();
  document.getElementById('availModal').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeModal(){document.getElementById('availModal').classList.remove('open');document.body.style.overflow='';}
document.getElementById('availModal').onclick=function(e){if(e.target===this)closeModal();};

function renderModal(){
  const isSD = mType==='super', isTR = mType==='triple';
  let rooms, price, label;
  if (isSD)      { rooms=D.sd; price=D.sdPrice; label='Super Deluxe'; }
  else if (isTR) { rooms=D.tr; price=D.trPrice; label='Triple Occupancy'; }
  else           { rooms=D.pm; price=D.pmPrice; label='Family Suite'; }

  // Sort keys: numeric first, then alphanumeric (101A, 101B style)
  const nums = Object.keys(rooms).sort((a,b)=>{
    const na = parseInt(a), nb = parseInt(b);
    if (na !== nb) return na - nb;
    return String(a).localeCompare(String(b));
  });

  document.getElementById('modalTitle').textContent=label+' — Room Availability';
  const cont=document.getElementById('pillsCont'); cont.innerHTML='';
  nums.forEach(n=>{
    const av=rooms[n]; const p=document.createElement('div');
    p.className='pill '+(av?'a':'o'); p.dataset.room=n;
    p.innerHTML='<span style="font-size:.62rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.7rem;line-height:1">'+(av?'🛏':'🔒')+'</span>';
    if(av) p.onclick=()=>togglePill(n,p,price,label);
    cont.appendChild(p);
  });
  const tot=nums.length, av=nums.filter(n=>rooms[n]).length;
  document.getElementById('sTot').textContent=tot;
  document.getElementById('sAvail').textContent=av;
  document.getElementById('sOccup').textContent=tot-av;
  document.getElementById('sSel').textContent=0;
  refreshBar(price,label);
}
function togglePill(n,pill,price,label){
  const idx=sel.indexOf(n);
  if(idx===-1){sel.push(n);pill.className='pill sel';pill.innerHTML='<span style="font-size:.62rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.75rem;line-height:1">✓</span>';}
  else{sel.splice(idx,1);pill.className='pill a';pill.innerHTML='<span style="font-size:.62rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.7rem;line-height:1">🛏</span>';}
  document.getElementById('sSel').textContent=sel.length;
  refreshBar(price,label);
}
function refreshBar(price,label){
  const bar=document.getElementById('selBar');
  if(!sel.length){bar.classList.add('hidden');document.getElementById('mNote').textContent='Fill details · Select rooms · Confirm via WhatsApp';return;}
  bar.classList.remove('hidden');
  const sorted=[...sel].sort((a,b)=>{
    const na=parseInt(a),nb=parseInt(b);
    if(na!==nb) return na-nb;
    return String(a).localeCompare(String(b));
  });
  document.getElementById('sbType').textContent=label;
  document.getElementById('sbCnt').textContent=sel.length+' room'+(sel.length>1?'s':'');
  document.getElementById('sbTotal').textContent='₹'+(sel.length*price).toLocaleString('en-IN');
  document.getElementById('sbNums').textContent='Rooms: '+sorted.join(', ');
  document.getElementById('mNote').textContent=sel.length+' room'+(sel.length>1?'s':'')+' · ₹'+(sel.length*price).toLocaleString('en-IN')+'/night';
}
function clearSel(){
  const rooms = mType==='super'?D.sd:(mType==='triple'?D.tr:D.pm);
  const price  = mType==='super'?D.sdPrice:(mType==='triple'?D.trPrice:D.pmPrice);
  const label  = mType==='super'?'Super Deluxe':(mType==='triple'?'Triple Occupancy':'Family Suite');
  sel=[];
  document.querySelectorAll('#pillsCont .pill').forEach(p=>{
    const n=p.dataset.room, av=rooms[n];
    p.className='pill '+(av?'a':'o');
    p.innerHTML='<span style="font-size:.62rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.7rem;line-height:1">'+(av?'🛏':'🔒')+'</span>';
  });
  document.getElementById('sSel').textContent=0;
  refreshBar(price,label);
}

/* ── BOOK VIA WHATSAPP ── */
function bookWA(){
  const name  = document.getElementById('mName').value.trim();
  const phone = document.getElementById('mPhone').value.trim();
  const ci    = document.getElementById('mCheckIn').value;
  const co    = document.getElementById('mCheckOut').value;
  const req   = document.getElementById('mRequests').value.trim();
  if(!name||!phone||!ci||!co){document.getElementById('reqNote').style.display='block';return;}
  document.getElementById('reqNote').style.display='none';
  const isSD    = mType==='super', isTR = mType==='triple';
  const price   = isSD ? D.sdPrice : (isTR ? D.trPrice : D.pmPrice);
  const label   = isSD ? 'Super Deluxe Room' : (isTR ? 'Triple Occupancy Room' : 'Family Suite');
  const sorted  = [...sel].sort((a,b)=>{
    const na=parseInt(a),nb=parseInt(b);
    if(na!==nb) return na-nb;
    return String(a).localeCompare(String(b));
  });
  const nights  = Math.max(1, Math.round((new Date(co)-new Date(ci))/(86400000)));
  const cnt     = sorted.length || 1;
  const perNight= cnt * price;
  const total   = perNight * nights;
  const fmt = d => new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  const roomLine = sorted.length ? '🔢 Selected Rooms: *' + sorted.join(', ') + '* (' + cnt + ' room' + (cnt>1?'s':'') + ')\n' : '🔢 No. of Rooms: *1*\n';
  const msg =
    '🏨 *Hotel Highway Memories — Booking Request*\n' +
    '━━━━━━━━━━━━━━━━━━━━\n\n' +
    '👤 *Name:* ' + name + '\n' +
    '📞 *Phone:* ' + phone + '\n\n' +
    '🛏 *Room Type:* ' + label + '\n' +
    roomLine +
    '\n📅 *Check-in:*  ' + fmt(ci) + '\n' +
    '📅 *Check-out:* ' + fmt(co) + '\n' +
    '🌙 *Duration:*  ' + nights + ' night' + (nights>1?'s':'') + '\n\n' +
    '💰 *Rate:*      ₹' + price.toLocaleString('en-IN') + ' / room / night\n' +
    (cnt>1 ? '🏷 *Rooms × Rate:* ' + cnt + ' × ₹' + price.toLocaleString('en-IN') + ' = ₹' + perNight.toLocaleString('en-IN') + '/night\n' : '') +
    '📆 *Nights:*    ' + nights + '\n' +
    '━━━━━━━━━━━━━━━━━━━━\n' +
    '💳 *TOTAL AMOUNT: ₹' + total.toLocaleString('en-IN') + '*\n' +
    '━━━━━━━━━━━━━━━━━━━━\n' +
    (req ? '\n✨ *Special Requests:* ' + req + '\n' : '') +
    '\nKindly confirm my booking. Thank you! 🙏';
  window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank');
}

/* ── CONTACT FORM ── */
const td=new Date().toISOString().split('T')[0];
document.getElementById('bci').min=td; document.getElementById('bco').min=td;
document.getElementById('bci').onchange=function(){document.getElementById('bco').min=this.value;};

function sendFormWA(e){
  e.preventDefault();
  const n  = document.getElementById('bn').value;
  const ph = document.getElementById('bp').value;
  const rt = document.getElementById('brt').value;
  const ci = document.getElementById('bci').value;
  const co = document.getElementById('bco').value;
  const nr = document.getElementById('bnr').value;
  const sr = document.getElementById('bsr').value;
  const nights = Math.max(1, Math.round((new Date(co)-new Date(ci))/(86400000)));
  let pricePerRoom = 0;
  if (rt.includes('2,500'))      pricePerRoom = D.sdPrice || 2500;
  else if (rt.includes('3,500')) pricePerRoom = D.trPrice || 3500;
  else if (rt.includes('4,500')) pricePerRoom = D.pmPrice || 4500;
  const numRooms = isNaN(parseInt(nr)) ? 1 : parseInt(nr);
  const perNight = pricePerRoom * numRooms;
  const total    = perNight * nights;
  const fmt = d => new Date(d).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric'});
  const amountLine = pricePerRoom > 0
    ? '💰 *Rate:*     ₹' + pricePerRoom.toLocaleString('en-IN') + ' / room / night\n' +
      (numRooms > 1 ? '🏷 *Rooms × Rate:* ' + numRooms + ' × ₹' + pricePerRoom.toLocaleString('en-IN') + ' = ₹' + perNight.toLocaleString('en-IN') + '/night\n' : '') +
      '📆 *Nights:*   ' + nights + '\n' +
      '━━━━━━━━━━━━━━━━━━━━\n' +
      '💳 *TOTAL AMOUNT: ₹' + total.toLocaleString('en-IN') + '*\n' +
      '━━━━━━━━━━━━━━━━━━━━\n'
    : '📆 *Nights:* ' + nights + '\n';
  const msg =
    '🏨 *Hotel Highway Memories — Booking Request*\n' +
    '━━━━━━━━━━━━━━━━━━━━\n\n' +
    '👤 *Name:* ' + n + '\n' +
    '📞 *Phone:* ' + ph + '\n\n' +
    '🛏 *Room Type:* ' + rt + '\n' +
    '🔢 *No. of Rooms:* ' + nr + '\n\n' +
    '📅 *Check-in:*  ' + fmt(ci) + '\n' +
    '📅 *Check-out:* ' + fmt(co) + '\n\n' +
    amountLine +
    (sr ? '\n✨ *Special Requests:* ' + sr + '\n' : '') +
    '\nKindly confirm my booking. Thank you! 🙏';
  window.open('https://wa.me/' + WA_NUM + '?text=' + encodeURIComponent(msg), '_blank');
}

/* ================================================================
   MENU BOOK DATA
================================================================ */
const MENU_DATA=[
  {category:'🥣 Breakfast',items:[
    {name:'Aloo Paratha',desc:'Stuffed whole-wheat flatbread with spiced potato',price:'₹80',type:'veg'},
    {name:'Paneer Paratha',desc:'Cottage cheese stuffed flatbread with butter',price:'₹90',type:'veg'},
    {name:'Masala Omelette',desc:'3 eggs with onion, tomato, green chilli',price:'₹70',type:'egg'},
    {name:'Bread Butter Toast',desc:'Toasted white or brown bread with butter & jam',price:'₹40',type:'veg'},
    {name:'Poha',desc:'Flattened rice with mustard, curry leaves, peanuts',price:'₹60',type:'veg'},
    {name:'Upma',desc:'Semolina with vegetables and tempering',price:'₹60',type:'veg'},
    {name:'Idli Sambar',desc:'3 steamed rice cakes with sambar and chutney',price:'₹70',type:'veg'},
    {name:'Egg Bhurji with Bread',desc:'Scrambled spiced eggs with toasted bread',price:'₹80',type:'egg'},
  ]},
  {category:'🍲 Soups',items:[
    {name:'Tomato Soup',desc:'Creamy tomato with fresh cream and croutons',price:'₹80',type:'veg'},
    {name:'Manchow Soup',desc:'Hot & tangy Indo-Chinese with crispy noodles',price:'₹90',type:'veg'},
    {name:'Chicken Clear Soup',desc:'Light broth with shredded chicken and vegetables',price:'₹110',type:'nonveg'},
    {name:'Sweet Corn Soup',desc:'Creamy corn with vegetable option',price:'₹90',type:'veg'},
  ]},
  {category:'🥗 Starters — Veg',items:[
    {name:'Veg Spring Rolls',desc:'Crispy rolls stuffed with seasoned vegetables',price:'₹120',type:'veg'},
    {name:'Paneer Tikka',desc:'Marinated cottage cheese grilled in tandoor',price:'₹180',type:'veg'},
    {name:'Aloo Tikki',desc:'Spiced potato patties with mint & tamarind chutney',price:'₹100',type:'veg'},
    {name:'Hara Bhara Kabab',desc:'Spinach and pea cakes, mildly spiced',price:'₹130',type:'veg'},
    {name:'Gobi Manchurian',desc:'Crispy cauliflower in spicy Indo-Chinese sauce',price:'₹140',type:'veg'},
  ]},
  {category:'🍗 Starters — Non Veg',items:[
    {name:'Chicken Tikka',desc:'Boneless chicken marinated in spices, tandoor-grilled',price:'₹200',type:'nonveg'},
    {name:'Chicken 65',desc:'Deep fried spicy chicken — classic South Indian style',price:'₹190',type:'nonveg'},
    {name:'Chicken Lollipop',desc:'6 pcs marinated and fried chicken wings',price:'₹220',type:'nonveg'},
    {name:'Mutton Seekh Kabab',desc:'Minced lamb with herbs on skewers',price:'₹260',type:'nonveg'},
    {name:'Fish Fry',desc:'Spiced crispy fried fish with lime and onion',price:'₹230',type:'nonveg'},
  ]},
  {category:'🍛 Main Course — Veg',items:[
    {name:'Dal Makhani',desc:'Slow-cooked black lentils with butter and cream',price:'₹160',type:'veg'},
    {name:'Palak Paneer',desc:'Cottage cheese in smooth spinach gravy',price:'₹170',type:'veg'},
    {name:'Paneer Butter Masala',desc:'Paneer in rich tomato-butter-cream sauce',price:'₹180',type:'veg'},
    {name:'Shahi Paneer',desc:'Paneer in royal cashew-onion gravy',price:'₹190',type:'veg'},
    {name:'Matar Mushroom',desc:'Peas and mushroom in spiced onion-tomato gravy',price:'₹150',type:'veg'},
    {name:'Mixed Veg Curry',desc:'Seasonal vegetables in homestyle masala',price:'₹140',type:'veg'},
  ]},
  {category:'🍖 Main Course — Non Veg',items:[
    {name:'Butter Chicken',desc:'Tandoori chicken in velvety tomato-butter gravy',price:'₹240',type:'nonveg'},
    {name:'Chicken Rara',desc:'Minced and whole chicken in bold spicy masala',price:'₹250',type:'nonveg'},
    {name:'Mutton Rogan Josh',desc:'Kashmiri-style slow-cooked lamb',price:'₹300',type:'nonveg'},
    {name:'Chicken Kadai',desc:'Stir-fried chicken with bell peppers',price:'₹240',type:'nonveg'},
    {name:'Keema Matar',desc:'Minced lamb with green peas and spices',price:'₹260',type:'nonveg'},
    {name:'Fish Curry',desc:'Fresh fish in tangy masala gravy',price:'₹270',type:'nonveg'},
    {name:'Prawn Masala',desc:'Juicy prawns in spiced onion-tomato base',price:'₹290',type:'nonveg'},
  ]},
  {category:'🍚 Rice & Biryani',items:[
    {name:'Veg Biryani',desc:'Fragrant basmati with seasonal vegetables and saffron',price:'₹160',type:'veg'},
    {name:'Chicken Biryani',desc:'Dum-cooked basmati with tender chicken',price:'₹220',type:'nonveg'},
    {name:'Mutton Biryani',desc:'Slow-cooked aromatic lamb biryani — house special',price:'₹280',type:'nonveg'},
    {name:'Egg Biryani',desc:'Spiced basmati with boiled eggs and masala',price:'₹180',type:'egg'},
    {name:'Plain Steamed Rice',desc:'Long-grain basmati',price:'₹80',type:'veg'},
    {name:'Jeera Rice',desc:'Cumin-tempered basmati',price:'₹100',type:'veg'},
  ]},
  {category:'🫓 Breads',items:[
    {name:'Tandoori Roti',desc:'Whole-wheat flatbread from clay oven',price:'₹25',type:'veg'},
    {name:'Butter Naan',desc:'Soft leavened bread with butter, baked in tandoor',price:'₹35',type:'veg'},
    {name:'Garlic Naan',desc:'Naan brushed with garlic butter and coriander',price:'₹45',type:'veg'},
    {name:'Lachha Paratha',desc:'Layered flaky whole-wheat bread',price:'₹40',type:'veg'},
    {name:'Puri (2 pcs)',desc:'Puffed deep-fried wheat bread',price:'₹30',type:'veg'},
  ]},
  {category:'🍝 Chinese & Continental',items:[
    {name:'Veg Hakka Noodles',desc:'Stir-fried noodles with vegetables and sauces',price:'₹130',type:'veg'},
    {name:'Chicken Fried Rice',desc:'Wok-tossed rice with egg and chicken',price:'₹170',type:'nonveg'},
    {name:'Veg Fried Rice',desc:'Classic Indo-Chinese style with mixed vegetables',price:'₹130',type:'veg'},
    {name:'Grilled Sandwich',desc:'Multi-grain with cheese, veggies, and mustard',price:'₹90',type:'veg'},
    {name:'Club Sandwich',desc:'Triple-decker with chicken, egg, lettuce, tomato',price:'₹140',type:'nonveg'},
  ]},
  {category:'🥤 Beverages',items:[
    {name:'Masala Chai',desc:'Spiced ginger tea with milk',price:'₹30',type:'veg'},
    {name:'Filter Coffee',desc:'South Indian drip-brewed strong coffee',price:'₹40',type:'veg'},
    {name:'Fresh Lime Soda',desc:'Sweet, salty or masala',price:'₹50',type:'veg'},
    {name:'Mango Lassi',desc:'Chilled yogurt drink with ripe mango',price:'₹80',type:'veg'},
    {name:'Buttermilk (Chaas)',desc:'Chilled spiced yogurt drink',price:'₹40',type:'veg'},
    {name:'Cold Coffee',desc:'Blended iced coffee with milk and cream',price:'₹80',type:'veg'},
    {name:'Fresh Juice',desc:'Seasonal — Orange / Mosambi / Watermelon',price:'₹70',type:'veg'},
  ]},
  {category:'🍮 Desserts',items:[
    {name:'Gulab Jamun (2 pcs)',desc:'Soft milk-solid dumplings in rose sugar syrup',price:'₹70',type:'veg'},
    {name:'Rasgulla (2 pcs)',desc:'Light cottage cheese balls in sugar syrup',price:'₹70',type:'veg'},
    {name:'Kheer',desc:'Creamy rice pudding with cardamom and dry fruits',price:'₹90',type:'veg'},
    {name:'Gajar Halwa',desc:'Carrot pudding with ghee, milk and dry fruits',price:'₹100',type:'veg'},
    {name:'Ice Cream (2 scoops)',desc:'Vanilla / Chocolate / Butterscotch / Strawberry',price:'₹80',type:'veg'},
    {name:'Fruit Custard',desc:'Chilled vanilla custard with seasonal fruits',price:'₹90',type:'veg'},
  ]},
];

/* ── BUILD MENU BOOK ── */
let bookSpreads=[], currentSpread=0;
function buildMenuBook(){
  const book=document.getElementById('theBook'); if(!book) return;
  book.innerHTML=''; bookSpreads=[]; currentSpread=0;
  const cs=mkSpread();
  cs.innerHTML=`
    <div class="bpage cover">
      <div class="cover-orn">🍽️</div>
      <div class="cover-hotel">Hotel Highway Memories</div>
      <div class="cover-rule"></div>
      <div class="cover-menu-word">Menu</div>
      <div class="cover-est">Est. 2005 · NH-44</div>
    </div>
    <div class="bpage right" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
      <p style="font-size:.52rem;letter-spacing:.35em;text-transform:uppercase;color:#8B5E3C;margin-bottom:1rem;">Welcome</p>
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#5C3A1E;line-height:1.7;max-width:200px;font-style:italic;">"Good food is the foundation of genuine happiness."</p>
      <div style="width:36px;height:1px;background:#C9956A;margin:1.2rem auto;"></div>
      <p style="font-size:.62rem;color:rgba(139,94,60,.45);line-height:1.8;">All prices inclusive of taxes.<br>Please inform us of any allergies.</p>
      <div style="margin-top:1.5rem;display:flex;gap:1rem;justify-content:center;font-size:.58rem;color:rgba(139,94,60,.4);">
        <span>🟢 Veg</span><span>🟡 Egg</span><span>🔴 Non-Veg</span>
      </div>
      <div class="page-num" style="position:static;margin-top:auto;padding-top:2rem;">i</div>
    </div>`;
  cs.classList.add('active');
  book.appendChild(cs); bookSpreads.push(cs);

  const allPages=[];
  MENU_DATA.forEach(cat=>{
    for(let i=0;i<cat.items.length;i+=5)
      allPages.push({cat:i===0?cat.category:null,items:cat.items.slice(i,i+5)});
  });
  for(let i=0;i<allPages.length;i+=2){
    const sp=mkSpread();
    sp.innerHTML=buildPageHTML(allPages[i],'left',i+1)+(allPages[i+1]?buildPageHTML(allPages[i+1],'right',i+2):'<div class="bpage right"></div>');
    book.appendChild(sp); bookSpreads.push(sp);
  }

  const bc=mkSpread();
  bc.innerHTML=`
    <div class="bpage left" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;">
      <p style="font-family:'Cormorant Garamond',serif;font-size:1.1rem;color:#5C3A1E;margin-bottom:.6rem;font-weight:600;">Thank You</p>
      <p style="font-size:.7rem;color:rgba(139,94,60,.45);line-height:1.8;">We hope you enjoyed your meal.<br>Come back soon!</p>
      <div style="margin-top:1.5rem;font-size:.65rem;color:rgba(139,94,60,.35);">📞 +91 80057 12743</div>
    </div>
    <div class="bpage cover" style="background:linear-gradient(145deg,#2d1e0a 0%,#1a1005 100%) !important;">
      <div class="cover-orn">🏨</div>
      <div class="cover-hotel">Hotel Highway Memories</div>
      <div class="cover-rule"></div>
      <div class="cover-est">NH-44, Kukas, Rajasthan</div>
    </div>`;
  book.appendChild(bc); bookSpreads.push(bc);

  buildBookDots(); updateBookInfo();

  const bookEl = document.getElementById('theBook');
  let bStartX = 0;
  bookEl.addEventListener('touchstart', e => { bStartX = e.touches[0].clientX; }, {passive:true});
  bookEl.addEventListener('touchend', e => {
    const diff = bStartX - e.changedTouches[0].clientX;
    if(Math.abs(diff) > 50) turnPage(diff > 0 ? 1 : -1);
  }, {passive:true});
}
function mkSpread(){const s=document.createElement('div');s.className='book-spread';return s;}
function buildPageHTML(pg,side,num){
  const bm={veg:'mi-veg',egg:'mi-egg',nonveg:'mi-nonveg'}, bl={veg:'VEG',egg:'EGG',nonveg:'N-VEG'};
  let h='<div class="bpage '+side+'">';
  if(pg.cat) h+='<div class="pg-cat">'+pg.cat+'</div>';
  pg.items.forEach(it=>{
    const t=bm[it.type]||'mi-veg', l=bl[it.type]||'VEG';
    h+=`<div class="menu-item-row">
      <div class="mi-left">
        <div class="mi-name">${it.name}<span class="mi-badge ${t}">${l}</span></div>
        <div class="mi-desc">${it.desc}</div>
      </div>
      <div class="mi-price">${it.price}</div>
    </div>`;
  });
  h+='<div class="page-num">'+num+'</div></div>';
  return h;
}
function buildBookDots(){
  const el=document.getElementById('bookDots'); if(!el) return;
  el.innerHTML='';
  const maxD=Math.min(bookSpreads.length,12);
  for(let i=0;i<maxD;i++){
    const d=document.createElement('div'); d.className='book-dot'+(i===0?' on':'');
    const idx=Math.round(i*(bookSpreads.length-1)/Math.max(maxD-1,1));
    d.onclick=()=>jumpSpread(idx); el.appendChild(d);
  }
}
function updateBookInfo(){
  const el=document.getElementById('bookPageInfo');
  if(el) el.textContent='Spread '+(currentSpread+1)+' of '+bookSpreads.length;
  document.getElementById('bookPrev').disabled=currentSpread===0;
  document.getElementById('bookNext').disabled=currentSpread===bookSpreads.length-1;
  const maxD=Math.min(bookSpreads.length,12);
  document.querySelectorAll('.book-dot').forEach((d,i)=>{
    const idx=Math.round(i*(bookSpreads.length-1)/Math.max(maxD-1,1));
    d.classList.toggle('on',idx===currentSpread);
  });
}
function turnPage(dir){
  const next=currentSpread+dir;
  if(next<0||next>=bookSpreads.length) return;
  const cur=bookSpreads[currentSpread], tgt=bookSpreads[next];
  cur.classList.remove('active'); cur.classList.add(dir>0?'pg-out':'pg-in');
  setTimeout(()=>{
    cur.classList.remove('pg-out','pg-in');
    currentSpread=next; tgt.classList.add('active','pg-in');
    setTimeout(()=>tgt.classList.remove('pg-in'),450);
    updateBookInfo();
  },420);
}
function jumpSpread(idx){
  if(idx===currentSpread) return;
  bookSpreads[currentSpread].classList.remove('active');
  currentSpread=idx;
  bookSpreads[idx].classList.add('active','pg-in');
  setTimeout(()=>bookSpreads[idx].classList.remove('pg-in'),450);
  updateBookInfo();
}
function openMenuBook(){buildMenuBook();document.getElementById('menuModal').classList.add('open');document.body.style.overflow='hidden';}
function closeMenuBook(){document.getElementById('menuModal').classList.remove('open');document.body.style.overflow='';}
document.getElementById('menuModal').onclick=function(e){if(e.target===this)closeMenuBook();};

/* ── ADMIN ── */
let adminW=null;
function openAdminLogin(){document.getElementById('adminPwd').value='';document.getElementById('adminErr').style.display='none';document.getElementById('adminLoginOv').classList.add('open');document.body.style.overflow='hidden';}
function closeAdminLogin(){document.getElementById('adminLoginOv').classList.remove('open');document.body.style.overflow='';}
function doLogin(){if(document.getElementById('adminPwd').value===ADMIN_PASS){closeAdminLogin();openAdminDash();}else{document.getElementById('adminErr').style.display='block';document.getElementById('adminPwd').select();}}
function doLogout(){closeAdminDash();}
function openAdminDash(){
  adminW=JSON.parse(JSON.stringify(D));
  document.getElementById('aSD').value=adminW.sdPrice;
  document.getElementById('aTR').value=adminW.trPrice;
  document.getElementById('aPM').value=adminW.pmPrice;

  // Sort helper
  const sortKeys = keys => keys.sort((a,b)=>{
    const na=parseInt(a),nb=parseInt(b);
    if(na!==nb) return na-nb;
    return String(a).localeCompare(String(b));
  });

  const sdc=document.getElementById('aSDPills'); sdc.innerHTML='';
  sortKeys(Object.keys(adminW.sd)).forEach(n=>{
    const p=mkAdmPill(n,adminW.sd[n],()=>{adminW.sd[n]=!adminW.sd[n];p.className='adm-pill '+(adminW.sd[n]?'a':'o');p.innerHTML=admPillHTML(n,adminW.sd[n]);});
    sdc.appendChild(p);
  });
  const trc=document.getElementById('aTRPills'); trc.innerHTML='';
  sortKeys(Object.keys(adminW.tr)).forEach(n=>{
    const p=mkAdmPill(n,adminW.tr[n],()=>{adminW.tr[n]=!adminW.tr[n];p.className='adm-pill '+(adminW.tr[n]?'a':'o');p.innerHTML=admPillHTML(n,adminW.tr[n]);});
    trc.appendChild(p);
  });
  const pmc=document.getElementById('aPMPills'); pmc.innerHTML='';
  sortKeys(Object.keys(adminW.pm)).forEach(n=>{
    const p=mkAdmPill(n,adminW.pm[n],()=>{adminW.pm[n]=!adminW.pm[n];p.className='adm-pill '+(adminW.pm[n]?'a':'o');p.innerHTML=admPillHTML(n,adminW.pm[n]);});
    pmc.appendChild(p);
  });
  document.getElementById('adminDashOv').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAdminDash(){document.getElementById('adminDashOv').classList.remove('open');document.body.style.overflow='';}
function mkAdmPill(n,av,cb){const p=document.createElement('div');p.className='adm-pill '+(av?'a':'o');p.innerHTML=admPillHTML(n,av);p.onclick=cb;return p;}
function admPillHTML(n,av){return '<span style="font-size:.58rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.68rem;line-height:1">'+(av?'✓':'✕')+'</span>';}
async function saveAdmin(){
  const sdP=parseInt(document.getElementById('aSD').value);
  const trP=parseInt(document.getElementById('aTR').value);
  const pmP=parseInt(document.getElementById('aPM').value);
  if(sdP>0) adminW.sdPrice=sdP;
  if(trP>0) adminW.trPrice=trP;
  if(pmP>0) adminW.pmPrice=pmP;
  D=JSON.parse(JSON.stringify(adminW));
  const t=document.getElementById('toast'); t.textContent='⏳ Saving...'; t.style.display='block';
  await saveData();
  syncPrices(); syncSliders();
  t.textContent='✅ Saved! All devices will update.';
  clearTimeout(t._t); t._t=setTimeout(()=>t.style.display='none',3500);
}

/* ── ESC ── */
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  closeModal(); closeAdminDash(); closeAdminLogin(); closeMenuBook(); closeMobMenu();
  document.body.style.overflow='';
});



