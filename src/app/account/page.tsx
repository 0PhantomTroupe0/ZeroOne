"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  ArrowLeft, LogOut, Settings, User, 
  Fingerprint, Activity, Compass, Share2, Zap, 
  Sun, Anchor, Eye, Wind, Atom, Palette, Sparkles 
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import UserPresence from "@/components/UserPresence";
import ProfileSettings from "@/components/ProfileSettings";
import styles from "./account.module.css";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [manifestations, setManifestations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/auth');
        return;
      }
      setUser(currentUser);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      setProfile(profileData);

      const { data: manifestationsData } = await supabase
        .from('consciousness_nodes')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      setManifestations(manifestationsData || []);

    } catch (err) {
      console.error("Error loading account:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth');
  };

  if (loading) return <div className={styles.loading}>Sincronizando consciência...</div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        <button onClick={() => router.push('/')} className={styles.backBtn}>
          <ArrowLeft size={24} /> <span>Fluxo Universal</span>
        </button>
        <h1>Presença Centrada</h1>
        <div style={{ width: '150px' }} />
      </header>

      <div className={styles.contentLayout}>
        <div className={styles.leftColumn}>
          <UserPresence manifestations={manifestations} showLogout={false} />
        </div>

        <div className={styles.rightColumn}>
          <div className={styles.profileSummary}>
            <div className={styles.avatarLarge}>
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Avatar" />
              ) : (
                <User size={64} />
              )}
            </div>
            <div className={styles.mainInfo}>
              <h2>{profile?.full_name || "Sua Presença"}</h2>
              <span className={styles.username}>@{profile?.username}</span>
              <p className={styles.bio}>{profile?.bio || "Bio não manifestada."}</p>
            </div>
          </div>

          <div className={styles.actionGrid}>
            <button 
              className={styles.actionCard}
              onClick={() => router.push(`/profile/${user?.id}`)}
              title="Acessar Perfil"
            >
              <div className={styles.actionIcon}><User size={28} /></div>
              <div className={styles.actionLabel}>
                <h3>Acessar Perfil</h3>
                <p>Veja sua manifestação pública no Nexus</p>
              </div>
            </button>

            <button 
              className={styles.actionCard}
              onClick={() => setShowSettings(true)}
              title="Editar"
            >
              <div className={styles.actionIcon}><Settings size={28} /></div>
              <div className={styles.actionLabel}>
                <h3>Ajustar Identidade</h3>
                <p>Alterar nome, bio e frequências</p>
              </div>
            </button>

            <button 
              className={`${styles.actionCard} ${styles.danger}`}
              onClick={handleLogout}
              title="Desconectar"
            >
              <div className={styles.actionIcon}><LogOut size={28} /></div>
              <div className={styles.actionLabel}>
                <h3>Sair da Frequência</h3>
                <p>Finalizar sessão de consciência</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {showSettings && (
        <ProfileSettings onClose={() => { setShowSettings(false); fetchData(); }} />
      )}
    </main>
  );
}
