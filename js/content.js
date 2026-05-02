import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';

export async function fetchList() {
    const listResult = await fetch(`${dir}/_list.json`);
    try {
        const list = await listResult.json();

        return await Promise.all(
            list.map(async (id, rank) => {
                const levelResult = await fetch(`${dir}/${id}.json`);

                try {
                    const level = await levelResult.json();

                    return [
                        {
                            ...level,
                            id,
                            records: level.records.sort(
                                (a, b) => b.percent - a.percent,
                            ),
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load level #${rank + 1} (${id}).`);
                    return [null, id];
                }
            }),
        );
    } catch {
        console.error(`Failed to load list.`);
        return null;
    }
}

export async function fetchUnverifiedList() {
    const listResult = await fetch(`/dataextra/unverified/_list.json`);

    try {
        const list = await listResult.json();

        return await Promise.all(
            list.map(async (id, index) => {
                const res = await fetch(`/dataextra/unverified/${id}.json`);

                try {
                    const level = await res.json();

                    return [
                        {
                            ...level,
                            id,
                        },
                        null,
                    ];
                } catch {
                    console.error(`Failed to load unverified level #${index + 1} (${id}).`);
                    return [null, id];
                }
            })
        );
    } catch {
        console.error(`Failed to load unverified list.`);
        return null;
    }
}

export async function fetchEditors() {
    try {
        const editorsResults = await fetch(`${dir}/_editors.json`);
        const editors = await editorsResults.json();
        return editors;
    } catch {
        return null;
    }
}

export async function fetchLeaderboard() {
    const list = await fetchList();

    const scoreMap = {};
    const errs = [];
    list.forEach(([level, err], rank) => {
        if (err) {
            errs.push(err);
            return;
        }

        // Verification
        const verifier = Object.keys(scoreMap).find(
            (u) => u.toLowerCase() === level.verifier.toLowerCase(),
        ) || level.verifier;
        scoreMap[verifier] ??= {
            verified: [],
            completed: [],
            progressed: [],
        };
        const { verified } = scoreMap[verifier];
        verified.push({
            rank: rank + 1,
            level: level.name,
            score: score(rank + 1, 100, level.percentToQualify),
            link: level.verification,
        });

        // Records
        level.records.forEach((record) => {
            const user = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === record.user.toLowerCase(),
            ) || record.user;
            scoreMap[user] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { completed, progressed } = scoreMap[user];
            if (record.percent === 100) {
                completed.push({
                    rank: rank + 1,
                    level: level.name,
                    score: score(rank + 1, 100, level.percentToQualify),
                    link: record.link,
                });
                return;
            }

            progressed.push({
                rank: rank + 1,
                level: level.name,
                percent: record.percent,
                score: score(rank + 1, record.percent, level.percentToQualify),
                link: record.link,
            });
        });
    });

    // Wrap in extra Object containing the user and total score
    const res = Object.entries(scoreMap).map(([user, scores]) => {
        const { verified, completed, progressed } = scores;
        const total = [verified, completed, progressed]
            .flat()
            .reduce((prev, cur) => prev + cur.score, 0);

        return {
            user,
            total: round(total),
            ...scores,
        };
    });

    // Sort by total score
    return [res.sort((a, b) => b.total - a.total), errs];
}

export async function fetchCreators() {
    try {
        const res = await fetch('/dataextra/creators.json');
        const creators = await res.json();
        return creators;
    } catch {
        return null;
    }
}

export async function fetchPacks() {
    try {
        const res = await fetch('/dataextra/packs.json');
        return await res.json();
    } catch {
        return null;
    }
}

export async function fetchChangelog(){
    try {
        const res = await fetch('/dataextra/changelog.json');
        return await res.json();
    } catch{
        return null;
    }
}

export async function fetchPending(){
    try {
        const res = await fetch('/dataextra/pending.json');
        return await res.json();
    } catch{
        return null;
    }
}