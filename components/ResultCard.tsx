import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { EmiResult, Currency } from '../types';

interface ResultCardProps {
  result: EmiResult | null;
  currency: Currency;
}

const ResultCard: React.FC<ResultCardProps> = ({ result, currency }) => {

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyWithCents = (value: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const ResultInfo: React.FC<{ label: string; value: string; className?: string }> = ({ label, value, className }) => (
    <div className={`flex justify-between items-center py-4 ${className}`}>
      <p className="text-slate-500 dark:text-slate-400">{label}</p>
      <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );

  if (!result) {
    return (
      <div className="h-full flex flex-col items-center justify-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-indigo-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
        <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Your Results Await</h3>
        <p className="mt-1 text-slate-500 dark:text-slate-400">
          Enter your loan details to see the breakdown.
        </p>
      </div>
    );
  }

  const chartData = [
    { name: 'Principal Amount', value: result.principal },
    { name: 'Total Interest', value: result.totalInterest },
  ];

  const COLORS = ['#4f46e5', '#a5b4fc'];

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="text-center mb-6">
        <p className="text-slate-500 dark:text-slate-400">Your Monthly EMI</p>
        <p className="text-4xl sm:text-5xl font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">
          {formatCurrencyWithCents(result.monthlyEmi)}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-64 md:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{
                  backgroundColor: 'rgba(30, 41, 59, 0.9)',
                  borderColor: '#4f46e5',
                  borderRadius: '0.5rem',
                  color: '#f1f5f9'
                }}
              />
              <Legend iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="divide-y divide-slate-200 dark:divide-slate-700">
          <ResultInfo label="Principal Amount" value={formatCurrency(result.principal)} />
          <ResultInfo label="Total Interest Payable" value={formatCurrency(result.totalInterest)} />
          <ResultInfo
            label="Total Repayment Amount"
            value={formatCurrency(result.totalRepayment)}
            className="!border-t-2 !border-slate-300 dark:!border-slate-600"
          />
        </div>
      </div>
    </div>
  );
};

export default ResultCard;