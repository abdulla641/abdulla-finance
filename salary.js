let recurringSalary=Number(localStorage.getItem('recurringSalary'))||7000;
function saveRecurringSalary(){localStorage.setItem('recurringSalary',String(recurringSalary))}
function editRecurringSalary(){const v=Number(prompt('Monthly salary / recurring income',String(recurringSalary)));if(Number.isFinite(v)&&v>0){recurringSalary=v;saveRecurringSalary();renderSalary()}}
function renderSalary(){const amount=document.getElementById('salaryAmount');if(amount)amount.textContent=money(recurringSalary);const expected=document.getElementById('expectedIncome');if(expected)expected.textContent=money(recurringSalary)}
renderSalary();