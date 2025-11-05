import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Save, User, Mail, Phone, Building2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    nomeEmpresa: "",
    email: "",
    telefone: "",
    metodoPagamento: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) {
        toast.error("Erro ao carregar perfil");
        console.error(error);
      } else if (data) {
        setProfileData({
          nomeEmpresa: data.studio_name || "",
          email: data.email || user.email || "",
          telefone: data.phone_raw || "",
          metodoPagamento: "", // This field doesn't exist in DB yet
        });
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        studio_name: profileData.nomeEmpresa,
        phone_raw: profileData.telefone,
        phone_normalized: profileData.telefone, // Should use normalize_phone function
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);
    
    if (error) {
      toast.error("Erro ao salvar perfil");
      console.error(error);
    } else {
      toast.success("Perfil atualizado com sucesso!");
    }
    setSaving(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary-dark">Perfil</h1>
              <p className="text-sm text-muted-foreground">
                Gerencie as informações do seu estúdio
              </p>
            </div>
            <Button onClick={handleSave} className="shadow-lg" disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-6">
          {/* Avatar Card */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <Avatar className="h-32 w-32 border-4 border-primary/20">
                  <AvatarFallback className="bg-gradient-primary text-white text-3xl font-semibold">
                    {getInitials(profileData.nomeEmpresa)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-2xl font-bold text-primary-dark">
                    {profileData.nomeEmpresa}
                  </h2>
                  <p className="text-muted-foreground">{profileData.email}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Informações do Estúdio</CardTitle>
              <CardDescription>
                Mantenha seus dados sempre atualizados
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="nomeEmpresa" className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Nome da Empresa
                </Label>
                <Input
                  id="nomeEmpresa"
                  value={profileData.nomeEmpresa}
                  onChange={(e) =>
                    setProfileData({ ...profileData, nomeEmpresa: e.target.value })
                  }
                  placeholder="Digite o nome do seu estúdio"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone / WhatsApp
                </Label>
                <Input
                  id="telefone"
                  value={profileData.telefone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, telefone: e.target.value })
                  }
                  placeholder="(00) 00000-0000"
                />
                <p className="text-xs text-muted-foreground">
                  Este número será usado nas mensagens automáticas do WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Método de Pagamento</CardTitle>
              <CardDescription>
                Configure sua forma de pagamento preferida
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="metodoPagamento">Método Preferido</Label>
                <Input
                  id="metodoPagamento"
                  value={profileData.metodoPagamento}
                  onChange={(e) =>
                    setProfileData({ ...profileData, metodoPagamento: e.target.value })
                  }
                  placeholder="Ex: Cartão de Crédito, PIX, Dinheiro"
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
            <Button onClick={handleSave} size="lg" disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
