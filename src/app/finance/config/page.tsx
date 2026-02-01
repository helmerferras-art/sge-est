"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function ConfigPage() {
  const [grados, setGrados] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [nombreEditado, setNombreEditado] = useState("");

  const [nuevoGrupo, setNuevoGrupo] = useState({ grado: '1', grupo: '' });
  const [nuevaMateria, setNuevaMateria] = useState({ nombre: '', tipo: 'General' });

  const cargarDatos = async () => {
    const { data: g } = await supabase.from('grados_grupos').select('*').order('grado').order('grupo');
    const { data: m } = await supabase.from('materias').select('*').order('nombre');
    if (g) setGrados(g);
    if (m) setMaterias(m);
  };

  useEffect(() => { cargarDatos(); }, []);

  // --- FUNCIONES DE GRUPOS ---
  const agregarGrupo = async () => {
    if (!nuevoGrupo.grupo) return;
    await supabase.from('grados_grupos').insert([nuevoGrupo]);
    setNuevoGrupo({ ...nuevoGrupo, grupo: '' });
    cargarDatos();
  };

  const eliminarGrupo = async (id: number) => {
    if (confirm("¿Seguro que quieres eliminar este grupo? Se perderán sus horarios asignados.")) {
      await supabase.from('grados_grupos').delete().eq('id', id);
      cargarDatos();
    }
  };

  // --- FUNCIONES DE MATERIAS ---
  const agregarMateria = async () => {
    if (!nuevaMateria.nombre) return;
    await supabase.from('materias').insert([nuevaMateria]);
    setNuevaMateria({ ...nuevaMateria, nombre: '' });
    cargarDatos();
  };

  const eliminarMateria = async (id: number) => {
    if (confirm("¿Eliminar esta materia del catálogo?")) {
      await supabase.from('materias').delete().eq('id', id);
      cargarDatos();
    }
  };

  const actualizarMateria = async (id: number) => {
    await supabase.from('materias').update({ nombre: nombreEditado }).eq('id', id);
    setEditandoId(null);
    cargarDatos();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <div className="border-l-8 border-slate-900 pl-6">
        <h2 className="text-4xl font-black text-slate-900 uppercase italic">Centro de Control de Catálogos</h2>
        <p className="text-slate-900 font-bold uppercase text-sm">Gestiona la estructura oficial de la EST No. 05</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* PANEL DE GRADOS Y GRUPOS */}
        <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-xl">
          <h3 className="text-xl font-black uppercase mb-6 text-slate-900 flex items-center gap-2">
            <span className="bg-emerald-600 text-white p-2 rounded-lg text-sm">🏫</span> Grados y Grupos
          </h3>
          <div className="flex gap-2 mb-8 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
            <select className="p-3 border-4 border-slate-300 rounded-xl font-black text-slate-900" 
              value={nuevoGrupo.grado} onChange={e => setNuevoGrupo({...nuevoGrupo, grado: e.target.value})}>
              <option value="1">1°</option><option value="2">2°</option><option value="3">3°</option>
            </select>
            <input placeholder="Letra (A, B...)" className="flex-1 p-3 border-4 border-slate-300 rounded-xl font-black uppercase text-slate-900" 
              value={nuevoGrupo.grupo} onChange={e => setNuevoGrupo({...nuevoGrupo, grupo: e.target.value.toUpperCase()})} />
            <button onClick={agregarGrupo} className="bg-emerald-600 text-white px-6 rounded-xl font-black hover:bg-emerald-700 shadow-lg">+</button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {grados.map(g => (
              <div key={g.id} className="group relative flex justify-between items-center p-4 bg-white border-4 border-slate-100 rounded-2xl hover:border-slate-900 transition-all">
                <span className="font-black text-slate-900 text-lg">{g.grado}° "{g.grupo}"</span>
                <button onClick={() => eliminarGrupo(g.id)} className="opacity-0 group-hover:opacity-100 text-red-600 font-black text-xs uppercase hover:underline transition-opacity">Eliminar</button>
              </div>
            ))}
          </div>
        </div>

        {/* PANEL DE MATERIAS */}
        <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-xl">
          <h3 className="text-xl font-black uppercase mb-6 text-slate-900 flex items-center gap-2">
            <span className="bg-blue-600 text-white p-2 rounded-lg text-sm">📚</span> Catálogo de Materias
          </h3>
          <div className="flex gap-2 mb-8 bg-slate-50 p-4 rounded-2xl border-2 border-slate-200">
            <input placeholder="Nueva Materia" className="flex-1 p-3 border-4 border-slate-300 rounded-xl font-black text-slate-900" 
              value={nuevaMateria.nombre} onChange={e => setNuevaMateria({...nuevaMateria, nombre: e.target.value})} />
            <button onClick={agregarMateria} className="bg-blue-600 text-white px-6 rounded-xl font-black hover:bg-blue-700 shadow-lg">+</button>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
            {materias.map(m => (
              <div key={m.id} className="flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl group">
                {editandoId === m.id ? (
                  <div className="flex gap-2 w-full">
                    <input autoFocus className="flex-1 p-1 border-2 border-blue-500 rounded font-bold" 
                      value={nombreEditado} onChange={e => setNombreEditado(e.target.value)} />
                    <button onClick={() => actualizarMateria(m.id)} className="bg-green-600 text-white px-2 rounded text-[10px] font-bold">OK</button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="font-black text-slate-900 uppercase text-sm">{m.nombre}</p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">{m.tipo}</p>
                    </div>
                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditandoId(m.id); setNombreEditado(m.nombre); }} className="text-blue-600 font-black text-[10px] uppercase">Editar</button>
                      <button onClick={() => eliminarMateria(m.id)} className="text-red-600 font-black text-[10px] uppercase">Eliminar</button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}