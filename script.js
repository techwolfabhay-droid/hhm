/* ================================================================
   CONFIG
================================================================ */
const ADMIN_PASS = 'highway2025';
const WA_NUM    = '918005712743';
const BIN_ID    = '69bd80a3aa77b81da9026353';
const MASTER_KEY= '$2a$10$VM.F.wVc8BUH2VJTnzDOyujTY3zLO5UOYQ8attzqzSdZ5ftrIINz6';
const BIN_URL   = `https://api.jsonbin.io/v3/b/${BIN_ID}`;
 
const SD_SLIDES = [
  {label:'Super Deluxe — Photo 1',file:'family1.jpeg'},
  {label:'Super Deluxe — Photo 2',file:'family2.jpeg'},
  {label:'Super Deluxe — Photo 3',file:'family3.jpeg'},
  {label:'Super Deluxe — Photo 4',file:'family4.jpeg'},
  {label:'Super Deluxe — Photo 5',file:'family5.jpeg'},
];
const TR_SLIDES = [
  {label:'Triple Room — Photo 1',file:'triple1.jpeg'},
  {label:'Triple Room — Photo 2',file:'family3.jpeg'},
  {label:'Triple Room — Photo 3',file:'triple3.jpeg'},
  {label:'Triple Room — Photo 4',file:'triple1.jpeg'},
  {label:'Triple Room — Photo 5',file:'deluxe3.jpeg'},
];
const PM_SLIDES = [
  {label:'Family Suite — Photo 1',file:'deluxe1.jpeg'},
  {label:'Family Suite — Photo 2',file:'deluxe2.jpeg'},
  {label:'Family Suite — Photo 3',file:'deluxe3.jpeg'},
  {label:'Family Suite — Photo 4',file:'deluxe4.jpeg'},
  {label:'Family Suite — Photo 5',file:'deluxe5.jpeg'},
];
 
const PM_ROOM_KEYS = [
  '101','102','103','104','105','106','201','202','203','204','205','206'
];
const SD_ROOM_KEYS = [301,302,303,305,306,308,309,401,403];
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
      if (!D.trPrice) D.trPrice = 3500;
      if (!D.pmPrice) D.pmPrice = 4500;
      const sdKeys = Object.keys(D.sd||{});
      if (!sdKeys.includes('301')) D.sd = Object.fromEntries(SD_ROOM_KEYS.map(k=>[k,true]));
      const trKeys = Object.keys(D.tr||{});
      if (!trKeys.includes('304')) D.tr = Object.fromEntries(TR_ROOM_KEYS.map(k=>[k,true]));
      const pmKeys = Object.keys(D.pm||{});
      if (!pmKeys.includes('101')) D.pm = Object.fromEntries(PM_ROOM_KEYS.map(k=>[k,true]));
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
  // Slide info hide
  const oldInfo = document.getElementById('hsi' + heroIdx);
  if (oldInfo) oldInfo.style.display = 'none';
  
  heroIdx = (idx + heroSlides.length) % heroSlides.length;
  heroSlides[heroIdx].classList.add('active');
  heroDots[heroIdx].classList.add('on');
  // Slide info show
  const newInfo = document.getElementById('hsi' + heroIdx);
  if (newInfo) newInfo.style.display = 'block';
}
function heroSlide(dir) {
  clearInterval(heroTimer);
  heroGoTo(heroIdx + dir);
  heroTimer = setInterval(() => heroGoTo(heroIdx + 1), 4500);
}
heroDots.forEach((d, i) => d.addEventListener('click', () => {
  clearInterval(heroTimer);
  heroGoTo(i);
  heroTimer = setInterval(() => heroGoTo(heroIdx + 1), 4500);
}));
heroTimer = setInterval(() => heroGoTo(heroIdx + 1), 4500);
 
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
   MENU BOOK DATA — Updated from actual menu photos
================================================================ */
const MENU_DATA = [
  {category:'☀️ Mini Meals / Breakfast',items:[
    {name:'Bread Butter / Jam (4 Slices)',desc:'Toasted bread with butter or jam',price:'₹110',type:'veg'},
    {name:'Poha',desc:'Flattened rice with mustard, curry leaves, peanuts',price:'₹120',type:'veg'},
    {name:'Masala Maggie',desc:'Classic Maggie noodles with spices',price:'₹120',type:'veg'},
    {name:'Aloo Parantha',desc:'Stuffed whole-wheat flatbread with spiced potato',price:'₹120',type:'veg'},
    {name:'Aloo Pyaz Parantha',desc:'Potato & onion stuffed flatbread',price:'₹130',type:'veg'},
    {name:'Aloo Gobhi Parantha',desc:'Potato & cauliflower stuffed flatbread',price:'₹150',type:'veg'},
    {name:'Mix Parantha',desc:'Mixed vegetable stuffed flatbread',price:'₹150',type:'veg'},
    {name:'Paneer Parantha',desc:'Cottage cheese stuffed flatbread',price:'₹160',type:'veg'},
    {name:'Poori Bhaji',desc:'Puffed bread served with spiced potato curry',price:'₹180',type:'veg'},
    {name:'Pav Bhaji',desc:'Buttered pav with spiced mixed vegetable bhaji',price:'₹195',type:'veg'},
    {name:'Chole Bhature',desc:'Spiced chickpeas with fried bread',price:'₹230',type:'veg'},
    {name:'Amritsari Chole Kulche',desc:'Amritsari style chole with kulcha',price:'₹250',type:'veg'},
    {name:'Extra Bhature (1 Pc)',desc:'Additional bhatura',price:'₹80',type:'veg'},
    {name:'Extra Poori (2 Pcs)',desc:'Additional pooris',price:'₹70',type:'veg'},
    {name:'Extra Pav',desc:'Additional pav bread',price:'₹80',type:'veg'},
  ]},
  {category:'🍲 Soups',items:[
    {name:'Tomato Soup',desc:'Creamy fresh tomato soup',price:'₹150',type:'veg'},
    {name:'Sweet Corn Soup',desc:'Creamy sweet corn soup',price:'₹160',type:'veg'},
    {name:'Hot & Sour Soup',desc:'Tangy Indo-Chinese style hot & sour',price:'₹170',type:'veg'},
    {name:'Veg. Soup',desc:'Mixed vegetable clear soup',price:'₹170',type:'veg'},
    {name:'Manchao Soup',desc:'Hot tangy Indo-Chinese with crispy noodles',price:'₹180',type:'veg'},
  ]},
  {category:'🔥 Tandoor Se (Veg Starters)',items:[
    {name:'Paneer Tikka',desc:'Marinated cottage cheese grilled in tandoor',price:'₹320',type:'veg'},
    {name:'Malai Paneer Tikka',desc:'Creamy marinated paneer tikka',price:'₹340',type:'veg'},
    {name:'Mushroom Tikka',desc:'Spiced mushrooms grilled in tandoor',price:'₹330',type:'veg'},
    {name:'Afghani Paneer Tikka',desc:'Afghani style creamy paneer tikka',price:'₹330',type:'veg'},
    {name:'Nazakat Aloo',desc:'Spiced potato preparation from tandoor',price:'₹270',type:'veg'},
    {name:'Peshawari Aloo',desc:'Peshawari style potato tikka',price:'₹250',type:'veg'},
    {name:'Soya Chaap Tikka',desc:'Tandoor grilled soya chaap with spices',price:'₹340',type:'veg'},
    {name:'Malai Soya Chaap Tikka',desc:'Creamy marinated soya chaap tikka',price:'₹360',type:'veg'},
    {name:'Paneer Tikka Roll',desc:'Paneer tikka wrapped in flatbread',price:'₹350',type:'veg'},
    {name:'Veg. Roll',desc:'Mixed vegetable roll',price:'₹280',type:'veg'},
  ]},
  {category:'🥗 Salad & Papad',items:[
    {name:'Green Salad',desc:'Fresh seasonal green salad',price:'₹90',type:'veg'},
    {name:'Onion Salad',desc:'Sliced onion with lime and spices',price:'₹80',type:'veg'},
    {name:'Masala Pyaz',desc:'Spiced onion mix',price:'₹110',type:'veg'},
    {name:'Garlic Chutney',desc:'Fresh garlic chutney',price:'₹90',type:'veg'},
    {name:'Fry Mirchi',desc:'Fried green chillies',price:'₹70',type:'veg'},
    {name:'Masala Papad',desc:'Crispy papad with masala topping',price:'₹70',type:'veg'},
    {name:'Fry Papad',desc:'Deep fried crispy papad',price:'₹40',type:'veg'},
    {name:'Roasted Papad',desc:'Roasted papad',price:'₹30',type:'veg'},
    {name:'Sabut Dana Papad',desc:'Whole grain papad',price:'₹60',type:'veg'},
  ]},
  {category:'🍟 Starters (Veg)',items:[
    {name:'Bhelpuri',desc:'Puffed rice with chutneys and vegetables',price:'₹170',type:'veg'},
    {name:'Kurkure Bhel',desc:'Crispy kurkure bhel mix',price:'₹180',type:'veg'},
    {name:'Namkeen Shots (6 Pcs)',desc:'Bite-sized namkeen shots',price:'₹180',type:'veg'},
    {name:'Bingo Bhel',desc:'Bingo style bhel mix',price:'₹180',type:'veg'},
    {name:'Nachos Bhel',desc:'Nachos with bhel toppings',price:'₹220',type:'veg'},
    {name:'French Fries',desc:'Crispy golden french fries',price:'₹190',type:'veg'},
    {name:'Peri Peri French Fries',desc:'Spicy peri peri seasoned fries',price:'₹210',type:'veg'},
    {name:'Spring Rolls',desc:'Crispy vegetable stuffed spring rolls',price:'₹230',type:'veg'},
    {name:'Peanut Masala',desc:'Spiced masala peanuts',price:'₹210',type:'veg'},
    {name:'Bhujiya Chaat',desc:'Crispy bhujiya chaat',price:'₹190',type:'veg'},
    {name:'Hara Bhara Kabab',desc:'Spinach and pea cakes, mildly spiced',price:'₹230',type:'veg'},
    {name:'Veg. Pakoda (8 Pcs)',desc:'Crispy mixed vegetable fritters',price:'₹210',type:'veg'},
    {name:'Aloo Chaat',desc:'Spiced potato chaat with chutneys',price:'₹220',type:'veg'},
    {name:'Cheese Balls (6 Pcs)',desc:'Crispy golden cheese balls',price:'₹250',type:'veg'},
    {name:'Paneer Pakoda (8 Pcs)',desc:'Crispy battered paneer fritters',price:'₹250',type:'veg'},
    {name:'Karari Roti',desc:'Crispy Karari roti starter',price:'₹280',type:'veg'},
  ]},
  {category:'🍛 Delicious Veg (Main Course)',items:[
    {name:'Kaju Curry',desc:'Cashew nut in rich creamy gravy',price:'₹370',type:'veg'},
    {name:'Paneer Cheese Rolls',desc:'Paneer cheese rolls in masala',price:'₹320',type:'veg'},
    {name:'Navratan Korma',desc:'Nine-vegetable korma in mild creamy sauce',price:'₹320',type:'veg'},
    {name:'Paneer Tikka Masala',desc:'Grilled paneer in spiced masala gravy',price:'₹320',type:'veg'},
    {name:'Soya Chaap Masala',desc:'Soya chaap in rich masala gravy',price:'₹350',type:'veg'},
    {name:'Paneer Bhurji',desc:'Scrambled spiced cottage cheese',price:'₹310',type:'veg'},
    {name:'Veg. Kolhapuri',desc:'Spicy Kolhapuri style mixed vegetables',price:'₹290',type:'veg'},
    {name:'Dhaba Paneer',desc:'Rustic dhaba style paneer',price:'₹290',type:'veg'},
    {name:'Matar Mushroom',desc:'Peas and mushroom in spiced gravy',price:'₹310',type:'veg'},
    {name:'Kadhai Paneer',desc:'Paneer cooked in kadhai with bell peppers',price:'₹290',type:'veg'},
    {name:'Handi Paneer',desc:'Paneer slow cooked in handi',price:'₹290',type:'veg'},
    {name:'Malai Kofta',desc:'Fried paneer balls in rich cream gravy',price:'₹290',type:'veg'},
    {name:'Paneer Butter Masala',desc:'Paneer in rich tomato-butter-cream sauce',price:'₹280',type:'veg'},
    {name:'Paneer Lababdar',desc:'Paneer in onion-tomato lababdar gravy',price:'₹280',type:'veg'},
    {name:'Shahi Paneer',desc:'Paneer in royal cashew-onion gravy',price:'₹280',type:'veg'},
    {name:'Khoya Paneer',desc:'Paneer with khoya in rich gravy',price:'₹280',type:'veg'},
    {name:'Mushroom Masala',desc:'Button mushrooms in spiced masala',price:'₹285',type:'veg'},
    {name:'Matar Paneer',desc:'Peas and cottage cheese in tomato gravy',price:'₹270',type:'veg'},
    {name:'Palak Paneer',desc:'Cottage cheese in smooth spinach gravy',price:'₹260',type:'veg'},
    {name:'Mix Veg.',desc:'Seasonal vegetables in homestyle masala',price:'₹260',type:'veg'},
    {name:'Veg. Jalfreji',desc:'Stir-fried mixed vegetables Jalfrezi style',price:'₹260',type:'veg'},
    {name:'Chana Masala',desc:'Spiced chickpeas in tangy gravy',price:'₹260',type:'veg'},
    {name:'Sev Tamatar',desc:'Crispy sev with tomato gravy',price:'₹250',type:'veg'},
    {name:'Bhindi Masala',desc:'Spiced okra dry masala',price:'₹250',type:'veg'},
    {name:'Gatta Masala',desc:'Rajasthani gatta in spiced gravy',price:'₹240',type:'veg'},
    {name:'Dum Aloo',desc:'Baby potatoes in rich dum masala',price:'₹240',type:'veg'},
    {name:'Kashmiri Dum Aloo',desc:'Kashmiri style dum aloo in yogurt gravy',price:'₹240',type:'veg'},
    {name:'Haryali Kofta',desc:'Green herb kofta in spinach gravy',price:'₹240',type:'veg'},
    {name:'Dal Palak',desc:'Lentils cooked with spinach',price:'₹240',type:'veg'},
    {name:'Kadhi Pakoda',desc:'Yogurt gravy with fried pakodas',price:'₹230',type:'veg'},
    {name:'Jeera Aloo',desc:'Cumin tempered potatoes',price:'₹220',type:'veg'},
    {name:'Aloo Gobhi',desc:'Potato and cauliflower dry masala',price:'₹220',type:'veg'},
    {name:'Gobhi Masala',desc:'Cauliflower in spiced masala gravy',price:'₹220',type:'veg'},
  ]},
  {category:'🫘 Dal',items:[
    {name:'Dal Fry',desc:'Yellow lentils tempered with spices',price:'₹230',type:'veg'},
    {name:'Dal Tadka',desc:'Dal with classic tadka tempering',price:'₹230',type:'veg'},
    {name:'Dal Dhaba',desc:'Rustic dhaba style mixed dal',price:'₹230',type:'veg'},
    {name:'Dal Makhani',desc:'Slow-cooked black lentils with butter and cream',price:'₹250',type:'veg'},
    {name:'Rajma',desc:'Red kidney beans in spiced gravy',price:'₹250',type:'veg'},
  ]},
  {category:'🍚 Rice',items:[
    {name:'Veg. Biryani',desc:'Fragrant basmati with seasonal vegetables and saffron',price:'₹275',type:'veg'},
    {name:'Veg. Pulaao',desc:'Vegetable pulao with aromatic spices',price:'₹250',type:'veg'},
    {name:'Jeera Rice',desc:'Cumin-tempered long-grain basmati',price:'₹210',type:'veg'},
    {name:'Plain Rice',desc:'Steamed long-grain basmati rice',price:'₹180',type:'veg'},
    {name:'Veg. Biryani With Raita',desc:'Veg biryani served with raita',price:'₹310',type:'veg'},
  ]},
  {category:'🫓 Assorted Breads',items:[
    {name:'Tawa / Tandoori Roti',desc:'Whole-wheat flatbread from tawa or clay oven',price:'₹30',type:'veg'},
    {name:'Butter Tawa / Tandoori Roti',desc:'Buttered whole-wheat flatbread',price:'₹35',type:'veg'},
    {name:'Plain Naan',desc:'Soft leavened bread baked in tandoor',price:'₹90',type:'veg'},
    {name:'Missi Roti',desc:'Spiced gram flour flatbread',price:'₹90',type:'veg'},
    {name:'Lacha Parantha',desc:'Layered flaky whole-wheat bread',price:'₹80',type:'veg'},
    {name:'Missi Onion Roti',desc:'Missi roti with onion',price:'₹110',type:'veg'},
    {name:'Butter Naan',desc:'Soft naan with butter glaze',price:'₹100',type:'veg'},
    {name:'Cheese Naan',desc:'Naan stuffed with melted cheese',price:'₹120',type:'veg'},
    {name:'Stuffed Naan',desc:'Naan stuffed with spiced filling',price:'₹130',type:'veg'},
    {name:'Garlic Naan',desc:'Naan brushed with garlic butter and coriander',price:'₹130',type:'veg'},
    {name:'Ajwain Parantha',desc:'Carom-seed flaky parantha',price:'₹130',type:'veg'},
    {name:'Chur Chur Naan',desc:'Crispy layered chur chur naan',price:'₹150',type:'veg'},
    {name:'Kashmiri Naan',desc:'Sweet naan with dry fruits and coconut',price:'₹170',type:'veg'},
  ]},
  {category:'🥣 Raita',items:[
    {name:'Fruit Raita',desc:'Chilled yogurt with seasonal fruits',price:'₹220',type:'veg'},
    {name:'Veg. Raita',desc:'Yogurt with mixed vegetables',price:'₹180',type:'veg'},
    {name:'Boondi Raita',desc:'Yogurt with fried boondi drops',price:'₹160',type:'veg'},
    {name:'Cucumber Raita',desc:'Chilled yogurt with cucumber',price:'₹140',type:'veg'},
    {name:'Onion Raita',desc:'Yogurt with onion and green chilli',price:'₹140',type:'veg'},
    {name:'Plain Raita',desc:'Simple chilled yogurt',price:'₹130',type:'veg'},
    {name:'Curd',desc:'Fresh set curd',price:'₹90',type:'veg'},
  ]},
  {category:'🍝 Chinese Starter',items:[
    {name:'Honey Chilli Potato',desc:'Crispy potato tossed in honey chilli sauce',price:'₹230',type:'veg'},
    {name:'Veg. Chowmein',desc:'Stir-fried noodles with vegetables',price:'₹210',type:'veg'},
    {name:'Hakka Noodles',desc:'Indo-Chinese style hakka noodles',price:'₹250',type:'veg'},
    {name:'Veg. Fried Rice',desc:'Wok-tossed rice with mixed vegetables',price:'₹250',type:'veg'},
    {name:'Veg. Manchurian (6 Pcs)',desc:'Vegetable balls in tangy Manchurian sauce',price:'₹280',type:'veg'},
    {name:'Chilly Paneer',desc:'Crispy paneer tossed in chilli sauce',price:'₹280',type:'veg'},
    {name:'Nachos Platter',desc:'Loaded nachos platter with dips',price:'₹320',type:'veg'},
    {name:'Chilli Garlic Noodles',desc:'Spicy garlic flavoured noodles',price:'₹250',type:'veg'},
    {name:'Crispy Corn',desc:'Crispy fried corn with spices',price:'₹210',type:'veg'},
  ]},
  {category:'🍕 Italian Starter & Breads',items:[
    {name:'Red Sauce Pasta',desc:'Penne in classic tomato red sauce',price:'₹270',type:'veg'},
    {name:'White Sauce Pasta',desc:'Creamy béchamel white sauce pasta',price:'₹270',type:'veg'},
    {name:'Pink Sauce Pasta',desc:'Pasta in blended pink sauce',price:'₹270',type:'veg'},
    {name:'Bombay Sandwich',desc:'Classic Bombay style grilled sandwich',price:'₹130',type:'veg'},
    {name:'Veg. Sandwich',desc:'Fresh vegetable sandwich',price:'₹150',type:'veg'},
    {name:'Veg. Cheese Grilled Sandwich',desc:'Grilled sandwich with cheese and vegetables',price:'₹170',type:'veg'},
    {name:'Veg. Paneer Tikka Grilled Sandwich',desc:'Grilled sandwich with paneer tikka filling',price:'₹195',type:'veg'},
    {name:'Sweet Corn Cheese Sandwich',desc:'Grilled sandwich with sweet corn and cheese',price:'₹210',type:'veg'},
  ]},
  {category:'🍕 Pizzas',items:[
    {name:'Cheese Pizza',desc:'Classic loaded cheese pizza',price:'₹200',type:'veg'},
    {name:'Magherita',desc:'Traditional tomato and mozzarella pizza',price:'₹240',type:'veg'},
    {name:'OTC Pizza',desc:'Our special OTC pizza',price:'₹260',type:'veg'},
    {name:'Highway Memory Special Pizza',desc:'Chef\'s signature special pizza',price:'₹325',type:'veg'},
    {name:'Paneer Tikka Pizza',desc:'Pizza topped with paneer tikka',price:'₹310',type:'veg'},
  ]},
  {category:'🍽️ Sizzlers',items:[
    {name:'Chinese Sizzler',desc:'Fried Rice, Veg Manchurian, Chilly Paneer, Honey Chilli Potato',price:'₹460',type:'veg'},
    {name:'Italian Sizzler',desc:'Pasta, French Fries, Hakka Noodle, Cheese Balls',price:'₹460',type:'veg'},
    {name:'Tandoori Sizzler',desc:'Paneer Tikka, Aloo Nazakat, Hara Bhara Kabab, Mushroom Tikka',price:'₹520',type:'veg'},
    {name:'Tandoori Platter',desc:'Paneer Tikka, Malai Soya Chaap Tikka, Hara Bhara Kabab, French Fries',price:'₹520',type:'veg'},
  ]},
  {category:'🍱 Thali',items:[
    {name:'Veg. Thali',desc:'Seasonal Veg, Dal, Pickle, Raita, 3 Tawa Roti / Tandoori Roti, Rice, Salad',price:'₹350',type:'veg'},
    {name:'Special Thali',desc:'Seasonal Veg, Dal Fry, Paneer Preparation, Pickle, Raita, Salad, Rice, 2 Tandoori Roti, 1 Laccha Parantha, 1 Papad, Chutney, 1 Sweet',price:'₹400',type:'veg'},
  ]},
  {category:'🍮 Desserts',items:[
    {name:'Gulab Jamun (2 Pcs)',desc:'Soft milk-solid dumplings in rose sugar syrup',price:'₹120',type:'veg'},
    {name:'Rasgulla (2 Pcs)',desc:'Light cottage cheese balls in sugar syrup',price:'₹110',type:'veg'},
    {name:'Rasmalai (2 Pcs)',desc:'Soft paneer discs in saffron-flavoured milk',price:'₹190',type:'veg'},
    {name:'Gulab Jamun With Ice Cream',desc:'Gulab jamun served with vanilla ice cream',price:'₹180',type:'veg'},
  ]},
  {category:'🍦 Frozen Dessert',items:[
    {name:'Vanilla Ice Cream',desc:'Classic creamy vanilla ice cream',price:'₹150',type:'veg'},
    {name:'Butter Scotch Ice Cream',desc:'Butterscotch flavoured ice cream',price:'₹150',type:'veg'},
    {name:'Chocolate Ice Cream',desc:'Rich chocolate ice cream',price:'₹150',type:'veg'},
    {name:'Strawberry Ice Cream',desc:'Fresh strawberry flavoured ice cream',price:'₹150',type:'veg'},
    {name:'American Nuts',desc:'Ice cream with american nuts topping',price:'₹150',type:'veg'},
    {name:'Chocho Chip Ice Cream',desc:'Choco chip ice cream',price:'₹150',type:'veg'},
    {name:'Havmor Ice Cream',desc:'Havmor brand ice cream — available flavours on request',price:'Available',type:'veg'},
  ]},
  {category:'🥤 Beverages Cold',items:[
    {name:'Butter Milk / Chaach',desc:'Chilled spiced yogurt drink',price:'₹80',type:'veg'},
    {name:'Mineral Water',desc:'Packaged mineral water',price:'₹25',type:'veg'},
    {name:'Sweet Lassi',desc:'Chilled sweet yogurt lassi',price:'₹95',type:'veg'},
    {name:'Cold Drink (500 ML)',desc:'Assorted cold beverages',price:'₹60',type:'veg'},
    {name:'Ice Tea',desc:'Chilled iced tea',price:'₹150',type:'veg'},
    {name:'Cold Coffee',desc:'Blended iced coffee',price:'₹185',type:'veg'},
    {name:'Cold Coffee With Ice Cream',desc:'Cold coffee topped with ice cream',price:'₹225',type:'veg'},
    {name:'Lemonade',desc:'Fresh lime lemonade',price:'₹190',type:'veg'},
  ]},
  {category:'🥤 Shakes',items:[
    {name:'Vanilla Shake',desc:'Classic creamy vanilla milkshake',price:'₹225',type:'veg'},
    {name:'Pineapple Shake',desc:'Fresh pineapple milkshake',price:'₹220',type:'veg'},
    {name:'Strawberry Shake',desc:'Fresh strawberry milkshake',price:'₹220',type:'veg'},
    {name:'Butterscotch Shake',desc:'Butterscotch flavoured milkshake',price:'₹230',type:'veg'},
    {name:'Virgin Mojito',desc:'Refreshing mint lime mojito',price:'₹185',type:'veg'},
    {name:'Chocolate Shake',desc:'Rich chocolate milkshake',price:'₹230',type:'veg'},
    {name:'Americano Shake',desc:'Coffee style americano shake',price:'₹195',type:'veg'},
    {name:'Oreo Shake',desc:'Oreo cookie blended milkshake',price:'₹250',type:'veg'},
    {name:'Five Star Shake',desc:'Five Star chocolate bar milkshake',price:'₹250',type:'veg'},
    {name:'Kitkat Shake',desc:'Kitkat chocolate milkshake',price:'₹250',type:'veg'},
  ]},
  {category:'☕ Beverages Hot',items:[
    {name:'Black Tea',desc:'Classic black tea',price:'₹50',type:'veg'},
    {name:'Green Tea',desc:'Refreshing green tea',price:'₹60',type:'veg'},
    {name:'Masala Tea',desc:'Spiced ginger masala chai',price:'₹50',type:'veg'},
    {name:'Tulsi Tea',desc:'Tulsi (holy basil) herbal tea',price:'₹50',type:'veg'},
    {name:'Hot Milk',desc:'Fresh hot milk',price:'₹80',type:'veg'},
    {name:'Caffe Classic',desc:'Classic hot coffee',price:'₹80',type:'veg'},
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
      <p style="font-size:.62rem;color:rgba(139,94,60,.45);line-height:1.8;">All prices exclusive of taxes.<br>Please inform us of any allergies.<br>Kitchen closed 10:30 PM – 7:00 AM.<br>Min. waiting time 20 mins.</p>
      <div style="margin-top:1rem;display:flex;gap:1rem;justify-content:center;font-size:.58rem;color:rgba(139,94,60,.4);">
        <span>🟢 Veg</span><span>🔴 Non-Veg</span>
      </div>
      <p style="font-size:.52rem;color:rgba(139,94,60,.3);margin-top:.8rem;line-height:1.6;">Breakfast: 8AM–10AM · Lunch: 1PM–4PM<br>Dinner: 7PM–10:30PM</p>
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
      <div style="margin-top:.8rem;font-size:.6rem;color:rgba(139,94,60,.3);line-height:2;">
        🚫 Tobacco, Alcohol & Smoking<br>strictly prohibited on property.<br><br>
        Orders served as per availability.<br>Rights of admission reserved.
      </div>
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



