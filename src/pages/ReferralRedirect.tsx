import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { saveReferralCode, validateReferralCode } from "@/hooks/useReferralTracking";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Gift } from "lucide-react";
import { Link } from "react-router-dom";

const ReferralRedirect = () => {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid'>('loading');
  const [partnerName, setPartnerName] = useState<string | null>(null);

  useEffect(() => {
    const checkCode = async () => {
      if (!code) {
        setStatus('invalid');
        return;
      }

      const result = await validateReferralCode(code);
      
      if (result.valid) {
        saveReferralCode(code);
        setPartnerName(result.partnerName || null);
        setStatus('valid');
        
        // Redirect to registration after 3 seconds
        setTimeout(() => {
          navigate('/registro');
        }, 3000);
      } else {
        setStatus('invalid');
      }
    };

    checkCode();
  }, [code, navigate]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-muted-foreground mt-4">Validando código de indicação...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {status === 'valid' ? (
              <Gift className="h-8 w-8 text-primary" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive" />
            )}
          </div>
          <CardTitle>
            {status === 'valid' 
              ? "Indicação válida!" 
              : "Código inválido"
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {status === 'valid' ? (
            <>
              {partnerName && (
                <p className="text-muted-foreground">
                  Você foi indicado por <span className="font-semibold text-foreground">{partnerName}</span>
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-green-600 bg-green-50 dark:bg-green-950/20 rounded-lg p-3">
                <CheckCircle2 className="h-5 w-5" />
                <span>Código aplicado com sucesso!</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Redirecionando para o cadastro em 3 segundos...
              </p>
              <Link to="/registro">
                <Button className="w-full">
                  Criar conta agora
                </Button>
              </Link>
            </>
          ) : (
            <>
              <p className="text-muted-foreground">
                O código de indicação "<span className="font-mono">{code}</span>" não é válido ou está inativo.
              </p>
              <div className="space-y-2">
                <Link to="/registro">
                  <Button className="w-full">
                    Criar conta sem indicação
                  </Button>
                </Link>
                <Link to="/">
                  <Button variant="outline" className="w-full">
                    Voltar ao início
                  </Button>
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReferralRedirect;
