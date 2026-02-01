"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function AdmissionsPage() {
  const [cargando, setCargando] = useState(false);
  const [form, setForm] = useState({
    nombreAlumno: '', curp: '', grado: '1', grupo: 'A',
    nombreTutor: '', correoTutor: '', telefonoTutor: ''
  });

  const generarNIP = () => Math.floor(100000 + Math.random() * 900000).toString();

  const procesarInscripcion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);

    const nipAcceso = generarNIP();

    // 1. CREAR CUENTA DEL PADRE EN AUTH
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.correoTutor,
      password: nipAcceso,
    });

    if (authError) {
      alert("Error al crear cuenta del tutor: " + authError.message);
      setCargando(false);
      return;
    }

    // 2. REGISTRAR ALUMNO Y VINCULAR AL TUTOR
    const { data: alumno, error: alumnoError } = await supabase.from('estudiantes').insert([{
      nombre_completo: form.nombreAlumno.toUpperCase(),
      curp: form.curp.toUpperCase(),
      grado: parseInt(form.grado),
      grupo: form.grupo,
      tutor_nombre: form.nombreTutor.toUpperCase(),
      tutor_correo: form.correoTutor,
      tutor_telefono: form.telefonoTutor,
      tutor_auth_id: authData.user?.id // Vínculo de seguridad
    }]).select().single();

    if (alumnoError) {
      alert("Error al registrar alumno: " + alumnoError.message);
    } else {
      // CONSEJO PRO: Formato listo para copiar y enviar por WhatsApp
      const mensajeWhatsApp = `
        *SGE - EST No. 05* 🏫
        ¡Inscripción Exitosa!
        
        Hola ${form.nombreTutor}, se ha creado su cuenta para monitorear a ${form.nombreAlumno}.
        
        *Acceso al Portal:*
        📧 Correo: ${form.correoTutor}
        🔑 Clave (NIP): ${nipAcceso}
        
        _Por seguridad, cambie su clave al entrar._
      `;
      
      console.log(mensajeWhatsApp);
      alert(`✅ INSCRIPCIÓN COMPLETADA\n\nClave generada para el padre: ${nipAcceso}\n\nSe ha vinculado correctamente al alumno.`);
      
      setForm({ nombreAlumno: '', curp: '', grado: '1', grupo: 'A', nombreTutor: '', correoTutor: '', telefonoTutor: '' });
    }
    setCargando(false);
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="bg-white rounded-[3rem] border-8 border-slate-900 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white">
          <h2 className="text-3xl font-black uppercase italic">Nueva Inscripción</h2>
          <p className="text-emerald-400 font-bold text-xs uppercase tracking-widest">Ciclo Escolar 2025-2026</p>
        </div>

        <form onSubmit={procesarInscripcion} className="p-10 space-y-8">
          {/* SECCIÓN DEL ALUMNO */}
          <div className="space-y-4">
            <h3 className="font-black text-slate-400 uppercase text-[10px] tracking-widest border-b-2 border-slate-100 pb-2">Datos del Estudiante</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="NOMBRE COMPLETO" className="p-4 border-4 border-slate-100 rounded-2xl font-bold focus:border-emerald-500 outline-none" 
                value={form.nombreAlumno} onChange={e => setForm({...form, nombreAlumno: e.target.value})} />
              <input required placeholder="CURP" className="p-4 border-4 border-slate-100 rounded-2xl font-bold focus:border-emerald-500 outline-none" 
                value={form.curp} onChange={e => setForm({...form, curp: e.target.value})} />
              <select className="p-4 border-4 border-slate-100 rounded-2xl font-bold" value={form.grado} onChange={e => setForm({...form, grado: e.target.value})}>
                <option value="1">1° GRADO</option><option value="2">2° GRADO</option><option value="3">3° GRADO</option>
              </select>
              <select className="p-4 border-4 border-slate-100 rounded-2xl font-bold" value={form.grupo} onChange={e => setForm({...form, grupo: e.target.value})}>
                <option value="A">GRUPO A</option><option value="B">GRUPO B</option><option value="C">GRUPO C</option>
              </select>
            </div>
          </div>

          {/* SECCIÓN DEL TUTOR (Genera el usuario) */}
          <div className="space-y-4">
            <h3 className="font-black text-blue-500 uppercase text-[10px] tracking-widest border-b-2 border-blue-50 pb-2">Datos del Tutor (Genera Acceso Digital)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input required placeholder="NOMBRE DEL PADRE/TUTOR" className="p-4 border-4 border-blue-100 rounded-2xl font-bold" 
                value={form.nombreTutor} onChange={e => setForm({...form, nombreTutor: e.target.value})} />
              <input required type="email" placeholder="CORREO ELECTRÓNICO" className="p-4 border-4 border-blue-100 rounded-2xl font-bold" 
                value={form.correoTutor} onChange={e => setForm({...form, correoTutor: e.target.value})} />
              <input required placeholder="TELÉFONO (10 DÍGITOS)" className="p-4 border-4 border-blue-100 rounded-2xl font-bold" 
                value={form.telefonoTutor} onChange={e => setForm({...form, telefonoTutor: e.target.value})} />
              <div className="bg-blue-50 p-4 rounded-2xl flex items-center justify-center">
                <p className="text-[10px] font-black text-blue-600 uppercase text-center italic">Se generará un NIP de 6 dígitos automáticamente</p>
              </div>
            </div>
          </div>

          <button disabled={cargando} className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black uppercase text-xl shadow-xl hover:bg-black transition-all transform active:scale-95">
            {cargando ? "REGISTRANDO..." : "Finalizar Inscripción y Crear Cuenta"}
          </button>
        </form>
      </div>
    </div>
  );
}