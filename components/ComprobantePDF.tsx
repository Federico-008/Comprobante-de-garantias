"use client";

import React, { useRef, useState, useLayoutEffect } from 'react';
import type { PerfilNegocio, GarantiaEmitida } from '@/lib/supabase';
import { Loader2, Printer, MessageCircle } from 'lucide-react';

interface ComprobantePDFProps {
  negocio: PerfilNegocio;
  garantia: GarantiaEmitida;
  plantillaTexto: string;
  onSave?: () => Promise<void>;
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
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);

  // aca se revisa si el texto se pasa de la hoja
  useLayoutEffect(() => {
    const el = pdfRef.current;
    if (!el) return;
    const check = () => {
      const overflow = el.scrollHeight > el.offsetHeight + 4;
      setIsOverflow(overflow);
      onOverflowChange?.(overflow);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(el);
    const mutObs = new MutationObserver(check);
    mutObs.observe(el, { childList: true, subtree: true, characterData: true });
    return () => {
      observer.disconnect();
      mutObs.disconnect();
    };
  }, [plantillaTexto, onOverflowChange]);

  const getParsedHTML = () => {
    let parsed = plantillaTexto
      .replace(/&#123;&#123;/g, '{{')
      .replace(/&#125;&#125;/g, '}}')
      .replace(/\{&nbsp;\{/g, '{{')
      .replace(/\}&nbsp;\}/g, '}}');
    const nombre = garantia.cliente_data?.nombre || '';
    const serie  = garantia.producto_data?.numero_serie || '';
    parsed = parsed.replace(/\{\{\s*nombre_cliente\s*\}\}/g, `<strong>${nombre}</strong>`);
    parsed = parsed.replace(/\{\{\s*numero_serie\s*\}\}/g, `<strong>${serie}</strong>`);
    return parsed;
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      if (onSave) await onSave();
      setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500);
    } catch (err) {
      console.error(err);
      setIsPrinting(false);
    }
  };

  const handleDownloadAndSave = async () => {
    try {
      setIsSaving(true);
      if (onSave) await onSave();
      const element = pdfRef.current;
      if (!element) return;
      const html2pdf = (await import('html2pdf.js')).default;
      const opt = {
        margin:      0,
        filename:    `Garantia_${garantia.cf_number}.pdf`,
        image:       { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3, useCORS: true, letterRendering: true },
        jsPDF:       { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      await html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error(err);
      alert("Error al exportar.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-wrap justify-center gap-3 w-full">
        <button onClick={handleDownloadAndSave} disabled={isSaving || isPrinting} className="flex-1 min-w-[140px] px-4 py-3 bg-primary text-white font-bold rounded-xl shadow-lg hover:bg-blue-600 transition flex gap-2 items-center justify-center">
          {isSaving ? <Loader2 className="animate-spin" size={20} /> : null}
          {isSaving ? 'Generando...' : 'Descargar PDF'}
        </button>
        <button onClick={handlePrint} disabled={isSaving || isPrinting} className="flex-1 min-w-[140px] px-4 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition flex gap-2 items-center justify-center">
          {isPrinting ? <Loader2 className="animate-spin" size={20} /> : <Printer size={20} />}
          {isPrinting ? 'Preparando...' : 'Imprimir'}
        </button>
        <button onClick={async () => {
          if (shareUrl) {
            window.open(`https://wa.me/${(garantia.cliente_data?.telefono || '').replace(/\D/g, '')}?text=${encodeURIComponent(`Hola ${garantia.cliente_data?.nombre || ''}, aquí tienes tu garantía oficial (${garantia.cf_number}): ${shareUrl}`)}`, '_blank');
          } else if (onSave) {
            await onSave();
          }
        }} disabled={isSaving || isPrinting} className="flex-1 min-w-[140px] px-4 py-3 bg-[#25D366] text-white font-bold rounded-xl shadow-lg hover:bg-[#128C7E] transition flex gap-2 items-center justify-center">
          {isSaving && !shareUrl ? <Loader2 className="animate-spin" size={20} /> : <MessageCircle size={20} />}
          {shareUrl ? 'Enviar WhatsApp' : 'Guardar y Enviar'}
        </button>
      </div>

      <div className="bg-gray-200 p-4 overflow-hidden rounded-2xl shadow-inner w-full flex justify-center border border-gray-300">
        <div className="print-container-reset" style={{ transform: 'scale(0.65)', transformOrigin: 'top center', marginBottom: '-105mm' }}>
          <div
            ref={pdfRef}
            id="comprobante-para-imprimir"
            className="relative bg-white text-black shrink-0 shadow-2xl overflow-hidden"
            style={{
              width: '210mm',
              height: '296mm',
              padding: '15mm 18mm',
              boxSizing: 'border-box',
              position: 'relative',
            }}
          >
            {/* marca de agua */}
            {negocio.logo_url && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 opacity-[0.12]">
                <img src={negocio.logo_url} alt="Marca" className="max-w-[140mm] max-h-[140mm]" />
              </div>
            )}

            {/* cabecera del pdf */}
            <div className="relative z-10 h-[22mm] mb-6 border-b-2 border-gray-200">
              {/* Logo Izquierda - Flota sin mover el resto */}
              <div className="absolute left-0 top-[-15mm] h-[50mm] w-[100mm] flex items-center">
                {negocio.logo_url ? (
                  <img src={negocio.logo_url} alt="Logo" className="h-full w-auto object-contain object-left" />
                ) : (
                  <h1 className="text-4xl font-black uppercase text-gray-900 leading-none">{negocio.nombre}</h1>
                )}
              </div>

              {/* Bloque Derecha - QR y Control en Horizontal */}
              <div className="absolute right-0 top-0 flex items-center gap-6">
                {/* QR para verificación rápida */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-gray-900 uppercase leading-none">{garantia.tipo === 'recepcion' ? 'Orden de' : 'Garantía'}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mt-1">{garantia.tipo === 'recepcion' ? 'Servicio' : 'Digital'}</p>
                  </div>
                  <div className="bg-white p-1.5 border border-gray-100 rounded-xl shadow-sm">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl || (typeof window !== 'undefined' ? `${window.location.origin}/v/${garantia.id}` : `https://garantiapro.com/v/${garantia.id}`))}`} 
                      alt="QR" 
                      className="w-14 h-14" 
                    />
                  </div>
                </div>

                <div className="bg-gray-900 text-white px-5 py-2.5 rounded-2xl text-right min-w-[120px] shadow-lg">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">Nº DE CONTROL</p>
                  <p className="text-xl font-black font-mono leading-none tracking-tighter">{garantia.cf_number}</p>
                </div>
              </div>
            </div>

            {/* datos del cliente */}
            <div className="relative z-10 bg-gray-50/80 backdrop-blur-sm border border-gray-200 rounded-2xl px-6 py-4 mb-8 grid grid-cols-2 gap-x-8 gap-y-2 text-sm shadow-sm">
              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Cliente</span>
                <span className="font-black text-gray-900 text-base">{garantia.cliente_data?.nombre || '—'}</span>
              </div>
              <div>
                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-wider block mb-0.5">Equipo / Modelo</span>
                <span className="font-black text-gray-900 text-base uppercase">{garantia.producto_data?.modelo || '—'}</span>
              </div>
              <div className="pt-2 border-t border-gray-200/50">
                <span className="text-gray-500 font-medium">Fecha Emisión:</span>{' '}
                <span className="font-bold text-gray-900">{new Date(garantia.created_at || new Date()).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              {garantia.tipo === 'recepcion' ? (
                <div className="pt-2 border-t border-gray-200/50">
                  <span className="text-gray-500 font-medium">Estado Trámite:</span>{' '}
                  <span className="font-bold text-gray-900">Equipo en Revisión</span>
                </div>
              ) : (
                <div className="pt-2 border-t border-gray-200/50">
                  <span className="text-gray-500 font-medium">Vencimiento:</span>{' '}
                  <span className="font-bold text-gray-900">
                    {garantia.fecha_vencimiento && new Date(garantia.fecha_vencimiento).getTime() > new Date().getTime() 
                      ? new Date(garantia.fecha_vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
                      : 'A consultar'}
                  </span>
                </div>
              )}
            </div>

            {/* datos especificos */}
            {garantia.tipo === 'recepcion' ? (
              <div className="relative z-10 mb-6 border border-gray-200 rounded-2xl p-4 text-sm bg-white shadow-sm">
                <h3 className="font-bold text-gray-900 mb-3 uppercase text-[10px] tracking-widest border-b border-gray-100 pb-2">Detalle de Recepción</h3>
                <div className="grid grid-cols-2 gap-x-8 gap-y-4">
                  <div><span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Falla Reportada:</span><span className="font-bold text-gray-800">{garantia.producto_data?.falla_reportada || '—'}</span></div>
                  <div><span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Estado Estético:</span><span className="font-bold text-gray-800">{garantia.producto_data?.estado_estetico || '—'}</span></div>
                  <div><span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Accesorios:</span><span className="font-bold text-gray-800">{garantia.producto_data?.accesorios || 'Ninguno'}</span></div>
                  <div><span className="text-gray-400 block text-[10px] font-bold uppercase mb-0.5">Presupuesto Estimado:</span><span className="font-bold text-gray-800">{garantia.producto_data?.presupuesto_estimado || 'A revisar'}</span></div>
                </div>
              </div>
            ) : (
              garantia.producto_data?.trabajo_realizado && (
                <div className="relative z-10 mb-6 border border-gray-200 rounded-2xl p-4 text-sm bg-white shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-2 uppercase text-[10px] tracking-widest border-b border-gray-100 pb-2">Trabajo Realizado</h3>
                  <p className="font-bold text-gray-800">{garantia.producto_data?.trabajo_realizado}</p>
                </div>
              )
            )}

            {/* contenido de la garantia */}
            <div
              className="relative z-10 text-gray-800 pdf-content-wrapper"
              style={{ fontSize: '13px', lineHeight: '1.6' }}
              dangerouslySetInnerHTML={{ __html: `
                <style>
                  .pdf-content h1 { font-size: 16px; font-weight: 900; margin: 12px 0 4px; color: #000; text-transform: uppercase; border-left: 4px solid #000; padding-left: 10px; }
                  .pdf-content h2 { font-size: 14px; font-weight: 800; margin: 10px 0 4px; color: #111; }
                  .pdf-content h3 { font-size: 13px; font-weight: 800; margin: 8px 0 2px; color: #333; }
                  .pdf-content p { margin: 4px 0; }
                  .pdf-content ul { margin: 6px 0; padding-left: 20px; }
                  .pdf-content li { margin: 2px 0; }
                  .pdf-content strong { font-weight: 800; color: #000; }
                </style>
                <div class="pdf-content">${getParsedHTML()}</div>
              ` }}
            />

            {/* aca van las firmas */}
            <div className="absolute bottom-12 left-[18mm] right-[18mm] flex justify-between items-end gap-20">
              <div className="flex-1 text-center border-t-2 border-gray-900 pt-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-900">Firma del Cliente</p>
                <p className="text-[9px] text-gray-400 font-medium mt-1">Aceptación de términos y condiciones</p>
              </div>
              <div className="flex-1 text-center border-t-2 border-gray-900 pt-3">
                <p className="text-[11px] font-black uppercase tracking-widest text-gray-900">Firma {negocio.nombre}</p>
                <p className="text-[9px] text-gray-400 font-medium mt-1">Sello y firma de la empresa</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
