import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

/**
 * Captures a DOM element and saves it as a landscape PDF.
 * @param {HTMLElement} element - The DOM element to capture
 * @param {string} filename - Output PDF filename (without .pdf)
 */
export async function downloadCertificateAsPDF(element, filename = 'certificado') {
  if (!element) throw new Error('No element provided to capture');

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#0d0d0d',
    logging: false,
    imageTimeout: 8000,
  });

  const imgData = canvas.toDataURL('image/jpeg', 0.95);
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
  pdf.save(`${filename}.pdf`);
}

/**
 * Generates a unique certificate code
 * @param {string} militarId
 * @param {string} cursoId
 */
export function generateCertificateCode(militarId, cursoId) {
  const part1 = militarId.split('-')[0].toUpperCase().substring(0, 6);
  const part2 = Date.now().toString(36).toUpperCase().substring(0, 5);
  return `CERT-${part1}-${part2}`;
}
