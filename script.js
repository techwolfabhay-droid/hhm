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
const PM_SLIDES = [
  {label:'Premium Suite — Photo 1',file:'room9.jpeg'},
  {label:'Premium Suite — Photo 2',file:'room7.jpeg'},
  {label:'Premium Suite — Photo 3',file:'room5.jpeg'},
  {label:'Premium Suite — Photo 4',file:'romm1.jpeg'},
  {label:'Premium Suite — Photo 5',file:'room3.jpeg'},
];

let D = {
  sdPrice: 2500,
  pmPrice: 5500,
  sd: Object.fromEntries(Array.from({length:34},(_,i)=>[101+i,true])),
  pm: {201:true}
};

/* ── LOAD / SAVE (JSONBin) ── */
async function loadData() {
  try {
    const res  = await fetch(BIN_URL+'/latest', {headers:{'X-Master-Key':MASTER_KEY}});
    const json = await res.json();
    if (json.record && json.record.sd) D = json.record;
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

/* ── NAV ── */
const navEl = document.getElementById('nav');
window.addEventListener('scroll', () => navEl.classList.toggle('sc', scrollY > 60));

const hamBtn  = document.getElementById('hamBtn');
const mobMenu = document.getElementById('mobMenu');

function openMobMenu() {
  mobMenu.classList.add('open');
  hamBtn.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeMobMenu() {
  mobMenu.classList.remove('open');
  hamBtn.classList.remove('open');
  document.body.style.overflow = '';
}

hamBtn.addEventListener('click', openMobMenu);
document.getElementById('mobClose').addEventListener('click', closeMobMenu);
document.querySelectorAll('.mob-lnk').forEach(a => {
  a.addEventListener('click', closeMobMenu);
});

/* ── SCROLL REVEAL ── */
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('visible');revObs.unobserve(e.target);} });
},{threshold:.1});
document.querySelectorAll('.reveal').forEach(el => revObs.observe(el));

/* ── SLIDERS ── */
const sState = {SD:0, PM:0};
function buildSlider(id, slides) {
  const cont  = document.getElementById('slides'+id);
  const dotsEl= document.getElementById('dots'+id);
  if(!cont||!dotsEl) return;
  cont.innerHTML = ''; dotsEl.innerHTML = '';
  slides.forEach((s,i) => {
    const sl = document.createElement('div'); sl.className = 'slide';
    const img= document.createElement('img'); img.src=s.file; img.alt=s.label;
    img.onerror = function(){ this.style.display='none'; const ph=document.createElement('div'); ph.className='slide-ph'; ph.textContent=s.label; sl.appendChild(ph); };
    sl.appendChild(img); cont.appendChild(sl);
    const d = document.createElement('div'); d.className='sdot'+(i===0?' on':'');
    d.onclick=()=>goSlide(id,i); dotsEl.appendChild(d);
  });
  sState[id]=0; cont.style.transform='translateX(0)';
}
function goSlide(id, idx) {
  const cont=document.getElementById('slides'+id); if(!cont) return;
  const n=cont.children.length; if(!n) return;
  sState[id]=(idx+n)%n;
  cont.style.transform='translateX(-'+(sState[id]*100)+'%)';
  document.querySelectorAll('#dots'+id+' .sdot').forEach((d,i)=>d.classList.toggle('on',i===sState[id]));
}
function slideCard(id,dir){goSlide(id,sState[id]+dir);}
function syncSliders(){buildSlider('SD',SD_SLIDES);buildSlider('PM',PM_SLIDES);}
setInterval(()=>{goSlide('SD',sState.SD+1);goSlide('PM',sState.PM+1);},4500);

/* ── PRICES ── */
function syncPrices(){
  const sd=document.getElementById('sdPrice'), pm=document.getElementById('pmPrice');
  if(sd) sd.innerHTML='₹'+D.sdPrice.toLocaleString('en-IN')+' <small>/ night</small>';
  if(pm) pm.innerHTML='₹'+D.pmPrice.toLocaleString('en-IN')+' <small>/ night</small>';
}

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
  const isSD=mType==='super', rooms=isSD?D.sd:D.pm;
  const price=isSD?D.sdPrice:D.pmPrice, label=isSD?'Super Deluxe':'Premium Suite';
  const nums=Object.keys(rooms).map(Number).sort((a,b)=>a-b);
  document.getElementById('modalTitle').textContent=label+' — Room Availability';
  const cont=document.getElementById('pillsCont'); cont.innerHTML='';
  nums.forEach(n=>{
    const av=rooms[n]; const p=document.createElement('div');
    p.className='pill '+(av?'a':'o'); p.dataset.room=n;
    p.innerHTML='<span style="font-size:.7rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.7rem;line-height:1">'+(av?'🛏':'🔒')+'</span>';
    if(av) p.onclick=()=>togglePill(n,p,price,label);
    cont.appendChild(p);
  });
  const tot=nums.length,av=nums.filter(n=>rooms[n]).length;
  document.getElementById('sTot').textContent=tot;
  document.getElementById('sAvail').textContent=av;
  document.getElementById('sOccup').textContent=tot-av;
  document.getElementById('sSel').textContent=0;
  refreshBar(price,label);
}
function togglePill(n,pill,price,label){
  const idx=sel.indexOf(n);
  if(idx===-1){sel.push(n);pill.className='pill sel';pill.innerHTML='<span style="font-size:.7rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.75rem;line-height:1">✓</span>';}
  else{sel.splice(idx,1);pill.className='pill a';pill.innerHTML='<span style="font-size:.7rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.7rem;line-height:1">🛏</span>';}
  document.getElementById('sSel').textContent=sel.length;
  refreshBar(price,label);
}
function refreshBar(price,label){
  const bar=document.getElementById('selBar');
  if(!sel.length){bar.classList.add('hidden');document.getElementById('mNote').textContent='Fill details · Select rooms · Confirm via WhatsApp';return;}
  bar.classList.remove('hidden');
  const sorted=[...sel].sort((a,b)=>a-b);
  document.getElementById('sbType').textContent=label;
  document.getElementById('sbCnt').textContent=sel.length+' room'+(sel.length>1?'s':'');
  document.getElementById('sbTotal').textContent='₹'+(sel.length*price).toLocaleString('en-IN');
  document.getElementById('sbNums').textContent='Rooms: '+sorted.join(', ');
  document.getElementById('mNote').textContent=sel.length+' room'+(sel.length>1?'s':'')+' · ₹'+(sel.length*price).toLocaleString('en-IN')+'/night';
}
function clearSel(){
  const rooms=mType==='super'?D.sd:D.pm;
  const price=mType==='super'?D.sdPrice:D.pmPrice;
  const label=mType==='super'?'Super Deluxe':'Premium Suite';
  sel=[];
  document.querySelectorAll('#pillsCont .pill').forEach(p=>{
    const n=parseInt(p.dataset.room),av=rooms[n];
    p.className='pill '+(av?'a':'o');
    p.innerHTML='<span style="font-size:.7rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.7rem;line-height:1">'+(av?'🛏':'🔒')+'</span>';
  });
  document.getElementById('sSel').textContent=0;
  refreshBar(price,label);
}
function bookWA(){
  const name=document.getElementById('mName').value.trim();
  const phone=document.getElementById('mPhone').value.trim();
  const ci=document.getElementById('mCheckIn').value;
  const co=document.getElementById('mCheckOut').value;
  const req=document.getElementById('mRequests').value.trim();
  if(!name||!phone||!ci||!co){document.getElementById('reqNote').style.display='block';return;}
  document.getElementById('reqNote').style.display='none';
  const isSD=mType==='super', price=isSD?D.sdPrice:D.pmPrice, label=isSD?'Super Deluxe Room':'Premium Suite';
  const sorted=[...sel].sort((a,b)=>a-b);
  const nights=Math.max(1,Math.round((new Date(co)-new Date(ci))/(86400000)));
  const cnt=sorted.length||1, total=cnt*price*nights;
  const roomLine=sorted.length?'🔢 Selected Rooms: *'+sorted.join(', ')+'* ('+cnt+' room'+(cnt>1?'s':'')+')\n':'🔢 Rooms: 1\n';
  const msg='🏨 *Hotel Highway Memories — Booking Request*\n\n'+'👤 Name: *'+name+'*\n'+'📞 Phone: *'+phone+'*\n'+'🛏 Room Type: *'+label+'*\n'+roomLine+'📅 Check-in: *'+ci+'*\n'+'📅 Check-out: *'+co+'*\n'+'🌙 Nights: *'+nights+'*\n'+'💰 Rate: ₹'+price.toLocaleString('en-IN')+'/room/night\n'+'💳 Total: *₹'+total.toLocaleString('en-IN')+'*\n'+(req?'✨ Requests: '+req+'\n':'')+'\nPlease confirm my booking. Thank you!';
  window.open('https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(msg),'_blank');
}

/* ── CONTACT FORM ── */
const td=new Date().toISOString().split('T')[0];
document.getElementById('bci').min=td; document.getElementById('bco').min=td;
document.getElementById('bci').onchange=function(){document.getElementById('bco').min=this.value;};
function sendFormWA(e){
  e.preventDefault();
  const n=document.getElementById('bn').value,ph=document.getElementById('bp').value;
  const rt=document.getElementById('brt').value,ci=document.getElementById('bci').value;
  const co=document.getElementById('bco').value,nr=document.getElementById('bnr').value;
  const sr=document.getElementById('bsr').value;
  const nights=Math.max(1,Math.round((new Date(co)-new Date(ci))/(86400000)));
  const msg='🏨 *Hotel Highway Memory — Booking Request*\n\n'+'👤 Name: *'+n+'*\n📞 Phone: *'+ph+'*\n🛏 Room: *'+rt+'*\n'+'🔢 Rooms: '+nr+'\n📅 Check-in: *'+ci+'*\n📅 Check-out: *'+co+'*\n'+'🌙 Nights: *'+nights+'*'+(sr?'\n✨ Requests: '+sr:'')+'\n\nPlease confirm. Thank you!';
  window.open('https://wa.me/'+WA_NUM+'?text='+encodeURIComponent(msg),'_blank');
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
      <div class="cover-hotel">Hotel Highway Memory</div>
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
      <div style="margin-top:1.5rem;font-size:.65rem;color:rgba(139,94,60,.35);">📞 +91 98765 43210</div>
    </div>
    <div class="bpage cover" style="background:linear-gradient(145deg,#2d1e0a 0%,#1a1005 100%) !important;">
      <div class="cover-orn">🏨</div>
      <div class="cover-hotel">Hotel Highway Memory</div>
      <div class="cover-rule"></div>
      <div class="cover-est">NH-44, Highway Road</div>
    </div>`;
  book.appendChild(bc); bookSpreads.push(bc);

  buildBookDots(); updateBookInfo();
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
  document.getElementById('aPM').value=adminW.pmPrice;
  const sdc=document.getElementById('aSDPills'); sdc.innerHTML='';
  Object.keys(adminW.sd).map(Number).sort((a,b)=>a-b).forEach(n=>{
    const p=mkAdmPill(n,adminW.sd[n],()=>{adminW.sd[n]=!adminW.sd[n];p.className='adm-pill '+(adminW.sd[n]?'a':'o');p.innerHTML=admPillHTML(n,adminW.sd[n]);});
    sdc.appendChild(p);
  });
  const pmc=document.getElementById('aPMPills'); pmc.innerHTML='';
  Object.keys(adminW.pm).map(Number).sort((a,b)=>a-b).forEach(n=>{
    const p=mkAdmPill(n,adminW.pm[n],()=>{adminW.pm[n]=!adminW.pm[n];p.className='adm-pill '+(adminW.pm[n]?'a':'o');p.innerHTML=admPillHTML(n,adminW.pm[n]);});
    pmc.appendChild(p);
  });
  document.getElementById('adminDashOv').classList.add('open');
  document.body.style.overflow='hidden';
}
function closeAdminDash(){document.getElementById('adminDashOv').classList.remove('open');document.body.style.overflow='';}
function mkAdmPill(n,av,cb){const p=document.createElement('div');p.className='adm-pill '+(av?'a':'o');p.innerHTML=admPillHTML(n,av);p.onclick=cb;return p;}
function admPillHTML(n,av){return '<span style="font-size:.64rem;font-weight:700;line-height:1">'+n+'</span><span style="font-size:.68rem;line-height:1">'+(av?'✓':'✕')+'</span>';}
async function saveAdmin(){
  const sdP=parseInt(document.getElementById('aSD').value);
  const pmP=parseInt(document.getElementById('aPM').value);
  if(sdP>0) adminW.sdPrice=sdP;
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

