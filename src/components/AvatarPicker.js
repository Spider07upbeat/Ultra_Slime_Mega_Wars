import React from 'react';

export default function AvatarPicker({ visible, sprites = [], selected = 0, onSelect = () => {}, onClose = () => {} }) {
  if (!visible) return null;
  return (
    <div style={{position:'fixed',left:0,top:0,right:0,bottom:0,background:'rgba(0,0,0,0.6)',display:'flex',alignItems:'center',justifyContent:'center'}} onClick={onClose}>
      <div style={{background:'#fff',padding:16,borderRadius:8,maxWidth:'90%',maxHeight:'80%',overflow:'auto'}} onClick={e => e.stopPropagation()}>
      <h3 className="title avatar-title" style={{fontWeight:'bold'}}>Choose your avatar</h3>
        <div style={{display:'flex',flexWrap:'wrap',gap:12}}>
          {(!sprites || sprites.length === 0) && <div style={{padding:12}}>No slime frames found.</div>}
          {sprites
            .map((src, idx) => ({ src, idx }))
            .filter(({ idx }) => idx !== 0 && idx !== 9)
            .map(({ src, idx }, displayIdx) => (
              <div key={src} style={{width:72, textAlign:'center'}}>
                <div
                  className={
                    'avatar-sprite-bg' + (idx === selected ? ' selected' : '')
                  }
                >
                  <img src={src} alt={`slime-${displayIdx + 1}`} style={{width:48,height:48,objectFit:'contain',cursor:'pointer',background:'none'}} onClick={() => { onSelect(idx); onClose(); }} />
                </div>
                <div style={{fontSize:12}}>#{displayIdx + 1}</div>
              </div>
            ))}
        </div>
        <div style={{marginTop:12,textAlign:'right'}}>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}
