"use client";
import React, { useState } from 'react';
import { generarPlaneacionIA } from '@/app/acciones';

export default function PlaneacionPage() {
  const [paso, setPaso] = useState(1);
  const [resultado, setResultado] = useState("");
  const [cargando, setCargando] = useState(false);

  const [form, setForm] = useState({
    docente: "Profr. Helmer Ferras Coutiño",
    escuela: "ESCUELA SECUNDARIA TECNICA No.05",
    grado: "", 
    asignatura: "Informática T",
    periodicidad: "Semanal",
    duracion: "100 minutos",
    fechaInicio: "", // Nueva
    fechaFin: "",    // Nueva
    horaClase: "",   // Nueva
    metodologia: "Aprendizaje Basado en Servicio",
    tema: "", 
    problematica: "",
    ejes: [] as string[]
  });

  // ... (mantenemos la lista de materias igual)
  const materias = ["Agricultura T", "Producción, Comercialización e Industrialización de Alimentos(PCIA) T", "Estructuras Metálicas T", "Pecuarias T", "Apicultura T", "Informática T", "Español", "Ingles", "Tutoría", "Matemáticas", "Biología", "Física", "Química", "Historia", "Formación Cívica y Ética", "Autonomía Curricular", "Geografía", "Educación Física", "Artes"];

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="bg-white rounded-[2rem] border-4 border-slate-900 shadow-2xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-white border-b-4 border-emerald-500">
          <h2 className="text-3xl font-black uppercase italic tracking-tighter">Planeación NEM Profesional</h2>
          <p className="text-emerald-400 font-bold text-sm uppercase">Configuración de Tiempos y Periodos</p>
        </div>

        <div className="p-10">
          {paso === 1 && (
            <div className="space-y-8 animate-in slide-in-from-right duration-500">
              <div className="bg-slate-100 p-6 rounded-2xl border-l-8 border-slate-900">
                <h3 className="text-xl font-black text-slate-900 uppercase">1. Identificación y Vigencia</h3>
                <p className="text-slate-900 font-bold text-sm mt-1">Defina cuándo y a qué hora se aplicará esta planeación.</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase">Materia / Tecnología</label>
                  <select className="w-full p-4 border-4 border-slate-300 rounded-xl font-bold text-slate-900 bg-white" value={form.asignatura} onChange={e => setForm({...form, asignatura: e.target.value})}>
                    {materias.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase">Hora de la Clase</label>
                  <input type="time" className="w-full p-4 border-4 border-slate-300 rounded-xl font-bold text-slate-900" onChange={e => setForm({...form, horaClase: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase">Fecha de Inicio</label>
                  <input type="date" className="w-full p-4 border-4 border-slate-300 rounded-xl font-bold text-slate-900" onChange={e => setForm({...form, fechaInicio: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase">Fecha de Término</label>
                  <input type="date" className="w-full p-4 border-4 border-slate-300 rounded-xl font-bold text-slate-900" onChange={e => setForm({...form, fechaFin: e.target.value})} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase">Periodicidad</label>
                  <select className="w-full p-4 border-4 border-slate-300 rounded-xl font-bold text-slate-900 bg-white" onChange={e => setForm({...form, periodicidad: e.target.value})}>
                    <option>Semanal</option>
                    <option>Quincenal</option>
                    <option>Mensual</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-black text-slate-900 uppercase">Duración de la Sesión</label>
                  <select className="w-full p-4 border-4 border-slate-300 rounded-xl font-bold text-slate-900 bg-white" onChange={e => setForm({...form, duracion: e.target.value})}>
                    <option>50 minutos</option>
                    <option selected>100 minutos</option>
                    <option>150 minutos</option>
                  </select>
                </div>
              </div>

              <button onClick={() => setPaso(2)} className="w-full bg-emerald-700 text-white py-5 rounded-2xl font-black text-2xl hover:bg-emerald-800 shadow-xl transition-transform active:scale-95">CONTINUAR →</button>
            </div>
          )}

          {/* ... (El resto de los pasos 2 y 3 se mantienen iguales que la versión anterior) */}
        </div>
      </div>

      {/* RESULTADO (Ajustamos el encabezado del documento para mostrar fechas) */}
      {resultado && (
        <div className="mt-12 bg-white p-16 rounded-lg border-2 border-slate-300 shadow-2xl font-serif text-slate-900">
          <div className="text-center border-b-4 border-slate-900 pb-6 mb-8 uppercase">
            <h1 className="text-2xl font-black">Planeación Didáctica NEM</h1>
            <p className="text-sm font-bold">{form.escuela}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-[11px] font-black mb-8 p-4 bg-slate-50 border-2 border-slate-200 uppercase">
            <div>Docente: <span className="font-normal">{form.docente}</span></div>
            <div>Periodo: <span className="font-normal">{form.fechaInicio} al {form.fechaFin}</span></div>
            <div>Materia: <span className="font-normal">{form.asignatura}</span></div>
            <div>Horario: <span className="font-normal">{form.horaClase} ({form.duracion})</span></div>
          </div>

          <div className="whitespace-pre-wrap leading-relaxed text-justify">
            {resultado}
          </div>
          {/* ... firmas ... */}
        </div>
      )}
    </div>
  );
}