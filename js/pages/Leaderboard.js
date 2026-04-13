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

            <div class="error-container">
                <p class="error" v-if="errors.length > 0">
                    Leaderboard may be incorrect, as the following levels could not be loaded: {{ errors.join(', ') }}
                </p>
            </div>

            <!-- LEFT PANEL -->
            <div class="board-container">

                <!-- SELECTOR (placed INSIDE board-container like your template) -->
                <div class="nav selector">
                    <button class="nav__tab" :class="{ 'active-tab': currentBoardType === 'leaderboard' }" @click="selectBoardType('leaderboard')">
                        <span class="type-label-lg">List Points</span>
                    </button>
                    <button class="nav__tab" :class="{ 'active-tab': currentBoardType === 'creatorboard' }" @click="selectBoardType('creatorboard')">
                        <span class="type-label-lg">Creator Points</span>
                    </button>
                </div>

                <table class="board">
                    <tr 
                        v-for="(ientry, i) in activeBoardData"
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
                            <p class="type-label-lg">
                                {{ currentBoardType === 'leaderboard'
                                    ? localize(ientry.total)
                                    : ientry.points }}
                            </p>
                        </td>

                        <td class="user" :class="{ 'active': selected == i }">
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ ientry.user }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- RIGHT PANEL -->
            <div class="player-container">
                <div class="player" v-if="entry">

                    <h1>#{{ selected + 1 }} {{ entry.user }}</h1>

                    <h3>
                        {{ currentBoardType === 'leaderboard'
                            ? entry.total
                            : entry.points + ' points' }}
                    </h3>

                    <!-- LEADERBOARD VIEW -->
                    <template v-if="currentBoardType === 'leaderboard'">

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

                    </template>

                    <!-- CREATOR VIEW -->
                    <template v-else>

                        <h2>Best Awarded Level</h2>
                        <p>{{ entry.best }}</p>

                        <h2>Featured Levels ({{ entry.featured.length }})</h2>
                        <table class="table">
                            <tr v-for="lvl in entry.featured">
                                <td><p>{{ lvl }}</p></td>
                            </tr>
                        </table>

                    </template>

                </div>
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