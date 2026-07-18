export default function AuthMethodDivider() {
  return (
    <div className="flex items-center gap-3" aria-hidden="true">
      <span className="h-px flex-1 bg-border-subtle" />
      <span className="font-caption text-caption text-secondary">atau</span>
      <span className="h-px flex-1 bg-border-subtle" />
    </div>
  );
}
