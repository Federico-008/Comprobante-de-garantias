"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import GestorPlantillas from '@/components/GestorPlantillas';

export default function PlantillasPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Gestor de Plantillas</h1>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 p-8">
          <GestorPlantillas />
        </div>
      </div>
    </div>
  );
}
