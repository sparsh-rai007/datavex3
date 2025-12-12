import Link from 'next/link';
import PublicWrapper from '../wrapper'; // ✅ added

export const metadata = {
  title: 'Resources - DATAVEX.ai',
  description:
    'Access guides, tutorials, and resources to help you get the most out of DATAVEX.ai.',
};

export default function ResourcesPage() {
  const resources = [
    {
      category: 'Getting Started',
      title: 'Quick Start Guide',
      description:
        'Learn how to set up your account and start generating leads in minutes.',
      type: 'Guide',
    },
    {
      category: 'Best Practices',
      title: 'Lead Generation Strategies',
      description:
        'Discover proven strategies for capturing and converting more leads.',
      type: 'Article',
    },
    {
      category: 'Tutorials',
      title: 'Setting Up Automation Workflows',
      description:
        'Step-by-step guide to creating powerful marketing automation workflows.',
      type: 'Tutorial',
    },
    {
      category: 'Case Studies',
      title: 'How Company X Increased Leads by 300%',
      description:
        'Real-world example of how a business transformed their lead generation.',
      type: 'Case Study',
    },
  ];

  return (
    <PublicWrapper>
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Resources & Guides
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to succeed with DATAVEX.ai, from getting
              started guides to advanced strategies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource, index) => (
              <div
                key={index}
                className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-shadow p-6"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-primary-600 uppercase">
                    {resource.category}
                  </span>
                  <span className="text-xs text-gray-500">{resource.type}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {resource.title}
                </h3>
                <p className="text-gray-600 mb-4">{resource.description}</p>
                <Link
                  href="/blog"
                  className="text-primary-600 hover:text-primary-700 font-medium text-sm"
                >
                  Read More →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PublicWrapper>
  );
}
