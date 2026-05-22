export default function SectionCard({ title, icon, color, children, badge, description }) {
  return (
    <div className="rds-card" style={{ "--section-color": color }}>
      <div className="section-header">
        <div
          className="section-icon-wrap"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}25`,
            transition: "all 0.4s cubic-bezier(0.25,1.2,0.5,1)",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "scale(1.12) rotate(-6deg)";
            e.currentTarget.style.background = `${color}28`;
            e.currentTarget.style.boxShadow = `0 8px 28px ${color}30, inset 0 1px 0 rgba(255,255,255,0.6)`;
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "scale(1) rotate(0deg)";
            e.currentTarget.style.background = `${color}15`;
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.6)";
          }}
        >
          <span style={{ display: "block", transition: "transform 0.3s ease" }}>{icon}</span>
        </div>

        <div className="section-header-text">
          <h2>{title}</h2>
          {description && <p>{description}</p>}
        </div>

        {badge && (
          <span
            className="section-badge"
            style={{
              background: `${color}12`,
              color: color,
              border: `1px solid ${color}25`,
              transition: "all 0.25s cubic-bezier(0.23,1,0.32,1)",
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = "scale(1.06) translateY(-1px)";
              e.currentTarget.style.background = `${color}22`;
              e.currentTarget.style.boxShadow = `0 6px 18px ${color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = "scale(1) translateY(0)";
              e.currentTarget.style.background = `${color}12`;
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {children}
    </div>
  );
}