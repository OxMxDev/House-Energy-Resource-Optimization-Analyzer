import './MetricCard.css';

export default function MetricCard({
  label,
  value,
  unit = '',
  change,
  changeLabel = 'vs last period',
  icon: Icon,
  trend = 'neutral', // 'up', 'down', 'neutral'
  color = 'primary', // 'primary', 'secondary', 'accent', 'danger'
}) {
  return (
    <div className={`metric-card metric-${color}`}>
      <div className="metric-header">
        <span className="metric-label">{label}</span>
        {Icon && (
          <div className="metric-icon">
            <Icon size={18} />
          </div>
        )}
      </div>
      
      <div className="metric-value">
        <span className="value">{value}</span>
        {unit && <span className="unit">{unit}</span>}
      </div>
      
      {change !== undefined && (
        <div className={`metric-change ${trend}`}>
          <span className="change-value">
            {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {change}
          </span>
          <span className="change-label">{changeLabel}</span>
        </div>
      )}
    </div>
  );
}
