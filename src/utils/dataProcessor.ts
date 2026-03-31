import Papa from 'papaparse';
import { groupBy, sumBy } from 'lodash';

// Define the shape of our raw CSV row
export interface RawTransaction {
  id: string;
  user_id: string;
  coupon_id: string;
  status: string;
  payment_method_id: string;
  payment_date: string;
  shipping_partner_id: string;
  shipping_address_id: string;
  billing_address_id: string;
  subsidy_id: string;
  discount: string;
  shipping_cost: string;
  tax: string;
  gross_amount: string;
  net_amount: string;
  payroll_deduct_preference: string;
  created_at: string;
  updated_at: string;
  email: string;
  redeem_points: string;
  ecom_point_rule_id: string;
  payment_status: string;
  client_tax: string;
  tax_rate: string;
}

export interface ProcessedTransaction {
  id: number;
  userId: number;
  grossAmount: number;
  netAmount: number;
  discount: number;
  shippingCost: number;
  status: string;
  paymentMethodId: number;
  paymentStatus: string;
  createdAt: Date;
  orderMonth: string; // 'YYYY-MM'
  couponUsed: boolean;
  isFailedPayment: boolean;
  discountRatio: number;
  shippingRatio: number;
}

export interface Customer {
  userId: number;
  totalOrders: number;
  totalSpent: number;
  failedPayments: number;
  completedOrders: number;
  avgOrderValue: number;
  avgDiscountRatio: number;
  couponUsageCount: number;
  spendingSegment: 'Low' | 'Medium' | 'High';
  isHighValue: boolean; // Top 25% of spenders
}

export interface DashboardData {
  transactions: ProcessedTransaction[];
  customers: Customer[];
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    avgOrderValue: number;
  };
}

export const processCSVData = (file: File): Promise<DashboardData> => {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rawData = results.data as RawTransaction[];
          resolve(analyzeData(rawData));
        } catch (err) {
          reject(err);
        }
      },
      error: (err) => {
        reject(err);
      }
    });
  });
};

const analyzeData = (raw: RawTransaction[]): DashboardData => {
  // Step 1: Clean and Parse Transaction-Level Features
  const transactions: ProcessedTransaction[] = raw.map(row => {
    const grossAmount = parseFloat(row.gross_amount || '0');
    const netAmount = parseFloat(row.net_amount || '0');
    const discount = parseFloat(row.discount || '0');
    const shippingCost = parseFloat(row.shipping_cost || '0');
    
    // Date parsing
    const dateStr = row.created_at; 
    let orderMonth = 'Unknown';
    let createdAt = new Date();
    if (dateStr) {
      // Assuming dd/mm/yyyy hh:mm format based on documentation snippet
      const parts = dateStr.split('/');
      if (parts.length >= 3) {
        const yearObj = parts[2].split(' ');
        orderMonth = `${yearObj[0]}-${parts[1].padStart(2, '0')}`;
        // Best effort create date
        createdAt = new Date(parseInt(yearObj[0]), parseInt(parts[1]) - 1, parseInt(parts[0]));
      }
    }

    return {
      id: parseInt(row.id),
      userId: parseInt(row.user_id),
      grossAmount,
      netAmount,
      discount,
      shippingCost,
      status: row.status?.toLowerCase() || 'unknown',
      paymentMethodId: parseInt(row.payment_method_id || '0'),
      paymentStatus: row.payment_status?.toLowerCase() || 'unknown',
      createdAt,
      orderMonth,
      couponUsed: !!row.coupon_id && row.coupon_id.trim() !== '' && row.coupon_id !== 'NaN',
      isFailedPayment: row.status?.toLowerCase() === 'failed' || row.payment_status?.toLowerCase() === 'failed',
      discountRatio: grossAmount > 0 ? discount / grossAmount : 0,
      shippingRatio: grossAmount > 0 ? shippingCost / grossAmount : 0,
    };
  });

  // Step 2: Customer-Level Aggregation
  const groupedByUser = groupBy(transactions, 'userId');
  const customers: Customer[] = Object.keys(groupedByUser).map(userIdStr => {
    const userTx = groupedByUser[userIdStr];
    const totalOrders = userTx.length;
    const completedOrders = userTx.filter(t => t.status === 'completed').length;
    const failedPayments = userTx.filter(t => t.isFailedPayment).length;
    const totalSpent = sumBy(userTx, t => t.status === 'completed' ? t.netAmount : 0);
    const avgOrderValue = completedOrders > 0 ? totalSpent / completedOrders : 0;
    const avgDiscountRatio = totalOrders > 0 ? sumBy(userTx, 'discountRatio') / totalOrders : 0;
    const couponUsageCount = userTx.filter(t => t.couponUsed).length;

    return {
      userId: parseInt(userIdStr),
      totalOrders,
      totalSpent,
      failedPayments,
      completedOrders,
      avgOrderValue,
      avgDiscountRatio,
      couponUsageCount,
      spendingSegment: 'Low', // Will assign below
      isHighValue: false // Will assign below
    };
  });

  // Step 3: Spending Segmentation & High-Value Prediction Logic
  // Sort customers by spent to find quartiles/terciles
  const sortedBySpent = [...customers].sort((a, b) => a.totalSpent - b.totalSpent);
  
  // Terciles for Spending Segments
  const oneThird = Math.floor(sortedBySpent.length / 3);
  const twoThirds = oneThird * 2;
  
  // Quartiles for High Value (Top 25%)
  const top25Index = Math.floor(sortedBySpent.length * 0.75);

  sortedBySpent.forEach((c, index) => {
    // Assign Spending Segment
    if (index < oneThird) c.spendingSegment = 'Low';
    else if (index < twoThirds) c.spendingSegment = 'Medium';
    else c.spendingSegment = 'High';

    // Assign High Value
    if (index >= top25Index) {
      c.isHighValue = true;
    }
  });

  // Basic overall metrics
  const totalRevenue = sumBy(customers, 'totalSpent');
  const metrics = {
    totalRevenue,
    totalOrders: transactions.length,
    totalCustomers: customers.length,
    avgOrderValue: customers.length > 0 ? totalRevenue / sumBy(customers, 'completedOrders') : 0
  };

  return { transactions, customers, metrics };
};
