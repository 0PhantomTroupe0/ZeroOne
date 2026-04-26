"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Save, X, Check, ImageIcon, Camera, Fingerprint, Scissors, Sparkles, Calendar } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/utils/cropImage";
import styles from "./ProfileSettings.module.css";

interface ProfileData {
  id?: string;
  full_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  world_name: string;
  world_image: string;
  status: string;
  cloak_enabled: boolean;
  hat_enabled: boolean;
  selected_pedra: number;
  selected_varinha: number;
  nexo_color: string;
  real_name: string;
  character_name: string;
  age: number | string;
}

interface ProfileSettingsProps {
  onClose: () => void;
  onProfileUpdate?: (profile: any) => void;
}

export default function ProfileSettings({ onClose, onProfileUpdate }: ProfileSettingsProps) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    username: "",
    bio: "",
    avatar_url: "",
    world_name: "",
    world_image: "",
    status: "",
    cloak_enabled: false,
    hat_enabled: false,
    selected_pedra: 0,
    selected_varinha: 0,
    nexo_color: "",
    real_name: "",
    character_name: "",
    age: ""
  });
  
  // Crop states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  const [worldFile, setWorldFile] = useState<File | null>(null);
  const [worldPreview, setWorldPreview] = useState<string | null>(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [cropType, setCropType] = useState<"avatar" | "world">("avatar");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const worldInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select(`
          id, 
          full_name, 
          username, 
          bio, 
          avatar_url, 
          world_name, 
          world_image, 
          status, 
          cloak_enabled, 
          hat_enabled, 
          selected_pedra, 
          selected_varinha, 
          nexo_color, 
          real_name, 
          character_name,
          age
        `)
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setProfile({
          id: data.id,
          full_name: data.full_name || "",
          username: data.username || "",
          bio: data.bio || "",
          avatar_url: data.avatar_url || "",
          world_name: data.world_name || "",
          world_image: data.world_image || "",
          status: data.status || "online",
          cloak_enabled: !!data.cloak_enabled,
          hat_enabled: !!data.hat_enabled,
          selected_pedra: data.selected_pedra || 0,
          selected_varinha: data.selected_varinha || 0,
          nexo_color: data.nexo_color || localStorage.getItem('nexus_design_color') || "#ffffff",
          real_name: data.real_name || data.full_name || "",
          character_name: data.character_name || data.username || "",
          age: data.age || ""
        });
        setAvatarPreview(data.avatar_url);
        setWorldPreview(data.world_image);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setAvatarPreview(reader.result as string);
        setCropType("avatar");
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleWorldFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setWorldPreview(reader.result as string);
        setCropType("world");
        setIsCropping(true);
      });
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmCrop = async () => {
    try {
      const sourceImage = cropType === "avatar" ? avatarPreview : worldPreview;
      if (!sourceImage || !croppedAreaPixels) return;
      
      const croppedImageBlob = await getCroppedImg(sourceImage, croppedAreaPixels);
      if (croppedImageBlob) {
        const croppedFile = new File([croppedImageBlob], "upload.jpg", { type: "image/jpeg" });
        if (cropType === "avatar") {
          setAvatarFile(croppedFile);
          setAvatarPreview(URL.createObjectURL(croppedImageBlob));
        } else {
          setWorldFile(croppedFile);
          setWorldPreview(URL.createObjectURL(croppedImageBlob));
        }
        setIsCropping(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Aura desconectada. Operação inválida.");

      let currentAvatarUrl = profile.avatar_url;

      if (avatarFile) {
        const fileName = `avatar-${Date.now()}.jpg`;
        const filePath = `${user.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { 
            upsert: true,
            contentType: 'image/jpeg' 
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
        
        currentAvatarUrl = `${publicUrl}?t=${Date.now()}`;
      }

      let currentWorldUrl = profile.world_image;
      if (worldFile) {
        const fileName = `world-${Date.now()}.jpg`;
        const filePath = `${user.id}/worlds/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, worldFile, { 
            upsert: true,
            contentType: 'image/jpeg'
          });
        if (uploadError) {
          console.error("World Image upload error:", uploadError);
          throw uploadError;
        }
        const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
        currentWorldUrl = `${publicUrl}?t=${Date.now()}`;
      }

      // Atualização final do perfil (usando update para garantir persistência em linha existente)
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.real_name || profile.full_name,
          username: profile.character_name || profile.username,
          world_name: profile.world_name,
          world_image: currentWorldUrl,
          avatar_url: currentAvatarUrl,
          bio: profile.bio,
          status: profile.status,
          cloak_enabled: profile.cloak_enabled,
          hat_enabled: profile.hat_enabled,
          selected_pedra: profile.selected_pedra,
          selected_varinha: profile.selected_varinha,
          nexo_color: profile.nexo_color,
          real_name: profile.real_name,
          character_name: profile.character_name,
          age: profile.age ? parseInt(profile.age.toString()) : null
        })
        .eq('id', user.id);
      
      if (updateError) throw updateError;

      const updatedProfile = { 
        ...profile, 
        avatar_url: currentAvatarUrl, 
        world_image: currentWorldUrl,
        full_name: profile.real_name || profile.full_name,
        username: profile.character_name || profile.username
      };
      
      setProfile(updatedProfile);
      if (onProfileUpdate) onProfileUpdate(updatedProfile);
      
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Error saving profile:", err);
      if (err.message) console.error("Error message:", err.message);
      if (err.details) console.error("Error details:", err.details);
      if (err.hint) console.error("Error hint:", err.hint);
    } finally {
      setSaving(false);
    }
  };


  if (loading) {
    return (
      <div className={styles.overlay}>
        <p>Sintonizando perfil...</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`${styles.container} glass`}
    >
      <div className={styles.header}>
        <div className={styles.headerTitle}>
          <Fingerprint size={20} className={styles.headerIcon} />
          <h2 className={styles.title}>Sintonia de Presença</h2>
        </div>
        <button onClick={onClose} className={styles.close}><X size={20} /></button>
      </div>

      <form onSubmit={handleSave} className={styles.form}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarPreview} onClick={() => fileInputRef.current?.click()}>
            {avatarPreview ? (
              <img key={avatarPreview} src={avatarPreview} alt="Avatar" />
            ) : (
              <User size={40} />
            )}
            <div className={styles.avatarOverlay}>
              <Camera size={20} />
            </div>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <p className={styles.avatarHint} onClick={() => fileInputRef.current?.click()}>Toque para ajustar imagem</p>
        </div>

        <div className={styles.grid}>
          <div className={styles.section}>
            <label className={styles.label}>Personagem Físico (Original)</label>
            <div className={styles.inputWrapper}>
              <User className={styles.inputIcon} size={16} />
              <input 
                className={styles.input}
                placeholder="Nome real (Privado)..."
                value={profile.real_name}
                onChange={(e) => setProfile(prev => ({ ...prev, real_name: e.target.value }))}
              />
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Personagem Digital (Avatar)</label>
            <div className={styles.inputWrapper}>
              <ImageIcon className={styles.inputIcon} size={16} />
              <input 
                className={styles.input}
                placeholder="Nome do personagem..."
                value={profile.character_name}
                onChange={(e) => setProfile(prev => ({ ...prev, character_name: e.target.value }))}
                required
                minLength={3}
              />
            </div>
          </div>

          <div className={styles.section}>
            <label className={styles.label}>Status de Consciência</label>
            <div className={styles.inputWrapper}>
              <Sparkles className={styles.inputIcon} size={16} />
              <input 
                className={styles.input}
                placeholder="Ex: Sincronizado, Em Meditação..."
                value={profile.status}
                onChange={(e) => setProfile(prev => ({ ...prev, status: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.section}>
            <label className={styles.label}>Idade (Ciclos de Pulso)</label>
            <div className={styles.inputWrapper}>
              <Calendar className={styles.inputIcon} size={16} />
              <input 
                type="number"
                className={styles.input}
                placeholder="Idade do avatar..."
                value={profile.age}
                onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <label className={styles.label}>Manifesto de Bio</label>
          <textarea 
            className={styles.textarea}
            placeholder="Sua essência em palavras..."
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
          />
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionSubtitle}>Meu Mundo</h3>
          <div className={styles.worldGrid}>
            <div className={styles.worldNameSection}>
              <label className={styles.label}>Nome do Mundo</label>
              <div className={styles.inputWrapper}>
                <Sparkles className={styles.inputIcon} size={16} />
                <input 
                  className={styles.input}
                  placeholder="Nome do seu domínio..."
                  value={profile.world_name}
                  onChange={(e) => setProfile(prev => ({ ...prev, world_name: e.target.value }))}
                />
              </div>
            </div>
            <div className={styles.worldImageSection}>
              <label className={styles.label}>Imagem do Mundo</label>
              <div className={styles.worldImagePreview} onClick={() => worldInputRef.current?.click()}>
                {worldPreview ? (
                  <img src={worldPreview} alt="World" />
                ) : (
                  <div className={styles.worldPlaceholder}>
                    <ImageIcon size={30} />
                    <span>Escolher Cenário</span>
                  </div>
                )}
              </div>
              <input 
                type="file" 
                ref={worldInputRef} 
                onChange={handleWorldFileChange} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
            </div>
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionSubtitle}>Ancestralidade & Poder</h3>
          
          <div className={styles.toggleRow}>
            <label className={styles.label}>Manifestar Capa de Vento</label>
            <button 
              type="button" 
              className={`${styles.toggleBtn} ${profile.cloak_enabled ? styles.toggleActive : ''}`}
              onClick={() => setProfile(p => ({ ...p, cloak_enabled: !p.cloak_enabled }))}
            >
              {profile.cloak_enabled ? 'Ativada' : 'Desativada'}
            </button>
          </div>

          <div className={styles.toggleRow}>
            <label className={styles.label}>Manifestar Chapéu de Mago Neon</label>
            <button 
              type="button" 
              className={`${styles.toggleBtn} ${profile.hat_enabled ? styles.toggleActive : ''}`}
              onClick={() => setProfile(p => ({ ...p, hat_enabled: !p.hat_enabled }))}
            >
              {profile.hat_enabled ? 'Ativado' : 'Desativado'}
            </button>
          </div>

          <div className={styles.assetSelector}>
            <label className={styles.label}>Token: Pedra Sagrada</label>
            <div className={styles.assetGrid}>
              {[...Array(12)].map((_, i) => (
                <div 
                  key={`stone-${i+1}`}
                  className={`${styles.assetItem} ${profile.selected_pedra === i + 1 ? styles.assetActive : ''}`}
                  onClick={() => setProfile(p => ({ ...p, selected_pedra: i + 1 }))}
                >
                  <img src={`/pedras/${i+1}.png`} alt={`Pedra ${i+1}`} />
                </div>
              ))}
              <div 
                className={`${styles.assetItem} ${profile.selected_pedra === 0 ? styles.assetActive : ''}`}
                onClick={() => setProfile(p => ({ ...p, selected_pedra: 0 }))}
              >
                <span>Nenhuma</span>
              </div>
            </div>
          </div>

          <div className={styles.assetSelector}>
            <label className={styles.label}>Poder: Varinha Elemental</label>
            <div className={styles.assetGrid}>
              {[...Array(12)].map((_, i) => (
                <div 
                  key={`wand-${i+1}`}
                  className={`${styles.assetItem} ${profile.selected_varinha === i + 1 ? styles.assetActive : ''}`}
                  onClick={() => setProfile(p => ({ ...p, selected_varinha: i + 1 }))}
                >
                  <img src={`/varinhas/${i+1}.png`} alt={`Varinha ${i+1}`} />
                </div>
              ))}
              <div 
                className={`${styles.assetItem} ${profile.selected_varinha === 0 ? styles.assetActive : ''}`}
                onClick={() => setProfile(p => ({ ...p, selected_varinha: 0 }))}
              >
                <span>Nenhuma</span>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className={styles.saveBtn} disabled={saving}>
          {saving ? (
            <div className={styles.loadingPulse}>...</div>
          ) : (
            <Save size={22} />
          )}
        </button>

        <AnimatePresence>
          {success && (
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={styles.successMsg}
            >
              <Check size={16} style={{ display: 'inline', marginRight: '4px' }} /> Ressonância salva com sucesso.
            </motion.p>
          )}
        </AnimatePresence>
      </form>

      {/* Crop Modal */}
      <AnimatePresence>
        {isCropping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.cropOverlay}
          >
            <div className={styles.cropContainer}>
              <div className={styles.cropHeader}>
                <h3>Enquadrar Manifestação</h3>
                <button onClick={() => setIsCropping(false)}><X size={20} /></button>
              </div>
              <div className={styles.cropperWrapper}>
                <Cropper
                  image={(cropType === "avatar" ? avatarPreview : worldPreview)!}
                  crop={crop}
                  zoom={zoom}
                  aspect={cropType === "avatar" ? 1 : 16/9}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                  cropShape={cropType === "avatar" ? "round" : "rect"}
                  showGrid={false}
                />       </div>
              <div className={styles.cropFooter}>
                <div className={styles.zoomControl}>
                  <span>Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e: any) => setZoom(e.target.value)}
                    className={styles.zoomRange}
                  />
                </div>
                <button className={styles.confirmCropBtn} onClick={handleConfirmCrop}>
                  <Scissors size={18} />
                  Confirmar Enquadramento
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}


