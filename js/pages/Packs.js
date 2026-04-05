import { fetchList, fetchPacks } from '../content.js';
import Spinner from '../components/Spinner.js';
import LevelAuthors from '../components/List/LevelAuthors.js';
import { embed } from '../util.js';

export default {
    components: { Spinner, LevelAuthors },

    data: () => ({
        list: [],
        packs: [],
        loading: true,
        selectedPack: 0,
        selectedLevel: 0
    }),

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list page-packs">
            
            <!-- LEFT: PACKS -->
            <div class="packs-container">
                <table class="list">
                    <tr v-for="(p, i) in packs">
                        <td class="level" :class="{ active: selectedPack === i }">
                            <button @click="selectPack(i)">
                                <span class="type-label-lg">{{ p.name }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- MIDDLE: LEVEL INFO -->
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <LevelAuthors 
                        :author="level.author" 
                        :creators="level.creators" 
                        :verifier="level.verifier"
                    ></LevelAuthors>

                    <iframe class="video" :src="embed(level.verification)"></iframe>
                </div>
            </div>

            <!-- RIGHT: LEVELS -->
            <div class="list-container">
                <table class="list">
                    <tr v-for="([level, err], i) in filteredLevels">
                        <td class="level" :class="{ active: selectedLevel === i }">
                            <button @click="selectedLevel = i">
                                <span class="type-label-lg">{{ level.name }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

        </main>
    `,

    computed: {
        filteredLevels() {
            const pack = this.packs[this.selectedPack];
            if (!pack) return [];

            return this.list.filter(([lvl]) =>
                pack.levels.includes(lvl?.name)
            );
        },

        level() {
            return this.filteredLevels[this.selectedLevel]?.[0];
        }
    },

    async mounted() {
        this.list = await fetchList();
        this.packs = await fetchPacks();
        this.loading = false;
    },

    methods: {
        embed,
        selectPack(i) {
            this.selectedPack = i;
            this.selectedLevel = 0;
        }
    }
};