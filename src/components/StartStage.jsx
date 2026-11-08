import Diya from './Diya'

export default function StartStage({ visible, onStart }) {
  return (
    <div className={`stage${visible ? '' : ' hidden'}`}>
      <Diya size="large" />
      <div>
        <p className="stage-label">Light the diyas</p>
        <p className="stage-sub">
          A small Diwali wish from the SunHap team — with sound and fireworks. Tap below to begin.
        </p>
      </div>
      <button type="button" className="lightbtn" onClick={onStart}>
        Light the Diyas
      </button>
    </div>
  )
}
