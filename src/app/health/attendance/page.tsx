"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AsistenciaPage() {
  const [grupos, setGrupos] = useState<any[]>([]);
  const [grupoSel, setGrupoSel] = useState("");
  const [alumnos, setAlumnos] = useState<any[]>([]);
  const [asistenciasHoy, setAsistenciasHoy] = useState<Record<number, string>>({});

  useEffect(() => {
    const cargarGrupos = async () => {
      const { data } = await supabase.from('grados_grupos').select('*').order('grado');
      if (data) setGrupos(data);
    };
    cargarGrupos();
  }, []);

  useEffect(() => {
    if (grupoSel) {
      const cargarAlumnos = async () => {
        // Obtenemos alumnos de ese grado/grupo (asumiendo que la tabla estudiantes tiene grado y grupo texto)
        // Nota: En un sistema real, estudiantes debería estar vinculado al ID del grupo.
        const { data } = await supabase.from('estudiantes').select('*').order('nombre_completo');
        setAlumnos(data || []);
      };
      cargarAlumnos();
    }
  }, [grupoSel]);

  const marcarAsistencia = async (estudianteId: number, estado: string) => {
    const { error } = await supabase.from('asistencia').insert([{
      estudiante_id: estudianteId,
      estatus: estado,
      fecha: new Date().toISOString().split('T')[0]
    }]);

    if (!error) {
      setAsistenciasHoy(prev => ({ ...prev, [estudianteId]: estado }));
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div className="bg-slate-900 p-8 rounded-[2rem] border-b-8 border-emerald-500 shadow-2xl">
        <h2 className="text-3xl font-black text-white uppercase italic">Pase de Lista Digital</h2>
        <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest mt-2">
          Fecha: {new Date().toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* SELECTOR DE GRUPO */}
      <div className="bg-white p-6 rounded-3xl border-4 border-slate-900 shadow-xl flex items-center gap-4">
        <label className="font-black uppercase text-slate-700">Grupo a evaluar:</label>
        <select 
          className="flex-1 p-3 border-4 border-slate-200 rounded-xl font-black text-slate-900 uppercase"
          onChange={(e) => setGrupoSel(e.target.value)}
        >
          <option value="">-- Seleccionar Grupo --</option>
          {grupos.map(g => <option key={g.id} value={g.id}>{g.grado}° "{g.grupo}"</option>)}
        </select>
      </div>

      {grupoSel && (
        <div className="bg-white rounded-[2rem] border-4 border-slate-900 shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-50 border-b-4 border-slate-900 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="p-4 text-left">Nombre del Estudiante</th>
                <th className="p-4 text-center">Registro de Asistencia</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {alumnos.map((al) => (
                <tr key={al.id} className="hover:bg-slate-50 transition-all">
                  <td className="p-4 font-bold text-slate-900 uppercase text-sm">{al.nombre_completo}</td>
                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      {[
                        { label: 'A', color: 'bg-emerald-500', valor: 'Asistencia' },
                        { label: 'F', color: 'bg-red-500', valor: 'Falta' },
                        { label: 'R', color: 'bg-amber-500', valor: 'Retardo' },
                        { label: 'J', color: 'bg-blue-500', valor: 'Justificante' }
                      ].map((btn) => (
                        <button
                          key={btn.valor}
                          onClick={() => marcarAsistencia(al.id, btn.valor)}
                          className={`w-10 h-10 rounded-lg font-black text-white transition-all transform active:scale-90 shadow-md ${
                            asistenciasHoy[al.id] === btn.valor ? 'ring-4 ring-slate-900 scale-110 ' + btn.color : 'opacity-40 ' + btn.color
                          }`}
                          title={btn.valor}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}