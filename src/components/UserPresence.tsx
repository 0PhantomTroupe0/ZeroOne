"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { 
  X, LogOut, History, Award, 
  Settings, ChevronRight, 
  Minimize2, Maximize2, User,
  Sparkles, Palette
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./UserPresence.module.css";

interface UserPresenceProps {
  manifestations: any[];
  onClose?: () => void;
  onOpenSettings?: () => void;
  showLogout?: boolean;
  showHistory?: boolean;
  initiallyMinimized?: boolean;
  targetId?: string;
  selectedColor?: string;
  profile?: any;
}

export default function UserPresence({ 
  manifestations, 
  onClose, 
  onOpenSettings, 
  showLogout = true, 
  showHistory = true,
  initiallyMinimized = false,
  targetId,
  selectedColor = '#ffffff',
  profile: propProfile
}: UserPresenceProps) {
  const [profile, setProfile] = useState<any>(propProfile || null);

  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
    }
  }, [propProfile]);
  const [targetManifestations, setTargetManifestations] = useState<any[]>(manifestations);
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [isMinimized, setIsMinimized] = useState(initiallyMinimized);
  const router = useRouter();

  useEffect(() => {
    fetchProfileAndData();
    if (!targetId) fetchPendingRequests();
  }, [manifestations, targetId]);

  const fetchProfileAndData = async () => {
    if (propProfile) return;
    
    let uid = targetId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      uid = user?.id;
    }

    if (uid) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', uid)
        .single();
      setProfile(profileData);

      // If we are looking at someone else, we need their specific manifestations
      if (targetId) {
        const { data: nodes } = await supabase
          .from('consciousness_nodes')
          .select('*')
          .eq('user_id', uid)
          .order('created_at', { ascending: false });
        if (nodes) setTargetManifestations(nodes);
      } else {
        setTargetManifestations(manifestations);
      }
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('world_requests')
        .select(`
          id,
          requester_id,
          target_id,
          status,
          requester:profiles!world_requests_requester_id_fkey(username, avatar_url, full_name, world_name)
        `)
        .eq('target_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setPendingRequests(data || []);
    } catch (err) {
      console.error("Erro ao buscar pedidos:", err);
    }
  };

  const handleAcceptRequest = async (request: any) => {
    try {
      // 1. Aceitar o pedido
      const { error: updError } = await supabase
        .from('world_requests')
        .update({ status: 'accepted' })
        .eq('id', request.id);
      
      if (updError) throw updError;

      // 2. Criar a conexão de seguimento
      const { error: followError } = await supabase
        .from('user_follows')
        .insert({
          follower_id: request.requester_id,
          following_id: request.target_id
        });
      
      if (followError) throw followError;

      // 3. Notificar o requerente
      await supabase
        .from('notifications')
        .insert({
          user_id: request.requester_id,
          type: 'request_accepted',
          title: 'Sintonização Aceita!',
          content: `${profile?.username || 'Uma consciência'} aceitou sua entrada no mundo dela.`,
          link: `/profile/${request.target_id}`,
          is_read: false
        });

      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
      // Removed alert per user request
    } catch (err) {
      console.error("Erro ao aceitar pedido:", (err as any).message);
      // Removed alert per user request
    }
  };

  const handleDenyRequest = async (requestId: string) => {
    try {
      await supabase
        .from('world_requests')
        .update({ status: 'denied' })
        .eq('id', requestId);
      setPendingRequests(prev => prev.filter(r => r.id !== requestId));
    } catch (err) {
      console.error("Erro ao recusar pedido:", err);
    }
  };


  // Group manifestations by type to calculate balance (use targetManifestations)
  const stats = targetManifestations.reduce((acc: any, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const maxVal = Math.max(...Object.values(stats) as number[], 1);

  const actions = [
    { id: 'perceber', name: "Perceber", color: "#ff0000" },
    { id: 'observar', name: "Observar", color: "#ff6600" },
    { id: 'sentir', name: "Sentir", color: "#ffdd00" },
    { id: 'integrar', name: "Integrar", color: "#555555" },
    { id: 'conectar', name: "Harmonizar", color: "#00ff44" },
    { id: 'expressar', name: "Expressar", color: "#00ffff" },
    { id: 'criar', name: "Criar", color: "#0055ff" },
    { id: 'buscar', name: "Sincronizar", color: "#aaff00" },
    { id: 'cuidar', name: "Emanar", color: "#3300ff" },
    { id: 'servir', name: "Entrelaçar", color: "#8800ee" },
    { id: 'soltar', name: "Purificar", color: "#ff00cc" },
    { id: 'transcender', name: "Transcender", color: "#ffffff" },
  ];

  const ARQUETIPOS = [
    "😈 LUCEMON (Orgulho)", "👿 BARBAMON (Ganância)", "💋 LILITHMON (Luxúria)", 
    "🔥 BEELZEMON (Inveja)", "🌑 BELPHEMON (Gula)", "👹 DAEMON (Raiva)", 
    "🐍 LEVIAMON (Apatia)", "👁️ ILUSSIONMON (Matrix)"
  ];

  const totalManifestations = targetManifestations.length;
  const currentLevel = (totalManifestations % 33) || (totalManifestations > 0 ? 33 : 0);
  const arquetipoIndex = Math.floor(totalManifestations / 33) % ARQUETIPOS.length;
  const currentArquetipo = ARQUETIPOS[arquetipoIndex];

  const getBorderStyle = () => {
    return styles[`archetype_${arquetipoIndex}` as keyof typeof styles];
  };

  // Sort actions by count descending for better visual hierarchy
  const sortedActions = [...actions].sort((a, b) => (stats[b.id] || 0) - (stats[a.id] || 0));

  if (isMinimized) {
    return (
      <motion.div 
        className={styles.minimizedTab}
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        onClick={() => setIsMinimized(false)}
      >
        <Maximize2 size={16} />
        <span>MINHA FREQUÊNCIA</span>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className={styles.container}
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
    >
      <div className={styles.worldBanner}>
        {profile?.world_image && (
          <motion.img 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            src={profile.world_image} 
            alt="World" 
            className={styles.bannerImg}
          />
        )}
        <div className={styles.bannerOverlay}></div>
      </div>

      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerControls}>
            <button onClick={() => setIsMinimized(true)} className={styles.minimizeBtn} title="Minimizar">
              <Minimize2 size={20} />
            </button>
            {onClose && (
              <button onClick={onClose} className={styles.closeBtn} title="Fechar Presença">
                <X size={20} />
              </button>
            )}
          </div>
        </div>
        
        <div className={styles.profileSection}>
          <div className={`${styles.avatarLarge} ${getBorderStyle()}`}>
            {/* CLOAK OF WIND */}
            {profile?.cloak_enabled && (
              <motion.div 
                className={styles.profileCloakContainer}
                animate={{ y: [0, 2, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <AnimatePresence mode="wait">
                  {profile.cloak_type === 'ocular_radar' ? (
                    <svg viewBox="0 0 200 240" className={styles.cloakSvg} style={{ color: profile.cloak_color || profile.nexo_color || '#00f3ff', overflow: 'visible', width: '90px', height: '110px' }}>
                      <g transform="translate(0, -25)">
                      {/* Support arm */}
                      <path d="M140 60 L160 60 L160 50" fill="none" stroke="currentColor" strokeWidth="4" />
                      {/* Screen */}
                      <rect x="40" y="0" width="120" height="120" rx="4" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="2" />
                      <defs>
                        <linearGradient id="linearScanGradPresence" x1="1" y1="0" x2="0" y2="0">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <motion.g
                        initial={{ x: 40 }}
                        animate={{ x: [40, 160, 40] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                      >
                         <motion.g
                           animate={{ scaleX: [1, 1, -1, -1, 1] }}
                           transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.55, 0.95, 1] }}
                         >
                            <rect x="-40" y="0" width="40" height="120" fill="url(#linearScanGradPresence)" fillOpacity="0.3" />
                         </motion.g>
                         <line x1="0" y1="0" x2="0" y2="120" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      </motion.g>
                    </g>
                  </svg>
                  ) : profile.cloak_type === 'circular_radar' ? (
                    <svg viewBox="0 0 200 240" className={styles.cloakSvg} style={{ color: profile.cloak_color || profile.nexo_color || '#00f3ff', overflow: 'visible', width: '90px', height: '110px' }}>
                      <g transform="translate(0, -20)">
                        {/* Support */}
                        <path d="M140 70 L160 70 L160 60" fill="none" stroke="currentColor" strokeWidth="4" />
                        <circle cx="100" cy="70" r="63" fill="rgba(0,0,0,0.2)" stroke="currentColor" strokeWidth="2" />
                        <defs>
                          <clipPath id="radarCircleClipPresence">
                            <circle cx="100" cy="70" r="63" />
                          </clipPath>
                        </defs>
                        <motion.g
                          clipPath="url(#radarCircleClipPresence)"
                          initial={{ x: 37 }}
                          animate={{ x: [37, 163, 37] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        >
                           <motion.g
                             animate={{ scaleX: [1, 1, -1, -1, 1] }}
                             transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.55, 0.95, 1] }}
                           >
                              <rect x="-40" y="0" width="40" height="140" fill="url(#linearScanGradPresence)" fillOpacity="0.3" />
                           </motion.g>
                           <line x1="0" y1="0" x2="0" y2="140" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </motion.g>
                      </g>
                    </svg>
                  ) : profile.cloak_type === 'jetpack' ? (
                    <svg viewBox="0 0 200 240" className={styles.cloakSvg} style={{ color: profile.cloak_color || profile.nexo_color || '#ff5500', overflow: 'visible', width: '90px', height: '110px' }}>
                      <rect x="60" y="40" width="35" height="70" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                      <rect x="105" y="40" width="35" height="70" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                      <rect x="75" y="55" width="50" height="40" rx="2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />
                      
                      {/* Mini Gears */}
                      <motion.circle cx="77" cy="75" r="4" fill="none" stroke="currentColor" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                      <motion.circle cx="123" cy="75" r="4" fill="none" stroke="currentColor" animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />

                      {/* Fire Thrusters */}
                      {[77, 123].map((x, i) => (
                        <g key={`thruster-p-${i}`}>
                          <rect x={x - 8} y="110" width="16" height="10" rx="2" fill="currentColor" opacity="0.6" />
                          <motion.path 
                            d={`M${x - 6} 120 Q${x} 160 ${x + 6} 120`}
                            fill="white"
                            animate={{ opacity: [0.6, 1, 0.6], scaleY: [1, 1.3, 1] }}
                            transition={{ duration: 0.15, repeat: Infinity }}
                          />
                        </g>
                      ))}
                    </svg>
                  ) : (
                    <svg viewBox="0 0 200 240" className={styles.cloakSvg} style={{ color: profile.cloak_color || profile.nexo_color || '#00f3ff' }}>
                      <defs>
                        <linearGradient id="cloakGradPresence" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
                          <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                        </linearGradient>
                      </defs>
                      <motion.path 
                        d="M60 40 C30 40 10 100 0 160 C0 220 40 240 70 235 C100 230 100 230 130 235 C160 240 200 220 200 160 C190 100 170 40 140 40 L60 40 Z"
                        fill="url(#cloakGradPresence)"
                        animate={{
                          d: [
                            "M60 40 C30 40 10 100 0 160 C0 220 40 240 70 235 C100 230 100 230 130 235 C160 240 200 220 200 160 C190 100 170 40 140 40 L60 40 Z",
                            "M60 40 C35 45 15 105 5 165 C5 225 45 235 75 232 C100 228 100 228 125 232 C155 235 195 225 195 165 C185 105 165 45 140 40 L60 40 Z",
                            "M60 40 C30 40 10 100 0 160 C0 220 40 240 70 235 C100 230 100 230 130 235 C160 240 200 220 200 160 C190 100 170 40 140 40 L60 40 Z"
                          ]
                        }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </svg>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* HAT MODELS SYNCED WITH PROFILE PAGE */}
            {profile?.hat_enabled && (
              <AnimatePresence mode="wait">
                {profile.hat_type === 'headband' ? (
                  <motion.div 
                    key="presence-hat-headband"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <svg viewBox="0 0 100 100" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff', overflow: 'visible' }}>
                      <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="3" strokeOpacity="0.8" />
                      <g fontSize="12" fill="currentColor" opacity="0.9" style={{ fontFamily: 'monospace' }}>
                         {[...Array(20)].map((_, i) => (
                          <motion.text 
                            key={`bp-faixa-${i}`} 
                            x={-10 + Math.random() * 120} 
                            y={Math.random() < 0.5 ? -10 : 110}
                            animate={{ 
                              opacity: [0, 1, 0],
                              y: [null, Math.random() < 0.5 ? -40 : 140]
                            }} 
                            transition={{ duration: 1.2 + Math.random() * 1.5, repeat: Infinity, delay: Math.random() * 2 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'newsboy' ? (
                  <motion.div 
                    key="presence-hat-newsboy"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <svg viewBox="0 0 100 60" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff' }}>
                      <path d="M5 40 L15 15 L50 5 L85 15 L95 40 Q50 45 5 40" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M25 40 Q50 55 75 40 L70 35 Q50 40 30 35 Z" fill="#000" fillOpacity="0.8" stroke="currentColor" strokeWidth="1" />
                      <g fontSize="10" fill="currentColor" opacity="0.8" style={{ fontFamily: 'monospace' }}>
                         {[...Array(6)].map((_, i) => (
                          <motion.text 
                            key={`bp-${i}`} 
                            x={10 + Math.random() * 80} 
                            y={5 + Math.random() * 40}
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'halo' ? (
                  <motion.div 
                    key="presence-hat-halo"
                    className={styles.hatContainer}
                    style={{ top: '-40px' }}
                  >
                    <svg viewBox="0 0 200 100" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff', overflow: 'visible', width: '80px', height: '40px' }}>
                      <ellipse cx="100" cy="50" rx="80" ry="15" fill="none" stroke="currentColor" strokeWidth="5" />
                      <g fontSize="15" fill="currentColor" opacity="0.8" style={{ fontFamily: 'monospace' }}>
                         {[...Array(8)].map((_, i) => (
                          <motion.text 
                            key={`bp-${i}`} 
                            x={20 + Math.random() * 160} 
                            y={20 + Math.random() * 60}
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'goat_horns' ? (
                  <motion.div 
                    key="presence-hat-horns"
                    className={styles.hatContainer}
                    style={{ top: '-35px' }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ff3333', overflow: 'visible', width: '90px', height: '90px' }}>
                        <path d="M60 100 Q40 60 45 40 Q50 30 55 20 Q55 40 65 100" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
                        <path d="M100 100 Q120 60 115 40 Q110 30 105 20 Q105 40 95 100" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2" />
                        <g fontSize="14" fill="currentColor" opacity="0.8" style={{ fontFamily: 'monospace' }}>
                         {[...Array(12)].map((_, i) => (
                          <motion.text 
                            key={`bp-${i}`} 
                            x={10 + Math.random() * 140} 
                            y={10 + Math.random() * 140}
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 1.5 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'sharp_horns' ? (
                  <motion.div 
                    key="presence-hat-sharp"
                    className={styles.hatContainer}
                    style={{ top: '-40px' }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ff0000', overflow: 'visible', width: '80px', height: '80px' }}>
                        <path d="M70 100 L60 20 L80 100" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M90 100 L100 20 L110 100" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="1.5" />
                        <g fontSize="14" fill="currentColor" opacity="0.8" style={{ fontFamily: 'monospace' }}>
                         {[...Array(10)].map((_, i) => (
                          <motion.text 
                            key={`bp-sharp-${i}`} 
                            x={50 + Math.random() * 60} 
                            y={Math.random() * 100}
                            animate={{ opacity: [0, 1, 0], y: [null, -30] }} 
                            transition={{ duration: 1.5 + Math.random(), repeat: Infinity }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'curved_horns' ? (
                  <motion.div 
                    key="presence-hat-curved"
                    className={styles.hatContainer}
                    style={{ top: '-40px' }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ff00ff', overflow: 'visible', width: '85px', height: '85px' }}>
                        <path d="M65 100 C 45 70, 45 40, 60 20 C 55 40, 55 70, 75 100" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
                        <path d="M95 100 C 115 70, 115 40, 100 20 C 105 40, 105 70, 85 100" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
                        <g fontSize="14" fill="currentColor" opacity="0.8" style={{ fontFamily: 'monospace' }}>
                         {[...Array(10)].map((_, i) => (
                          <motion.text 
                            key={`bp-curved-${i}`} 
                            x={20 + Math.random() * 120} 
                            y={Math.random() * 160}
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'crown' ? (
                  <motion.div 
                    key="presence-hat-crown"
                    className={styles.hatContainer}
                    style={{ top: '-45px' }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ffd700', overflow: 'visible', width: '75px', height: '75px' }}>
                        <path d="M40 110 L40 85 L50 100 L60 70 L70 100 L80 50 L90 100 L100 70 L110 100 L120 85 L120 110 Z" fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2" />
                        {[
                          { x: 40, y: 85 }, { x: 50, y: 100 }, { x: 60, y: 70 }, 
                          { x: 80, y: 50 }, 
                          { x: 100, y: 70 }, { x: 110, y: 100 }, { x: 120, y: 85 }
                        ].map((pos, i) => {
                          return (
                            <motion.circle 
                              key={`p-sparkle-${i}`} cx={pos.x} cy={pos.y} r="2" fill="white"
                              animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.3, 0.8] }}
                              transition={{ duration: 1 + i*0.1, repeat: Infinity }}
                            />
                          );
                        })}
                        <g fontSize="12" fill="currentColor" opacity="0.7" style={{ fontFamily: 'monospace' }}>
                         {[...Array(8)].map((_, i) => (
                          <motion.text 
                            key={`bp-crown-${i}`} 
                            x={10 + Math.random() * 140} 
                            y={110 + Math.random() * 20}
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ duration: 2 + Math.random() }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="presence-hat-wizard"
                    className={styles.hatContainer}
                    animate={{ y: [0, -2, 0], rotate: [-1, 1, -1] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <svg viewBox="0 0 100 120" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff' }}>
                      <ellipse cx="50" cy="90" rx="40" ry="10" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                      <motion.path 
                        d="M20 85 L50 10 L80 85 Q50 75 20 85" 
                        fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2"
                        animate={{
                          d: [
                            "M20 85 L50 10 L80 85 Q50 75 20 85",
                            "M22 85 L52 15 L78 85 Q50 76 22 85",
                            "M20 85 L50 10 L80 85 Q50 75 20 85"
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <g fontSize="10" fill="currentColor" opacity="0.8" style={{ fontFamily: 'monospace' }}>
                         {[...Array(8)].map((_, i) => (
                          <motion.text 
                            key={`bp-${i}`} 
                            x={10 + Math.random() * 80} 
                            y={10 + Math.random() * 100}
                            animate={{ opacity: [0, 1, 0] }} 
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                      <motion.circle cx="50" cy="10" r="3" fill="currentColor" animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {profile?.avatar_url ? (
              <img key={profile.avatar_url} src={profile.avatar_url} alt="Avatar" />
            ) : (
              <User size={32} />
            )}
          </div>
          <div className={styles.userInfo}>
            <h3 className={styles.title}>{profile?.full_name || "Consciência"}</h3>
            <p className={styles.realName}>@{profile?.username || "frequencia_zero"}</p>
            
            {profile && (() => {
              const BOTS = ["lucemon", "barbamon", "leviamon", "beelzemon", "belphemon", "lilithmon", "daemon", "belialvamdemon"];
              const LARES = [
                "Sol", "Mercúrio", "Vênus", "Terra", "Marte", "Júpiter", 
                "Saturno", "Urano", "Netuno", "Lua", "Tsukuyomi", "X"
              ];
              let lar: string | null = null;
              
              if (profile.username && BOTS.includes(profile.username.toLowerCase())) {
                 const mockIndex = profile.username.length % LARES.length; 
                 lar = LARES[mockIndex];
              } else if (profile.created_at) {
                 const createdDate = new Date(profile.created_at);
                 const now = new Date();
                 const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
                 if (monthsDiff >= 1) {
                    const index = Math.min(monthsDiff - 1, LARES.length - 1);
                    lar = LARES[index];
                 }
              }

              return (
                <>
                  {lar && (
                    <div className={styles.worldBadge} style={{ marginTop: '4px', background: 'rgba(255,255,255,0.1)' }}>
                      <Sparkles size={10} className={styles.badgeIcon} />
                      <span>Lar: {lar}</span>
                    </div>
                  )}
                  {selectedColor && (
                    <div className={styles.favoriteColorBadge} style={{ marginTop: '4px', background: 'rgba(255,255,255,0.1)' }}>
                      <Palette size={10} style={{ color: selectedColor }} className={styles.badgeIcon} />
                      <span>Cor favorita: {selectedColor.toUpperCase()}</span>
                      <div 
                        style={{ 
                          width: '8px', 
                          height: '8px', 
                          borderRadius: '50%', 
                          backgroundColor: selectedColor, 
                          marginLeft: '6px',
                          display: 'inline-block',
                          boxShadow: `0 0 8px ${selectedColor}`
                        }} 
                      />
                    </div>
                  )}
                </>
              );
            })()}

            {profile?.status && (
              <p className={styles.statusMessage}>
                <Sparkles size={10} />
                <span>{profile.status}</span>
              </p>
            )}
            {profile?.world_name && (
              <div className={styles.worldBadge}>
                <Sparkles size={10} className={styles.badgeIcon} />
                <span>{profile.world_name}</span>
              </div>
            )}
          </div>
        </div>

        <div className={styles.levelCard}>
          <div 
            className={`${styles.levelHex} ${currentLevel === 33 ? styles.levelMax : ''}`}
            style={{ '--selected-color': selectedColor } as any}
          >
            <div className={styles.hexInner}>
              <span style={{ textShadow: `0 0 10px ${selectedColor}` }}>{currentLevel}</span>
            </div>
          </div>
          <div className={styles.levelInfo}>
            <span className={styles.rankTitle}>{currentArquetipo}</span>
            <div className={styles.expBar}>
              <div 
                className={styles.expFill} 
                style={{ 
                  width: `${(currentLevel / 33) * 100}%`,
                  background: `linear-gradient(90deg, ${selectedColor}cc, ${selectedColor})`,
                  boxShadow: `0 0 12px ${selectedColor}66`
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.expandedContent}>
            {pendingRequests.length > 0 && !targetId && (
              <div className={styles.requestsSection}>
                <h4 className={styles.sectionTitle}>Sintonizações Pendentes</h4>
                <div className={styles.requestsList}>
                  {pendingRequests.map(req => (
                    <div key={req.id} className={styles.requestCard}>
                      <div className={styles.requestInfo}>
                        <img src={req.requester?.avatar_url || "/default-avatar.png"} alt="Avatar" className={styles.miniAvatar} />
                        <div className={styles.requestTexts}>
                          <span className={styles.requesterName}>@{req.requester?.username}</span>
                          <span className={styles.requestSub}>Deseja entrar em seu mundo</span>
                        </div>
                      </div>
                      <div className={styles.requestActions}>
                        <button onClick={() => handleAcceptRequest(req)} className={styles.acceptBtn}>Aceitar</button>
                        <button onClick={() => handleDenyRequest(req.id)} className={styles.denyBtn}>Recusar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className={styles.stats}>
              <h4 className={styles.sectionTitle}>EQUILÍBRIO DE SER</h4>
              <div className={styles.grid}>
                <div className={styles.totalSummary}>
                  <span className={styles.totalValue}>{totalManifestations}</span>
                  <span className={styles.totalLabel}>Resonância Total</span>
                </div>
                {sortedActions.map(action => {
                  const count = stats[action.id] || 0;
                  const pct = maxVal > 0 ? (count / maxVal) * 100 : 0;
                  return (
                    <div key={action.id} className={styles.statRow}>
                      <span className={styles.statName}>{action.name}</span>
                      <div className={styles.barContainer}>
                        <motion.div 
                          className={styles.bar} 
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                          style={{ 
                            background: `linear-gradient(90deg, ${action.color}cc, ${action.color})`,
                            boxShadow: count > 0 ? `0 0 8px ${action.color}66` : 'none'
                          }}
                        ></motion.div>
                      </div>
                      <span className={styles.count} style={{ color: count > 0 ? action.color : undefined }}>{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={styles.footer}>
              <button className={styles.settingsBtn} onClick={onOpenSettings}>
                Sintonizar Presença
              </button>

              {showHistory && (
                <button 
                  onClick={() => {
                    if (profile?.id) {
                      setIsMinimized(true);
                      router.push(`/profile/${profile.id}`);
                    }
                  }} 
                  className={styles.historyBtn}
                >
                  {profile?.world_name ? `ENTRAR NO MUNDO: ${profile.world_name.toUpperCase()}` : "Minha frequência"}
                </button>
              )}
              {showLogout && (
                <button 
                  className={styles.logoutBtn}
                  onClick={async () => {
                    await supabase.auth.signOut();
                    router.push('/auth');
                  }}
                >
                  Desconectar
                </button>
              )}
            </div>
      </div>
    </motion.div>
  );
}
