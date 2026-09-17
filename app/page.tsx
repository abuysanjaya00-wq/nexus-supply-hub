import Link from 'next/link';
import { 
  Building2, 
  Boxes, 
  Sparkles, 
  ShieldCheck, 
  Globe2, 
  ArrowRight, 
  MessageSquare
} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      
      {/* 1. ??????(Navbar) */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
              N
            </div>
            <span className="font-extrabold text-xl tracking-tight text-slate-900">
              NexusSupply <span className="text-indigo-600">Hub</span>
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-600">
            <Link href="#features" className="hover:text-indigo-600 transition">Advantages</Link>
            <Link href="#clusters" className="hover:text-indigo-600 transition">Industrial Clusters</Link>
            <Link href="/products" className="hover:text-indigo-600 transition">Supply Catalog</Link>
            <Link href="#contact" className="hover:text-indigo-600 transition">Partner With Us</Link>
          </nav>

          <div className="flex items-center space-x-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-700 hover:text-indigo-600 px-3 py-2 transition"
            >
              Sign In
            </Link>
            <Link 
              href="/products" 
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
            >
              Explore Catalog
            </Link>
          </div>
        </div>
      </header>

      {/* 2. ???? (Hero Section) */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-32 lg:pb-32 bg-gradient-to-b from-white via-indigo-50/30 to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          
          <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 px-3.5 py-1.5 rounded-full text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-4 h-4" />
            <span>Direct Sourcing from Verified Industrial Leaders</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight">
            Scale Your Global Store with <span className="text-indigo-600">Verified Supply Hub</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Connect directly with China?s premier industrial clusters. Zero minimum order limitations for dropshippers, complete OEM/ODM solutions, and AI-powered listing tools.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link 
              href="/products" 
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-indigo-200 transition flex items-center justify-center space-x-2 text-base"
            >
              <span>Explore Supply Catalog</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            
            <Link 
              href="/products" 
              className="w-full sm:w-auto bg-white hover:bg-slate-100 text-slate-800 font-semibold px-8 py-4 rounded-xl border border-slate-300 shadow-sm transition flex items-center justify-center space-x-2 text-base"
            >
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              <span>Apply for Partnership</span>
            </Link>
          </div>

          {/* ????????*/}
          <div className="mt-16 pt-10 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-slate-500 text-sm font-medium">
            <div className="flex items-center justify-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>100% Verified Factories</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Boxes className="w-5 h-5 text-indigo-600" />
              <span>Dropship & Bulk Ready</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Globe2 className="w-5 h-5 text-indigo-600" />
              <span>Global Fast Shipping</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <span>AI Listing Integration</span>
            </div>
          </div>

        </div>
      </section>

      {/* 3. ?????? (Why Choose Us) */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Why Global Sellers Choose NexusSupply
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              We bridge the gap between top-tier manufacturing clusters and modern e-commerce entrepreneurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-2xl hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Industrial Leaders Direct</h3>
              <p className="text-slate-600 leading-relaxed">
                Source directly from industry benchmarks and leading manufacturing clusters without multi-layer middlemen markup.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-2xl hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Boxes className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Zero MOQ Dropshipping</h3>
              <p className="text-slate-600 leading-relaxed">
                Test products instantly with 1-piece minimum order quantities, or scale into full custom OEM/ODM production runs.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-8 rounded-2xl hover:shadow-md transition">
              <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">AI-Powered Listing</h3>
              <p className="text-slate-600 leading-relaxed">
                Transform raw product data into high-converting Etsy, Amazon, or Shopify listings instantly with our built-in AI tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. ??????? (Industrial Clusters) */}
      <section id="clusters" className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">Featured Industrial Clusters</h2>
              <p className="mt-2 text-slate-600">Explore our rigorously selected manufacturing sectors.</p>
            </div>
            <Link href="/products" className="mt-4 md:mt-0 text-indigo-600 font-semibold hover:text-indigo-700 flex items-center space-x-1">
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {['Smart Home & Living', 'Eco-Friendly Goods', 'Advanced Tech & Gadgets', 'Custom OEM Solutions'].map((cluster, idx) => (
              <div key={idx} className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition cursor-pointer">
                <div className="h-40 bg-indigo-50 rounded-xl mb-4 flex items-center justify-center text-indigo-400 font-medium group-hover:bg-indigo-100 transition">
                  [ Cluster Image {idx + 1} ]
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{cluster}</h3>
                <p className="text-sm text-slate-500">Verified Industrial Leaders & Direct Supply</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ???? (Footer) */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center space-x-3 mb-4 md:mb-0">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
              N
            </div>
            <span className="text-white font-bold tracking-tight">NexusSupply Hub</span>
          </div>
          <p className="text-sm">
            ? {new Date().getFullYear()} NexusSupply Hub. Empowering Global Cross-Border E-Commerce.
          </p>
        </div>
      </footer>

    </div>
  );
}
