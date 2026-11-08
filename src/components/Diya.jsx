export default function Diya({ size = 'large', delay = 0 }) {
  return (
    <div className={`diya diya-${size}`}>
      <div className="bowl" />
      <div className="flame" style={delay ? { animationDelay: `${delay}s` } : undefined} />
    </div>
  )
}
