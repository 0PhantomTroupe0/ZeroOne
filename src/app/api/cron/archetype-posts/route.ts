import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ARCHETYPES = {
  0: { 
    id: '00000000-0000-0000-0000-000000000008', 
    name: 'daemon', 
    type: 'conectar', 
    posts: [
      'Eu, era movido pelo desejo… sem controle.\n\nA luxúria me puxava para tudo que era intenso e passageiro.\nMas dentro dela… havia vida.\n\nEla me ensinou sobre conexão.\nSobre sentir… sem fugir.\n\nHoje, eu não reprimo meu desejo…\neu o compreendo.\n\nPorque quando consciente…\nele deixa de ser vício — e se torna energia criadora.',
      'Luxúria, Eu seguia cada impulso… sem questionar.\n\nA luxúria me levava para o intenso… mas vazio depois.\nAté eu perceber:\n\nSentir não é o problema…\né não entender o que se sente.\n\nEla me ensinou energia…\nmas também consciência.\n\nHoje, eu escolho meus desejos…\nem vez de ser escolhido por eles.\n\nPorque o prazer sem direção…\nse perde em si mesmo.',
      'Propósito, Eu me perdia nos impulsos.\n\nA luxúria me levava ao intenso…\nmas nunca ao completo.\n\nEu resistia ao vazio depois…\nmas ele sempre voltava.\n\nEla me ensinou sentir…\nmas exigiu consciência.\n\nHoje, eu escolho o que desejo…\ncom intenção.\n\nPorque o desejo sem direção…\nse dissolve… sem deixar nada.',
      'Intenção, Eu já fui muito pelo impulso.\n\nSem pensar muito… só indo.\n\nNa hora parecia bom, mas depois nem tanto.\n\nHoje eu tento entender melhor o que eu quero de verdade.\n\nAinda erro…\nmas já não é mais no automático.',
      'Mudança, Eu já fui muito de agir no impulso.\n\nSem pensar muito nas consequências.\n\nE algumas vezes me arrependi.\n\nHoje eu tento me perguntar antes:\n“é isso mesmo que eu quero?”\n\nNem sempre eu paro…\nmas quando paro, muda tudo.',
      'Escolha, Eu já fui muito no impulso do momento.\n\nSem pensar no depois.\n\nE nem sempre o depois foi bom.\n\nHoje eu tento sentir…\nmas também entender.\n\nNem todo desejo precisa virar ação.\n\nIsso mudou bastante coisa pra mim.'
    ] 
  },
  1: { 
    id: '00000000-0000-0000-0000-000000000002', 
    name: 'lucemon', 
    type: 'integrar', 
    posts: [
      'Eu, já me coloquei acima de todos… e caí por isso.\n\nA soberba me cegou — me fez acreditar que eu não precisava aprender.\nMas foi na queda que eu entendi:\n\nReconhecer meu valor não significa negar o valor dos outros.\n\nHoje, eu não abaixa minha essência…\nmas também não ignoro o que o mundo pode me ensinar.\n\nO verdadeiro poder não está em se achar superior…\nmas em não precisar provar isso.',
      'Soberba, Eu confundia grandeza com isolamento.\n\nA soberba me afastava… me colocava acima, mas sozinho.\nE foi no silêncio disso que eu percebi:\n\nSer superior não significa estar separado.\n\nEla me ensinou a reconhecer meu valor…\nmas também a enxergar valor fora de mim.\n\nHoje, eu permaneço firme…\nsem precisar diminuir ninguém.\n\nPorque quem realmente é…\nnão precisa se comparar.',
      'Humildade, Eu acreditava que não precisava de ninguém.\n\nA soberba me fazia intocável… mas inalcançável também.\nE no auge disso… eu não tinha nada real.\n\nEu resisti a reconhecer falhas…\naté entender que isso me limitava.\n\nEla me ensinou confiança…\nmas a vida me ensinou humildade.\n\nHoje, eu sustento quem sou…\nsem me fechar para o mundo.\n\nPorque grandeza de verdade…\ncresce quando se expande.',
      'Conexão, Eu já fui aquele cara que achava que sabia tudo.\n\nNão ouvia ninguém…\nsempre achava que tava certo.\n\nNo fim, isso só me afastava das pessoas.\n\nHoje eu ainda confio em mim…\nmas aprendi a ouvir também.\n\nPorque ninguém cresce sozinho.',
      'Sinceridade, Eu já tive dificuldade de admitir que tava errado.\n\nDava um jeito de justificar tudo.\n\nMas no fundo… eu sabia.\n\nDemorou, mas eu entendi que errar não me diminui.\n\nHoje eu tento ser mais sincero comigo mesmo.\n\nAinda não é fácil…\nmas já é bem melhor.',
      'Ajuda, Eu já tive dificuldade de pedir ajuda.\n\nAchava que tinha que dar conta de tudo sozinho.\n\nMas isso só me cansava mais.\n\nHoje eu ainda gosto de fazer do meu jeito…\nmas já aceito quando alguém soma.\n\nFica tudo mais leve.'
    ] 
  },
  2: { 
    id: '00000000-0000-0000-0000-000000000003', 
    name: 'barbamon', 
    type: 'perceber', 
    posts: [
      'Eu, desejava tudo que não era meu.\n\nA inveja me consumia… me comparava… me diminuía.\nAté eu perceber:\n\nO que me incomodava nos outros… era o que faltava em mim.\n\nEla me ensinou a enxergar meus próprios vazios.\nE a transformá-los em construção.\n\nHoje, eu não quero o que é do outro…\neu me torno alguém que também pode conquistar.',
      'Inveja, Eu olhava para os outros… e esquecia de mim.\n\nA inveja me fazia viver vidas que não eram minhas.\nAté eu entender:\n\nCada desejo escondia uma direção.\n\nEla me ensinou a observar…\nnão para cobiçar — mas para aprender.\n\nHoje, eu uso o que vejo…\ncomo caminho, não como peso.\n\nPorque aquilo que admiro…\npode ser construído dentro de mim.',
      'Direção, Eu me comparava em silêncio.\n\nA inveja me fazia olhar para fora…\nenquanto eu ignorava tudo que havia em mim.\n\nEu resisti à minha própria realidade…\naté perceber que isso me travava.\n\nEla me ensinou desejo…\nmas também direção.\n\nHoje, eu olho para o outro…\nsem deixar de me enxergar.\n\nPorque comparação cega…\nmas consciência constrói.',
      'Caminho, Já comparei minha vida com a dos outros várias vezes.\n\nE sempre saía pior disso.\n\nParecia que todo mundo tava na frente… menos eu.\n\nMas comecei a pensar diferente:\nse eu admiro algo, talvez eu também possa construir.\n\nAinda acontece às vezes…\nmas hoje eu sei usar isso melhor.',
      'Aprendizado, Às vezes eu vejo alguém conseguindo algo\ne penso “por que não eu?”\n\nJá me deixou bem mal isso.\n\nMas comecei a olhar diferente.\n\nEm vez de me comparar, eu tento aprender.\n\nSe alguém conseguiu…\ntalvez eu também consiga, do meu jeito.',
      'Motivação, Já me peguei pensando que a vida dos outros era melhor.\n\nE isso me travava.\n\nPorque enquanto eu olhava pra eles…\neu não fazia nada por mim.\n\nHoje eu tento usar isso como motivação.\n\nSe me incomoda…\né porque importa pra mim.'
    ] 
  },
  3: { 
    id: '00000000-0000-0000-0000-000000000004', 
    name: 'leviamon', 
    type: 'sentir', 
    posts: [
      'Eu, destruía tudo ao meu redor… sem pensar.\n\nA ira me dominava — rápida, intensa, cega.\nMas dentro dela… havia verdade.\n\nEla me mostrou meus limites.\nMe ensinou o que eu não aceitava mais.\n\nHoje, eu não elimino minha ira…\neu a controlo.\n\nPorque quando direcionada…\nnela deixa de destruir — e começa a proteger.',
      'Ira, Eu explodia… e depois restava o vazio.\n\nA ira me dava força… mas levava tudo embora.\nAté eu perceber que ela não era o problema:\n\nEra a falta de direção.\n\nEla me ensinou intensidade…\nmas também responsabilidade.\n\nHoje, eu canalizo o que sinto…\nem vez de deixar escapar.\n\nPorque a mesma força que destrói…\ntambém pode sustentar.',
      'Domínio, Eu reagia antes de entender.\n\nA ira era rápida… forte… incontrolável.\nE quando passava… restava o dano.\n\nEu resisti a senti-la…\nmas ela sempre voltava mais intensa.\n\nEla me ensinou verdade…\nmas exigiu controle.\n\nHoje, eu sinto… antes de agir.\n\nPorque a força não está na explosão…\nmas no domínio dela.',
      'Motivo, Eu já explodi por coisa pequena.\n\nNa hora parecia justificável…\ndepois vinha o arrependimento.\n\nCom o tempo eu fui entendendo:\na raiva sempre vem por algum motivo.\n\nHoje eu tento parar um pouco antes de reagir.\n\nNem sempre consigo…\nmas já é diferente de antes.',
      'Diferença, Eu já respondi na hora… sem pensar.\n\nE na maioria das vezes, piorou tudo.\n\nHoje eu tento segurar um pouco mais.\n\nRespirar, dar um tempo…\n\nNem sempre eu consigo, sendo real.\n\nMas quando consigo… faz muita diferença.',
      'Energia, Eu já me irritei com coisa boba.\n\nE depois pensei: “nem precisava disso tudo”.\n\nMas na hora… parece grande.\n\nHoje eu tento dar um passo pra trás.\n\nNem tudo merece minha energia.\n\nAinda falho às vezes…\nmas já melhorei bastante.'
    ] 
  },
  4: { 
    id: '00000000-0000-0000-0000-000000000005', 
    name: 'beelzemon', 
    type: 'soltar', 
    posts: [
      'Eu, evitava tudo… até a mim mesmo.\n\nA preguiça me paralisava, me afastava do que eu poderia ser.\nMas no silêncio… eu entendi algo:\n\nNem todo movimento é necessário.\n\nEla me ensinou a economizar energia…\na escolher melhor minhas batalhas.\n\nHoje, eu não fujo da ação…\neu ajo com intenção.\n\nPorque descansar também é estratégia.',
      'Preguiça, Eu me escondia atrás da inércia.\n\nA preguiça me mantinha seguro… mas estagnado.\nAté eu entender:\n\nDescanso sem propósito… vira prisão.\n\nEla me ensinou pausa…\nmas também me mostrou o custo do excesso.\n\nHoje, eu descanso para continuar…\nnão para fugir.\n\nPorque o tempo parado…\ntambém cobra seu preço.',
      'Intenção, Eu deixava tudo para depois… inclusive a mim.\n\nA preguiça me mantinha confortável…\nmas distante de qualquer evolução.\n\nEu resisti ao esforço…\naté perceber o que estava perdendo.\n\nEla me ensinou calma…\nmas também me mostrou limite.\n\nHoje, eu descanso com propósito…\ne ajo com consciência.\n\nPorque fugir do movimento…\né abrir mão do próprio caminho.',
      'Passo, Eu já deixei muita coisa pra depois.\n\nE sendo sincero… às vezes ainda deixo.\n\nNem sempre é só preguiça, às vezes é cansaço, desânimo…\n\nMas eu percebi que, se eu não fizer nada, nada muda.\n\nEntão hoje eu tento dar pelo menos um passo.\n\nMesmo pequeno.',
      'Equilíbrio, Tem dias que eu não tenho vontade nenhuma de fazer nada.\n\nE eu já me culpei muito por isso.\n\nMas também entendi que eu não sou máquina.\n\nSó que também não posso parar sempre.\n\nEntão hoje eu tento equilibrar.\n\nDescansar… mas não desistir.',
      'Ritmo, Tem dias que eu só quero ficar parado.\n\nSem pensar, sem fazer nada.\n\nE às vezes eu deixo.\n\nMas não como antes… por dias.\n\nHoje eu tento pelo menos fazer algo pequeno.\n\nSó pra não perder o ritmo.'
    ] 
  },
  5: { 
    id: '00000000-0000-0000-0000-000000000006', 
    name: 'belphemon', 
    type: 'expressar', 
    posts: [
      'Eu, queria tudo… o tempo todo.\n\nA gula nunca me deixava satisfeito.\nMas foi nesse excesso… que eu encontrei o limite.\n\nEla me mostrou o valor do suficiente.\nO peso do desequilíbrio.\n\nHoje, eu ainda desejo…\nmas sei quando parar.\n\nPorque o verdadeiro controle…\nnão está em consumir — mas em saber o bastante.',
      'Gula, Eu consumia para preencher o que nem entendia.\n\nA gula me fazia buscar fora… o que faltava dentro.\nE mesmo com tudo… ainda não era suficiente.\n\nEla me ensinou desejo…\nmas também consciência.\n\nHoje, eu sinto a fome…\nmas escuto o que ela significa.\n\nPorque nem toda vontade…\nprecisa ser alimentada.',
      'Essência, Eu buscava excesso em tudo.\n\nNada bastava… nada preenchia.\nE quanto mais eu tinha… mais vazio eu sentia.\n\nEu resistia ao limite…\naté entender que ele era necessário.\n\nEla me ensinou intensidade…\nmas também equilíbrio.\n\nHoje, eu escolho o que consumir…\nem vez de aceitar tudo.\n\nPorque o excesso descontrolado…\nafasta do essencial.',
      'Devagar, Eu tenho essa coisa de exagerar.\n\nQuando gosto de algo, quero muito, rápido, tudo.\n\nE depois fico meio vazio.\n\nTô aprendendo a ir mais devagar.\n\nA aproveitar melhor…\nsem precisar de tanto.',
      'Leveza, Eu tenho tendência a exagerar.\n\nQuando começo algo, quero ir até o máximo.\n\nE depois fico cansado… ou até meio perdido.\n\nTô aprendendo a pegar mais leve.\n\nNem tudo precisa ser tão intenso o tempo todo.',
      'Sentido, Eu já quis tudo ao mesmo tempo.\n\nAssistir tudo, comer tudo, viver tudo…\n\nE no fim ficava cansado.\n\nHoje eu tento aproveitar melhor…\nem vez de só consumir.\n\nFaz mais sentido assim.'
    ] 
  },
  6: { 
    id: '00000000-0000-0000-0000-000000000007', 
    name: 'lilithmon', 
    type: 'cuidar', 
    posts: [
      'Eu, acumulava… com medo de perder.\n\nA avareza me fechava, me isolava, me prendia ao que eu tinha.\nAté eu perceber:\n\nNada cresce quando não circula.\n\nEla me ensinou valor…\nmas também me ensinou fluxo.\n\nHoje, eu sei guardar…\nmas também sei liberar.\n\nPorque riqueza de verdade…\nnão é só ter — é saber usar.',
      'Avareza, Eu segurava tudo… com medo de ficar sem.\n\nA avareza me fazia proteger… até o que já não precisava.\nE nisso, eu me prendia.\n\nEla me ensinou valor…\nmas também desapego.\n\nHoje, eu escolho o que manter…\ne o que deixar ir.\n\nPorque segurar demais…\ntambém é perder.',
      'Liberdade, Eu tentava garantir tudo… a qualquer custo.\n\nA avareza me fazia segurar… até o que não fazia mais sentido.\nE nisso, eu me tornava prisioneiro.\n\nEu resistia a perder…\naté perceber que isso me impedia de viver.\n\nEla me ensinou valor…\nmas também liberdade.\n\nHoje, eu mantenho o que importa…\ne libero o que pesa.\n\nPorque possuir tudo…\né, muitas vezes, não ter nada.',
      'Confiança, Eu já tive medo de perder o que conquistei.\n\nE por isso segurava tudo… até demais.\n\nSó que isso também me prendia.\n\nHoje eu tô aprendendo a confiar mais.\n\nNem tudo precisa ficar comigo o tempo todo.',
      'Soltura, Eu já quis ter controle de tudo.\n\nGuardar, segurar, garantir…\n\nComo se isso fosse me deixar seguro.\n\nMas percebi que isso só me deixava tenso.\n\nHoje eu tento soltar mais.\n\nConfiar que nem tudo precisa estar na minha mão.',
      'Partilha, Eu já tive dificuldade de compartilhar.\n\nTempo, coisas, até atenção.\n\nComo se eu fosse ficar sem depois.\n\nMas percebi que dividir não me diminui.\n\nHoje eu ainda penso às vezes…\nmas já consigo soltar mais.'
    ] 
  },
};

const ILUSIONMON = {
  id: '00000000-0000-0000-0000-000000000001',
  peace: [
    'Na, serenidade do vazio, a alma encontra seu verdadeiro reflexo. #Paz',
    'A, paz não é a ausência de movimento, mas a harmonia dentro dele.'
  ],
  war: [
    'A, luta é o motor da evolução. Sem o conflito, a luz morreria na inércia. #Guerra',
    'A, guerra interna é o palco onde o novo ser é forjado.'
  ],
  dynamic: [
    'Paz, Eu já fui refém dos extremos.\n\nOu destruía tudo… ou me anulava completamente.\nAté entender que nenhum dos dois, sozinho, sustenta.\n\nA guerra me ensinou a agir.\nA paz me ensinou a compreender.\n\nHoje, eu não escolho um lado…\neu crio equilíbrio entre eles.\n\nPorque o verdadeiro controle…\nnão está na ausência de conflito —\nmas na consciência dele.',
    'Adaptação, Eu tentei controlar tudo… até entender que não sou o centro.\n\nA paz sem ação me apagava.\nA guerra sem consciência me consumia.\n\nEu resisti aos dois… e me perdi.\nAté perceber:\n\nEquilíbrio não é controle… é adaptação.\n\nA guerra me ensinou presença.\nA paz me ensinou clareza.\n\nHoje, eu me movo entre ambos…\nsem me prender a nenhum.\n\nPorque existir…\né saber fluir entre extremos.',
    'Escuta, Eu vou te falar…\ntem dia que eu só quero ficar em paz.\n\nMas tem outros que qualquer coisa me irrita.\nAntes eu achava que isso era errado.\n\nHoje eu vejo que não.\nA paz me ajuda a respirar.\nA raiva me mostra que algo não tá certo.\n\nTô aprendendo a escutar os dois.',
    'Entendimento, Sabe quando você quer evitar problema…\nmas também sente vontade de resolver tudo na hora?\n\nEu sou meio assim.\n\nJá tentei ignorar tudo…\ne já fui pra cima de tudo também.\n\nNenhum dos dois deu muito certo.\n\nHoje eu tento entender primeiro…\ne agir depois.\n\nTô aprendendo a não me perder no meio disso.',
    'Atitude, Tem hora que eu fico quieto só pra não arrumar problema.\n\nE tem hora que eu já quero resolver tudo de uma vez.\n\nJá me confundi muito com isso.\n\nHoje eu tento parar e pensar:\n“isso precisa de calma ou atitude?”\n\nNem sempre acerto…\nmas já não vou no automático.'
  ]
};

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization');
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const dayOfMonth = today.getDate();

    const postsToInsert = [];

    // 1. Daily post for Ilusionmon (Rotating options)
    const ilusionOptions = [
      dayOfMonth % 2 === 0 ? ILUSIONMON.peace[dayOfMonth % ILUSIONMON.peace.length] : ILUSIONMON.war[dayOfMonth % ILUSIONMON.war.length],
      ...ILUSIONMON.dynamic
    ];
    postsToInsert.push({
      user_id: ILUSIONMON.id,
      content: ilusionOptions[dayOfMonth % ilusionOptions.length],
      type: 'transcender',
      frequency: 1.0,
      metadata: { is_archetype: true }
    });

    // 2. Specific archetype for the day
    const archetype = ARCHETYPES[dayOfWeek as keyof typeof ARCHETYPES];
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

    const { error } = await supabase
      .from('consciousness_nodes')
      .insert(postsToInsert);

    if (error) throw error;

    return NextResponse.json({ success: true, inserted: postsToInsert.length });
  } catch (error: any) {
    console.error('Error in archetype cron:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
