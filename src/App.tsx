import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import PasswordRecovery from "./pages/PasswordRecovery";
import NewPassword from "./pages/NewPassword";
import Dashboard from "./pages/Dashboard";
import ClientProfile from "./pages/ClientProfile";
import AnamnesisForm from "./pages/AnamnesisForm";
import Success from "./pages/Success";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/login" element={<Login />} />
          <Route path="/recuperar-senha" element={<PasswordRecovery />} />
          <Route path="/nova-senha" element={<NewPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/cliente/:id" element={<ClientProfile />} />
          <Route path="/ficha/:id" element={<AnamnesisForm />} />
          <Route path="/sucesso" element={<Success />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
