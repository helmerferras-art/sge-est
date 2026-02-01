"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GateControlPage() {
  const [escaneo, setEscaneo] = useState("");
  const [ultimoAcceso, setUltimoAcceso] = useState<any>(null);

  const registrarEntrada = async (idEstudiante: string) => {
    // 1. Registrar en la DB
    const { data, error } = await supabase.from('accesos_puerta').insert([
      { estudiante_id: idEstudiante, tipo: 'Entrada' }
    ]).select('*, estudiantes(nombre_completo, tutores(telefono))').single();

    if (data) {
      setUltimoAcceso(data);
      setEscaneo("");
      // Aquí se dispararía la lógica de SMS (Twilio o similar)
      console.log(`Enviando SMS al tutor del alumno ${data.estudiantes.nombre_completo}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-slate-900 p-10 rounded-[3rem] border-b-8 border-blue-500 shadow-2xl text-center">
        <h2 className="text-4xl font-black text-white uppercase italic">Control de Acceso Escolar</h2>
        <p className="text-blue-400 font-bold mt-2">Pase el código QR o Credencial por el lector</p>
      </div>

      <div className="bg-white p-12 rounded-[3rem] border-4 border-slate-900 shadow-xl text-center">
        <input 
          autoFocus
          value={escaneo}
          onChange={(e) => {
            setEscaneo(e.target.value);
            if(e.target.value.length >= 5) registrarEntrada(e.target.value);
          }}
          placeholder="Esperando lectura..."
          className="w-full p-6 border-4 border-dashed border-slate-300 rounded-2xl text-center text-2xl font-black uppercase focus:border-blue-500 outline-none"
        />

        {ultimoAcceso && (
          <div className="mt-10 p-8 bg-emerald-50 border-4 border-emerald-500 rounded-3xl animate-in fade-in zoom-in">
            <p className="text-emerald-800 font-black text-3xl uppercase">{ultimoAcceso.estudiantes.nombre_completo}</p>
            <p className="text-slate-600 font-black text-xl">ENTRADA REGISTRADA: {new Date().toLocaleTimeString()}</p>
            <div className="mt-4 inline-block bg-emerald-600 text-white px-6 py-2 rounded-full font-black text-xs uppercase">
              SMS Enviado al Padre ✅
            </div>
          </div>
        )}
      </div>
    </div>
  );
}