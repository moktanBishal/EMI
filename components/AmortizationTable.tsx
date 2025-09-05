import React from 'react';
import type { AmortizationEntry, Currency } from '../types';
import { DownloadIcon } from './icons/DownloadIcon';
import Button from './Button';

interface AmortizationTableProps {
  schedule: AmortizationEntry[];
  onDownloadPdf: () => void;
  currency: Currency;
}

const AmortizationTable: React.FC<AmortizationTableProps> = ({ schedule, onDownloadPdf, currency }) => {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          Repayment Schedule
        </h3>
        <Button onClick={onDownloadPdf} variant="secondary" className="px-4 py-2 text-sm">
          <DownloadIcon className="w-5 h-5 mr-2" />
          Download Summary
        </Button>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-700/50 sticky top-0 backdrop-blur-sm">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Month</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Principal</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Interest</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Payment</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Balance</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {schedule.map((row) => (
              <tr key={row.month} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors duration-150">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">{row.month}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{formatCurrency(row.principal)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{formatCurrency(row.interest)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-600 dark:text-slate-200">{formatCurrency(row.totalPayment)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-300">{formatCurrency(row.remainingBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AmortizationTable;