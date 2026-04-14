import { store } from "../main.js";
import { embed } from "../util.js";
import { fetchEditors, fetchUnverifiedList } from "../content.js";

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
            </div>
                <table class="list" v-if="list">
                    <tr v-for="([level, err, originalIndex], i) in filteredList">
                        <td class="rank">
                            <p v-if="originalIndex + 1 <= 50" class="type-label-lg">#{{ originalIndex + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td class="level">
                            <button @click="selected = originalIndex">
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
                    <LevelAuthors :creators="level.author" :verifier="level.verifier"></LevelAuthors>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Highest Progress</div>
                            <p>{{ level.progress(selected + 1, 100) }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">ID</div>
                            <div class="id-copy" @click="copyText(level.id)">
                                <p class="type-label-lg link">{{ level.id }}</p>
                                <span class="tooltip">{{ copied ? 'Copied!' : 'Click to copy' }}</span>
                            </div>
                        </li>
                    </ul>
                </div>
                <div v-else-if="selected == null" class="level" style="height: 100%; display: flex; justify-content: center; align-items: center; text-align: center;">
                    <h2>Unverified List</h2>
                    <p>The following levels are levels that are currently unverified.</p>
                    <p>You can try verifying them, or make progress on them.</p>
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
                    <h2><a href="https://docs.google.com/document/d/13Tmtj1G1ydiBz4_banBFvjvMiIXlnpYhOzq-GMohPxs/edit?usp=sharing" target="_blank" style="color: var(--color-primary)">NARLL Guidelines</a></h2>
                    <h3>Notes:</h3>
                    <p>
                        The NARLL Website is in beta, so expect some stuff to be unfinished or bugged.
                    </p>
                    <p>
                        Want the old spreadsheet version of the list? Here: <a href="https://docs.google.com/spreadsheets/d/1gsfQKeiUm-mlEayo3e4FskkvuFJtIPjF_ad18j9q9XI">spreadsheet</a>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        selected: null,
        errors: [],
        roleIconMap,
        store,
        copied: false,
        search: "",
    }),
    computed: {
        level() {
            if (this.selected === null) return null;
            return this.filteredList[this.selected]?.[0];
        },
        filteredList() {
            if (!this.search) {
                return this.list.map((item, i) => [...item, i]);
            }

            const q = this.search.toLowerCase();

            return this.list
                .map((item, i) => [...item, i])
                .filter(([level]) =>
                    level?.name?.toLowerCase().includes(q)
                );
        },
    },
    async mounted() {
        // Hide loading spinner
        this.list = await fetchUnverifiedList();
        this.editors = await fetchEditors();

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
        copyText(text) {
            navigator.clipboard.writeText(text);
            this.copied = true;

            setTimeout(() => {
                this.copied = false;
            }, 1000);
        },
    },
    watch: {
        search() {
            this.selected = 0;
        }
    },
};