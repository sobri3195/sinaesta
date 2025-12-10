
import React from 'react';
import { ArrowLeft, Shield, FileText, LifeBuoy, Mail, Phone, MapPin } from 'lucide-react';

interface LegalDocsProps {
  type: 'PRIVACY' | 'TERMS' | 'SUPPORT';
  onBack: () => void;
}

const LegalDocs: React.FC<LegalDocsProps> = ({ type, onBack }) => {
  const renderContent = () => {
    switch (type) {
      case 'PRIVACY':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <Shield size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Kebijakan Privasi</h1>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Terakhir Diperbarui: 7 Desember 2025
            </p>
            <div className="prose prose-indigo max-w-none text-gray-700">
              <h3>1. Pengumpulan Informasi</h3>
              <p>
                Sinaesta mengumpulkan informasi yang Anda berikan secara langsung kepada kami, seperti saat Anda membuat akun, memperbarui profil, atau menggunakan fitur-fitur interaktif kami (seperti Logbook dan OSCE). Informasi ini meliputi nama, alamat email, institusi pendidikan, dan data aktivitas belajar.
              </p>
              
              <h3>2. Penggunaan Data AI</h3>
              <p>
                Fitur berbasis AI kami (seperti Gemini Live untuk OSCE) memproses data suara dan teks Anda secara real-time untuk memberikan umpan balik pendidikan. Data ini diproses secara anonim dan digunakan semata-mata untuk tujuan simulasi dan evaluasi dalam sesi tersebut. Kami tidak menggunakan data kesehatan pasien sungguhan; semua skenario adalah fiktif.
              </p>

              <h3>3. Keamanan Data</h3>
              <p>
                Kami menerapkan langkah-langkah keamanan teknis yang wajar untuk melindungi data Anda dari akses yang tidak sah. Namun, tidak ada metode transmisi melalui internet yang 100% aman.
              </p>

              <h3>4. Berbagi Informasi</h3>
              <p>
                Kami tidak menjual data pribadi Anda kepada pihak ketiga. Kami dapat membagikan data agregat (tidak teridentifikasi) untuk keperluan riset pendidikan kedokteran atau statistik performa cohort.
              </p>
            </div>
          </div>
        );

      case 'TERMS':
        return (
          <div className="space-y-6">
             <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <FileText size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Syarat & Ketentuan</h1>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Terakhir Diperbarui: 7 Desember 2025
            </p>
            <div className="prose prose-indigo max-w-none text-gray-700">
              <h3>1. Penerimaan Syarat</h3>
              <p>
                Dengan mengakses atau menggunakan platform Sinaesta, Anda setuju untuk terikat oleh syarat dan ketentuan ini. Jika Anda tidak setuju, harap jangan gunakan layanan kami.
              </p>

              <h3>2. Tujuan Pendidikan</h3>
              <p>
                <strong>PENTING:</strong> Sinaesta adalah alat bantu pendidikan untuk persiapan ujian medis. Konten yang disediakan (termasuk hasil dari AI) bukan merupakan nasihat medis untuk perawatan pasien sungguhan. Jangan gunakan aplikasi ini untuk membuat keputusan klinis pada pasien nyata.
              </p>

              <h3>3. Akun Pengguna</h3>
              <p>
                Anda bertanggung jawab untuk menjaga kerahasiaan kredensial akun Anda. Anda setuju untuk segera memberi tahu kami tentang penggunaan akun Anda yang tidak sah.
              </p>

              <h3>4. Kekayaan Intelektual</h3>
              <p>
                Semua materi soal, vignette kasus, dan konten grafis di platform ini adalah milik Sinaesta atau pemberi lisensinya. Dilarang menyalin atau mendistribusikan materi tanpa izin tertulis.
              </p>
            </div>
          </div>
        );

      case 'SUPPORT':
        return (
          <div className="space-y-6">
             <div className="flex items-center gap-3 text-indigo-600 mb-4">
              <LifeBuoy size={32} />
              <h1 className="text-3xl font-bold text-gray-900">Pusat Bantuan & Support</h1>
            </div>
            <p className="text-gray-600 text-lg mb-8">
              Kami siap membantu perjalanan persiapan spesialis Anda. Hubungi kami jika Anda mengalami kendala teknis atau memiliki pertanyaan tentang langganan.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 hover:border-indigo-300 transition-colors">
                    <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                        <Mail size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">Email Support</h3>
                        <p className="text-gray-500 mb-2">Respon dalam 24 jam</p>
                        <a href="mailto:support@sinaesta.id" className="text-indigo-600 font-bold hover:underline">support@sinaesta.id</a>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-start gap-4 hover:border-green-300 transition-colors">
                     <div className="bg-green-50 p-3 rounded-lg text-green-600">
                        <Phone size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 text-lg">WhatsApp Admin</h3>
                        <p className="text-gray-500 mb-2">Senin - Jumat, 09.00 - 17.00</p>
                        <a href="#" className="text-green-600 font-bold hover:underline">+62 812-3456-7890</a>
                    </div>
                </div>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                <h3 className="font-bold text-gray-900 mb-4">Pertanyaan Umum (FAQ)</h3>
                <div className="space-y-4">
                    <details className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 hover:bg-gray-50">
                            Bagaimana cara mereset progress ujian?
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-600 mt-2 px-4 pb-4">
                            Saat ini reset progress global tidak tersedia untuk menjaga integritas data cohort. Namun, Anda dapat mengambil ulang ujian yang sama berkali-kali; sistem akan mencatat percobaan terbaru Anda di histori.
                        </p>
                    </details>
                    <details className="group bg-white rounded-lg border border-gray-200 overflow-hidden">
                        <summary className="flex cursor-pointer items-center justify-between p-4 font-medium text-gray-900 hover:bg-gray-50">
                            Apakah saya perlu mikrofon khusus untuk OSCE?
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <p className="text-gray-600 mt-2 px-4 pb-4">
                            Tidak wajib. Mikrofon bawaan laptop atau headset standar sudah cukup. Pastikan Anda berada di ruangan yang tenang agar AI dapat mendengar suara Anda dengan jelas.
                        </p>
                    </details>
                </div>
            </div>

            <div className="mt-8 pt-8 border-t border-gray-200">
                <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <MapPin size={18} /> Kantor Kami
                </h4>
                <p className="text-gray-600">
                    Sinaesta Edutech HQ<br/>
                    Jl. Kesehatan Raya No. 12, Senen<br/>
                    Jakarta Pusat, DKI Jakarta 10430
                </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header for Legal Pages */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
            <button 
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded-full text-gray-600 transition-colors"
                title="Kembali"
            >
                <ArrowLeft size={24} />
            </button>
            <span className="font-bold text-gray-400 text-sm uppercase tracking-wider">
                {type === 'PRIVACY' ? 'Legal' : type === 'TERMS' ? 'Legal' : 'Help Center'}
            </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 md:p-12">
            {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default LegalDocs;
