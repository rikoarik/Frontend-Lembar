export function GET() {
  const svg = `
  <svg width="1200" height="630" viewBox="0 0 1200 630" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#F5F0E8"/>
    <rect x="72" y="72" width="1056" height="486" rx="32" fill="#FFFFFF" stroke="#DDD4C8"/>
    <rect x="104" y="104" width="96" height="96" rx="24" fill="#A3202B"/>
    <path d="M124 170V124H180V170H168V136H136V170H124Z" fill="white"/>
    <text x="236" y="150" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="700" fill="#171717">lembar</text>
    <text x="236" y="190" font-family="Inter, Arial, sans-serif" font-size="18" fill="#6F655C">Workspace asesmen untuk guru</text>
    <text x="104" y="286" font-family="Manrope, Arial, sans-serif" font-size="54" font-weight="700" fill="#171717">Buat, tinjau, dan finalkan</text>
    <text x="104" y="352" font-family="Manrope, Arial, sans-serif" font-size="54" font-weight="700" fill="#171717">lembar soal lebih cepat</text>
    <text x="104" y="414" font-family="Inter, Arial, sans-serif" font-size="24" fill="#6F655C">Preview link, chat bantuan, dan workflow sekolah dalam satu tempat.</text>
    <rect x="104" y="462" width="240" height="56" rx="28" fill="#A3202B"/>
    <text x="164" y="498" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF">Mulai sekarang</text>
    <rect x="920" y="154" width="192" height="320" rx="28" fill="#FAF8F5" stroke="#E6DFD4"/>
    <rect x="948" y="184" width="136" height="24" rx="12" fill="#E6DFD4"/>
    <rect x="948" y="224" width="104" height="16" rx="8" fill="#DDD4C8"/>
    <rect x="948" y="256" width="136" height="16" rx="8" fill="#DDD4C8"/>
    <rect x="948" y="316" width="136" height="96" rx="20" fill="#A3202B" opacity="0.9"/>
    <text x="974" y="372" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="700" fill="#FFFFFF">AI</text>
  </svg>`;

  return new Response(svg, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
}
