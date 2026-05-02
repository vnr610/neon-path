import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import { RequireAdmin } from "@/components/auth/RequireAdmin";

import Index from "./pages/Index";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Writeups from "./pages/Blog";
import WriteupPost from "./pages/BlogPost";
import Timeline from "./pages/Timeline";
import Certifications from "./pages/Certifications";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
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

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
