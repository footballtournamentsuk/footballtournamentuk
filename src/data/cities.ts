export interface CityConfig {
  slug: string;
  displayName: string;
  region: string;
  coordinates: [number, number]; // [longitude, latitude]
  seoDescription: string;
  introText: string;
}

export const UK_CITIES: CityConfig[] = [
  {
    slug: 'london',
    displayName: 'London',
    region: 'Greater London',
    coordinates: [-0.1276, 51.5074],
    seoDescription: 'Discover youth football tournaments in London. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Greater London for all age groups from U6 to U21.',
    introText: 'London offers the most diverse selection of youth football tournaments in the UK. From grassroots community events in local parks to elite academy competitions at professional venues, the capital provides opportunities for every young player. With world-class facilities including Wembley Stadium, The Den, and numerous training grounds, London tournaments attract teams from across the country seeking top-level competition and unforgettable experiences.'
  },
  {
    slug: 'manchester',
    displayName: 'Manchester',
    region: 'Greater Manchester',
    coordinates: [-2.2426, 53.4808],
    seoDescription: 'Find youth football tournaments in Manchester. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Greater Manchester for all age groups and skill levels.',
    introText: 'Manchester is a footballing powerhouse with a rich heritage of developing young talent. Home to Manchester United and Manchester City, the region offers exceptional tournament opportunities at iconic venues and modern training facilities. Youth tournaments in Manchester combine competitive excellence with the chance to play where football legends were made, making every match feel special for aspiring players.'
  },
  {
    slug: 'birmingham',
    displayName: 'Birmingham',
    region: 'West Midlands',
    coordinates: [-1.8904, 52.4862],
    seoDescription: 'Explore youth football tournaments in Birmingham. Find competitions in 3v3, 5v5, 7v7, 9v9 and 11v11 formats across the West Midlands for all youth age groups.',
    introText: 'Birmingham and the West Midlands region host vibrant youth football tournaments throughout the year. With excellent transport links and numerous quality venues, Birmingham tournaments attract teams from across central England. The area offers a perfect blend of competitive football and cultural experiences, making tournaments here memorable for players, families, and coaches alike.'
  },
  {
    slug: 'liverpool',
    displayName: 'Liverpool',
    region: 'Merseyside',
    coordinates: [-2.9916, 53.4084],
    seoDescription: 'Discover youth football tournaments in Liverpool. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Merseyside for all age groups from U6 to U21.',
    introText: 'Liverpool\'s passionate football culture creates an electric atmosphere for youth tournaments. Playing in the city that produced legendary players and hosts two Premier League clubs offers young footballers inspiration and motivation. Liverpool tournaments are known for their competitive spirit, excellent organization, and the warm Merseyside welcome that makes every team feel at home.'
  },
  {
    slug: 'leeds',
    displayName: 'Leeds',
    region: 'West Yorkshire',
    coordinates: [-1.5491, 53.8008],
    seoDescription: 'Find youth football tournaments in Leeds. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across West Yorkshire for all youth age groups and abilities.',
    introText: 'Leeds and West Yorkshire offer fantastic opportunities for youth football development through high-quality tournaments. The region combines traditional football values with modern facilities, creating ideal conditions for competitive youth football. Leeds tournaments are particularly known for their inclusive atmosphere and commitment to developing young talent at all skill levels.'
  },
  {
    slug: 'newcastle-upon-tyne',
    displayName: 'Newcastle upon Tyne',
    region: 'Tyne and Wear',
    coordinates: [-1.6178, 55.0184],
    seoDescription: 'Explore youth football tournaments in Newcastle upon Tyne. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Tyne and Wear for all age groups.',
    introText: 'Newcastle upon Tyne brings Northeast passion to youth football tournaments. The region\'s strong community spirit and love for the beautiful game create memorable tournament experiences. With excellent facilities and stunning countryside nearby, Newcastle tournaments offer young players the chance to compete at a high level while enjoying the famous Geordie hospitality.'
  },
  {
    slug: 'sheffield',
    displayName: 'Sheffield',
    region: 'South Yorkshire',
    coordinates: [-1.4659, 53.3811],
    seoDescription: 'Discover youth football tournaments in Sheffield. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across South Yorkshire for all youth age groups.',
    introText: 'Sheffield, the Steel City, forges strong character in young footballers through competitive tournaments. Known for producing resilient players and hosting well-organized events, Sheffield tournaments combine sporting excellence with the city\'s industrial heritage. The region offers diverse venues from traditional grounds to modern facilities, perfect for youth football development.'
  },
  {
    slug: 'bristol',
    displayName: 'Bristol',
    region: 'South West England',
    coordinates: [-2.5879, 51.4545],
    seoDescription: 'Find youth football tournaments in Bristol. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across the South West for all age groups from U6 to U21.',
    introText: 'Bristol serves as the gateway to Southwest football, hosting tournaments that attract teams from across the region. The city\'s vibrant culture and excellent transport links make it ideal for football festivals and competitive events. Bristol tournaments are known for their innovative formats, family-friendly atmosphere, and commitment to grassroots football development.'
  },
  {
    slug: 'nottingham',
    displayName: 'Nottingham',
    region: 'East Midlands',
    coordinates: [-1.1581, 52.9548],
    seoDescription: 'Explore youth football tournaments in Nottingham. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across the East Midlands for all youth age groups.',
    introText: 'Nottingham combines football tradition with modern tournament innovation. Home to historic clubs and beautiful venues, the city offers young players the chance to compete in tournaments with real character. Nottingham events are particularly noted for their educational value, helping young players develop both their football skills and understanding of the game.'
  },
  {
    slug: 'southampton',
    displayName: 'Southampton',
    region: 'Hampshire',
    coordinates: [-1.4044, 50.9097],
    seoDescription: 'Discover youth football tournaments in Southampton. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Hampshire for all age groups and abilities.',
    introText: 'Southampton and Hampshire host prestigious youth football tournaments known for their technical excellence and development focus. The region\'s reputation for producing talented players attracts high-quality teams to local tournaments. With coastal venues and excellent facilities, Southampton tournaments offer unique experiences that combine competitive football with beautiful surroundings.'
  },
  {
    slug: 'glasgow',
    displayName: 'Glasgow',
    region: 'Scotland',
    coordinates: [-4.2518, 55.8642],
    seoDescription: 'Find youth football tournaments in Glasgow. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Scotland for all youth age groups from U6 to U21.',
    introText: 'Glasgow brings Scottish football passion to youth tournaments with unmatched intensity and quality. As Scotland\'s largest city and home to world-famous clubs, Glasgow tournaments offer young players the chance to experience authentic Scottish football culture. The city\'s commitment to youth development and stunning venues make tournaments here truly special experiences.'
  },
  {
    slug: 'edinburgh',
    displayName: 'Edinburgh',
    region: 'Scotland',
    coordinates: [-3.1883, 55.9533],
    seoDescription: 'Explore youth football tournaments in Edinburgh. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Scotland for all age groups and skill levels.',
    introText: 'Edinburgh combines historic grandeur with modern football excellence in its youth tournaments. The Scottish capital offers unique tournament experiences with venues ranging from traditional grounds to state-of-the-art facilities. Edinburgh tournaments are particularly valued for their international atmosphere and commitment to fair play and sportsmanship.'
  },
  {
    slug: 'cardiff',
    displayName: 'Cardiff',
    region: 'Wales',
    coordinates: [-3.1791, 51.4816],
    seoDescription: 'Discover youth football tournaments in Cardiff. Browse 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Wales for all youth age groups and abilities.',
    introText: 'Cardiff, the heart of Welsh football, hosts dynamic youth tournaments that celebrate the nation\'s football heritage. Playing in the capital city where Wales national team makes its home offers young players inspiration and pride. Cardiff tournaments are known for their passionate support, excellent organization, and commitment to developing Welsh football talent.'
  },
  {
    slug: 'swansea',
    displayName: 'Swansea',
    region: 'Wales',
    coordinates: [-3.9436, 51.6214],
    seoDescription: 'Find youth football tournaments in Swansea. Explore 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Wales for all age groups from U6 to U21.',
    introText: 'Swansea offers coastal charm alongside competitive youth football tournaments. The city\'s beautiful setting and strong football tradition create memorable tournament experiences for young players. Swansea tournaments are celebrated for their inclusive approach, technical focus, and the warm Welsh welcome that makes every team feel valued and supported.'
  },
  {
    slug: 'belfast',
    displayName: 'Belfast',
    region: 'Northern Ireland',
    coordinates: [-5.9301, 54.5973],
    seoDescription: 'Explore youth football tournaments in Belfast. Find 3v3, 5v5, 7v7, 9v9 and 11v11 competitions across Northern Ireland for all youth age groups.',
    introText: 'Belfast brings Northern Ireland\'s resilient football spirit to youth tournaments with remarkable enthusiasm and quality. The city\'s growing football infrastructure and passionate community create excellent conditions for youth development. Belfast tournaments are known for their character-building experiences and the determination they inspire in young players.'
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