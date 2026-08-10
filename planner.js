/* Monthly Money Plan: emergency fund + savings + investments */
(function(){
  const PLAN_KEY='moneyPlan';
  const defaultPlan={emergencyPct:40,savingsPct:30,investmentPct:30,emergencyTarget:24000,investmentTotal:0,savingsTotal:0};
  let plan=JSON.parse(localStorage.getItem(PLAN_KEY)||'null')||defaultPlan;
  function savePlan(){localStorage.setItem(PLAN_KEY,JSON.stringify(plan))}
  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function m(v){const c=localStorage.getItem('currency')||'QAR';return c+' '+n(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
  function monthKey(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`}
  function currentMonth(){return localStorage.getItem('selectedMonth')||monthKey(new Date())}
  function getTransactions(){return JSON.parse(localStorage.getItem('finance')||'[]')}
  function getMonthlyStats(key){const all=getTransactions();const tx=key==='all'?all:all.filter(x=>monthKey(x.date||Date.now())===key);return tx.reduce((r,x)=>{if(x.type==='income')r.income+=n(x.amount);else r.expense+=n(x.amount);return r},{income:0,expense:0})}
  function emergencySaved(){
    const goals=JSON.parse(localStorage.getItem('savingsGoals')||'[]');
    const g=goals.find(x=>String(x.name||'').toLowerCase().includes('emergency'));
    return g?n(g.saved):0;
  }
  function ensurePanel(){
    const home=document.getElementById('home');if(!home||document.getElementById('moneyPlanPanel'))return;
    const panel=document.createElement('section');panel.id='moneyPlanPanel';panel.className='panel money-plan-panel';
    panel.innerHTML=`<div class="section-heading"><div><h3>🧭 Where Should My Balance Go?</h3><small>Each month's actual surplus is split automatically. Change the percentages anytime.</small></div></div><div class="money-plan-grid"><div class="money-plan-main"><div class="plan-total"><small>Available this month</small><strong id="mpAvailable">QAR 0.00</strong></div><div class="allocation-row emergency"><div><strong>🛡️ Emergency Fund</strong><small id="mpEmergencyPct">40%</small></div><strong id="mpEmergency">QAR 0.00</strong></div><div class="allocation-row savings"><div><strong>💰 Savings / Goals</strong><small id="mpSavingsPct">30%</small></div><strong id="mpSavings">QAR 0.00</strong></div><div class="allocation-row investment"><div><strong>📈 Investments</strong><small id="mpInvestmentPct">30%</small></div><strong id="mpInvestment">QAR 0.00</strong></div><div class="plan-note" id="mpAdvice"></div></div><div class="money-plan-side"><label>Emergency target<input id="mpTarget" type="number" inputmode="decimal"></label><label>Emergency %<input id="mpEPct" type="number" min="0" max="100"></label><label>Savings %<input id="mpSPct" type="number" min="0" max="100"></label><label>Investment %<input id="mpIPct" type="number" min="0" max="100"></label><button onclick="saveMoneyPlan()">Save Plan</button><small id="mpValidation" class="hint"></small></div></div><div class="plan-progress"><div><span>🛡️ Emergency Fund</span><strong id="mpEmergencyProgress">QAR 0 / QAR 24,000</strong></div><div class="progress"><i id="mpEmergencyBar" style="width:0%"></i></div></div>`;
    const net=home.querySelector('.net-worth-card');net?home.insertBefore(panel,net):home.appendChild(panel);
  }
  window.saveMoneyPlan=function(){
    const e=n(document.getElementById('mpEPct').value),s=n(document.getElementById('mpSPct').value),i=n(document.getElementById('mpIPct').value),t=n(document.getElementById('mpTarget').value);
    if(e+s+i!==100){document.getElementById('mpValidation').textContent='Percentages must total exactly 100%.';return}
    if(t<=0){document.getElementById('mpValidation').textContent='Enter a valid emergency target.';return}
    plan={...plan,emergencyPct:e,savingsPct:s,investmentPct:i,emergencyTarget:t};savePlan();document.getElementById('mpValidation').textContent='Saved ✓';renderPlan();
  };
  window.addInvestment=function(amount){plan.investmentTotal=n(plan.investmentTotal)+n(amount);savePlan();renderPlan()};
  function renderPlan(){
    ensurePanel();
    const key=currentMonth(),stats=getMonthlyStats(key),available=Math.max(0,stats.income-stats.expense);
    const e=available*plan.emergencyPct/100,s=available*plan.savingsPct/100,i=available*plan.investmentPct/100,saved=emergencySaved(),target=n(plan.emergencyTarget),pct=target?Math.min(100,saved/target*100):0;
    const set=(id,v)=>{const x=document.getElementById(id);if(x)x.textContent=v};
    set('mpAvailable',m(available));set('mpEmergency',m(e));set('mpSavings',m(s));set('mpInvestment',m(i));set('mpEmergencyPct',plan.emergencyPct+'%');set('mpSavingsPct',plan.savingsPct+'%');set('mpInvestmentPct',plan.investmentPct+'%');
    set('mpEmergencyProgress',m(saved)+' / '+m(target));const bar=document.getElementById('mpEmergencyBar');if(bar)bar.style.width=pct+'%';
    const advice=document.getElementById('mpAdvice');if(advice){if(stats.income===0)advice.textContent='Add your salary transaction to get a real monthly recommendation.';else if(available<=0)advice.textContent='No surplus this month. Focus on controlling expenses before investing more.';else if(saved<target)advice.textContent='Priority: keep building your emergency fund until the target is reached.';else advice.textContent='Emergency target reached. You can direct more of the surplus toward long-term investments.'}
    const targetEl=document.getElementById('mpTarget'),ep=document.getElementById('mpEPct'),sp=document.getElementById('mpSPct'),ip=document.getElementById('mpIPct');if(targetEl)targetEl.value=plan.emergencyTarget;if(ep)ep.value=plan.emergencyPct;if(sp)sp.value=plan.savingsPct;if(ip)ip.value=plan.investmentPct;
  }
  const oldRender=window.render;
  if(typeof oldRender==='function'){window.render=function(){oldRender();renderPlan()}};
  setTimeout(renderPlan,0);
})();
