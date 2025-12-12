import PublicWrapper from '../wrapper';

export const metadata = {
  title: 'Use Cases - DATAVEX.ai',
  description:
    'See how businesses use DATAVEX.ai to solve real-world marketing and lead generation challenges.',
};

export default function UseCasesPage() {
  const useCases = [
    {
      industry: 'E-commerce',
      title: 'Increase Online Sales',
      description:
        'Drive more traffic and convert visitors into customers with AI-powered recommendations and intelligent personalization.',
      results: [
        '40% increase in conversion rate',
        '25% reduction in cart abandonment',
        '3x ROI on marketing spend',
      ],
    },
    {
      industry: 'SaaS',
      title: 'Scale Lead Generation',
      description:
        'Automate lead capture, qualification, and nurturing to scale revenue without scaling your team.',
      results: [
        '5x more qualified leads',
        '60% faster sales cycle',
        'Automated lead scoring',
      ],
    },
    {
      industry: 'Real Estate',
      title: 'Generate Property Leads',
      description:
        'Capture leads from multiple channels, qualify them instantly, and automate viewing schedules.',
      results: [
        '3x more property inquiries',
        '50% better lead quality',
        'Automated follow-ups',
      ],
    },
    {
      industry: 'Healthcare',
      title: 'Patient Acquisition',
      description:
        'Acquire and manage patients efficiently with targeted outreach, scheduling automation, and regulatory compliance.',
      results: [
        '2x patient appointments',
        'HIPAA compliant',
        'Reduced no-shows',
      ],
    },
  ];

  // Extract numeric value (40, 5, 3, etc.)
 function extractMetricFromList(results: string[]) {
  for (const text of results) {
    const percentMatch = text.match(/(\d+)%/);
    if (percentMatch) return percentMatch[1] + "%";

    const xMatch = text.match(/(\d+)x/i);
    if (xMatch) return xMatch[1] + "x";
  }
  return ""; // no metric found
}



  return (
    <PublicWrapper>
      <div className="py-20 bg-gradient-to-b from-white via-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="text-center mb-20 animate-fade-in">
            <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
              Real Results for Real Businesses
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Explore how companies across industries use DATAVEX.ai to accelerate growth,
              optimize workflows, and transform customer engagement.
            </p>
          </div>

          {/* Content Blocks */}
          <div className="space-y-20">
            {useCases.map((useCase, index) => (
              <div
                key={index}
                className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center animate-slide-up"
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                {/* Text Section */}
                <div className={index % 2 === 0 ? '' : 'lg:order-2'}>
                  <div className="inline-block px-5 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-medium mb-4 shadow-sm">
                    {useCase.industry}
                  </div>

                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    {useCase.title}
                  </h2>

                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {useCase.description}
                  </p>

                  <ul className="space-y-3">
                    {useCase.results.map((result, idx) => (
                      <li key={idx} className="flex items-start">
                        <svg
                          className="w-6 h-6 text-green-500 mr-3 mt-0.5 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-gray-700 font-medium">{result}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvement Card */}
                <div
                  className={`bg-white shadow-xl border border-gray-100 rounded-xl p-10 h-64 flex items-center justify-center transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${
                    index % 2 === 0 ? '' : 'lg:order-1'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-6xl font-extrabold text-primary-600 mb-2 tracking-tight">
                      {extractMetricFromList(useCase.results)}
                    </div>
                    <div className="text-primary-700 font-semibold text-lg tracking-wide">
                      Average Improvement
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </div>
    </PublicWrapper>
  );
}
