/**
 * Numbers of decimal digits to round to
 */
const scale = 2;

//REMOVE MINPERCENT
/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @returns {Number}
 */

//UPDATED SCORE FUNCTION
export function score(rank, percent) {
    rank = Number(rank);
    percent = Number(percent);

    //if statement cleanup
    if (isNaN(rank) || isNaN(percent)) return 0;
    if (rank > 50) return 0;

    //list formula
    let base = 1 + 99 * Math.pow(1 - (rank - 1) / 49, 2.1);
    let score = base * (percent / 100);

    score = Math.max(0, Math.min(100, score));

    if (percent !== 100) {
        score -= score / 3;
    }

    return round(score);
}

export function round(num) {
    //RETURN 0 IF NAN
    if (isNaN(num)) return 0;
    return Math.round(num * 100) / 100;
}
//SCRUFFIE WAS HERE :3