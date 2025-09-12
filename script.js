document.addEventListener('DOMContentLoaded', () => {
    // --- UI Elements ---
    const display = document.querySelector('#display');
    const buttons = document.querySelector('.calculator-grid');
    const modeToggle = document.querySelector('#mode-toggle');
    const currencySelectors = document.querySelector('.currency-selectors');
    const fromCurrencySelect = document.querySelector('#from-currency');
    const toCurrencySelect = document.querySelector('#to-currency');
    
    // --- State Variables ---
    let currentOperand = '';
    let previousOperand = '';
    let operation = undefined;
    let isCurrencyMode = false;
    let rates = {};
    let calculationCompleted = false; // Add this new state variable
    
    // --- IMPORTANT: PASTE YOUR API KEY HERE ---
    const apiKey = '56e27194b721e951d2d615b0';

    // --- API Function: Fetches currency rates ---
    const getRates = async () => {
        // Show a loading message to the user while fetching
        fromCurrencySelect.innerHTML = `<option>Loading...</option>`;
        toCurrencySelect.innerHTML = `<option>Loading...</option>`;
        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
            if (!response.ok) throw new Error('Network response was not ok');
            const data = await response.json();

            if (data.result === 'success') {
                rates = data.conversion_rates;
                populateCurrencies();
            } else {
                console.error('API Error:', data['error-type']);
                display.innerText = "API Error";
            }
        } catch (error) {
            console.error('Fetch Error:', error);
            display.innerText = "Network Error";
        }
    };
    
    // --- UI Function: Populates dropdowns with fetched currencies ---
    const populateCurrencies = () => {
        fromCurrencySelect.innerHTML = ''; // Clear loading message
        toCurrencySelect.innerHTML = '';
        const currencies = Object.keys(rates);
        currencies.forEach(currency => {
            const optionFrom = document.createElement('option');
            optionFrom.value = currency;
            optionFrom.textContent = currency;
            fromCurrencySelect.appendChild(optionFrom);

            const optionTo = document.createElement('option');
            optionTo.value = currency;
            optionTo.textContent = currency;
            toCurrencySelect.appendChild(optionTo);
        });
        // Set default values relevant to your location (Aluva, India)
        fromCurrencySelect.value = "USD";
        toCurrencySelect.value = "INR";
    };

    // --- Core Calculator Functions ---
    const calculate = () => {
        let result;
        if (isCurrencyMode) {
            const amount = parseFloat(currentOperand);
            if (isNaN(amount) || !rates[fromCurrencySelect.value]) return;
            
            const fromRate = rates[fromCurrencySelect.value];
            const toRate = rates[toCurrencySelect.value];
            
            // Convert amount via our base currency (USD) for accuracy
            result = (amount / fromRate) * toRate;
            currentOperand = result.toFixed(2);
            calculationCompleted = true; // Mark that a calculation has just finished
        } else {
            const prev = parseFloat(previousOperand);
            const current = parseFloat(currentOperand);
            if (isNaN(prev) || isNaN(current)) return;
            switch (operation) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '*': result = prev * current; break;
                case '/': result = prev / current; break;
                case '%': result = prev % current; break;
                default: return;
            }
            currentOperand = result.toString();
        }
        operation = undefined;
        previousOperand = '';
    };
    
    const clear = () => {
        currentOperand = '';
        previousOperand = '';
        operation = undefined;
        calculationCompleted = false; // Reset the flag
    };

    const updateDisplay = () => {
        if (isCurrencyMode) {
            // If a calculation was just completed, show the 'TO' currency.
            if (calculationCompleted) {
                display.innerText = `${currentOperand || '0'} ${toCurrencySelect.value}`;
            } else {
            // Otherwise, show the 'FROM' currency as the user is typing.
                display.innerText = `${currentOperand || '0'} ${fromCurrencySelect.value}`;
            }
        } else {
            display.innerText = currentOperand || '0';
        }
    };
    
    const chooseOperation = (op) => {
        if (isCurrencyMode) return; // Disable operators in currency mode
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            calculate();
        }
        operation = op;
        previousOperand = currentOperand;
        currentOperand = '';
    };

    // --- Event Listeners ---
    buttons.addEventListener('click', (event) => {
        if (!event.target.matches('button')) return;

        const button = event.target;
        const action = button.dataset.action;
        const buttonContent = button.innerText;

        if (action === 'number') {
            // If the user starts typing a number after a result, start a new calculation.
            if (calculationCompleted) {
                currentOperand = '';
                calculationCompleted = false;
            }
            if (currentOperand === '0') currentOperand = '';
            currentOperand += buttonContent;
        } else if (action === 'decimal') {
            // Also reset if user starts with a decimal after a result
            if (calculationCompleted) {
                currentOperand = '';
                calculationCompleted = false;
            }
            if (currentOperand.includes('.')) return;
            currentOperand = currentOperand === '' ? '0.' : currentOperand + '.';
        } else if (action === 'operator') {
            chooseOperation(buttonContent);
        } else if (action === 'clear') {
            clear();
        } else if (action === 'delete') {
            currentOperand = currentOperand.toString().slice(0, -1);
            calculationCompleted = false; // Deleting means we are editing, not showing a result.
        } else if (action === 'equals') {
            calculate();
        }
        
        updateDisplay();
    });

    modeToggle.addEventListener('change', (event) => {
        isCurrencyMode = event.target.checked;
        currencySelectors.style.display = isCurrencyMode ? 'flex' : 'none';
        clear();
        updateDisplay();
    });

    // --- Initial Load ---
    getRates(); // Fetch rates as soon as the page loads
    updateDisplay();
});


