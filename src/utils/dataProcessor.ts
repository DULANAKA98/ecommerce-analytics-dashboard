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
  email: string;
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
    startDate: string;
    endDate: string;
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

const STATUS_MAP: Record<string, string> = {
  '1': 'pending',
  '2': 'completed',
  '3': 'processing',
  '4': 'cancelled',
  '5': 'failed',
  '6': 'refunded',
};

const PAYMENT_STATUS_MAP: Record<string, string> = {
  '1': 'unpaid',
  '2': 'paid',
  '3': 'failed',
  '4': 'refunded',
};

const parseStatus = (raw: string): string => {
  if (!raw || raw.trim() === '') return 'unknown';
  const trimmed = raw.trim();
  // If it's a numeric code, map it
  if (/^\d+$/.test(trimmed)) {
    return STATUS_MAP[trimmed] || `status_${trimmed}`;
  }
  // Already a string label — normalise to lowercase
  return trimmed.toLowerCase();
};

const parsePaymentStatus = (raw: string): string => {
  if (!raw || raw.trim() === '') return 'unknown';
  const trimmed = raw.trim();
  if (/^\d+$/.test(trimmed)) {
    return PAYMENT_STATUS_MAP[trimmed] || `pstatus_${trimmed}`;
  }
  return trimmed.toLowerCase();
};

/**
 * Parse dates in BOTH formats:
 * - ISO:        "2026-02-05 16:09:23.784"  → standard JS Date parse
 * - Legacy:     "05/02/2026 16:09"         → dd/mm/yyyy hh:mm
 */
const parseDate = (raw: string): { date: Date; month: string } => {
  const fallback = { date: new Date(), month: 'Unknown' };
  if (!raw || raw.trim() === '') return fallback;

  const str = raw.trim();

  // ISO format: yyyy-mm-dd hh:mm:ss[.xxx]
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const d = new Date(str.replace(' ', 'T'));
    if (!isNaN(d.getTime())) {
      const month = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      return { date: d, month };
    }
  }

  // Legacy dd/mm/yyyy format
  const parts = str.split('/');
  if (parts.length >= 3) {
    const yearPart = parts[2].split(' ')[0];
    const month = `${yearPart}-${parts[1].padStart(2, '0')}`;
    const d = new Date(parseInt(yearPart), parseInt(parts[1]) - 1, parseInt(parts[0]));
    if (!isNaN(d.getTime())) {
      return { date: d, month };
    }
  }

  return fallback;
};

const analyzeData = (raw: RawTransaction[]): DashboardData => {
  // Step 0: Build userId → email lookup from raw rows (before filtering)
  const emailMap: Record<string, string> = {};
  raw.forEach(row => {
    if (row.user_id && row.email && row.email.trim() !== '') {
      emailMap[row.user_id] = row.email.trim();
    }
  });

  // Step 1: Clean and Parse Transaction-Level Features
  const allTransactions: ProcessedTransaction[] = raw.map(row => {
    const grossAmount = parseFloat(row.gross_amount || '0') || 0;
    const netAmount = parseFloat(row.net_amount || '0') || 0;
    const discount = parseFloat(row.discount || '0') || 0;
    const shippingCost = parseFloat(row.shipping_cost || '0') || 0;

    const { date: createdAt, month: orderMonth } = parseDate(row.created_at);
    const status = parseStatus(row.status);
    const paymentStatus = parsePaymentStatus(row.payment_status);

    return {
      id: parseInt(row.id) || 0,
      userId: parseInt(row.user_id) || 0,
      grossAmount,
      netAmount,
      discount,
      shippingCost,
      status,
      paymentMethodId: parseInt(row.payment_method_id || '0') || 0,
      paymentStatus,
      createdAt,
      orderMonth,
      couponUsed: !!row.coupon_id && row.coupon_id.trim() !== '' && row.coupon_id !== 'NaN',
      isFailedPayment: status === 'failed' || paymentStatus === 'failed',
      discountRatio: grossAmount > 0 ? discount / grossAmount : 0,
      shippingRatio: grossAmount > 0 ? shippingCost / grossAmount : 0,
    };
  });

  // Step 2: Filter out zero-value / incomplete transactions (no gross amount)
  // These are typically pending/cart records with no financial data.
  const transactions = allTransactions.filter(t => t.grossAmount > 0 || t.netAmount > 0);

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
      email: emailMap[userIdStr] || '',
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
  
  // Date range calculation
  const allDates = transactions.map(t => t.createdAt.getTime());
  const minDate = new Date(Math.min(...allDates));
  const maxDate = new Date(Math.max(...allDates));
  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const metrics = {
    totalRevenue,
    totalOrders: transactions.length,
    totalCustomers: customers.length,
    avgOrderValue: customers.length > 0 ? totalRevenue / sumBy(customers, 'completedOrders') : 0,
    startDate: formatDate(minDate),
    endDate: formatDate(maxDate),
  };

  return { transactions, customers, metrics };
};
