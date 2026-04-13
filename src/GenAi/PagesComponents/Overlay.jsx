const Overlay = ({ timer, startTime }) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60000);
    const seconds = Math.floor((time % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="overlay">
      <div className="overlay-content">
        <p>Instance creation in progress...</p>
        {startTime && <p>Time remaining: {formatTime(timer)}</p>}
      </div>
    </div>
  );
};
export default Overlay;
