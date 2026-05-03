import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data: nodes } = await supabase
    .from('consciousness_nodes')
    .select('id, content')
    .filter('metadata->is_archetype', 'eq', true);

  if (!nodes) return;

  const ARCHETYPE_NAMES = ['Ilusionmon', 'Lucemon', 'Barbamon', 'Leviamon', 'Beelzemon', 'Belphemon', 'Lilithmon', 'Daemon'];

  for (const node of nodes) {
    let content = node.content;

    // 1. Remove Archetype names
    for (const name of ARCHETYPE_NAMES) {
      const regex = new RegExp(`^${name}\\s*[—-]\\s*`, 'i');
      content = content.replace(regex, '');
    }

    // 2. Add comma after first word
    // We split by whitespace or newline
    const parts = content.trim().split(/[\s\n]+/);
    if (parts.length > 0) {
      const firstWord = parts[0];
      // Check if it already has a comma
      if (!firstWord.endsWith(',')) {
        const remaining = content.trim().substring(firstWord.length).trim();
        content = `${firstWord}, ${remaining}`;
      }
    }

    // Update back
    await supabase
      .from('consciousness_nodes')
      .update({ content })
      .eq('id', node.id);
    
    console.log(`Updated node ${node.id}`);
  }
}

run();
