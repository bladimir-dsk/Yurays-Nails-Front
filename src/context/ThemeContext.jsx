// src/context/ThemeContext.jsx
import { createContext, useContext, useState, useMemo, useEffect } from "react";

const ThemeContext = createContext();
const STORAGE_KEY = "app-theme-mode";

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved === "dark";
    // opcional: respeta preferencia del sistema si no hay nada guardado
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    // le añade una clase al <html> para que tu CSS/Tailwind también reaccione
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  const value = useMemo(() => ({ isDark, toggleTheme }), [isDark]);

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export const useThemeMode = () => useContext(ThemeContext);
