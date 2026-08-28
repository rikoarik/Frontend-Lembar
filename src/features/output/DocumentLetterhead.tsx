import {
  formatExamContext,
  formatExamHeading,
  type PrintDTO,
  type PrintMetadata,
} from '@/src/features/output/types';

function Logo({ src, alt }: { src?: string; alt: string }) {
  return src ? (
    <img className="h-16 w-16 object-contain print:h-[18mm] print:w-[18mm]" src={src} alt={alt} />
  ) : (
    <div
      className="h-16 w-16 border border-dashed border-brand-line print:h-[18mm] print:w-[18mm] print:border-black/30"
      aria-hidden="true"
    />
  );
}

function SchoolIdentity({ metadata }: { metadata: PrintMetadata }) {
  return (
    <div className="min-w-0 text-center font-serif leading-tight text-brand-ink print:text-black">
      {metadata.authorityName ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide">
          {metadata.authorityName}
        </p>
      ) : null}
      {metadata.departmentName ? (
        <p className="text-[10px] font-semibold uppercase tracking-wide">
          {metadata.departmentName}
        </p>
      ) : null}
      <p className="mt-0.5 text-[15px] font-bold uppercase tracking-wide">{metadata.schoolName}</p>
      {metadata.schoolAddress ? (
        <p className="mt-0.5 text-[9px] leading-snug">{metadata.schoolAddress}</p>
      ) : null}
      {metadata.schoolContact ? <p className="text-[9px]">{metadata.schoolContact}</p> : null}
    </div>
  );
}

export function DocumentLetterhead({ dto, copy }: { dto: PrintDTO; copy: 'student' | 'teacher' }) {
  const metadata = dto.metadata;
  const template = metadata?.headerTemplate ?? 'official';
  const heading = formatExamHeading(dto);
  const context = formatExamContext(dto);

  return (
    <header
      data-testid={
        metadata && copy === 'student' ? 'student-print-metadata' : 'document-letterhead'
      }
      className={`mb-5 font-serif text-brand-ink print:text-black ${metadata && copy === 'student' ? 'student-print-metadata' : ''}`}
    >
      {metadata ? (
        <>
          {template === 'official' ? (
            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)_4.5rem] items-center gap-3 px-1">
              <Logo src={metadata.leftLogoDataUrl} alt="Logo kiri kop sekolah" />
              <SchoolIdentity metadata={metadata} />
              <Logo src={metadata.rightLogoDataUrl} alt="Logo kanan kop sekolah" />
            </div>
          ) : template === 'compact' ? (
            <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] items-center gap-3 px-1">
              <Logo src={metadata.leftLogoDataUrl} alt="Logo kop sekolah" />
              <SchoolIdentity metadata={metadata} />
            </div>
          ) : (
            <SchoolIdentity metadata={metadata} />
          )}
          <div className="mt-2 border-t-2 border-black pt-[2px]">
            <div className="border-t border-black" />
          </div>
        </>
      ) : null}

      <div
        className={
          metadata
            ? 'pt-2 text-center'
            : 'border-b border-brand-line pb-4 text-center print:border-black'
        }
      >
        <h1 className="text-[13px] font-bold uppercase leading-tight">{heading}</h1>
        {!metadata && context ? <p className="mt-1 text-[10px]">{context}</p> : null}
        {dto.academicYear ? (
          <p className="text-[10px] font-semibold uppercase">TAHUN PELAJARAN {dto.academicYear}</p>
        ) : null}
        <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-wide">
          {copy === 'student' ? 'LEMBAR SOAL SISWA' : 'KUNCI JAWABAN GURU'}
        </p>
      </div>

      {metadata ? (
        <div className="mt-3 grid grid-cols-2 gap-x-8 text-[10px] leading-5">
          <div>
            <MetaLine label="Mata Pelajaran" value={metadata.subject || dto.subject} />
            <MetaLine label="Kelas" value={metadata.class || dto.gradeLabel} />
            <MetaLine label="Hari / Tanggal" value={metadata.date} />
          </div>
          <div>
            <MetaLine label="Waktu" value={metadata.duration} />
            {copy === 'student' ? (
              <>
                <MetaLine label="Nama" value="" blank />
                <MetaLine label="No. Peserta" value="" blank />
              </>
            ) : (
              <MetaLine label="Guru" value={metadata.teacherName} />
            )}
          </div>
          {metadata.instructions ? (
            <p className="col-span-2 mt-2 border-t border-black pt-2">
              <span className="font-semibold">Petunjuk:</span> {metadata.instructions}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="mt-3 border-t-2 border-black" />
    </header>
  );
}

function MetaLine({
  label,
  value,
  blank = false,
}: {
  label: string;
  value: string;
  blank?: boolean;
}) {
  return (
    <p className="grid grid-cols-[6.5rem_0.5rem_minmax(0,1fr)] gap-1">
      <span>{label}</span>
      <span>:</span>
      <span className={blank || !value ? 'min-h-4 border-b border-dotted border-black' : ''}>
        {value}
      </span>
    </p>
  );
}
