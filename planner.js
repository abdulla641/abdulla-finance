/* Abdulla Finance planner. Read-only planning layer: never modifies transaction history. */
(function(){
  const PLAN_KEY='moneyPlan';
  const START_MONTH='2026-11';
  const DEBT_PHASE_END='2027-02';
  const DEFAULT={
    cardTarget:5800,
    safetyTarget:24000,
    ajmalTarget:2000,
    phaseCard:1250,
    phaseSafety:1000,
    phaseAjmal:500,
    phaseInvestment:250,
    normalCard:1500,
    normalSafety:1000,
    normalInvestment:500
  };
  let plan={...DEFAULT,...(JSON.parse(localStorage.getItem(PLAN_KEY)||'{}')),startMonth:START_MONTH};

  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function money(v){const c=localStorage.getItem('currency')||'QAR';return c+' '+n(v).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
  function monthKey(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`}
  function selected(){return localStorage.getItem('selectedMonth')||monthKey(new Date())}
  function tx(){return JSON.parse(localStorage.getItem('finance')||'[]')}
  function credits(){return JSON.parse(localStorage.getItem('credit')||'[]')}
  function stats(key){return tx().filter(x=>key==='all'||monthKey(x.date||Date.now())===key).reduce((r,x)=>{if(x.type==='income')r.income+=n(x.amount);else r.expense+=n(x.amount);return r},{income:0,expense:0})}
  function vacation(key){return key==='2026-09'||key==='2026-10'}
  function debtPhase(key){return key>='2026-11'&&key<=DEBT_PHASE_END}
  function safetySaved(){const goals=JSON.parse(localStorage.getItem('savingsGoals')||'[]');const g=goals.find(x=>/emergency|safety/i.test(String(x.name||'')));return g?n(g.saved):0}
  function cardBalance(){for(const k of ['creditCardOutstanding','cardOutstanding','creditCardBalance']){const v=localStorage.getItem(k);if(v!==null&&Number.isFinite(Number(v)))return Math.max(0,n(v))}return n(plan.cardTarget)}
  function ajmalRemaining(){
    const rows=credits().filter(x=>x.type==='pay'&&/ajmal/i.test(String(x.person||'')));
    if(!rows.length)return n(plan.ajmalTarget);
    return Math.max(0,rows.reduce((s,x)=>s+Math.max(0,n(x.amount)-n(x.settled)),0));
  }
  function save(){localStorage.setItem(PLAN_KEY,JSON.stringify(plan))}

  function ensure(){
    const home=document.getElementById('home');
    if(!home||document.getElementById('moneyPlanPanel'))return;
    const p=document.createElement('section');
    p.id='moneyPlanPanel';p.className='panel money-plan-panel';
    p.innerHTML=`
      <div class="finance2-head"><div><h3>🧭 Your Money Plan</h3><small id="mpSubtitle">November 2026 is your financial-plan starting point.</small></div><span class="plan-badge" id="mpBadge">READY</span></div>
      <div class="finance2-summary">
        <div><small>Monthly income</small><strong id="mpIncome">QAR 0</strong></div>
        <div><small>Expenses</small><strong id="mpExpense">QAR 0</strong></div>
        <div class="highlight"><small>Available balance</small><strong id="mpAvailable">QAR 0</strong></div>
      </div>
      <div class="finance2-grid">
        <div class="finance2-card"><div class="card-title"><span>💳</span><div><strong>Credit Card</strong><small id="mpCardText">QAR 5,800 outstanding</small></div></div><strong id="mpCardPay">QAR 1,250</strong><div class="progress"><i id="mpCardBar"></i></div><small id="mpCardNote">Debt cleanup payment</small></div>
        <div class="finance2-card"><div class="card-title"><span>🛡️</span><div><strong>Safety Fund</strong><small id="mpSafetyText">QAR 0 / QAR 24,000</small></div></div><strong id="mpSafetyPay">QAR 1,000</strong><div class="progress"><i id="mpSafetyBar"></i></div><small>Untouchable · Target QAR 24,000</small></div>
        <div class="finance2-card"><div class="card-title"><span>🤝</span><div><strong>Ajmal</strong><small id="mpAjmalText">QAR 2,000 remaining</small></div></div><strong id="mpAjmalPay">QAR 500</strong><div class="progress"><i id="mpAjmalBar"></i></div><small>Target: clear in 4 months</small></div>
        <div class="finance2-card"><div class="card-title"><span>📈</span><div><strong>Investment</strong><small>Monthly contribution</small></div></div><strong id="mpInvestmentPay">QAR 250</strong><div class="mini-note" id="mpInvestmentNote">Keep the investing habit during debt cleanup.</div></div>
      </div>
      <div class="finance2-summary"><div class="highlight"><small>Planned allocation</small><strong id="mpPlanned">QAR 0</strong></div><div><small>Monthly buffer</small><strong id="mpBuffer">QAR 0</strong></div></div>
      <div class="plan-flow"><span>Income</span><b>→</b><span>Expenses</span><b>→</b><span>Safety + Debts</span><b>→</b><span>Investment</span></div>
      <div class="plan-note" id="mpAdvice"></div>
      <details class="plan-settings"><summary>⚙️ Plan settings</summary><div class="settings-grid">
        <label>Card balance<input id="mpCardTarget" type="number"></label>
        <label>Safety target<input id="mpSafetyTarget" type="number"></label>
        <label>Ajmal debt<input id="mpAjmalTarget" type="number"></label>
        <label>Nov–Feb card<input id="mpPhaseCard" type="number"></label>
        <label>Nov–Feb Safety<input id="mpPhaseSafety" type="number"></label>
        <label>Nov–Feb Ajmal<input id="mpPhaseAjmal" type="number"></label>
        <label>Nov–Feb investment<input id="mpPhaseInvestment" type="number"></label>
      </div><button onclick="saveMoneyPlan()">Save Plan</button><small id="mpValidation" class="hint"></small></details>`;
    const net=home.querySelector('.net-worth-card');net?home.insertBefore(p,net):home.appendChild(p);
  }

  window.saveMoneyPlan=function(){
    const ids=['mpCardTarget','mpSafetyTarget','mpAjmalTarget','mpPhaseCard','mpPhaseSafety','mpPhaseAjmal','mpPhaseInvestment'];
    const vals=ids.map(id=>n(document.getElementById(id)?.value));
    if(vals.some(v=>v<0)){const e=document.getElementById('mpValidation');if(e)e.textContent='Amounts cannot be negative.';return}
    [plan.cardTarget,plan.safetyTarget,plan.ajmalTarget,plan.phaseCard,plan.phaseSafety,plan.phaseAjmal,plan.phaseInvestment]=vals;
    save();render();
  };

  function render(){
    ensure();
    const key=selected(),v=vacation(key),s=stats(key),available=v?0:Math.max(0,s.income-s.expense),card=cardBalance(),saved=safetySaved(),safetyTarget=n(plan.safetyTarget),ajmal=ajmalRemaining();
    const phase=debtPhase(key)&&ajmal>0;
    let c=0,ef=0,aj=0,inv=0;
    if(!v&&key>=START_MONTH){
      if(phase){c=Math.min(card,n(plan.phaseCard));ef=n(plan.phaseSafety);aj=Math.min(ajmal,n(plan.phaseAjmal));inv=n(plan.phaseInvestment)}
      else if(card>0){c=Math.min(card,n(plan.normalCard));ef=n(plan.normalSafety);inv=n(plan.normalInvestment)}
      else if(saved<safetyTarget){ef=Math.min(Math.max(0,safetyTarget-saved),2500);inv=500}
      else{inv=Math.min(available,3000)}
    }
    const planned=c+ef+aj+inv,buffer=available-planned;
    const set=(id,val)=>{const e=document.getElementById(id);if(e)e.textContent=val};
    set('mpIncome',money(s.income));set('mpExpense',money(s.expense));set('mpAvailable',money(available));
    set('mpCardText',money(card)+' outstanding');set('mpSafetyText',money(saved)+' / '+money(safetyTarget));set('mpAjmalText',money(ajmal)+' remaining');
    set('mpCardPay',money(c));set('mpSafetyPay',money(ef));set('mpAjmalPay',money(aj));set('mpInvestmentPay',money(inv));set('mpPlanned',money(planned));set('mpBuffer',money(buffer));
    const cb=document.getElementById('mpCardBar'),sb=document.getElementById('mpSafetyBar'),ab=document.getElementById('mpAjmalBar');
    if(cb)cb.style.width=(plan.cardTarget?Math.min(100,card/plan.cardTarget*100):0)+'%';
    if(sb)sb.style.width=(safetyTarget?Math.min(100,saved/safetyTarget*100):0)+'%';
    if(ab)ab.style.width=(plan.ajmalTarget?Math.min(100,(plan.ajmalTarget-ajmal)/plan.ajmalTarget*100):0)+'%';
    set('mpSubtitle',v?'✈️ Vacation Mode · September–October 2026':phase?'🧹 Debt Cleanup Phase · November 2026–February 2027':'🚀 Financial Plan · November 2026 onward');
    set('mpBadge',v?'VACATION':phase?'DEBT CLEANUP':'ACTIVE');
    set('mpInvestmentNote',phase?'Temporary QAR 250 contribution while Ajmal is being cleared.':'Long-term contribution.');
    let advice='';
    if(v) advice='Vacation spending stays separate. Safety Fund contributions are handled according to your September/October vacation plan.';
    else if(key<START_MONTH) advice='Your full financial plan starts in November 2026.';
    else if(s.income===0) advice='Add your salary transaction to see the real monthly balance and buffer.';
    else if(available<=0) advice='No surplus this month — protect essential expenses and avoid new borrowing.';
    else if(buffer<0) advice='⚠️ Planned commitments exceed this month’s available balance by '+money(Math.abs(buffer))+'. Cut optional spending first; Safety Fund remains protected.';
    else if(phase) advice='Nov–Feb target: Card QAR 1,250 + Safety Fund QAR 1,000 + Ajmal QAR 500 + Investment QAR 250. Add Ajmal under Money → Pay and use Settle as you repay him.';
    else if(ajmal<=0&&card>0) advice='Ajmal cleared ✅ Redirect the freed QAR 500 toward the card/Safety plan. Current standard: Card QAR 1,500 + Safety Fund QAR 1,000 + Investment QAR 500.';
    else if(card<=0&&saved<safetyTarget) advice='Credit card cleared ✅ Build the Safety Fund aggressively toward QAR 24,000 while keeping QAR 500 investing.';
    else advice='Safety Fund target reached ✅ Keep it protected and redirect the monthly surplus toward long-term investing.';
    set('mpAdvice',advice);

    const fields=[['mpCardTarget',plan.cardTarget],['mpSafetyTarget',plan.safetyTarget],['mpAjmalTarget',plan.ajmalTarget],['mpPhaseCard',plan.phaseCard],['mpPhaseSafety',plan.phaseSafety],['mpPhaseAjmal',plan.phaseAjmal],['mpPhaseInvestment',plan.phaseInvestment]];
    fields.forEach(([id,val])=>{const e=document.getElementById(id);if(e)e.value=val});
  }

  const old=window.render;
  if(typeof old==='function')window.render=function(){old();render()};
  setTimeout(render,50);
})();