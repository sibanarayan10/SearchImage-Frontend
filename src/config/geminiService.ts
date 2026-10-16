import axios from "axios";

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface EstimatedExif {
  camera?: string;
  lens?: string;
  aperture?: string;
  iso?: string;
  shutterSpeed?: string;
}

export interface StreamedAnalysisResult {
  rawMarkdown: string;
  colorPalette: ColorSwatch[];
  estimatedExif: EstimatedExif;
  tags: string[];
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
  timestamp: string;
}

// In-memory session cache so previously analyzed images load in 0ms
const analysisCache = new Map<string, StreamedAnalysisResult>();

/**
 * Returns the environment API key.
 * User-provided keys in UI are completely disabled.
 */
export const getGeminiApiKey = (): string => {
  return import.meta.env.VITE_GEMINI_API_KEY?.trim() || "";
};

/**
 * Downloads the image as a Blob and converts to a downscaled Base64 JPEG.
 * Uses local ObjectURL to avoid any CORS/canvas taint issues.
 */
export const urlToBase64 = async (
  imageUrl: string,
  maxDimension = 800,
  timeoutMs = 15000
): Promise<{ mimeType: string; data: string }> => {
  const downloadBlob = async (): Promise<Blob> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const separator = imageUrl.includes("?") ? "&" : "?";
      const corsUrl = `${imageUrl}${separator}t=${Date.now()}`;

      const res = await fetch(corsUrl, {
        mode: "cors",
        signal: controller.signal,
      });

      if (res.ok) {
        return await res.blob();
      }
      throw new Error(`Fetch failed with status ${res.status}`);
    } catch {
      try {
        const res = await axios.get(imageUrl, {
          responseType: "blob",
          signal: controller.signal,
          timeout: timeoutMs,
        });
        return res.data;
      } catch (axiosErr: any) {
        throw new Error(
          axiosErr?.message || "Could not retrieve image data for analysis."
        );
      }
    } finally {
      clearTimeout(timer);
    }
  };

  const blob = await downloadBlob();

  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(blob);
    const img = new window.Image();

    const renderTimer = setTimeout(() => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Image processing timed out. Please try again."));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(renderTimer);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = Math.max(width, 1);
        canvas.height = Math.max(height, 1);

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          throw new Error("Unable to initialize canvas context");
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        const base64Data = dataUrl.split(",")[1];
        URL.revokeObjectURL(objectUrl);

        resolve({
          mimeType: "image/jpeg",
          data: base64Data,
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    img.onerror = () => {
      clearTimeout(renderTimer);
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to decode image file."));
    };

    img.src = objectUrl;
  });
};

const GEMINI_MODELS = [
  "gemini-3.5-flash",
  "gemini-3.8-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
];

/**
 * Extracts color hex codes, tags, and camera specs from streamed markdown
 */
export const parseAnalysisMarkdown = (text: string): {
  colorPalette: ColorSwatch[];
  estimatedExif: EstimatedExif;
  tags: string[];
} => {
  const colors: ColorSwatch[] = [];
  const colorRegex = /(#[A-Fa-f0-9]{6})\b(?:\s*[-–—:]\s*([A-Za-z\s]+))?/g;
  let match: RegExpExecArray | null;

  while ((match = colorRegex.exec(text)) !== null) {
    const hex = match[1];
    const name = match[2]?.trim() || "Tone";
    if (!colors.some((c) => c.hex.toLowerCase() === hex.toLowerCase())) {
      colors.push({ hex, name });
    }
    if (colors.length >= 5) break;
  }

  const tags: string[] = [];
  const tagRegex = /#([a-zA-Z0-9_\u00C0-\u017F]+)/g;
  while ((match = tagRegex.exec(text)) !== null) {
    const tag = match[1].toLowerCase();
    if (!tags.includes(tag)) {
      tags.push(tag);
    }
  }

  const exif: EstimatedExif = {};
  const cameraMatch = text.match(/(?:Camera|Gear|Sensor):\s*([^\n\r*]+)/i);
  if (cameraMatch) exif.camera = cameraMatch[1].trim();

  const lensMatch = text.match(/(?:Lens|Focal Length):\s*([^\n\r*]+)/i);
  if (lensMatch) exif.lens = lensMatch[1].trim();

  const apertureMatch = text.match(/(?:Aperture):\s*([^\n\r*]+)/i);
  if (apertureMatch) exif.aperture = apertureMatch[1].trim();

  const isoMatch = text.match(/(?:ISO):\s*([^\n\r*]+)/i);
  if (isoMatch) exif.iso = isoMatch[1].trim();

  const shutterMatch = text.match(/(?:Shutter(?:\s*Speed)?):\s*([^\n\r*]+)/i);
  if (shutterMatch) exif.shutterSpeed = shutterMatch[1].trim();

  return { colorPalette: colors, estimatedExif: exif, tags };
};

/**
 * Streams photo analysis using Server-Sent Events (SSE)
 */
export const streamPhotoAnalysis = async (
  imageUrl: string,
  onChunk: (text: string) => void
): Promise<StreamedAnalysisResult> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("AI service is currently not configured.");
  }

  // Check cache first
  if (analysisCache.has(imageUrl)) {
    const cached = analysisCache.get(imageUrl)!;
    onChunk(cached.rawMarkdown);
    return cached;
  }

  const { mimeType, data } = await urlToBase64(imageUrl);

  const prompt = `You are a world-class photography director and art critic.
Analyze this photograph thoroughly and write a compelling, beautifully structured analysis using clear markdown headings:

### Visual Synopsis
Write a captivating 1-2 sentence description capturing the core subject, emotional mood, and setting.

### Composition & Framing
Provide detailed insights on composition, angle, perspective, balance, leading lines, and rule of thirds.

### Lighting & Atmosphere
Analyze lighting quality (natural vs artificial, direction, contrast, shadows, and mood).

### Estimated Camera Setup
- **Camera:** [Estimated camera or sensor type]
- **Lens:** [Estimated focal length, e.g. 35mm Prime, 85mm Portrait]
- **Aperture:** [e.g. f/1.8 or f/8]
- **ISO:** [e.g. ISO 100 or ISO 400]
- **Shutter:** [e.g. 1/500s or 1/60s]

### Dominant Color Tones
List 3 to 4 dominant colors in this exact format:
- #HEXCODE Color Name
- #HEXCODE Color Name
- #HEXCODE Color Name

### Aesthetic Tags
Include 5-8 relevant hashtags like #moody #minimalism #nature`;

  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error(`Model ${model} returned HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, "");
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const textChunk =
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (textChunk) {
              accumulatedText += textChunk;
              onChunk(accumulatedText);
            }
          } catch {
            // ignore partial JSON chunk
          }
        }
      }

      if (accumulatedText.trim()) {
        const meta = parseAnalysisMarkdown(accumulatedText);
        const result: StreamedAnalysisResult = {
          rawMarkdown: accumulatedText,
          colorPalette: meta.colorPalette,
          estimatedExif: meta.estimatedExif,
          tags: meta.tags,
        };
        analysisCache.set(imageUrl, result);
        return result;
      }
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw new Error(
    lastError?.message || "Could not generate insights at this moment."
  );
};

/**
 * Streams follow-up Q&A responses token by token
 */
export const streamAskPhotoQuestion = async (
  imageUrl: string,
  question: string,
  chatHistory: ChatMessage[] = [],
  onChunk: (text: string) => void
): Promise<string> => {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("AI service is currently not configured.");
  }

  const { mimeType, data } = await urlToBase64(imageUrl);

  const historyContext = chatHistory
    .slice(-4)
    .map((msg) => `${msg.role.toUpperCase()}: ${msg.text}`)
    .join("\n");

  const prompt = `You are an expert photography and visual AI assistant.
The user is viewing the provided photograph and asking a question about it.
Provide a clear, engaging, and professional response.

${historyContext ? `Previous conversation:\n${historyContext}\n` : ""}
User question: "${question}"`;

  let lastError: any = null;

  for (const model of GEMINI_MODELS) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse&key=${apiKey}`;
      const payload = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.6,
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let accumulatedText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith("data:")) continue;
          const jsonStr = trimmed.replace(/^data:\s*/, "");
          if (!jsonStr) continue;

          try {
            const parsed = JSON.parse(jsonStr);
            const textChunk =
              parsed?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (textChunk) {
              accumulatedText += textChunk;
              onChunk(accumulatedText);
            }
          } catch {
            // ignore
          }
        }
      }

      if (accumulatedText.trim()) {
        return accumulatedText;
      }
    } catch (err: any) {
      lastError = err;
      continue;
    }
  }

  throw new Error(lastError?.message || "Failed to generate answer.");
};
