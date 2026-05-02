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
import Blog from "./pages/Blog";
import Timeline from "./pages/Timeline";
import Certifications from "./pages/Certifications";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
import AdminCallback from "./pages/admin/AdminCallback";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminSkills from "./pages/admin/AdminSkills";
import AdminProjects from "./pages/admin/AdminProjects";
import AdminTimeline from "./pages/admin/AdminTimeline";
import AdminCertifications from "./pages/admin/AdminCertifications";

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
            <Route path="/blog" element={<Blog />} />
            <Route path="/timeline" element={<Timeline />} />
            <Route path="/certifications" element={<Certifications />} />

            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/callback" element={<AdminCallback />} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
            <Route path="/admin/blog" element={<RequireAdmin><AdminBlog /></RequireAdmin>} />
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
