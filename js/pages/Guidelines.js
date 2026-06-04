import Spinner from "../components/Spinner.js";
import { fetchGuidelines } from "../content.js";

export default {
    components: {
        Spinner
    },

    template: `
        <main v-if="loading">
            <Spinner />
        </main>

        <main v-else class="guidelines-page">

            <div class="guidelines-content">

                <section class="guidelines-hero">
                    <h1>{{ data.title }}</h1>

                    <p>{{ data.subtitle }}</p>

                    <p class="updated">
                        Last updated {{ data.lastUpdated }}
                    </p>
                </section>

                <section
                    v-for="section in data.sections"
                    :id="section.id"
                    class="guidelines-section">

                    <h2>{{ section.title }}</h2>

                    <div
                        v-for="child in section.children"
                        :id="child.id"
                        class="guidelines-subsection">

                        <h3>{{ child.title }}</h3>

                        <div
                            v-for="block in child.content"
                            :key="block.text">

                            <p v-if="block.type === 'paragraph'">
                                {{ block.text }}
                            </p>

                            <h4 v-else-if="block.type === 'heading'">
                                {{ block.text }}
                            </h4>

                            <ul v-else-if="block.type === 'list'">
                                <li
                                    v-for="item in block.items"
                                    :key="item">

                                    {{ item }}
                                </li>
                            </ul>

                        </div>
                    </div>
                </section>

            </div>

            <aside class="guidelines-toc">

                <h3>Table of Contents</h3>

                <ul>
                    <li v-for="section in data.sections">
                        <a
                            :href="'#' + section.id"
                        >
                            {{ section.title }}
                        </a>

                        <ul>
                            <li v-for="child in section.children">
                                <a :href="'#' + child.id">
                                    {{ child.title }}
                                </a>
                            </li>
                        </ul>
                    </li>
                </ul>

            </aside>

        </main>
    `,

    data() {
        return {
            loading: true,
            data: null
        };
    },

    async mounted() {
        this.data = await fetchGuidelines();
        this.loading = false;
    }
};