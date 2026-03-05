import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import Index from "./pages/Index";
import CallOutsView from "./pages/CallOutsView";
import GuardPoolView from "./pages/GuardPoolView";
import LiveSimView from "./pages/LiveSimView";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const MANAGER_NAME = "Miles";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <DashboardLayout managerName={MANAGER_NAME}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/callouts" element={<CallOutsView />} />
            <Route path="/guards" element={<GuardPoolView />} />
            <Route path="/simulation" element={<LiveSimView managerName={MANAGER_NAME} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </DashboardLayout>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
