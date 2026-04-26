"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, X, Fingerprint, Activity, Zap, ImageIcon, Music, Paperclip } from "lucide-react";
import { supabase } from "@/lib/supabase";
import styles from "./ManifestationCreator.module.css";

interface ManifestationCreatorProps {
  action: {
    id: string;
    name: string;
    aura: string;
  };
  onClose: () => void;
}

export default function ManifestationCreator({ action, onClose }: ManifestationCreatorProps) {
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState<string | null>(null);
  const [vitals, setVitals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [shareToStory, setShareToStory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);

  const moods = ["✨ Épico", "🌿 Calmo", "🔥 Focado", "💧 Melancólico", "🌑 Introspectivo"];
  const healthItems = ["Hidratação", "Descanso", "Movimento", "Nutrição"];

  const toggleVital = (item: string) => {
    setVitals(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      } else {
        setAudioFile(file);
        setAudioPreview(URL.createObjectURL(file));
      }
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const removeAudio = () => {
    setAudioFile(null);
    setAudioPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalContent = content;
    const isMagic = action.id === 'criar';
    
    if (isMagic) {
      finalContent = `🔮 ${content}`;
    } else if (action.id === 'sentir' && sentiment) {
      finalContent = `Feeling ${sentiment}. ${content}`;
    } else if (action.id === 'cuidar' && vitals.length > 0) {
      finalContent = `Self-care update: ${vitals.join(', ')}. ${content}`;
    }

    if (!finalContent.trim() && action.id !== 'integrar') return;
    
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User must be authenticated to manifest.");

      // Buscar perfil para o nome da notificação
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();

      let imageUrl = null;
      let audioUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('manifestations').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('manifestations').getPublicUrl(filePath);
        imageUrl = publicUrl;
      }

      if (audioFile) {
        const fileExt = audioFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('manifestations').upload(filePath, audioFile);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('manifestations').getPublicUrl(filePath);
        audioUrl = publicUrl;
      }

      const { error } = await supabase
        .from('consciousness_nodes')
        .insert([{
          content: finalContent || "Resonância pura.",
          type: action.id,
          user_id: user.id,
          metadata: { 
            aura: action.aura,
            sentiment,
            vitals,
            image_url: imageUrl,
            audio_url: audioUrl,
            timestamp: new Date().toISOString(),
            is_magic: isMagic
          }
        }]);

      if (error) throw error;

      // --- ECHO NOTIFICATIONS ---
      // Buscar todos os seguidores da consciência que está manifestando
      const { data: followers } = await supabase
        .from('user_follows')
        .select('follower_id')
        .eq('following_id', user.id);

      if (followers && followers.length > 0) {
        // Criar notificações para todos os seguidores
        const notifications = followers.map(f => ({
          user_id: f.follower_id,
          type: 'new_flux',
          title: 'Novo Eco no Mundo',
          content: `${profile?.username || 'Uma consciência'} manifestou um novo fluxo.`,
          link: '/', // Link para a home onde ele verá o post
          is_read: false
        }));

        await supabase.from('notifications').insert(notifications);
      }
      // ----------------------------

      if (shareToStory) {
        await supabase
          .from('stories')
          .insert([{
            user_id: user.id,
            content: finalContent || `Sincronia de ${action.name}`
          }]);
      }

      onClose();
    } catch (error) {
      console.error("Error manifesting:", error);
      // Removed alert per user request for a silent flow
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 20 }}
      className={`${styles.overlay} glass`}
    >
      <div className={styles.header}>
        <div className={styles.intentLabel}>
          <span className={styles.dot} style={{ background: action.aura }}></span>
          {action.name}
        </div>
        <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {action.id === 'sentir' && (
          <div className={styles.specialInput}>
            <p className={styles.label}>Como está sua vibração?</p>
            <div className={styles.moodGrid}>
              {moods.map(m => (
                <button 
                  key={m} 
                  type="button"
                  onClick={() => setSentiment(m)}
                  className={`${styles.moodBtn} glass ${sentiment === m ? styles.activeMood : ''}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {action.id === 'cuidar' && (
          <div className={styles.specialInput}>
            <p className={styles.label}>O que você nutriu hoje?</p>
            <div className={styles.vitalsGrid}>
              {healthItems.map(item => (
                <button 
                  key={item} 
                  type="button"
                  onClick={() => toggleVital(item)}
                  className={`${styles.vitalBtn} glass ${vitals.includes(item) ? styles.activeVital : ''}`}
                >
                  {vitals.includes(item) ? <Fingerprint size={14} fill="currentColor" /> : <Fingerprint size={14} />}
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <textarea 
          autoFocus={action.id !== 'sentir' && action.id !== 'cuidar'}
          placeholder={
            action.id === 'sentir' ? "Algo a expressar sobre isso?" :
            action.id === 'cuidar' ? "Observações sobre sua emanência..." :
            `Manifeste seu propósito de ${action.name}...`
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
        />

        <div className={styles.previewsBox}>
          {imagePreview && (
            <div className={styles.mediaPreviewContainer}>
              <img src={imagePreview} className={styles.imagePreview} alt="Preview" />
              <button type="button" onClick={removeImage} className={styles.removeMedia}><X size={16} /></button>
            </div>
          )}

          {audioPreview && (
            <div className={styles.mediaPreviewContainer}>
              <div className={styles.audioPreview}>
                <Music size={24} />
                <span>Vibração capturada</span>
              </div>
              <button type="button" onClick={removeAudio} className={styles.removeMedia}><X size={16} /></button>
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.extraActions}>
            <label className={styles.mediaButton} title="Anexar Imagem">
              <ImageIcon size={18} />
              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} />
            </label>
            <label className={styles.mediaButton} title="Anexar Música">
              <Music size={18} />
              <input type="file" accept="audio/*" onChange={(e) => handleFileChange(e, 'audio')} />
            </label>
            <button 
              type="button" 
              onClick={() => setShareToStory(!shareToStory)}
              className={`${styles.storyToggle} ${shareToStory ? styles.activeStory : ''}`}
            >
              <Zap size={14} />
              <span>Story</span>
            </button>
          </div>
          <button type="submit" className={`${styles.submitBtn} glass`} disabled={loading}>
            <Send size={18} />
            <span>{loading ? "Sincronizando..." : "Manifestar"}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
