document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const display = document.querySelector('#display');
    const buttons = document.querySelector('.calculator-grid');
    const modeToggle = document.querySelector('#mode-toggle');
    const currencySelectors = document.querySelector('.currency-selectors');
    const fromCurrencySelect = document.querySelector('#from-currency');
    const toCurrencySelect = document.querySelector('#to-currency');
    const chartContainer = document.querySelector('.chart-container'); // NEW: Chart container
    const chartCanvas = document.getElementById('historyChart'); // NEW: Chart canvas

    // --- State Variables ---
    const apiKey = '56e27194b721e951d2d615b0'; // <-- IMPORTANT: PASTE YOUR ExchangeRate-API KEY HERE
    let currentOperand = '';
    let previousOperand = '';
    let operation = undefined;
    let isCurrencyMode = false;
    let rates = {};
    let calculationCompleted = false;
    let historyChartInstance; // NEW: To hold the chart instance

    // --- API & Data Functions ---
    const getRates = async () => {
        try {
            const response = await fetch(`https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`);
            const data = await response.json();
            if (data.result === 'success') {
                rates = data.conversion_rates;
                populateCurrencies();
            } else {
                display.innerText = 'API Error';
            }
        } catch (error) {
            display.innerText = 'Network Error';
        }
    };

    const populateCurrencies = () => {
        fromCurrencySelect.innerHTML = '<option value="">Loading...</option>';
        toCurrencySelect.innerHTML = '<option value="">Loading...</option>';
        const currencies = Object.keys(rates);
        fromCurrencySelect.innerHTML = '';
        toCurrencySelect.innerHTML = '';

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
        fromCurrencySelect.value = "USD";
        toCurrencySelect.value = "INR";
    };

    // --- NEW: Function to fetch historical data and display chart ---
    const displayHistoryChart = async (from, to) => {
        chartContainer.style.display = 'block'; // Show the container

        // 1. Prepare dates for the API call (last 30 days)
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

        // 2. Fetch data from Frankfurter API (no key needed)
        try {
            const response = await fetch(`https://api.frankfurter.app/${startDate}..${endDate}?from=${from}&to=${to}`);
            const data = await response.json();
            
            const labels = Object.keys(data.rates).sort();
            const chartData = labels.map(label => data.rates[label][to]);

            // 3. Destroy old chart if it exists to prevent overlap
            if (historyChartInstance) {
                historyChartInstance.destroy();
            }
            
            // 4. Create new chart with Chart.js
            historyChartInstance = new Chart(chartCanvas, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: `${from} to ${to} Exchange Rate`,
                        data: chartData,
                        borderColor: 'rgba(54, 162, 235, 1)',
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderWidth: 2,
                        tension: 0.4, // Makes the line smoother
                        pointRadius: 0, // Hides the dots on the line
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: '#FFF' }
                        }
                    },
                    scales: {
                        y: {
                            ticks: { color: '#FFF' },
                            grid: { color: 'rgba(255, 255, 255, 0.2)' }
                        },
                        x: {
                            ticks: { color: '#FFF' },
                            grid: { color: 'rgba(255, 255, 255, 0.2)' }
                        }
                    }
                }
            });

        } catch (error) {
            console.error("Chart data fetch error:", error);
        }
    };


    // --- Calculator Logic ---
    const calculate = () => {
        let result;
        if (isCurrencyMode) {
            const amount = parseFloat(currentOperand);
            if (isNaN(amount) || !fromCurrencySelect.value || !toCurrencySelect.value) return;

            const from = fromCurrencySelect.value;
            const to = toCurrencySelect.value;

            const fromRate = rates[from];
            const toRate = rates[to];
            
            result = (amount / fromRate) * toRate;
            currentOperand = result.toFixed(2);
            calculationCompleted = true;

            // --- MODIFIED: Trigger the chart display ---
            displayHistoryChart(from, to);

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
    
    const chooseOperation = (op) => {
        if (isCurrencyMode) return;
        if (currentOperand === '') return;
        if (previousOperand !== '') {
            calculate();
        }
        operation = op;
        previousOperand = currentOperand;
        currentOperand = '';
    };

    const clear = () => {
        currentOperand = '';
        previousOperand = '';
        operation = undefined;
        calculationCompleted = false;
        // --- MODIFIED: Hide and destroy the chart on clear ---
        chartContainer.style.display = 'none';
        if (historyChartInstance) {
            historyChartInstance.destroy();
        }
    };

    const updateDisplay = () => {
        if (isCurrencyMode) {
            const currencyCode = calculationCompleted ? toCurrencySelect.value : fromCurrencySelect.value;
            display.innerText = `${currentOperand || '0'} ${currencyCode}`;
        } else {
            display.innerText = currentOperand || '0';
        }
    };

    // --- Event Listeners ---
    buttons.addEventListener('click', (event) => {
        if (!event.target.matches('button')) return;
        const button = event.target;
        const action = button.dataset.action;
        const buttonContent = button.innerText;

        if (calculationCompleted) {
            clear();
        }

        if (action === 'number') {
            if (currentOperand === '0') currentOperand = '';
            currentOperand += buttonContent;
        }
        if (action === 'decimal') {
            if (currentOperand.includes('.')) return;
            currentOperand += '.';
        }
        if (action === 'operator') { chooseOperation(buttonContent); }
        if (action === 'clear') { clear(); }
        if (action === 'delete') {
            currentOperand = currentOperand.slice(0, -1);
        }
        if (action === 'equals') {
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
    
    fromCurrencySelect.addEventListener('change', updateDisplay);
    toCurrencySelect.addEventListener('change', () => {
        if (calculationCompleted) {
            calculate();
        }
    });

    // --- Initial Load ---
    getRates();
    updateDisplay();
});

