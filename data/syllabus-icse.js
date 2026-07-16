/* Inspire Talent Hub — ICSE / CISCE syllabus tree (Grades 6–12).
 * Front-end only: merges into window.ITH_SYLLABUS.tree.icse and activates the
 * ICSE board. Same structure as the CBSE tree. Questions live in
 * data/study-questions-icse-*.js and content in data/study-content-icse-*.js,
 * all keyed by  icse|grade|subjectId|chapter-slug.
 */
(function () {
  var SYL = window.ITH_SYLLABUS;
  if (!SYL) return;
  // Activate the ICSE board.
  (SYL.boards || []).forEach(function (b) { if (b.id === 'icse') b.active = true; });

  var M = 'chart', P = 'star', C = 'feather', B = 'globe', H = 'book', G = 'globe', E = 'pen';

  SYL.tree.icse = {
    6: [
      { id: 'math', name: 'Mathematics', icon: M, chapters: [
        'Number System', 'Whole Numbers', 'Playing with Numbers', 'Negative Numbers and Integers', 'Sets',
        'Ratio and Proportion', 'Unitary Method', 'Fractions', 'Decimal Fractions', 'Fundamental Concepts of Algebra',
        'Simple Linear Equations', 'Fundamental Geometrical Concepts', 'Angles', 'Triangles', 'Symmetry',
        'Perimeter and Area', 'Data Handling' ] },
      { id: 'physics', name: 'Physics', icon: P, chapters: [
        'Physical Quantities and Measurement', 'Force', 'Simple Machines', 'Light', 'Magnetism' ] },
      { id: 'chemistry', name: 'Chemistry', icon: C, chapters: [
        'Matter', 'Physical and Chemical Changes', 'Elements, Compounds and Mixtures', 'Air and Atmosphere', 'Water' ] },
      { id: 'biology', name: 'Biology', icon: B, chapters: [
        'The Leaf', 'The Cell', 'Plant and Animal Life', 'The Circulatory System', 'Health and Hygiene' ] },
      { id: 'histcivics', name: 'History & Civics', icon: H, chapters: [
        'The Study of History', 'Early Man', 'The River Valley Civilisations', 'The Vedic Age',
        'Rise of New Religions', 'The Mauryan Empire', 'Our Local Government' ] },
      { id: 'geography', name: 'Geography', icon: G, chapters: [
        'The Earth in the Solar System', 'Globe and Maps', 'Latitude and Longitude', 'Motions of the Earth',
        'Major Landforms', 'Our Country India' ] },
      { id: 'english', name: 'English', icon: E, chapters: [
        'Reading Comprehension', 'Nouns and Pronouns', 'Verbs and Tenses', 'Adjectives and Adverbs',
        'Punctuation', 'Vocabulary', 'Writing: Notice and Message', 'Writing: Story and Paragraph' ] }
    ],
    7: [
      { id: 'math', name: 'Mathematics', icon: M, chapters: [
        'Integers', 'Rational Numbers', 'Fractions and Decimals', 'Exponents and Powers', 'Sets',
        'Ratio and Proportion', 'Unitary Method and Percentage', 'Speed, Distance and Time', 'Algebraic Expressions',
        'Simple Linear Equations', 'Lines and Angles', 'Triangles', 'Congruence', 'Symmetry and Reflection',
        'Perimeter and Area', 'Data Handling' ] },
      { id: 'physics', name: 'Physics', icon: P, chapters: [
        'Physical Quantities and Measurement', 'Motion', 'Energy', 'Light', 'Heat', 'Sound', 'Electricity and Magnetism' ] },
      { id: 'chemistry', name: 'Chemistry', icon: C, chapters: [
        'Matter and Its Composition', 'Physical and Chemical Changes', 'Elements, Compounds and Mixtures',
        'Atomic Structure', 'Language of Chemistry', 'Metals and Non-metals', 'Air and Atmosphere' ] },
      { id: 'biology', name: 'Biology', icon: B, chapters: [
        'Plant and Animal Tissues', 'Photosynthesis and Respiration', 'Transport in Plants', 'The Digestive System',
        'The Respiratory System', 'The Nervous System', 'Health and Hygiene' ] },
      { id: 'histcivics', name: 'History & Civics', icon: H, chapters: [
        'Medieval Europe', 'The Rise of Islam', 'The Delhi Sultanate', 'The Mughal Empire',
        'Composite Culture', 'The Constitution of India', 'Fundamental Rights and Duties' ] },
      { id: 'geography', name: 'Geography', icon: G, chapters: [
        'Representation of Geographical Features', 'Landforms of the Earth', 'Rocks and Minerals',
        'Weathering and Soil', 'The Atmosphere', 'The Water Cycle', 'Natural Regions of the World' ] },
      { id: 'english', name: 'English', icon: E, chapters: [
        'Reading Comprehension', 'Tenses', 'Modals', 'Active and Passive Voice', 'Reported Speech',
        'Vocabulary and Idioms', 'Writing: Letter Writing', 'Writing: Essay and Paragraph' ] }
    ],
    8: [
      { id: 'math', name: 'Mathematics', icon: M, chapters: [
        'Rational Numbers', 'Exponents and Powers', 'Squares and Square Roots', 'Cubes and Cube Roots', 'Sets',
        'Percentage and Its Applications', 'Profit, Loss and Discount', 'Simple and Compound Interest',
        'Algebraic Expressions and Identities', 'Factorisation', 'Linear Equations in One Variable',
        'Understanding Quadrilaterals', 'Constructions', 'Mensuration', 'Data Handling', 'Direct and Inverse Variation' ] },
      { id: 'physics', name: 'Physics', icon: P, chapters: [
        'Matter', 'Physical Quantities and Measurement', 'Force and Pressure', 'Energy', 'Light',
        'Heat Transfer', 'Sound', 'Electricity' ] },
      { id: 'chemistry', name: 'Chemistry', icon: C, chapters: [
        'Matter', 'Physical and Chemical Changes', 'Elements, Compounds and Mixtures', 'Atomic Structure',
        'Language of Chemistry', 'Chemical Reactions', 'Hydrogen', 'Water', 'Carbon and Its Compounds' ] },
      { id: 'biology', name: 'Biology', icon: B, chapters: [
        'Transport of Food and Minerals in Plants', 'Reproduction in Plants and Animals', 'Ecosystems',
        'Endocrine System and Adolescence', 'The Circulatory System', 'The Nervous System',
        'Food Production', 'Health and Hygiene' ] },
      { id: 'histcivics', name: 'History & Civics', icon: H, chapters: [
        'The Rise of European Powers', 'Traders to Rulers: The East India Company', 'The Great Uprising of 1857',
        'Growth of Nationalism', 'The Indian National Movement', 'The Union Legislature',
        'The Union Executive', 'The Judiciary' ] },
      { id: 'geography', name: 'Geography', icon: G, chapters: [
        'Representation of Geographical Features', 'The Earth Interior and Landforms', 'Volcanoes and Earthquakes',
        'Weathering and Erosion', 'Pollution', 'Natural Resources', 'Agriculture', 'Industries' ] },
      { id: 'english', name: 'English', icon: E, chapters: [
        'Reading Comprehension', 'Tenses and Clauses', 'Active and Passive Voice', 'Reported Speech',
        'Determiners and Modals', 'Vocabulary and Idioms', 'Writing: Formal Letters', 'Writing: Story and Essay' ] }
    ],
    9: [
      { id: 'english', name: 'English', icon: E, chapters: [
        'Reading Comprehension', 'Tenses', 'Subject–Verb Agreement', 'Active and Passive Voice', 'Reported Speech',
        'Writing: Composition', 'Writing: Letter Writing', 'Writing: Notice and Email' ] },
      { id: 'math', name: 'Mathematics', icon: M, chapters: [
        'Rational and Irrational Numbers', 'Compound Interest', 'Expansions', 'Factorisation',
        'Simultaneous Linear Equations', 'Indices', 'Logarithms', 'Triangles', 'Mid-point Theorem',
        'Pythagoras Theorem', 'Rectilinear Figures', 'Area Theorems', 'Circle',
        'Statistics', 'Mensuration', 'Trigonometrical Ratios', 'Coordinate Geometry' ] },
      { id: 'physics', name: 'Physics', icon: P, chapters: [
        'Measurements and Experimentation', 'Motion in One Dimension', 'Laws of Motion', 'Fluids: Pressure and Density',
        'Upthrust and Archimedes Principle', 'Heat and Energy', 'Reflection of Light', 'Propagation of Sound Waves',
        'Current Electricity', 'Magnetism' ] },
      { id: 'chemistry', name: 'Chemistry', icon: C, chapters: [
        'The Language of Chemistry', 'Chemical Changes and Reactions', 'Water', 'Atomic Structure and Bonding',
        'The Periodic Table', 'Study of the First Element: Hydrogen', 'Study of Gas Laws', 'Atmospheric Pollution' ] },
      { id: 'biology', name: 'Biology', icon: B, chapters: [
        'The Cell', 'Tissues', 'The Flower', 'Pollination and Fertilisation', 'Seeds', 'Respiration in Plants',
        'Five Kingdom Classification', 'Nutrition', 'Skeleton and Movement', 'Hygiene and Diseases' ] },
      { id: 'histcivics', name: 'History & Civics', icon: H, chapters: [
        'The Harappan Civilisation', 'The Vedic Period', 'Jainism and Buddhism', 'The Mauryan Empire',
        'The Sangam Age', 'The Golden Age: Guptas', 'The Union Parliament', 'The State Government', 'The Judiciary' ] },
      { id: 'geography', name: 'Geography', icon: G, chapters: [
        'Our World', 'Latitude and Longitude', 'Rotation and Revolution', 'The Structure of the Earth',
        'Landforms of the Earth', 'The Hydrosphere', 'The Atmosphere', 'Weather and Climate', 'Pollution' ] }
    ],
    10: [
      { id: 'english', name: 'English', icon: E, chapters: [
        'Reading Comprehension', 'Tenses', 'Subject–Verb Concord', 'Active and Passive Voice', 'Reported Speech',
        'Writing: Composition', 'Writing: Formal and Informal Letters', 'Writing: Notice and Email' ] },
      { id: 'math', name: 'Mathematics', icon: M, chapters: [
        'GST (Goods and Services Tax)', 'Banking', 'Shares and Dividends', 'Linear Inequations',
        'Quadratic Equations', 'Ratio and Proportion', 'Factorisation of Polynomials', 'Matrices',
        'Arithmetic Progression', 'Coordinate Geometry', 'Similarity', 'Circles', 'Constructions',
        'Mensuration', 'Trigonometry', 'Heights and Distances', 'Statistics', 'Probability' ] },
      { id: 'physics', name: 'Physics', icon: P, chapters: [
        'Force, Work, Power and Energy', 'Machines', 'Refraction of Light at Plane Surfaces',
        'Refraction Through a Lens', 'Spectrum', 'Sound', 'Current Electricity', 'Electrical Power and Household Circuits',
        'Electromagnetism', 'Calorimetry', 'Radioactivity' ] },
      { id: 'chemistry', name: 'Chemistry', icon: C, chapters: [
        'Periodic Properties', 'Chemical Bonding', 'Acids, Bases and Salts', 'Analytical Chemistry',
        'Mole Concept and Stoichiometry', 'Electrolysis', 'Metallurgy', 'Study of Compounds: HCl and Ammonia',
        'Nitric Acid and Sulphuric Acid', 'Organic Chemistry' ] },
      { id: 'biology', name: 'Biology', icon: B, chapters: [
        'Cell Cycle and Cell Division', 'Structure of Chromosomes', 'Genetics', 'Absorption by Roots',
        'Transpiration', 'Photosynthesis', 'The Circulatory System', 'The Excretory System', 'The Nervous System',
        'The Endocrine System', 'The Reproductive System', 'Population and Human Evolution', 'Pollution' ] },
      { id: 'histcivics', name: 'History & Civics', icon: H, chapters: [
        'The First War of Independence 1857', 'Growth of Nationalism', 'The Indian National Congress',
        'The Muslim League', 'Mahatma Gandhi and the National Movement', 'The Partition and Independence',
        'The First World War', 'The Rise of Dictatorships', 'The Second World War', 'The United Nations' ] },
      { id: 'geography', name: 'Geography', icon: G, chapters: [
        'Map Study and Interpretation', 'Location and Physical Features of India', 'Climate of India',
        'Soils of India', 'Natural Vegetation', 'Water Resources', 'Minerals and Energy Resources',
        'Agriculture in India', 'Manufacturing Industries', 'Transport and Waste Management' ] }
    ],
    11: [
      { id: 'english', name: 'English', icon: E, chapters: [
        'Reading Comprehension', 'Note-Making and Summarising', 'Grammar and Usage', 'Writing: Article and Report',
        'Writing: Notice and Letters', 'Literature Appreciation' ] },
      { id: 'math', name: 'Mathematics', icon: M, chapters: [
        'Sets and Relations', 'Functions', 'Trigonometry', 'Complex Numbers and Quadratic Equations',
        'Linear Inequations', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series',
        'Straight Lines', 'Conic Sections', 'Introduction to Three-Dimensional Geometry', 'Limits and Derivatives',
        'Statistics', 'Probability' ] },
      { id: 'physics', name: 'Physics', icon: P, chapters: [
        'Units and Measurement', 'Kinematics', 'Laws of Motion', 'Work, Energy and Power',
        'Rotational Motion', 'Gravitation', 'Properties of Matter', 'Thermodynamics', 'Kinetic Theory of Gases',
        'Oscillations and Waves' ] },
      { id: 'chemistry', name: 'Chemistry', icon: C, chapters: [
        'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Periodic Table and Periodicity',
        'Chemical Bonding', 'States of Matter', 'Chemical Thermodynamics', 'Equilibrium', 'Redox Reactions',
        'Basic Principles of Organic Chemistry', 'Hydrocarbons' ] },
      { id: 'biology', name: 'Biology', icon: B, chapters: [
        'Diversity of Living Organisms', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom',
        'Morphology and Anatomy of Plants', 'Structural Organisation in Animals', 'Cell: Structure and Function',
        'Biomolecules', 'Cell Division', 'Plant Physiology', 'Human Physiology' ] }
    ],
    12: [
      { id: 'english', name: 'English', icon: E, chapters: [
        'Reading Comprehension', 'Note-Making', 'Grammar and Usage', 'Writing: Article and Report',
        'Writing: Formal Letters', 'Literature Appreciation' ] },
      { id: 'math', name: 'Mathematics', icon: M, chapters: [
        'Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants',
        'Continuity and Differentiability', 'Applications of Derivatives', 'Integrals', 'Applications of Integrals',
        'Differential Equations', 'Vectors', 'Three-Dimensional Geometry', 'Probability', 'Linear Programming' ] },
      { id: 'physics', name: 'Physics', icon: P, chapters: [
        'Electrostatics', 'Current Electricity', 'Magnetic Effects of Current', 'Electromagnetic Induction',
        'Alternating Current', 'Electromagnetic Waves', 'Ray Optics', 'Wave Optics',
        'Dual Nature of Radiation and Matter', 'Atoms and Nuclei', 'Semiconductor Electronics' ] },
      { id: 'chemistry', name: 'Chemistry', icon: C, chapters: [
        'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'The d- and f-Block Elements',
        'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers',
        'Aldehydes, Ketones and Carboxylic Acids', 'Amines', 'Biomolecules' ] },
      { id: 'biology', name: 'Biology', icon: B, chapters: [
        'Reproduction in Plants', 'Human Reproduction', 'Reproductive Health', 'Principles of Inheritance and Variation',
        'Molecular Basis of Inheritance', 'Evolution', 'Human Health and Disease', 'Microbes in Human Welfare',
        'Biotechnology and Its Applications', 'Organisms and Populations', 'Ecosystem and Biodiversity' ] }
    ]
  };
})();
