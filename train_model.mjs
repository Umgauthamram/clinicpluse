import fs from 'fs';
import path from 'path';

function trainNaiveBayes() {
    console.log("Loading training data...");
    const csvPath = path.join(process.cwd(), 'public', 'archive', 'training_data.csv');
    
    if (!fs.existsSync(csvPath)) {
        console.error(`Error: Could not find ${csvPath}`);
        return;
    }

    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split('\n').filter(line => line.trim().length > 0);
    
    // Parse headers
    const headers = lines[0].split(',').map(h => h.trim()).filter(h => h.length > 0);
    
    // The last valid header is usually 'prognosis'
    // Some CSVs have trailing commas which add empty headers
    const prognosisIndex = headers.indexOf('prognosis');
    if (prognosisIndex === -1) {
        console.error("Could not find 'prognosis' column.");
        return;
    }

    const symptoms = headers.slice(0, prognosisIndex);
    
    const data = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < prognosisIndex + 1) continue;
        
        const record = {};
        for (let j = 0; j < symptoms.length; j++) {
            record[symptoms[j]] = parseInt(values[j], 10);
        }
        record.prognosis = values[prognosisIndex];
        data.push(record);
    }
    
    const totalRecords = data.length;
    
    const diseasesSet = new Set(data.map(d => d.prognosis));
    const diseases = Array.from(diseasesSet);
    
    console.log(`Found ${symptoms.length} symptoms and ${diseases.length} diseases.`);
    
    const model = {
        symptoms: symptoms,
        diseases: diseases,
        priors: {},
        likelihoods: {}
    };
    
    diseases.forEach(disease => {
        const diseaseData = data.filter(d => d.prognosis === disease);
        const diseaseCount = diseaseData.length;
        
        // Prior probability P(Disease)
        model.priors[disease] = diseaseCount / totalRecords;
        
        // Likelihoods P(Symptom | Disease) with Laplace smoothing (alpha=1)
        model.likelihoods[disease] = {};
        
        symptoms.forEach(symptom => {
            const symptomCount = diseaseData.filter(d => d[symptom] === 1).length;
            // Laplace smoothing: (count + 1) / (total_in_class + 2)
            const prob = (symptomCount + 1) / (diseaseCount + 2);
            model.likelihoods[disease][symptom] = prob;
        });
    });

    const outputPath = path.join(process.cwd(), 'public', 'model_weights.json');
    fs.writeFileSync(outputPath, JSON.stringify(model, null, 2));
    
    console.log(`Model trained successfully! Weights exported to ${outputPath}`);
}

trainNaiveBayes();
