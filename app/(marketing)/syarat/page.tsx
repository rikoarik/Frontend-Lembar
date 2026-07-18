import SubPageNavbar from '@/app/components/marketing/SubPageNavbar';

export default function SyaratPage() {
  return (
    <>
      <SubPageNavbar />
      <main>
        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-paper">
          <div className="max-w-container-max mx-auto">
            <span className="bg-burgundy/10 text-burgundy px-unit-3 py-unit-1 rounded-full font-label-semibold text-caption border border-burgundy/20">Legal</span>
            <h1 className="font-display-xl-mobile md:font-display-xl text-ink mt-unit-4 mb-unit-6 max-w-2xl">Syarat & Ketentuan</h1>
            <p className="text-secondary text-body-sm">Terakhir diperbarui: 1 Januari 2024</p>
          </div>
        </section>

        <section className="py-unit-16 px-margin-mobile md:px-margin-desktop bg-surface">
          <div className="max-w-3xl mx-auto">
            <div className="flex flex-col gap-unit-8">
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">1. Penerimaan Ketentuan</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Dengan mengakses dan menggunakan platform lembar, Anda menyetujui untuk terikat oleh Syarat & Ketentuan ini. Jika Anda tidak menyetujui ketentuan ini, harap jangan menggunakan layanan kami.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">2. Akun Pengguna</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Anda bertanggung jawab untuk menjaga kerahasiaan akun dan kata sandi Anda. Anda setuju untuk segera memberitahu kami jika terjadi penggunaan yang tidak sah atas akun Anda.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">3. Penggunaan Layanan</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Layanan lembar hanya boleh digunakan untuk tujuan pendidikan yang sah. Dilarang menggunakan platform untuk membuat konten yang melanggar hukum, menyesatkan, atau merugikan pihak lain.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">4. Hak Kekayaan Intelektual</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Soal yang Anda buat melalui lembar tetap menjadi hak kekayaan intelektual Anda atau institusi Anda. Kami tidak mengklaim kepemilikan atas konten yang dibuat oleh pengguna.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">5. Pembatasan Tanggung Jawab</h2>
                <p className="text-secondary text-body-sm leading-relaxed">lembar disediakan &quot;sebagaimana adanya&quot;. Kami berupaya sebaik mungkin untuk menjaga ketersediaan dan keakuratan layanan, namun tidak menjamin bahwa layanan akan selalu bebas dari gangguan atau kesalahan.</p>
              </div>
              <div>
                <h2 className="font-h3 text-h3 text-ink mb-unit-3">6. Perubahan Ketentuan</h2>
                <p className="text-secondary text-body-sm leading-relaxed">Kami berhak mengubah Syarat & Ketentuan ini sewaktu-waktu. Perubahan akan diberitahukan melalui email atau notifikasi di platform. Penggunaan berkelanjutan setelah perubahan berarti Anda menyetujui ketentuan yang diperbarui.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
