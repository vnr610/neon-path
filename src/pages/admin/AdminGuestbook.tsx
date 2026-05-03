import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { BookMarked, Check, Trash2 } from "lucide-react";
import {
  loadGuestbookEntries,
  approveGuestbookEntry,
  deleteGuestbookEntry,
  formatDate,
  type GuestbookEntry,
} from "@/lib/content";

const AdminGuestbook = () => {
  const [entries, setEntries] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const data = await loadGuestbookEntries(false); // load all including unapproved
    setEntries(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleApprove = async (id: string) => {
    await approveGuestbookEntry(id);
    setEntries((prev) => prev.map((e) => e.id === id ? { ...e, approved: true } : e));
  };

  const handleDelete = async (id: string) => {
    await deleteGuestbookEntry(id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const pending = entries.filter((e) => !e.approved).length;
  const approved = entries.filter((e) => e.approved).length;

  return (
    <AdminLayout title="Guestbook">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.32em] text-muted-foreground/40 mb-1">
              // guestbook · moderation
            </p>
            <h2 className="font-display text-2xl font-bold flex items-center gap-3">
              Guestbook
              {pending > 0 && (
                <span className="inline-flex items-center justify-center h-6 min-w-6 px-1.5 rounded-full bg-foreground text-background text-[10px] font-bold tabular-nums">
                  {pending}
                </span>
              )}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {approved} approved · {pending} pending review
            </p>
          </div>
          <Button variant="outline" size="sm" className="saber-border" onClick={fetch}>
            Refresh
          </Button>
        </div>

        {/* Pending section */}
        {pending > 0 && (
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">
              // pending · approval
            </p>
            <div className="space-y-3">
              {entries.filter((e) => !e.approved).map((entry) => (
                <article key={entry.id} className="saber-card p-5 border-l-2 border-foreground/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-md saber-border flex items-center justify-center font-display text-sm font-bold text-muted-foreground/60">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">{entry.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground/50">{formatDate(entry.createdAt)}</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{entry.message}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="saber-border text-xs gap-1.5"
                        onClick={() => handleApprove(entry.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                        Approve
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Approved section */}
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-muted-foreground/40 mb-3">
            // approved · entries
          </p>
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="saber-card h-20 animate-pulse bg-muted/20" />
              ))}
            </div>
          ) : approved === 0 ? (
            <div className="saber-card p-10 flex flex-col items-center gap-3 text-center">
              <BookMarked className="h-8 w-8 text-muted-foreground/20" />
              <p className="text-sm text-muted-foreground">No approved entries yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.filter((e) => e.approved).map((entry) => (
                <article key={entry.id} className="saber-card p-5 opacity-70">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 shrink-0 rounded-md saber-border flex items-center justify-center font-display text-sm font-bold text-muted-foreground/60">
                        {entry.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <span className="font-semibold text-sm">{entry.name}</span>
                          <span className="font-mono text-[10px] text-muted-foreground/50">{formatDate(entry.createdAt)}</span>
                          <span className="font-mono text-[9px] text-foreground/40 border border-border/40 rounded px-1.5 py-0.5">approved</span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{entry.message}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                      onClick={() => handleDelete(entry.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminGuestbook;
