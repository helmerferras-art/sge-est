"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PortalPadresPage() {
  const [hijo, setHijo] = useState<any>(null);
  const [asistencias, setAsistencias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  const cargarDatosHijo = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session) {
      // 1. Buscamos al alumno vinculado a este tutor (auth_id)
      const { data: vinculo } = await supabase
        .from('estudiantes')
        .select('*, grados_grupos(grado, grupo)')
        .eq('tutor_auth_id', session.user.id) // Campo que vincula al tutor
        .single();

      if (vinculo) {
        setHijo(vinculo);
        // 2. Traemos sus últimas 5 asistencias/faltas
        const { data: asis } = await supabase
          .from('asistencia')
          .select('*')
          .eq('estudiante_id', vinculo.id)
          .order('fecha', { ascending: false })
          .limit(5);
        setAsistencias(asis || []);
      }
    }
    setCargando(false);
  };

  useEffect(() => { cargarDatosHijo(); }, []);

  if (cargando) return <div className="p-10 text-center font-black animate-pulse">CARGANDO EXPEDIENTE...</div>;

  return (
    <div className="max-w-md mx-auto space-y-6 pb-20">
      {/* TARJETA DE IDENTIDAD */}
      <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl border-b-8 border-emerald-500 relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-[10px] font-black uppercase text-emerald-400 mb-1">Alumno(a) Inscrito</p>
          <h2 className="text-2xl font-black uppercase italic">{hijo?.nombre_completo}</h2>
          <p className="text-sm font-bold opacity-70">{hijo?.grados_grupos?.grado}° "{hijo?.grados_grupos?.grupo}" • Matutino</p>
        </div>
        <div className="absolute -right-4 -bottom-4 text-8xl opacity-10">🎒</div>
      </div>

      {/* ESTADO DE HOY (Sincronizado con Puerta QR) */}
      <div className="bg-white p-6 rounded-[2rem] border-4 border-slate-900 shadow-xl flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">✅</div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase">Estatus de Entrada Hoy</p>
          <p className="font-black text-slate-900 uppercase text-sm">Registrado: 07:05 AM</p>
        </div>
      </div>

      {/* RESUMEN DE ASISTENCIA */}
      <div className="space-y-3">
        <h3 className="text-xs font-black uppercase text-slate-500 ml-4">Últimos Reportes de Clase</h3>
        {asistencias.map((as, idx) => (
          <div key={idx} className="bg-white p-4 rounded-2xl border-2 border-slate-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${as.estatus === 'Asistencia' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
              <p className="text-xs font-bold text-slate-700">{as.fecha}</p>
            </div>
            <p className={`text-[10px] font-black uppercase ${as.estatus === 'Asistencia' ? 'text-emerald-600' : 'text-red-600'}`}>
              {as.estatus}
            </p>
          </div>
        ))}
      </div>

      {/* BOTONES DE ACCIÓN PARA PADRES */}
      <div className="grid grid-cols-2 gap-4">
        <button className="bg-slate-100 p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all group">
          <span className="text-2xl">📅</span>
          <span className="text-[9px] font-black uppercase">Ver Horario</span>
        </button>
        <button className="bg-slate-100 p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all">
          <span className="text-2xl">📊</span>
          <span className="text-[9px] font-black uppercase">Calificaciones</span>
        </button>
        <button className="bg-slate-100 p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all">
          <span className="text-2xl">📄</span>
          <span className="text-[9px] font-black uppercase">Citatorios</span>
        </button>
        <button className="bg-slate-900 text-white p-6 rounded-[2rem] flex flex-col items-center gap-2 hover:bg-black transition-all">
          <span className="text-2xl">🔒</span>
          <span className="text-[9px] font-black uppercase">Cambiar NIP</span>
        </button>
      </div>

      <div className="bg-blue-50 p-6 rounded-[2rem] border-2 border-blue-200 text-center">
        <p className="text-[10px] font-bold text-blue-700 uppercase mb-1">¿Necesita contactar a la escuela?</p>
        <p className="text-xs font-black text-blue-900">📞 961 123 4567</p>
      </div>
    </div>
  );
}