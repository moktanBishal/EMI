import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { EmiResult, AmortizationEntry, Currency, LoanInputs } from '../types';

const formatCurrency = (value: number, currency: Currency) => {
  return new Intl.NumberFormat(currency.locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

const formatCurrencyCode = (value: number, currency: Currency) => {
    return new Intl.NumberFormat(currency.locale, {
        style: 'decimal',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value) + ` ${currency.code}`;
}

export const generatePdf = (
  result: EmiResult,
  schedule: AmortizationEntry[],
  currency: Currency,
  details: LoanInputs
) => {
  const doc = new jsPDF();
  let startY = 20;

  // Header
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Amortization Summary', 105, startY, { align: 'center' });
  startY += 15;

  const hasPartyDetails = details.providerName || details.receiverName;

  if (hasPartyDetails) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Parties Involved', 14, startY);
    startY += 7;
    autoTable(doc, {
      startY: startY,
      body: [
        ['Loan Provider', details.providerName || 'N/A'],
        ['Loan Receiver', details.receiverName || 'N/A'],
      ],
      theme: 'plain',
      styles: { font: 'helvetica', fontSize: 10 },
    });
    startY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Loan Summary Section
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Loan Summary', 14, startY);
  startY += 5;

  const summaryData = [
    ['Loan Amount', formatCurrencyCode(parseFloat(details.loanAmount), currency)],
    ['Annual Interest Rate', `${details.interestRate}%`],
    ['Loan Tenure', `${details.tenure} ${details.tenureUnit}`],
    ['Monthly EMI', formatCurrency(result.monthlyEmi, currency)],
    ['Total Interest Payable', formatCurrency(result.totalInterest, currency)],
    ['Total Repayment', formatCurrency(result.totalRepayment, currency)],
  ];
  autoTable(doc, {
    startY: startY,
    head: [['Description', 'Value']],
    body: summaryData,
    theme: 'grid',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { font: 'helvetica', fontSize: 10 },
  });
  startY = (doc as any).lastAutoTable.finalY + 15;
  
  if (hasPartyDetails) {
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('General Terms Summary', 14, startY);
    startY += 7;
    const termsText = `This document summarizes the terms of a loan provided by ${details.providerName || '(the provider)'} to ${details.receiverName || '(the receiver)'}. The principal amount of ${formatCurrencyCode(parseFloat(details.loanAmount), currency)} is to be repaid over a period of ${details.tenure} ${details.tenureUnit} at an annual interest rate of ${details.interestRate}%. The repayment will be made in equated monthly installments (EMIs) as detailed in the schedule below. This summary is for informational purposes only and does not constitute a legally binding agreement.`;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const splitText = doc.splitTextToSize(termsText, 180);
    doc.text(splitText, 14, startY);
    startY += (splitText.length * 5) + 10;
  }

  // Amortization Table
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Repayment Schedule', 14, startY);

  const tableHead = [['Month', 'Principal', 'Interest', 'Total Payment', 'Balance']];
  const tableBody = schedule.map(row => [
    row.month,
    formatCurrency(row.principal, currency),
    formatCurrency(row.interest, currency),
    formatCurrency(row.totalPayment, currency),
    formatCurrency(row.remainingBalance, currency),
  ]);
  autoTable(doc, {
    startY: startY + 5,
    head: tableHead,
    body: tableBody,
    theme: 'striped',
    headStyles: { fillColor: [79, 70, 229] },
    styles: { font: 'helvetica', fontSize: 8 },
  });

  if (hasPartyDetails) {
    let finalY = (doc as any).lastAutoTable.finalY;
    if (finalY + 60 > doc.internal.pageSize.height) {
        doc.addPage();
        finalY = 15;
    }
    let signatureY = finalY + 25;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Signatures', 105, signatureY, { align: 'center' });
    signatureY += 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('_________________________', 30, signatureY);
    doc.text(details.providerName || 'Loan Provider', 30, signatureY + 5);
    doc.text('_________________________', 120, signatureY);
    doc.text(details.receiverName || 'Loan Receiver', 120, signatureY + 5);
    signatureY += 15;
    doc.text('Date: ____________________', 30, signatureY);
    doc.text('Date: ____________________', 120, signatureY);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 25, doc.internal.pageSize.height - 10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, doc.internal.pageSize.height - 10);
  }

  doc.save('EMI_Summary_Report.pdf');
};