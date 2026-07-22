"use client";

import React, { useRef, useState, useLayoutEffect } from 'react';
import type { PerfilNegocio, Comprobante } from '@/types';
import { QRCodeSVG } from 'qrcode.react';
import { Send } from 'lucide-react';

interface ComprobantePDFProps {
  negocio: PerfilNegocio;
  garantia: Comprobante;
  plantillaTexto: string;
  onSave?: () => void;
  onOverflowChange?: (isOverflow: boolean) => void;
  shareUrl?: string | null;
}

export default function ComprobantePDF({
  negocio,
  garantia,
  plantillaTexto,
  onSave,
  onOverflowChange,
  shareUrl = null
}: ComprobantePDFProps) {
  const pdfRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = pdfRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    const check = () => {
      const overflow = el.scrollHeight > el.offsetHeight + 4;
      setIsOverflow(overflow);
      onOverflowChange?.(overflow);
      const containerWidth = container.clientWidth - (window.innerWidth >= 768 ? 80 : 32);
      const pdfWidth = 794;
      const newScale = containerWidth / pdfWidth;
      setScale(Math.min(newScale, 1.1));
    };

    check();
    const observer = new ResizeObserver(check);
    observer.observe(container);
    return () => observer.disconnect();
  }, [plantillaTexto, onOverflowChange]);

  const getParsedHTML = () => {
    let parsed = plantillaTexto
      .replace(/&#123;&#123;/g, '{{')
      .replace(/&#125;&#125;/g, '}}');
    const nombre = garantia.clienteData?.nombre || '';
    const serie = garantia.productoData?.numeroSerie || '';
    const control = garantia.cfNumber || '';

    parsed = parsed.replace(/\{\{\s*nombre_cliente\s*\}\}/g, `<strong>${nombre}</strong>`);
    parsed = parsed.replace(/\{\{\s*numero_serie\s*\}\}/g, `<strong>${serie}</strong>`);
    parsed = parsed.replace(/\{\{\s*cf_number\s*\}\}/g, `<strong>${control}</strong>`);
    return parsed;
  };

  const handlePrint = async () => {
    setIsPrinting(true);
    if (onSave) onSave();
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 500);
  };

  const handleDownloadAndSave = async () => {
    try {
      setIsSaving(true);
      if (onSave) onSave();
      const element = pdfRef.current;
      if (!element) return;
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: `Garantia_${garantia.cfNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsAppShare = async () => {
    try {
      setIsSharing(true);
      if (onSave) onSave();
      
      const element = pdfRef.current;
      if (!element) return;
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin: 0,
        filename: `Garantia_${garantia.cfNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: 'avoid-all' }
      };

      // @ts-ignore: html2pdf types are incomplete
      const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
      const file = new File([pdfBlob], opt.filename, { type: 'application/pdf' });

      let text = negocio.whatsappMessage || `Hola {{nombre_cliente}}, te adjunto tu comprobante.`;
      text = text.replace(/\{\{\s*nombre_cliente\s*\}\}/g, garantia.clienteData?.nombre || '');
      text = text.replace(/\{\{\s*link_comprobante\s*\}\}/g, ''); // Quitamos link local
      text = text.trim();
      
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Comprobante ${garantia.cfNumber}`,
          text: text,
        });
      } else {
        // Fallback for Desktop/Unsupported browsers
        await html2pdf().set(opt).from(element).save();
        
        const phone = garantia.clienteData?.telefono ? garantia.clienteData.telefono.replace(/\D/g, '') : '';
        const fallbackText = text + '\n\n*(Por favor adjunta el PDF que se acaba de descargar en tu dispositivo)*';
        
        const waUrl = phone 
          ? `https://wa.me/${phone}?text=${encodeURIComponent(fallbackText)}`
          : `https://web.whatsapp.com/send?text=${encodeURIComponent(fallbackText)}`;
          
        window.open(waUrl, '_blank');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-3 w-full">
        <button onClick={handleDownloadAndSave} disabled={isSaving || isPrinting || isSharing} className="flex-1 bg-obsidian-950 text-white p-3 rounded-xl text-xs font-bold shadow-float hover:bg-obsidian-800 transition-colors">
          {isSaving ? 'Bajando...' : 'Descargar PDF'}
        </button>
        <button onClick={handlePrint} disabled={isSaving || isPrinting || isSharing} className="flex-1 bg-white dark:bg-white/5 border p-3 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
          Imprimir
        </button>
        <button onClick={handleWhatsAppShare} disabled={isSaving || isPrinting || isSharing} className="flex-1 bg-[#25D366] text-white p-3 rounded-xl text-xs font-bold shadow-float flex items-center justify-center gap-2 hover:bg-[#128C7E] transition-colors">
          <Send size={14} />
          {isSharing ? 'Preparando...' : 'Enviar por WhatsApp'}
        </button>
      </div>

      <div ref={containerRef} className="bg-gray-100 dark:bg-black/40 p-4 overflow-hidden rounded-lg w-full flex justify-center">
        <div className="transition-transform duration-300 print:m-0 print:p-0" style={{ transform: isPrinting ? 'none': `scale(${scale})`, transformOrigin: 'top center' }}>
          <div
            ref={pdfRef}
            id="comprobante-para-imprimir"
            className="bg-white text-black shrink-0 shadow-2xl print:absolute print:top-0 print:left-0 print:m-0 print:p-[10mm_15mm] print:h-[296mm] print:w-[210mm] print:shadow-none"
            style={{ width: '210mm', height: '296mm', padding: '10mm 15mm', boxSizing: 'border-box', position: 'relative', overflow: 'hidden' }}
          >
            {/* Marca de Agua Premium */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
              <div className="transform scale-[1.2] select-none opacity-10">
                {negocio.logoDataUrl ? (
                  <img
                    src={negocio.logoDataUrl}
                    alt=""
                    className="w-96 h-auto object-contain"
                    style={{ filter: 'grayscale(100%)' }}
                  />
                ) : (
                  <span className="text-8xl font-black whitespace-nowrap text-gray-500">{negocio.nombre}</span>
                )}
              </div>
            </div>

            <div
              className="border-b-[3px] pb-5 mb-8 flex justify-between items-end relative z-10"
              style={{ borderColor: negocio.colorPrimario || '#000' }}
            >
              <div className="max-w-[60%]">
                {negocio.logoDataUrl ? (
                  <img src={negocio.logoDataUrl} alt={negocio.nombre} className="max-h-24 w-auto object-contain" />
                ) : (
                  <h1 className="text-2xl font-black uppercase" style={{ color: negocio.colorPrimario || '#000' }}>{negocio.nombre}</h1>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400">COMPROBANTE DIGITAL</p>
                <p className="text-xl font-black font-mono" style={{ color: negocio.colorPrimario || '#000' }}>{garantia.cfNumber}</p>
              </div>
            </div>

            {/* Sección de Datos de la Operación */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-xs relative z-10">
              {/* Cliente */}
              <div
                className="border p-4 rounded-xl flex flex-col justify-between"
                style={{ borderColor: negocio.colorPrimario ? `${negocio.colorPrimario}40` : '#e2e8f0' }}
              >
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Datos del Cliente</p>
                  <p className="text-sm font-black text-black">{garantia.clienteData?.nombre || '---'}</p>
                </div>
                {garantia.clienteData?.telefono && (
                  <p className="text-[11px] font-bold text-gray-500 mt-2">Tel: {garantia.clienteData.telefono}</p>
                )}
              </div>

              {/* Equipo / Dispositivo */}
              <div
                className="border p-4 rounded-xl"
                style={{ borderColor: negocio.colorPrimario ? `${negocio.colorPrimario}40` : '#e2e8f0' }}
              >
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Datos del Equipo</p>
                <p className="text-sm font-black text-black">{garantia.productoData?.modelo || '---'}</p>
                <p className="text-[11px] font-mono mt-1 text-gray-500">S/N o Control: {garantia.productoData?.numeroSerie || '---'}</p>
              </div>
            </div>

            {/* Detalles Técnicos */}
            <div
              className="border p-4 rounded-xl mb-6 text-xs"
              style={{ borderColor: negocio.colorPrimario ? `${negocio.colorPrimario}40` : '#e2e8f0' }}
            >
              {garantia.tipo === 'recepcion' ? (
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Falla Reportada</p>
                    <p className="font-bold text-black leading-tight">{garantia.productoData?.fallaReportada || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Estado Estético</p>
                    <p className="font-bold text-gray-700 leading-tight">{garantia.productoData?.estadoEstetico || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Accesorios</p>
                    <p className="font-bold text-gray-700 leading-tight">{garantia.productoData?.accesorios || 'Ninguno'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Presupuesto Est.</p>
                    <p className="font-black text-sm" style={{ color: negocio.colorPrimario || '#000' }}>{garantia.productoData?.presupuestoEstimado || '---'}</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Trabajo Realizado</p>
                    <p className="font-bold text-black leading-tight">{garantia.productoData?.trabajoRealizado || '---'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Garantía Válida Hasta</p>
                    <p className="font-black text-sm" style={{ color: negocio.colorPrimario || '#000' }}>
                      {garantia.fechaVencimiento
                        ? new Date(garantia.fechaVencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
                        : '---'
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div
              className="text-black text-xs relative z-10"
              dangerouslySetInnerHTML={{ __html: getParsedHTML() }}
            />

            {/* Footer con QR de Verificación */}
            <div className="absolute bottom-[15mm] left-[15mm] right-[15mm] flex justify-between items-end border-t border-gray-100 pt-6 z-10">
              <div className="space-y-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Contacto del Negocio</p>
                <p className="text-[11px] font-medium">{negocio.direccion || 'Sin direccion'}</p>
                <p className="text-[11px] font-medium">{negocio.telefono || 'Sin telefono'}</p>
              </div>

              <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                <div className="text-right">
                  <p className="text-[9px] font-black text-black uppercase leading-tight">Verificar<br />Autenticidad</p>
                  <p className="text-[7px] text-gray-400 mt-1 uppercase">Escanee el codigo</p>
                </div>
                <div className="bg-white p-1.5 rounded-lg shadow-sm">
                  <QRCodeSVG
                    value={`${process.env.NEXT_PUBLIC_APP_URL || 'https://garantia-pro.netlify.app'}/v/${garantia.id}`}
                    size={60}
                    level="H"
                    includeMargin={false}
                    fgColor={negocio.colorPrimario || '#000000'}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
