import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
  signed_at?: string | null;
  validated_at?: string | null;
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
    signature_url?: string | null;
    anre_certificate_number?: string | null;
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

interface CompanyData {
  name: string;
  logo_url: string | null;
  address: string | null;
  city: string | null;
  phone: string | null;
  email: string | null;
  cui: string | null;
  anre_certificate_number: string | null;
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

// Helper function to load image as base64
async function loadImageAsBase64(url: string): Promise<string | null> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function generateReportPDF(
  report: ReportData, 
  measurements: Measurement[] = [],
  company?: CompanyData | null
) {
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

  // Company Logo and Info
  let logoLoaded = false;
  if (company?.logo_url) {
    try {
      const logoBase64 = await loadImageAsBase64(company.logo_url);
      if (logoBase64) {
        // Add logo on the left
        doc.addImage(logoBase64, 'AUTO', margin, 12, 30, 30);
        logoLoaded = true;
      }
    } catch (e) {
      console.log('Could not load company logo:', e);
    }
  }

  // Company info on the right (or centered if no logo)
  if (company) {
    const companyInfoX = logoLoaded ? pageWidth - margin : pageWidth / 2;
    const companyAlign = logoLoaded ? 'right' : 'center';
    
    yPos = 15;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...textColor);
    doc.text(company.name, companyInfoX, yPos, { align: companyAlign as any });
    
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    
    if (company.address || company.city) {
      doc.text([company.address, company.city].filter(Boolean).join(', '), companyInfoX, yPos, { align: companyAlign as any });
      yPos += 4;
    }
    if (company.phone) {
      doc.text(`Tel: ${company.phone}`, companyInfoX, yPos, { align: companyAlign as any });
      yPos += 4;
    }
    if (company.email) {
      doc.text(company.email, companyInfoX, yPos, { align: companyAlign as any });
      yPos += 4;
    }
    if (company.cui) {
      doc.text(`CUI: ${company.cui}`, companyInfoX, yPos, { align: companyAlign as any });
      yPos += 4;
    }
    if (company.anre_certificate_number) {
      doc.text(`ANRE: ${company.anre_certificate_number}`, companyInfoX, yPos, { align: companyAlign as any });
    }
    
    yPos = logoLoaded ? 48 : 45;
  }

  // Title
  yPos = company ? (logoLoaded ? 50 : 48) : 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...textColor);
  doc.text(typeLabels[report.report_type], pageWidth / 2, yPos, { align: 'center' });

  // Report Number
  yPos += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(...mutedColor);
  doc.text(`Nr. ${report.report_number || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });

  // Separator line
  yPos += 8;
  doc.setDrawColor(229, 231, 235);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Client & Site Information
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('INFORMAȚII CLIENT', margin, yPos);

  yPos += 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  
  const clientName = report.sites?.clients?.name || '—';
  const siteName = report.sites?.name || '—';
  const siteAddress = [report.sites?.address, report.sites?.city].filter(Boolean).join(', ') || '—';

  doc.text(`Client: ${clientName}`, margin, yPos);
  yPos += 5;
  doc.text(`Locație: ${siteName}`, margin, yPos);
  yPos += 5;
  doc.text(`Adresă: ${siteAddress}`, margin, yPos);

  // Inspection Details
  yPos += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...primaryColor);
  doc.text('DETALII INSPECȚIE', margin, yPos);

  yPos += 7;
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
  yPos += 5;
  doc.text(`Status: ${status}`, col1X, yPos);
  doc.text(`Conformitate: ${conformity}`, col2X, yPos);
  
  if (report.ambient_temperature !== null) {
    yPos += 5;
    doc.text(`Temperatură ambientală: ${report.ambient_temperature}°C`, col1X, yPos);
  }
  
  if (report.weather_conditions) {
    doc.text(`Condiții meteo: ${report.weather_conditions}`, col2X, yPos);
  }

  // Measurements Table
  if (measurements.length > 0) {
    yPos += 12;
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

    autoTable(doc, {
      startY: yPos + 4,
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

    yPos = (doc as any).lastAutoTable.finalY + 8;
  }

  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  // Observations
  if (report.observations) {
    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('OBSERVAȚII', margin, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    
    const observationLines = doc.splitTextToSize(report.observations, pageWidth - 2 * margin);
    doc.text(observationLines, margin, yPos);
    yPos += observationLines.length * 5 + 4;
  }

  // Recommendations
  if (report.recommendations) {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('RECOMANDĂRI', margin, yPos);

    yPos += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    
    const recommendationLines = doc.splitTextToSize(report.recommendations, pageWidth - 2 * margin);
    doc.text(recommendationLines, margin, yPos);
    yPos += recommendationLines.length * 5 + 8;
  }

  // Signature Section (only for signed or archived reports)
  if (report.status === 'signed' || report.status === 'archived') {
    // Check if we need a new page for signature
    if (yPos > 220) {
      doc.addPage();
      yPos = 20;
    }

    yPos += 8;
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text('SEMNĂTURĂ', margin, yPos);

    yPos += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(...textColor);

    const engineerName = report.engineers?.profiles 
      ? [report.engineers.profiles.first_name, report.engineers.profiles.last_name].filter(Boolean).join(' ') || '—'
      : '—';

    doc.text(`Inginer verificator: ${engineerName}`, margin, yPos);
    
    if (report.engineers?.anre_certificate_number) {
      yPos += 5;
      doc.text(`Certificat ANRE: ${report.engineers.anre_certificate_number}`, margin, yPos);
    }

    // Add signature image if available
    if (report.engineers?.signature_url) {
      try {
        const signatureBase64 = await loadImageAsBase64(report.engineers.signature_url);
        if (signatureBase64) {
          yPos += 8;
          // Add signature image (roughly 50x25mm for a natural signature look)
          doc.addImage(signatureBase64, 'AUTO', margin, yPos, 50, 25);
          yPos += 28;
        }
      } catch (e) {
        console.log('Could not load signature:', e);
        yPos += 5;
      }
    } else {
      yPos += 20;
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(9);
      doc.setTextColor(...mutedColor);
      doc.text('(Semnătură electronică)', margin, yPos);
    }

    // Add date signed
    if (report.signed_at) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...mutedColor);
      doc.text(`Semnat la: ${formatDate(report.signed_at)}`, margin, yPos);
    }
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
    
    const footerLeft = company?.name 
      ? `${company.name} | Generat la ${format(new Date(), 'd MMMM yyyy, HH:mm', { locale: ro })}`
      : `Generat la ${format(new Date(), 'd MMMM yyyy, HH:mm', { locale: ro })}`;
    
    doc.text(footerLeft, margin, pageHeight - 12);
    doc.text(`Pagina ${i} din ${pageCount}`, pageWidth - margin, pageHeight - 12, { align: 'right' });
  }

  // Save the PDF
  const fileName = `raport-${report.report_number || report.id}.pdf`;
  doc.save(fileName);
}
