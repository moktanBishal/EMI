// Fix: Implement the main App component, including state management, event handlers, and calculation logic.
import React, { useState, useMemo, useCallback } from 'react';
import InputField from './components/InputField';
import TenureSwitch from './components/TenureSwitch';
import Button from './components/Button';
import ResultCard from './components/ResultCard';
import AmortizationTable from './components/AmortizationTable';
import CurrencySelector from './components/CurrencySelector';
import ComparisonTable from './components/ComparisonTable';
import { CalculatorIcon } from './components/icons/CalculatorIcon';
import { ResetIcon } from './components/icons/ResetIcon';
import { generatePdf } from './utils/pdfGenerator';
import { SUPPORTED_CURRENCIES } from './constants';
import type { LoanInputs, TenureUnit, EmiResult, AmortizationEntry, Currency, CurrencyCode, EmiComparisonResult } from './types';

const App: React.FC = () => {
  const initialState: LoanInputs = {
    loanAmount: '1000000',
    interestRate: '8.5',
    tenure: '10',
    tenureUnit: 'years',
    providerName: '',
    receiverName: '',
  };

  const [inputs, setInputs] = useState<LoanInputs>(initialState);
  const [result, setResult] = useState<EmiResult | null>(null);
  const [schedule, setSchedule] = useState<AmortizationEntry[]>([]);
  const [currencyCode, setCurrencyCode] = useState<CurrencyCode>('NPR');
  const [comparisonRatesInput, setComparisonRatesInput] = useState('');
  const [comparisonResults, setComparisonResults] = useState<EmiComparisonResult[]>([]);

  const currency = useMemo(
    () => SUPPORTED_CURRENCIES.find((c) => c.code === currencyCode)!,
    [currencyCode]
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleTenureUnitChange = (unit: TenureUnit) => {
    setInputs((prev) => ({ ...prev, tenureUnit: unit }));
  };

  const handleCurrencyChange = (code: CurrencyCode) => {
    setCurrencyCode(code);
  }

  const handleReset = () => {
    setInputs(initialState);
    setResult(null);
    setSchedule([]);
    setCurrencyCode('NPR');
    setComparisonRatesInput('');
    setComparisonResults([]);
  };

  const calculateEmi = useCallback(() => {
    const principal = parseFloat(inputs.loanAmount);
    const annualRate = parseFloat(inputs.interestRate);
    const tenureValue = parseInt(inputs.tenure, 10);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(tenureValue) || principal <= 0 || annualRate <= 0 || tenureValue <= 0) {
      setResult(null);
      setSchedule([]);
      setComparisonResults([]);
      return;
    }

    const monthlyRate = annualRate / 12 / 100;
    const totalMonths = inputs.tenureUnit === 'years' ? tenureValue * 12 : tenureValue;

    if (totalMonths <= 0) {
        setResult(null);
        setSchedule([]);
        setComparisonResults([]);
        return;
    }

    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);

    if (!isFinite(emi)) {
      setResult(null);
      setSchedule([]);
      setComparisonResults([]);
      return;
    }
    
    const totalRepayment = emi * totalMonths;
    const totalInterest = totalRepayment - principal;

    const mainResult: EmiResult = {
      monthlyEmi: emi,
      principal: principal,
      totalInterest: totalInterest,
      totalRepayment: totalRepayment,
    };
    setResult(mainResult);

    // Calculate Amortization Schedule
    let balance = principal;
    const newSchedule: AmortizationEntry[] = [];
    for (let i = 1; i <= totalMonths; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = emi - interestPayment;
      balance -= principalPayment;
      newSchedule.push({
        month: i,
        principal: principalPayment,
        interest: interestPayment,
        totalPayment: emi,
        remainingBalance: balance > 0 ? balance : 0,
      });
    }
    setSchedule(newSchedule);

    // --- New Comparison Logic ---
    const calculateScenario = (rate: number): EmiResult | null => {
        const monthlyRate = rate / 12 / 100;
        if (principal <= 0 || rate <= 0 || totalMonths <= 0) return null;

        const scenarioEmi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
        if(!isFinite(scenarioEmi)) return null;

        const totalRepayment = scenarioEmi * totalMonths;
        const totalInterest = totalRepayment - principal;
        return { principal, monthlyEmi: scenarioEmi, totalInterest, totalRepayment };
    };

    const primaryRate = parseFloat(inputs.interestRate);
    const comparisonRateStrings = comparisonRatesInput.split(',').map(s => s.trim()).filter(Boolean);
    const comparisonRates = comparisonRateStrings.map(parseFloat).filter(r => !isNaN(r) && r > 0);
    
    const allRatesToCompare = new Set([primaryRate, ...comparisonRates]);
    
    const scenarios: EmiComparisonResult[] = [];
    allRatesToCompare.forEach(rate => {
      const scenarioResult = calculateScenario(rate);
      if (scenarioResult) {
        const label = rate === primaryRate ? `Current (${rate.toFixed(2)}%)` : `${rate.toFixed(2)}%`;
        scenarios.push({ ...scenarioResult, label });
      }
    });

    scenarios.sort((a, b) => {
        const rateA = parseFloat(a.label.match(/(\d+\.?\d*)/)?.[0] ?? '0');
        const rateB = parseFloat(b.label.match(/(\d+\.?\d*)/)?.[0] ?? '0');
        return rateA - rateB;
    });
    
    setComparisonResults(scenarios);

  }, [inputs, comparisonRatesInput]);

  const handleDownloadPdf = () => {
    if (result && schedule.length > 0) {
      generatePdf(result, schedule, currency, inputs);
    }
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen text-slate-800 dark:text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Advanced EMI Calculator
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Plan your loans with precision. Calculate your Equated Monthly Installment (EMI) and visualize your repayment journey.
          </p>
        </header>
        
        <main className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 h-fit">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Loan Details</h2>
            <form onSubmit={(e) => { e.preventDefault(); calculateEmi(); }} className="space-y-6">
              <div>
                <InputField
                  label="Loan Amount"
                  id="loanAmount"
                  name="loanAmount"
                  type="number"
                  placeholder="e.g., 1,000,000"
                  value={inputs.loanAmount}
                  onChange={handleInputChange}
                  rightAdornment={<CurrencySelector selectedCurrency={currencyCode} onCurrencyChange={handleCurrencyChange} />}
                  rightAdornmentPadding="pr-28"
                  required
                />
              </div>

              <InputField
                label="Annual Interest Rate (%)"
                id="interestRate"
                name="interestRate"
                type="number"
                step="0.01"
                placeholder="e.g., 8.5"
                value={inputs.interestRate}
                onChange={handleInputChange}
                required
              />
              
              <InputField
                label="Compare Interest Rates (comma-separated)"
                id="comparisonRatesInput"
                name="comparisonRatesInput"
                type="text"
                placeholder="e.g., 8, 8.25, 9"
                value={comparisonRatesInput}
                onChange={(e) => setComparisonRatesInput(e.target.value)}
                rightAdornment={<div className="absolute inset-y-0 right-0 flex items-center pr-3"><span className="text-slate-500 dark:text-slate-400">%</span></div>}
                rightAdornmentPadding="pr-10"
              />

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Loan Tenure</label>
                <div className="flex items-stretch">
                  <InputField
                    label=""
                    id="tenure"
                    name="tenure"
                    type="number"
                    placeholder="e.g., 10"
                    value={inputs.tenure}
                    onChange={handleInputChange}
                    className="rounded-r-none !mt-0"
                    required
                  />
                  <TenureSwitch selectedUnit={inputs.tenureUnit} onUnitChange={handleTenureUnitChange} />
                </div>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                 <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">PDF Report Details (Optional)</h3>
                  <div className="space-y-4">
                      <InputField
                        label="Loan Provider Name"
                        id="providerName"
                        name="providerName"
                        type="text"
                        placeholder="e.g., Central Bank"
                        value={inputs.providerName}
                        onChange={handleInputChange}
                      />
                      <InputField
                        label="Loan Receiver Name"
                        id="receiverName"
                        name="receiverName"
                        type="text"
                        placeholder="e.g., John Doe"
                        value={inputs.receiverName}
                        onChange={handleInputChange}
                      />
                  </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="w-full">
                  <CalculatorIcon className="w-5 h-5 mr-2" />
                  Calculate EMI
                </Button>
                <Button type="button" variant="secondary" onClick={handleReset} className="w-full">
                  <ResetIcon className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <ResultCard result={result} currency={currency} />
            {schedule.length > 0 && result && (
              <AmortizationTable schedule={schedule} onDownloadPdf={handleDownloadPdf} currency={currency} />
            )}
            {comparisonResults.length > 0 && <ComparisonTable scenarios={comparisonResults} currency={currency} />}
          </div>
        </main>

        <footer className="text-center mt-12 py-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500 dark:text-slate-400">
                &copy; {new Date().getFullYear()} Advanced EMI Calculator. All rights reserved.
            </p>
        </footer>
      </div>
    </div>
  );
};

export default App;