export default function AboutPage() {
    return (
        <div className="p-6 lg:p-10 space-y-10 max-w-[1000px] mx-auto">
            <div>
                <h1 className="text-3xl font-black tracking-tight" style={{ color: '#1a1a2e' }}>
                    About
                </h1>
                <p className="text-sm mt-1" style={{ color: '#6b7c8a' }}>How the analysis works</p>
            </div>

            {/* Problem Statement */}
            <div className="rounded-3xl p-8 lg:p-10 shadow-lg text-white" style={{ background: '#1a1a2e' }}>
                <p className="text-[10px] font-black uppercase tracking-widest mb-4" style={{ color: '#66BB6A' }}>Problem Statement</p>
                <p className="text-lg font-medium italic leading-relaxed border-l-4 pl-6 py-2" style={{ borderColor: '#2E7D32', color: 'rgba(255,255,255,0.85)' }}>
                    "Small community clinics lack tools to understand disease patterns such as seasonal outbreaks or common symptoms. How might data analysis support early diagnosis and treatment planning?"
                </p>
            </div>

            {/* Methodology */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
                <h3 className="text-sm font-black uppercase tracking-wider mb-6" style={{ color: '#1a1a2e' }}>How the Analysis Works</h3>
                <div className="space-y-6">
                    {[
                        { step: '01', title: 'Data Collection', desc: 'Raw clinic logs are collected as JSON files containing symptom counts mapped to monthly buckets. Each count represents one patient visit reporting that symptom.' },
                        { step: '02', title: 'Data Cleaning', desc: 'Missing values are handled via mode imputation. Duplicates from system synchronization errors are removed. Symptom names are standardized to Proper Case for consistent grouping.' },
                        { step: '03', title: 'Exploratory Data Analysis (EDA)', desc: 'We compute monthly totals, identify peak symptoms, and analyze trend directions (↑ increasing, ↓ decreasing, → stable) across the 3-month period.' },
                        { step: '04', title: 'Pattern Detection', desc: 'Seasonal spikes are identified when a symptom exceeds 1.8x its average in a given month. Symptom clusters (Respiratory, Ocular) are detected via co-occurrence analysis.' },
                        { step: '05', title: 'AI Diagnosis Engine', desc: 'Rule-based inference maps symptom combinations to likely conditions: Fever + Cough → Flu, Sneezing + Itchy Eyes → Allergic Rhinitis. Confidence scores are derived from case density ratios.' },
                        { step: '06', title: 'Visualization & Communication', desc: 'Insights are presented through 7 chart types (Line, Bar, Box, Histogram, Heatmap, Scatter, Pie) and text-based AI-generated summaries for doctor-friendly communication.' },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-6 items-start">
                            <div className="text-sm font-black text-emerald-600 mt-1">
                                {item.step}
                            </div>
                            <div>
                                <h4 className="text-sm font-black" style={{ color: '#1a1a2e' }}>{item.title}</h4>
                                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#6b7c8a' }}>{item.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


        </div>
    );
}
