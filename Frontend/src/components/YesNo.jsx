export const YesNo = ({ value, onChange }) => (
  <div style={{ marginBottom: '1rem' }}>
    <button
      type="button"
      className={`yesno-btn ${value === true ? 'active' : ''}`}
      onClick={() => onChange(true)}
    >
      Yes
    </button>
    <button
      type="button"
      className={`yesno-btn ${value === false ? 'active' : ''}`}
      onClick={() => onChange(false)}
    >
      No
    </button>
  </div>
);