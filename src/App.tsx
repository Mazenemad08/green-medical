import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ROUTE_PATHS } from "@/lib/index";
import { Layout } from "@/components/Layout";
import Home from "@/pages/Home";

/**
 * App Component
 * Sets up the global providers and routing for the Green International Medical landing page.
 * Following the Human-Centric Medical design philosophy with RTL support.
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* Feedback Components */}
        <Toaster />
        <Sonner 
          position="top-center" 
          expand={false} 
          richColors 
          dir="rtl"
        />

        {/* Routing & Layout */}
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* 
                  The landing page is a Single Page Application (SPA).
                  All content is handled within the Home component which contains 
                  sections like #hero, #services, #consultation, and #booking.
              */}
              <Route path={ROUTE_PATHS.HOME} element={<Home />} />
              
              {/* 
                  Catch-all route: For this specific landing page requirement,
                  we redirect or simply show the Home page. 
              */}
              <Route path="*" element={<Home />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;