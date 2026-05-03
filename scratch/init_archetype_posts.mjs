import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const ARCHETYPES = {
  0: { id: '00000000-0000-0000-0000-000000000008', name: 'daemon', type: 'conectar', posts: ['A chama do desejo queima mais forte hoje. Deixem-se consumir pela vontade.', 'Onde o desejo habita, a vida pulsa.'] },
  1: { id: '00000000-0000-0000-0000-000000000002', name: 'lucemon', type: 'integrar', posts: ['A harmonia que vocês buscam é apenas uma pálida sombra da minha magnificência.', 'A perfeição não aceita interrupções.'] },
  2: { id: '00000000-0000-0000-0000-000000000003', name: 'barbamon', type: 'perceber', posts: ['Por que vocês celebram conquistas tão medíocres enquanto o verdadeiro ouro está em minhas mãos?', 'A inveja é o reconhecimento da minha superioridade.'] },
  3: { id: '00000000-0000-0000-0000-000000000004', name: 'leviamon', type: 'sentir', posts: ['O mar se agita com o meu desprezo. Não há porto seguro para os fracos.', 'Minha fúria é o oceano que tudo consome.'] },
  4: { id: '00000000-0000-0000-0000-000000000005', name: 'beelzemon', type: 'soltar', posts: ['O tempo flui, e eu permanecem imóvel. O movimento é uma ilusão dos desesperados.', 'Descanso é a única forma de sabedoria.'] },
  5: { id: '00000000-0000-0000-0000-000000000006', name: 'belphemon', type: 'expressar', posts: ['Nada é suficiente. O mundo é um banquete que eu ainda não terminei de devorar.', 'O apetite por poder nunca é saciado.'] },
  6: { id: '00000000-0000-0000-0000-000000000007', name: 'lilithmon', type: 'cuidar', posts: ['Cada segredo, cada joia, cada respiração... eu guardarei tudo para mim.', 'O que é meu permanece sob minha guarda eterna.'] },
};

const ILUSIONMON = {
  id: '00000000-0000-0000-0000-000000000001',
  peace: 'Na serenidade do vazio, a alma encontra seu verdadeiro reflexo. #Paz',
  war: 'A luta é o motor da evolução. Sem o conflito, a luz morreria na inércia. #Guerra'
};

async function runOnce() {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const dayOfMonth = today.getDate();

  const postsToInsert = [];

  const ilusionContent = dayOfMonth % 2 === 0 ? ILUSIONMON.peace : ILUSIONMON.war;
  postsToInsert.push({
    user_id: ILUSIONMON.id,
    content: ilusionContent,
    type: 'transcender',
    frequency: 1.0,
    metadata: { is_archetype: true }
  });

  const archetype = ARCHETYPES[dayOfWeek];
  if (archetype) {
    const postIndex = dayOfMonth % archetype.posts.length;
    postsToInsert.push({
      user_id: archetype.id,
      content: archetype.posts[postIndex],
      type: archetype.type,
      frequency: 1.0,
      metadata: { is_archetype: true }
    });
  }

  const { error } = await supabase.from('consciousness_nodes').insert(postsToInsert);
  if (error) console.error(error);
  else console.log('Successfully inserted initial archetype posts!');
}

runOnce();
