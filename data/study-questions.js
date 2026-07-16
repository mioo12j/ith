/* Inspire Talent Hub — chapter-wise question bank (CBSE / NCERT).
 * Front-end only: loaded as window.ITH_STUDY_Q.
 * Keyed by "board|grade|subjectId|chapter-slug".
 * chapter-slug = chapter name lowercased, non-alphanumerics -> hyphens.
 * Each question: { q, o:[options], a: correct index, e: explanation, d: 1|2|3 }.
 * Seeded with a starter set; chapters not present here show "coming soon".
 */
window.ITH_STUDY_Q = {

  /* ================= CLASS 6 ================= */
  'cbse|6|math|knowing-our-numbers': [
    { q:'Which is the largest 4-digit number?', o:['9000','9999','1000','99999'], a:1, e:'The largest 4-digit number is 9999; adding 1 gives the smallest 5-digit number, 10000.', d:1 },
    { q:'The place value of 7 in 4,73,502 is:', o:['7','70','7000','70000'], a:3, e:'7 is in the ten-thousands place, so its place value is 70,000.', d:2 },
    { q:'Estimate 4,689 + 3,214 by rounding to the nearest hundred.', o:['7,800','7,900','8,000','8,100'], a:1, e:'4,689 ≈ 4,700 and 3,214 ≈ 3,200; 4,700 + 3,200 = 7,900.', d:2 },
    { q:'In the Indian system, where do we place the first comma from the right?', o:['After 2 digits','After 3 digits','After 4 digits','After 5 digits'], a:1, e:'The Indian system places the first comma after 3 digits (thousands), then after every 2 digits.', d:1 },
    { q:'The Roman numeral for 40 is:', o:['XXXX','XL','LX','VL'], a:1, e:'40 is written XL (50 − 10) in Roman numerals.', d:2 },
    { q:'The smallest whole number is:', o:['1','0','−1','10'], a:1, e:'0 is the smallest whole number; whole numbers are 0, 1, 2, 3, …', d:1 },
    { q:'How many thousands make one lakh?', o:['10','100','1000','10000'], a:1, e:'1 lakh = 1,00,000 = 100 thousands.', d:2 }
  ],
  'cbse|6|math|whole-numbers': [
    { q:'The successor of 999 is:', o:['998','1000','990','1001'], a:1, e:'The successor is one more than the number: 999 + 1 = 1000.', d:1 },
    { q:'Which property is shown by 4 + 7 = 7 + 4?', o:['Associative','Commutative','Distributive','Closure'], a:1, e:'Changing the order of addends without changing the sum is the commutative property.', d:2 },
    { q:'The additive identity for whole numbers is:', o:['1','0','−1','10'], a:1, e:'Adding 0 leaves a number unchanged, so 0 is the additive identity.', d:1 },
    { q:'8 × (10 + 2) = 8 × 10 + 8 × 2 illustrates the:', o:['Commutative property','Distributive property','Associative property','Identity property'], a:1, e:'Multiplication distributed over addition is the distributive property.', d:2 },
    { q:'Which whole number has no predecessor?', o:['0','1','10','100'], a:0, e:'0 is the smallest whole number and has no whole-number predecessor.', d:1 },
    { q:'The product of any whole number and 0 is:', o:['the number','0','1','undefined'], a:1, e:'Any number multiplied by 0 gives 0.', d:1 }
  ],
  'cbse|6|math|integers': [
    { q:'Which is greater: −5 or −8?', o:['−5','−8','equal','cannot say'], a:0, e:'On the number line −5 is to the right of −8, so −5 > −8.', d:1 },
    { q:'The value of (−3) + (−7) is:', o:['−10','10','4','−4'], a:0, e:'Adding two negatives adds their magnitudes with a negative sign: −(3+7) = −10.', d:1 },
    { q:'The additive inverse of −12 is:', o:['−12','12','0','1'], a:1, e:'The additive inverse of a number sums with it to 0: −12 + 12 = 0.', d:2 },
    { q:'(−15) − (−9) equals:', o:['−24','−6','6','24'], a:1, e:'Subtracting a negative adds its opposite: −15 + 9 = −6.', d:2 },
    { q:'On a number line, which integer lies between −2 and 0?', o:['−1','1','2','−3'], a:0, e:'−1 lies between −2 and 0.', d:1 },
    { q:'The sum of an integer and its additive inverse is always:', o:['positive','negative','zero','one'], a:2, e:'A number plus its additive inverse equals 0.', d:1 }
  ],
  'cbse|6|science|food-where-does-it-come-from': [
    { q:'Animals that eat only plants are called:', o:['Carnivores','Herbivores','Omnivores','Decomposers'], a:1, e:'Herbivores (e.g. cow, deer) eat only plants.', d:1 },
    { q:'Which part of the plant gives us the spice “clove”?', o:['Root','Flower bud','Leaf','Seed'], a:1, e:'Cloves are dried flower buds.', d:2 },
    { q:'Honey is made by bees from:', o:['pollen','nectar','leaves','water'], a:1, e:'Bees collect nectar from flowers and convert it into honey.', d:1 },
    { q:'A sprouted seed is an example of a food that is eaten:', o:['only cooked','raw','only fried','never'], a:1, e:'Sprouts are commonly eaten raw and are rich in nutrients.', d:1 },
    { q:'Animals that eat both plants and other animals are:', o:['Herbivores','Carnivores','Omnivores','Producers'], a:2, e:'Omnivores (e.g. humans, crows) eat both plants and animals.', d:1 },
    { q:'Which of these is an edible root?', o:['Potato','Carrot','Ginger','Onion'], a:1, e:'Carrot is a root; potato and ginger are stems and onion is a modified leaf/bulb.', d:2 }
  ],

  /* ================= CLASS 7 ================= */
  'cbse|7|math|integers': [
    { q:'(−6) × (−4) equals:', o:['−24','24','−10','10'], a:1, e:'The product of two negative integers is positive: 6 × 4 = 24.', d:1 },
    { q:'(−36) ÷ 9 equals:', o:['−4','4','−27','27'], a:0, e:'A negative divided by a positive is negative: 36 ÷ 9 = 4, so −4.', d:1 },
    { q:'Which property does 5 × (3 + (−2)) = 5×3 + 5×(−2) show?', o:['Commutative','Associative','Distributive','Closure'], a:2, e:'Multiplication distributes over addition — the distributive property.', d:2 },
    { q:'The value of (−1) × (−1) × (−1) is:', o:['1','−1','0','3'], a:1, e:'An odd number of negative factors gives a negative product: −1.', d:2 },
    { q:'Any integer multiplied by 1 gives:', o:['0','1','the integer itself','−1'], a:2, e:'1 is the multiplicative identity, so the integer is unchanged.', d:1 },
    { q:'Division of any non-zero integer by itself gives:', o:['0','1','−1','the integer'], a:1, e:'A number divided by itself equals 1.', d:1 }
  ],
  'cbse|7|science|nutrition-in-plants': [
    { q:'The mode of nutrition in which organisms make their own food is:', o:['Heterotrophic','Autotrophic','Parasitic','Saprotrophic'], a:1, e:'Autotrophs, like green plants, make their own food by photosynthesis.', d:1 },
    { q:'The green pigment in leaves that traps sunlight is:', o:['Chlorophyll','Haemoglobin','Melanin','Carotene'], a:0, e:'Chlorophyll captures light energy for photosynthesis.', d:1 },
    { q:'Tiny pores on the surface of leaves for gas exchange are called:', o:['Stomata','Veins','Roots','Petioles'], a:0, e:'Stomata allow exchange of gases and loss of water vapour.', d:2 },
    { q:'Which of these is a parasitic plant?', o:['Rose','Cuscuta (Amarbel)','Mango','Wheat'], a:1, e:'Cuscuta takes food from a host plant, so it is a parasite.', d:2 },
    { q:'Pitcher plant is an example of a plant that:', o:['makes no food','eats insects','has no leaves','grows underwater'], a:1, e:'Insectivorous plants like the pitcher plant trap and digest insects for nitrogen.', d:2 },
    { q:'The raw materials for photosynthesis are carbon dioxide and:', o:['oxygen','water','glucose','nitrogen'], a:1, e:'Plants use CO₂ and water, with sunlight, to make glucose and oxygen.', d:1 }
  ],

  /* ================= CLASS 8 ================= */
  'cbse|8|science|force-and-pressure': [
    { q:'Force is a push or a pull acting on an:', o:['object','idea','image','area'], a:0, e:'A force is a push or pull that can change the state or shape of an object.', d:1 },
    { q:'The SI unit of force is the:', o:['joule','newton','pascal','watt'], a:1, e:'Force is measured in newtons (N).', d:1 },
    { q:'Pressure is defined as force per unit:', o:['time','area','mass','length'], a:1, e:'Pressure = force ÷ area.', d:2 },
    { q:'The force that opposes motion between surfaces in contact is:', o:['gravity','friction','magnetic force','muscular force'], a:1, e:'Friction acts between surfaces and opposes relative motion.', d:1 },
    { q:'Which exerts more pressure on the ground for the same force?', o:['A wide base','A pointed tip','A flat sheet','A large box'], a:1, e:'Smaller area gives greater pressure, so a pointed tip exerts more pressure.', d:2 },
    { q:'Atmospheric pressure is caused by the weight of:', o:['water','air','soil','clouds only'], a:1, e:'The air around us has weight and exerts atmospheric pressure.', d:2 }
  ],
  'cbse|8|science|friction': [
    { q:'Friction always acts in a direction:', o:['same as motion','opposite to motion','perpendicular to motion','randomly'], a:1, e:'Friction opposes the relative motion of surfaces, acting opposite to motion.', d:1 },
    { q:'Which surface produces the most friction?', o:['Glass','Ice','Sandpaper','Polished marble'], a:2, e:'Rougher surfaces like sandpaper produce more friction.', d:1 },
    { q:'To reduce friction in machines we use:', o:['sand','lubricants','glue','water only'], a:1, e:'Lubricants like oil form a thin layer that reduces friction.', d:1 },
    { q:'Rolling friction is generally ____ than sliding friction.', o:['greater','smaller','equal','zero'], a:1, e:'Rolling friction is smaller than sliding friction, which is why wheels are used.', d:2 },
    { q:'Friction produces:', o:['light only','heat','sound only','electricity only'], a:1, e:'Friction converts kinetic energy into heat, warming the surfaces.', d:1 },
    { q:'The friction that acts on objects moving through air is called:', o:['fluid friction (drag)','static friction','rolling friction','magnetic friction'], a:0, e:'Air and liquids exert fluid friction, also called drag.', d:2 }
  ],

  /* ================= CLASS 9 ================= */
  'cbse|9|science|matter-in-our-surroundings': [
    { q:'The state of matter with a fixed shape and fixed volume is:', o:['solid','liquid','gas','plasma'], a:0, e:'Solids have both a fixed shape and a fixed volume.', d:1 },
    { q:'The change of a solid directly into vapour is called:', o:['melting','sublimation','condensation','freezing'], a:1, e:'Sublimation is the direct solid-to-gas change, e.g. camphor.', d:2 },
    { q:'The temperature at which a solid melts is its:', o:['boiling point','melting point','dew point','flash point'], a:1, e:'The melting point is the temperature at which a solid becomes liquid.', d:1 },
    { q:'Evaporation causes:', o:['heating','cooling','no change','freezing only'], a:1, e:'Evaporation absorbs heat from the surroundings, producing a cooling effect.', d:2 },
    { q:'Which has the highest kinetic energy of particles?', o:['solid','liquid','gas','all equal'], a:2, e:'Particles in a gas move fastest, so gases have the highest kinetic energy.', d:2 },
    { q:'The SI unit of temperature is the:', o:['Celsius','Fahrenheit','Kelvin','Newton'], a:2, e:'The SI unit of temperature is the kelvin (K).', d:1 }
  ],
  'cbse|9|science|motion': [
    { q:'A quantity that has both magnitude and direction is a:', o:['scalar','vector','ratio','constant'], a:1, e:'Vectors (like velocity) have magnitude and direction; scalars have only magnitude.', d:1 },
    { q:'The SI unit of acceleration is:', o:['m/s','m/s²','m','s'], a:1, e:'Acceleration is change of velocity per time: metres per second squared (m/s²).', d:1 },
    { q:'A body moving with constant velocity has an acceleration of:', o:['zero','positive','negative','infinite'], a:0, e:'Constant velocity means no change in velocity, so acceleration is zero.', d:2 },
    { q:'Distance is a ____ quantity.', o:['vector','scalar','negative','directional'], a:1, e:'Distance has only magnitude, so it is a scalar.', d:1 },
    { q:'The area under a velocity–time graph gives:', o:['acceleration','distance','speed','force'], a:1, e:'The area under a v–t graph represents the displacement (distance).', d:2 },
    { q:'If a car covers equal distances in equal intervals of time, its motion is:', o:['accelerated','uniform','circular','random'], a:1, e:'Equal distances in equal times means uniform (constant-speed) motion.', d:1 }
  ],
  'cbse|9|science|gravitation': [
    { q:'The value of acceleration due to gravity (g) on Earth is about:', o:['9.8 m/s²','98 m/s²','0.98 m/s²','1 m/s²'], a:0, e:'g ≈ 9.8 m/s² near the Earth’s surface.', d:1 },
    { q:'The force of gravitation between two bodies depends on the product of their masses and:', o:['the square of the distance','the distance','the cube of the distance','their colour'], a:0, e:'Newton’s law: F ∝ (m₁m₂)/r², inversely as the square of the distance.', d:2 },
    { q:'The weight of an object is the force with which:', o:['it pushes air','the Earth attracts it','it floats','it spins'], a:1, e:'Weight = mass × g, the gravitational force the Earth exerts on the object.', d:1 },
    { q:'The mass of an object on the Moon compared with Earth is:', o:['less','more','the same','zero'], a:2, e:'Mass is constant everywhere; only weight changes with gravity.', d:2 },
    { q:'A body will float in a liquid if its density is ____ the liquid’s density.', o:['greater than','less than','equal to','double'], a:1, e:'An object floats when its density is less than that of the liquid.', d:2 },
    { q:'The upward force exerted by a fluid on an immersed object is:', o:['friction','buoyant force','gravity','tension'], a:1, e:'The buoyant force (upthrust) acts upward on an immersed object.', d:1 }
  ],
  'cbse|9|math|number-systems': [
    { q:'Which of these is an irrational number?', o:['√4','√2','0.5','3/7'], a:1, e:'√2 cannot be written as a fraction and is non-terminating non-repeating — irrational.', d:2 },
    { q:'Every rational number can be written as p/q where q is:', o:['0','not 0','negative only','1'], a:1, e:'A rational number is p/q with integers p, q and q ≠ 0.', d:1 },
    { q:'The decimal expansion of a rational number is either terminating or:', o:['irrational','non-terminating non-repeating','non-terminating repeating','undefined'], a:2, e:'Rational numbers have terminating or non-terminating recurring (repeating) decimals.', d:2 },
    { q:'√9 is a:', o:['rational number','irrational number','not a number','negative number'], a:0, e:'√9 = 3, which is rational.', d:1 },
    { q:'Between any two rational numbers there are:', o:['no numbers','exactly one','infinitely many','only two'], a:2, e:'There are infinitely many rational numbers between any two rationals.', d:2 },
    { q:'The product of a non-zero rational and an irrational number is:', o:['rational','irrational','zero','an integer'], a:1, e:'A non-zero rational times an irrational is always irrational.', d:3 }
  ],

  /* ================= CLASS 10 ================= */
  'cbse|10|science|chemical-reactions-and-equations': [
    { q:'A chemical equation is balanced to satisfy the law of conservation of:', o:['energy','mass','momentum','charge only'], a:1, e:'Balancing ensures equal atoms on both sides — conservation of mass.', d:1 },
    { q:'Rusting of iron is an example of:', o:['reduction','oxidation','displacement','decomposition'], a:1, e:'Iron gains oxygen to form rust — an oxidation reaction.', d:2 },
    { q:'In the reaction Zn + CuSO₄ → ZnSO₄ + Cu, zinc:', o:['is reduced','displaces copper','gains electrons','is a catalyst'], a:1, e:'Zinc is more reactive and displaces copper from its salt — a displacement reaction.', d:2 },
    { q:'A reaction in which a single compound breaks into simpler substances is:', o:['combination','decomposition','displacement','double displacement'], a:1, e:'Decomposition breaks one compound into two or more products.', d:1 },
    { q:'The reaction that releases heat is called:', o:['endothermic','exothermic','photochemical','reversible'], a:1, e:'Exothermic reactions release heat to the surroundings.', d:1 },
    { q:'When a substance gains oxygen, it is said to be:', o:['reduced','oxidised','neutralised','evaporated'], a:1, e:'Gaining oxygen (or losing hydrogen) is oxidation.', d:1 }
  ],
  'cbse|10|science|light-reflection-and-refraction': [
    { q:'The image formed by a plane mirror is:', o:['real and inverted','virtual and erect','real and erect','virtual and inverted'], a:1, e:'A plane mirror forms a virtual, erect image of the same size.', d:1 },
    { q:'A concave mirror is also called a:', o:['diverging mirror','converging mirror','plane mirror','flat mirror'], a:1, e:'A concave mirror converges parallel rays to a focus.', d:2 },
    { q:'The bending of light as it passes from one medium to another is:', o:['reflection','refraction','dispersion','diffraction'], a:1, e:'Refraction is the change in direction of light due to a change in speed between media.', d:1 },
    { q:'The SI unit of power of a lens is the:', o:['metre','dioptre','watt','joule'], a:1, e:'Lens power is measured in dioptres (D), the reciprocal of focal length in metres.', d:2 },
    { q:'A convex lens is a ____ lens.', o:['diverging','converging','plane','concave'], a:1, e:'A convex lens converges light rays.', d:1 },
    { q:'The refractive index of a medium is a measure of how much it:', o:['reflects light','bends light','absorbs light','emits light'], a:1, e:'Refractive index indicates how much a medium bends (slows) light.', d:2 }
  ],
  'cbse|10|science|electricity': [
    { q:'The SI unit of electric current is the:', o:['volt','ampere','ohm','watt'], a:1, e:'Electric current is measured in amperes (A).', d:1 },
    { q:'Ohm’s law states that V = I × ___.', o:['P','R','Q','t'], a:1, e:'V = IR, where R is resistance.', d:1 },
    { q:'The unit of electrical resistance is the:', o:['ampere','ohm','volt','coulomb'], a:1, e:'Resistance is measured in ohms (Ω).', d:1 },
    { q:'In a series circuit, the current through each component is:', o:['different','the same','zero','doubled'], a:1, e:'In series, the same current flows through every component.', d:2 },
    { q:'Electrical power is given by P = V × ___.', o:['R','I','Q','t'], a:1, e:'Power P = VI (also I²R or V²/R).', d:2 },
    { q:'Which material is the best conductor of electricity?', o:['Rubber','Silver','Wood','Glass'], a:1, e:'Silver is the best conductor among the options; rubber, wood and glass are insulators.', d:1 }
  ],
  'cbse|10|math|real-numbers': [
    { q:'The HCF of 12 and 18 is:', o:['3','6','12','36'], a:1, e:'Common factors of 12 and 18: the highest is 6.', d:1 },
    { q:'The LCM of 4 and 6 is:', o:['12','24','6','2'], a:0, e:'The least common multiple of 4 and 6 is 12.', d:1 },
    { q:'For two numbers, HCF × LCM equals:', o:['their sum','their product','their difference','their ratio'], a:1, e:'HCF × LCM = product of the two numbers.', d:2 },
    { q:'The Fundamental Theorem of Arithmetic is about factorisation into:', o:['even numbers','prime numbers','squares','fractions'], a:1, e:'Every composite number can be written uniquely as a product of primes.', d:2 },
    { q:'√2 is:', o:['rational','irrational','an integer','a natural number'], a:1, e:'√2 is irrational — it cannot be expressed as a fraction.', d:2 },
    { q:'A number is divisible by 10 if it ends in:', o:['0','5','2','1'], a:0, e:'Numbers ending in 0 are divisible by 10.', d:1 }
  ],
  'cbse|10|math|quadratic-equations': [
    { q:'The standard form of a quadratic equation is:', o:['ax + b = 0','ax² + bx + c = 0','a/x = b','ax³ = b'], a:1, e:'A quadratic equation is ax² + bx + c = 0 with a ≠ 0.', d:1 },
    { q:'A quadratic equation has at most how many real roots?', o:['1','2','3','4'], a:1, e:'A quadratic can have at most two real roots.', d:1 },
    { q:'The discriminant of ax² + bx + c = 0 is:', o:['b² − 4ac','b² + 4ac','2ab','a² − b²'], a:0, e:'The discriminant is D = b² − 4ac.', d:2 },
    { q:'If the discriminant is 0, the roots are:', o:['imaginary','real and equal','real and distinct','undefined'], a:1, e:'D = 0 gives two equal real roots.', d:2 },
    { q:'The roots of x² − 5x + 6 = 0 are:', o:['2 and 3','1 and 6','−2 and −3','0 and 5'], a:0, e:'x² − 5x + 6 = (x−2)(x−3), so roots are 2 and 3.', d:2 },
    { q:'If D < 0, the quadratic equation has:', o:['two real roots','no real roots','one real root','infinite roots'], a:1, e:'A negative discriminant means no real roots (roots are complex).', d:3 }
  ],
  'cbse|10|polsci|federalism': [
    { q:'Federalism is a system in which power is divided between:', o:['two political parties','central and state governments','judges and ministers','rich and poor'], a:1, e:'Federalism divides powers between a central authority and constituent units (states).', d:1 },
    { q:'In India, which government has the power to make laws on subjects in the Union List?', o:['State','Central','Local','None'], a:1, e:'Only the Central Government legislates on Union List subjects.', d:2 },
    { q:'The third tier of government in India is:', o:['the Parliament','the State Assembly','local self-government','the Supreme Court'], a:2, e:'Local self-government (panchayats and municipalities) is the third tier.', d:2 },
    { q:'The distribution of powers in India is written in the:', o:['newspaper','Constitution','ballot','census'], a:1, e:'The Constitution clearly lays out Union, State and Concurrent lists.', d:1 },
    { q:'Which of these promotes federalism in India?', o:['One official language for all','Decentralisation of power','Abolishing states','Central control of all subjects'], a:1, e:'Decentralisation — giving power to states and local bodies — strengthens federalism.', d:2 }
  ]
};
