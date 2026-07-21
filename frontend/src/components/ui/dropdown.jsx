import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, ChevronRight } from "lucide-react";
import { cn } from "../../utils";

/**
 * Reusable Dropdown & Select UI Components with React Portal & Smart Flip Positioning
 * Synchronous pre-mount coordinate calculation eliminates top-left (0,0) initial flashes.
 */

// 1. DropdownSelect: Form Input Dropdown (Replaces native <select>)
export function DropdownSelect({
  value,
  onChange,
  options = [],
  placeholder = "Select option...",
  disabled = false,
  className = "",
  error = false
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  // Synchronously calculate portal position and flip state
  const calculateCoords = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 220;
    const flipUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    return {
      top: flipUp ? rect.top - 6 : rect.bottom + 6,
      left: rect.left,
      width: rect.width,
      flipUp,
      maxHeight: flipUp ? Math.min(spaceAbove - 16, 260) : Math.min(spaceBelow - 16, 260)
    };
  };

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      const initialCoords = calculateCoords();
      setCoords(initialCoords);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setCoords(null);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      const updated = calculateCoords();
      if (updated) setCoords(updated);

      const handleScroll = (e) => {
        if (panelRef.current && panelRef.current.contains(e.target)) return;
        setIsOpen(false);
        setCoords(null);
      };

      const handleClickOutside = (e) => {
        if (
          triggerRef.current && !triggerRef.current.contains(e.target) &&
          panelRef.current && !panelRef.current.contains(e.target)
        ) {
          setIsOpen(false);
          setCoords(null);
        }
      };

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          setCoords(null);
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  const selectedOption = options.find((opt) => opt.value === value || opt.id === value);

  const handleSelect = (optValue) => {
    onChange(optValue);
    setIsOpen(false);
    setCoords(null);
  };

  return (
    <div className={cn("relative w-full text-xs select-none", className)}>
      {/* Trigger Field Box */}
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={handleToggle}
        className={cn(
          "w-full h-10 px-3 rounded-lg bg-[#1A1B23] border text-left flex items-center justify-between transition-all outline-none",
          error
            ? "border-red-500/60 focus:border-red-500"
            : isOpen
            ? "border-[#22C55E] ring-1 ring-[#22C55E]/30"
            : "border-white/10 hover:border-white/20",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        )}
      >
        <div className="flex items-center gap-2 truncate mr-2">
          {selectedOption?.icon && (
            <selectedOption.icon className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
          )}
          <span className={selectedOption ? "text-slate-200 font-medium" : "text-slate-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform duration-200",
            isOpen && "rotate-180 text-[#22C55E]"
          )}
        />
      </button>

      {/* Floating Options Panel via React Portal */}
      {isOpen && coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              left: `${coords.left}px`,
              width: `${coords.width}px`,
              ...(coords.flipUp
                ? { bottom: `${window.innerHeight - coords.top}px` }
                : { top: `${coords.top}px` }),
              maxHeight: `${coords.maxHeight}px`
            }}
            className="bg-[#12131A] border border-white/10 rounded-xl shadow-2xl p-1.5 z-[9999] animate-in fade-in slide-in-from-top-1 duration-150 overflow-y-auto space-y-0.5"
          >
            {options.map((opt) => {
              const optVal = opt.value !== undefined ? opt.value : opt.id;
              const isSelected = value === optVal;
              const Icon = opt.icon;

              return (
                <button
                  key={optVal}
                  type="button"
                  onClick={() => handleSelect(optVal)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left",
                    isSelected
                      ? "bg-[#22C55E]/10 text-[#22C55E] font-bold"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          isSelected ? "text-[#22C55E]" : "text-slate-400"
                        )}
                      />
                    )}
                    <span className="truncate">{opt.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
}

// 2. Dropdown: Action / Custom Menu Dropdown (For Kebab menus, Agency switchers, etc.)
export function Dropdown({
  trigger,
  items = [],
  value,
  onChange,
  align = "right",
  width = "w-56",
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const calculateCoords = () => {
    if (!triggerRef.current) return null;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 240;
    const flipUp = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

    const numericWidth = width.includes("56") ? 224 : width.includes("52") ? 208 : 210;

    let left = align === "right" ? rect.right - numericWidth : rect.left;
    if (left < 8) left = 8;
    if (left + numericWidth > window.innerWidth - 8) left = window.innerWidth - numericWidth - 8;

    return {
      top: flipUp ? rect.top - 6 : rect.bottom + 6,
      left,
      flipUp,
      maxHeight: flipUp ? Math.min(spaceAbove - 16, 280) : Math.min(spaceBelow - 16, 280)
    };
  };

  const handleToggle = () => {
    if (!isOpen) {
      const initialCoords = calculateCoords();
      setCoords(initialCoords);
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setCoords(null);
    }
  };

  useLayoutEffect(() => {
    if (isOpen) {
      const updated = calculateCoords();
      if (updated) setCoords(updated);

      const handleScroll = (e) => {
        if (panelRef.current && panelRef.current.contains(e.target)) return;
        setIsOpen(false);
        setCoords(null);
      };

      const handleClickOutside = (e) => {
        if (
          triggerRef.current && !triggerRef.current.contains(e.target) &&
          panelRef.current && !panelRef.current.contains(e.target)
        ) {
          setIsOpen(false);
          setCoords(null);
        }
      };

      const handleKeyDown = (e) => {
        if (e.key === "Escape") {
          setIsOpen(false);
          setCoords(null);
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  return (
    <div className={cn("relative inline-block text-xs select-none", className)}>
      {/* Trigger Element */}
      <div ref={triggerRef} onClick={handleToggle} className="cursor-pointer">
        {trigger}
      </div>

      {/* Floating Menu Panel via React Portal */}
      {isOpen && coords &&
        createPortal(
          <div
            ref={panelRef}
            style={{
              position: "fixed",
              left: `${coords.left}px`,
              ...(coords.flipUp
                ? { bottom: `${window.innerHeight - coords.top}px` }
                : { top: `${coords.top}px` }),
              maxHeight: `${coords.maxHeight}px`
            }}
            className={cn(
              "bg-[#12131A] border border-white/10 rounded-xl shadow-2xl p-1.5 z-[9999] animate-in fade-in slide-in-from-top-1 duration-150 overflow-y-auto space-y-0.5 text-left",
              width
            )}
          >
            {items.map((item, index) => (
              <DropdownMenuItem
                key={item.id || item.value || index}
                item={item}
                selectedValue={value}
                onSelect={(val, itemObj) => {
                  if (onChange) onChange(val, itemObj);
                  if (!itemObj.keepOpen && !itemObj.subItems) {
                    setIsOpen(false);
                    setCoords(null);
                  }
                }}
              />
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}

// Subcomponent for Individual Dropdown Menu Item (Supports nested submenus & dividers via Portals)
function DropdownMenuItem({ item, selectedValue, onSelect }) {
  const [isSubOpen, setIsSubOpen] = useState(false);
  const [subCoords, setSubCoords] = useState(null);
  const itemRef = useRef(null);
  const subPanelRef = useRef(null);

  const calculateSubCoords = () => {
    if (!itemRef.current) return null;
    const rect = itemRef.current.getBoundingClientRect();
    const spaceRight = window.innerWidth - rect.right;
    const spaceBelow = window.innerHeight - rect.bottom;

    const flipLeft = spaceRight < 200;
    const flipUp = spaceBelow < 180;

    return {
      left: flipLeft ? rect.left - 190 - 4 : rect.right + 4,
      top: flipUp ? rect.top - 120 : rect.top,
      flipUp,
      flipLeft
    };
  };

  const handleItemClick = () => {
    if (item.subItems) {
      if (!isSubOpen) {
        const initialSubCoords = calculateSubCoords();
        setSubCoords(initialSubCoords);
        setIsSubOpen(true);
      } else {
        setIsSubOpen(false);
        setSubCoords(null);
      }
    } else if (item.onClick) {
      item.onClick();
      onSelect(item.value || item.id, item);
    } else {
      onSelect(item.value || item.id, item);
    }
  };

  useLayoutEffect(() => {
    if (isSubOpen) {
      const updated = calculateSubCoords();
      if (updated) setSubCoords(updated);

      const handleScroll = (e) => {
        if (subPanelRef.current && subPanelRef.current.contains(e.target)) return;
        setIsSubOpen(false);
        setSubCoords(null);
      };

      const handleClickOutside = (e) => {
        if (
          itemRef.current && !itemRef.current.contains(e.target) &&
          subPanelRef.current && !subPanelRef.current.contains(e.target)
        ) {
          setIsSubOpen(false);
          setSubCoords(null);
        }
      };

      window.addEventListener("scroll", handleScroll, true);
      document.addEventListener("mousedown", handleClickOutside);

      return () => {
        window.removeEventListener("scroll", handleScroll, true);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isSubOpen]);

  const isSelected = selectedValue !== undefined && (selectedValue === item.value || selectedValue === item.id);
  const Icon = item.icon;

  if (item.divider) {
    return <div className="my-1 border-t border-white/5" />;
  }

  return (
    <div ref={itemRef} className="relative">
      <button
        type="button"
        disabled={item.disabled}
        onClick={handleItemClick}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors text-left",
          item.destructive
            ? "text-red-400 hover:bg-red-500/10 hover:text-red-300 font-semibold"
            : isSelected
            ? "bg-[#22C55E]/10 text-[#22C55E] font-bold"
            : "text-slate-300 hover:bg-white/5 hover:text-white",
          item.disabled && "opacity-40 cursor-not-allowed"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && (
            <Icon
              className={cn(
                "w-3.5 h-3.5 shrink-0",
                item.destructive
                  ? "text-red-400"
                  : isSelected
                  ? "text-[#22C55E]"
                  : "text-slate-400"
              )}
            />
          )}
          <span className="truncate">{item.label}</span>
        </div>

        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {item.badge && (
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-white/5 text-slate-400 border border-white/5 font-mono">
              {item.badge}
            </span>
          )}
          {isSelected && <Check className="w-3.5 h-3.5 text-[#22C55E]" />}
          {item.subItems && <ChevronRight className="w-3.5 h-3.5 text-slate-500" />}
        </div>
      </button>

      {/* Render Floating Submenu Panel via React Portal */}
      {item.subItems && isSubOpen && subCoords &&
        createPortal(
          <div
            ref={subPanelRef}
            style={{
              position: "fixed",
              left: `${subCoords.left}px`,
              top: `${subCoords.top}px`,
              width: "190px"
            }}
            className="p-1 bg-[#1A1B23] border border-white/10 rounded-xl shadow-2xl space-y-0.5 max-h-52 overflow-y-auto z-[10000] animate-in fade-in slide-in-from-top-1 duration-150"
          >
            {item.subItems.length === 0 ? (
              <p className="text-[10px] text-slate-500 p-2 italic text-center">No options available</p>
            ) : (
              item.subItems.map((sub, sIdx) => {
                const SubIcon = sub.icon;
                return (
                  <button
                    key={sub.id || sub.value || sIdx}
                    type="button"
                    onClick={() => {
                      if (sub.onClick) sub.onClick();
                      onSelect(sub.value || sub.id, sub);
                      setIsSubOpen(false);
                      setSubCoords(null);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] text-slate-300 hover:bg-[#22C55E]/10 hover:text-[#22C55E] transition-colors text-left truncate"
                  >
                    {SubIcon && <SubIcon className="w-3 h-3 text-[#22C55E] shrink-0" />}
                    <span className="truncate">{sub.label}</span>
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}
    </div>
  );
}
