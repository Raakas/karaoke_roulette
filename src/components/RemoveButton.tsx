import React from 'react'

interface RemoveIconProperties {
  id: number
  onClick: (id: number) => void
}

export const RemoveIcon = ({ id, onClick }: RemoveIconProperties) => {
  return (
    <p id={id.toString()} className="remove-icon" onClick={() => onClick(id)}>
      X
    </p>
  )
}
