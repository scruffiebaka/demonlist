import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchChangelog, fetchPending, fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list">
            <div class="list-container">
            <div class="search-box">
                <input 
                    type="text" 
                    v-model="search" 
                    placeholder="Search levels..." 
                    class="search-bar"
                />

                <div class="sort-filter">
                    <select v-model="sortBy">
                        <option value="name">Name</option>
                        <option value="enjoyment">Enjoyment</option>
                        <option value="victors">Victors</option>
                        <option value="feature">Feature</option>
                    </select>

                    <button @click="sortDir = sortDir === 'asc' ? 'desc' : 'asc'">
                        {{ sortDir === 'asc' ? '↑' : '↓' }}
                    </button>

                    <input v-model="filters.creator" placeholder="Creator" />

                    <input type="number" v-model.number="filters.enjoymentMin" placeholder="Min Enjoyment" />
                    <input type="number" v-model.number="filters.enjoymentMax" placeholder="Max Enjoyment" />

                    <label>
                        <input type="checkbox" v-model="filters.feature.top"> Top
                    </label>
                    <label>
                        <input type="checkbox" v-model="filters.feature.featured"> Featured
                    </label>
                    <label>
                        <input type="checkbox" v-model="filters.feature.award"> Award
                    </label>
                    <label>
                        <input type="checkbox" v-model="filters.feature.none"> None
                    </label>
                </div>
            </div>
                <table class="list" v-if="list">
                    <tr v-for="([level, err, originalIndex], i) in filteredList">
                        <td class="rank">
                            <p v-if="originalIndex + 1 <= 50" class="type-label-lg">#{{ originalIndex + 1 }}</p>
                            <p v-else class="type-label-lg">L</p>
                        </td>
                        <td 
                            class="level" 
                            :class="[
                                { 'active': store.selected == originalIndex, 'error': !level },
                                {
                                'level-top': level?.featured === 'top',
                                'level-featured': level?.featured === 'featured',
                                'level-angel': level?.featured === 'award'
                                }
                            ]"
                        >
                            <button @click="store.selected = originalIndex">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
                <p v-if="filteredList.length === 0">
                    No results found.
                </p>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <div class="tags" v-if="level.tags">
                        <div class="type-title-sm">Tags</div>
                        <p>{{ level.tags || NA }}</p>
                    </div>
                    <div class="enjoyment">
                    <div class="type-title-sm">Enjoyment</div>

                    <div class="id-copy">
                        <p>
                        <span class="score" :class="enjoymentClass(level.enjoyment)">
                            {{ formatEnjoyment(level.enjoyment) }}
                        </span>

                        <span v-if="level.enjoyment !== null && level.enjoyment !== ''" class="outof">
                            /10
                        </span>
                        </p>

                        <span v-if="!level.enjoyment || level.enjoyment === ''" class="tooltip">
                        This level does not have enough victors
                        </span>
                    </div>
                    </div>
                    <LevelAuthors :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points granted</div>
                            <p>{{ score(store.selected + 1, 100) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <div class="id-copy" @click="copyText(level.id)">
                                <p class="type-label-lg link">{{ level.id }}</p>
                                <span class="tooltip">{{ copied ? 'Copied!' : 'Click to copy' }}</span>
                            </div>
                        </li>
                        <li>
                            <div class="type-title-sm">Length</div>
                            <p>{{ level.length }}</p>
                        </li>
                        <li v-if="level.nong === 'yes'">
                            <div class="id-copy nong-icon">
                                <img src="/assets/nong/back.png" class="back">
                                <img src="/assets/nong/front.png" class="front">
                                <span class="tooltip">This level uses a NONG</span>
                            </div>
                        </li>
                    </ul>
                    <p>Notes: {{ level.notes }}</p>
                    <h2>Records{{ recordCountText }}</h2>
                    <p v-if="store.selected + 1 > 50">This level does not accept new records.</p>
                    <table class="records">
                        <tr v-for="record in level.records" class="record">
                            <td class="percent">
                                <p>{{ record.percent }}%</p>
                            </td>
                            <td class="user">
                                <a :href="record.link" target="_blank" class="type-label-lg">{{ record.user }}</a>
                            </td>
                            <td class="mobile">
                                <img v-if="record.mobile" :src="\`/assets/phone-landscape\${store.dark ? '-dark' : ''}.svg\`" alt="Mobile">
                            </td>
                            <td class="hz">
                                <p>{{ record.hz === 0 ? 'NA' : record.hz + 'Hz' }}</p>
                            </td>
                        </tr>
                    </table>
                </div>
                <div v-else-if="store.selected == null" class="level welcome">
                    <h2>Welcome to the New Angels Republic Level List!</h2>
                    <p>On your left is the level list, click any level to know more about it!</p>
                    <p>On your right are the list editors and the guidelines to submitting records and levels!</p>
                    <h3>About</h3>
                    <p>
                        This is the official list for the New Angel's Republic Discord Server.
                        The website is a modified version of TSL. 
                    </p>
                    <p>
                        Levels highlighted in light pink are Featured, dark purple are Top Featured, and special colored are awarded the Angel Award.
                    </p>
                    <p>
                        Have fun and don't forget to join the discord! :3
                    </p>

                     <div class="nav selector">
                        <button 
                            class="nav__tab" 
                            :class="{ 'active-tab': mode === 'changelog' }" 
                            @click="mode = 'changelog'"
                        >
                            <span class="type-label-lg">Changelog</span>
                        </button>

                        <button 
                            class="nav__tab" 
                            :class="{ 'active-tab': mode === 'pending' }" 
                            @click="mode = 'pending'"
                        >
                            <span class="type-label-lg">Pending</span>
                        </button>
                    </div>

                    <div class="changelog-box">
                        <template v-if="mode === 'changelog'">
                            <div v-for="entry in changelog" class="changelog-entry">
                                <h3 class="changelog-date">{{ formatDate(entry.date) }}</h3>
                                <ul class="changelog-list">
                                    <li v-for="change in entry.changes">
                                        - <span v-html="formatChange(change)"></span>
                                    </li>
                                </ul>
                            </div>
                        </template>

                        <template v-else>
                            <div v-for="entry in pending" class="changelog-entry">
                                <p class="changelog-list">
                                    - <span v-html="formatChange(entry.text)"></span> places on {{ formatDate(entry.date) }}
                                </p>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <template v-if="editors">
                        <h3>List Editors</h3>
                        <ol class="editors">
                            <li v-for="editor in editors">
                                <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                                <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                                <p v-else>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>
                      <h2><a href="https://docs.google.com/document/d/1_xeCrzN2xmG1X5PQix6BEqDfBCg22rB08TNjXyRXg4M/edit?usp=sharing" target="_blank" style="color: blue; text-decoration: underline;">NARLL Guidelines</a></h2>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        mode: "changelog",
        pending: [],
        changelog: [], 
        errors: [],
        roleIconMap,
        store,
        copied: false,
        search: "",
        sortBy: "name",

        sortDir: "asc",
        filters: {
            creator: "",
            enjoymentMin: null,
            enjoymentMax: null,
            feature: {
                top: true,
                featured: true,
                award: true,
                none: true,
            }
        }
    }),
    computed: {
        recordCountText() {
            const n = this.level?.records?.length;
            return n ? ` (${n})` : '';
        },
        level() {
            return this.list[store.selected]?.[0];
        },
        filteredList() {
            let arr = this.list.map((item, i) => [...item, i]);
            const q = this.search.toLowerCase();

            if (q) {
                arr = arr.filter(([level]) =>
                    level?.name?.toLowerCase().includes(q)
                );
            }

            if (this.filters.creator) {
                const c = this.filters.creator.toLowerCase();
                arr = arr.filter(([level]) =>
                    level?.creators?.some(x => x.toLowerCase().includes(c))
                );
            }

            arr = arr.filter(([level]) => {
                const e = Number(level?.enjoyment);
                if (isNaN(e)) return true;

                if (this.filters.enjoymentMin != null && e < this.filters.enjoymentMin) return false;
                if (this.filters.enjoymentMax != null && e > this.filters.enjoymentMax) return false;
                return true;
            });

            arr = arr.filter(([level]) => {
                const f = level?.featured || "none";
                if (f === "top") return this.filters.feature.top;
                if (f === "featured") return this.filters.feature.featured;
                if (f === "award") return this.filters.feature.award;
                return this.filters.feature.none;
            });


            const dir = this.sortDir === "asc" ? 1 : -1;

            arr.sort(([a], [b]) => {
                switch (this.sortBy) {
                    case "name":
                        return dir * (a.name || "").localeCompare(b.name || "");
                    case "enjoyment":
                        return dir * ((a.enjoyment ?? -1) - (b.enjoyment ?? -1));
                    case "victors":
                        return dir * ((a.records?.length ?? 0) - (b.records?.length ?? 0));
                    case "feature":
                        return dir * ((a.featured || "").localeCompare(b.featured || ""));
                }
                return 0;
            });

            return arr;
        },
        video() {
            if (!this.level.showcase) {
                return embed(this.level.verification);
            }

            return embed(
                this.toggledShowcase
                    ? this.level.showcase
                    : this.level.verification
            );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchList();
        this.editors = await fetchEditors();

        this.changelog = await fetchChangelog();
        this.pending = await fetchPending();

        // Error handling
        if (!this.list) {
            this.errors = [
                "Failed to load list. Retry in a few minutes or notify list staff.",
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => {
                        return `Failed to load level. (${err}.json)`;
                    })
            );
            if (!this.editors) {
                this.errors.push("Failed to load list editors.");
            }
        }

        this.loading = false;
    },
    methods: {
        embed,
        score,
        copyText(text) {
            navigator.clipboard.writeText(text);
            this.copied = true;

            setTimeout(() => {
                this.copied = false;
            }, 1000);
        },
        formatDate(date) {
        return new Date(date).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
            });
        },
        formatChange(text) {
            return text
                .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
                .replace(/\*(.*?)\*/g, "<i>$1</i>");
        },
        formatEnjoyment(val) {
            if (val === null || val === undefined || val === "") return "NA";
            return val;
        },
        enjoymentClass(val) {
            const n = Number(val);
            if (isNaN(n)) return "";

            if (n <= 4) return "enjoyment--bad";
            if (n < 7) return "enjoyment--mid";
            return "enjoyment--good";
        }
    },
    watch: {
        search() {
            store.selected = null;
        }
    },
};
