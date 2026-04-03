# E-Commerce Data Analytics Dashboard

<img width="1889" height="932" alt="Screenshot 2026-04-02 211800" src="https://github.com/user-attachments/assets/9d4ce022-b8aa-4e7e-abba-3fcf58019eb8" />
<img width="1888" height="945" alt="Screenshot 2026-04-02 211820" src="https://github.com/user-attachments/assets/5986c166-3152-4e0a-ab9b-7bd2f6b70869" />
<img width="1904" height="942" alt="Screenshot 2026-04-02 211832" src="https://github.com/user-attachments/assets/61916426-ec8f-4980-b3c5-a6706e4c79b9" />
<img width="1889" height="947" alt="Screenshot 2026-04-02 211849" src="https://github.com/user-attachments/assets/f9adc7b0-0daf-419d-b64a-99ae222d65f4" />
<img width="1873" height="948" alt="Screenshot 2026-04-02 211905" src="https://github.com/user-attachments/assets/2b26b6b0-e960-4ade-8574-36bc657be37f" />
<img width="1862" height="938" alt="Screenshot 2026-04-02 211920" src="https://github.com/user-attachments/assets/aa311e80-282c-4b6c-9ea3-9af43e608843" />
<img width="1867" height="944" alt="Screenshot 2026-04-02 211931" src="https://github.com/user-attachments/assets/f7bf8770-3a55-4003-a978-5bead7aba426" />

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

