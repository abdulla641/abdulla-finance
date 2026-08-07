let data=JSON.parse(localStorage.getItem('finance'))||[];
let credit=JSON.parse(localStorage.getItem('credit'))||[];
let savings=Number(localStorage.getItem('savings'))||0;
let currency=localStorage.getItem('currency')||'QAR';
let chart,reportChart;

function val(id){const el=document.getElementById(id);return el?el.value:''}
function money(v){return currency+' '+Number(v||0).toLocaleString()}
function setCurrency(){currency=val('currency');localStorage.setItem('currency',currency);render()}
function save(){localStorage.setItem('finance',JSON.stringify(data))}
function saveCredit(){localStorage.setItem('credit',JSON.stringify(credit))}

function addTransaction(){
  const name=val('name').trim(), amount=Number(val('amount')), type=val('type'), category=val('category');
  if(!name||!Number.isFinite(amount)||amount<=0){alert('Please enter a description and a valid amount.');return}
  data.push({id:Date.now()+Math.random(),name,amount,type,category,date:new Date().toISOString()});
  save();
  render();
  document.getElementById('name').value='';
  document.getElementById('amount').value='';
}

function formatDate(d){return new Date(d).toLocaleString('en-GB',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})}

function addSaving(){
  const a=Number(val('saving'));
  if(!Number.isFinite(a)||a<=0)return;
  savings+=a;localStorage.setItem('savings',savings);render();
  document.getElementById('saving').value='';
}

function addCredit(){
  const person=val('person').trim(),amount=Number(val('creditAmount')),type=val('creditType');
  if(!person||!Number.isFinite(amount)||amount<=0){alert('Please enter a name and valid amount.');return}
  credit.push({id:Date.now()+Math.random(),person,amount,type,settled:0,date:new Date().toISOString()});
  saveCredit();render();
  document.getElementById('person').value='';
  document.getElementById('creditAmount').value='';
}

function settleCredit(id){
  const x=credit.find(i=>i.id===id);if(!x)return;
  const a=Number(prompt('Settlement amount',String(Math.max(0,x.amount-x.settled))));
  if(Number.isFinite(a)&&a>0){x.settled=Math.min(x.amount,x.settled+a);saveCredit();render()}
}

function editItem(id){
  const x=data.find(i=>i.id===id);if(!x)return;
  const name=prompt('Edit description',x.name);
  if(name===null)return;
  const amount=Number(prompt('Edit amount',x.amount));
  if(name.trim()&&Number.isFinite(amount)&&amount>0){x.name=name.trim();x.amount=amount;save();render()}
}

function removeItem(id){
  if(!confirm('Delete this transaction?'))return;
  data=data.filter(x=>x.id!==id);save();render();
}

function editCredit(id){
  const x=credit.find(i=>i.id===id);if(!x)return;
  const person=prompt('Edit name',x.person);
  if(person===null)return;
  const amount=Number(prompt('Edit amount',x.amount));
  if(person.trim()&&Number.isFinite(amount)&&amount>0){x.person=person.trim();x.amount=amount;x.settled=Math.min(x.settled,amount);saveCredit();render()}
}

function removeCredit(id){
  if(!confirm('Delete this Pay / Receive entry?'))return;
  credit=credit.filter(x=>x.id!==id);saveCredit();render();
}

function clearTransactions(){
  if(!data.length){alert('No transactions to clear.');return}
  if(confirm('Delete all transaction history? This cannot be undone.')){data=[];save();render()}
}

function clearCredit(){
  if(!credit.length){alert('No Pay / Receive entries to clear.');return}
  if(confirm('Delete all Pay / Receive entries? This cannot be undone.')){credit=[];saveCredit();render()}
}

function exportData(){
  const b=new Blob([JSON.stringify({data,credit,savings,currency},null,2)],{type:'application/json'}),a=document.createElement('a');
  a.href=URL.createObjectURL(b);a.download='abdulla-finance-backup.json';a.click();URL.revokeObjectURL(a.href)
}

function drawCharts(i,e){
  const r=document.getElementById('reportChart');
  if(r&&typeof Chart!=='undefined'){
    if(reportChart)reportChart.destroy();
    reportChart=new Chart(r,{type:'bar',data:{labels:['Income','Expense','Savings'],datasets:[{data:[i,e,savings]}]}})
  }
}

function render(){
  let i=0,e=0;
  data.forEach(x=>{if(x.type==='income')i+=Number(x.amount);else e+=Number(x.amount)});
  const income=document.getElementById('income'),expense=document.getElementById('expense'),balance=document.getElementById('balance'),net=document.getElementById('netWorth');
  if(income)income.textContent=money(i);if(expense)expense.textContent=money(e);if(balance)balance.textContent=money(i-e);if(net)net.textContent=money(i-e+savings);

  const list=document.getElementById('list');
  if(list)list.innerHTML=data.length?data.slice().reverse().map(x=>`<li class="transaction-item"><div><strong>${escapeHtml(x.name)}</strong> ${money(x.amount)}</div><small>${x.type==='income'?'🟢 Income':'🔴 Expense'} · ${escapeHtml(x.category||'Other')} · 📅 ${formatDate(x.date||Date.now())}</small><div class="item-actions"><button class="edit-btn" onclick="editItem(${x.id})">✏️ Edit</button><button class="delete-btn" onclick="removeItem(${x.id})">🗑️ Delete</button></div></li>`).join(''):'<li class="empty-state">No transactions yet.</li>';

  const cl=document.getElementById('creditList');
  if(cl)cl.innerHTML=credit.length?credit.slice().reverse().map(x=>{const remaining=Math.max(0,x.amount-x.settled);return `<li class="transaction-item"><div><strong>${escapeHtml(x.person)}</strong> ${x.type==='receive'?'🟢 Receive':'🔴 Pay'} ${money(remaining)}</div><small>Original: ${money(x.amount)} · Settled: ${money(x.settled)} · 📅 ${formatDate(x.date||Date.now())}</small><div class="item-actions">${remaining>0?`<button class="settle-btn" onclick="settleCredit(${x.id})">💵 Settle</button>`:''}<button class="edit-btn" onclick="editCredit(${x.id})">✏️ Edit</button><button class="delete-btn" onclick="removeCredit(${x.id})">🗑️ Delete</button></div></li>`}).join(''):'<li class="empty-state">No Pay / Receive entries yet.</li>';
  drawCharts(i,e);
}

function escapeHtml(value){return String(value??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

render();