import React from 'react';

const SettingsComponent = (props) => {
  
    return (
      <div>
        <p>Settings</p>
        <div>{props.city}</div>
        <p onClick={props.changeState}>Click</p>
      </div>
    )
  }
  
export default SettingsComponent;