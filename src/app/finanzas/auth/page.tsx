"use client";
import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [modo, setModo] = useState<'login' | 'registro'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const manejarAutenticacion = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    
    try {
      if (modo === 'registro') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        setModo('login');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/'); 
      }
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="w-full max-w-md bg-white p-10 rounded-3xl border-2 border-slate-300 shadow-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">
            {modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-slate-500 font-bold text-xs uppercase mt-2 italic">SGE Chiapas Profesional</p>
        </div>

        <form onSubmit={manejarAutenticacion} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase">Correo Institucional</label>
            <input 
              required
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 border-2 border-slate-300 rounded-2xl font-bold text-slate-900 focus:border-emerald-600 outline-none transition-all" 
              placeholder="usuario@escuela.edu.mx" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase">Contraseña</label>
            <input 
              required
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 border-2 border-slate-300 rounded-2xl font-bold text-slate-900 focus:border-emerald-600 outline-none transition-all" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            disabled={cargando}
            type="submit" 
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-black py-4 rounded-2xl shadow-xl transition-all transform active:scale-95 uppercase tracking-widest text-sm"
          >
            {cargando ? 'Procesando...' : (modo === 'login' ? 'Entrar al Sistema' : 'Registrarme')}
          </button>
        </form>

        <div className="mt-8 text-center border-t pt-6">
          <button 
            onClick={() => setModo(modo === 'login' ? 'registro' : 'login')}
            className="text-xs font-black text-emerald-700 hover:underline uppercase tracking-tight"
          >
            {modo === 'login' ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}