let data=JSON.parse(localStorage.getItem('finance'))||[];
let credit=JSON.parse(localStorage.getItem('credit'))||[];
let savings=Number(localStorage.getItem('savings'))||0;
let currency=localStorage.getItem('currency')||'QAR';
let chart;
function val(id){return document.getElementById(id).value;}
function money(v){return currency+' '+Number(v).toLocaleString();}
function setCurrency(){currency=val('currency');localStorage.setItem('currency',currency);render();}
function addTransaction(){let name=val('name'),amount=Number(val('amount')),type=val('type'),category=val('category');if(!name||!amount)return;data.push({id:Date.now(),name,amount,type,category,date:new Date().toISOString()});save();render();}
function save(){localStorage.setItem('finance',JSON.stringify(data));}
function removeItem(id){data=data.filter(x=>x.id!==id);save();render();}
function editItem(id){let item=data.find(x=>x.id===id);if(!item)return;let n=prompt('Edit description',item.name);let a=Number(prompt('Edit amount',item.amount));if(n&&a){item.name=n;item.amount=a;save();render();}}
function addSaving(){let a=Number(val('saving'));if(a){savings+=a;localStorage.setItem('savings',savings);render();}}
function addCredit(){let person=val('person'),amount=Number(val('creditAmount')),type=val('creditType');if(!person||!amount)return;credit.push({id:Date.now(),person,amount,type,settled:0});localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}
function settleCredit(id){let item=credit.find(x=>x.id===id),value=Number(prompt('Settlement amount'));if(item&&value){item.settled=Math.min(item.amount,item.settled+value);localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}}
function exportData(){let backup={data,credit,savings,currency};let blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='abdulla-finance-backup.json';a.click();}
function searchTransactions(){render();}
function drawChart(income,expense){let c=document.getElementById('chart');if(!c||typeof Chart==='undefined')return;if(chart)chart.destroy();chart=new Chart(c,{type:'doughnut',data:{labels:['Income','Expense'],datasets:[{data:[income,expense]}]},options:{responsive:true}});}
function renderCredit(){let list=document.getElementById('creditList');if(!list)return;list.innerHTML='';credit.forEach(x=>{let r=x.amount-x.settled;list.innerHTML+=`<li>${x.person}<br>${x.type==='receive'?'🟢 Receive':'🔴 Pay'} ${money(x.amount)}<br>Remaining ${money(r)}<br><button onclick="settleCredit(${x.id})">Settle</button></li>`;});}
function render(){let income=0,expense=0,debt=0;let categories={};let list=document.getElementById('list');if(list)list.innerHTML='';let filter=(document.getElementById('search')?.value||'').toLowerCase();data.filter(x=>x.name.toLowerCase().includes(filter)||x.category.toLowerCase().includes(filter)).forEach(x=>{x.type==='income'?income+=x.amount:expense+=x.amount;if(x.type==='expense')categories[x.category]=(categories[x.category]||0)+x.amount;if(list)list.innerHTML+=`<li>${x.name} (${x.category}) ${x.type==='income'?'+':'-'} ${money(x.amount)} <button onclick="editItem(${x.id})">Edit</button> <button onclick="removeItem(${x.id})">Delete</button></li>`;});credit.forEach(x=>{if(x.type==='pay')debt+=x.amount-x.settled;});document.getElementById('income').textContent=money(income);document.getElementById('expense').textContent=money(expense);document.getElementById('balance').textContent=money(income-expense);document.getElementById('savingTotal').textContent=money(savings);document.getElementById('summary').textContent=money(income-expense);let net=document.getElementById('netWorth');if(net)net.textContent=money((income-expense)+savings-debt);let analytics=document.getElementById('analytics');if(analytics)analytics.textContent=Object.entries(categories).map(x=>x[0]+': '+money(x[1])).join(' | ')||'No expenses yet';drawChart(income,expense);renderCredit();}
render();