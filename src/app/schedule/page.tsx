"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function HorariosPage() {
  const [vista, setVista] = useState<'grupo' | 'maestro'>('grupo');
  const [grupos, setGrupos] = useState<any[]>([]);
  const [docentes, setDocentes] = useState<any[]>([]);
  const [materias, setMaterias] = useState<any[]>([]);
  const [asignaciones, setAsignaciones] = useState<any[]>([]);
  
  const [idSeleccionado, setIdSeleccionado] = useState("");
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nuevaClase, setNuevaClase] = useState({ dia: '', hora: '', docente_id: '', materia_id: '', grupo_id: '' });

  const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  const cargarCatalogos = async () => {
    const { data: g } = await supabase.from('grados_grupos').select('*').order('grado');
    const { data: p } = await supabase.from('personal').select('*').eq('categoria', 'Docente').order('nombre_completo');
    const { data: m } = await supabase.from('materias').select('*').order('nombre');
    setGrupos(g || []);
    setDocentes(p || []);
    setMaterias(m || []);
  };

  const cargarDatosHorario = async () => {
    if (!idSeleccionado) return;
    let query = supabase.from('horario_asignaciones').select('*, personal(nombre_completo), grados_grupos(grado, grupo)');
    
    if (vista === 'grupo') {
      query = query.eq('grado_grupo_id', idSeleccionado);
    } else {
      query = query.eq('docente_id', idSeleccionado);
    }

    const { data } = await query;
    setAsignaciones(data || []);
  };

  useEffect(() => { cargarCatalogos(); }, []);
  useEffect(() => { cargarDatosHorario(); }, [idSeleccionado, vista]);

  const guardarAsignacion = async () => {
    const materiaNombre = materias.find(m => m.id.toString() === nuevaClase.materia_id)?.nombre;
    const gId = vista === 'grupo' ? idSeleccionado : nuevaClase.grupo_id;
    const dId = vista === 'maestro' ? idSeleccionado : nuevaClase.docente_id;

    const { error } = await supabase.from('horario_asignaciones').insert([{
      dia: nuevaClase.dia,
      modulo_hora: nuevaClase.hora,
      docente_id: dId,
      grado_grupo_id: gId,
      materia: materiaNombre
    }]);

    if (!error) { setModalAbierto(false); cargarDatosHorario(); }
  };

  const generarEstructura = () => {
    let filas = [];
    let t = new Date(); t.setHours(7, 0, 0);
    for (let i = 1; i <= 9; i++) {
      const ini = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (i === 4) {
        filas.push({ tipo: 'receso', hora: "09:00 - 09:30", label: "RECESO" });
        t.setHours(9, 30, 0); continue;
      }
      t.setMinutes(t.getMinutes() + 50);
      const fin = t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      filas.push({ tipo: 'modulo', hora: `${ini} - ${fin}`, label: `Módulo ${i > 4 ? i-1 : i}` });
    }
    return filas;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* SELECTOR DE VISTA Y FILTRO */}
      <div className="bg-slate-900 p-8 rounded-[2rem] border-b-8 border-emerald-500 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex bg-slate-800 p-1 rounded-2xl border-2 border-slate-700">
            <button 
              onClick={() => { setVista('grupo'); setIdSeleccionado(""); }}
              className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${vista === 'grupo' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              🏫 Por Grado y Grupo
            </button>
            <button 
              onClick={() => { setVista('maestro'); setIdSeleccionado(""); }}
              className={`px-6 py-3 rounded-xl font-black uppercase text-xs transition-all ${vista === 'maestro' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
            >
              👨‍🏫 Por Maestro
            </button>
          </div>
          <h2 className="text-white font-black uppercase italic text-xl">Cronograma Escolar</h2>
        </div>

        <select 
          className="w-full p-4 rounded-xl border-4 border-emerald-500 font-black text-slate-900 uppercase bg-white shadow-lg"
          value={idSeleccionado}
          onChange={(e) => setIdSeleccionado(e.target.value)}
        >
          <option value="">-- Seleccionar {vista === 'grupo' ? 'Grado y Grupo' : 'Maestro'} --</option>
          {vista === 'grupo' 
            ? grupos.map(g => <option key={g.id} value={g.id}>{g.grado}° "{g.grupo}"</option>)
            : docentes.map(d => <option key={d.id} value={d.id}>{d.nombre_completo}</option>)
          }
        </select>
      </div>

      {idSeleccionado ? (
        <div className="bg-white rounded-[2rem] border-4 border-slate-900 shadow-2xl overflow-hidden animate-in fade-in duration-500">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b-4 border-slate-900">
                <th className="p-4 border-r-2 border-slate-300 font-black text-[10px] uppercase text-slate-500">Hora</th>
                {dias.map(d => <th key={d} className="p-4 font-black text-[10px] uppercase text-slate-900">{d}</th>)}
              </tr>
            </thead>
            <tbody>
              {generarEstructura().map((fila, idx) => (
                <tr key={idx} className={`${fila.tipo === 'receso' ? 'bg-emerald-50' : 'border-b border-slate-100'}`}>
                  <td className="p-4 border-r-2 border-slate-300 text-center bg-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase">{fila.label}</p>
                    <p className="text-xs font-black text-slate-900">{fila.hora}</p>
                  </td>
                  {dias.map(d => {
                    const asig = asignaciones.find(a => a.dia === d && a.modulo_hora === fila.hora);
                    return (
                      <td key={d} className="p-2 border-r border-slate-50 min-w-[160px]">
                        {fila.tipo === 'receso' ? (
                          <div className="text-center text-[10px] font-black text-emerald-600 uppercase italic">Receso</div>
                        ) : asig ? (
                          <div className="bg-slate-900 p-3 rounded-xl border-l-4 border-emerald-500 shadow-md">
                            <p className="text-[10px] font-black text-emerald-400 uppercase leading-tight mb-1">{asig.materia}</p>
                            <p className="text-[9px] font-bold text-white uppercase">
                              {vista === 'grupo' ? asig.personal?.nombre_completo : `${asig.grados_grupos?.grado}° "${asig.grados_grupos?.grupo}"`}
                            </p>
                          </div>
                        ) : (
                          <button 
                            onClick={() => { setNuevaClase({...nuevaClase, dia: d, hora: fila.hora}); setModalAbierto(true); }}
                            className="w-full h-12 border-2 border-dashed border-slate-200 rounded-xl text-[9px] font-black text-slate-300 hover:border-emerald-500 hover:text-emerald-500 uppercase"
                          >
                            + Asignar
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white p-20 rounded-[2rem] border-4 border-dashed border-slate-300 text-center">
          <p className="text-slate-400 font-black uppercase text-2xl italic">Elige un {vista} para visualizar su horario</p>
        </div>
      )}

      {/* MODAL DE ASIGNACIÓN ADAPTATIVO */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-8 rounded-[3rem] border-8 border-slate-900 w-full max-w-md shadow-2xl">
            <h3 className="text-2xl font-black uppercase italic mb-8 border-b-4 border-emerald-500 pb-2">Asignar Clase</h3>
            <div className="space-y-6">
              {vista === 'grupo' ? (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Profesor</label>
                  <select className="w-full p-4 border-4 border-slate-200 rounded-2xl font-bold text-slate-900" 
                    onChange={e => setNuevaClase({...nuevaClase, docente_id: e.target.value})}>
                    <option value="">-- Seleccionar Maestro --</option>
                    {docentes.map(p => <option key={p.id} value={p.id}>{p.nombre_completo}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-500">Grado y Grupo</label>
                  <select className="w-full p-4 border-4 border-slate-200 rounded-2xl font-bold text-slate-900" 
                    onChange={e => setNuevaClase({...nuevaClase, grupo_id: e.target.value})}>
                    <option value="">-- Seleccionar Grupo --</option>
                    {grupos.map(g => <option key={g.id} value={g.id}>{g.grado}° "{g.grupo}"</option>)}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-500">Materia</label>
                <select className="w-full p-4 border-4 border-slate-200 rounded-2xl font-bold text-slate-900" 
                  onChange={e => setNuevaClase({...nuevaClase, materia_id: e.target.value})}>
                  <option value="">-- Seleccionar Materia --</option>
                  {materias.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <button onClick={() => setModalAbierto(false)} className="flex-1 p-4 font-black uppercase text-slate-400">Cancelar</button>
                <button onClick={guardarAsignacion} className="flex-1 bg-slate-900 text-white p-4 rounded-2xl font-black uppercase shadow-xl hover:bg-black">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}