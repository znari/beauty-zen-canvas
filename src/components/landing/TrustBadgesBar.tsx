import { Shield, Users, Clock } from "lucide-react";

export const TrustBadgesBar = () => {
  return (
    <section className="py-8 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row flex-wrap justify-center items-center gap-6 sm:gap-8 md:gap-16">
          {/* Badge 1 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">+500 profissionais</p>
              <p className="text-xs text-muted-foreground">Já transformaram sua gestão</p>
            </div>
          </div>

          {/* Badge 2 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">100% Seguro</p>
              <p className="text-xs text-muted-foreground">Dados criptografados</p>
            </div>
          </div>

          {/* Badge 3 */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Configure em 5 minutos</p>
              <p className="text-xs text-muted-foreground">Comece a usar hoje mesmo</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
