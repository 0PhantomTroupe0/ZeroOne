"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from "framer-motion";
import {
  ArrowLeft, User, MapPin, Calendar, Share2,
  MessageCircle, Send, ImageIcon, Music, X,
  MoreHorizontal, Fingerprint, Activity, Compass, Zap,
  Sun, Anchor, Eye, Wind, Atom, Palette, Sparkles, Trash2,
  Camera, Flame, Settings, RefreshCw, ChevronLeft, ChevronRight, Shield,
  Ghost, Crown, Gem, Clock, Hash, Check,
  Heart, Scale, Leaf, Cloud
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import UserPresence from "@/components/UserPresence";
import ProfileSettings from "@/components/ProfileSettings";
import StoryBar from "@/components/StoryBar";
import RealtimePulse from "@/components/RealtimePulse";
import LuaProjetada from "@/components/LuaProjetada";
import styles from "./profile.module.css";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  city?: string | null;
  status?: string | null;
  status_updated_at?: string | null;
  cloak_enabled?: boolean;
  hat_enabled?: boolean;
  selected_pedra?: number;
  selected_varinha?: number;
  nexo_color?: string | null;
  hat_color?: string | null;
  cloak_color?: string | null;
  banner_url?: string | null;
  stone_frame_type?: string | null;
  hat_type?: string | null;
  cloak_type?: string | null;
  wand_type?: string | null;
  avatar_mode?: string | null;
  eye_sclera_color?: string | null;
  eye_iris_color?: string | null;
  eye_border_color?: string | null;
  eye_pupil_color?: string | null;
  eye_secondary_color?: string | null;
  eye_veins_active?: boolean;
  eye_veins_color?: string | null;
  eye_lashes_active?: boolean;
  eye_lashes_color?: string | null;
  observer_mode_active?: boolean;
  age?: number | null;
  level?: number;
  cloak_emblem_type?: string | null;
  cloak_emblem_color?: string | null;
  cloak_emblem_filled?: boolean;
  stone_internal_color?: string | null;
  stone_border_color?: string | null;
  stone_image_color?: string | null;
  stone_history?: number[] | null;
  cloak_emblem_secondary_color?: string | null;
  cloak_color_secondary?: string | null;
  cloak_color_tertiary?: string | null;
  real_name?: string | null;
  character_name?: string | null;
  world_name?: string | null;
  world_image?: string | null;
}

interface Manifestation {
  id: string;
  content: string;
  type: string;
  user_id: string;
  metadata?: {
    aura: string;
    image_url?: string;
    audio_url?: string;
    timestamp?: string;
    tags?: string[];
    repost_of?: string;
    repost_snapshot?: {
      author: string;
      content: string;
      image?: string;
    };
  };
  created_at: string;
}

const ACTIONS = [
  { id: 'perceber', name: "Perceber", aura: "var(--aura-perceive)", icon: Sun },
  { id: 'observar', name: "Observar", aura: "var(--aura-observe)", icon: Eye },
  { id: 'sentir', name: "Sentir", aura: "var(--aura-feel)", icon: Activity },
  { id: 'servir', name: "Agregar", aura: "var(--aura-serve)", icon: Anchor },
  { id: 'conectar', name: "Harmonizar", aura: "var(--aura-connect)", icon: Share2 },
  { id: 'expressar', name: "Expressar", aura: "var(--aura-express)", icon: Zap },
  { id: 'criar', name: "Criar", aura: "var(--aura-create)", icon: Palette },
  { id: 'buscar', name: "Sincronizar", aura: "var(--aura-seek)", icon: Compass },
  { id: 'cuidar', name: "Emanar", aura: "var(--aura-care)", icon: Fingerprint },
  { id: 'integrar', name: "Entrelaçar", aura: "var(--aura-integrate)", icon: Atom },
  { id: 'soltar', name: "Purificar", aura: "var(--aura-release)", icon: Wind },
  { id: 'transcender', name: "Transcender", aura: "var(--aura-transcend)", icon: Sparkles },
];

const SEARCH_ACTIONS = [
  { id: 'humildade', name: "Soberba <-> Humildade", aura: "#ff0000", icon: Fingerprint },
  { id: 'generosidade', name: "Avareza <-> Generosidade", aura: "#ff6600", icon: Gem },
  { id: 'disciplina', name: "Preguiça <-> Disciplina", aura: "#ffdd00", icon: Activity },
  { id: 'pureza', name: "Luxúria <-> Pureza", aura: "#00ff44", icon: Shield },
  { id: 'gratidao', name: "Inveja <-> Gratidão", aura: "#00ffff", icon: Heart },
  { id: 'temperanca', name: "Gula <-> Temperança", aura: "#0055ff", icon: Scale },
  { id: 'serenidade', name: "Ira <-> Serenidade", aura: "#8800ee", icon: Cloud },
  { id: 'natureza', name: "Natureza <-> Fantasia", aura: "#ffffff", icon: Leaf },
];

const SIMULATED_ACCOUNTS: Record<string, { name: string; avatar: string; phrase: string }> = {
  '00000000-0000-0000-0000-000000000001': { name: 'Ilusionmon', avatar: '/personagens/IlusiomonsT.png', phrase: "Eu não minto… eu só mostro o que você quer acreditar." },
  '00000000-0000-0000-0000-000000000002': { name: 'Lucemon', avatar: '/personagens/LucemonF.png', phrase: "Eu te faço acreditar que você já chegou no topo… cuidado comigo." },
  '00000000-0000-0000-0000-000000000003': { name: 'Barbamon', avatar: '/personagens/BarbamonT.png', phrase: "Eu te prometo segurança… mas te prendo na escassez." },
  '00000000-0000-0000-0000-000000000004': { name: 'Leviamon', avatar: '/personagens/LeviamonT.png', phrase: "Eu te faço confortável… enquanto sua vida para." },
  '00000000-0000-0000-0000-000000000005': { name: 'Beelzemon', avatar: '/personagens/BeelzemonT.png', phrase: "Eu te faço olhar para o outro… e esquecer de si." },
  '00000000-0000-0000-0000-000000000006': { name: 'Lilithmon', avatar: '/personagens/LilithmonT.png', phrase: "Eu te confundo com prazer… mas te esvazio por dentro." },
  '00000000-0000-0000-0000-000000000007': { name: 'Belphemon', avatar: '/personagens/BelphemonT.png', phrase: "Eu nunca estou satisfeito… e ensino você a nunca estar também." },
  '00000000-0000-0000-0000-000000000008': { name: 'Daemon', avatar: '/personagens/DaemonT.png', phrase: "Eu te dou força… mas tiro seu controle." },
};

const VIRTUES = [
  { id: 'humildade', name: 'Humildade', color: '#FFD700', rgb: '255, 215, 0', icon: '✨' },
  { id: 'temperanca', name: 'Temperança', color: '#00FA9A', rgb: '0, 250, 154', icon: '⚖️' },
  { id: 'castidade', name: 'Autocontrole', color: '#FFFFFF', rgb: '255, 255, 255', icon: '🛡️' },
  { id: 'generosidade', name: 'Generosidade', color: '#FF69B4', rgb: '255, 105, 180', icon: '💎' },
  { id: 'diligencia', name: 'Diligência', color: '#1E90FF', rgb: '30, 144, 255', icon: '⚡' },
  { id: 'caridade', name: 'Caridade', color: '#32CD32', rgb: '50, 205, 50', icon: '🤝' },
  { id: 'paciencia', name: 'Paciência', color: '#BA55D3', rgb: '186, 85, 211', icon: '🧘' },
];

const CARE_EMOJIS = [
  { emoji: '💙', label: 'Amor' },
  { emoji: '🫂', label: 'Presença' },
  { emoji: '✨', label: 'Luz' },
  { emoji: '🍵', label: 'Cuidado' },
  { emoji: '🧘', label: 'Paz' },
  { emoji: '🌊', label: 'Fluidez' }
];

const RITUAL_COLORS = [
  '#00f3ff', '#ff00ff', '#00ff00', '#ffff00', '#ff0000', '#ffffff',
  '#7000ff', '#ff7000', '#0070ff', '#00ff70', '#ff0070', '#555555'
];

const SPARK_COLORS = [
  '#ff2200', '#ff6600', '#ffdd00', '#aaff00', '#00ff44', '#00ffff',
  '#0055ff', '#3300ff', '#8800ee', '#ff00cc', null, '#ffffff',
];

const ACTION_NEON_COLORS: Record<string, string> = {
  'perceber': '#ff0000', 'observar': '#ff6600', 'sentir': '#ffdd00',
  'buscar': '#aaff00', 'conectar': '#00ff44', 'expressar': '#00ffff',
  'criar': '#0055ff', 'cuidar': '#3300ff', 'servir': '#8800ee',
  'soltar': '#ff00cc', 'integrar': '#000000', 'transcender': '#ffffff',
};

const FEELING_SYMBOLS = [
  { symbol: '🧠', label: 'Lógica', id: 'logica' },
  { symbol: '🎨', label: 'Caos', id: 'caos' },
  { symbol: '⚖️', label: 'Equilíbrio', id: 'equilibrio' },
  { symbol: '🔥', label: 'Vontade', id: 'vontade' },
  { symbol: '🌀', label: 'Vazio', id: 'vazio' },
  { symbol: '🌿', label: 'Vida', id: 'vida' }
];

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

function VascularPath({ angle, startR, cp1, cp2, targetEnd, irisX, irisY, color, width, delay }: any) {
  const d = useTransform([irisX, irisY], ([px, py]: any) => {
    const x1 = 50 + px + startR * Math.cos(angle);
    const y1 = 50 + py + startR * Math.sin(angle);

    const cx1 = 50 + px * 0.6 + cp1[0] * Math.cos(cp1[1]);
    const cy1 = 50 + py * 0.6 + cp1[0] * Math.sin(cp1[1]);

    const cx2 = 50 + px * 0.3 + cp2[0] * Math.cos(cp2[1]);
    const cy2 = 50 + py * 0.3 + cp2[0] * Math.sin(cp2[1]);

    const x2 = targetEnd[0];
    const y2 = targetEnd[1];

    return `M${x1} ${y1} C${cx1} ${cy1} ${cx2} ${cy2} ${x2} ${y2}`;
  });

  return (
    <motion.g
      animate={{
        rotate: [-1.2, 1.2, -1.2, -1.2],
        scale: [1, 1.01, 1, 1],
        skewX: [-0.5, 0.5, -0.5, -0.5]
      }}
      transition={{
        duration: 21,
        repeat: Infinity,
        times: [0, 0.33, 0.66, 1],
        ease: "easeInOut",
        delay
      }}
    >
      <motion.path
        d={d}
        fill="none" stroke="#000" strokeWidth={width + 0.6} strokeOpacity="0.2" strokeLinecap="round"
      />
      <motion.path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray="20 40"
        animate={{
          strokeDashoffset: [0, -60, -120, -120],
          opacity: [0.6, 1, 0.6, 0.2],
          strokeWidth: [width, width * 1.4, width, width * 0.5]
        }}
        transition={{
          duration: 21,
          repeat: Infinity,
          times: [0, 0.33, 0.66, 1],
          ease: "linear"
        }}
      />
    </motion.g>
  );
}

const ARQUETIPOS = [
  "🕊️ INOCENTE", "🧍 ÓRFÃO", "🛡️ HERÓI", "🤝 CUIDADOR", "🌍 EXPLORADOR",
  "🔥 REBELDE", "❤️ AMANTE", "🎨 CRIADOR", "👑 GOVERNANTE", "🧙 MAGO",
  "📚 SÁBIO", "🤡 TOLO"
];

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const userId = resolvedParams.id;
  const [profile, setProfile] = useState<Profile | null>(null);
  const irisX = useMotionValue(0);
  const irisY = useMotionValue(0);
  // Reconfigured for "Super Fast" 1s sweeps vs "Sway" 4s glides
  const springIrisX = useSpring(irisX, { stiffness: 500, damping: 40 });
  const springIrisY = useSpring(irisY, { stiffness: 500, damping: 40 });
  const observerMode = profile?.observer_mode_active || false;

  const renderCloakEmblem = () => {
    if (!profile?.cloak_emblem_type || profile.cloak_emblem_type === 'none') return null;

    const emblemColor = profile.cloak_emblem_color || profile.hat_color || profile.nexo_color || '#fff';
    const emblemSecondaryColor = profile.cloak_emblem_secondary_color || emblemColor;
    const emblemFilled = profile.cloak_emblem_filled;
    const emblemY = profile.cloak_emblem_type === 'neon_heart' ? 150 : (profile.cloak_emblem_type === 'hexagram' ? 180 : 205);

    return (
      <motion.g 
        transform={`translate(100, ${emblemY})`}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        {profile.cloak_emblem_type === 'hexagram' && (
          <g>
            <path d="M0 -30 L26 15 L-26 15 Z" fill={emblemFilled ? emblemColor : "none"} fillOpacity="0.3" stroke={emblemColor} strokeWidth="2" opacity="0.8" />
            <path d="M0 30 L-26 -15 L26 -15 Z" fill={emblemFilled ? emblemSecondaryColor : "none"} fillOpacity="0.3" stroke={emblemSecondaryColor} strokeWidth="2" opacity="0.8" />
          </g>
        )}
        {profile.cloak_emblem_type === 'pentagram' && (
          <path 
            d="M0 -30 L7 -10 L28 -10 L11 3 L18 24 L0 11 L-18 24 L-11 3 L-28 -10 L-7 -10 Z" 
            fill={emblemFilled ? emblemColor : "none"} fillOpacity="0.3" stroke={emblemColor} strokeWidth="2" opacity="0.8"
          />
        )}
        {profile.cloak_emblem_type === 'black_hole' && (
          <g>
            <circle r="15" fill={emblemSecondaryColor} stroke={emblemColor} strokeWidth="1" fillOpacity="0.3" />
            <motion.circle r="18" fill={emblemFilled ? emblemColor : "none"} fillOpacity="0.5" stroke={emblemColor} strokeWidth="0.5" animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 2, repeat: Infinity }} />
          </g>
        )}
        {profile.cloak_emblem_type === 'white_flame' && (
          <motion.path d="M0 0 Q-15 -20 0 -45 Q15 -20 0 0" fill={emblemColor} fillOpacity={emblemFilled ? 1 : 0.6} stroke={emblemFilled ? "none" : emblemColor} filter="url(#cloakGlow)" animate={{ scaleY: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }} transition={{ duration: 0.6, repeat: Infinity }} />
        )}
        {profile.cloak_emblem_type === 'neon_heart' && (
          <motion.path 
            d="M0 10 C-20 -10 -35 15 0 40 C35 15 20 -10 0 10 Z" 
            fill={emblemFilled ? emblemSecondaryColor : "none"} fillOpacity="0.4" stroke={emblemColor} strokeWidth="3"
            filter="url(#cloakGlow)"
            animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
        {profile.cloak_emblem_type === 'ice_fragment' && (
          <g>
            <path d="M0 -30 L25 -15 L25 15 L0 30 L-25 15 L-25 -15 Z" fill={emblemFilled ? emblemSecondaryColor : "none"} fillOpacity="0.2" stroke={emblemColor} strokeWidth="2" filter="url(#cloakGlow)" />
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <path key={deg} d="M0 0 L0 -30 M-8 -25 L0 -30 L8 -25" stroke={emblemSecondaryColor} strokeWidth="1" opacity="0.5" transform={`rotate(${deg})`} />
            ))}
          </g>
        )}
        {profile.cloak_emblem_type === 'orbital_nexus' && (
          <g>
            {/* Outer Ring - Technological Hex segments */}
            <circle r="32" fill="none" stroke={emblemColor} strokeWidth="0.5" strokeDasharray="4 8" opacity="0.4" />
            {[0, 60, 120, 180, 240, 300].map(deg => (
              <path key={deg} d="M0 -35 L5 -32 M0 -35 L-5 -32" stroke={emblemColor} strokeWidth="1.5" transform={`rotate(${deg})`} />
            ))}
            
            {/* Mid Ring */}
            <circle r="22" fill="none" stroke={emblemColor} strokeWidth="2" strokeOpacity="0.8" />
            <motion.circle 
              r="22" fill="none" stroke={emblemSecondaryColor} strokeWidth="1" 
              strokeDasharray="10 30" 
              animate={{ rotate: 360 }} 
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
            />

            {/* Inner Core */}
            <circle r="12" fill={emblemFilled ? emblemColor : "none"} stroke={emblemColor} strokeWidth="1" fillOpacity="0.1" />
            <motion.circle 
              r="8" 
              fill={emblemSecondaryColor} 
              filter="url(#cloakGlow)"
              animate={{ 
                scale: [0.8, 1.2, 0.8],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* Tech Dots */}
            {[45, 135, 225, 315].map(deg => (
              <motion.circle 
                key={deg}
                cx="0" cy="-22" r="1.5" fill={emblemSecondaryColor}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: deg/360 }}
                transform={`rotate(${deg})`}
              />
            ))}
          </g>
        )}
      </motion.g>
    );
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // Calibrado para um movimento mais sutil (faixa menor) e super responsivo
      const targetX = (e.clientX / innerWidth - 0.5) * 8;
      const targetY = (e.clientY / innerHeight - 0.5) * 5;
      
      irisX.set(targetX);
      irisY.set(targetY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    // Pequena animação de "respiração" residual quando parado
    const interval = setInterval(() => {
      if (Math.abs(irisX.get()) < 1 && Math.abs(irisY.get()) < 1) {
        const now = Date.now();
        irisX.set(Math.sin(now / 1500) * 2);
        irisY.set(Math.cos(now / 2000) * 1);
      }
    }, 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearInterval(interval);
    };
  }, [irisX, irisY]);
  const [manifestations, setManifestations] = useState<Manifestation[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentUserProfile, setCurrentUserProfile] = useState<Profile | null>(null);
  const [chatMessage, setChatMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatAction, setChatAction] = useState(ACTIONS[3]); // Default to Conectar
  const [attachedFiles, setAttachedFiles] = useState<{ image: File | null; audio: File | null }>({ image: null, audio: null });
  const [nodeSentiments, setNodeSentiments] = useState<Record<string, any>>({});
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);

  const [activeSentimentPicker, setActiveSentimentPicker] = useState<string | null>(null);
  const [activeCuidarPicker, setActiveCuidarPicker] = useState<string | null>(null);
  const [showTagInput, setShowTagInput] = useState<string | null>(null);
  const [activeRevealedPost, setActiveRevealedPost] = useState<string | null>(null);

  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [tagInput, setTagInput] = useState<Record<string, string>>({});
  const [postTags, setPostTags] = useState<Record<string, string[]>>({});
  const [zenMode, setZenMode] = useState(false);
  const [hexFailing, setHexFailing] = useState(false);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [activeTagPicker, setActiveTagPicker] = useState<string | null>(null);
  const [observingManifest, setObservingManifest] = useState<any>(null);
  const [spiritualNotice, setSpiritualNotice] = useState<string | null>(null);
  const [activeIntegrationSplash, setActiveIntegrationSplash] = useState<any>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [sparkActive, setSparkActive] = useState(false);
  const [transcendActive, setTranscendActive] = useState(false);
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [ritualStep, setRitualStep] = useState(0);
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);
  const [showPresence, setShowPresence] = useState(false);
  const [hexagramActive, setHexagramActive] = useState(false);
  const [trianglesActive, setTrianglesActive] = useState(false);
  const [hexBlinkActive, setHexBlinkActive] = useState(false);
  const [showAuraSelector, setShowAuraSelector] = useState(false);
  const [lucemonMessage, setLucemonMessage] = useState<string | null>(null);
  const [activeBot, setActiveBot] = useState<any>(null);

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const [isEditingEssence, setIsEditingEssence] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [colorClipboard, setColorClipboard] = useState<string | null>(null);
  const [repostTarget, setRepostTarget] = useState<{ id: string, author: string, content: string, image?: string } | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const toggleMenu = (menuId: string | null) => {
    setActiveMenu(prev => prev === menuId ? null : menuId);
  };
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isEditingEssence) {
        const target = event.target as Node;
        if (
          heroRef.current && !heroRef.current.contains(target) &&
          headerRef.current && !headerRef.current.contains(target)
        ) {
          setIsEditingEssence(false);
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEditingEssence]);

  useEffect(() => {
    fetchData();
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      if (user) {
        const { data: uprofile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setCurrentUserProfile(uprofile);
      }
    };
    checkUser();
  }, [userId]);

  // Ritualistic Cycle: 28s total (4 stages of 7s each)
  // Stage 0: Numbers @ Border | Stage 1: Hidden | Stage 2: Elements @ Border | Stage 3: Hidden
  useEffect(() => {
    const interval = setInterval(() => {
      setRitualStep(prev => (prev + 1) % 4);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  // Spark / Ritual Cycle (7s)
  useEffect(() => {
    const timer = setInterval(() => {
      setSparkActive(true);
      setTimeout(() => setSparkActive(false), 2400); // 2.4s burst
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // Atualizar título da aba com o nome do usuário logado
  useEffect(() => {
    if (currentUserProfile?.username) {
      document.title = `Zero Day | ◕‿◕ | ${currentUserProfile.username}`;
    } else {
      document.title = `Zero Day | ◕‿◕`;
    }
  }, [currentUserProfile]);

  async function fetchData() {
    try {
      setLoading(true);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      const { data: manifestationsData, error: manifestationsError } = await supabase
        .from('consciousness_nodes')
        .select('*')
        .eq('user_id', userId)
        .is('metadata->reply_to', null) // Excluir comentários do feed principal
        .not('type', 'in', '("perceber", "observar")') // Excluir tipos reativos do feed principal
        .order('created_at', { ascending: false });

      if (manifestationsError) throw manifestationsError;
      setManifestations(manifestationsData || []);

      fetchRecentUsers();
      if (currentUser) fetchFollowedUsers(currentUser.id);
    } catch (err) {
      console.error("Error load profile:", err);
    } finally {
      setLoading(false);
    }
  }

  const fetchFollowedUsers = async (uid: string) => {
    const { data } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', uid);
    if (data) {
      setFollowedUsers(new Set(data.map(f => f.following_id)));
    }
  };

  const fetchRecentUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('consciousness_nodes')
        .select(`
          user_id,
          profiles (
            id,
            username,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false })
        .limit(40);

      if (error) throw error;
      
      const uniqueUsers = new Map();
      (data as any[])?.forEach(node => {
        const profile = Array.isArray(node.profiles) ? node.profiles[0] : node.profiles;
        if (profile && !uniqueUsers.has(profile.id)) {
          uniqueUsers.set(profile.id, profile);
        }
      });
      
      setRecentUsers(Array.from(uniqueUsers.values()).slice(0, 8));
    } catch (err) {
      console.error("Error fetching recent users:", err);
    }
  };

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`profile-${userId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'consciousness_nodes', filter: `user_id=eq.${userId}` },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            const newNode = payload.new as any;
            // Se for uma resposta ou tipo reativo, não adicionar ao feed principal
            const meta = typeof newNode.metadata === 'string' ? JSON.parse(newNode.metadata) : newNode.metadata;
            const isReply = meta?.reply_to;
            if (isReply || newNode.type === 'perceber' || newNode.type === 'observar') return;

            setManifestations((prev) => {
              if (prev.find(m => m.id === newNode.id)) return prev;
              return [newNode as Manifestation, ...prev];
            });
          }
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles', filter: `id=eq.${userId}` },
        (payload) => {
          setProfile(payload.new as Profile);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const fetchSentiments = async (nodeIds?: string[]) => {
    const ids = nodeIds || manifestations.map(m => m.id);
    if (!ids.length) return;

    const { data } = await supabase
      .from('node_sentiments')
      .select('node_id, sentiment_type, user_id')
      .in('node_id', ids);

    if (data) {
      const counts: Record<string, any> = {};
      data.forEach(s => {
        if (!counts[s.node_id]) counts[s.node_id] = {};
        if (!counts[s.node_id][s.sentiment_type]) counts[s.node_id][s.sentiment_type] = { count: 0, userReacted: false };
        counts[s.node_id][s.sentiment_type].count++;
        if (s.user_id === currentUser?.id) counts[s.node_id][s.sentiment_type].userReacted = true;
      });
      setNodeSentiments(prev => ({ ...prev, ...counts }));
    }
  };

  useEffect(() => {
    if (manifestations.length > 0) {
      fetchSentiments();
    }
  }, [manifestations.length, currentUser?.id]);

  useEffect(() => {
    const channel = supabase
      .channel('profile-sentiments')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'node_sentiments' },
        () => {
          fetchSentiments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [manifestations]);

  const handleToggleSentiment = async (nodeId: string, type: string) => {
    if (!currentUser) return;

    try {
      const existing = nodeSentiments[nodeId]?.[type]?.userReacted;

      // Definir grupos de exclusividade
      const careEmojis = CARE_EMOJIS.map(e => e.emoji);
      const virtueIds = VIRTUES.map(v => v.id);

      let typesToClear: string[] = [type];
      if (careEmojis.includes(type)) typesToClear = careEmojis;
      if (virtueIds.includes(type)) typesToClear = virtueIds;

      // 1. Remover reações conflitantes (do mesmo grupo)
      await supabase
        .from('node_sentiments')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('node_id', nodeId)
        .in('sentiment_type', typesToClear);

      // 2. Se NÃO era a mesma que já existia, INSERIR a nova
      if (!existing) {
        await supabase
          .from('node_sentiments')
          .insert([{ user_id: currentUser.id, node_id: nodeId, sentiment_type: type }]);
      }

      // 3. Atualizar o estado local
      fetchSentiments([nodeId]);
    } catch (err) {
      console.error("Erro ao alternar sentimento:", err);
    }
  };

  const fetchComments = async (nodeIds: string[]) => {
    if (!nodeIds.length) return;
    const { data, error } = await supabase
      .from('consciousness_nodes')
      .select('*, profiles(username, avatar_url)')
      .eq('type', 'perceber')
      .in('metadata->>reply_to', nodeIds);
    
    if (!error && data) {
      const grouped: Record<string, any[]> = {};
      data.forEach((c: any) => {
        const replyTo = c.metadata?.reply_to;
        if (replyTo) {
          if (!grouped[replyTo]) grouped[replyTo] = [];
          grouped[replyTo].push(c);
        }
      });
      setPostComments(prev => ({ ...prev, ...grouped }));
    }
  };

  const handleSendReply = async (nodeId: string) => {
    const text = commentDraft[nodeId]?.trim();
    if (!text || !currentUser) return;
    
    try {
      const { data, error } = await supabase
        .from('consciousness_nodes')
        .insert([{ 
          content: text, 
          user_id: currentUser.id, 
          type: 'perceber',
          metadata: { 
            reply_to: nodeId,
            aura: 'var(--aura-perceive)',
            timestamp: new Date().toISOString()
          }
        }])
        .select('*, profiles(username, avatar_url)')
        .single();

      if (error) throw error;

      if (data) {
        setCommentDraft(prev => ({ ...prev, [nodeId]: '' }));
        setPostComments(prev => ({ 
          ...prev, 
          [nodeId]: [...(prev[nodeId] || []), data] 
        }));
      }
    } catch (err: any) {
      console.error("Erro ao enviar percepção:", err);
      alert("Erro ao enviar percepção: " + (err.message || "Falha técnica"));
    }
  };

  const handleAddTag = async (manifestId: string) => {
    const rawTag = tagInput[manifestId]?.trim();
    if (!rawTag || !currentUser) return;
    
    // Remover # se houver e normalizar
    const tag = rawTag.startsWith('#') ? rawTag.slice(1) : rawTag;
    
    const { error } = await supabase
      .from('node_sentiments')
      .insert([{ 
        user_id: currentUser.id, 
        node_id: manifestId, 
        sentiment_type: `tag:${tag}`
      }]);
    
    if (!error) {
      setTagInput(prev => ({ ...prev, [manifestId]: '' }));
      fetchSentiments([manifestId]);
    }
  };

  const handleRemoveTag = async (nodeId: string, tagType: string) => {
    if (!currentUser) return;
    const { error } = await supabase
      .from('node_sentiments')
      .delete()
      .eq('node_id', nodeId)
      .eq('user_id', currentUser.id)
      .eq('sentiment_type', tagType);
    if (!error) fetchSentiments([nodeId]);
  };

  const handleDeleteNode = async (nodeId: string) => {
    if (!currentUser) return;
    try {
      const { error } = await supabase.from('consciousness_nodes').delete().eq('id', nodeId).eq('user_id', currentUser.id);
      if (error) throw error;
      setManifestations(prev => prev.filter(m => m.id !== nodeId));
      setNodeToDelete(null);
    } catch (err) {
      console.error('Erro ao deletar manifestação:', err);
      alert('Não foi possível soltar a manifestação.');
    }
  };

  const handleIntegrateWorld = async (targetUserId: string) => {
    try {
      if (!currentUser) {
        setSpiritualNotice("Harmonização necessária para integração.");
        return;
      }
      
      if (currentUser.id === targetUserId) {
        setSpiritualNotice("Você já habita sua própria essência.");
        return;
      }
      const bot = SIMULATED_ACCOUNTS[targetUserId];
      if (bot) {
        await supabase.from('world_requests').insert({ requester_id: currentUser.id, target_id: targetUserId, status: 'accepted' });
        await supabase.from('user_follows').insert({ follower_id: currentUser.id, following_id: targetUserId });
        setFollowedUsers(prev => new Set([...Array.from(prev), targetUserId]));
        setActiveIntegrationSplash(bot);
        return;
      }
      const { data: follow } = await supabase.from('user_follows').select('*').eq('follower_id', currentUser.id).eq('following_id', targetUserId).single();
      if (follow) {
        setSpiritualNotice("Integração já estabelecida nesta frequência.");
        return;
      }
      const { data: existing } = await supabase.from('world_requests').select('*').eq('requester_id', currentUser.id).eq('target_id', targetUserId).single();
      if (existing) {
        if (existing.status === 'pending') setSpiritualNotice("Seu sinal de sintonização ainda está ecoando...");
        else if (existing.status === 'denied') setSpiritualNotice("Consciência em isolamento facultativo.");
        return;
      }
      const { error: requestError } = await supabase.from('world_requests').insert({ requester_id: currentUser.id, target_id: targetUserId, status: 'pending' });
      if (requestError) throw requestError;
      const { data: profileData } = await supabase.from('profiles').select('username').eq('id', currentUser.id).single();
      await supabase.from('notifications').insert({
        user_id: targetUserId, type: 'world_request', title: 'Nova Sintonização',
        content: `${profileData?.username || 'Uma consciência'} quer entrar no seu mundo.`,
        link: `/profile/${currentUser.id}`, is_read: false
      });
      setSpiritualNotice("Pedido de integração propagado ao nexo alvo.");
    } catch (err) {
      console.error("Erro ao integrar mundo:", err);
    }
  };

  const handleActionOnPost = async (actionId: string, manifest: any) => {
    switch (actionId) {
      // 🔍 BUSCAR → Abrir Seletor de Etiquetas (TAGS)
      case 'buscar': {
        const isOpening = activeTagPicker !== manifest.id;
        setActiveTagPicker(isOpening ? manifest.id : null);
        if (isOpening) {
          setActiveCuidarPicker(null);
          setActiveSentimentPicker(null);
          setActiveRevealedPost(null);
        }
        break;
      }
      // 💙 SENTIR → abre seletor de virtudes
      case 'sentir': {
        const isOpening = activeSentimentPicker !== manifest.id;
        setActiveSentimentPicker(isOpening ? manifest.id : null);
        if (isOpening) {
          setActiveCuidarPicker(null);
          setActiveRevealedPost(null);
          setActiveTagPicker(null);
        }
        break;
      }
      // 🤍 CUIDAR → abre seletor de emoticons
      case 'cuidar': {
        const isOpening = activeCuidarPicker !== manifest.id;
        setActiveCuidarPicker(isOpening ? manifest.id : null);
        if (isOpening) {
          setActiveSentimentPicker(null);
          setActiveRevealedPost(null);
          setActiveTagPicker(null);
        }
        break;
      }
      // 🤝 CONECTAR → adicionar tag ao post
      case 'conectar': {
        handleToggleSentiment(manifest.id, 'conectar');
        break;
      }
      // ⚡ EXPRESSAR → preparar repost
      case 'expressar': {
        setRepostTarget({
          id: manifest.id,
          author: manifest.profiles?.username || 'consciencia',
          content: manifest.content,
          image: manifest.metadata?.image_url
        });
        setChatAction(ACTIONS.find(a => a.id === 'expressar')!);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        break;
      }
      // 👁️ PERCEBER → revelar contexto/comentários
      case 'perceber': {
        const isOpening = activeRevealedPost !== manifest.id;
        setActiveRevealedPost(isOpening ? manifest.id : null);
        handleToggleSentiment(manifest.id, 'perceber');
        if (isOpening) {
          setActiveCuidarPicker(null);
          setActiveSentimentPicker(null);
          setActiveTagPicker(null);
          if (!postComments[manifest.id]) {
            const { data } = await supabase
              .from('consciousness_nodes')
              .select('*, profiles(username, avatar_url)')
              .eq('metadata->>reply_to', manifest.id)
              .order('created_at', { ascending: true });
            setPostComments(prev => ({ ...prev, [manifest.id]: data || [] }));
          }
        }
        break;
      }
      // 🙏 SERVIR → reagir e abrir perfil
      case 'servir': {
        if (manifest.id) handleToggleSentiment(manifest.id, 'servir');
        if (manifest.user_id) {
          setTargetProfileId(manifest.user_id);
          setShowPresence(true);
        }
        break;
      }
      // 🌕 OBSERVAR → Relatório Vibracional Flutuante
      case 'observar': {
        if (observingManifest?.id === manifest.id) {
          setObservingManifest(null);
        } else {
          setObservingManifest(manifest);
        }
        break;
      }
      // 💨 SOLTAR → apagar (se dono) ou reagir (se outro)
      case 'soltar': {
        if (manifest.id) {
          if (manifest.user_id === currentUser?.id) {
            setNodeToDelete(manifest.id);
          } else {
            handleToggleSentiment(manifest.id, 'soltar');
          }
        }
        break;
      }
      // 🔗 INTEGRAR → Pedir para entrar no mundo
      case 'integrar': {
        if (manifest.user_id) handleIntegrateWorld(manifest.user_id);
        handleToggleSentiment(manifest.id, 'integrar');
        break;
      }
      // 🎨 CRIAR → repostar (remix)
      case 'criar': {
        const originalContent = manifest.content || '';
        const originalAuthor = manifest.profiles?.username || `presenca_${manifest.id.slice(0,4)}`;
        setChatMessage(`🔮 @${originalAuthor}: "${originalContent.slice(0, 80)}${originalContent.length > 80 ? '...' : ''}"\n\n`);
        setChatAction(ACTIONS.find(a => a.id === 'criar')!);
        break;
      }
      // 🌌 TRANSCENDER → Ritual de Geometria Sagrada
      case 'transcender': {
        setHexagramActive(prev => !prev);
        setTranscendActive(prev => !prev);
        const tags = postTags[manifest.id] || manifest.metadata?.tags || [];
        if (tags.length > 0) {
          setTagFilter(prev => prev === tags[0] ? null : tags[0]);
        }
        break;
      }
    }
  };


  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const hasAttachments = attachedFiles.image || attachedFiles.audio;
    if ((!chatMessage.trim() && !hasAttachments) || isSending || !currentUser) return;

    setIsSending(true);
    try {
      let imageUrl = null;
      let audioUrl = null;

      if (attachedFiles.image) {
        const fileExt = attachedFiles.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('manifestations').upload(filePath, attachedFiles.image);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('manifestations').getPublicUrl(filePath);
          imageUrl = publicUrl;
        }
      }

      if (attachedFiles.audio) {
        const fileExt = attachedFiles.audio.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${currentUser.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('manifestations').upload(filePath, attachedFiles.audio);
        if (!uploadError) {
          const { data: { publicUrl } } = supabase.storage.from('manifestations').getPublicUrl(filePath);
          audioUrl = publicUrl;
        }
      }

      const { data, error } = await supabase
        .from('consciousness_nodes')
        .insert([{
          content: chatMessage || (repostTarget ? `Ressoando @${repostTarget.author}` : (attachedFiles.image ? "Manifestação visual" : "Vibração sonora")),
          type: chatAction.id,
          user_id: currentUser.id,
          metadata: {
            aura: chatAction.aura,
            timestamp: new Date().toISOString(),
            image_url: imageUrl,
            audio_url: audioUrl,
            repost_of: repostTarget?.id,
            repost_snapshot: repostTarget ? {
              author: repostTarget.author,
              content: repostTarget.content,
              image: repostTarget.image
            } : null
          }
        }])
        .select()
        .single();

      if (error) throw error;
      if (data) setManifestations(prev => [data, ...prev]);
      setChatMessage("");
      setAttachedFiles({ image: null, audio: null });
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Falha na propagação: " + (error as Error).message);
    } finally {
      setIsSending(false);
      setRepostTarget(null);
    }
  };

  const RITUAL_COLORS = [
    '#00f3ff', '#ff00ff', '#ffea00', '#00ffaa',
    '#ff3e3e', '#7000ff', '#ff9900', '#ffffff',
    '#505050', '#4b0082', '#d4af37', '#00d4ff'
  ];

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !profile) return;

    // Visual update imediato
    const previewUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev!, avatar_url: previewUrl }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar_${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);

      // 4. Update the profile with the new avatar URL
      if (!profile) throw new Error("Perfil não carregado");

      const selectedPedra = profile.selected_pedra || 0;
      const currentType = selectedPedra > 0 ? 'pedra' : 'avatar';
      const currentValue = selectedPedra > 0 ? selectedPedra : (profile.avatar_url || '');
      const newHistory = addToHistory(currentType, currentValue, profile.stone_history || []);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: publicUrl,
          stone_history: newHistory
        })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: publicUrl, stone_history: newHistory } : null);
    } catch (error) {
      console.error("Error updating avatar:", error);
      alert("Falha na atualização do avatar: " + (error as Error).message);
    }
  };

  const handleBannerChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser || !profile) return;

    // Visual update imediato
    const previewUrl = URL.createObjectURL(file);
    setProfile(prev => ({ ...prev!, banner_url: previewUrl }));

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `banner_${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage.from('banners').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('banners').getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ banner_url: publicUrl })
        .eq('id', currentUser.id);

      if (updateError) throw updateError;
    } catch (error) {
      console.error("Error updating banner:", error);
      alert("Falha na atualização do banner: " + (error as Error).message);
    }
  };

  const updateAssetColor = async (type: 'hat' | 'cloak', section: 'primary' | 'secondary' | 'tertiary', color: string) => {
    if (!isOwnProfile || !profile) return;
    try {
      let field: string = '';
      if (type === 'hat') {
        field = 'hat_color';
      } else {
        field = section === 'primary' ? 'cloak_color' : 
                section === 'secondary' ? 'cloak_color_secondary' : 'cloak_color_tertiary';
      }
      
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: color })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, [field]: color } : null);
    } catch (err) {
      console.error(`Erro ao atualizar cor do ${type} (${section}):`, err);
    }
  };

  const updateEyeColor = async (field: string, value: string | boolean) => {
    if (!isOwnProfile || !profile) return;
    try {
      const finalField = field.startsWith('eye_') ? field : `eye_${field}_color`;
      const { error } = await supabase
        .from('profiles')
        .update({ [finalField]: value })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, [finalField]: value } : null);
    } catch (err) {
      console.error(`Erro ao atualizar campo do olho (${field}):`, err);
    }
  };

  const updateStoneFrame = async (direction: 1 | -1 = 1) => {
    if (!isOwnProfile || !profile) return;
    try {
      const types = ['circle', 'square', 'triangle', 'hybrid', 'hexagram', 'pentagram', 'shield', 'morph_shield', 'manifestation', 'fusion_manifestation'];
      const currentIndex = types.indexOf(profile.stone_frame_type || 'circle');
      const newIndex = (currentIndex + direction + types.length) % types.length;
      const newType = types[newIndex];

      const { error } = await supabase
        .from('profiles')
        .update({ stone_frame_type: newType })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, stone_frame_type: newType } : null);
    } catch (err) {
      console.error(`Erro ao atualizar moldura da pedra:`, err);
    }
  };

  const addToHistory = (type: 'pedra' | 'avatar', value: string | number, currentHistory: any[]) => {
    const history = [...(currentHistory || [])];
    const newItem = { type, value };
    
    // Evitar duplicatas (comparando valor)
    const existingIndex = history.findIndex(item => item.value === value);
    if (existingIndex !== -1) {
      history.splice(existingIndex, 1);
    }
    
    history.unshift(newItem);
    return history.slice(0, 3);
  };

  const updateStoneImage = async (direction: 1 | -1 = 1) => {
    if (!isOwnProfile || !profile) return;
    try {
      const current = profile.selected_pedra || 1;
      let next = current + direction;
      if (next > 12) next = 1;
      if (next < 1) next = 12;

      const newHistory = addToHistory('pedra', current, profile.stone_history || []);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          selected_pedra: next,
          stone_history: newHistory
        })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, selected_pedra: next, stone_history: newHistory } : null);
    } catch (err) {
      console.error(`Erro ao atualizar imagem da pedra:`, err);
    }
  };

  const selectFromHistory = async (item: { type: 'pedra' | 'avatar', value: any }) => {
    if (!isOwnProfile || !profile) return;
    try {
      const selectedPedra = profile.selected_pedra || 0;
      const currentType = selectedPedra > 0 ? 'pedra' : 'avatar';
      const currentValue = selectedPedra > 0 ? selectedPedra : (profile.avatar_url || '');
      const newHistory = addToHistory(currentType, currentValue, profile.stone_history || []);

      const updateData: any = { stone_history: newHistory };
      
      if (item.type === 'pedra') {
        updateData.selected_pedra = item.value;
      } else {
        updateData.selected_pedra = 0; // Desativa a pedra para mostrar o avatar
        updateData.avatar_url = item.value;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
    } catch (err) {
      console.error(`Erro ao selecionar do histórico:`, err);
    }
  };

  const selectStoneFromHistory = async (pedraId: number) => {
    selectFromHistory({ type: 'pedra', value: pedraId });
  };

  const STONE_NAMES: Record<number, string> = {
    1: "Pedra de Quartzo",
    2: "Ametista Profética",
    3: "Esmeralda de Neón",
    4: "Rubi Sônico",
    5: "Safira de Dados",
    6: "Ônix Binário",
    7: "Citrino Sincronizado",
    8: "Topázio Tátil",
    9: "Opala Holográfica",
    10: "Turmalina de Plasma",
    11: "Obsidiana de Fluxo",
    12: "Diamante do Éter"
  };

  const WAND_NAMES: Record<string, string> = {
    'cyber_saber': "Cyber-Sabre",
    'tech_saber': "Tech-Sabre",
    'kinetic_staff': "Cajado Cinético",
    'light_sword': "Espada de Luz"
  };

  const HAT_NAMES: Record<string, string> = {
    'wizard': "Chapéu de Mago",
    'headband': "Bandana de Frequência",
    'newsboy': "Boina de Dados",
    'halo': "Halo Divino",
    'ears': "Sensores de Escuta",
    'goat_horns': "Chifres de Baphomet",
    'sharp_horns': "Chifres de Plasma",
    'curved_horns': "Chifres Curvados",
    'crown': "Coroa de Dados",
    'trash_bucket': "Balde do Lixo"
  };

  const updateHatType = async (direction: 1 | -1 = 1) => {
    if (!isOwnProfile || !profile) return;
    try {
      const types = ['wizard', 'headband', 'newsboy', 'halo', 'ears', 'goat_horns', 'sharp_horns', 'curved_horns', 'crown', 'trash_bucket'];
      const currentIndex = types.indexOf(profile.hat_type || 'wizard');
      const newIndex = (currentIndex + direction + types.length) % types.length;
      const newType = types[newIndex];

      const { error } = await supabase
        .from('profiles')
        .update({ hat_type: newType })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, hat_type: newType } : null);
    } catch (err) {
      console.error(`Erro ao atualizar modelo do chapéu:`, err);
    }
  };


  const updateCloakType = async (direction: 1 | -1 = 1) => {
    if (!isOwnProfile || !profile) return;
    try {
      const types = ['wind', 'transparent', 'long', 'spectral_legs', 'eternal_spectral', 'jetpack', 'ocular_radar', 'circular_radar', 'angel_wings', 'seraph_wings', 'original_wings', 'cyber_wings', 'spectral_wings', 'divine_wings', 'emblem_wings', 'fallen_wings', 'obsidian_wings', 'curved_wings', 'ritual_necklace_wings'];
      const currentIndex = types.indexOf(profile.cloak_type || 'wind');
      const newIndex = (currentIndex + direction + types.length) % types.length;
      const newType = types[newIndex];

      const { error } = await supabase
        .from('profiles')
        .update({ cloak_type: newType })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, cloak_type: newType } : null);
    } catch (err) {
      console.error(`Erro ao atualizar modelo da capa:`, err);
    }
  };

  const updateCloakEmblem = async (direction: 1 | -1 = 1) => {
    if (!isOwnProfile || !profile) return;
    try {
      const emblems = ['none', 'hexagram', 'pentagram', 'black_hole', 'white_flame', 'neon_heart', 'ice_fragment', 'orbital_nexus'];
      const currentIndex = emblems.indexOf(profile.cloak_emblem_type || 'none');
      const newIndex = (currentIndex + direction + emblems.length) % emblems.length;
      const newEmblem = emblems[newIndex];

      const { error } = await supabase
        .from('profiles')
        .update({ cloak_emblem_type: newEmblem })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, cloak_emblem_type: newEmblem } : null);
    } catch (err) {
      console.error(`Erro ao atualizar emblema da capa:`, err);
    }
  };

  const updateCloakEmblemColor = async (section: 'primary' | 'secondary', color: string) => {
    if (!isOwnProfile || !profile) return;
    try {
      const updateObj = section === 'primary' 
        ? { cloak_emblem_color: color } 
        : { cloak_emblem_secondary_color: color };

      const { error } = await supabase
        .from('profiles')
        .update(updateObj)
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...updateObj } : null);
    } catch (err) {
      console.error(`Erro ao atualizar cor do emblema (${section}):`, err);
    }
  };

  const updateStoneColor = async (section: 'internal' | 'border' | 'image', color: string) => {
    if (!isOwnProfile || !profile) return;
    try {
      const updateData = section === 'internal' 
        ? { stone_internal_color: color } 
        : section === 'border' 
        ? { stone_border_color: color }
        : { stone_image_color: color };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, ...updateData } : null);
    } catch (err) {
      console.error(`Erro ao atualizar cor da pedra (${section}):`, err);
    }
  };

  const toggleCloakEmblemFill = async () => {
    if (!isOwnProfile || !profile) return;
    try {
      const newValue = !profile.cloak_emblem_filled;
      const { error } = await supabase
        .from('profiles')
        .update({ cloak_emblem_filled: newValue })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, cloak_emblem_filled: newValue } : null);
    } catch (err) {
      console.error(`Erro ao alternar preenchimento do emblema:`, err);
    }
  };

  const updateWandType = async (direction: 1 | -1 = 1) => {
    if (!isOwnProfile || !profile) return;
    try {
      const types = ['material', 'neon', 'lightsaber', 'darksaber_glitch', 'tech_saber', 'kinetic_staff', 'light_sword', 'slim_sword', 'neon_flame', 'death_scythe'];
      const currentIndex = types.indexOf(profile.wand_type || 'material');
      const newIndex = (currentIndex + direction + types.length) % types.length;
      const newType = types[newIndex];

      const { error } = await supabase
        .from('profiles')
        .update({ wand_type: newType })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, wand_type: newType } : null);
    } catch (err) {
      console.error(`Erro ao atualizar modelo da varinha:`, err);
    }
  };

  const handleColorRightClick = (e: React.MouseEvent, field: string, currentValue: string, updateFn: (f: string, v: any) => void) => {
    e.preventDefault();
    if (colorClipboard && colorClipboard !== currentValue) {
      updateFn(field, colorClipboard);
    } else {
      setColorClipboard(currentValue);
    }
  };

  const updateAvatarMode = async () => {
    if (!isOwnProfile || !profile) return;
    try {
      const modes: ('material' | 'spiritual' | 'eye' | 'reptile' | 'sharingan' | 'rinnegan' | 'eyepatch')[] = ['material', 'spiritual', 'eye', 'reptile', 'sharingan', 'rinnegan', 'eyepatch'];
      const currentIndex = modes.indexOf((profile.avatar_mode as any) || 'material');
      const nextMode = modes[(currentIndex + 1) % modes.length];

      const { error } = await supabase
        .from('profiles')
        .update({ avatar_mode: nextMode })
        .eq('id', profile.id);

      if (error) throw error;
      setProfile(prev => prev ? { ...prev, avatar_mode: nextMode } : null);
    } catch (err) {
      console.error(`Erro ao atualizar modo do avatar:`, err);
    }
  };

  if (loading) return <div className={styles.loading}>Sincronizando consciência...</div>;
  if (!profile) return <div className={styles.error}>Consciência não encontrada.</div>;

  const isOwnProfile = currentUser?.id === profile.id;


  const totalServicePoints = Object.values(nodeSentiments).reduce((acc: number, sents: any) => {
    return acc + (sents['servir']?.count || 0);
  }, 0);

  const totalManifestations = manifestations.length + totalServicePoints;
  const currentLevel = (totalManifestations % 33) || (totalManifestations > 0 ? 33 : 0);
  const arquetipoIndex = Math.floor(totalManifestations / 33) % ARQUETIPOS.length;
  const currentArquetipo = ARQUETIPOS[arquetipoIndex];
  const ritualFrames = ['circle', 'square', 'triangle', 'hybrid', 'hexagram', 'pentagram'];
  const stoneFrameToRender = profile.stone_frame_type === 'morph_shield' 
    ? ritualFrames[ritualStep] 
    : (profile.stone_frame_type || 'circle');

  return (
    <main className={styles.container} style={{ '--nexo-color': profile.nexo_color || '#00f3ff' } as any}>
      <header className={styles.header} ref={headerRef}>
        <button onClick={() => router.back()} className={styles.backBtn}>
          <ArrowLeft size={24} />
        </button>

        {isOwnProfile && (
          <div className={styles.assetColorPickers}>
            <span className={styles.physicalNameLabel}>
              {profile.real_name || profile.full_name || "???"}
            </span>
            {/* Gatilho para abrir as opções */}
            <button 
              className={`${styles.essenceToggleBtn} ${isEditingEssence ? styles.active : ''}`}
              onClick={() => {
                setIsEditingEssence(!isEditingEssence);
                if (!isEditingEssence) {
                  setActiveMenu(null);
                }
              }}
              style={{ color: profile.nexo_color || '#00f3ff' } as any}
              title={isEditingEssence ? "Fechar Configuração" : "Configurar Essência Corporificada"}
            >
              {isEditingEssence ? <X size={20} /> : <Palette size={20} />}
            </button>

            <AnimatePresence>
              {isEditingEssence && (
                <motion.div 
                  className={styles.essenceFloatingPanel}
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                >
                  {/* RENDERIZADOR DE TOOLS ("Fórmulas Não Repetitivas") */}
                  {[
                    {
                      id: 'nexo',
                      icon: <Palette size={18} />,
                      title: 'Cor Nexo',
                      color: profile.nexo_color || '#00f3ff',
                      content: (
                        <>
                          <span className={styles.pickerTitle}>Frequência Cromática</span>
                          <div className={styles.colorGridTiny}>
                            {RITUAL_COLORS.map(c => (
                              <button 
                                key={c} 
                                className={`${styles.colorDot} ${profile.nexo_color === c ? styles.activeDot : ''}`} 
                                style={{ backgroundColor: c, color: c } as any} 
                                onClick={() => {
                                  setProfile({ ...profile, nexo_color: c });
                                  supabase.from('profiles').update({ nexo_color: c }).eq('id', profile.id);
                                }} 
                              />
                            ))}
                            <div className={styles.customColorWrapper}>
                              <Palette size={10} className={styles.rgbIcon} />
                              <input 
                                type="color" 
                                className={styles.rgbInput} 
                                value={profile.nexo_color || '#00f3ff'}
                                onChange={(e) => {
                                  const c = e.target.value;
                                  setProfile({ ...profile, nexo_color: c });
                                  supabase.from('profiles').update({ nexo_color: c }).eq('id', profile.id);
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )
                    },
                    {
                      id: 'cycle_stone',
                      icon: <Fingerprint size={18} />,
                      title: 'Mudar Pedra',
                      color: profile.stone_border_color || '#fff',
                      onClick: () => updateStoneImage(1),
                      extra: (profile.stone_history && (profile.stone_history as any).length > 0) ? (
                        <div className={styles.stoneHistoryTooltip}>
                           <span className={styles.tooltipLabel}>Recentes</span>
                           <div className={styles.historyGrid}>
                              {(profile.stone_history as any).map((item: any, i: number) => (
                                <button 
                                  key={`hist-${i}`} 
                                  className={styles.historyItem}
                                  onClick={(e) => { e.stopPropagation(); selectFromHistory(item); }}
                                >
                                  <img 
                                    src={item.type === 'pedra' ? `/pedras/${item.value}.png` : item.value} 
                                    alt="Recente" 
                                  />
                                </button>
                              ))}
                           </div>
                        </div>
                      ) : null
                    },
                    { 
                      id: 'banner', 
                      icon: <ImageIcon size={18} />, 
                      title: 'Banner',
                      color: profile.nexo_color || '#00f3ff',
                      content: (
                        <>
                          <span className={styles.pickerTitle}>Capa do Perfil</span>
                          <div className={styles.colorGridTiny}>
                            <button className={styles.assetMiniBtn} onClick={() => bannerInputRef.current?.click()} style={{ width: '100%', height: '40px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                              <Camera size={14} />
                            </button>
                            {RITUAL_COLORS.map(c => (
                              <button key={c} className={styles.colorDot} style={{ backgroundColor: c }} onClick={() => { setProfile({ ...profile, banner_url: null, nexo_color: c }); supabase.from('profiles').update({ banner_url: null, nexo_color: c }).eq('id', profile.id); setActiveMenu(null); }} />
                            ))}
                            <div className={styles.customColorWrapper}>
                              <Palette size={8} className={styles.rgbIcon} />
                              <input 
                                type="color" 
                                className={styles.rgbInput} 
                                value={profile.nexo_color || '#ffffff'}
                                onChange={(e) => {
                                  const c = e.target.value;
                                  setProfile({ ...profile, banner_url: null, nexo_color: c });
                                  supabase.from('profiles').update({ banner_url: null, nexo_color: c }).eq('id', profile.id);
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )
                    },
                    { 
                      id: 'avatar', 
                      icon: <Camera size={18} />, 
                      title: 'Avatar',
                      color: profile.nexo_color || '#00f3ff',
                      content: (
                        <>
                          <span className={styles.pickerTitle}>Foto de Perfil</span>
                          <div className={styles.colorGridTiny}>
                            <button className={styles.assetMiniBtn} onClick={() => avatarInputRef.current?.click()} style={{ width: '100%', height: '40px', border: '1px dashed rgba(255,255,255,0.2)' }}>
                              <User size={14} />
                            </button>
                          </div>
                        </>
                      )
                    },
                    {
                      id: 'avatar_mode',
                      icon: <Eye size={18} />,
                      title: 'Modo Avatar',
                      color: profile.nexo_color,
                      onClick: updateAvatarMode,
                    },
                    {
                      id: 'eye_colors',
                      icon: <Palette size={18} />,
                      title: 'Alterar Cores',
                      color: profile.eye_iris_color || '#fff',
                      content: (
                        <div className={styles.miniSettingsMenu} style={{ minWidth: '240px' }}>
                          <span className={styles.pickerTitle}>Cores do Olhar</span>
                          <div className={styles.eyeColorInputs}>
                            {[
                              { label: 'Íris', field: 'iris' },
                              { label: 'Esclera', field: 'sclera' },
                              { label: 'Pupila', field: 'pupil' },
                              { label: 'Borda', field: 'border' },
                              { label: 'Brilho Secundário', field: 'secondary' }
                            ].map(item => (
                              <div key={item.field} className={styles.eyeInputGroup}>
                                <label>{item.label}</label>
                                <div className={styles.colorGridTiny}>
                                  {RITUAL_COLORS.slice(0, 5).map(c => (
                                    <button 
                                      key={c} 
                                      className={`${styles.colorDot} ${(profile as any)[`eye_${item.field}_color`] === c ? styles.activeDot : ''}`} 
                                      style={{ backgroundColor: c, color: c } as any} 
                                      onClick={() => updateEyeColor(item.field, c)} 
                                    />
                                  ))}
                                  <div className={styles.customColorWrapper}>
                                    <Palette size={8} className={styles.rgbIcon} />
                                    <input 
                                      type="color" 
                                      className={styles.rgbInput} 
                                      value={(profile as any)[`eye_${item.field}_color`] || '#ffffff'}
                                      onChange={(e) => updateEyeColor(item.field, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          <span className={styles.pickerTitle} style={{ marginTop: '15px' }}>Estruturas Ativas</span>
                          <div className={styles.eyeColorInputs}>
                            {[
                              { label: 'Veias', field: 'veins', activeField: 'eye_veins_active' },
                              { label: 'Cílios', field: 'lashes', activeField: 'eye_lashes_active' }
                            ].map(item => (
                              <div key={item.field} className={styles.eyeInputGroup}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                                  <label>{item.label}</label>
                                  <button 
                                    className={`${styles.assetMiniBtn} ${(profile as any)[item.activeField] ? styles.btnActive : ''}`}
                                    onClick={() => updateEyeColor(item.activeField, !(profile as any)[item.activeField])}
                                    style={{ width: '22px', height: '22px', padding: '0', borderRadius: '6px' }}
                                    title={(profile as any)[item.activeField] ? "Desativar" : "Ativar"}
                                  >
                                    <Zap size={10} style={{ color: (profile as any)[item.activeField] ? 'var(--nexo-color)' : 'rgba(255,255,255,0.2)' }} />
                                  </button>
                                </div>
                                <div className={styles.colorGridTiny}>
                                  {RITUAL_COLORS.slice(0, 5).map(c => (
                                    <button 
                                      key={c} 
                                      className={`${styles.colorDot} ${(profile as any)[`eye_${item.field}_color`] === c ? styles.activeDot : ''}`} 
                                      style={{ backgroundColor: c, color: c } as any} 
                                      onClick={() => updateEyeColor(item.field, c)} 
                                    />
                                  ))}
                                  <div className={styles.customColorWrapper}>
                                    <Palette size={8} className={styles.rgbIcon} />
                                    <input 
                                      type="color" 
                                      className={styles.rgbInput} 
                                      value={(profile as any)[`eye_${item.field}_color`] || '#ffffff'}
                                      onChange={(e) => updateEyeColor(item.field, e.target.value)}
                                    />
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )
                    },
                    { 
                      id: 'cloak', 
                      icon: <Wind size={18} />, 
                      title: 'Capa',
                      color: profile.cloak_color || '#00f3ff',
                      isNavigable: true,
                      onPrev: () => updateCloakType(-1),
                      onNext: () => updateCloakType(1),
                      content: (
                        <>
                          <span className={styles.pickerTitle}>Cor da Capa</span>
                          <div className={styles.colorGridTiny}>
                            {RITUAL_COLORS.map(c => (
                              <button 
                                key={c} 
                                className={`${styles.colorDot} ${profile.cloak_color === c ? styles.activeDot : ''}`} 
                                style={{ backgroundColor: c, color: c } as any} 
                                onClick={() => updateAssetColor('cloak', 'primary', c)} 
                              />
                            ))}
                            <div className={styles.customColorWrapper}>
                              <Palette size={8} className={styles.rgbIcon} />
                              <input 
                                type="color" 
                                className={styles.rgbInput} 
                                value={profile.cloak_color || '#ffffff'}
                                onChange={(e) => updateAssetColor('cloak', 'primary', e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )
                    },
                    { 
                      id: 'hat', 
                      icon: <Crown size={18} />, 
                      title: 'Chapéu',
                      color: profile.hat_color || '#ff00ff',
                      isNavigable: true,
                      onPrev: () => updateHatType(-1),
                      onNext: () => updateHatType(1),
                      content: (
                        <>
                          <span className={styles.pickerTitle}>Cor do Chapéu</span>
                          <div className={styles.colorGridTiny}>
                            {RITUAL_COLORS.map(c => (
                              <button 
                                key={c} 
                                className={`${styles.colorDot} ${profile.hat_color === c ? styles.activeDot : ''}`} 
                                style={{ backgroundColor: c, color: c } as any} 
                                onClick={() => updateAssetColor('hat', 'primary', c)} 
                              />
                            ))}
                            <div className={styles.customColorWrapper}>
                              <Palette size={8} className={styles.rgbIcon} />
                              <input 
                                type="color" 
                                className={styles.rgbInput} 
                                value={profile.hat_color || '#ffffff'}
                                onChange={(e) => updateAssetColor('hat', 'primary', e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )
                    },
                    { 
                      id: 'stone', 
                      icon: <Gem size={18} />, 
                      title: 'Pedra',
                      color: profile.stone_border_color || '#fff',
                      isNavigable: true,
                      onPrev: () => updateStoneFrame(-1),
                      onNext: () => updateStoneFrame(1),
                      content: (
                        <>
                          <span className={styles.pickerTitle}>Cor da Moldura</span>
                          <div className={styles.colorGridTiny}>
                            {RITUAL_COLORS.map(c => (
                              <button 
                                key={c} 
                                className={`${styles.colorDot} ${profile.stone_border_color === c ? styles.activeDot : ''}`} 
                                style={{ backgroundColor: c, color: c } as any} 
                                onClick={() => updateStoneColor('border', c)} 
                              />
                            ))}
                            <div className={styles.customColorWrapper}>
                              <Palette size={8} className={styles.rgbIcon} />
                              <input 
                                type="color" 
                                className={styles.rgbInput} 
                                value={profile.stone_border_color || '#ffffff'}
                                onChange={(e) => updateStoneColor('border', e.target.value)}
                              />
                            </div>
                          </div>
                          <span className={styles.pickerTitle} style={{ marginTop: '12px' }}>Cor da Imagem</span>
                          <div className={styles.colorGridTiny}>
                            {RITUAL_COLORS.map(c => (
                              <button 
                                key={c} 
                                className={`${styles.colorDot} ${profile.stone_image_color === c ? styles.activeDot : ''}`} 
                                style={{ backgroundColor: c, color: c } as any} 
                                onClick={() => updateStoneColor('image', c)} 
                              />
                            ))}
                            <div className={styles.customColorWrapper}>
                              <Palette size={8} className={styles.rgbIcon} />
                              <input 
                                type="color" 
                                className={styles.rgbInput} 
                                value={profile.stone_image_color || '#ffffff'}
                                onChange={(e) => updateStoneColor('image', e.target.value)}
                              />
                            </div>
                          </div>
                        </>
                      )
                    },
                    { 
                      id: 'emblem', 
                      icon: <Zap size={18} />, 
                      title: 'Emblema',
                      color: profile.cloak_emblem_color || '#fff',
                      isNavigable: true,
                      onPrev: () => updateCloakEmblem(-1),
                      onNext: () => updateCloakEmblem(1),
                      content: (
                        <div className={styles.miniSettingsMenu}>
                            <span className={styles.pickerTitle}>Cor do Emblema</span>
                            <div className={styles.colorGridTiny} style={{ marginBottom: '12px' }}>
                              {RITUAL_COLORS.map(c => (
                                <button 
                                  key={c} 
                                  className={`${styles.colorDot} ${profile.cloak_emblem_color === c ? styles.activeDot : ''}`} 
                                  style={{ backgroundColor: c, color: c } as any} 
                                  onClick={() => updateCloakEmblemColor('primary', c)} 
                                />
                              ))}
                              <div className={styles.customColorWrapper}>
                                <Palette size={8} className={styles.rgbIcon} />
                                <input 
                                  type="color" 
                                  className={styles.rgbInput} 
                                  value={profile.cloak_emblem_color || '#ffffff'}
                                  onChange={(e) => updateCloakEmblemColor('primary', e.target.value)}
                                />
                              </div>
                            </div>
                           <button className={styles.assetMiniBtn} onClick={toggleCloakEmblemFill} style={{ width: '100%', opacity: profile.cloak_emblem_filled ? 1 : 0.6, fontSize: '0.65rem' }}>
                              <Zap size={14} fill={profile.cloak_emblem_filled ? "currentColor" : "none"} style={{ marginRight: '8px' }} /> 
                              {profile.cloak_emblem_filled ? "Preenchimento Ativo" : "Apenas Linhas"}
                            </button>
                        </div>
                      )
                    },
                    { 
                      id: 'wand', 
                      icon: <Sparkles size={18} />, 
                      title: 'Varinha',
                      color: profile.nexo_color || '#00f3ff',
                      isNavigable: true,
                      onPrev: () => updateWandType(-1),
                      onNext: () => updateWandType(1),
                      content: (
                        <>
                          <span className={styles.pickerTitle}>Frequência (Nexo)</span>
                          <div className={styles.colorGridTiny}>
                            {RITUAL_COLORS.map(c => (
                              <button 
                                key={c} 
                                className={`${styles.colorDot} ${profile.nexo_color === c ? styles.activeDot : ''}`} 
                                style={{ backgroundColor: c, color: c } as any} 
                                onClick={() => {
                                  setProfile({ ...profile, nexo_color: c });
                                  supabase.from('profiles').update({ nexo_color: c }).eq('id', profile.id);
                                }} 
                              />
                            ))}
                            <div className={styles.customColorWrapper}>
                              <Palette size={8} className={styles.rgbIcon} />
                              <input 
                                type="color" 
                                className={styles.rgbInput} 
                                value={profile.nexo_color || '#ffffff'}
                                onChange={(e) => {
                                  const c = e.target.value;
                                  setProfile({ ...profile, nexo_color: c });
                                  supabase.from('profiles').update({ nexo_color: c }).eq('id', profile.id);
                                }}
                              />
                            </div>
                          </div>
                        </>
                      )
                    },
                  ].map((tool) => (
                    <div key={tool.id} style={{ display: 'flex', alignItems: 'center' }}>
                      {tool.id === 'cloak' && <div className={styles.toolSpacer} />}
                      <div className={styles.navigativeToolGroup}>
                        {tool.isNavigable && (
                          <button className={styles.navArrowBtn} onClick={tool.onPrev}>
                            <ChevronLeft size={16} color="white" />
                          </button>
                        )}
                        
                        <div className={styles.colorPickerContainer}>
                          <button
                            className={`${styles.assetMiniBtn} ${activeMenu === tool.id ? styles.btnActive : ''}`}
                            onClick={() => tool.onClick ? tool.onClick() : setActiveMenu(activeMenu === tool.id ? null : tool.id)}
                            style={{ color: (profile?.nexo_color || '#00f3ff') as any }}
                            title={(tool as any).title}
                          >
                            {tool.icon}
                            {tool.extra}
                          </button>

                          <AnimatePresence>
                            {activeMenu === tool.id && tool.content && (
                              <motion.div
                                className={styles.colorGridExpanded}
                                initial={{ opacity: 0, y: 14, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 14, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                              >
                                {tool.content}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {tool.isNavigable && (
                          <button className={styles.navArrowBtn} onClick={tool.onNext}>
                            <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </header>

      <section className={styles.hero} ref={heroRef}>
        <div
          className={`${styles.heroBackground} ${(isEditingEssence && activeMenu === 'banner') ? styles.essenceEditActive : ''}`}
          style={{ backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : 'none' }}
          onClick={() => (isEditingEssence && activeMenu === 'banner') && bannerInputRef.current?.click()}
        >
          {(isEditingEssence && activeMenu === 'banner') && (
            <div className={styles.bannerEditOverlay}>
              <Camera size={24} />
              <span>Mudar Banner</span>
            </div>
          )}
          <input
            type="file"
            ref={bannerInputRef}
            className={styles.hiddenInput}
            accept="image/*"
            onChange={handleBannerChange}
          />
        </div>
        <div className={styles.profileCard}>
          <div
            className={`${styles.avatarLarge} ${styles[`archetype_${arquetipoIndex}`]}`}
            style={{ '--nexo-color': profile.nexo_color || '#00f3ff' } as any}
          >
            <div className={styles.avatarNameIndicator}>
              {profile.character_name || profile.username || "Desconhecido"}
            </div>
            <div className={styles.avatarLevelIndicator}>
              Lv {currentLevel}
            </div>
            {/* CAPA DE VENTO / TRANSPARENTE / LONGA / PERNAS ESPIRITUAIS */}
            {profile.cloak_enabled && (
              <motion.div
                className={styles.profileCloakContainer}
                style={{ 
                  zIndex: (profile.cloak_type === 'ocular_radar' || profile.cloak_type === 'circular_radar') ? 50 : undefined,
                  '--hat-color': profile.hat_color || profile.nexo_color || '#00f3ff',
                  transform: profile.cloak_type === 'fallen_wings' ? 'translateY(12vh)' : undefined
                } as any}
                animate={{
                  y: [0, 4, 0],
                  scale: [1, 1.01, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.svg
                    key={`cloak-${profile.cloak_type || 'wind'}`}
                    viewBox={(profile.cloak_type === 'ocular_radar' || profile.cloak_type === 'circular_radar') ? "0 0 200 300" : "0 0 200 450"}
                    className={styles.cloakSvg}
                    style={{ 
                      color: profile.cloak_color || profile.nexo_color || '#00f3ff', 
                      overflow: 'visible',
                      height: (profile.cloak_type === 'ocular_radar' || profile.cloak_type === 'circular_radar') ? '320px' : undefined 
                    }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5 }}
                  >
                    <defs>
                      <linearGradient id="cloakGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.7" />
                        <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0.2" />
                      </linearGradient>
                      <filter id="cloakGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="8" result="glow" />
                        <feComposite in="SourceGraphic" in2="glow" operator="over" />
                      </filter>
                      <pattern id="checkPattern" x="0" y="0" width="6" height="6" patternUnits="userSpaceOnUse">
                        <rect width="3" height="3" fill="currentColor" fillOpacity="0.8" />
                        <rect x="3" y="3" width="3" height="3" fill="currentColor" fillOpacity="0.8" />
                        <rect x="3" y="0" width="3" height="3" fill="currentColor" fillOpacity="0.2" />
                        <rect x="0" y="3" width="3" height="3" fill="currentColor" fillOpacity="0.2" />
                      </pattern>
                      <pattern id="fiberPattern" x="0" y="0" width="3" height="3" patternUnits="userSpaceOnUse">
                        <line x1="0" y1="0" x2="3" y2="3" stroke="currentColor" strokeWidth="0.15" strokeOpacity="0.2" />
                        <line x1="3" y1="0" x2="0" y2="3" stroke="currentColor" strokeWidth="0.1" strokeOpacity="0.1" />
                      </pattern>
                      <filter id="featherShadow">
                        <feDropShadow dx="0.8" dy="0.8" stdDeviation="0.4" floodOpacity="0.4" />
                      </filter>
                      <linearGradient id="angelWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ffffff" /> 
                        <stop offset="50%" stopColor="#f0f0f0" /> 
                        <stop offset="85%" stopColor="#d1d1d1" /> 
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.2" /> 
                      </linearGradient>
                      <filter id="diffuseEdgeGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <linearGradient id="seraphWingGradPrimary" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={profile.cloak_color || '#ffffff'} /> 
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.2" /> 
                      </linearGradient>
                      <linearGradient id="seraphWingGradSecondary" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={profile.cloak_color_secondary || '#ff00ff'} /> 
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.2" /> 
                      </linearGradient>
                      <linearGradient id="seraphWingGradTertiary" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={profile.cloak_color_tertiary || '#ffff00'} /> 
                        <stop offset="100%" stopColor="#000000" stopOpacity="0.2" /> 
                      </linearGradient>
                    </defs>

                    {profile.cloak_type === 'transparent' ? (
                      <g filter="url(#cloakGlow)">
                        <path
                          d="M60 40 C45 40 35 120 30 180 L20 320 L75 290 C100 280 100 280 125 290 L180 320 L170 180 C165 120 155 40 140 40 L60 40 Z"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeOpacity="0.4"
                        />
                        <path
                          d="M60 45 Q100 50 140 45"
                          stroke="currentColor"
                          strokeWidth="0.5"
                          strokeOpacity="0.3"
                          fill="none"
                        />
                      </g>
                    ) : profile.cloak_type === 'long' ? (
                      <g filter="url(#cloakGlow)">
                        <path
                          d="M60 40 C45 40 35 140 30 240 L20 370 L75 340 C100 330 100 330 125 340 L180 370 L170 240 C165 140 155 40 140 40 L60 40 Z"
                          fill="url(#cloakGrad)"
                          fillOpacity="0.4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        {/* Technological Circuit Detailing (Black) */}
                        <g opacity="0.5">
                          {/* Main Tech Spine */}
                          <path d="M100 45 L100 80 L85 100 L85 200 L115 230 L115 320" stroke="#000" strokeWidth="0.8" fill="none" strokeDasharray="4,2" />
                          <circle cx="100" cy="80" r="1.5" fill="#000" />
                          <circle cx="115" cy="320" r="1.5" fill="#000" />

                          {/* Left Wing Circuits */}
                          <path d="M70 45 L55 120 L40 120 L35 250" stroke="#000" strokeWidth="0.8" fill="none" />
                          <rect x="38" y="118" width="4" height="4" fill="#000" />
                          
                          {/* Right Wing Circuits */}
                          <path d="M130 45 L145 120 L160 120 L165 250" stroke="#000" strokeWidth="0.8" fill="none" />
                          <rect x="158" y="118" width="4" height="4" fill="#000" />

                          {/* Data Nodes */}
                          {[
                            {x: 60, y: 180}, {x: 140, y: 180},
                            {x: 80, y: 260}, {x: 120, y: 260}
                          ].map((node, i) => (
                            <g key={`tech-node-${i}`}>
                              <circle cx={node.x} cy={node.y} r="1.2" fill="#000" />
                              <line x1={node.x} y1={node.y} x2={node.x + (i%2 === 0 ? -10 : 10)} y2={node.y + 15} stroke="#000" strokeWidth="0.5" />
                            </g>
                          ))}

                          {/* Horizontal Tech Bands */}
                          <path d="M50 150 L150 150" stroke="#000" strokeWidth="0.4" strokeDasharray="1,2" />
                          <path d="M40 280 L160 280" stroke="#000" strokeWidth="0.4" strokeDasharray="1,2" />
                        </g>

                      </g>
                    ) : profile.cloak_type === 'spectral_legs' ? (
                      <g filter="url(#cloakGlow)">
                        <path
                          d="M60 40 C45 40 35 120 30 180 L20 320 L75 290 C100 280 100 280 125 290 L180 320 L170 180 C165 120 155 40 140 40 L60 40 Z"
                          fill="url(#cloakGrad)"
                          fillOpacity="0.3"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        {/* Spiritual Legs */}
                        {[0, 1, 2].map((i) => (
                          <motion.path
                            key={`spectral-leg-${i}`}
                            d={`M${70 + i * 30} 280 Q${60 + i * 40} 330 ${70 + i * 30} 380`}
                            stroke="currentColor"
                            strokeWidth="4"
                            strokeLinecap="round"
                            fill="none"
                            strokeOpacity="0.6"
                            animate={{
                              d: [
                                `M${70 + i * 30} 280 Q${60 + i * 40} 330 ${70 + i * 30} 380`,
                                `M${70 + i * 30} 280 Q${80 + i * 20} 340 ${65 + i * 35} 390`,
                                `M${70 + i * 30} 280 Q${60 + i * 40} 330 ${70 + i * 30} 380`
                              ],
                              opacity: [0.4, 0.8, 0.4]
                            }}
                            transition={{ duration: 3 + i, repeat: Infinity, ease: "easeInOut" }}
                          />
                        ))}
                      </g>
                    ) : profile.cloak_type === 'eternal_spectral' ? (
                      <g filter="url(#cloakGlow)">
                        {/* Even Larger Body with Jagged Bottom */}
                        <motion.path
                          d="M60 40 C45 40 30 150 20 250 L5 360 L40 330 L75 345 C100 340 100 340 125 345 L160 330 L195 360 L180 250 C170 150 155 40 140 40 L60 40 Z"
                          fill="url(#cloakGrad)"
                          fillOpacity="0.4"
                          stroke="currentColor"
                          strokeWidth="2"
                          animate={{
                            d: [
                              "M60 40 C45 40 30 150 20 250 L5 360 L40 330 L75 345 C100 340 100 340 125 345 L160 330 L195 360 L180 250 C170 150 155 40 140 40 L60 40 Z",
                              "M60 40 C45 40 50 150 70 250 L85 360 L120 330 L155 345 C180 340 180 340 205 345 L240 330 L275 360 L230 250 C190 150 155 40 140 40 L60 40 Z", // Uniform Right
                              "M60 40 C45 40 10 150 -30 250 L-75 360 L-40 330 L-5 345 C20 340 20 340 45 345 L80 330 L115 360 L130 250 C150 150 155 40 140 40 L60 40 Z", // Uniform Left
                              "M60 40 C45 40 30 150 20 250 L5 360 L40 330 L75 345 C100 340 100 340 125 345 L160 330 L195 360 L180 250 C170 150 155 40 140 40 L60 40 Z"
                            ]
                          }}
                          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        />

                      </g>
                    ) : profile.cloak_type === 'jetpack' ? (
                      <g filter="url(#cloakGlow)">
                        <defs>
                          <g id="gear">
                            <circle r="8" fill="none" stroke="currentColor" strokeWidth="2" />
                            {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
                              <rect key={deg} x="-2" y="-12" width="4" height="4" fill="currentColor" transform={`rotate(${deg})`} />
                            ))}
                          </g>
                        </defs>
                        {/* Jetpack Chassis */}
                        <rect x="60" y="40" width="35" height="70" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                        <rect x="105" y="40" width="35" height="70" rx="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" />
                        <rect x="75" y="55" width="50" height="40" rx="2" fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="1" />

                        {/* Moving Gears */}
                        <motion.use href="#gear" x="77" y="75" animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                        <motion.use href="#gear" x="123" y="75" animate={{ rotate: -360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                        <motion.use href="#gear" x="100" y="55" scale="0.7" animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />

                        {/* Thrusters & Fire */}
                        {[77, 123].map((x, i) => (
                          <g key={`thruster-${i}`}>
                            <rect x={x - 10} y="110" width="20" height="15" rx="2" fill="currentColor" fillOpacity="0.6" />
                            <motion.path
                              d={`M${x - 8} 125 Q${x} 220 ${x + 8} 125`}
                              fill="rgba(255,255,255,0.8)"
                              animate={{
                                d: [
                                  `M${x - 8} 125 Q${x} 220 ${x + 8} 125`,
                                  `M${x - 12} 125 Q${x} 320 ${x + 12} 125`,
                                  `M${x - 8} 125 Q${x} 220 ${x + 8} 125`
                                ],
                                opacity: [0.6, 1, 0.6]
                              }}
                              transition={{ duration: 0.15, repeat: Infinity }}
                            />
                            <motion.path
                              d={`M${x - 5} 125 Q${x} 160 ${x + 5} 125`}
                              fill="currentColor"
                              animate={{ scaleY: [1, 1.5, 1] }}
                              transition={{ duration: 0.1, repeat: Infinity }}
                            />
                          </g>
                        ))}
                      </g>
                    ) : profile.cloak_type === 'ocular_radar' ? (
                      <g filter="url(#cloakGlow)" transform="translate(0, -120)">
                        {/* Observer Eyes - Manifests for 3s every 7s */}
                        {[18, 182].map((x, i) => (
                          <g key={`square-radar-eye-${i}`}>
                            {/* Eye Sclera/Lids */}
                            <motion.path
                              d={`M ${x-12} 150 Q ${x} 138 ${x+12} 150 Q ${x} 162 ${x-12} 150`}
                              fill="rgba(0,0,0,0.1)"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeOpacity="0.4"
                              initial={{ scaleY: 0, opacity: 0 }}
                              animate={{ 
                                scaleY: [0, 1, 1, 1, 0],
                                opacity: [0, 1, 1, 1, 0]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 4,
                                times: [0, 0.1, 0.5, 0.9, 1]
                              }}
                            />
                            {/* Pupil */}
                            <motion.circle
                              cx={x} cy="150" r="4"
                              fill="currentColor"
                              animate={{
                                scale: [1, 0.8, 1.2, 0.8, 1],
                                x: [0, -1, 1, 0, 0],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 4,
                                times: [0, 0.2, 0.5, 0.8, 1]
                              }}
                            />
                            {/* Circuit Connections */}
                            {[0, 60, 120, 180, 240, 300].map((angle, j) => {
                              const rad = (angle * Math.PI) / 180;
                              const x2 = x + Math.cos(rad) * 12;
                              const y2 = 150 + Math.sin(rad) * 12;
                              return (
                                <g key={`circuit-sq-${j}`}>
                                  <motion.line
                                    x1={x} y1="150"
                                    x2={x2} y2={y2}
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ 
                                      pathLength: [0, 1, 1, 1, 0],
                                      opacity: [0, 1, 1, 1, 0]
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      repeatDelay: 4,
                                      times: [0, 0.1, 0.5, 0.9, 1]
                                    }}
                                  />
                                  <motion.circle
                                    cx={x2} cy={y2} r="1"
                                    fill="currentColor"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 1, 1, 0] }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      repeatDelay: 4,
                                      times: [0, 0.1, 0.5, 0.9, 1]
                                    }}
                                  />
                                </g>
                              );
                            })}
                            {/* Occasional Blink during manifest */}
                            <motion.path
                              d={`M ${x-12} 150 L ${x+12} 150`}
                              stroke="currentColor"
                              strokeWidth="2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0, 1, 0, 0] }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 4,
                                times: [0, 0.45, 0.5, 0.55, 1]
                              }}
                            />
                          </g>
                        ))}

                        {/* Radar Screen Box (Centered over Eye area) */}
                        <motion.g
                          initial={{ opacity: 0, scale: 0.9, x: 20 }}
                          animate={{ opacity: 1, scale: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          {/* Screen Foundation */}
                          <rect x="30" y="80" width="140" height="140" rx="4" fill="rgba(0,0,0,0.08)" stroke="currentColor" strokeWidth="2" strokeOpacity="0.8" />
                          <rect x="35" y="85" width="130" height="130" rx="2" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.2" />

                          {/* Grid lines */}
                          <line x1="30" y1="150" x2="170" y2="150" stroke="currentColor" strokeWidth="1" strokeOpacity="0.05" />
                          <line x1="100" y1="80" x2="100" y2="220" stroke="currentColor" strokeWidth="1" strokeOpacity="0.05" />

                          <defs>
                            <linearGradient id="linearScanGrad" x1="1" y1="0" x2="0" y2="0">
                              <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
                              <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Direction-Aware Ping-Pong Scanner */}
                          <motion.g
                            initial={{ x: 80 }}
                            animate={{ x: [80, 170, 80] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          >
                            {/* The Trail - Flips scaleX at the boundaries to remain behind */}
                            <motion.g
                              animate={{ scaleX: [1, 1, -1, -1, 1] }}
                              transition={{ duration: 3, repeat: Infinity, times: [0, 0.45, 0.55, 0.95, 1] }}
                            >
                              <rect x="-50" y="80" width="50" height="140" fill="url(#linearScanGrad)" fillOpacity="0.3" />
                            </motion.g>

                            {/* The Scanning Line */}
                            <line x1="0" y1="80" x2="0" y2="220" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                          </motion.g>

                          {/* Small Quadricular Sub-Screen - Dynamic Visibility (3.5s/3.5s) */}
                          <motion.g
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 0, 1, 0.5, 1, 1, 0],
                              x: [0, 0, 2, -2, 4, 0, 0],
                              skewX: [0, 0, 10, -10, 0, 0, 0]
                            }}
                            transition={{
                              duration: 7,
                              repeat: Infinity,
                              times: [0, 0.49, 0.5, 0.52, 0.55, 0.99, 1]
                            }}
                          >
                            {/* Sub-box Background */}
                            <rect x="35" y="85" width="60" height="60" rx="2" fill="url(#checkPattern)" fillOpacity="0.15" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
                            
                            <text x="40" y="98" fontSize="8" fill="currentColor" fillOpacity="0.9" style={{ fontFamily: 'monospace' }}>
                              ID: {currentUserProfile?.username || 'GUEST'}
                            </text>
                            <text x="40" y="110" fontSize="8" fill="currentColor" fillOpacity="0.9" style={{ fontFamily: 'monospace' }}>
                              AGE: {currentUserProfile?.age || '--'}
                            </text>
                            <text x="40" y="122" fontSize="8" fill="currentColor" fillOpacity="0.9" style={{ fontFamily: 'monospace' }}>
                              LVL: {currentUserProfile?.level || '1'}
                            </text>
                            <text x="40" y="134" fontSize="8" fill="currentColor" fillOpacity="0.9" style={{ fontFamily: 'monospace' }}>
                              HEX: {currentUserProfile?.nexo_color || '#00F3FF'}
                            </text>
                          </motion.g>

                          <text x="105" y="210" fontSize="9" fill="currentColor" fillOpacity="0.6" style={{ fontFamily: 'monospace' }}>LINEAR_SYNC: ACTIVE</text>
                        </motion.g>
                      </g>
                    ) : profile.cloak_type === 'circular_radar' ? (
                      <g filter="url(#cloakGlow)" transform="translate(0, -118)">
                        {/* Observer Eyes - Manifests for 3s every 7s */}
                        {[18, 182].map((x, i) => (
                          <g key={`radar-eye-${i}`}>
                            {/* Eye Sclera/Lids */}
                            <motion.path
                              d={`M ${x-12} 150 Q ${x} 138 ${x+12} 150 Q ${x} 162 ${x-12} 150`}
                              fill="rgba(0,0,0,0.1)"
                              stroke="currentColor"
                              strokeWidth="1"
                              strokeOpacity="0.4"
                              initial={{ scaleY: 0, opacity: 0 }}
                              animate={{ 
                                scaleY: [0, 1, 1, 1, 0],
                                opacity: [0, 1, 1, 1, 0]
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 4,
                                times: [0, 0.1, 0.5, 0.9, 1]
                              }}
                            />
                            {/* Pupil (The previous circle) */}
                            <motion.circle
                              cx={x} cy="150" r="4"
                              fill="currentColor"
                              animate={{
                                scale: [1, 0.8, 1.2, 0.8, 1],
                                x: [0, -1, 1, 0, 0],
                              }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 4,
                                times: [0, 0.2, 0.5, 0.8, 1]
                              }}
                            />
                            {/* Circuit Connections */}
                            {[0, 60, 120, 180, 240, 300].map((angle, j) => {
                              const rad = (angle * Math.PI) / 180;
                              const x2 = x + Math.cos(rad) * 12;
                              const y2 = 150 + Math.sin(rad) * 12;
                              return (
                                <g key={`circuit-circ-${j}`}>
                                  <motion.line
                                    x1={x} y1="150"
                                    x2={x2} y2={y2}
                                    stroke="currentColor"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.5"
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ 
                                      pathLength: [0, 1, 1, 1, 0],
                                      opacity: [0, 1, 1, 1, 0]
                                    }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      repeatDelay: 4,
                                      times: [0, 0.1, 0.5, 0.9, 1]
                                    }}
                                  />
                                  <motion.circle
                                    cx={x2} cy={y2} r="1"
                                    fill="currentColor"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: [0, 1, 1, 1, 0] }}
                                    transition={{
                                      duration: 3,
                                      repeat: Infinity,
                                      repeatDelay: 4,
                                      times: [0, 0.1, 0.5, 0.9, 1]
                                    }}
                                  />
                                </g>
                              );
                            })}
                            {/* Occasional Blink during manifest */}
                            <motion.path
                              d={`M ${x-12} 150 L ${x+12} 150`}
                              stroke="currentColor"
                              strokeWidth="2"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 0, 1, 0, 0] }}
                              transition={{
                                duration: 3,
                                repeat: Infinity,
                                repeatDelay: 4,
                                times: [0, 0.45, 0.5, 0.55, 1]
                              }}
                            />
                          </g>
                        ))}

                        {/* Circular Radar Screen */}
                        <motion.g
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                        >
                          {/* Outer Border (Increased 8% + 2%) */}
                          <circle cx="100" cy="150" r="82" fill="rgba(0,0,0,0.08)" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.8" />

                          {/* Concentric Grid */}
                          <circle cx="100" cy="150" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" />
                          <circle cx="100" cy="150" r="37" fill="none" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.05" />

                          {/* Small Quadricular Sub-Screen - Dynamic Visibility (3.5s/3.5s) */}
                          <motion.g
                            initial={{ opacity: 0 }}
                            animate={{
                              opacity: [0, 0, 1, 0, 1, 1, 0],
                              skewX: [0, 0, 15, -15, 0, 0, 0],
                              x: [0, 0, 2, -2, 0, 0, 0]
                            }}
                            transition={{
                              duration: 7,
                              repeat: Infinity,
                              times: [0, 0.49, 0.5, 0.52, 0.55, 0.99, 1]
                            }}
                          >
                            {/* Central Sub-box */}
                            <rect x="70" y="120" width="60" height="60" rx="2" fill="url(#checkPattern)" fillOpacity="0.1" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                            
                            <g style={{ fontFamily: 'monospace', fontSize: '7px', pointerEvents: 'none' }} fill="currentColor" fillOpacity="0.9">
                              <text x="100" y="135" textAnchor="middle" fontSize="8" fontWeight="bold">{currentUserProfile?.username?.toUpperCase() || 'OFFLINE'}</text>
                              <text x="75" y="150" textAnchor="start">AGE:{currentUserProfile?.age || '??'}</text>
                              <text x="75" y="160" textAnchor="start">LVL:{currentUserProfile?.level || '0'}</text>
                              <text x="75" y="170" textAnchor="start">NEX:{currentUserProfile?.nexo_color?.slice(0,7) || 'NONE'}</text>
                            </g>
                          </motion.g>

                          <defs>
                            <clipPath id="radarCircleClip">
                              <circle cx="100" cy="150" r="82" />
                            </clipPath>
                          </defs>

                          {/* Rotating Radar Sweep (Right to Left/Counter-Clockwise) */}
                          <motion.g
                            initial={{ rotate: 0 }}
                            animate={{ rotate: -360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: "100px 150px" }}
                          >
                            <foreignObject x="18" y="68" width="164" height="164" clipPath="url(#radarCircleClip)">
                              <div style={{
                                width: '100%',
                                height: '100%',
                                borderRadius: '50%',
                                background: `conic-gradient(from 90deg, currentColor 0%, transparent 25%)`,
                                opacity: 0.4
                              }} />
                            </foreignObject>
                            <line 
                              x1="100" y1="150" x2="182" y2="150" 
                              stroke="currentColor" 
                              strokeWidth="2" 
                              strokeLinecap="round"
                              style={{ filter: 'drop-shadow(0 0 5px currentColor)' }}
                            />
                          </motion.g>
                        </motion.g>
                      </g>
                    ) : profile.cloak_type === 'original_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {/* DIVINE RADIANCE HALO */}
                        <motion.g
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: [0, 0.15, 0.15, 0], scale: [0.9, 1.05, 1.05, 0.9] }}
                          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          <circle cx="100" cy="140" r="160" fill="none" stroke={profile.cloak_color || "#fff"} strokeWidth="0.1" strokeDasharray="1,15" />
                          <circle cx="100" cy="140" r="130" fill="none" stroke={profile.cloak_color_secondary || "#fff"} strokeWidth="0.2" strokeDasharray="5,10" />
                        </motion.g>

                        <motion.g
                          animate={{ y: [0, -3, 0] }}
                          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          {[1, -1].map((side) => (
                            <motion.g
                              key={`original-wing-${side}`}
                              animate={{ rotate: side === 1 ? [-2, -6, -2] : [2, 6, 2] }}
                              transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                              style={{ transformOrigin: "100px 140px" }}
                            >
                              {/* DENSE ORGANIC PLUMAGE - Primary Layer (White/Core) */}
                              {[...Array(30)].map((_, i) => {
                                const angle = (i / 30) * 160 - 80;
                                const rad = (angle * Math.PI) / 180;
                                const length = 100 + (i % 5) * 5;
                                const x2 = 100 + (side * Math.cos(rad) * length);
                                const y2 = 140 + (Math.sin(rad) * length);
                                
                                return (
                                  <motion.path
                                    key={`feather-orig-${i}`}
                                    d={`M 100 140 C ${100 + side*20} 145 ${100 + side*50} ${140 + (i%5)*10} ${x2} ${y2}`}
                                    fill="none"
                                    stroke={profile.cloak_color || "#fff"}
                                    strokeWidth={6 - (i / 10)}
                                    strokeLinecap="round"
                                    strokeOpacity={0.8}
                                    animate={{
                                      strokeWidth: [6 - (i / 10), 8 - (i / 10), 6 - (i / 10)],
                                      opacity: [0.6, 1, 0.6]
                                    }}
                                    transition={{ duration: 10 + (i % 5), repeat: Infinity, delay: i * 0.1 }}
                                  />
                                );
                              })}

                              {/* VOLUME SHADING - Secondary Layer */}
                              {[...Array(20)].map((_, i) => {
                                const angle = (i / 20) * 140 - 70;
                                const rad = (angle * Math.PI) / 180;
                                const length = 80 + (i % 3) * 8;
                                const x2 = 100 + (side * Math.cos(rad) * length);
                                const y2 = 140 + (Math.sin(rad) * length);
                                
                                return (
                                  <motion.path
                                    key={`feather-shading-${i}`}
                                    d={`M 100 140 Q ${100 + side*40} ${130 + (i%3)*20} ${x2} ${y2}`}
                                    fill="none"
                                    stroke={profile.cloak_color_secondary || "#f0f0f0"}
                                    strokeWidth={12 - (i / 2)}
                                    strokeLinecap="round"
                                    strokeOpacity={0.3}
                                    style={{ filter: "blur(4px)" }}
                                    animate={{ opacity: [0.1, 0.4, 0.1] }}
                                    transition={{ duration: 12, repeat: Infinity, delay: i * 0.2 }}
                                  />
                                );
                              })}

                              {/* EDGE HIGHLIGHTS - Tertiary Layer */}
                              {[...Array(15)].map((_, i) => {
                                const angle = (i / 15) * 170 - 85;
                                const rad = (angle * Math.PI) / 180;
                                const length = 110 + (i % 4) * 3;
                                const x2 = 100 + (side * Math.cos(rad) * length);
                                const y2 = 140 + (Math.sin(rad) * length);
                                
                                return (
                                  <motion.path
                                    key={`feather-edge-${i}`}
                                    d={`M 100 140 C ${100 + side*30} 135 ${100 + side*60} ${140 + (i%4)*5} ${x2} ${y2}`}
                                    fill="none"
                                    stroke={profile.cloak_color_tertiary || "#fff"}
                                    strokeWidth="0.8"
                                    strokeLinecap="round"
                                    strokeOpacity={0.9}
                                    animate={{
                                      pathLength: [0, 1, 0],
                                      opacity: [0, 0.8, 0]
                                    }}
                                    transition={{ duration: 8, repeat: Infinity, delay: i * 0.3 }}
                                  />
                                );
                              })}

                              {/* WHITE COATING - Soft Bloom Effect */}
                              <motion.path
                                d={side === 1 
                                  ? "M 100 140 C 120 120 160 100 200 140 C 180 180 140 220 100 200"
                                  : "M 100 140 C 80 120 40 100 0 140 C 20 180 60 220 100 200"}
                                fill={profile.cloak_color || "#fff"}
                                fillOpacity="0.15"
                                style={{ filter: "blur(15px)" }}
                                animate={{ opacity: [0.1, 0.2, 0.1] }}
                                transition={{ duration: 15, repeat: Infinity }}
                              />
                            </motion.g>
                          ))}
                        </motion.g>
                      </g>

                    ) : profile.cloak_type === 'seraph_wings' ? (
                      <>
                        <g filter="url(#cloakGlow)">
                        {/* SACRED GEOMETRY HALO - Uses Primary Color */}
                        <motion.g
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: [0, 0.12, 0.12, 0, 0],
                            scale: [0.8, 1.1, 1.1, 0.8, 0.8],
                            rotate: 360 
                          }}
                          transition={{ 
                            duration: 30, 
                            times: [0, 0.1, 0.4, 0.5, 1], 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          {[0, 60, 120, 180, 240, 300].map(deg => (
                            <g key={`seraph-geo-${deg}`} transform={`rotate(${deg}, 100, 140)`}>
                              <circle cx="100" cy="140" r="100" fill="none" stroke={profile.cloak_color || "#fff"} strokeWidth="0.2" strokeOpacity="0.15" strokeDasharray="4,12" />
                              <circle cx="100" cy="140" r="140" fill="none" stroke={profile.cloak_color_secondary || "#fff"} strokeWidth="0.1" strokeOpacity="0.1" strokeDasharray="2,6" />
                              <path d="M 100 0 L 200 140 L 100 280 L 0 140 Z" fill="none" stroke={profile.cloak_color_tertiary || "#fff"} strokeWidth="0.1" strokeOpacity="0.1" />
                            </g>
                          ))}
                        </motion.g>
                        
                        <motion.g
                          animate={{ 
                            opacity: [1, 1, 0, 0, 1, 0, 1, 0.6, 1] 
                          }}
                          transition={{ 
                            duration: 8.5, 
                            times: [0, 0.82, 0.83, 0.94, 0.95, 0.96, 0.97, 0.98, 1], 
                            repeat: Infinity,
                            delay: 8 
                          }}
                        >
                          <motion.g
                            initial={{ opacity: 0, scale: 0.9, scaleX: 0 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              scaleX: 1,
                              y: [0, 2, -2, 0],
                              x: [0, 2, -2, 0]
                            }}
                            transition={{
                              opacity: { duration: 6, ease: "easeInOut" },
                              scaleX: { duration: 8, ease: "easeOut" },
                              y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                              x: { duration: 30, repeat: Infinity, ease: "easeInOut" },
                              delay: 0.1
                            }}
                            style={{ transformOrigin: "100px 140px" }}
                          >
                          {[1, -1].map((side) => (
                            <motion.g
                              key={`seraph-wing-${side}`}
                              filter="url(#featherShadow)"
                              animate={{ 
                                rotate: side === 1 ? [-10, -14, -10] : [10, 14, 10]
                              }}
                              transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                              }}
                              style={{ transformOrigin: "100px 140px" }}
                            >
                            {/* ROBUST BASE - (Primary Color) */}
                            <g>
                              {[...Array(12)].map((_, i) => {
                                const row = Math.floor(i / 4);
                                const col = i % 4;
                                const baseX = 100 + (side * (col * 3));
                                const baseY = 140 + (row * 4);
                                return (
                                  <motion.path
                                    key={`seraph-base-${i}`}
                                    d={`M ${baseX} ${baseY} Q ${baseX - side*5} ${baseY - 5} ${baseX - side*10} ${baseY} Z`}
                                    fill="url(#seraphWingGradPrimary)"
                                    stroke={profile.cloak_color || "#fff"}
                                    strokeWidth="1.2"
                                    animate={{ 
                                      scale: [1, 0.92, 1.15, 1, 1],
                                      rotate: [0, side * -2, side * 8, side * 2, 0],
                                      strokeOpacity: [0.3, 0.6, 1, 0.3, 0.3]
                                    }}
                                    transition={{ duration: 25, times: [0, 0.08, 0.18, 0.45, 1], delay: i * 0.05, repeat: Infinity, ease: "easeInOut" }}
                                  />
                                );
                              })}
                            </g>

                            {/* SUPERNATURAL EMANATION - (Secondary Color) */}
                            {[...Array(5)].map((_, i) => (
                              <motion.path
                                key={`seraph-emanation-${i}`}
                                d={side === 1 
                                  ? `M 100 140 C ${118 + i*8} ${125 - i*4} ${162 + i*12} ${88 - i*16} ${188 + i*4} ${38 - i*8}`
                                  : `M 100 140 C ${82 - i*8} ${125 - i*4} ${38 - i*12} ${88 - i*16} ${12 - i*4} ${38 - i*8}`}
                                fill="none"
                                stroke={profile.cloak_color_secondary || "#ff00ff"}
                                strokeWidth={20 + i * 8}
                                strokeLinecap="round"
                                style={{ filter: "blur(25px)", mixBlendMode: "screen", opacity: 0.1 }}
                                animate={{
                                  opacity: [0, 0.15, 0.2, 0.1, 0],
                                  scale: [0.98, 1.05, 1]
                                }}
                                transition={{ duration: 14, repeat: Infinity, times: [0, 0.1, 0.4, 0.5, 1], delay: i * 0.15 }}
                              />
                            ))}

                            {/* MAIN WING FAN - (Mixed Layers) */}
                            {[...Array(12)].map((_, i) => (
                              <motion.g key={`seraph-primary-feather-group-${i}`}>
                                <motion.path
                                  d={side === 1 
                                    ? `M 100 140 C ${107.5 + i*2} ${132.5 - i*2} ${130 + i*4} ${115 - i*6} ${142.5 + i*2} ${90 - i*4}`
                                    : `M 100 140 C ${92.5 - i*2} ${132.5 - i*2} ${70 - i*4} ${115 - i*6} ${57.5 - i*2} ${90 - i*4}`}
                                  fill={i % 3 === 0 ? "url(#seraphWingGradTertiary)" : i % 2 === 0 ? "url(#seraphWingGradSecondary)" : "url(#seraphWingGradPrimary)"}
                                  stroke={i % 3 === 0 ? profile.cloak_color_tertiary || "#fff" : profile.cloak_color || "#fff"}
                                  strokeWidth={1.5 - (i * 0.1)}
                                  strokeOpacity={0.8}
                                  animate={{
                                    d: side === 1 
                                       ? [
                                           `M 100 140 C ${107.5 + i*2} ${132.5 - i*2} ${130 + i*4} ${115 - i*6} ${142.5 + i*2} ${90 - i*4}`, 
                                           `M 100 140 C ${109 + i*2} ${131 - i*2} ${131 + i*4} ${114 - i*6} ${144 + (i%3)*2} ${89 - i*4}`,
                                           `M 100 140 C ${107.5 + i*2} ${132.5 - i*2} ${130 + i*4} ${115 - i*6} ${142.5 + i*2} ${90 - i*4}`
                                         ]
                                       : [
                                           `M 100 140 C ${92.5 - i*2} ${132.5 - i*2} ${70 - i*4} ${115 - i*6} ${57.5 - i*2} ${90 - i*4}`, 
                                           `M 100 140 C ${91 - i*2} ${131 - i*2} ${69 - i*4} ${114 - i*6} ${56 - (i%3)*2} ${89 - i*4}`,
                                           `M 100 140 C ${92.5 - i*2} ${132.5 - i*2} ${70 - i*4} ${115 - i*6} ${57.5 - i*2} ${90 - i*4}`
                                         ]
                                  }}
                                  transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 0.8 + (i * 0.25) }}
                                />
                              </motion.g>
                            ))}

                            {/* LIGHT DIFFUSING FILAMENTS - (Tertiary Color / Lasers) */}
                            {[...Array(6)].map((_, f) => (
                              <motion.line
                                key={`seraph-laser-${f}`}
                                x1={100} y1={140}
                                x2={side === 1 ? 280 + f*40 : -80 - f*40}
                                y2={-120 + f*30}
                                stroke={profile.cloak_color_tertiary || "#fff"}
                                strokeWidth="2"
                                style={{ filter: "url(#cloakGlow)" }}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: [0.3, 1, 0.3] }}
                                transition={{ pathLength: { duration: 4, ease: "easeOut" }, opacity: { duration: 2, repeat: Infinity } }}
                              />
                            ))}
                          </motion.g>
                        ))}
                        </motion.g>
                        </motion.g>
                        </g>
                      </>
                    ) : profile.cloak_type === 'cyber_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {/* TECH CORE - Energy Reactor */}
                        <motion.g
                          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          <circle cx="100" cy="140" r="15" fill={profile.cloak_color_secondary || "#00f3ff"} fillOpacity="0.2" />
                          <circle cx="100" cy="140" r="5" fill={profile.cloak_color_tertiary || "#fff"} />
                        </motion.g>

                        {[1, -1].map((side) => (
                          <motion.g
                            key={`cyber-wing-${side}`}
                            animate={{ rotate: side === 1 ? [-5, -8, -5] : [5, 8, 5] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: "100px 140px" }}
                          >
                            {/* RADIANT SMOKE - Secondary Color (Sophisticated Flow) */}
                            {[...Array(8)].map((_, i) => (
                              <motion.path
                                key={`cyber-smoke-${i}`}
                                d={side === 1
                                  ? `M 140 120 C ${160 + i*10} ${100 - i*5} ${200 + i*15} ${150 + i*20} ${180 + i*30} ${280 + i*10}`
                                  : `M 60 120 C ${40 - i*10} ${100 - i*5} ${0 - i*15} ${150 + i*20} ${20 - i*30} ${280 + i*10}`}
                                stroke={profile.cloak_color_secondary || "#00f3ff"}
                                strokeWidth={15 + i * 5}
                                fill="none"
                                strokeLinecap="round"
                                style={{ filter: "blur(30px)", mixBlendMode: "screen", opacity: 0.05 }}
                                animate={{ 
                                  d: side === 1
                                    ? [
                                        `M 140 120 C ${160 + i*10} ${100 - i*5} ${200 + i*15} ${150 + i*20} ${180 + i*30} ${280 + i*10}`,
                                        `M 140 120 C ${170 + i*10} ${90 - i*5} ${210 + i*15} ${160 + i*20} ${190 + i*30} ${300 + i*10}`,
                                        `M 140 120 C ${160 + i*10} ${100 - i*5} ${200 + i*15} ${150 + i*20} ${180 + i*30} ${280 + i*10}`
                                      ]
                                    : [
                                        `M 60 120 C ${40 - i*10} ${100 - i*5} ${0 - i*15} ${150 + i*20} ${20 - i*30} ${280 + i*10}`,
                                        `M 60 120 C ${30 - i*10} ${90 - i*5} ${-10 - i*15} ${160 + i*20} ${10 - i*30} ${300 + i*10}`,
                                        `M 60 120 C ${40 - i*10} ${100 - i*5} ${0 - i*15} ${150 + i*20} ${20 - i*30} ${280 + i*10}`
                                      ],
                                  opacity: [0.03, 0.08, 0.03]
                                }}
                                transition={{ duration: 15, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                              />
                            ))}

                            {/* MECHANICAL ARM - Primary Structure (Rounded & Uniform) */}
                            <motion.path
                              d={side === 1 
                                ? "M 100 140 L 140 120 L 180 140 L 220 100"
                                : "M 100 140 L 60 120 L 20 140 L -20 100"}
                              stroke={profile.cloak_color || "#fff"}
                              strokeWidth="8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              animate={{ strokeWidth: [8, 9, 8] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            />

                            {/* TECH SHOULDER PAULDRONS - Replaces Hydraulic Triangles */}
                            <motion.g
                              animate={{ 
                                y: [0, -2, 0],
                                rotate: side === 1 ? [0, 2, 0] : [0, -2, 0]
                              }}
                              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            >
                              {/* Main Shoulder Shell (Primary Color) */}
                              <motion.path
                                d={side === 1
                                  ? "M 90 130 C 110 110 140 110 150 140 L 130 160 C 110 150 90 150 90 130 Z"
                                  : "M 110 130 C 90 110 60 110 50 140 L 70 160 C 90 150 110 150 110 130 Z"}
                                fill={profile.cloak_color || "#333"}
                                stroke={profile.cloak_color_tertiary || "#fff"}
                                strokeWidth="2"
                                strokeLinejoin="round"
                                style={{ filter: "drop-shadow(0 0 5px rgba(0,0,0,0.5))" }}
                              />
                              
                              {/* Energy Slits (Secondary Color) */}
                              {[...Array(3)].map((_, i) => (
                                <motion.path
                                  key={`shoulder-slit-${i}`}
                                  d={side === 1 
                                    ? `M ${105 + i*10} ${125 + i*5} L ${115 + i*10} ${115 + i*5}`
                                    : `M ${95 - i*10} ${125 + i*5} L ${85 - i*10} ${115 + i*5}`}
                                  stroke={profile.cloak_color_secondary || "#00f3ff"}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  animate={{ opacity: [0.3, 1, 0.3] }}
                                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.5 }}
                                />
                              ))}

                              {/* Decorative Rivets (Tertiary Color) */}
                              {[...Array(2)].map((_, i) => (
                                <circle 
                                  key={`shoulder-rivet-${i}`}
                                  cx={side === 1 ? 100 + i*30 : 100 - i*30}
                                  cy={145 - i*10}
                                  r="1.5"
                                  fill={profile.cloak_color_tertiary || "#fff"}
                                />
                              ))}
                            </motion.g>

                            {/* LINEAR SMOKE FILAMENTS - Sophisticated Flow */}
                            {[...Array(6)].map((_, i) => (
                              <motion.path
                                key={`cyber-smoke-filament-${i}`}
                                d={side === 1
                                  ? `M ${140 + i*15} ${120 + i*5} C ${160 + i*20} 150 ${220 + i*20} 200 ${250 + i*40} 350`
                                  : `M ${60 - i*15} ${120 + i*5} C ${40 - i*20} 150 ${-20 - i*20} 200 ${-50 - i*40} 350`}
                                stroke={profile.cloak_color_secondary || "#00f3ff"}
                                strokeWidth="0.8"
                                strokeLinecap="round"
                                fill="none"
                                strokeOpacity="0.4"
                                animate={{ 
                                  pathLength: [0, 1, 0.5, 1, 0],
                                  pathOffset: [0, 0.5, 1],
                                  opacity: [0, 0.6, 0]
                                }}
                                transition={{ duration: 10, repeat: Infinity, delay: i * 0.3 }}
                              />
                            ))}

                            {/* PARTICLE DISCHARGE - Tertiary Color */}
                            {[...Array(5)].map((_, i) => (
                              <motion.line
                                key={`cyber-filament-${i}`}
                                x1={side === 1 ? 140 + i*15 : 60 - i*15}
                                y1={120 + i*5}
                                x2={side === 1 ? 320 : -120}
                                y2={-50 - i*30}
                                stroke={profile.cloak_color_tertiary || "#fff"}
                                strokeWidth="0.5"
                                strokeDasharray="1,15"
                                strokeLinecap="round"
                                animate={{ 
                                  pathLength: [0, 1, 0],
                                  opacity: [0, 1, 0]
                                }}
                                transition={{ duration: 4, repeat: Infinity, delay: i * 0.5 }}
                              />
                            ))}

                            {/* UNIFIED JOINT CAPS */}
                            <circle cx={side === 1 ? 140 : 60} cy="120" r="4" fill={profile.cloak_color_tertiary || "#fff"} />
                            <circle cx={side === 1 ? 180 : 20} cy="140" r="6" fill={profile.cloak_color || "#fff"} stroke={profile.cloak_color_secondary || "#00f3ff"} strokeWidth="1.5" />
                          </motion.g>
                        ))}
                      </g>
                    ) : profile.cloak_type === 'spectral_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {/* TECH CORE - Energy Reactor */}
                        <motion.g
                          animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          <circle cx="100" cy="140" r="15" fill={profile.cloak_color_secondary || "#00f3ff"} fillOpacity="0.1" />
                          <circle cx="100" cy="140" r="3" fill={profile.cloak_color_tertiary || "#fff"} />
                        </motion.g>

                        {[1, -1].map((side) => (
                          <motion.g
                            key={`spectral-wing-${side}`}
                            animate={{ rotate: side === 1 ? [-5, -8, -5] : [5, 8, 5] }}
                            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: "100px 140px" }}
                          >
                            {/* RADIANT SMOKE - Secondary Color (Sophisticated Flow) */}
                            {[...Array(8)].map((_, i) => (
                              <motion.path
                                key={`spectral-smoke-${i}`}
                                d={side === 1
                                  ? `M 140 120 C ${160 + i*10} ${100 - i*5} ${200 + i*15} ${150 + i*20} ${180 + i*30} ${280 + i*10}`
                                  : `M 60 120 C ${40 - i*10} ${100 - i*5} ${0 - i*15} ${150 + i*20} ${20 - i*30} ${280 + i*10}`}
                                stroke={profile.cloak_color_secondary || "#00f3ff"}
                                strokeWidth={10 + i * 4}
                                fill="none"
                                strokeLinecap="round"
                                style={{ filter: "blur(35px)", mixBlendMode: "screen", opacity: 0.04 }}
                                animate={{ 
                                  d: side === 1
                                    ? [
                                        `M 140 120 C ${160 + i*10} ${100 - i*5} ${200 + i*15} ${150 + i*20} ${180 + i*30} ${280 + i*10}`,
                                        `M 140 120 C ${170 + i*10} ${90 - i*5} ${210 + i*15} ${160 + i*20} ${190 + i*30} ${300 + i*10}`,
                                        `M 140 120 C ${160 + i*10} ${100 - i*5} ${200 + i*15} ${150 + i*20} ${180 + i*30} ${280 + i*10}`
                                      ]
                                    : [
                                        `M 60 120 C ${40 - i*10} ${100 - i*5} ${0 - i*15} ${150 + i*20} ${20 - i*30} ${280 + i*10}`,
                                        `M 60 120 C ${30 - i*10} ${90 - i*5} ${-10 - i*15} ${160 + i*20} ${10 - i*30} ${300 + i*10}`,
                                        `M 60 120 C ${40 - i*10} ${100 - i*5} ${0 - i*15} ${150 + i*20} ${20 - i*30} ${280 + i*10}`
                                      ],
                                  opacity: [0.03, 0.06, 0.03]
                                }}
                                transition={{ duration: 15, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
                              />
                            ))}

                            {/* MECHANICAL ARM - SPINDLY/THIN Structure (2px vs 8px) */}
                            <motion.path
                              d={side === 1 
                                ? "M 100 140 L 140 120 L 180 140 L 220 100"
                                : "M 100 140 L 60 120 L 20 140 L -20 100"}
                              stroke={profile.cloak_color || "#fff"}
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              animate={{ strokeWidth: [2, 2.5, 2] }}
                              transition={{ duration: 0.5, repeat: Infinity }}
                            />

                            {/* TECH SHOULDER PAULDRONS */}
                            <motion.g
                              animate={{ 
                                y: [0, -1, 0],
                                rotate: side === 1 ? [0, 1, 0] : [0, -1, 0]
                              }}
                              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            >
                              <motion.path
                                d={side === 1
                                  ? "M 95 135 C 105 120 130 120 140 140 L 125 155 C 110 145 95 145 95 135 Z"
                                  : "M 105 135 C 95 120 70 120 60 140 L 75 155 C 90 145 105 145 105 135 Z"}
                                fill={profile.cloak_color || "#333"}
                                stroke={profile.cloak_color_tertiary || "#fff"}
                                strokeWidth="1"
                                strokeLinejoin="round"
                              />
                            </motion.g>

                            {/* THIN SMOKE FILAMENTS */}
                            {[...Array(6)].map((_, i) => (
                              <motion.path
                                key={`spectral-smoke-filament-${i}`}
                                d={side === 1
                                  ? `M ${140 + i*15} ${120 + i*5} C ${160 + i*20} 150 ${220 + i*20} 200 ${250 + i*40} 350`
                                  : `M ${60 - i*15} ${120 + i*5} C ${40 - i*20} 150 ${-20 - i*20} 200 ${-50 - i*40} 350`}
                                stroke={profile.cloak_color_secondary || "#00f3ff"}
                                strokeWidth="0.5"
                                strokeLinecap="round"
                                fill="none"
                                strokeOpacity="0.3"
                                animate={{ 
                                  pathLength: [0, 1, 0],
                                  opacity: [0, 0.5, 0]
                                }}
                                transition={{ duration: 10, repeat: Infinity, delay: i * 0.3 }}
                              />
                            ))}

                            {/* SPINDLY JOINT CAPS */}
                            <circle cx={side === 1 ? 140 : 60} cy="120" r="2.5" fill={profile.cloak_color_tertiary || "#fff"} />
                            <circle cx={side === 1 ? 180 : 20} cy="140" r="3" fill={profile.cloak_color || "#fff"} stroke={profile.cloak_color_secondary || "#00f3ff"} strokeWidth="0.8" />
                          </motion.g>
                        ))}
                      </g>
                    ) : profile.cloak_type === 'divine_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {/* TECH CORE */}
                        <motion.g
                          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 4, repeat: Infinity }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          <circle cx="100" cy="140" r="10" fill={profile.cloak_color_secondary || "#00f3ff"} fillOpacity="0.2" />
                        </motion.g>

                        {[1, -1].map((side) => (
                          <motion.g
                            key={`divine-wing-${side}`}
                            animate={{ rotate: side === 1 ? [-2, -5, -2] : [2, 5, 2] }}
                            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: "100px 140px" }}
                          >
                            {/* RADIAL FEATHER HALO - Circular Background Arrangement */}
                            {[...Array(10)].map((_, i) => {
                              const angle = (i / 9) * Math.PI - (Math.PI / 2);
                              const r = 55;
                              const x = 100 + Math.cos(angle) * r;
                              const y = 140 + Math.sin(angle) * r;
                              const sideX = side === 1 ? x : 100 - (x-100);
                              return (
                                <motion.path
                                  key={`divine-halo-${i}`}
                                  d={`M ${sideX} ${y} Q ${sideX + side*25} ${y - 15} ${sideX + side*50} ${y + 25}`}
                                  stroke={profile.cloak_color || "#fff"}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  fill={profile.cloak_color || "#fff"}
                                  fillOpacity="0.03"
                                  animate={{ 
                                    rotate: side === 1 ? [0, 5, 0] : [0, -5, 0],
                                    scale: [0.95, 1.05, 0.95]
                                  }}
                                  transition={{ duration: 12, repeat: Infinity, delay: i * 0.4 }}
                                  style={{ filter: "blur(8px)", opacity: 0.2 }}
                                />
                              );
                            })}

                            {/* DESCENDING FEATHERS - Drifting Downwards */}
                            {[...Array(10)].map((_, i) => {
                              const x = 120 + i*15;
                              const sideX = side === 1 ? x : 100 - (x-100);
                              return (
                                <motion.path
                                  key={`descending-feather-${i}`}
                                  d={`M ${sideX} 180 Q ${sideX + side*10} 220 ${sideX} 280`}
                                  stroke={profile.cloak_color_secondary || "#00f3ff"}
                                  strokeWidth="1"
                                  strokeLinecap="round"
                                  fill="none"
                                  strokeOpacity="0.4"
                                  animate={{ 
                                    y: [0, 40, 0],
                                    x: side === 1 ? [0, 10, 0] : [0, -10, 0],
                                    opacity: [0, 0.5, 0]
                                  }}
                                  transition={{ 
                                    duration: 5 + i*0.5, 
                                    repeat: Infinity, 
                                    delay: i * 0.4,
                                    ease: "easeInOut"
                                  }}
                                />
                              );
                            })}

                            {/* SOFT PLUMAGE OVERLAY - "Real" Feather Texture */}
                            <motion.g style={{ mixBlendMode: "screen" }}>
                              {[...Array(12)].map((_, i) => (
                                <motion.path
                                  key={`soft-plume-${i}`}
                                  d={side === 1
                                    ? `M 120 130 C ${140 + i*10} ${110 - i*5} ${220 + i*10} 140 ${200 + i*20} 200`
                                    : `M 80 130 C ${60 - i*10} ${110 - i*5} ${-20 - i*10} 140 ${0 - i*20} 200`}
                                  fill={profile.cloak_color || "#fff"}
                                  fillOpacity="0.08"
                                  style={{ filter: "blur(15px)" }}
                                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                                  transition={{ duration: 8, repeat: Infinity, delay: i * 0.5 }}
                                />
                              ))}
                              {/* MICRO-FILAMENTS (Texture) */}
                              {[...Array(30)].map((_, i) => (
                                <motion.path
                                  key={`micro-filament-${i}`}
                                  d={side === 1
                                    ? `M ${140 + i*4} ${130 + (i%5)*5} L ${150 + i*4} ${140 + (i%5)*5}`
                                    : `M ${60 - i*4} ${130 + (i%5)*5} L ${50 - i*4} ${140 + (i%5)*5}`}
                                  stroke={profile.cloak_color || "#fff"}
                                  strokeWidth="0.2"
                                  strokeOpacity="0.15"
                                  animate={{ x: [0, 2, 0], y: [0, 1, 0] }}
                                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.1 }}
                                />
                              ))}
                            </motion.g>

                            {/* BIG SUPER FEATHER - Central Body (Rounded Tips) */}
                            <motion.g>
                              {/* Central Spine */}
                              <motion.path
                                d={side === 1
                                  ? "M 100 140 C 140 120 180 120 250 140"
                                  : "M 100 140 C 60 120 20 120 -50 140"}
                                stroke={profile.cloak_color_secondary || "#00f3ff"}
                                strokeWidth="4"
                                strokeLinecap="round"
                                fill="none"
                              />
                              {/* Internal Ribs */}
                              {[...Array(6)].map((_, i) => (
                                <motion.path
                                  key={`feather-rib-${i}`}
                                  d={side === 1
                                    ? `M ${120 + i*20} 130 Q ${130 + i*20} 150 ${140 + i*20} 170`
                                    : `M ${80 - i*20} 130 Q ${70 - i*20} 150 ${60 - i*20} 170`}
                                  stroke={profile.cloak_color || "#fff"}
                                  strokeWidth="0.5"
                                  strokeOpacity="0.3"
                                />
                              ))}
                              {/* Main Vein/Blade (Bulbous Super Feather) */}
                              <motion.path
                                d={side === 1
                                  ? "M 100 140 C 120 100 220 100 260 140 C 230 190 140 190 100 140 Z"
                                  : "M 100 140 C 80 100 -20 100 -60 140 C -30 190 60 190 100 140 Z"}
                                fill={profile.cloak_color || "#fff"}
                                fillOpacity="0.25"
                                stroke={profile.cloak_color || "#fff"}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                animate={{ opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 4, repeat: Infinity }}
                              />
                            </motion.g>

                            {/* REPETITIVE CONTOUR FEATHERS - Perfect Circular Arc */}
                            {[...Array(24)].map((_, i) => {
                              const angle = (i / 15) * Math.PI - (Math.PI / 2);
                              const r = 90;
                              const x = 100 + Math.cos(angle) * r;
                              const y = 140 + Math.sin(angle) * r;
                              const sideX = side === 1 ? x : 100 - (x-100);
                              
                              return (
                                <motion.path
                                  key={`divine-contour-${i}`}
                                  d={`M ${sideX} ${y} Q ${sideX + side*12} ${y - 18} ${sideX + side*30} ${y + 12}`}
                                  stroke={profile.cloak_color || "#fff"}
                                  strokeWidth="1.5"
                                  strokeLinecap="round"
                                  fill={profile.cloak_color || "#fff"}
                                  fillOpacity="0.1"
                                  strokeOpacity="0.4"
                                  animate={{ 
                                    rotate: side === 1 ? [-5, 12, -5] : [5, -12, 5],
                                    scale: [1, 1.15, 1]
                                  }}
                                  transition={{ duration: 6, repeat: Infinity, delay: i * 0.2 }}
                                />
                              );
                            })}

                            {/* HIGHLIGHT FEATHER TIPS - Tertiary Color */}
                            {[...Array(12)].map((_, i) => {
                              const angle = (i / 6) * Math.PI - (Math.PI / 2);
                              const x = 180 + Math.cos(angle) * 80;
                              const y = 140 + Math.sin(angle) * 70;
                              const sideX = side === 1 ? x : 100 - (x-100);
                              return (
                                <motion.circle
                                  key={`divine-tip-${i}`}
                                  cx={sideX}
                                  cy={y}
                                  r="1"
                                  fill={profile.cloak_color_tertiary || "#fff"}
                                  animate={{ scale: [0.5, 2, 0.5], opacity: [0.2, 1, 0.2] }}
                                  transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                                />
                              );
                            })}

                            {/* TECH SHOULDER PAULDRONS */}
                            <motion.g style={{ transformOrigin: "100px 140px" }}>
                              <motion.path
                                d={side === 1
                                  ? "M 95 135 C 105 120 130 120 140 140 L 125 155 C 110 145 95 145 95 135 Z"
                                  : "M 105 135 C 95 120 70 120 60 140 L 75 155 C 90 145 105 145 105 135 Z"}
                                fill={profile.cloak_color || "#333"}
                                stroke={profile.cloak_color_tertiary || "#fff"}
                                strokeWidth="1"
                                strokeLinejoin="round"
                              />
                            </motion.g>
                          </motion.g>
                        ))}
                      </g>
                    ) : profile.cloak_type === 'emblem_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {/* BASE GLOW AURA - Voluminous Fill */}
                        <motion.path
                          d="M 100 140 M 100 140 C 140 80 240 80 280 140 C 240 220 160 260 100 140 C 40 260 -40 220 -80 140 C -40 80 60 80 100 140"
                          fill={profile.cloak_color || "#fff"}
                          fillOpacity="0.05"
                          style={{ filter: "blur(30px)" }}
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 6, repeat: Infinity }}
                        />

                        {/* THE UNIFIED CORE - Ritualistic Center */}
                        <motion.g
                          animate={{ rotate: 360 }}
                          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          <circle cx="100" cy="140" r="18" fill="none" stroke={profile.cloak_color_secondary || "#00f3ff"} strokeWidth="0.5" strokeDasharray="4,4" strokeOpacity="0.4" />
                          <circle cx="100" cy="140" r="12" fill="none" stroke={profile.cloak_color_tertiary || "#fff"} strokeWidth="1" strokeDasharray="2,2" />
                        </motion.g>

                        {[1, -1].map((side) => (
                          <motion.g
                            key={`emblem-wing-${side}`}
                            animate={{ rotate: side === 1 ? [-1, -3, -1] : [1, 3, 1] }}
                            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: "100px 140px" }}
                          >
                            {/* FLUID ENERGY RIBBONS - Wavy Fluidity */}
                            {[...Array(6)].map((_, i) => (
                              <motion.path
                                key={`emblem-ribbon-${i}`}
                                d={side === 1 
                                  ? `M 100 140 Q ${160 + i*15} ${100 - i*10} ${280 + i*10} 140 T 100 140`
                                  : `M 100 140 Q ${40 - i*15} ${100 - i*10} ${-80 - i*10} 140 T 100 140`}
                                stroke={profile.cloak_color_tertiary || "#fff"}
                                strokeWidth="0.5"
                                fill="none"
                                strokeOpacity="0.2"
                                animate={{ 
                                  pathOffset: [0, 1],
                                  opacity: [0.1, 0.4, 0.1]
                                }}
                                transition={{ duration: 10 + i, repeat: Infinity, ease: "linear" }}
                              />
                            ))}

                            {/* SOFT PLUMAGE OVERLAY - Extreme Softness */}
                            {[...Array(15)].map((_, i) => (
                              <motion.path
                                key={`soft-plume-emblem-${i}`}
                                d={side === 1
                                  ? `M 110 140 C ${150 + i*10} ${110 - i*5} ${240 + i*5} 150 ${220 + i*15} 220`
                                  : `M 90 140 C ${50 - i*10} ${110 - i*5} ${-40 - i*5} 150 ${-20 - i*15} 220`}
                                fill={profile.cloak_color || "#fff"}
                                fillOpacity="0.06"
                                style={{ filter: "blur(12px)" }}
                                animate={{ opacity: [0.2, 0.5, 0.2] }}
                                transition={{ duration: 7, repeat: Infinity, delay: i * 0.4 }}
                              />
                            ))}

                            {/* ENERGY CONDUITS - Rooting to Center */}
                            {[...Array(12)].map((_, i) => (
                              <motion.path
                                key={`emblem-conduit-${i}`}
                                d={side === 1 
                                  ? `M 100 140 Q ${120 + i*8} ${120 - i*4} ${160 + i*18} ${140 + i*8}`
                                  : `M 100 140 Q ${80 - i*8} ${120 - i*4} ${40 - i*18} ${140 + i*8}`}
                                stroke={profile.cloak_color_secondary || "#00f3ff"}
                                strokeWidth="0.4"
                                fill="none"
                                strokeOpacity="0.4"
                                animate={{ opacity: [0.1, 0.6, 0.1] }}
                                transition={{ duration: 4, repeat: Infinity, delay: i * 0.3 }}
                              />
                            ))}

                            {/* BIG SUPER FEATHER */}
                            <motion.g>
                              <motion.path
                                d={side === 1
                                  ? "M 100 140 C 130 90 240 90 280 140 C 250 210 160 210 100 140"
                                  : "M 100 140 C 70 90 -40 90 -80 140 C -50 210 40 210 100 140"}
                                fill={profile.cloak_color || "#fff"}
                                fillOpacity="0.15"
                                stroke={profile.cloak_color || "#fff"}
                                strokeWidth="1.5"
                                strokeLinecap="round"
                              />
                              {/* Internal Ribs */}
                              {[...Array(8)].map((_, i) => (
                                <motion.path
                                  key={`emblem-rib-${i}`}
                                  d={side === 1
                                    ? `M ${120 + i*20} 125 Q ${135 + i*20} 150 ${145 + i*20} 180`
                                    : `M ${80 - i*20} 125 Q ${65 - i*20} 150 ${55 - i*20} 180`}
                                  stroke={profile.cloak_color || "#fff"}
                                  strokeWidth="0.3"
                                  strokeOpacity="0.2"
                                />
                              ))}
                            </motion.g>

                            {/* RADIAL FEATHER HALO */}
                            {[...Array(14)].map((_, i) => {
                              const angle = (i / 13) * Math.PI - (Math.PI / 2);
                              const r = 100;
                              const x = 100 + Math.cos(angle) * r;
                              const y = 140 + Math.sin(angle) * r;
                              const sideX = side === 1 ? x : 100 - (x-100);
                              return (
                                <motion.g key={`emblem-halo-${i}`}>
                                  <motion.line 
                                    x1="100" y1="140" x2={sideX} y2={y} 
                                    stroke={profile.cloak_color || "#fff"} 
                                    strokeWidth="0.1" 
                                    strokeOpacity="0.1" 
                                  />
                                  <motion.path
                                    d={`M ${sideX} ${y} Q ${sideX + side*25} ${y - 20} ${sideX + side*50} ${y + 20}`}
                                    stroke={profile.cloak_color || "#fff"}
                                    strokeWidth="1.2"
                                    strokeLinecap="round"
                                    fill={profile.cloak_color || "#fff"}
                                    fillOpacity="0.08"
                                    animate={{ rotate: side === 1 ? [-2, 8, -2] : [2, -8, 2], scale: [1, 1.1, 1] }}
                                    transition={{ duration: 9, repeat: Infinity, delay: i * 0.3 }}
                                  />
                                </motion.g>
                              );
                            })}

                            {/* RITUALISTIC RIVETS */}
                            <circle cx="100" cy="140" r="5" fill={profile.cloak_color_tertiary || "#fff"} style={{ filter: "blur(2px)" }} />
                            <circle cx="100" cy="140" r="2" fill="#fff" />
                          </motion.g>
                        ))}
                      </g>
                    ) : profile.cloak_type === 'fallen_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {[1, -1].map((side) => (
                          <motion.g
                            key={`fallen-wing-${side}`}
                            animate={{ 
                              rotate: side === 1 ? [-2, 3, -2] : [2, -3, 2],
                              y: [0, 5, 0]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                            style={{ transformOrigin: "100px 160px" }}
                          >
                            {/* DENSE ROUNDED PLUMAGE LAYERS (Duplicated for Density) */}
                            {[0, 1].map((layer) => (
                              <g key={`layer-${layer}`} opacity={layer === 0 ? 0.9 : 0.5} style={{ transform: `translate(${layer*side*5}px, ${layer*8}px)` }}>
                                {/* ROUNDED BASE FILL */}
                                {[...Array(24)].map((_, i) => (
                                  <motion.path
                                    key={`fallen-base-${layer}-${i}`}
                                    d={side === 1
                                      ? `M 100 160 Q ${115 + i*3} 185 ${130 + i*4} 210`
                                      : `M 100 160 Q ${85 - i*3} 185 ${70 - i*4} 210`}
                                    stroke={profile.cloak_color || "#333"}
                                    strokeWidth="3"
                                    strokeLinecap="round"
                                    strokeOpacity="0.4"
                                  />
                                ))}

                                {/* MID-PLUMES - Rounded tips */}
                                {[...Array(18)].map((_, i) => (
                                  <motion.g key={`fallen-mid-g-${layer}-${i}`}>
                                    <motion.path
                                      d={side === 1
                                        ? `M 110 165 C ${140 + i*5} 150 ${190 + i*10} 180 ${180 + i*12} 210`
                                        : `M 90 165 C ${60 - i*5} 150 ${10 - i*10} 180 ${20 - i*12} 210`}
                                      stroke={profile.cloak_color || "#333"}
                                      strokeWidth="4"
                                      strokeLinecap="round"
                                      strokeOpacity="0.7"
                                      fill={profile.cloak_color || "#333"}
                                      fillOpacity="0.05"
                                    />
                                    <motion.path
                                      d={side === 1
                                        ? `M 115 165 C ${140 + i*5} 155 ${185 + i*10} 185 ${175 + i*12} 205`
                                        : `M 85 165 C ${60 - i*5} 155 ${15 - i*10} 185 ${25 - i*12} 205`}
                                      stroke={profile.cloak_color_secondary || "#888"}
                                      strokeWidth="1"
                                      strokeOpacity="0.3"
                                      strokeLinecap="round"
                                    />
                                  </motion.g>
                                ))}

                                {/* UPPER PRIMARIES - Rounded sweeps */}
                                {[...Array(12)].map((_, i) => (
                                  <motion.g key={`fallen-upper-g-${layer}-${i}`}>
                                    <motion.path
                                      d={side === 1
                                        ? `M 100 155 C ${150 + i*5} 110 ${250 + i*10} 40 ${260} ${100 - i*15}`
                                        : `M 100 155 C ${50 - i*5} 110 ${-50 - i*10} 40 ${-60} ${100 - i*15}`}
                                      stroke={profile.cloak_color || "#333"}
                                      strokeWidth={5 - i*0.2}
                                      strokeLinecap="round"
                                      strokeOpacity="0.85"
                                    />
                                    <motion.path
                                      d={side === 1
                                        ? `M 105 150 C ${150 + i*5} 105 ${245 + i*10} 45 ${255} ${105 - i*15}`
                                        : `M 95 150 C ${50 - i*5} 105 ${-45 - i*10} 45 ${-55} ${105 - i*15}`}
                                      stroke={profile.cloak_color_secondary || "#888"}
                                      strokeWidth="1.2"
                                      strokeOpacity="0.25"
                                      strokeLinecap="round"
                                    />
                                  </motion.g>
                                ))}
                              </g>
                            ))}

                            {/* SOFT ROUNDED BORDER HALO */}
                            {[...Array(30)].map((_, i) => {
                              const angle = (i / 29) * Math.PI - Math.PI / 2;
                              const r = 110;
                              const x = 100 + Math.cos(angle) * r;
                              const y = 160 + Math.sin(angle) * r;
                              const sideX = side === 1 ? x : 100 - (x-100);
                              return (
                                <motion.circle
                                  key={`fallen-round-edge-${i}`}
                                  cx={sideX}
                                  cy={y}
                                  r="2.5"
                                  fill={profile.cloak_color || "#333"}
                                  fillOpacity="0.15"
                                  style={{ filter: "blur(4px)" }}
                                />
                              );
                            })}

                            {/* TECHNICAL ANCHOR */}
                            <circle cx="100" cy="160" r="8" fill={profile.cloak_color_tertiary || "#fff"} fillOpacity="0.15" style={{ filter: "blur(2px)" }} />
                            <circle cx="100" cy="160" r="3" fill={profile.cloak_color_tertiary || "#fff"} />
                          </motion.g>
                        ))}
                      </g>
                    ) : profile.cloak_type === 'obsidian_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {[1, -1].map((side) => {
                          const anchorX = 100 + side * 35; // Open wings to border
                          const anchorY = 140;

                          return (
                            <motion.g
                              key={`obsidian-wing-${side}`}
                              animate={{ 
                                rotate: side === 1 ? [-1, 3, -1] : [1, -3, 1],
                                scale: [1, 1.01, 1] 
                              }}
                              transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
                              style={{ transformOrigin: `${anchorX}px ${anchorY}px` }}
                            >
                              {/* FUZZY INNER BASE - Furry Texture */}
                              {[...Array(25)].map((_, i) => (
                                <motion.path
                                  key={`obsidian-fuzz-${i}`}
                                  d={side === 1
                                    ? `M ${anchorX} ${anchorY} Q ${anchorX + 5 + i*0.5} ${anchorY - 10 + i} ${anchorX + 10 + i*0.2} ${anchorY + 10 + i}`
                                    : `M ${anchorX} ${anchorY} Q ${anchorX - 5 - i*0.5} ${anchorY - 10 + i} ${anchorX - 10 - i*0.2} ${anchorY + 10 + i}`}
                                  stroke={profile.cloak_color_tertiary || "#fff"}
                                  strokeWidth="1"
                                  strokeOpacity="0.2"
                                  style={{ filter: "blur(2px)" }}
                                />
                              ))}

                              {/* LEAF-SHAPED FEATHER RANKS */}
                              {[0, 1, 2, 3].map((rank) => (
                                <g key={`obsidian-rank-${rank}`}>
                                  {[...Array(12)].map((_, i) => {
                                    const angle = (i / 11) * (Math.PI / 2.5) - (Math.PI / 1.5);
                                    const r = 40 + rank * 35;
                                    const featherX = anchorX + Math.cos(angle) * r * side;
                                    const featherY = anchorY + Math.sin(angle) * r;
                                    
                                    // Staggered Delay for "Unrolling" effect
                                    const deployDelay = rank * 0.8 + i * 0.12;
                                    
                                    return (
                                      <motion.g 
                                        key={`obsidian-feather-${rank}-${i}`}
                                        initial={{ scale: 0, opacity: 0, rotate: side === 1 ? -45 : 45 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        transition={{ 
                                          duration: 1.5, 
                                          delay: deployDelay,
                                          type: "spring",
                                          stiffness: 40,
                                          damping: 10
                                        }}
                                      >
                                        {/* Feather Body (Leaf Shape) */}
                                        <motion.path
                                          d={side === 1
                                            ? `M ${anchorX} ${anchorY} C ${anchorX + 10 + rank*10} ${anchorY - 10} ${featherX - 10} ${featherY - 10} ${featherX} ${featherY} C ${featherX + 5} ${featherY + 5} ${anchorX + 20 + rank*10} ${anchorY + 20} ${anchorX} ${anchorY}`
                                            : `M ${anchorX} ${anchorY} C ${anchorX - 10 - rank*10} ${anchorY - 10} ${featherX + 10} ${featherY - 10} ${featherX} ${featherY} C ${featherX - 5} ${featherY + 5} ${anchorX - 20 - rank*10} ${anchorY + 20} ${anchorX} ${anchorY}`}
                                          fill={profile.cloak_color || "#333"}
                                          fillOpacity={0.9 - rank * 0.1}
                                          stroke={profile.cloak_color_secondary || "#888"}
                                          strokeWidth="0.5"
                                          strokeOpacity="0.3"
                                        />
                                        {/* Central Vein */}
                                        <motion.path
                                          d={`M ${anchorX} ${anchorY} L ${featherX} ${featherY}`}
                                          stroke={profile.cloak_color_secondary || "#888"}
                                          strokeWidth="0.8"
                                          strokeOpacity={0.2}
                                          initial={{ pathLength: 0 }}
                                          animate={{ pathLength: 1 }}
                                          transition={{ duration: 1, delay: deployDelay + 0.5 }}
                                        />
                                      </motion.g>
                                    );
                                  })}
                                </g>
                              ))}

                              {/* CORE GLOW */}
                              <circle cx={anchorX} cy={anchorY} r="10" fill={profile.cloak_color || "#333"} fillOpacity="0.1" style={{ filter: "blur(5px)" }} />
                            </motion.g>
                          );
                        })}
                      </g>
                    ) : profile.cloak_type === 'curved_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {[1, -1].map((side) => {
                          const anchorX = 100 + side * 30;
                          const anchorY = 140;

                          return (
                            <motion.g
                              key={`curved-wing-${side}`}
                              animate={{ 
                                rotate: side === 1 ? [-2, 4, -2] : [2, -4, 2],
                                scale: [1, 1.02, 1] 
                              }}
                              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                              style={{ transformOrigin: `${anchorX}px ${anchorY}px` }}
                            >
                              {/* LOWER PRIMARIES - Long, Vertical hanging */}
                              {[...Array(12)].map((_, i) => (
                                <motion.path
                                  key={`curved-lower-${i}`}
                                  d={side === 1
                                    ? `M ${anchorX + 10 + i*5} ${anchorY + 20} Q ${anchorX + 15 + i*8} ${anchorY + 100} ${anchorX + 10 + i*4} ${anchorY + 180}`
                                    : `M ${anchorX - 10 - i*5} ${anchorY + 20} Q ${anchorX - 15 - i*8} ${anchorY + 100} ${anchorX - 10 - i*4} ${anchorY + 180}`}
                                  stroke={profile.cloak_color || "#333"}
                                  strokeWidth="4"
                                  strokeLinecap="round"
                                  strokeOpacity={0.8}
                                  fill={profile.cloak_color || "#333"}
                                  fillOpacity="0.05"
                                />
                              ))}

                              {/* UPPER SCALED FEATHERS - Overlapping rounds */}
                              {[...Array(20)].map((_, i) => {
                                const t = i / 19;
                                const xOffset = Math.sin(t * Math.PI) * 40 * side;
                                const yOffset = -Math.cos(t * Math.PI) * 60;
                                return (
                                  <motion.path
                                    key={`curved-scale-${i}`}
                                    d={side === 1
                                      ? `M ${anchorX + xOffset} ${anchorY + yOffset} Q ${anchorX + xOffset + 15} ${anchorY + yOffset - 10} ${anchorX + xOffset + 20} ${anchorY + yOffset + 20}`
                                      : `M ${anchorX + xOffset} ${anchorY + yOffset} Q ${anchorX + xOffset - 15} ${anchorY + yOffset - 10} ${anchorX + xOffset - 20} ${anchorY + yOffset + 20}`}
                                    fill={profile.cloak_color || "#333"}
                                    stroke={profile.cloak_color_secondary || "#888"}
                                    strokeWidth="0.5"
                                    strokeOpacity="0.4"
                                  />
                                );
                              })}

                              {/* OUTER PRIMARY CURVE - The Hooked Shoulder */}
                              {[...Array(8)].map((_, i) => (
                                <motion.path
                                  key={`curved-outer-${i}`}
                                  d={side === 1
                                    ? `M ${anchorX} ${anchorY} C ${anchorX + 20} ${anchorY - 80} ${anchorX + 100} ${anchorY - 50} ${anchorX + 80 + i*10} ${anchorY + 150}`
                                    : `M ${anchorX} ${anchorY} C ${anchorX - 20} ${anchorY - 80} ${anchorX - 100} ${anchorY - 50} ${anchorX - 80 - i*10} ${anchorY + 150}`}
                                  stroke={profile.cloak_color || "#333"}
                                  strokeWidth={6 - i*0.5}
                                  strokeLinecap="round"
                                  fill="none"
                                  strokeOpacity="0.9"
                                />
                              ))}

                              {/* GLASSY HIGHLIGHTS */}
                              <motion.path
                                d={side === 1
                                  ? `M ${anchorX + 5} ${anchorY - 20} Q ${anchorX + 50} ${anchorY - 70} ${anchorX + 70} ${anchorY + 50}`
                                  : `M ${anchorX - 5} ${anchorY - 20} Q ${anchorX - 50} ${anchorY - 70} ${anchorX - 70} ${anchorY + 50}`}
                                stroke={profile.cloak_color_secondary || "#888"}
                                strokeWidth="2"
                                strokeOpacity="0.3"
                                strokeLinecap="round"
                                fill="none"
                              />

                              {/* TECHNICAL CORE */}
                              <circle cx={anchorX} cy={anchorY} r="6" fill={profile.cloak_color_tertiary || "#fff"} fillOpacity="0.2" />
                            </motion.g>
                          );
                        })}
                      </g>
                    ) : profile.cloak_type === 'ritual_necklace_wings' ? (
                      <g filter="url(#cloakGlow)">
                        {/* THE RITUAL NECKLACE - Central Protective Ring */}
                        <motion.g
                          animate={{ rotate: 360 }}
                          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          {[...Array(12)].map((_, i) => {
                            const angle = (i / 12) * Math.PI * 2;
                            const r = 38;
                            const x = 100 + Math.cos(angle) * r;
                            const y = 140 + Math.sin(angle) * r;
                            
                            const nextAngle = ((i + 1) / 12) * Math.PI * 2;
                            const nextX = 100 + Math.cos(nextAngle) * r;
                            const nextY = 140 + Math.sin(nextAngle) * r;

                            return (
                              <g key={`necklace-item-${i}`}>

                                {/* Ritual Sphere */}
                                <motion.circle
                                  cx={x}
                                  cy={y}
                                  r="2.5"
                                  fill={profile.cloak_color_secondary || "#888"}
                                  animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
                                  transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }}
                                />
                                {/* Shimmer Inner Sphere */}
                                <circle cx={x} cy={y} r="1" fill="#fff" fillOpacity="0.8" />
                              </g>
                            );
                          })}
                        </motion.g>

                        {[1, -1].map((side) => {
                          const anchorX = 100 + side * 30;
                          const anchorY = 140;

                          return (
                            <motion.g
                              key={`ritual-necklace-wing-${side}`}
                              animate={{ 
                                rotate: side === 1 ? [-2, 4, -2] : [2, -4, 2],
                                scale: [1, 1.02, 1] 
                              }}
                              transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                              style={{ transformOrigin: `${anchorX}px ${anchorY}px` }}
                            >
                              {/* CURVED WING PLUMAGE (Reused from curved_wings) */}
                                {[...Array(10)].map((_, i) => (
                                  <motion.path
                                    key={`ritual-curved-lower-${i}`}
                                    d={side === 1
                                      ? `M ${anchorX + 10 + i*5} ${anchorY + 20} C ${anchorX + 45 + i*10} ${anchorY + 60} ${anchorX - 5 - i*2} ${anchorY + 120} ${anchorX + 15 + i*6} ${anchorY + 190}`
                                      : `M ${anchorX - 10 - i*5} ${anchorY + 20} C ${anchorX - 45 - i*10} ${anchorY + 60} ${anchorX + 5 + i*2} ${anchorY + 120} ${anchorX - 15 - i*6} ${anchorY + 190}`}
                                    stroke={profile.cloak_color || "#333"}
                                    strokeWidth="3.5"
                                    strokeLinecap="round"
                                    strokeOpacity={0.8}
                                  />
                                ))}

                              {[...Array(15)].map((_, i) => {
                                const t = i / 14;
                                const xOffset = Math.sin(t * Math.PI) * 35 * side;
                                const yOffset = -Math.cos(t * Math.PI) * 55;
                                return (
                                  <motion.path
                                    key={`ritual-curved-scale-${i}`}
                                    d={side === 1
                                      ? `M ${anchorX + xOffset} ${anchorY + yOffset} Q ${anchorX + xOffset + 12} ${anchorY + yOffset - 8} ${anchorX + xOffset + 18} ${anchorY + yOffset + 18}`
                                      : `M ${anchorX + xOffset} ${anchorY + yOffset} Q ${anchorX + xOffset - 12} ${anchorY + yOffset - 8} ${anchorX + xOffset - 18} ${anchorY + yOffset + 18}`}
                                    fill={profile.cloak_color || "#333"}
                                    stroke={profile.cloak_color_secondary || "#888"}
                                    strokeWidth="0.4"
                                    strokeOpacity="0.3"
                                  />
                                );
                              })}

                                {[...Array(6)].map((_, i) => (
                                  <motion.path
                                    key={`ritual-curved-outer-${i}`}
                                    d={side === 1
                                      ? `M ${anchorX} ${anchorY} C ${anchorX + 50} ${anchorY - 80} ${anchorX + 110} ${anchorY - 40} ${anchorX + 80 + i*10} ${anchorY + 150} S ${anchorX + 120 + i*5} ${anchorY + 200} ${anchorX + 90 + i*8} ${anchorY + 260}`
                                      : `M ${anchorX} ${anchorY} C ${anchorX - 50} ${anchorY - 80} ${anchorX - 110} ${anchorY - 40} ${anchorX - 80 - i*10} ${anchorY + 150} S ${anchorX - 120 - i*5} ${anchorY + 200} ${anchorX - 90 - i*8} ${anchorY + 260}`}
                                    stroke={profile.cloak_color || "#333"}
                                    strokeWidth={5 - i*0.4}
                                    strokeLinecap="round"
                                    fill="none"
                                    strokeOpacity="0.9"
                                  />
                                ))}

                              {/* SECONDARY HIGHLIGHTS */}
                              <motion.path
                                d={side === 1
                                  ? `M ${anchorX + 5} ${anchorY - 15} Q ${anchorX + 40} ${anchorY - 60} ${anchorX + 60} ${anchorY + 40}`
                                  : `M ${anchorX - 5} ${anchorY - 15} Q ${anchorX - 40} ${anchorY - 60} ${anchorX - 60} ${anchorY + 40}`}
                                stroke={profile.cloak_color_secondary || "#888"}
                                strokeWidth="1.5"
                                strokeOpacity="0.25"
                                strokeLinecap="round"
                                fill="none"
                              />


                            </motion.g>
                          );
                        })}
                      </g>
                    ) : profile.cloak_type === 'angel_wings' ? (
                      <>
                        <g filter="url(#cloakGlow)">
                        {/* SACRED GEOMETRY HALO - Symbolic Expression & Precision */}
                        <motion.g
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ 
                            opacity: [0, 0.12, 0.12, 0, 0],
                            scale: [0.8, 1.1, 1.1, 0.8, 0.8],
                            rotate: 360 
                          }}
                          transition={{ 
                            duration: 30, 
                            times: [0, 0.1, 0.4, 0.5, 1], 
                            repeat: Infinity, 
                            ease: "linear" 
                          }}
                          style={{ transformOrigin: "100px 140px" }}
                        >
                          {[0, 60, 120, 180, 240, 300].map(deg => (
                            <g key={`sacred-geo-${deg}`} transform={`rotate(${deg}, 100, 140)`}>
                              <circle cx="100" cy="140" r="100" fill="none" stroke="currentColor" strokeWidth="0.2" strokeOpacity="0.15" strokeDasharray="4,12" />
                              <circle cx="100" cy="140" r="140" fill="none" stroke="currentColor" strokeWidth="0.1" strokeOpacity="0.1" strokeDasharray="2,6" />
                              <path d="M 100 0 L 200 140 L 100 280 L 0 140 Z" fill="none" stroke="currentColor" strokeWidth="0.1" strokeOpacity="0.1" />
                            </g>
                          ))}
                        </motion.g>
                        
                        {/* Energy Sync Glitch - Every 7s after opening, 1s blackout + flicker return */}
                        <motion.g
                          animate={{ 
                            opacity: [1, 1, 0, 0, 1, 0, 1, 0.6, 1] 
                          }}
                          transition={{ 
                            duration: 8.5, 
                            times: [0, 0.82, 0.83, 0.94, 0.95, 0.96, 0.97, 0.98, 1], 
                            repeat: Infinity,
                            delay: 8 
                          }}
                        >
                          <motion.g
                            key="wing-layer-center"
                            initial={{ opacity: 0, scale: 0.9, scaleX: 0 }}
                            animate={{ 
                              opacity: 1, 
                              scale: 1,
                              scaleX: 1,
                              y: [0, 2, -2, 0],
                              x: [0, 2, -2, 0]
                            }}
                            transition={{
                              opacity: { duration: 6, ease: "easeInOut" },
                              scaleX: { duration: 8, ease: "easeOut" },
                              y: { duration: 25, repeat: Infinity, ease: "easeInOut" },
                              x: { duration: 30, repeat: Infinity, ease: "easeInOut" },
                              delay: 0.1
                            }}
                            style={{ transformOrigin: "100px 140px" }}
                          >
                          {[1, -1].map((side) => (
                            <motion.g
                              key={`wing-${side}`}
                              filter="url(#featherShadow)"
                              animate={{ 
                                rotate: side === 1 ? [-10, -14, -10] : [10, 14, 10]
                              }}
                              transition={{
                                duration: 25,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: 0.5
                              }}
                              style={{ transformOrigin: "100px 140px" }}
                            >
                            {/* ROBUST BASE - 'The Motor' - Scaly layered feathers */}
                            <g>
                              {[...Array(12)].map((_, i) => {
                                const row = Math.floor(i / 4);
                                const col = i % 4;
                                const baseX = 100 + (side * (col * 3));
                                const baseY = 140 + (row * 4);
                                return (
                                  <motion.path
                                    key={`base-scale-${i}`}
                                    d={`M ${baseX} ${baseY} Q ${baseX - side*5} ${baseY - 5} ${baseX - side*10} ${baseY} Z`}
                                    fill="url(#angelWingGrad)"
                                    fillOpacity="1.0"
                                    stroke="currentColor"
                                    strokeWidth="1.2"
                                    animate={{ 
                                      scale: [1, 0.92, 1.15, 1, 1], // Pronounced 'Internal Breathing' Prep
                                      rotate: [0, side * -2, side * 8, side * 2, 0],
                                      strokeOpacity: [0.3, 0.6, 1, 0.3, 0.3]
                                    }}
                                    transition={{ 
                                      duration: 25, 
                                      times: [0, 0.08, 0.18, 0.45, 1], 
                                      delay: i * 0.05, 
                                      repeat: Infinity,
                                      ease: "easeInOut"
                                    }}
                                  />
                                );
                              })}
                            </g>

                            {/* SUPERNATURAL EMANATION - Subtle halo escaping between layers */}
                            {[...Array(5)].map((_, i) => (
                              <motion.path
                                key={`emanation-${i}`}
                                d={side === 1 
                                  ? `M 100 140 C ${118 + i*8} ${125 - i*4} ${162 + i*12} ${88 - i*16} ${188 + i*4} ${38 - i*8}`
                                  : `M 100 140 C ${82 - i*8} ${125 - i*4} ${38 - i*12} ${88 - i*16} ${12 - i*4} ${38 - i*8}`}
                                fill="none"
                                stroke="url(#supernaturalEmanationGrad)"
                                strokeWidth={20 + i * 8}
                                strokeLinecap="round"
                                style={{ filter: "blur(25px)", mixBlendMode: "multiply" }}
                                animate={{
                                  opacity: [0, 0.4, 0.5, 0.2, 0],
                                  scale: [0.98, 1.05, 1],
                                  rotate: [0, side * 2, 0]
                                }}
                                transition={{
                                  duration: 14,
                                  repeat: Infinity,
                                  times: [0, 0.1, 0.4, 0.5, 1],
                                  ease: "easeInOut",
                                  delay: i * 0.15
                                }}
                              />
                            ))}

                            {/* ETHEREAL LIGHT TRAIL - The 'Ghosting' light echo trailing physical movement */}
                            {[...Array(10)].map((_, i) => (
                              <motion.path
                                key={`light-trail-${i}`}
                                d={side === 1 
                                  ? `M 100 140 C 110 150 118 185 122 225 L 112 245 Q 102 250 100 240` 
                                  : `M 100 140 C 90 150 82 185 78 225 L 88 245 Q 98 250 100 240`}
                                fill="none"
                                stroke="url(#supernaturalEmanationGrad)"
                                strokeWidth={15 - i}
                                strokeLinecap="round"
                                style={{ filter: "blur(20px)", mixBlendMode: "multiply", pointerEvents: "none" }}
                                animate={{
                                  d: side === 1 
                                    ? [
                                        `M 100 140 C 110 150 118 185 122 225 L 112 245 Q 102 250 100 240`, 
                                        `M 100 140 C ${107 + i*2} ${132 - i*3} ${130 + i*4} ${105 - i*8} ${142 + i*2} ${65 - i*4}`,
                                        `M 100 140 C ${109 + i*2} ${131 - i*2} ${132 + i*4} ${104 - i*8} ${144 + (i%3)*2} ${64 - i*4}`,
                                        `M 100 140 C 108 152 118 182 123 222 L 113 242 Q 103 247 100 240`,
                                        `M 100 140 C 110 150 118 185 122 225 L 112 245 Q 102 250 100 240`
                                      ]
                                    : [
                                        `M 100 140 C 90 150 82 185 78 225 L 88 245 Q 98 250 100 240`, 
                                        `M 100 140 C ${93 - i*2} ${132 - i*3} ${70 - i*4} ${105 - i*8} ${58 - i*2} ${65 - i*4}`,
                                        `M 100 140 C ${91 - i*2} ${131 - i*2} ${68 - i*4} ${104 - i*8} ${56 - (i%3)*2} ${64 - i*4}`,
                                        `M 100 140 C 92 152 82 182 77 222 L 87 242 Q 97 247 100 240`,
                                        `M 100 140 C 90 150 82 185 78 225 L 88 245 Q 98 250 100 240`
                                      ],
                                  opacity: [0, 0.4, 0.3, 0.1, 0]
                                }}
                                transition={{
                                  duration: 25,
                                  repeat: Infinity,
                                  times: [0, 0.20, 0.50, 0.65, 1],
                                  ease: "easeInOut",
                                  delay: 1.0 + (i * 0.25)
                                }}
                              />
                            ))}

                            {/* SUPERIOR SHOULDER FAN - High-detail joint filling */}
                            {[...Array(15)].map((_, i) => (
                              <motion.path
                                key={`superior-joint-${i}`}
                                d={side === 1 
                                  ? `M 100 140 Q ${102 + i*1.5} ${135 - i*2} ${108 + i*2} ${120 - i*5}`
                                  : `M 100 140 Q ${98 - i*1.5} ${135 - i*2} ${92 - i*2} ${120 - i*5}`}
                                fill="url(#angelWingGrad)"
                                fillOpacity={0.96}
                                animate={{
                                  d: side === 1 
                                    ? [
                                        `M 100 140 Q ${105 + i*2} ${128 - i*4} ${122 + i*2} ${100 - i*8}`,
                                        `M 100 140 Q ${105 + i*2} ${128 - i*4} ${122 + i*2} ${100 - i*8}`,
                                        `M 100 140 Q ${106 + i*2} ${127 - i*4} ${121 + i*2} ${101 - i*8}`,
                                        `M 100 140 Q ${105 + i*2} ${128 - i*4} ${122 + i*2} ${100 - i*8}`
                                      ]
                                    : [
                                        `M 100 140 Q ${95 - i*2} ${128 - i*4} ${78 - i*2} ${100 - i*8}`,
                                        `M 100 140 Q ${95 - i*2} ${128 - i*4} ${78 - i*2} ${100 - i*8}`,
                                        `M 100 140 Q ${94 - i*2} ${127 - i*4} ${79 - i*2} ${101 - i*8}`,
                                        `M 100 140 Q ${95 - i*2} ${128 - i*4} ${78 - i*2} ${100 - i*8}`
                                      ],
                                  opacity: 0.8
                                }}
                                transition={{ duration: 14, repeat: Infinity, times: [0, 0.15, 0.55, 1], delay: i * 0.03 }}
                              />
                            ))}

                            {/* SILHOUETTE EDGE SPIKES - Small sharp feathers for boundary detail */}
                            {[...Array(15)].map((_, i) => (
                              <motion.path
                                key={`edge-spike-${i}`}
                                d={side === 1 
                                  ? `M ${110 + i*2} ${120 - i*2} L ${115 + i*2} ${115 - i*2} L ${112 + i*2} ${125 - i*2}`
                                  : `M ${90 - i*2} ${120 - i*2} L ${85 - i*2} ${115 - i*2} L ${88 - i*2} ${125 - i*2}`}
                                fill="url(#angelWingGrad)"
                                fillOpacity={0.8}
                                animate={{
                                  opacity: 0.6,
                                  scale: [0.98, 1.05, 0.98]
                                }}
                                transition={{ duration: 14, repeat: Infinity, times: [0, 0.15, 1], delay: 0.1 + i * 0.04 }}
                              />
                            ))}

                            {/* MARGINAL COVERT FEATHERS - Filling the upper edge for density */}
                            {[...Array(15)].map((_, i) => (
                              <motion.path
                                key={`marginal-feather-${i}`}
                                d={side === 1 
                                  ? `M 100 140 Q ${105 + i*2} ${130 - i*2} ${115 + i*4} ${120 - i*2}`
                                  : `M 100 140 Q ${95 - i*2} ${130 - i*2} ${85 - i*4} ${120 - i*2}`}
                                fill="url(#angelWingGrad)"
                                fillOpacity={0.9}
                                stroke="currentColor"
                                strokeWidth="0.35"
                                animate={{
                                  d: side === 1 
                                    ? [
                                        `M 100 140 Q ${105 + i*3} ${130 - i*2} ${120 + i*5} ${110 - i*3}`,
                                        `M 100 140 Q ${105 + i*3} ${130 - i*2} ${120 + i*5} ${110 - i*3}`, // Open
                                        `M 100 140 Q ${106 + i*3} ${128 - i*2} ${121 + i*5} ${111 - i*3}`, // Sway
                                        `M 100 140 Q ${105 + i*3} ${130 - i*2} ${120 + i*5} ${110 - i*3}`
                                      ]
                                    : [
                                        `M 100 140 Q ${95 - i*3} ${130 - i*2} ${80 - i*5} ${110 - i*3}`,
                                        `M 100 140 Q ${95 - i*3} ${130 - i*2} ${80 - i*5} ${110 - i*3}`, // Open
                                        `M 100 140 Q ${94 - i*3} ${128 - i*2} ${81 - i*5} ${111 - i*3}`, // Sway
                                        `M 100 140 Q ${95 - i*3} ${130 - i*2} ${80 - i*5} ${110 - i*3}`
                                      ],
                                  opacity: [0.4, 1, 0.4]
                                }}
                                transition={{ 
                                  duration: 14, 
                                  repeat: Infinity, 
                                  times: [0, 0.15, 0.55, 1], 
                                  delay: i * 0.03 
                                }}
                              />
                            ))}

                            {/* MEDIAN COVERTS - Mid-wing filling feathers */}
                            {[...Array(12)].map((_, i) => (
                              <motion.path
                                key={`median-feather-${i}`}
                                d={side === 1 
                                  ? `M 100 140 Q ${105 + i*2} ${150 + i*2} ${110 + i*3} ${180 + i*2}`
                                  : `M 100 140 Q ${95 - i*2} ${150 + i*2} ${90 - i*3} ${180 + i*2}`}
                                fill="url(#angelWingGrad)"
                                fillOpacity={1.0}
                                stroke="currentColor"
                                strokeWidth="0.35"
                                animate={{
                                  d: side === 1 
                                    ? [
                                        `M 100 140 Q ${110 + i*2} ${130 - i*2} ${135 + i*2} ${120 - i*2}`,
                                        `M 100 140 Q ${110 + i*2} ${130 - i*2} ${135 + i*2} ${120 - i*2}`, // OPEN
                                        `M 100 140 Q ${111 + i*2} ${129 - i*2} ${134 + i*2} ${121 - i*2}`, // SWAY
                                        `M 100 140 Q ${110 + i*2} ${130 - i*2} ${135 + i*2} ${120 - i*2}`
                                      ]
                                    : [
                                        `M 100 140 Q ${90 - i*2} ${130 - i*2} ${65 - i*2} ${120 - i*2}`,
                                        `M 100 140 Q ${90 - i*2} ${130 - i*2} ${65 - i*2} ${120 - i*2}`,  // OPEN
                                        `M 100 140 Q ${89 - i*2} ${129 - i*2} ${66 - i*2} ${121 - i*2}`,  // SWAY
                                        `M 100 140 Q ${90 - i*2} ${130 - i*2} ${65 - i*2} ${120 - i*2}`
                                      ],
                                  opacity: [0.6, 1, 0.6]
                                }}
                                transition={{ 
                                  duration: 14, 
                                  repeat: Infinity, 
                                  times: [0, 0.15, 0.55, 1], 
                                  delay: 0.1 + i * 0.04 
                                }}
                              />
                            ))}

                            {/* MAIN WING FAN - 'Mathematical Sequence' of overlapping primary feathers */}
                            {[...Array(12)].map((_, i) => (
                              <motion.g key={`primary-feather-group-${i}`}>
                                <motion.g
                                  animate={{ 
                                    x: [0, (i % 2 === 0 ? 0.3 : -0.3), 0],
                                    y: [0, (i % 3 === 0 ? 0.3 : -0.3), 0]
                                  }}
                                  transition={{ 
                                    duration: 1 + (i % 5) * 0.2, 
                                    repeat: Infinity, 
                                    ease: "easeInOut" 
                                  }}
                                >
                                  <motion.path
                                    key={`primary-feather-${i}`}
                                    d={side === 1 
                                      ? `M 100 140 C 110 150 118 185 122 225 L 112 245 Q 102 250 100 240` // ELEGANT WRAP RIGHT
                                      : `M 100 140 C 90 150 82 185 78 225 L 88 245 Q 98 250 100 240`}
                                    fill="url(#angelWingGrad)"
                                    fillOpacity={1.0 - (i * 0.01)}
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeWidth={1.5 - (i * 0.1)}
                                    style={{ filter: i === 0 ? "url(#diffuseEdgeGlow)" : "none" }}
                                    animate={{
                                      d: side === 1 
                                         ? [
                                             `M 100 140 C ${107.5 + i*2} ${132.5 - i*2} ${130 + i*4} ${115 - i*6} ${142.5 + i*2} ${90 - i*4}`, 
                                             `M 100 140 C ${107.5 + i*2} ${132.5 - i*2} ${130 + i*4} ${115 - i*6} ${142.5 + i*2} ${90 - i*4}`, // 0.15: OPEN
                                             `M 100 140 C ${109 + i*2} ${131 - i*2} ${131 + i*4} ${114 - i*6} ${144 + (i%3)*2} ${89 - i*4}`,   // 0.45: Ripple Sway
                                             `M 100 140 C ${108.5 + i*2} ${133 - i*2} ${130 + i*4} ${114 - i*6} ${143 + i*2} ${91 - i*4}`,    // 0.55: Persistent Open
                                             `M 100 140 C ${107 + i*2} ${134 - i*2} ${131 + i*4} ${113 - i*6} ${142 + i*2} ${92 - i*4}`,     // 0.70: High breathing
                                             `M 100 140 C ${108 + i*2} ${132 - i*2} ${130 + i*4} ${115 - i*6} ${143 + i*2} ${91 - i*4}`,     // 0.85: Return Sway
                                             `M 100 140 C ${107.5 + i*2} ${132.5 - i*2} ${130 + i*4} ${115 - i*6} ${142.5 + i*2} ${90 - i*4}`
                                           ]
                                         : [
                                             `M 100 140 C ${92.5 - i*2} ${132.5 - i*2} ${70 - i*4} ${115 - i*6} ${57.5 - i*2} ${90 - i*4}`, 
                                             `M 100 140 C ${92.5 - i*2} ${132.5 - i*2} ${70 - i*4} ${115 - i*6} ${57.5 - i*2} ${90 - i*4}`,  // 0.15: OPEN
                                             `M 100 140 C ${91 - i*2} ${131 - i*2} ${69 - i*4} ${114 - i*6} ${56 - (i%3)*2} ${89 - i*4}`,   // 0.45: Ripple Sway
                                             `M 100 140 C ${91.5 - i*2} ${133 - i*2} ${70 - i*4} ${114 - i*6} ${57 - i*2} ${91 - i*4}`,    // 0.55: Persistent Open
                                             `M 100 140 C ${93 - i*2} ${134 - i*2} ${69 - i*4} ${113 - i*6} ${58 - i*2} ${92 - i*4}`,     // 0.70: High breathing
                                             `M 100 140 C ${92 - i*2} ${132 - i*2} ${70 - i*4} ${115 - i*6} ${57 - i*2} ${91 - i*4}`,     // 0.85: Return Sway
                                             `M 100 140 C ${92.5 - i*2} ${132.5 - i*2} ${70 - i*4} ${115 - i*6} ${57.5 - i*2} ${90 - i*4}`
                                           ],
                                      strokeWidth: [1.5 - (i * 0.1), 2.2 - (i * 0.1), 2.2 - (i * 0.1), 1.5 - (i * 0.1), 1.6 - (i * 0.1), 1.4 - (i * 0.1), 1.5 - (i * 0.1)],
                                      strokeOpacity: 0.35
                                    }}
                                    transition={{ 
                                      duration: 25, 
                                      repeat: Infinity, 
                                      times: [0, 0.15, 0.45, 0.55, 0.7, 0.85, 1],
                                      ease: "easeInOut",
                                      delay: 0.8 + (i * 0.25)
                                    }}
                                  />
                                  {/* DENSITY OVERLAY - Second layer for a 'Fuller' look */}
                                  <motion.path
                                    key={`primary-density-${i}`}
                                    d={side === 1 
                                      ? `M 100 140 C 110 150 118 185 122 225 L 112 245 Q 102 250 100 240` // RIGHT WRAP
                                      : `M 100 140 C 90 150 82 185 78 225 L 88 245 Q 98 250 100 240`}
                                    fill="url(#angelWingGrad)"
                                    fillOpacity={0.85}
                                    stroke="currentColor"
                                    strokeWidth="0.8"
                                    animate={{
                                      d: side === 1 
                                        ? [
                                            `M 100 140 C 110 150 118 185 122 225 L 112 245 Q 102 250 100 240`, 
                                            `M 100 140 C ${117 + i*4} ${128 - i*4} ${162 + i*8} ${92 - i*12} ${187 + i*4} ${42 - i*8}`, 
                                            `M 100 140 C ${117 + i*4} ${128 - i*4} ${162 + i*8} ${92 - i*12} ${187 + i*4} ${42 - i*8}`
                                          ]
                                        : [
                                            `M 100 140 C 90 150 82 185 78 225 L 88 245 Q 98 250 100 240`, 
                                            `M 100 140 C ${83 - i*4} ${128 - i*4} ${38 - i*8} ${92 - i*12} ${13 - i*4} ${42 - i*8}`,
                                            `M 100 140 C ${83 - i*4} ${128 - i*4} ${38 - i*8} ${92 - i*12} ${13 - i*4} ${42 - i*8}`
                                          ],
                                      opacity: [0, 0.4, 0.4]
                                    }}
                                    transition={{ 
                                      duration: 14, 
                                      times: [0, 0.15, 1],
                                      delay: 0.28 + (i * 0.12)
                                    }}
                                  />
                                  {/* STRUCTURAL SPINE - Biological Architecture & Precision */}
                                  <motion.path
                                    key={`spine-${i}`}
                                    d={side === 1 
                                      ? `M 100 140 Q 105 180 110 220` // RIGHT SPINE
                                      : `M 100 140 Q 95 180 90 220`}
                                    fill="none"
                                    stroke="rgba(255,255,255,0.4)"
                                    strokeWidth="0.35"
                                    strokeDasharray="2,1"
                                    animate={{
                                      d: side === 1 
                                        ? [
                                            `M 100 140 Q 105 180 110 220`, 
                                            `M 100 140 Q ${106 + i*2} ${135 - i*2} ${127 + i*2} ${140 - i*4}`,
                                            `M 100 140 Q ${107 + i*2} ${134 - i*2} ${128 + i*2} ${138 - i*4}`,
                                            `M 100 140 Q 105 180 110 220`,
                                            `M 100 140 Q 105 180 110 220`
                                          ]
                                        : [
                                            `M 100 140 Q 95 180 90 220`, 
                                            `M 100 140 Q ${94 - i*2} ${135 - i*2} ${73 - i*2} ${140 - i*4}`,
                                            `M 100 140 Q ${93 - i*2} ${134 - i*2} ${72 - i*2} ${138 - i*4}`,
                                            `M 100 140 Q 95 180 90 220`,
                                            `M 100 140 Q 95 180 90 220`
                                          ],
                                      opacity: [0, 0.6, 0.6, 0, 0]
                                    }}
                                    transition={{ 
                                      duration: 14, 
                                      times: [0, 0.15, 0.45, 0.55, 1], 
                                      repeat: Infinity, 
                                      delay: 0.25 + (i * 0.12) 
                                    }}
                                  />
                                  {/* Interweaving Filaments - Microtextures */}
                                  <motion.path
                                    d={side === 1 
                                      ? `M 100 140 Q ${120 + i*4} ${120 - i*4} ${185 + i*4} ${40 - i*8}`
                                      : `M 100 140 Q ${80 - i*4} ${120 - i*4} ${15 - i*4} ${40 - i*8}`}
                                    fill="url(#fiberPattern)"
                                    opacity="0.3"
                                    animate={{ opacity: [0, 0.4, 0.4, 0, 0] }}
                                    transition={{ 
                                      duration: 14, 
                                      times: [0, 0.15, 0.45, 0.55, 1], 
                                      repeat: Infinity, 
                                      delay: 0.25 + (i * 0.12) 
                                    }}
                                  />
                                  {/* Light Diffusing Edge Filaments */}
                                  {[...Array(3)].map((_, f) => (
                                    <motion.line
                                      key={`light-filament-${i}-${f}`}
                                      x1={side === 1 ? 100 + i*2 : 100 - i*2}
                                      y1={140 + i*2}
                                      x2={side === 1 ? 280 + i*15 + f*25 : -80 - i*15 - f*25}
                                      y2={-120 - i*25 + f*15}
                                      stroke="currentColor"
                                      strokeWidth="1.2"
                                      initial={{ pathLength: 0, opacity: 0 }}
                                      animate={{ pathLength: 1, opacity: [0.2, 0.4, 0.2] }}
                                      transition={{ pathLength: { duration: 4, delay: 0.8 + i * 0.1, ease: "easeOut" }, opacity: { duration: 2, repeat: Infinity } }}
                                    />
                                  ))}
                                </motion.g>
                              </motion.g>
                            ))}

                            {/* INTERMEDIATE VOLUMETRIC LAYERS - Shorter, softer feathers for depth */}
                            {[...Array(12)].map((_, i) => (
                              <motion.path
                                key={`inter-feather-${i}`}
                                d={side === 1 
                                  ? `M 100 140 C 105 145 115 160 120 180 L 110 200 Q 102 210 100 205`
                                  : `M 100 140 C 95 145 85 160 80 180 L 90 200 Q 98 210 100 205`}
                                fill="url(#angelWingGrad)"
                                fillOpacity={0.9}
                                stroke="currentColor"
                                strokeWidth="0.35"
                                strokeOpacity="0.2"
                                
                                animate={{
                                  d: side === 1 
                                    ? [
                                        `M 100 140 C 105 145 115 160 119 185 L 109 205 Q 102 210 100 205`, 
                                        `M 100 140 C ${105 + i*1.5} ${135 - i*1} ${120 + i*3} ${125 - i*2} ${132 + i*1} ${110 - i*2}`,
                                        `M 100 140 C ${106 + i*1.5} ${134 - i*1} ${121 + i*3} ${124 - i*2} ${133 + i*1} ${109 - i*2}`,
                                        `M 100 140 C 105 145 115 160 119 185 L 109 205 Q 102 210 100 205`, 
                                        `M 100 140 C 105 145 115 160 119 185 L 109 205 Q 102 210 100 205`
                                      ]
                                    : [
                                        `M 100 140 C 95 145 85 160 81 185 L 91 205 Q 98 210 100 205`, 
                                        `M 100 140 C ${95 - i*1.5} ${135 - i*1} ${80 - i*3} ${125 - i*2} ${68 - i*1} ${110 - i*2}`,
                                        `M 100 140 C ${94 - i*1.5} ${134 - i*1} ${79 - i*3} ${124 - i*2} ${67 - i*1} ${109 - i*2}`,
                                        `M 100 140 C 95 145 85 160 81 185 L 91 205 Q 98 210 100 205`, 
                                        `M 100 140 C 95 145 85 160 81 185 L 91 205 Q 98 210 100 205`
                                      ]
                                }}
                                transition={{ 
                                  duration: 14, 
                                  repeat: Infinity, 
                                  times: [0, 0.15, 0.45, 0.55, 1], 
                                  ease: "easeInOut", 
                                  delay: 0.12 + i * 0.04 // Second phase of unrolling
                                }}
                              />
                            ))}

                            {/* TERTIARY JOINT FEATHERS - Filling the bottom border detail gaps */}
                            {[...Array(8)].map((_, i) => (
                              <motion.path
                                key={`tertiary-detail-${i}`}
                                d={side === 1 
                                  ? `M 100 140 Q ${102 + i} ${145 + i} ${105 + i*2} ${150 + i*3}`
                                  : `M 100 140 Q ${98 - i} ${145 + i} ${95 - i*2} ${150 + i*3}`}
                                fill="url(#angelWingGrad)"
                                fillOpacity={0.95}
                                stroke="currentColor"
                                strokeWidth="0.1"
                                animate={{
                                  d: side === 1 
                                    ? [
                                        `M 100 140 Q 102 145 105 150`,
                                        `M 100 140 Q ${105 + i*1.5} ${155 + i*2} ${115 + i*2} ${180 + i*3}`,
                                        `M 100 140 Q 102 145 105 150`
                                      ]
                                    : [
                                        `M 100 140 Q 98 145 95 150`,
                                        `M 100 140 Q ${95 - i*1.5} ${155 + i*2} ${85 - i*2} ${180 + i*3}`,
                                        `M 100 140 Q 98 145 95 150`
                                      ],
                                  opacity: [0.6, 1, 0.6]
                                }}
                                transition={{ duration: 14, repeat: Infinity, times: [0, 0.15, 1], delay: 0.2 + i * 0.04 }}
                              />
                            ))}

                            {/* DENSE INTERNAL FLUFF - Soft mass near the root */}
                            {[...Array(15)].map((_, i) => (
                              <motion.circle
                                key={`fluff-${i}`}
                                cx={100 + (side * (i * 1.3))}
                                cy={140 + (i % 5) * 3}
                                r={3 + (i % 4) * 1.25}
                                fill="url(#angelWingGrad)"
                                fillOpacity={0.5 + (i % 3) * 0.1}
                                
                                animate={{
                                  scale: [0, 1.2, 1, 0, 0],
                                  opacity: [0, 0.8, 0.8, 0, 0],
                                  x: [0, side * ((i % 3) * 2), 0]
                                }}
                                transition={{ 
                                  duration: 14, 
                                  times: [0, 0.1, 0.4, 0.5, 1], 
                                  repeat: Infinity, 
                                  delay: 0.05 + i * 0.01 // Yields first
                                }}
                              />
                            ))}

                            {/* Internal Upward Supporting Rays */}
                            {[...Array(6)].map((_, i) => (
                              <motion.path
                                key={`feather-ray-${i}`}
                                d={side === 1
                                  ? `M ${100 + i*2} ${140 + i*5} Q ${115 + i*5} ${110 + i*5} ${135 + i*1.5} ${90 + i*5}`
                                  : `M ${100 - i*2} ${140 + i*5} Q ${85 - i*5} ${110 + i*5} ${65 - i*1.5} ${90 + i*5}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.8"
                                strokeOpacity="0.3"
                                animate={{ 
                                  opacity: [0, 0.4, 0.4, 0, 0],
                                  pathLength: [0, 1, 1, 0, 0]
                                }}
                                transition={{ 
                                  duration: 14, 
                                  times: [0, 0.1, 0.4, 0.5, 1],
                                  repeat: Infinity,
                                  delay: i*0.04 
                                }}
                              />
                            ))}

                            {/* Internal Feathers - High detail detail lines */}
                            {[...Array(5)].map((_, i) => (
                              <motion.path
                                key={`feather-${i}`}
                                d={side === 1
                                  ? `M ${100 + i*5} ${140 + i*10} Q ${115 + i*4} ${130 + i*2} ${130 + i*2.5} ${140 + i*4}`
                                  : `M ${100 - i*5} ${140 + i*10} Q ${85 - i*4} ${130 + i*2} ${70 - i*2.5} ${140 + i*4}`}
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="0.8"
                                strokeOpacity="0.4"
                                animate={{ opacity: [0.2, 0.6, 0.2] }}
                                transition={{ duration: 3, delay: i*0.5, repeat: Infinity }}
                              />
                            ))}

                            {/* Secondary Glow Layer (Soft Halo around wings) */}
                            <motion.path
                              d={side === 1 
                                ? "M 100 140 C 120 130 135 120 145 130 C 142 145 130 160 100 180 Q 95 160 100 140"
                                : "M 100 140 C 80 130 65 120 55 130 C 58 145 70 160 100 180 Q 105 160 100 140"}
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeOpacity="0.1"
                              style={{ filter: "blur(12px)" }}
                            />
                          </motion.g>
                        ))}
                      </motion.g>
                    </motion.g>
                  </g>
                  

                    <g filter="url(#cloakGlow)">
                      {/* Original sync elements below emblem to keep them separate */}
                        
                        {/* Divine Dust / Binary Halo */}
                        {[...Array(8)].map((_, i) => (
                          <motion.text
                            key={`divine-bit-${i}`}
                            x={70 + Math.random() * 60}
                            y={100 + Math.random() * 100}
                            fontSize="8"
                            fill="#fff"
                            fillOpacity="0.6"
                            animate={{ 
                              y: [null, -50], 
                              opacity: [0, 1, 0],
                              scale: [0.5, 1, 0.5]
                            }}
                            transition={{ duration: 15 + Math.random()*15, repeat: Infinity, delay: i }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </>
                  ) : (
                    /* Wind (Default) */
                      <>
                        <g fontSize="6" fill="currentColor" fillOpacity="0.25" style={{ fontFamily: 'monospace', pointerEvents: 'none' }}>
                          <text x="30" y="80">0</text> <text x="160" y="90">1</text>
                          <text x="50" y="120">1</text> <text x="140" y="130">0</text>
                        </g>

                        <g filter="url(#cloakGlow)">
                          <motion.path
                            d="M60 40 C45 40 35 120 30 180 L20 320 L75 290 C100 280 100 280 125 290 L180 320 L170 180 C165 120 155 40 140 40 L60 40 Z"
                            fill="url(#cloakGrad)"
                            animate={{
                              d: [
                                "M60 40 C45 40 35 120 30 180 L20 320 L75 290 C100 280 100 280 125 290 L180 320 L170 180 C165 120 155 40 140 40 L60 40 Z",
                                "M60 40 C50 45 40 125 35 185 L25 315 L80 288 C100 282 100 282 120 288 L175 315 L165 185 C160 125 150 45 140 40 L60 40 Z",
                                "M60 40 C40 35 30 115 25 175 L15 325 L70 295 C100 290 100 290 130 295 L185 325 L175 175 C170 115 160 35 140 40 L60 40 Z",
                                "M60 40 C45 40 35 120 30 180 L20 320 L75 290 C100 280 100 280 125 290 L180 320 L170 180 C165 120 155 40 140 40 L60 40 Z"
                              ]
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          />
                          <motion.path
                            d="M85 45 Q75 200 80 320"
                            stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"
                            animate={{ d: ["M85 45 Q75 200 80 320", "M88 45 Q78 205 83 330", "M85 45 Q75 200 80 320"] }}
                            transition={{ duration: 4, repeat: Infinity }}
                          />
                          <motion.path
                            d="M115 45 Q125 200 120 320"
                            stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3"
                            animate={{ d: ["M115 45 Q125 200 120 320", "M112 45 Q122 205 117 330", "M115 45 Q125 200 120 320"] }}
                            transition={{ duration: 4.5, repeat: Infinity }}
                          />

                          {/* Tech Circuit Detailing for Wind Cloak (Black) */}
                          <g opacity="0.4">
                            <motion.path 
                              d="M75 50 L65 150 L50 150 L45 280"
                              stroke="#000" strokeWidth="0.8" fill="none"
                              animate={{ d: ["M75 50 L65 150 L50 150 L45 280", "M78 50 L68 155 L53 155 L48 290", "M75 50 L65 150 L50 150 L45 280"] }}
                              transition={{ duration: 4, repeat: Infinity }}
                            />
                            <circle cx="50" cy="150" r="1.5" fill="#000" />
                            
                            <motion.path 
                              d="M125 50 L135 150 L150 150 L155 280"
                              stroke="#000" strokeWidth="0.8" fill="none"
                              animate={{ d: ["M125 50 L135 150 L150 150 L155 280", "M122 50 L132 155 L147 155 L152 290", "M125 50 L135 150 L150 150 L155 280"] }}
                              transition={{ duration: 4.2, repeat: Infinity }}
                            />
                            <circle cx="150" cy="150" r="1.5" fill="#000" />

                            <circle cx="100" cy="100" r="1" fill="#000" />
                            <line x1="100" y1="100" x2="100" y2="130" stroke="#000" strokeWidth="0.5" strokeDasharray="2,2" />
                          </g>

                        </g>
                      </>
                    )}
                  </motion.svg>
                </AnimatePresence>
              </motion.div>
            )}

            {/* CHAPÉU DE MAGO / FAIXA / BOINA */}
            {profile.hat_enabled && (
              <AnimatePresence mode="wait">
                {profile.hat_type === 'headband' ? (
                  <motion.div
                    key="hat-headband"
                    className={styles.headbandContainer}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <svg viewBox="0 0 100 100" className={styles.headbandSvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff', overflow: 'visible' }}>
                      <defs>
                        <filter id="headbandGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="2" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      {/* Band wrapping the avatar - radius 49 for a tighter fit */}
                      <circle cx="50" cy="50" r="49" fill="none" stroke="currentColor" strokeWidth="4" strokeOpacity="0.8" filter="url(#headbandGlow)" />
                      <circle cx="50" cy="50" r="49" fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="2" strokeDasharray="5 2" />

                      {/* Dense Binary Rain Above Headband */}
                      <g fontSize="10" fill="currentColor" opacity="0.9" style={{ fontFamily: 'monospace' }}>
                        {[...Array(24)].map((_, i) => (
                          <motion.text
                            key={`b-head-${i}`}
                            x={-10 + Math.random() * 120}
                            y={Math.random() < 0.5 ? -15 - Math.random() * 20 : 100 + Math.random() * 20}
                            animate={{
                              opacity: [0, 1, 0],
                              y: [null, Math.random() < 0.5 ? -50 : 150]
                            }}
                            transition={{
                              duration: 1.5 + Math.random() * 2,
                              repeat: Infinity,
                              delay: Math.random() * 2,
                              ease: "linear"
                            }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                        {[...Array(16)].map((_, i) => (
                          <motion.text
                            key={`b-around-${i}`}
                            x={10 + Math.random() * 80}
                            y={10 + Math.random() * 80}
                            animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
                            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 1 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>

                      {/* Knot on the side */}
                      <g filter="url(#headbandGlow)">
                        <path d="M99 50 L112 35 M99 50 L112 65" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                        <motion.path
                          d="M112 35 Q122 30 117 15 M112 65 Q122 70 117 85"
                          stroke="currentColor" strokeWidth="3" fill="none" strokeOpacity="0.6"
                          animate={{ rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: '99px 50px' }}
                        />
                      </g>

                      {/* Symbol in the center (Fighter Spirit) */}
                      <text x="50" y="11" textAnchor="middle" fontSize="10" fill="currentColor" fontWeight="bold" filter="url(#headbandGlow)">武</text>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'newsboy' ? (
                  <motion.div
                    key="hat-newsboy"
                    className={styles.newsboyContainer}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <svg viewBox="0 0 100 60" className={styles.newsboySvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff' }}>
                      <defs>
                        <filter id="newsboyGlow">
                          <feGaussianBlur stdDeviation="1" result="glow" />
                        </filter>
                      </defs>
                      {/* Main Cap Shape - Octagonal feel */}
                      <path d="M5 40 L15 15 L50 5 L85 15 L95 40 Q50 45 5 40" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" filter="url(#newsboyGlow)" />
                      {/* Binary nodes */}
                      <g fontSize="6" fill="currentColor" opacity="0.5" style={{ fontFamily: 'monospace' }}>
                        {[...Array(10)].map((_, i) => (
                          <motion.text
                            key={`b-${i}`}
                            x={10 + Math.random() * 80}
                            y={5 + Math.random() * 40}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                      {/* Bill (Viseira) */}
                      <path d="M25 40 Q50 55 75 40 L70 35 Q50 40 30 35 Z" fill="#000" fillOpacity="0.8" stroke="currentColor" strokeWidth="1" />
                      {/* Octagonal lines */}
                      <path d="M50 5 L50 42 M50 5 L15 15 M50 5 L85 15 M15 15 L5 40 M85 15 L95 40" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.4" />
                      {/* Button on top */}
                      <circle cx="50" cy="5" r="3" fill="currentColor" />
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'halo' ? (
                  <motion.div
                    key="hat-halo"
                    className={styles.headbandContainer}
                    style={{
                      top: '-24vh',
                      zIndex: 100,
                      pointerEvents: 'none'
                    }}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      filter: [
                        'drop-shadow(0 0 5px var(--hat-color))',
                        'drop-shadow(0 0 25px var(--hat-color))',
                        'drop-shadow(0 0 5px var(--hat-color))'
                      ]
                    }}
                    transition={{
                      opacity: { duration: 0.5 },
                      scale: { duration: 0.5 },
                      filter: {
                        duration: 7,
                        repeat: Infinity,
                        times: [0, 0.15, 1], // Flash initially, then rest
                        ease: "easeInOut"
                      }
                    }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <svg viewBox="0 0 200 100" className={styles.headbandSvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff', overflow: 'visible' }}>
                      <defs>
                        <filter id="haloGlow" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="3" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>

                      {/* Halo background part */}
                      <ellipse cx="100" cy="50" rx="80" ry="15" fill="none" stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="4 4" />

                      {/* Animated Halo Ring */}
                      <motion.ellipse
                        cx="100" cy="50" rx="80" ry="15"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="5"
                        filter="url(#haloGlow)"
                        animate={{
                          rx: [80, 85, 80],
                          ry: [15, 17, 15],
                          strokeWidth: [4, 6, 4]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* White Neon Contour (Added per user request) */}
                      <motion.ellipse
                        cx="100" cy="50" rx="80" ry="15"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="1.2"
                        filter="url(#haloGlow)"
                        style={{ mixBlendMode: 'screen' }}
                        animate={{
                          rx: [80, 85, 80],
                          ry: [15, 17, 15],
                          opacity: [0.6, 1, 0.6]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                      {/* Binary nodes */}
                      <g fontSize="8" fill="currentColor" opacity="0.6" style={{ fontFamily: 'monospace' }}>
                        {[...Array(12)].map((_, i) => (
                          <motion.text
                            key={`b-${i}`}
                            x={20 + Math.random() * 160}
                            y={20 + Math.random() * 60}
                            animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8] }}
                            transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>

                      {/* Traveling Light Nodes */}
                      {[0, 1, 2].map((i) => (
                        <motion.circle
                          key={`halo-node-${i}`}
                          r="4"
                          fill="currentColor"
                          filter="url(#haloGlow)"
                          animate={{
                            cx: [100 + Math.cos(i * 2 + 0) * 80, 100 + Math.cos(i * 2 + 6.28) * 80],
                            cy: [50 + Math.sin(i * 2 + 0) * 15, 50 + Math.sin(i * 2 + 6.28) * 15],
                            opacity: [1, 0.2, 1], // Dim when "behind"
                            scale: [1, 0.6, 1]
                          }}
                          transition={{ duration: 5 + i, repeat: Infinity, ease: "linear" }}
                        />
                      ))}
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'ears' ? (
                  <motion.div 
                    key="hat-ears"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ff00ff', overflow: 'visible' }}>
                      <defs>
                        <filter id="earsGlow">
                          <feGaussianBlur stdDeviation="3" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      <g filter="url(#earsGlow)">
                        {/* Right Ear */}
                        <motion.path 
                          d="M100 110 C130 110, 150 70, 155 40 C140 50, 110 90, 100 100"
                          fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2.5"
                          animate={{ rotate: [0, 2, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: '100px 110px' }}
                        />
                        {/* Left Ear */}
                        <motion.path 
                          d="M60 110 C30 110, 10 70, 5 40 C20 50, 50 90, 60 100"
                          fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="2.5"
                          animate={{ rotate: [0, -2, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: '60px 110px' }}
                        />
                        {/* Internal Fiber Lines */}
                        <path d="M110 100 L145 50" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
                        <path d="M50 100 L15 50" stroke="currentColor" strokeWidth="1" strokeDasharray="4 2" opacity="0.6" />
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'goat_horns' ? (
                  <motion.div 
                    key="hat-horns"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, scale: 0.9, y: 15 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 15 }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ff3333', overflow: 'visible' }}>
                      <defs>
                        <filter id="horrorGlow">
                          <feGaussianBlur stdDeviation="3" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      <g filter="url(#horrorGlow)">
                        {/* Perfectly Symmetrical Goat Horns */}
                        <motion.path 
                          d="M65 110 C 20 80, 30 30, 60 10 C 45 40, 50 80, 75 110"
                          fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2.5"
                          animate={{ rotate: [-1, 1, -1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: '75px 110px' }}
                        />
                        <motion.path 
                          d="M95 110 C 140 80, 130 30, 100 10 C 115 40, 110 80, 85 110"
                          fill="currentColor" fillOpacity="0.4" stroke="currentColor" strokeWidth="2.5"
                          animate={{ rotate: [1, -1, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: '85px 110px' }}
                        />
                        
                        {/* Horizontal Segments (Industrial look) */}
                        <path d="M45 75 L55 70 M115 75 L105 70" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
                        <path d="M50 50 L60 45 M110 50 L100 45" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
                      </g>
                      
                      {/* Floating Data Shards */}
                      {[...Array(6)].map((_, i) => (
                        <motion.rect
                          key={`shard-${i}`}
                          width="2" height="6"
                          fill="currentColor"
                          animate={{ 
                            y: [0, -60, 0], 
                            x: [80 + (i-2.5)*20, 80 + (i-2.5)*25],
                            opacity: [0, 0.8, 0] 
                          }}
                          transition={{ duration: 3, delay: i * 0.5, repeat: Infinity }}
                        />
                      ))}
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'sharp_horns' ? (
                  <motion.div 
                    key="hat-sharp-horns"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ff0000', overflow: 'visible' }}>
                      <defs>
                        <filter id="sharpGlow">
                          <feGaussianBlur stdDeviation="2" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      <g filter="url(#sharpGlow)">
                        {/* Ultra-Sharp Symmetrical Horns */}
                        <motion.path 
                          d="M72 110 L50 20 L82 110"
                          fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="2.5"
                          animate={{ skewY: [0, 1, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.path 
                          d="M88 110 L110 20 L78 110"
                          fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="2.5"
                          animate={{ skewY: [0, -1, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
                        />
                         {/* Synced Sparks */}
                         <motion.path 
                          d="M70 40 L80 30 L90 40"
                          stroke="currentColor" strokeWidth="1.5" fill="none"
                          animate={{ opacity: [0, 1, 0], scale: [0.8, 1.2, 0.8], y: [0, -5, 0] }}
                          transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 1.5 }}
                        />
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'curved_horns' ? (
                   <motion.div 
                    key="hat-curved-horns"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ff00ff', overflow: 'visible' }}>
                      <defs>
                        <filter id="curvedGlow">
                          <feGaussianBlur stdDeviation="3" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      <g filter="url(#curvedGlow)">
                        {/* High-Fidelity Symmetrical Curved Horns */}
                        <motion.path 
                          d="M70 110 C 30 90, 20 40, 60 15 C 40 45, 45 85, 75 110"
                          fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="2.5"
                          animate={{ rotate: [-2, 2, -2] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: '75px 110px' }}
                        />
                        <motion.path 
                          d="M90 110 C 130 90, 140 40, 100 15 C 120 45, 115 85, 85 110"
                          fill="currentColor" fillOpacity="0.45" stroke="currentColor" strokeWidth="2.5"
                          animate={{ rotate: [2, -2, 2] }}
                          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                          style={{ transformOrigin: '85px 110px' }}
                        />
                      </g>
                      <g fontSize="9" fill="currentColor" opacity="0.8" style={{ fontFamily: 'monospace' }}>
                        {[...Array(12)].map((_, i) => (
                          <motion.text
                            key={`b-curved-${i}`}
                            x={Math.random() * 160}
                            y={Math.random() * 160}
                            animate={{
                              opacity: [0, 1, 0],
                              scale: [0.2, 1, 0.2],
                              rotate: [0, 90, 180]
                            }}
                            transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 3 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'crown' ? (
                  <motion.div
                    key="hat-crown"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#ffd700', overflow: 'visible' }}>
                      <defs>
                        <filter id="crownGlow">
                          <feGaussianBlur stdDeviation="3" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      <g filter="url(#crownGlow)">
                        {/* 7-Point Crown Base - Resized and Lowered */}
                        <motion.path
                          d="M40 110 L40 85 L50 100 L60 70 L70 100 L80 50 L90 100 L100 70 L110 100 L120 85 L120 110 Z"
                          fill="currentColor" fillOpacity="0.5" stroke="currentColor" strokeWidth="2"
                          animate={{ scaleY: [1, 1.03, 1] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />
                        {/* Animated Sparkles at 7 tips - Adjusted positions */}
                        {[
                          { x: 40, y: 85 }, { x: 50, y: 100 }, { x: 60, y: 70 },
                          { x: 80, y: 50 },
                          { x: 100, y: 70 }, { x: 110, y: 100 }, { x: 120, y: 85 }
                        ].map((pos, i) => (
                          <motion.circle
                            key={`sparkle-${i}`}
                            cx={pos.x} cy={pos.y} r="2.5"
                            fill="white"
                            animate={{ scale: [1, 1.8, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.2 }}
                            filter="url(#crownGlow)"
                          />
                        ))}
                      </g>

                      {/* Golden Binary Particles */}
                      <g fontSize="10" fill="currentColor" opacity="0.6" style={{ fontFamily: 'monospace' }}>
                        {[...Array(14)].map((_, i) => (
                          <motion.text
                            key={`b-crown-${i}`}
                            x={10 + Math.random() * 140}
                            y={110 + Math.random() * 20}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2, repeat: Infinity, delay: Math.random() * 2 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                    </svg>
                  </motion.div>
                ) : profile.hat_type === 'trash_bucket' ? (
                  <motion.div
                    key="hat-trash-bucket"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, scale: 0.8, y: -20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                  >
                    <svg viewBox="0 0 160 160" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#888', overflow: 'visible' }}>
                      <defs>
                        <filter id="bucketGlow">
                          <feGaussianBlur stdDeviation="1.5" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      <g filter="url(#bucketGlow)">
                        {/* Top Ellipse (Fundo do balde no topo) - Moved up */}
                        <ellipse cx="80" cy="30" rx="22" ry="6" fill="currentColor" fillOpacity="0.6" stroke="currentColor" strokeWidth="2" />
                        
                        {/* Bucket Body (Refined 3D curve) - Larger bottom, moved up */}
                        <motion.path
                          d="M58 30 L102 30 L120 100 Q 80 110 40 100 Z"
                          fill="currentColor" fillOpacity="0.3"
                          stroke="currentColor" strokeWidth="2"
                        />

                        {/* Bottom Ellipse (Boca do balde na base) - Larger, moved up */}
                        <ellipse cx="80" cy="100" rx="40" ry="10" fill="none" stroke="currentColor" strokeWidth="3" />

                        {/* Handle at the bottom - Adjusted for new scale and position */}
                        <motion.path
                          d="M40 100 Q 80 140 120 100"
                          fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"
                          animate={{ y: [0, 3, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Vertical Ridges - Adjusted for new scale */}
                        {[60, 73, 87, 100].map((x, i) => (
                          <line 
                            key={`ridge-${i}`} 
                            x1={x + (x-80)*0.5} y1="100" 
                            x2={x} y2="30" 
                            stroke="currentColor" strokeWidth="1" strokeOpacity="0.2" 
                          />
                        ))}
                      </g>

                      {/* Binary Dust / Trash Particles */}
                      {[...Array(8)].map((_, i) => (
                        <motion.text
                          key={`dust-${i}`}
                          x={i * 20} y={120}
                          fontSize="6" fill="currentColor" fillOpacity="0.3"
                          animate={{ 
                            y: [120, 80 + Math.random() * 40, 120],
                            x: [i * 20, i * 20 + (Math.random() - 0.5) * 10, i * 20],
                            rotate: [0, 180, 360],
                            opacity: [0, 0.4, 0]
                          }}
                          transition={{ duration: 4 + Math.random() * 3, repeat: Infinity, delay: i * 0.4 }}
                        >
                          {Math.random() > 0.5 ? '0' : '1'}
                        </motion.text>
                      ))}
                    </svg>
                  </motion.div>
                ) : (
                  <motion.div
                    key="hat-wizard"
                    className={styles.hatContainer}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                  >
                    <svg viewBox="0 0 100 120" className={styles.hatSvg} style={{ color: profile.hat_color || profile.nexo_color || '#00f3ff' }}>
                      <defs>
                        <filter id="neonHat" x="-50%" y="-50%" width="200%" height="200%">
                          <feGaussianBlur stdDeviation="1.5" result="glow" />
                          <feComposite in="SourceGraphic" in2="glow" operator="over" />
                        </filter>
                      </defs>
                      {/* Rim */}
                      <ellipse cx="50" cy="90" rx="40" ry="10" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="2" filter="url(#neonHat)" />
                      {/* Cone Main */}
                      <motion.path
                        d="M20 85 L50 10 L80 85 Q50 75 20 85"
                        fill="currentColor" fillOpacity="0.25" stroke="currentColor" strokeWidth="2"
                        filter="url(#neonHat)"
                        animate={{
                          d: [
                            "M20 85 L50 10 L80 85 Q50 75 20 85",
                            "M22 85 L52 15 L78 85 Q50 76 22 85",
                            "M18 85 L48 15 L82 85 Q50 76 18 85",
                            "M20 85 L50 10 L80 85 Q50 75 20 85"
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      />
                      {/* Efeito de Arco Elétrico */}
                      <motion.path
                        d="M50 5 L85 95 L15 95 Z"
                        stroke="currentColor" strokeWidth="1.5" fill="none" filter="url(#neonHat)"
                        animate={{ opacity: [0.2, 0.6, 0.3, 0.8, 0.2] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      />
                      <motion.path
                        d="M50 5 L85 95 L15 95 Z"
                        stroke="currentColor" strokeWidth="2.5" fill="none"
                        initial={{ pathLength: 0.1, pathOffset: 0 }}
                        animate={{ pathOffset: [0, 1], opacity: [0, 1, 0] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        filter="url(#neonHat)"
                      />
                      {/* Nuvem de Dados Binários */}
                      <g fontSize="10" fill="currentColor" style={{ fontFamily: 'monospace', pointerEvents: 'none' }}>
                        {[...Array(18)].map((_, i) => (
                          <motion.text
                            key={`b-${i}`}
                            x={10 + Math.random() * 80}
                            y={10 + Math.random() * 100}
                            animate={{ opacity: [0, 1, 0] }}
                            transition={{ duration: 2 + Math.random() * 3, repeat: Infinity, delay: Math.random() * 2 }}
                          >
                            {Math.random() > 0.5 ? '0' : '1'}
                          </motion.text>
                        ))}
                      </g>
                      {/* Tip Sparkle */}
                      <motion.circle
                        cx="50" cy="10" r="3.5" fill="#000"
                        animate={{ scale: [1, 2.2, 1] }}
                        transition={{ 
                          duration: 1, 
                          repeat: Infinity, 
                          repeatDelay: 6 
                        }}
                        style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.8))' }}
                      />
                    </svg>
                  </motion.div>
                )}
              </AnimatePresence>
            )}

            {/* PEDRA SAGRADA (LEFT) */}
            {profile.selected_pedra && profile.selected_pedra > 0 && (
              <motion.div
                className={styles.stoneToken}
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                style={{ 
                  '--pedra-color': profile.stone_border_color || profile.cloak_color || profile.nexo_color || '#00f3ff',
                  '--pedra-internal': profile.stone_internal_color || profile.cloak_color || profile.nexo_color || '#00f3ff',
                  '--pedra-image': profile.stone_image_color || '#ffffff'
                } as any}
              >
                <div className={styles.stoneImageContainer}>
                  <img 
                    src={`/pedras/${profile.selected_pedra}.png`} 
                    alt="Pedra" 
                    className={styles.stoneBaseImg}
                  />
                  <div 
                    className={styles.stoneTint} 
                    style={{
                      WebkitMaskImage: `url(/pedras/${profile.selected_pedra}.png)`,
                      maskImage: `url(/pedras/${profile.selected_pedra}.png)`,
                      backgroundColor: 'var(--pedra-image)',
                    }}
                  />
                </div>
                <svg viewBox="0 0 100 100" className={styles.stoneVeins} style={{ overflow: 'visible' }}>
                  <defs>
                    <filter id="veinGlow" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="0.5" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <filter id="centerPulse" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="8" result="blur" />
                      <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                    <clipPath id="stoneClip">
                      {stoneFrameToRender === 'triangle' ? (
                        <path d="M50 -35 L115 95 L-15 95 Z" />
                      ) : stoneFrameToRender === 'square' ? (
                        <rect x="5" y="5" width="90" height="90" rx="4" />
                      ) : stoneFrameToRender === 'shield' ? (
                        <path d="M10 8 L90 8 L90 60 C 90 88 50 98 50 98 C 50 98 10 88 10 60 Z" />
                      ) : stoneFrameToRender === 'hexagram' ? (
                        <circle cx="50" cy="50" r="48" /> 
                      ) : stoneFrameToRender === 'pentagram' ? (
                        <circle cx="50" cy="50" r="48" />
                      ) : stoneFrameToRender === 'hybrid' ? (
                        <rect x="5" y="5" width="90" height="90" rx="40" />
                      ) : stoneFrameToRender === 'manifestation' || stoneFrameToRender === 'fusion_manifestation' ? (
                        <circle cx="50" cy="50" r="48" />
                      ) : (
                        <circle cx="50" cy="50" r="45" />
                      )}
                    </clipPath>
                  </defs>

                  {/* Internal Effects contained by Frame Clip */}
                  <g clipPath="url(#stoneClip)">
                    {/* Luz de pulso atmosférica (7s total, 1s ativo) */}
                    <motion.circle
                      cx="50" cy="50" r="20"
                      fill="var(--pedra-internal)"
                      filter="url(#centerPulse)"
                      animate={{
                        scale: [1, 2.35, 1],
                        opacity: [0, 0.7, 0]
                      }}
                      transition={{
                        duration: 1,
                        repeat: Infinity,
                        repeatDelay: 6,
                        ease: [0.4, 0, 0.2, 1]
                      }}
                    />

                    {/* Pulso constante do núcleo (Crescendo e diminuindo continuamente) */}
                    <motion.circle
                      cx="50" cy="50" r="4"
                      fill="var(--pedra-internal)"
                      animate={{
                        scale: [1, 1.8, 1],
                        opacity: [0.6, 1, 0.6]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </g>

                  {/* Borda Sofisticada com Efeito de Choque Elétrico (Multi-camadas) */}
                  <AnimatePresence mode="wait">
                    {stoneFrameToRender === 'square' ? (
                      <motion.g
                        key="square-frame"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <rect x="5" y="5" width="90" height="90" rx="4" fill="none" stroke="var(--pedra-color)" strokeWidth="2" strokeOpacity="0.6" />
                        <rect x="3" y="3" width="94" height="94" rx="6" fill="none" stroke="var(--pedra-color)" strokeWidth="0.5" strokeOpacity="0.2" />
                        <rect x="7" y="7" width="86" height="86" rx="2" fill="none" stroke="var(--pedra-color)" strokeWidth="0.5" strokeOpacity="0.3" />

                        {/* Veias orgânicas dinâmicas (Ancoradas no Quadrado) */}
                        <g className={styles.pedraVeinGroup} filter="url(#veinGlow)">
                          {/* Corners */}
                          <path d="M50 50 Q25 25 5 5" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 Q75 25 95 5" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 Q75 75 95 95" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 Q25 75 5 95" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          
                          {/* Midpoints */}
                          <path d="M50 50 L50 5" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" opacity="0.4" strokeDasharray="1 3" />
                          <path d="M50 50 L95 50" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" opacity="0.4" strokeDasharray="1 3" />
                          <path d="M50 50 L50 95" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" opacity="0.4" strokeDasharray="1 3" />
                          <path d="M50 50 L5 50" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" opacity="0.4" strokeDasharray="1 3" />

                          <g opacity="0.3" strokeWidth="0.5" stroke="#fff">
                            <path d="M50 50 L5 5" />
                            <path d="M50 50 L95 5" />
                            <path d="M50 50 L95 95" />
                            <path d="M50 50 L5 95" />
                          </g>
                        </g>
                      </motion.g>
                    ) : stoneFrameToRender === 'triangle' ? (
                      <motion.g
                        key="triangle-frame"
                        initial={{ opacity: 0, scale: 1, y: 0 }}
                        animate={{ opacity: 1, scale: 1.05, y: -1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        style={{ transformOrigin: '50px 50px' }}
                      >
                        <path d="M50 -35 L115 95 L-15 95 Z" fill="none" stroke="var(--pedra-color)" strokeWidth="2.5" strokeOpacity="0.8" />
                        <path d="M50 -40 L120 100 L-20 100 Z" fill="none" stroke="var(--pedra-color)" strokeWidth="0.8" strokeOpacity="0.3" />
                        
                        {/* Veias orgânicas dinâmicas (Ancoradas nas pontas do Triângulo) */}
                        <g className={styles.pedraVeinGroup} filter="url(#veinGlow)">
                          {/* Top Tip */}
                          <path d="M50 50 Q50 10 50 -35" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="3 3" />
                          <path d="M50 50 L50 -35" className={styles.pedraVeinPath} opacity="0.3" strokeWidth="0.5" stroke="#fff" />
                          
                          {/* Bottom Right Tip */}
                          <path d="M50 50 Q80 75 115 95" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="3 3" />
                          <path d="M50 50 L115 95" className={styles.pedraVeinPath} opacity="0.3" strokeWidth="0.5" stroke="#fff" />

                          {/* Bottom Left Tip */}
                          <path d="M50 50 Q20 75 -15 95" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="3 3" />
                          <path d="M50 50 L-15 95" className={styles.pedraVeinPath} opacity="0.3" strokeWidth="0.5" stroke="#fff" />
                        </g>
                      </motion.g>
                    ) : stoneFrameToRender === 'hybrid' ? (
                      <motion.g
                        key="hybrid-frame"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Sólidos Platônicos Místicos Intertravados */}
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--pedra-color)" strokeWidth="1" strokeOpacity="0.3" strokeDasharray="1 1" />
                        <rect x="15" y="15" width="70" height="70" rx="2" fill="none" stroke="var(--pedra-color)" strokeWidth="1.5" strokeOpacity="0.5" />
                        <path d="M50 10 L90 80 L10 80 Z" fill="none" stroke="var(--pedra-color)" strokeWidth="2" strokeOpacity="0.8" />

                        {/* Veias orgânicas dinâmicas (Ancoradas na estrutura Híbrida) */}
                        <g className={styles.pedraVeinGroup} filter="url(#veinGlow)">
                          <path d="M50 50 L50 10" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 L90 80" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 L10 80" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 L15 15" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" opacity="0.3" strokeDasharray="1 4" />
                          <path d="M50 50 L85 15" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" opacity="0.3" strokeDasharray="1 4" />
                          
                          <g opacity="0.3" strokeWidth="0.5" stroke="#fff">
                            <path d="M50 50 L50 10" />
                            <path d="M50 50 L90 80" />
                            <path d="M50 50 L10 80" />
                          </g>
                        </g>
                      </motion.g>
                    ) : stoneFrameToRender === 'hexagram' ? (
                      <motion.g
                        key="hexagram-frame"
                        initial={{ opacity: 0, scale: 0.8, rotate: -30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.2, rotate: 30 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        {/* Dimensão Dinâmica do Hexagrama */}
                        <motion.g
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: '50px 50px' }}
                        >
                          {/* Estrutura de Triângulos Entrelaçados */}
                          <path 
                            d="M50 8 L87 72 L13 72 Z" 
                            fill="none" stroke="var(--pedra-color)" strokeWidth="2" strokeOpacity="0.8" 
                            strokeLinejoin="round"
                          />
                          <path 
                            d="M50 92 L13 28 L87 28 Z" 
                            fill="none" stroke="var(--pedra-color)" strokeWidth="2" strokeOpacity="0.8"
                            strokeLinejoin="round"
                          />
                          
                          {/* Borda Externa de Contenção (Círculo Sutil) */}
                          <circle cx="50" cy="50" r="46" fill="none" stroke="var(--pedra-color)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 4" />
                        </motion.g>

                        {/* Central Vortex (Vórtice Espiral de Fumaça e Luz) */}
                        <motion.g style={{ filter: 'blur(1.5px)' }}>
                          {[...Array(4)].map((_, i) => (
                            <motion.path
                              key={`vortex-layer-${i}`}
                              d="M50 50 C 60 30, 80 50, 50 70 C 20 50, 40 30, 50 50"
                              fill="none"
                              stroke="var(--pedra-internal)"
                              strokeWidth={0.8 + i*0.4}
                              strokeOpacity={0.4 - i*0.08}
                              animate={{ 
                                rotate: i % 2 === 0 ? [0, 360] : [360, 0],
                                scale: [0.8 + i*0.1, 1.3 + i*0.15, 0.8 + i*0.1],
                                opacity: [0.3, 0.6, 0.3]
                              }}
                              transition={{ 
                                duration: 3 + i, 
                                repeat: Infinity, 
                                ease: "easeInOut" 
                              }}
                              style={{ transformOrigin: '50px 50px' }}
                            />
                          ))}
                        </motion.g>

                        {/* Feixes de Luz Radiantes (Beams) */}
                        <g filter="url(#centerPulse)" opacity="0.6">
                          {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <motion.line
                              key={`light-beam-${i}`}
                              x1="50" y1="50" x2="50" y2="5"
                              stroke="white"
                              strokeWidth="0.4"
                              transform={`rotate(${angle} 50 50)`}
                              animate={{ 
                                opacity: [0, 1, 0],
                                scaleY: [0.3, 1, 0.3],
                                strokeWidth: [0.2, 0.8, 0.2]
                              }}
                              transition={{ 
                                duration: 2.5, 
                                repeat: Infinity, 
                                delay: i * 0.4,
                                ease: "linear"
                              }}
                              style={{ transformOrigin: '50px 50px' }}
                            />
                          ))}
                        </g>

                        {/* Luminescência Central Explosiva */}
                        <motion.circle
                          cx="50" cy="50" r="6"
                          fill="white"
                          filter="blur(8px)"
                          animate={{ 
                            scale: [1, 2, 1],
                            opacity: [0.4, 0.9, 0.4]
                          }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <motion.circle
                          cx="50" cy="50" r="2"
                          fill="white"
                          animate={{ scale: [1, 1.4, 1] }}
                          transition={{ duration: 0.4, repeat: Infinity }}
                        />

                        {/* Veias de Conexão com o Hexagrama */}
                        <g className={styles.pedraVeinGroup} filter="url(#veinGlow)">
                           {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                             <path 
                                key={`vein-hex-${i}`}
                                d="M50 50 L50 20" 
                                transform={`rotate(${angle} 50 50)`}
                                className={styles.pedraVeinPath} 
                                stroke="var(--pedra-internal)" 
                                strokeDasharray="1 3"
                                strokeOpacity="0.4"
                             />
                           ))}
                        </g>

                        {/* Anéis de Contenção Estáticos */}
                        <circle cx="50" cy="50" r="48" fill="none" stroke="var(--pedra-color)" strokeWidth="0.3" strokeOpacity="0.15" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="var(--pedra-color)" strokeWidth="0.1" strokeOpacity="0.1" />
                      </motion.g>
                    ) : stoneFrameToRender === 'pentagram' ? (
                      <motion.g
                        key="pentagram-frame"
                        initial={{ opacity: 0, scale: 0.8, rotate: 30 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.2, rotate: -30 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                      >
                        {/* Pentagrama com Rotação Inversa ao Hexagrama */}
                        <motion.g
                          animate={{ rotate: [360, 0] }}
                          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
                          style={{ transformOrigin: '50px 50px' }}
                        >
                          {/* Estrutura do Pentagrama (Estrela Ritual de 5 pontas) */}
                          <path 
                            d="M 50 8 L 74.7 84 L 10.1 37 L 89.9 37 L 25.3 84 Z" 
                            fill="none" 
                            stroke="var(--pedra-color)" 
                            strokeWidth="1.8" 
                            strokeOpacity="0.8"
                            strokeLinejoin="round"
                          />
                          
                          {/* Círculo Ritualístico Externo */}
                          <circle cx="50" cy="50" r="44" fill="none" stroke="var(--pedra-color)" strokeWidth="0.7" strokeOpacity="0.3" strokeDasharray="3 6" />
                        </motion.g>

                        {/* Vórtice Inverso (Sentido Oposto) */}
                        <motion.g filter="url(#centerPulse)">
                          {[...Array(3)].map((_, i) => (
                            <motion.circle
                              key={`vortex-pent-${i}`}
                              cx="50" cy="50" r={5 + i*8}
                              fill="none"
                              stroke="var(--pedra-internal)"
                              strokeWidth="0.5"
                              strokeOpacity={0.4 - i*0.1}
                              strokeDasharray={`${20 + i*10} ${10 + i*5}`}
                              animate={{ 
                                rotate: [360, 0],
                                scale: [1, 1.15, 1]
                              }}
                              transition={{ 
                                duration: 5 + i*2, 
                                repeat: Infinity, 
                                ease: "linear" 
                              }}
                              style={{ transformOrigin: '50px 50px' }}
                            />
                          ))}
                        </motion.g>

                        {/* 5 Feixes de Luz (Pentagrama) */}
                        <g opacity="0.5">
                          {[0, 72, 144, 216, 288].map((angle, i) => (
                            <motion.line
                              key={`pent-beam-${i}`}
                              x1="50" y1="50" x2="50" y2="10"
                              stroke="var(--pedra-color)"
                              strokeWidth="0.6"
                              transform={`rotate(${angle} 50 50)`}
                              animate={{ 
                                opacity: [0.1, 0.8, 0.1],
                                scaleY: [0.5, 1.2, 0.5]
                              }}
                              transition={{ 
                                duration: 4, 
                                repeat: Infinity, 
                                delay: i * 0.8,
                                ease: "easeInOut"
                              }}
                              style={{ transformOrigin: '50px 50px' }}
                            />
                          ))}
                        </g>

                        {/* Núcleo de Foco */}
                        <motion.circle
                          cx="50" cy="50" r="4"
                          fill="var(--pedra-color)"
                          filter="blur(5px)"
                          animate={{ opacity: [0.3, 0.7, 0.3] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                      </motion.g>
                    ) : stoneFrameToRender === 'shield' ? (
                      <motion.g
                        key="shield-frame"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Upscaled Soccer Team Style Shield (Crest) */}
                        <path
                          d="M10 8 L90 8 L90 60 C 90 88 50 98 50 98 C 50 98 10 88 10 60 Z"
                          fill="none"
                          stroke="var(--pedra-color)"
                          strokeWidth="2.5"
                          strokeOpacity="0.75"
                        />
                        <path
                          d="M8 6 L92 6 L92 62 C 92 92 50 100 50 100 C 50 100 8 92 8 62 Z"
                          fill="none"
                          stroke="var(--pedra-color)"
                          strokeWidth="0.8"
                          strokeOpacity="0.3"
                        />

                        {/* Veias orgânicas dinâmicas (Ancoradas no Escudo) */}
                        <g className={styles.pedraVeinGroup} filter="url(#veinGlow)">
                          <path d="M50 50 Q30 30 10 8" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="3 3" />
                          <path d="M50 50 Q70 30 90 8" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="3 3" />
                          <path d="M50 50 L50 98" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="3 3" />
                          
                          <g opacity="0.3" strokeWidth="0.5" stroke="#fff">
                            <path d="M50 50 L10 8" />
                            <path d="M50 50 L90 8" />
                            <path d="M50 50 L50 98" />
                          </g>
                        </g>
                      </motion.g>
                    ) : stoneFrameToRender === 'manifestation' || stoneFrameToRender === 'fusion_manifestation' ? (
                      null
                    ) : (
                      <motion.g
                        key="circle-frame"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                      >
                        <circle cx="50" cy="50" r="45" fill="none" stroke="var(--pedra-color)" strokeWidth="2" strokeOpacity="0.6" className={styles.pedraBorderCircle} />
                        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--pedra-color)" strokeWidth="0.5" strokeOpacity="0.2" />
                        <circle cx="50" cy="50" r="43" fill="none" stroke="var(--pedra-color)" strokeWidth="0.5" strokeOpacity="0.3" />
                        
                        {/* Veias orgânicas dinâmicas (Ancoradas no Círculo) */}
                        <g className={styles.pedraVeinGroup} filter="url(#veinGlow)">
                          <path d="M50 50 Q30 30 18.2 18.2" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 Q70 30 81.8 18.2" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 Q70 70 81.8 81.8" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          <path d="M50 50 Q30 70 18.2 81.2" className={styles.pedraVeinPath} stroke="var(--pedra-internal)" strokeDasharray="2 2" />
                          
                          <g opacity="0.3" strokeWidth="0.4" stroke="#fff">
                            <path d="M50 50 L18.2 18.2" />
                            <path d="M50 50 L81.8 18.2" />
                            <path d="M50 50 L81.8 81.8" />
                            <path d="M50 50 L18.2 81.2" />
                          </g>
                        </g>
                      </motion.g>
                    )}
                  </AnimatePresence>

                  {/* Efeito de Arco Elétrico (Neon Shock) */}
                  <motion.path
                    d="M50 5 L55 15 L45 25 L50 35 L55 45 L45 55 L50 65 L55 75 L45 85 L50 95"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    fill="none"
                    filter="url(#centerPulse)"
                    animate={{
                      opacity: [0, 1, 0, 0.8, 0],
                      scale: [0.95, 1.05],
                      rotate: [0, 90, 180, 270, 360]
                    }}
                    transition={{
                      opacity: { duration: 0.2, repeat: Infinity, repeatDelay: Math.random() * 2 },
                      rotate: { duration: 10, repeat: Infinity, ease: "linear" },
                      scale: { duration: 0.1, repeat: Infinity }
                    }}
                    style={{ transformOrigin: 'center' }}
                  />
                  {/* Símbolos Arcanos bem pequenos por volta da pedra (ainda dentro da borda) */}
                  <g fontSize="3" fill="currentColor" fillOpacity="0.5" style={{ fontFamily: 'monospace' }} className={styles.arcaneRunes}>
                    <text x="50" y="12" textAnchor="middle">ᚩ</text>
                    <text x="88" y="50" dominantBaseline="middle">ᛒ</text>
                    <text x="50" y="92" textAnchor="middle">ᛗ</text>
                    <text x="12" y="50" textAnchor="end" dominantBaseline="middle">ᛚ</text>
                    <text x="75" y="25">ᛖ</text>
                    <text x="25" y="25">ᚺ</text>
                    <text x="75" y="75">ᚲ</text>
                    <text x="25" y="75">ᚢ</text>
                  </g>

                    {/* Grandes Dígitos Binários / Elementos Flamejantes (Ciclo de 28s com Ignição) */}
                    {/* Grandes Dígitos Binários / Elementos Flamejantes (Ciclo de 28s com Ignição) */}
                    <g fontSize="14" fontWeight="900" fill="currentColor" fillOpacity="0.45" style={{ fontFamily: 'monospace' }}>
                      {[
                        { borderX: 50, borderY: -5, color: '#2ecc71', original: '0', label: 'TERRA' },
                        { borderX: 50, borderY: 110, color: '#e0ffff', original: '1', label: 'AR' },
                        { borderX: -10, borderY: 50, color: '#1e90ff', original: '0', label: 'AGUA' },
                        { borderX: 110, borderY: 50, color: '#ff4500', original: '1', label: 'FOGO' },
                      ].map((el, i) => {
                        const isManifestationFrame = profile.stone_frame_type === 'manifestation';
                        const isFusionFrame = profile.stone_frame_type === 'fusion_manifestation';
                        const isAtBorder = isManifestationFrame || ((isFusionFrame || ritualStep === 0 || ritualStep === 2) && (ritualStep === 0 || ritualStep === 2));
                        const isElements = !isManifestationFrame && !isFusionFrame && ritualStep === 2;
                        const isNumbers = isManifestationFrame || (isFusionFrame && (ritualStep === 0 || ritualStep === 2)) || ritualStep === 0;
                        const isIgnition = isManifestationFrame || isFusionFrame || ritualStep === 1 || ritualStep === 3;

                        return (
                          <motion.g
                            key={`element-${i}`}
                            animate={{ 
                               x: isAtBorder ? el.borderX : 50, 
                               y: isAtBorder ? el.borderY : 50,
                               scale: isAtBorder ? 1.1 : 0.98
                            }}
                            transition={{ duration: 1.5, ease: "easeInOut" }}
                          >
                            {/* Layer 1: O Número */}
                            <motion.text
                              textAnchor="middle"
                              dominantBaseline="middle"
                              animate={{ 
                                opacity: isNumbers ? 0.8 : 0,
                                scale: isNumbers ? 1 : 0.4,
                                filter: isNumbers ? 'none' : 'blur(8px)'
                              }}
                              transition={{ duration: 0.8 }}
                            >
                              {el.original}
                            </motion.text>

                            {/* Layer 2: O Cristal / Chama Negra (Transição de Estado) */}
                            <AnimatePresence mode="wait">
                              {isElements ? (
                                <motion.g
                                  key="crystal-state"
                                  initial={{ opacity: 0, scale: 0.2, filter: 'blur(15px)', rotate: -15 }}
                                  animate={{ opacity: 1, scale: 0.45, filter: 'blur(0px)', rotate: 0 }}
                                  exit={{ opacity: 0, scale: 0.2, filter: 'blur(10px)' }}
                                  transition={{ 
                                    duration: 1.5, 
                                    ease: [0.16, 1, 0.3, 1],
                                    opacity: { duration: 1.2 }
                                  }}
                                >
                                  {/* Corpo Principal do Cristal */}
                                  <motion.path
                                    d="M-14 0 L-6 -18 L0 -24 L6 -18 L14 0 L6 18 L0 24 L-6 18 Z"
                                    fill={el.color}
                                    fillOpacity={0.4}
                                    stroke="white"
                                    strokeWidth="0.5"
                                    strokeOpacity="0.25"
                                    animate={{ scale: [1, 1.08, 1] }}
                                    transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                                  />
                                  
                                  {/* Facetas Internas */}
                                  <g stroke="white" strokeWidth="0.2" strokeOpacity="0.3" fill="none">
                                    <path d="M-14 0 L14 0" />
                                    <path d="M0 -24 L0 24" />
                                    <path d="M-6 -18 L6 -18 L6 18 L-6 18 Z" />
                                    <path d="M-14 0 L-6 -18 M14 0 L6 -18 M14 0 L6 18 M-14 0 L-6 18" />
                                  </g>

                                    {/* Brilho Interno (Core) - Ritual de Pulso 0s-3.5s -> Brilho 3.5s-7s */}
                                    <motion.ellipse
                                      cx="0" cy="0" rx="6" ry="10"
                                      fill={el.color}
                                      animate={{ 
                                        opacity: [0.2, 0.3, 1, 0.8], // Começa baixo, estoura em 3.5s
                                        scale: [0.8, 0.9, 1.4, 1.2],
                                        filter: [
                                          'blur(8px) brightness(0.6)', 
                                          'blur(8px) brightness(0.6)', 
                                          'blur(12px) brightness(2.5) drop-shadow(0 0 15px ' + el.color + ')', 
                                          'blur(12px) brightness(2.5) drop-shadow(0 0 15px ' + el.color + ')'
                                        ]
                                      }}
                                      transition={{ 
                                        duration: 7, 
                                        times: [0, 0.5, 0.51, 1]
                                      }}
                                    />
                                </motion.g>
                              ) : isIgnition ? (
                                <motion.g
                                  key="ignition-state"
                                  initial={{ opacity: 0, scale: 0.4 }}
                                  animate={{ opacity: 1, scale: 0.6 }}
                                  exit={{ opacity: 0, scale: 0.4 }}
                                  transition={{ duration: 0.6 }}
                                >
                                  {/* Chama Negra (Sombra Elemental / Crystal Negro) - Mais curta e bem preta */}
                                  <motion.path
                                    d="M0 4 Q-10 -10 0 -22 Q10 -10 0 4"
                                    fill={(isFusionFrame && isAtBorder) ? el.color : "#000000"}
                                    fillOpacity="1"
                                    stroke={(isFusionFrame && isAtBorder) ? "white" : "#000000"}
                                    strokeWidth="0.5"
                                    animate={{ 
                                      d: [
                                        "M0 4 Q-10 -10 0 -22 Q10 -10 0 4",
                                        "M0 4 Q-12 -12 0 -26 Q12 -12 0 4",
                                        "M0 4 Q-10 -10 0 -22 Q10 -10 0 4"
                                      ]
                                    }}
                                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                                  />

                                  {/* Luz Branca por dentro do Crystal Negro */}
                                  <motion.ellipse
                                    cx="0" cy="-20" rx="4" ry="12"
                                    fill="white"
                                    style={{ filter: 'blur(8px)' }}
                                    animate={{ 
                                      opacity: [0.2, 0.8, 0.2],
                                      scale: [0.8, 1.1, 0.8]
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                  />

                                  {/* Fumaça Neon Branca (Topo da Chama) */}
                                  <g filter="blur(2.5px)">
                                    {[0, 1, 2].map((s) => (
                                      <motion.path
                                        key={`smoke-${i}-${s}`}
                                        d="M0 -42 Q-3 -50 0 -58 Q3 -50 0 -42"
                                        fill="none"
                                        stroke={(isFusionFrame && isAtBorder) ? el.color : "white"}
                                        strokeWidth="1.2"
                                        strokeOpacity="0.35"
                                        animate={{ 
                                          y: [-1, -12],
                                          x: [0, (s - 1) * 4, 0],
                                          opacity: [0, 0.7, 0],
                                          scale: [1, 1.4, 1.1]
                                        }}
                                        transition={{ 
                                          duration: 2 + s * 0.4, 
                                          repeat: Infinity, 
                                          delay: s * 0.3 + i * 0.1,
                                          ease: "easeOut" 
                                        }}
                                      />
                                    ))}
                                  </g>
                                  
                                  {/* Brilho Branco no Ápice */}
                                  <motion.circle
                                    cx="0" cy="-45" r="1.5"
                                    fill="#fff"
                                    animate={{ opacity: [0.5, 1, 0.5], scale: [0.8, 1.2, 0.8] }}
                                    transition={{ duration: 0.5, repeat: Infinity }}
                                    style={{ filter: 'blur(1px)' }}
                                  />
                                </motion.g>
                              ) : null}
                            </AnimatePresence>

                            {/* Layer 3: Brilho de Sobreposição (Overlay Sparkles) - Deslocado (L:0.9%vw, U:0.3%vw) */}
                            <g style={{ filter: 'blur(0.5px)' }} transform="translate(-5, -2)">
                              {[0, 1, 2, 3].map((p) => (
                                <motion.g
                                  key={`glimmer-top-${i}-${p}`}
                                  animate={{ rotate: [0, 360] }}
                                  transition={{ 
                                    duration: 1.5 + p, 
                                    repeat: Infinity, 
                                    ease: "linear",
                                    delay: -p * 0.4 
                                  }}
                                  style={{ originX: "0px", originY: "0px" }}
                                >
                                  <motion.circle
                                    r={0.4 + (p * 0.1)}
                                    animate={{ 
                                      cx: [1 + p*2, 5 + p*2, 1 + p*2],
                                      cy: [p, -p, p],
                                      opacity: [0.5, 1, 0.5], 
                                      scale: [0.8, 1.3, 0.8] 
                                    }}
                                    fill="white"
                                    transition={{ 
                                      duration: 1 + p, 
                                      repeat: Infinity,
                                      ease: "easeInOut" 
                                    }}
                                  />
                                  {p % 2 === 0 && (
                                    <motion.rect
                                      width="0.5"
                                      height="4"
                                      rx="0.25"
                                      fill="white"
                                      fillOpacity="0.8"
                                      animate={{ 
                                        x: [2 + p, 4 + p, 2 + p],
                                        y: [-2, 2, -2],
                                        opacity: [0.4, 0.9, 0.4]
                                      }}
                                      transition={{ 
                                        duration: 0.6 + (p * 0.1), 
                                        repeat: Infinity
                                      }}
                                    />
                                  )}
                                </motion.g>
                              ))}
                            </g>
                          </motion.g>
                        );
                      })}
                    </g>

                </svg>
              </motion.div>
            )}

            {profile.selected_varinha && profile.selected_varinha > 0 && (
              <motion.div
                className={styles.wandPower}
                initial={{ opacity: 1 }}
                animate={{
                  y: [0, -8, 0],
                  rotate: [0, 5, 0],
                  opacity: [1, 0.8, 1, 0.9, 1], // Sempre piscando (shimmer)
                  filter: [
                    'brightness(1.2) drop-shadow(0 0 10px var(--hat-color))',
                    'brightness(1) drop-shadow(0 0 5px var(--hat-color))',
                    'brightness(1.8) drop-shadow(0 0 25px var(--hat-color))',
                    'brightness(1.2) drop-shadow(0 0 10px var(--hat-color))',
                    'brightness(1.8) drop-shadow(0 0 25px var(--hat-color))'
                  ]
                }}
                style={{
                  '--hat-color': profile.hat_color || profile.nexo_color || '#00f3ff'
                } as any}
                transition={{
                  y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  rotate: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                  opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                  filter: {
                    duration: 7,
                    repeat: Infinity,
                    times: [0, 0.4, 0.5, 0.7, 1]
                  }
                }}
              >
                {profile.wand_type === 'lightsaber' ? (
                  <svg viewBox="0 0 100 240" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 10px var(--hat-color))', transform: 'rotate(35deg)', transformOrigin: 'center', overflow: 'visible' }}>
                    <defs>
                      <linearGradient id="hiltGrad" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#222" />
                        <stop offset="50%" stopColor="#fff" />
                        <stop offset="100%" stopColor="#000" />
                      </linearGradient>
                    </defs>
                    {/* Hilt - Black & White Meta */}
                    <rect x="42" y="160" width="16" height="60" rx="2" fill="url(#hiltGrad)" />
                    <rect x="40" y="170" width="20" height="4" fill="#000" />
                    <rect x="40" y="190" width="20" height="4" fill="#000" />
                    <rect x="40" y="210" width="20" height="4" fill="#000" />
                    <circle cx="50" cy="165" r="4" fill="#555" />

                    {/* Laser Blade (Linear) */}
                    <motion.rect
                      x="46" y="20" width="8" height="140" rx="4"
                      fill="#fff"
                      initial={{ scaleY: 0, originY: 1 }}
                      animate={{ scaleY: [0.98, 1.02, 0.98], opacity: [0.8, 1, 0.8] }}
                      transition={{ duration: 0.1, repeat: Infinity }}
                    />
                    <motion.rect
                      x="44" y="15" width="12" height="150" rx="6"
                      fill="var(--hat-color)"
                      fillOpacity="0.4"
                      animate={{ opacity: [0.3, 0.6, 0.3] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </svg>
                ) : profile.wand_type === 'darksaber_glitch' ? (
                  <svg viewBox="0 0 100 240" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 15px #fff)', transform: 'rotate(35deg)', transformOrigin: 'center', overflow: 'visible' }}>
                    <defs>
                      <filter id="darksaberGlow">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <filter id="plasmaNoise">
                        <feTurbulence type="fractalNoise" baseFrequency="0.1" numOctaves="3" seed="1">
                           <animate attributeName="seed" values="1;100;1" dur="1s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feDisplacementMap in="SourceGraphic" scale="5" />
                      </filter>
                    </defs>

                    {/* Hilt - Heavy Industrial Black (High Detail) */}
                    <rect x="42" y="160" width="16" height="55" rx="1" fill="#000" />
                    <rect x="40" y="170" width="20" height="12" fill="#050505" stroke="#222" strokeWidth="0.5" />
                    <rect x="44" y="172" width="12" height="1" fill="#ff0000" opacity="0.6" />
                    <rect x="44" y="200" width="12" height="6" fill="#111" rx="1" />
                    <circle cx="50" cy="166" r="2" fill="#fff" opacity="0.9" filter="url(#darksaberGlow)" />

                    {/* Dark Blade Body - Pure Black Core */}
                    <motion.path
                      d="M44 160 L44 30 L50 20 L56 30 L56 160 Z"
                      fill="#000"
                      animate={{
                        skewX: [0, 0.5, -0.5, 0],
                        opacity: [1, 0.98, 1]
                      }}
                      transition={{ duration: 0.05, repeat: Infinity }}
                    />

                    {/* High-Fidelity Energy Trailing (Black Smoke/Plasma) */}
                    {[...Array(6)].map((_, i) => (
                      <motion.path
                        key={`black-plasma-${i}`}
                        d="M44 160 L44 30 L50 20 L56 30 L56 160 Z"
                        fill="#000"
                        fillOpacity="0.1"
                        style={{ filter: "url(#plasmaNoise) blur(4px)" }}
                        animate={{
                          translateX: [0, (i - 2.5) * 4, 0],
                          translateY: [0, -10, 0],
                          scale: [1, 1.1, 1],
                          opacity: [0.1, 0.3, 0.1]
                        }}
                        transition={{ duration: 0.8 + i*0.1, repeat: Infinity, ease: "easeInOut" }}
                      />
                    ))}

                    {/* White Neon Glitch Outline - Ultra High Frequency */}
                    <motion.path
                      d="M43 160 L43 28 L50 18 L57 28 L57 160"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      animate={{
                        opacity: [1, 0.2, 1, 0.7, 1, 0, 1],
                        pathLength: [1, 0.98, 1.02, 1],
                        translateX: [0, 2, -2, 3, -3, 0],
                        skewX: [0, 1, -1, 2, -2, 0]
                      }}
                      transition={{ duration: 0.08, repeat: Infinity, times: [0, 0.1, 0.2, 0.3, 0.4, 0.6, 1] }}
                    />

                    {/* Internal Glitch Filaments (Energy Core) */}
                    {[...Array(12)].map((_, i) => (
                      <motion.line
                        key={`core-glitch-${i}`}
                        x1="50" y1={30 + i * 10}
                        x2={50 + (i % 2 === 0 ? 5 : -5)} y2={30 + i * 10}
                        stroke="#fff"
                        strokeWidth="0.5"
                        strokeOpacity="0.4"
                        animate={{
                          x2: [50, 50 + (i % 2 === 0 ? 8 : -8), 50],
                          opacity: [0, 0.8, 0],
                          strokeWidth: [0.5, 1.5, 0.5]
                        }}
                        transition={{ duration: 0.1 + i * 0.02, repeat: Infinity, delay: i * 0.05 }}
                      />
                    ))}

                    {/* High-Performance Glitch Particles (Floating Blocks) */}
                    {[...Array(15)].map((_, i) => (
                      <motion.rect
                        key={`particle-glitch-${i}`}
                        width={2 + (i % 3) * 2}
                        height={1 + (i % 2) * 1}
                        fill="#fff"
                        initial={{ x: 50, y: 160 }}
                        animate={{
                          x: [50, 50 + (i % 4 - 2) * 10],
                          y: [160, 20 + (i * 8)],
                          opacity: [0, 1, 0],
                          scaleX: [1, 2, 1]
                        }}
                        transition={{ duration: 0.4 + (i % 5) * 0.1, repeat: Infinity, delay: i * 0.1 }}
                      />
                    ))}

                    {/* Blade Edge Sparkles (High Density) */}
                    {[...Array(8)].map((_, i) => (
                      <motion.circle
                        key={`sparkle-${i}`}
                        r="0.8"
                        fill="#fff"
                        animate={{
                          cx: [43, 57, 43],
                          cy: [160 - i * 20, 140 - i * 20, 160 - i * 20],
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.5, 0.5]
                        }}
                        transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </svg>
                ) : profile.wand_type === 'tech_saber' ? (
                  <svg viewBox="0 0 100 240" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 12px var(--hat-color))', transform: 'rotate(35deg)', transformOrigin: 'center', overflow: 'visible' }}>
                    {/* Tech Hilt - Matte Black & Industrial */}
                    <rect x="40" y="155" width="20" height="70" rx="1" fill="#111" />
                    <rect x="38" y="165" width="24" height="6" fill="#000" />
                    <rect x="38" y="180" width="24" height="2" fill="#333" />
                    <rect x="38" y="185" width="24" height="2" fill="#333" />
                    <rect x="38" y="190" width="24" height="2" fill="#333" />
                    <rect x="38" y="210" width="24" height="8" fill="#1a1a1a" />

                    {/* Power Indicator (Red LED) */}
                    <motion.circle
                      cx="50" cy="172" r="1.5" fill="#ff0000"
                      animate={{ opacity: [0.4, 1, 0.4] }}
                      transition={{ duration: 0.8, repeat: Infinity }}
                    />

                    {/* Unstable Laser Blade - BLACK LASER MODE */}
                    <motion.path
                      d="M46 155 L46 20 Q50 15 54 20 L54 155 Z"
                      fill="#000"
                      animate={{
                        opacity: [0.9, 1, 0.9],
                        scaleX: [0.95, 1.05, 0.95]
                      }}
                      transition={{ duration: 0.05, repeat: Infinity }}
                    />
                    <motion.path
                      d="M44 155 L44 15 Q50 8 56 15 L56 155 Z"
                      fill="var(--hat-color)"
                      fillOpacity="0.35"
                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  </svg>
                ) : profile.wand_type === 'kinetic_staff' ? (
                  <svg viewBox="0 0 100 240" style={{ width: '100%', height: '100%', transform: 'rotate(35deg)', transformOrigin: 'center' }}>
                    {/* Main Staff Body - Animating height/y to avoid rx distortion */}
                    <motion.rect
                      x="46" width="8" rx="4" fill="#222" stroke="currentColor" strokeWidth="1"
                      animate={{
                        height: [160, 320, 160],
                        y: [20, -60, 20]
                      }}
                      transition={{ duration: 7, times: [0, 0.1, 1], repeat: Infinity, ease: "anticipate" }}
                    />

                    {/* Moving Industrial Rings */}
                    <motion.rect
                      x="44" width="12" height="2" fill="currentColor"
                      animate={{ y: [50, 0, 50] }}
                      transition={{ duration: 7, times: [0, 0.1, 1], repeat: Infinity, ease: "anticipate" }}
                    />
                    <motion.rect
                      x="44" width="12" height="2" fill="currentColor"
                      animate={{ y: [150, 200, 150] }}
                      transition={{ duration: 7, times: [0, 0.1, 1], repeat: Infinity, ease: "anticipate" }}
                    />

                    {/* Core Glowing Vein */}
                    <motion.line
                      x1="50" x2="50" stroke="var(--hat-color)" strokeWidth="0.5" strokeOpacity="0.6" strokeDasharray="2 2"
                      animate={{
                        y1: [30, -40, 30],
                        y2: [170, 240, 170]
                      }}
                      transition={{ duration: 7, times: [0, 0.1, 1], repeat: Infinity, ease: "anticipate" }}
                    />
                  </svg>
                ) : profile.wand_type === 'light_sword' ? (
                  <svg viewBox="0 0 100 240" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 15px var(--hat-color))', transform: 'rotate(35deg)', transformOrigin: 'center', overflow: 'visible' }}>
                    {/* Sword Hilt - Black Industrial with Crossguard */}
                    <rect x="44" y="200" width="12" height="30" rx="1" fill="#000" stroke="#111" />
                    <rect x="30" y="190" width="40" height="10" rx="2" fill="#111" />
                    <circle cx="50" cy="195" r="3" fill="var(--hat-color)" fillOpacity="0.8" />

                    {/* Wide Sword Blade (Light) */}
                    <motion.path
                      d="M38 190 L38 40 L50 20 L62 40 L62 190 Z"
                      fill="#fff"
                      animate={{ opacity: [0.85, 1, 0.85] }}
                      transition={{ duration: 0.1, repeat: Infinity }}
                    />
                    <motion.path
                      d="M35 190 L35 35 L50 12 L65 35 L65 190 Z"
                      fill="var(--hat-color)"
                      fillOpacity="0.3"
                      animate={{ opacity: [0.2, 0.5, 0.2], scaleX: [1, 1.05, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                  </svg>
                ) : profile.wand_type === 'slim_sword' ? (
                  <svg viewBox="0 0 100 240" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 12px var(--hat-color))', transform: 'rotate(35deg)', transformOrigin: 'center', overflow: 'visible' }}>
                    {/* Slim Hilt - Minimalist Black */}
                    <rect x="47" y="210" width="6" height="25" rx="1" fill="#000" />
                    <rect x="42" y="205" width="16" height="5" rx="2" fill="#111" />

                    {/* Long Slim Blade (Light) */}
                    <motion.path
                      d="M48 205 L48 15 L50 5 L52 15 L52 205 Z"
                      fill="#fff"
                      animate={{ opacity: [0.9, 1, 0.9] }}
                      transition={{ duration: 0.08, repeat: Infinity }}
                    />
                    <motion.path
                      d="M47 205 L47 12 L50 2 L53 12 L53 205 Z"
                      fill="var(--hat-color)"
                      fillOpacity="0.4"
                      animate={{ opacity: [0.3, 0.6, 0.3], scaleX: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                    />
                  </svg>
                ) : profile.wand_type === 'neon_flame' ? (
                  <svg viewBox="0 0 100 240" style={{ width: '100%', height: '100%' }}>
                    <defs>
                      <radialGradient id="flameGrad" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                        <stop offset="60%" stopColor="#fff" stopOpacity="0.9" />
                        <stop offset="100%" stopColor="var(--hat-color)" stopOpacity="0" />
                      </radialGradient>
                      <linearGradient id="smokeGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor="var(--hat-color)" stopOpacity="0" />
                        <stop offset="30%" stopColor="var(--hat-color)" stopOpacity="0.1" />
                        <stop offset="70%" stopColor="#555" stopOpacity="0.15" />
                        <stop offset="100%" stopColor="#333" stopOpacity="0" />
                      </linearGradient>
                      <filter id="neonBlur" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                      <filter id="heatDistort" x="-50%" y="-50%" width="200%" height="200%">
                        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="5">
                          <animate attributeName="baseFrequency" values="0.04;0.06;0.04" dur="2s" repeatCount="indefinite" />
                        </feTurbulence>
                        <feDisplacementMap in="SourceGraphic" scale="15" />
                      </filter>
                    </defs>

                    {/* Heat Distortion Wave Around Flame */}
                    <motion.circle
                      cx="55" cy="140" r="45"
                      fill="none"
                      stroke="var(--hat-color)"
                      strokeWidth="2"
                      strokeOpacity="0.05"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.05, 0.1, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      style={{ filter: 'blur(10px)' }}
                    />

                    {/* BASE RADIANCE AURA - Contouring the bottom */}
                    <motion.circle
                      cx="55" cy="155" r="35"
                      fill="var(--hat-color)"
                      fillOpacity="0.08"
                      animate={{ scale: [1, 1.3, 1], opacity: [0.05, 0.1, 0.05] }}
                      transition={{ duration: 7, repeat: Infinity }}
                      style={{ filter: 'blur(15px)' }}
                    />

                    {/* Plasma Glow - Integrated into base contouring */}
                    <motion.circle
                      cx="55" cy="150" r="55"
                      fill="var(--hat-color)"
                      fillOpacity="0.03"
                      animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.02, 0.05, 0.02] }}
                      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      style={{ filter: 'blur(30px)' }}
                    />

                    <motion.g transform="translate(55, 150)" filter="url(#neonBlur)">
                      {/* NEBULAR SMOKE BODY - Contouring the base */}
                      <motion.path
                        role="nebular-smoke"
                        fill="url(#smokeGrad)"
                        animate={{
                          d: [
                            "M-30 5 Q-35 -70 0 -160 Q35 -70 30 5 Z",
                            "M-25 5 Q-20 -85 5 -180 Q20 -85 25 5 Z",
                            "M-30 5 Q-35 -60 -5 -160 Q35 -60 30 5 Z"
                          ],
                          opacity: [0.12, 0.3, 0.12],
                          scaleX: [1, 1.1, 1]
                        }}
                        transition={{
                          duration: 7,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        style={{ filter: 'url(#heatDistort)' }}
                      />

                      {/* Floating SMOKE Particles - Set 1 (Darker) */}
                      {[...Array(4)].map((_, i) => (
                        <motion.path
                          key={`smoke-1-${i}`}
                          d="M-5 0 Q-10 -15 0 -30 Q10 -15 5 0 Z"
                          fill="#333"
                          fillOpacity="0.15"
                          initial={{ x: 0, y: -40, opacity: 0, scale: 0.5 }}
                          animate={{
                            x: [(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 80],
                            y: [-60, -180],
                            opacity: [0, 0.25, 0],
                            scale: [0.5, 3]
                          }}
                          transition={{ duration: 8, repeat: Infinity, delay: i * 2 }}
                          style={{ filter: 'blur(10px)' }}
                        />
                      ))}

                      {/* Floating SMOKE Particles - Set 2 (Lighter / Symbiotic) */}
                      {[...Array(3)].map((_, i) => (
                        <motion.path
                          key={`smoke-2-${i}`}
                          d="M-6 0 Q-12 -20 0 -40 Q12 -20 6 0 Z"
                          fill="var(--hat-color)"
                          fillOpacity="0.08"
                          initial={{ x: 0, y: -50, opacity: 0, scale: 0.8 }}
                          animate={{
                            x: [(Math.random() - 0.5) * 40, (Math.random() - 0.5) * 100],
                            y: [-80, -220],
                            opacity: [0, 0.15, 0],
                            scale: [0.8, 4],
                            rotate: [0, -45]
                          }}
                          transition={{ duration: 10, repeat: Infinity, delay: i * 3.5 }}
                          style={{ filter: 'blur(15px)' }}
                        />
                      ))}

                      {/* Floating Embers / Fire Particles */}
                      {[...Array(8)].map((_, i) => (
                        <motion.path
                          key={i}
                          d="M-1 -1 L1 0 L0 1 L-1 0 Z"
                          fill="var(--hat-color)"
                          initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                          animate={{
                            x: [(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 40],
                            y: [0, -130],
                            opacity: [0, 0.8, 1, 0],
                            scale: [0, 1.2, 0.4, 0],
                            rotate: [0, 360]
                          }}
                          transition={{
                            duration: 5 + Math.random() * 4,
                            repeat: Infinity,
                            delay: i * 0.8,
                            ease: "linear"
                          }}
                        />
                      ))}

                      {/* UNIFIED SYMBIOTIC FLAME CORE - 7s Pulse Cycle */}
                      <motion.g
                        animate={{ y: [0, -3, 0] }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        style={{ filter: 'url(#heatDistort)' }}
                      >
                        {/* Ghost Reflection Layer */}
                        <motion.path
                          role="ghost-reflection"
                          fill="#fff"
                          fillOpacity="0.06"
                          animate={{
                            d: "M-20 0 Q-15 -65 0 -100 Q15 -65 20 0 Z",
                            scaleY: [0.8, 1.15, 0.8],
                            opacity: [0.03, 0.1, 0.03]
                          }}
                          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                        />

                        {/* Main Outer Entity - Unified Form */}
                        <motion.path
                          fill="var(--hat-color)"
                          fillOpacity="0.18"
                          animate={{
                            d: [
                              "M-25 0 Q-25 -75 0 -115 Q25 -75 25 0 Z",
                              "M-22 0 Q-22 -85 0 -125 Q22 -85 22 0 Z",
                              "M-25 0 Q-25 -75 0 -115 Q25 -75 25 0 Z"
                            ],
                            scaleY: [0.75, 1.1, 0.75],
                            scaleX: [0.9, 1.05, 0.9]
                          }}
                          transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />

                        {/* Spectral Symbiote Layer - Unified Form */}
                        <motion.path
                          role="spectral-echo"
                          fill="var(--hat-color)"
                          fillOpacity="0.12"
                          style={{ mixBlendMode: 'screen' }}
                          animate={{
                            d: "M-20 0 Q-20 -70 0 -105 Q20 -70 20 0 Z",
                            scaleY: [0.7, 1.2, 0.7],
                            opacity: [0.1, 0.3, 0.1]
                          }}
                          transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.g>

                      {/* Slower Medium Flame Layer - Unified Pulse */}
                      <motion.path
                        d="M-15 0 Q-15 -50 0 -80 Q15 -50 15 0 Z"
                        fill="var(--hat-color)"
                        fillOpacity="0.22"
                        animate={{
                          scaleX: [0.9, 1.1, 0.9],
                          scaleY: [0.85, 1.05, 0.85]
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      />

                      {/* White Inner Core - Prominent and Unified */}
                      <motion.path
                        d="M-8 0 Q-8 -35 0 -55 Q8 -35 8 0 Z"
                        fill="url(#flameGrad)"
                        animate={{
                          scaleY: [0.9, 1.1, 0.9],
                          opacity: [0.9, 1, 0.9],
                          filter: ['brightness(1)', 'brightness(1.5)', 'brightness(1)']
                        }}
                        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                      />
                    </motion.g>
                  </svg>
                ) : profile.wand_type === 'death_scythe' ? (
                  <svg viewBox="0 0 120 280" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 0 10px var(--hat-color))', transform: 'rotate(25deg)', transformOrigin: 'center', overflow: 'visible' }}>
                    {/* Long Staff - Dark Metal */}
                    <rect x="58" y="20" width="4" height="240" rx="2" fill="#0a0a0a" stroke="#1a1a1a" strokeWidth="0.5" />

                    {/* Scythe Blade - Cybernetic / Neon */}
                    <motion.g transform="translate(60, 40)">
                      {/* Blade Body */}
                      <motion.path
                        d="M0 0 Q-10 0 -40 15 Q-70 40 -80 80 Q-75 55 -40 35 Q-10 25 0 25 Z"
                        fill="#050505"
                        stroke="var(--hat-color)"
                        strokeWidth="1.5"
                        strokeLinejoin="round"
                        animate={{
                          rotate: [-1, 1, -1]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                      />

                      {/* Sharp Edge - Glowing */}
                      <motion.path
                        d="M-80 80 Q-75 55 -40 35 Q-10 25 2 25"
                        fill="none"
                        stroke="#fff"
                        strokeWidth="2"
                        strokeLinecap="round"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 0.1, repeat: Infinity }}
                      />

                      {/* Neon Light at the Tip */}
                      <motion.g transform="translate(-80, 80)">
                        <motion.circle
                          r="6"
                          fill="var(--hat-color)"
                          animate={{ scale: [1, 1.5, 1], opacity: [0.4, 0.8, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.circle
                          r="3"
                          fill="#fff"
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.5, repeat: Infinity }}
                        />
                      </motion.g>

                      {/* Rounded connection to handle */}
                      <circle cx="0" cy="12" r="6" fill="#111" stroke="var(--hat-color)" strokeWidth="1" />
                    </motion.g>

                    {/* Handle details */}
                    <rect x="57" y="240" width="6" height="15" rx="1" fill="#000" />
                    <rect x="57" y="140" width="6" height="10" rx="1" fill="#111" stroke="var(--hat-color)" strokeWidth="0.5" opacity="0.5" />
                  </svg>
                ) : (
                  <img
                    src={`/varinhas/${profile.selected_varinha}.png`}
                    alt="Varinha"
                    style={profile.wand_type === 'neon' ? {
                      filter: `brightness(0) drop-shadow(0 0 2px var(--hat-color)) drop-shadow(0 0 5px var(--hat-color))`,
                      opacity: 0.4,
                      mixBlendMode: 'screen'
                    } : {}}
                  />
                )}
              </motion.div>
            )}

            {/* Nuvem de Faíscas Binárias (Decoupled from Wand Sway) */}
            {profile.selected_varinha && profile.selected_varinha > 0 && profile.wand_type === 'neon_flame' && (
              <div className={styles.shardsContainer}>
                <motion.svg 
                  viewBox="0 0 100 100" 
                  style={{ position: 'absolute', top: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'visible' }}
                  animate={{
                    left: ritualStep % 2 === 1 ? 'calc(20px + 0.05vw)' : '20px'
                  }}
                >
                  <motion.g
                    animate={{
                      x: ritualStep % 2 === 1 ? -95 : 5, 
                      y: ritualStep % 2 === 1 ? 104 : 60,
                      rotate: ritualStep % 2 === 1 ? -15 : 0, 
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                  >
                    {[...Array(7)].map((_, i) => {
                      const angle = (i * 60) * (Math.PI / 180);
                      const isExpanded = ritualStep % 2 === 1;
                      const radius = i === 6 ? 0 : (isExpanded ? 55 : 0);
                      const circleR = i === 6 ? (isExpanded ? 3.5 : 4) : (isExpanded ? 5 : 4);
                      
                      return (
                        <motion.g
                          key={`shard-${i}`}
                          animate={{
                            x: Math.cos(angle) * radius,
                            y: Math.sin(angle) * radius,
                            scale: isExpanded ? (i === 6 ? [1, 1.8, 1] : [1, 1.2, 1]) : 1,
                            opacity: isExpanded ? (i === 6 ? 1 : 1) : (i === 0 ? 0.6 : 0) // Base opacity handled by sequences below
                          }}
                          transition={{ 
                            duration: 0.8,
                            delay: isExpanded ? 0.3 : 0,
                            scale: { duration: 1.5, repeat: Infinity } 
                          }}
                        >
                          <motion.circle
                            cx="46" cy="15" r={circleR}
                            fill="#000"
                            stroke="#fff"
                            strokeWidth="1.5"
                            fillOpacity={isExpanded && i === 6 ? 0.4 : 1}
                            strokeOpacity={isExpanded ? (i === 6 ? 1 : 1) : 1}
                            style={{ pointerEvents: 'none' }}
                            animate={isExpanded ? {
                              x: [0, -1.5, 1.5, -1, 0],
                              y: [0, 1, -1.5, 1, 0],
                              scale: i === 6 ? [0.4, 0.4, 1.4, 1] : [1, 1.2, 1], // Surgimento no i=6
                              strokeWidth: i === 6 ? [0.5, 0.5, 4, 1.5] : [1, 3, 1],
                              opacity: i === 6 ? 
                                [0, 0, 1, 1] : // Invisível até 3.5s, depois surge
                                [0.8, 1, 0.8],
                                filter: i === 6 ? [
                                  'blur(10px) brightness(0)', 
                                  'blur(10px) brightness(0)', 
                                  'blur(0px) brightness(4) drop-shadow(0 0 30px #fff)', 
                                  'blur(0px) brightness(1.2) drop-shadow(0 0 10px #fff)'
                                ] : 'drop-shadow(0 0 8px #fff) blur(0.5px)',
                                strokeOpacity: i === 6 ? [0, 0, 1, 1] : 1
                            } : {
                              y: [0, -3, 0],
                              opacity: [0.6, 0.8, 0.6],
                              filter: 'drop-shadow(0 0 8px #fff) blur(0.5px)',
                              strokeOpacity: 1
                            }}
                            transition={isExpanded ? { 
                              x: { duration: 0.1, repeat: Infinity, ease: "linear" },
                              y: { duration: 0.08, repeat: Infinity, ease: "linear" },
                              scale: i === 6 ? { duration: 7, times: [0, 0.5, 0.55, 1] } : { duration: 1.5, repeat: Infinity },
                              strokeWidth: i === 6 ? { duration: 7, times: [0, 0.5, 0.51, 1] } : { duration: 1.5, repeat: Infinity },
                              opacity: i === 6 ? { duration: 7, times: [0, 0.5, 0.51, 1] } : { duration: 1.5, repeat: Infinity },
                              filter: i === 6 ? { duration: 7, times: [0, 0.5, 0.51, 1] } : { duration: 1.5, repeat: Infinity },
                              strokeOpacity: i === 6 ? { duration: 7, times: [0, 0.5, 0.51, 1] } : { duration: 1.5, repeat: Infinity }
                            } : { 
                              y: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                              opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
                              default: { duration: 0.6 }
                            }}
                          />
                        </motion.g>
                      );
                    })}
                  </motion.g>

                  <g
                    fontSize="8"
                    fill="currentColor"
                    fillOpacity="0.4"
                    style={{ fontFamily: 'monospace' }}
                  >
                    {[
                      { x: 40, y: 20, v: '0', d: 0 },
                      { x: 35, y: 25, v: '1', d: 2 },
                      { x: 45, y: 25, v: '0', d: 4 },
                      { x: 30, y: 35, v: '1', d: 6 },
                      { x: 50, y: 35, v: '0', d: 8 },
                      { x: 40, y: 10, v: '1', d: 10 }
                    ].map((item, i) => (
                      <motion.text
                        key={i}
                        x={item.x}
                        y={item.y}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                          opacity: [0, 1, 0],
                          scale: [0.5, 1.2, 0.5],
                          y: [item.y, item.y - 15]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: item.d,
                          ease: "easeInOut"
                        }}
                      >
                        {item.v}
                      </motion.text>
                    ))}
                  </g>
                </motion.svg>
              </div>
            )}

            <div
              className={`${styles.avatarClickable} ${(isEditingEssence && activeMenu === 'avatar') ? styles.essenceEditActive : ''} ${profile.avatar_mode === 'spiritual' ? styles.spiritualAvatar : ''}`}
              onClick={() => (isEditingEssence && activeMenu === 'avatar') && avatarInputRef.current?.click()}
            >
              {profile.avatar_url ? (
                <img
                  key={profile.avatar_url}
                  src={profile.avatar_url}
                  alt={profile.username}
                  className={styles.avatarImg}
                  style={profile.avatar_mode === 'spiritual' ? { opacity: 0 } : {}}
                />
              ) : (
                <div className={styles.avatarPlaceholder} style={profile.avatar_mode === 'spiritual' ? { opacity: 0 } : {}}>
                  <User size={64} />
                </div>
              )}

              {profile.avatar_mode === 'spiritual' && (
                <div className={styles.spiritualFlameContainer}>
                  <svg viewBox="0 0 100 100" className={styles.spiritualFlameSvg}>
                    <defs>
                      <filter id="flameGlow">
                        <feGaussianBlur stdDeviation="4" result="glow" />
                        <feComposite in="SourceGraphic" in2="glow" operator="over" />
                      </filter>
                    </defs>
                    {/* Camadas da Chama Branca */}
                    {[0, 1, 2, 3].map((i) => (
                      <motion.path
                        key={`white-flame-${i}`}
                        d="M50 90 Q30 70 50 20 Q70 70 50 90"
                        fill="white"
                        filter="url(#flameGlow)"
                        initial={{ opacity: 0 }}
                        animate={{
                          d: [
                            "M50 90 Q30 70 50 20 Q70 70 50 90",
                            "M50 90 Q45 60 50 10 Q55 60 50 90",
                            "M50 90 Q15 50 50 0 Q85 50 50 90",
                            "M50 90 Q30 70 50 20 Q70 70 50 90"
                          ],
                          opacity: [0.3, 0.7, 0.3],
                          scale: [1, 1.2, 1],
                          y: [0, -5, 0]
                        }}
                        transition={{
                          duration: 2.5 + i * 0.7,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.4
                        }}
                        style={{
                          transformOrigin: 'bottom center',
                          mixBlendMode: 'screen'
                        }}
                      />
                    ))}
                    {/* Partículas subindo */}
                    {[0, 1, 2, 3, 4].map((i) => (
                      <motion.circle
                        key={`flame-particle-${i}`}
                        r={Math.random() * 2 + 1}
                        fill="white"
                        animate={{
                          cx: [50, 40 + Math.random() * 20, 50 + (Math.random() - 0.5) * 40],
                          cy: [80, 40, -10],
                          opacity: [0, 1, 0]
                        }}
                        transition={{
                          duration: 2 + Math.random() * 2,
                          repeat: Infinity,
                          delay: i * 0.5
                        }}
                      />
                    ))}
                  </svg>
                </div>
              )}

              {/* EYE_ROOT (Supporting Eye, Reptile, Sharingan, and Rinnegan) */}
              {(profile.avatar_mode === 'eye' || profile.avatar_mode === 'reptile' || profile.avatar_mode === 'sharingan' || profile.avatar_mode === 'rinnegan') && (
                <div className={styles.spiritualFlameContainer} style={{ background: '#000', inset: '2.5%', transform: 'translateY(-0.6vh)' }}>
                  <svg viewBox="0 0 100 100" className={styles.spiritualFlameSvg} style={{ width: '95%', height: '95%' }}>
                    <defs>
                      <filter id="amaterasuGlow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                      <radialGradient id="scleraGrad" cx="50%" cy="50%" r="60%">
                        <stop offset="0%" stopColor={profile.eye_sclera_color || "#fff"} />
                        <stop offset="85%" stopColor={profile.eye_sclera_color || "#fff"} />
                        <stop offset="100%" stopColor={(profile.avatar_mode === 'sharingan' || profile.avatar_mode === 'rinnegan') ? (profile.eye_sclera_color || "#300") : "#ffeded"} />
                      </radialGradient>
                      <radialGradient id="sharinganIris" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={profile.eye_pupil_color || "#000"} />
                        <stop offset="20%" stopColor={profile.eye_iris_color || "#f00"} />
                        <stop offset="100%" stopColor={profile.eye_secondary_color || "#800"} />
                      </radialGradient>
                      <radialGradient id="nebulaGradient" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={profile.eye_pupil_color || "#000"} />
                        <stop offset="35%" stopColor={profile.eye_secondary_color || "#050510"} />
                        <stop offset="55%" stopColor={profile.eye_iris_color || "var(--nexo-color, #00f3ff)"} stopOpacity="0.9" />
                        <stop offset="85%" stopColor={profile.eye_secondary_color || "#101025"} stopOpacity="0.7" />
                        <stop offset="100%" stopColor={profile.eye_border_color || "#000"} />
                      </radialGradient>

                      {/* CRYSTAL_GRADS */}
                      <radialGradient id="crystalShine" cx="35%" cy="35%" r="50%">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.6" />
                        <stop offset="60%" stopColor="#fff" stopOpacity="0" />
                      </radialGradient>

                      <radialGradient id="crystalRim" cx="50%" cy="50%" r="50%">
                        <stop offset="80%" stopColor="#000" stopOpacity="0" />
                        <stop offset="100%" stopColor="#fff" stopOpacity="0.2" />
                      </radialGradient>

                      <radialGradient id="pupilGlow" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={profile.eye_pupil_color || "#000"} />
                        <stop offset="80%" stopColor={profile.eye_pupil_color || "#000"} />
                        <stop offset="100%" stopColor={profile.eye_iris_color || "var(--nexo-color, #00f3ff)"} stopOpacity="0.6" />
                      </radialGradient>

                      <filter id="cosmicGlow">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>

                      <filter id="starTwinkle">
                        <feComponentTransfer>
                          <feFuncA type="table" tableValues="0 1 0 1 0" />
                        </feComponentTransfer>
                      </filter>

                      <filter id="spongyVeins">
                        <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" result="noise" />
                        <feDisplacementMap in="SourceGraphic" in2="noise" scale="2" />
                      </filter>
                    </defs>

                    {/* Eye Content Masked by Eyelids */}
                    <g>
                      <clipPath id="eyeClip">
                        <motion.path
                          d="M10 50 Q50 10 90 50 Q50 90 10 50"
                          animate={{
                            d: [
                              "M10 50 Q50 10 90 50 Q50 90 10 50", // Steady Open
                              "M10 50 Q50 10 90 50 Q50 90 10 50", // 1.75s: Start Blink 1
                              "M10 50 Q50 90 90 50 Q50 90 10 50", // 1.95s: Closed 1
                              "M10 50 Q50 10 90 50 Q50 90 10 50", // 2.15s: Open 1
                              "M10 50 Q50 10 90 50 Q50 90 10 50", // 2.35s: Start Blink 2
                              "M10 50 Q50 90 90 50 Q50 90 10 50", // 2.55s: Closed 2
                              "M10 50 Q50 10 90 50 Q50 90 10 50", // 2.75s: Open 2
                              "M10 50 Q50 10 90 50 Q50 90 10 50"  // 3.5s: Steady Open
                            ]
                          }}
                          transition={{
                            duration: 3.5,
                            repeat: Infinity,
                            times: [0, 0.5, 0.56, 0.61, 0.67, 0.73, 0.79, 1],
                            ease: "circInOut"
                          }}
                        />
                      </clipPath>

                      <g clipPath="url(#eyeClip)">
                        {/* Sclera with biological gradients */}
                        <path d="M10 50 Q50 10 90 50 Q50 90 10 50" fill="url(#scleraGrad)" />

                        {/* AMATERASU BORDER FLAMES - Only in Sharingan Mode */}
                        {profile.avatar_mode === 'sharingan' && (
                          <motion.g
                            animate={{ rotate: 360 }}
                            transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
                            style={{ transformOrigin: '50% 50%' }}
                          >
                            {[...Array(12)].map((_, i) => (
                              <motion.path
                                key={`amaterasu-${i}`}
                                d="M-4 0 Q-8 -12 0 -22 Q8 -12 4 0 Z"
                                fill="#000"
                                stroke="#fff"
                                strokeWidth="0.4"
                                strokeOpacity="0.7"
                                transform={`rotate(${i * 30}) translate(50, 10)`}
                                animate={{
                                  scaleY: [1, 1.25, 0.95, 1.1],
                                  skewX: [-4, 4, -1, 2]
                                }}
                                transition={{
                                  duration: 5 + Math.random() * 3,
                                  repeat: Infinity,
                                  ease: "easeInOut",
                                  delay: i * 0.4
                                }}
                                style={{ filter: 'url(#amaterasuGlow)' }}
                              />
                            ))}
                          </motion.g>
                        )}

                        {/* Lacrimal Caruncle (Inner Corner) */}
                        <path d="M88 50 Q91 50 90 52 Q87 54 86 51 Z" fill={profile.avatar_mode === 'sharingan' ? "#400" : "#ffc7c7"} opacity="0.6" />

                        {/* Subtle Vascularization (Veins) */}
                        <g stroke={profile.avatar_mode === 'sharingan' ? "#000" : "#ff0000"} strokeWidth="0.2" fill="none" opacity={profile.avatar_mode === 'sharingan' ? 0.3 : 0.12} strokeLinecap="round">
                          {/* Outer Corner Veins */}
                          <path d="M12 50 L16 48 M16 48 L20 49 M16 48 L18 45" />
                          <path d="M11 51 L15 54 M15 54 L19 53" />

                          {/* Inner Corner Veins */}
                          <path d="M86 50 L82 48 M82 48 L78 49" />
                          <path d="M87 51 L83 54 M83 54 L79 53" />
                        </g>

                        {/* THE COSMIC IRIS with Unified Ocular Resonance & Void Stare Protocol (21s Cycle) */}
                        <motion.g
                          style={{ x: springIrisX, y: springIrisY }}
                          animate={{
                            scale: [1, 1.02, 1, 1],
                            rotate: [-1, 1, -1, -1],
                            opacity: [1, 1, 1, 1]
                          }}
                          transition={{
                            duration: 21,
                            repeat: Infinity,
                            times: [0, 0.33, 0.66, 1],
                            ease: "easeInOut"
                          }}
                        >
                          {/* SPECIAL IRIS BASE for Ritualistic Modes */}
                          {(profile.avatar_mode === 'sharingan' || profile.avatar_mode === 'rinnegan') ? (
                            <circle cx="50" cy="50" r="17.5" fill="url(#sharinganIris)" />
                          ) : (
                            <circle cx="50" cy="50" r="17.5" fill="url(#nebulaGradient)" />
                          )}

                          <motion.g
                            animate={{
                              skewX: [0, 0.5, 0, 0],
                              skewY: [0, -0.5, 0, 0]
                            }}
                            transition={{
                              duration: 21,
                              repeat: Infinity,
                              times: [0, 0.33, 0.66, 1],
                              ease: "easeInOut"
                            }}
                          >

                            {/* Scleral Neon Veins (Moved INSIDE resonance group) */}
                            <g pointerEvents="none">
                              {profile?.eye_veins_active && (
                                <g filter="url(#cosmicGlow)" style={{ opacity: 0.8 }}>
                                  {[...Array(48)].map((_, i) => {
                                    const angle = (i * (360 / 48) * Math.PI) / 180;
                                    const isMutation = i % 3 === 0;
                                    const mutationFactor = isMutation ? 4.5 : 2.5;
                                    const startR = (profile.avatar_mode === 'reptile' ? 2.5 : 6.8);
                                    const endR = 38 + Math.random() * 5;

                                    const cp1Dist = startR + 15;
                                    const cp1Angle = angle + (Math.random() - 0.5) * mutationFactor;
                                    const cp2Dist = startR + 30;
                                    const cp2Angle = angle + (Math.random() - 0.5) * mutationFactor;

                                    const targetX2 = 50 + endR * Math.cos(angle);
                                    const targetY2 = 50 + endR * Math.sin(angle);

                                    const sWidth = 0.2 + Math.random() * 0.7;

                                    return (
                                      <VascularPath
                                        key={`vein-fixed-${i}`}
                                        angle={angle}
                                        startR={startR}
                                        cp1={[cp1Dist, cp1Angle]}
                                        cp2={[cp2Dist, cp2Angle]}
                                        targetEnd={[targetX2, targetY2]}
                                        irisX={springIrisX}
                                        irisY={springIrisY}
                                        color={profile.eye_veins_color || profile.eye_iris_color || "var(--nexo-color)"}
                                        width={sWidth}
                                        delay={i * 0.08}
                                      />
                                    );
                                  })}
                                </g>
                              )}
                            </g>
                            {/* Neon Scleral Vascularization moved inside the Pupil group for reactive breathing */}
                            {/* UNIVERSAL BREATHING LAYER - Linked to Pupil Pulse */}
                            <motion.g
                              animate={{
                                scale: [1, 1, 0.985, 1.015, 1, 0.985, 1.015, 1]
                              }}
                              transition={{
                                duration: 3.5,
                                repeat: Infinity,
                                times: [0, 0.5, 0.56, 0.61, 0.67, 0.73, 0.79, 1],
                                ease: "circInOut"
                              }}
                            >
                              <motion.g
                                animate={{
                                  scale: [1, 0.99, 1, 1, 1]
                                }}
                                transition={{
                                  duration: 14,
                                  repeat: Infinity,
                                  times: [0, 0.035, 0.07, 0.5, 1],
                                  ease: "easeInOut"
                                }}
                              >
                                {/* Pulsing Limbal Ring - Hidden in complex ritualistic modes */}
                                {profile.avatar_mode !== 'sharingan' && profile.avatar_mode !== 'rinnegan' && (
                                  <motion.circle
                                    cx="50" cy="50"
                                    animate={{ r: [16.5, 19, 16.5, 16.5, 16.5] }}
                                    transition={{
                                      duration: 14,
                                      repeat: Infinity,
                                      times: [0, 0.035, 0.07, 0.5, 1],
                                      ease: "easeInOut"
                                    }}
                                    fill={profile.eye_border_color || "#000"}
                                    opacity="0.8"
                                  />
                                )}

                                {/* Pulsing Iris Background - Hidden in Rinnegan for 'Smooth' finish */}
                                {profile.avatar_mode !== 'rinnegan' && (
                                  <motion.circle
                                    cx="50" cy="50"
                                    animate={{ r: [16, 18, 16, 16, 16] }}
                                    transition={{
                                      duration: 14,
                                      repeat: Infinity,
                                      times: [0, 0.035, 0.07, 0.5, 1],
                                      ease: "easeInOut"
                                    }}
                                    fill={profile.avatar_mode === 'sharingan' ? "url(#sharinganIris)" : "url(#nebulaGradient)"}
                                    filter="url(#cosmicGlow)"
                                  />
                                )}

                                {/* Human Ocular Collarette - Hidden in complex ritualistic modes */}
                                {profile.avatar_mode !== 'sharingan' && profile.avatar_mode !== 'rinnegan' && (
                                  <motion.circle
                                    cx="50" cy="50"
                                    r="11"
                                    fill="none"
                                    stroke={profile.eye_iris_color || "var(--nexo-color)"}
                                    strokeWidth="0.4"
                                    strokeDasharray="1,3"
                                    opacity="0.3"
                                    animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.4, 0.2] }}
                                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                                  />
                                )}

                                {/* CRYSTAL DOME OVERLAYS - Hidden in Rinnegan for 'Liso' look */}
                                {profile.avatar_mode !== 'rinnegan' && (
                                  <>
                                    <circle cx="50" cy="50" r="16.5" fill="url(#crystalRim)" pointerEvents="none" />
                                    <circle cx="50" cy="50" r="16.5" fill="url(#crystalShine)" pointerEvents="none" />
                                  </>
                                )}

                                {/* Reptilian Spongy Veins Overlay (Non-linear & Misaligned) */}
                                {profile.avatar_mode === 'reptile' && (
                                  <g filter="url(#spongyVeins)" opacity="0.4" pointerEvents="none">
                                    {[...Array(14)].map((_, i) => {
                                      const angle = (i * (360 / 14) * Math.PI) / 180;
                                      const dist = 14 + Math.random() * 4;
                                      const midDist = dist * 0.5;
                                      const midAngle = angle + (Math.random() - 0.5) * 0.6;
                                      const startOff = (Math.random() - 0.5) * 2;

                                      return (
                                        <path
                                          key={`reptile-vein-${i}`}
                                          d={`M${50 + startOff} ${50 + startOff} Q${50 + midDist * Math.cos(midAngle)} ${50 + midDist * Math.sin(midAngle)} ${50 + dist * Math.cos(angle)} ${50 + dist * Math.sin(angle)}`}
                                          stroke={profile.eye_iris_color || "var(--nexo-color)"}
                                          strokeWidth={0.4 + Math.random() * 0.8}
                                          strokeDasharray={`${2 + Math.random() * 5},${1 + Math.random() * 2}`}
                                          fill="none"
                                          strokeLinecap="round"
                                          style={{ mixBlendMode: 'overlay', opacity: 0.3 + Math.random() * 0.5 }}
                                        />
                                      );
                                    })}
                                  </g>
                                )}

                                {/* Nebula clouds - Hidden in Rinnegan */}
                                {profile.avatar_mode !== 'rinnegan' && [...Array(6)].map((_, i) => (
                                  <motion.circle
                                    key={`cloud-${i}`}
                                    cx={50 + (Math.random() - 0.5) * 15}
                                    cy={50 + (Math.random() - 0.5) * 15}
                                    r={5 + Math.random() * 10}
                                    fill={profile.eye_iris_color || "var(--nexo-color, #00f3ff)"}
                                    fillOpacity="0.1"
                                    filter="url(#cosmicGlow)"
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.05, 0.15, 0.05], x: [0, (Math.random() - 0.5) * 10, 0] }}
                                    transition={{ duration: 4 + i, repeat: Infinity }}
                                  />
                                ))}

                                {/* Fibers - Only in non-sharingan/rinnegan modes */}
                                {profile.avatar_mode !== 'sharingan' && profile.avatar_mode !== 'rinnegan' && (
                                  <g opacity="0.3" filter="url(#cosmicGlow)">
                                    {[...Array(36)].map((_, i) => (
                                      <line key={`fiber-${i}`} x1="50" y1="50" x2={50 + 17.5 * Math.cos((i * 10 * Math.PI) / 180)} y2={50 + 17.5 * Math.sin((i * 10 * Math.PI) / 180)} stroke={profile.eye_iris_color || "var(--nexo-color, #fff)"} strokeWidth="0.3" strokeDasharray="1,2" />
                                    ))}
                                  </g>
                                )}

                                {/* Pupil with multi-cycle animations (Focus Pulse 7s + Reactive Reflex 3.5s) */}
                                {profile.avatar_mode === 'reptile' ? (
                                  <motion.g
                                    animate={{
                                      scale: [1, 1, 0.6, 1.4, 1, 0.6, 1.4, 1]
                                    }}
                                    transition={{
                                      duration: 3.5,
                                      repeat: Infinity,
                                      times: [0, 0.5, 0.56, 0.61, 0.67, 0.73, 0.79, 1],
                                      ease: "circInOut"
                                    }}
                                  >
                                    <motion.g
                                      animate={{
                                        // Predatory Focus: 7s Constricted, 7s Normal
                                        scaleX: [0.6, 0.6, 1, 1, 0.6]
                                      }}
                                      transition={{
                                        duration: 14,
                                        repeat: Infinity,
                                        times: [0, 0.45, 0.55, 0.95, 1],
                                        ease: "easeInOut"
                                      }}
                                    >
                                      <ellipse cx="50" cy="50" rx="3.5" ry="12" fill="url(#pupilGlow)" />
                                      <ellipse cx="50" cy="50" rx="2.5" ry="11" fill={profile.eye_pupil_color || "#000"} />
                                    </motion.g>
                                  </motion.g>
                                ) : (profile.avatar_mode === 'sharingan' || profile.avatar_mode === 'rinnegan') ? (
                                  null /* The Pattern is the pupil */
                                ) : (
                                  <motion.g
                                    animate={{
                                      scale: [1, 1, 0.8, 1.1, 1, 0.8, 1.1, 1]
                                    }}
                                    transition={{
                                      duration: 3.5,
                                      repeat: Infinity,
                                      times: [0, 0.5, 0.56, 0.61, 0.67, 0.73, 0.79, 1],
                                      ease: "circInOut"
                                    }}
                                  >
                                    <motion.g
                                      animate={{
                                        scale: [1, 0.7, 1, 1, 1]
                                      }}
                                      transition={{
                                        duration: 14,
                                        repeat: Infinity,
                                        times: [0, 0.035, 0.07, 0.5, 1],
                                        ease: "easeInOut"
                                      }}
                                    >
                                      <circle cx="50" cy="50" r="7.5" fill="url(#pupilGlow)" />
                                      <circle cx="50" cy="50" r="6.8" fill={profile.eye_pupil_color || "#000"} />
                                    </motion.g>
                                  </motion.g>
                                )}

                                {/* Ocular Glints & Halo - Hidden in Rinnegan Mode for 'Smooth' finish */}
                                {profile.avatar_mode !== 'rinnegan' && (
                                  <>
                                    {/* Crystal Refraction Halo around main glint - NOW LUMINOUS */}
                                    <motion.circle
                                      cx="44" cy="44" r="4.2"
                                      fill="none"
                                      stroke="#fff"
                                      strokeWidth="0.3"
                                      strokeOpacity="0.4"
                                      filter="url(#cosmicGlow)"
                                      animate={{ opacity: [0.2, 0.5, 0.2] }}
                                      transition={{ duration: 4, repeat: Infinity }}
                                    />
                                    <motion.circle
                                      cx="44" cy="44" r="3.5"
                                      fill="#fff"
                                      fillOpacity="0.9"
                                      filter="url(#cosmicGlow)"
                                      animate={{
                                        scale: [1, 1.08, 1],
                                        opacity: [0.8, 1, 0.8]
                                      }}
                                      transition={{ duration: 4, repeat: Infinity }}
                                    />
                                    <circle cx="54" cy="53" r="1.8" fill="#fff" fillOpacity="0.4" />
                                    <circle cx="48" cy="56" r="1" fill="#fff" fillOpacity="0.2" />
                                  </>
                                )}

                                {/* RINNEGAN MODE: Samsara Ripples (8 Concentric Circles) */}
                                {profile.avatar_mode === 'rinnegan' && (
                                  <g filter="url(#cosmicGlow)">
                                    {[4, 9, 14, 19, 24, 29, 34, 38.5].map((r, idx) => (
                                      <circle
                                        key={`rinnegan-ring-${idx}`}
                                        cx="50" cy="50" r={r}
                                        fill="none"
                                        stroke={idx === 0 ? (profile.eye_pupil_color || "#000") : (profile.eye_border_color || "#000")}
                                        strokeWidth={0.6 - (idx * 0.05)}
                                        opacity={1 - (idx * 0.08)}
                                      />
                                    ))}

                                    {/* RITUALISTIC TOMOE (Comas) - Symmetric Triangular Placement (Doubled Size) */}
                                    <g fill={profile.eye_border_color || "#000"}>
                                      {/* Inner Set of 3 Tomoe (at Radius ~9) - Scale doubled to 1.2 */}
                                      {[0, 120, 240].map((rot) => (
                                        <path
                                          key={`tomoe-inner-${rot}`}
                                          d="M0 -1.6 C-0.9 -1.6 -1.2 0 -0.4 0.8 C0.2 1.4 1.2 0.8 1.2 0 C1.2 -0.8 0.6 -0.8 0 -0.8 Z"
                                          transform={`rotate(${rot}, 50, 50) translate(50, 41) scale(1.2)`}
                                          opacity="0.95"
                                        />
                                      ))}
                                      {/* Middle Set of 3 Tomoe (Moved Closer to center, at Radius ~14) - Scale 1.4 */}
                                      {[60, 180, 300].map((rot) => (
                                        <path
                                          key={`tomoe-outer-${rot}`}
                                          d="M0 -1.6 C-0.9 -1.6 -1.2 0 -0.4 0.8 C0.2 1.4 1.2 0.8 1.2 0 C1.2 -0.8 0.6 -0.8 0 -0.8 Z"
                                          transform={`rotate(${rot}, 50, 50) translate(50, 36) scale(1.4)`}
                                          opacity="0.85"
                                        />
                                      ))}
                                    </g>
                                  </g>
                                )}

                                {/* SHARINGAN PATTERN - Geometric Hexagram (6-Pointed Star) - NOW ON TOP */}
                                {profile.avatar_mode === 'sharingan' && (
                                  <motion.g
                                    animate={{ rotate: -360 }}
                                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                                    style={{ transformOrigin: '50% 50%' }}
                                  >
                                    {/* CIRCLE POLYGON ENCLOSURE - Circumscribing Ring */}
                                    <circle
                                      cx="50" cy="50" r="15.5"
                                      fill="none"
                                      stroke={profile.eye_border_color || "#000"}
                                      strokeWidth="0.4"
                                      opacity="0.6"
                                      filter="url(#cosmicGlow)"
                                    />

                                    {/* ATOMIC HEXAGRAM - Thinner and Longer (Sharper Tips) */}
                                    {[33, 93, 153].map((rot) => (
                                      <ellipse
                                        key={`atomic-lobe-${rot}`}
                                        cx="50" cy="50" rx="17.5" ry="3.5"
                                        fill={profile.eye_iris_color || "#000"}
                                        stroke={profile.eye_iris_color || "#000"}
                                        strokeWidth="0.8"
                                        transform={`rotate(${rot}, 50, 50)`}
                                        filter="url(#cosmicGlow)"
                                        opacity="0.9"
                                      />
                                    ))}

                                    {/* NESTED HEXAGRAM CONSTRUCT (Secondary Intersecting Triangles - Rotated Offset) */}
                                    <motion.g 
                                      filter="url(#cosmicGlow)" 
                                      transform="rotate(35, 50, 50)"
                                      animate={{ rotate: [35, 395] }}
                                      transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
                                    >
                                      {/* Nested Star - Triangle 1 (Points UP R=11) - Curvy 'Fat' Sides */}
                                      <path
                                        d="M50 39 Q57 46 59.5 55.5 Q50 59 40.5 55.5 Q43 46 50 39 Z"
                                        fill="none"
                                        stroke={profile.eye_border_color || "#000"}
                                        strokeWidth="1.8"
                                        strokeLinejoin="round"
                                        opacity="0.9"
                                      />
                                      {/* Nested Star - Triangle 2 (Points DOWN R=11) - Curvy 'Fat' Sides */}
                                      <path
                                        d="M50 61 Q43 54 40.5 44.5 Q50 41 59.5 44.5 Q57 54 50 61 Z"
                                        fill="none"
                                        stroke={profile.eye_border_color || "#000"}
                                        strokeWidth="1.8"
                                        strokeLinejoin="round"
                                        opacity="0.9"
                                      />

                                      {/* THREE-POINTED BLADE (Lamina Ritualística) */}
                                      <motion.path
                                        d="M50 38 Q55 46 50 50 Q45 46 50 38 Z 
                                           M50 50 Q56 47 60.4 56 Q51 54 50 50 Z
                                           M50 50 Q44 47 39.6 56 Q49 54 50 50 Z
                                           M50 47.5 A 2.5 2.5 0 1 0 50 52.5 A 2.5 2.5 0 1 0 50 47.5 Z"
                                        fill={profile.eye_pupil_color || "#000"}
                                        fillRule="evenodd"
                                        filter="url(#cosmicGlow)"
                                        animate={{ rotate: [0, 360] }}
                                        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                        style={{ transformOrigin: '50% 50%' }}
                                      />
                                      {/* CENTRAL RED CORE (O Buraco Vermelho) */}
                                      <circle
                                        cx="50" cy="50" r="1.8"
                                        fill={profile.eye_iris_color || "#ff0000"}
                                        filter="url(#cosmicGlow)"
                                        opacity="0.9"
                                      />
                                    </motion.g>
                                  </motion.g>
                                )}
                              </motion.g>
                            </motion.g>
                          </motion.g>
                        </motion.g>
                      </g>
                    </g>

                    {/* Upper Eyelid & Lashes Group (Moving together) */}
                    <motion.g
                      animate={{
                        y: [0, 0, 40, 0, 0, 40, 0, 0],
                        // Custom prop to pass tilt factor to children
                        rotateX: [0, 0, 160, 0, 0, 160, 0, 0]
                      }}
                      transition={{
                        duration: 3.5,
                        repeat: Infinity,
                        times: [0, 0.5, 0.56, 0.61, 0.67, 0.73, 0.79, 1],
                        ease: "circInOut"
                      }}
                      style={{ transformOrigin: '50% 50%' }}
                    >
                      <path d="M10 50 Q50 10 90 50" fill="none" stroke="#000" strokeWidth="1.2" opacity="0.8" />
                      <g stroke={profile.eye_lashes_color || "#000"} strokeWidth="0.5" strokeLinecap="round">
                        {[...Array(40)].map((_, i) => {
                          const t = 0.05 + (i / 39) * 0.9;
                          const x = 10 + 80 * t;
                          const y = 80 * t * t - 80 * t + 50;
                          const noise = Math.sin(i * 1.5) * 1.5;
                          const lashLen = (3 + Math.sin(t * Math.PI) * 4) + noise;
                          const angle = (t - 0.5) * 1.5;

                          // Breezy Offset durations
                          const windDur = 6 + Math.random() * 4;
                          const windDelay = Math.random() * 2;

                          return (
                            <motion.path
                              key={`top-lash-${i}`}
                              d={`M${x} ${y} Q${x + angle * 5} ${y - lashLen * 0.8} ${x + angle * 8} ${y - lashLen}`}
                              opacity={profile.eye_lashes_active ?? true ? 0.8 : 0}
                              animate={{
                                rotate: [-2, 4, -2], // Stronger wind feel
                                skewX: [-1, 2, -1]
                              }}
                              transition={{
                                duration: windDur,
                                delay: windDelay,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{ transformOrigin: `${x}px ${y}px`, originX: `${x}px`, originY: `${y}px` }}
                            />
                          );
                        })}
                      </g>
                    </motion.g>

                    {/* Bottom Eyelid & Lashes (Static) */}
                    <g>
                      <path
                        d="M10 50 Q50 90 90 50"
                        fill="none"
                        stroke="#000"
                        strokeWidth="0.8"
                        opacity="0.6"
                      />
                      <g stroke={profile.eye_lashes_color || "#000"} strokeWidth="0.3" strokeLinecap="round" opacity={profile.eye_lashes_active ?? true ? 0.6 : 0}>
                        {[...Array(25)].map((_, i) => {
                          const t = 0.1 + (i / 24) * 0.8;
                          const x = 10 + 80 * t;
                          const y = -80 * t * t + 80 * t + 50;
                          const noise = Math.sin(i * 2.1) * 1.2;
                          const lashLen = (2.2 + Math.sin(t * Math.PI) * 2.2) + noise;
                          const angle = (t - 0.5) * 1.2;

                          // Subtle swaying durations
                          const windDur = 7 + Math.random() * 4;
                          const windDelay = Math.random() * 2;

                          return (
                            <motion.path
                              key={`bot-lash-${i}`}
                              d={`M${x} ${y} Q${x + angle * 3} ${y + lashLen * 0.8} ${x + angle * 5} ${y + lashLen}`}
                              animate={{
                                rotate: [1.5, -3, 1.5], // Stronger wind feel
                                skewX: [1, -2, 1]
                              }}
                              transition={{
                                duration: windDur,
                                delay: windDelay,
                                repeat: Infinity,
                                ease: "easeInOut"
                              }}
                              style={{ transformOrigin: `${x}px ${y}px`, originX: `${x}px`, originY: `${y}px` }}
                            />
                          );
                        })}
                      </g>
                    </g>
                    {/* PIRATE EYEPATCH MODE - Translucent with Tech Details */}
                    {(profile.avatar_mode as string) === 'eyepatch' && (
                      <g filter="url(#cosmicGlow)">
                          {/* Industrial Band - Oblique Wrap */}
                          <path d="M-10 10 L110 90" stroke="#050505" strokeWidth="12" fill="none" opacity="0.95" />
                          <path d="M-10 12 L110 92" stroke="currentColor" strokeWidth="0.5" fill="none" opacity="0.15" strokeDasharray="3,1" />
                          
                          <defs>
                              <radialGradient id="patchGrad" cx="50%" cy="50%" r="50%">
                                  <stop offset="0%" stopColor="#111" stopOpacity="0.5" />
                                  <stop offset="100%" stopColor="#050505" stopOpacity="0.85" />
                              </radialGradient>
                          </defs>

                          {/* The Patch Structure - Centered on 50,50 */}
                          <motion.path 
                              d="M20 35 Q 50 20 80 35 Q 95 65 50 85 Q 5 65 20 35" 
                              fill="url(#patchGrad)" 
                              stroke="rgba(255,255,255,0.1)" 
                              strokeWidth="1.2"
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                          />
                          
                          {/* Hardware details (bolts) */}
                          <circle cx="32" cy="42" r="1.5" fill="#222" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />
                          <circle cx="68" cy="42" r="1.5" fill="#222" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

                          {/* Reactive UI Scanner Inside Patch - Visualizes the 'Glow' behind */}
                          <motion.path
                              d="M38 55 L62 55"
                              stroke="currentColor"
                              strokeWidth="1"
                              opacity="0.5"
                              animate={{ 
                                opacity: [0.3, 0.7, 0.3], 
                                scaleX: [0.8, 1.2, 0.8],
                                y: [-2, 8, -2]
                              }}
                              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          />
                      </g>
                    )}
                  </svg>
                </div>
              )}

              {isEditingEssence && activeMenu === 'avatar' && (
                <div className={styles.avatarEditOverlay}>
                  <Camera size={20} />
                </div>
              )}

              {profile.cloak_enabled && (
                <svg 
                  className={styles.fixedEmblemSvg} 
                  viewBox="0 0 200 420"
                  style={
                    profile.cloak_emblem_type === 'neon_heart' ? { top: 'calc(50px + 15vh)' } :
                    profile.cloak_emblem_type === 'hexagram' ? { top: 'calc(50px + 18vh)' } :
                    profile.cloak_emblem_type === 'pentagram' ? { top: 'calc(50px + 18vh)' } :
                    profile.cloak_emblem_type === 'black_hole' ? { top: 'calc(50px + 18vh)' } :
                    profile.cloak_emblem_type === 'orbital_nexus' ? { top: 'calc(50px + 18vh)' } :
                    profile.cloak_emblem_type === 'ice_fragment' ? { top: 'calc(50px + 17vh)' } :
                    {}
                  }
                >
                  {renderCloakEmblem()}
                </svg>
              )}
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              className={styles.hiddenInput}
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <div className={styles.rightSection}>
            <div className={styles.mainInfo}>
              <div className={styles.nameSection}>
                <div className={styles.archetypeBadge}>
                  <span className={styles.rankText}>{currentArquetipo}</span>
                </div>
              </div>

            {(() => {
              const BOTS = ["lucemon", "barbamon", "leviamon", "beelzemon", "belphemon", "lilithmon", "daemon", "belialvamdemon"];
              const LARES = [
                "Sol", "Mercúrio", "Vênus", "Terra", "Marte", "Júpiter",
                "Saturno", "Urano", "Netuno", "Lua", "Tsukuyomi", "X"
              ];
              let calculatedLar: string | null = null;

              if (profile.username && BOTS.includes(profile.username.toLowerCase())) {
                const mockIndex = profile.username.length % LARES.length;
                calculatedLar = LARES[mockIndex];
              } else if (profile.created_at) {
                const createdDate = new Date(profile.created_at);
                const now = new Date();
                const monthsDiff = (now.getFullYear() - createdDate.getFullYear()) * 12 + (now.getMonth() - createdDate.getMonth());
                if (monthsDiff >= 0) {
                  const index = monthsDiff % LARES.length;
                  calculatedLar = LARES[index];
                }
              }

              // Nos deparamos com um problema técnico: lar não estava disponível globalmente.
              // Agora salvamos em uma variável local acessível para o Dossier.
              (window as any)._currentProfileLar = calculatedLar;

              return calculatedLar ? (
                <div 
                  className={styles.monthlyLarTag}
                  style={{ '--nexo-color': profile.nexo_color || '#00f3ff' } as any}
                >
                  <Sparkles size={14} className={styles.sparkleIcon} />
                  <span className={styles.larLabel}>Estado de consciência:</span>
                  <span className={styles.larValue}>{calculatedLar}</span>
                </div>
              ) : null;
            })()}

              <div className={styles.bioWrapper}>
                {isOwnProfile && !isEditingEssence && (
                  <button
                    onClick={() => router.push('/?settings=true')}
                    className={styles.sideBtn}
                    title="Sincronizar Presença"
                  >
                    <Settings size={12} />
                  </button>
                )}
                <p className={styles.bio}>{profile.bio || "Esta consciência ainda não definiu sua bio."}</p>
                {isOwnProfile && !isEditingEssence && (
                  <button 
                    className={styles.sideBtn} 
                    title="Compartilhar"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link do perfil copiado!");
                    }}
                  >
                    <Share2 size={12} />
                  </button>
                )}
              </div>
              <div className={styles.meta}>
                <span><MapPin size={14} /> {profile.city || "Frequência Zero"}</span>
                <span>Membro desde {new Date(profile.created_at).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })} <Calendar size={14} /></span>
              </div>

              {(profile.world_name || (window as any)._currentProfileLar) && (
                <div className={styles.highlightWrapper}>
                  <div className={styles.highlightSection}>
                    {profile.age && (
                      <span className={styles.ageValue}>{profile.age}</span>
                    )}
                    <span className={styles.highlightLabel}>Estado de consciência</span>
                    <span className={styles.highlightValue} style={{ color: profile.nexo_color || '#00f3ff', textShadow: `0 0 10px ${profile.nexo_color || '#00f3ff'}66` }}>
                      {profile.world_name || (window as any)._currentProfileLar || "Estação Orbital"}
                    </span>
                  </div>
                </div>
              )}

              <div className={styles.dossierGrid}>
                <div className={styles.dossierItem}>
                  <span className={styles.dossierLabel}>Essência</span>
                  <span className={styles.dossierValue}>{profile.cloak_type ? profile.cloak_type.split('_').join(' ') : "Indefinida"}</span>
                </div>
                <div className={styles.dossierItem}>
                  <span className={styles.dossierLabel}>Pedra Sagrada</span>
                  <span className={styles.dossierValue}>{profile.selected_pedra ? (STONE_NAMES[profile.selected_pedra] || `Manifestação #${profile.selected_pedra}`) : "Não Manifestada"}</span>
                </div>
                <div className={styles.dossierItem}>
                  <span className={styles.dossierLabel}>Varinha Ritual</span>
                  <span className={styles.dossierValue}>{profile.wand_type ? (WAND_NAMES[profile.wand_type] || profile.wand_type.split('_').join(' ')) : "Varinha Comum"}</span>
                </div>
                <div className={styles.dossierItem}>
                  <span className={styles.dossierLabel}>Chapéu Místico</span>
                  <span className={styles.dossierValue}>{profile.hat_type ? (HAT_NAMES[profile.hat_type] || profile.hat_type.split('_').join(' ')) : "Sincronizador"}</span>
                </div>
              </div>

              <div className={`${styles.statusHighlight} ${isOwnProfile ? styles.ownStatus : ''}`}>
                <span className={styles.statusLabel}>Vibração</span>
                <span className={styles.statusValue} style={{ color: profile.nexo_color || '#00f3ff', textShadow: `0 0 15px ${profile.nexo_color || '#00f3ff'}88` }}>
                  {profile.status || "Operacional"}
                </span>
              </div>
            </div>
            
            <div className={styles.profileActions}>
              {!isOwnProfile && (
                <>
                  <button className={styles.primaryBtn}>Entrelaçar</button>
                  <button 
                    className={styles.secondaryBtn}
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link do perfil copiado!");
                    }}
                  >
                    <Share2 size={14} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className={styles.contentLayout}>
        <section className={styles.mainColumn}>
          <div className={styles.storySection}>
            <StoryBar userId={userId} />
          </div>


          <div className={styles.floatingFluxoWrapper}>
            <div className={styles.floatingFluxo}>
                {/* Center — title + sparks + pulse */}
                <div className={styles.feedHeaderCenter}>
                  {isOwnProfile && (
                    <div className={styles.chatBarInHeader}>
                      <div className={styles.chatInputArea}>
                        <div className={styles.chatAttachedRow}>
                          {attachedFiles.image && (
                            <div className={styles.attachedFile}>
                              <ImageIcon size={14} /> <span>Foto</span>
                              <button onClick={() => setAttachedFiles(h => ({ ...h, image: null }))}><X size={12} /></button>
                            </div>
                          )}
                          {attachedFiles.audio && (
                            <div className={styles.attachedFile}>
                              <Music size={14} /> <span>Áudio</span>
                              <button onClick={() => setAttachedFiles(h => ({ ...h, audio: null }))}><X size={12} /></button>
                            </div>
                          )}
                        </div>

                        <AnimatePresence>
                          {repostTarget && (
                            <motion.div
                              className={styles.repostPreviewInChat}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                            >
                              <div className={styles.repostPreviewHeader}>
                                <span>🚀 Expressando: @{repostTarget.author}</span>
                                <button onClick={() => setRepostTarget(null)}><X size={14} /></button>
                              </div>
                              <div className={styles.repostPreviewBody}>
                                {repostTarget.image && <img src={repostTarget.image} className={styles.repostPreviewThumb} />}
                                <p>{repostTarget.content?.slice(0, 80)}...</p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <form 
                          className={`${styles.chatInputRow} ${styles.chatInputRowInHeader}`} 
                          onSubmit={handleSendChatMessage}
                          style={{ 
                            borderColor: `${chatAction.aura}66`, 
                            boxShadow: `0 0 20px ${chatAction.aura}22`,
                            transition: 'all 0.5s ease',
                            marginBottom: '2.5rem'
                          }}
                        >
                          <div className={styles.chatActionButtons}>
                            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                              <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>Vibrar em:</span>
                              <button 
                                type="button" 
                                className={styles.auraSelectorTrigger}
                                onClick={() => setShowAuraSelector(!showAuraSelector)}
                                style={{ 
                                  color: chatAction.aura,
                                  boxShadow: `0 0 10px ${chatAction.aura}66, inset 0 0 5px ${chatAction.aura}33`
                                }}
                              >
                                <chatAction.icon size={12} />
                                <span>{chatAction.name}</span>
                              </button>
                              
                              <AnimatePresence>
                                {showAuraSelector && (
                                  <motion.div 
                                    className={styles.auraSelectorMenu}
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    style={{ left: '50%', transform: 'translateX(-50%)' }}
                                  >
                                    <AnimatePresence mode="wait">
                                      <motion.div 
                                        key={chatAction.id === 'buscar' || SEARCH_ACTIONS.some(sa => sa.id === chatAction.id) ? 'search' : 'default'}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        className={styles.auraSelectorGrid}
                                      >
                                        {(chatAction.id === 'buscar' || SEARCH_ACTIONS.some(sa => sa.id === chatAction.id) ? SEARCH_ACTIONS : ACTIONS.filter(a => a.id !== 'perceber' && a.id !== 'observar')).map((action) => (
                                          <button
                                            key={action.id}
                                            type="button"
                                            className={`${styles.auraOption} ${chatAction.id === action.id ? styles.auraOptionActive : ''}`}
                                            onClick={() => {
                                              setChatAction(action);
                                              setShowAuraSelector(false);
                                            }}
                                            style={chatAction.id === action.id ? { color: action.aura } : {}}
                                            title={action.name}
                                          >
                                            <action.icon size={20} />
                                          </button>
                                        ))}
                                      </motion.div>
                                    </AnimatePresence>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>

                            <div className={styles.divider} />

                            <button type="button" onClick={() => mediaInputRef.current?.click()} className={styles.mediaTinyBtn} title="Anexar Foto">
                              <ImageIcon size={16} />
                            </button>
                            <button type="button" onClick={() => audioInputRef.current?.click()} className={styles.mediaTinyBtn} title="Anexar Áudio">
                              <Music size={16} />
                            </button>

                            <input type="file" ref={mediaInputRef} hidden accept="image/*" onChange={e => setAttachedFiles(h => ({ ...h, image: e.target.files?.[0] || null }))} />
                            <input type="file" ref={audioInputRef} hidden accept="audio/*" onChange={e => setAttachedFiles(h => ({ ...h, audio: e.target.files?.[0] || null }))} />
                          </div>

                          <div className={styles.chatInputWrapper}>
                            <MessageCircle size={16} className={styles.chatIcon} />
                            <input
                              type="text"
                              placeholder="Seu fluxo vai para a Nascente Universal..."
                              value={chatMessage}
                              onChange={(e) => setChatMessage(e.target.value)}
                              className={styles.chatInput}
                              disabled={isSending}
                            />
                          </div>
                          <button
                            type="submit"
                            className={styles.chatSendBtn}
                            disabled={(!chatMessage.trim() && !attachedFiles.image && !attachedFiles.audio) || isSending}
                            style={{ color: chatAction.aura }}
                          >
                            <Send size={18} />
                          </button>
                        </form>
                      </div>
                    </div>
                  )}
                  <div className={`${styles.fluxoTitleWrap} ${styles.upwardShift}`}>
                    {Array.from({ length: 12 }).map((_, i) => {
                      const color = SPARK_COLORS[i];
                      const isBlack = color === null;
                      const activeStyle = sparkActive ? {
                        filter: isBlack
                          ? 'drop-shadow(0 0 6px #fff) drop-shadow(0 0 12px #fff)'
                          : `drop-shadow(0 0 6px ${color}) drop-shadow(0 0 14px ${color})`,
                        opacity: 1,
                      } : {};
                      return (
                        <div
                          key={i}
                          className={styles.sparkRay}
                          style={{
                            transform: `rotate(${i * 30}deg)`,
                            zIndex: 0,
                            transition: 'filter 1.8s ease-out, opacity 1.8s ease-out',
                            ...activeStyle,
                          }}
                          data-color={isBlack ? '#000000' : (color ?? '#fff')}
                          data-active={sparkActive ? '1' : '0'}
                        />
                      );
                    })}

                    <LuaProjetada />
                    <h2 className={styles.fluxoTitle} data-active={sparkActive ? '1' : '0'}>
                      Fluxo de Consciência
                    </h2>
                  </div>
                  <div className={`${styles.pulseRow} ${styles.upwardShift} ${styles.pulseShiftDown}`}>
                    <RealtimePulse 
                      channelName={`profile-${userId}`} 
                      label={profile.status || "Sincronizado"}
                      streak={profile.status_updated_at ? Math.floor((new Date().getTime() - new Date(profile.status_updated_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                    />
                  </div>
                </div>

          <div className={`${styles.feed} ${zenMode ? styles.zenFeed : ''}`}>
            <AnimatePresence>
              {manifestations.length === 0 && (
                <p key="empty-fluxo" className={styles.emptyHint}>O fluxo está silencioso. @{profile.username} ainda não manifestou.</p>
              )}
              {manifestations
                .filter(m => !hiddenPosts.has(m.id))
                .filter(m => {
                  if (!tagFilter) return true;
                  const dbTags = Object.keys(nodeSentiments[m.id] || {})
                    .filter(type => type.startsWith('tag:'))
                    .map(type => type.replace('tag:', ''));
                  const metaTags = m.metadata?.tags || [];
                  return dbTags.includes(tagFilter) || metaTags.includes(tagFilter);
                })
                .map((manifest: any) => {
                const Icon = ACTIONS.find(a => a.id === manifest.type)?.icon || Sparkles;
                const allTags = [...new Set([...(postTags[manifest.id] || []), ...(manifest.metadata?.tags || [])])];
                
                return (
                <motion.div 
                  key={manifest.id}
                  id={`post-${manifest.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className={`${styles.manifestation} glass ${(manifest.metadata as any)?.is_magic ? styles.magicPulse : ''} ${transcendActive ? styles.transcendMode : ''}`}
                  data-window="true"
                  style={{ 
                    transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                    '--vibe-color': transcendActive ? (ACTION_NEON_COLORS[manifest.type] || '#ffffff') : '#ffffff',
                    '--vibe-glow': transcendActive 
                      ? (manifest.type === 'integrar' ? 'rgba(255,255,255,0.4)' : `${ACTION_NEON_COLORS[manifest.type] || '#fff'}44`)
                      : 'rgba(255, 255, 255, 0.25)',
                    '--design-neon': ACTIONS.find(a => a.id === manifest.type)?.aura || '#00f3ff'
                  } as any}
                >
                  <div className={styles.manifestHeader}>
                    <div className={styles.headerColumn}>
                      <span className={styles.username}>
                        @{manifest.profiles?.username || profile.username || `presenca_${manifest.id.slice(0, 4)}`}
                      </span>
                      <span className={styles.timestamp}>
                        <Clock size={10} style={{ marginRight: 4, opacity: 0.5 }} />
                        {new Date(manifest.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        <span style={{ margin: '0 4px', opacity: 0.3 }}>|</span>
                        {new Date(manifest.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                      </span>
                      {/* Tags */}
                      {allTags.length > 0 && (
                        <div className={styles.tagListInHeader} style={{ marginTop: '2px', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {allTags.map((tag, i) => (
                            <span 
                              key={`header-tag-${manifest.id}-${tag}-${i}`} 
                              className={styles.tagChip}
                              onClick={() => setTagFilter(prev => prev === tag ? null : tag)}
                              style={{ fontSize: '0.55rem', padding: '1px 5px' }}
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className={styles.headerColumnRight} style={{ marginLeft: 'auto' }}>
                      {currentUser && currentUser.id === manifest.user_id && (
                        <button 
                          className={styles.deleteBtnMinimal}
                          onClick={() => setNodeToDelete(manifest.id)}
                          title="Soltar Manifestação"
                        >
                          <div 
                            className={styles.soltarCircle}
                            style={{ borderColor: profile.nexo_color || '#00f3ff' }}
                          />
                        </button>
                      )}
                      <span className={styles.actionTagMinimal} title={manifest.type}>
                        <Icon size={12} style={{ color: ACTIONS.find(a => a.id === manifest.type)?.aura }} />
                      </span>
                    </div>
                  </div>
                  
                  {manifest.metadata?.image_url && (
                    <div key={`image-${manifest.id}`} className={styles.feedMedia}>
                      <img 
                        src={manifest.metadata.image_url} 
                        alt="Manifestação" 
                        onClick={() => setFullscreenImage(manifest.metadata.image_url)}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>
                  )}

                  {manifest.content && (
                    <p key={`content-${manifest.id}`} className={styles.content}>
                      {manifest.content.split(/\s+/).map((word: string, i: number) => {
                        const ytId = getYoutubeId(word);
                        if (ytId) {
                          return (
                            <div key={i} className={styles.youtubeEmbed}>
                              <iframe
                                width="100%"
                                height="315"
                                src={`https://www.youtube.com/embed/${ytId}`}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                          );
                        }
                        if (word.startsWith('http')) {
                          return <a key={i} href={word} target="_blank" rel="noopener noreferrer" className={styles.link}>{word} </a>;
                        }
                        return word + " ";
                      })}
                    </p>
                  )}

                  {manifest.metadata?.audio_url && (
                    <div key={`audio-${manifest.id}`} className={styles.audioFeedContainer}>
                      <audio controls src={manifest.metadata.audio_url}>
                        Seu navegador não suporta áudio.
                      </audio>
                    </div>
                  )}

                  {/* Tag Picker UI */}
                  <AnimatePresence>
                    {activeTagPicker === manifest.id && (
                      <motion.div 
                        key={`tag-picker-${manifest.id}`}
                        initial={{ opacity: 0, height: 0, y: -10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        className={styles.tagPickerContainer}
                      >
                        <div className={styles.tagInputWrapper}>
                          <Hash size={14} className={styles.tagIcon} />
                          <input 
                            className={styles.tagInput}
                            placeholder="Adicionar etiqueta..."
                            value={tagInput[manifest.id] || ''}
                            onChange={e => setTagInput(prev => ({...prev, [manifest.id]: e.target.value}))}
                            onKeyDown={e => e.key === 'Enter' && handleAddTag(manifest.id)}
                            autoFocus
                          />
                          <button className={styles.tagAddBtn} onClick={() => handleAddTag(manifest.id)}>
                            <Check size={14} />
                          </button>
                        </div>

                        {/* Tags Existentes com Opção de Remover */}
                        <div className={styles.tagListPreview}>
                          {Object.keys(nodeSentiments[manifest.id] || {})
                            .filter(t => t.startsWith('tag:'))
                            .map(t => {
                              const isOwner = manifest.user_id === currentUser?.id;
                              const userReacted = nodeSentiments[manifest.id][t].userReacted;
                              const canRemove = isOwner || userReacted;

                              return (
                                <span key={`${manifest.id}-${t}`} className={styles.activeTagBadge}>
                                  #{t.replace('tag:', '')}
                                  {canRemove && (
                                    <button 
                                      className={styles.removeTagBtn}
                                      onClick={() => handleRemoveTag(manifest.id, t)}
                                      title={isOwner ? "Remover tag (Dono)" : "Remover minha tag"}
                                    >
                                      <X size={10} />
                                    </button>
                                  )}
                                </span>
                              );
                            })
                          }
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* ── MINI NEXUS FOOTER ─ 12 Ações Funcionais ── */}
                  <div className={styles.miniNexusFooter}>
                    {ACTIONS.map(action => {
                      const ActionIcon = action.icon;
                      const isActive = (
                        (action.id === 'buscar' && activeTagPicker === manifest.id) ||
                        (action.id === 'integrar' && followedUsers.has(manifest.user_id)) ||
                        (action.id === 'perceber' && activeRevealedPost === manifest.id) ||
                        (action.id === 'sentir' && activeSentimentPicker === manifest.id) ||
                        (action.id === 'cuidar' && activeCuidarPicker === manifest.id) ||
                        (action.id === 'observar' && observingManifest?.id === manifest.id)
                      );
                      
                      const isActiveReportOpen = action.id === 'observar' && observingManifest?.id === manifest.id;
                      return (
                        <div key={`action-wrap-${manifest.id}-${action.id}`} className={styles.actionWrapper}>
                          <button
                            className={`${styles.miniNexusBtn} ${isActive ? styles.miniNexusBtnActive : ''}`}
                            onClick={() => handleActionOnPost(action.id, manifest)}
                            title={action.name}
                            style={{ '--action-aura': action.aura } as any}
                          >
                            <ActionIcon size={13} />
                          </button>

                          <AnimatePresence>
                            {isActiveReportOpen && (
                              <motion.div
                                key={`local-report-${manifest.id}`}
                                className={styles.floatingVibrationalReportLocal}
                                initial={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <button className={styles.closeReportBtn} onClick={() => setObservingManifest(null)} style={{ top: '0.5rem', right: '0.5rem' }}>
                                  <X size={14} />
                                </button>
                                <div className={styles.reportHeader}>Relatório Vibracional</div>
                                
                                <div className={styles.reportRow}>
                                  {(() => {
                                    const mId = manifest.id;
                                    const dbs = nodeSentiments[mId] || {};
                                    const reactData = Object.keys(dbs).filter(t => 
                                      !VIRTUES.some(v => v.id === t) && t !== 'apoio'
                                    ).map(t => ({
                                      t,
                                      e: t === 'soltar' ? '💨' : 
                                         t === 'servir' ? '⚓' : 
                                         t === 'perceber' ? '👁️' : 
                                         t === 'buscar' ? '🧭' : 
                                         t === 'conectar' ? '🔗' : 
                                         t === 'integrar' ? '⚛️' : 
                                         t === 'expressar' ? '📣' : 
                                         (t.startsWith('sentir:') ? (FEELING_SYMBOLS.find(f => `sentir:${f.id.toLowerCase()}` === t)?.symbol || '🧠') : 
                                           (t.startsWith('tag:') ? '🏷️' : t)),
                                      c: dbs[t].count,
                                      u: dbs[t].userReacted
                                    }));

                                    const renderedReacts = reactData.map(({ t, e, c, u }) => (
                                      <span 
                                        key={`local-reac-${mId}-${t}`} 
                                        className={`${styles.reportBadge} ${u ? styles.activeBadge : ''}`}
                                        style={{ padding: '0.2rem 0.4rem', fontSize: '0.6rem' }}
                                        onClick={() => handleToggleSentiment(mId, t)}
                                      >
                                        <span className={styles.badgeEmoji}>{e}</span>
                                        <span className={styles.badgeCount}>{c}</span>
                                      </span>
                                    ));

                                    const renderedVirtues = VIRTUES.filter(v => (dbs[v.id]?.count || 0) > 0).map(v => (
                                      <div 
                                        key={`local-virtue-${mId}-${v.id}`} 
                                        className={styles.virtueReportBadge}
                                        style={{ '--virtue-color': v.rgb, fontSize: '0.6rem', padding: '0.2rem 0.5rem' } as any}
                                        onClick={() => handleToggleSentiment(mId, v.id)}
                                      >
                                        <span style={{ fontSize: '0.8rem' }}>{v.icon}</span>
                                        <span className={styles.virtueCount}>{dbs[v.id].count}</span>
                                      </div>
                                    ));

                                    if (renderedReacts.length === 0 && renderedVirtues.length === 0) {
                                      return <div style={{ fontSize: '0.6rem', opacity: 0.4, fontStyle: 'italic', width: '100%', textAlign: 'center' }}>Em repouso.</div>;
                                    }

                                    return [...renderedReacts, ...renderedVirtues];
                                  })()}
                                </div>
                              </motion.div>
                            )}

                            {/* SENTIR Picker (Anchored to button) */}
                            {action.id === 'sentir' && activeSentimentPicker === manifest.id && (
                              <motion.div 
                                key={`feel-picker-${manifest.id}`}
                                className={styles.sentimentPickerOverlay}
                                initial={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                              >
                                <div className={styles.sentimentPickerHeader}>Sintonize seu Sentir</div>
                                <div className={styles.horizontalPickerScroll}>
                                  {FEELING_SYMBOLS.map(f => (
                                    <div 
                                      key={`feel-${manifest.id}-${f.label}`} 
                                      className={styles.sentimentOption}
                                      onClick={() => {
                                        handleToggleSentiment(manifest.id, `sentir:${f.id.toLowerCase()}`);
                                        setActiveSentimentPicker(null);
                                      }}
                                    >
                                      <span style={{ fontSize: '1.2rem' }}>{f.symbol}</span>
                                      <span style={{ fontSize: '0.6rem', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}

                            {/* CUIDAR (EMANAR) Picker (Anchored to button) */}
                            {action.id === 'cuidar' && activeCuidarPicker === manifest.id && (
                              <motion.div
                                key={`care-picker-${manifest.id}`}
                                className={styles.sentimentPickerOverlay}
                                initial={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: '-50%' }}
                                exit={{ opacity: 0, scale: 0.9, y: 10, x: '-50%' }}
                              >
                                <div className={styles.sentimentPickerHeader}>Escolha sua Vibração de Cuidado</div>
                                <div className={styles.horizontalPickerScroll}>
                                  {CARE_EMOJIS.map(({ emoji, label }) => (
                                    <div
                                      key={`care-${manifest.id}-${emoji}`}
                                      className={styles.sentimentOption}
                                      title={label}
                                      onClick={async () => {
                                        setActiveCuidarPicker(null);
                                        if (currentUser) {
                                          handleToggleSentiment(manifest.id, emoji);
                                        }
                                      }}
                                    >
                                      <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                                      <span style={{ fontSize: '0.6rem', opacity: 0.7, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>


                  {/* Repost Display */}
                  <AnimatePresence>
                    {manifest.metadata?.repost_of && manifest.metadata?.repost_snapshot && (
                      <motion.div 
                        key={`repost-${manifest.id}`}
                        className={styles.repostCard}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        onClick={() => {
                          const target = document.getElementById(`post-${manifest.metadata.repost_of}`);
                          if (target) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }}
                      >
                        <div className={styles.repostHeader}>
                          <Compass size={12} className={styles.repostIcon} />
                          <span>Manifestação de @{manifest.metadata.repost_snapshot.author}</span>
                        </div>
                        <div className={styles.repostContent}>
                          {manifest.metadata.repost_snapshot.image && (
                            <div className={styles.repostImage}>
                              <img src={manifest.metadata.repost_snapshot.image} alt="Original" />
                            </div>
                          )}
                          <p>{manifest.metadata.repost_snapshot.content}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Comment Thread (PERCEBER) */}
                  <AnimatePresence>
                    {activeRevealedPost === manifest.id && (
                      <motion.div
                        className={styles.commentThread}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <div className={styles.commentThreadHeader}>
                          <Sun size={13} />
                          <span>Percepções ({postComments[manifest.id]?.length || 0})</span>
                        </div>
                        {(postComments[manifest.id] || []).map((c: any) => (
                          <div key={c.id} className={styles.commentItem}>
                            <span className={styles.commentAuthor}>@{c.profiles?.username || 'voz'}</span>
                            <span className={styles.commentContent}>{c.content}</span>
                          </div>
                        ))}
                        <div className={styles.commentInputRow}>
                          <input
                            className={styles.commentInput}
                            placeholder="Sua percepção..."
                            value={commentDraft[manifest.id] || ''}
                            onChange={e => setCommentDraft(prev => ({...prev, [manifest.id]: e.target.value}))}
                            onKeyDown={e => e.key === 'Enter' && handleSendReply(manifest.id)}
                          />
                          <button className={styles.commentSendBtn} onClick={() => handleSendReply(manifest.id)}>
                            <Send size={13} />
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
            </AnimatePresence>
            </div>
          </div>
        </div>
      </section>
    </div>

      <UserPresence
        manifestations={manifestations}
        showLogout={false}
        showHistory={false}
        initiallyMinimized={true}
        selectedColor={profile?.nexo_color || undefined}
        profile={profile}
        onOpenSettings={() => setIsEditingProfile(true)}
      />

      <AnimatePresence mode="wait">
        {showPresence && (
          <UserPresence 
            key="presence-modal"
            manifestations={manifestations} 
            selectedColor={profile?.nexo_color || undefined}
            targetId={targetProfileId || undefined}
            onClose={() => {
              setShowPresence(false);
              setTargetProfileId(null);
            }} 
            onOpenSettings={() => {
              setShowPresence(false);
              setIsEditingProfile(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* --- UNIFIED NEON TRIANGLES SYSTEM --- */}
      <AnimatePresence>
        {(trianglesActive || hexagramActive) && (
          <div className={`${styles.unifiedTriangleOverlay} ${hexBlinkActive ? styles.hexagramBlinkActive : ''} ${hexFailing ? styles.hexFailing : ''}`}>
            {/* Hexagram White Laser Star */}
            <AnimatePresence>
              {hexagramActive && (
                <motion.div 
                  className={`${styles.whiteLaserStar} ${hexBlinkActive ? styles.hexagramBlinkActive : ''} ${hexFailing ? styles.hexFailing : ''}`}
                  initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.5, rotate: 30 }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  style={{ width: '100vw', height: '100vh' }}
                >
                  <svg viewBox="0 0 1000 1000" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    {(() => {
                      const R = (typeof window !== 'undefined' ? (window.innerHeight / 2) - 55 : 400);
                      const center = 500;
                      const scale = 500 / (typeof window !== 'undefined' ? (window.innerHeight / 2) : 500);
                      const svgR = R * scale;
                      const p1 = { x: center, y: center - svgR };
                      const p2 = { x: center + svgR * 0.866, y: center - svgR * 0.5 };
                      const p3 = { x: center + svgR * 0.866, y: center + svgR * 0.5 };
                      const p4 = { x: center, y: center + svgR };
                      const p5 = { x: center - svgR * 0.866, y: center + svgR * 0.5 };
                      const p6 = { x: center - svgR * 0.866, y: center - svgR * 0.5 };
                      return (
                        <g style={{ filter: 'drop-shadow(0 0 12px white) drop-shadow(0 0 25px rgba(255,255,255,0.4))' }}>
                          <path d={`M${p1.x},${p1.y} L${p3.x},${p3.y} L${p5.x},${p5.y} Z`} fill="none" stroke="white" strokeWidth="2" />
                          <path d={`M${p2.x},${p2.y} L${p4.x},${p4.y} L${p6.x},${p6.y} Z`} fill="none" stroke="white" strokeWidth="2" />
                        </g>
                      );
                    })()}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {[0, 1, 2, 3, 4, 5].map((i) => {
              const hexAngles = [0, 60, 120, 180, 240, 300];
              const hexAngle = hexAngles[i];
              const isHex = hexagramActive;
              const edgeDistY = (typeof window !== 'undefined' ? (window.innerHeight / 2) - 55 : 400);
              let targetX = 0; let targetY = 0; let targetRotate = 0; let scale = 1;
              if (isHex) {
                targetX = Math.sin(hexAngle * Math.PI / 180) * edgeDistY;
                targetY = -Math.cos(hexAngle * Math.PI / 180) * edgeDistY;
                targetRotate = hexAngle;
                scale = (i === 0 || i === 3) ? 1.1 : 0.9;
              }
              return (
                <motion.div
                  key={`unified-tri-${i}`}
                  className={styles.dynamicTriangle}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: scale, x: targetX, y: targetY, rotate: targetRotate }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: isHex ? i * 0.08 : 0 }}
                >
                  <svg viewBox="0 0 100 100" width="100" height="100">
                    <polygon points="50,10 10,90 90,90" fill="rgba(0, 0, 0, 0.75)" stroke="white" strokeWidth="2.5" style={{ filter: 'drop-shadow(0 0 5px white)' }} />
                    {(!isHex || i === 0 || i === 3) && (
                      <circle cx="50" cy="63" r="4" fill="white" className={styles.sparkleLight} />
                    )}
                  </svg>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activeIntegrationSplash && (
          <motion.div 
            key="integration-splash"
            className={styles.integrationOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveIntegrationSplash(null)}
          >
            <motion.div 
              className={styles.integrationSplash}
              initial={{ scale: 0.8, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <div className={styles.splashGlow} />
              <div className={styles.splashContent}>
                <div className={styles.splashAvatarBox}>
                  <img className={styles.splashAvatar} src={activeIntegrationSplash.avatar} alt={activeIntegrationSplash.name} />
                  <div className={styles.avatarRing} />
                </div>
                <h2 className={styles.splashTitle}>Mundos Integrados</h2>
                <p className={styles.splashText}>Você sintonizou com a frequência de <strong>{activeIntegrationSplash.name}</strong></p>
                <div className={styles.revelationBox}>
                  <p className={styles.revelationText}>“{activeIntegrationSplash.phrase}”</p>
                </div>
                <div className={styles.splashFooter}>Zero Day Signal</div>
              </div>
              <button className={styles.closeSplashBtn} onClick={() => setActiveIntegrationSplash(null)}>
                <X size={24} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isEditingProfile && (
          <div className={styles.settingsOverlay}>
            <ProfileSettings 
              onClose={() => setIsEditingProfile(false)} 
              onProfileUpdate={(updated) => {
                setProfile(prev => prev ? { ...prev, ...updated } : updated);
                // O fetchData já é chamado no useEffect de dependência se necessário,
                // mas chamamos aqui para garantir atualização de manifestações
                fetchData();
              }}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Modal de Confirmação para Soltar */}
      <AnimatePresence>
        {nodeToDelete && (
          <motion.div
            className={styles.confirmOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.confirmModal}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <h3>Soltar Manifestação?</h3>
              <p>Esta ação irá desvincular permanentemente esta manifestação do fluxo universal. Deseja prosseguir?</p>

              <div className={styles.confirmActions}>
                <button className={styles.cancelBtn} onClick={() => setNodeToDelete(null)}>Permanecer</button>
                <button className={styles.confirmSoltarBtn} onClick={() => nodeToDelete && handleDeleteNode(nodeToDelete)}>Soltar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
