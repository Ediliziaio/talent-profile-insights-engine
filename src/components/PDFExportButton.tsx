import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


interface PDFExportButtonProps {
  targetRef: React.RefObject<HTMLDivElement>;
  fileName: string;
  className?: string;
}

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
      // Temporarily expand any collapsed elements and prepare for capture
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
      
      // First page
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
      heightLeft -= pageHeight;
      
      // Additional pages if needed
      while (heightLeft > 0) {
        position = heightLeft - scaledHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, scaledHeight);
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
