import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Building2, Phone, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import InputMask from "react-input-mask";

interface ProfileStepProps {
  onValidChange: (isValid: boolean) => void;
}

export function ProfileStep({ onValidChange }: ProfileStepProps) {
  const { user } = useAuth();
  const [studioName, setStudioName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  useEffect(() => {
    // Validate: studio name must have at least 2 characters and phone at least 10 digits
    const isValid = studioName.trim().length >= 2 && phone.replace(/\D/g, "").length >= 10;
    onValidChange(isValid);
  }, [studioName, phone, onValidChange]);

  const loadProfile = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("studio_name, phone_raw")
      .eq("id", user.id)
      .single();

    if (data) {
      setStudioName(data.studio_name || "");
      setPhone(data.phone_raw || "");
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        studio_name: studioName.trim(),
        phone_raw: phone,
      })
      .eq("id", user.id);

    if (error) {
      toast.error("Erro ao salvar perfil");
      console.error(error);
    } else {
      toast.success("Perfil salvo com sucesso!");
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground">
        Essas informações aparecerão nas mensagens enviadas aos seus clientes.
      </p>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="studio-name" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Nome do Estúdio *
          </Label>
          <Input
            id="studio-name"
            placeholder="Ex: Studio Beleza Maria"
            value={studioName}
            onChange={(e) => setStudioName(e.target.value)}
            disabled={saving}
          />
          <p className="text-xs text-muted-foreground">
            Como você quer que seu estúdio seja chamado nas mensagens?
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="studio-phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            WhatsApp do Estúdio *
          </Label>
          <InputMask
            mask="(99) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={saving}
          >
            {(inputProps: any) => (
              <Input
                {...inputProps}
                id="studio-phone"
                type="tel"
                placeholder="(11) 99999-9999"
              />
            )}
          </InputMask>
          <p className="text-xs text-muted-foreground">
            Número para clientes entrarem em contato
          </p>
        </div>
      </div>

      <div className="pt-4">
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Salvando..." : "Salvar e Continuar"}
        </Button>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-900">
          💡 <strong>Dica:</strong> Você pode alterar essas informações depois em{" "}
          <strong>Configurações → Perfil</strong>
        </p>
      </div>
    </div>
  );
}
