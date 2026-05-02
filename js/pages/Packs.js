import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchList, fetchPacks } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

export default {
    components: { Spinner, LevelAuthors },

    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list">

            <!-- LEFT: PACKS -->
            <div class="list-container">
                <table class="list">
                    <tr v-for="(pack, i) in packs" :key="i">
                        <td 
                            class="level"
                            :class="{ active: selectedPack === i }"
                        >
                            <button @click="selectPack(i)">
                                <span class="type-label-lg">{{ pack.name }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- MIDDLE: LEVEL VIEW -->
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>

                    <div class="tags" v-if="level.tags">
                        <div class="type-title-sm">Tags</div>
                        <p>{{ level.tags }}</p>
                    </div>

                    <LevelAuthors 
                        :author="level.author" 
                        :creators="level.creators" 
                        :verifier="level.verifier"
                    ></LevelAuthors>

                    <iframe class="video" :src="video" frameborder="0"></iframe>

                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points</div>
                            <p>{{ score(selectedLevel + 1, 100) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p class="type-label-lg link" @click="copyText(level.id)">
                                {{ level.id }}
                            </p>
                        </li>
                        <li>
                            <div class="type-title-sm">Length</div>
                            <p>{{ level.length }}</p>
                        </li>
                    </ul>

                    <p>Notes: {{ level.notes }}</p>

                    <h2>Records</h2>
                    <table class="records">
                        <tr v-for="(record, i) in level.records" :key="i">
                            <td class="percent"><p>{{ record.percent }}%</p></td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">
                                    {{ record.user }}
                                </a>
                            </td>
                            <td class="hz">
                                <p>{{ record.hz === 0 ? 'NA' : record.hz + 'Hz' }}</p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div v-else class="level" style="height:100%;display:flex;align-items:center;justify-content:center;">
                    <p>An error occured.</p>
                </div>
            </div>

            <!-- RIGHT: LEVELS -->
            <div class="meta-container">
                <table class="list" v-if="currentPackLevels">
                    <tr v-for="([level, err], i) in currentPackLevels" :key="i">
                        <td 
                            class="level"
                            :class="{
                                active: selectedLevel === i,
                                error: !level,
                                'level-top': level && level.featured === 'top',
                                'level-featured': level && level.featured === 'featured',
                                'level-angel': level && level.featured === 'award'
                            }"
                        >
                            <button @click="selectedLevel = i">
                                <span class="type-label-lg">
                                    {{ level ? level.name : 'Error (' + err + '.json)' }}
                                </span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>

        </main>
    `,

    data() {
        return {
            fullList: null,
            packs: [],
            packLevels: {},
            selectedPack: 0,
            selectedLevel: 0,
            loading: true,
            store
        };
    },

    computed: {
        currentPackLevels() {
            return this.packLevels[this.selectedPack];
        },
        level() {
            return this.currentPackLevels?.[this.selectedLevel]?.[0];
        },
        video() {
            if (!this.level) return "";
            if (!this.level.showcase) return embed(this.level.verification);
            return embed(this.level.showcase);
        }
    },

    async mounted() {
        const res = await fetchPacks("/dataextra/packs.json");
        this.packs = await res.json();

        if (this.packs.length > 0) {
            await this.selectPack(0);
        }

        this.loading = false;
    },

    methods: {
        async selectPack(i) {
            this.selectedPack = i;
            this.selectedLevel = 0;

            if (!this.packLevels[i]) {
                if (!this.fullList) {
                    this.fullList = await fetchList();
                }

                const ids = this.packs[i].levels;

                this.packLevels[i] = ids.map(id => {
                    const found = this.fullList.find(([lvl]) => lvl?.id == id);
                    return found || [null, id];
                });
            }
        },

        embed,
        score,

        copyText(text) {
            navigator.clipboard.writeText(text);
        }
    }
};