import React, { useEffect, useState } from "react";
import { createContext, useContext } from "react";

export type Theme = "light" | "dark";

type ThemeContextType = {
    theme: Theme;
    setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(localStorage.getItem("theme") as Theme || "light");

    useEffect(() => {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(localStorage.getItem("theme") === "dark" ? "dark" : prefersDark ? "dark" : "light");
    }, []);

    useEffect(() => {
        document.body.className = theme; // Add the class to the body
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const ctx = useContext(ThemeContext);
    if (!ctx) {
        throw new Error("useTheme must be used inside ThemeProvider");
    }
    return ctx;
}