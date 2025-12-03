import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="w-full py-6 px-8 flex justify-between items-center backdrop-blur-sm bg-dark-900/50 fixed top-0 z-50 border-b border-white/10">
        <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-500 to-purple-500">
          PayMe
        </div>
        <div className="space-x-4">
          <Link href="/admin/login" className="text-gray-300 hover:text-white transition">
            Login
          </Link>
          <Link href="/admin/login" className="bg-primary-600 hover:bg-primary-500 text-white px-5 py-2 rounded-full transition shadow-lg shadow-primary-500/20">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow flex items-center justify-center px-4 pt-20">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Payments made <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-500 via-purple-500 to-pink-500">
              effortless & secure.
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            The simplest way to accept payments globally. Secure, fast, and designed for modern businesses.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 animate-slide-up">
            <Link href="/admin/login" className="bg-white text-dark-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-xl hover:shadow-2xl hover:-translate-y-1">
              Start Accepting Payments
            </Link>
            <button className="px-8 py-4 rounded-full font-bold text-lg border border-white/20 hover:bg-white/10 transition backdrop-blur-sm">
              View Demo
            </button>
          </div>
        </div>
      </main>

      {/* Features Grid */}
      <section className="py-20 px-4 bg-dark-800/50">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Global Payments', desc: 'Accept payments from anywhere in the world with ease.' },
            { title: 'Bank-Grade Security', desc: 'Your data is protected by industry-leading encryption.' },
            { title: 'Instant Settlements', desc: 'Get paid faster with our automated settlement system.' },
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-2xl bg-dark-700/30 border border-white/5 hover:border-primary-500/50 transition hover:bg-dark-700/50 group">
              <h3 className="text-xl font-bold mb-3 group-hover:text-primary-500 transition">{feature.title}</h3>
              <p className="text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-gray-500 text-sm border-t border-white/5">
        © {new Date().getFullYear()} PayMe Inc. All rights reserved.
      </footer>
    </div>
  );
}
