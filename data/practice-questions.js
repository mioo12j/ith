/* Inspire Talent Hub — Practice Arena question bank.
 * Front-end only: loaded directly by the browser as window.ITH_PRACTICE.
 * Each question: { c: categoryId, d: difficulty (1 easy, 2 medium, 3 hard),
 *   q: question, o: [options], a: correct option index, e: explanation }.
 * Extend freely — the Practice Arena picks from whatever is here.
 */
window.ITH_PRACTICE = {
  categories: [
    { id: 'gk',      name: 'General Knowledge', icon: 'globe', blurb: 'India & the world, current-affairs-style general awareness.' },
    { id: 'math',    name: 'Mathematics',       icon: 'chart', blurb: 'Arithmetic, algebra, geometry and quick reasoning.' },
    { id: 'science', name: 'Science & STEM',    icon: 'star',  blurb: 'Physics, chemistry, biology and everyday science.' },
    { id: 'logic',   name: 'Logical Reasoning', icon: 'grad',  blurb: 'Patterns, sequences and lateral thinking.' },
    { id: 'english', name: 'English & Verbal',  icon: 'pen',   blurb: 'Vocabulary, grammar and comprehension.' },
    { id: 'cs',      name: 'Computer Science',  icon: 'lock',  blurb: 'Computing basics, logic and how technology works.' }
  ],
  questions: [
    /* ---------------- General Knowledge ---------------- */
    { c:'gk', d:1, q:'What is the capital of India?', o:['Mumbai','New Delhi','Kolkata','Chennai'], a:1, e:'New Delhi is the capital of India; Mumbai is the financial capital.' },
    { c:'gk', d:1, q:'Which is the largest planet in our solar system?', o:['Saturn','Earth','Jupiter','Neptune'], a:2, e:'Jupiter is the largest planet, with a mass greater than all other planets combined.' },
    { c:'gk', d:1, q:'The Taj Mahal is located in which Indian city?', o:['Jaipur','Agra','Delhi','Lucknow'], a:1, e:'The Taj Mahal was built by Shah Jahan in Agra, on the bank of the Yamuna.' },
    { c:'gk', d:1, q:'How many continents are there on Earth?', o:['5','6','7','8'], a:2, e:'There are seven continents: Asia, Africa, North America, South America, Antarctica, Europe and Australia.' },
    { c:'gk', d:2, q:'Who was the first Prime Minister of independent India?', o:['Sardar Patel','Jawaharlal Nehru','Mahatma Gandhi','Dr. Rajendra Prasad'], a:1, e:'Jawaharlal Nehru served as India’s first Prime Minister from 1947 to 1964.' },
    { c:'gk', d:2, q:'Which river is the longest in the world?', o:['Amazon','Nile','Ganga','Yangtze'], a:1, e:'The Nile in Africa is generally regarded as the longest river, though the Amazon is close and carries far more water.' },
    { c:'gk', d:2, q:'The currency of Japan is the:', o:['Won','Yuan','Yen','Ringgit'], a:2, e:'Japan’s currency is the yen; the won is Korean and the yuan is Chinese.' },
    { c:'gk', d:2, q:'Which gas do plants primarily absorb from the atmosphere for photosynthesis?', o:['Oxygen','Nitrogen','Carbon dioxide','Hydrogen'], a:2, e:'Plants absorb carbon dioxide and release oxygen during photosynthesis.' },
    { c:'gk', d:3, q:'In which year did India adopt its Constitution (it came into effect)?', o:['1947','1950','1952','1935'], a:1, e:'The Constitution of India came into effect on 26 January 1950, celebrated as Republic Day.' },
    { c:'gk', d:3, q:'Mount Everest lies on the border of Nepal and which country?', o:['India','China','Bhutan','Pakistan'], a:1, e:'Everest sits on the Nepal–China (Tibet) border; its Tibetan name is Chomolungma.' },
    { c:'gk', d:3, q:'Which Indian scientist won the Nobel Prize in Physics in 1930?', o:['Homi Bhabha','C. V. Raman','S. Chandrasekhar','Satyendra Nath Bose'], a:1, e:'C. V. Raman won the 1930 Nobel Prize in Physics for the Raman effect.' },
    { c:'gk', d:3, q:'The headquarters of the United Nations is located in:', o:['Geneva','Paris','New York City','Vienna'], a:2, e:'The UN headquarters is in New York City, though it has major offices in Geneva and Vienna too.' },

    /* ---------------- Mathematics ---------------- */
    { c:'math', d:1, q:'What is 15 + 27?', o:['32','42','41','52'], a:1, e:'15 + 27 = 42.' },
    { c:'math', d:1, q:'What is 8 × 7?', o:['54','56','48','63'], a:1, e:'8 × 7 = 56.' },
    { c:'math', d:1, q:'What is 25% of 200?', o:['25','40','50','75'], a:2, e:'25% of 200 = 0.25 × 200 = 50.' },
    { c:'math', d:1, q:'How many sides does a hexagon have?', o:['5','6','7','8'], a:1, e:'A hexagon has six sides.' },
    { c:'math', d:2, q:'Solve for x: 3x + 5 = 20', o:['3','5','15','45'], a:1, e:'3x = 20 − 5 = 15, so x = 5.' },
    { c:'math', d:2, q:'What is the area of a rectangle with length 8 and width 5?', o:['13','26','40','45'], a:2, e:'Area = length × width = 8 × 5 = 40.' },
    { c:'math', d:2, q:'What is the next number: 2, 4, 8, 16, ...?', o:['20','24','32','30'], a:2, e:'Each term doubles: 16 × 2 = 32.' },
    { c:'math', d:2, q:'The average of 10, 20 and 30 is:', o:['15','20','25','30'], a:1, e:'(10 + 20 + 30) ÷ 3 = 60 ÷ 3 = 20.' },
    { c:'math', d:3, q:'What is the value of 7! ÷ 5!?', o:['2','7','42','35'], a:2, e:'7!/5! = 7 × 6 = 42 (the 5! cancels).' },
    { c:'math', d:3, q:'If a triangle has angles 90° and 45°, the third angle is:', o:['30°','45°','60°','90°'], a:1, e:'Angles of a triangle sum to 180°: 180 − 90 − 45 = 45°.' },
    { c:'math', d:3, q:'What is the square root of 144?', o:['11','12','13','14'], a:1, e:'12 × 12 = 144, so √144 = 12.' },
    { c:'math', d:3, q:'A shirt costs ₹800 after a 20% discount. What was the original price?', o:['₹960','₹1000','₹1020','₹860'], a:1, e:'800 is 80% of the original, so original = 800 ÷ 0.8 = ₹1000.' },

    /* ---------------- Science ---------------- */
    { c:'science', d:1, q:'What is the chemical symbol for water?', o:['O2','H2O','CO2','NaCl'], a:1, e:'Water is H2O — two hydrogen atoms and one oxygen atom.' },
    { c:'science', d:1, q:'Which organ pumps blood around the human body?', o:['Lungs','Liver','Heart','Kidney'], a:2, e:'The heart pumps blood through the circulatory system.' },
    { c:'science', d:1, q:'What force pulls objects towards the Earth?', o:['Friction','Magnetism','Gravity','Tension'], a:2, e:'Gravity is the force of attraction that pulls objects toward the Earth.' },
    { c:'science', d:1, q:'Plants make their food using sunlight in a process called:', o:['Respiration','Photosynthesis','Digestion','Evaporation'], a:1, e:'Photosynthesis converts sunlight, water and carbon dioxide into glucose and oxygen.' },
    { c:'science', d:2, q:'What is the chemical symbol for gold?', o:['Go','Gd','Au','Ag'], a:2, e:'Gold’s symbol is Au, from the Latin “aurum”. Ag is silver.' },
    { c:'science', d:2, q:'How many bones are there in the adult human body?', o:['186','206','226','246'], a:1, e:'The adult human body has 206 bones (babies are born with more, which fuse over time).' },
    { c:'science', d:2, q:'Which gas makes up the largest proportion of Earth’s atmosphere?', o:['Oxygen','Carbon dioxide','Nitrogen','Argon'], a:2, e:'Nitrogen makes up about 78% of the atmosphere; oxygen is about 21%.' },
    { c:'science', d:2, q:'The speed of light is approximately:', o:['300 km/s','3,000 km/s','300,000 km/s','30,000 km/s'], a:2, e:'Light travels at about 300,000 kilometres per second in a vacuum.' },
    { c:'science', d:3, q:'What is the powerhouse of the cell?', o:['Nucleus','Ribosome','Mitochondrion','Chloroplast'], a:2, e:'The mitochondrion produces energy (ATP) and is called the powerhouse of the cell.' },
    { c:'science', d:3, q:'Which scientist proposed the three laws of motion?', o:['Albert Einstein','Isaac Newton','Galileo Galilei','Niels Bohr'], a:1, e:'Isaac Newton formulated the three laws of motion in his Principia (1687).' },
    { c:'science', d:3, q:'What is the pH value of a neutral solution at 25°C?', o:['0','7','10','14'], a:1, e:'A neutral solution has a pH of 7; below 7 is acidic and above 7 is basic.' },
    { c:'science', d:3, q:'The element with atomic number 1 is:', o:['Helium','Oxygen','Hydrogen','Carbon'], a:2, e:'Hydrogen has atomic number 1 — a single proton.' },

    /* ---------------- Logical Reasoning ---------------- */
    { c:'logic', d:1, q:'Which number comes next: 1, 3, 5, 7, ...?', o:['8','9','10','11'], a:1, e:'These are odd numbers increasing by 2, so the next is 9.' },
    { c:'logic', d:1, q:'If all cats are animals, and Tom is a cat, then Tom is:', o:['a dog','an animal','a plant','not sure'], a:1, e:'Since all cats are animals and Tom is a cat, Tom must be an animal.' },
    { c:'logic', d:1, q:'Find the odd one out: Apple, Banana, Carrot, Mango', o:['Apple','Banana','Carrot','Mango'], a:2, e:'Carrot is a vegetable; the rest are fruits.' },
    { c:'logic', d:1, q:'Complete: Monday, Wednesday, Friday, ...?', o:['Saturday','Sunday','Tuesday','Thursday'], a:1, e:'The pattern skips a day each time, so after Friday comes Sunday.' },
    { c:'logic', d:2, q:'Which number completes the pattern: 2, 6, 12, 20, ...?', o:['24','28','30','32'], a:2, e:'Differences are 4, 6, 8, then 10: 20 + 10 = 30.' },
    { c:'logic', d:2, q:'If CAT is coded as 3-1-20, how is DOG coded?', o:['4-15-7','4-14-7','3-15-7','4-15-8'], a:0, e:'Each letter maps to its position: D=4, O=15, G=7.' },
    { c:'logic', d:2, q:'A is B’s sister. B is C’s father. How is A related to C?', o:['Mother','Aunt','Sister','Grandmother'], a:1, e:'A is the sister of C’s father, so A is C’s aunt.' },
    { c:'logic', d:2, q:'Which shape logically continues: circle, square, circle, square, ...?', o:['circle','square','triangle','star'], a:0, e:'The pattern alternates, so after square comes circle.' },
    { c:'logic', d:3, q:'Pointing to a photo, Reena says “He is the son of my grandfather’s only son.” Who is he to Reena?', o:['Father','Brother','Uncle','Cousin'], a:1, e:'Her grandfather’s only son is her father; his son is therefore her brother.' },
    { c:'logic', d:3, q:'Find the next term: 1, 4, 9, 16, 25, ...?', o:['30','36','49','40'], a:1, e:'These are perfect squares: 6² = 36.' },
    { c:'logic', d:3, q:'If in a certain code LAMP = MBNQ, then how is CODE written?', o:['DPEF','DPEG','CPEF','DPFF'], a:0, e:'Each letter shifts forward by one: C→D, O→P, D→E, E→F.' },
    { c:'logic', d:3, q:'Five people finish a race. Anil beats Bala. Chetan beats Anil. Bala beats Deep. Who is likely last of these four?', o:['Anil','Bala','Chetan','Deep'], a:3, e:'Order so far: Chetan > Anil > Bala > Deep, so Deep is last.' },

    /* ---------------- English & Verbal ---------------- */
    { c:'english', d:1, q:'Choose the correct spelling:', o:['Recieve','Receive','Receeve','Receve'], a:1, e:'The rule “i before e except after c” gives “receive”.' },
    { c:'english', d:1, q:'What is the opposite (antonym) of “happy”?', o:['Joyful','Sad','Cheerful','Glad'], a:1, e:'“Sad” is the antonym of “happy”; the others are synonyms.' },
    { c:'english', d:1, q:'Which word is a noun?', o:['Quickly','Beautiful','Freedom','Run'], a:2, e:'“Freedom” is a noun (a thing/idea). “Run” here acts as a verb.' },
    { c:'english', d:1, q:'Complete: She ___ to school every day.', o:['go','goes','going','gone'], a:1, e:'With the singular subject “she”, the correct present tense is “goes”.' },
    { c:'english', d:2, q:'Choose the synonym of “abundant”:', o:['Scarce','Plentiful','Empty','Rare'], a:1, e:'“Abundant” means existing in large quantities — “plentiful”.' },
    { c:'english', d:2, q:'Identify the correctly punctuated sentence:', o:['Its a lovely day.','It’s a lovely day.','Its’ a lovely day.','It is’ a lovely day.'], a:1, e:'“It’s” is the contraction of “it is”; “its” is possessive.' },
    { c:'english', d:2, q:'What is the plural of “child”?', o:['Childs','Childes','Children','Childrens'], a:2, e:'“Child” has the irregular plural “children”.' },
    { c:'english', d:2, q:'Choose the correct word: The team played ___ than last week.', o:['good','better','best','well'], a:1, e:'“Better” is the comparative form used when comparing two things.' },
    { c:'english', d:3, q:'“A blessing in disguise” means:', o:['A hidden threat','A good thing that seemed bad at first','A disguise','An unlucky event'], a:1, e:'The idiom means something that seems bad but turns out to be beneficial.' },
    { c:'english', d:3, q:'Which sentence is in the passive voice?', o:['The chef cooked the meal.','The meal was cooked by the chef.','The chef is cooking.','The chef will cook.'], a:1, e:'In the passive voice the subject receives the action: “The meal was cooked…”.' },
    { c:'english', d:3, q:'Choose the word that means “to make less severe”:', o:['Aggravate','Alleviate','Accumulate','Allocate'], a:1, e:'“Alleviate” means to ease or make less severe.' },
    { c:'english', d:3, q:'Identify the metaphor:', o:['She is as brave as a lion.','Time is a thief.','He ran quickly.','The sky was blue.'], a:1, e:'“Time is a thief” directly equates two unlike things — a metaphor (no “like/as”).' },

    /* ---------------- Computer Science ---------------- */
    { c:'cs', d:1, q:'What does CPU stand for?', o:['Central Process Unit','Central Processing Unit','Computer Personal Unit','Central Peripheral Unit'], a:1, e:'CPU stands for Central Processing Unit — the “brain” of a computer.' },
    { c:'cs', d:1, q:'Which of these is an input device?', o:['Monitor','Printer','Keyboard','Speaker'], a:2, e:'A keyboard is an input device; monitors, printers and speakers are outputs.' },
    { c:'cs', d:1, q:'How many bits are there in one byte?', o:['4','8','16','32'], a:1, e:'One byte consists of 8 bits.' },
    { c:'cs', d:1, q:'What does “www” stand for?', o:['World Wide Web','Web World Wide','Wide Web World','World Web Wide'], a:0, e:'WWW stands for the World Wide Web.' },
    { c:'cs', d:2, q:'Which number system do computers fundamentally use?', o:['Decimal','Binary','Octal','Roman'], a:1, e:'Computers use the binary system — just 0s and 1s.' },
    { c:'cs', d:2, q:'In binary, what is the decimal number 5?', o:['100','101','110','111'], a:1, e:'5 = 4 + 1 = 101 in binary.' },
    { c:'cs', d:2, q:'Which of these is a programming language?', o:['HTTP','Python','HTML tag','USB'], a:1, e:'Python is a programming language; HTTP is a protocol and USB is hardware.' },
    { c:'cs', d:2, q:'What does “bug” mean in programming?', o:['A feature','An error or fault','A type of file','A fast program'], a:1, e:'A bug is an error or fault in a program that causes it to behave incorrectly.' },
    { c:'cs', d:3, q:'What does an “algorithm” mean?', o:['A computer part','A step-by-step procedure to solve a problem','A programming language','A type of memory'], a:1, e:'An algorithm is a finite, step-by-step set of instructions to solve a problem.' },
    { c:'cs', d:3, q:'Which data structure works on “Last In, First Out” (LIFO)?', o:['Queue','Stack','Array','Tree'], a:1, e:'A stack is LIFO — the last item pushed is the first popped. A queue is FIFO.' },
    { c:'cs', d:3, q:'What does “RAM” stand for?', o:['Read Access Memory','Random Access Memory','Rapid Action Memory','Run And Manage'], a:1, e:'RAM is Random Access Memory — fast, temporary working memory.' },
    { c:'cs', d:3, q:'In HTML, which tag creates a hyperlink?', o:['<link>','<a>','<href>','<url>'], a:1, e:'The <a> (anchor) tag creates hyperlinks, using its href attribute.' }
  ]
};
