"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PrefecturaPage() {
  const [faltantes, setFaltantes] = useState<any[]>([]);

  const auditarSeguridad = async () => {
    const hoy = new Date().toISOString().split('T')[0];
    const { data: todos } = await supabase.from('estudiantes')
      .select('id, nombre_completo, grados_grupos(grado, grupo), alumno_tutor(tutores(nombre_completo, telefono))');
    const { data: entradas } = await supabase.from('accesos_puerta')
      .select('estudiante_id').eq('tipo', 'Entrada').gte('fecha_hora', hoy);

    if (todos && entradas) {
      const idsEntrada = new Set(entradas.map(e => e.estudiante_id));
      const noLlegaron = todos.filter(al => !idsEntrada.has(al.id));
      setFaltantes(noLlegaron);
    }
  };

  const enviarWhatsApp = (tutorTel: string, nombreAlumno: string) => {
    // Formateamos el número (debe incluir código de país, ej: 52 para México)
    const telLimpio = tutorTel.replace(/\D/g, '');
    const mensaje = encodeURIComponent(
      `🔔 *EST 05 - AVISO IMPORTANTE*\n\nEstimado padre de familia, le informamos que su hijo(a) *${nombreAlumno.toUpperCase()}* no ha registrado su entrada al plantel hoy ${new Date().toLocaleDateString()}.\n\nPor favor, comuníquese a la escuela si hay alguna eventualidad.`
    );
    
    // Abre WhatsApp en una nueva pestaña
    window.open(`https://wa.me/52${telLimpio}?text=${mensaje}`, '_blank');
  };

  useEffect(() => {
    auditarSeguridad();
    const i = setInterval(auditarSeguridad, 15000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="bg-slate-900 p-8 rounded-[2rem] border-b-8 border-blue-600 shadow-2xl flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic">Control de Asistencias</h2>
          <p className="text-blue-400 font-bold uppercase text-xs">Avisos vía WhatsApp API</p>
        </div>
        <div className="bg-white/10 px-6 py-3 rounded-2xl border border-white/20">
          <p className="text-white font-black text-2xl">{faltantes.length}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase">Pendientes de ingreso</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {faltantes.map(al => (
          <div key={al.id} className="bg-white p-6 rounded-3xl border-4 border-slate-100 flex justify-between items-center shadow-lg hover:border-blue-500 transition-all">
            <div>
              <p className="font-black text-slate-900 uppercase text-lg">{al.nombre_completo}</p>
              <p className="text-xs font-bold text-slate-500 uppercase">Grupo: {al.grados_grupos?.grado}° "{al.grados_grupos?.grupo}"</p>
              <p className="text-[10px] font-black text-blue-600 mt-2 uppercase">Tutor: {al.alumno_tutor?.[0]?.tutores?.nombre_completo || 'No asignado'}</p>
            </div>
            
            <button 
              onClick={() => enviarWhatsApp(al.alumno_tutor?.[0]?.tutores?.telefono, al.nombre_completo)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-3 px-6 py-4 rounded-2xl font-black uppercase text-xs shadow-xl transition-transform active:scale-95"
            >
              <span>Enviar WhatsApp</span>
              <span className="text-xl">📱</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}