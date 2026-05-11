export async function predictDisease(extractedSymptoms) {
    try {
        const response = await fetch('/model_weights.json');
        if (!response.ok) throw new Error("Could not load model weights");
        const model = await response.json();

        const { symptoms, diseases, priors, likelihoods } = model;

        // Clean extracted symptoms: lower case and replace spaces with underscores to match dataset
        const cleanedSymptoms = extractedSymptoms.map(s => s.toLowerCase().replace(/ /g, '_'));

        const diseaseScores = [];
        let matchedSymptomCount = 0;

        diseases.forEach(disease => {
            // Start with log of prior probability to avoid underflow
            let logScore = Math.log(priors[disease]);

            symptoms.forEach(symptom => {
                const prob = likelihoods[disease][symptom];
                // If the symptom is present in the extracted list
                if (cleanedSymptoms.some(s => symptom.includes(s) || s.includes(symptom))) {
                    logScore += Math.log(prob);
                    // Only count matches on the first disease iteration to avoid overcounting
                    if (disease === diseases[0]) {
                        matchedSymptomCount++;
                    }
                } else {
                    logScore += Math.log(1 - prob);
                }
            });

            diseaseScores.push({ disease, logScore });
        });

        // If none of the extracted symptoms match our database, return no prediction
        // instead of defaulting to the base mathematical priors (Allergy)
        if (matchedSymptomCount === 0) {
            return [];
        }

        // Convert log scores back to probabilities (Softmax)
        const maxLogScore = Math.max(...diseaseScores.map(d => d.logScore));
        
        let sumExp = 0;
        const expScores = diseaseScores.map(d => {
            const exp = Math.exp(d.logScore - maxLogScore); // subtract max for numerical stability
            sumExp += exp;
            return { disease: d.disease, exp };
        });

        const probabilities = expScores.map(d => ({
            disease: d.disease,
            probability: (d.exp / sumExp) * 100
        }));

        // Sort by highest probability
        probabilities.sort((a, b) => b.probability - a.probability);

        // Return top 3
        return probabilities.slice(0, 3);
        
    } catch (error) {
        console.error("Prediction Error:", error);
        return [];
    }
}
