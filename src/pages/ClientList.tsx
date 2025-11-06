import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Plus, User, Phone, Calendar, FileText, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useClients } from "@/hooks/useClients";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

const ClientList = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: clients = [], isLoading, error } = useClients();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.phone.replace(/\D/g, "").includes(searchTerm.replace(/\D/g, ""))
  );

  const handleClientClick = (clientId: string) => {
    navigate(`/cliente/${clientId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen gradient-hero">
        <LoadingSpinner message="Carregando clientes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <ErrorMessage message={(error as Error).message} />
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-primary-light"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-primary-dark">Clientes</h1>
              <p className="text-sm text-muted-foreground">Gerencie seus clientes cadastrados</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Toolbar */}
        <Card className="shadow-card mb-6 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative flex-1 w-full md:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar por nome ou WhatsApp..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full"
                />
              </div>

              {/* New Client Button */}
              <Button
                onClick={() => navigate("/clientes/novo")}
                variant="cta"
                className="w-full md:w-auto"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Cliente
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Clients Table */}
        <Card className="shadow-card animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <CardContent className="p-6">
            {filteredClients.length > 0 ? (
              <div className="rounded-xl border border-primary/20 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-accent/30 hover:bg-accent/30">
                      <TableHead className="font-bold text-secondary">Cliente</TableHead>
                      <TableHead className="font-bold text-secondary">WhatsApp</TableHead>
                      <TableHead className="font-bold text-secondary">Última Visita</TableHead>
                      <TableHead className="font-bold text-secondary">Ficha de Anamnese</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client, idx) => (
                      <TableRow
                        key={client.id}
                        onClick={() => handleClientClick(client.id)}
                        className={`cursor-pointer transition-all hover:bg-primary-light/50 ${
                          idx % 2 === 0 ? "bg-white" : "bg-muted/20"
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-primary/20">
                              <AvatarFallback className="bg-gradient-primary text-white text-sm font-semibold">
                                {getInitials(client.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-semibold text-foreground">{client.name}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <User className="h-3 w-3" />
                                ID: {client.id}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-foreground">
                            <Phone className="h-4 w-4 text-primary" />
                            <span className="font-medium">{client.phone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 text-foreground">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span className="font-medium">{client.lastVisit}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={client.anamnesisStatus === "Preenchida" ? "active" : "pending"}
                            className="flex items-center gap-1 w-fit"
                          >
                            <FileText className="h-3 w-3" />
                            {client.anamnesisStatus}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-primary-light/50 mb-6">
                  <User className="h-10 w-10 text-primary opacity-30" />
                </div>
                <h3 className="text-xl font-semibold text-primary-dark mb-2">
                  {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado ainda"}
                </h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  {searchTerm
                    ? "Tente buscar por outro nome ou WhatsApp."
                    : "Comece adicionando seu primeiro cliente ao sistema 💅"}
                </p>
                {!searchTerm && (
                  <Button onClick={() => navigate("/clientes/novo")} variant="cta">
                    <Plus className="h-4 w-4 mr-2" />
                    Cadastrar Primeiro Cliente
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination Placeholder (para futura implementação) */}
        {filteredClients.length > 0 && (
          <div className="mt-6 flex items-center justify-between animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <p className="text-sm text-muted-foreground">
              Exibindo {filteredClients.length} {filteredClients.length === 1 ? "cliente" : "clientes"}
            </p>
            {/* Adicionar componente de paginação aqui quando necessário */}
          </div>
        )}

        {/* Footer */}
        <footer className="text-center text-sm py-6 mt-8">
          <p className="text-secondary/70 font-medium">© 2025 FichaZen — Seu estúdio, mais zen 💆‍♀️✨</p>
        </footer>
      </main>
    </div>
  );
};

export default ClientList;
