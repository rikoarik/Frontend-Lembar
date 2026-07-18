'use client';

export default function MarketingFooter() {
  return (
    <footer className="w-full bg-paper border-t border-border-strong pt-unit-16 pb-unit-8 select-none">
      <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-y-unit-12 gap-x-unit-8 pb-unit-12 border-b border-border-subtle">
          
          {/* Brand Column */}
          <div className="md:col-span-4 flex flex-col gap-unit-6">
            <div className="flex items-center gap-2">
              <div className="h-unit-8 w-unit-8 flex-shrink-0">
                <img 
                  alt="lembar logo" 
                  className="h-full w-full object-contain" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCARfxfBB_WCV4WkF3OmtcsQ2wj08axCXGcgeT6O0XjgoJEsYbwdhfrDY6LT9_hD6Ha3-fKvXLgwfRsmvSQfFMGrLeehUD6JPilFLCz_yaNCRRbGsiPubCWMNLjmWIwixhYEcDuOS19zunQgfMZaRVLV2E7z1rP0J1u2xL3lPobcaGM6wHEapPu5cgRculgnypYd6I2icHwZ2UfAYZHVQwU_PQzgMKNUIgs1E0cCLgbzY9Usw9QPnAaBFOP1LD5NWhRek4SekbZVQ" 
                />
              </div>
              <span className="font-h3 text-h3 text-ink font-bold tracking-tight">lembar</span>
            </div>
            
            <p className="font-caption text-caption text-secondary max-w-[300px] leading-relaxed">
              Platform pembuatan asesmen pintar berbasis AI yang dirancang khusus untuk meningkatkan produktivitas dan kualitas pengajaran pendidik di Indonesia.
            </p>


          </div>

          {/* Links Column 1: Layanan */}
          <div className="md:col-span-2 flex flex-col gap-unit-4">
            <span className="font-label-semibold text-ink text-body-sm uppercase tracking-wider">Layanan</span>
            <div className="flex flex-col gap-unit-2">
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="/">Produk</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="/untuk-sekolah">Untuk Sekolah</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="/harga">Harga</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Fitur Utama</a>
            </div>
          </div>

          {/* Links Column 2: Perusahaan */}
          <div className="md:col-span-2 flex flex-col gap-unit-4">
            <span className="font-label-semibold text-ink text-body-sm uppercase tracking-wider">Perusahaan</span>
            <div className="flex flex-col gap-unit-2">
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Tentang Kami</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Karir <span className="text-[10px] text-burgundy bg-burgundy/10 px-1.5 py-0.5 rounded font-bold ml-1">Hiring</span></a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Keamanan Data</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Kontak Kami</a>
            </div>
          </div>

          {/* Links Column 3: Dukungan */}
          <div className="md:col-span-2 flex flex-col gap-unit-4">
            <span className="font-label-semibold text-ink text-body-sm uppercase tracking-wider">Dukungan</span>
            <div className="flex flex-col gap-unit-2">
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Pusat Bantuan</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">FAQ</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Kebijakan Privasi</a>
              <a className="font-caption text-caption text-secondary hover:text-burgundy hover:underline transition-all duration-200" href="#">Syarat & Ketentuan</a>
            </div>
          </div>

          {/* Newsletter Column */}
          <div className="md:col-span-2 flex flex-col gap-unit-4">
            <span className="font-label-semibold text-ink text-body-sm uppercase tracking-wider">Update Terbaru</span>
            <p className="font-caption text-caption text-secondary leading-relaxed">
              Langganan buletin kami untuk tips & info edukasi terbaru.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-2">
              <input 
                type="email" 
                placeholder="Alamat email Anda" 
                className="w-full bg-surface border border-border-strong rounded px-3 py-2 text-caption focus:outline-none focus:border-burgundy focus:ring-1 focus:ring-burgundy transition-all duration-200"
              />
              <button className="bg-burgundy text-on-primary font-label-semibold h-9 rounded text-caption hover:brightness-110 active:scale-95 transition-all">
                Langganan
              </button>
            </form>
          </div>

        </div>

        {/* Bottom Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-unit-8">
          <p className="font-caption text-caption text-secondary text-center sm:text-left">
            © 2024 lembar. Dirancang untuk keahlian pendidik.
          </p>
          <div className="flex items-center gap-1.5 text-secondary font-caption text-caption">
            <span>Dibuat dengan</span>
            <span className="material-symbols-outlined text-red-500 text-[16px] animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>favorite</span>
            <span>untuk Guru Indonesia</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
