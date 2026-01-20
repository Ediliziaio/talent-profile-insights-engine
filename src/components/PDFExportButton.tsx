import { useState, useRef, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Button } from '@/components/ui/button';
import { Download, Loader2, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { PDFReportLayout } from './PDFReportLayout';
import { ProfiloTipo } from '@/types/database';

interface PDFExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  className?: string;
}

interface PDFReportButtonProps {
  candidatoNome: string;
  candidatoCognome: string;
  eta?: number | null;
  email?: string | null;
  telefono?: string | null;
  azienda?: string | null;
  ruoloRichiesto: string;
  profiloTipo: ProfiloTipo | null;
  scalePunteggi: Record<string, number>;
  stressZone?: boolean;
  dataTest?: string | null;
  schematicita?: number;
  className?: string;
}

// Helper function to load logo as base64
const loadLogoAsBase64 = (): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      } else {
        reject(new Error('Cannot get canvas context'));
      }
    };
    img.onerror = reject;
    img.src = '/talentprofile_logo_v3.png';
  });
};

// Function to add watermark to each page
const addWatermarkToPage = (
  pdf: jsPDF,
  logoData: string,
  pdfWidth: number,
  pdfHeight: number
) => {
  const logoWidth = 35;  // mm
  const logoHeight = 12; // mm (proportional)
  const margin = 10;     // mm from edge
  
  // Position: bottom-right corner
  const xPos = pdfWidth - logoWidth - margin;
  const yPos = pdfHeight - logoHeight - margin;
  
  pdf.addImage(logoData, 'PNG', xPos, yPos, logoWidth, logoHeight);
};

export function PDFExportButton({ targetRef, fileName, className }: PDFExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!targetRef.current) {
      toast({
        title: 'Errore',
        description: 'Contenuto non disponibile per l\'esportazione',
        variant: 'destructive',
      });
      return;
    }

    setIsExporting(true);
    
    try {
      // Load logo for watermark
      const logoData = await loadLogoAsBase64();
      
      // Prepare element for capture
      const element = targetRef.current;
      
      // Create canvas with high quality settings
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Calculate PDF dimensions (A4)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate the ratio to fit width
      const ratio = pdfWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      // Add pages if content is taller than one page
      let heightLeft = scaledHeight;
      let position = 0;
      const pageHeight = pdfHeight;
      
      // First page with watermark
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
      addWatermarkToPage(pdf, logoData, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      
      // Additional pages with watermark
      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
        addWatermarkToPage(pdf, logoData, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      // Generate filename with date
      const date = new Date().toISOString().split('T')[0];
      const safeFileName = fileName.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Report_${safeFileName}_${date}.pdf`);

      toast({
        title: 'PDF Esportato',
        description: 'Il report è stato scaricato con successo',
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: 'Errore Export',
        description: 'Si è verificato un errore durante l\'esportazione',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleExport} 
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Esportando...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Scarica PDF
        </>
      )}
    </Button>
  );
}

/**
 * PDFReportButton - Genera PDF ottimizzato per colloqui
 * 
 * Utilizza il layout PDFReportLayout specifico per stampa
 */
export function PDFReportButton({
  candidatoNome,
  candidatoCognome,
  eta,
  email,
  telefono,
  azienda,
  ruoloRichiesto,
  profiloTipo,
  scalePunteggi,
  stressZone,
  dataTest,
  schematicita,
  className
}: PDFReportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Create a temporary container
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm';
      document.body.appendChild(container);
      
      // Render the PDF layout component
      const root = createRoot(container);
      
      await new Promise<void>((resolve) => {
        root.render(
          <PDFReportLayout
            candidatoNome={candidatoNome}
            candidatoCognome={candidatoCognome}
            eta={eta}
            email={email}
            telefono={telefono}
            azienda={azienda}
            ruoloRichiesto={ruoloRichiesto}
            profiloTipo={profiloTipo}
            scalePunteggi={scalePunteggi}
            stressZone={stressZone}
            dataTest={dataTest}
            schematicita={schematicita}
          />
        );
        // Wait for render
        setTimeout(resolve, 500);
      });
      
      // Load logo
      const logoData = await loadLogoAsBase64();
      
      // Capture the rendered layout
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: container.scrollWidth,
        height: container.scrollHeight,
      });
      
      // Cleanup React root
      root.unmount();
      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Calculate the ratio to fit width with margins
      const margin = 5; // 5mm margins
      const contentWidth = pdfWidth - (margin * 2);
      const ratio = contentWidth / imgWidth;
      const scaledHeight = imgHeight * ratio;
      
      // Add pages if content is taller than one page
      let heightLeft = scaledHeight;
      let position = margin;
      const pageContentHeight = pdfHeight - (margin * 2);
      
      // First page
      pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, scaledHeight);
      addWatermarkToPage(pdf, logoData, pdfWidth, pdfHeight);
      heightLeft -= pageContentHeight;
      
      // Additional pages
      while (heightLeft > 0) {
        position = margin - (scaledHeight - heightLeft);
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', margin, position, contentWidth, scaledHeight);
        addWatermarkToPage(pdf, logoData, pdfWidth, pdfHeight);
        heightLeft -= pageContentHeight;
      }

      // Generate filename
      const date = new Date().toISOString().split('T')[0];
      const safeFileName = `${candidatoCognome}_${candidatoNome}`.replace(/[^a-zA-Z0-9_-]/g, '_');
      pdf.save(`Report_Colloquio_${safeFileName}_${date}.pdf`);

      toast({
        title: 'Report Colloquio Generato',
        description: 'Il PDF è pronto per la stampa',
      });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast({
        title: 'Errore',
        description: 'Errore nella generazione del PDF',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button 
      variant="default" 
      size="sm" 
      onClick={handleExport} 
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <FileText className="h-4 w-4 mr-2" />
          Report Colloquio
        </>
      )}
    </Button>
  );
}
