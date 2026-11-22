const entry = (name, km, aliases = []) => ({ name, km, aliases });
const list = (names, km) => names.split('|').map(name => entry(name, km));
const question = (id, title, prompt, detail, answers) => ({ id, title, prompt, detail, answers });

const QUESTIONS = [
  {
    id: 'capitals',
    prompt: 'Name a national capital city.',
    answers: worldCapitals.map(([country,name,...aliases],index)=>({
      ...entry(name,(index+1)*10,aliases),country
    }))
  },
  question('planets', 'Space cadet', 'Name a planet in our solar system.', 'One of the eight planets. Sorry, Pluto.', [entry('Earth', 10), entry('Mars', 20), entry('Jupiter', 30), entry('Saturn', 40), entry('Venus', 60), entry('Mercury', 80), entry('Neptune', 100), entry('Uranus', 100)]),
  question('moons', 'Moon money', 'Name one of Jupiter’s four Galilean moons.', 'The four large moons discovered in 1610.', [entry('Europa', 10), entry('Io', 40), entry('Ganymede', 80), entry('Callisto', 100)]),
  question('chess', 'Opening move', 'Name a type of chess piece.', 'The six standard pieces. Singular or plural.', [entry('King', 10, ['kings']), entry('Queen', 20, ['queens']), entry('Pawn', 30, ['pawns']), entry('Knight', 40, ['knights', 'horse']), entry('Bishop', 80, ['bishops']), entry('Rook', 100, ['rooks', 'castle'])]),
  question('greek', 'Greek getaway', 'Name a letter of the Greek alphabet.', 'The modern 24-letter alphabet. English spellings.', [...list('Alpha|Beta|Gamma|Delta', 10), ...list('Epsilon|Zeta|Theta|Lambda|Sigma|Omega|Pi', 40), ...list('Eta|Iota|Kappa|Mu|Nu|Xi|Omicron|Rho|Tau|Upsilon|Phi|Chi|Psi', 100)]),
  question('rainbow', 'Color job', 'Name one of the seven traditional rainbow colors.', 'Think ROY G. BIV.', [entry('Red', 10), entry('Orange', 30), entry('Yellow', 40), entry('Green', 40), entry('Blue', 20), entry('Indigo', 100), entry('Violet', 80)]),
  question('noble', 'Noble intentions', 'Name a noble gas.', 'Group 18 of the periodic table. Element names or symbols.', [entry('Helium', 10, ['He']), entry('Neon', 20, ['Ne']), entry('Argon', 30, ['Ar']), entry('Krypton', 40, ['Kr']), entry('Xenon', 60, ['Xe']), entry('Radon', 80, ['Rn']), entry('Oganesson', 100, ['Og'])]),
  question('continents', 'World tour', 'Name a continent.', 'Using the seven-continent model. Australia or Oceania accepted.', [entry('Europe', 10), entry('Asia', 20), entry('Africa', 30), entry('North America', 40), entry('South America', 60), entry('Australia', 80, ['Oceania']), entry('Antarctica', 100)]),
  question('borders', 'French connection', 'Name a country that borders France, including its overseas territories.', 'Include land borders in Europe and overseas.', [entry('Spain', 10), entry('Germany', 10), entry('Italy', 20), entry('Belgium', 40), entry('Switzerland', 60), entry('Luxembourg', 80), entry('Monaco', 100), entry('Andorra', 100), entry('Brazil', 100), entry('Suriname', 100), entry('Netherlands', 100, ['Sint Maarten', 'Holland', 'The Netherlands'])]),
  question('oceans', 'Ocean’s five', 'Name one of the world’s five oceans.', 'The word “ocean” is optional.', [entry('Pacific', 10, ['Pacific Ocean']), entry('Atlantic', 20, ['Atlantic Ocean']), entry('Indian', 40, ['Indian Ocean']), entry('Arctic', 80, ['Arctic Ocean']), entry('Southern', 100, ['Southern Ocean', 'Antarctic Ocean', 'Antarctic'])]),
  question('dwarfs', 'Small-time giants', 'Name one of the five IAU-recognized dwarf planets.', 'The five named in the IAU’s established list.', [entry('Pluto', 10), entry('Ceres', 40), entry('Eris', 60), entry('Haumea', 80), entry('Makemake', 100)]),
  question('zodiac', 'Written in the stars', 'Name a Western zodiac sign.', 'The twelve traditional astrological signs.', [...list('Aries|Leo|Gemini|Scorpio', 10), ...list('Taurus|Virgo|Cancer|Libra|Sagittarius', 40), ...list('Capricorn|Aquarius|Pisces', 100)]),
  question('si', 'By the measure', 'Name an SI base unit.', 'One of seven. Unit names or symbols, not quantities.', [entry('Metre', 10, ['meter', 'm']), entry('Kilogram', 20, ['kg']), entry('Second', 20, ['s']), entry('Ampere', 40, ['amp', 'a']), entry('Kelvin', 60, ['k']), entry('Mole', 80, ['mol']), entry('Candela', 100, ['cd'])]),
  question('cards', 'Card sharp', 'Name a suit in a standard French-suited deck.', 'One of the four familiar playing-card suits.', [entry('Hearts', 10, ['heart']), entry('Spades', 40, ['spade']), entry('Diamonds', 80, ['diamond']), entry('Clubs', 100, ['club'])]),
  question('wonders', 'Ancient loot', 'Name one of the Seven Wonders of the Ancient World.', 'The ancient list. Short landmark names are accepted.', [entry('Great Pyramid of Giza', 10, ['Great Pyramid', 'Pyramid of Giza', 'Pyramids of Giza', 'Giza Pyramid', 'Giza Pyramids']), entry('Hanging Gardens of Babylon', 20, ['Hanging Gardens']), entry('Colossus of Rhodes', 30, ['Colossus']), entry('Lighthouse of Alexandria', 40, ['Pharos', 'Pharos of Alexandria']), entry('Temple of Artemis', 60, ['Temple of Artemis at Ephesus']), entry('Statue of Zeus at Olympia', 80, ['Statue of Zeus']), entry('Mausoleum at Halicarnassus', 100, ['Mausoleum of Halicarnassus', 'Mausoleum'])]),
  question('vowels', 'Letter of the law', 'Name one of the five standard English vowel letters.', 'One letter. We’re leaving Y out of this job.', [entry('A', 10), entry('E', 20), entry('I', 40), entry('O', 60), entry('U', 100)]),
  question('roman', 'Roman riches', 'Name a Roman numeral symbol.', 'One of the seven single-letter symbols.', [entry('I', 10), entry('V', 20), entry('X', 30), entry('L', 60), entry('C', 80), entry('D', 100), entry('M', 80)]),
  question('week', 'Working the weekend', 'Name a day of the week.', 'English names, including the weekend.', [entry('Monday', 10, ['Mon']), entry('Tuesday', 80, ['Tue', 'Tues']), entry('Wednesday', 60, ['Wed']), entry('Thursday', 100, ['Thu', 'Thurs']), entry('Friday', 20, ['Fri']), entry('Saturday', 30, ['Sat']), entry('Sunday', 40, ['Sun'])]),
  question('g7', 'International job', 'Name a country in the Group of Seven (G7).', 'The seven member countries. The EU is not a country.', [entry('United States', 10, ['USA', 'US', 'United States of America', 'America']), entry('United Kingdom', 20, ['UK', 'Britain', 'Great Britain']), entry('Germany', 30), entry('Japan', 40), entry('France', 60), entry('Italy', 80), entry('Canada', 100)]),
  question('seasons', 'Seasoned thief', 'Name one of the four temperate seasons.', 'Either British or American English is fine.', [entry('Summer', 10), entry('Winter', 40), entry('Spring', 80), entry('Autumn', 100, ['Fall'])]),
  question('strings', 'Pulling strings', 'Name an open string on a standard-tuned six-string guitar.', 'A single note letter. Standard tuning only.', [entry('E', 10), entry('A', 30), entry('D', 60), entry('G', 80), entry('B', 100)]),
  {
    id: "great-lakes",
    prompt: "Name one of the five Great Lakes.",
    strip: /\b(?:lake)s?\b/gi,
    answers: [
      entry("Superior", 10),
      entry("Michigan", 10),
      entry("Erie", 30),
      entry("Ontario", 60),
      entry("Huron", 100)
    ]
  },
  {
    id: "snow-white",
    prompt: "Name one of the seven dwarfs in Disney's Snow White.",
    answers: [
      entry("Dopey", 10),
      entry("Grumpy", 10),
      entry("Sleepy", 30),
      entry("Happy", 30),
      entry("Sneezy", 40),
      entry("Doc", 80),
      entry("Bashful", 100)
    ]
  },
  {
    id: "long-months",
    prompt: "Name a month that has 31 days.",
    answers: [
      entry("January", 10, ["Jan"]),
      entry("December", 10, ["Dec"]),
      entry("July", 30, ["Jul"]),
      entry("August", 30, ["Aug"]),
      entry("March", 60, ["Mar"]),
      entry("May", 60),
      entry("October", 100, ["Oct"])
    ]
  },
  {
    id: "states-m",
    prompt: "Name a US state that begins with the letter M.",
    answers: [
      entry("Michigan", 10),
      entry("Massachusetts", 30),
      entry("Minnesota", 30),
      entry("Mississippi", 30),
      entry("Maine", 40),
      entry("Maryland", 40),
      entry("Missouri", 80),
      entry("Montana", 100)
    ]
  },
  {
    id: "rushmore",
    prompt: "Name a president carved into Mount Rushmore.",
    answers: [
      entry("George Washington", 10, ["Washington"]),
      entry("Abraham Lincoln", 10, ["Lincoln","Abe Lincoln"]),
      entry("Thomas Jefferson", 40, ["Jefferson"]),
      entry("Theodore Roosevelt", 100, ["Roosevelt","Teddy Roosevelt","Teddy"])
    ]
  },
  {
    id: "hogwarts",
    prompt: "Name a Hogwarts house.",
    answers: [
      entry("Gryffindor", 10),
      entry("Slytherin", 30),
      entry("Ravenclaw", 60),
      entry("Hufflepuff", 100)
    ]
  },
  {
    id: "tastes",
    prompt: "Name one of the five basic tastes.",
    answers: [
      entry("Sweet", 10, ["Sweetness"]),
      entry("Salty", 30, ["Salt","Saltiness"]),
      entry("Sour", 30, ["Sourness"]),
      entry("Bitter", 60, ["Bitterness"]),
      entry("Umami", 100, ["Savoury","Savory"])
    ]
  },
  {
    id: "olympic-rings",
    prompt: "Name a colour of the Olympic rings.",
    blocked: ["white"],
    answers: [
      entry("Blue", 10),
      entry("Red", 10),
      entry("Yellow", 30),
      entry("Green", 60),
      entry("Black", 100)
    ]
  },
  {
    id: "spice-girls",
    prompt: "Name a Spice Girl.",
    strip: /\b(?:spice)s?\b/gi,
    blocked: ["mel","melanie"],
    answers: [
      entry("Posh Spice", 10, ["Victoria Beckham","Victoria","Victoria Adams"]),
      entry("Baby Spice", 10, ["Emma Bunton","Emma"]),
      entry("Ginger Spice", 30, ["Geri Halliwell","Geri","Geri Horner"]),
      entry("Scary Spice", 60, ["Mel B","Melanie Brown","Melanie B"]),
      entry("Sporty Spice", 100, ["Mel C","Melanie Chisholm","Melanie C"])
    ]
  },
  {
    id: "simpsons",
    prompt: "Name one of the five Simpsons who live at 742 Evergreen Terrace.",
    strip: /\b(?:simpson)s?\b/gi,
    answers: [
      entry("Homer", 10),
      entry("Bart", 10),
      entry("Marge", 30),
      entry("Lisa", 60),
      entry("Maggie", 100)
    ]
  },
  {
    id: "grand-slams",
    prompt: "Name a tennis Grand Slam tournament.",
    answers: [
      entry("Wimbledon", 10),
      entry("US Open", 30, ["United States Open"]),
      entry("French Open", 60, ["Roland Garros"]),
      entry("Australian Open", 100)
    ]
  },
  {
    id: "chinese-zodiac",
    prompt: "Name an animal of the Chinese zodiac.",
    answers: [
      entry("Dragon", 10),
      entry("Tiger", 30),
      entry("Monkey", 30),
      entry("Dog", 30),
      entry("Snake", 30),
      entry("Horse", 30),
      entry("Rat", 40, ["Mouse"]),
      entry("Rabbit", 40, ["Hare"]),
      entry("Pig", 40, ["Boar"]),
      entry("Ox", 80, ["Cow","Buffalo","Bull"]),
      entry("Goat", 80, ["Sheep","Ram"]),
      entry("Rooster", 100, ["Chicken","Cock"])
    ]
  },
  {
    id: "friends",
    prompt: "Name one of the six main friends in Friends.",
    answers: [
      entry("Rachel", 10, ["Rachel Green"]),
      entry("Ross", 10, ["Ross Geller"]),
      entry("Joey", 30, ["Joey Tribbiani"]),
      entry("Chandler", 60, ["Chandler Bing"]),
      entry("Monica", 60, ["Monica Geller"]),
      entry("Phoebe", 100, ["Phoebe Buffay"])
    ]
  },
  {
    id: "deadly-sins",
    prompt: "Name one of the seven deadly sins.",
    answers: [
      entry("Greed", 10, ["Avarice"]),
      entry("Lust", 10),
      entry("Pride", 30, ["Vanity"]),
      entry("Envy", 30, ["Jealousy"]),
      entry("Gluttony", 60),
      entry("Wrath", 60, ["Anger","Rage"]),
      entry("Sloth", 100, ["Laziness"])
    ]
  },
  {
    id: "reindeer",
    prompt: "Name one of Santa's nine reindeer.",
    answers: [
      entry("Rudolph", 10),
      entry("Dancer", 30),
      entry("Prancer", 30),
      entry("Comet", 30),
      entry("Dasher", 40),
      entry("Vixen", 40),
      entry("Cupid", 40),
      entry("Blitzen", 80, ["Blixem"]),
      entry("Donner", 100, ["Donder","Dunder"])
    ]
  },
  {
    id: "pacific-states",
    prompt: "Name a US state with a Pacific Ocean coastline.",
    answers: [
      entry("California", 10),
      entry("Hawaii", 30),
      entry("Washington", 30),
      entry("Oregon", 60),
      entry("Alaska", 100)
    ]
  },
  {
    id: "boroughs",
    prompt: "Name one of New York City's five boroughs.",
    answers: [
      entry("Manhattan", 10),
      entry("Brooklyn", 10),
      entry("Queens", 30),
      entry("The Bronx", 60, ["Bronx"]),
      entry("Staten Island", 100)
    ]
  },
  {
    id: "mexico-states",
    prompt: "Name a US state that borders Mexico.",
    answers: [
      entry("Texas", 10),
      entry("California", 10),
      entry("Arizona", 40),
      entry("New Mexico", 100)
    ]
  },
  {
    id: "primes",
    prompt: "Name a prime number below 20.",
    blocked: ["1"],
    answers: [
      entry("3", 10, ["three"]),
      entry("5", 10, ["five"]),
      entry("7", 10, ["seven"]),
      entry("11", 30, ["eleven"]),
      entry("13", 30, ["thirteen"]),
      entry("2", 40, ["two"]),
      entry("17", 80, ["seventeen"]),
      entry("19", 100, ["nineteen"])
    ]
  },
  {
    id: "vitamins",
    prompt: "Name a vitamin by its letter.",
    strip: /\b(?:vitamin)s?\b/gi,
    answers: [
      entry("C", 10),
      entry("D", 10),
      entry("A", 30),
      entry("B", 30, ["B12","B6","B1","B2","B3","B5","B7","B9"]),
      entry("E", 60),
      entry("K", 100)
    ]
  },
  {
    id: "cluedo",
    prompt: "Name one of the six classic Cluedo (Clue) suspects.",
    answers: [
      entry("Colonel Mustard", 10, ["Mustard","Col Mustard"]),
      entry("Miss Scarlett", 10, ["Scarlett","Scarlet","Miss Scarlet"]),
      entry("Professor Plum", 30, ["Plum","Prof Plum"]),
      entry("Mrs Peacock", 40, ["Peacock"]),
      entry("Reverend Green", 80, ["Green","Mr Green","Rev Green"]),
      entry("Mrs White", 100, ["White"])
    ]
  },
  {
    id: "uk-countries",
    prompt: "Name a country that is part of the United Kingdom.",
    blocked: ["ireland"],
    answers: [
      entry("England", 10),
      entry("Scotland", 30),
      entry("Wales", 60),
      entry("Northern Ireland", 100, ["N Ireland"])
    ]
  },
  {
    id: "security-council",
    prompt: "Name a permanent member of the UN Security Council.",
    answers: [
      entry("United States", 10, ["USA","US","America","United States of America"]),
      entry("Russia", 30, ["Russian Federation"]),
      entry("China", 30),
      entry("United Kingdom", 60, ["UK","Britain","Great Britain"]),
      entry("France", 100)
    ]
  },
  {
    id: "big-five",
    prompt: "Name one of Africa's \"Big Five\" safari animals.",
    answers: [
      entry("Lion", 10),
      entry("Elephant", 10, ["African Elephant"]),
      entry("Rhinoceros", 30, ["Rhino","Black Rhino","White Rhino"]),
      entry("Leopard", 60),
      entry("Cape buffalo", 100, ["Buffalo","African Buffalo"])
    ]
  },
  {
    id: "nordic",
    prompt: "Name one of the five sovereign Nordic countries.",
    answers: [
      entry("Sweden", 10),
      entry("Norway", 10),
      entry("Denmark", 30),
      entry("Finland", 60),
      entry("Iceland", 100)
    ]
  },
  {
    id: "queen-band",
    prompt: "Name a member of the classic line-up of Queen.",
    answers: [
      entry("Freddie Mercury", 10, ["Freddie","Mercury"]),
      entry("Brian May", 30, ["Brian","May"]),
      entry("Roger Taylor", 60, ["Roger","Taylor"]),
      entry("John Deacon", 100, ["John","Deacon"])
    ]
  },
  {
    id: "dna-bases",
    prompt: "Name one of the four bases in DNA.",
    blocked: ["uracil"],
    answers: [
      entry("Adenine", 10, ["A"]),
      entry("Guanine", 40, ["G"]),
      entry("Thymine", 40, ["T"]),
      entry("Cytosine", 100, ["C"])
    ]
  },
  {
    id: "alkali-metals",
    prompt: "Name an alkali metal.",
    blocked: ["hydrogen"],
    answers: [
      entry("Sodium", 10),
      entry("Lithium", 10),
      entry("Potassium", 30),
      entry("Caesium", 60, ["Cesium"]),
      entry("Rubidium", 60),
      entry("Francium", 100)
    ]
  },
  {
    id: "halogens",
    prompt: "Name a halogen.",
    answers: [
      entry("Chlorine", 10),
      entry("Fluorine", 30),
      entry("Iodine", 30),
      entry("Bromine", 40),
      entry("Astatine", 80),
      entry("Tennessine", 100)
    ]
  },
  {
    id: "equator",
    prompt: "Name a country the Equator passes through.",
    answers: [
      entry("Ecuador", 10),
      entry("Brazil", 10),
      entry("Kenya", 10),
      entry("Indonesia", 20),
      entry("Colombia", 30),
      entry("Uganda", 30),
      entry("DR Congo", 30, ["Democratic Republic of the Congo","DRC","Congo Kinshasa","Zaire"]),
      entry("Gabon", 60),
      entry("Republic of the Congo", 60, ["Congo","Congo Brazzaville"]),
      entry("Somalia", 60),
      entry("Maldives", 80),
      entry("Kiribati", 80),
      entry("São Tomé and Príncipe", 100, ["Sao Tome","Sao Tome and Principe"])
    ]
  },
  {
    id: "germany-neighbors",
    prompt: "Name a country that borders Germany.",
    answers: [
      entry("France", 10),
      entry("Poland", 10),
      entry("Austria", 10),
      entry("Switzerland", 30),
      entry("Netherlands", 30, ["Holland"]),
      entry("Denmark", 60),
      entry("Belgium", 60),
      entry("Czech Republic", 60, ["Czechia"]),
      entry("Luxembourg", 100)
    ]
  },
  {
    id: "canadian-regions",
    prompt: "Name a Canadian province or territory.",
    answers: [
      entry("Ontario", 10),
      entry("Quebec", 10),
      entry("British Columbia", 10, ["BC"]),
      entry("Alberta", 30),
      entry("Manitoba", 40),
      entry("Saskatchewan", 40),
      entry("Nova Scotia", 40),
      entry("Yukon", 80),
      entry("New Brunswick", 80),
      entry("Newfoundland and Labrador", 80, ["Newfoundland","Labrador"]),
      entry("Prince Edward Island", 80, ["PEI"]),
      entry("Northwest Territories", 100, ["NWT"]),
      entry("Nunavut", 100)
    ]
  },
  {
    id: "australian-regions",
    prompt: "Name an Australian state or mainland territory.",
    answers: [
      entry("New South Wales", 10, ["NSW"]),
      entry("Victoria", 10),
      entry("Queensland", 20),
      entry("Tasmania", 20),
      entry("Western Australia", 30, ["WA"]),
      entry("South Australia", 60, ["SA"]),
      entry("Northern Territory", 60, ["NT"]),
      entry("Australian Capital Territory", 80, ["ACT"]),
      entry("Jervis Bay Territory", 100, ["Jervis Bay"])
    ]
  },
  {
    id: "central-america",
    prompt: "Name a country in Central America.",
    blocked: ["mexico"],
    answers: [
      entry("Costa Rica", 10),
      entry("Panama", 10),
      entry("Guatemala", 30),
      entry("Honduras", 60),
      entry("Nicaragua", 60),
      entry("El Salvador", 60),
      entry("Belize", 100)
    ]
  },
  {
    id: "tudor-queens",
    prompt: "Name one of Henry VIII's six wives.",
    blocked: ["anne","ann","catherine","katherine","kathryn","catharine"],
    answers: [
      entry("Anne Boleyn", 10, ["Boleyn","Ann Boleyn"]),
      entry("Catherine of Aragon", 30, ["Aragon","Katherine of Aragon","Catharine of Aragon"]),
      entry("Jane Seymour", 40, ["Seymour","Jane"]),
      entry("Anne of Cleves", 80, ["Cleves","Ann of Cleves","Anna of Cleves"]),
      entry("Catherine Howard", 80, ["Howard","Katherine Howard","Kathryn Howard"]),
      entry("Catherine Parr", 100, ["Parr","Katherine Parr","Kateryn Parr"])
    ]
  },
  {
    id: "colonies",
    prompt: "Name one of the thirteen original American colonies.",
    blocked: ["carolina","carolinas"],
    answers: [
      entry("Virginia", 10),
      entry("Massachusetts", 10, ["Massachusetts Bay"]),
      entry("New York", 10),
      entry("Pennsylvania", 30),
      entry("Georgia", 40),
      entry("Maryland", 40),
      entry("New Jersey", 40),
      entry("Connecticut", 40),
      entry("North Carolina", 40),
      entry("South Carolina", 40),
      entry("Rhode Island", 80),
      entry("New Hampshire", 80),
      entry("Delaware", 100)
    ]
  },
  {
    id: "bond-actors",
    prompt: "Name an actor who played James Bond in the official film series, up to No Time to Die.",
    answers: [
      entry("Sean Connery", 10, ["Connery"]),
      entry("Daniel Craig", 10, ["Craig"]),
      entry("Roger Moore", 30, ["Moore"]),
      entry("Pierce Brosnan", 30, ["Brosnan"]),
      entry("Timothy Dalton", 60, ["Dalton"]),
      entry("George Lazenby", 100, ["Lazenby"])
    ]
  },
  {
    id: "olympic-cities",
    prompt: "Name a city that has hosted the Summer Olympics more than once (as of 2024).",
    answers: [
      entry("London", 10),
      entry("Paris", 10),
      entry("Los Angeles", 30, ["LA"]),
      entry("Tokyo", 60),
      entry("Athens", 100)
    ]
  },
  {
    id: "forces",
    prompt: "Name one of the four fundamental forces of physics.",
    strip: /\b(?:force|nuclear|interaction)s?\b/gi,
    answers: [
      entry("Gravity", 10, ["Gravitation","Gravitational"]),
      entry("Electromagnetism", 30, ["Electromagnetic","Electro magnetic"]),
      entry("Strong nuclear force", 60, ["Strong"]),
      entry("Weak nuclear force", 100, ["Weak"])
    ]
  },
  {
    id: "fellowship",
    prompt: "Name a member of the Fellowship of the Ring.",
    answers: [
      entry("Frodo", 10, ["Frodo Baggins"]),
      entry("Gandalf", 10),
      entry("Aragorn", 30, ["Strider"]),
      entry("Legolas", 30),
      entry("Sam", 30, ["Samwise","Samwise Gamgee","Sam Gamgee"]),
      entry("Gimli", 40),
      entry("Merry", 80, ["Meriadoc","Meriadoc Brandybuck"]),
      entry("Pippin", 80, ["Peregrin","Peregrin Took"]),
      entry("Boromir", 100)
    ]
  },
  {
    id: "austen",
    prompt: "Name one of Jane Austen's six completed novels.",
    answers: [
      entry("Pride and Prejudice", 10),
      entry("Emma", 30),
      entry("Sense and Sensibility", 30),
      entry("Persuasion", 60),
      entry("Mansfield Park", 60),
      entry("Northanger Abbey", 100)
    ]
  },
  {
    id: "stan-countries",
    prompt: "Name a country whose name ends in \"-stan\".",
    answers: [
      entry("Pakistan", 10),
      entry("Afghanistan", 10),
      entry("Kazakhstan", 30),
      entry("Uzbekistan", 40),
      entry("Turkmenistan", 80),
      entry("Tajikistan", 80),
      entry("Kyrgyzstan", 100)
    ]
  },
  {
    id: "un-languages",
    prompt: "Name an official language of the United Nations.",
    strip: /\b(?:language)s?\b/gi,
    answers: [
      entry("English", 10),
      entry("French", 10),
      entry("Spanish", 30),
      entry("Chinese", 60, ["Mandarin","Mandarin Chinese"]),
      entry("Russian", 60),
      entry("Arabic", 100)
    ]
  },
  {
    id: "swiss-languages",
    prompt: "Name one of Switzerland's four national languages.",
    answers: [
      entry("German", 10, ["Swiss German"]),
      entry("French", 10),
      entry("Italian", 40),
      entry("Romansh", 100, ["Romansch","Rumantsch","Romanche"])
    ]
  },
  {
    id: "monty-python",
    prompt: "Name a member of Monty Python.",
    blocked: ["terry"],
    answers: [
      entry("John Cleese", 10, ["Cleese","John"]),
      entry("Eric Idle", 30, ["Idle","Eric"]),
      entry("Michael Palin", 30, ["Palin","Michael"]),
      entry("Terry Gilliam", 60, ["Gilliam"]),
      entry("Terry Jones", 60, ["Jones"]),
      entry("Graham Chapman", 100, ["Chapman","Graham"])
    ]
  },
  {
    id: "atmosphere",
    prompt: "Name one of the five main layers of Earth's atmosphere.",
    blocked: ["ionosphere"],
    answers: [
      entry("Stratosphere", 10),
      entry("Troposphere", 30),
      entry("Mesosphere", 60),
      entry("Thermosphere", 60),
      entry("Exosphere", 100)
    ]
  }
];

for(const q of QUESTIONS){
  q.answers.sort((a,b)=>a.km-b.km);
  for(const [index,answer] of q.answers.entries()){
    answer.rank=index+1;
    answer.km=10+10*Math.round(9*index/Math.max(1,q.answers.length-1));
  }
}

function normalize(value, strip) {
  let text=String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim().replace(/^the\s+/, '').replace(/&/g, ' and ');
  if(strip)text=text.replace(strip, ' ');
  return text.replace(/[^\p{L}\p{N}]/gu, '');
}

function editDistance(a, b) {
  let twoBack;
  let previous = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        current[j] = Math.min(current[j], twoBack[j - 2] + 1);
      }
    }
    twoBack = previous;
    previous = current;
  }
  return previous[b.length];
}

function spellingSimilarity(input, candidate) {
  const length = Math.max(input.length, candidate.length);
  if (Math.min(input.length, candidate.length) < 3 || length < 4) return 0;
  if (input.replace(/\D/g, '') !== candidate.replace(/\D/g, '')) return 0;
  if (Math.abs(input.length - candidate.length) > length * .3) return 0;
  return 1 - editDistance(input, candidate) / length;
}

function validateAnswer(q, input) {
  const key = value => normalize(value, q.strip);
  const normalized = key(input);
  if (!normalized || q.blocked?.some(n => key(n) === normalized)) return null;
  const exact = q.answers.find(a => [a.name, ...a.aliases].some(n => key(n) === normalized));
  if (exact) return { ...exact, corrected: false };
  let best = null, highest = 0, runnerUp = 0;
  for (const answer of q.answers) {
    const score = Math.max(...[answer.name, ...answer.aliases].map(name => spellingSimilarity(normalized, key(name))));
    if (score > highest) {
      runnerUp = highest;
      highest = score;
      best = answer;
    } else {
      runnerUp = Math.max(runnerUp, score);
    }
  }
  for (const word of q.blocked ?? []) runnerUp = Math.max(runnerUp, spellingSimilarity(normalized, key(word)));
  return highest >= .70 && highest - runnerUp >= .05 ? { ...best, corrected: true } : null;
}


