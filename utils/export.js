import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { CSVLink } from 'react-csv';

export const exportPDF = (data) => {
  const doc = new jsPDF();
  doc.autoTable({ head: [['Author', 'Articles', 'Payout']], body: data });
  doc.save('payout-report.pdf');
};

export const getCSVData = (authors, articles, payoutRates) => {
  return authors.map(author => [
    author,
    articles.filter(a => a.author === author).length,
    payoutRates[author] || 0,
  ]);
};