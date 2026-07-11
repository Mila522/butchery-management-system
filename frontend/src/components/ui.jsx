import React from "react";

export function PageHeader({ eyebrow, title, description, actions, meta }) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {(actions || meta) && (
        <div className="page-header__aside">
          {meta}
          {actions}
        </div>
      )}
    </div>
  );
}

export function Card({ children, className = "" }) {
  return <section className={`erp-card ${className}`.trim()}>{children}</section>;
}

export function SectionHeader({ title, description, actions }) {
  return (
    <div className="section-header">
      <div>
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, detail, tone = "neutral", icon, onClick }) {
  const Component = onClick ? "button" : "section";

  return (
    <Component
      className={`erp-card stat-card stat-card--${tone} ${onClick ? "stat-card--clickable" : ""}`.trim()}
      type={onClick ? "button" : undefined}
      onClick={onClick}
    >
      <div className="stat-card__top">
        <span>{label}</span>
        {icon && <span className="stat-card__icon">{icon}</span>}
      </div>
      <strong>{value}</strong>
      {detail && <small>{detail}</small>}
    </Component>
  );
}

export function DataTable({ columns, children, empty, minWidth = 760 }) {
  const hasRows = React.Children.count(children) > 0;

  return (
    <div className="table-shell">
      <div className="table-responsive">
        <table className="data-table" style={{ minWidth }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>{hasRows ? children : empty}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyState({ title = "No records found", description }) {
  return (
    <div className="empty-state">
      <strong>{title}</strong>
      {description && <span>{description}</span>}
    </div>
  );
}

export function LoadingState({ label = "Loading" }) {
  return (
    <div className="loading-state">
      <span className="loader" />
      <strong>{label}</strong>
    </div>
  );
}

export function ActionBar({ children }) {
  return <div className="action-bar">{children}</div>;
}

export function SearchBar({ value, onChange, placeholder = "Search" }) {
  return (
    <div className="search-bar">
      <span aria-hidden="true">/</span>
      <input value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

export function Toolbar({ children }) {
  return <div className="toolbar">{children}</div>;
}

export function SummaryCard({ title, rows, totalLabel, totalValue, tone = "success" }) {
  return (
    <Card className="summary-card">
      <h2>{title}</h2>
      <div className="summary-card__rows">
        {rows.map((row) => (
          <div key={row.label}>
            <span>{row.label}</span>
            <strong>{row.value}</strong>
          </div>
        ))}
      </div>
      {(totalLabel || totalValue) && (
        <div className={`summary-card__total text-${tone}`}>
          <span>{totalLabel}</span>
          <strong>{totalValue}</strong>
        </div>
      )}
    </Card>
  );
}

export function FormCard({ title, description, children, actions }) {
  return (
    <Card className="form-card">
      <SectionHeader title={title} description={description} actions={actions} />
      <div className="form-card__body">{children}</div>
    </Card>
  );
}
