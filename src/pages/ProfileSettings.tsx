import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, User, Mail, Phone, Building2, Camera, Trash2, FileText, MapPin } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import InputMask from "react-input-mask";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useUploadAvatar } from "@/hooks/useUploadAvatar";
import { useDeleteAvatar } from "@/hooks/useDeleteAvatar";
import { useAvatarUrl } from "@/hooks/useAvatarUrl";
import { AvatarCropDialog } from "@/components/AvatarCropDialog";
import { PlansManagement } from "@/components/PlansManagement";
import * as z from "zod";
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

// Schema de validação
const profileSchema = z.object({
  nomeEmpresa: z.string()
    .trim()
    .min(2, "Nome da empresa deve ter no mínimo 2 caracteres")
    .max(100, "Nome da empresa deve ter no máximo 100 caracteres"),
  cpfCnpj: z.string().optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string()
    .min(10, "Telefone deve ter no mínimo 10 dígitos")
    .max(20, "Telefone inválido")
    .optional()
    .or(z.literal("")),
  cep: z.string()
    .regex(/^\d{5}-?\d{3}$/, "CEP inválido")
    .optional()
    .or(z.literal("")),
  logradouro: z.string().max(200, "Logradouro muito longo").optional(),
  numero: z.string().max(20, "Número muito longo").optional(),
  complemento: z.string().max(100, "Complemento muito longo").optional(),
  bairro: z.string().max(100, "Bairro muito longo").optional(),
  cidade: z.string().max(100, "Cidade muito longa").optional(),
  estado: z.string().max(2, "Use a sigla do estado (ex: SP)").optional(),
  metodoPagamento: z.string().optional(),
});

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "perfil");
  const [profileData, setProfileData] = useState({
    nomeEmpresa: "",
    cpfCnpj: "",
    email: "",
    telefone: "",
    metodoPagamento: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [originalProfileData, setOriginalProfileData] = useState({
    nomeEmpresa: "",
    cpfCnpj: "",
    email: "",
    telefone: "",
    metodoPagamento: "",
    cep: "",
    logradouro: "",
    numero: "",
    complemento: "",
    bairro: "",
    cidade: "",
    estado: "",
  });
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSaveConfirmDialog, setShowSaveConfirmDialog] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

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
        const loadedData = {
          nomeEmpresa: data.studio_name || "",
          cpfCnpj: data.cpf_cnpj || "",
          email: data.email || user.email || "",
          telefone: data.phone_raw || "",
          metodoPagamento: "",
          cep: data.address_cep || "",
          logradouro: data.address_street || "",
          numero: data.address_number || "",
          complemento: data.address_complement || "",
          bairro: data.address_neighborhood || "",
          cidade: data.address_city || "",
          estado: data.address_state || "",
        };
        
        setProfileData(loadedData);
        setOriginalProfileData(loadedData);
        setAvatarPath(data.avatar_url || null);
      }
      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // Função para detectar quais campos foram modificados
  const getChangedFields = () => {
    const changes: Record<string, any> = {};
    
    // Mapeamento: campo do state -> campo do banco
    const fieldMapping: Record<string, string> = {
      nomeEmpresa: 'studio_name',
      telefone: 'phone_raw',
      cep: 'address_cep',
      logradouro: 'address_street',
      numero: 'address_number',
      complemento: 'address_complement',
      bairro: 'address_neighborhood',
      cidade: 'address_city',
      estado: 'address_state',
    };
    
    // Comparar cada campo editável
    Object.entries(fieldMapping).forEach(([stateKey, dbKey]) => {
      const currentValue = profileData[stateKey as keyof typeof profileData];
      const originalValue = originalProfileData[stateKey as keyof typeof originalProfileData];
      
      // Normalizar valores vazios para comparação
      const normalizedCurrent = currentValue?.trim() || null;
      const normalizedOriginal = originalValue?.trim() || null;
      
      // Se os valores são diferentes, adicionar ao objeto de mudanças
      if (normalizedCurrent !== normalizedOriginal) {
        changes[dbKey] = normalizedCurrent;
      }
    });
    
    return changes;
  };

  // Função para obter nomes amigáveis dos campos
  const getFieldLabel = (dbFieldName: string): string => {
    const labels: Record<string, string> = {
      studio_name: 'Nome da Empresa',
      phone_raw: 'Telefone',
      address_cep: 'CEP',
      address_street: 'Logradouro',
      address_number: 'Número',
      address_complement: 'Complemento',
      address_neighborhood: 'Bairro',
      address_city: 'Cidade',
      address_state: 'Estado',
    };
    return labels[dbFieldName] || dbFieldName;
  };

  const handleSave = async () => {
    if (!user) return;
    
    // Validar dados com zod
    try {
      profileSchema.parse(profileData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
        return;
      }
    }
    
    // Detectar campos alterados
    const changedFields = getChangedFields();
    
    // Se não há alterações, avisar o usuário
    if (Object.keys(changedFields).length === 0) {
      toast.info("Nenhuma alteração foi detectada");
      setShowSaveConfirmDialog(false);
      return;
    }
    
    // Log para debug
    console.log("📝 Campos alterados:", Object.keys(changedFields).map(getFieldLabel).join(", "));
    console.log("📊 Valores:", changedFields);
    
    setSaving(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(changedFields)
        .eq('id', user.id);
      
      if (error) {
        console.error("Erro do Supabase:", error);
        throw new Error(error.message);
      }
      
      // Atualizar os dados originais após salvar com sucesso
      setOriginalProfileData(profileData);
      
      // Fechar o dialog e mostrar mensagem de sucesso
      setShowSaveConfirmDialog(false);
      toast.success(`✅ ${Object.keys(changedFields).length} campo(s) atualizado(s) com sucesso!`);
      
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

  const normalizePhone = (phone: string): string | null => {
    if (!phone) return null;
    
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

  const formatCpfCnpj = (value: string): string => {
    if (!value) return "";
    const clean = value.replace(/\D/g, '');
    
    if (clean.length === 11) {
      return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    } else if (clean.length === 14) {
      return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    
    return value;
  };

  const handleCepBlur = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) return;
    
    setLoadingCep(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      
      setProfileData(prev => ({
        ...prev,
        logradouro: data.logradouro || prev.logradouro,
        bairro: data.bairro || prev.bairro,
        cidade: data.localidade || prev.cidade,
        estado: data.uf || prev.estado,
      }));
      
      toast.success("Endereço encontrado!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP");
    } finally {
      setLoadingCep(false);
    }
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
              {!profileData.cpfCnpj && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-yellow-900 dark:text-yellow-200">
                    ⚠️ <strong>Complete seu CPF/CNPJ</strong> para poder assinar um plano
                  </p>
                </div>
              )}
              
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
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Telefone / WhatsApp
                </Label>
                <InputMask
                  mask="(99) 99999-9999"
                  value={profileData.telefone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, telefone: e.target.value })
                  }
                  disabled={saving}
                >
                  {(inputProps: any) => (
                    <Input
                      {...inputProps}
                      id="telefone"
                      type="tel"
                      placeholder="(00) 00000-0000"
                    />
                  )}
                </InputMask>
                <p className="text-xs text-muted-foreground">
                  Este número será usado nas mensagens automáticas do WhatsApp
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpfCnpj" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  CPF/CNPJ
                </Label>
                <Input
                  id="cpfCnpj"
                  value={formatCpfCnpj(profileData.cpfCnpj)}
                  disabled
                  className="bg-muted cursor-not-allowed"
                  placeholder="Não cadastrado"
                />
                <p className="text-xs text-muted-foreground">
                  🔒 O CPF/CNPJ não pode ser alterado. Entre em contato com o suporte se necessário.
                </p>
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
            </CardContent>
          </Card>

          {/* Card de Endereço */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
              <CardDescription>
                Dados opcionais do seu estúdio (usado para documentos e notas fiscais)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cep">CEP</Label>
                  <InputMask
                    mask="99999-999"
                    value={profileData.cep}
                    onChange={(e) => setProfileData({ ...profileData, cep: e.target.value })}
                    onBlur={(e) => handleCepBlur(e.target.value)}
                    disabled={saving}
                  >
                    {(inputProps: any) => (
                      <Input
                        {...inputProps}
                        id="cep"
                        placeholder="00000-000"
                      />
                    )}
                  </InputMask>
                  {loadingCep && (
                    <p className="text-xs text-muted-foreground">🔍 Buscando endereço...</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="numero">Número</Label>
                  <Input
                    id="numero"
                    value={profileData.numero}
                    onChange={(e) => setProfileData({ ...profileData, numero: e.target.value })}
                    placeholder="123"
                    disabled={saving}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logradouro">Logradouro/Rua</Label>
                <Input
                  id="logradouro"
                  value={profileData.logradouro}
                  onChange={(e) => setProfileData({ ...profileData, logradouro: e.target.value })}
                  placeholder="Rua das Flores"
                  disabled={saving}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="complemento">Complemento</Label>
                <Input
                  id="complemento"
                  value={profileData.complemento}
                  onChange={(e) => setProfileData({ ...profileData, complemento: e.target.value })}
                  placeholder="Apto 101, Bloco A, Sala 5..."
                  disabled={saving}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bairro">Bairro</Label>
                  <Input
                    id="bairro"
                    value={profileData.bairro}
                    onChange={(e) => setProfileData({ ...profileData, bairro: e.target.value })}
                    placeholder="Centro"
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cidade">Cidade</Label>
                  <Input
                    id="cidade"
                    value={profileData.cidade}
                    onChange={(e) => setProfileData({ ...profileData, cidade: e.target.value })}
                    placeholder="São Paulo"
                    disabled={saving}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="estado">Estado</Label>
                  <Select
                    value={profileData.estado}
                    onValueChange={(value) => setProfileData({ ...profileData, estado: value })}
                    disabled={saving}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="UF" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AC">AC</SelectItem>
                      <SelectItem value="AL">AL</SelectItem>
                      <SelectItem value="AP">AP</SelectItem>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="BA">BA</SelectItem>
                      <SelectItem value="CE">CE</SelectItem>
                      <SelectItem value="DF">DF</SelectItem>
                      <SelectItem value="ES">ES</SelectItem>
                      <SelectItem value="GO">GO</SelectItem>
                      <SelectItem value="MA">MA</SelectItem>
                      <SelectItem value="MT">MT</SelectItem>
                      <SelectItem value="MS">MS</SelectItem>
                      <SelectItem value="MG">MG</SelectItem>
                      <SelectItem value="PA">PA</SelectItem>
                      <SelectItem value="PB">PB</SelectItem>
                      <SelectItem value="PR">PR</SelectItem>
                      <SelectItem value="PE">PE</SelectItem>
                      <SelectItem value="PI">PI</SelectItem>
                      <SelectItem value="RJ">RJ</SelectItem>
                      <SelectItem value="RN">RN</SelectItem>
                      <SelectItem value="RS">RS</SelectItem>
                      <SelectItem value="RO">RO</SelectItem>
                      <SelectItem value="RR">RR</SelectItem>
                      <SelectItem value="SC">SC</SelectItem>
                      <SelectItem value="SP">SP</SelectItem>
                      <SelectItem value="SE">SE</SelectItem>
                      <SelectItem value="TO">TO</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
            <AlertDialogTitle>Confirmar alterações</AlertDialogTitle>
            <AlertDialogDescription>
              {(() => {
                const changes = getChangedFields();
                const changedCount = Object.keys(changes).length;
                
                if (changedCount === 0) {
                  return "Nenhuma alteração foi detectada.";
                }
                
                return (
                  <div className="space-y-3 mt-4">
                    <p className="font-medium text-sm">
                      {changedCount === 1 
                        ? "1 campo será atualizado:" 
                        : `${changedCount} campos serão atualizados:`}
                    </p>
                    <ul className="space-y-2 text-sm">
                      {Object.keys(changes).map((dbFieldName) => (
                        <li key={dbFieldName} className="flex items-start gap-2">
                          <span className="text-primary mt-0.5">✓</span>
                          <div>
                            <strong>{getFieldLabel(dbFieldName)}</strong>
                            {changes[dbFieldName] && (
                              <div className="text-xs text-muted-foreground mt-0.5">
                                Novo valor: "{changes[dbFieldName]}"
                              </div>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-3 pt-3 border-t">
                      ℹ️ Apenas os campos listados acima serão atualizados no banco de dados
                    </p>
                  </div>
                );
              })()}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleSave();
              }}
              disabled={saving}
              className="bg-primary hover:bg-primary/90"
            >
              {saving ? "Salvando..." : "Confirmar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
