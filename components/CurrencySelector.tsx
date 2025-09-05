// Fix: Update styles for better integration with InputField and remove wrapper div.
import React from 'react';
import { SUPPORTED_CURRENCIES } from '../constants';
import type { CurrencyCode } from '../types';

interface CurrencySelectorProps {
  selectedCurrency: CurrencyCode;
  onCurrencyChange: (currency: CurrencyCode) => void;
}

const CurrencySelector: React.FC<CurrencySelectorProps> = ({ selectedCurrency, onCurrencyChange }) => {
  return (
    <select
      id="currency"
      name="currency"
      value={selectedCurrency}
      onChange={(e) => onCurrencyChange(e.target.value as CurrencyCode)}
      className="h-full rounded-md border-0 bg-transparent py-0 pl-2 pr-8 text-slate-500 dark:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
    >
      {SUPPORTED_CURRENCIES.map((currency) => (
        <option key={currency.code} value={currency.code}>
          {`${currency.code} (${currency.symbol})`}
        </option>
      ))}
    </select>
  );
};

export default CurrencySelector;
