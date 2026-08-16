/* Abdulla Finance 2.0 planner. Read-only dashboard layer: never modifies transaction history. */
(function(){
  const PLAN_KEY='moneyPlan';
  const START_MONTH='2026-11';
  const VACATION_START='2026-09-17';
  const VACATION_END='2026-10-31';
  const DEFAULT={cardPct:50,safetyPct:33.333333,investmentPct:16.666667,cardTarget:5800,safetyTarget:24000};
  let plan={...DEFAULT,...(JSON.parse(localStorage.getItem(PLAN_KEY)||'{}')),startMonth:START_MONTH};
  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function money(v){const c=localStorage.getItem('currency')||'QAR';return c+' '+n(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
  function monthKey(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`}
  function selected(){return localStorage.getItem('selectedMonth')||monthKey(new Date())}
  function tx(){return JSON.parse(localStorage.getItem('finance')||'[]')}
  function stats(key){return tx().filter(x=>key==='all'||monthKey(x.date||Date.now())===key).reduce((r,x)=>{if(x.type==='income')r.income+=n(x.amount);else r.expense+=n(x.amount);return r},{income:0,expense:0})}
  function vacation(key){return key==='2026-09'||key==='2026-10'}
  function safetySaved(){const goals=JSON.parse(localStorage.getItem('savingsGoals')||'[]');const g=goals.find(x=>/emergency|safety/i.test(String(x.name||'')));return g?n(g.saved):0}
  function cardBalance(){
    for(const k of ['creditCardOutstanding','cardOutstanding','creditCardBalance']){const v=localStorage.getItem(k);if(v!==null&&Number.isFinite(Number(v)))return Math.max(0,n(v))}
    return n(plan.cardTarget);
  }
  function save(){localStorage.setItem(PLAN_KEY,JSON.stringify(plan))}
  function ensure(){const home=document.getElementById('home');if(!home||document.getElementById('moneyPlanPanel'))return;
    const p=document.createElement('section');p.id='moneyPlanPanel';p.className='panel money-plan-panel';
    p.innerHTML=`<div class="finance2-head"><div><h3>🧭 Your Money Plan</h3><small id="mpSubtitle">November 2026 is your financial-plan starting point.</small></div><span class="plan-badge" id="mpBadge">READY</span></div>
    <div class="finance2-summary"><div><small>Monthly income</small><strong id="mpIncome">QAR 0</strong></div><div><small>Expenses</small><strong id="mpExpense">QAR 0</strong></div><div class="highlight"><small>Available balance</small><strong id="mpAvailable">QAR 0</strong></div></div>
    <div class="finance2-grid"><div class="finance2-card"><div class="card-title"><span>💳</span><div><strong>Credit Card</strong><small id="mpCardText">QAR 5,800 outstanding</small></div></div><strong id="mpCardPay">QAR 1,500</strong><div class="progress"><i id="mpCardBar"></i></div><small id="mpCardNote">Priority payment</small></div>
    <div class="finance2-card"><div class="card-title"><span>🛡️</span><div><strong>Safety Fund</strong><small id="mpSafetyText">QAR 0 / QAR 24,000</small></div></div><strong id="mpSafetyPay">QAR 1,000</strong><div class="progress"><i id="mpSafetyBar"></i></div><small>Target QAR 24,000</small></div>
    <div class="finance2-card"><div class="card-title"><span>📈</span><div><strong>Investment</strong><small>Monthly contribution</small></div></div><strong id="mpInvestmentPay">QAR 500</strong><div class="mini-note">Keep the habit while clearing the card.</div></div></div>
    <div class="plan-flow"><span>Income</span><b>→</b><span>Expenses</span><b>→</b><span>Available</span><b>→</b><span>Card + Safety + Investment</span></div>
    <div class="plan-note" id="mpAdvice"></div>
    <details class="plan-settings"><summary>⚙️ Plan settings</summary><div class="settings-grid"><label>Card balance<input id="mpCardTarget" type="number"></label><label>Safety target<input id="mpSafetyTarget" type="number"></label><label>Card %<input id="mpCardPctInput" type="number" min="0" max="100"></label><label>Safety %<input id="mpSafetyPctInput" type="number" min="0" max="100"></label><label>Investment %<input id="mpInvestmentPctInput" type="number" min="0" max="100"></label></div><button onclick="saveMoneyPlan()">Save Plan</button><small id="mpValidation" class="hint"></small></details>`;
    const net=home.querySelector('.net-worth-card');net?home.insertBefore(p,net):home.appendChild(p);
  }
  window.saveMoneyPlan=function(){const c=n(document.getElementById('mpCardPctInput').value),s=n(document.getElementById('mpSafetyPctInput').value),i=n(document.getElementById('mpInvestmentPctInput').value),ct=n(document.getElementById('mpCardTarget').value),st=n(document.getElementById('mpSafetyTarget').value);if(Math.abs(c+s+i-100)>.01){document.getElementById('mpValidation').textContent='Percentages must total 100%.';return}plan={...plan,cardPct:c,safetyPct:s,investmentPct:i,cardTarget:ct,safetyTarget:st,startMonth:START_MONTH};save();render()};
  function render(){ensure();const key=selected(),v=vacation(key),s=stats(key),available=v?0:Math.max(0,s.income-s.expense),card=cardBalance(),saved=safetySaved(),target=n(plan.safetyTarget);let c=available*plan.cardPct/100,ef=available*plan.safetyPct/100,inv=available*plan.investmentPct/100;
    const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};set('mpIncome',money(s.income));set('mpExpense',money(s.expense));set('mpAvailable',money(available));
    set('mpCardText',money(card)+' outstanding');set('mpSafetyText',money(saved)+' / '+money(target));set('mpCardPay',money(c));set('mpSafetyPay',money(ef));set('mpInvestmentPay',money(inv));
    const cb=document.getElementById('mpCardBar'),sb=document.getElementById('mpSafetyBar');if(cb)cb.style.width=(plan.cardTarget?Math.min(100,card/plan.cardTarget*100):0)+'%';if(sb)sb.style.width=(target?Math.min(100,saved/target*100):0)+'%';
    set('mpSubtitle',v?'✈️ Vacation Mode: 17 Sep–31 Oct 2026 · Kerala Vacation Tracker handles vacation spending.':'🚀 Financial Plan · November 2026 onward');set('mpBadge',v?'VACATION':'ACTIVE');set('mpAdvice',v?'Vacation spending stays separate. No automatic card, safety-fund or investment allocation until November.':s.income===0?'Add your salary transaction to see the actual available balance.':available<=0?'No surplus this month — focus on keeping spending within income.':card>0?'Priority: QAR 1,500 card + QAR 1,000 Safety Fund + QAR 500 investment from a QAR 3,000 surplus.':'Credit card cleared. Redirect the QAR 1,500 card allocation to the Safety Fund until QAR 24,000 is reached.');
    const ids=[['mpCardTarget',plan.cardTarget],['mpSafetyTarget',plan.safetyTarget],['mpCardPctInput',plan.cardPct],['mpSafetyPctInput',plan.safetyPct],['mpInvestmentPctInput',plan.investmentPct]];ids.forEach(([id,val])=>{const e=document.getElementById(id);if(e)e.value=val});
  }
  const old=window.render;if(typeof old==='function')window.render=function(){old();render()};setTimeout(render,50);
})();