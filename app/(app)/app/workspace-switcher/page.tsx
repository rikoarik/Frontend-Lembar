import { Panel } from '@/app/components/ui';
import { ShellForbidden } from '@/app/components/app/ShellStates';

export default function WorkspaceSwitcherPage() {
  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Daftar workspace"
        description="Halaman placeholder untuk perpindahan workspace dan pemulihan akses."
      >
        <p className="text-body-default text-brand-ink-muted">
          Gunakan switcher di rel kiri atau bilah atas untuk mengganti konteks kerja.
        </p>
      </Panel>
      <ShellForbidden />
    </div>
  );
}
