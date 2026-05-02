import { fetchLeaderboard, fetchCreators } from "../content.js";
import { localize } from "../util.js";
import Spinner from "../components/Spinner.js";

function computeRanks(arr, key) {
    let rank = 0;
    let prevValue = null;

    return arr.map((item) => {
        const value = item[key];

        if (value !== prevValue) {
            rank += 1;
            prevValue = value;
        }

        return { ...item, rank };
    });
}

export default {
    components: { Spinner },

    data: () => ({
        mode: 'list',

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
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>

                <div class="board-container">

                    <div class="nav selector">
                        <button class="nav__tab" :class="{ 'active-tab': mode === 'list' }" @click="mode = 'list'; selected = 0">
                            <span class="type-label-lg">List Points</span>
                        </button>
                        <button class="nav__tab" :class="{ 'active-tab': mode === 'creator' }" @click="mode = 'creator'; selected = 0">
                            <span class="type-label-lg">Creator Points</span>
                        </button>
                    </div>

                    <table class="board">
                        <tr 
                            v-for="(ientry, i) in (mode === 'list' ? leaderboard : creators)"
                            :class="{
                                'top-1': ientry.rank === 1,
                                'top-2': ientry.rank === 2,
                                'top-3': ientry.rank === 3
                            }"
                        >
                            <td class="rank">
                                <p class="type-label-lg">#{{ ientry.rank }}</p>
                            </td>

                            <td class="total">
                                <p class="type-label-lg">
                                    {{ mode === 'list' ? localize(ientry.total) : ientry.points }}
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

                <div class="player-container">
                    <div class="player" v-if="mode === 'list' ? entry : creator">

                        <h1>
                            #{{ selected + 1 }}
                            {{ mode === 'list' ? entry.user : creator.user }}
                        </h1>

                        <h3>
                            {{ mode === 'list' ? entry.total : (creator.points + ' points') }}
                        </h3>

                        <template v-if="mode === 'list'">

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

                        <template v-else>

                            <h2>Best Awarded Level</h2>
                            <p>{{ creator.best }}</p>

                            <h2>Featured Levels ({{ creator.featured.length }})</h2>
                            <table class="table">
                                <tr v-for="lvl in creator.featured">
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
        this.err = err;

        this.leaderboard = computeRanks(
            leaderboard.sort((a, b) => b.total - a.total),
            "total"
        );

        const creators = await fetchCreators();

        this.creators = computeRanks(
            (creators || []).sort((a, b) => b.points - a.points),
            "points"
        );

        this.loading = false;
    }
};
