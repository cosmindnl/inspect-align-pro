import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
    lastAutoTable: { finalY: number };
  }
}

interface ReportData {
  id: string;
  report_number: string | null;
  report_type: 'ground' | 'electrical' | 'solar';
  status: string | null;
  conformity: string | null;
  inspection_date: string | null;
  ambient_temperature: number | null;
  weather_conditions: string | null;
  observations: string | null;
  recommendations: string | null;
  created_at: string | null;
  sites: {
    name: string;
    address: string | null;
    city: string | null;
    clients: {
      name: string;
    } | null;
  } | null;
  engineers: {
    profiles: {
      first_name: string | null;
      last_name: string | null;
    } | null;
  } | null;
}

interface Measurement {
  id: string;
  measurement_type: string;
  value: number | null;
  unit: string | null;
  limit_value: number | null;
  location_description: string | null;
  is_conformant: boolean | null;
  equipment_used: string | null;
  measurement_method: string | null;
}

const typeLabels = {
  ground: 'Buletin de Verificare - Priză de Pământ',
  electrical: 'Raport de Verificare - Instalație Electrică',
  solar: 'Raport de Verificare - Sistem Fotovoltaic',
};

const statusLabels: Record<string, string> = {
  draft: 'Ciornă',
  validated: 'Validat',
  signed: 'Semnat',
  archived: 'Arhivat',
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return '—';
  try {
    return format(new Date(dateStr), 'd MMMM yyyy', { locale: ro });
  } catch {
    return '—';
  }
};

export function generateReportPDF(report: ReportData, measurements: Measurement[] = []) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = 20;

  // Colors
  const primaryColor: [number, number, number] = [37, 99, 235]; // Blue
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];

  // Header with colored bar
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 8, 'F');

  // Title
  yPos = 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(...textColor);
  doc.text(typeLabels[report.report_type], pageWidth / 2, yPos, { align: 'center' });

  // Report Number
  yPos += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  doc.setTextColor(...mutedColor);
  doc.text(`Nr. ${report.report_number || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });

  // Separator line
  yPos += 10;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Client & Site Information
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('INFORMAȚII CLIENT', margin, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  
  const clientName = report.sites?.clients?.name || '—';
  const siteName = report.sites?.name || '—';
  const siteAddress = [report.sites?.address, report.sites?.city].filter(Boolean).join(', ') || '—';

  doc.text(`Client: ${clientName}`, margin, yPos);
  yPos += 6;
  doc.text(`Locație: ${siteName}`, margin, yPos);
  yPos += 6;
  doc.text(`Adresă: ${siteAddress}`, margin, yPos);

  // Inspection Details
  yPos += 15;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('DETALII INSPECȚIE', margin, yPos);

  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...textColor);

  const engineerName = report.engineers?.profiles 
    ? [report.engineers.profiles.first_name, report.engineers.profiles.last_name].filter(Boolean).join(' ') || '—'
    : '—';
  const inspectionDate = formatDate(report.inspection_date);
  const status = statusLabels[report.status || ''] || report.status || '—';
  const conformity = report.conformity === 'conformant' ? 'CONFORM' : 
                     report.conformity === 'nonconformant' ? 'NECONFORM' : '—';

  // Two columns for inspection details
  const col1X = margin;
  const col2X = pageWidth / 2;

  doc.text(`Data inspecției: ${inspectionDate}`, col1X, yPos);
  doc.text(`Inginer: ${engineerName}`, col2X, yPos);
  yPos += 6;
  doc.text(`Status: ${status}`, col1X, yPos);
  doc.text(`Conformitate: ${conformity}`, col2X, yPos);
  
  if (report.ambient_temperature !== null) {
    yPos += 6;
    doc.text(`Temperatură ambientală: ${report.ambient_temperature}°C`, col1X, yPos);
  }
  
  if (report.weather_conditions) {
    doc.text(`Condiții meteo: ${report.weather_conditions}`, col2X, yPos);
  }

  // Measurements Table
  if (measurements.length > 0) {
    yPos += 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('MĂSURĂTORI', margin, yPos);

    const tableData = measurements.map((m) => [
      m.measurement_type,
      m.value !== null ? `${m.value} ${m.unit || ''}` : '—',
      m.limit_value !== null ? `${m.limit_value} ${m.unit || ''}` : '—',
      m.location_description || '—',
      m.is_conformant === null ? '—' : m.is_conformant ? 'OK' : 'NOK',
    ]);

    doc.autoTable({
      startY: yPos + 5,
      head: [['Tip Măsurătoare', 'Valoare', 'Limită', 'Locație', 'Conformitate']],
      body: tableData,
      margin: { left: margin, right: margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
      columnStyles: {
        0: { fontStyle: 'bold' },
        4: { halign: 'center' },
      },
    });

    yPos = doc.lastAutoTable.finalY + 10;
  }

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Observations
  if (report.observations) {
    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('OBSERVAȚII', margin, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    
    const observationLines = doc.splitTextToSize(report.observations, pageWidth - 2 * margin);
    doc.text(observationLines, margin, yPos);
    yPos += observationLines.length * 5 + 5;
  }

  // Recommendations
  if (report.recommendations) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 5;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('RECOMANDĂRI', margin, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    
    const recommendationLines = doc.splitTextToSize(report.recommendations, pageWidth - 2 * margin);
    doc.text(recommendationLines, margin, yPos);
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Footer line
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);
    
    // Footer text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.text(`Generat la ${format(new Date(), 'd MMMM yyyy, HH:mm', { locale: ro })}`, margin, pageHeight - 12);
    doc.text(`Pagina ${i} din ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
  }

  // Save the PDF
  const fileName = `raport-${report.report_number || report.id}.pdf`;
  doc.save(fileName);
}
