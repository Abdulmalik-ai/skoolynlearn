"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { Palette, Type, Sun, Moon, Monitor, Check } from "lucide-react"

const FONTS = [
  { name: "Inter", label: "Modern (Inter)", class: "font-sans" },
  { name: "serif", label: "Classic (Serif)", class: "font-serif" },
  { name: "mono", label: "Code (Mono)", class: "font-mono" },
]

const SIZES = [
  { name: "small", label: "Small", scale: "text-sm" },
  { name: "default", label: "Default", scale: "text-base" },
  { name: "large", label: "Large", scale: "text-lg" },
]

const COLORS = [
  { name: "blue", label: "Blue", primary: "#2563EB" },
  { name: "purple", label: "Purple", primary: "#7C3AED" },
  { name: "emerald", label: "Green", primary: "#059669" },
  { name: "orange", label: "Orange", primary: "#EA580C" },
  { name: "rose", label: "Rose", primary: "#E11D48" },
]

export function ThemeSettings() {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [font, setFont] = useState("Inter")
  const [size, setSize] = useState("default")
  const [color, setColor] = useState("blue")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("skoolyn-theme")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setTheme(parsed.theme || "system")
        setFont(parsed.font || "Inter")
        setSize(parsed.size || "default")
        setColor(parsed.color || "blue")
      } catch {}
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    localStorage.setItem("skoolyn-theme", JSON.stringify({ theme, font, size, color }))

    // Apply theme
    const root = document.documentElement
    if (theme === "dark") root.classList.add("dark")
    else if (theme === "light") root.classList.remove("dark")
    else {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) root.classList.add("dark")
      else root.classList.remove("dark")
    }

    // Apply font
    root.classList.remove("font-sans", "font-serif", "font-mono")
    const fontClass = FONTS.find((f) => f.name === font)?.class || "font-sans"
    root.classList.add(fontClass)

    // Apply size
    const scale = SIZES.find((s) => s.name === size)?.scale || "text-base"
    root.style.fontSize = scale === "text-lg" ? "18px" : scale === "text-sm" ? "14px" : "16px"

    // Apply color
    const primary = COLORS.find((c) => c.name === color)?.primary || "#2563EB"
    root.style.setProperty("--primary", primary)
  }, [theme, font, size, color, mounted])

  const handleSave = () => {
    toast.success("Theme settings saved!")
  }

  if (!mounted) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Dashboard Theme</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="flex items-center gap-2"><Sun className="w-4 h-4" /> Appearance</Label>
          <div className="grid grid-cols-3 gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${theme === t ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"}`}
              >
                {t === "light" && <Sun className="w-5 h-5" />}
                {t === "dark" && <Moon className="w-5 h-5" />}
                {t === "system" && <Monitor className="w-5 h-5" />}
                <span className="text-sm capitalize">{t}</span>
                {theme === t && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label className="flex items-center gap-2"><Type className="w-4 h-4" /> Font Style</Label>
          <div className="grid grid-cols-3 gap-3">
            {FONTS.map((f) => (
              <button
                key={f.name}
                onClick={() => setFont(f.name)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${font === f.name ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"}`}
              >
                <span className={`text-sm block ${f.class}`}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Font Size</Label>
          <div className="grid grid-cols-3 gap-3">
            {SIZES.map((s) => (
              <button
                key={s.name}
                onClick={() => setSize(s.name)}
                className={`p-3 rounded-lg border-2 text-center transition-all ${size === s.name ? "border-primary bg-primary/5" : "border-slate-200 dark:border-slate-700 hover:border-primary/50"}`}
              >
                <span className={`block ${s.scale}`}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>Primary Color</Label>
          <div className="grid grid-cols-5 gap-3">
            {COLORS.map((c) => (
              <button
                key={c.name}
                onClick={() => setColor(c.name)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all ${color === c.name ? "border-primary" : "border-slate-200 dark:border-slate-700"}`}
              >
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: c.primary }} />
                <span className="text-xs">{c.label}</span>
                {color === c.name && <Check className="w-4 h-4 text-primary" />}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full">Save Preferences</Button>
      </CardContent>
    </Card>
  )
}
