import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Trash2, RotateCcw, FileText, FolderGit2, Sparkles,
  Award, GitCommitVertical, AlertTriangle, Loader2, RefreshCw,
} from "lucide-react";
import {
  loadRecycleBin, restoreRecycleBinItem, permanentlyDelete,
  emptyRecycleBin, type RecycleBinItem,
} from "@/lib/content";

const TYPE_META: Record<RecycleBinItem["itemType"], { label: string; icon: typeof FileText; color: string }> = {
  blog_post:       { label: "Writeup",     icon: FileText,         color: "text-saber-blue" },
  project:         { label: "Project",     icon: FolderGit2,       color: "text-saber-purple" },
  skill:           { label: "Skill",       icon: Sparkles,         color: "text-amber-400" },
  certification:   { label: "Certificate", icon: Award,            color: "text-green-400" },
  timeline_entry:  { label: "Timeline",    icon: GitCommitVertical, color: "text-muted-foreground" },
  media:           { label: "Media",       icon: FileText,         color: "text-muted-foreground" },
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function daysLeft(iso: string): number {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
}

const AdminRecycleBin = () => {
  const [items, setItems] = useState<RecycleBinItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<RecycleBinItem["itemType"] | "all">("all");
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [emptying, setEmptying] = useState(false);

  const load = async () => {
    setLoading(true);
    setItems(await loadRecycleBin());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRestore = async (item: RecycleBinItem) => {
    setRestoringId(item.id);
    const ok = await restoreRecycleBinItem(item);
    if (ok) {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    }
    setRestoringId(null);
  };

  const handlePermanentDelete = async (id: string) => {
    if (!confirm("Permanently delete this item? It cannot be recovered.")) return;
    setDeletingId(id);
    await permanentlyDelete(id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeletingId(null);
  };

  const handleEmptyBin = async () => {
    if (!confirm(`Permanently delete all ${items.length} item${items.length !== 1 ? "s" : ""}? This cannot be undone.`)) return;
    setEmptying(true);
    await emptyRecycleBin();
    setItems([]);
    setEmptying(false);
  };

  const filtered = filter === "all" ? items : items.filter((i) => i.itemType === filter);

  const typeCounts = items.reduce((acc, i) => {
    acc[i.itemType] = (acc[i.itemType] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <AdminLayout title="Recycle Bin">
      <div className="space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-sm text-muted-foreground">
              Deleted items are kept for <span className="text-foreground">30 days</span> before being permanently removed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="saber-border gap-1.5"
              onClick={load} disabled={loading}>
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            {items.length > 0 && (
              <Button variant="destructive" size="sm" className="gap-1.5"
                onClick={handleEmptyBin} disabled={emptying}>
                {emptying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                Empty bin
              </Button>
            )}
          </div>
        </div>

        {/* Filter tabs */}
        {items.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {(["all", "blog_post", "project", "skill", "certification", "timeline_entry"] as const).map((type) => {
              const count = type === "all" ? items.length : (typeCounts[type] ?? 0);
              if (type !== "all" && count === 0) return null;
              const meta = type === "all" ? null : TYPE_META[type];
              return (
                <button key={type} onClick={() => setFilter(type)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs uppercase tracking-[0.2em] font-mono transition-colors ${
                    filter === type
                      ? "border-saber-blue/60 text-saber-blue bg-saber-blue/10"
                      : "border-border/60 text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                  }`}>
                  {meta && <meta.icon className={`h-3.5 w-3.5 ${meta.color}`} />}
                  {type === "all" ? "All" : meta?.label}
                  <span className="ml-1 opacity-60">({count})</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Items list */}
        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="saber-card h-20 animate-pulse bg-muted/20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="saber-card p-16 flex flex-col items-center justify-center text-center gap-4">
            <Trash2 className="h-10 w-10 text-muted-foreground/20" strokeWidth={1} />
            <div>
              <p className="font-display text-lg font-semibold">Bin is empty</p>
              <p className="text-sm text-muted-foreground mt-1">
                {filter === "all" ? "No deleted items." : `No deleted ${TYPE_META[filter]?.label.toLowerCase()}s.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((item) => {
              const meta = TYPE_META[item.itemType];
              const Icon = meta.icon;
              const days = daysLeft(item.expiresAt);
              const isExpiringSoon = days <= 3;

              return (
                <div key={item.id} className="saber-card p-5 flex items-center gap-4">
                  {/* Type icon */}
                  <div className="h-10 w-10 rounded-lg saber-border flex items-center justify-center shrink-0">
                    <Icon className={`h-4 w-4 ${meta.color}`} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold truncate">{item.itemTitle}</p>
                      <span className={`text-[9px] font-mono uppercase tracking-[0.2em] px-1.5 py-0.5 rounded border ${meta.color} border-current opacity-60`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span>Deleted {timeAgo(item.deletedAt)}</span>
                      <span className={`flex items-center gap-1 ${isExpiringSoon ? "text-destructive" : ""}`}>
                        {isExpiringSoon && <AlertTriangle className="h-3 w-3" />}
                        {days === 0 ? "Expires today" : `${days}d left`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" className="saber-border gap-1.5"
                      onClick={() => handleRestore(item)}
                      disabled={restoringId === item.id || item.itemType === "media"}>
                      {restoringId === item.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <RotateCcw className="h-3.5 w-3.5" />}
                      Restore
                    </Button>
                    <Button variant="ghost" size="sm"
                      className="text-muted-foreground hover:text-destructive gap-1.5"
                      onClick={() => handlePermanentDelete(item.id)}
                      disabled={deletingId === item.id}>
                      {deletingId === item.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminRecycleBin;
