"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function PersonalPage() {
  const [form, setForm] = useState({
    nombre: '', curp: '', categoria: 'Docente', puesto: 'Maestro de Tecnología',
    direccion: '', telefono: '', correo: '', rol: 'Docente'
  });
  const [lista, setLista] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarPersonal = async () => {
    const { data } = await supabase.from('personal').select('*').order('nombre_completo');
    if (data) setLista(data);
  };

  useEffect(() => { cargarPersonal(); }, []);

  // CONSEJO PRO: Función para generar el NIP de 6 dígitos
  const generarNIP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const guardarPersonalYCrearAcceso = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    const passwordProvisorio = generarNIP();

    // 1. CREAR LA CUENTA DE ACCESO (Auth)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.correo,
      password: passwordProvisorio, // Los 6 dígitos
    });

    if (authError) {
      alert("Error al crear acceso: " + authError.message);
      setCargando(false);
      return;
    }

    // 2. GUARDAR DATOS EN TABLA PERSONAL Y PERFILES
    const { error: dbError } = await supabase.from('personal').insert([{ 
      nombre_completo: form.nombre, 
      curp: form.curp, 
      categoria: form.categoria, 
      puesto: form.puesto,
      correo_electronico: form.correo,
      rol: form.rol,
      auth_id: authData.user?.id // Vinculamos la cuenta
    }]);

    if (dbError) {
      alert("Error en base de datos: " + dbError.message);
    } else {
      // CONSEJO PRO: En lugar de solo avisar, mostramos la clave generada
      alert(`✅ PERSONAL REGISTRADO\n\nCorreo: ${form.correo}\nClave de acceso (6 dígitos): ${passwordProvisorio}\n\nFavor de anotar la clave para el usuario.`);
      setForm({ nombre: '', curp: '', categoria: 'Docente', puesto: '', direccion: '', telefono: '', correo: '', rol: 'Docente' });
      cargarPersonal();
    }
    setCargando(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="bg-white p-10 rounded-[3rem] border-4 border-slate-900 shadow-2xl">
        <h2 className="text-3xl font-black uppercase mb-8 border-b-8 border-blue-500 pb-4">
          👥 Registro de Personal y Cuentas
        </h2>
        
        <form onSubmit={guardarPersonalYCrearAcceso} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Nombre Completo</label>
            <input required className="w-full p-4 border-4 border-slate-200 rounded-2xl font-bold" 
              value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value.toUpperCase()})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Correo Institucional (Para entrar al sistema)</label>
            <input required type="email" className="w-full p-4 border-4 border-blue-500 rounded-2xl font-bold bg-blue-50" 
              value={form.correo} onChange={e => setForm({...form, correo: e.target.value})} />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Rol del Sistema</label>
            <select className="w-full p-4 border-4 border-slate-900 rounded-2xl font-black" 
              value={form.rol} onChange={e => setForm({...form, rol: e.target.value})}>
              <option value="Docente">Docente (Pase de lista y Planeación)</option>
              <option value="Director">Director (Acceso Total)</option>
              <option value="Secretario">Secretario (Inscripciones)</option>
              <option value="Contralor">Contralor (Inventarios)</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-400 ml-2">Puesto Real</label>
            <input placeholder="Ej: Maestro de Informática" className="w-full p-4 border-4 border-slate-200 rounded-2xl font-bold" 
              value={form.puesto} onChange={e => setForm({...form, puesto: e.target.value})} />
          </div>

          <button disabled={cargando} className="md:col-span-2 bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xl hover:bg-black shadow-2xl transition-all">
            {cargando ? "Procesando..." : "✅ Registrar y Generar Clave de 6 Dígitos"}
          </button>
        </form>
      </div>

      {/* VISTA RÁPIDA DE PERSONAL */}
      <div className="bg-white rounded-[2rem] border-4 border-slate-900 overflow-hidden shadow-xl">
        <table className="w-full">
          <thead className="bg-slate-100 border-b-4 border-slate-900 font-black uppercase text-[10px]">
            <tr>
              <th className="p-4 text-left">Compañero</th>
              <th className="p-4 text-left">Correo de Acceso</th>
              <th className="p-4 text-center">Nivel de Acceso</th>
            </tr>
          </thead>
          <tbody>
            {lista.map(p => (
              <tr key={p.id} className="border-b-2 border-slate-50">
                <td className="p-4">
                  <p className="font-black text-slate-900 uppercase">{p.nombre_completo}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">{p.puesto}</p>
                </td>
                <td className="p-4 font-bold text-blue-600 text-sm">{p.correo_electronico}</td>
                <td className="p-4 text-center">
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter">
                    {p.rol}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}