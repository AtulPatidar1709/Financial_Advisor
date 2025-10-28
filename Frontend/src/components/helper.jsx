export const monthsBetween = (startMonth) => {
  // startMonth expected in "YYYY-MM" format (type="month")
  if (!startMonth) return 0;
  try {
    const [y, m] = startMonth.split('-').map(Number);
    if (!y || !m) return 0;
    const start = new Date(y, m - 1, 1);
    const now = new Date();
    const months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth()) + 1;
    return months > 0 ? months : 0;
  } catch (e) {
    return 0;
  }
};

export const formatINR = (num) => {
  if (num === null || num === undefined || isNaN(num)) return '₹0';
  return '₹' + Number(num).toLocaleString('en-IN', { maximumFractionDigits: 0 });
};

export const calculateSIPValue = (monthly, months, annualReturnPercent) => {
  // monthly: number, months: integer, annualReturnPercent: number (e.g., 12)
  monthly = Number(monthly) || 0;
  months = Number(months) || 0;
  const annual = Number(annualReturnPercent) || 0;
  if (monthly <= 0 || months <= 0) return 0;
  const r = annual / 100 / 12; // monthly rate
  if (r === 0) return monthly * months;
  // FV of ordinary annuity formula, then multiply by (1+r) to account for compounding on last instalment as per convention
  // Using FV = P * [ (1+r)^n - 1 ] / r * (1 + r)
  const fv = monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return fv;
};
