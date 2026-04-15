"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Heart, Smile, Search, MessageCircle, 
  Zap, Sparkles, LifeBuoy, Telescope, 
  Wind, Layers, PenTool, Rocket,
  MoreHorizontal, Share2, X, Plus
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ManifestationCreator from "@/components/ManifestationCreator";
import UserPresence from "@/components/UserPresence";
import styles from "./page.module.css";

const ACTIONS = [
  { id: 'cuidar', name: "Cuidar", aura: "var(--aura-care)", icon: Heart },
  { id: 'sentir', name: "Sentir", aura: "var(--aura-feel)", icon: Smile },
  { id: 'buscar', name: "Buscar", aura: "var(--aura-seek)", icon: Search },
  { id: 'conectar', name: "Conectar", aura: "var(--aura-connect)", icon: MessageCircle },
  { id: 'expressar', name: "Expressar", aura: "var(--aura-express)", icon: Zap },
  { id: 'perceber', name: "Perceber", aura: "var(--aura-perceive)", icon: Sparkles },
  { id: 'servir', name: "Servir", aura: "var(--aura-serve)", icon: LifeBuoy },
  { id: 'observar', name: "Observar", aura: "var(--aura-observe)", icon: Telescope },
  { id: 'soltar', name: "Soltar", aura: "var(--aura-release)", icon: Wind },
  { id: 'integrar', name: "Integrar", aura: "var(--aura-integrate)", icon: Layers },
  { id: 'criar', name: "Criar", aura: "var(--aura-create)", icon: PenTool },
  { id: 'transcender', name: "Transcender", aura: "var(--aura-transcend)", icon: Rocket },
];

export default function Home() {
  const [currentAura, setCurrentAura] = useState(ACTIONS[3].aura);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const [showNexus, setShowNexus] = useState(false);
  const [manifestations, setManifestations] = useState<any[]>([]);

  useEffect(() => {
    fetchManifestations();
    
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'consciousness_nodes' }, 
        (payload) => {
          setManifestations((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchManifestations = async () => {
    const { data } = await supabase
      .from('consciousness_nodes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (data) setManifestations(data);
  };

  const handleActionClick = (action: any) => {
    setCurrentAura(action.aura);
    setActiveAction(action.id);
    document.documentElement.style.setProperty('--aura-current', action.aura);
    setIsCreating(true);
    setShowNexus(false);
  };

  return (
    <div className={styles.container}>
      {/* Sticky Top Menu */}
      <header className={`${styles.header} glass`}>
        <div className={styles.headerLeft}>
          <button className={styles.logoBtn} onClick={() => setShowNexus(true)} title="Abrir Nexus">
            <div className={styles.logoContainer}>
              <img src="/logo.jpg" alt="Nexus Menu" className={styles.mainLogo} />
            </div>
          </button>
        </div>
        
        <div className={styles.headerRight}>
          <nav className={styles.lateralActions}>
            <button onClick={() => handleActionClick(ACTIONS[0])} className={styles.quickAction} title="Cuidar">
              <Heart size={18} />
            </button>
            <button onClick={() => handleActionClick(ACTIONS[1])} className={styles.quickAction} title="Sentir">
              <Smile size={18} />
            </button>
            <button onClick={() => handleActionClick(ACTIONS[4])} className={styles.quickAction} title="Expressar">
              <Zap size={18} />
            </button>
          </nav>

          <button className={styles.profileBtn} onClick={() => setShowPresence(true)}>
            <div className={styles.avatar}>A</div>
          </button>
        </div>
      </header>

      {/* Sidebar / Nexus Drawer */}
      <AnimatePresence>
        {showNexus && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.overlay}
              onClick={() => setShowNexus(false)}
            />
            <motion.aside 
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`${styles.sidebar} glass`}
            >
              <div className={styles.sidebarHeader}>
                <div className={styles.sidebarBrand}>
                  <img src="/logo.jpg" alt="Logo" className={styles.sidebarLogo} />
                  <h3>Nexus</h3>
                </div>
                <button onClick={() => setShowNexus(false)} className={styles.closeBtn}><X size={20} /></button>
              </div>
              <div className={styles.sidebarGrid}>
                {ACTIONS.map((action) => {
                  const Icon = action.icon;
                  return (
                    <button 
                      key={action.id}
                      className={styles.sidebarAction}
                      onClick={() => handleActionClick(action)}
                    >
                      <Icon size={18} style={{ color: action.aura }} />
                      <span>{action.name}</span>
                    </button>
                  )
                })}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className={styles.feedArea}>
        <div className={styles.feedHeader}>
          <h2>Fluxo Universal</h2>
          <p>Conexões síncronas agora</p>
        </div>

        <div className={styles.feed}>
          <AnimatePresence>
            {manifestations.length === 0 && (
              <p className={styles.emptyHint}>O fluxo está silencioso. Seja o primeiro a manifestar.</p>
            )}
            {manifestations.map((manifest) => (
              <motion.div 
                key={manifest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`${styles.manifestation} glass`}
              >
                <div className={styles.manifestHeader}>
                  <div 
                    className={styles.auraId} 
                    style={{ background: manifest.metadata?.aura || 'var(--aura-connect)' }}
                  ></div>
                  <span className={styles.username}>@presenca_{manifest.id.slice(0, 4)}</span>
                  <span className={styles.actionTag}>{manifest.type}</span>
                </div>
                <p className={styles.content}>{manifest.content}</p>
                <div className={styles.manifestFooter}>
                  <button><Share2 size={16} /> <span>Ecoar</span></button>
                  <button><MoreHorizontal size={16} /> <span>Observar</span></button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </main>

      <button className={styles.fab} onClick={() => setShowNexus(true)}>
        <Plus size={24} />
      </button>

      <AnimatePresence>
        {isCreating && activeAction && (
          <ManifestationCreator 
            action={ACTIONS.find(a => a.id === activeAction)!} 
            onClose={() => setIsCreating(false)} 
          />
        )}
        {showPresence && (
          <UserPresence 
            manifestations={manifestations} 
            onClose={() => setShowPresence(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
