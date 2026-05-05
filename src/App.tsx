import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAdmin } from "@/components/auth/RequireAdmin";
import { ThemeProvider } from "@/components/saber/ThemeProvider";
import { CommandPalette, CommandPaletteProvider } from "@/components/saber/CommandPalette";
import { OfflineDetector } from "@/components/saber/OfflineDetector";
import { ErrorBoundary } from "@/components/saber/ErrorBoundary";
import { usePageTracking } from "@/hooks/usePageTracking";

import Index from "./pages/Index";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Writeups from "./pages/Blog";
import WriteupPost from "./pages/BlogPost";
import Timeline from "./pages/Timeline";
import Certifications from "./pages/Certifications";
import Contact from "./pages/Contact";
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
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminNewsletter from "./pages/admin/AdminNewsletter";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminRecycleBin from "./pages/admin/AdminRecycleBin";
import AdminDevLog from "./pages/admin/AdminDevLog";
import DevLogPage from "./pages/DevLog";
import DevLogPost from "./pages/DevLogPost";

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
        <Route path="/projects/:slug" element={<ProjectDetail />} />
        <Route path="/blog" element={<Writeups />} />
        <Route path="/blog/:slug" element={<WriteupPost />} />
        <Route path="/writeups" element={<Writeups />} />
        <Route path="/writeups/:slug" element={<WriteupPost />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/certifications" element={<Certifications />} />
        <Route path="/contact" element={<Contact />} />
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
        <Route path="/admin/analytics" element={<RequireAdmin><AdminAnalytics /></RequireAdmin>} />
        <Route path="/admin/newsletter" element={<RequireAdmin><AdminNewsletter /></RequireAdmin>} />
        <Route path="/admin/settings" element={<RequireAdmin><AdminSettings /></RequireAdmin>} />
        <Route path="/admin/recycle-bin" element={<RequireAdmin><AdminRecycleBin /></RequireAdmin>} />
        <Route path="/admin/devlog" element={<RequireAdmin><AdminDevLog /></RequireAdmin>} />
        <Route path="/devlog" element={<DevLogPage />} />
        <Route path="/devlog/:slug" element={<DevLogPost />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <ErrorBoundary>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <OfflineDetector>
              <CommandPaletteProvider>
                <AuthProvider>
                  <AppRoutes />
                </AuthProvider>
              </CommandPaletteProvider>
            </OfflineDetector>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

export default App;
