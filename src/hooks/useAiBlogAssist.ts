import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AiAction = "generate" | "enhance" | "summarize" | "suggest-tags" | "suggest-slug" | "write-bio" | "enhance-bio";

interface UseAiBlogAssistReturn {
  loading: boolean;
  error: string | null;
  run: (params: {
    action: AiAction;
    title?: string;
    tags?: string;
    content?: string;
  }) => Promise<string | null>;
}

export function useAiBlogAssist(): UseAiBlogAssistReturn {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async (params: {
    action: AiAction;
    title?: string;
    tags?: string;
    content?: string;
  }): Promise<string | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke("ai-blog-assist", {
        body: params,
      });

      if (fnError) {
        setError(fnError.message || "AI request failed.");
        return null;
      }

      if (data?.error) {
        setError(data.error);
        return null;
      }

      return data?.result ?? null;
    } catch (err) {
      setError(String(err));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, error, run };
}
