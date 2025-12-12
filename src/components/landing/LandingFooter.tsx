import { Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_WHATSAPP } from "@/lib/constants";

export const LandingFooter = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-muted/30 border-t border-border py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <h3 className="text-2xl font-bold text-foreground">FichaZen</h3>
            <p className="text-sm text-muted-foreground">
              O micro-CRM feito para profissionais de beleza que querem mais organização e menos papelada.
            </p>
          </div>

          {/* Links - Navegação */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("hero")}
                  className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  Início
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  Funcionalidades
                </button>
              </li>
              <li>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  Preço
                </button>
              </li>
              <li>
                <Link to="/login" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Links - Suporte */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Suporte</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => scrollToSection("help")}
                  className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  FAQ
                </button>
              </li>
              <li>
                <a
                  href={`https://wa.me/${SUPPORT_WHATSAPP}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-secondary transition-colors"
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <Link to="/suporte" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                  Central de Ajuda
                </Link>
              </li>
            </ul>
          </div>

          {/* Redes Sociais */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Redes Sociais</h4>
            <div className="flex gap-4">
              <a
                href="https://instagram.com/fichazen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a
                href="https://facebook.com/fichazen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-accent flex items-center justify-center hover:bg-secondary hover:text-secondary-foreground transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-muted-foreground mb-1">© 2025 FichaZen. Todos os direitos reservados.</p>
              <p className="text-xs text-muted-foreground">🇧🇷 Feito com ❤️ no Brasil</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-center sm:text-left">
              <Link to="/privacidade" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                Política de Privacidade
              </Link>
              <Link to="/termos" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                Termos de Uso
              </Link>
              <Link to="/lgpd" className="text-sm text-muted-foreground hover:text-secondary transition-colors">
                LGPD
              </Link>
            </div>
          </div>

          {/* Security badges */}
          <div className="flex justify-center items-center gap-4 pt-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 bg-secondary/20 rounded-full flex items-center justify-center">🔒</span>
              <span>SSL Seguro</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 bg-secondary/20 rounded-full flex items-center justify-center">✓</span>
              <span>LGPD Compliant</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-4 h-4 bg-secondary/20 rounded-full flex items-center justify-center">💳</span>
              <span>Pagamento Seguro</span>
            </div>
          </div>

          {/* Company Info */}
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">NEXUS LAB SOLUCOES EM TECNOLOGIA E INTELIGENCIA ARTIFICIAL LTDA</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">CNPJ: 64.037.239/0001-19</p>
            <p className="text-xs text-muted-foreground mt-1">
              <a href="mailto:contato@nexuslab.net.br" className="hover:text-secondary transition-colors">
                contato@nexuslab.net.br
              </a>
            </p>
          </div>

          {/* Developer Credits - Destaque Final */}
          <div className="mt-4 pt-4 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">
              Desenvolvido por{" "}
              <a
                href="https://nexuslab.net.br/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-secondary hover:text-secondary/80 transition-colors"
              >
                Nexus Lab Soluções em Tecnologia
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
