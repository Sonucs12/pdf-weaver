import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "./button";
import ReactDOM from "react-dom";

interface BottomSheetContainerProps {
  children: React.ReactNode;
  onClose: () => void;
  title?: string;
  showClose?: boolean;
  className?: string;
  contentClassName?: string;
}

export default function BottomSheetContainer({
  children,
  onClose,
  title = "",
  showClose = true,
  className = "",
  contentClassName = "",
}: BottomSheetContainerProps) {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [translateY, setTranslateY] = useState(
    typeof window !== "undefined" ? window.innerHeight : 0
  );
  const [isClosing, setIsClosing] = useState(false);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.body.style.overscrollBehaviorY = "contain";
    setTranslateY(window.innerHeight);
    const timer = setTimeout(() => setTranslateY(0), 10);
    return () => {
      clearTimeout(timer);
      document.body.style.overscrollBehaviorY = "";
    };
  }, []);

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLDivElement).closest(".bottom-sheet-header")) return;
    setTouchStart(e.targetTouches[0].clientY as number | null);
    setIsClosing(false);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null || isClosing) return;
    const currentTouch = e.targetTouches[0].clientY as number;
    const distance = currentTouch - touchStart;
    if (distance > 0) {
      setTranslateY(distance);
      if (distance > 150) {
        setIsClosing(true);
        setTranslateY(window.innerHeight);
        setTimeout(() => onClose && onClose(), 200);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null || isClosing) return;
    const endY = (e.changedTouches?.[0]?.clientY as number) ?? 0;
    const distance = endY - touchStart;
    if (distance > 150) {
      setIsClosing(true);
      setTranslateY(window.innerHeight);
      setTimeout(() => onClose && onClose(), 200);
    } else {
      setTranslateY(0);
    }
    setTouchStart(null);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && onClose) onClose();
  };

  const handleClose = () => {
    setIsClosing(true);
    setTranslateY(window.innerHeight);
    setTimeout(() => onClose && onClose(), 200);
  };

  const sheetContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-end justify-center md:justify-end w-full h-full bg-black/40"
      onClick={handleOverlayClick}
      style={{ pointerEvents: "auto" }}
    >
      <div
        ref={sheetRef}
        className={`bg-card md:border border-border flex flex-col w-full max-h-[80vh]  md:max-w-[400px] rounded-t-xl  overflow-hidden  bottom-0 md:bottom-0 md:right-2 fixed md:relative transition-transform duration-300 ease-in-out z-[99999] pointer-events-auto h-[90vh] md:h-auto md:max-h-screen ${className}`}
        style={{
          transform: `translateY(${translateY}px)`,
          transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        }}
        onClick={(e: React.MouseEvent<HTMLDivElement>) => e.stopPropagation()}
      >
        <div
          className="bottom-sheet-header"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="md:hidden w-12 h-1 bg-muted rounded-full mx-auto mt-3"></div>
          <div className="flex items-center justify-between px-4 p-2  border-b border-border">
            <div className="flex items-center gap-2">
              {title && (
                <span className="text-base text-foreground font-semibold">
                  {title}
                </span>
              )}
            </div>
            {showClose && (
              <Button
                variant={"secondary"}
                size="icon"
                onClick={handleClose}
                className="h-8 w-8"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        <div
          className={`flex-1 p-3 overflow-y-auto scrollbar-hide ${contentClassName}`}
        >
          {children}
        </div>
      </div>
    </div>
  );

  return typeof window !== "undefined"
    ? ReactDOM.createPortal(sheetContent, document.body)
    : null;
}