import { Link } from "react-router-dom";
import { Lock, Mail, Swords } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const AdminLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-hero pointer-events-none" />

      <div className="relative w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <Swords className="h-5 w-5 text-saber-blue animate-saber-pulse" />
          <span className="font-display text-sm tracking-[0.3em]">VNR610</span>
        </Link>

        <div className="saber-card p-8 sm:p-10 shadow-glow-soft">
          <div className="mb-8 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-saber-blue mb-3">Admin Console</p>
            <h1 className="font-display text-2xl font-bold mb-2">Authenticate</h1>
            <p className="text-xs text-muted-foreground tracking-wider">Identify yourself, traveler.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" type="email" placeholder="you@realm.dev" className="pl-10 bg-background/60 saber-border" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="password" type="password" placeholder="••••••••" className="pl-10 bg-background/60 saber-border" />
              </div>
            </div>

            <Button type="submit" asChild className="w-full bg-gradient-saber hover:opacity-90 text-primary-foreground border-0 shadow-glow-blue">
              <Link to="/admin">Ignite Session</Link>
            </Button>
          </form>

          <p className="text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-8">
            <Link to="/" className="hover:text-saber-blue transition-colors">← Back to realm</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
