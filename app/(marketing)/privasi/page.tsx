import SubPageNavbar from '@/app/components/marketing/SubPageNavbar';

export default function PrivasiPage() {
  return (
    <>
      <SubPageNavbar />
      <main>
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">Legal</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-ink mt-unit-4 mb-unit-6 max-w-2xl">Kebijakan Privasi</h1>
            <p className="text-secondary text-body-sm">Terakhir diperbarui: 1 Januari 2024</p>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-3xl mx-auto prose-sm">
            <div className="flex flex-col gap-unit-8">
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">1. Informasi yang Kami Kumpulkan</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Kami mengumpulkan informasi yang Anda berikan secara langsung saat mendaftar akun, seperti nama, alamat email, nama sekolah, dan peran pengajaran. Kami juga mengumpulkan data penggunaan secara otomatis untuk meningkatkan kualitas layanan.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">2. Penggunaan Informasi</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Informasi Anda digunakan untuk menyediakan dan meningkatkan layanan lembar, mengirimkan notifikasi terkait akun, serta mempersonalisasi pengalaman penggunaan platform sesuai kebutuhan pengajaran Anda.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">3. Perlindungan Data</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Kami menerapkan enkripsi AES-256 untuk data tersimpan dan TLS 1.3 untuk data yang ditransmisikan. Infrastruktur kami tersertifikasi ISO 27001 dan mematuhi regulasi perlindungan data pribadi yang berlaku di Indonesia.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">4. Berbagi Data</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Kami tidak menjual atau membagikan data pribadi Anda kepada pihak ketiga untuk tujuan komersial. Data hanya dapat dibagikan jika diwajibkan oleh hukum atau atas persetujuan eksplisit dari Anda.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">5. Hak Anda</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Anda berhak mengakses, memperbarui, atau menghapus data pribadi Anda kapan saja. Untuk mengajukan permintaan terkait data, silakan hubungi kami di privasi@lembar.id.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
