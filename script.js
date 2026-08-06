let data=JSON.parse(localStorage.getItem('finance'))||[];
let credit=JSON.parse(localStorage.getItem('credit'))||[];
let savings=Number(localStorage.getItem('savings'))||0;

function addTransaction(){let name=nameEl('name'),amount=Number(nameEl('amount').value),type=nameEl('type').value;if(!name||!amount)return;data.push({id:Date.now(),name,amount,type});save();render();}
function nameEl(id){return document.getElementById(id).value;}
function save(){localStorage.setItem('finance',JSON.stringify(data));}
function removeItem(id){data=data.filter(x=>x.id!==id);save();render();}

function addSaving(){let a=Number(nameEl('saving'));if(a){savings+=a;localStorage.setItem('savings',savings);render();}}

function addCredit(){let person=nameEl('person'),amount=Number(nameEl('creditAmount')),type=nameEl('creditType');if(!person||!amount)return;credit.push({id:Date.now(),person,amount,type,settled:0});localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}
function settleCredit(id){let item=credit.find(x=>x.id===id);let value=Number(prompt('Settlement amount'));if(item&&value){item.settled+=value;if(item.settled>item.amount)item.settled=item.amount;localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}}
function deleteCredit(id){credit=credit.filter(x=>x.id!==id);localStorage.setItem('credit',JSON.stringify(credit));renderCredit();}

function renderCredit(){let list=document.getElementById('creditList');if(!list)return;list.innerHTML='';let receive=0,pay=0;credit.forEach(x=>{let remain=x.amount-x.settled;if(x.type==='receive')receive+=remain;else pay+=remain;let li=document.createElement('li');li.innerHTML=`${x.person}: ${x.type==='receive'?'🟢 Receive':'🔴 Pay'} QAR ${x.amount}<br>Settled: QAR ${x.settled} | Remaining: QAR ${remain}<br><button onclick="settleCredit(${x.id})">Settle</button> <button onclick="deleteCredit(${x.id})">Delete</button>`;list.appendChild(li);});}

function render(){let income=0,expense=0;let list=document.getElementById('list');list.innerHTML='';data.forEach(x=>{x.type==='income'?income+=x.amount:expense+=x.amount;let li=document.createElement('li');li.innerHTML=`${x.name}: ${x.type==='income'?'+':'-'} QAR ${x.amount} <button onclick="removeItem(${x.id})">Delete</button>`;list.appendChild(li)});document.getElementById('income').textContent='QAR '+income;document.getElementById('expense').textContent='QAR '+expense;document.getElementById('balance').textContent='QAR '+(income-expense);document.getElementById('savingTotal').textContent='QAR '+savings;renderCredit();}
render();