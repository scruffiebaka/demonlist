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
                                <p>{{ editor.name }}</p>
                            </li>
                        </ol>
                    </template>

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