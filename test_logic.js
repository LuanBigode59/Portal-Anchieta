const RANKS = [
  { id: 'tenente_coronel', level: 15, name: 'Tenente-Coronel PM', insignia: '*** |' },
  { id: 'major', level: 14, name: 'Major PM', insignia: '*** |' },
];

const user = { cargo: 'tenente_coronel' };
const userRankLevel = RANKS.find(r => r.id === user?.cargo)?.level || 0;
const isAdmin = userRankLevel >= 14; 
const isOfficer = userRankLevel >= 10; 
const showAdmin = isAdmin || false || isOfficer;
console.log('userRankLevel', userRankLevel);
console.log('isAdmin', isAdmin);
console.log('showAdmin', showAdmin);
