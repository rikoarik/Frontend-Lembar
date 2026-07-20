import { HttpResponse, delay, http } from 'msw';
import type { components } from '@/src/lib/api/schema';

type CatalogOption = components['schemas']['CatalogOption'];

const MOCK_GRADES: CatalogOption[] = [
  { id: 'g-1', label: 'Kelas 1', status: 'active' },
  { id: 'g-2', label: 'Kelas 2', status: 'active' },
  { id: 'g-3', label: 'Kelas 3', status: 'active' },
  { id: 'g-4', label: 'Kelas 4', status: 'active' },
  { id: 'g-5', label: 'Kelas 5', status: 'active' },
  { id: 'g-6', label: 'Kelas 6', status: 'active' },
  { id: 'g-7', label: 'Kelas 7', status: 'active' },
  { id: 'g-8', label: 'Kelas 8', status: 'active' },
  { id: 'g-9', label: 'Kelas 9', status: 'active' },
];

const MOCK_SUBJECTS: Record<string, CatalogOption[]> = {
  'g-1': [
    { id: 's-1', label: 'Matematika', status: 'active' },
    { id: 's-2', label: 'Bahasa Indonesia', status: 'active' },
    { id: 's-3', label: 'Pendidikan Pancasila', status: 'active' },
  ],
  'g-4': [
    { id: 's-4', label: 'Matematika', status: 'active' },
    { id: 's-5', label: 'Bahasa Indonesia', status: 'active' },
    { id: 's-6', label: 'Ilmu Pengetahuan Alam dan Sosial (IPAS)', status: 'active' },
    { id: 's-7', label: 'Pendidikan Pancasila', status: 'active' },
  ],
  'g-7': [
    { id: 's-8', label: 'Matematika', status: 'active' },
    { id: 's-9', label: 'Bahasa Indonesia', status: 'active' },
    { id: 's-10', label: 'Bahasa Inggris', status: 'active' },
    { id: 's-11', label: 'Ilmu Pengetahuan Alam', status: 'active' },
    { id: 's-12', label: 'Ilmu Pengetahuan Sosial', status: 'active' },
  ],
};

const MOCK_MATERIALS: Record<string, CatalogOption[]> = {
  's-1': [
    { id: 'm-1', label: 'Bilangan Cacah sampai 99', status: 'active' },
    { id: 'm-2', label: 'Pengukuran Panjang dan Berat', status: 'active' },
    { id: 'm-3', label: 'Mengenal Bangun Ruang Sederhana', status: 'active' },
    { id: 'm-4', label: 'Penjumlahan dan Pengurangan Dasar', status: 'active' },
    { id: 'm-5', label: 'Nilai Tempat dan Perbandingan Bilangan', status: 'active' },
    { id: 'm-6', label: 'Mengenal Uang dan Transaksi Sederhana', status: 'active' },
    { id: 'm-7', label: 'Mengelompokkan Benda Berdasarkan Sifatnya', status: 'active' },
    { id: 'm-8', label: 'Membaca dan Membilang Lambang Bilangan', status: 'active' },
  ],
  's-4': [
    { id: 'm-10', label: 'Bilangan Cacah sampai 10.000', status: 'active' },
    { id: 'm-11', label: 'Operasi Hitung Penjumlahan dan Pengurangan', status: 'active' },
    { id: 'm-12', label: 'Perkalian dan Pembagian Bilangan Cacah', status: 'active' },
    { id: 'm-13', label: 'Pengukuran Panjang dan Berat dalam Satuan Baku', status: 'active' },
    { id: 'm-14', label: 'Geometri: Bangun Datar dan Sifat-sifatnya', status: 'active' },
  ],
  's-8': [
    { id: 'm-20', label: 'Bilangan Bulat dan Operasinya', status: 'active' },
    { id: 'm-21', label: 'Aljabar: Bentuk dan Operasi Aljabar', status: 'active' },
    { id: 'm-22', label: 'Persamaan dan Pertidaksamaan Linear Satu Variabel', status: 'active' },
    { id: 'm-23', label: 'Perbandingan dan Skala', status: 'active' },
    { id: 'm-24', label: 'Aritmetika Sosial: Untung, Rugi, dan Diskon', status: 'active' },
  ],
};

function ok<T>(data: T): HttpResponse<{ data: T }> {
  return HttpResponse.json({ data }, { status: 200 });
}

export const catalogHandlers = [
  http.get(/\/api\/v1\/catalog\/grades/, async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const scenario = url.searchParams.get('__scenario');
    if (scenario === 'error') {
      return HttpResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Gagal memuat daftar kelas.' } },
        { status: 500 },
      );
    }
    return ok(MOCK_GRADES);
  }),

  http.get(/\/api\/v1\/catalog\/subjects/, async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const gradeId = url.searchParams.get('gradeId');
    const scenario = url.searchParams.get('__scenario');
    if (!gradeId) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Parameter gradeId wajib diisi.' } },
        { status: 400 },
      );
    }
    if (scenario === 'error') {
      return HttpResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Gagal memuat daftar mata pelajaran.' } },
        { status: 500 },
      );
    }
    const subjects = MOCK_SUBJECTS[gradeId] ?? [];
    return ok(subjects);
  }),

  http.get(/\/api\/v1\/catalog\/materials/, async ({ request }) => {
    await delay(120);
    const url = new URL(request.url);
    const gradeId = url.searchParams.get('gradeId');
    const subjectId = url.searchParams.get('subjectId');
    const scenario = url.searchParams.get('__scenario');
    if (!gradeId || !subjectId) {
      return HttpResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Parameter gradeId dan subjectId wajib diisi.' } },
        { status: 400 },
      );
    }
    if (scenario === 'error') {
      return HttpResponse.json(
        { error: { code: 'INTERNAL_ERROR', message: 'Gagal memuat daftar materi.' } },
        { status: 500 },
      );
    }
    const materials = MOCK_MATERIALS[subjectId] ?? [];
    return ok(materials);
  }),
];
