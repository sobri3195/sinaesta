
import React from 'react';
import { ArrowRight, BrainCircuit, Activity, Book, ShieldCheck, Users, BarChart2, CheckCircle2, LifeBuoy } from 'lucide-react';
import { ViewState } from '../types';

interface LandingPageProps {
  onGetStarted: () => void;
  onNavigate: (view: ViewState) => void;
  logoUrl: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onNavigate, logoUrl }) => {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <img 
            src={logoUrl} 
            alt="Sinaesta" 
            className="h-10 w-auto cursor-pointer" 
            onClick={() => onNavigate('LANDING')}
          />
          
          {/* Menu Header */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
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

          <div className="flex gap-4">
            <button onClick={onGetStarted} className="text-sm font-bold text-gray-900 hover:text-indigo-600 px-4 py-2">
              Masuk
            </button>
            <button onClick={onGetStarted} className="bg-gray-900 text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-black transition-all shadow-lg shadow-gray-200/50 hover:shadow-xl hover:-translate-y-0.5">
              Daftar Sekarang
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-8">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
          <span className="text-xs font-bold text-indigo-700 uppercase tracking-wide">Platform Persiapan PPDS Terbaik #1</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tight text-gray-900 mb-6 leading-[1.1]">
          Raih Impian Menjadi <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Dokter Spesialis</span>
        </h1>
        
        <p className="text-xl text-gray-500 max-w-2xl mb-10 leading-relaxed">
          Sinaesta adalah platform belajar cerdas berbasis AI yang dirancang khusus untuk persiapan ujian masuk PPDS. Latihan soal vignette, simulasi klinis, dan analisis kelemahan secara real-time.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button onClick={onGetStarted} className="bg-indigo-600 text-white h-14 px-8 rounded-full text-lg font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 flex items-center justify-center gap-2">
            Mulai Belajar Gratis <ArrowRight size={20} />
          </button>
          <button className="bg-white text-gray-900 border border-gray-200 h-14 px-8 rounded-full text-lg font-bold hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
            Lihat Demo
          </button>
        </div>

        {/* Hero Image / Preview */}
        <div className="mt-16 w-full max-w-5xl bg-gray-900 rounded-2xl p-2 shadow-2xl overflow-hidden ring-1 ring-gray-900/10">
           <div className="bg-gray-800 rounded-xl overflow-hidden relative aspect-[16/9]">
              {/* Mock UI Representation */}
              <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
                  <div className="text-center">
                      <Activity className="mx-auto text-indigo-400 mb-4 h-16 w-16 opacity-50" />
                      <p className="text-gray-400 font-medium">Dashboard Simulasi Ujian & Analitik</p>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fitur Lengkap untuk Calon Spesialis</h2>
            <p className="text-gray-500">Kami menyediakan semua alat yang Anda butuhkan untuk menguasai materi klinis dan lolos seleksi.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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

      {/* Specialty Marquee or List */}
      <section id="prodi" className="py-20 bg-white border-t border-gray-100 overflow-hidden">
         <div className="text-center mb-10">
            <h3 className="text-lg font-bold text-gray-400 uppercase tracking-widest">Tersedia untuk berbagai prodi</h3>
         </div>
         <div className="flex justify-center flex-wrap gap-4 max-w-5xl mx-auto px-4">
            {['Penyakit Dalam', 'Bedah', 'Anak', 'Obgyn', 'Kardiologi', 'Neurologi', 'Anestesi', 'Radiologi', 'Mata', 'THT', 'Psikiatri', 'Kulit & Kelamin'].map((spec) => (
                <span key={spec} className="px-6 py-2 bg-gray-50 rounded-full text-gray-600 font-bold border border-gray-200 text-sm">
                    {spec}
                </span>
            ))}
         </div>
      </section>

      {/* CTA Bottom */}
      <section id="pricing" className="py-24 bg-gray-900 text-white text-center px-4">
         <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-black mb-6">Siap Menjadi Spesialis?</h2>
            <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
               Bergabunglah dengan ribuan dokter umum lainnya yang telah mempercayakan persiapan PPDS mereka pada Sinaesta.
            </p>
            <button onClick={onGetStarted} className="bg-indigo-600 text-white h-16 px-10 rounded-full text-xl font-bold hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-900/50">
               Buat Akun Gratis Sekarang
            </button>
            <p className="mt-6 text-sm text-gray-500">Tidak perlu kartu kredit. Batalkan kapan saja.</p>
         </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 border-t border-gray-100">
         <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <img src={logoUrl} alt="Sinaesta" className="h-8 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all" />
                <span className="text-sm text-gray-400 font-medium">© 2024 Sinaesta Edutech.</span>
            </div>
            <div className="flex gap-8 text-sm text-gray-500">
               <button onClick={() => onNavigate('PRIVACY')} className="hover:text-indigo-600 transition-colors">Privacy Policy</button>
               <button onClick={() => onNavigate('TERMS')} className="hover:text-indigo-600 transition-colors">Terms of Service</button>
               <button onClick={() => onNavigate('SUPPORT')} className="hover:text-indigo-600 transition-colors">Support</button>
            </div>
         </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-indigo-100 hover:shadow-xl hover:shadow-indigo-100/50 transition-all group">
     <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
     </div>
     <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
     <p className="text-gray-500 leading-relaxed">{desc}</p>
  </div>
);

export default LandingPage;
