let data=JSON.parse(localStorage.getItem('finance'))||[];
let credit=JSON.parse(localStorage.getItem('credit'))||[];
let savings=Number(localStorage.getItem('savings'))||0;
let currency=localStorage.getItem('currency')||'QAR';
let selectedMonth=localStorage.getItem('selectedMonth')||getMonthKey(new Date());
let reportChart;

function val(id){const el=document.getElementById(id);return el?el.value:''}
function money(v){return currency+' '+Number(v||0).toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:2})}
function getMonthKey(d){const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}`}
function monthLabel(key){if(key==='all')return 'All Time';const [y,m]=key.split('-').map(Number);return new Date(y,m-1,1).toLocaleString('en-US',{month:'long',year:'numeric'})}
function setCurrency(){currency=val('currency')||'QAR';localStorage.setItem('currency',currency);render()}
function setMonth(){selectedMonth=val('monthFilter')||getMonthKey(new Date());localStorage.setItem('selectedMonth',selectedMonth);render()}
function save(){localStorage.setItem('finance',JSON.stringify(data))}
function saveCredit(){localStorage.setItem('credit',JSON.stringify(credit))}
function getFilteredData(){return selectedMonth==='all'?data:data.filter(x=>getMonthKey(x.date||Date.now())===selectedMonth)}

function addTransaction(){
  const name=val('name').trim(),amount=Number(val('amount')),type=val('type'),category=val('category');
  if(!name||!Number.isFinite(amount)||amount<=0){alert('Please enter a description and a valid amount.');return}
  const date=new Date().toISOString();
  data.push({id:Date.now()+Math.random(),name,amount,type,category,date});
  selectedMonth=getMonthKey(date);localStorage.setItem('selectedMonth',selectedMonth);save();render();
  document.getElementById('name').value='';document.getElementById('amount').value='';
}

function formatDate(d){return new Date(d).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}
function addSaving(){const a=Number(val('saving'));if(!Number.isFinite(a)||a<=0){alert('Please enter a valid savings amount.');return}savings+=a;localStorage.setItem('savings',savings);render();document.getElementById('saving').value=''}

function addCredit(){
  const person=val('person').trim(),amount=Number(val('creditAmount')),type=val('creditType');
  if(!person||!Number.isFinite(amount)||amount<=0){alert('Please enter a name and valid amount.');return}
  credit.push({id:Date.now()+Math.random(),person,amount,type,settled:0,date:new Date().toISOString()});saveCredit();render();
  document.getElementById('person').value='';document.getElementById('creditAmount').value='';
}
function settleCredit(id){
  const x=credit.find(i=>i.id===id);if(!x)return;
  const a=Number(prompt('Settlement amount',String(Math.max(0,x.amount-x.settled))));
  if(Number.isFinite(a)&&a>0){x.settled=Math.min(x.amount,x.settled+a);saveCredit();render()}
}
function editItem(id){
  const x=data.find(i=>i.id===id);if(!x)return;const name=prompt('Edit description',x.name);if(name===null)return;
  const amount=Number(prompt('Edit amount',x.amount));if(name.trim()&&Number.isFinite(amount)&&amount>0){x.name=name.trim();x.amount=amount;save();render()}
}
function editCredit(id){
  const x=credit.find(i=>i.id===id);if(!x)return;const person=prompt('Edit name',x.person);if(person===null)return;
  const amount=Number(prompt('Edit amount',x.amount));if(person.trim()&&Number.isFinite(amount)&&amount>0){x.person=person.trim();x.amount=amount;x.settled=Math.min(x.settled,amount);saveCredit();render()}
}

// One consistent confirmation popup is used for every destructive action.
function confirmAction(title,message,onConfirm){
  const modal=document.getElementById('confirmModal');if(!modal)return;
  document.getElementById('confirmTitle').textContent=title;document.getElementById('confirmMessage').textContent=message;
  modal.classList.add('show');
  const yes=document.getElementById('confirmYes'),no=document.getElementById('confirmNo');
  const close=()=>{modal.classList.remove('show');yes.onclick=null;no.onclick=null};
  no.onclick=close;yes.onclick=()=>{close();onConfirm()};
}
function removeItem(id){
  const x=data.find(i=>i.id===id);if(!x)return;
  confirmAction('Delete transaction?',`Delete “${x.name}” for ${money(x.amount)}? This cannot be undone.`,()=>{data=data.filter(i=>i.id!==id);save();render()});
}
function removeCredit(id){
  const x=credit.find(i=>i.id===id);if(!x)return;
  confirmAction('Delete Pay / Receive entry?',`Delete “${x.person}” and its settlement history? This cannot be undone.`,()=>{credit=credit.filter(i=>i.id!==id);saveCredit();render()});
}
function clearTransactions(){
  if(!data.length)return;
  confirmAction('Delete ALL transaction history?','This permanently removes every Income and Expense record from every month. Your savings and Pay / Receive records will remain.',()=>{data=[];save();selectedMonth=getMonthKey(new Date());localStorage.setItem('selectedMonth',selectedMonth);render()});
}
function clearCredit(){
  if(!credit.length)return;
  confirmAction('Delete ALL Pay / Receive records?','This permanently removes everyone you are owed by and everyone you owe. This cannot be undone.',()=>{credit=[];saveCredit();render()});
}
function exportData(){
  const b=new Blob([JSON.stringify({version:2,exportedAt:new Date().toISOString(),data,credit,savings,currency},null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='abdulla-finance-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)
}
function drawCharts(i,e){
  const r=document.getElementById('reportChart');if(r&&typeof Chart!=='undefined'){if(reportChart)reportChart.destroy();reportChart=new Chart(r,{type:'bar',data:{labels:['Income','Expense','Savings'],datasets:[{data:[i,e,savings]}]},options:{responsive:true,plugins:{legend:{display:false}}}})}
}
function refreshMonthOptions(){
  const select=document.getElementById('monthFilter');if(!select)return;
  const keys=new Set([getMonthKey(new Date()),...data.map(x=>getMonthKey(x.date||Date.now()))]);
  const sorted=[...keys].sort().reverse();
  select.innerHTML='<option value="all">All Time</option>'+sorted.map(k=>`<option value="${k}">${monthLabel(k)}</option>`).join('');
  if(![...keys].includes(selectedMonth)&&selectedMonth!=='all')selectedMonth=getMonthKey(new Date());
  select.value=selectedMonth;
}

function render(){
  refreshMonthOptions();
  const filtered=getFilteredData();let i=0,e=0;
  filtered.forEach(x=>{if(x.type==='income')i+=Number(x.amount);else e+=Number(x.amount)});
  const income=document.getElementById('income'),expense=document.getElementById('expense'),balance=document.getElementById('balance'),net=document.getElementById('netWorth'),period=document.getElementById('periodLabel');
  if(income)income.textContent=money(i);if(expense)expense.textContent=money(e);if(balance)balance.textContent=money(i-e);if(net)net.textContent=money(i-e+savings);if(period)period.textContent=monthLabel(selectedMonth);

  const list=document.getElementById('list');
  if(list)list.innerHTML=filtered.length?filtered.slice().reverse().map(x=>`<li class="transaction-item"><div><strong>${escapeHtml(x.name)}</strong> ${money(x.amount)}</div><small>${x.type==='income'?'🟢 Income':'🔴 Expense'} · ${escapeHtml(x.category||'Other')} · 📅 ${formatDate(x.date||Date.now())}</small><div class="item-actions"><button class="edit-btn" onclick="editItem(${x.id})">✏️ Edit</button><button class="delete-btn" onclick="removeItem(${x.id})">🗑️ Delete</button></div></li>`).join(''):`<li class="empty-state">No transactions for ${monthLabel(selectedMonth)}.</li>`;

  const cl=document.getElementById('creditList');
  if(cl)cl.innerHTML=credit.length?credit.slice().reverse().map(x=>{const remaining=Math.max(0,x.amount-x.settled);return `<li class="transaction-item"><div><strong>${escapeHtml(x.person)}</strong> ${x.type==='receive'?'🟢 Receive':'🔴 Pay'} ${money(remaining)}</div><small>Original: ${money(x.amount)} · Settled: ${money(x.settled)} · 📅 ${formatDate(x.date||Date.now())}</small><div class="item-actions">${remaining>0?`<button class="settle-btn" onclick="settleCredit(${x.id})">💵 Settle</button>`:''}<button class="edit-btn" onclick="editCredit(${x.id})">✏️ Edit</button><button class="delete-btn" onclick="removeCredit(${x.id})">🗑️ Delete</button></div></li>`}).join(''):'<li class="empty-state">No Pay / Receive entries yet.</li>';
  drawCharts(i,e);
}
function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

render();