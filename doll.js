/* Sparkle Tables – customisable doll (SVG) */
'use strict';

const DOLL_ITEMS = [
  // slot, id, name, cost, extra
  {slot:'outfit', id:'fairy',    name:'Fairy dress',   cost:0,   ico:'🧚'},
  {slot:'outfit', id:'mermaid',  name:'Mermaid tail',  cost:40,  ico:'🧜‍♀️'},
  {slot:'outfit', id:'unicorn',  name:'Unicorn hoodie',cost:60,  ico:'🦄'},
  {slot:'outfit', id:'princess', name:'Ball gown',     cost:90,  ico:'👸'},
  {slot:'outfit', id:'rainbow',  name:'Rainbow dress', cost:120, ico:'🌈'},

  {slot:'hair', id:'long',   name:'Long hair',  cost:0,  ico:'💇‍♀️'},
  {slot:'hair', id:'bun',    name:'Bun',        cost:25, ico:'🎀'},
  {slot:'hair', id:'plaits', name:'Plaits',     cost:25, ico:'👧'},
  {slot:'hair', id:'curls',  name:'Big curls',  cost:35, ico:'🌀'},

  {slot:'hairColour', id:'#6b3e26', name:'Chestnut', cost:0,  swatch:'#6b3e26'},
  {slot:'hairColour', id:'#f5d06f', name:'Golden',   cost:10, swatch:'#f5d06f'},
  {slot:'hairColour', id:'#2b2b3d', name:'Midnight', cost:10, swatch:'#2b2b3d'},
  {slot:'hairColour', id:'#ff7eb6', name:'Candy pink',cost:20, swatch:'#ff7eb6'},
  {slot:'hairColour', id:'#9b6cff', name:'Lilac',    cost:20, swatch:'#9b6cff'},
  {slot:'hairColour', id:'#4fd1c5', name:'Sea green',cost:20, swatch:'#4fd1c5'},
  {slot:'hairColour', id:'rainbow', name:'Rainbow',  cost:50, swatch:'linear-gradient(90deg,#ff7eb6,#ffd166,#7ddf9a,#4fd1c5,#9b6cff)'},

  {slot:'skin', id:'#f6d3b8', name:'Skin 1', cost:0, swatch:'#f6d3b8'},
  {slot:'skin', id:'#e8b791', name:'Skin 2', cost:0, swatch:'#e8b791'},
  {slot:'skin', id:'#c68a5a', name:'Skin 3', cost:0, swatch:'#c68a5a'},
  {slot:'skin', id:'#8d5a3b', name:'Skin 4', cost:0, swatch:'#8d5a3b'},
  {slot:'skin', id:'#5b3a29', name:'Skin 5', cost:0, swatch:'#5b3a29'},

  {slot:'head', id:'none',    name:'Nothing',      cost:0,  ico:'✖️'},
  {slot:'head', id:'flower',  name:'Flower',       cost:15, ico:'🌸'},
  {slot:'head', id:'bow',     name:'Bow',          cost:15, ico:'🎀'},
  {slot:'head', id:'tiara',   name:'Tiara',        cost:30, ico:'👑'},
  {slot:'head', id:'starband',name:'Star band',    cost:30, ico:'⭐'},
  {slot:'head', id:'shells',  name:'Shell crown',  cost:45, ico:'🐚'},

  {slot:'held', id:'none',  name:'Nothing',    cost:0,  ico:'✖️'},
  {slot:'held', id:'wand',  name:'Star wand',  cost:20, ico:'🪄'},
  {slot:'held', id:'shell', name:'Magic shell',cost:20, ico:'🐚'},
  {slot:'held', id:'bunny', name:'Bunny toy',  cost:35, ico:'🐰'},
  {slot:'held', id:'balloon',name:'Balloon',   cost:35, ico:'🎈'},

  {slot:'bg', id:'meadow', name:'Meadow',   cost:0,  ico:'🌷'},
  {slot:'bg', id:'lagoon', name:'Lagoon',   cost:30, ico:'🌊'},
  {slot:'bg', id:'glen',   name:'Fairy glen',cost:30, ico:'🍄'},
  {slot:'bg', id:'castle', name:'Castle',   cost:60, ico:'🏰'},
  {slot:'bg', id:'night',  name:'Starry night',cost:60, ico:'🌙'},
];

const DOLL_SLOTS = [
  {id:'outfit', name:'Outfits 👗'}, {id:'hair', name:'Hair 💇‍♀️'}, {id:'hairColour', name:'Hair colour 🎨'},
  {id:'skin', name:'Skin 🧑'}, {id:'head', name:'Headwear 👑'}, {id:'held', name:'Hold 🪄'}, {id:'bg', name:'Background 🌈'},
];

const DOLL_DEFAULT = {outfit:'fairy', hair:'long', hairColour:'#6b3e26', skin:'#f6d3b8', head:'none', held:'none', bg:'meadow'};

function renderDoll(cfg, opts={}) {
  const c = Object.assign({}, DOLL_DEFAULT, cfg);
  const uid = 'd' + Math.floor(Math.random()*1e9);
  const hairFill = c.hairColour === 'rainbow' ? `url(#${uid}-rb)` : c.hairColour;
  const skin = c.skin;

  const bgs = {
    meadow: `<rect width="200" height="300" fill="url(#${uid}-sky)"/><ellipse cx="100" cy="300" rx="150" ry="70" fill="#8fdc9a"/><text x="20" y="262" font-size="18">🌷</text><text x="160" y="270" font-size="18">🌼</text><text x="140" y="60" font-size="18">☁️</text>`,
    lagoon: `<rect width="200" height="300" fill="url(#${uid}-sea)"/><ellipse cx="100" cy="300" rx="160" ry="60" fill="#f4dfab"/><text x="15" y="270" font-size="18">🐚</text><text x="165" y="262" font-size="18">⭐</text><text x="30" y="70" font-size="16">🫧</text><text x="150" y="110" font-size="14">🫧</text>`,
    glen:   `<rect width="200" height="300" fill="url(#${uid}-glen)"/><ellipse cx="100" cy="300" rx="160" ry="60" fill="#6fbf7a"/><text x="14" y="265" font-size="20">🍄</text><text x="160" y="262" font-size="20">🍄</text><text x="150" y="50" font-size="16">✨</text><text x="30" y="90" font-size="14">✨</text>`,
    castle: `<rect width="200" height="300" fill="url(#${uid}-sky)"/><rect x="40" y="90" width="120" height="140" fill="#e8dcff"/><rect x="30" y="70" width="30" height="160" fill="#d6c6ff"/><rect x="140" y="70" width="30" height="160" fill="#d6c6ff"/><polygon points="30,70 45,40 60,70" fill="#ff7eb6"/><polygon points="140,70 155,40 170,70" fill="#ff7eb6"/><rect x="85" y="160" width="30" height="70" rx="15" fill="#9b6cff"/><ellipse cx="100" cy="300" rx="150" ry="70" fill="#8fdc9a"/>`,
    night:  `<rect width="200" height="300" fill="url(#${uid}-night)"/><ellipse cx="100" cy="300" rx="160" ry="60" fill="#3b2f66"/><text x="20" y="50" font-size="16">⭐</text><text x="150" y="40" font-size="20">🌙</text><text x="60" y="100" font-size="10">✨</text><text x="160" y="120" font-size="12">⭐</text>`,
  };

  // hair back layer
  const hairBack = {
    long:   `<path d="M62 80 C40 120 48 190 60 205 L140 205 C152 190 160 120 138 80 Z" fill="${hairFill}"/>`,
    bun:    `<circle cx="100" cy="42" r="18" fill="${hairFill}"/>`,
    plaits: `<path d="M64 84 C50 110 50 170 58 190 L74 190 C74 150 70 120 76 100 Z" fill="${hairFill}"/><path d="M136 84 C150 110 150 170 142 190 L126 190 C126 150 130 120 124 100 Z" fill="${hairFill}"/><circle cx="66" cy="192" r="7" fill="#ff7eb6"/><circle cx="134" cy="192" r="7" fill="#ff7eb6"/>`,
    curls:  `<circle cx="58" cy="110" r="16" fill="${hairFill}"/><circle cx="142" cy="110" r="16" fill="${hairFill}"/><circle cx="54" cy="140" r="15" fill="${hairFill}"/><circle cx="146" cy="140" r="15" fill="${hairFill}"/><circle cx="62" cy="168" r="14" fill="${hairFill}"/><circle cx="138" cy="168" r="14" fill="${hairFill}"/><path d="M60 90 C45 120 50 170 62 180 L138 180 C150 170 155 120 140 90 Z" fill="${hairFill}"/>`,
  };
  // fringe (front)
  const fringe = `<path d="M62 84 C66 54 134 54 138 84 C130 70 120 66 104 74 C92 66 76 66 62 84 Z" fill="${hairFill}"/>`;

  const outfits = {
    fairy: `<ellipse cx="62" cy="150" rx="30" ry="42" fill="#d9f6ff" opacity=".85" transform="rotate(-15 62 150)"/><ellipse cx="138" cy="150" rx="30" ry="42" fill="#d9f6ff" opacity=".85" transform="rotate(15 138 150)"/>
            <path d="M78 122 L122 122 L142 225 L58 225 Z" fill="#ff9ccb"/><path d="M58 225 Q100 240 142 225 L142 218 Q100 232 58 218 Z" fill="#ff7eb6"/>
            <rect x="82" y="225" width="12" height="30" rx="6" fill="${skin}"/><rect x="106" y="225" width="12" height="30" rx="6" fill="${skin}"/>
            <ellipse cx="88" cy="258" rx="10" ry="6" fill="#ff7eb6"/><ellipse cx="112" cy="258" rx="10" ry="6" fill="#ff7eb6"/>`,
    mermaid: `<path d="M80 122 L120 122 L124 160 L76 160 Z" fill="${skin}"/><circle cx="90" cy="128" r="9" fill="#c8b7ff"/><circle cx="110" cy="128" r="9" fill="#c8b7ff"/>
            <path d="M76 158 C70 190 86 220 100 240 C114 220 130 190 124 158 Z" fill="url(#${uid}-tail)"/>
            <path d="M100 236 C86 250 70 262 64 274 C82 270 94 262 100 254 C106 262 118 270 136 274 C130 262 114 250 100 236 Z" fill="#4fd1c5"/>
            <g fill="#8fe8df" opacity=".7"><circle cx="90" cy="180" r="4"/><circle cx="110" cy="180" r="4"/><circle cx="100" cy="196" r="4"/><circle cx="92" cy="212" r="4"/><circle cx="108" cy="212" r="4"/></g>`,
    unicorn: `<path d="M74 122 L126 122 L136 230 L64 230 Z" fill="#ffffff"/><path d="M64 230 L136 230 L136 244 L64 244 Z" fill="#f0e8ff"/>
            <rect x="80" y="244" width="14" height="14" rx="5" fill="${skin}"/><rect x="106" y="244" width="14" height="14" rx="5" fill="${skin}"/>
            <ellipse cx="87" cy="262" rx="11" ry="6" fill="#9b6cff"/><ellipse cx="113" cy="262" rx="11" ry="6" fill="#9b6cff"/>
            <polygon points="100,20 92,50 108,50" fill="#ffd166"/><polygon points="70,64 66,42 86,58" fill="#fff"/><polygon points="130,64 134,42 114,58" fill="#fff"/>
            <path d="M92 130 Q100 140 108 130 Q100 150 92 130Z" fill="#ff7eb6"/>`,
    princess: `<path d="M80 122 L120 122 L128 150 L72 150 Z" fill="#c8b7ff"/><path d="M72 150 L128 150 C150 180 160 220 156 244 L44 244 C40 220 50 180 72 150 Z" fill="#9b6cff"/>
            <path d="M44 244 Q100 258 156 244 L156 236 Q100 250 44 236Z" fill="#7a4fe0"/><path d="M100 150 L84 244 M100 150 L116 244" stroke="#c8b7ff" stroke-width="3" fill="none"/>
            <circle cx="100" cy="150" r="6" fill="#ffd166"/>`,
    rainbow: `<path d="M78 122 L122 122 L146 232 L54 232 Z" fill="url(#${uid}-rbv)"/>
            <rect x="82" y="232" width="12" height="24" rx="6" fill="${skin}"/><rect x="106" y="232" width="12" height="24" rx="6" fill="${skin}"/>
            <ellipse cx="88" cy="258" rx="10" ry="6" fill="#ffd166"/><ellipse cx="112" cy="258" rx="10" ry="6" fill="#ffd166"/>`,
  };

  const heads = {
    none:'', 
    flower:`<text x="124" y="72" font-size="26" text-anchor="middle">🌸</text>`,
    bow:`<text x="126" y="70" font-size="26" text-anchor="middle">🎀</text>`,
    tiara:`<polygon points="76,60 84,42 92,56 100,36 108,56 116,42 124,60" fill="#ffd166"/><circle cx="100" cy="42" r="4" fill="#ff7eb6"/>`,
    starband:`<path d="M66 68 Q100 52 134 68" stroke="#9b6cff" stroke-width="5" fill="none"/><text x="100" y="60" font-size="20" text-anchor="middle">⭐</text>`,
    shells:`<path d="M66 68 Q100 52 134 68" stroke="#4fd1c5" stroke-width="5" fill="none"/><text x="82" y="62" font-size="14" text-anchor="middle">🐚</text><text x="100" y="56" font-size="16" text-anchor="middle">🐚</text><text x="118" y="62" font-size="14" text-anchor="middle">🐚</text>`,
  };
  const helds = {
    none:'',
    wand:`<line x1="148" y1="200" x2="166" y2="150" stroke="#9b6cff" stroke-width="5" stroke-linecap="round"/><text x="168" y="150" font-size="22" text-anchor="middle">⭐</text>`,
    shell:`<text x="156" y="200" font-size="26" text-anchor="middle">🐚</text>`,
    bunny:`<text x="156" y="200" font-size="28" text-anchor="middle">🐰</text>`,
    balloon:`<line x1="150" y1="190" x2="162" y2="130" stroke="#7a4fe0" stroke-width="2"/><text x="164" y="128" font-size="30" text-anchor="middle">🎈</text>`,
  };

  // arms: skin colour sticks
  const arms = `<path d="M78 128 C60 150 54 175 52 196" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>
                <path d="M122 128 C140 150 146 175 148 196" stroke="${skin}" stroke-width="12" stroke-linecap="round" fill="none"/>`;

  const face = `<circle cx="100" cy="85" r="34" fill="${skin}"/>
    <circle cx="87" cy="86" r="4.5" fill="#3d2a5c"/><circle cx="113" cy="86" r="4.5" fill="#3d2a5c"/>
    <circle cx="88.5" cy="84.5" r="1.5" fill="#fff"/><circle cx="114.5" cy="84.5" r="1.5" fill="#fff"/>
    <circle cx="80" cy="98" r="5" fill="#ff9ccb" opacity=".7"/><circle cx="120" cy="98" r="5" fill="#ff9ccb" opacity=".7"/>
    <path d="M90 102 Q100 112 110 102" stroke="#c0506e" stroke-width="3" fill="none" stroke-linecap="round"/>`;

  return `<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Your doll">
  <defs>
    <linearGradient id="${uid}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#bfe9ff"/><stop offset="1" stop-color="#ffe3f3"/></linearGradient>
    <linearGradient id="${uid}-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7fe0f5"/><stop offset="1" stop-color="#3aa9c9"/></linearGradient>
    <linearGradient id="${uid}-glen" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c8f5d5"/><stop offset="1" stop-color="#6fbf7a"/></linearGradient>
    <linearGradient id="${uid}-night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b1640"/><stop offset="1" stop-color="#5b3f9e"/></linearGradient>
    <linearGradient id="${uid}-tail" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4fd1c5"/><stop offset="1" stop-color="#2f9fb7"/></linearGradient>
    <linearGradient id="${uid}-rb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff7eb6"/><stop offset=".3" stop-color="#ffd166"/><stop offset=".55" stop-color="#7ddf9a"/><stop offset=".8" stop-color="#4fd1c5"/><stop offset="1" stop-color="#9b6cff"/></linearGradient>
    <linearGradient id="${uid}-rbv" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7eb6"/><stop offset=".25" stop-color="#ffd166"/><stop offset=".5" stop-color="#7ddf9a"/><stop offset=".75" stop-color="#4fd1c5"/><stop offset="1" stop-color="#9b6cff"/></linearGradient>
  </defs>
  ${opts.noBg ? '' : (bgs[c.bg] || bgs.meadow)}
  ${hairBack[c.hair] || hairBack.long}
  ${outfits[c.outfit] || outfits.fairy}
  ${arms}
  ${face}
  ${fringe}
  ${heads[c.head] || ''}
  ${helds[c.held] || ''}
</svg>`;
}
