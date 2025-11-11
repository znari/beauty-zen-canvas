import { useState, useCallback, useRef } from "react";
import Cropper, { Area, Point } from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, ZoomIn, RotateCw } from "lucide-react";
import { toast } from "sonner";

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (croppedFile: File) => void;
  isUploading?: boolean;
}

export const AvatarCropDialog = ({
  open,
  onOpenChange,
  onCropComplete,
  isUploading = false,
}: AvatarCropDialogProps) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropChange = useCallback((location: Point) => {
    setCrop(location);
  }, []);

  const onZoomChange = useCallback((zoom: number) => {
    setZoom(zoom);
  }, []);

  const onCropCompleteCallback = useCallback(
    (_: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileSelect = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Formato inválido. Use JPG, PNG ou WEBP");
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Arquivo muito grande. Tamanho máximo: 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.src = url;
    });

  const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
  ): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Falha ao criar canvas");
    }

    const maxSize = 512;
    canvas.width = maxSize;
    canvas.height = maxSize;

    ctx.save();
    ctx.translate(maxSize / 2, maxSize / 2);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.translate(-maxSize / 2, -maxSize / 2);

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      maxSize,
      maxSize
    );

    ctx.restore();

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], "avatar.jpg", {
            type: "image/jpeg",
          });
          resolve(file);
        }
      }, "image/jpeg", 0.95);
    });
  };

  const handleConfirm = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedFile = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation
      );
      onCropComplete(croppedFile);
    } catch (error) {
      toast.error("Erro ao processar imagem");
      console.error(error);
    }
  };

  const handleClose = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Editar Foto de Perfil
          </DialogTitle>
          <DialogDescription>
            Ajuste, redimensione e rotacione sua foto antes de enviar
          </DialogDescription>
        </DialogHeader>

        {!imageSrc ? (
          <div
            className={`relative border-2 border-dashed rounded-lg p-12 transition-colors ${
              isDragging
                ? "border-primary bg-primary/10"
                : "border-border hover:border-primary/50"
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center space-y-4">
              <Upload className="h-16 w-16 text-muted-foreground mx-auto" />
              <div>
                <p className="text-lg font-semibold">
                  Arraste uma foto aqui
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  ou clique no botão abaixo para selecionar
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="mt-4"
              >
                Selecionar Arquivo
              </Button>
              <p className="text-xs text-muted-foreground">
                JPG, PNG ou WEBP • Máximo 5MB
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative h-[400px] bg-muted/20 rounded-lg overflow-hidden">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={onCropCompleteCallback}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <ZoomIn className="h-4 w-4" />
                    Zoom
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {Math.round(zoom * 100)}%
                  </span>
                </div>
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <RotateCw className="h-4 w-4" />
                    Rotação
                  </label>
                  <span className="text-sm text-muted-foreground">
                    {rotation}°
                  </span>
                </div>
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={0}
                  max={360}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancelar
          </Button>
          {imageSrc && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setImageSrc(null);
                  fileInputRef.current?.click();
                }}
                disabled={isUploading}
              >
                Escolher Outra
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={!croppedAreaPixels || isUploading}
              >
                {isUploading ? "Enviando..." : "Confirmar e Enviar"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
