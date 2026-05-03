import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { RequireRole } from "@/components/auth/RequireRole";
import { ThemeProvider } from "@/components/saber/ThemeProvider";
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

const queryClient = new QueryClient();

/** Inner component so hooks can access router context */
function AppRoutes() {
  usePageTracking();
  return (
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

      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/callback" element={<AdminCallback />} />
      {/* Admin-only routes */}
      <Route path="/admin" element={<RequireRole allow={["admin", "editor"]}><AdminDashboard /></RequireRole>} />
      <Route path="/admin/home" element={<RequireRole allow={["admin"]}><AdminHome /></RequireRole>} />
      <Route path="/admin/blog" element={<RequireRole allow={["admin", "editor"]}><AdminWriteups /></RequireRole>} />
      <Route path="/admin/writeups" element={<RequireRole allow={["admin", "editor"]}><AdminWriteups /></RequireRole>} />
      <Route path="/admin/skills" element={<RequireRole allow={["admin"]}><AdminSkills /></RequireRole>} />
      <Route path="/admin/projects" element={<RequireRole allow={["admin"]}><AdminProjects /></RequireRole>} />
      <Route path="/admin/timeline" element={<RequireRole allow={["admin"]}><AdminTimeline /></RequireRole>} />
      <Route path="/admin/certifications" element={<RequireRole allow={["admin"]}><AdminCertifications /></RequireRole>} />
      <Route path="/admin/messages" element={<RequireRole allow={["admin", "editor"]}><AdminMessages /></RequireRole>} />
      <Route path="/admin/analytics" element={<RequireRole allow={["admin", "editor"]}><AdminAnalytics /></RequireRole>} />

      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
