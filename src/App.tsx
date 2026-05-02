import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Index from "./pages/Index";
import About from "./pages/About";
import Skills from "./pages/Skills";
import Projects from "./pages/Projects";
import Blog from "./pages/Blog";
import Timeline from "./pages/Timeline";
import Certifications from "./pages/Certifications";
import NotFound from "./pages/NotFound";

import AdminLogin from "./pages/admin/AdminLogin";
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
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/certifications" element={<Certifications />} />

          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/blog" element={<AdminBlog />} />
          <Route path="/admin/skills" element={<AdminSkills />} />
          <Route path="/admin/projects" element={<AdminProjects />} />
          <Route path="/admin/timeline" element={<AdminTimeline />} />
          <Route path="/admin/certifications" element={<AdminCertifications />} />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
