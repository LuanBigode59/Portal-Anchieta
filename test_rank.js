import { ranks } from './src/data/ranks.js';

const cargo = 'tenente_coronel';
const rank = ranks.find(r => r.id === cargo);
console.log('Rank:', rank);
console.log('Level:', rank?.level);
