"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Evitar errores de hidratación
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="p-2 w-10 h-10" />;
  }

  const themes = [
    { name: "light", icon: <Sun size={20} />, label: "Claro" },
    { name: "dark", icon: <Moon size={20} />, label: "Oscuro" },
    { name: "system", icon: <Monitor size={20} />, label: "Sistema" },
  ];

  return (
    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl border border-gray-200 dark:border-gray-700">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`p-2 rounded-lg transition-all flex items-center justify-center ${
            theme === t.name
              ? "bg-white dark:bg-gray-700 text-primary shadow-sm ring-1 ring-black/5"
              : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          }`}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
}
