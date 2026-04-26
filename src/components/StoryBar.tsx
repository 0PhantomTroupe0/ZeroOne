import { useState, useEffect } from "react";
import { motion } from "framer-motion";

import { supabase } from "@/lib/supabase";
import styles from "./StoryBar.module.css";

interface Story {
  id: string;
  user_id: string;
  content: string;
  media_url: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string;
  };
}

export default function StoryBar({ userId }: { userId?: string }) {
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetchStories();
    
    const channel = supabase
      .channel('stories_realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stories' }, () => {
        fetchStories();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  async function fetchStories() {
    try {
      // Fetch only stories from last 24h
      let query = supabase
        .from('stories')
        .select(`
          id, content, media_url, created_at, user_id,
          profiles (username, avatar_url)
        `)
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setStories(data as any || []);
    } catch (err) {
      console.error("Error fetching stories:", err);
    } finally {
      setLoading(false);
    }
  }



  return (
    <div className={styles.storyContainer}>
      <div className={styles.storyScroll}>


        {stories.map((story) => (
          <motion.div 
            key={story.id} 
            className={styles.storyItem}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.avatarRing}>
              {story.profiles?.avatar_url ? (
                <img src={story.profiles.avatar_url} alt={story.profiles.username} className={styles.avatar} />
              ) : (
                <div className={styles.avatarInitial}>
                  {story.profiles?.username?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <span>{story.profiles?.username}</span>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
