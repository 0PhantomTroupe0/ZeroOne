import { useState, useRef, useEffect } from "react";
import { Search, X, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";
import styles from "./UserSearch.module.css";

interface Profile {
  id: string;
  username: string;
  full_name: string;
  avatar_url: string;
}

interface TagResult {
  tag: string;
  count: number;
}

export default function UserSearch({ 
  onTagSelect, 
  children 
}: { 
  onTagSelect?: (tag: string) => void,
  children?: React.ReactNode
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Profile[]>([]);
  const [tagResults, setTagResults] = useState<TagResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length >= 2) {
        handleSearch();
      } else {
        setResults([]);
        setTagResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  async function handleSearch() {
    setLoading(true);
    try {
      // 1. Buscar Perfis
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .ilike('username', `%${query}%`)
        .limit(5);

      setResults(profileData || []);

      // 2. Buscar Tags (na tabela de sentimentos que começam com tag:)
      const cleanQuery = query.replace('#', '').toLowerCase();
      const { data: tagData } = await supabase
        .from('node_sentiments')
        .select('sentiment_type')
        .ilike('sentiment_type', `tag:%${cleanQuery}%`)
        .limit(20);

      // Agrupar e contar as tags encontradas nos resultados da busca
      if (tagData) {
        const counts: Record<string, number> = {};
        tagData.forEach(s => {
          const tagName = s.sentiment_type.replace('tag:', '');
          counts[tagName] = (counts[tagName] || 0) + 1;
        });
        
        const mappedTags = Object.entries(counts).map(([tag, count]) => ({
          tag,
          count
        }));
        
        setTagResults(mappedTags);
      } else {
        setTagResults([]);
      }

      setIsOpen(true);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  }

  const navigateToProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
    setIsOpen(false);
    setQuery("");
  };

  const selectTag = (tag: string) => {
    // Agora redirecionamos para a Home (Janela de Fluxo) com o filtro
    router.push(`/?tag=${tag}`);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div className={styles.searchWrapper} ref={searchRef}>
      <div className={styles.searchContainer}>
        <Search className={styles.searchIcon} size={18} />
        <input
          type="text"
          placeholder="Buscar consciências ou #tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          className={styles.searchInput}
        />
        {query && (
          <button onClick={() => setQuery("")} className={styles.clearBtn}>
            <X size={16} />
          </button>
        )}
        {children}
      </div>

      <AnimatePresence>
        {isOpen && (results.length > 0 || tagResults.length > 0 || loading) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={styles.dropdown}
          >
            {loading ? (
              <div className={styles.status}>Sincronizando...</div>
            ) : (
              <>
                {/* Perfis */}
                {results.length > 0 && (
                  <div className={styles.sectionTitle}>Consciências</div>
                )}
                {results.map((profile) => (
                  <div
                    key={profile.id}
                    className={styles.resultItem}
                    onClick={() => navigateToProfile(profile.id)}
                  >
                    <div className={styles.avatarMini}>
                      {profile.avatar_url ? (
                        <img src={profile.avatar_url} alt={profile.username} />
                      ) : (
                        <User size={14} />
                      )}
                    </div>
                    <div className={styles.info}>
                      <span className={styles.username}>@{profile.username}</span>
                      <span className={styles.fullName}>{profile.full_name}</span>
                    </div>
                  </div>
                ))}

                {/* Tags */}
                {tagResults.length > 0 && (
                  <div className={styles.sectionTitle} style={{ marginTop: '0.5rem' }}>Etiquetas</div>
                )}
                {tagResults.map((tagObj) => (
                  <div
                    key={tagObj.tag}
                    className={styles.resultItem}
                    onClick={() => selectTag(tagObj.tag)}
                  >
                    <div className={styles.avatarMini} style={{ background: 'var(--accent-glow)', color: '#fff' }}>
                      #
                    </div>
                    <div className={styles.info}>
                      <span className={styles.username}>#{tagObj.tag}</span>
                      <span className={styles.fullName}>{tagObj.count} manifestações</span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
