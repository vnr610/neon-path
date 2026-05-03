import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { ThemeProvider } from "@/components/saber/ThemeProvider";
import { CommandPalette, CommandPaletteProvider } from "@/components/saber/CommandPalette";
import { usePageTracking } from "@/hooks/usePageTracking";

import Index from "./pages/Index";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Writeups from "./pages/Blog";
import WriteupPost from "./pages/BlogPost";
import Timeline from "./pages/Timeline";
import Certifications from "./pages/Certifications";
import Contact from "./pages/Contact";
import Guestbook from "./pages/Guestbook";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminCallback from "./pages/admin/AdminCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminWriteups from "./pages/admin/AdminBlog";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTimeline from "./pages/admin/AdminTimeline";
import AdminCertifications from "./pages/admin/AdminCertifications";
import AdminHome from "./pages/admin/AdminHome";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminGuestbook from "./pages/admin/AdminGuestbook";
import AdminNewsletter from "./pages/admin/AdminNewsletter";

const queryClient = new QueryClient();

/** Inner component so hooks can access router context */
function AppRoutes() {
  usePageTracking();

  return (
    <>
      <CommandPalette />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/about" element={<About />} />
        <Route path="/skills" element={<Skills />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/blog" element={<Writeups />} />
        <Route path="/blog/:slug" element={<WriteupPost />} />
        <Route path="/writeups" element={<Writeups />} />
        <Route path="/writeups/:slug" element={<WriteupPost />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/guestbook" element={<Guestbook />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/callback" element={<AdminCallback />} />
        <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
        <Route path="/admin/home" element={<RequireAdmin><AdminHome /></RequireAdmin>} />
        <Route path="/admin/blog" element={<RequireAdmin><AdminWriteups /></RequireAdmin>} />
        <Route path="/admin/writeups" element={<RequireAdmin><AdminWriteups /></RequireAdmin>} />
        <Route path="/admin/skills" element={<RequireAdmin><AdminSkills /></RequireAdmin>} />
        <Route path="/admin/projects" element={<RequireAdmin><AdminProjects /></RequireAdmin>} />
        <Route path="/admin/timeline" element={<RequireAdmin><AdminTimeline /></RequireAdmin>} />
        <Route path="/admin/certifications" element={<RequireAdmin><AdminCertifications /></RequireAdmin>} />
        <Route path="/admin/messages" element={<RequireAdmin><AdminMessages /></RequireAdmin>} />
        <Route path="/admin/analytics" element={<RequireAdmin><AdminAnalytics /></RequireAdmin>} />
        <Route path="/admin/guestbook" element={<RequireAdmin><AdminGuestbook /></RequireAdmin>} />
        <Route path="/admin/newsletter" element={<RequireAdmin><AdminNewsletter /></RequireAdmin>} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CommandPaletteProvider>
            <AuthProvider>
              <AppRoutes />
            </AuthProvider>
          </CommandPaletteProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
