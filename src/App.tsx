import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PegasusProvider } from "@/contexts/PegasusContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RealtimeProvider } from "@/components/RealtimeProvider";
import { DashboardLayout } from "@/components/DashboardLayout";
import Index from "./pages/Index";
import CallOutsView from "./pages/CallOutsView";
import GuardPoolView from "./pages/GuardPoolView";
import LiveSimView from "./pages/LiveSimView";
import PegasusFullView from "./pages/PegasusFullView";
import LoginPage from "./pages/LoginPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// ---------------------------------------------------------------------------
// App
// ---------------------------------------------------------------------------

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <PegasusProvider>
                    <RealtimeProvider>
                      <Routes>
                        {/* Pegasus: full-screen, NO DashboardLayout */}
                        <Route
                          path="/pegasus"
                          element={<PegasusFullView />}
                        />

                        {/* Dashboard views: with sidebar + Pegasus panel */}
                        <Route
                          path="/*"
                          element={
                            <DashboardLayout>
                              <Routes>
                                <Route path="/" element={<Index />} />
                                <Route
                                  path="/callouts"
                                  element={<CallOutsView />}
                                />
                                <Route
                                  path="/guards"
                                  element={<GuardPoolView />}
                                />
                                <Route
                                  path="/simulation"
                                  element={<LiveSimView />}
                                />
                                <Route path="*" element={<NotFound />} />
                              </Routes>
                            </DashboardLayout>
                          }
                        />
                      </Routes>
                    </RealtimeProvider>
                  </PegasusProvider>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
