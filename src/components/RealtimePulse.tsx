import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

interface RealtimePulseProps {
  channelName?: string;
  label?: string;
  showLabel?: boolean;
  streak?: number;
}

export default function RealtimePulse({ 
  channelName = "global-heartbeat", 
  label = "Sincronia Global",
  showLabel = true,
  streak
}: RealtimePulseProps) {
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">("connecting");

  useEffect(() => {
    const channel = supabase.channel(channelName);

    channel
      .on("system", { event: "*" }, (payload) => {
        console.log("Realtime system event:", payload);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          setStatus("connected");
        } else if (status === "CLOSED" || status === "TIMED_OUT") {
          setStatus("disconnected");
        } else if (status === "CHANNEL_ERROR") {
          setStatus("error");
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelName]);

  const getStatusColor = () => {
    switch (status) {
      case "connected": return "var(--design-neon, #ffffff)";
      case "connecting": 
      case "disconnected": 
      case "error": return "#000000";
      default: return "#000000";
    }
  };

  const getStatusGlow = () => {
    switch (status) {
      case "connected": return "0 0 12px var(--design-neon, rgba(255,255,255,0.8)), 0 0 4px var(--design-neon, #ffffff)";
      case "connecting": 
      case "disconnected": 
      case "error": return "0 0 6px var(--design-neon, rgba(255,255,255,0.6)), 0 0 2px var(--design-neon, #ffffff)";
      default: return "none";
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>
      <motion.div
        animate={status === "connected" ? {
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          boxShadow: getStatusGlow(),
          border: status === 'connecting' ? '1px solid rgba(255,255,255,0.6)' : 'none',
        }}
        title={`Status: ${status}`}
      />
      {showLabel && (
        <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {status === "connected" ? label : "Sincronizando"}
          {streak !== undefined && streak > 0 && (
            <span style={{ opacity: 0.7, marginLeft: '4px' }}>
              • {streak} {streak === 1 ? 'dia' : 'dias'}
            </span>
          )}
        </span>
      )}
      <motion.div
        animate={status === "connected" ? {
          scale: [1, 1.5, 1],
          opacity: [1, 0.5, 1],
        } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          backgroundColor: getStatusColor(),
          boxShadow: getStatusGlow(),
          border: status === 'connected' ? 'none' : '1px solid rgba(255,255,255,0.4)',
        }}
      />
    </div>
  );
}
