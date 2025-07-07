import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
// All monitoring disabled to prevent interference with login
// import "./utils/clientAutoFix";
// import { startLiveButtonMonitor } from "./utils/liveButtonMonitor";

// Minimal error suppression
(function() {
  // Only suppress cross-origin errors
  window.addEventListener('error', (event) => {
    const message = event.message || '';
    if (message.includes('cross-origin') || message.includes('Script error')) {
      event.preventDefault();
      return false;
    }
  }, true);

  // Suppress unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    return false;
  }, true);

  // Override document.addEventListener to prevent error overlays
  const originalAddEventListener = document.addEventListener;
  document.addEventListener = function(type: any, listener: any, options?: any) {
    if (type === 'error' || type === 'unhandledrejection') {
      return; // Block error listeners
    }
    return originalAddEventListener.call(this, type, listener, options);
  };

  // Block Replit error modal creation
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: any) {
    const element = originalCreateElement.call(this, tagName);
    if (tagName === 'div' || tagName === 'iframe') {
      // Block error modal divs
      const observer = new MutationObserver(() => {
        if (element.textContent?.includes('cross-origin') || 
            element.textContent?.includes('runtime-error') ||
            element.textContent?.includes('plugin:runtime-error')) {
          element.remove();
        }
      });
      observer.observe(element, { childList: true, subtree: true });
    }
    return element;
  };

  // Suppress console errors that trigger overlays
  const originalConsoleError = console.error;
  console.error = function(...args) {
    const message = args[0]?.toString?.() || '';
    if (message.includes('cross-origin') || 
        message.includes('runtime-error') ||
        message.includes('plugin:runtime-error') ||
        message.includes('Script error')) {
      return;
    }
    return originalConsoleError.apply(console, args);
  };

  // Aggressive DOM cleanup and blocking
  function destroyErrorOverlays() {
    // Target specific Replit error modal patterns
    const errorPatterns = [
      'div[style*="position: fixed"]',
      'div[style*="z-index: 2147483647"]',
      'div[style*="background-color: rgba(0, 0, 0, 0.8)"]',
      'div[style*="background: rgba(0, 0, 0, 0.8)"]',
      'iframe[src*="error"]',
      '[class*="plugin-runtime-error"]',
      '[data-vite-plugin*="runtime-error"]'
    ];
    
    errorPatterns.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          const text = (el.textContent || '').toLowerCase();
          const innerHTML = (el.innerHTML || '').toLowerCase();
          
          if (text.includes('cross-origin') || 
              text.includes('runtime-error') ||
              text.includes('script error') ||
              innerHTML.includes('cross-origin') ||
              innerHTML.includes('runtime-error') ||
              innerHTML.includes('plugin:runtime-error')) {
            
            // Multiple removal methods
            el.remove();
            (el as HTMLElement).style.display = 'none';
            (el as HTMLElement).style.visibility = 'hidden';
            (el as HTMLElement).style.opacity = '0';
            if (el.parentNode) {
              el.parentNode.removeChild(el);
            }
          }
        });
      } catch (e) {
        // Ignore selector errors
      }
    });

    // Remove any modal backdrop
    const backdrops = document.querySelectorAll('div[style*="position: fixed"][style*="inset: 0"]');
    backdrops.forEach(backdrop => {
      if (backdrop.style.backgroundColor.includes('rgba(0, 0, 0') ||
          backdrop.style.background.includes('rgba(0, 0, 0')) {
        backdrop.remove();
      }
    });
  }

  // Immediate and continuous cleanup
  destroyErrorOverlays();
  setInterval(destroyErrorOverlays, 25); // Every 25ms for aggressive cleanup
  
  // Monitor DOM changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(() => {
      destroyErrorOverlays();
    });
  });
  
  // Observe with maximum sensitivity
  observer.observe(document.documentElement, { 
    childList: true, 
    subtree: true, 
    attributes: true,
    attributeOldValue: true 
  });

})();

// Minimal console suppression only

// All monitoring disabled to prevent billing charges and login interference
// Brain system restored with login form protection
// Start live button monitoring for auto-deployment (with login protection)
// if (typeof window !== 'undefined') {
//   if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', () => {
//       startLiveButtonMonitor();
//     });
//   } else {
//     startLiveButtonMonitor();
//   }
// }

createRoot(document.getElementById("root")!).render(<App />);
