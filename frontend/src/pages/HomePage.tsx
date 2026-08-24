import { StatusBadge } from '../components/StatusBadge';
import { useHealth } from '../hooks/useHealth';

export function HomePage() {
  const health = useHealth();

  return (
    <main
      style={{
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '640px',
        margin: '4rem auto',
        padding: '0 1rem',
        lineHeight: 1.6,
      }}
    >
      <h1>agent-pet-testing</h1>
      <p>NestJS backend + React (Vite) frontend scaffold.</p>

      <section style={{ marginTop: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem' }}>Backend status</h2>
        {health.status === 'loading' && (
          <StatusBadge label="Checking…" tone="neutral" />
        )}
        {health.status === 'error' && (
          <StatusBadge label={`Unreachable: ${health.error}`} tone="error" />
        )}
        {health.status === 'ready' && (
          <>
            <StatusBadge label={`API: ${health.data.status}`} tone="success" />
            <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>
              Uptime: {health.data.uptime.toFixed(1)}s · Checked at{' '}
              {new Date(health.data.timestamp).toLocaleTimeString()}
            </p>
          </>
        )}
      </section>
    </main>
  );
}
