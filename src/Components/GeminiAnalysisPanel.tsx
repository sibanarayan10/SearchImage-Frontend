import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  Camera,
  Palette,
  RefreshCw,
  Copy,
  Check,
  Send,
  X,
  MessageSquare,
  Sliders,
} from "lucide-react";
import { Spin, Tooltip } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  streamPhotoAnalysis,
  streamAskPhotoQuestion,
  StreamedAnalysisResult,
  ChatMessage,
  parseAnalysisMarkdown,
} from "../config/geminiService";

interface GeminiAnalysisPanelProps {
  imageUrl: string;
  imageTitle?: string;
  onClose: () => void;
}

export const GeminiAnalysisPanel: React.FC<GeminiAnalysisPanelProps> = ({
  imageUrl,
  onClose,
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Streaming text for Photo Insights
  const [streamedText, setStreamedText] = useState<string>("");
  const [analysisMeta, setAnalysisMeta] =
    useState<StreamedAnalysisResult | null>(null);

  // Active sub-tab: "insights" vs "chat"
  const [activeTab, setActiveTab] = useState<"insights" | "chat">("insights");

  // Chat Q&A state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [chatStreaming, setChatStreaming] = useState<boolean>(false);
  const [streamingChatAnswer, setStreamingChatAnswer] = useState<string>("");
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef<boolean>(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Run analysis when imageUrl is ready or changed
  useEffect(() => {
    if (!imageUrl) return;

    setStreamedText("");
    setAnalysisMeta(null);
    setChatMessages([]);
    setError(null);

    handleStreamAnalysis();
  }, [imageUrl]);

  useEffect(() => {
    if (activeTab === "chat") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, streamingChatAnswer, activeTab]);

  const handleStreamAnalysis = async () => {
    setLoading(true);
    setIsStreaming(true);
    setError(null);
    setStreamedText("");

    try {
      const result = await streamPhotoAnalysis(imageUrl, (chunkText) => {
        if (isMountedRef.current) {
          setStreamedText(chunkText);
          setLoading(false); // First chunk arrived, switch from spinner to stream
        }
      });

      if (isMountedRef.current) {
        setAnalysisMeta(result);
      }
    } catch (err: any) {
      if (isMountedRef.current) {
        const msg =
          err?.message || "Could not analyze image. Please try again.";
        setError(msg);
        toast.error(msg);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setIsStreaming(false);
      }
    }
  };

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.info(`Copied ${hex} to clipboard`);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  const handleAskQuestion = async (customPrompt?: string) => {
    const query = (customPrompt || question).trim();
    if (!query || chatStreaming) return;

    const userMsg: ChatMessage = {
      role: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setChatStreaming(true);
    setStreamingChatAnswer("");

    try {
      const finalAnswer = await streamAskPhotoQuestion(
        imageUrl,
        query,
        chatMessages,
        (chunk) => {
          if (isMountedRef.current) {
            setStreamingChatAnswer(chunk);
          }
        }
      );

      if (isMountedRef.current) {
        const modelMsg: ChatMessage = {
          role: "model",
          text: finalAnswer,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setChatMessages((prev) => [...prev, modelMsg]);
        setStreamingChatAnswer("");
      }
    } catch (err: any) {
      toast.error(err?.message || "Failed to get AI response");
    } finally {
      if (isMountedRef.current) {
        setChatStreaming(false);
        setStreamingChatAnswer("");
      }
    }
  };

  const quickPrompts = [
    "Instagram captions & hashtags",
    "How was the lighting achieved?",
    "Suggested camera settings",
    "Where was this likely taken?",
  ];

  // Derive dynamic metadata from streaming text if finished or in-progress
  const liveMeta = analysisMeta || (streamedText ? parseAnalysisMarkdown(streamedText) : null);

  // Format markdown paragraphs cleanly
  const renderFormattedMarkdown = (text: string) => {
    const lines = text.split("\n");
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      if (trimmed.startsWith("### ")) {
        return (
          <h4
            key={idx}
            className="text-xs font-semibold text-emerald-400 mt-3 mb-1 tracking-wide flex items-center gap-1.5"
          >
            {trimmed.replace("### ", "")}
          </h4>
        );
      }
      if (trimmed.startsWith("- **")) {
        const parts = trimmed.replace("- **", "").split("**:");
        return (
          <div key={idx} className="flex items-baseline gap-1 text-[11px] text-white/80 py-0.5">
            <span className="font-semibold text-white/90">{parts[0]}:</span>
            <span className="text-white/70">{parts[1] || ""}</span>
          </div>
        );
      }
      if (trimmed.startsWith("- #")) {
        return null; // Rendered in color swatches
      }
      if (trimmed.startsWith("#")) {
        return null; // Rendered in tags
      }
      if (!trimmed) {
        return <div key={idx} className="h-1.5" />;
      }
      return (
        <p key={idx} className="text-white/80 leading-relaxed text-xs">
          {trimmed}
        </p>
      );
    });
  };

  return (
    <div
      className="flex flex-col h-full text-white overflow-hidden bg-black/85 backdrop-blur-xl border-l border-white/10"
      style={{ width: 360 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Sparkles size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-wide">
              AI Photo Insights
            </h3>
            <p className="text-[11px] text-white/50">
              Composition, Lighting & Technique
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {streamedText && !isStreaming && (
            <Tooltip title="Re-analyze image">
              <button
                onClick={handleStreamAnalysis}
                disabled={loading || isStreaming}
                className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <RefreshCw size={15} />
              </button>
            </Tooltip>
          )}

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-white/5">
        <button
          onClick={() => setActiveTab("insights")}
          className={`flex-1 py-2 text-xs font-medium text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "insights"
              ? "border-emerald-400 text-emerald-300 bg-white/5"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <Sliders size={13} />
          Photo Insights
        </button>
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-2 text-xs font-medium text-center transition-colors border-b-2 flex items-center justify-center gap-1.5 ${
            activeTab === "chat"
              ? "border-emerald-400 text-emerald-300 bg-white/5"
              : "border-transparent text-white/60 hover:text-white"
          }`}
        >
          <MessageSquare size={13} />
          Ask AI ({chatMessages.length})
        </button>
      </div>

      {/* Body Content */}
      <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-4 text-xs scrollbar-thin">
        {/* Initial Spinner before the first chunk streams */}
        {loading && !streamedText && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Spin indicator={<LoadingOutlined style={{ fontSize: 26 }} spin />} />
            <div className="text-center">
              <p className="text-white font-medium text-xs">
                Analyzing photograph...
              </p>
              <p className="text-white/40 text-[11px] mt-0.5">
                Evaluating lighting, composition & color theory
              </p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !loading && !streamedText && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 space-y-2">
            <p className="font-medium text-xs">Analysis Unavailable</p>
            <p className="text-[11px] text-red-300/80 leading-relaxed">
              {error}
            </p>
            <div className="pt-1">
              <button
                onClick={handleStreamAnalysis}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-[11px] font-medium transition"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        )}

        {/* Insights Tab: Streaming or Rendered Output */}
        {activeTab === "insights" && (streamedText || isStreaming) && (
          <div className="space-y-4">
            {/* Live Streaming Content Box */}
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400 flex items-center gap-1.5">
                  <Sparkles size={12} />
                  Visual Analysis
                </span>
                {isStreaming && (
                  <span className="text-[10px] text-emerald-400 font-mono animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Streaming...
                  </span>
                )}
              </div>

              <div className="space-y-1">
                {renderFormattedMarkdown(streamedText)}
                {isStreaming && (
                  <span className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-0.5 animate-pulse" />
                )}
              </div>
            </div>

            {/* Dominant Color Palette */}
            {liveMeta && liveMeta.colorPalette.length > 0 && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center justify-between text-white/80 font-medium text-xs">
                  <div className="flex items-center gap-1.5">
                    <Palette size={14} className="text-pink-400" />
                    <span>Dominant Colors</span>
                  </div>
                  <span className="text-[10px] text-white/40">Click to copy</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {liveMeta.colorPalette.map((color, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleCopyHex(color.hex)}
                      className="flex items-center gap-2 p-1.5 rounded-lg bg-black/40 hover:bg-black/60 border border-white/5 transition-all text-left group"
                    >
                      <div
                        className="w-5 h-5 rounded-md shadow-sm border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: color.hex }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-medium text-white truncate leading-tight">
                          {color.name}
                        </p>
                        <p className="text-[10px] text-white/40 font-mono">
                          {color.hex}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity pr-1 text-white/60">
                        {copiedHex === color.hex ? (
                          <Check size={12} className="text-emerald-400" />
                        ) : (
                          <Copy size={12} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Estimated Camera Specs */}
            {liveMeta && (liveMeta.estimatedExif.camera || liveMeta.estimatedExif.lens || liveMeta.estimatedExif.aperture) && (
              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-white/80 font-medium text-xs">
                  <Camera size={14} className="text-emerald-400" />
                  <span>Estimated Camera Setup</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  {liveMeta.estimatedExif.camera && (
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-white/40 block text-[10px]">Camera</span>
                      <span className="text-white font-medium truncate block">
                        {liveMeta.estimatedExif.camera}
                      </span>
                    </div>
                  )}
                  {liveMeta.estimatedExif.lens && (
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-white/40 block text-[10px]">Lens</span>
                      <span className="text-white font-medium truncate block">
                        {liveMeta.estimatedExif.lens}
                      </span>
                    </div>
                  )}
                  {liveMeta.estimatedExif.aperture && (
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-white/40 block text-[10px]">Aperture</span>
                      <span className="text-white font-medium">
                        {liveMeta.estimatedExif.aperture}
                      </span>
                    </div>
                  )}
                  {liveMeta.estimatedExif.iso && (
                    <div className="bg-black/30 p-2 rounded-lg">
                      <span className="text-white/40 block text-[10px]">ISO</span>
                      <span className="text-white font-medium">
                        {liveMeta.estimatedExif.iso}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tags */}
            {liveMeta && liveMeta.tags.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-white/50">
                  Search & Aesthetic Tags
                </span>
                <div className="flex flex-wrap gap-1">
                  {liveMeta.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded bg-white/10 text-white/80 text-[11px]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Ask AI Tab: Chat with streaming replies */}
        {activeTab === "chat" && (
          <div className="flex flex-col h-full space-y-3">
            {chatMessages.length === 0 && !streamingChatAnswer ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mx-auto text-emerald-400">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h4 className="font-medium text-white text-xs">
                    Ask About This Photo
                  </h4>
                  <p className="text-white/50 text-[11px] mt-0.5">
                    Ask about camera setups, lighting, editing advice, or
                    social media captions.
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-1.5">
                  <span className="text-[10px] text-white/40 uppercase tracking-wider text-left">
                    Suggested Questions:
                  </span>
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleAskQuestion(prompt)}
                      className="text-left px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-[11px] text-white/80 hover:text-white transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      msg.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-emerald-500 text-black font-medium"
                          : "bg-white/10 text-white/90 border border-white/5"
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    <span className="text-[9px] text-white/30 px-1 mt-0.5">
                      {msg.timestamp}
                    </span>
                  </div>
                ))}

                {/* Live streaming chat response */}
                {chatStreaming && (
                  <div className="flex flex-col items-start">
                    <div className="max-w-[90%] px-3 py-2 rounded-xl text-xs leading-relaxed bg-white/10 text-white/90 border border-white/5">
                      <p className="whitespace-pre-wrap">
                        {streamingChatAnswer}
                        <span className="inline-block w-1.5 h-3 bg-emerald-400 ml-0.5 animate-pulse" />
                      </p>
                    </div>
                    <span className="text-[9px] text-white/30 px-1 mt-0.5">
                      Streaming response...
                    </span>
                  </div>
                )}

                <div ref={chatBottomRef} />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chat Input Bar */}
      {activeTab === "chat" && (
        <div className="p-3 border-t border-white/10 bg-white/5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskQuestion();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask anything about this photo..."
              disabled={chatStreaming}
              className="flex-1 bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400 transition-colors"
            />
            <button
              type="submit"
              disabled={chatStreaming || !question.trim()}
              className="p-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-40 disabled:hover:bg-emerald-500 text-black font-semibold transition-colors flex-shrink-0"
            >
              <Send size={14} />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
