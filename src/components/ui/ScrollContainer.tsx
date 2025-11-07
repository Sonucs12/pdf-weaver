import { useEffect, useState, useRef, ReactNode, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowBigDown } from "lucide-react";

interface ScrollContainerProps {
  children: ReactNode;
  viewAll: boolean;
  onScrollToBottom?: () => void;
  autoScrollEnabled?: boolean;
  scrollRef?: React.RefObject<HTMLDivElement>;
  useWindowScroll?: boolean; // New prop to determine scroll context
  containerClassName?: string; // Custom classes for the container
}

const ScrollContainer: React.FC<ScrollContainerProps> = ({
  children,
  viewAll,
  onScrollToBottom,
  autoScrollEnabled = true,
  scrollRef,
  useWindowScroll = false,
  containerClassName = "",
}) => {
  const internalRef = useRef<HTMLDivElement>(null);
  const containerRef = scrollRef || internalRef;
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [showScrollArrow, setShowScrollArrow] = useState(false);
  const [manualScrollActive, setManualScrollActive] = useState(false);

  // Helpers to get scroll values
  const getScrollTop = useCallback((): number => {
    if (useWindowScroll) {
      return window.pageYOffset || document.documentElement.scrollTop;
    }
    return containerRef.current?.scrollTop || 0;
  }, [useWindowScroll, containerRef]);

  const getClientHeight = useCallback((): number => {
    if (useWindowScroll) {
      return window.innerHeight;
    }
    return containerRef.current?.clientHeight || 0;
  }, [useWindowScroll, containerRef]);

  const getScrollHeight = useCallback((): number => {
    if (useWindowScroll) {
      return document.documentElement.scrollHeight;
    }
    return containerRef.current?.scrollHeight || 0;
  }, [useWindowScroll, containerRef]);

  const isAtBottom = useCallback((): boolean => {
    const scrollTop = getScrollTop();
    const clientHeight = getClientHeight();
    const scrollHeight = getScrollHeight();
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    return distanceFromBottom < 100;
  }, [getScrollTop, getClientHeight, getScrollHeight]);

  const handleUserScroll = useCallback(() => {
    if (!manualScrollActive && !isAtBottom()) {
      setManualScrollActive(true);
    }
  }, [manualScrollActive, isAtBottom]);

  const scrollTo = useCallback((top: number) => {
    if (useWindowScroll) {
      window.scrollTo({ top, behavior: "smooth" });
    } else if (containerRef.current) {
      containerRef.current.scrollTo({ top, behavior: "smooth" });
    }
  }, [useWindowScroll, containerRef]);

  const handleScrollToBottom = useCallback(() => {
    setManualScrollActive(false);
    if (onScrollToBottom) {
      onScrollToBottom();
    }
  }, [onScrollToBottom]);

  const handleScrollArrowClick = () => {
    if (scrollDirection === "down") {
      scrollTo(getScrollHeight());
      handleScrollToBottom();
    } else {
      scrollTo(0);
    }
  };

  // Detect when user reaches bottom
  useEffect(() => {
    if (!viewAll) return;

    const handleScroll = () => {
      if (isAtBottom()) {
        handleScrollToBottom();
      }
    };

    if (useWindowScroll) {
      window.addEventListener("scroll", handleScroll);
      return () => window.removeEventListener("scroll", handleScroll);
    } else {
      const node = containerRef.current;
      if (node) {
        node.addEventListener("scroll", handleScroll);
        return () => node.removeEventListener("scroll", handleScroll);
      }
    }
  }, [viewAll, isAtBottom, handleScrollToBottom, useWindowScroll, containerRef]);

  // Show/hide scroll arrow and detect scroll direction
  useEffect(() => {
    if (!viewAll) {
      setShowScrollArrow(false);
      return;
    }

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
        if (distanceFromBottom < 20) {
          handleScrollToBottom();
        }
      }

      if (scrollTop > lastScrollTop) {
        setScrollDirection("down");
      } else if (scrollTop < lastScrollTop) {
        setScrollDirection("up");
      }

      lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    };

    if (useWindowScroll) {
      window.addEventListener("scroll", handleScroll);
      window.addEventListener("wheel", handleUserScroll);
      window.addEventListener("touchmove", handleUserScroll);
      return () => {
        window.removeEventListener("scroll", handleScroll);
        window.removeEventListener("wheel", handleUserScroll);
        window.removeEventListener("touchmove", handleUserScroll);
      };
    } else {
      const node = containerRef.current;
      if (node) {
        node.addEventListener("scroll", handleScroll);
        node.addEventListener("wheel", handleUserScroll);
        node.addEventListener("touchmove", handleUserScroll);
        return () => {
          node.removeEventListener("scroll", handleScroll);
          node.removeEventListener("wheel", handleUserScroll);
          node.removeEventListener("touchmove", handleUserScroll);
        };
      }
    }
  }, [
    viewAll,
    getScrollTop,
    getClientHeight,
    getScrollHeight,
    handleScrollToBottom,
    handleUserScroll,
    useWindowScroll,
    containerRef,
  ]);

  // Auto-scroll when content updates
  useEffect(() => {
    if (viewAll && autoScrollEnabled && !manualScrollActive) {
      scrollTo(getScrollHeight());
    }
  }, [viewAll, autoScrollEnabled, manualScrollActive, scrollTo, getScrollHeight]);

  // Determine container classes
  const containerClasses = useWindowScroll
    ? containerClassName
    : `relative ${containerClassName}`;

  // Determine button position classes
  const buttonPositionClasses = useWindowScroll ? "fixed" : "absolute";

  return (
    <div className={containerClasses} ref={useWindowScroll ? undefined : containerRef}>
      {children}

      {showScrollArrow && (
        <button
          onClick={handleScrollArrowClick}
          className={`${buttonPositionClasses} md:bottom-10 bottom-5 md:right-10 right-2 bg-blue-600/50 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50 transition-opacity text-md`}
          aria-label={scrollDirection === "down" ? "Scroll to bottom" : "Scroll to top"}
        >
          <motion.div
            animate={{ rotate: scrollDirection === "down" ? 0 : 180 }}
            transition={{ duration: 0.3 }}
          >
            <ArrowBigDown className="w-4 h-4" />
          </motion.div>
        </button>
      )}
    </div>
  );
};

export default ScrollContainer;