/* ────────────────────────────────────────────────────────────────
   IUPAC Vocabulary Companion - Constants
   ──────────────────────────────────────────────────────────────── */

const CATEGORIES = [
  "stereochemistry", "haloalkane", "alkene", "alkyne", "cyclic", "aromatic",
  "alcohol", "ether", "carboxylic acid", "ester", "amide", "anhydride",
  "alkane", "aldehyde", "ketone", "other"
];

const FG_ATOMS = {
  "Alcohol": { elem: "O" },
  "Ether": { elem: "O" },
  "Haloalkane": { elem: ["F", "Cl", "Br", "I"] },
  "Carboxylic Acid": { elem: "O" },
  "Aldehyde": { elem: "O" },
  "Ketone": { elem: "O" },
  "Amine": { elem: "N" },
  "Amide": { elem: "N" },
  "Nitrile": { elem: "N" }
};

const NO_SVG_ICON = `<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" opacity="0.4"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375M15.75 12H4.5M15.75 12l-3-3m3 3l3-3M3.375 6.75h16.5A1.125 1.125 0 0121 7.875v10.5a1.125 1.125 0 01-1.125 1.125H3.375a1.125 1.125 0 01-1.125-1.125V7.875a1.125 1.125 0 011.125-1.125z"></path></svg>`;
const COPY_ICON = `<svg class="btn-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M8.25 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M15.75 18H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.141 0c-.892.029-1.776.147-2.654.291A6.332 6.332 0 0012 18a6.332 6.332 0 006.585-7.292m-10.725 0A6.332 6.332 0 0112 5.25"></path></svg>`;
