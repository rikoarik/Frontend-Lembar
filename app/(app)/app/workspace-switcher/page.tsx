import { Panel } from '@/app/components/ui';

export default function WorkspaceSwitcherPage() {
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Daftar workspace"
        description="Pilih workspace untuk beralih konteks kerja. Workspace aktif ditandai di panel kiri."
      >
        <p className="text-body-default text-brand-ink-muted">
          Gunakan switcher di rel kiri untuk mengganti konteks kerja.
        </p>
      </Panel>
    </div>
  );
}
