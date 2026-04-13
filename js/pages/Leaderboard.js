import { fetchLeaderboard, fetchCreatorboard } from "../content.js";
import { localize, getFontColour } from "../util.js";

import Spinner from "../components/Spinner.js";

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboardData: [],
        creatorboardData: [],
        currentBoardType: 'leaderboard',

        loading: true,
        selected: 0,

        errors: [],
    }),

    template: `
        <main v-if="loading" class="surface">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">

                <div class="error-container">
                    <p class="error" v-if="errors.length > 0">
                        Data may be incorrect: {{ errors.join(', ') }}
                    </p>
                </div>

                <div class="board-container surface">

                    <!-- SELECTOR -->
                    <div class="nav selector">
                        <button class="nav__tab" :class="{ 'active-tab': currentBoardType === 'leaderboard' }" @click="selectBoardType('leaderboard')">
                            <span class="type-label-lg">List Points</span>
                        </button>
                        <button class="nav__tab" :class="{ 'active-tab': currentBoardType === 'creatorboard' }" @click="selectBoardType('creatorboard')">
                            <span class="type-label-lg">Creator Points</span>
                        </button>
                    </div>

                    <table class="board">
                        <tr v-for="(ientry, i) in activeBoardData">
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

                <div class="player-container surface" v-if="entry && entry.user">
                    <div class="player">

                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>
                            {{ localize(entry.total) }}
                            <span v-if="currentBoardType === 'creatorboard'">
                                creator points, {{ entry.levels ? entry.levels.length : 0 }} levels
                            </span>
                        </h3>

                        <!-- LEADERBOARD -->
                        <template v-if="currentBoardType === 'leaderboard'">

                            <div class="packs" v-if="entry.packs && entry.packs.length > 0">
                                <div v-for="pack in entry.packs" class="tag" :style="{background:pack.colour, color:getFontColour(pack.colour)}">
                                    {{pack.name}}
                                </div>
                            </div>

                            <h2 v-if="entry.verified && entry.verified.length > 0">
                                Verified ({{ entry.verified.length}})
                            </h2>

                            <table v-if="entry.verified && entry.verified.length > 0" class="table">
                                <tr v-for="score in entry.verified">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>

                            <h2 v-if="entry.completed && entry.completed.length > 0">
                                Completed ({{ entry.completed.length }})
                            </h2>

                            <table v-if="entry.completed && entry.completed.length > 0" class="table">
                                <tr v-for="score in entry.completed">
                                    <td class="rank"><p>#{{ score.rank }}</p></td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                    <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                </tr>
                            </table>

                        </template>

                        <!-- CREATORBOARD -->
                        <template v-if="currentBoardType === 'creatorboard'">

                            <h2 v-if="entry.levels && entry.levels.filter(l => l.leveltype === 1).length > 0">
                                Solo Levels ({{ entry.levels.filter(l => l.leveltype === 1).length }})
                            </h2>

                            <table v-if="entry.levels && entry.levels.filter(l => l.leveltype === 1).length > 0" class="table">
                                <tr v-for="lvl in entry.levels.filter(l => l.leveltype === 1)">
                                    <td class="rank"><p>#{{ lvl.rank }}</p></td>
                                    <td class="level"><span class="type-label-lg">{{ lvl.level }}</span></td>
                                    <td class="score"><p>+{{ localize(lvl.creatorpoints) }}</p></td>
                                </tr>
                            </table>

                            <h2 v-if="entry.levels && entry.levels.filter(l => l.leveltype === 2).length > 0">
                                Collab Levels ({{ entry.levels.filter(l => l.leveltype === 2).length }})
                            </h2>

                            <table v-if="entry.levels && entry.levels.filter(l => l.leveltype === 2).length > 0" class="table">
                                <tr v-for="lvl in entry.levels.filter(l => l.leveltype === 2)">
                                    <td class="rank"><p>#{{ lvl.rank }}</p></td>
                                    <td class="level"><span class="type-label-lg">{{ lvl.level }}</span></td>
                                    <td class="score"><p>+{{ localize(lvl.creatorpoints) }}</p></td>
                                </tr>
                            </table>

                            <h2 v-if="entry.levels && entry.levels.filter(l => l.leveltype === 4).length > 0">
                                Megacollab Levels ({{ entry.levels.filter(l => l.leveltype === 4).length }})
                            </h2>

                            <table v-if="entry.levels && entry.levels.filter(l => l.leveltype === 4).length > 0" class="table">
                                <tr v-for="lvl in entry.levels.filter(l => l.leveltype === 4)">
                                    <td class="rank"><p>#{{ lvl.rank }}</p></td>
                                    <td class="level"><span class="type-label-lg">{{ lvl.level }}</span></td>
                                    <td class="score"><p>+{{ localize(lvl.creatorpoints) }}</p></td>
                                </tr>
                            </table>

                        </template>

                    </div>
                </div>

            </div>
        </main>
    `,

    computed: {
        activeBoardData() {
            return this.currentBoardType === 'leaderboard'
                ? this.leaderboardData
                : this.creatorboardData;
        },

        entry() {
            if (this.activeBoardData && this.activeBoardData[this.selected]) {
                return this.activeBoardData[this.selected];
            }
            return { user: '', total: 0, verified: [], completed: [], packs: [], levels: [] };
        },
    },

    async mounted() {
        const [leaderboard, err1] = await fetchLeaderboard();
        const [creatorboard, err2] = await fetchCreatorboard();

        this.leaderboardData = leaderboard || [];

        // normalize creators → total
        this.creatorboardData = (creatorboard || []).map(c => ({
            ...c,
            total: c.points
        }));

        this.errors = [...(err1 || []), ...(err2 || [])];

        this.loading = false;
    },

    methods: {
        localize,
        getFontColour,

        selectBoardType(type) {
            this.currentBoardType = type;
            this.selected = 0;
        }
    },
};