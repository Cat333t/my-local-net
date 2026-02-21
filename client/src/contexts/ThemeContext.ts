import { createContext } from "react";

export const ThemeMap = ["light", "dark"] as const;
export type Theme = typeof ThemeMap[number];

export type ThemeContextType = {
    theme: Theme;
    setTheme: (t: Theme) => void;
    setThemeAndSave: (t: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextType | null>(null);