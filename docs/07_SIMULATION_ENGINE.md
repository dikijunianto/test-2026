# Simulation Engine

## Goal

Allow users to simulate match results without changing source data.

---

# Inputs

matches.json

+

user predictions

---

# Outputs

simulated standings

simulated qualified teams

simulated bracket

---

# Ranking Rules

1. Points

2. Goal Difference

3. Goals Scored

4. Head To Head

---

# Points

Win = 3

Draw = 1

Loss = 0

---

# Restrictions

Simulation MUST NOT:

- write files
- modify JSON
- call provider

Simulation MUST ONLY use in-memory state.

---

# Required Functions

recalculateStandings()

calculateQualification()

generateBracket()