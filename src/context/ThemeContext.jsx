import { useState, useEffect, createContext } from "react";

export const ThemeContext = createContext({
  theme: "",
  toggleTheme: () => {},
  setTheme: () => {},
});

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem("theme");
    // Migrate old invalid "abyss" value
    if (saved === "abyss") return "dim";
    return saved || "autumn";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dim" ? "autumn" : "dim"));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
