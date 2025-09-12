# 💰 Currency Crossover Calculator
### A modern, API-driven financial tool that reinvents the classic calculator by providing real-world context to numbers.
This project is a submission for the Vibe Coding Hackathon, designed to remix a classical app with new features and powerful API integrations.

**✨ Live Demo:** [**https://Chrisbin19.github.io/currency-crossover-calculator/**](https://Chrisbin19.github.io/currency-crossover-calculator/)

## 💡 Project Motivation
A standard calculator tells you what a number is, but it never tells you what that number means. The goal of this project was to solve that problem by creating a tool that provides immediate financial context. By integrating three distinct APIs for live exchange rates, historical data, and real-time stock prices, this app transforms a simple calculation into a moment of genuine financial insight. It's designed for anyone who interacts with the global economy, from students and freelancers to aspiring investors.

## 🚀 Features
This project is packed with features that provide a rich user experience:

**Dual-Mode Functionality:** A sleek toggle allows users to seamlessly switch between a Classic Calculator for standard mathematical operations and an advanced Currency Mode for financial tasks.

**Live Currency Conversion:** Fetches real-time exchange rates from the ExchangeRate-API, providing accurate conversions between over 150 world currencies.

**Historical Data Visualization:** After every conversion, a beautiful 30-day historical line chart is rendered using Chart.js and data from the Frankfurter API. This allows users to instantly spot trends and understand currency volatility.

**Real-Time Investment Suggestions:** This is the core "remix" feature. After converting to INR, the app makes a live call to the Alpha Vantage API to fetch real-time prices of major Indian stocks, providing users with actionable investment ideas based on the converted amount.

**Sleek Glassmorphism UI:** The entire application is wrapped in a modern, beautiful, and fully responsive "glassmorphism" interface that looks professional on any device.

## 🛠️ Tech Stack & APIs

This project was built using modern web technologies and a combination of powerful financial APIs.

| Category      | Technology / Service                                                              | Purpose                                          |
| :------------ | :-------------------------------------------------------------------------------- | :----------------------------------------------- |
| **Frontend** | HTML5, CSS3 (Flexbox, Grid), JavaScript (ES6+)                                    | Core structure, styling, and application logic.  |
| **Library** | [Chart.js](https://www.chartjs.org/)                                              | For rendering the historical data chart.         |
| **API #1** | [ExchangeRate-API](https://www.exchangerate-api.com/)                             | Fetches live currency exchange rates.            |
| **API #2** | [Alpha Vantage API](https://www.alphavantage.co/)                                 | Provides real-time stock price data.             |
| **API #3** | [Frankfurter API](https://www.frankfurter.app/)                                   | Provides historical currency rate data.          |
| **Deployment**| [GitHub Pages](https://pages.github.com/)                                         | For hosting the live version of the application. |

## 🔧 How to Run Locally
Clone the repository and navigate into the project directory:

```bash
git clone [https://github.com/Chrisbin1s/currency-crossover-calculator.git](https://github.com/Chrisbin1s/currency-crossover-calculator.git)
cd currency-crossover-calculator
```

Open the **index.html** file in your favorite web browser.

**Important: To enable the currency and investment features, you must get your own free API keys and replace the placeholders in the script.js file:**

Create a free key at ExchangeRate-API.com.

Create a free key at AlphaVantage.co.

## 🔮 Future Scope

This project has a solid foundation that can be extended with even more features:

**Conversion History:** Using localStorage to save and display a user's recent conversions.

**Cryptocurrency Data:** Integrating another API to include real-time crypto prices.
