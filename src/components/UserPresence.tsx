"use client";

import { motion } from "framer-motion";
import styles from "./UserPresence.module.css";

interface UserPresenceProps {
  manifestations: any[];
  onClose: () => void;
}

export default function UserPresence({ manifestations, onClose }: UserPresenceProps) {
  // Group manifestations by type to calculate balance
  const stats = manifestations.reduce((acc: any, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {});

  const maxVal = Math.max(...Object.values(stats) as number[], 1);

  const actions = [
    { id: 'cuidar', name: "Cuidar", aura: "var(--aura-care)" },
    { id: 'sentir', name: "Sentir", aura: "var(--aura-feel)" },
    { id: 'buscar', name: "Buscar", aura: "var(--aura-seek)" },
    { id: 'conectar', name: "Conectar", aura: "var(--aura-connect)" },
    { id: 'expressar', name: "Expressar", aura: "var(--aura-express)" },
    { id: 'perceber', name: "Perceber", aura: "var(--aura-perceive)" },
    { id: 'servir', name: "Servir", aura: "var(--aura-serve)" },
    { id: 'observar', name: "Observar", aura: "var(--aura-observe)" },
    { id: 'soltar', name: "Soltar", aura: "var(--aura-release)" },
    { id: 'integrar', name: "Integrar", aura: "var(--aura-integrate)" },
    { id: 'criar', name: "Criar", aura: "var(--aura-create)" },
    { id: 'transcender', name: "Transcender", aura: "var(--aura-transcend)" },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`${styles.container} glass`}
    >
      <div className={styles.header}>
        <button onClick={onClose} className={styles.close}>← Voltar</button>
        <h2 className={styles.title}>Presença</h2>
      </div>

      <div className={styles.mandalaContainer}>
        <div className={styles.auraBase}>
          {actions.map((action, i) => {
            const val = stats[action.id] || 0;
            const size = 50 + (val / maxVal) * 100;
            return (
              <div 
                key={action.id}
                className={styles.auraRay}
                style={{ 
                  '--aura-color': action.aura,
                  '--rotation': `${i * 30}deg`,
                  '--size': `${size}px`,
                  opacity: val > 0 ? 0.6 : 0.1
                } as any}
              />
            )
          })}
          <div className={styles.core}>
            <span className={styles.level}>Nível {manifestations.length}</span>
            <span className={styles.label}>Manifestações</span>
          </div>
        </div>
      </div>

      <div className={styles.stats}>
        <h3 className={styles.sectionTitle}>Equilíbrio de Ser</h3>
        <div className={styles.grid}>
          {actions.map(action => (
            <div key={action.id} className={styles.statRow}>
              <span className={styles.statName}>{action.name}</span>
              <div className={styles.barContainer}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats[action.id] || 0) / maxVal) * 100}%` }}
                  className={styles.bar}
                  style={{ background: action.aura }}
                />
              </div>
              <span className={styles.count}>{stats[action.id] || 0}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
