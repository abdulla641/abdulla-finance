/* Internal transfer layer. Keeps transfers out of expense history while reducing spendable cash. */
(function(){
  const KEY='internalTransfers';
  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function money(v){const c=localStorage.getItem('currency')||'QAR';return c+' '+n(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
  function monthKey(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`}
  function transfers(){try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch(e){return []}}
  function saveTransfers(x){localStorage.setItem(KEY,JSON.stringify(x))}
  function selected(){return localStorage.getItem('selectedMonth')||monthKey(new Date())}
  function safetyForMonth(key){return transfers().filter(x=>x.kind==='safety'&&(key==='all'||monthKey(x.date)===key)).reduce((s,x)=>s+n(x.amount),0)}
  function safetyAll(){return transfers().filter(x=>x.kind==='safety').reduce((s,x)=>s+n(x.amount),0)}
  function goalSafety(){try{const gs=JSON.parse(localStorage.getItem('savingsGoals')||'[]');const g=gs.find(x=>/emergency|safety/i.test(String(x.name||'')));return g?n(g.saved):0}catch(e){return 0}}

  const originalAddSaving=window.addSaving;
  window.addSaving=function(){
    const el=document.getElementById('saving'),a=n(el&&el.value);
    if(!Number.isFinite(a)||a<=0){alert('Please enter a valid amount.');return}
    const before=goalSafety();
    if(typeof originalAddSaving==='function')originalAddSaving();
    const after=goalSafety(),moved=Math.max(0,after-before);
    if(moved>0){const t=transfers();t.push({id:Date.now()+Math.random(),kind:'safety',amount:moved,date:new Date().toISOString()});saveTransfers(t)}
    if(typeof window.render==='function')window.render();
  };

  function apply(){
    const key=selected(),filtered=typeof window.getFilteredData==='function'?window.getFilteredData():[];
    let income=0,expense=0;filtered.forEach(x=>{if(x.type==='income')income+=n(x.amount);else expense+=n(x.amount)});
    const moved=key==='all'?safetyAll():safetyForMonth(key),spendable=income-expense-moved;
    const balance=document.getElementById('balance');if(balance)balance.textContent=money(spendable);
    const net=document.getElementById('netWorth');if(net)net.textContent=money(income-expense+goalSafety());
    const actual=document.getElementById('actualRemaining');if(actual)actual.textContent=money(spendable);
    const safe=document.getElementById('safeToSpend');if(safe)safe.textContent=money(Math.max(0,spendable));
    const mp=document.getElementById('mpAvailable');if(mp)mp.textContent=money(Math.max(0,spendable));
  }
  const oldRender=window.render;
  if(typeof oldRender==='function')window.render=function(){oldRender();apply()};
  setTimeout(apply,100);
})();