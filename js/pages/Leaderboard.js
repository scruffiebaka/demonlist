import { fetchLeaderboard, fetchCreators } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
    components: { Spinner },

    data: () => ({
        mode: 'list', // 'list' or 'creator'

        leaderboard: [],
        creators: [],

        loading: true,
        selected: 0,

        err: [],
        errCreators: null
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">

                <!-- SELECTOR -->
                <div class="toggle">
                    <button @click="mode = 'list'; selected = 0">List Points</button>
                    <button @click="mode = 'creator'; selected = 0">Creator Points</button>
                </div>

                <div class="content">

                <!-- LIST MODE -->
                <template v-if="mode === 'list'">

                    <div class="error-container">
                        <p class="error" v-if="err.length > 0">
                            Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                        </p>
                    </div>

                    <div class="board-container">
                        <table class="board">
                            <tr 
                                v-for="(ientry, i) in leaderboard"
                                :class="{
                                    'top-1': i === 0,
                                    'top-2': i === 1,
                                    'top-3': i === 2
                                }"
                            >
                                <td class="rank">
                                    <p class="type-label-lg">#{{ i + 1 }}</p>
                                </td>
                                <td class="total">
                                    <p class="type-label-lg">{{ localize(ientry.total) }}</p>
                                </td>
                                <td class="user" :class="{ 'active': selected == i }">
                                    <button @click="selected = i">
                                        <span class="type-label-lg">{{ ientry.user }}</span>
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="player-container">
                        <div class="player" v-if="entry">
                            <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                            <h3>{{ entry.total }}</h3>

                            <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                            <table class="table">
                                <tr v-for="score in entry.verified">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>

                            <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.completed">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>

                            <h2 v-if="entry.progressed.length > 0">Progressed ({{entry.progressed.length}})</h2>
                            <table class="table">
                                <tr v-for="score in entry.progressed">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                    </td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>
                        </div>
                    </div>

                </template>

                <!-- CREATOR MODE -->
                <template v-else>

                    <p v-if="errCreators" class="error">{{ errCreators }}</p>

                    <div class="board-container">
                        <table class="board">
                            <tr 
                                v-for="(c, i) in creators"
                                :class="{
                                    'top-1': i === 0,
                                    'top-2': i === 1,
                                    'top-3': i === 2
                                }"
                            >
                                <td class="rank">
                                    <p>#{{ i + 1 }}</p>
                                </td>
                                <td class="total">
                                    <p class="type-label-lg">{{ c.points }}</p>
                                </td>
                                <td class="user" :class="{ 'active': selected == i }">
                                    <button @click="selected = i">
                                        <span class="type-label-lg">{{ c.user }}</span>
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div class="player-container">
                        <div class="player" v-if="creator">
                            <h1>#{{ selected + 1 }} {{ creator.user }}</h1>
                            <h3>{{ creator.points }} points</h3>

                            <h2>Best Awarded Level</h2>
                            <p>{{ creator.best }}</p>

                            <h2>Featured Levels ({{ creator.featured.length }})</h2>
                            <table class="table">
                                <tr v-for="lvl in creator.featured">
                                    <td><p>{{ lvl }}</p></td>
                                </tr>
                            </table>
                        </div>
                    </div>

                </template>
                </div>
            </div>
        </main>
    `,

    computed: {
        entry() {
            return this.leaderboard[this.selected];
        },
        creator() {
            return this.creators[this.selected];
        }
    },

    methods: {
        localize,
    },

    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;

        const creators = await fetchCreators();
        if (!creators) {
            this.errCreators = "Failed to load creators.";
        } else {
            this.creators = creators.sort((a, b) => b.points - a.points);
        }

        this.loading = false;
    }
};