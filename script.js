localstorage.clear();
// Initialize or retrieve transactions from localStorage
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let medicinesInventory = JSON.parse(localStorage.getItem('medicinesInventory')) || {};

function saveDataToLocalStorage() {
    localStorage.setItem('transactions', JSON.stringify(transactions));
    localStorage.setItem('medicinesInventory', JSON.stringify(medicinesInventory));
}

function formatDate(date) {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
}

function displayTransactions(transactionsToShow = transactions) {
    const tableBody = document.getElementById('transactionTableBody');
    tableBody.innerHTML = '';

    transactionsToShow.forEach(transaction => {
        const profit = (transaction.sellingPrice - transaction.buyingPrice) * transaction.quantity;
        const totalAmount = transaction.quantity * transaction.sellingPrice;
        const amountPaid = transaction.amountPaid || 0;
        const amountPending = totalAmount - amountPaid;

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${transaction.date}</td>
            <td>${transaction.customerName}</td>
            <td>${transaction.customerMobile}</td>
            <td>${transaction.medicine}</td>
            <td>${transaction.quantity}</td>
            <td>${transaction.buyingPrice}</td>
            <td>${transaction.sellingPrice}</td>
            <td>${profit}</td>
            <td>${amountPaid}</td>
            <td class="amount-pending" id="amountPending_${transaction.id}">${amountPending}</td>
            <td>${totalAmount}</td>
            <td class="actions">
                <button onclick="editAmountPending(${transaction.id})">Edit Amount Pending</button>
                <button onclick="deleteTransaction(${transaction.id})">Delete</button>
            </td>
        `;

        // Apply red color if amountPending is greater than 0, otherwise black
        const amountPendingElement = row.querySelector(`#amountPending_${transaction.id}`);
        if (amountPending > 0) {
            amountPendingElement.style.color = 'red';
        } else {
            amountPendingElement.style.color = 'black';
        }

        tableBody.appendChild(row);
    });
}

function addTransaction() {
    const date = formatDate(new Date());
    const customerName = prompt('Enter Customer Name:');
    const customerMobile = prompt('Enter Customer Mobile:');
    const medicine = prompt('Enter Medicine:');
    const quantity = parseInt(prompt('Enter Quantity:'));
    const buyingPrice = parseFloat(prompt('Enter Buying Price:'));
    const sellingPrice = parseFloat(prompt('Enter Selling Price:'));
    const amountPaid = parseFloat(prompt('Enter Amount Paid:'));

    if (customerName && customerMobile && medicine && quantity && buyingPrice && sellingPrice && amountPaid >= 0) {
        const transaction = {
            id: transactions.length + 1,
            date,
            customerName,
            customerMobile,
            medicine,
            quantity,
            buyingPrice,
            sellingPrice,
            amountPaid
        };

        transactions.push(transaction);
        updateMedicineInventory(medicine, -quantity); // Update inventory with negative quantity (selling)
        saveDataToLocalStorage(); // Save data to localStorage
        displayTransactions();
    } else {
        alert('Please fill in all fields and ensure Amount Paid is non-negative.');
    }
}

function editTransaction(id) {
    alert(`Edit transaction with ID ${id}`);
    // Implement editing logic here as per your requirement
}

function editAmountPending(id) {
    const amountPendingElement = document.getElementById(`amountPending_${id}`);
    let newAmountPending = parseFloat(prompt('Enter new Amount Pending:'));
    
    if (!isNaN(newAmountPending) && newAmountPending >= 0) {
        newAmountPending = parseFloat(newAmountPending.toFixed(2)); // Optional: Round to two decimal places
        amountPendingElement.textContent = newAmountPending;
        
        // Update transactions array or backend data with newAmountPending
        const transactionToUpdate = transactions.find(transaction => transaction.id === id);
        if (transactionToUpdate) {
            const totalAmount = transactionToUpdate.quantity * transactionToUpdate.sellingPrice;
            transactionToUpdate.amountPaid = totalAmount - newAmountPending;
            saveDataToLocalStorage(); // Save data to localStorage
            displayTransactions(); // Refresh display
        }
    } else {
        alert('Please enter a valid non-negative number for Amount Pending.');
    }
}

function deleteTransaction(id) {
    const transactionToDelete = transactions.find(transaction => transaction.id === id);
    if (transactionToDelete) {
        updateMedicineInventory(transactionToDelete.medicine, transactionToDelete.quantity); // Add back to inventory on delete
        transactions = transactions.filter(transaction => transaction.id !== id);
        saveDataToLocalStorage(); // Save data to localStorage
        displayTransactions();
    }
}

function searchCustomer() {
    const searchTerm = document.getElementById('searchInput').value.trim().toLowerCase();
    const filteredTransactions = transactions.filter(transaction => transaction.customerName.toLowerCase().includes(searchTerm));
    displayTransactions(filteredTransactions);
}

function updateMedicineInventory(medicine, quantity) {
    if (medicinesInventory[medicine]) {
        medicinesInventory[medicine] += quantity;
    } else {
        medicinesInventory[medicine] = quantity;
    }
}

function displayInventory() {
    let inventoryList = "Current Inventory:\n";
    for (const medicine in medicinesInventory) {
        inventoryList += `${medicine}: ${medicinesInventory[medicine]}\n`;
    }
    alert(inventoryList);
}

function addMedicine() {
    const medicineName = document.getElementById('medicineName').value.trim();
    const medicineQuantity = parseInt(document.getElementById('medicineQuantity').value.trim());

    if (medicineName && medicineQuantity > 0) {
        updateMedicineInventory(medicineName, medicineQuantity); // Update inventory
        saveDataToLocalStorage(); // Save data to localStorage
        alert(`Added ${medicineQuantity} ${medicineName}(s) to inventory.`);
    } else {
        alert('Please enter valid medicine name and quantity (greater than 0).');
    }
}

document.getElementById('addTransactionBtn').addEventListener('click', addTransaction);
document.getElementById('inventoryBtn').addEventListener('click', displayInventory);
document.getElementById('addMedicineBtn').addEventListener('click', addMedicine);
document.getElementById('searchInput').addEventListener('keyup', searchCustomer);

// Initially, transactions array is empty, no need for initial dummy data

// Display initial transactions
displayTransactions();

