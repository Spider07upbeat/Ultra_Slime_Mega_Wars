import React from 'react';
import AvatarPicker from './AvatarPicker';

export default function MenuView({ onStart = () => {}, onHighscore = () => {}, sprites = [], selectedAvatar = 0, setSelectedAvatar = () => {} }) {
  const [showPicker, setShowPicker] = React.useState(false);
  return (
    <div className="menu">
      <h1>Ultra Slime Mega Wars</h1>
      <div className="menu-buttons">
        <button className="primary" onClick={onStart}>Start</button>
      </div>
      <div className="menu-buttons" style={{marginTop:12}}>
        <button onClick={() => setShowPicker(true)}>Choose Avatar</button>
      </div>
      <div className="menu-buttons" style={{marginTop:12}}>
        <button onClick={onHighscore}>High Score</button>
      </div>
      <AvatarPicker visible={showPicker} sprites={sprites} selected={selectedAvatar} onSelect={setSelectedAvatar} onClose={() => setShowPicker(false)} />
    </div>
  );
}
