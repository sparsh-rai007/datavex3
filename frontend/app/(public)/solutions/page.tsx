import PublicWrapper from '../wrapper'; // ✅ added

export const metadata = {
  title: 'Core Services - DataVex AI',
  description:
    'Explore how DataVex AI Private Limited delivers intelligent automation across AI, data engineering, full-stack applications, MLOps, and cybersecurity.',
};

const services = [
  {
    title: 'AI & Machine Learning Solutions',
    description:
      'Develop intelligent systems tailored to your business domain—from research prototypes to production-grade deployments.',
    features: [
      'Predictive analytics, natural language processing, and computer vision workloads',
      'Custom model development and LLM fine-tuning for domain-specific needs',
      'AI agents, chatbots, and autonomous decision-support systems',
    ],
  },
  {
    title: 'Data Engineering & Cloud Infrastructure',
    description:
      'Build reliable data estates and cloud foundations that scale with your business and analytics ambitions.',
    features: [
      'Data lakehouse and warehouse architecture with governed pipelines',
      'ETL/ELT workflows using Python, PySpark, and SQL',
      'Cloud-native infrastructure across AWS, Azure, and Google Cloud',
    ],
  },
  {
    title: 'Full-Stack AI Applications',
    description:
      'Deliver end-to-end applications that convert AI insights into intuitive user experiences and APIs.',
    features: [
      'Interactive dashboards, visualisation layers, and executive reporting portals',
      'API and microservice development with FastAPI, Flask, React, and Streamlit',
      'Enterprise integration of AI systems with existing business applications',
    ],
  },
  {
    title: 'MLOps & DevOps Enablement',
    description:
      'Operationalise intelligent systems with modern software delivery, observability, and performance tooling.',
    features: [
      'Model lifecycle management, versioning, and automated CI/CD pipelines',
      'Containerisation with Docker and orchestration via Kubernetes',
      'GPU-based compute clusters, monitoring, and optimisation workflows',
    ],
  },
  {
    title: 'Cybersecurity & AI Defense',
    description:
      'Protect mission-critical systems with AI-assisted monitoring, threat detection, and resilient architectures.',
    features: [
      'AI-driven anomaly detection and predictive threat analytics',
      'Secure data, identity, and network monitoring frameworks',
    ],
  },
];

export default function SolutionsPage() {
  return (
    <PublicWrapper> 

      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-16 space-y-4">
            <h1 className="text-5xl font-bold text-gray-900">
              Intelligent Solutions for Modern Enterprises
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              DataVex AI combines advanced research with scalable engineering to transform complex
              industry challenges into intelligent, automated systems. Explore our core service pillars
              designed to unlock measurable value and sustainable growth.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {services.map((service) => (
              <article
                key={service.title}
                className="h-full p-8 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-shadow"
              >
                <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                  {service.title}
                </h2>
                <p className="text-gray-600 mb-6 leading-relaxed">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-gray-700">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </div>

    </PublicWrapper> 
  );
}
