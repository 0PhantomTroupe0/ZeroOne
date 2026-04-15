"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, X, Heart, Smile, Zap, Target } from "lucide-react";
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

  const moods = ["✨ Épico", "🌿 Calmo", "🔥 Focado", "💧 Melancólico", "🌑 Introspectivo"];
  const healthItems = ["Hidratação", "Descanso", "Movimento", "Nutrição"];

  const toggleVital = (item: string) => {
    setVitals(prev => prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalContent = content;
    if (action.id === 'sentir' && sentiment) {
      finalContent = `Feeling ${sentiment}. ${content}`;
    } else if (action.id === 'cuidar' && vitals.length > 0) {
      finalContent = `Self-care update: ${vitals.join(', ')}. ${content}`;
    }

    if (!finalContent.trim() && action.id !== 'integrar') return;
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('consciousness_nodes')
        .insert([{
          content: finalContent || "Resonating check-in.",
          type: action.id,
          metadata: { 
            aura: action.aura,
            sentiment,
            vitals,
            timestamp: new Date().toISOString()
          }
        }]);

      if (error) throw error;
      onClose();
    } catch (error) {
      console.error("Error manifesting:", error);
      alert("The signal failed to propagate.");
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
                  {vitals.includes(item) ? <Heart size={14} fill="currentColor" /> : <Heart size={14} />}
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
            action.id === 'cuidar' ? "Observações sobre seu estado..." :
            `Manifeste seu propósito de ${action.name}...`
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={styles.textarea}
        />

        <div className={styles.footer}>
          <p className={styles.hint}>Orgânico. Simples. Real.</p>
          <button type="submit" className={`${styles.submitBtn} glass`} disabled={loading}>
            <Send size={18} />
            <span>{loading ? "Vibrando..." : "Manifestar"}</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
}
