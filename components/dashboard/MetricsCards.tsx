import { FileClock, CheckCircle, XCircle } from "lucide-react";

interface KpiData {
  pending: number;
  processed: number;
  failed: number;
}

interface MetricsCardsProps {
  data: {
    last24Hours: KpiData;
    last7Days: KpiData;
    last14Days: KpiData;
    last30Days: KpiData;
  };
  days: number;
}

export function MetricsCards({ data, days }: MetricsCardsProps) {
  let selectedData: KpiData;
  let label = `last ${days} days`;

  switch (days) {
    case 1:
      selectedData = data.last24Hours;
      label = "last 24 hours";
      break;
    case 7:
      selectedData = data.last7Days;
      break;
    case 14:
      selectedData = data.last14Days;
      break;
    case 30:
    default:
      selectedData = data.last30Days;
      break;
  }

  const { pending, processed, failed } = selectedData;
  const total = pending + processed + failed;

  const cards = [
    {
      title: "Pending Reports",
      value: pending,
      icon: FileClock,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
    },
    {
      title: "Processed",
      value: processed,
      icon: CheckCircle,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
    },
    {
      title: "Failed / Rejected",
      value: failed,
      icon: XCircle,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20",
    },
  ];

  return (
    <div className="stat-grid">
      {cards.map((card) => (
        <div key={card.title} className="stat-block" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span className="muted" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{card.title}</span>
            <card.icon style={{ width: '20px', height: '20px', opacity: 0.7 }} />
          </div>
          <strong>{card.value}</strong>
          <span className="muted" style={{ fontSize: '0.8rem' }}>
            {total > 0 ? Math.round((card.value / total) * 100) : 0}% of {label}
          </span>
        </div>
      ))}
    </div>
  );
}
