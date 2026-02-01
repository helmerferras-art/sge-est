"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [form, setForm] = useState({ articulo: '', cantidad: 0, estado: 'Nuevo', costo: 0 });

  const cargarInventario = async () => {
    const { data } = await supabase.from('inventario').select('*').order('articulo');
    if (data) setItems(data);
  };

  useEffect(() => { cargarInventario(); }, []);

  const registrarArticulo = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from('inventario').insert([form]);
    if (!error) {
      setForm({ articulo: '', cantidad: 0, estado: 'Nuevo', costo: 0 });
      cargarInventario();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="bg-slate-900 p-8 rounded-[2rem] border-b-8 border-blue-500 shadow-2xl flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-white uppercase italic">Control de Contraloría</h2>
          <p className="text-blue-400 font-bold uppercase text-xs">Inventarios y Compras de la EST 05</p>
        </div>
        <div className="text-right text-white">
          <p className="text-2xl font-black">${items.reduce((acc, curr) => acc + (Number(curr.costo) * curr.cantidad), 0).toLocaleString()}</p>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Valor Total de Activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO DE REGISTRO */}
        <div className="bg-white p-8 rounded-[2rem] border-4 border-slate-900 shadow-xl h-fit">
          <h3 className="font-black uppercase mb-6 text-slate-900 border-b-4 border-blue-500 pb-2">📦 Nuevo Artículo</h3>
          <form onSubmit={registrarArticulo} className="space-y-4">
            <input required placeholder="Nombre del Artículo" className="w-full p-4 border-4 border-slate-200 rounded-xl font-bold" 
              value={form.articulo} onChange={e => setForm({...form, articulo: e.target.value})} />
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Cant." className="p-4 border-4 border-slate-200 rounded-xl font-bold" 
                value={form.cantidad} onChange={e => setForm({...form, cantidad: Number(e.target.value)})} />
              <input type="number" placeholder="Costo Unit." className="p-4 border-4 border-slate-200 rounded-xl font-bold" 
                value={form.costo} onChange={e => setForm({...form, costo: Number(e.target.value)})} />
            </div>
            <select className="w-full p-4 border-4 border-slate-200 rounded-xl font-bold" 
              value={form.estado} onChange={e => setForm({...form, estado: e.target.value})}>
              <option>Nuevo</option><option>Buen estado</option><option>Dañado</option>
            </select>
            <button className="w-full bg-slate-900 text-white p-4 rounded-xl font-black uppercase shadow-lg hover:bg-black">Registrar Compra</button>
          </form>
        </div>

        {/* TABLA DE INVENTARIO */}
        <div className="lg:col-span-2 bg-white rounded-[2rem] border-4 border-slate-900 shadow-2xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-100 border-b-4 border-slate-900 text-[10px] font-black uppercase">
              <tr>
                <th className="p-4 text-left">Artículo / Estado</th>
                <th className="p-4 text-center">Stock</th>
                <th className="p-4 text-right">Inversión</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-slate-100">
              {items.map(i => (
                <tr key={i.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 uppercase">
                    <p className="font-black text-slate-900">{i.articulo}</p>
                    <p className={`text-[10px] font-bold ${i.estado === 'Dañado' ? 'text-red-500' : 'text-emerald-600'}`}>{i.estado}</p>
                  </td>
                  <td className="p-4 text-center font-black text-slate-700 text-xl">{i.cantidad}</td>
                  <td className="p-4 text-right">
                    <p className="font-black text-slate-900">${(i.costo * i.cantidad).toLocaleString()}</p>
                    <p className="text-[9px] text-slate-400 font-bold uppercase">Costo Total</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}