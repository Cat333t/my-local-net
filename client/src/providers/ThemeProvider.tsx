import React, { useEffect, useState } from "react";

import { ThemeContext, ThemeMap } from "../contexts/ThemeContext";
import type { Theme } from "../contexts/ThemeContext";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>((): Theme => {
        const saved = localStorage.getItem("theme");

        if (saved && ThemeMap.includes(saved as Theme)) { // Check if saved is a valid theme
            return saved as Theme;
        }

        return typeof window !== "undefined" ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light" : "light";
    });

    useEffect(() => {
        document.body.className = theme; // Add the class to the body
    }, [theme]);

    const setThemeAndSave = (t: Theme) => {
        setTheme(t);
        localStorage.setItem("theme", t);
    }

    return (
        <ThemeContext.Provider value={{ theme, setTheme, setThemeAndSave }}>
            {children}
        </ThemeContext.Provider>
    )
}