import { apiClient } from '@/lib/api';
import PublicWrapper from '../../wrapper';
import { redirect } from 'next/navigation';

interface BlogPageProps {
  params: {
    slug: string;
  };
}

function formatBlog(text: string) {
  if (!text) return '';

  return text
    .replace(/##\s+/g, '\n\n## ')
    .replace(/###\s+/g, '\n\n### ')

    .replace(/(\d+\.)\s+/g, '\n$1 ')

    .replace(/\*\s+/g, '\n* ')

    .replace(/^## (.*$)/gim, '<h2 class="text-3xl font-black text-slate-900 mt-12 mb-6">$1</h2>')
    .replace(/^### (.*$)/gim, '<h3 class="text-2xl font-black text-slate-900 mt-10 mb-4">$1</h3>')

    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')

    .replace(/^\* (.*$)/gim, '<li class="ml-6 mb-3 list-disc text-slate-600">$1</li>')

    .replace(/^\d+\.\s+(.*$)/gim, '<li class="ml-6 mb-3 list-decimal text-slate-600">$1</li>')

    .replace(/`(.*?)`/gim, '<code class="bg-slate-100 px-2 py-0.5 rounded text-primary-700 font-mono text-sm">$1</code>')

    .replace(/\n\n+/gim, '</p><p class="mb-6 leading-relaxed text-slate-600">')

    .replace(/^(?!<h|<li)(.+)$/gim, '<p class="mb-6 leading-relaxed text-slate-600">$1</p>');
}

export default async function BlogDetailPage({ params }: BlogPageProps) {
  const { slug } = params;

  const blog = await apiClient.getPublicBlog(slug).catch(() => null);

  if (!blog) {
    return (
      <PublicWrapper>
        <div className="py-32 text-center">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Intelligence Not Found</h1>
          <p className="text-slate-400 font-medium">This architectural record does not exist.</p>
        </div>
      </PublicWrapper>
    );
  }

  // Redirect if external source exists
  if (blog.external_url) {
    redirect(blog.external_url);
  }

  const formattedContent = formatBlog(blog.content || '');

  return (
    <PublicWrapper>
      <div className="max-w-4xl mx-auto px-6 py-24 font-outfit">

        {/* Release Label */}
        <div className="flex items-center gap-4 mb-8">
          <span className="px-4 py-1.5 bg-primary-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-primary-600/20">
            {blog.category || "Intelligence Release"}
          </span>
          <div className="h-px flex-1 bg-slate-100" />
        </div>

        {/* Neural Title */}
        <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-10">
          {blog.title}
        </h1>

        {/* Narrative Context */}
        <div className="flex items-center gap-6 mb-16 py-8 border-y border-slate-50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Author Trace</span>
            <span className="text-xs font-black text-slate-900 uppercase tracking-widest">{blog.author_name || "DataVex Architect"}</span>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Retrieval Date</span>
            <span className="text-xs font-black text-slate-600 uppercase tracking-widest">{new Date(blog.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>

        {/* Featured Matrix Image */}
        {blog.featured_image && (
          <div className="mb-20 rounded-[3rem] overflow-hidden shadow-2xl shadow-slate-200/50 group">
            <img
              src={blog.featured_image}
              alt={blog.title}
              className="w-full h-auto max-h-[500px] object-cover transition-transform duration-1000 group-hover:scale-105"
            />
          </div>
        )}

        {/* Rendered Intelligence Matrix */}
        <article
          className="prose prose-slate prose-xl max-w-none prose-headings:font-black prose-strong:text-slate-900"
          dangerouslySetInnerHTML={{ __html: formattedContent }}
        />

        {/* Global Footer Context */}
        <div className="mt-40 pt-12 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">© {new Date().getFullYear()} DATAVEX.ai — ALL RIGHTS RESERVED.</p>
          <div className="flex gap-8">
            {['Authority', 'Synthesis', 'Integrity'].map(word => (
              <span key={word} className="text-[9px] font-black text-slate-200 uppercase tracking-[0.4em]">{word}</span>
            ))}
          </div>
        </div>

      </div>
    </PublicWrapper>
  );
}
