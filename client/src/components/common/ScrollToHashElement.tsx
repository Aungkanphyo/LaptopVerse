import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToHashElement = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;

    let targetId = "";
    try {
      targetId = decodeURIComponent(hash.replace("#", ""));
    } catch (error) {
      console.error("Invalid URL Hash format:", error);
      return;
    }

    const scrollToAndFocusElement = (): boolean => {
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });

        if (!element.hasAttribute("tabindex")) {
          element.setAttribute("tabindex", "-1");
        }
        element.focus({ preventScroll: true });

        return true;
      }
      return false;
    };

    if (scrollToAndFocusElement()) return;

    const observer = new MutationObserver(() => {
      if (scrollToAndFocusElement()) {
        observer.disconnect();
        clearTimeout(timeoutId);
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
    const timeoutId = setTimeout(() => {
      observer.disconnect();
    }, 3000);

    return () => {
      observer.disconnect();
      clearTimeout(timeoutId);
    };
  }, [hash, pathname]);

  return null;
};

export default ScrollToHashElement;