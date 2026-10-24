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
  const [binaryLeft] = useState('01001001 01001110 01001001 01010100');
  const [binaryRight] = useState('01011010 01000101 01010010 01001111');
  const [crystalAvatars, setCrystalAvatars] = useState<string[]>([]);
  const [colorIndex, setColorIndex] = useState(3);
  const [showToggleMenu, setShowToggleMenu] = useState(false);
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
    <main className={styles.container}>
      {/* FULL SCREEN GIANT CRYSTAL BACKGROUND */}
      <div className={styles.crystalBackground}>
        {[...Array(8)].map((_, i) => (
          <div 
            key={`shard-${i+1}`}
            className={`${styles.crystalShard} ${styles[`shard${i+1}` as keyof typeof styles]}`}
          >
            {crystalAvatars[i] && (
              <div className={styles.reflectionWrapper}>
                <img 
                  src={crystalAvatars[i]} 
                  className={styles.shardReflection} 
                  alt="" 
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Left side announcement */}
      <div className={`${styles.sidePanel} ${styles.sidePanelLeft}`}>
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
      </div>
      
      <div className={styles.authCard}>
        {!isLogin && (
          <div className={styles.statusHeader}>
            <div className={styles.statusLabel}>
              <span className={styles.statusLight} />
              <span>CADASTRANDO</span>
              <span className={styles.statusLight} />
            </div>
          </div>
        )}
        {/* 12-Piece Fractured Window Matrix */}
        <div className={styles.authFragmentFrame}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`${styles.authPiece} ${styles[`ap${i+1}`]}`} />
          ))}
        </div>

        <button 
          className={styles.radarColorBtn}
          onClick={() => {
            setColorIndex((colorIndex + 1) % radarColors.length);
          }}
          title="Sincronizar Frequência de Cor"
          type="button"
        >
          <div className={styles.radarBtnGlow} />
        </button>

        <div className={styles.authContentWrapper}>
          <div 
            className={styles.hexBackground}
            style={{ '--radar-accent': radarColors[colorIndex] } as any}
          />

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
          {error && (
            <div className={styles.errorOverlay}>
              <span>{error}</span>
              <button 
                type="button" 
                onClick={() => setError(null)}
                className={styles.closeAlert}
              >
                <X size={14} />
              </button>
            </div>
          )}
          {message && (
            <div className={styles.successOverlay}>
              <span>{message}</span>
              <button 
                type="button" 
                onClick={() => setMessage(null)}
                className={styles.closeAlert}
              >
                <X size={14} />
              </button>
            </div>
          )}

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
            className={styles.logoBtn}
            title={isLogin ? 'Adentrar o Nexo' : 'Manifestar Existência'}
          >
            <div className={styles.logoArea}>
              <div className={styles.logoBorder}>
                 <div className={styles.logoInner}>
                   <img src="/logo.jpg" alt="ZeroDay Logo" className={styles.appLogo} />
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
        
        {showToggleMenu && (
          <button 
            type="button"
            onClick={() => {
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
          </button>
        )}
      </div>
      </div>

      {/* Right side announcement */}
      <div className={`${styles.sidePanel} ${styles.sidePanelRight}`}>
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
      </div>

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
