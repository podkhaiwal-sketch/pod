import './messageDialog.css'

function MessageDialog({ open, type = 'success', title, message, onClose }) {
  if (!open) return null

  return (
    <div className="md-overlay" onClick={onClose}>
      <div className="md-dialog" onClick={(event) => event.stopPropagation()}>
        <h3 className={`md-title ${type}`}>{title}</h3>
        <p className="md-message">{message}</p>
        <button type="button" className="md-btn" onClick={onClose}>
          OK
        </button>
      </div>
    </div>
  )
}

export default MessageDialog
