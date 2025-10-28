export const InputRow = ({ fields, onDelete }) => (
  <div className="input-row">
    {fields.map((field, i) => (
      <input
        key={i}
        type={field.type || 'text'}
        placeholder={field.placeholder}
        value={field.value}
        onChange={e => field.onChange(e.target.value)}
      />
    ))}
    <button type="button" className="delete-btn" onClick={onDelete}>🗑</button>
  </div>
);