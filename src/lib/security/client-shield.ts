export interface BrowserIntegrityResult {
  isSuspicious: boolean;
  score: number;
  reasons: string[];
}

export function evaluateBrowserIntegrity(): BrowserIntegrityResult {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return { isSuspicious: false, score: 0, reasons: [] };
  }

  const win = window as any;
  const nav = navigator as any;
  const reasons: string[] = [];
  let score = 0;

  // 1. Direct webdriver flag
  if (nav.webdriver === true) {
    score += 80;
    reasons.push("navigator.webdriver is true");
  }

  // 2. Automation frameworks hooks
  if (
    win.__puppeteer_eval ||
    win.__playwright ||
    win._phantom ||
    win.__nightmare ||
    win.callPhantom
  ) {
    score += 90;
    reasons.push("Automation runtime global detected");
  }

  // 3. Languages array check
  if (!nav.languages || nav.languages.length === 0) {
    score += 40;
    reasons.push("Missing navigator.languages");
  }

  // 4. WebGL GPU vendor inspection
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) {
        const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "";
        if (/llvmpipe|swiftshader|mesa/i.test(renderer)) {
          score += 60;
          reasons.push(`Headless/Software GPU detected: ${renderer}`);
        }
      }
    }
  } catch {
    // Non-fatal if canvas context is restricted
  }

  return {
    isSuspicious: score >= 60,
    score,
    reasons,
  };
}
