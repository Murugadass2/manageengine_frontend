import React, { useState, useEffect } from 'react';
import { kbApi } from '../services/api';
import { KnowledgeArticle } from '../types';
import { BookOpen, Search, ThumbsUp, Eye, FileText, ChevronRight, X, Sparkles } from 'lucide-react';

export const KnowledgeBasePage: React.FC = () => {
  const [articles, setArticles] = useState<KnowledgeArticle[]>([]);
  const [search, setSearch] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    try {
      const data = await kbApi.getAll({ search: search || undefined });
      setArticles(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRateHelpful = async (id: string) => {
    try {
      const updated = await kbApi.rateHelpful(id);
      if (selectedArticle && selectedArticle.id === id) {
        setSelectedArticle({ ...selectedArticle, helpfulCount: updated.helpfulCount });
      }
      loadArticles();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Search Hero */}
      <div className="bg-gradient-to-r from-navy-950 via-navy-900 to-navy-800 text-white p-8 rounded-2xl border border-navy-700 shadow-card-elevated text-center">
        <div className="w-12 h-12 rounded-2xl bg-gold-500/20 text-gold-400 border border-gold-500/30 flex items-center justify-center mx-auto mb-3">
          <BookOpen className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          Hotel Knowledge Base & Self-Service
        </h1>
        <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
          Instant operational troubleshooting guides, equipment manuals, and standard guest service protocols
        </p>

        {/* Global KB Search (Matching Mockup Panel 10) */}
        <div className="relative max-w-lg mx-auto mt-6">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && loadArticles()}
            placeholder="Search articles... e.g. WiFi, AC reset, Printer..."
            className="w-full bg-navy-900/90 text-white border border-navy-700 rounded-xl pl-11 pr-4 py-3 text-xs focus:ring-2 focus:ring-gold-500 font-medium placeholder-slate-400 shadow-inner"
          />
        </div>
      </div>

      {/* Articles Cards Grid (Matching Mockup Panel 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {articles.map((art) => (
          <div
            key={art.id}
            onClick={() => setSelectedArticle(art)}
            className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-gold-400/80 hover:shadow-card-elevated cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                <span className="font-semibold uppercase tracking-wider text-gold-600 bg-gold-50 px-2 py-0.5 rounded-full border border-gold-200">
                  {art.category.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1 font-mono">
                  <Eye className="w-3 h-3" /> {art.viewsCount}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-gold-600 transition-colors line-clamp-1">
                {art.title}
              </h3>
              <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
                {art.summary}
              </p>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                <ThumbsUp className="w-3 h-3" /> {art.helpfulCount} helpful
              </span>
              <span className="text-navy-950 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                Read Guide <ChevronRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Reader Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/70 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] overflow-y-auto my-8">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-gold-600 tracking-wider">
                  {selectedArticle.category.replace('_', ' ')}
                </span>
                <h2 className="text-lg font-bold text-navy-950 mt-1">{selectedArticle.title}</h2>
              </div>
              <button
                onClick={() => setSelectedArticle(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line font-sans border-b border-slate-100">
              {selectedArticle.content}
            </div>

            <div className="pt-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">Was this article helpful to you?</span>
              <button
                onClick={() => handleRateHelpful(selectedArticle.id)}
                className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Helpful ({selectedArticle.helpfulCount})</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
