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
    error.style.display = "block";
    let para = document.createElement("p");
    para.textContent = message;
    para.style.color = "red";
    error.appendChild(para);
  
    // Create the close button only once (if it doesn't exist)
    if (!error.querySelector("close-btn")) {
      let closeBtn = document.createElement("p");
      closeBtn.textContent = "x";
      closeBtn.classList.add("close-btn"); // Add a class for styling
      error.appendChild(closeBtn);
  
      // Add event listener to the close button (assuming only one exists)
      closeBtn.addEventListener("click", function () {
        hideError();
      });
    }
  }
  
  // Function to hide error message
  function hideError() {
    error.style.display = "none";
    error.textContent = "";
  }

// Event listener for close button click
closeBtn.addEventListener("click", function () {
    hideError();
});

// handling click part
function handleClick() {
    const typeValue = select.value;
    const descValue = input1.value;
    const amValue = parseFloat(input2.value);

    if (!descValue || isNaN(amValue)) {
        showError("Error: Check description is not empty & amount is a positive float upto 2 decimal places & not 0!");
        return;
    }

    const statement = {
        type: typeValue,
        description: descValue,
        amount: amValue,
        percentage: 0
    };

    let prevStatements = getPreviousStatements();
    let obj = updateStatements(statement, prevStatements);
    console.log(obj)
    updateLocalStorage(obj);

    input1.value = '';
    input2.value = '';

    if (statement.type == "inc") {
        const statementEle = createIncomeStatement(statement);
        incomeDetails.appendChild(statementEle);
    } else {
        const statementEle = createExpenseStatement(statement);
        expenseDetails.appendChild(statementEle);
    }
}

function getPreviousStatements() {
    // console.log(JSON.parse(localStorage.getItem('statement')) || {})
    return JSON.parse(localStorage.getItem('statement')) || {};
}

// Function to update transactions based on the transaction type
function updateStatements(statement, prevStatements) {
    income = prevStatements.newIncome || [];
    expense = prevStatements.newExpense || [];
    total = prevStatements.newTotal || 0;
    percentage = prevStatements.newPercentage || 0;

    if (statement.type === 'exp') {
        if (statement.amount > total) {
            showError("Error : Add more Income to proceed!");
        }
        expense.push(statement);
        total -= statement.amount;

        document.getElementById('total-budget').textContent = total;

        let sum = 0;
        for (let exp of expense) {
            sum += exp.amount;
        }
        expVal.textContent = `- ${sum}`;

        for (let exp of expense) {
            exp.percentage = statement.amount * 100 / sum;
        }

        // console.log({ newIncome: income, newExpense: expense, newTotal: total })
        return { newIncome: income, newExpense: expense, newTotal: total, newPercentage: statement.percentage };
    } else {
        income.push(statement);
        total += statement.amount;

        document.getElementById('total-budget').textContent = total;

        
        let sum = 0;
        for (let inc of income) {
            sum += inc.amount;
        }

        incVal.textContent = `+ ${sum}`;

        for (let inc of income) {
            inc.percentage = statement.amount * 100 / sum;
        }

        // console.log({ newIncome: income, newExpense: expense, newTotal: total })
        return { newIncome: income, newExpense: expense, newTotal: total, newPercentage: statement.percentage };

    }
}

function createIncomeStatement(statement) {
    const transaction = document.createElement("div");
    transaction.classList.add("transaction-1");

    const description = document.createElement("p");
    description.textContent = statement.description;
    transaction.appendChild(description);

    // Get current date and time
    const now = new Date();
    const formattedDateTime = now.toLocaleString();  // Localized date and time

    // Create a new element for date and time
    const dateTime = document.createElement("p");
    dateTime.textContent = formattedDateTime;
    transaction.appendChild(dateTime);

    const amount = document.createElement("p");
    amount.textContent = `+ ${statement.amount}`;
    amount.style.color = "#5d945c";
    transaction.appendChild(amount);

    return transaction;
}

function createExpenseStatement(statement) {
    const transaction = document.createElement("div");
    transaction.classList.add("transaction-2");

    const description = document.createElement("p");
    description.textContent = statement.description;
    transaction.appendChild(description);

    const now = new Date();
    const formattedDateTime = now.toLocaleString();  // Localized date and time

    // Create a new element for date and time
    const dateTime = document.createElement("p");
    dateTime.textContent = formattedDateTime;
    transaction.appendChild(dateTime);

    const amount = document.createElement("p");
    amount.textContent = `- ${statement.amount}`;
    amount.style.color = "red";
    transaction.appendChild(amount);

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
};

function updateLocalStorage(data) {
    localStorage.setItem('statement', JSON.stringify(data));
    updateTotal();
    updateTotalBudget();
}

function updateLocalStorage(data) {
    console.log(data)
    localStorage.setItem('statement', JSON.stringify(data));
}

submit.addEventListener("click", handleClick);