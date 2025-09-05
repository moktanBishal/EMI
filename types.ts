// Fix: Defining the types used throughout the application.
export type TenureUnit = 'years' | 'months';

export type CurrencyCode = 'INR' | 'NPR';

export interface Currency {
  code: CurrencyCode;
  symbol: string;
  locale: string;
}

export interface LoanInputs {
  loanAmount: string;
  interestRate: string;
  tenure: string;
  tenureUnit: TenureUnit;
  providerName: string;
  receiverName: string;
}

export interface EmiResult {
  monthlyEmi: number;
  principal: number;
  totalInterest: number;
  totalRepayment: number;
}

export interface EmiComparisonResult extends EmiResult {
  label: string;
}

export interface AmortizationEntry {
  month: number;
  principal: number;
  interest: number;
  totalPayment: number;
  remainingBalance: number;
}