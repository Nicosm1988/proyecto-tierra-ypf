export default function MetricPill({ icon: Icon, label, tone = "blue", value }) {
  return (
    <div className={`metric-pill metric-pill-${tone}`}>
      <Icon aria-hidden="true" size={16} />
      <span>{value}</span>
      <small>{label}</small>
    </div>
  );
}
