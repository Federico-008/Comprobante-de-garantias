"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-[120px] h-10" />;
  }

  const themes = [
    { name: "light", icon: <Sun size={14} />, label: "Luz" },
    { name: "dark", icon: <Moon size={14} />, label: "Noche" },
    { name: "system", icon: <Monitor size={14} />, label: "Auto" },
  ];

  return (
    <div className="flex bg-obsidian-50/50 dark:bg-white/5 p-1 rounded-xl border border-border/50">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest ${
            theme === t.name
              ? "bg-white dark:bg-white text-obsidian-900 shadow-float"
              : "text-obsidian-400 hover:text-obsidian-600 dark:hover:text-obsidian-200"
          }`}
          title={t.label}
        >
          {t.icon}
          {theme === t.name && <span className="animate-in fade-in slide-in-from-left-1 duration-300">{t.label}</span>}
        </button>
      ))}
    </div>
  );
}
