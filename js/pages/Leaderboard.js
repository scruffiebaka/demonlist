import { fetchLeaderboard, fetchCreators } from '../content.js';
import { localize } from '../util.js';
import Spinner from '../components/Spinner.js';

export default {
    components: { Spinner },

    data: () => ({
        mode: 'list',
        loading: true,

        leaderboard: [],
        creators: [],

        selected: 0,
        err: null,
        errList: []
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">

                <!-- TOGGLE -->
                <div class="toggle">
                    <button 
                        :class="{ active: mode === 'list' }"
                        @click="switchMode('list')"
                    >
                        List Points
                    </button>

                    <button 
                        :class="{ active: mode === 'creator' }"
                        @click="switchMode('creator')"
                    >
                        Creator Points
                    </button>
                </div>

                <!-- ERROR -->
                <p v-if="mode === 'creator' && err" class="error">{{ err }}</p>
                <p v-if="mode === 'list' && errList.length" class="error">
                    Leaderboard may be incorrect: {{ errList.join(', ') }}
                </p>

                <!-- LEFT LIST -->
                <div class="board-container">
                    <table class="board">

                        <!-- LIST MODE -->
                        <tr v-if="mode === 'list'"
                            v-for="(e, i) in leaderboard"
                        >
                            <td class="type-label-lg" class="rank">#{{ i + 1 }}</td>
                            <td class="type-label-lg" class="total">{{ localize(e.total) }}</td>
                            <td class="type-label-lg" class="user" :class="{ active: selected === i }">
                                <button @click="selected = i">
                                    {{ e.user }}
                                </button>
                            </td>
                        </tr>

                        <!-- CREATOR MODE -->
                        <tr v-else
                            v-for="(c, i) in creators"
                        >
                            <td class="type-label-lg" class="rank">#{{ i + 1 }}</td>
                            <td class="type-label-lg" class="total">{{ c.points }}</td>
                            <td class="type-label-lg" class="user" :class="{ active: selected === i }">
                                <button @click="selected = i">
                                    {{ c.user }}
                                </button>
                            </td>
                        </tr>

                    </table>
                </div>

                <!-- RIGHT PANEL -->
                <div class="player-container">
                    <div class="player">

                        <!-- LIST DETAILS -->
                        <template v-if="mode === 'list' && entry">
                            <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                            <h3>{{ entry.total }}</h3>
                        </template>

                        <!-- CREATOR DETAILS -->
                        <template v-if="mode === 'creator' && creator">
                            <h1>#{{ selected + 1 }} {{ creator.user }}</h1>
                            <h3>{{ creator.points }} points</h3>

                            <h2>Best Awarded Level</h2>
                            <p>{{ creator.best }}</p>
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

        switchMode(m) {
            this.mode = m;
            this.selected = 0;
        }
    },

    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.errList = err;

        const creators = await fetchCreators();
        if (!creators) {
            this.err = "Failed to load creators.";
        } else {
            this.creators = creators.sort((a, b) => b.points - a.points);
        }

        this.loading = false;
    }
};