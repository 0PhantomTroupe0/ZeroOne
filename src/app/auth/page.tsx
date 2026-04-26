'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Sparkles, Fingerprint, Eye, Zap, X, MoreHorizontal } from 'lucide-react';
import styles from './auth.module.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [hexFlicker, setHexFlicker] = useState(false);
  const [transitionFlicker, setTransitionFlicker] = useState(false);
  const [binaryLeft, setBinaryLeft] = useState('01001001 01001110 01001001 01010100');
  const [binaryRight, setBinaryRight] = useState('01011010 01000101 01010010 01001111');
  const triggerPulse = (id: number) => {
    setActivePulse(id);
    setHoveredShard(id);
    setTimeout(() => {
      setActivePulse(null);
    }, 3000);
  };
  const [crystalAvatars, setCrystalAvatars] = useState<string[]>([]);
  const [colorIndex, setColorIndex] = useState(3);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [showToggleMenu, setShowToggleMenu] = useState(false);
  const [hoveredShard, setHoveredShard] = useState<number | null>(null);
  const [activePulse, setActivePulse] = useState<number | null>(null);
  const router = useRouter();

  const radarColors = [
    'rgba(173, 216, 230, 0.8)', // Shard 1
    'rgba(0, 255, 0, 0.8)',     // Shard 2
    'rgba(0, 0, 139, 0.8)',     // Shard 3
    'rgba(255, 255, 255, 0.8)', // Shard 4
    'rgba(255, 255, 0, 0.8)',   // Shard 5
    'rgba(147, 112, 219, 0.8)', // Shard 6
    'rgba(255, 0, 0, 0.8)',     // Shard 7
    'rgba(255, 140, 0, 0.8)'    // Shard 8
  ];

  useEffect(() => {
    // Inject registered characters into the crystal shards
    const fetchAvatars = async () => {
      const registeredCharacters = [
        '/personagens/LeviamonT.png?v=4',
        '/personagens/BelphemonT.png?v=4',
        '/personagens/DaemonT.png?v=4',
        '/personagens/IlusiomonsT.png?v=4',
        '/personagens/LucemonF.png?v=4',
        '/personagens/LilithmonT.png?v=4',
        '/personagens/BarbamonT.png?v=4',
        '/personagens/BeelzemonT.png?v=4'
      ];
      setCrystalAvatars(registeredCharacters);
    };
    fetchAvatars();

    // Hex flicker logic
    const hexInterval = setInterval(() => {
      setHexFlicker(true);
      setTimeout(() => setHexFlicker(false), 200);
    }, 4500);

    // Random Binary Generator
    const generateBinary = (length: number) => {
      let res = '';
      for (let i = 0; i < length; i++) {
        res += Math.random() > 0.5 ? '1' : '0';
        if ((i + 1) % 8 === 0 && i !== length - 1) res += ' ';
      }
      return res;
    };

    const binInterval = setInterval(() => {
      // Small chance to glitch and freeze briefly, otherwise change rapidly
      if (Math.random() > 0.1) {
        setBinaryLeft(generateBinary(32));
        setBinaryRight(generateBinary(32));
      }
    }, 80); // very fast cyber effect

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate normalized position (-1 to 1)
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = (e.clientY / window.innerHeight) * 2 - 1;
      setMousePosition({ x, y });
    };

    const handleMouseDown = () => setIsMouseDown(true);
    const handleMouseUp = () => setIsMouseDown(false);

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      clearInterval(hexInterval);
      clearInterval(binInterval);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Validação manual para permitir que o ritual de animação ocorra 
      // mesmo que os campos estejam vazios ou incompletos
      if (!email || !password) {
        setTimeout(() => {
          setError('Frequência de acesso não identificada. Preencha todos os campos.');
          setLoading(false);
        }, 2500);
        return;
      }

      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        // Sempre aguarda o ritual de animação completar antes de reagir
        setTimeout(() => {
          if (error) {
            setError(error.message);
            setLoading(false);
          } else {
            router.push('/');
          }
        }, 2500);

      } else {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        setTimeout(() => {
          if (signUpError) {
            setError(signUpError.message);
          } else {
            setMessage('Verifique seu e-mail para confirmar o cadastro!');
          }
          setLoading(false);
        }, 2500);
      }
    } catch (err: any) {
      setTimeout(() => {
        setError(err.message || 'Ocorreu um erro inesperado.');
        setLoading(false);
      }, 2500);
    }
  };

  return (
    <main 
      className={styles.container}
      onPointerDown={() => setIsMouseDown(true)}
      onPointerUp={() => setIsMouseDown(false)}
      onPointerLeave={() => setIsMouseDown(false)}
    >
      <div className={styles.backgroundNoise} />
      <div className={styles.overlayScanner} />

      {/* FULL SCREEN GIANT CRYSTAL BACKGROUND */}
      <div className={styles.crystalBackground}>
        <motion.div 
          className={styles.topLightGlow} 
          animate={{
            x: hoveredShard === 1 ? -30 : hoveredShard === 8 ? 30 : hoveredShard === 4 ? 0 : 0,
            y: hoveredShard !== null ? 10 : 0,
            scale: hoveredShard !== null ? 1.05 : 1
          }}
          transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        />
        
        {/* Core Black Circle + Light */}
        <div className={styles.voidCoreWrapper}>
          <div className={styles.voidCore} />
        </div>
        
        {/* Splinters / broken glass details around the crack */}
        {[
          { id: 1, x: 45, y: 5 },
          { id: 2, x: 53, y: 3 },
          { id: 3, x: 51, y: 8 },
          { id: 4, x: 47, y: 2 },
          { id: 5, x: 48, y: 7 },
          { id: 6, x: 49, y: 4 },
          { id: 7, x: 51.5, y: 1 },
          { id: 8, x: 46, y: 6 },
        ].map((item) => {
          // Calculate individual attraction based on distance (Magnetic effect)
          // mousePosition is -1 to 1. Convert to 0-100 range to match splinter x,y
          const mx = (mousePosition.x + 1) * 50;
          const my = (mousePosition.y + 1) * 50;
          const dx = mx - item.x;
          const dy = my - item.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Magnetic force: stronger when closer
          // We limit the reach so it feels localized
          const power = Math.max(0, 1.5 - dist / 25); 
          const moveX = dx * power * 1.2;
          const moveY = dy * power * 1.2;

          // Gravity effect: if mouse is down, fragments fall to the "floor" and scatter horizontally
          const scatterX = item.id % 2 === 0 ? (200 + item.id * 30) : (-200 - item.id * 30);
          const targetY = isMouseDown ? 1200 : moveY; 
          const targetX = isMouseDown ? scatterX : moveX;

          return (
            <motion.div 
              key={`splinter-wrapper-${item.id}`}
              style={{
                position: 'absolute',
                top: 0, left: 0, width: '100%', height: '100%',
                pointerEvents: 'none',
                zIndex: 3,
              }}
              animate={{
                x: targetX,
                y: targetY,
                scale: isMouseDown ? 0.6 : (1 + power * 0.2),
                rotate: isMouseDown ? (item.id * 45) : 0,
                opacity: isMouseDown ? 0.8 : 1
              }}
              transition={isMouseDown ? {
                y: { duration: 1.5, ease: "easeIn" }, // Straight fall
                x: { duration: 0.4 }, // Reset to straight line
                rotate: { duration: 1.5, ease: 'linear' },
                scale: { duration: 0.4 }
              } : {
                type: 'spring',
                stiffness: 45,
                damping: 20,
                mass: 0.5 
              }}
            >
              <div 
                className={`${styles.splinter} ${styles[`sp${item.id}` as keyof typeof styles]}`}
              />
            </motion.div>
          );
        })}

        {[...Array(8)].map((_, i) => (
          <motion.div 
            key={`shard-${i+1}`}
            className={`${styles.crystalShard} ${styles[`shard${i+1}` as keyof typeof styles]}`}
            onMouseEnter={() => triggerPulse(i + 1)}
            onMouseLeave={() => setHoveredShard(null)}
            animate={{
              scale: hoveredShard === (i + 1) ? 0.96 : 1,
              filter: hoveredShard === (i + 1) ? 'brightness(0.7) blur(2px)' : 'brightness(1) blur(0px)',
              z: hoveredShard === (i + 1) ? -50 : 0
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            style={{ pointerEvents: 'auto' }}
          >
            {/* 3-Second Illumination Glow Overlay */}
            <motion.div 
              className={styles.shardPulseOverlay}
              initial={{ opacity: 0 }}
              animate={{ 
                opacity: activePulse === (i + 1) ? [0, 1, 0.4, 0] : 0 
              }}
              transition={{ 
                duration: 3,
                times: [0, 0.1, 0.3, 1],
                ease: "easeOut"
              }}
            />

            {crystalAvatars[i] && (
              <motion.div 
                className={styles.reflectionWrapper}
                animate={{
                  filter: hoveredShard === (i + 1) 
                    ? 'grayscale(100%) brightness(1.2) contrast(1.1)' 
                    : 'none'
                }}
                transition={{ duration: 0.4 }}
              >
                <img 
                  src={crystalAvatars[i]} 
                  className={styles.shardReflection} 
                  alt="" 
                />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Global Alien Analyzing Scanner - left to right */}
      <div className={styles.globalScanner}>
        <div className={styles.scannerLine}></div>
        <div className={styles.scannerGrid}></div>
      </div>

      {/* Left side announcement */}
      <motion.div 
        className={`${styles.sidePanel} ${styles.sidePanelLeft}`}
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2, duration: 0.8 }}
      >
        <div className={styles.binaryCode} style={{ marginBottom: '1.5rem', opacity: 0.4 }}>
          {binaryLeft}
        </div>
        <div className={styles.cyberDecal}>Zero Day</div>
        <Eye className={styles.sideIcon} size={48} strokeWidth={1} />
        <h2 className={styles.sideTitle}>Chegou a hora de se conhecer verdadeiramente</h2>
        <p className={styles.sideText}>
          O Oculto deixará de ser invisível.<br />
          Aquilo que antes habitava nas entrelinhas da existência começa a emergir, como um sussurro que ganha forma, como uma frequência que finalmente encontra quem a escute.<br /><br />
          Preparando espectros para o que está por vir…
        </p>
        <div className={styles.neonBar} />
        <div className={styles.binaryCode}>
          {binaryLeft}
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`${styles.authCard} ${transitionFlicker ? styles.radarTransitionActive : ''}`}
      >
        {!isLogin && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.statusHeader}
          >
            <div className={styles.statusLabel}>
              <span className={styles.statusLight} />
              <span>CADASTRANDO</span>
              <span className={styles.statusLight} />
            </div>
          </motion.div>
        )}
        {/* 12-Piece Fractured Window Matrix */}
        <div className={styles.authFragmentFrame}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`${styles.authPiece} ${styles[`ap${i+1}`]}`} />
          ))}
        </div>

        {/* --- NOVO: Atmosfera e Espiral --- */}
        <div className={styles.radarAtmosphere}>
          <div className={styles.windWisp} />
          <div className={styles.windWisp} style={{ animationDelay: '-2s', opacity: 0.3 }} />
        </div>
        
        <svg className={styles.radarVortex} viewBox="0 0 480 480">
          <path 
            d="M240,240 c 0,0 20,-20 40,0 c 20,20 0,60 -40,60 c -60,0 -80,-60 -40,-100 c 60,-60 140,-20 140,60 c 0,100 -120,140 -200,80 c -100,-80 -60,-220 60,-240 c 160,-20 220,140 120,240" 
            fill="none" 
            stroke="white" 
            strokeWidth="1.5" 
            strokeLinecap="round"
            className={styles.vortexPath}
          />
        </svg>

        <button 
          className={styles.radarColorBtn}
          onClick={() => {
            setTransitionFlicker(true);
            setTimeout(() => setTransitionFlicker(false), 300);
            setColorIndex((colorIndex + 1) % radarColors.length);
          }}
          title="Sincronizar Frequência de Cor"
          type="button"
        >
          <div className={styles.waterOrbitContainer}>
            <div className={`${styles.waterWisp} ${styles.wisp1}`} />
            <div className={`${styles.waterWisp} ${styles.wisp2}`} />
            <div className={`${styles.waterWisp} ${styles.wisp3}`} />
          </div>
          <div className={styles.radarBtnGlow} />
        </button>

        <div className={styles.authContentWrapper}>
          <div 
            className={`${styles.hexBackground} ${hexFlicker ? styles.hexFlickerActive : ''}`}
            style={{ '--radar-accent': radarColors[colorIndex] } as any}
          >
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`${styles.radarSignal} ${styles[`sig${i+1}`]}`} />
            ))}
          </div>

          {/* Circular Radar Text Overlay */}
          <svg className={styles.radarTextSvg} viewBox="0 0 480 480">
            <path id="radarCurve" d="M 240, 240 m -220, 0 a 220,220 0 1,1 440,0 a 220,220 0 1,1 -440,0" fill="none" />
            <text 
              className={`${styles.radarTextContent} ${error ? styles.errorRadarText : ''}`} 
              style={error ? { fill: '#ff3c3c' } : {}}
            >
              <textPath href="#radarCurve" startOffset="0%" textLength="1382" lengthAdjust="spacing">
                {!error 
                  ? '' 
                  : 'FREQUÊNCIA DE ACESSO NÃO IDENTIFICADA. PREENCHA TODOS OS CAMPOS. ✦ ✦ ✦ ✦ ✦ FREQUÊNCIA DE ACESSO NÃO IDENTIFICADA. PREENCHA TODOS OS CAMPOS. ✦ ✦ ✦ ✦ ✦ '}
              </textPath>
            </text>
          </svg>



        <form onSubmit={handleAuth} className={styles.form}>
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={styles.errorOverlay}
              >
                <span>{error}</span>
                <button 
                  type="button" 
                  onClick={() => setError(null)}
                  className={styles.closeAlert}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
            {message && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                className={styles.successOverlay}
              >
                <span>{message}</span>
                <button 
                  type="button" 
                  onClick={() => setMessage(null)}
                  className={styles.closeAlert}
                >
                  <X size={14} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className={styles.inputGroup}>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                placeholder="••••••••"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={styles.input}
              />
              <div className={styles.inputBorder} />
            </div>
            <div className={styles.externalIconBottom}>
              <Mail size={16} />
            </div>
          </div>

          <div style={{ height: '80px', flexShrink: 0 }} />

          <div className={styles.inputGroup}>
            <div className={styles.externalIconTop}>
              <Lock size={16} />
            </div>
            <div className={styles.inputWrapper}>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={styles.input}
              />
              <div className={styles.inputBorder} />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`${styles.logoBtn} ${loading ? styles.logoLoading : ''}`}
            title={isLogin ? 'Adentrar o Nexo' : 'Manifestar Existência'}
          >
            <div className={styles.logoArea}>
              <div className={styles.logoBorder} style={loading ? { filter: 'saturate(5) hue-rotate(90deg) brightness(1.5)' } : {}}>
                 <div className={styles.logoInner}>
                   <img src="/logo.jpg" alt="ZeroDay Logo" className={styles.appLogo} style={loading ? { opacity: 0.5, filter: 'grayscale(100%)' } : {}} />
                 </div>
              </div>
            </div>
          </button>
        </form>

      </div>
      <div className={styles.toggleArea}>
        <button 
          type="button"
          className={styles.dotsBtn}
          onClick={() => setShowToggleMenu(!showToggleMenu)}
        >
          <MoreHorizontal size={24} />
        </button>
        
        <AnimatePresence>
          {showToggleMenu && (
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              type="button"
              onClick={() => {
                setTransitionFlicker(true);
                setTimeout(() => setTransitionFlicker(false), 600);
                setIsLogin(!isLogin);
                setError(null);
                setMessage(null);
                setShowToggleMenu(false);
              }}
              className={styles.toggleBtn}
              style={{ 
                fontSize: '0.9rem', 
                letterSpacing: '4px',
                '--radar-accent': radarColors[colorIndex]
              } as any}
            >
              {isLogin ? 'MATERIALIZAR' : 'DISSOLVER'}
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      </motion.div>

      {/* Right side announcement */}
      <motion.div 
        className={`${styles.sidePanel} ${styles.sidePanelRight}`}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        <div className={styles.binaryCode} style={{ marginBottom: '1.5rem', opacity: 0.4 }}>
          {binaryRight}
        </div>
        <div className={styles.cyberDecal}>Dia Zero</div>
        <Fingerprint className={styles.sideIcon} size={48} strokeWidth={1} />
        <h2 className={styles.sideTitle}>Crie sua indêntidade digital e faça a Simbiose.</h2>
        <p className={styles.sideText}>
          Entre no Mundo Digital Novo, um limiar onde véus se dissolvem e a realidade deixa de ser apenas aquilo que os olhos alcançam. Aqui, o físico e o espiritual não caminham separados… 
          <br /><br />
          Eles se entrelaçam, se fundem, respiram como um só fluxo vivo.
        </p>
        <div className={styles.neonBar} />
        <div className={styles.binaryCode}>
          {binaryRight}
        </div>
      </motion.div>

      <div className={styles.glitchQuote}>
        "E se todas as suas verdades fossem apagadas, o que você escolheria acreditar?"
      </div>

      <div className={styles.langSelector}>
        <button className={styles.langBtn}>PT-BR</button>
        <div className={styles.langSeparator} />
        <button className={styles.langBtn} style={{ opacity: 0.5 }}>EN-US</button>
      </div>
    </main>
  );
}
