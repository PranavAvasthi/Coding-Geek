const select = document.getElementById("add-type");
const input1 = document.getElementById("add-description");
const input2 = document.getElementById("add-amount");
const submit = document.getElementById("add-btn");
const error = document.getElementById("error-msg");
const incomeDetails = document.getElementById("income-details");
const expenseDetails = document.getElementById("expense-details");
const closeBtn = document.getElementById("close-btn");
const incVal = document.getElementById("income-value");
const expVal = document.getElementById("expenses-value");
const graphBtn1 = document.getElementById("show-income-graph");
const graphBtn2 = document.getElementById("show-expense-graph");

// Update Border color
function updateBorderColor(element, color) {
    element.style.border = `1px solid ${color}`;
}

// Update Icon color
function updateIconColor() {
    const selectedValue = select.value;
    if (selectedValue === "inc") {
        submit.style.border = "1px solid #5d945c";
        submit.style.color = "#5d945c";
    } else if (selectedValue === "exp") {
        submit.style.border = "1px solid #d2373f";
        submit.style.color = "#d2373f";
    }
}

// Handle Input focus
function handleInputFocus() {
    const selectedValue = select.value;
    if (selectedValue === "inc") {
        updateBorderColor(this, "#5d945c");
    } else if (selectedValue === "exp") {
        updateBorderColor(this, "#d2373f");
    }
}

// Handle Input blur
function handleInputBlur() {
    updateBorderColor(this, "white");
}

// Event listener for select change
select.addEventListener("change", function () {
    const selectedValue = select.value;
    if (selectedValue === "inc") {
        updateBorderColor(select, "#5d945c");
        updateIconColor();
    } else if (selectedValue === "exp") {
        updateBorderColor(select, "#d2373f");
        updateIconColor();
    }
});

// Event listener for input focus
input1.addEventListener("focus", handleInputFocus);
input2.addEventListener("focus", handleInputFocus);

// Event listener for input blur
input1.addEventListener("blur", handleInputBlur);
input2.addEventListener("blur", handleInputBlur);

// Function to display error message
function showError(message) {
    error.style.visibility = "visible";
    let para = document.createElement("p");
    para.textContent = message;
    para.style.color = "red";
    error.appendChild(para);
  
    if (!error.querySelector("close-btn")) {
      let closeBtn = document.createElement("p");
      closeBtn.textContent = "x";
      closeBtn.classList.add("close-btn"); 
      error.appendChild(closeBtn);
  
      closeBtn.addEventListener("click", function () {
        hideError();
      });
    }
  }
  
  // Function to hide error message
  function hideError() {
    error.style.visibility = "hidden";
    error.textContent = "";
  }

closeBtn.addEventListener("click", function () {
    hideError();
});

// handling click part
// handling click part
function handleClick() {
    const typeValue = select.value;
    const descValue = input1.value;
    const amValue = parseFloat(input2.value);

    if (!descValue || isNaN(amValue)) {
        showError("Error: Check description is not empty & amount is a positive float up to 2 decimal places & not 0!");
        return;
    }

    const now = new Date();
    const timestamp = now.toLocaleString();

    const statement = {
        type: typeValue,
        description: descValue,
        amount: amValue,
        percentage: 0,
        timestamp: timestamp
    };

    let prevStatements = getPreviousStatements();

    if (statement.type === "inc" && prevStatements.newIncome) {
        const existingIncome = prevStatements.newIncome.find(item => item.description === descValue);
        if (existingIncome) {
            showError("Error: Given description item already present in income!");
            return;
        }
    }

    if (statement.type === "exp" && prevStatements.newExpense) {
        const existingExpense = prevStatements.newExpense.find(item => item.description === descValue);
        if (existingExpense) {
            showError("Error: Given description item already present in expenses!");
            return;
        }
    }

    let obj = updateStatements(statement, prevStatements);
    console.log(obj);
    updateLocalStorage(obj);
    updateTotalBudget();
    updateIncomePercentages();
    updateExpensePercentages();
    updateIncomePercentageValue();
    updateExpensePercentageValue();

    input1.value = '';
    input2.value = '';

    if (statement.type == "inc") {
        const statementEle = createIncomeStatement(statement);
        incomeDetails.appendChild(statementEle);

        console.log(incVal.textContent);
        let currentIncome = parseFloat(incVal.textContent.split(' ')[1]);
        console.log(currentIncome);
        currentIncome += statement.amount;
        console.log(statement.amount);
        console.log(currentIncome);
        incVal.textContent = `+ ${currentIncome}`;

        updateIncomePercentages();
        updateIncomePercentageValue();
    } else {
        // Check if there's enough income to cover the expense
        const totalIncome = prevStatements.newIncome.reduce((acc, cur) => acc + cur.amount, 0);
        if (statement.amount > totalIncome) {
            showError("Error : Add more Income to proceed!");
            return;
        }

        const statementEle = createExpenseStatement(statement);
        expenseDetails.appendChild(statementEle);

        let currentExpense = parseFloat(expVal.textContent.split(' ')[1]);
        currentExpense += statement.amount;
        expVal.textContent = `- ${currentExpense}`;

        updateExpensePercentages();
        updateExpensePercentageValue();
    }
}


function getPreviousStatements() {
    // console.log(JSON.parse(localStorage.getItem('statement')) || {})
    return JSON.parse(localStorage.getItem('statement')) || {};
}

// Function to update transactions based on the transaction type
function updateStatements(statement, prevStatements) {
    let income = prevStatements.newIncome || [];
    let expense = prevStatements.newExpense || [];
    let total = prevStatements.newTotal || 0;
    let percentage = prevStatements.newPercentage || 0;

    if (statement.type === 'exp') {
        if (statement.amount > total) {
            return prevStatements; 
        }
        expense.push(statement);
        total -= statement.amount;
    } else {
        income.push(statement);
        total += statement.amount;
    }

    let sumIncome = income.reduce((acc, cur) => acc + cur.amount, 0);
    let sumExpense = expense.reduce((acc, cur) => acc + cur.amount, 0);

    for (let inc of income) {
        inc.percentage = inc.amount * 100 / sumIncome;
    }

    for (let exp of expense) {
        exp.percentage = exp.amount * 100 / sumExpense;
    }

    // Return the updated statements object
    return { newIncome: income, newExpense: expense, newTotal: total, newPercentage: percentage };
}


function createIncomeStatement(statement) {
    const transaction = document.createElement("div");
    transaction.classList.add("transaction-1");

    const description = document.createElement("p");
    description.textContent = statement.description;
    transaction.appendChild(description);

    const timestamp = document.createElement("p");
    timestamp.textContent = statement.timestamp; // stored timestamp
    // console.log(statement.timestamp);
    transaction.appendChild(timestamp);

    const amount = document.createElement("p");
    amount.textContent = `+ ${statement.amount}`;
    amount.style.color = "#5d945c";
    transaction.appendChild(amount);

    const deleteBtn = document.createElement("p");
    deleteBtn.innerHTML = "&times;";
    deleteBtn.classList.add("delete-btn-1");
    deleteBtn.addEventListener("click", function () {
        deleteIncomeStatement(transaction, statement);
    });
    transaction.appendChild(deleteBtn);

    // Recalculate and update income percentages
    updateIncomePercentages();
    updateIncomePercentageValue();

    if(incomeDetails.children.length > 1) {
        showIncomeLineGraph();
    }

    return transaction;
}


function createExpenseStatement(statement) {
    const transaction = document.createElement("div");
    transaction.classList.add("transaction-2");

    const description = document.createElement("p");
    description.textContent = statement.description;
    transaction.appendChild(description);

    const timestamp = document.createElement("p");
    timestamp.textContent = statement.timestamp; // stored timestamp
    transaction.appendChild(timestamp);

    const amount = document.createElement("p");
    amount.textContent = `- ${statement.amount}`;
    amount.style.color = "#d2373f";
    transaction.appendChild(amount);

    const deleteBtn = document.createElement("p");
    deleteBtn.innerHTML = "&times;";
    deleteBtn.classList.add("delete-btn-2");
    deleteBtn.addEventListener("click", function () {
        deleteExpenseStatement(transaction, statement);
    });
    transaction.appendChild(deleteBtn);

    // Recalculate and update expense percentages
    updateExpensePercentages();
    updateExpensePercentageValue();

    if(expenseDetails.children.length > 1) {
        showExpenseLineGraph();
    }

    return transaction;
}



function updateTotal() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const totalIncome = storedData.newIncome.reduce((acc, cur) => acc + cur.amount, 0);
    const totalExpenses = storedData.newExpense.reduce((acc, cur) => acc + cur.amount, 0);

    incVal.textContent = `+ ${totalIncome}`;
    expVal.textContent = `- ${totalExpenses}`;
}

function updateTotalBudget() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const totalIncome = storedData.newIncome.reduce((acc, cur) => acc + cur.amount, 0);
    const totalExpenses = storedData.newExpense.reduce((acc, cur) => acc + cur.amount, 0);
    const totalBudget = totalIncome - totalExpenses;

    document.getElementById('total-budget').textContent = totalBudget;
}

function deleteIncomeStatement(transaction, statement) {
    // Flag to track if an error occurred during deletion
    let errorOccurred = false;

    // Remove the statement from local storage
    let prevStatements = getPreviousStatements();

    // Index of the statement
    const index = prevStatements.newIncome.findIndex(item => item.description === statement.description);

    if (index > -1) {
        const deletedAmount = prevStatements.newIncome[index].amount;
        prevStatements.newIncome.splice(index, 1);

        let total = prevStatements.newTotal - deletedAmount;
        
        if(total < 0) {
            showError("Error: Deleting this will make budget negative!");
            errorOccurred = true;
        } else {
            prevStatements.newTotal = total;

            const remainingIncome = prevStatements.newIncome;
            const totalIncome = remainingIncome.reduce((acc, cur) => acc + cur.amount, 0);

            remainingIncome.forEach(inc => {
                inc.percentage = (inc.amount / totalIncome) * 100;
            });
            
            prevStatements.newPercentage = statement.percentage;

            updateLocalStorage(prevStatements, true);

            let currentIncome = parseFloat(incVal.textContent.split(' ')[1]);
            currentIncome -= deletedAmount;
            incVal.textContent = `+ ${currentIncome}`;

            transaction.remove();
            updateTotal();
            updateIncomePercentages();
            updateIncomePercentageValue();
            updateExpensePercentages(); 
            updateExpensePercentageValue();

            if(incomeDetails.children.length === 0) {
                document.getElementById('income-chart').style.display = "none";
                graphBtn1.classList.remove('slant-line-income');
            } else {
                showIncomeLineGraph();
            }
    }
}
}

function updateIncomePercentages() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const totalIncome = storedData.newIncome.reduce((acc, cur) => acc + cur.amount, 0);

    const incomeTransactions = incomeDetails.querySelectorAll('.transaction-1');
    incomeTransactions.forEach(transaction => {
        const description = transaction.querySelector('p');
        const incomeDesc = description.textContent;
        const incomeStatement = storedData.newIncome.find(item => item.description === incomeDesc);
        const percentage = (incomeStatement.amount / totalIncome) * 100;
        
        const existingPercentage = transaction.querySelector('.percentage-display-1');
        if (existingPercentage) {
            existingPercentage.remove();
        }

        const percentageDisplay = document.createElement("p");
        percentageDisplay.classList.add("percentage-display-1");
        percentageDisplay.textContent = `${percentage.toFixed(2)}%`;
        transaction.appendChild(percentageDisplay);

        description.setAttribute("data-percentage", percentage.toFixed(2));
    });
}

function deleteExpenseStatement(transaction, statement) {
    transaction.remove(); 

    // Remove the statement from local storage
    let prevStatements = getPreviousStatements();

    // Index of the statement
    const index = prevStatements.newExpense.findIndex(item => item.description === statement.description);

    if (index > -1) {
        const deletedAmount = prevStatements.newExpense[index].amount;
        prevStatements.newExpense.splice(index, 1);

        let total = prevStatements.newTotal + deletedAmount;
        
        prevStatements.newTotal = total;

        const remainingExpense = prevStatements.newExpense;
        const totalExpense = remainingExpense.reduce((acc, cur) => acc + cur.amount, 0);

        remainingExpense.forEach(exp => {
            exp.percentage = (exp.amount / totalExpense) * 100;
        });
        
        prevStatements.newPercentage = statement.percentage;

        updateLocalStorage(prevStatements, true);

        let currentExpenses = parseFloat(expVal.textContent.split(' ')[1]);
        currentExpenses -= deletedAmount;
        expVal.textContent = `- ${currentExpenses}`;

        updateTotal();
        updateExpensePercentages();
        updateExpensePercentageValue();
        updateIncomePercentages(); 
        updateIncomePercentageValue(); 

        if(expenseDetails.children.length === 0) {
            document.getElementById('expenses-chart').style.display = "none";
            graphBtn2.classList.remove('slant-line-expense');
        } else {
            showExpenseLineGraph();
        }
    }
}

function updateExpensePercentages() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const totalExpenses = storedData.newExpense.reduce((acc, cur) => acc + cur.amount, 0);

    const expenseTransactions = expenseDetails.querySelectorAll('.transaction-2');
    expenseTransactions.forEach(transaction => {
        const description = transaction.querySelector('p');
        const expenseDesc = description.textContent;
        const expenseStatement = storedData.newExpense.find(item => item.description === expenseDesc);
        const percentage = (expenseStatement.amount / totalExpenses) * 100;
        
        const existingPercentage = transaction.querySelector('.percentage-display-2');
        if (existingPercentage) {
            existingPercentage.remove();
        }

        const percentageDisplay = document.createElement("p");
        percentageDisplay.classList.add("percentage-display-2");
        percentageDisplay.textContent = `${percentage.toFixed(2)}%`;
        transaction.appendChild(percentageDisplay);

        description.setAttribute("data-percentage", percentage.toFixed(2));
    });
}

function updateIncomePercentageValue() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const totalIncome = storedData.newIncome.reduce((acc, cur) => acc + cur.amount, 0);
    const totalExpense = storedData.newExpense.reduce((acc, cur) => acc + cur.amount, 0);
    const totalAbsoluteValue = Math.abs(totalIncome + totalExpense);

    let incomePercentage = totalAbsoluteValue !== 0 ? (totalIncome / totalAbsoluteValue) * 100 : 0;

    const incBudget = document.querySelector(".budget-income");
    let existingPercentageDisplay = incBudget.querySelector(".income-percentage");
    
    if (existingPercentageDisplay) {
        incBudget.removeChild(existingPercentageDisplay); // Remove previous percentage display
    }
    
    const percentageDisplay = document.createElement("p");
    percentageDisplay.classList.add("income-percentage");
    percentageDisplay.textContent = `${incomePercentage.toFixed(2)}%`;
    
    incBudget.appendChild(percentageDisplay);
}

function updateExpensePercentageValue() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const totalIncome = storedData.newIncome.reduce((acc, cur) => acc + cur.amount, 0);
    const totalExpense = storedData.newExpense.reduce((acc, cur) => acc + cur.amount, 0);
    const totalAbsoluteValue = Math.abs(totalIncome + totalExpense);

    let expensePercentage = totalAbsoluteValue !== 0 ? (totalExpense / totalAbsoluteValue) * 100 : 0;

    const expBudget = document.querySelector(".budget-expenses");
    let existingPercentageDisplay = expBudget.querySelector(".expenses-percentage");

    if (existingPercentageDisplay) {
        existingPercentageDisplay.textContent = `${expensePercentage.toFixed(2)}%`;
    } else {
        const percentageDisplay = document.createElement("p");
        percentageDisplay.classList.add("expenses-percentage");
        percentageDisplay.textContent = `${expensePercentage.toFixed(2)}%`;

        expBudget.appendChild(percentageDisplay);
    }
}

function showIncomeLineGraph() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const incomeData = storedData.newIncome.map(item => ({ x: item.description, y: item.amount }));

    if (incomeChart) {
        incomeChart.data.labels = incomeData.map(item => item.x);
        incomeChart.data.datasets[0].data = incomeData.map(item => item.y);
        incomeChart.update();
    } else {
        const incomeCtx = document.getElementById('income-chart').getContext('2d');
    
        incomeChart = new Chart(incomeCtx, {
            type: 'line',
            data: {
                labels: incomeData.map(item => item.x),
                datasets: [{
                    label: 'INCOME',
                    data: incomeData.map(item => item.y),
                    backgroundColor: '#5d945c',
                    borderColor: '#5d945c',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

// Function to show expense line graph
function showExpenseLineGraph() {
    const storedData = JSON.parse(localStorage.getItem('statement')) || { newIncome: [], newExpense: [] };
    const expenseData = storedData.newExpense.map(item => ({ x: item.description, y: item.amount }));

    if (expenseChart) {
        expenseChart.data.labels = expenseData.map(item => item.x);
        expenseChart.data.datasets[0].data = expenseData.map(item => item.y);
        expenseChart.update();
    } else {
        const expenseCtx = document.getElementById('expenses-chart').getContext('2d');
    
        expenseChart = new Chart(expenseCtx, {
            type: 'line',
            data: {
                labels: expenseData.map(item => item.x),
                datasets: [{
                    label: 'EXPENSE',
                    data: expenseData.map(item => item.y),
                    backgroundColor: '#d2373f',
                    borderColor: '#d2373f',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
}

function getLocalStorage() {
    const storedIncome = JSON.parse(localStorage.getItem('statement')).newIncome||[];
    const storedExpense = JSON.parse(localStorage.getItem('statement')).newExpense||[];
    // console.log(storedIncome);
    // console.log(storedExpense);

    for(let inc of storedIncome) {
        const statementEle = createIncomeStatement(inc);
        incomeDetails.appendChild(statementEle);
    }

    for(let exp of storedExpense) {
        const statementEle = createExpenseStatement(exp);
        expenseDetails.appendChild(statementEle);
    }
}

window.onload = ()=> {
    getLocalStorage();
    updateTotal();
    updateTotalBudget();
    updateIncomePercentages(); 
    updateExpensePercentages();
    updateIncomePercentageValue();
    updateExpensePercentageValue();
    // graphBtn1.classList.add("slant-line-income");
    // graphBtn2.classList.add("slant-line-expense");
};

function updateLocalStorage(data, updateTotalValues) {
    localStorage.setItem('statement', JSON.stringify(data));
    if (updateTotalValues) {
        updateTotal();
        updateTotalBudget();
    }
}

submit.addEventListener("click", handleClick);

let incomeChart, expenseChart;
let isIncomeGraphVisible = true;
let isExpenseGraphVisible = true; 

graphBtn1.addEventListener("click", function() {
    incomeChartToggle();
    graphBtn1.classList.toggle("slant-line-income");
});

graphBtn2.addEventListener("click", function() {
    expenseChartToggle();
    graphBtn2.classList.toggle("slant-line-expense");
});

// Function to toggle visibility of income chart
function incomeChartToggle() {
    if (incomeChart) {
        incomeChart.canvas.style.display = isIncomeGraphVisible ? "none" : "block";
        isIncomeGraphVisible = !isIncomeGraphVisible;
    } else {
        showIncomeLineGraph();
        isIncomeGraphVisible = true;
    }
}

// Function to toggle visibility of expense chart
function expenseChartToggle() {
    if (expenseChart) {
        expenseChart.canvas.style.display = isExpenseGraphVisible ? "none" : "block";
        isExpenseGraphVisible = !isExpenseGraphVisible;
    } else {
        showExpenseLineGraph();
        isExpenseGraphVisible = true;
    }
}

let now = new Date();
const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const month = now.getMonth();
const year = now.getFullYear();

document.getElementById("head").textContent = `Net Available Budget in month ${months[month]} ${year}:`;
