/* Inspire Talent Hub — chapter learning content (CBSE / NCERT).
 * Front-end only: window.ITH_STUDY_CONTENT, keyed by "board|grade|subject|slug"
 * (same key as data/study-questions.js).
 *   cards:    [{ f: front (term/question), b: back (meaning/answer) }]
 *   notes:    [ "key revision point", ... ]
 *   formulas: [{ n: name, x: expression }]   (optional)
 * Any missing piece simply hides that tool for the chapter (graceful).
 */
window.ITH_STUDY_CONTENT = {

  'cbse|6|science|food-where-does-it-come-from': {
    notes: [
      'Food comes from two main sources: plants and animals.',
      'Plant parts we eat include roots (carrot), stems (potato), leaves (spinach), flowers (broccoli), fruits and seeds.',
      'Animal products include milk, eggs, meat, and honey (made by bees from nectar).',
      'Based on food habits, animals are herbivores (plant-eaters), carnivores (flesh-eaters) or omnivores (both).',
      'Sprouted seeds (sprouts) are nutritious and usually eaten raw.'
    ],
    cards: [
      { f: 'Herbivore', b: 'An animal that eats only plants (e.g. cow, deer).' },
      { f: 'Carnivore', b: 'An animal that eats only the flesh of other animals (e.g. lion).' },
      { f: 'Omnivore', b: 'An animal that eats both plants and animals (e.g. humans, crow).' },
      { f: 'Nectar', b: 'A sugary liquid in flowers; bees collect it to make honey.' },
      { f: 'Sprout', b: 'A germinated (soaked) seed that begins to grow; eaten raw and nutritious.' },
      { f: 'Edible root (example)', b: 'Carrot, radish and sweet potato are roots we eat.' },
      { f: 'Ingredient', b: 'A material used to prepare a dish (e.g. rice, salt, oil).' },
      { f: 'Source of honey', b: 'Bees make honey from the nectar of flowers.' }
    ]
  },

  'cbse|7|science|nutrition-in-plants': {
    notes: [
      'Nutrition is the process of taking in and using food. Modes: autotrophic and heterotrophic.',
      'Green plants are autotrophs — they make their own food by photosynthesis.',
      'Photosynthesis: carbon dioxide + water → (sunlight + chlorophyll) → glucose + oxygen.',
      'Chlorophyll (green pigment) traps sunlight; stomata are pores for gas exchange.',
      'Parasites (e.g. Cuscuta) take food from a host; insectivorous plants (e.g. pitcher plant) trap insects.',
      'Fungi are saprotrophs — they feed on dead and decaying matter.'
    ],
    cards: [
      { f: 'Autotroph', b: 'An organism that makes its own food, e.g. green plants.' },
      { f: 'Heterotroph', b: 'An organism that depends on others for food.' },
      { f: 'Photosynthesis', b: 'Process where plants make glucose from CO₂ and water using sunlight and chlorophyll.' },
      { f: 'Chlorophyll', b: 'The green pigment in leaves that traps sunlight.' },
      { f: 'Stomata', b: 'Tiny pores on the leaf surface for exchange of gases.' },
      { f: 'Parasite (plant)', b: 'A plant that takes food from a host, e.g. Cuscuta (Amarbel).' },
      { f: 'Insectivorous plant', b: 'A plant that traps and digests insects, e.g. pitcher plant.' },
      { f: 'Saprotroph', b: 'An organism that feeds on dead, decaying matter, e.g. fungi.' }
    ]
  },

  'cbse|8|science|force-and-pressure': {
    notes: [
      'A force is a push or a pull. It can change the state of motion or the shape of an object.',
      'Forces are of two types: contact forces (muscular, friction) and non-contact forces (gravity, magnetic, electrostatic).',
      'Pressure = force ÷ area. Smaller area → greater pressure for the same force.',
      'Liquids and gases exert pressure on the walls of their container.',
      'Atmospheric pressure is caused by the weight of the air above us.'
    ],
    formulas: [
      { n: 'Pressure', x: 'Pressure = Force ÷ Area' },
      { n: 'SI unit of force', x: 'newton (N)' },
      { n: 'SI unit of pressure', x: 'pascal (Pa) = N/m²' }
    ],
    cards: [
      { f: 'Force', b: 'A push or a pull that can change an object’s motion or shape.' },
      { f: 'Contact force', b: 'A force that acts by touching, e.g. muscular force, friction.' },
      { f: 'Non-contact force', b: 'A force acting without touch, e.g. gravity, magnetic, electrostatic.' },
      { f: 'Pressure', b: 'Force acting per unit area (Pressure = Force ÷ Area).' },
      { f: 'SI unit of force', b: 'Newton (N).' },
      { f: 'Atmospheric pressure', b: 'Pressure exerted by the weight of air in the atmosphere.' },
      { f: 'Why a sharp knife cuts better', b: 'Small edge area → high pressure for the same force.' }
    ]
  },

  'cbse|8|science|friction': {
    notes: [
      'Friction is the force that opposes relative motion between surfaces in contact.',
      'Friction acts in the direction opposite to motion and is caused by surface irregularities.',
      'Rougher surfaces → more friction; smoother/lubricated surfaces → less friction.',
      'Order of magnitude: static > sliding > rolling friction. That is why wheels roll.',
      'Friction produces heat (rubbing hands) and causes wear and tear.',
      'Fluid friction (drag) acts on objects moving through liquids or gases; streamlined shapes reduce it.'
    ],
    cards: [
      { f: 'Friction', b: 'The force that opposes relative motion between surfaces in contact.' },
      { f: 'Direction of friction', b: 'Always opposite to the direction of motion.' },
      { f: 'Static friction', b: 'Friction that acts when a body is at rest and about to move; largest of the three.' },
      { f: 'Rolling friction', b: 'Friction when a body rolls; smaller than sliding friction.' },
      { f: 'Lubricant', b: 'A substance (e.g. oil) applied to reduce friction.' },
      { f: 'Fluid friction / drag', b: 'The friction offered by liquids and gases on a moving object.' },
      { f: 'Streamlining', b: 'Giving a shape that reduces fluid friction (e.g. fish, aeroplanes).' }
    ]
  },

  'cbse|9|science|matter-in-our-surroundings': {
    notes: [
      'Matter is anything that has mass and occupies space; made of tiny particles with space between them.',
      'Three states: solid (fixed shape & volume), liquid (fixed volume, no fixed shape), gas (neither fixed).',
      'Particle motion/kinetic energy: gas > liquid > solid.',
      'Melting (solid→liquid), boiling (liquid→gas), sublimation (solid→gas directly).',
      'Evaporation is a surface phenomenon and causes cooling.',
      'Temperature is measured in kelvin (SI). 0 °C = 273.15 K.'
    ],
    formulas: [
      { n: 'Celsius to Kelvin', x: 'K = °C + 273' },
      { n: 'SI unit of temperature', x: 'kelvin (K)' }
    ],
    cards: [
      { f: 'Matter', b: 'Anything that has mass and occupies space.' },
      { f: 'Sublimation', b: 'Change of a solid directly into vapour without becoming liquid.' },
      { f: 'Melting point', b: 'The temperature at which a solid turns into a liquid.' },
      { f: 'Evaporation', b: 'Surface change of liquid to vapour below boiling point; causes cooling.' },
      { f: 'Latent heat', b: 'Heat absorbed/released during a change of state at constant temperature.' },
      { f: 'Diffusion', b: 'Intermixing of particles of two substances on their own.' },
      { f: 'Kelvin', b: 'The SI unit of temperature (K = °C + 273).' }
    ]
  },

  'cbse|9|science|motion': {
    notes: [
      'Distance is total path length (scalar); displacement is shortest straight-line distance with direction (vector).',
      'Speed = distance/time (scalar); velocity = displacement/time (vector).',
      'Acceleration is the rate of change of velocity (SI unit m/s²).',
      'Uniform motion: equal distances in equal time intervals (zero acceleration).',
      'Area under a velocity–time graph gives displacement; slope gives acceleration.'
    ],
    formulas: [
      { n: 'Speed', x: 'speed = distance ÷ time' },
      { n: 'Acceleration', x: 'a = (v − u) ÷ t' },
      { n: 'First equation of motion', x: 'v = u + at' },
      { n: 'Second equation of motion', x: 's = ut + ½at²' },
      { n: 'Third equation of motion', x: 'v² = u² + 2as' }
    ],
    cards: [
      { f: 'Scalar quantity', b: 'A quantity with magnitude only, e.g. distance, speed.' },
      { f: 'Vector quantity', b: 'A quantity with magnitude and direction, e.g. displacement, velocity.' },
      { f: 'Displacement', b: 'The shortest distance from start to end, with direction.' },
      { f: 'Acceleration', b: 'Rate of change of velocity; SI unit m/s².' },
      { f: 'Uniform motion', b: 'Equal distances covered in equal time intervals.' },
      { f: 'v = u + at', b: 'First equation of motion (v final, u initial velocity, a acceleration, t time).' },
      { f: 's = ut + ½at²', b: 'Second equation of motion (s = displacement).' }
    ]
  },

  'cbse|9|science|gravitation': {
    notes: [
      'Every object attracts every other object with a gravitational force (Newton’s law).',
      'F = G·m₁·m₂/r² — the force is inversely proportional to the square of the distance.',
      'g ≈ 9.8 m/s² is the acceleration due to gravity near Earth’s surface.',
      'Mass is constant everywhere; weight (= mg) changes with g.',
      'Buoyant force (upthrust) acts upward on an immersed object; an object floats if its density < liquid’s density.',
      'Archimedes’ principle: upthrust = weight of the fluid displaced.'
    ],
    formulas: [
      { n: 'Newton’s law of gravitation', x: 'F = G·m₁·m₂ / r²' },
      { n: 'Weight', x: 'W = m·g' },
      { n: 'Acceleration due to gravity', x: 'g ≈ 9.8 m/s²' },
      { n: 'Density', x: 'density = mass ÷ volume' }
    ],
    cards: [
      { f: 'Gravitation', b: 'The force of attraction between any two objects with mass.' },
      { f: 'Value of g', b: 'About 9.8 m/s² near the Earth’s surface.' },
      { f: 'Mass', b: 'The amount of matter in a body; the same everywhere.' },
      { f: 'Weight', b: 'The gravitational force on a body, W = m·g; changes with g.' },
      { f: 'Buoyant force (upthrust)', b: 'The upward force a fluid exerts on an immersed object.' },
      { f: 'Archimedes’ principle', b: 'Upthrust equals the weight of the fluid displaced by the object.' },
      { f: 'Condition to float', b: 'An object floats if its density is less than the liquid’s density.' }
    ]
  },

  'cbse|10|science|chemical-reactions-and-equations': {
    notes: [
      'A chemical reaction forms new substances; shown by a chemical equation.',
      'Balancing an equation follows the law of conservation of mass (atoms equal on both sides).',
      'Types: combination, decomposition, displacement, double displacement, oxidation & reduction.',
      'Oxidation = gain of oxygen / loss of hydrogen; Reduction = loss of oxygen / gain of hydrogen.',
      'A redox reaction has oxidation and reduction happening together.',
      'Corrosion (rusting) and rancidity are everyday oxidation processes.'
    ],
    cards: [
      { f: 'Chemical equation', b: 'A symbolic representation of a chemical reaction using formulae.' },
      { f: 'Balanced equation', b: 'An equation with equal numbers of each atom on both sides (conservation of mass).' },
      { f: 'Combination reaction', b: 'Two or more substances combine to form a single product.' },
      { f: 'Decomposition reaction', b: 'A single compound breaks into two or more simpler substances.' },
      { f: 'Displacement reaction', b: 'A more reactive element displaces a less reactive one from its compound.' },
      { f: 'Oxidation', b: 'Gain of oxygen or loss of hydrogen.' },
      { f: 'Reduction', b: 'Loss of oxygen or gain of hydrogen.' },
      { f: 'Redox reaction', b: 'A reaction where oxidation and reduction occur simultaneously.' }
    ]
  },

  'cbse|10|science|light-reflection-and-refraction': {
    notes: [
      'Reflection: light bounces off a surface; angle of incidence = angle of reflection.',
      'A concave mirror is converging; a convex mirror is diverging (always virtual, erect, diminished image).',
      'Refraction: light bends when it passes between media of different densities.',
      'A convex lens converges light; a concave lens diverges light.',
      'Power of a lens P = 1/f (in metres); SI unit is the dioptre (D).',
      'Sign convention (Cartesian) is used for mirror and lens formulae.'
    ],
    formulas: [
      { n: 'Mirror formula', x: '1/v + 1/u = 1/f' },
      { n: 'Lens formula', x: '1/v − 1/u = 1/f' },
      { n: 'Magnification (lens)', x: 'm = v/u' },
      { n: 'Power of a lens', x: 'P = 1/f (metres), unit dioptre (D)' }
    ],
    cards: [
      { f: 'Reflection of light', b: 'The bouncing back of light from a surface.' },
      { f: 'Refraction of light', b: 'The bending of light as it passes from one medium to another.' },
      { f: 'Concave mirror', b: 'A converging mirror; can form real or virtual images.' },
      { f: 'Convex lens', b: 'A converging lens, thicker in the middle.' },
      { f: 'Focal length', b: 'The distance between the pole/optical centre and the focus.' },
      { f: 'Power of a lens', b: 'The reciprocal of focal length in metres; SI unit dioptre (D).' },
      { f: 'Refractive index', b: 'A measure of how much a medium bends (slows) light.' }
    ]
  },

  'cbse|10|science|electricity': {
    notes: [
      'Electric current is the flow of charge; I = Q/t. SI unit ampere (A).',
      'Potential difference (voltage) V drives the current; SI unit volt (V).',
      'Ohm’s law: V = IR (at constant temperature).',
      'Resistance opposes current; SI unit ohm (Ω). It increases with length and decreases with area.',
      'In series the current is the same; in parallel the voltage is the same.',
      'Electric power P = VI = I²R = V²/R; energy is measured in kWh (1 unit).'
    ],
    formulas: [
      { n: 'Ohm’s law', x: 'V = I × R' },
      { n: 'Current', x: 'I = Q ÷ t' },
      { n: 'Power', x: 'P = V × I = I²R = V²/R' },
      { n: 'Resistances in series', x: 'R = R₁ + R₂ + R₃' },
      { n: 'Resistances in parallel', x: '1/R = 1/R₁ + 1/R₂ + 1/R₃' }
    ],
    cards: [
      { f: 'Electric current', b: 'The rate of flow of electric charge, I = Q/t; unit ampere.' },
      { f: 'Potential difference', b: 'Work done per unit charge to move it between two points; unit volt.' },
      { f: 'Ohm’s law', b: 'V = IR — current is proportional to voltage at constant temperature.' },
      { f: 'Resistance', b: 'The opposition to the flow of current; SI unit ohm (Ω).' },
      { f: 'Series connection', b: 'Same current flows through every component.' },
      { f: 'Parallel connection', b: 'Same voltage across each component.' },
      { f: 'Electric power', b: 'Rate of using electrical energy, P = VI; unit watt (W).' }
    ]
  },

  'cbse|10|math|real-numbers': {
    notes: [
      'Euclid’s division lemma: for positive integers a and b, a = bq + r where 0 ≤ r < b.',
      'Fundamental Theorem of Arithmetic: every composite number is a unique product of primes.',
      'HCF × LCM of two numbers = product of the two numbers.',
      'A number like √2, √3, √5 is irrational.',
      'A rational number p/q has a terminating decimal iff q = 2ⁿ5ᵐ (after simplification).'
    ],
    formulas: [
      { n: 'HCF–LCM relation', x: 'HCF(a,b) × LCM(a,b) = a × b' },
      { n: 'Euclid’s division lemma', x: 'a = bq + r, 0 ≤ r < b' }
    ],
    cards: [
      { f: 'Rational number', b: 'A number of the form p/q where p, q are integers and q ≠ 0.' },
      { f: 'Irrational number', b: 'A number that cannot be written as p/q; non-terminating, non-repeating.' },
      { f: 'HCF × LCM', b: 'Equals the product of the two numbers.' },
      { f: 'Fundamental Theorem of Arithmetic', b: 'Every composite number factorises uniquely into primes.' },
      { f: 'Euclid’s division lemma', b: 'a = bq + r, where 0 ≤ r < b.' },
      { f: 'Terminating decimal condition', b: 'p/q terminates iff q = 2ⁿ·5ᵐ in lowest terms.' }
    ]
  },

  'cbse|10|math|quadratic-equations': {
    notes: [
      'A quadratic equation has the form ax² + bx + c = 0, where a ≠ 0.',
      'It has at most two real roots.',
      'Discriminant D = b² − 4ac decides the nature of the roots.',
      'D > 0 → two distinct real roots; D = 0 → two equal real roots; D < 0 → no real roots.',
      'Methods to solve: factorisation, completing the square, and the quadratic formula.'
    ],
    formulas: [
      { n: 'Standard form', x: 'ax² + bx + c = 0, a ≠ 0' },
      { n: 'Discriminant', x: 'D = b² − 4ac' },
      { n: 'Quadratic formula', x: 'x = (−b ± √(b² − 4ac)) ÷ 2a' },
      { n: 'Sum of roots', x: 'α + β = −b/a' },
      { n: 'Product of roots', x: 'α·β = c/a' }
    ],
    cards: [
      { f: 'Quadratic equation', b: 'An equation of the form ax² + bx + c = 0 with a ≠ 0.' },
      { f: 'Discriminant', b: 'D = b² − 4ac; decides the nature of the roots.' },
      { f: 'D > 0', b: 'Two distinct real roots.' },
      { f: 'D = 0', b: 'Two equal (real and repeated) roots.' },
      { f: 'D < 0', b: 'No real roots (roots are complex).' },
      { f: 'Quadratic formula', b: 'x = (−b ± √(b²−4ac)) / 2a.' },
      { f: 'Sum & product of roots', b: 'α+β = −b/a and αβ = c/a.' }
    ]
  }

};
