import './Card.css';

export default function Card({ 
  children, 
  title, 
  subtitle,
  icon: Icon,
  variant = 'default',
  className = '',
  glowColor,
  ...props 
}) {
  return (
    <div 
      className={`card card-${variant} ${className}`}
      style={glowColor ? { '--glow-color': glowColor } : {}}
      {...props}
    >
      {(title || Icon) && (
        <div className="card-header">
          {Icon && (
            <div className="card-icon">
              <Icon size={20} />
            </div>
          )}
          <div className="card-header-text">
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="card-content">
        {children}
      </div>
    </div>
  );
}
