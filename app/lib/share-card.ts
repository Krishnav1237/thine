"use client";

interface ShareResultFeedback {
  shared: boolean;
  copied: boolean;
  downloaded: boolean;
  message: string;
}

async function blobFromCanvas(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
        return;
      }
      reject(new Error("Unable to generate image blob."));
    }, "image/png");
  });
}

async function copyTextToClipboard(value: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      textarea.style.pointerEvents = "none";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const success = document.execCommand("copy");
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
}

export async function generateShareImage(
  cardRef: React.RefObject<HTMLElement | null>
): Promise<Blob> {
  const node = cardRef.current;

  if (!node) {
    throw new Error("Share card not ready.");
  }

  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));

  const { default: html2canvas } = await import("html2canvas");
  const viewportIsCompact = window.matchMedia("(max-width: 720px)").matches;
  const deviceScale = window.devicePixelRatio || 1;
  const scale = viewportIsCompact
    ? Math.min(2, Math.max(1.6, deviceScale))
    : Math.min(2.4, Math.max(1.8, deviceScale));
  const canvas = await html2canvas(node, {
    backgroundColor: null,
    scale,
    useCORS: true,
    logging: false,
    windowWidth: node.scrollWidth,
    windowHeight: node.scrollHeight,
    scrollX: 0,
    scrollY: -window.scrollY,
    removeContainer: true,
  });

  return blobFromCanvas(canvas);
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function shareResult({
  cardRef,
  shareUrl,
  title,
  text,
  fileName,
}: {
  cardRef: React.RefObject<HTMLElement | null>;
  shareUrl: string;
  title: string;
  text: string;
  fileName: string;
}): Promise<ShareResultFeedback> {
  const imageBlob = await generateShareImage(cardRef);
  const file = new File([imageBlob], fileName, { type: "image/png" });

  if (
    typeof navigator !== "undefined" &&
    navigator.share &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] })
  ) {
    await navigator.share({
      title,
      text,
      url: shareUrl,
      files: [file],
    });

    return {
      shared: true,
      copied: false,
      downloaded: false,
      message: "Share sheet opened.",
    };
  }

  const copied = await copyTextToClipboard(shareUrl);
  downloadBlob(imageBlob, fileName);

  return {
    shared: false,
    copied,
    downloaded: true,
    message: copied ? "Link copied. Image downloaded." : "Image downloaded.",
  };
}
