export default function Home() {
  return (
    <main className="shell">
      <header className="shell__header">
        <svg
          className="shell__mark"
          viewBox="0 0 24 24"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M6 3h12v18H6z M6 3l12 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinejoin="round"
          />
        </svg>
        <span className="shell__wordmark">lembar</span>
      </header>

      <h1 className="shell__h1">Buat draft lembar soal yang siap cetak.</h1>

      <p className="shell__lede">
        Workspace tenang untuk guru menyusun soal, meninjau hasil, dan mengirim lembar ke kelas.
      </p>

      <ul className="shell__outcomes" aria-label="Alur kerja">
        <li>1. Pilih materi dan konteks kelas.</li>
        <li>2. Siapkan draft lalu tinjau tiap soal.</li>
        <li>3. Finalkan dan kirim ke cetak atau PDF.</li>
      </ul>
    </main>
  );
}
