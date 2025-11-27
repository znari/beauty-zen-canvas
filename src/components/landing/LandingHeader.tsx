import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const LandingHeader = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold text-foreground hover:text-secondary transition-colors">
            FichaZen
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('features')} 
              className="text-foreground hover:text-secondary transition-colors"
            >
              Funcionalidades
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="text-foreground hover:text-secondary transition-colors"
            >
              Preço
            </button>
            <button 
              onClick={() => scrollToSection('help')} 
              className="text-foreground hover:text-secondary transition-colors"
            >
              Ajuda
            </button>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button variant="hero" size="lg" asChild>
              <Link to="/registro">Teste grátis por 15 dias</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4 animate-fade-in">
            <button 
              onClick={() => scrollToSection('features')} 
              className="block w-full text-left text-foreground hover:text-secondary transition-colors py-2"
            >
              Funcionalidades
            </button>
            <button 
              onClick={() => scrollToSection('pricing')} 
              className="block w-full text-left text-foreground hover:text-secondary transition-colors py-2"
            >
              Preço
            </button>
            <button 
              onClick={() => scrollToSection('help')} 
              className="block w-full text-left text-foreground hover:text-secondary transition-colors py-2"
            >
              Ajuda
            </button>
            <div className="flex flex-col gap-2 pt-2">
              <Button variant="outline" className="w-full" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button variant="hero" className="w-full" asChild>
                <Link to="/registro">Teste grátis por 15 dias</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
