export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center max-w-md mx-auto">
    <p className="text-destructive font-semibold mb-2">Erro ao carregar dados</p>
    <p className="text-sm text-muted-foreground">{message}</p>
  </div>
);
