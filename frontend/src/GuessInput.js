function GuessInput({ value, onChange, onKeyDown, status }) {
    const labelColor = status === 'correct' ? 'green' : status === 'wrong' ? 'red' : 'black';
    const labelText = status === 'correct' ? 'Correct!' : status === 'wrong' ? 'Wrong!' : 'Your answer:';

  return (
    <div className="guess-input">
      <label style={{ color: labelColor }}>{labelText}</label>
      <input
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={onKeyDown}
        style={{ borderColor: labelColor }}
      />
    </div>
  );
}

export default GuessInput;