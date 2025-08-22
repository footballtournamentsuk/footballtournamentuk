import { Tournament, League } from '@/types/tournament';

export const ukLeagues: League[] = [
  { id: 'selkent', name: 'Selkent League', region: 'South East London' },
  { id: 'kent-youth', name: 'Kent Youth League', region: 'Kent' },
  { id: 'tandridge', name: 'Tandridge League', region: 'Surrey' },
  { id: 'london-youth', name: 'London Youth League', region: 'London' },
  { id: 'manchester-junior', name: 'Manchester Junior League', region: 'Manchester' },
  { id: 'birmingham-youth', name: 'Birmingham Youth League', region: 'Birmingham' },
  { id: 'liverpool-junior', name: 'Liverpool Junior League', region: 'Liverpool' },
  { id: 'yorkshire-youth', name: 'Yorkshire Youth League', region: 'Yorkshire' },
];

export const mockTournaments: Tournament[] = [
  {
    id: '1',
    name: 'Spring Championship Tournament',
    description: 'Annual spring tournament featuring teams from across London and Kent',
    location: {
      name: 'Crystal Palace Sports Centre',
      coordinates: [-0.0850, 51.4185],
      postcode: 'SE19 2BB',
      region: 'London'
    },
    dates: {
      start: new Date('2024-03-15'),
      end: new Date('2024-03-17'),
      registrationDeadline: new Date('2024-03-01')
    },
    format: '7v7',
    ageGroups: ['U10', 'U12', 'U14'],
    teamTypes: ['boys', 'girls'],
    league: ukLeagues[0],
    type: 'tournament',
    status: 'upcoming',
    maxTeams: 32,
    registeredTeams: 24,
    cost: { amount: 85, currency: 'GBP' },
    contact: {
      name: 'Sarah Johnson',
      email: 'sarah@selkentleague.co.uk',
      phone: '020 8771 2345'
    },
    features: ['Trophies for winners', 'Refreshments available', 'Professional referees']
  },
  {
    id: '2',
    name: 'Manchester United Skills Camp',
    description: 'Easter holiday football camp with Manchester United coaches',
    location: {
      name: 'Trafford Training Ground',
      coordinates: [-2.2881, 53.4646],
      postcode: 'M16 0PX',
      region: 'Manchester'
    },
    dates: {
      start: new Date('2024-04-08'),
      end: new Date('2024-04-12'),
      registrationDeadline: new Date('2024-03-25')
    },
    format: '5v5',
    ageGroups: ['U8', 'U10', 'U12'],
    teamTypes: ['boys', 'girls', 'mixed'],
    type: 'camp',
    status: 'upcoming',
    maxTeams: 60,
    registeredTeams: 45,
    cost: { amount: 150, currency: 'GBP' },
    contact: {
      name: 'Mike Thompson',
      email: 'camps@manutd.co.uk',
      phone: '0161 868 8000'
    },
    features: ['Professional coaching', 'Lunch included', 'Equipment provided', 'Certificate of completion']
  },
  {
    id: '3',
    name: 'Kent Youth League Cup Final',
    description: 'The prestigious final of the Kent Youth League Cup',
    location: {
      name: 'Maidstone United FC',
      coordinates: [0.5357, 51.2769],
      postcode: 'ME14 5LQ',
      region: 'Kent'
    },
    dates: {
      start: new Date('2024-05-20'),
      end: new Date('2024-05-20'),
    },
    format: '11v11',
    ageGroups: ['U16', 'U18'],
    teamTypes: ['boys'],
    league: ukLeagues[1],
    type: 'tournament',
    status: 'upcoming',
    maxTeams: 4,
    registeredTeams: 4,
    contact: {
      name: 'David Williams',
      email: 'david@kentyouthleague.org',
      phone: '01622 456789'
    },
    features: ['Live streaming', 'Medal ceremony', 'Programme available']
  },
  {
    id: '4',
    name: 'Birmingham Summer Festival',
    description: '3-day football festival with multiple age groups and formats',
    location: {
      name: 'Birmingham FA Ground',
      coordinates: [-1.8904, 52.4862],
      postcode: 'B6 6HE',
      region: 'Birmingham'
    },
    dates: {
      start: new Date('2024-07-15'),
      end: new Date('2024-07-17'),
      registrationDeadline: new Date('2024-06-30')
    },
    format: '9v9',
    ageGroups: ['U13', 'U15', 'U17'],
    teamTypes: ['boys', 'girls', 'mixed'],
    league: ukLeagues[5],
    type: 'tournament',
    status: 'upcoming',
    maxTeams: 48,
    registeredTeams: 31,
    cost: { amount: 120, currency: 'GBP' },
    contact: {
      name: 'Lisa Patel',
      email: 'lisa@birminghamfa.com',
      phone: '0121 456 7890'
    },
    website: 'https://birminghamfa.com/summer-festival',
    features: ['Food court', 'Live music', 'Skills challenges', 'Player of the tournament awards']
  },
  {
    id: '5',
    name: 'Liverpool Mini Soccer Tournament',
    description: 'Fun tournament for younger players in 3v3 format',
    location: {
      name: 'Anfield Sports Centre',
      coordinates: [-2.9606, 53.4308],
      postcode: 'L4 0TH',
      region: 'Liverpool'
    },
    dates: {
      start: new Date('2024-06-01'),
      end: new Date('2024-06-02'),
      registrationDeadline: new Date('2024-05-15')
    },
    format: '3v3',
    ageGroups: ['U6', 'U7', 'U8'],
    teamTypes: ['boys', 'girls', 'mixed'],
    league: ukLeagues[6],
    type: 'tournament',
    status: 'upcoming',
    maxTeams: 24,
    registeredTeams: 18,
    cost: { amount: 45, currency: 'GBP' },
    contact: {
      name: 'John Roberts',
      email: 'john@liverpoolfc.com',
      phone: '0151 263 2361'
    },
    features: ['Participation medals', 'Refreshments', 'Fun activities']
  },
  {
    id: '6',
    name: 'UK 3v3s',
    description: 'Fast-paced 3v3 tournament for young players in Ormskirk',
    location: {
      name: 'Ormskirk FC Ground',
      coordinates: [-2.8834, 53.5692], // Ormskirk coordinates
      postcode: 'L39 2AT',
      region: 'Lancashire'
    },
    dates: {
      start: new Date('2024-06-08'),
      end: new Date('2024-06-09'),
      registrationDeadline: new Date('2024-05-20')
    },
    format: '3v3',
    ageGroups: ['U8', 'U10', 'U12'],
    teamTypes: ['boys', 'girls', 'mixed'],
    type: 'tournament',
    status: 'upcoming',
    maxTeams: 32,
    registeredTeams: 19,
    cost: { amount: 35, currency: 'GBP' },
    contact: {
      name: 'Mark Wilson',
      email: 'mark@uk3v3s.co.uk',
      phone: '01695 123456'
    },
    features: ['Fast matches', 'Medals for all', 'Refreshments available']
  },
  {
    id: '7',
    name: 'Yorkshire Dales Holiday Camp',
    description: 'Residential football camp in the beautiful Yorkshire Dales',
    location: {
      name: 'Yorkshire Dales Activity Centre',
      coordinates: [-2.0781, 54.2766],
      postcode: 'DL8 3TW',
      region: 'Yorkshire'
    },
    dates: {
      start: new Date('2024-08-05'),
      end: new Date('2024-08-09'),
      registrationDeadline: new Date('2024-07-01')
    },
    format: '7v7',
    ageGroups: ['U12', 'U14', 'U16'],
    teamTypes: ['boys', 'girls'],
    type: 'camp',
    status: 'upcoming',
    maxTeams: 40,
    registeredTeams: 22,
    cost: { amount: 295, currency: 'GBP' },
    contact: {
      name: 'Emma Clarke',
      email: 'emma@yorkshiredales-fc.co.uk',
      phone: '01969 667788'
    },
    features: ['Accommodation included', 'All meals', 'Outdoor activities', 'Professional coaching']
  }
];