import PublicWrapper from "../wrapper";

export const metadata = {
  title: "About Us - DataVex AI Private Limited",
  description:
    "Discover how DataVex AI blends advanced research, scalable engineering, and automation to deliver intelligent, industry-ready AI solutions.",
};

const coreServices = [
  {
    title: "AI & Machine Learning Solutions",
    points: [
      "Predictive analytics, NLP, and computer vision systems",
      "LLM fine-tuning and custom AI model development",
      "AI agents, chatbots, and autonomous decision systems",
    ],
  },
  {
    title: "Data Engineering & Cloud Infrastructure",
    points: [
      "Scalable data pipelines and lakehouse architectures",
      "ETL workflows using Python, PySpark, and SQL",
      "Cloud-native deployments across AWS, Azure, and GCP",
    ],
  },
  {
    title: "Full-Stack AI Applications",
    points: [
      "AI-powered dashboards and visualization layers",
      "API development with FastAPI, Flask, React, and Streamlit",
      "Integration of AI systems with business workflows",
    ],
  },
  {
    title: "MLOps & DevOps",
    points: [
      "CI/CD automation, model versioning, and observability",
      "Container orchestration using Docker & Kubernetes",
      "GPU clusters and performance scaling strategies",
    ],
  },
  {
    title: "Cybersecurity & AI Defense",
    points: [
      "AI-driven anomaly detection and predictive threat modeling",
      "Secure data pipelines and network monitoring",
    ],
  },
];

export default function AboutPage() {
  return (
    <PublicWrapper>
      <div className="pt-20 pb-20"> {/* ✅ GLOBAL OFFSET */}


        {/* HERO */}
        <section className="pt-28 pb-24 bg-gradient-to-b from-gray-50 via-white to-gray-100">
          <div className="max-w-6xl mx-auto px-4 text-center space-y-6">
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
              DataVex AI Private Limited
            </h1>

            <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
              DataVex AI is a visionary technology company specializing in
              Artificial Intelligence, Data Engineering, Cloud Systems, and
              Digital Transformation.
            </p>

            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Our mission is simple — empower organizations to harness the power
              of intelligent systems, driving measurable impact, operational
              efficiency, and sustainable growth.
            </p>
          </div>
        </section>

        {/* NOTE: Added explicit top margin so the Vision card doesn't overlap */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">

          {/* VISION - fixed spacing and container width */}
          <section className="mt-12 md:mt-16">
            <div className="max-w-5xl mx-auto">
              <div className="bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-10 md:p-14 shadow-md border border-primary-200">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
                  To become a global leader in AI-driven innovation — enabling
                  industries to evolve intelligently through automation, analytics,
                  and adaptive technologies.
                </p>
              </div>
            </div>
          </section>

          {/* CORE SERVICES */}
          <section className="space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-4xl font-bold text-gray-900">Core Services</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                We design and deliver end-to-end AI solutions that convert
                complex problems into intelligent, scalable systems.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {coreServices.map((service) => (
                <div
                  key={service.title}
                  className="p-8 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {service.title}
                  </h3>

                  <ul className="space-y-3 text-gray-700">
                    {service.points.map((point) => (
                      <li key={point} className="flex gap-3 items-start">
                        <span className="h-2 w-2 bg-primary-500 rounded-full mt-2" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* TRAINING & INTERNSHIP */}
          <section className="bg-white rounded-2xl shadow-md border border-gray-200 p-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Training & Internship Initiatives
            </h2>
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl">
              DataVex provides structured internship and mentorship programs for
              engineering students, offering hands-on experience in AI/ML,
              data engineering, and full-stack development. Interns work on live
              projects, gain industry-level exposure, and develop skills aligned
              with real-world technical demands.
            </p>
          </section>

          {/* CORPORATE / CONTACT */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Corporate Details
              </h3>

              <div className="space-y-3 text-gray-700 text-lg">
                <p>
                  <span className="font-semibold">Registered Office:</span><br />
                  Lotus Paradise Plaza, 2nd Floor, Bendorwell, Mangalore – 575002
                </p>
                <p><span className="font-semibold">CIN:</span> U63119KA2025PTC205656</p>
                <p><span className="font-semibold">GSTIN:</span> 29AALCD8784G1ZX</p>
              </div>
            </div>

            <div className="p-10 bg-white border border-gray-200 rounded-2xl shadow-sm">
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                Connect With Us
              </h3>

              <div className="space-y-3 text-gray-700 text-lg">
                <p>
                  <span className="font-semibold">Email:</span>{" "}
                  <a
                    href="mailto:info@datavex.ai"
                    className="text-primary-600 hover:underline"
                  >
                    info@datavex.ai
                  </a>
                </p>

                <p>
                  <span className="font-semibold">Website:</span>{" "}
                  <a
                    href="https://www.datavex.ai"
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary-600 hover:underline"
                  >
                    www.datavex.ai
                  </a>
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>
    </PublicWrapper>
  );
}
