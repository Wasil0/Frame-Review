import * as React from "react"
import { cn } from "@/utils"

const TabsContext = React.createContext({
  value: "",
  onValueChange: () => {}
})

function Tabs({ value, defaultValue, onValueChange, className, children, ...props }) {
  const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || "")

  const activeValue = value !== undefined ? value : selectedValue

  const handleValueChange = React.useCallback((val) => {
    setSelectedValue(val)
    if (onValueChange) onValueChange(val)
  }, [onValueChange])

  return (
    <TabsContext.Provider value={{ value: activeValue, onValueChange: handleValueChange }}>
      <div className={cn("w-full", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

function TabsList({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "inline-flex h-11 items-center justify-center rounded-xl bg-[#12131A] p-1 text-slate-400 border border-white/5 w-full",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function TabsTrigger({ value, className, children, ...props }) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext)
  const isSelected = activeValue === value

  return (
    <button
      type="button"
      role="tab"
      aria-selected={isSelected}
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex flex-1 items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-semibold transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50",
        isSelected
          ? "bg-[#1A1B23] text-white shadow-sm border border-white/10"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}

function TabsContent({ value, className, children, ...props }) {
  const { value: activeValue } = React.useContext(TabsContext)
  if (activeValue !== value) return null

  return (
    <div
      role="tabpanel"
      className={cn("mt-4 focus-visible:outline-none", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
