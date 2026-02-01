"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalAlumnos: 0,
    presentesHoy: 0,
    faltasHoy: 0,
    alertasCriticas: 0
  });
  const [recientes, setRecientes] = useState<any[]>([]);

  const cargarEstadisticas = async () => {
    const hoy = new Date().toISOString().split('T')[0];

    // 1. Total de Alumnos
    const { count: total } = await supabase.from('estudiantes').select('*', { count: 'exact', head: true });
    
    // 2. Presentes hoy (Puerta)
    const { count: presentes } = await supabase.from('accesos_puerta')
      .select('*', { count: 'exact', head: true })
      .eq('tipo', 'Entrada')
      .gte('fecha_hora', hoy);

    // 3. Faltas reportadas por maestros hoy
    const { count: faltas } = await supabase.from('asistencia')
      .select('*', { count: 'exact', head: true })
      .eq('fecha', hoy)
      .eq('estatus', 'Falta');

    // 4. Alertas Críticas (Usando la vista que creamos)
    const { data: alertas } = await supabase.from('resumen_disciplina')
      .select('*')
      .or('faltas_mes.gte.5,retardos_semana.gte.5');

    setStats({
      totalAlumnos: total || 0,
      presentesHoy: presentes || 0,
      faltasHoy: faltas || 0,
      alertasCriticas: alertas?.length || 0
    });
    setRecientes(alertas?.slice(0, 5) || []);
  };

  useEffect(() => {
    cargarEstadisticas();
    const interval = setInterval(cargarEstadisticas, 60000); // Actualiza cada minuto
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-20">
      {/* CABECERA BIENVENIDA */}
      <div className="bg-slate-900 p-12 rounded-[3rem] border-b-8 border-emerald-500 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter">
            SGE Chiapas <span className="text-emerald-500">v1.0</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase tracking-[0.3em] mt-2">Escuela Secundaria Técnica No. 05</p>
        </div>
        <div className="absolute top-0 right-0 p-12 opacity-10 text-9xl">🏫</div>
      </div>

      {/* TARJETAS DE ESTADÍSTICAS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-xl">
          <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Población Total</p>
          <p className="text-5xl font-black text-slate-900">{stats.totalAlumnos}</p>
          <p className="text-xs font-bold text-slate-500 mt-2">Alumnos Inscritos</p>
        </div>

        <div className="bg-emerald-50 p-8 rounded-[2rem] border-4 border-emerald-600 shadow-xl">
          <p className="text-[10px] font-black text-emerald-600 uppercase mb-2">En el Plantel</p>
          <p className="text-5xl font-black text-emerald-700">{stats.presentesHoy}</p>
          <p className="text-xs font-bold text-emerald-600 mt-2">Ingresos por QR hoy</p>
        </div>

        <div className="bg-red-50 p-8 rounded-[2rem] border-4 border-red-600 shadow-xl">
          <p className="text-[10px] font-black text-red-600 uppercase mb-2">Ausentismo</p>
          <p className="text-5xl font-black text-red-700">{stats.faltasHoy}</p>
          <p className="text-xs font-bold text-red-600 mt-2">Reportado en Aula</p>
        </div>

        <div className="bg-slate-900 p-8 rounded-[2rem] border-4 border-slate-700 shadow-xl text-white">
          <p className="text-[10px] font-black text-emerald-400 uppercase mb-2">Citatorios Pendientes</p>
          <p className="text-5xl font-black">{stats.alertasCriticas}</p>
          <p className="text-xs font-bold text-slate-400 mt-2">Faltas acumuladas</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* ACCESOS RÁPIDOS */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-xl font-black uppercase text-slate-900 italic">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link href="/gate" className="p-6 bg-blue-600 text-white rounded-2xl font-black uppercase text-xs hover:bg-blue-700 transition-all flex justify-between items-center shadow-lg">
              Abrir Lector QR Puerta <span>➡️</span>
            </Link>
            <Link href="/attendance" className="p-6 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-black transition-all flex justify-between items-center shadow-lg">
              Pase de Lista Diario <span>➡️</span>
            </Link>
            <Link href="/reports" className="p-6 bg-amber-500 text-white rounded-2xl font-black uppercase text-xs hover:bg-amber-600 transition-all flex justify-between items-center shadow-lg">
              Ver Alertas Tempranas <span>➡️</span>
            </Link>
          </div>
        </div>

        {/* LISTA DE ALERTAS RECIENTES */}
        <div className="lg:col-span-2 bg-white rounded-[2.5rem] border-4 border-slate-900 shadow-2xl overflow-hidden">
          <div className="bg-slate-100 p-6 border-b-4 border-slate-900 flex justify-between items-center">
            <h3 className="font-black uppercase text-slate-900">Alumnos en Riesgo (Citatorios)</h3>
            <span className="bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black">URGENTE</span>
          </div>
          <div className="p-6">
            {recientes.length > 0 ? (
              <div className="space-y-4">
                {recientes.map(al => (
                  <div key={al.estudiante_id} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                    <div>
                      <p className="font-black text-slate-900 uppercase text-sm">{al.nombre_completo}</p>
                      <p className="text-[10px] font-bold text-slate-500">{al.grado}° "{al.grupo}"</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black text-red-600">{al.faltas_mes} Faltas / Mes</p>
                      <Link href="/reports" className="text-[9px] font-black text-blue-600 uppercase underline">Gestionar</Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 text-slate-300 font-black uppercase italic">No hay alertas críticas registradas</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}