import { store } from "../main.js";
import { fetchEditors, fetchUnverifiedList } from "../content.js";

import Spinner from "../components/Spinner.js";

export default {
    components: { Spinner },

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
                            <p class="type-label-lg">#{{ originalIndex + 1 }}</p>
                        </td>

                        <td 
                            class="level" 
                            :class="{ 'active': selected == originalIndex, 'error': !level }"
                        >
                            <button @click="selected = originalIndex">
                                <span class="type-label-lg">
                                    {{ level?.name || \`Error (\${err}.json)\` }}
                                </span>
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

                    <ul class="stats">
                        <li>
                            <div class="type-title-sm">ID</div>
                            <p>{{ level.id }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Author</div>
                            <p>{{ level.author }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Verifier</div>
                            <p>{{ level.verifier }}</p>
                        </li>
                        <li>
                            <div class="type-title-sm">Progress</div>
                            <p>{{ level.progress }}</p>
                        </li>
                    </ul>
                </div>

                <div v-else-if="selected == null" class="level center">
                    <h2>Unverified Levels</h2>
                    <p>The following levels on the left are unverified and thus cannot be on the list.</p>
                    <p>Keep in mind, a lot of the levels may not be list worthy (i.e not on par with the current standards) as they were created a long time ago.
                        Please confirm with a moderator before attempting to verify one.</p>
                    <p>Select a level to view details.</p>
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
        search: "",
        store
    }),

    computed: {
        level() {
            if (this.selected === null) return null;
            return this.list[this.selected]?.[0];
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
        }
    },

    async mounted() {
        this.list = await fetchUnverifiedList();
        this.editors = await fetchEditors();

        if (!this.list) {
            this.errors = [
                "Failed to load unverified list."
            ];
        } else {
            this.errors.push(
                ...this.list
                    .filter(([_, err]) => err)
                    .map(([_, err]) => `Failed to load level (${err}.json)`)
            );
        }

        if (!this.editors) {
            this.errors.push("Failed to load editors.");
        }

        this.loading = false;
    },

    watch: {
        search() {
            this.selected = 0;
        }
    }
};