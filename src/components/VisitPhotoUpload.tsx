import { useState, useRef } from "react";
import { Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useUploadVisitPhotos } from "@/hooks/useUploadVisitPhotos";
import { toast } from "@/hooks/use-toast";

interface VisitPhotoUploadProps {
  visitId: string;
  onUploadComplete?: () => void;
}

export const VisitPhotoUpload = ({ visitId, onUploadComplete }: VisitPhotoUploadProps) => {
  const [beforePreview, setBeforePreview] = useState<string | null>(null);
  const [afterPreview, setAfterPreview] = useState<string | null>(null);
  const [beforeFile, setBeforeFile] = useState<File | null>(null);
  const [afterFile, setAfterFile] = useState<File | null>(null);
  
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);
  
  const uploadMutation = useUploadVisitPhotos();

  const handleFileSelect = (file: File, type: "before" | "after") => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem válida (JPG, PNG, WEBP)",
        variant: "destructive"
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo é 5MB",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === "before") {
        setBeforePreview(reader.result as string);
        setBeforeFile(file);
      } else {
        setAfterPreview(reader.result as string);
        setAfterFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const filesToUpload = [];
    
    if (beforeFile) filesToUpload.push({ file: beforeFile, type: "before" as const });
    if (afterFile) filesToUpload.push({ file: afterFile, type: "after" as const });

    if (filesToUpload.length === 0) {
      toast({
        title: "Nenhuma foto selecionada",
        description: "Selecione pelo menos uma foto para fazer upload",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload sequencial para melhor controle
      for (const { file, type } of filesToUpload) {
        await uploadMutation.mutateAsync({ visitId, file, type });
      }

      toast({
        title: "Fotos enviadas com sucesso!",
        description: `${filesToUpload.length} foto(s) adicionada(s) ao procedimento`,
      });

      // Limpar previews
      setBeforePreview(null);
      setAfterPreview(null);
      setBeforeFile(null);
      setAfterFile(null);

      onUploadComplete?.();
    } catch (error) {
      toast({
        title: "Erro ao fazer upload",
        description: "Ocorreu um erro ao enviar as fotos. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const clearPreview = (type: "before" | "after") => {
    if (type === "before") {
      setBeforePreview(null);
      setBeforeFile(null);
      if (beforeInputRef.current) beforeInputRef.current.value = "";
    } else {
      setAfterPreview(null);
      setAfterFile(null);
      if (afterInputRef.current) afterInputRef.current.value = "";
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Adicionar Fotos do Procedimento</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Faça upload das fotos antes e depois do procedimento (máx. 5MB cada)
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Upload Antes */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Foto Antes</Label>
            
            {!beforePreview ? (
              <button
                type="button"
                onClick={() => beforeInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                <ImageIcon className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  Clique para selecionar
                </span>
              </button>
            ) : (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <img 
                  src={beforePreview} 
                  alt="Preview antes" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => clearPreview("before")}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <input
              ref={beforeInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "before")}
              className="hidden"
            />
          </div>

          {/* Upload Depois */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Foto Depois</Label>
            
            {!afterPreview ? (
              <button
                type="button"
                onClick={() => afterInputRef.current?.click()}
                className="w-full h-48 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:border-primary/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer group"
              >
                <ImageIcon className="h-12 w-12 text-muted-foreground group-hover:text-primary transition-colors" />
                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                  Clique para selecionar
                </span>
              </button>
            ) : (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border">
                <img 
                  src={afterPreview} 
                  alt="Preview depois" 
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => clearPreview("after")}
                  className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <input
              ref={afterInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0], "after")}
              className="hidden"
            />
          </div>
        </div>

        <Button
          onClick={handleUpload}
          disabled={uploadMutation.isPending || (!beforeFile && !afterFile)}
          className="w-full"
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Fazer Upload
            </>
          )}
        </Button>
      </div>
    </Card>
  );
};
