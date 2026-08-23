/* Expense category totals for the currently selected month/all-time. Read-only: does not modify transactions. */
(function(){
  const icons={Food:'🍽️',Home:'🏠',Rent:'🏡',Petrol:'⛽', 'CBQ Loan':'💳',Travel:'✈️',Bills:'🧾',Shopping:'🛍️',Other:'📦'};
  function moneyLocal(v){
    const c=localStorage.getItem('currency')||'QAR';
    return c+' '+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2});
  }
  function monthKey(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`}
  function selected(){return localStorage.getItem('selectedMonth')||monthKey(new Date())}
  function tx(){try{return JSON.parse(localStorage.getItem('finance')||'[]')}catch(e){return []}}
  function ensurePanel(){
    const home=document.getElementById('home');
    if(!home||document.getElementById('categorySummaryPanel'))return;
    const panel=document.createElement('section');
    panel.id='categorySummaryPanel';
    panel.className='panel category-summary-panel';
    panel.innerHTML=`<div class="section-heading"><div><h3>📂 Expense by Category</h3><small id="categorySummaryPeriod">Selected period totals</small></div></div><div id="categorySummaryList"></div>`;
    const transactions=[...home.querySelectorAll('.panel')].find(p=>p.querySelector('#list'));
    if(transactions)home.insertBefore(panel,transactions);else home.appendChild(panel);
  }
  function renderCategorySummary(){
    ensurePanel();
    const key=selected();
    const all=tx();
    const filtered=(key==='all'?all:all.filter(x=>monthKey(x.date||Date.now())===key)).filter(x=>x.type==='expense');
    const totals={};
    filtered.forEach(x=>{const cat=x.category||'Other';totals[cat]=(totals[cat]||0)+Number(x.amount||0)});
    const rows=Object.entries(totals).sort((a,b)=>b[1]-a[1]);
    const total=rows.reduce((s,[,v])=>s+v,0);
    const wrap=document.getElementById('categorySummaryList');
    const period=document.getElementById('categorySummaryPeriod');
    if(period)period.textContent=key==='all'?'All-time expense totals':'Totals for the selected month';
    if(!wrap)return;
    if(!rows.length){wrap.innerHTML='<p class="empty-state">No expense transactions for this period.</p>';return}
    wrap.innerHTML=`<div class="category-total-head"><span>Total expenses</span><strong>${moneyLocal(total)}</strong></div><div class="category-total-list">${rows.map(([cat,amount])=>{const pct=total?amount/total*100:0;return `<div class="category-total-row"><div class="category-total-main"><span class="category-icon">${icons[cat]||'📦'}</span><div><strong>${escapeHtmlLocal(cat)}</strong><small>${pct.toFixed(1)}% of expenses</small></div></div><strong>${moneyLocal(amount)}</strong></div>`}).join('')}</div>`;
  }
  function escapeHtmlLocal(value){return String(value??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){oldRender();renderCategorySummary()};
  setTimeout(renderCategorySummary,0);
})();