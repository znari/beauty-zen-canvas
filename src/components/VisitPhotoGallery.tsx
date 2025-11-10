import { useState } from "react";
import { Trash2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { useDeleteVisitPhoto } from "@/hooks/useUploadVisitPhotos";
import { toast } from "@/hooks/use-toast";

interface Photo {
  url: string;
  type: "before" | "after";
  uploadedAt: string;
  path: string;
}

interface VisitPhotoGalleryProps {
  visitId: string;
  photos: Photo[];
  editable?: boolean;
}

export const VisitPhotoGallery = ({ visitId, photos, editable = false }: VisitPhotoGalleryProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const deleteMutation = useDeleteVisitPhoto();

  const beforePhotos = photos.filter(p => p.type === "before");
  const afterPhotos = photos.filter(p => p.type === "after");

  const handleDelete = async () => {
    if (!photoToDelete) return;

    try {
      await deleteMutation.mutateAsync({
        visitId,
        photoPath: photoToDelete.path
      });

      toast({
        title: "Foto deletada",
        description: "A foto foi removida com sucesso",
      });

      setPhotoToDelete(null);
      if (selectedPhoto?.path === photoToDelete.path) {
        setSelectedPhoto(null);
      }
    } catch (error) {
      toast({
        title: "Erro ao deletar",
        description: "Ocorreu um erro ao deletar a foto",
        variant: "destructive"
      });
    }
  };

  const openLightbox = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setCurrentIndex(index);
  };

  const navigateLightbox = (direction: "next" | "prev") => {
    const newIndex = direction === "next" 
      ? (currentIndex + 1) % photos.length 
      : (currentIndex - 1 + photos.length) % photos.length;
    
    setCurrentIndex(newIndex);
    setSelectedPhoto(photos[newIndex]);
  };

  if (photos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">Nenhuma foto adicionada ainda</p>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-8">
        {/* Fotos Antes/Depois em Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Coluna Antes */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              Antes
              {beforePhotos.length > 0 && (
                <Badge variant="secondary">{beforePhotos.length}</Badge>
              )}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {beforePhotos.map((photo, idx) => (
                <div key={photo.path} className="relative group">
                  <button
                    onClick={() => openLightbox(photo, photos.indexOf(photo))}
                    className="w-full aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                  >
                    <img 
                      src={photo.url} 
                      alt="Antes do procedimento"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                  
                  {editable && (
                    <button
                      onClick={() => setPhotoToDelete(photo)}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {beforePhotos.length === 0 && (
              <div className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Sem fotos</p>
              </div>
            )}
          </div>

          {/* Coluna Depois */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2">
              Depois
              {afterPhotos.length > 0 && (
                <Badge variant="secondary">{afterPhotos.length}</Badge>
              )}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              {afterPhotos.map((photo, idx) => (
                <div key={photo.path} className="relative group">
                  <button
                    onClick={() => openLightbox(photo, photos.indexOf(photo))}
                    className="w-full aspect-square rounded-lg overflow-hidden border hover:border-primary transition-colors"
                  >
                    <img 
                      src={photo.url} 
                      alt="Depois do procedimento"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </button>
                  
                  {editable && (
                    <button
                      onClick={() => setPhotoToDelete(photo)}
                      className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/90"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {afterPhotos.length === 0 && (
              <div className="h-32 border-2 border-dashed rounded-lg flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Sem fotos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox("prev"); }}
                className="absolute left-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={(e) => { e.stopPropagation(); navigateLightbox("next"); }}
                className="absolute right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div 
            className="max-w-4xl max-h-[90vh] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={selectedPhoto.url} 
              alt={`${selectedPhoto.type === "before" ? "Antes" : "Depois"} do procedimento`}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
            />
            
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              <Badge className="bg-white/20 backdrop-blur-sm">
                {selectedPhoto.type === "before" ? "Antes" : "Depois"}
              </Badge>
              <Badge className="bg-white/20 backdrop-blur-sm">
                {currentIndex + 1} de {photos.length}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!photoToDelete} onOpenChange={() => setPhotoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar foto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A foto será permanentemente removida.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? "Deletando..." : "Deletar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
