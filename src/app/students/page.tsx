"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { QRCodeSVG } from 'qrcode.react'; // Importamos la librería

export default function AlumnosPage() {
  const [form, setForm] = useState({ nombre: '', curp: '', grado_grupo_id: '' });
  const [grupos, setGrupos] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);
  const [alumnoSeleccionado, setAlumnoSeleccionado] = useState<any>(null);

  const cargarDatos = async () => {
    const { data: catGrupos } = await supabase.from('grados_grupos').select('*').order('grado');
    const { data: ests } = await supabase.from('estudiantes').select('*, grados_grupos(grado, grupo)').order('nombre_completo');
    if (catGrupos) setGrupos(catGrupos);
    if (ests) setLista(ests);
  };

  useEffect(() => { cargarDatos(); }, []);

  const guardarAlumno = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('estudiantes').insert([form]);
    if (!error) { setForm({ nombre: '', curp: '', grado_grupo_id: '' }); cargarDatos(); }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      {/* FORMULARIO DE INSCRIPCIÓN */}
      <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-xl">
        <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
           <span className="text-3xl">🎒</span> Inscripción de Alumnos
        </h2>
        <form onSubmit={guardarAlumno} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input placeholder="Nombre Completo" className="p-4 border-4 border-slate-200 rounded-xl font-bold" value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value.toUpperCase()})} />
          <input placeholder="CURP" className="p-4 border-4 border-slate-200 rounded-xl font-bold" value={form.curp} onChange={e => setForm({...form, curp: e.target.value.toUpperCase()})} />
          <select required className="p-4 border-4 border-slate-900 rounded-xl font-black bg-emerald-50" value={form.grado_grupo_id} onChange={e => setForm({...form, grado_grupo_id: e.target.value})}>
            <option value="">-- Grupo Oficial --</option>
            {grupos.map(g => <option key={g.id} value={g.id}>{g.grado}° "{g.grupo}"</option>)}
          </select>
          <button className="md:col-span-3 bg-slate-900 text-white p-4 rounded-xl font-black uppercase hover:bg-black transition-all">Registrar e Inscribir</button>
        </form>
      </div>

      {/* TABLA DE ALUMNOS */}
      <div className="bg-white rounded-[2rem] border-4 border-slate-900 overflow-hidden shadow-2xl">
        <table className="w-full">
          <thead className="bg-slate-900 text-white font-black uppercase text-[10px]">
            <tr>
              <th className="p-4 text-left">Estudiante</th>
              <th className="p-4 text-center">Grado/Grupo</th>
              <th className="p-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-slate-100">
            {lista.map(al => (
              <tr key={al.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <p className="font-black text-slate-900 uppercase">{al.nombre_completo}</p>
                  <p className="text-[10px] text-slate-400 font-bold">{al.curp}</p>
                </td>
                <td className="p-4 text-center">
                  <span className="bg-emerald-100 text-emerald-800 px-4 py-1 rounded-full text-xs font-black border-2 border-emerald-200">
                    {al.grados_grupos?.grado}° "{al.grados_grupos?.grupo}"
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => setAlumnoSeleccionado(al)}
                    className="bg-slate-100 hover:bg-slate-900 hover:text-white p-2 px-4 rounded-lg font-black text-[10px] uppercase transition-all"
                  >
                    🪪 Generar Credencial
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CREDENCIAL IMPRIMIBLE */}
      {alumnoSeleccionado && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white p-2 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            {/* Formato Credencial */}
            <div id="credencial" className="w-[350px] border-4 border-slate-900 rounded-lg overflow-hidden">
                <div className="bg-slate-900 p-4 text-white text-center border-b-4 border-emerald-500">
                    <p className="text-[10px] font-black uppercase">Escuela Secundaria Técnica No. 05</p>
                    <p className="text-[8px] font-bold text-emerald-400 uppercase">Credencial Escolar 2025-2026</p>
                </div>
                <div className="p-6 flex flex-col items-center gap-4 bg-white">
                    <div className="w-24 h-24 bg-slate-100 border-2 border-slate-200 rounded-full flex items-center justify-center text-3xl">👤</div>
                    <div className="text-center">
                        <p className="font-black text-slate-900 uppercase leading-tight">{alumnoSeleccionado.nombre_completo}</p>
                        <p className="text-xs font-black text-emerald-600 uppercase mt-1">Grupo: {alumnoSeleccionado.grados_grupos?.grado}° "{alumnoSeleccionado.grados_grupos?.grupo}"</p>
                    </div>
                    {/* El QR usa el ID del alumno para el escaneo de puerta */}
                    <div className="p-2 border-2 border-slate-100 rounded-xl">
                        <QRCodeSVG value={alumnoSeleccionado.id.toString()} size={100} />
                    </div>
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Escanee para registro de entrada/salida</p>
                </div>
            </div>
            <div className="flex gap-2 p-4">
                <button onClick={() => setAlumnoSeleccionado(null)} className="flex-1 font-black text-xs uppercase text-slate-400">Cerrar</button>
                <button onClick={() => window.print()} className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-black text-xs uppercase">Imprimir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}