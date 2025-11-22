import confetti from 'canvas-confetti';

/**
 * Dispara uma explosão de confetti celebrativa do centro da tela
 * Ideal para sucesso de pagamento
 */
export const celebratePayment = () => {
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    disableForReducedMotion: true,
  });
};

/**
 * Dispara canhões de confetti dos dois lados da tela
 * Efeito mais dramático e prolongado
 */
export const confettiCannon = () => {
  const duration = 3000;
  const end = Date.now() + duration;

  const frame = () => {
    confetti({
      particleCount: 2,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      disableForReducedMotion: true,
    });
    
    confetti({
      particleCount: 2,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6'],
      disableForReducedMotion: true,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };
  
  frame();
};

/**
 * Dispara múltiplas explosões de confetti como fogos de artifício
 * Efeito ultra celebrativo
 */
export const confettiFireworks = () => {
  const duration = 3000;
  const animationEnd = Date.now() + duration;
  const defaults = { 
    startVelocity: 30, 
    spread: 360, 
    ticks: 60, 
    zIndex: 0,
    disableForReducedMotion: true,
  };

  const randomInRange = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      colors: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'],
    });
  }, 250);
};
