import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { CheckCheck, Mail, MailOpen, Trash2 } from "lucide-react";
import {
  loadContactMessages,
  markContactMessageRead,
  deleteContactMessage,
  formatDate,
  type ContactMessage,
} from "@/lib/content";

const AdminMessages = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    setLoading(true);
    const data = await loadContactMessages();
    setMessages(data);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, []);

  const handleToggleRead = async (msg: ContactMessage) => {
    await markContactMessageRead(msg.id, !msg.read);
    setMessages((prev) =>
      prev.map((m) => (m.id === msg.id ? { ...m, read: !m.read } : m)),
    );
  };

  const handleDelete = async (id: string) => {
    await deleteContactMessage(id);
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const unread = messages.filter((m) => !m.read).length;

  return (
    <AdminLayout title="Messages">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-eyebrow mb-1">Inbox</p>
            <h2 className="font-display text-xl font-semibold">
              Contact messages
              {unread > 0 && (
                <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-foreground text-background text-[10px] font-bold tabular-nums">
                  {unread}
                </span>
              )}
            </h2>
          </div>
          <Button variant="outline" size="sm" className="saber-border" onClick={fetch}>
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="saber-card p-10 text-sm text-muted-foreground animate-pulse">Loading messages…</div>
        ) : messages.length === 0 ? (
          <div className="saber-card p-10 flex flex-col items-center gap-3 text-center">
            <Mail className="h-10 w-10 text-muted-foreground/30" />
            <p className="text-muted-foreground text-sm">No messages yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => (
              <article
                key={msg.id}
                className={`saber-card p-5 transition-opacity ${msg.read ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <span className="font-semibold text-sm">{msg.name}</span>
                      <a
                        href={`mailto:${msg.email}`}
                        className="text-xs text-saber-blue hover:underline font-mono"
                      >
                        {msg.email}
                      </a>
                      <span className="text-[10px] text-muted-foreground uppercase tracking-[0.24em]">
                        {formatDate(msg.createdAt)}
                      </span>
                      {!msg.read && (
                        <span className="h-1.5 w-1.5 rounded-full bg-foreground/80 animate-pulse" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {msg.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={() => handleToggleRead(msg)}
                      title={msg.read ? "Mark unread" : "Mark read"}
                    >
                      {msg.read ? <Mail className="h-4 w-4" /> : <MailOpen className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(msg.id)}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </article>
            ))}
            {messages.some((m) => !m.read) && (
              <Button
                variant="outline"
                size="sm"
                className="saber-border"
                onClick={async () => {
                  await Promise.all(
                    messages.filter((m) => !m.read).map((m) => markContactMessageRead(m.id, true)),
                  );
                  setMessages((prev) => prev.map((m) => ({ ...m, read: true })));
                }}
              >
                <CheckCheck className="mr-2 h-4 w-4" />
                Mark all read
              </Button>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;
