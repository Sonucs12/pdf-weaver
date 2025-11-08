import { useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowBigDown } from "lucide-react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
import { useIsMobile } from "@/hooks/use-mobile";

interface ScrollContainerProps {
  children: ReactNode;
  scrollType: "div" | "window";
  scrollRef?: React.RefObject<HTMLDivElement>;
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  scrollType: propScrollType,
  scrollRef,
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollRef || internalRef;
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const isMobile = useIsMobile();
  const scrollType = isMobile && propScrollType === 'div' ? 'window' : propScrollType;

  const getScrollTop = useCallback((): number => {
    if (scrollType === "window") {
      return window.pageYOffset || document.documentElement.scrollTop;
    }
    return containerRef.current?.scrollTop || 0;
  }, [scrollType, containerRef]);

  const getClientHeight = useCallback((): number => {
    if (scrollType === "window") {
      return window.innerHeight;
    }
    return containerRef.current?.clientHeight || 0;
  }, [scrollType, containerRef]);

  const getScrollHeight = useCallback((): number => {
    if (scrollType === "window") {
      return document.documentElement.scrollHeight;
    }
    return containerRef.current?.scrollHeight || 0;
  }, [scrollType, containerRef]);

  const scrollTo = useCallback((top: number) => {
    if (scrollType === "window") {
      window.scrollTo({ top, behavior: "smooth" });
    } else if (containerRef.current) {
      containerRef.current.scrollTo({ top, behavior: "smooth" });
    }
  }, [scrollType, containerRef]);

  const handleScrollArrowClick = () => {
    if (scrollDirection === "down") {
      scrollTo(getScrollHeight());
    } else {
      scrollTo(0);
    }
  };

  useEffect(() => {
    let lastScrollTop = getScrollTop();

    const handleScroll = () => {
      const scrollTop = getScrollTop();
      const clientHeight = getClientHeight();
      const scrollHeight = getScrollHeight();
      const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

      if (scrollTop > 100 || distanceFromBottom > 100) {
        setShowScrollArrow(true);
      } else {
        setShowScrollArrow(false);
      }

      if (scrollTop > lastScrollTop) {
        setScrollDirection("down");
      } else if (scrollTop < lastScrollTop) {
        setScrollDirection("up");
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    const scrollElement = scrollType === "window" ? window : containerRef.current;
    if (scrollElement) {
      scrollElement.addEventListener("scroll", handleScroll);
      return () => scrollElement.removeEventListener("scroll", handleScroll);
    }
  }, [getScrollTop, getClientHeight, getScrollHeight, scrollType, containerRef]);

  useEffect(() => {
    if (scrollRef?.current) {
        const resizeObserver = new ResizeObserver(() => {
            scrollTo(getScrollHeight());
        });
        resizeObserver.observe(scrollRef.current);
        return () => resizeObserver.disconnect();
    }
  }, [scrollRef, getScrollHeight, scrollTo]);

  return (
    <div
      className={`relative${scrollType === 'div' ? ' overflow-y-auto h-full' : ''}`}
      ref={scrollType === 'div' ? containerRef : undefined}
    >
      {children}

      {showScrollArrow && (
        <button
          onClick={handleScrollArrowClick}
          className={`fixed md:bottom-10 bottom-20 md:right-10 right-2 bg-blue-600/90 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-opacity text-md`}
          aria-label={scrollDirection === 'down' ? 'Scroll to bottom' : 'Scroll to top'}
        >
          <motion.div
            animate={{ rotate: scrollDirection === 'down' ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <IoIosArrowDown className="w-4 h-4" />
          </motion.div>
        </button>
      )}
    </div>
  );
};

export default ScrollContainer;