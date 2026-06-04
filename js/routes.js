import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Roulette from './pages/Roulette.js';
import Packs from './pages/Packs.js';
import Unverified from './pages/Unverified.js';
import Guidelines from './pages/Guidelines.js';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/roulette', component: Roulette },
    { path: '/packs', component: Packs },
    { path: '/unverified', component: Unverified },
    { path: '/guidelines', component: Guidelines },
];