let data=JSON.parse(localStorage.getItem('finance'))||[];
let credit=JSON.parse(localStorage.getItem('credit'))||[];
let savings=Number(localStorage.getItem('savings'))||0;

function val(id){return document.getElementById(id).value;}
function addTransaction(){let name=val('name'),amount=Number(val('amount')),type=val('type');if(!name||!amount)return;data.push({id:Date.now(),name,amount,type});save();render();}
function save(){localStorage.setItem('finance',JSON.stringify(data));}
function removeItem(id){data=data.filter(x=>x.id!==id);save();render();}
function addSaving(){let a=Number(val('saving'));if(a){savings+=a;localStorage.setItem('savings',savings);render();}}
function addCredit(){let person=val('person'),amount=Number(val('creditAmount')),type=val('creditType');if(!person||!amount)return;credit.push({id:Date.now(),person,amount,type,settled:0});localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}
function settleCredit(id){let item=credit.find(x=>x.id===id);let value=Number(prompt('Settlement amount'));if(item&&value){item.settled=Math.min(item.amount,item.settled+value);localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}}
function deleteCredit(id){credit=credit.filter(x=>x.id!==id);localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}
function renderCredit(){let list=document.getElementById('creditList');if(!list)return;list.innerHTML='';credit.forEach(x=>{let remain=x.amount-x.settled;let li=document.createElement('li');li.innerHTML=`${x.person}<br>${x.type==='receive'?'🟢 Receive':'🔴 Pay'} QAR ${x.amount}<br>Settled: QAR ${x.settled} | Remaining: QAR ${remain}<br><button onclick="settleCredit(${x.id})">Settle</button> <button onclick="deleteCredit(${x.id})">Delete</button>`;list.appendChild(li);});}
function render(){let income=0,expense=0;let list=document.getElementById('list');list.innerHTML='';data.forEach(x=>{x.type==='income'?income+=x.amount:expense+=x.amount;let li=document.createElement('li');li.innerHTML=`${x.name}: ${x.type==='income'?'+':'-'} QAR ${x.amount} <button onclick="removeItem(${x.id})">Delete</button>`;list.appendChild(li);});document.getElementById('income').textContent='QAR '+income;document.getElementById('expense').textContent='QAR '+expense;document.getElementById('balance').textContent='QAR '+(income-expense);document.getElementById('savingTotal').textContent='QAR '+savings;renderCredit();}
render();