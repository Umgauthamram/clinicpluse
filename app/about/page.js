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
                        { step: '01', title: 'Data Collection', desc: 'Clinic visit records are ingested as JSON files containing symptom counts per month. Each count represents individual patient encounters reporting that symptom. Data can be uploaded via the Upload module or generated from the clinic management system.' },
                        { step: '02', title: 'Data Processing', desc: 'Incoming data is normalized on ingestion — symptom names are standardized, month ordering is validated, and missing values default to zero. The system dynamically detects which months are present in the dataset without any hardcoded assumptions.' },
                        { step: '03', title: 'Exploratory Data Analysis (EDA)', desc: 'Monthly totals, dominant symptoms, and peak months are computed in real-time. Trend directions are derived from month-over-month deltas. All analytics auto-scale to the current data window without manual configuration.' },
                        { step: '04', title: 'Spike & Pattern Detection', desc: 'Seasonal spikes are flagged when a symptom exceeds 1.5x its rolling average in a given month. The system also detects critical volume thresholds and inflammatory waves using dynamic breakpoints derived from the data itself.' },
                        { step: '05', title: 'AI Diagnosis Engine (Gemini 2.5 Flash)', desc: 'Clinical notes are processed via Google Gemini AI to extract structured symptoms and generate differential diagnosis predictions with confidence scores. The medical knowledge base (500+ conditions) is cross-referenced against observed symptom patterns for automated correlation.' },
                        { step: '06', title: 'Visualization & Reporting', desc: 'Insights are presented through interactive dashboards featuring Line charts, Bar charts, Heatmaps, Pie charts, and Area charts. Full clinical intelligence reports can be exported for stakeholder review.' },
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
