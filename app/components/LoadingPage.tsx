export default function LoadingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg)' }}>
      <div className="surface-card">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 rounded-full animate-spin" style={{ border: '2px solid var(--brand-500)', borderTopColor: 'transparent' }}></div>
          <span style={{ color: 'var(--content)' }}>Loading...</span>
        </div>
      </div>
    </div>
  );
}
