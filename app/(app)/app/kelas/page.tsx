'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Panel } from '@/app/components/ui';

type ClassRoom = { id: string; name: string; gradeLabel: string; schoolYear: string; studentCount: number };
type Student = { id: string; name: string; studentNumber: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, { ...init, credentials: 'include', headers: { 'content-type': 'application/json', ...init?.headers } });
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new Error(payload?.error?.message ?? 'Permintaan gagal');
  return (response.status === 204 ? undefined : payload.data) as T;
}

export default function KelasPage() {
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selected, setSelected] = useState<ClassRoom | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [name, setName] = useState('');
  const [gradeLabel, setGradeLabel] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentNumber, setStudentNumber] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadClasses = useCallback(async () => {
    try { setClasses(await api<ClassRoom[]>('/v1/classes')); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Gagal memuat kelas'); }
  }, []);

  useEffect(() => { void loadClasses(); }, [loadClasses]);

  const openClass = async (room: ClassRoom) => {
    setSelected(room); setError('');
    try { setStudents(await api<Student[]>(`/v1/classes/${room.id}/students`)); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Gagal memuat siswa'); }
  };

  const createClass = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await api<ClassRoom>('/v1/classes', { method: 'POST', body: JSON.stringify({ name, gradeLabel, schoolYear }) });
      setName(''); setGradeLabel(''); setSchoolYear(''); await loadClasses();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Gagal membuat kelas'); }
    finally { setBusy(false); }
  };

  const deleteClass = async (room: ClassRoom) => {
    if (!confirm(`Hapus kelas "${room.name}" dan semua siswa? Tindakan ini tidak dapat dibatalkan.`)) return;
    setBusy(true); setError('');
    try {
      await api<void>(`/v1/classes/${room.id}`, { method: 'DELETE' });
      if (selected?.id === room.id) { setSelected(null); setStudents([]); }
      await loadClasses();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Gagal menghapus kelas'); }
    finally { setBusy(false); }
  };

  const addStudent = async (event: React.FormEvent) => {
    event.preventDefault(); if (!selected) return; setBusy(true); setError('');
    try {
      await api<Student>(`/v1/classes/${selected.id}/students`, { method: 'POST', body: JSON.stringify({ name: studentName, studentNumber }) });
      setStudentName(''); setStudentNumber(''); await openClass(selected); await loadClasses();
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Gagal menambah siswa'); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex flex-col gap-4">
      <div><h1 className="text-h1 font-semibold text-brand-ink">Kelas</h1><p className="text-body-sm text-brand-ink-muted">Kelola rombel dan daftar siswa workspace aktif.</p></div>
      {error ? <p className="text-body-sm text-brand-danger" role="alert">{error}</p> : null}
      <Panel title="Tambah kelas" description="Rombel berbeda dari jenjang katalog pada halaman generate.">
        <form onSubmit={createClass} className="grid gap-3 sm:grid-cols-4">
          <input required maxLength={80} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama, mis. 5A" className="min-h-10 rounded-md border border-brand-line px-3" />
          <input maxLength={80} value={gradeLabel} onChange={(e) => setGradeLabel(e.target.value)} placeholder="Jenjang, mis. Kelas 5" className="min-h-10 rounded-md border border-brand-line px-3" />
          <input maxLength={20} value={schoolYear} onChange={(e) => setSchoolYear(e.target.value)} placeholder="Tahun ajaran" className="min-h-10 rounded-md border border-brand-line px-3" />
          <Button type="submit" disabled={busy || !name.trim()}>{busy ? 'Menyimpan…' : 'Tambah kelas'}</Button>
        </form>
      </Panel>
      <div className="grid gap-4 lg:grid-cols-[1fr_1.4fr]">
        <Panel title="Daftar kelas" description={`${classes.length} rombel`}>
          {classes.length === 0 ? <p className="text-body-sm text-brand-ink-muted">Belum ada kelas.</p> : <ul className="space-y-2">{classes.map((room) => <li key={room.id} className="flex gap-2"><button type="button" onClick={() => void openClass(room)} className={`flex-1 rounded-md border p-3 text-left ${selected?.id === room.id ? 'border-brand-accent bg-brand-paper' : 'border-brand-line'}`}><strong>{room.name}</strong><p className="text-body-xs text-brand-ink-muted">{room.gradeLabel || 'Jenjang belum diisi'} · {room.studentCount} siswa</p></button><Button type="button" onClick={() => void deleteClass(room)} disabled={busy}>Hapus</Button></li>)}</ul>}
        </Panel>
        <Panel title={selected ? `Siswa ${selected.name}` : 'Daftar siswa'} description={selected ? `${students.length} siswa terdaftar` : 'Pilih kelas untuk membuka roster.'}>
          {selected ? <div className="space-y-4"><form onSubmit={addStudent} className="flex flex-col gap-2 sm:flex-row"><input required maxLength={120} value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Nama siswa" className="min-h-10 flex-1 rounded-md border border-brand-line px-3"/><input maxLength={50} value={studentNumber} onChange={(e) => setStudentNumber(e.target.value)} placeholder="NIS (opsional)" className="min-h-10 rounded-md border border-brand-line px-3"/><Button type="submit" disabled={busy || !studentName.trim()}>Tambah</Button></form>{students.length ? <ul className="divide-y divide-brand-line">{students.map((student) => <li key={student.id} className="flex justify-between py-2 text-body-sm"><span>{student.name}</span><span className="text-brand-ink-muted">{student.studentNumber || '—'}</span></li>)}</ul> : <p className="text-body-sm text-brand-ink-muted">Belum ada siswa.</p>}</div> : null}
        </Panel>
      </div>
    </div>
  );
}
