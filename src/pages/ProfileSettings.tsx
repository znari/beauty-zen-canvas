import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Mail, Phone, Building2, Camera, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUploadAvatar } from "@/hooks/useUploadAvatar";
import { useDeleteAvatar } from "@/hooks/useDeleteAvatar";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
import { PlansManagement } from "@/components/PlansManagement";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "perfil");
  const [profileData, setProfileData] = useState({
    nomeEmpresa: "",
    email: "",
    telefone: "",
    metodoPagamento: "",
  });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);

  const { data: avatarUrl } = useAvatarUrl(avatarPath);
  const uploadAvatar = useUploadAvatar();
  const deleteAvatar = useDeleteAvatar();

  // Sincronizar tab com URL
  useEffect(() => {
    const tab = searchParams.get("tab");
    if (tab) setActiveTab(tab);
  }, [searchParams]);

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
        setAvatarPath(data.avatar_url || null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    
    // Validações
    if (!profileData.nomeEmpresa?.trim()) {
      toast.error("O nome da empresa é obrigatório");
      return;
    }
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          studio_name: profileData.nomeEmpresa.trim(),
          phone_raw: profileData.telefone || null,
          phone_normalized: normalizePhone(profileData.telefone),
        })
        .eq('id', user.id);
      
      if (error) {
        console.error("Erro do Supabase:", error);
        throw new Error(error.message);
      }
      
      toast.success("Perfil atualizado com sucesso!");
    } catch (error: any) {
      console.error("Erro detalhado:", error);
      
      // Mensagens de erro mais específicas
      if (error.message?.includes('unique')) {
        toast.error("Já existe outro registro com esses dados");
      } else if (error.message?.includes('foreign key')) {
        toast.error("Erro de referência no banco de dados");
      } else {
        toast.error(`Erro ao salvar perfil: ${error.message || 'Erro desconhecido'}`);
      }
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const normalizePhone = (phone: string): string => {
    if (!phone) return "";
    
    // Remove tudo que não for dígito
    let normalized = phone.replace(/\D/g, '');
    
    // Remove zeros no início
    normalized = normalized.replace(/^0+/, '');
    
    // Remove código do país (55) se presente
    if (normalized.startsWith('55')) {
      normalized = normalized.substring(2);
    }
    
    return normalized;
  };

  const handleCropComplete = async (croppedFile: File) => {
    try {
      const path = await uploadAvatar.mutateAsync(croppedFile);
      setAvatarPath(path);
      setShowCropDialog(false);
    } catch (error) {
      console.error("Erro no upload:", error);
    }
  };

  const handleDeleteAvatar = async () => {
    await deleteAvatar.mutateAsync();
    setAvatarPath(null);
    setShowDeleteDialog(false);
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
            <Button onClick={() => setShowSaveConfirmDialog(true)} className="shadow-lg" disabled={saving || loading}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="perfil">Perfil</TabsTrigger>
              <TabsTrigger value="pagamento">Plano e Pagamento</TabsTrigger>
            </TabsList>

            <TabsContent value="perfil" className="space-y-6">
          {/* Avatar Card */}
          <Card className="shadow-card">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar com controles de upload/delete */}
                <div className="relative group">
                  <Avatar className="h-32 w-32 border-4 border-primary/20">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt={profileData.nomeEmpresa} className="object-cover" />
                    ) : null}
                    <AvatarFallback className="bg-gradient-primary text-white text-3xl font-semibold">
                      {getInitials(profileData.nomeEmpresa)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {/* Overlay com botões */}
                  <div className="absolute inset-0 bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-10 w-10 rounded-full"
                      onClick={() => setShowCropDialog(true)}
                      disabled={uploadAvatar.isPending}
                      title="Editar foto"
                    >
                      <Camera className="h-5 w-5" />
                    </Button>
                    
                    {avatarPath && (
                      <Button
                        size="icon"
                        variant="destructive"
                        className="h-10 w-10 rounded-full"
                        onClick={() => setShowDeleteDialog(true)}
                        disabled={deleteAvatar.isPending}
                        title="Excluir foto"
                      >
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-primary-dark">
                    {profileData.nomeEmpresa}
                  </h2>
                  <p className="text-muted-foreground">{profileData.email}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    🔒 Suas fotos são privadas e seguras
                  </p>
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
                  disabled={saving}
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
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="seu@email.com"
                />
                <p className="text-xs text-muted-foreground">
                  📧 O e-mail não pode ser alterado aqui. Entre em contato com o suporte se precisar mudar.
                </p>
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
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Este número será usado nas mensagens automáticas do WhatsApp
                </p>
              </div>
            </CardContent>
          </Card>

          {/* TEMPORARIAMENTE DESABILITADO - será substituído pela integração de pagamento
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
          */}

              {/* Action Buttons */}
              <div className="flex justify-between pt-6">
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Voltar ao Dashboard
                </Button>
                <Button onClick={() => setShowSaveConfirmDialog(true)} size="lg" disabled={saving || loading}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Salvando..." : "Salvar Alterações"}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="pagamento">
              <PlansManagement />
            </TabsContent>
          </Tabs>
        )}
      </main>

      {/* Avatar Crop Dialog */}
      <AvatarCropDialog
        open={showCropDialog}
        onOpenChange={setShowCropDialog}
        onCropComplete={handleCropComplete}
        isUploading={uploadAvatar.isPending}
      />

      {/* Alert Dialog para confirmar exclusão */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir foto de perfil?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Sua foto de perfil será removida permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAvatar}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteAvatar.isPending ? "Excluindo..." : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert Dialog para confirmar salvamento */}
      <AlertDialog open={showSaveConfirmDialog} onOpenChange={setShowSaveConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar alterações?</AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a salvar as seguintes alterações no seu perfil:
              <ul className="mt-3 space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <Building2 className="h-3 w-3" />
                  <strong>Nome da Empresa:</strong> {profileData.nomeEmpresa}
                </li>
                {profileData.telefone && (
                  <li className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <strong>Telefone:</strong> {profileData.telefone}
                  </li>
                )}
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowSaveConfirmDialog(false);
                handleSave();
              }}
              className="bg-primary hover:bg-primary/90"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Salvando..." : "Sim, salvar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
