import './CustomRadio.css';

const CustomRadio = ({ name, value, checked, onChange, label, disabled }) => {
  return (
    <label
      className={`custom-radio 
            ${checked ? 'custom-radio--checked' : ''} 
            ${disabled ? 'custom-radio--disabled' : ''}`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
      />
      <span className="custom-radio__circle">
        <span className="custom-radio__check" />
      </span>
      <span className="custom-radio__label">{label}</span>
    </label>
  );
};

export default CustomRadio;
