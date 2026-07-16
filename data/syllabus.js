/* Inspire Talent Hub — CBSE / NCERT syllabus tree (Grades 6–12).
 * Front-end only: loaded as window.ITH_SYLLABUS.
 * Structure:
 *   boards: [{id, name}]
 *   tree[boardId][grade] = [ { id, name, icon, chapters: [ "Chapter name", ... ] } ]
 * Chapter test questions live in data/study-questions.js, keyed by
 *   board|grade|subjectId|chapterIndex. Chapters without questions yet show a
 *   friendly "coming soon" state, so the tree can be complete before the bank is.
 */
window.ITH_SYLLABUS = {
  boards: [
    { id: 'cbse', name: 'CBSE / NCERT', active: true },
    { id: 'icse', name: 'ICSE', active: false }
  ],
  grades: [6, 7, 8, 9, 10, 11, 12],

  tree: {
    cbse: {
      6: [
        { id: 'math', name: 'Mathematics', icon: 'chart', chapters: [
          'Knowing Our Numbers', 'Whole Numbers', 'Playing with Numbers', 'Basic Geometrical Ideas',
          'Understanding Elementary Shapes', 'Integers', 'Fractions', 'Decimals', 'Data Handling',
          'Mensuration', 'Algebra', 'Ratio and Proportion', 'Symmetry', 'Practical Geometry' ] },
        { id: 'science', name: 'Science', icon: 'star', chapters: [
          'Food: Where Does It Come From?', 'Components of Food', 'Fibre to Fabric', 'Sorting Materials into Groups',
          'Separation of Substances', 'Changes Around Us', 'Getting to Know Plants', 'Body Movements',
          'The Living Organisms and Their Surroundings', 'Motion and Measurement of Distances',
          'Light, Shadows and Reflections', 'Electricity and Circuits', 'Fun with Magnets', 'Water',
          'Air Around Us', 'Garbage In, Garbage Out' ] },
        { id: 'history', name: 'History', icon: 'book', chapters: [
          'What, Where, How and When', 'From Hunting–Gathering to Growing Food', 'In the Earliest Cities',
          'What Books and Burials Tell Us', 'Kingdoms, Kings and an Early Republic', 'New Questions and Ideas',
          'Ashoka, the Emperor Who Gave Up War', 'Vital Villages, Thriving Towns', 'Traders, Kings and Pilgrims',
          'New Empires and Kingdoms', 'Buildings, Paintings and Books' ] },
        { id: 'geography', name: 'Geography', icon: 'globe', chapters: [
          'The Earth in the Solar System', 'Globe: Latitudes and Longitudes', 'Motions of the Earth', 'Maps',
          'Major Domains of the Earth', 'Major Landforms of the Earth', 'Our Country – India',
          'India: Climate, Vegetation and Wildlife' ] },
        { id: 'civics', name: 'Civics', icon: 'users', chapters: [
          'Understanding Diversity', 'Diversity and Discrimination', 'What is Government',
          'Key Elements of a Democratic Government', 'Panchayati Raj', 'Rural Administration',
          'Urban Administration', 'Rural Livelihoods', 'Urban Livelihoods' ] },
        { id: 'english', name: 'English', icon: 'pen', chapters: [
          'Reading Comprehension', 'Grammar: Nouns and Pronouns', 'Grammar: Verbs and Tenses',
          'Grammar: Adjectives and Adverbs', 'Punctuation', 'Vocabulary and Word Meanings',
          'Writing: Notice and Message', 'Writing: Paragraph and Story' ] }
      ],
      7: [
        { id: 'math', name: 'Mathematics', icon: 'chart', chapters: [
          'Integers', 'Fractions and Decimals', 'Data Handling', 'Simple Equations', 'Lines and Angles',
          'The Triangle and Its Properties', 'Congruence of Triangles', 'Comparing Quantities',
          'Rational Numbers', 'Practical Geometry', 'Perimeter and Area', 'Algebraic Expressions',
          'Exponents and Powers', 'Symmetry', 'Visualising Solid Shapes' ] },
        { id: 'science', name: 'Science', icon: 'star', chapters: [
          'Nutrition in Plants', 'Nutrition in Animals', 'Fibre to Fabric', 'Heat', 'Acids, Bases and Salts',
          'Physical and Chemical Changes', 'Weather, Climate and Adaptations', 'Winds, Storms and Cyclones',
          'Soil', 'Respiration in Organisms', 'Transportation in Animals and Plants', 'Reproduction in Plants',
          'Motion and Time', 'Electric Current and Its Effects', 'Light', 'Water: A Precious Resource',
          'Forests: Our Lifeline', 'Wastewater Story' ] },
        { id: 'history', name: 'History', icon: 'book', chapters: [
          'Tracing Changes Through a Thousand Years', 'New Kings and Kingdoms', 'The Delhi Sultans',
          'The Mughal Empire', 'Rulers and Buildings', 'Towns, Traders and Craftspersons',
          'Tribes, Nomads and Settled Communities', 'Devotional Paths to the Divine',
          'The Making of Regional Cultures', 'Eighteenth-Century Political Formations' ] },
        { id: 'geography', name: 'Geography', icon: 'globe', chapters: [
          'Environment', 'Inside Our Earth', 'Our Changing Earth', 'Air', 'Water',
          'Natural Vegetation and Wildlife', 'Human–Environment Interactions', 'Life in the Deserts' ] },
        { id: 'civics', name: 'Civics', icon: 'users', chapters: [
          'On Equality', 'Role of the Government in Health', 'How the State Government Works',
          'Growing Up as Boys and Girls', 'Women Change the World', 'Understanding Media',
          'Markets Around Us', 'A Shirt in the Market' ] },
        { id: 'english', name: 'English', icon: 'pen', chapters: [
          'Reading Comprehension', 'Grammar: Tenses', 'Grammar: Modals', 'Active and Passive Voice',
          'Reported Speech', 'Vocabulary and Idioms', 'Writing: Letter Writing', 'Writing: Essay and Paragraph' ] }
      ],
      8: [
        { id: 'math', name: 'Mathematics', icon: 'chart', chapters: [
          'Rational Numbers', 'Linear Equations in One Variable', 'Understanding Quadrilaterals',
          'Practical Geometry', 'Data Handling', 'Squares and Square Roots', 'Cubes and Cube Roots',
          'Comparing Quantities', 'Algebraic Expressions and Identities', 'Visualising Solid Shapes',
          'Mensuration', 'Exponents and Powers', 'Direct and Inverse Proportions', 'Factorisation',
          'Introduction to Graphs', 'Playing with Numbers' ] },
        { id: 'science', name: 'Science', icon: 'star', chapters: [
          'Crop Production and Management', 'Microorganisms: Friend and Foe', 'Synthetic Fibres and Plastics',
          'Materials: Metals and Non-Metals', 'Coal and Petroleum', 'Combustion and Flame',
          'Conservation of Plants and Animals', 'Cell — Structure and Functions',
          'Reproduction in Animals', 'Reaching the Age of Adolescence', 'Force and Pressure', 'Friction',
          'Sound', 'Chemical Effects of Electric Current', 'Some Natural Phenomena', 'Light',
          'Stars and the Solar System', 'Pollution of Air and Water' ] },
        { id: 'history', name: 'History', icon: 'book', chapters: [
          'How, When and Where', 'From Trade to Territory', 'Ruling the Countryside', 'Tribals, Dikus and the Vision of a Golden Age',
          'When People Rebel: 1857 and After', 'Weavers, Iron Smelters and Factory Owners', 'Civilising the “Native”, Educating the Nation',
          'Women, Caste and Reform', 'The Making of the National Movement', 'India After Independence' ] },
        { id: 'geography', name: 'Geography', icon: 'globe', chapters: [
          'Resources', 'Land, Soil, Water, Natural Vegetation and Wildlife Resources', 'Mineral and Power Resources',
          'Agriculture', 'Industries', 'Human Resources' ] },
        { id: 'civics', name: 'Civics', icon: 'users', chapters: [
          'The Indian Constitution', 'Understanding Secularism', 'Why Do We Need a Parliament?',
          'Understanding Laws', 'Judiciary', 'Understanding Our Criminal Justice System',
          'Understanding Marginalisation', 'Confronting Marginalisation', 'Public Facilities', 'Law and Social Justice' ] },
        { id: 'english', name: 'English', icon: 'pen', chapters: [
          'Reading Comprehension', 'Grammar: Tenses and Clauses', 'Active and Passive Voice',
          'Reported Speech', 'Determiners and Modals', 'Vocabulary and Idioms',
          'Writing: Formal Letters', 'Writing: Story and Essay' ] }
      ],
      9: [
        { id: 'math', name: 'Mathematics', icon: 'chart', chapters: [
          'Number Systems', 'Polynomials', 'Coordinate Geometry', 'Linear Equations in Two Variables',
          'Introduction to Euclid’s Geometry', 'Lines and Angles', 'Triangles', 'Quadrilaterals',
          'Circles', 'Heron’s Formula', 'Surface Areas and Volumes', 'Statistics' ] },
        { id: 'science', name: 'Science', icon: 'star', chapters: [
          'Matter in Our Surroundings', 'Is Matter Around Us Pure?', 'Atoms and Molecules',
          'Structure of the Atom', 'The Fundamental Unit of Life', 'Tissues', 'Motion',
          'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound',
          'Improvement in Food Resources' ] },
        { id: 'history', name: 'History', icon: 'book', chapters: [
          'The French Revolution', 'Socialism in Europe and the Russian Revolution', 'Nazism and the Rise of Hitler',
          'Forest Society and Colonialism', 'Pastoralists in the Modern World' ] },
        { id: 'geography', name: 'Geography', icon: 'globe', chapters: [
          'India — Size and Location', 'Physical Features of India', 'Drainage', 'Climate',
          'Natural Vegetation and Wildlife', 'Population' ] },
        { id: 'polsci', name: 'Political Science', icon: 'users', chapters: [
          'What is Democracy? Why Democracy?', 'Constitutional Design', 'Electoral Politics',
          'Working of Institutions', 'Democratic Rights' ] },
        { id: 'economics', name: 'Economics', icon: 'chart', chapters: [
          'The Story of Village Palampur', 'People as Resource', 'Poverty as a Challenge',
          'Food Security in India' ] },
        { id: 'english', name: 'English', icon: 'pen', chapters: [
          'Reading Comprehension', 'Grammar: Tenses', 'Modals and Determiners', 'Subject–Verb Agreement',
          'Reported Speech', 'Writing: Descriptive Paragraph', 'Writing: Story Writing', 'Writing: Diary Entry' ] }
      ],
      10: [
        { id: 'math', name: 'Mathematics', icon: 'chart', chapters: [
          'Real Numbers', 'Polynomials', 'Pair of Linear Equations in Two Variables', 'Quadratic Equations',
          'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Introduction to Trigonometry',
          'Some Applications of Trigonometry', 'Circles', 'Areas Related to Circles', 'Surface Areas and Volumes',
          'Statistics', 'Probability' ] },
        { id: 'science', name: 'Science', icon: 'star', chapters: [
          'Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals',
          'Carbon and Its Compounds', 'Life Processes', 'Control and Coordination',
          'How Do Organisms Reproduce?', 'Heredity and Evolution', 'Light — Reflection and Refraction',
          'The Human Eye and the Colourful World', 'Electricity', 'Magnetic Effects of Electric Current',
          'Our Environment' ] },
        { id: 'history', name: 'History', icon: 'book', chapters: [
          'The Rise of Nationalism in Europe', 'Nationalism in India', 'The Making of a Global World',
          'The Age of Industrialisation', 'Print Culture and the Modern World' ] },
        { id: 'geography', name: 'Geography', icon: 'globe', chapters: [
          'Resources and Development', 'Forest and Wildlife Resources', 'Water Resources', 'Agriculture',
          'Minerals and Energy Resources', 'Manufacturing Industries', 'Lifelines of National Economy' ] },
        { id: 'polsci', name: 'Political Science', icon: 'users', chapters: [
          'Power-sharing', 'Federalism', 'Gender, Religion and Caste', 'Political Parties',
          'Outcomes of Democracy' ] },
        { id: 'economics', name: 'Economics', icon: 'chart', chapters: [
          'Development', 'Sectors of the Indian Economy', 'Money and Credit', 'Globalisation and the Indian Economy',
          'Consumer Rights' ] },
        { id: 'english', name: 'English', icon: 'pen', chapters: [
          'Reading Comprehension', 'Grammar: Tenses', 'Modals', 'Subject–Verb Concord', 'Reported Speech',
          'Determiners', 'Writing: Formal Letter', 'Writing: Analytical Paragraph' ] }
      ],
      11: [
        { id: 'physics', name: 'Physics', icon: 'star', chapters: [
          'Units and Measurements', 'Motion in a Straight Line', 'Motion in a Plane', 'Laws of Motion',
          'Work, Energy and Power', 'System of Particles and Rotational Motion', 'Gravitation',
          'Mechanical Properties of Solids', 'Mechanical Properties of Fluids', 'Thermal Properties of Matter',
          'Thermodynamics', 'Kinetic Theory', 'Oscillations', 'Waves' ] },
        { id: 'chemistry', name: 'Chemistry', icon: 'globe', chapters: [
          'Some Basic Concepts of Chemistry', 'Structure of Atom', 'Classification of Elements and Periodicity',
          'Chemical Bonding and Molecular Structure', 'Thermodynamics', 'Equilibrium', 'Redox Reactions',
          'Organic Chemistry — Some Basic Principles and Techniques', 'Hydrocarbons' ] },
        { id: 'biology', name: 'Biology', icon: 'book', chapters: [
          'The Living World', 'Biological Classification', 'Plant Kingdom', 'Animal Kingdom',
          'Morphology of Flowering Plants', 'Anatomy of Flowering Plants', 'Structural Organisation in Animals',
          'Cell — The Unit of Life', 'Biomolecules', 'Cell Cycle and Cell Division', 'Photosynthesis in Higher Plants',
          'Respiration in Plants', 'Plant Growth and Development', 'Breathing and Exchange of Gases',
          'Body Fluids and Circulation', 'Excretory Products and Their Elimination', 'Locomotion and Movement',
          'Neural Control and Coordination', 'Chemical Coordination and Integration' ] },
        { id: 'math', name: 'Mathematics', icon: 'chart', chapters: [
          'Sets', 'Relations and Functions', 'Trigonometric Functions', 'Complex Numbers and Quadratic Equations',
          'Linear Inequalities', 'Permutations and Combinations', 'Binomial Theorem', 'Sequences and Series',
          'Straight Lines', 'Conic Sections', 'Introduction to Three-Dimensional Geometry', 'Limits and Derivatives',
          'Statistics', 'Probability' ] },
        { id: 'english', name: 'English', icon: 'pen', chapters: [
          'Reading Comprehension', 'Note-Making and Summarising', 'Grammar: Tenses and Voice',
          'Reported Speech', 'Writing: Notice and Advertisement', 'Writing: Report and Article' ] }
      ],
      12: [
        { id: 'physics', name: 'Physics', icon: 'star', chapters: [
          'Electric Charges and Fields', 'Electrostatic Potential and Capacitance', 'Current Electricity',
          'Moving Charges and Magnetism', 'Magnetism and Matter', 'Electromagnetic Induction',
          'Alternating Current', 'Electromagnetic Waves', 'Ray Optics and Optical Instruments', 'Wave Optics',
          'Dual Nature of Radiation and Matter', 'Atoms', 'Nuclei', 'Semiconductor Electronics' ] },
        { id: 'chemistry', name: 'Chemistry', icon: 'globe', chapters: [
          'Solutions', 'Electrochemistry', 'Chemical Kinetics', 'The d- and f-Block Elements',
          'Coordination Compounds', 'Haloalkanes and Haloarenes', 'Alcohols, Phenols and Ethers',
          'Aldehydes, Ketones and Carboxylic Acids', 'Amines', 'Biomolecules' ] },
        { id: 'biology', name: 'Biology', icon: 'book', chapters: [
          'Sexual Reproduction in Flowering Plants', 'Human Reproduction', 'Reproductive Health',
          'Principles of Inheritance and Variation', 'Molecular Basis of Inheritance', 'Evolution',
          'Human Health and Disease', 'Microbes in Human Welfare', 'Biotechnology — Principles and Processes',
          'Biotechnology and Its Applications', 'Organisms and Populations', 'Ecosystem',
          'Biodiversity and Conservation' ] },
        { id: 'math', name: 'Mathematics', icon: 'chart', chapters: [
          'Relations and Functions', 'Inverse Trigonometric Functions', 'Matrices', 'Determinants',
          'Continuity and Differentiability', 'Application of Derivatives', 'Integrals',
          'Application of Integrals', 'Differential Equations', 'Vector Algebra',
          'Three-Dimensional Geometry', 'Linear Programming', 'Probability' ] },
        { id: 'english', name: 'English', icon: 'pen', chapters: [
          'Reading Comprehension', 'Note-Making', 'Grammar: Tenses and Voice', 'Reported Speech',
          'Writing: Notice', 'Writing: Letters (Formal)', 'Writing: Article and Report' ] }
      ]
    }
  }
};
