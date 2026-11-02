import * as pdfjsLib from "pdfjs-dist";

// Configure pdfjs worker using unpkg or cdnjs bundle if workerSrc needed
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "txt") {
    return await file.text();
  }

  if (extension === "pdf") {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      let fullText = "";

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => ("str" in item ? item.str : ""))
          .join(" ");
        fullText += pageText + "\n\n";
      }

      if (fullText.trim().length > 0) {
        return fullText.trim();
      }
    } catch (err) {
      console.warn("Failed with PDF.js worker, attempting fallback text extraction", err);
    }
  }

  // Fallback for docx or non-standard pdf: read raw text and extract ASCII strings
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let asciiText = "";
  for (let i = 0; i < bytes.length; i++) {
    const code = bytes[i];
    if ((code >= 32 && code <= 126) || code === 10 || code === 13) {
      asciiText += String.fromCharCode(code);
    } else {
      asciiText += " ";
    }
  }

  // Clean continuous whitespace
  const cleaned = asciiText
    .replace(/[ ]{2,}/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 15)
    .join("\n");

  if (cleaned.length > 50) {
    return cleaned;
  }

  return await file.text();
}
