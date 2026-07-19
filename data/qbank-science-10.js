/* Inspire Talent Hub — Premium authored question bank: Class 10 Science (CBSE).
 *
 * Educator-grade, ORIGINAL questions inspired by CBSE trends, NCERT & Exemplar,
 * sample papers and competency-based assessment — NOT copied from past papers.
 * Consumed by the exam engine (assets/js/ith-study.js) which prefers these
 * authored questions and model answers over generic chapter prompts.
 *
 * Key: 'cbse|10|science|<chapter-slug>'
 * Item shapes:
 *   mcq: { q, o:[4], a, e, d(1|2|3), comp? }        // a = index of correct option
 *   ar : { A, R, a }                                 // a: 0=(a) both,R explains  1=(b) both,R not  2=(c) A-T,R-F  3=(d) A-F,R-T
 *   vsa: { q, a, k:[keywords], cm }                  // 2 marks
 *   sa : { q, a, k, cm }                             // 3 marks
 *   ma : { q, a, k, cm }                             // 4 marks (competency)
 *   la : { q, a, k, cm }                             // 5 marks (HOTS)
 *   cs : { p:passage, q:[ {q,a,m,k?,cm?} ] }         // case/source-based, sub-marks sum to 5
 */
window.ITH_QBANK = window.ITH_QBANK || {};

window.ITH_QBANK['cbse|10|science|chemical-reactions-and-equations'] = {
  mcq: [
    { q: 'When a magnesium ribbon is burnt in air, the product formed is:',
      o: ['Magnesium oxide, a white powder', 'Magnesium hydroxide, a blue solid', 'Magnesium carbonate, a green powder', 'No solid product is formed'],
      a: 0, d: 1, e: 'Mg burns with a dazzling white flame: 2Mg + O₂ → 2MgO (white).' },
    { q: 'The reaction 2FeSO₄ →(heat) Fe₂O₃ + SO₂ + SO₃ is best classified as a:',
      o: ['Thermal decomposition reaction', 'Combination reaction', 'Displacement reaction', 'Double displacement reaction'],
      a: 0, d: 2, e: 'A single compound is broken down by heat into simpler substances.' },
    { q: 'Which of the following represents a displacement reaction?',
      o: ['Fe + CuSO₄ → FeSO₄ + Cu', 'CaO + H₂O → Ca(OH)₂', '2H₂O → 2H₂ + O₂', 'NaOH + HCl → NaCl + H₂O'],
      a: 0, d: 2, e: 'Iron (more reactive) displaces copper from copper sulphate.' },
    { q: 'A substance that is white when cold and turns yellow when heated is:',
      o: ['Zinc oxide', 'Copper oxide', 'Silver chloride', 'Lead nitrate'],
      a: 0, d: 2, e: 'Zinc oxide (ZnO) is white when cold and yellow when hot.' },
    { q: 'Respiration in living cells is an example of a/an:',
      o: ['Exothermic reaction', 'Endothermic reaction', 'Neutralisation reaction', 'Photochemical reaction'],
      a: 0, d: 1, e: 'Glucose is oxidised, releasing energy — so it is exothermic.' },
    { q: 'In the reaction Zn + H₂SO₄ → ZnSO₄ + H₂, zinc has been:',
      o: ['Oxidised, as it loses electrons', 'Reduced, as it gains electrons', 'Neither oxidised nor reduced', 'Acting as an oxidising agent'],
      a: 0, d: 3, comp: true, e: 'Zn goes from 0 to +2 by losing electrons, hence it is oxidised.' },
    { q: 'Chemical equations are balanced to satisfy the:',
      o: ['Law of conservation of mass', 'Law of definite proportions', 'Law of multiple proportions', 'Avogadro’s law'],
      a: 0, d: 1, e: 'Atoms are only rearranged; total mass stays the same.' },
    { q: 'Lime water turns milky when carbon dioxide is passed through it because of the formation of:',
      o: ['Calcium carbonate', 'Calcium hydroxide', 'Calcium oxide', 'Calcium bicarbonate'],
      a: 0, d: 2, e: 'Ca(OH)₂ + CO₂ → CaCO₃(insoluble, milky) + H₂O.' },
    { q: 'The reddish-brown coating that forms on iron articles left in damp air is:',
      o: ['Hydrated iron(III) oxide', 'Iron(II) sulphide', 'Iron(II) carbonate', 'Iron(III) chloride'],
      a: 0, d: 2, comp: true, e: 'Rust is hydrated iron(III) oxide, Fe₂O₃·xH₂O.' },
    { q: 'In the reaction CuO + H₂ → Cu + H₂O, the substance that is reduced is:',
      o: ['Copper oxide', 'Hydrogen', 'Water', 'Copper'],
      a: 0, d: 3, comp: true, e: 'CuO loses oxygen to become Cu, so CuO is reduced (H₂ is oxidised).' }
  ],
  ar: [
    { A: 'The reaction of quicklime with water is highly exothermic.', R: 'It is a combination reaction that releases a large amount of heat.', a: 0 },
    { A: 'Silver chloride turns grey when kept in sunlight.', R: 'Silver chloride undergoes a combination reaction in light.', a: 2 },
    { A: 'Respiration is an endothermic process.', R: 'Energy is released when glucose is oxidised during respiration.', a: 3 }
  ],
  vsa: [
    { q: 'Why should a magnesium ribbon be cleaned before it is burnt in air?',
      a: 'A layer of magnesium oxide (MgO) forms on the surface of the ribbon on standing. It is cleaned with sandpaper so that the metal burns readily and completely.',
      k: ['MgO layer', 'cleaned with sandpaper', 'burns completely'], cm: 'Saying the ribbon is merely “dirty” — the real reason is the oxide coating.' },
    { q: 'Translate into a balanced chemical equation: barium chloride reacts with sodium sulphate to give barium sulphate and sodium chloride.',
      a: 'BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl (a white precipitate of barium sulphate is formed).',
      k: ['BaCl₂ + Na₂SO₄', 'BaSO₄↓', 'coefficient 2 for NaCl'], cm: 'Forgetting to balance NaCl or to show BaSO₄ as a precipitate (↓).' },
    { q: 'Define a combination reaction and give one balanced example.',
      a: 'A reaction in which two or more reactants combine to form a single product. Example: CaO + H₂O → Ca(OH)₂.',
      k: ['single product', 'two or more reactants', 'valid example'], cm: 'Giving a decomposition example (one reactant splitting) by mistake.' },
    { q: 'What is observed when carbon dioxide is passed through freshly prepared lime water, and why?',
      a: 'The lime water turns milky because insoluble calcium carbonate is formed: Ca(OH)₂ + CO₂ → CaCO₃ + H₂O.',
      k: ['turns milky', 'CaCO₃ formed'], cm: 'Not naming CaCO₃ as the cause of the milkiness.' },
    { q: 'Name the type of reaction and write the equation for the process by which green plants prepare food.',
      a: 'Photosynthesis is an endothermic reaction (light energy is absorbed): 6CO₂ + 6H₂O →(light, chlorophyll) C₆H₁₂O₆ + 6O₂.',
      k: ['photosynthesis', 'endothermic', 'light absorbed'], cm: 'Calling photosynthesis exothermic — it absorbs energy.' }
  ],
  sa: [
    { q: 'What is a balanced chemical equation? Why must chemical equations be balanced? Balance: Fe + H₂O → Fe₃O₄ + H₂.',
      a: 'A balanced equation has an equal number of atoms of each element on both sides, obeying the law of conservation of mass (matter is neither created nor destroyed). Balanced: 3Fe + 4H₂O → Fe₃O₄ + 4H₂.',
      k: ['equal atoms both sides', 'conservation of mass', '3Fe + 4H₂O → Fe₃O₄ + 4H₂'], cm: 'Changing formulae instead of coefficients, or leaving it unbalanced.' },
    { q: 'Distinguish between a displacement and a double displacement reaction, with one balanced example of each.',
      a: 'Displacement: a more reactive element displaces a less reactive one from its compound, e.g. Fe + CuSO₄ → FeSO₄ + Cu. Double displacement: ions are exchanged between two compounds, often forming a precipitate, e.g. Na₂SO₄ + BaCl₂ → BaSO₄↓ + 2NaCl.',
      k: ['displacement', 'double displacement', 'exchange of ions', 'precipitate'], cm: 'Not showing the exchange of ions in the double displacement example.' },
    { q: 'Define oxidation and reduction. In CuO + H₂ → Cu + H₂O, identify the substance oxidised and the substance reduced.',
      a: 'Oxidation is gain of oxygen or loss of hydrogen (loss of electrons); reduction is loss of oxygen or gain of hydrogen (gain of electrons). Here H₂ is oxidised (gains oxygen to form H₂O) and CuO is reduced (loses oxygen to form Cu).',
      k: ['oxidation = gain O / lose e⁻', 'reduction = lose O / gain e⁻', 'H₂ oxidised, CuO reduced'], cm: 'Swapping the species that are oxidised and reduced.' },
    { q: 'Why are iron articles painted? Name the phenomenon prevented and the substance formed when iron corrodes.',
      a: 'Paint forms a barrier that keeps out air (oxygen) and moisture, preventing corrosion (rusting). Rusting forms hydrated iron(III) oxide, Fe₂O₃·xH₂O — a reddish-brown flaky substance.',
      k: ['barrier keeps out air & moisture', 'corrosion/rusting', 'Fe₂O₃·xH₂O'], cm: 'Saying the paint chemically reacts with iron — it only forms a protective barrier.' },
    { q: 'What is a decomposition reaction? Explain thermal and electrolytic decomposition with one example each.',
      a: 'A decomposition reaction is one in which a single compound breaks into two or more simpler substances. Thermal (by heat): CaCO₃ →(heat) CaO + CO₂. Electrolytic (by electricity): 2H₂O →(electricity) 2H₂ + O₂.',
      k: ['single compound splits', 'thermal example', 'electrolytic example'], cm: 'Giving a combination example instead of a decomposition one.' },
    { q: 'Why is respiration considered an exothermic reaction? Support your answer with the reaction involved.',
      a: 'During respiration glucose is oxidised and energy is released for the body to use; because energy is given out, it is exothermic. C₆H₁₂O₆ + 6O₂ → 6CO₂ + 6H₂O + energy.',
      k: ['glucose oxidised', 'energy released', 'exothermic'], cm: 'Confusing respiration (exothermic) with photosynthesis (endothermic).' }
  ],
  ma: [
    { q: 'A shopkeeper flushes packets of chips with nitrogen gas before sealing them. (a) Which chemical process is he preventing? (b) Explain how nitrogen helps. (c) Suggest one more everyday method to prevent this process in fried foods.',
      a: '(a) He is preventing rancidity — the oxidation of fats and oils that produces a bad smell and taste. (b) Nitrogen is unreactive and displaces oxygen from the packet, so the fats cannot be oxidised. (c) Any one: adding antioxidants, using airtight packaging, or refrigeration slows down rancidity.',
      k: ['rancidity', 'oxidation of fats/oils', 'nitrogen is unreactive / removes oxygen', 'antioxidants / airtight / refrigeration'], cm: 'Calling the process “corrosion” — corrosion is for metals, rancidity is for food.' },
    { q: 'Iron filings are added to a blue copper sulphate solution. (a) Write the balanced equation. (b) Name the type of reaction. (c) Explain the colour change observed. (d) What does this reveal about the reactivity of iron and copper?',
      a: '(a) Fe + CuSO₄ → FeSO₄ + Cu. (b) Displacement reaction. (c) The blue colour of Cu²⁺ fades and a reddish-brown copper deposit forms, while the solution turns pale green due to FeSO₄. (d) Iron is more reactive than copper, so it displaces copper from its salt.',
      k: ['Fe + CuSO₄ → FeSO₄ + Cu', 'displacement', 'blue fades / green forms', 'iron more reactive'], cm: 'Reversing the reactivity order or forgetting to balance the equation.' },
    { q: 'Silver chloride is stored in dark-coloured bottles. (a) Why? (b) Write the reaction that occurs in sunlight. (c) Name the type of reaction. (d) State one use of this reaction.',
      a: '(a) Silver chloride decomposes in sunlight, so dark bottles keep light out and prevent decomposition. (b) 2AgCl →(sunlight) 2Ag + Cl₂ (white AgCl turns grey). (c) Photochemical (photolytic) decomposition. (d) It is used in black-and-white photography.',
      k: ['decomposes in light', '2AgCl → 2Ag + Cl₂', 'photochemical decomposition', 'photography'], cm: 'Calling it a combination reaction instead of decomposition.' },
    { q: 'A student heats lead nitrate crystals in a test tube and sees brown fumes. (a) Write the balanced equation. (b) Identify the brown gas. (c) Name the type of reaction. (d) Why should this be done carefully?',
      a: '(a) 2Pb(NO₃)₂ →(heat) 2PbO + 4NO₂ + O₂. (b) The brown gas is nitrogen dioxide (NO₂). (c) Thermal decomposition. (d) NO₂ is poisonous, so it must be done in a well-ventilated place or fume cupboard.',
      k: ['2Pb(NO₃)₂ → 2PbO + 4NO₂ + O₂', 'nitrogen dioxide', 'thermal decomposition', 'NO₂ is toxic'], cm: 'Leaving the equation unbalanced or naming the brown gas as bromine.' }
  ],
  la: [
    { q: 'Classify chemical reactions as combination, decomposition, displacement and double displacement. Give one balanced equation for each type and state, where relevant, whether energy is absorbed or released.',
      a: 'Combination — two or more substances form a single product: CaO + H₂O → Ca(OH)₂ (exothermic). Decomposition — a single compound splits into simpler ones: CaCO₃ →(heat) CaO + CO₂ (endothermic). Displacement — a more reactive element displaces a less reactive one: Zn + CuSO₄ → ZnSO₄ + Cu. Double displacement — ions are exchanged, often forming a precipitate: BaCl₂ + Na₂SO₄ → BaSO₄↓ + 2NaCl.',
      k: ['four types defined', 'one balanced equation each', 'exo/endothermic noted'], cm: 'Interchanging combination and decomposition examples.' },
    { q: 'Explain oxidation and reduction. Using the reaction between copper oxide and hydrogen, identify the oxidising and reducing agents. State two effects of oxidation in everyday life.',
      a: 'Oxidation = gain of oxygen / loss of hydrogen (loss of electrons); reduction = loss of oxygen / gain of hydrogen (gain of electrons). A redox reaction has both together. In CuO + H₂ → Cu + H₂O, CuO is reduced (so it is the oxidising agent) and H₂ is oxidised (so it is the reducing agent). Two everyday effects of oxidation: (i) corrosion of metals such as rusting of iron, and (ii) rancidity of fats and oils in food.',
      k: ['oxidation & reduction defined', 'CuO = oxidising agent', 'H₂ = reducing agent', 'corrosion & rancidity'], cm: 'Interchanging the oxidising and reducing agents.' },
    { q: 'State the law of conservation of mass. Explain, by balancing the equation for the burning of methane (CH₄ + O₂ → CO₂ + H₂O), why chemical equations must be balanced. Show all steps.',
      a: 'Law of conservation of mass: mass can neither be created nor destroyed in a chemical reaction, so the total mass of reactants equals the total mass of products. Since atoms are only rearranged, each element must have equal numbers of atoms on both sides — this is why equations are balanced. Balancing: CH₄ + 2O₂ → CO₂ + 2H₂O (C: 1 = 1, H: 4 = 4, O: 4 = 4).',
      k: ['conservation of mass stated', 'atoms only rearranged', 'CH₄ + 2O₂ → CO₂ + 2H₂O'], cm: 'Altering chemical formulae instead of adjusting coefficients.' },
    { q: 'Explain corrosion and rancidity as oxidation processes. For each, state what is oxidised, one harmful effect and two methods of prevention.',
      a: 'Corrosion: metals are slowly oxidised by air and moisture (iron forms hydrated Fe₂O₃, i.e. rust). Harmful effect: it weakens metal structures and objects. Prevention: painting/greasing and galvanisation (or alloying, e.g. stainless steel). Rancidity: fats and oils in food are oxidised, developing a bad smell and taste. Harmful effect: the food spoils. Prevention: adding antioxidants and flushing with nitrogen / airtight packaging (or refrigeration).',
      k: ['corrosion oxidises metals', 'rancidity oxidises fats/oils', 'two prevention methods each'], cm: 'Giving prevention methods without linking them to stopping oxidation.' }
  ],
  cs: [
    { p: 'Every year a huge quantity of the iron used in buildings, bridges, ships and vehicles is destroyed by rusting. Rusting occurs when iron is exposed to both oxygen and moisture, forming a reddish-brown flaky layer of hydrated iron(III) oxide. Because this rust is porous, it flakes off and exposes fresh metal underneath, so the damage continues. Engineers protect iron by painting, oiling, galvanising (coating with zinc) and by making corrosion-resistant alloys such as stainless steel.',
      q: [
        { q: 'State the two conditions necessary for the rusting of iron and name the substance formed.',
          a: 'Both oxygen (air) and moisture (water) are necessary. The substance formed is hydrated iron(III) oxide (rust), Fe₂O₃·xH₂O.', m: 2,
          k: ['oxygen', 'moisture', 'hydrated iron(III) oxide'] },
        { q: 'Explain why galvanisation protects iron even if the zinc layer gets scratched, and give one other method of protection with a reason.',
          a: 'Galvanisation coats iron with zinc, which is more reactive than iron. So even if the zinc is scratched, the zinc corrodes in preference to the iron (sacrificial protection). Another method is painting, which forms a barrier that keeps out air and moisture.', m: 3,
          k: ['zinc more reactive', 'sacrificial protection', 'painting = barrier'], cm: 'Treating zinc only as a physical cover — it also protects sacrificially.' }
      ] },
    { p: 'When electricity is passed through acidified water, the water breaks up into hydrogen and oxygen gases that collect over the two electrodes. The volume of gas collected over one electrode is exactly double that collected over the other. This is an example of a decomposition reaction in which the energy needed is supplied by electricity. Similar decomposition can also be brought about by heat (thermal decomposition) or by light (photochemical decomposition).',
      q: [
        { q: 'Name the gas collected in the larger amount and write the balanced equation for the electrolysis of water.',
          a: 'Hydrogen is collected in the larger amount (twice the volume of oxygen). 2H₂O →(electricity) 2H₂ + O₂.', m: 2,
          k: ['hydrogen', '2H₂O → 2H₂ + O₂'] },
        { q: 'Why is the volume of one gas double that of the other? Classify this reaction and give one more example of the same broad type brought about by heat.',
          a: 'Water contains hydrogen and oxygen atoms in a 2 : 1 ratio, so twice the volume of hydrogen is released compared with oxygen. It is a decomposition (electrolytic) reaction. A heat-driven (thermal) example: CaCO₃ →(heat) CaO + CO₂.', m: 3,
          k: ['2 : 1 ratio', 'decomposition', 'CaCO₃ → CaO + CO₂'], cm: 'Saying oxygen is the larger volume — hydrogen is double.' }
      ] },
    { p: 'Chemical reactions are always accompanied by energy changes. In some reactions heat is given out to the surroundings; these are exothermic — for example the burning of fuels, respiration in our cells and the reaction of quicklime with water. In other reactions heat is absorbed from the surroundings; these are endothermic — such as the decomposition of many carbonates on heating and photosynthesis in green plants.',
      q: [
        { q: 'Classify respiration and photosynthesis as exothermic or endothermic, giving a reason for each.',
          a: 'Respiration is exothermic because glucose is oxidised and energy is released. Photosynthesis is endothermic because it absorbs light energy to build glucose.', m: 2,
          k: ['respiration exothermic', 'photosynthesis endothermic', 'energy released vs absorbed'] },
        { q: 'A farmer adds quicklime to water and the container becomes hot. Identify the type of reaction (combination, and exo- or endothermic), write the balanced equation and name the product.',
          a: 'It is a combination reaction and it is exothermic (the container warms up). CaO + H₂O → Ca(OH)₂. The product is calcium hydroxide (slaked lime).', m: 3,
          k: ['combination', 'exothermic', 'CaO + H₂O → Ca(OH)₂', 'calcium hydroxide'], cm: 'Calling it a decomposition or an endothermic reaction.' }
      ] }
  ]
};
