"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Layers } from 'lucide-react';
import GestorPlantillas from '@/components/GestorPlantillas';

export default function PlantillasPage() {
  return (
    <div className="min-h-screen bg-transparent text-foreground pb-20 relative z-10">
      <div className="max-w-5xl mx-auto px-6">
        <header className="py-10 flex items-center gap-4 border-b border-border/50 mb-10">
          <Link href="/dashboard" className="p-2.5 bg-obsidian-50 dark:bg-white/5 hover:bg-obsidian-100 dark:hover:bg-white/10 rounded-2xl transition-colors border border-border/50">
            <ArrowLeft size={20} className="text-obsidian-500 dark:text-obsidian-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
              <div className="bg-sapphire-50 dark:bg-sapphire-500/10 p-2 rounded-xl inline-block">
                <Layers size={22} className="text-sapphire-600 dark:text-sapphire-400" />
              </div>
              Gestor de Plantillas
            </h1>
            <p className="text-sm text-obsidian-500 dark:text-obsidian-400 font-medium mt-1 ml-1">
              Administra tus modelos de comprobantes y términos legales.
            </p>
          </div>
        </header>

        <div className="glass-card rounded-3xl p-8 overflow-hidden">
          <GestorPlantillas />
        </div>
      </div>
    </div>
  );
}
