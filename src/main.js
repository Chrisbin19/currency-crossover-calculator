document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const display = document.querySelector('#display');
    const buttons = document.querySelector('.calculator-grid');
    const modeToggle = document.querySelector('#mode-toggle');
    const currencySelectors = document.querySelector('.currency-selectors');
    const fromCurrencySelect = document.querySelector('#from-currency');
    const toCurrencySelect = document.querySelector('#to-currency');
    const chartContainer = document.querySelector('.chart-container');
    const chartCanvas = document.getElementById('historyChart');
    const suggestionBox = document.querySelector('.suggestion-box');

    // --- State Variables ---
    const apiKey = '56e27194b721e951d2d615b0'; // <-- PASTE YOUR ExchangeRate-API KEY
    const alphaVantageApiKey = '4S99D6GXOWTPAJ5V'; // <-- NEW: PASTE YOUR Alpha Vantage KEY HERE
    let currentOperand = '';
    let previousOperand = '';
    let operation = undefined;
    let isCurrencyMode = false;
    let rates = {};
    let calculationCompleted = false;
    let historyChartInstance;

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

    const displayHistoryChart = async (from, to) => {
        chartContainer.style.display = 'block';
        const endDate = new Date().toISOString().split('T')[0];
        const startDate = new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0];

        try {
            const response = await fetch(`https://api.frankfurter.app/${startDate}..${endDate}?from=${from}&to=${to}`);
            const data = await response.json();
            
            const labels = Object.keys(data.rates).sort();
            const chartData = labels.map(label => data.rates[label][to]);

            if (historyChartInstance) { historyChartInstance.destroy(); }
            
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
                        tension: 0.4,
                        pointRadius: 0,
                    }]
                },
                options: {
                    responsive: true,
                    plugins: { legend: { labels: { color: '#FFF' } } },
                    scales: {
                        y: { ticks: { color: '#FFF' }, grid: { color: 'rgba(255, 255, 255, 0.2)' } },
                        x: { ticks: { color: '#FFF' }, grid: { color: 'rgba(255, 255, 255, 0.2)' } }
                    }
                }
            });
        } catch (error) {
            console.error("Chart data fetch error:", error);
        }
    };

    const showInvestmentSuggestions = async (amountInINR) => {
        suggestionBox.innerText = 'Finding investment ideas...';
        
        try {
            // --- FINAL FIX: Using the stable Alpha Vantage API ---
            const stockSymbols = ["RELIANCE.BSE", "TCS.BSE", "HDFCBANK.BSE", "INFY.BSE", "TATAMOTORS.BSE", "SBIN.BSE"];
            
            // Create an array of fetch promises, one for each stock
            const promises = stockSymbols.map(symbol =>
                fetch(`https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${alphaVantageApiKey}`)
                    .then(res => res.json())
            );

            // Wait for all API calls to complete
            const results = await Promise.all(promises);

            const stockData = results
                .map(result => {
                    const quote = result['Global Quote'];
                    // Check if the response is valid and contains the price
                    if (quote && quote['05. price']) {
                        return {
                            symbol: quote['01. symbol'].replace(".BSE", ""),
                            price: parseFloat(quote['05. price'])
                        };
                    }
                    return null; // Return null for failed or rate-limited requests
                })
                .filter(Boolean); // Filter out any null results

            if (stockData.length === 0) {
                suggestionBox.innerText = 'Could not fetch investment ideas right now. (API limit may be reached)';
                return;
            }

            const affordableStocks = stockData.filter(stock => stock.price < amountInINR);

            if (affordableStocks.length > 0) {
                const suggestions = affordableStocks
                    .slice(0, 3)
                    .map(stock => `${stock.symbol} (₹${stock.price.toFixed(2)})`)
                    .join(', ');
                suggestionBox.innerText = `With ₹${amountInINR.toFixed(2)}, you could invest in: ${suggestions}.`;
            } else {
                suggestionBox.innerText = 'This amount could be a great start for a mutual fund!';
            }

        } catch (error) {
            console.error("Investment data fetch error:", error);
            suggestionBox.innerText = 'Could not fetch investment ideas.';
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

            displayHistoryChart(from, to);

            if (to === 'INR') {
                showInvestmentSuggestions(result);
            } else {
                suggestionBox.innerText = '';
            }

        } else {
            // ... (Classic mode logic remains unchanged)
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
            // --- FIX: Mark that a classic calculation has completed ---
            calculationCompleted = true;
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
        suggestionBox.innerText = '';
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

        // This was too aggressive and has been removed. The logic is now handled below.
        // if (calculationCompleted) {
        //     clear();
        // }

        if (action === 'number') {
            // --- FIX: If a calculation was just completed, start a new number ---
            if (calculationCompleted) {
                currentOperand = '';
                calculationCompleted = false;
            }
            if (currentOperand === '0') currentOperand = '';
            currentOperand += buttonContent;
        }
        if (action === 'decimal') {
             // --- FIX: If a calculation was just completed, start a new number ---
            if (calculationCompleted) {
                currentOperand = '0';
                calculationCompleted = false;
            }
            if (currentOperand.includes('.')) return;
            currentOperand += '.';
        }
        if (action === 'operator') { 
            // --- FIX: Allow chained operations after a calculation ---
            calculationCompleted = false;
            chooseOperation(buttonContent); 
        }
        if (action === 'clear') { clear(); }
        if (action === 'delete') {
            currentOperand = currentOperand.slice(0, -1);
        }
        if (action === 'equals') {
            // Prevent running calculate again if already completed
            if (!calculationCompleted) {
                 calculate();
            }
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


