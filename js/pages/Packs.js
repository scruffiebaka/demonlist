import { fetchPacks } from "../content.js";

import Spinner from "../components/Spinner.js";

export default {
    components: { Spinner },

    data: () => ({
        packs: [],
        selectedPack: 0,
        selectedLevel: 0,
        loading: true,
        err: null
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list page-packs-container">
            <div class="page-packs">

                <div class="packs-container">
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

                <div class="level-container">
                    <div class="level" v-if="level">
                        <h1>{{ level.name }}</h1>

                        <p><b>CREATORS</b> {{ level.creators }}</p>
                        <p><b>VERIFIER</b> {{ level.verifier }}</p>
                        <p><b>PUBLISHER</b> {{ level.publisher }}</p>

                        <iframe class="video" :src="level.video" frameborder="0"></iframe>
                    </div>

                    <div v-else class="level">
                        <p>No level selected.</p>
                    </div>
                </div>

                <div class="levels-container">
                    <table class="list">
                        <tr v-for="(lvl, i) in currentPack.levels">
                            <td class="level" :class="{ active: selectedLevel === i }">
                                <button @click="selectedLevel = i">
                                    <span class="type-label-lg">{{ lvl.name }}</span>
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
            return this.currentPack.levels[this.selectedLevel];
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

        if (!packs) {
            this.err = "Failed to load packs.";
        } else {
            this.packs = packs;
        }

        this.loading = false;
    }
};