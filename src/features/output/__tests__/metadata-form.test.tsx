import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MetadataForm } from '@/src/features/output/MetadataForm';
import type { PrintMetadata } from '@/src/features/output/types';

const base: PrintMetadata = {
  schoolName: '',
  teacherName: '',
  subject: '',
  class: '',
  date: '',
  duration: '',
  instructions: '',
  maxScore: undefined,
};

describe('MetadataForm', () => {
  it('merender semua field PrintMetadata dengan label aksesibel berbahasa Indonesia', () => {
    render(<MetadataForm value={base} onChange={vi.fn()} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/nama sekolah/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nama guru/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mata pelajaran/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/kelas/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/tanggal/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/waktu pengerjaan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/instruksi pengerjaan/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nilai maksimal/i)).toBeInTheDocument();
  });

  it('merender tombol simpan dan batal', () => {
    render(<MetadataForm value={base} onChange={vi.fn()} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByRole('button', { name: /simpan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /batal/i })).toBeInTheDocument();
  });

  it('calls onChange with updated value when a field changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MetadataForm value={base} onChange={onChange} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/nama sekolah/i), 'SDN 1');

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ schoolName: 'SDN 1' }));
  });

  it('calls onChange when teacherName changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<MetadataForm value={base} onChange={onChange} onSave={vi.fn()} onCancel={vi.fn()} />);

    await user.type(screen.getByLabelText(/nama guru/i), 'Bu Sari');

    expect(onChange).toHaveBeenLastCalledWith(expect.objectContaining({ teacherName: 'Bu Sari' }));
  });

  it('shows validation error when schoolName is empty on save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    render(<MetadataForm value={base} onChange={vi.fn()} onSave={onSave} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /simpan/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows validation error when teacherName is empty on save', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const withSchool: PrintMetadata = { ...base, schoolName: 'SDN 1' };
    render(
      <MetadataForm value={withSchool} onChange={vi.fn()} onSave={onSave} onCancel={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: /simpan/i }));

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('calls onSave with current value when required fields are filled', async () => {
    const user = userEvent.setup();
    const onSave = vi.fn();
    const filled: PrintMetadata = { ...base, schoolName: 'SDN 1', teacherName: 'Bu Sari' };
    render(<MetadataForm value={filled} onChange={vi.fn()} onSave={onSave} onCancel={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: /simpan/i }));

    expect(onSave).toHaveBeenCalledWith(filled);
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<MetadataForm value={base} onChange={vi.fn()} onSave={vi.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: /batal/i }));

    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('fields reflect the controlled value prop', () => {
    const filled: PrintMetadata = {
      schoolName: 'SDN 1',
      teacherName: 'Bu Sari',
      subject: 'Matematika',
      class: 'Kelas 4',
      date: '2025-07-30',
      duration: '90',
      instructions: 'Kerjakan sendiri.',
      maxScore: 100,
    };
    render(<MetadataForm value={filled} onChange={vi.fn()} onSave={vi.fn()} onCancel={vi.fn()} />);

    expect(screen.getByLabelText(/nama sekolah/i)).toHaveValue('SDN 1');
    expect(screen.getByLabelText(/nama guru/i)).toHaveValue('Bu Sari');
    expect(screen.getByLabelText(/mata pelajaran/i)).toHaveValue('Matematika');
    expect(screen.getByLabelText(/kelas/i)).toHaveValue('Kelas 4');
    expect(screen.getByLabelText(/tanggal/i)).toHaveValue('2025-07-30');
    expect(screen.getByLabelText(/waktu pengerjaan/i)).toHaveValue('90');
    expect(screen.getByLabelText(/instruksi pengerjaan/i)).toHaveValue('Kerjakan sendiri.');
    expect(screen.getByLabelText(/nilai maksimal/i)).toHaveValue(100);
  });
});
