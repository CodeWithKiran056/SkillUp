/* =============================================================
   Deterministic multi-factor partner matching.

   Weighted score (normalized to 0-100):
     Skills                 50%
     Interests              30%
     Learning Requirements  20%

   - Case-insensitive, whitespace-trimmed comparison.
   - Duplicate values are removed before scoring.
   - No randomness, no invented data, no hardcoded users.
   ============================================================= */

const normalizeList = (value) => {

    if (!Array.isArray(value)) {
        return [];
    }

    const seen = new Set();

    return value
        .filter(item => typeof item === "string")
        .map(item => item.trim().toLowerCase())
        .filter(item => {

            if (!item || seen.has(item)) {
                return false;
            }

            seen.add(item);
            return true;

        });

};


const intersection = (listA, listB) =>
    listA.filter(item => listB.includes(item));


// Overlap relative to the smaller side.
// 1 means the smaller list is fully covered by the other.

const coverageRatio = (overlapCount, lenA, lenB) => {

    if (lenA === 0 || lenB === 0) {
        return 0;
    }

    return overlapCount / Math.min(lenA, lenB);

};


const calculateMatchScore = (
    currentUser = {},
    targetUser = {}
) => {

    const userSkills =
        normalizeList(currentUser.skills);

    const targetSkills =
        normalizeList(targetUser.skills);

    const userInterests =
        normalizeList(currentUser.interests);

    const targetInterests =
        normalizeList(targetUser.interests);

    const userRequirements =
        normalizeList(currentUser.learningRequirements);

    const targetRequirements =
        normalizeList(targetUser.learningRequirements);


    /* ---- Factor 1: Skills (50%) ---- */

    const commonSkills =
        intersection(userSkills, targetSkills);

    // Partner skills the current user does not have yet
    const missingSkills = targetSkills.filter(
        skill => !userSkills.includes(skill)
    );

    const skillRatio = coverageRatio(
        commonSkills.length,
        userSkills.length,
        targetSkills.length
    );


    /* ---- Factor 2: Interests (30%) ---- */

    const commonInterests =
        intersection(userInterests, targetInterests);

    const interestRatio = coverageRatio(
        commonInterests.length,
        userInterests.length,
        targetInterests.length
    );


    /* ---- Factor 3: Learning Requirements (20%) ----
       A requirement signal is counted when:
       - the partner already has that skill
         (they can help me learn it), or
       - we share the same learning goal, or
       - my skills satisfy a partner requirement
         (I can help them).                       */

    const partnerCanHelpWith =
        intersection(userRequirements, targetSkills);

    const youCanHelpWith =
        intersection(targetRequirements, userSkills);

    const commonRequirements =
        intersection(userRequirements, targetRequirements);

    const requirementSignals = new Set([
        ...partnerCanHelpWith,
        ...youCanHelpWith,
        ...commonRequirements,
    ]);

    const totalRequirementSlots =
        userRequirements.length + targetRequirements.length;

    const requirementRatio =
        totalRequirementSlots === 0
            ? 0
            : Math.min(
                requirementSignals.size / totalRequirementSlots,
                1
            );


    /* ---- Weighted score, normalized to 0-100 ---- */

    const raw =
        skillRatio * 0.5 +
        interestRatio * 0.3 +
        requirementRatio * 0.2;

    const score = Math.round(raw * 100);


    return {
        score,
        commonSkills,
        missingSkills,
        commonInterests,
        commonRequirements,
        partnerCanHelpWith,
        youCanHelpWith,
    };

};


module.exports = calculateMatchScore;
