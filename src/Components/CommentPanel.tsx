import { Spin } from "antd";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { LoadingOutlined } from "@ant-design/icons";
import api from "../config/Security";

interface CommentItem {
  commentId: number;
  userId: number;
  username: string;
  userImg: string | null;
  comment: string;
  createdOn: string;
}

interface CommentPanelProps {
  imageId: number;
  onClose: () => void;
  onComment: (val: boolean) => void;
}

export const CommentPanel: React.FC<CommentPanelProps> = ({
  imageId,
  onClose,
  onComment,
}) => {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [text, setText] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  // fetch comments only when the panel opens
  useEffect(() => {
    if (!imageId) return;
    setLoading(true);
    api
      .get(`${import.meta.env.VITE_BACKEND_URL}/images/${imageId}/comments`, {
        withCredentials: true,
        validateStatus: (s: any) => s > 0,
      })
      .then((res: any) => {
        setComments(res.data || []);
      })
      .catch(() => toast.error("Could not load comments"))
      .finally(() => setLoading(false));
  }, [imageId]);

  // scroll to bottom after comments load
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/images/${imageId}/comments`,
        { comment: text.trim() },
        { withCredentials: true, validateStatus: (s) => s > 0 }
      );
      if (res.status === 401) {
        toast.warn("Sign-in to comment");
        return;
      }
      onComment(true);
      const newComment: CommentItem = {
        commentId: res.data?.commentId ?? Date.now(),
        username: res.data?.username ?? "You",
        userImg: res.data?.userImg ?? null,
        comment: text.trim(),
        createdOn: new Date().toISOString(),
        userId: res.data?.userId,
      };
      setComments((prev) => [...prev, newComment]);
      setText("");
    } catch {
      toast.error("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const fmt = (iso: string): string => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  return (
    <div
      className="flex flex-col h-full"
      style={{ width: 320 }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 flex-shrink-0">
        <span className="text-white font-semibold text-sm flex items-center gap-2">
          <MessageCircle size={15} className="text-white/60" />
          Comments
          {comments.length > 0 && (
            <span className="text-xs text-white/40">({comments.length})</span>
          )}
        </span>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-white/10 text-white/50 hover:text-white transition-all"
        >
          <X size={15} />
        </button>
      </div>

      {/* Comment list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4 scrollBar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Spin
              indicator={<LoadingOutlined spin style={{ color: "#fff" }} />}
            />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-center">
            <MessageCircle size={28} className="text-white/20" />
            <p className="text-white/30 text-sm">No comments yet</p>
            <p className="text-white/20 text-xs">Be the first to comment</p>
          </div>
        ) : (
          comments.map((c) => (
            <div key={c.commentId} className="flex gap-2.5 items-start group">
              <img
                src={c.userImg || "./person.png"}
                alt=""
                className="h-7 w-7 rounded-full border border-white/20 flex-shrink-0 mt-0.5 object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2 mb-0.5">
                  <span className="text-white text-xs font-semibold truncate">
                    {c.username}
                  </span>
                  <span className="text-white/30 text-[10px] flex-shrink-0">
                    {fmt(c.createdOn)}
                  </span>
                </div>
                <p className="text-white/80 text-xs leading-relaxed break-words">
                  {c.comment}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-3 border-t border-white/10 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment…"
          maxLength={200}
          className="flex-1 border border-white/15 rounded-full px-3 py-2 text-xs text-white placeholder:text-white/30 outline-none focus:border-white/40 transition-all"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
        <button
          type="submit"
          disabled={submitting || !text.trim()}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
        >
          {submitting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Send size={14} />
          )}
        </button>
      </form>
    </div>
  );
};
