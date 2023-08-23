const billForm = document.getElementById('billForm');
const addButton = document.getElementById('addButton');
const itemForm = document.getElementById('itemForm');
const addItemButton = document.getElementById('addItemButton');
const billDetails = document.getElementById('billDetails');
const peopleCheckboxes = document.getElementById('peopleCheckboxes');
const taxForm = document.getElementById('taxForm');
const taxRateInput = document.getElementById('taxRateInput');
const setTaxButton = document.getElementById('setTaxButton');

let taxRate = 0.05; // Default 5% tax rate
let grandTotal;
let taxAmount;

let everyone = {};
let sharedItems = {};
let totalWithoutTax = 0;

setTaxButton.addEventListener('click', () => {
    const selectedTaxRate = parseFloat(taxRateInput.value);
    if (!isNaN(selectedTaxRate)) {
        taxRate = selectedTaxRate;
        //taxRateInput.disabled = true;
        //setTaxButton.disabled = true;
        updatePeopleCheckboxes();
        updateBillDetails();
    }
});

addButton.addEventListener('click', () => {
    const nameInput = document.getElementById('name');
    // const amountInput = document.getElementById('amount');
    const amountInput = "0";

    const name = nameInput.value;
    // const amount = parseFloat(amountInput.value);
    const amount = parseFloat(amountInput);

    if (name && !isNaN(amount)) {
        everyone[name] = amount;
        totalWithoutTax += amount;

        nameInput.value = '';
        amountInput.value = '';

        updatePeopleCheckboxes();
        updateBillDetails();
    }
});

addItemButton.addEventListener('click', () => {
    const itemNameInput = document.getElementById('itemName');
    const itemPriceInput = document.getElementById('itemPrice');
    const checkboxes = document.querySelectorAll('input[name="people"]:checked');

    const itemName = itemNameInput.value;
    const itemPrice = parseFloat(itemPriceInput.value);

    if (itemName && !isNaN(itemPrice) && itemPrice > 0 && checkboxes.length > 0) {
        const sharedItemCount = checkboxes.length;
        const itemShare = itemPrice / sharedItemCount;

        checkboxes.forEach(checkbox => {
            const person = checkbox.value;
            if (!sharedItems[person]) {
                sharedItems[person] = [];
            }
            sharedItems[person].push({ itemName, itemShare });
            everyone[person] += itemShare;
            totalWithoutTax += itemShare;
        });

        itemNameInput.value = '';
        itemPriceInput.value = '';
        checkboxes.forEach(checkbox => checkbox.checked = false);

        updateBillDetails();
    }
});

function updatePeopleCheckboxes() {
    // Clear existing checkboxes
    peopleCheckboxes.innerHTML = '';

    // Populate people checkboxes
    for (const person in everyone) {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.name = 'people';
        checkbox.value = person;
        checkbox.id = `checkbox_${person}`;

        const label = document.createElement('label');
        label.textContent = person;
        label.setAttribute('for', `checkbox_${person}`);

        peopleCheckboxes.appendChild(checkbox);
        peopleCheckboxes.appendChild(label);
        peopleCheckboxes.appendChild(document.createElement('br'));
    }
}

function updateBillDetails() {
    grandTotal = totalWithoutTax * (1 + taxRate);
    taxAmount = grandTotal - totalWithoutTax;

    let output = `<h2>Bill Split:</h2>`;
    for (const person in everyone) {
        const taxContribution = (everyone[person] / totalWithoutTax) * taxAmount;
        const totalAmount = everyone[person] + taxContribution;

        output += `<p>${person} owes PKR ${totalAmount.toFixed(2)} (including tax)</p>`;

        if (sharedItems[person]) {
            output += `<p>Items:</p>`;
            sharedItems[person].forEach(item => {
                const itemTotalWithTax = item.itemShare * (1 + taxRate);
                output += `<p>- ${item.itemName}: PKR ${itemTotalWithTax.toFixed(2)}</p>`;
            });
        }

        output += '<hr>';
    }

    output += `<p>Total before tax: PKR ${totalWithoutTax.toFixed(2)}</p>`;
    output += `<p>Total tax: PKR ${taxAmount.toFixed(2)}</p>`;
    output += `<p><strong>Grand Total: PKR ${grandTotal.toFixed(2)}</strong></p>`;

    // Add Copy button
    output += `<button id="copyButton" class="btn btn-primary">Copy Bill Split</button>`;

    billDetails.innerHTML = output;

    // Attach click event to the Copy button
    const copyButton = document.getElementById('copyButton');
    copyButton.addEventListener('click', copyBillSplit);
}

function copyBillSplit() {
    let textToCopy = '';

    for (const person in everyone) {
        const taxContribution = (everyone[person] / totalWithoutTax) * taxAmount;
        const totalAmount = everyone[person] + taxContribution;

        textToCopy += `${person} owes PKR ${totalAmount.toFixed(2)} (including tax)\n`;

        if (sharedItems[person]) {
            textToCopy += `Items:\n`;
            sharedItems[person].forEach(item => {
                const itemTotalWithTax = item.itemShare * (1 + taxRate);
                textToCopy += `- ${item.itemName}: PKR ${itemTotalWithTax.toFixed(2)}\n`;
            });
        }

        textToCopy += '\n';
    }

    textToCopy += `Total before tax: PKR ${totalWithoutTax.toFixed(2)}\n`;
    textToCopy += `Total tax: PKR ${taxAmount.toFixed(2)}\n`;
    textToCopy += `Grand Total: PKR ${grandTotal.toFixed(2)}`;

    const tempTextArea = document.createElement('textarea');
    tempTextArea.value = textToCopy;
    document.body.appendChild(tempTextArea);
    tempTextArea.select();
    document.execCommand('copy');
    document.body.removeChild(tempTextArea);

    alert('Bill split copied to clipboard!');
}


// Initial population of people checkboxes
updatePeopleCheckboxes();