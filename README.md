# E-Commerce Data Analytics Dashboard

An interactive Business Intelligence (BI) dashboard designed to transform raw e-commerce transaction data into actionable strategic insights. This project showcases applied data analysis principles, customer segmentation methodologies, and exploratory data analysis (EDA) techniques.

## Core Data Analytics Methodologies

### 1. Exploratory Data Analysis (EDA) & Business Health
- **Time-Series Analysis:** Aggregates monthly order volumes to identify seasonality, peak sales periods, and off-peak trends for inventory and marketing strategy optimization.
- **Conversion & Friction Tracking:** Tracks order status distribution (Completed vs. Failed/Cancelled) to monitor checkout health and quantify revenue leakage.

### 2. Customer Segmentation & LTV
- **Behavioral Cohort Mapping:** Segments customers into tiers based on purchasing behavior, visualizing the direct correlation between Total Orders (Frequency) and Total Spent (Monetary Value).
- **Predictive Driver Analysis:** Evaluates and ranks behavioral metrics (e.g., Total Orders, Avg Order Value, Coupon Rate) by their feature importance in predicting high-value VIP customers.

### 3. Promotional ROI & Strategy Evaluation
- **A/B Impact Proxy:** Compares average customer spending between orders with and without applied coupons to empirically assess promotional ROI.
- **Discount Optimization Formulation:** Correlates exact Discount Ratios against Net Revenue using scatter plots to locate the optimal discount margins that maximize sales volume without cannibalizing total profit.
- **Payment Method Reliability:** Calculates and sorts historical payment failure rates across various transaction methods to identify systematic friction points in the checkout pipeline.

## Technical Implementation
While the core purpose of this project is data analysis and KPI extraction, the data is delivered through a modern, responsive frontend architecture:
- **Data Processing Engine**: PapaParse (in-browser CSV parsing) and Lodash (complex data aggregations, grouping, and statistical derivations)
- **Data Visualization**: Recharts (with highly bespoke tooltips, custom axes, and targeted scroll-reveal animations for data points)
- **Frontend Stack**: React, TypeScript, Vite
- **UI Design**: Tailwind CSS (custom Glassmorphic Dark UI)

## How to Run Locally
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the dev server: `npm run dev`
4. Upload an e-commerce `.csv` transaction dataset directly in the browser to view the dynamic reporting.
