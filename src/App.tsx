import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Landing from "./pages/Landing";
import Registration from "./pages/Registration";
import Login from "./pages/Login";
import PasswordRecovery from "./pages/PasswordRecovery";
import NewPassword from "./pages/NewPassword";
import Dashboard from "./pages/Dashboard";
import ClientProfile from "./pages/ClientProfile";
import ClientAnamnesisForm from "./pages/ClientAnamnesisForm";
import AnamnesisForm from "./pages/AnamnesisForm";
import NewVisit from "./pages/NewVisit";
import Success from "./pages/Success";
import NewClient from "./pages/NewClient";
import ClientList from "./pages/ClientList";
import ProcedureManagement from "./pages/ProcedureManagement";
import MessageSettings from "./pages/MessageSettings";
import AnamnesisSettings from "./pages/AnamnesisSettings";
import ProfileSettings from "./pages/ProfileSettings";
import Billing from "./pages/Billing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/registro" element={<Registration />} />
            <Route path="/login" element={<Login />} />
            <Route path="/recuperar-senha" element={<PasswordRecovery />} />
            <Route path="/nova-senha" element={<NewPassword />} />
            <Route path="/ficha/:id" element={<AnamnesisForm />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/cliente/:id" element={<ProtectedRoute><ClientProfile /></ProtectedRoute>} />
            <Route path="/cliente/:id/nova-visita" element={<ProtectedRoute><NewVisit /></ProtectedRoute>} />
            <Route path="/clientes" element={<ProtectedRoute><ClientList /></ProtectedRoute>} />
            <Route path="/clientes/novo" element={<ProtectedRoute><NewClient /></ProtectedRoute>} />
            <Route path="/cliente/:id/ficha" element={<ProtectedRoute><ClientAnamnesisForm /></ProtectedRoute>} />
            <Route path="/sucesso" element={<ProtectedRoute><Success /></ProtectedRoute>} />
            <Route path="/configuracoes/perfil" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            <Route path="/configuracoes/procedimentos" element={<ProtectedRoute><ProcedureManagement /></ProtectedRoute>} />
            <Route path="/configuracoes/ficha-anamnese" element={<ProtectedRoute><AnamnesisSettings /></ProtectedRoute>} />
            <Route path="/configuracoes/mensagens" element={<ProtectedRoute><MessageSettings /></ProtectedRoute>} />
            <Route path="/faturamento" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
