'use client';

import React, { useEffect, useState } from 'react';
import { updateService, UpdateInfo } from '@/services/updateService';
import styles from './UpdateNotifier.module.css';
import { RefreshCw, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const UpdateNotifier: React.FC = () => {
  const [newUpdate, setNewUpdate] = useState<UpdateInfo | null>(null);
  const [countdown, setCountdown] = useState<number>(5);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkUpdate = async () => {
      const data = await updateService.checkRemoteVersion();
      if (data && updateService.isNewer(data.version)) {
        setNewUpdate(data);
        setIsVisible(true);

        // Se a atualização automática estiver ativa, inicia contagem
        if (updateService.isAutoEnabled()) {
          const timer = setInterval(() => {
            setCountdown((prev) => {
              if (prev <= 1) {
                clearInterval(timer);
                updateService.applyUpdate();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          return () => clearInterval(timer);
        }
      }
    };

    // Verifica ao carregar e a cada 30 min
    checkUpdate();
    const interval = setInterval(checkUpdate, 1000 * 60 * 30);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible || !newUpdate) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className={styles.container}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
      >
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <RefreshCw className={styles.iconSpin} size={18} />
            <span className={styles.title}>Nova Atualização: v{newUpdate.version}</span>
          </div>
          <button className={styles.closeBtn} onClick={() => setIsVisible(false)}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.changelogTitle}>O que mudou:</p>
          <div className={styles.changelogBox}>
            {newUpdate.changelog}
          </div>
        </div>

        <div className={styles.footer}>
          {updateService.isAutoEnabled() ? (
            <div className={styles.autoStatus}>
              Reiniciando em {countdown}s...
            </div>
          ) : (
            <button className={styles.updateNowBtn} onClick={() => updateService.applyUpdate()}>
              Atualizar Agora
            </button>
          )}
        </div>

        <div className={styles.progressBar} style={{ width: `${(countdown / 5) * 100}%` }} />
      </motion.div>
    </AnimatePresence>
  );
};
