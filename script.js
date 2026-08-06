let data=JSON.parse(localStorage.getItem('finance'))||[];
let credit=JSON.parse(localStorage.getItem('credit'))||[];
let savings=Number(localStorage.getItem('savings'))||0;
let currency=localStorage.getItem('currency')||'QAR';
function val(id){return document.getElementById(id).value;}
function money(v){return currency+' '+Number(v).toLocaleString();}
function setCurrency(){currency=val('currency');localStorage.setItem('currency',currency);render();}
function addTransaction(){let name=val('name'),amount=Number(val('amount')),type=val('type'),category=val('category');if(!name||!amount)return;data.push({id:Date.now(),name,amount,type,category,date:new Date().toISOString()});save();render();}
function save(){localStorage.setItem('finance',JSON.stringify(data));}
function removeItem(id){data=data.filter(x=>x.id!==id);save();render();}
function addSaving(){let a=Number(val('saving'));if(a){savings+=a;localStorage.setItem('savings',savings);render();}}
function addCredit(){let person=val('person'),amount=Number(val('creditAmount')),type=val('creditType');if(!person||!amount)return;credit.push({id:Date.now(),person,amount,type,settled:0});localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}
function settleCredit(id){let item=credit.find(x=>x.id===id),value=Number(prompt('Settlement amount'));if(item&&value){item.settled=Math.min(item.amount,item.settled+value);localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}}
function exportData(){let backup={data,credit,savings,currency};let blob=new Blob([JSON.stringify(backup,null,2)],{type:'application/json'});let a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='abdulla-finance-backup.json';a.click();}
function renderCredit(){let list=document.getElementById('creditList');if(!list)return;list.innerHTML='';credit.forEach(x=>{let r=x.amount-x.settled;let li=document.createElement('li');li.innerHTML=`${x.person}<br>${x.type==='receive'?'🟢 Receive':'🔴 Pay'} ${money(x.amount)}<br>Remaining ${money(r)}<br><button onclick="settleCredit(${x.id})">Settle</button>`;list.appendChild(li);});}
function render(){let income=0,expense=0;let categories={};let list=document.getElementById('list');if(list)list.innerHTML='';data.forEach(x=>{x.type==='income'?income+=x.amount:expense+=x.amount;if(x.type==='expense')categories[x.category]=(categories[x.category]||0)+x.amount;if(list){let li=document.createElement('li');li.innerHTML=`${x.name} (${x.category}) ${x.type==='income'?'+':'-'} ${money(x.amount)} <button onclick="removeItem(${x.id})">Delete</button>`;list.appendChild(li);}});document.getElementById('income').textContent=money(income);document.getElementById('expense').textContent=money(expense);document.getElementById('balance').textContent=money(income-expense);document.getElementById('savingTotal').textContent=money(savings);document.getElementById('summary').textContent=money(income-expense);let chart=document.getElementById('analytics');if(chart)chart.textContent=Object.entries(categories).map(x=>x[0]+': '+money(x[1])).join(' | ');renderCredit();}
render();