export interface CityConfig {
  slug: string;
  displayName: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  seoDescription: string;
  introText: string;
  heroImage?: string;
  fallbackHeroImage?: string;
  heroAltText?: string;
}

export const UK_CITIES: CityConfig[] = [
  {
    slug: 'london',
    displayName: 'London',
    region: 'Greater London',
    coordinates: [-0.1276, 51.5074],
    seoDescription: 'Discover youth football tournaments in London. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Greater London for all age groups from U6 to U21.',
    introText: 'London offers the most diverse selection of youth football tournaments in the UK. From grassroots community events in local parks to elite academy competitions at professional venues, the capital provides opportunities for every young player. With world-class facilities including Wembley Stadium, The Den, and numerous training grounds, London tournaments attract teams from across the country seeking top-level competition and unforgettable experiences.',
    heroImage: 'london-hero.webp',
    heroAltText: 'Youth football training in London — young players practicing at a stadium with the London skyline in the background'
  },
  {
    slug: 'manchester',
    displayName: 'Manchester',
    region: 'Greater Manchester',
    coordinates: [-2.2426, 53.4808],
    seoDescription: 'Find youth football tournaments in Manchester. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Greater Manchester for all age groups and skill levels.',
    introText: 'Manchester is a footballing powerhouse with a rich heritage of developing young talent. Home to Manchester United and Manchester City, the region offers exceptional tournament opportunities at iconic venues and modern training facilities. Youth tournaments in Manchester combine competitive excellence with the chance to play where football legends were made, making every match feel special for aspiring players.',
    heroImage: 'manchester-hero.webp',
    heroAltText: 'Youth football in Manchester — young players training with the Manchester city skyline and industrial architecture in the background'
  },
  {
    slug: 'birmingham',
    displayName: 'Birmingham',
    region: 'West Midlands',
    coordinates: [-1.8904, 52.4862],
    seoDescription: 'Explore youth football tournaments in Birmingham. Find competitions in 3v3, 5v5, 7v7, 9v9 and 11v11 formats across the West Midlands for all youth age groups.',
    introText: 'Birmingham and the West Midlands region host vibrant youth football tournaments throughout the year. With excellent transport links and numerous quality venues, Birmingham tournaments attract teams from across central England. The area offers a perfect blend of competitive football and cultural experiences, making tournaments here memorable for players, families, and coaches alike.',
    heroImage: 'birmingham-hero.webp',
    heroAltText: 'Youth football tournament in Birmingham — young players competing on a grass pitch with Villa Park stadium and the Birmingham city skyline in the background'
  },
  {
    slug: 'liverpool',
    displayName: 'Liverpool',
    region: 'Merseyside',
    coordinates: [-2.9916, 53.4084],
    seoDescription: 'Discover youth football tournaments in Liverpool. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Merseyside for all age groups from U6 to U21.',
    introText: 'Liverpool\'s passionate football culture creates an electric atmosphere for youth tournaments. Playing in the city that produced legendary players and hosts two Premier League clubs offers young footballers inspiration and motivation. Liverpool tournaments are known for their competitive spirit, excellent organization, and the warm Merseyside welcome that makes every team feel at home.',
    heroImage: 'liverpool-hero.webp',
    heroAltText: 'Youth football tournament in Liverpool — young players celebrating on the pitch with the Liverpool waterfront and Liver Building in the background'
  },
  {
    slug: 'leeds',
    displayName: 'Leeds',
    region: 'West Yorkshire',
    coordinates: [-1.5491, 53.8008],
    seoDescription: 'Find youth football tournaments in Leeds. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across West Yorkshire for all youth age groups and abilities.',
    introText: 'Leeds and West Yorkshire offer fantastic opportunities for youth football development through high-quality tournaments. The region combines traditional football values with modern facilities, creating ideal conditions for competitive youth football. Leeds tournaments are particularly known for their inclusive atmosphere and commitment to developing young talent at all skill levels.',
    heroImage: 'leeds-hero.webp',
    heroAltText: 'Youth football training in Leeds — young players practicing skills on a pristine grass pitch with Elland Road stadium and Leeds city center in the background'
  },
  {
    slug: 'newcastle-upon-tyne',
    displayName: 'Newcastle upon Tyne',
    region: 'Tyne and Wear',
    coordinates: [-1.6178, 55.0184],
    seoDescription: 'Explore youth football tournaments in Newcastle upon Tyne. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Tyne and Wear for all age groups.',
    introText: 'Newcastle upon Tyne brings Northeast passion to youth football tournaments. The region\'s strong community spirit and love for the beautiful game create memorable tournament experiences. With excellent facilities and stunning countryside nearby, Newcastle tournaments offer young players the chance to compete at a high level while enjoying the famous Geordie hospitality.',
    heroImage: 'newcastle-hero.webp',
    heroAltText: 'Youth football tournament in Newcastle upon Tyne — young players in black and white jerseys playing on a pitch with St. James\' Park stadium and the Tyne Bridge in the background'
  },
  {
    slug: 'sheffield',
    displayName: 'Sheffield',
    region: 'South Yorkshire',
    coordinates: [-1.4659, 53.3811],
    seoDescription: 'Discover youth football tournaments in Sheffield. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across South Yorkshire for all youth age groups.',
    introText: 'Sheffield, the Steel City, forges strong character in young footballers through competitive tournaments. Known for producing resilient players and hosting well-organized events, Sheffield tournaments combine sporting excellence with the city\'s industrial heritage. The region offers diverse venues from traditional grounds to modern facilities, perfect for youth football development.',
    heroImage: 'sheffield-hero.webp',
    heroAltText: 'Youth football match in Sheffield — young players competing on a grass pitch with Bramall Lane stadium and Sheffield\'s steel city architecture in the background'
  },
  {
    slug: 'bristol',
    displayName: 'Bristol',
    region: 'South West England',
    coordinates: [-2.5879, 51.4545],
    seoDescription: 'Find youth football tournaments in Bristol. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across the South West for all age groups from U6 to U21.',
    introText: 'Bristol serves as the gateway to Southwest football, hosting tournaments that attract teams from across the region. The city\'s vibrant culture and excellent transport links make it ideal for football festivals and competitive events. Bristol tournaments are known for their innovative formats, family-friendly atmosphere, and commitment to grassroots football development.',
    heroImage: 'bristol-hero.webp',
    heroAltText: 'Youth football tournament in Bristol — young players training on a modern pitch with Bristol City stadium and the iconic Clifton Suspension Bridge in the background'
  },
  {
    slug: 'nottingham',
    displayName: 'Nottingham',
    region: 'East Midlands',
    coordinates: [-1.1581, 52.9548],
    seoDescription: 'Explore youth football tournaments in Nottingham. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across the East Midlands for all youth age groups.',
    introText: 'Nottingham combines football tradition with modern tournament innovation. Home to historic clubs and beautiful venues, the city offers young players the chance to compete in tournaments with real character. Nottingham events are particularly noted for their educational value, helping young players develop both their football skills and understanding of the game.',
    heroImage: 'nottingham-hero.webp',
    heroAltText: 'Youth football training in Nottingham — young players practicing on a grass pitch with the City Ground stadium and Nottingham Castle visible in the background'
  },
  {
    slug: 'southampton',
    displayName: 'Southampton',
    region: 'Hampshire',
    coordinates: [-1.4044, 50.9097],
    seoDescription: 'Discover youth football tournaments in Southampton. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Hampshire for all age groups and abilities.',
    introText: 'Southampton and Hampshire host prestigious youth football tournaments known for their technical excellence and development focus. The region\'s reputation for producing talented players attracts high-quality teams to local tournaments. With coastal venues and excellent facilities, Southampton tournaments offer unique experiences that combine competitive football with beautiful surroundings.',
    heroImage: 'southampton-hero.webp',
    heroAltText: 'Youth football tournament in Southampton — young players in action on a coastal pitch with St. Mary\'s Stadium and Southampton\'s historic waterfront in the background'
  },
  {
    slug: 'glasgow',
    displayName: 'Glasgow',
    region: 'Scotland',
    coordinates: [-4.2518, 55.8642],
    seoDescription: 'Find youth football tournaments in Glasgow. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Scotland for all youth age groups from U6 to U21.',
    introText: 'Glasgow brings Scottish football passion to youth tournaments with unmatched intensity and quality. As Scotland\'s largest city and home to world-famous clubs, Glasgow tournaments offer young players the chance to experience authentic Scottish football culture. The city\'s commitment to youth development and stunning venues make tournaments here truly special experiences.',
    heroImage: 'glasgow-hero.webp',
    heroAltText: 'Youth football match in Glasgow — young players in action on a pitch with Celtic Park stadium and Glasgow Cathedral in the background'
  },
  {
    slug: 'edinburgh',
    displayName: 'Edinburgh',
    region: 'Scotland',
    coordinates: [-3.1883, 55.9533],
    seoDescription: 'Explore youth football tournaments in Edinburgh. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Scotland for all age groups and skill levels.',
    introText: 'Edinburgh combines historic grandeur with modern football excellence in its youth tournaments. The Scottish capital offers unique tournament experiences with venues ranging from traditional grounds to state-of-the-art facilities. Edinburgh tournaments are particularly valued for their international atmosphere and commitment to fair play and sportsmanship.',
    heroImage: 'edinburgh-hero.webp',
    heroAltText: 'Youth football tournament in Edinburgh — young players training on a pitch with Edinburgh Castle and the historic Royal Mile in the background'
  },
  {
    slug: 'cardiff',
    displayName: 'Cardiff',
    region: 'Wales',
    coordinates: [-3.1791, 51.4816],
    seoDescription: 'Discover youth football tournaments in Cardiff. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Wales for all youth age groups and abilities.',
    introText: 'Cardiff, the heart of Welsh football, hosts dynamic youth tournaments that celebrate the nation\'s football heritage. Playing in the capital city where Wales national team makes its home offers young players inspiration and pride. Cardiff tournaments are known for their passionate support, excellent organization, and commitment to developing Welsh football talent.',
    heroImage: 'cardiff-hero.webp',
    heroAltText: 'Youth football match in Cardiff — young players in red jerseys playing on a pitch with the Principality Stadium and Cardiff Castle visible in the background'
  },
  {
    slug: 'swansea',
    displayName: 'Swansea',
    region: 'Wales',
    coordinates: [-3.9436, 51.6214],
    seoDescription: 'Find youth football tournaments in Swansea. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Wales for all age groups from U6 to U21.',
    introText: 'Swansea offers coastal charm alongside competitive youth football tournaments. The city\'s beautiful setting and strong football tradition create memorable tournament experiences for young players. Swansea tournaments are celebrated for their inclusive approach, technical focus, and the warm Welsh welcome that makes every team feel valued and supported.',
    heroImage: 'swansea-hero.webp',
    heroAltText: 'Youth football tournament in Swansea — young players training on a coastal pitch with the Liberty Stadium and Swansea Bay in the background'
  },
  {
    slug: 'belfast',
    displayName: 'Belfast',
    region: 'Northern Ireland',
    coordinates: [-5.9301, 54.5973],
    seoDescription: 'Explore youth football tournaments in Belfast. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Northern Ireland for all youth age groups.',
    introText: 'Belfast brings Northern Ireland\'s resilient football spirit to youth tournaments with remarkable enthusiasm and quality. The city\'s growing football infrastructure and passionate community create excellent conditions for youth development. Belfast tournaments are known for their character-building experiences and the determination they inspire in young players.',
    heroImage: 'belfast-hero.webp',
    heroAltText: 'Youth football match in Belfast — young players in action on a pitch with Windsor Park stadium and Belfast City Hall in the background'
  },
  {
    slug: 'leicester',
    displayName: 'Leicester',
    region: 'East Midlands',
    coordinates: [-1.1397, 52.6369],
    seoDescription: 'Find youth football tournaments in Leicester. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across the East Midlands for all youth age groups.',
    introText: 'Leicester combines Premier League excitement with grassroots football passion in its youth tournaments. The city\'s diverse football community and excellent facilities create welcoming environments for young players. Leicester tournaments are known for their inclusive spirit and commitment to developing talent from all backgrounds.',
    heroImage: 'leicester-hero.webp',
    heroAltText: 'Youth football tournament in Leicester — young players celebrating on a pitch with the King Power Stadium and Leicester Cathedral in the background'
  },
  {
    slug: 'portsmouth',
    displayName: 'Portsmouth',
    region: 'Hampshire',
    coordinates: [-1.0898, 50.8198],
    seoDescription: 'Discover youth football tournaments in Portsmouth. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Hampshire for all age groups and abilities.',
    introText: 'Portsmouth brings naval tradition and football heritage together in memorable youth tournaments. The historic port city offers unique tournament experiences with coastal venues and strong community support. Portsmouth tournaments are celebrated for their maritime atmosphere and commitment to youth football development.',
    heroImage: 'portsmouth-hero.webp',
    heroAltText: 'Youth football training in Portsmouth — young players practicing on a coastal pitch with Fratton Park stadium and Portsmouth Historic Dockyard in the background'
  },
  {
    slug: 'brighton',
    displayName: 'Brighton',
    region: 'East Sussex',
    coordinates: [-0.1372, 50.8225],
    seoDescription: 'Explore youth football tournaments in Brighton. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across East Sussex for all youth age groups.',
    introText: 'Brighton offers seaside charm combined with progressive football development in its youth tournaments. The vibrant coastal city provides inspiring settings for young players to develop their skills. Brighton tournaments are known for their creative approach and inclusive community atmosphere.',
    heroImage: 'brighton-hero.webp',
    heroAltText: 'Youth football tournament in Brighton — young players in action on a seaside pitch with the Amex Stadium and Brighton Pier in the background'
  },
  {
    slug: 'oxford',
    displayName: 'Oxford',
    region: 'Oxfordshire',
    coordinates: [-1.2577, 51.7520],
    seoDescription: 'Find youth football tournaments in Oxford. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Oxfordshire for all age groups and skill levels.',
    introText: 'Oxford combines academic excellence with football passion in its youth tournaments. The historic university city offers unique tournament experiences that emphasize both sporting and educational values. Oxford tournaments are particularly noted for their focus on fair play and intellectual approach to the game.',
    heroImage: 'oxford-hero.webp',
    heroAltText: 'Youth football training in Oxford — young players on a grass pitch with the historic Oxford university spires in the background'
  },
  {
    slug: 'cambridge',
    displayName: 'Cambridge',
    region: 'Cambridgeshire',
    coordinates: [0.1218, 52.2053],
    seoDescription: 'Discover youth football tournaments in Cambridge. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Cambridgeshire for all youth age groups.',
    introText: 'Cambridge brings scholarly tradition to youth football tournaments with emphasis on tactical understanding and technical development. The historic university city provides inspiring venues and educational approaches to tournament football. Cambridge tournaments are known for their analytical approach and commitment to player development.',
    heroImage: 'cambridge-hero.webp',
    heroAltText: 'Youth football match in Cambridge — young players training on a traditional pitch with Cambridge University buildings and King\'s College Chapel in the background'
  }
];

export const getCityBySlug = (slug: string): CityConfig | undefined => {
  return UK_CITIES.find(city => city.slug === slug);
};

export const getCitiesWithTournaments = (tournaments: any[]): CityConfig[] => {
  const citiesWithTournaments = new Set<string>();
  
  tournaments.forEach(tournament => {
    const city = UK_CITIES.find(c => 
      tournament.location.region === c.region || 
      tournament.location.name.toLowerCase().includes(c.displayName.toLowerCase())
    );
    if (city) {
      citiesWithTournaments.add(city.slug);
    }
  });
  
  return UK_CITIES.filter(city => citiesWithTournaments.has(city.slug));
};