"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ReportesPage() {
  const [alertas, setAlertas] = useState<any[]>([]);
  const [citatorioSel, setCitatorioSel] = useState<any>(null);

  const cargarAlertas = async () => {
    const { data } = await supabase.from('resumen_disciplina').select('*');
    if (data) {
      // Filtramos según tus reglas: 5 faltas al mes O 5 retardos a la semana
      const criticos = data.filter(al => al.faltas_mes >= 5 || al.retardos_semana >= 5);
      setAlertas(criticos);
    }
  };

  useEffect(() => { cargarAlertas(); }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="bg-slate-900 p-8 rounded-[2rem] border-b-8 border-amber-500 shadow-2xl">
        <h2 className="text-3xl font-black text-white uppercase italic">Monitor de Alerta Temprana</h2>
        <p className="text-amber-400 font-bold uppercase text-xs">Control de Disciplina y Citatorios</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alertas.map(al => (
          <div key={al.estudiante_id} className="bg-white p-6 rounded-3xl border-4 border-slate-900 flex justify-between items-center shadow-xl">
            <div className="flex gap-6 items-center">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black text-white ${al.faltas_mes >= 5 ? 'bg-red-600' : 'bg-amber-500'}`}>
                {al.faltas_mes >= 5 ? '!' : 'R'}
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 uppercase">{al.nombre_completo}</p>
                <p className="text-xs font-bold text-slate-500 uppercase">{al.grado}° "{al.grupo}"</p>
                <div className="flex gap-4 mt-2">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md ${al.faltas_mes >= 5 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-500'}`}>
                    Faltas Mes: {al.faltas_mes}
                  </span>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-md ${al.retardos_semana >= 5 ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                    Retardos Semana: {al.retardos_semana}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => setCitatorioSel(al)}
              className="bg-slate-900 text-white px-6 py-3 rounded-xl font-black uppercase text-[10px] hover:bg-black transition-all"
            >
              📄 Generar Citatorio
            </button>
          </div>
        ))}
      </div>

      {/* FORMATO DE CITATORIO IMPRIMIBLE */}
      {citatorioSel && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-2 rounded-xl shadow-2xl animate-in zoom-in duration-200">
            <div id="impresion-citatorio" className="w-[600px] p-12 bg-white border-2 border-slate-200 font-serif text-slate-900">
              <div className="text-center border-b-2 border-black pb-6 mb-10">
                <h1 className="text-xl font-bold uppercase">Escuela Secundaria Técnica No. 05</h1>
                <p className="text-sm font-bold uppercase">Coordinación de Asistencia y Disciplina</p>
              </div>

              <p className="text-right font-bold mb-10">Tuxtla Gutiérrez, Chiapas a {new Date().toLocaleDateString()}</p>
              
              <p className="font-bold mb-4 uppercase">A LA MADRE, PADRE DE FAMILIA O TUTOR:</p>
              
              <p className="text-justify leading-relaxed mb-6">
                Por medio de la presente, se le cita de carácter <strong>URGENTE</strong> en las instalaciones de este plantel educativo para tratar asuntos relacionados con la situación académica y disciplinaria de su hijo(a) 
                <strong> {citatorioSel.nombre_completo}</strong> del grado y grupo <strong>{citatorioSel.grado}° "{citatorioSel.grupo}"</strong>.
              </p>

              <div className="bg-slate-50 p-6 border-2 border-slate-900 mb-8 rounded-lg">
                <p className="text-xs font-bold uppercase mb-2">Motivo del citatorio:</p>
                <ul className="list-disc ml-6 font-bold text-sm">
                  {citatorioSel.faltas_mes >= 5 && <li>Acumulación de {citatorioSel.faltas_mes} faltas en el mes actual.</li>}
                  {citatorioSel.retardos_semana >= 5 && <li>Acumulación de {citatorioSel.retardos_semana} retardos en la presente semana.</li>}
                </ul>
              </div>

              <p className="mb-16">Sin más por el momento, agradecemos su puntual asistencia y compromiso con la educación de su hijo(a).</p>

              <div className="grid grid-cols-2 gap-10 text-center uppercase text-[10px] font-bold">
                <div className="border-t border-black pt-4">Sello de la Escuela</div>
                <div className="border-t border-black pt-4">Firma del Coordinador</div>
              </div>
            </div>
            
            <div className="flex gap-2 p-4">
                <button onClick={() => setCitatorioSel(null)} className="flex-1 font-black text-xs uppercase text-slate-400">Cancelar</button>
                <button onClick={() => window.print()} className="flex-1 bg-emerald-700 text-white py-4 rounded-xl font-black text-xs uppercase shadow-lg">🖨️ Imprimir y Entregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}