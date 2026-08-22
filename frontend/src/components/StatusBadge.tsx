interface StatusBadgeProps {
  label: string;
  tone: 'neutral' | 'success' | 'error';
}

const TONES: Record<StatusBadgeProps['tone'], string> = {
  neutral: '#9ca3af',
  success: '#22c55e',
  error: '#ef4444',
};

export function StatusBadge({ label, tone }: StatusBadgeProps) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        background: '#1f2937',
        color: '#f9fafb',
        fontSize: '0.875rem',
      }}
    >
      <span
        style={{
          width: '0.5rem',
          height: '0.5rem',
          borderRadius: '9999px',
          background: TONES[tone],
        }}
      />
      {label}
    </span>
  );
}
