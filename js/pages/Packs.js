import { fetchPacks, fetchList } from "../content.js";
import Spinner from "../components/Spinner.js";

export default {
    components: { Spinner },

    data: () => ({
        packs: [],
        list: [],
        levelMap: {},
        selectedPack: 0,
        selectedLevel: 0,
        loading: true
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list page-packs-container">
            <div class="page-packs">

                <!-- PACKS -->
                <div>
                    <table class="list">
                        <tr v-for="(pack, i) in packs">
                            <td class="level" :class="{ active: selectedPack === i }">
                                <button @click="selectPack(i)">
                                    <span class="type-label-lg">{{ pack.name }}</span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- CENTER -->
                <div class="level-container">
                    <div class="level" v-if="level">
                        <h1>{{ level.name }}</h1>
                        <p>ID: {{ level.id }}</p>
                        <p>Creator: {{ level.author }}</p>
                    </div>
                </div>

                <!-- LEVELS -->
                <div>
                    <table class="list">
                        <tr v-for="(lvl, i) in currentPack.levels">
                            <td class="level" :class="{ active: selectedLevel === i }">
                                <button @click="selectedLevel = i">
                                    <span class="type-label-lg">
                                        {{ levelMap[lvl.id]?.name || "Unknown" }}
                                    </span>
                                </button>
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
        </main>
    `,

    computed: {
        currentPack() {
            return this.packs[this.selectedPack] || { levels: [] };
        },
        level() {
            const entry = this.currentPack.levels[this.selectedLevel];
            return entry ? this.levelMap[entry.id] : null;
        }
    },

    methods: {
        selectPack(i) {
            this.selectedPack = i;
            this.selectedLevel = 0;
        }
    },

    async mounted() {
        const packs = await fetchPacks();
        const list = await fetchList();

        this.packs = packs || [];
        this.list = list || [];

        // build fast lookup map
        this.levelMap = Object.fromEntries(
            this.list.map(([lvl]) => [lvl.id, lvl])
        );

        this.loading = false;
    }
};