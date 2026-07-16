/* Inspire Talent Hub — learning-content add-on (batch 2): more Class 10 chapters.
 * Merges into window.ITH_STUDY_CONTENT. Same format as data/study-content.js.
 */
window.ITH_STUDY_CONTENT = window.ITH_STUDY_CONTENT || {};
Object.assign(window.ITH_STUDY_CONTENT, {

  'cbse|10|science|acids-bases-and-salts': {
    notes: [
      'Acids turn blue litmus red and taste sour; bases turn red litmus blue and taste bitter.',
      'Metal + acid → salt + hydrogen gas (burns with a pop sound).',
      'Acid + base → salt + water (a neutralisation reaction).',
      'The pH scale runs 0–14: <7 acidic, 7 neutral, >7 basic. Lower pH = stronger acid.',
      'Water-soluble bases are called alkalis (e.g. NaOH, KOH).',
      'Common salt (NaCl) is the raw material for NaOH, baking soda and washing soda.'
    ],
    cards: [
      { f: 'Acid', b: 'A substance that turns blue litmus red and gives H⁺ ions in water.' },
      { f: 'Base', b: 'A substance that turns red litmus blue; a water-soluble base is an alkali.' },
      { f: 'Neutralisation', b: 'Acid + base → salt + water.' },
      { f: 'pH 7', b: 'A neutral solution (neither acidic nor basic).' },
      { f: 'Litmus', b: 'A natural indicator: red in acid, blue in base.' },
      { f: 'Common salt', b: 'Sodium chloride, NaCl.' },
      { f: 'Metal + acid', b: 'Gives a salt and hydrogen gas.' }
    ]
  },

  'cbse|10|science|metals-and-non-metals': {
    notes: [
      'Metals are lustrous, malleable, ductile, sonorous and good conductors of heat and electricity.',
      'Non-metals are generally dull, brittle and poor conductors (graphite is an exception).',
      'The reactivity series ranks metals by how readily they react (K, Na high; Au, Pt low).',
      'More reactive metals displace less reactive ones from their salts.',
      'An alloy is a mixture of a metal with other elements (brass = Cu + Zn; steel = Fe + C).',
      'Galvanisation coats iron with zinc to prevent rusting.'
    ],
    cards: [
      { f: 'Malleability', b: 'The property of being hammered into thin sheets.' },
      { f: 'Ductility', b: 'The property of being drawn into thin wires.' },
      { f: 'Reactivity series', b: 'Metals arranged in order of decreasing reactivity.' },
      { f: 'Alloy', b: 'A homogeneous mixture of a metal with other metals/non-metals.' },
      { f: 'Brass', b: 'An alloy of copper and zinc.' },
      { f: 'Galvanisation', b: 'Coating iron/steel with zinc to prevent rusting.' },
      { f: 'Graphite', b: 'A non-metal that conducts electricity (a form of carbon).' }
    ]
  },

  'cbse|10|science|carbon-and-its-compounds': {
    notes: [
      'Carbon is tetravalent (valency 4) and forms covalent bonds by sharing electrons.',
      'Catenation is carbon’s ability to form long chains, branches and rings.',
      'Saturated hydrocarbons (alkanes) have only single bonds; unsaturated (alkenes/alkynes) have double/triple bonds.',
      'A functional group gives a compound its characteristic properties (–OH alcohol, –COOH acid).',
      'Combustion of carbon compounds releases carbon dioxide, water and heat.',
      'Ethanol and ethanoic acid (vinegar) are important carbon compounds.'
    ],
    cards: [
      { f: 'Valency of carbon', b: 'Four (tetravalent).' },
      { f: 'Catenation', b: 'The self-linking of carbon atoms into chains and rings.' },
      { f: 'Saturated hydrocarbon', b: 'A hydrocarbon with only single C–C bonds (an alkane).' },
      { f: 'Functional group –OH', b: 'The alcohol group.' },
      { f: 'Functional group –COOH', b: 'The carboxylic acid group.' },
      { f: 'Methane', b: 'CH₄ — the simplest hydrocarbon and main part of natural gas.' },
      { f: 'Isomers', b: 'Compounds with the same formula but different structures.' }
    ]
  },

  'cbse|10|science|life-processes': {
    notes: [
      'Life processes: nutrition, respiration, transport, and excretion.',
      'Autotrophs make food by photosynthesis; heterotrophs take ready-made food.',
      'Respiration releases energy (ATP) by breaking down glucose.',
      'In humans, the heart pumps blood; arteries carry blood away, veins carry it back.',
      'The nephron is the filtering unit of the kidney (excretion).',
      'In plants, water rises through xylem and food moves through phloem (translocation).'
    ],
    cards: [
      { f: 'Nutrition', b: 'The process of taking in and using food for energy and growth.' },
      { f: 'Respiration', b: 'The breakdown of glucose to release energy.' },
      { f: 'Nephron', b: 'The functional (filtering) unit of the kidney.' },
      { f: 'Alveoli', b: 'Tiny air sacs in the lungs where gases are exchanged.' },
      { f: 'Xylem', b: 'Plant tissue that transports water and minerals upward.' },
      { f: 'Phloem', b: 'Plant tissue that transports food (translocation).' },
      { f: 'Autotroph', b: 'An organism that makes its own food, e.g. green plants.' }
    ]
  },

  'cbse|10|math|polynomials': {
    notes: [
      'The degree of a polynomial is the highest power of the variable.',
      'Linear (degree 1), quadratic (degree 2) and cubic (degree 3) are common types.',
      'A polynomial of degree n has at most n zeroes.',
      'For ax² + bx + c: sum of zeroes = −b/a, product of zeroes = c/a.',
      'The zeroes of a polynomial are the x-values where its graph meets the x-axis.'
    ],
    formulas: [
      { n: 'Sum of zeroes (quadratic)', x: 'α + β = −b/a' },
      { n: 'Product of zeroes (quadratic)', x: 'α·β = c/a' }
    ],
    cards: [
      { f: 'Degree of a polynomial', b: 'The highest power of the variable in it.' },
      { f: 'Zero of a polynomial', b: 'A value of x for which the polynomial equals 0.' },
      { f: 'Sum of zeroes (ax²+bx+c)', b: '−b/a.' },
      { f: 'Product of zeroes (ax²+bx+c)', b: 'c/a.' },
      { f: 'Linear polynomial', b: 'A polynomial of degree 1.' },
      { f: 'Quadratic polynomial', b: 'A polynomial of degree 2 (at most two zeroes).' }
    ]
  },

  'cbse|10|math|introduction-to-trigonometry': {
    notes: [
      'In a right triangle, sin θ = opposite/hypotenuse, cos θ = adjacent/hypotenuse, tan θ = opposite/adjacent.',
      'cosec, sec and cot are the reciprocals of sin, cos and tan.',
      'Standard angles: sin 30° = 1/2, sin 45° = 1/√2, sin 60° = √3/2.',
      'tan θ = sin θ / cos θ.',
      'The identity sin²θ + cos²θ = 1 holds for all angles.'
    ],
    formulas: [
      { n: 'Sine', x: 'sin θ = opposite / hypotenuse' },
      { n: 'Cosine', x: 'cos θ = adjacent / hypotenuse' },
      { n: 'Tangent', x: 'tan θ = opposite / adjacent = sin θ / cos θ' },
      { n: 'Identity', x: 'sin²θ + cos²θ = 1' }
    ],
    cards: [
      { f: 'sin θ', b: 'Opposite side ÷ hypotenuse.' },
      { f: 'cos θ', b: 'Adjacent side ÷ hypotenuse.' },
      { f: 'tan θ', b: 'Opposite ÷ adjacent (= sin θ / cos θ).' },
      { f: 'sin 30°', b: '1/2.' },
      { f: 'tan 45°', b: '1.' },
      { f: 'Identity', b: 'sin²θ + cos²θ = 1.' },
      { f: 'sec θ', b: 'The reciprocal of cos θ.' }
    ]
  }

});
