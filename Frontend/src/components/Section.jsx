export const Section = ({ title, children, onAdd }) => (
  <div className="section">
    <h2>{title}</h2>
    {children}
    <button type="button" className="add-btn" onClick={onAdd}>+ Add {title}</button>
  </div>
);
