import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import ReactDOM from "react-dom";

export interface DropdownMenuItem {
  label: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export function DropDownMenu({
  trigger,
  items,
  align = "end",
  portal = false,
}: {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "start" | "end";
  portal?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    if (!isOpen || !portal) return;
    
    const updatePosition = () => {
      const triggerEl = triggerRef.current;
      const menuEl = dropdownRef.current;
      
      if (triggerEl) {
        const rect = triggerEl.getBoundingClientRect();
        const menuWidth = menuEl?.offsetWidth || 200; 
        
        setMenuStyle({
          position: "fixed", 
          top: rect.bottom + 8, 
          left:
            align === "end"
              ? rect.right - menuWidth 
              : rect.left, 
          minWidth: 200,
          zIndex: 9999,
        });
      }
    };
    
   
    updatePosition();
    const timeout = setTimeout(updatePosition, 0);
    
    return () => clearTimeout(timeout);
  }, [isOpen, portal, align]);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

  
    let removeScrollListeners = () => {};
    if (portal) {
      const handleScrollOrResize = () => setIsOpen(false);
      window.addEventListener("scroll", handleScrollOrResize, true);
      window.addEventListener("resize", handleScrollOrResize, true);
      removeScrollListeners = () => {
        window.removeEventListener("scroll", handleScrollOrResize, true);
        window.removeEventListener("resize", handleScrollOrResize, true);
      };
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      removeScrollListeners();
    };
  }, [isOpen, portal]);

  const handleItemClick = (item: DropdownMenuItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  const menuContent = (
    <div
      ref={dropdownRef}
      className={cn(
        "z-50 min-w-[200px] rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        !portal && (align === "end" ? "right-0" : "left-0"),
        !portal && "absolute top-full mt-1"
      )}
      style={portal ? menuStyle : undefined}
    >
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => handleItemClick(item)}
          className={cn(
            "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            item.disabled && "pointer-events-none opacity-50",
            item.className
          )}
        >
          {item.icon && <span className="mr-2 h-4 w-4">{item.icon}</span>}
          {item.label}
        </div>
      ))}
    </div>
  );

  return (
    <div className="relative" style={{ display: "inline-block" }}>
      <div ref={triggerRef} onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>
      {isOpen &&
        (portal
          ? ReactDOM.createPortal(menuContent, document.body)
          : menuContent)}
    </div>
  );
}