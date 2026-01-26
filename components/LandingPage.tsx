import React, { useState } from 'react';
import { ArrowRight, BrainCircuit, Activity, Book, ShieldCheck, Users, BarChart2, CheckCircle2, LifeBuoy, UserPlus, Mail, Phone, MapPin, Calendar, LogIn, X } from 'lucide-react';
import { ViewState, Specialty, SPECIALTIES, AdminPost, UserRole } from '../types';
import PostDetailModal from './PostDetailModal';
import BackendToggle from './auth/BackendToggle';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (view: ViewState) => void;
  onRegister: (userData: any) => void;
  onLoginSuccess: (role: UserRole) => void;
  onDemoLogin?: () => void;
  logoUrl: string;
  posts: AdminPost[];
}

const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onNavigate,
  onRegister,
  onLoginSuccess,
  onDemoLogin,
  logoUrl,
  posts,
}) => {
  const [selectedPost, setSelectedPost] = useState<AdminPost | null>(null);

  const handleRegistrationClick = () => {
    onGetStarted(); // Changed to use the correct handler
  };

  const handleLoginClick = () => {
    onDemoLogin?.(); // Changed to show the login form
  };

  const handleDemoClick = () => {
    if (onDemoLogin) return onDemoLogin();
    return handleLoginClick();
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          <img 
            src={logoUrl} 
            alt="Sinaesta" 
            className="h-8 sm:h-10 w-auto cursor-pointer" 
            onClick={() => onNavigate('LANDING')}
          />
          
          <div className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-medium text-gray-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Fitur Utama</a>
            <a href="#prodi" className="hover:text-indigo-600 transition-colors">Program Studi</a>
            <a href="#pricing" className="hover:text-indigo-600 transition-colors">Biaya</a>
            <button 
                onClick={() => onNavigate('SUPPORT')} 
                className="hover:text-indigo-600 transition-colors flex items-center gap-1"
            >
                Bantuan
            </button>
          </div>

          <div className="flex gap-2 sm:gap-3 lg:gap-4">
            <button onClick={handleLoginClick} className="text-xs sm:text-sm font-bold text-gray-900 hover:text-indigo-600 px-2 sm:px-4 py-1.5 sm:py-2">
              Masuk
            </button>
            <button 
              onClick={handleRegistrationClick}
              className="bg-gray-900 text-white px-3 sm:px-4 lg:px-5 py-1.5 sm:py-2 lg:py-2.5 rounded-full text-xs sm:text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              Daftar Sekarang
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-3 sm:px-4 py-1 sm:py-1.5 mb-6 sm:mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span className="text-[10px] sm:text-xs font-bold text-indigo-700 uppercase tracking-wide">Platform Persiapan PPDS Terbaik #1</span>
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight text-gray-900 mb-4 sm:mb-6 leading-[1.1] px-2">
          Raih Impian Menjadi <br className="hidden sm:block"/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dokter Spesialis</span>
        </h1>
        
        <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-500 max-w-2xl mb-8 sm:mb-10 leading-relaxed px-4">
          Sinaesta adalah platform belajar cerdas berbasis AI yang dirancang khusus untuk persiapan ujian masuk PPDS. Latihan soal vignette, simulasi klinis, dan analisis kelemahan secara real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto justify-center px-4">
          <button 
            onClick={handleRegistrationClick}
            className="bg-indigo-600 text-white h-12 sm:h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95"
          >
            Mulai Belajar Gratis <ArrowRight size={18} className="sm:w-5 sm:h-5" />
          </button>
          <button
            onClick={handleDemoClick}
            className="bg-white text-gray-900 border border-gray-200 h-12 sm:h-14 px-6 sm:px-8 rounded-full text-base sm:text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Lihat Demo
          </button>
        </div>

        <div className="mt-10 sm:mt-12 lg:mt-16 w-full max-w-5xl bg-gray-900 rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-2xl overflow-hidden ring-1 ring-gray-900/10">
           <div className="bg-gray-800 rounded-lg sm:rounded-xl overflow-hidden relative aspect-[16/9]">
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
                  <div className="text-center px-4">
                      <Activity className="mx-auto text-indigo-400 mb-3 sm:mb-4 h-12 w-12 sm:h-16 sm:w-16 opacity-50" />
                      <p className="text-gray-400 font-medium text-sm sm:text-base">Dashboard Simulasi Ujian & Analitik</p>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 px-4">Fitur Lengkap untuk Calon Spesialis</h2>
            <p className="text-sm sm:text-base text-gray-500 px-4">Kami menyediakan semua alat yang Anda butuhkan untuk menguasai materi klinis dan lolos seleksi.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="text-indigo-600" size={24} />}
              title="Clinical Reasoning AI"
              desc="Latihan soal bertingkat (step-by-step) untuk mengasah logika diagnosis dan tatalaksana dengan scoring presisi."
            />
            <FeatureCard 
              icon={<ShieldCheck className="text-green-600" size={24} />}
              title="Virtual OSCE"
              desc="Simulasi ujian lisan dengan checklist mandiri, timer stasiun, dan skenario kasus realistis."
            />
            <FeatureCard 
              icon={<Book className="text-blue-600" size={24} />}
              title="E-Logbook & Portofolio"
              desc="Catat kasus dan tindakan klinis Anda, lengkap dengan verifikasi supervisor digital."
            />
            <FeatureCard 
              icon={<Activity className="text-red-600" size={24} />}
              title="Bank Soal Vignette"
              desc="Ribuan soal cerita kasus panjang dengan lampiran EKG, Radiologi, dan Lab serial."
            />
            <FeatureCard 
              icon={<BarChart2 className="text-orange-600" size={24} />}
              title="Smart Analytics"
              desc="Peta kekuatan dan kelemahan personal. Bandingkan performa Anda dengan cohort nasional."
            />
            <FeatureCard 
              icon={<Users className="text-purple-600" size={24} />}
              title="Mentor Marketplace"
              desc="Booking sesi privat dengan residen senior atau konsulen untuk review logbook dan mock exam."
            />
          </div>
        </div>
      </section>

      {/* Admin Posts / News Section */}
      {posts && posts.filter(p => p.published).length > 0 && (
      <section id="news" className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Berita & Update</h2>
            <p className="text-gray-500">Informasi terbaru seputar seleksi PPDS dan fitur Sinaesta.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {posts.filter(p => p.published).map(post => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full group">
                {post.imageUrl && <div className="h-48 overflow-hidden"><img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /></div>}
                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-2">
                       <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wide">News</span>
                       <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 flex-1 line-clamp-3">{post.excerpt}</p>
                  <button 
                    onClick={() => setSelectedPost(post)}
                    className="text-indigo-600 font-bold text-sm hover:underline self-start flex items-center gap-1"
                  >
                      Baca Selengkapnya <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Specialty Marquee or List */}
      <section id="prodi" className="py-12 sm:py-16 lg:py-20 bg-white border-t border-gray-100 overflow-hidden">
         <div className="text-center mb-6">
            <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-400 uppercase tracking-widest">Tersedia untuk berbagai prodi</h3>
         </div>
         <div className="flex justify-center flex-wrap gap-2 sm:gap-3 lg:gap-4 max-w-5xl mx-auto px-4">
            {['Penyakit Dalam', 'Bedah', 'Anak', 'Obgyn', 'Kardiologi', 'Neurologi', 'Anestesi', 'Radiologi', 'Mata', 'THT', 'Psikiatri', 'Kulit & Kelamin'].map((spec) => (
                <span key={spec} className="px-3 sm:px-4 lg:px-6 py-1.5 sm:py-2 bg-gray-50 rounded-full text-gray-600 font-bold border border-gray-200 text-xs sm:text-sm">
                    {spec}
                </span>
            ))}
         </div>
      </section>

      {/* CTA Bottom */}
      <section id="pricing" className="py-16 sm:py-20 lg:py-24 bg-gray-900 text-white text-center px-4">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 sm:mb-6 px-4">Siap Menjadi Spesialis?</h2>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg mb-8 sm:mb-10 max-w-2xl mx-auto px-4">
               Bergabunglah dengan ribuan dokter umum lainnya yang telah mempercayakan persiapan PPDS mereka pada Sinaesta.
            </p>
            <button 
              onClick={handleRegistrationClick}
              className="bg-indigo-600 text-white h-12 sm:h-14 lg:h-16 px-8 sm:px-10 rounded-full text-base sm:text-lg lg:text-xl font-bold hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/50 active:scale-95"
            >
               Buat Akun Gratis Sekarang
            </button>
            <p className="mt-4 sm:mt-6 text-xs sm:text-sm text-gray-500">Tidak perlu kartu kredit. Batalkan kapan saja.</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-8 sm:py-10 lg:py-12 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2">
                <img src={logoUrl} alt="Sinaesta" className="h-6 sm:h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <span className="text-xs sm:text-sm text-gray-400 font-medium">© 2024 Sinaesta Edutech.</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8 text-xs sm:text-sm text-gray-500">
               <button onClick={() => onNavigate('PRIVACY')} className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
               <button onClick={() => onNavigate('TERMS')} className="hover:text-indigo-600 transition-colors">Terms of Service</button>
               <button onClick={() => onNavigate('SUPPORT')} className="hover:text-indigo-600 transition-colors">Support</button>
            </div>
            <div className="flex items-center gap-2">
               <BackendToggle className="text-xs" />
            </div>
         </div>
      </footer>

      {selectedPost && (
        <PostDetailModal 
          post={selectedPost} 
          onClose={() => setSelectedPost(null)} 
        />
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-5 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group">
     <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-50 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform">
        {icon}
     </div>
     <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{title}</h3>
     <p className="text-sm sm:text-base text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
