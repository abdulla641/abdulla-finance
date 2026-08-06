let data=JSON.parse(localStorage.getItem('finance'))||[];
let credit=JSON.parse(localStorage.getItem('credit'))||[];
function addTransaction(){let name=document.getElementById('name').value;let amount=Number(document.getElementById('amount').value);let type=document.getElementById('type').value;if(!name||!amount)return;data.push({id:Date.now(),name,amount,type});save();render();}
function save(){localStorage.setItem('finance',JSON.stringify(data));}
function removeItem(id){data=data.filter(x=>x.id!==id);save();render();}
function render(){let income=0,expense=0;let list=document.getElementById('list');list.innerHTML='';data.forEach(x=>{x.type==='income'?income+=x.amount:expense+=x.amount;let li=document.createElement('li');li.innerHTML=`${x.name}: ${x.type==='income'?'+':'-'} QAR ${x.amount} <button onclick="removeItem(${x.id})">Delete</button>`;list.appendChild(li)});document.getElementById('income').textContent='QAR '+income;document.getElementById('expense').textContent='QAR '+expense;document.getElementById('balance').textContent='QAR '+(income-expense);}
render();