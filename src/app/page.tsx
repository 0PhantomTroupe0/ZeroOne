"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Fingerprint, Activity, Compass, Share2, 
  Zap, Sun, Anchor, Eye, 
  Wind, Atom, Palette, Sparkles,
  MoreHorizontal, X, Plus, Send, MessageCircle,
  ImageIcon, Music, Film, Trash2,
  Heart, Target, Cloud, HelpCircle, Info, Flag, Microscope,
  Gem, Shield, Scale, SunMedium, Flame, Coins, Droplets, Leaf,
  Hash, Check, Star, Lock, Ghost, Link, Repeat2, Waves, Clock
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import ManifestationCreator from "@/components/ManifestationCreator";
import UserPresence from "@/components/UserPresence";
import { WelcomeGuide } from '@/components/WelcomeGuide';
import ProfileSettings from "@/components/ProfileSettings";
import StoryBar from "@/components/StoryBar";
import UserSearch from "@/components/UserSearch";
import RealtimePulse from "@/components/RealtimePulse";
import LuaProjetada from "@/components/LuaProjetada";
import StarField from "@/components/StarField";
import SpiritualWater from "@/components/SpiritualWater";
import styles from "./page.module.css";

const ACTIONS = [
  { id: 'perceber', name: "Perceber", aura: "var(--aura-perceive)", icon: Sun },
  { id: 'observar', name: "Observar", aura: "var(--aura-observe)", icon: Eye },
  { id: 'sentir', name: "Sentir", aura: "var(--aura-feel)", icon: Activity },
  { id: 'servir', name: "Agregar", aura: "var(--aura-serve)", icon: Plus },
  { id: 'conectar', name: "Harmonizar", aura: "var(--aura-connect)", icon: Share2 },
  { id: 'expressar', name: "Expressar", aura: "var(--aura-express)", icon: Repeat2 },
  { id: 'criar', name: "Criar", aura: "var(--aura-create)", icon: Palette },
  { id: 'buscar', name: "Sincronizar", aura: "var(--aura-seek)", icon: Compass },
  { id: 'cuidar', name: "Emanar", aura: "var(--aura-care)", icon: Waves },
  { id: 'integrar', name: "Entrelaçar", aura: "var(--aura-integrate)", icon: Link },
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

const getYoutubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

const MOON_PHASES = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];

// 12 cores para os 12 feixes (null = preto com neon branco)
const SPARK_COLORS = [
  '#ff2200', // Vermelho
  '#ff6600', // Laranja
  '#ffdd00', // Amarelo
  '#aaff00', // Amarelo-Verde
  '#00ff44', // Verde
  '#00ffff', // Ciano
  '#0055ff', // Azul
  '#3300ff', // Índigo
  '#8800ee', // Roxo
  '#ff00cc', // Magenta
  null,       // Preto com neon branco
  '#ffffff', // Branco
];

const ACTION_NEON_COLORS: Record<string, string> = {
  'perceber': '#ff0000',
  'observar': '#ff6600',
  'sentir': '#ffdd00',
  'buscar': '#aaff00',
  'conectar': '#00ff44',
  'expressar': '#00ffff',
  'criar': '#0055ff',
  'cuidar': '#3300ff',
  'servir': '#8800ee',
  'soltar': '#ff00cc',
  'integrar': '#000000',
  'transcender': '#ffffff',
  // Novos tipos de Busca (Pecados <-> Virtudes)
  'humildade': '#ff0000',    // Soberba <-> Humildade
  'generosidade': '#ff6600', // Avareza <-> Generosidade
  'disciplina': '#ffdd00',   // Preguiça <-> Disciplina
  'pureza': '#00ff44',       // Luxúria <-> Pureza
  'gratidao': '#00ffff',     // Inveja <-> Gratidão
  'temperanca': '#0055ff',   // Gula <-> Temperança
  'serenidade': '#8800ee',   // Ira <-> Serenidade
  'natureza': '#ffffff',      // Natureza <-> Fantasia
};

const DAILY_JUDGE_CONFIG: Record<number, { 
  id: string, 
  name: string, 
  avatar: string, 
  title: string, 
  aura: string,
  type: string,
  phrases: Record<string, string> 
}> = {
  // 0: Domingo - Lucemon
  0: {
    id: '00000000-0000-0000-0000-000000000002',
    name: 'Lucemon',
    avatar: '/personagens/LucemonF.png',
    title: 'Pecado do Orgulho',
    aura: 'var(--aura-express)',
    type: 'expressar',
    phrases: {
      'cuidar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'sentir': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'buscar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'conectar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'expressar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'perceber': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'servir': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'observar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'soltar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'integrar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'criar': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
      'transcender': "Eu te faço acreditar que você já chegou no topo… cuidado comigo.",
    }
  },
  // 1: Segunda - Barbamon
  1: {
    id: '00000000-0000-0000-0000-000000000003',
    name: 'Barbamon',
    avatar: '/personagens/BarbamonT.png',
    title: 'Pecado da Ganância',
    aura: 'var(--aura-seek)',
    type: 'buscar',
    phrases: {
      'cuidar': "Eu te prometo segurança… mas te prendo na escassez.",
      'sentir': "Eu te prometo segurança… mas te prendo na escassez.",
      'buscar': "Eu te prometo segurança… mas te prendo na escassez.",
      'conectar': "Eu te prometo segurança… mas te prendo na escassez.",
      'expressar': "Eu te prometo segurança… mas te prendo na escassez.",
      'perceber': "Eu te prometo segurança… mas te prendo na escassez.",
      'servir': "Eu te prometo segurança… mas te prendo na escassez.",
      'observar': "Eu te prometo segurança… mas te prendo na escassez.",
      'soltar': "Eu te prometo segurança… mas te prendo na escassez.",
      'integrar': "Eu te prometo segurança… mas te prendo na escassez.",
      'criar': "Eu te prometo segurança… mas te prendo na escassez.",
      'transcender': "Eu te prometo segurança… mas te prendo na escassez.",
    }
  },
  // 2: Terça - Leviamon
  2: {
    id: '00000000-0000-0000-0000-000000000004',
    name: 'Leviamon',
    avatar: '/personagens/LeviamonT.png',
    title: 'Pecado da Apatia',
    aura: 'var(--aura-feel)',
    type: 'sentir',
    phrases: {
      'cuidar': "Eu te faço confortável… enquanto sua vida para.",
      'sentir': "Eu te faço confortável… enquanto sua vida para.",
      'buscar': "Eu te faço confortável… enquanto sua vida para.",
      'conectar': "Eu te faço confortável… enquanto sua vida para.",
      'expressar': "Eu te faço confortável… enquanto sua vida para.",
      'perceber': "Eu te faço confortável… enquanto sua vida para.",
      'servir': "Eu te faço confortável… enquanto sua vida para.",
      'observar': "Eu te faço confortável… enquanto sua vida para.",
      'soltar': "Eu te faço confortável… enquanto sua vida para.",
      'integrar': "Eu te faço confortável… enquanto sua vida para.",
      'criar': "Eu te faço confortável… enquanto sua vida para.",
      'transcender': "Eu te faço confortável… enquanto sua vida para.",
    }
  },
  // 3: Quarta - Beelzemon
  3: {
    id: '00000000-0000-0000-0000-000000000005',
    name: 'Beelzemon',
    avatar: '/personagens/BeelzemonT.png',
    title: 'Pecado da Inveja',
    aura: 'var(--aura-care)',
    type: 'cuidar',
    phrases: {
      'cuidar': "Eu te faço olhar para o outro… e esquecer de si.",
      'sentir': "Eu te faço olhar para o outro… e esquecer de si.",
      'buscar': "Eu te faço olhar para o outro… e esquecer de si.",
      'conectar': "Eu te faço olhar para o outro… e esquecer de si.",
      'expressar': "Eu te faço olhar para o outro… e esquecer de si.",
      'perceber': "Eu te faço olhar para o outro… e esquecer de si.",
      'servir': "Eu te faço olhar para o outro… e esquecer de si.",
      'observar': "Eu te faço olhar para o outro… e esquecer de si.",
      'soltar': "Eu te faço olhar para o outro… e esquecer de si.",
      'integrar': "Eu te faço olhar para o outro… e esquecer de si.",
      'criar': "Eu te faço olhar para o outro… e esquecer de si.",
      'transcender': "Eu te faço olhar para o outro… e esquecer de si.",
    }
  },
  // 4: Quinta - Belphemon
  4: {
    id: '00000000-0000-0000-0000-000000000007',
    name: 'Belphemon',
    avatar: '/personagens/BelphemonT.png',
    title: 'Pecado da Gula',
    aura: 'var(--aura-service)',
    type: 'servir',
    phrases: {
      'cuidar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'sentir': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'buscar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'conectar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'expressar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'perceber': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'servir': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'observar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'soltar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'integrar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'criar': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
      'transcender': "Eu nunca estou satisfeito… e ensino você a nunca estar também.",
    }
  },
  // 5: Sexta - Lilithmon
  5: {
    id: '00000000-0000-0000-0000-000000000006',
    name: 'Lilithmon',
    avatar: '/personagens/LilithmonT.png',
    title: 'Pecado da Luxúria',
    aura: 'var(--aura-connect)',
    type: 'conectar',
    phrases: {
      'cuidar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'sentir': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'buscar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'conectar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'expressar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'perceber': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'servir': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'observar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'soltar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'integrar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'criar': "Eu te confundo com prazer… mas te esvazio por dentro.",
      'transcender': "Eu te confundo com prazer… mas te esvazio por dentro.",
    }
  },
  // 6: Sábado - Daemon
  6: {
    id: '00000000-0000-0000-0000-000000000008',
    name: 'Daemon',
    avatar: '/personagens/DaemonT.png',
    title: 'Pecado da Raiva',
    aura: 'var(--aura-observe)',
    type: 'observar',
    phrases: {
      'cuidar': "Eu te dou força… mas tiro seu controle.",
      'sentir': "Eu te dou força… mas tiro seu controle.",
      'buscar': "Eu te dou força… mas tiro seu controle.",
      'conectar': "Eu te dou força… mas tiro seu controle.",
      'expressar': "Eu te dou força… mas tiro seu controle.",
      'perceber': "Eu te dou força… mas tiro seu controle.",
      'servir': "Eu te dou força… mas tiro seu controle.",
      'observar': "Eu te dou força… mas tiro seu controle.",
      'soltar': "Eu te dou força… mas tiro seu controle.",
      'integrar': "Eu te dou força… mas tiro seu controle.",
      'criar': "Eu te dou força… mas tiro seu controle.",
      'transcender': "Eu te dou força… mas tiro seu controle.",
    }
  }
};

const MON_MAPPING: Record<string, { name: string; image: string; label: string; phrase: string }> = {
  'cuidar': { name: 'Beelzemon', image: '/personagens/BeelzemonT.png', label: 'Inveja', phrase: "Eu te faço olhar para o outro… e esquecer de si." },
  'sentir': { name: 'Leviamon', image: '/personagens/LeviamonT.png', label: 'Apatia', phrase: "Eu te faço confortável… enquanto sua vida para." },
  'buscar': { name: 'Barbamon', image: '/personagens/BarbamonT.png', label: 'Ganância', phrase: "Eu te prometo segurança… mas te prendo na escassez." },
  'conectar': { name: 'Lilithmon', image: '/personagens/LilithmonT.png', label: 'Luxúria', phrase: "Eu te confundo com prazer… mas te esvazio por dentro." },
  'expressar': { name: 'Lucemon', image: '/personagens/LucemonF.png', label: 'Orgulho', phrase: "Eu te faço acreditar que você já chegou no topo… cuidado comigo." },
  'perceber': { name: 'Ilusionmon', image: '/personagens/IlusiomonsT.png', label: 'Matrix', phrase: "Eu não minto… eu só mostro o que você quer acreditar." },
  'servir': { name: 'Belphemon', image: '/personagens/BelphemonT.png', label: 'Gula', phrase: "Eu nunca estou satisfeito… e ensino você a nunca estar também." },
  'observar': { name: 'Daemon', image: '/personagens/DaemonT.png', label: 'Raiva', phrase: "Eu te dou força… mas tiro seu controle." },
  'soltar': { name: 'Leviamon', image: '/personagens/LeviamonT.png', label: 'Apatia', phrase: "Eu te faço confortável… enquanto sua vida para." },
  'integrar': { name: 'Lucemon', image: '/personagens/LucemonF.png', label: 'Orgulho', phrase: "Eu te faço acreditar que você já chegou no topo… cuidado comigo." },
  'criar': { name: 'Ilusionmon', image: '/personagens/IlusiomonsT.png', label: 'Matrix', phrase: "Eu não minto… eu só mostro o que você quer acreditar." },
  'transcender': { name: 'Lucemon', image: '/personagens/LucemonF.png', label: 'Orgulho', phrase: "Eu te faço acreditar que você já chegou no topo… cuidado comigo." },
};

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

const FEELING_SYMBOLS = [
  { symbol: '❤', label: 'Amor' },
  { symbol: '✧', label: 'Admiração' },
  { symbol: '⌬', label: 'Inveja' },
  { symbol: '☍', label: 'Ciúmes' },
  { symbol: '⚖', label: 'Respeito' },
  { symbol: '✦', label: 'Gratidão' },
  { symbol: '☇', label: 'Raiva' },
  { symbol: 'ø', label: 'Desprezo' },
  { symbol: '۞', label: 'Empatia' },
  { symbol: '⬢', label: 'Confiança' },
  { symbol: '⚉', label: 'Medo' },
  { symbol: '☸', label: 'Compaixão' },
];

const CARE_EMOJIS = [
  { emoji: '⊚', label: 'Paz' },
  { emoji: '❣', label: 'Amor' },
  { emoji: '⚜', label: 'Compaixão' },
  { emoji: '✣', label: 'Perdão' },
  { emoji: '✤', label: 'Gratidão' },
  { emoji: '☼', label: 'Clareza' },
  { emoji: '⬓', label: 'Força' },
  { emoji: '⛨', label: 'Proteção' },
  { emoji: '✵', label: 'Esperança' },
  { emoji: '◎', label: 'Verdade' },
  { emoji: '⦿', label: 'Presença' },
  { emoji: '♾', label: 'Harmonia' },
];

function HomeContent() {
  const router = useRouter(); 
  const searchParams = useSearchParams();
  const searchTag = searchParams.get('tag');

  const [user, setUser] = useState<any>(null);
  const [chatAction, setChatAction] = useState(ACTIONS[2]);
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(true);
  const [currentAura, setCurrentAura] = useState(ACTIONS[3].aura);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showPresence, setShowPresence] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showNexus, setShowNexus] = useState(false);
  const [manifestations, setManifestations] = useState<any[]>([]);
  const [chatMessage, setChatMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<{
    image: File | null;
    audio: File | null;
  }>({ image: null, audio: null });
  
  const mediaInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);

  const [targetProfileId, setTargetProfileId] = useState<string | null>(null);
  const [showAuraSelector, setShowAuraSelector] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [activeMon, setActiveMon] = useState<any>(null);
  const [lucemonMessage, setLucemonMessage] = useState<string | null>(null);
  const [activeBot, setActiveBot] = useState<{ id: string, name: string, avatar: string, title: string } | null>(null);
  const [nodeSentiments, setNodeSentiments] = useState<Record<string, any>>({});
  const [activeSentimentPicker, setActiveSentimentPicker] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [moonPhaseIdx, setMoonPhaseIdx] = useState(0);
  const [sparkActive, setSparkActive] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [selectedDesignColor, setSelectedDesignColor] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nexus_design_color');
      return saved || '#ffffff';
    }
    return '#ffffff';
  });
  const [showDesignPicker, setShowDesignPicker] = useState(false);
  const [showRealStories, setShowRealStories] = useState(false);
  const [laserActive, setLaserActive] = useState(false);
  const [trianglesActive, setTrianglesActive] = useState(false);
  const [triangleLaserActive, setTriangleLaserActive] = useState(false);
  const [profileGlitchActive, setProfileGlitchActive] = useState(false);
  const [redLaserActive, setRedLaserActive] = useState(false);
  const [blueLaserReturning, setBlueLaserReturning] = useState(false);
  const [redLaserReturning, setRedLaserReturning] = useState(false);
  const [hexagramActive, setHexagramActive] = useState(false);
  const [ritualSixSec, setRitualSixSec] = useState(false);
  const [sparkCount, setSparkCount] = useState(0);
  const [hexBlinkActive, setHexBlinkActive] = useState(false);
  const [hexFailing, setHexFailing] = useState(false);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);

  // Logo physics
  const [logoHovered, setLogoHovered] = useState(false);
  const logoRotation = useRef(0);
  const logoSpeed = useRef(0.1);
  const logoRef = useRef<HTMLImageElement>(null);
  const wasHovered = useRef(false);

  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = Math.min(time - lastTime, 50); // cap delta to avoid massive spikes
      lastTime = time;

      if (logoHovered) {
        if (!wasHovered.current) {
          logoSpeed.current = 0.1; // reset to 0.1 as soon as hover starts
          wasHovered.current = true;
        }
        // Aceleração linear exata baseada em tempo: aumenta 1.5 unidades a cada 1 segundo (1000ms)
        logoSpeed.current += 1.5 * (delta / 1000);
        // Speed cap to avoid infinite breaking speeds
        if (logoSpeed.current > 12) logoSpeed.current = 12;
      } else {
        wasHovered.current = false;
        // Desaceleração macia até voltar ao repouso inicial de 0.1
        logoSpeed.current -= 2.0 * (delta / 1000);
        if (logoSpeed.current < 0.1) logoSpeed.current = 0.1;
      }

      logoRotation.current += logoSpeed.current * (delta / 16.66);
      
      if (logoRef.current) {
        logoRef.current.style.transform = `rotate(${logoRotation.current}deg)`;
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, [logoHovered]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nexus_design_color', selectedDesignColor);
    }

    // Se Transcendência estiver ativa, a cor do sistema segue a aura do "Ressoar como"
    // Caso contrário, segue a cor selecionada no Nexo Cromático
    const baseColor = (hexagramActive && chatAction) ? (chatAction.aura.startsWith('var') ? getComputedStyle(document.documentElement).getPropertyValue(chatAction.aura.slice(4, -1)).trim() : chatAction.aura) : selectedDesignColor;
    
    document.documentElement.style.setProperty('--design-color', baseColor || '#ffffff');
    const neonColor = (baseColor === '#000000' || !baseColor) ? '#ffffff' : baseColor;
    document.documentElement.style.setProperty('--design-neon', neonColor);
    
    const buttonText = (baseColor === '#000000' || !baseColor) ? '#ffffff' : '#000000';
    document.documentElement.style.setProperty('--button-text', buttonText);

    // Sincronizar Natureza <-> Fantasia com a cor do Nexo Cromático
    ACTION_NEON_COLORS.natureza = selectedDesignColor;
    const naturezaAction = SEARCH_ACTIONS.find(a => a.id === 'natureza');
    if (naturezaAction) {
      naturezaAction.aura = selectedDesignColor;
    }
  }, [selectedDesignColor, hexagramActive, chatAction]);

  // === 12 FUNCTIONAL ACTIONS STATE ===
  const [zenMode, setZenMode] = useState(false);
  const [tagFilter, setTagFilterState] = useState<string | null>(searchTag);
  const [hiddenPosts, setHiddenPosts] = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [activeRevealedPost, setActiveRevealedPost] = useState<string | null>(null);
  const [nodeToDelete, setNodeToDelete] = useState<string | null>(null);
  const [postComments, setPostComments] = useState<Record<string, any[]>>({});
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [postTags, setPostTags] = useState<Record<string, string[]>>({});
  const [tagInput, setTagInput] = useState<Record<string, string>>({});
  const [activeTagPicker, setActiveTagPicker] = useState<string | null>(null);
  const [activeCuidarPicker, setActiveCuidarPicker] = useState<string | null>(null);
  const [repostTarget, setRepostTarget] = useState<{ id: string, author: string, content: string, image?: string } | null>(null);
  const [activeIntegrationSplash, setActiveIntegrationSplash] = useState<{ name: string; avatar: string; phrase: string } | null>(null);
  const [spiritualNotice, setSpiritualNotice] = useState<string | null>(null);
  const [transcendActive, setTranscendActive] = useState(false);
  const [observingManifest, setObservingManifest] = useState<any>(null);

  // === PAGINATION STATE ===
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sincronizar estado local com a URL
  useEffect(() => {
    setTagFilterState(searchTag);
  }, [searchTag]);

  const setTagFilter = (tag: string | null | ((prev: string | null) => string | null)) => {
    let newTag: string | null;
    if (typeof tag === 'function') {
      newTag = tag(tagFilter);
    } else {
      newTag = tag;
    }

    if (newTag) {
      router.push(`/?tag=${newTag}`);
    } else {
      router.push('/');
    }
  };

  // Unified Harmonic Ritual: Sync with Nascente Spells
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Trigger the standard Spark (Nascente Blink)
      setSparkActive(true);
      setTimeout(() => setSparkActive(false), 1000);
      
      setSparkCount(prev => {
        const next = prev + 1;
        
        // At 2nd spark (14s), queue lasers for 20s mark (6s later)
        if (next === 2) {
          setTimeout(() => {
            setRitualSixSec(true);
            setTimeout(() => setRitualSixSec(false), 1200);
          }, 6000); // 14s + 6s = 20s
        }
        
        // At 3rd spark (21s), trigger Mega Hexagram Blink
        if (next === 3) {
          setHexBlinkActive(true);
          setTimeout(() => setHexFailing(true), 1000);
          setTimeout(() => {
            setHexBlinkActive(false);
            setHexFailing(false);
          }, 4000);
          return 0; // Reset cycle
        }
        
        return next;
      });
    }, 7000);
    return () => clearInterval(interval);
  }, [trianglesActive]);

  useEffect(() => {
    const timer = setInterval(() => {
      setMoonPhaseIdx(prev => (prev + 1) % 8);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkUser = async () => {
    const { data: { user: _user } } = await supabase.auth.getUser();
    if (!_user) {
      router.push('/auth');
    } else {
      setUser(_user);
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', _user.id)
        .single();
      
      if (profile) {
        setProfile(profile);
      }
      
      fetchFollowedUsers(_user.id);
      setLoading(false);
      fetchManifestations(searchTag || undefined);
      
      if (!profile || !profile.username) {
        setShowSettings(true);
      }
    }
  };

  const fetchRecentUsers = async () => {
    try {
      // Busca os usuários baseados nas postagens mais recentes
      const { data, error } = await supabase
        .from('consciousness_nodes')
        .select(`
          user_id,
          created_at,
          profiles:user_id (id, username, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Filtrar para ter apenas usuários únicos e pegar os 8 primeiros
      const uniqueUsers: any[] = [];
      const usedIds = new Set();
      
      for (const node of (data || [])) {
        const user = (node as any).profiles;
        if (user && !usedIds.has(user.id)) {
          uniqueUsers.push(user);
          usedIds.add(user.id);
        }
        if (uniqueUsers.length === 8) break;
      }
      
      setRecentUsers(uniqueUsers);
    } catch (err) {
      console.error("Erro ao buscar usuários recentes:", err);
    }
  };

  useEffect(() => {
    if (showRealStories) {
      fetchRecentUsers();
    }
  }, [showRealStories]);

  useEffect(() => {
    checkUser();
    
    // Suporte para abrir configurações via URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('settings') === 'true') {
      setShowSettings(true);
      window.history.replaceState({}, '', '/');
    }
  }, []);

  useEffect(() => {
    fetchManifestations(tagFilter || undefined);
  }, [tagFilter]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('universal-fluxo')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'consciousness_nodes' }, 
        (payload) => {
          const newNode = payload.new as any;
          // Se for uma resposta, não adicionar ao feed principal
          if (newNode.metadata?.reply_to) return;
          // Se for um tipo reativo, não adicionar ao feed principal
          if (newNode.type === 'perceber' || newNode.type === 'observar') return;

          setManifestations(prev => [newNode, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const fetchManifestations = async (tag?: string, append: boolean = false) => {
    if (isLoadingMore || (append && !hasMore)) return;

    try {
      if (!append) {
        setHasMore(true);
      } else {
        setIsLoadingMore(true);
      }

      let nodeIdsToFetch: string[] = [];

      if (tag) {
        // 1. Buscar IDs na tabela de sentimentos (tags colaborativas)
        const { data: taggedSentiments } = await supabase
          .from('node_sentiments')
          .select('node_id')
          .eq('sentiment_type', `tag:${tag}`);
        
        const sentimentIds = taggedSentiments?.map(s => s.node_id) || [];

        // 2. Buscar IDs na tabela de nós (tags de metadados)
        const { data: metaNodes } = await supabase
          .from('consciousness_nodes')
          .select('id')
          .contains('metadata', { tags: [tag] });
        
        const metaIds = metaNodes?.map(n => n.id) || [];

        // 3. Combinar IDs únicos
        nodeIdsToFetch = [...new Set([...sentimentIds, ...metaIds])];

        if (nodeIdsToFetch.length === 0) {
          setManifestations([]);
          setHasMore(false);
          return;
        }
      }

      const PAGE_SIZE = 12;
      const currentOffset = append ? manifestations.length : 0;

      // 4. Buscar as manifestações finais com perfis, filtrando respostas e ações puramente reativas
      let query = supabase
        .from('consciousness_nodes')
        .select('*, profiles(username, avatar_url)')
        .is('metadata->reply_to', null) // Excluir comentários do feed principal
        .not('type', 'in', '("perceber", "observar")') // Excluir tipos reativos do feed principal
        .order('created_at', { ascending: false })
        .range(currentOffset, currentOffset + PAGE_SIZE - 1);



      if (tag) {
        query = query.in('id', nodeIdsToFetch);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (data) {
        if (append) {
          setManifestations(prev => [...prev, ...data]);
        } else {
          setManifestations(data);
        }
        
        if (data.length < PAGE_SIZE) {
          setHasMore(false);
        }
        
        fetchSentiments(data.map(m => m.id));
      }
    } catch (err) {
      console.error("Erro ao buscar manifestações:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Hover Triggered Load with 1s delay
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, []);

  const handlePointerEnterLimit = () => {
    if (hasMore && !isLoadingMore && !scrollTimeoutRef.current) {
      scrollTimeoutRef.current = setTimeout(() => {
        fetchManifestations(tagFilter || undefined, true);
        scrollTimeoutRef.current = null;
      }, 1000); // 1 second "sustain"
    }
  };

  const handlePointerLeaveLimit = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
      scrollTimeoutRef.current = null;
    }
  };

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
        if (s.user_id === user?.id) counts[s.node_id][s.sentiment_type].userReacted = true;
      });
      setNodeSentiments(prev => ({ ...prev, ...counts }));
    }
  };

  const handleToggleSentiment = async (nodeId: string, type: string) => {
    if (!user) return;

    try {
      const existing = nodeSentiments[nodeId]?.[type]?.userReacted;
      
      // Criar lista de tipos para limpar (ex: se é carícia, apagar outras carícias)
      const typesToClear = [type];
      
      // Se for uma virtude, não remove as outras. Mas se for uma reação carinho, remove as outras reações.
      
      const { error: deleteError } = await supabase
        .from('node_sentiments')
        .delete()
        .eq('user_id', user.id)
        .eq('node_id', nodeId)
        .in('sentiment_type', typesToClear);

      if (deleteError) throw deleteError;

      if (!existing) {
        const { error: insertError } = await supabase
          .from('node_sentiments')
          .insert([{ user_id: user.id, node_id: nodeId, sentiment_type: type }]);
        
        // Se der conflito (já existir), ignoramos pois já está ok
        if (insertError && insertError.code !== '23505') {
          throw insertError;
        }
      }
      
      fetchSentiments([nodeId]);
    } catch (err) {
      console.error("Erro ao sincronizar sentir:", err);
    }
  };

  const handleIntegrateWorld = async (targetUserId: string) => {
    try {
      const { data: { user: _user } } = await supabase.auth.getUser();
      if (!_user) {
        setSpiritualNotice("Harmonização necessária para integração.");
        return;
      }
      
      if (_user.id === targetUserId) {
        setSpiritualNotice("Você já habita sua própria essência.");
        return;
      }

      // -- Lógica Especial para Bots (Conta Simulada) --
      const bot = SIMULATED_ACCOUNTS[targetUserId];
      if (bot) {
        // Criar pedido já aceito
        await supabase.from('world_requests').insert({
          requester_id: _user.id,
          target_id: targetUserId,
          status: 'accepted'
        });

        // Criar conexão de seguimento
        await supabase.from('user_follows').insert({
          follower_id: _user.id,
          following_id: targetUserId
        });

        // Atualizar estado local de seguidos
        setFollowedUsers(prev => new Set([...Array.from(prev), targetUserId]));

        // Disparar Splash de Sucesso (Persistente)
        setActiveIntegrationSplash(bot);
        return;
      }

      // 1. Verificar se já existe conexão aceita (follow)
      const { data: follow } = await supabase
        .from('user_follows')
        .select('*')
        .eq('follower_id', _user.id)
        .eq('following_id', targetUserId)
        .single();

      if (follow) {
        setSpiritualNotice("Integração já estabelecida nesta frequência.");
        return;
      }

      // 2. Verificar se já existe pedido pendente
      const { data: existing } = await supabase
        .from('world_requests')
        .select('*')
        .eq('requester_id', _user.id)
        .eq('target_id', targetUserId)
        .single();

      if (existing) {
        if (existing.status === 'pending') setSpiritualNotice("Seu sinal de sintonização ainda está ecoando...");
        else if (existing.status === 'denied') setSpiritualNotice("Consciência em isolamento facultativo.");
        return;
      }

      // 3. Criar pedido
      const { error: requestError } = await supabase
        .from('world_requests')
        .insert({
          requester_id: _user.id,
          target_id: targetUserId,
          status: 'pending'
        });

      if (requestError) throw requestError;

      // 4. Buscar nome do requerente para a notificação
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', _user.id)
        .single();

      // 5. Criar notificação para o alvo
      await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: 'world_request',
          title: 'Nova Sintonização',
          content: `${profileData?.username || 'Uma consciência'} quer entrar no seu mundo.`,
          link: `/profile/${_user.id}`,
          is_read: false
        });

      setSpiritualNotice("Pedido de integração propagado ao nexo alvo.");
    } catch (err) {
      console.error("Erro ao integrar mundo:", err);
    }
  };

  const fetchFollowedUsers = async (uid: string) => {
    try {
      const { data } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', uid);
      if (data) {
        setFollowedUsers(new Set(data.map(f => f.following_id)));
      }
    } catch (err) {
      console.error("Erro ao buscar conexões:", err);
    }
  };

  const handleConfirmDelete = async (id: string) => {
    try {
      // Guardamos o estado anterior para reversão em caso de erro
      const previousManifestations = [...manifestations];

      // 1. Otimismo Místico: Removemos instantaneamente do feed local
      setManifestations(prev => prev.filter(m => m.id !== id));
      
      // 2. Extinção Definitiva: Apagamos do banco de dados (Nascente Universal)
      const { error } = await supabase
        .from('consciousness_nodes')
        .delete()
        .eq('id', id);

      if (error) {
        // Reverter em caso de erro no servidor
        setManifestations(previousManifestations);
        throw error;
      }
      
      setNodeToDelete(null);
    } catch (err: any) {
      console.error("Erro ao soltar manifestação:", err);
      const errorMsg = err.message || "Falha técnica";
      setSpiritualNotice(`O Vazio recusou o desapego: ${errorMsg}`);
      // Recarregar para garantir sincronia
      fetchManifestations(tagFilter || undefined);
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
      // 🤝 CONECTAR → adicionar tag ao post (substituindo o antigo Seguir)
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
        // Abrir chat/scroll para o campo se necessário
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        break;
      }
      // 👁️ PERCEBER → revelar contexto/comentários
      case 'perceber': {
        const isOpening = activeRevealedPost !== manifest.id;
        setActiveRevealedPost(isOpening ? manifest.id : null);
        
        // Registrar vibração de percepção
        handleToggleSentiment(manifest.id, 'perceber');
        
        if (isOpening) {
          // Close others
          setActiveCuidarPicker(null);
          setActiveSentimentPicker(null);

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
      // 🙏 SERVIR → reagir (gerar XP) e abrir perfil
      case 'servir': {
        if (manifest.id) {
          handleToggleSentiment(manifest.id, 'servir');
        }
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
          if (manifest.user_id === user?.id) {
            setNodeToDelete(manifest.id);
          } else {
            handleToggleSentiment(manifest.id, 'soltar');
          }
        }
        break;
      }
      // 🔗 INTEGRAR → Pedir para entrar no mundo
      case 'integrar': {
        if (manifest.user_id) {
          handleIntegrateWorld(manifest.user_id);
        }
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
      // 🌌 TRANSCENDER → Ritual de Geometria Sagrada (Hexagrama)
      case 'transcender': {
        setHexagramActive(prev => !prev);
        setTranscendActive(prev => !prev);
        const tags = postTags[manifest.id] || manifest.metadata?.tags || [];
        if (tags.length > 0) {
          setTagFilterState(prev => prev === tags[0] ? null : tags[0]);
        }
        break;
      }
    }
  };

  const handleAddTag = async (manifestId: string) => {
    const rawTag = tagInput[manifestId]?.trim();
    if (!rawTag || !user) return;
    
    // Remover # se houver e normalizar
    const tag = rawTag.startsWith('#') ? rawTag.slice(1) : rawTag;
    
    const { error } = await supabase
      .from('node_sentiments')
      .insert([{ 
        user_id: user.id, 
        node_id: manifestId, 
        sentiment_type: `tag:${tag}`
      }]);
    
    if (error && error.code !== '23505') {
      console.error("Erro ao adicionar etiqueta:", error);
    }
    
    fetchSentiments([manifestId]);
    
    // Limpar e fechar
    setTagInput(prev => ({...prev, [manifestId]: ''}));
    
    // Visual feedback
    const el = document.getElementById(`post-${manifestId}`);
    if (el) {
      el.style.boxShadow = '0 0 30px var(--design-neon)';
      setTimeout(() => { el.style.boxShadow = ''; }, 1000);
    }
  };

  const handleRemoveTag = async (nodeId: string, type: string) => {
    if (!user) return;
    const isOwner = manifestations.find(m => m.id === nodeId)?.user_id === user.id;
    
    let query = supabase.from('node_sentiments').delete().eq('node_id', nodeId).eq('sentiment_type', type);
    
    // Se não for o dono, só pode remover a PRÓPRIA tag
    if (!isOwner) {
      query = query.eq('user_id', user.id);
    }
    
    await query;
    fetchSentiments([nodeId]);
  };

  const handleSendReply = async (manifestId: string) => {
    const content = commentDraft[manifestId]?.trim();
    if (!content || !user) return;
    const { data } = await supabase.from('consciousness_nodes').insert([{
      user_id: user.id,
      content,
      type: 'perceber',
      metadata: { reply_to: manifestId, aura: 'var(--aura-perceive)' }
    }]).select('*, profiles(username, avatar_url)').single();
    if (data) {
      setPostComments(prev => ({ ...prev, [manifestId]: [...(prev[manifestId] || []), data] }));
    }
    setCommentDraft(prev => ({ ...prev, [manifestId]: '' }));
  };

  const handleActionClick = (actionId: string) => {
    // Bloqueio de ações reativas na criação global (Perceber e Observar são contextuais)
    if (actionId === 'perceber' || actionId === 'observar') {
      return; 
    }
    const action = ACTIONS.find(a => a.id === actionId);
    if (!action) return;
    setCurrentAura(action.aura);
    setActiveAction(action.id);
    document.documentElement.style.setProperty('--aura-current', action.aura);
    setIsCreating(true);
    setShowNexus(false);
  };



  const handleSendChatMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Bloqueio de ações reativas na barra global
    if (chatAction.id === 'perceber' || chatAction.id === 'observar') return;

    const hasAttachments = attachedFiles.image || attachedFiles.audio;
    if ((!chatMessage.trim() && !hasAttachments) || isSending || !user) return;

    setIsSending(true);
    try {
      const { data: { user: _user } } = await supabase.auth.getUser();
      if (!_user) throw new Error("Usuário não autenticado");

      let imageUrl = null;
      let audioUrl = null;

      if (attachedFiles.image) {
        const fileExt = attachedFiles.image.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${_user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('manifestations').upload(filePath, attachedFiles.image);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('manifestations').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      if (attachedFiles.audio) {
        const fileExt = attachedFiles.audio.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${_user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('manifestations').upload(filePath, attachedFiles.audio);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('manifestations').getPublicUrl(filePath);
        audioUrl = publicUrl;
      }

      const { data, error } = await supabase
        .from('consciousness_nodes')
        .insert([{
          content: chatMessage || (repostTarget ? `Ressoando @${repostTarget.author}` : (attachedFiles.image ? "Manifestação visual" : "Vibração sonora")),
          type: chatAction.id,
          user_id: user.id,
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
      
      if (data) {
        // Registrar 'Expressar' no post original se for um repost
        if (repostTarget?.id) {
          handleToggleSentiment(repostTarget.id, 'expressar');
        }

        setManifestations((prev) => {
          if (prev.find(m => m.id === data.id)) return prev;
          return [data, ...prev];
        });

        // Trigger Manifestation Splash
        const mon = MON_MAPPING[chatAction.id];
        if (mon) {
          setActiveMon({ ...mon, phrase: mon.phrase });
          setShowSplash(true);
          setTimeout(() => setShowSplash(false), 3500); // Slightly more time to read
        }

        // --- BOT LOGIC (DAILY JUDGE) ---
        const today = new Date();
        const judge = DAILY_JUDGE_CONFIG[today.getDay()];
        
        if (judge) {
          // Check if today's judge already spoke to the network today
          const startOfDay = new Date(today.setHours(0,0,0,0)).toISOString();
          
          const { data: recentPost } = await supabase
            .from('consciousness_nodes')
            .select('id')
            .eq('user_id', judge.id)
            .gte('created_at', startOfDay)
            .limit(1);

          if (!recentPost || recentPost.length === 0) {
            const judgment = judge.phrases[chatAction.id] || "Sua vibração é dissonante perante meu nexo.";
            
            // Trigger direct message on screen
            setTimeout(() => {
              setActiveBot({ 
                id: judge.id, 
                name: judge.name, 
                avatar: judge.avatar, 
                title: judge.title 
              });
              setLucemonMessage(judgment);
              setTimeout(() => {
                setLucemonMessage(null);
                setActiveBot(null);
              }, 4500);
            }, 1000);

            // Wait a tiny bit for dramatic effect and post to feed
            setTimeout(async () => {
              await supabase
                .from('consciousness_nodes')
                .insert([{
                  user_id: judge.id,
                  content: judgment,
                  type: judge.type,
                  metadata: { aura: judge.aura, bot_reply: true }
                }]);
            }, 2000);
          }
        }
      }
      setIsSending(false);
      setChatMessage("");
      setAttachedFiles({ image: null, audio: null });
      setShowAuraSelector(false);
      setRepostTarget(null);
    } finally {
      setIsSending(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.container} style={{ justifyContent: 'center', alignItems: 'center' }}>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
          transition={{ repeat: Infinity, duration: 2 }}
          className={styles.logoContainer}
        >
          <img src="/logo.jpg" alt="Loading" className={styles.mainLogo} />
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${hexagramActive ? styles.transcendGlow : ''}`}>
      <StarField active={laserActive} />
      <SpiritualWater active={laserActive} />

      {/* --- NEON TRIANGLES SYSTEM --- */}
      <button 
        className={styles.triangleBtn} 
        onClick={() => {
          if (!trianglesActive) {
            // First click: Shoot UP
            setTriangleLaserActive(true);
            
            // Laser hits top around 1.5s, starting the glitch
            setTimeout(() => setProfileGlitchActive(true), 1500);
            
            // Laser element removes at 1.8s
            setTimeout(() => setTriangleLaserActive(false), 1800);
            
            // Glitch stops after slightly more time
            setTimeout(() => setProfileGlitchActive(false), 2300);
            
            // The 4 boundary triangles appear 2.5 seconds after the blue button click
            setTimeout(() => setTrianglesActive(true), 2500);
          } else {
            // Second click: Shoot DOWN and deactivate
            setBlueLaserReturning(true);
            
            setTimeout(() => {
              setBlueLaserReturning(false);
              setTrianglesActive(false);
            }, 1800);
          }
        }}
        data-active={trianglesActive}
        title="Ativar Fronteiras Neon"
      >
        <div 
          className={styles.triangleIcon}
          style={hexagramActive ? { borderBottomColor: '#8800ee', filter: 'drop-shadow(0 0 15px #8800ee)' } : {}}
        ></div>
      </button>

      {triangleLaserActive && (
        <div 
          className={styles.triangleLaserBlast}
          style={hexagramActive ? { boxShadow: '0 0 20px #ffff00, 0 0 40px #ffff00, 0 0 60px white' } : {}}
        ></div>
      )}
      {blueLaserReturning && (
        <div 
          className={styles.triangleLaserReturn}
          style={hexagramActive ? { boxShadow: '0 0 20px #ffff00, 0 0 40px #ffff00, 0 0 60px white' } : {}}
        ></div>
      )}

      {/* --- RED TRIANGLE ACTIVATION (LOGO) --- */}
      <button 
        className={styles.triangleBtnRed} 
        onClick={() => {
          if (!laserActive) {
            // First click: Shoot UP
            setRedLaserActive(true);
            
            // Laser hits top left/logo around 1.5s
            setTimeout(() => {
              setLaserActive(true);
            }, 1500);

            // SPECIAL DELAY: Wait 1 second (total 2.5s) for profile effect as requested
            setTimeout(() => {
              setProfileGlitchActive(true);
            }, 2500);
            
            // Laser element removes at 1.8s
            setTimeout(() => setRedLaserActive(false), 1800);

            // Glitch stops
            setTimeout(() => setProfileGlitchActive(false), 3300);
          } else {
            // Second click: Shoot DOWN and deactivate
            setRedLaserReturning(true);
            
            setTimeout(() => {
              setRedLaserReturning(false);
              setLaserActive(false);
            }, 1800);
          }
        }}
        title="Ativar Ciclo via Laser"
      >
        <div 
          className={styles.triangleIconRed}
          style={hexagramActive ? { borderTopColor: '#8800ee', filter: 'drop-shadow(0 0 15px #8800ee)' } : {}}
        ></div>
      </button>

      {redLaserActive && (
        <div 
          className={styles.redLaserBlast}
          style={hexagramActive ? { boxShadow: '0 0 20px #ffff00, 0 0 40px #ffff00, 0 0 60px white' } : {}}
        ></div>
      )}
      {redLaserReturning && (
        <div 
          className={styles.redLaserReturn}
          style={hexagramActive ? { boxShadow: '0 0 20px #ffff00, 0 0 40px #ffff00, 0 0 60px white' } : {}}
        ></div>
      )}



      {/* --- UNIFIED NEON TRIANGLES SYSTEM --- */}
      <AnimatePresence>
        {(trianglesActive || hexagramActive) && (
          <div className={`${styles.unifiedTriangleOverlay} ${hexBlinkActive ? styles.hexagramBlinkActive : ''} ${hexFailing ? styles.hexFailing : ''}`}>
            {/* Hexagram White Laser Star - Scales to fit Top/Bottom */}
            <AnimatePresence>
              {hexagramActive && (
                <motion.div 
                  className={`${styles.whiteLaserStar} ${hexBlinkActive ? styles.hexagramBlinkActive : ''} ${hexFailing ? styles.hexFailing : ''}`}
                  initial={{ opacity: 0, scale: 0.5, rotate: -30 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  exit={{ opacity: 0, scale: 1.5, rotate: 30 }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  style={{
                    width: '100vw',
                    height: '100vh',
                  }}
                >
                  <svg 
                    viewBox="0 0 1000 1000" 
                    style={{ width: '100%', height: '100%', overflow: 'visible' }}
                  >
                    {(() => {
                      const R = (innerHeight / 2) - 55;
                      const center = 500;
                      // Scale R to SVG space (1000 base)
                      // innerHeight is pixel, SVG is 1000. 
                      // We can just calculate points in SVG space relative to center(500,500)
                      // assuming innerHeight corresponds to the height of the SVG viewbox.
                      // Actually simpler: just use pixel units in the SVG if possible, or ratio.
                      const scale = 500 / (innerHeight / 2);
                      const svgR = R * scale;
                      
                      const p1 = { x: center, y: center - svgR };
                      const p2 = { x: center + svgR * 0.866, y: center - svgR * 0.5 };
                      const p3 = { x: center + svgR * 0.866, y: center + svgR * 0.5 };
                      const p4 = { x: center, y: center + svgR };
                      const p5 = { x: center - svgR * 0.866, y: center + svgR * 0.5 };
                      const p6 = { x: center - svgR * 0.866, y: center - svgR * 0.5 };

                      return (
                        <g style={{ filter: 'drop-shadow(0 0 12px white) drop-shadow(0 0 25px rgba(255,255,255,0.4))' }}>
                          {/* Triangle 1: 0, 120, 240 */}
                          <path 
                            d={`M${p1.x},${p1.y} L${p3.x},${p3.y} L${p5.x},${p5.y} Z`} 
                            fill="none" stroke="white" strokeWidth="2" 
                          />
                          {/* Triangle 2: 60, 180, 300 */}
                          <path 
                            d={`M${p2.x},${p2.y} L${p4.x},${p4.y} L${p6.x},${p6.y} Z`} 
                            fill="none" stroke="white" strokeWidth="2" 
                          />
                        </g>
                      );
                    })()}
                  </svg>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The 6 Triangles */}
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const hexAngles = [0, 60, 120, 180, 240, 300];
              const hexAngle = hexAngles[i];
              const isHex = hexagramActive;
              
              const edgeDistY = (innerHeight / 2) - 55;
              const edgeDistX = (innerWidth / 2) - 55;
              
              let targetX = 0;
              let targetY = 0;
              let targetRotate = 0;
              let scale = 1;

              if (isHex) {
                // Top and Bottom (0, 3) stay at edges
                if (i === 0 || i === 3) {
                  targetX = 0;
                  targetY = i === 0 ? -edgeDistY : edgeDistY;
                  targetRotate = i === 0 ? 0 : 180;
                  scale = 1.1; // Make anchors slightly larger/bolder
                } else {
                  // Others align to the hexagram radius formed by Top/Bottom
                  targetX = edgeDistY * Math.sin((hexAngle * Math.PI) / 180);
                  targetY = -edgeDistY * Math.cos((hexAngle * Math.PI) / 180);
                  targetRotate = hexAngle;
                  scale = 0.9;
                }
              } else {
                // Boundary Mode (4 triangles)
                switch(i) {
                  case 0: targetX = 0; targetY = -edgeDistY; targetRotate = 0; break;
                  case 1: case 2: targetX = edgeDistX; targetY = 0; targetRotate = 90; break;
                  case 3: targetX = 0; targetY = edgeDistY; targetRotate = 180; break;
                  case 4: case 5: targetX = -edgeDistX; targetY = 0; targetRotate = 270; break;
                }
              }

              return (
                <motion.div
                  key={`unified-tri-${i}`}
                  className={styles.dynamicTriangle}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ 
                    opacity: 1, 
                    scale: scale,
                    x: targetX,
                    y: targetY,
                    rotate: targetRotate
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ 
                    duration: 1.5, 
                    ease: [0.16, 1, 0.3, 1], // Custom bounce-free springy feel
                    delay: isHex ? i * 0.08 : 0
                  }}
                >
                  <svg viewBox="0 0 100 100" width="100" height="100">
                    <polygon 
                      points="50,10 10,90 90,90" 
                      fill="rgba(0, 0, 0, 0.75)" 
                      stroke="white" 
                      strokeWidth="2.5" 
                      style={{ filter: 'drop-shadow(0 0 5px white)' }} 
                    />
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
      {/* Sticky Top Menu */}
      <header className={`${styles.header} glass`}>
        {/* Laser beam: logo → Nexo Cromático */}
        <div 
          className={`${styles.laserBeam} ${laserActive ? styles.laserForward : styles.laserReverse}`} 
          style={{ 
            backgroundColor: selectedDesignColor,
            boxShadow: `0 0 10px ${selectedDesignColor}, 0 0 20px ${selectedDesignColor}88, 0 0 30px ${selectedDesignColor}44`,
            opacity: laserActive ? 0.7 : 0
          } as any}
        />

        <div className={styles.headerLeft}>
          <button 
            className={styles.logoBtn} 
            data-active={laserActive}
            onClick={() => setLaserActive(prev => !prev)} 
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            title={laserActive ? "Ciclo Aberto" : "Ciclo Fechado"}
          >
            <div className={styles.logoContainer}>
              <img 
                ref={logoRef}
                src="/logo.jpg" 
                alt="Nexus Menu" 
                className={styles.mainLogo} 
              />
            </div>
          </button>
        </div>

        <div className={styles.headerCenter}>
          <UserSearch onTagSelect={(tag) => setTagFilter(tag)}>
            <div className={styles.designPickerHeader}>
              <button 
                className={styles.designPickerToggle}
                onClick={() => setShowDesignPicker(!showDesignPicker)}
                title="Nexo Cromático"
                style={{ 
                  borderColor: selectedDesignColor,
                  color: selectedDesignColor,
                  boxShadow: `0 0 15px ${selectedDesignColor}44`,
                  background: `${selectedDesignColor}11`
                }}
              >
                <Palette size={20} />
              </button>

              <AnimatePresence>
                {showDesignPicker && (
                  <motion.div 
                    className={styles.designColorsPopover}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.designColorsWrapper}>
                      {SPARK_COLORS.map((color, i) => {
                        const hex = color || '#000000';
                        return (
                          <motion.button
                            key={`design-color-${i}`}
                            className={`${styles.designColorOption} ${selectedDesignColor === hex ? styles.activeDesignOption : ''}`}
                            style={{ 
                              backgroundColor: hex, 
                              color: hex === '#000000' ? '#ffffff' : hex,
                              border: hex === '#000000' ? '1px solid rgba(255,255,255,0.3)' : undefined
                            }}
                            onClick={() => {
                              setSelectedDesignColor(hex);
                              setShowDesignPicker(false);
                            }}
                            whileHover={{ scale: 1.3 }}
                            whileTap={{ scale: 0.9 }}
                            title={`Frequência ${i + 1}`}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </UserSearch>
        </div>
        
        <div className={styles.headerRight}>
          <button 
            className={`${styles.profileBtn} ${profileGlitchActive ? styles.profileGlitchActive : ''}`} 
            onClick={() => setShowPresence(true)} 
            title="Sua Presença"
            style={{ position: 'relative' }}
          >
            {profileGlitchActive && (
              <div className={styles.impactSparks}>
                <div className={styles.impactFlash}></div>
                <div className={styles.impactShockwave}></div>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className={styles.lightStone} style={{ '--i': i } as any}></div>
                ))}
              </div>
            )}
            <div className={styles.avatar}>
              {profileGlitchActive && <div className={styles.digitalNoise}></div>}
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name} 
                  className={`${styles.avatarImg} ${profileGlitchActive ? styles.profileImageGlitch : ''}`} 
                />
              ) : (
                <span className={profileGlitchActive ? styles.profileImageGlitch : ''}>
                  {user?.email?.[0].toUpperCase() || 'U'}
                </span>
              )}

            </div>
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
                      onClick={() => handleActionClick(action.id)}
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

      <main className={styles.mainContent}>
        <div className={styles.floatingFluxoWrapper}>
        <div 
          className={`${styles.floatingFluxo} glass`}
          style={{ 
            boxShadow: hexagramActive 
              ? `0 0 12px ${chatAction.aura}22, inset 0 0 8px ${chatAction.aura}11`
              : `0 0 25px ${chatAction.aura}44, inset 0 0 15px ${chatAction.aura}22`,
          }}
        >

          <div className={styles.feedHeader}>
            {/* Left stories */}
            <div className={styles.sideStories} data-active={sparkActive ? '1' : '0'}>
              <AnimatePresence mode="wait">
                {!showRealStories ? (
                  <motion.div key="bots-left" className={styles.sideStoriesInner} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }}>
                    {[
                      { id: '00000000-0000-0000-0000-000000000001', username: 'Ilusionmon', label: 'Miragem ✨', image: '/personagens/IlusiomonsT.png' },
                      { id: '00000000-0000-0000-0000-000000000002', username: 'Lucemon', label: 'Orgulho ⚡', image: '/personagens/LucemonF.png' },
                      { id: '00000000-0000-0000-0000-000000000003', username: 'Barbamon', label: 'Ganância 💰', image: '/personagens/BarbamonT.png' },
                      { id: '00000000-0000-0000-0000-000000000004', username: 'Leviamon', label: 'Inveja 🌊', image: '/personagens/LeviamonT.png' },
                    ].map((s, i) => (
                      <div key={i} className={`${styles.sideStoryItem} glass-hover`} data-phase={i} onClick={() => router.push(`/profile/${s.id}`)}>
                        <div className={styles.sideStoryRing}>
                          <div className={styles.sideStoryAvatar}>
                            {s.image ? (<img src={s.image} alt={s.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />) : s.username[0]}
                          </div>
                        </div>
                        <span className={styles.sideStoryName}>{s.username}</span>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="real-left" className={styles.sideStoriesInner} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }}>
                    {recentUsers.slice(0, 4).map((s, i) => (
                      <div key={s.id || i} className={`${styles.sideStoryItem} glass-hover`} data-phase={i} onClick={() => router.push(`/profile/${s.id}`)}>
                        <div className={styles.sideStoryRing}>
                          <div className={`${styles.sideStoryAvatar} ${styles.realStoryAvatar}`}>
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt={s.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (s.username?.[0] || '?')}
                          </div>
                        </div>
                        <span className={styles.sideStoryName}>{s.username || 'Manifestação'}</span>
                      </div>
                    ))}
                    {recentUsers.length === 0 && Array.from({ length: 4 }).map((_, i) => (
                       <div key={`empty-left-${i}`} className={`${styles.sideStoryItem} glass-hover`} style={{ opacity: 0.3 }}>
                         <div className={styles.sideStoryRing}>
                           <div className={`${styles.sideStoryAvatar} ${styles.realStoryAvatar}`}>?</div>
                         </div>
                       </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Center — title + sparks + pulse + toggle */}
            <div className={styles.feedHeaderCenter}>
              <div className={styles.fluxoTitleWrap}>
                {/* Faíscas ATRÁS da lua, com burst colorido a cada 7s */}
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

                {/* Lua transparente — sobre as faíscas, abaixo do título */}
                <LuaProjetada />
                <h2 className={styles.fluxoTitle} data-active={sparkActive ? '1' : '0'}>
                  Nascente Universal
                </h2>
              </div>
              <div className={styles.pulseRow}>
                <RealtimePulse channelName="universal-connection" label="Sincronizado" />
              </div>
              {/* Toggle button between bot and real stories */}
              <button 
                className={styles.storyToggleBtn} 
                onClick={() => setShowRealStories(!showRealStories)}
                title={showRealStories ? 'Ver Espiritual' : 'Ver Físico'}
              >
                <span>{showRealStories ? 'Espiritual' : 'Físico'}</span>
              </button>
            </div>

            {/* Right stories */}
            <div className={styles.sideStories} data-active={sparkActive ? '1' : '0'}>
              <AnimatePresence mode="wait">
                {!showRealStories ? (
                  <motion.div key="bots-right" className={styles.sideStoriesInner} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }}>
                    {[
                      { id: '00000000-0000-0000-0000-000000000005', username: 'Beelzemon', label: 'Gula 🔥', image: '/personagens/BeelzemonT.png' },
                      { id: '00000000-0000-0000-0000-000000000007', username: 'Belphemon', label: 'Preguiça 💤', image: '/personagens/BelphemonT.png' },
                      { id: '00000000-0000-0000-0000-000000000006', username: 'Lilithmon', label: 'Luxúria 💋', image: '/personagens/LilithmonT.png' },
                      { id: '00000000-0000-0000-0000-000000000008', username: 'Daemon', label: 'Ira 💢', image: '/personagens/DaemonT.png' },
                    ].map((s, i) => (
                      <div key={i} className={`${styles.sideStoryItem} glass-hover`} data-phase={i + 4} onClick={() => router.push(`/profile/${s.id}`)}>
                        <div className={styles.sideStoryRing}>
                          <div className={styles.sideStoryAvatar}>
                            {s.image ? (<img src={s.image} alt={s.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />) : s.username[0]}
                          </div>
                        </div>
                        <span className={styles.sideStoryName}>{s.username}</span>
                      </div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div key="real-right" className={styles.sideStoriesInner} initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.3 }}>
                    {recentUsers.slice(4, 8).map((s, i) => (
                      <div key={s.id || i} className={`${styles.sideStoryItem} glass-hover`} data-phase={i + 4} onClick={() => router.push(`/profile/${s.id}`)}>
                        <div className={styles.sideStoryRing}>
                          <div className={`${styles.sideStoryAvatar} ${styles.realStoryAvatar}`}>
                            {s.avatar_url ? (
                              <img src={s.avatar_url} alt={s.username} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                            ) : (s.username?.[0] || '?')}
                          </div>
                        </div>
                        <span className={styles.sideStoryName}>{s.username || 'Manifestação'}</span>
                      </div>
                    ))}
                    {recentUsers.length < 5 && Array.from({ length: 4 - (recentUsers.length > 4 ? recentUsers.length - 4 : 0) }).map((_, i) => (
                       <div key={`empty-right-${i}`} className={`${styles.sideStoryItem} glass-hover`} style={{ opacity: 0.3 }}>
                         <div className={styles.sideStoryRing}>
                           <div className={`${styles.sideStoryAvatar} ${styles.realStoryAvatar}`}>?</div>
                         </div>
                       </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Feed Fluxo content starts here... */}



          {/* Tag Filter Banner */}
          {tagFilter && (
            <div className={styles.tagFilterBanner}>
              <Sparkles size={14} />
              <span>Universo: <strong>#{tagFilter}</strong></span>
              <button onClick={() => setTagFilter(null)} className={styles.tagFilterClose}><X size={14} /></button>
            </div>
          )}

          <div className={`${styles.feed} ${zenMode ? styles.zenFeed : ''}`}>
          <AnimatePresence>
            {manifestations.length === 0 && (
              <p key="empty-fluxo" className={styles.emptyHint}>O fluxo está silencioso. Seja o primeiro a manifestar.</p>
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
              .map((manifest) => {
              const Icon = ACTIONS.find(a => a.id === manifest.type)?.icon || Sparkles;
              const allTags = [...new Set([...(postTags[manifest.id] || []), ...(manifest.metadata?.tags || [])])];
               const isRevealed = activeRevealedPost === manifest.id;
               const isFollowing = followedUsers.has(manifest.user_id);
               
               // Get emoji reactions from the database sentiments
               const dbSentiments = nodeSentiments[manifest.id] || {};
               const reactions = Object.keys(dbSentiments).filter(type => 
                 !VIRTUES.some(v => v.id === type) && type !== 'apoio'
               ).map(emoji => ({
                 emoji,
                 count: dbSentiments[emoji].count,
                 userReacted: dbSentiments[emoji].userReacted
               }));


               return (
              <motion.div 
                key={manifest.id}
                id={`post-${manifest.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`${styles.manifestation} glass ${manifest.metadata?.is_magic ? styles.magicPulse : ''} ${transcendActive ? styles.transcendMode : ''}`}
                data-window="true"
                style={{ 
                  transition: 'all 0.6s cubic-bezier(0.23, 1, 0.32, 1)',
                  '--vibe-color': transcendActive ? (ACTION_NEON_COLORS[manifest.type] || '#ffffff') : '#ffffff',
                  '--vibe-glow': transcendActive 
                    ? (manifest.type === 'integrar' ? 'rgba(255,255,255,0.4)' : `${ACTION_NEON_COLORS[manifest.type] || '#fff'}44`)
                    : 'rgba(255, 255, 255, 0.25)'
                } as any}
              >
                <div className={styles.manifestHeader}>
                  <div className={styles.headerColumn}>
                    <span className={styles.username}>
                      @{manifest.profiles?.username || `presenca_${manifest.id.slice(0, 4)}`}
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
                    {user && user.id === manifest.user_id && (
                      <button 
                        className={styles.deleteBtnMinimal}
                        onClick={() => setNodeToDelete(manifest.id)}
                        title="Soltar Manifestação"
                      >
                        <div 
                          className={styles.soltarCircle}
                          style={{ borderColor: selectedDesignColor }}
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
                  <div key={`content-${manifest.id}`} className={styles.content}>
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
                  </div>
                )}

                {/* Vibrational Report relocated to global floating layer below */}


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
                            const isOwner = manifest.user_id === user?.id;
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
                    let isActive = false;
                    if (action.id === 'buscar') isActive = activeTagPicker === manifest.id;
                    if (action.id === 'integrar') isActive = followedUsers.has(manifest.user_id);
                    if (action.id === 'perceber') isActive = activeRevealedPost === manifest.id;
                    if (action.id === 'sentir') isActive = activeSentimentPicker === manifest.id;
                    if (action.id === 'cuidar') isActive = activeCuidarPicker === manifest.id;
                    if (action.id === 'observar') isActive = observingManifest?.id === manifest.id;
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

                        {/* Local Vibrational Report (Floating above button) */}
                        <AnimatePresence>
                          {action.id === 'observar' && observingManifest?.id === manifest.id && (
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
                              <div className={styles.reportHeader} style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>Relatório Vibracional</div>
                              
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
                                       (t.startsWith('sentir:') ? (FEELING_SYMBOLS.find(f => `sentir:${f.label.toLowerCase()}` === t)?.symbol || '🧠') : 
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
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </div>

                {/* Spiritual Notice Modal */}
                <AnimatePresence>
                  {spiritualNotice && (
                    <motion.div 
                      className={styles.spiritualNoticeOverlay}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSpiritualNotice(null)}
                    >
                      <motion.div 
                        className={styles.spiritualNoticeBox}
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        onClick={e => e.stopPropagation()}
                      >
                        <div className={styles.spiritualNoticeContent}>
                          <Fingerprint size={48} className={styles.noticeIcon} />
                          <h3 className={styles.noticeText}>{spiritualNotice}</h3>
                          <button 
                            className={styles.noticeCloseBtn} 
                            onClick={() => setSpiritualNotice(null)}
                          >
                            Reconhecer Essência
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Integration Splash - Sintonização com Entidade */}
                <AnimatePresence>
                  {activeIntegrationSplash && (
                    <motion.div 
                      className={styles.integrationOverlay}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div 
                        className={styles.integrationSplash}
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 1.1, opacity: 0, y: -20 }}
                      >
                        <div className={styles.splashGlow}></div>
                        <button 
                          className={styles.closeSplashBtn} 
                          onClick={() => setActiveIntegrationSplash(null)}
                          title="Sair da Revelação"
                        >
                          <X size={24} />
                        </button>
                        <div className={styles.splashContent}>
                          <div className={styles.splashAvatarBox}>
                            <img src={activeIntegrationSplash.avatar} alt="Bot" className={styles.splashAvatar} />
                            <div className={styles.avatarRing}></div>
                          </div>
                          <h2 className={styles.splashTitle}>Sintonização Consolidada!</h2>
                          
                          <div className={styles.revelationBox}>
                            <p className={styles.revelationText}>"{activeIntegrationSplash.phrase}"</p>
                          </div>

                          <p className={styles.splashText}>
                            <strong>@{activeIntegrationSplash.name}</strong> aceitou sua presença.<br/>
                            Bem-vindo ao Mundo Espiritual.
                          </p>
                          <div className={styles.splashFooter}>
                            Frequência Estabilizada • Clique no X para retornar
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Emoji Care Picker (CUIDAR) */}
                <AnimatePresence>
                  {activeCuidarPicker === manifest.id && (
                    <motion.div
                      className={styles.sentimentPickerOverlay}
                      style={{ position: 'relative', bottom: 'auto', marginTop: '0.5rem' }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
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
                              if (user) {
                                handleToggleSentiment(manifest.id, emoji);
                              }
                            }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>{emoji}</span>
                            <span style={{ fontSize: '0.6rem', opacity: 0.75, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                          </div>
                        ))}
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Virtue Sentiment Picker (SENTIR) */}
                <AnimatePresence>
                  {activeSentimentPicker === manifest.id && (
                    <motion.div 
                      className={styles.sentimentPickerOverlay}
                      style={{ position: 'relative', bottom: 'auto', marginTop: '0.5rem' }}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className={styles.sentimentPickerHeader}>Sintonize seu Sentir</div>
                      <div className={styles.sentimentSymbolsGrid}>
                        {FEELING_SYMBOLS.map(f => (
                          <div 
                            key={`feel-${manifest.id}-${f.label}`} 
                            className={styles.sentimentOption}
                            onClick={() => {
                              handleToggleSentiment(manifest.id, `sentir:${f.label.toLowerCase()}`);
                              setActiveSentimentPicker(null);
                            }}
                          >
                            <span style={{ fontSize: '1.2rem' }}>{f.symbol}</span>
                            <span style={{ fontSize: '0.65rem', opacity: 0.8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{f.label}</span>

                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tag Input (INTEGRAR) */}
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

                {/* Tags Display (Meta + Collaborative from sentiments) */}
                {(() => {
                  const dbTags = Object.keys(dbSentiments)
                    .filter(type => type.startsWith('tag:'))
                    .map(type => ({
                      name: type.replace('tag:', ''),
                      count: dbSentiments[type].count,
                      userReacted: dbSentiments[type].userReacted
                    }));
                  
                  const metaTags = (manifest.metadata?.tags || []).map((t: string) => ({
                    name: t,
                    count: 1,
                    isMeta: true
                  }));

                  // Combinar tags
                  const uniqueTags = [...dbTags];
                  metaTags.forEach((mt: any) => {
                    if (!uniqueTags.find(ut => ut.name === mt.name)) {
                      uniqueTags.push(mt);
                    }
                  });

                  if (uniqueTags.length === 0) return null;

                  return (
                    <div key={`taglist-${manifest.id}`} className={styles.tagListContainer}>
                      {uniqueTags.map((t, i) => (
                        <span 
                          key={`${t.name}-${i}`} 
                          className={`${styles.postTag} ${t.userReacted ? styles.activePostTag : ''}`}
                          onClick={() => setTagFilter(prev => prev === t.name ? null : t.name)}
                        >
                          #{t.name} {t.count > 1 && <small>({t.count})</small>}
                        </span>
                      ))}
                    </div>
                  );
                })()}

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

          {hasMore && (
            <div className={styles.paginationLoading}>
              {isLoadingMore ? (
                <div className={styles.loadingMoreBox}>
                  <Sparkles size={16} className={styles.rotatingIcon} />
                  <span>Sincronizando mais fragmentos...</span>
                </div>
              ) : (
                <div 
                  className={styles.scrollNotice}
                  onMouseEnter={handlePointerEnterLimit}
                  onMouseLeave={handlePointerLeaveLimit}
                >
                  <Compass size={14} className={styles.pulsingIcon} />
                  <span>Sustentar para revelar além</span>
                </div>
              )}
            </div>
          )}
          </div>

          <div className={`${styles.chatToolbar} glass`}>
            <div className={styles.chatAttachedRow}>
              {attachedFiles.image && (
                <div className={styles.attachedFile}>
                  <ImageIcon size={14} /> <span>Foto</span>
                  <button onClick={() => setAttachedFiles(h => ({...h, image: null}))}><X size={12} /></button>
                </div>
              )}
              {attachedFiles.audio && (
                <div className={styles.attachedFile}>
                  <Music size={14} /> <span>Áudio</span>
                  <button onClick={() => setAttachedFiles(h => ({...h, audio: null}))}><X size={12} /></button>
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
                    <p>{repostTarget.content?.slice(0, 100)}...</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form 
              className={styles.chatInputRow} 
              onSubmit={handleSendChatMessage}
              style={{ 
                borderColor: `${chatAction.aura}66`, 
                boxShadow: `0 0 20px ${chatAction.aura}22`,
                transition: 'all 0.5s ease'
              }}
            >
              <div className={styles.chatActionButtons}>
                {/* Aura Selector */}
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

                <input 
                  type="file" 
                  ref={mediaInputRef} 
                  hidden 
                  accept="image/*" 
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setAttachedFiles(h => ({...h, image: file}));
                  }} 
                />
                <input type="file" ref={audioInputRef} hidden accept="audio/*" onChange={e => setAttachedFiles(h => ({...h, audio: e.target.files?.[0] || null}))} />
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
                className={styles.ressoarBtn} 
                disabled={(!chatMessage.trim() && !attachedFiles.image && !attachedFiles.audio) || isSending}
                style={{ 
                  boxShadow: `0 0 20px ${chatAction.aura}44`
                }}
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
        </div>
      </main>

      <WelcomeGuide />

      <AnimatePresence mode="wait">
        {!!(isCreating && activeAction) && (
          <ManifestationCreator 
            key="creator-modal"
            action={ACTIONS.find(a => a.id === activeAction)!} 
            onClose={() => setIsCreating(false)} 
          />
        )}
        {showPresence && (
          <UserPresence 
            key="presence-modal"
            manifestations={manifestations} 
            selectedColor={selectedDesignColor}
            targetId={targetProfileId || undefined}
            onClose={() => {
              setShowPresence(false);
              setTargetProfileId(null);
            }} 
            onOpenSettings={() => {
              setShowPresence(false);
              setShowSettings(true);
            }}
          />
        )}
        {showSettings && (
          <ProfileSettings 
            key="settings-modal"
            onClose={() => setShowSettings(false)} 
          />
        )}

        {showSplash && activeMon && (
          <motion.div 
            key="mon-splash"
            className={styles.summonSplash}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className={styles.summonPortrait}
              initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", damping: 15 }}
            >
              <img src={activeMon.image} alt={activeMon.name} />
            </motion.div>
            <motion.h1 
              className={styles.summonName}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {activeMon.name}
            </motion.h1>
            <motion.p 
              className={styles.summonLabel}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {activeMon.label}
            </motion.p>
            <motion.p 
              className={styles.summonPhrase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              style={{ 
                marginTop: '2rem', 
                fontSize: '1.4rem', 
                fontStyle: 'italic', 
                color: '#fff', 
                textAlign: 'center', 
                maxWidth: '600px',
                lineHeight: '1.4',
                textShadow: '0 0 20px rgba(255,255,255,0.3)'
              }}
            >
              “{activeMon.phrase}”
            </motion.p>
          </motion.div>
        )}

        {!!(lucemonMessage && activeBot) && (
          <motion.div 
            key="bot-judgment"
            className={styles.lucemonJudgmentContainer}
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: "spring", damping: 20 }}
            style={{ 
              boxShadow: `0 0 60px ${activeBot.name === 'Lilithmon' ? 'rgba(255, 0, 204, 0.2)' : activeBot.name === 'Beelzemon' ? 'rgba(255, 100, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)'}` 
            }}
          >
            <div className={styles.lucemonJudgmentAvatar} style={{ 
              borderColor: activeBot.name === 'Lilithmon' ? '#ff00cc' : activeBot.name === 'Lucemon' ? '#fff' : activeBot.name === 'Daemon' ? '#ff4400' : 'rgba(255,255,255,0.5)' 
            }}>
              <img src={activeBot.avatar} alt={activeBot.name} />
            </div>
            <div className={styles.lucemonJudgmentBox}>
              <div className={styles.lucemonJudgmentHeader} style={{ 
                color: activeBot.name === 'Lilithmon' ? '#ff00cc' : activeBot.name === 'Daemon' ? '#ff4400' : 'rgba(255, 255, 255, 0.4)' 
              }}>
                {activeBot.title}
              </div>
              <p className={styles.lucemonJudgmentText}>“{lucemonMessage}”</p>
            </div>
          </motion.div>
        )}

        {/* --- DELETE CONFIRMATION RITUAL --- */}
        <AnimatePresence key="delete-presence-wrapper">
          {nodeToDelete && (
            <motion.div 
              key="delete-confirm-overlay"
              className={styles.deleteConfirmOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className={styles.deleteConfirmBox}
                initial={{ scale: 0.9, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25 }}
              >
                <div className={styles.deleteGlow}></div>
                <div className={styles.deleteIconBox}>
                  <Wind size={32} style={{ color: 'var(--design-neon, #ff3333)' }} />
                </div>
                <h2 className={styles.deleteTitle}>Ritual de Desapego</h2>
                <p className={styles.deleteText}>
                  Você deseja soltar este fluxo permanentemente da Nascente Universal?<br/>
                  Esta ação extinguirá esta manifestação de todas as realidades.
                </p>
                <div className={styles.deleteActions}>
                  <button 
                    className={styles.keepBtn} 
                    onClick={() => setNodeToDelete(null)}
                  >
                    Manter Presença
                  </button>
                  <button 
                    className={styles.discardBtn} 
                    onClick={() => handleConfirmDelete(nodeToDelete)}
                  >
                    Soltar para o Vazio
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatePresence>

        {/* --- FULLSCREEN IMAGE VIEWER --- */}
        <AnimatePresence key="fullscreen-presence">
          {!!fullscreenImage && (
            <motion.div 
              className={styles.fullscreenImageOverlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setFullscreenImage(null)}
            >
              <button 
                className={styles.closeFullscreenBtn} 
                onClick={(e) => {
                  e.stopPropagation();
                  setFullscreenImage(null);
                }}
                title="Fechar Imagem (Esc)"
              >
                <X size={32} />
              </button>
              <motion.img 
                src={fullscreenImage} 
                alt="Fullscreen Preview" 
                className={styles.fullscreenImage}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
 
        {/* Convergence Lasers: GLOBAL FINAL LAYER (ON TOP OF EVERYTHING) */}
        <AnimatePresence key="lasers-presence">
          {!!ritualSixSec && (
            <svg 
              className={styles.convergenceOverlay} 
              viewBox={`0 0 ${typeof window !== 'undefined' ? window.innerWidth : 1920} ${typeof window !== 'undefined' ? window.innerHeight : 1080}`}
            >
              <defs>
                <linearGradient id="convergenceGradientTop" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="50%" stopColor="white" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="white" stopOpacity="1" />
                </linearGradient>
              </defs>
              {Array.from({ length: 8 }).map((_, idx) => {
                const isLeft = idx < 4;
                const screenW = typeof window !== 'undefined' ? window.innerWidth : 1920;
                const startX = isLeft 
                  ? (screenW * 0.15) + (idx * 60) 
                  : (screenW * 0.65) + ((idx - 4) * 60);
                const startY = 180;
                const targetX = screenW / 2;
                const targetY = 55;

                return (
                  <motion.line
                    key={`conv-laser-top-${idx}`}
                    x1={startX}
                    y1={startY}
                    x2={targetX}
                    y2={targetY}
                    stroke="url(#convergenceGradientTop)"
                    strokeWidth="2.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: [0, 1, 0] }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: idx * 0.05 }}
                    style={{ filter: 'drop-shadow(0 0 15px white) drop-shadow(0 0 8px white)' }}
                  />
                );
              })}
            </svg>
          )}
        </AnimatePresence>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.8rem', letterSpacing: '0.2em' }}>INICIANDO RITUAL...</div>}>
      <HomeContent />
    </Suspense>
  );
}
