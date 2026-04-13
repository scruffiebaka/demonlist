import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

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
                <table class="list" v-if="list">
                    <tr v-for="([level, err], i) in list">
                        <td class="rank">
                            <p v-if="i + 1 <= 50" class="type-label-lg">#{{ i + 1 }}</p>
                            <p v-else class="type-label-lg">Legacy</p>
                        </td>
                        <td 
                            class="level" 
                            :class="[
                                { 'active': selected == i, 'error': !level },
                                {
                                'level-top': level?.featured === 'top',
                                'level-featured': level?.featured === 'featured',
                                'level-angel': level?.featured === 'award'
                                }
                            ]"
                        >
                            <button @click="selected = i">
                                <span class="type-label-lg">{{ level?.name || \`Error (\${err}.json)\` }}</span>
                            </button>
                        </td>
                    </tr>
                </table>
            </div>
            <div class="level-container">
                <div class="level" v-if="level">
                    <h1>{{ level.name }}</h1>
                    <div class="tags" v-if="level.tags">
                        <div class="type-title-sm">Tags</div>
                        <p>{{ level.tags || NA }}</p>
                    </div>
                    <div class="enjoyment" v-if="level.enjoyment">
                        <div class="type-title-sm">Enjoyment</div>
                        <p>{{ level.enjoyment || NA }}</p>
                    </div>
                    <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                    <iframe class="video" id="videoframe" :src="video" frameborder="0"></iframe>
                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">Points granted</div>
                            <p>{{ score(selected + 1, 100) }}</p>
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
                    </ul>
                    <p>Notes: {{ level.notes }}</p>
                    <h2>Records</h2>
                    <p v-if="selected + 1 > 50">This level does not accept new records.</p>
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
                <div v-else class="level" style="height: 100%; justify-content: center; align-items: center;">
                    <p>An error occured.</p>
                </div>
            </div>
            <div class="meta-container">
                <div class="meta">
                    <div class="errors" v-show="errors.length > 0">
                        <p class="error" v-for="error of errors">{{ error }}</p>
                    </div>
                    <h3>About</h3>
                    <p>
                        This is the official list for the New Angel's Republic Discord Server.
                        The website is a modified version of TSL template. 
                    </p>
                    <p>
                        Levels highlighted in light pink are Featured, dark purple are Top Featured, and special colored are awarded the Angel Award.
                        Have fun! :3
                    </p>
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
                    <h2><a href="https://docs.google.com/document/d/13Tmtj1G1ydiBz4_banBFvjvMiIXlnpYhOzq-GMohPxs/edit?usp=sharing" target="_blank">NARLL Guidelines</a></h2>
                    <h8>^ clickable link</h8>
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
        selected: 0,
        errors: [],
        roleIconMap,
        store,
        copied: false
    }),
    computed: {
        level() {
            return this.list[this.selected][0];
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
    },
};