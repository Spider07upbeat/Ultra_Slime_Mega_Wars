import React, { useRef, useEffect, useState, useCallback } from 'react';
import { drawSlime, roundRect, drawBubble, drawSplash } from '../game/renderUtils';
import clickUrl from '../assets/sound/click.wav';
import hurtUrl from '../assets/sound/hurt.wav';
import levelupUrl from '../assets/sound/levelup.wav';
import splashUrl from '../assets/sound/water_splash.wav';
import bgUrl from '../assets/sound/backgroundmusic.wav';

const LEVELS = [
  null,
  { enemies: [ { x: 760, y: 400, r: 28, color: '#f2a6ff' }, { x: 820, y: 380, r: 22, color: '#ffd37a' } ] },
  { enemies: [ { x: 680, y: 380, r: 30, color: '#ffd37a' }, { x: 740, y: 360, r: 26, color: '#f2a6ff' }, { x: 800, y: 380, r: 26, color: '#9ef0a6' }, { x: 860, y: 360, r: 20, color: '#a6d8ff' } ] },
  { enemies: [ { x: 720, y: 380, r: 30, color: '#ffd37a' }, { x: 780, y: 360, r: 26, color: '#f2a6ff' }, { x: 840, y: 340, r: 26, color: '#9ef0a6' }, { x: 900, y: 360, r: 24, color: '#a6d8ff' }, { x: 960, y: 380, r: 20, color: '#ffd6e6' } ] },
  { enemies: [ { x: 700, y: 360, r: 32, color: '#ffd37a' }, { x: 760, y: 340, r: 28, color: '#f2a6ff' }, { x: 820, y: 360, r: 26, color: '#9ef0a6' }, { x: 880, y: 340, r: 24, color: '#a6d8ff' }, { x: 940, y: 360, r: 22, color: '#ffd6e6' }, { x: 1000, y: 380, r: 20, color: '#c9ffdd' } ] },
];

export default function GameCanvas({ slimeSprites = [], selectedAvatar = 0, onBack = () => {}, onScoreAdd = () => {}, onLevelChange = () => {} }) {
  const menuHoverRef = useRef(false);
  const canvasRef = useRef(null);
  const [score, setScore] = useState(0);
  const scoreRef = useRef(0);
  const [popups, setPopups] = useState([]);
  const [lives, setLives] = useState(5);
  const aimAngleRef = useRef(35);
  const aimTargetRef = useRef({ x: 200, y: 200 });
  const powerRef = useRef(45);
  const projectilesRef = useRef([]);
  const enemiesRef = useRef([]);
  const livesRef = useRef(lives);
  const gameOverRef = useRef(false);
  const clickSndRef = useRef(null);
  const hurtSndRef = useRef(null);
  const levelupSndRef = useRef(null);
  const splashSndRef = useRef(null);
  const bgSndRef = useRef(null);
  const bgStartedRef = useRef(false);
  const animationRef = useRef(null);
  const enemyImgRef = useRef(null);
  const avatarImgRef = useRef(null);
  const [level, setLevel] = useState(1);
  const levelRef = useRef(level);
  const levelPopupRef = useRef(null);
  const [showEnableSound, setShowEnableSound] = useState(false);
  
  const startLevel = useCallback((lv) => {
    const speedMul = 1 + Math.max(0, lv - 1) * 0.18;
    let cfg = LEVELS[lv];
    if (!cfg) {
      const count = Math.min(5, 2 + Math.floor((lv - 1) / 2));
      const colors = ['#ffd37a', '#f2a6ff', '#9ef0a6', '#a6d8ff', '#ffd6e6', '#c9ffdd'];
      const enemies = [];
      for (let i = 0; i < count; i++) {
        const x = 700 + i * 80 + (Math.random() * 40 - 20) + (lv % 3) * 8;
        const y = 320 + (i % 2) * 40 + Math.floor(Math.random() * 60) - 20;
        const r = Math.max(14, 36 - Math.floor(lv / 6) * 2 - Math.floor(Math.random() * 8));
        const color = colors[i % colors.length];
        enemies.push({ x, y, r, color });
      }
      cfg = { enemies };
    }
    enemiesRef.current = cfg.enemies.map(e => ({
      x: e.x,
      y: e.y,
      baseY: e.y,
      r: e.r,
      vx: (typeof e.vx === 'number' ? e.vx : ((Math.random() * 0.8 + 0.4) * (Math.random() < 0.5 ? -1 : 1))) * speedMul,
      vy: (typeof e.vy === 'number' ? e.vy : (Math.random() * 1.2 - 0.6)) * speedMul,
      bob: Math.random() * 12 + 6,
      phase: Math.random() * Math.PI * 2,
      changeTimer: Math.random() * 1500 + 500,
      color: e.color || '#9ef0a6'
    }));
    projectilesRef.current = [];

    setPopups([]);
    gameOverRef.current = false;
  }, []);

  useEffect(() => { startLevel(level); levelRef.current = level; }, [level, startLevel]);

  useEffect(() => {
    try {
      levelPopupRef.current = { level, t: 0, life: 0 };
      try {
        if (levelupSndRef.current) {
          levelupSndRef.current.currentTime = 0;
          levelupSndRef.current.play().then(()=>{}).catch(err=>console.warn('levelup play failed',err));
        }
      } catch (e) { console.warn('levelup play error', e); }
    } catch (e) { console.warn('level popup set error', e); }
  }, [level]);

  useEffect(() => { livesRef.current = lives; }, [lives]);

  useEffect(() => { try { onLevelChange(level); } catch (e) {} }, [level, onLevelChange]);

  useEffect(() => {
    try {
      if (slimeSprites && slimeSprites.length > 0) {
        const eimg = new Image();
        eimg.onload = () => { enemyImgRef.current = eimg; };
        eimg.onerror = () => { enemyImgRef.current = null; };
        eimg.src = slimeSprites[9] || slimeSprites[1] || slimeSprites[0];

        const aimg = new Image();
        aimg.onload = () => { avatarImgRef.current = aimg; };
        aimg.onerror = () => { avatarImgRef.current = null; };
        aimg.src = slimeSprites[selectedAvatar] || slimeSprites[0];
      }
    } catch (e) { enemyImgRef.current = null; avatarImgRef.current = null; }
  }, [slimeSprites, selectedAvatar]);

  useEffect(() => {
    try {
      clickSndRef.current = clickUrl ? new Audio(clickUrl) : null;
      hurtSndRef.current = hurtUrl ? new Audio(hurtUrl) : null;
      levelupSndRef.current = levelupUrl ? new Audio(levelupUrl) : null;
      splashSndRef.current = splashUrl ? new Audio(splashUrl) : null;
      bgSndRef.current = bgUrl ? new Audio(bgUrl) : null;
      try { if (clickSndRef.current) clickSndRef.current.volume = 0.6; } catch (e) {}
      try { if (hurtSndRef.current) hurtSndRef.current.volume = 0.6; } catch (e) {}
      try { if (levelupSndRef.current) levelupSndRef.current.volume = 0.6; } catch (e) {}
      try { if (splashSndRef.current) splashSndRef.current.volume = 0.6; } catch (e) {}
      if (bgSndRef.current) {
        try { bgSndRef.current.loop = true; bgSndRef.current.volume = 0.28; } catch (e) { console.warn('bg sound setup failed', e); }
      }
      try {
        if (bgSndRef.current) {
          const p = bgSndRef.current.play();
          if (p && typeof p.then === 'function') {
            p.then(() => { bgStartedRef.current = true; setShowEnableSound(false); }).catch(err => { bgStartedRef.current = false; setShowEnableSound(true); console.warn('bg autoplay blocked', err); });
          }
        }
      } catch (e) { console.warn('bg autoplay attempt error', e); setShowEnableSound(true); }
    } catch (e) { console.warn('audio preload error', e); }
    return () => {
      try { if (bgSndRef.current) { bgSndRef.current.pause(); bgSndRef.current.currentTime = 0; } } catch (e) {}
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const DPR = window.devicePixelRatio || 1; const W = 900; const H = 520;
    const PROJECTILE_SPEED_SCALE = 1.5;
    canvas.width = W * DPR; canvas.height = H * DPR; canvas.style.width = W + 'px'; canvas.style.height = H + 'px'; ctx.scale(DPR, DPR);
    const groundY = H - 60;

    let lastTime = performance.now();
    function update(t) {
      const msDelta = Math.min(40, t - lastTime); const dt = msDelta / 16; lastTime = t;

      const gravity = 0.6;
      projectilesRef.current.forEach(p => { p.vy += gravity * dt; p.x += p.vx * dt * PROJECTILE_SPEED_SCALE; p.y += p.vy * dt * PROJECTILE_SPEED_SCALE; });

      for (let i = projectilesRef.current.length - 1; i >= 0; i--) {
        const p = projectilesRef.current[i];
        if (p.y > groundY - p.r) {
          projectilesRef.current.splice(i,1);
          setLives(l => {
            const nl = Math.max(0, l - 1);
            if (nl === 0 && !gameOverRef.current) {
              gameOverRef.current = true;
              setTimeout(() => { try { onBack(scoreRef.current); } catch (e) {} }, 900);
            }
            return nl;
          });
          try { if (splashSndRef.current) { splashSndRef.current.currentTime = 0; splashSndRef.current.play().then(()=>{}).catch(err=>console.warn('splash play failed',err)); } } catch (e) { console.warn('splash play error', e); }
          continue;
        }
        let hit = false;
        for (let j = enemiesRef.current.length - 1; j >= 0; j--) {
          const e = enemiesRef.current[j]; const dx = p.x - e.x; const dy = p.y - e.y; const dist2 = dx*dx + dy*dy; const minDist = p.r + e.r;
          if (dist2 <= minDist*minDist) {
            try {
              setPopups(arr => [...arr, { x: e.x, y: e.y - e.r, text: '+100', t: 0, life: 0 }]);
            } catch (ePop) {}
            enemiesRef.current.splice(j,1); projectilesRef.current.splice(i,1);
            setScore(s => {
              const nv = s + 100;
              try { scoreRef.current = nv; } catch (e) {}
              return nv;
            });
            try { scoreRef.current += 0; } catch (e) {}
            try { onScoreAdd(100); } catch (e) {}
            try { if (hurtSndRef.current) { hurtSndRef.current.currentTime = 0; hurtSndRef.current.play().then(()=>{}).catch(err=>console.warn('hurt play failed',err)); } } catch (e) { console.warn('hurt play error', e); }
            hit = true; break;
          }
        }
        if (hit) continue;
        if (p.x > W + 100 || p.y > H + 200 || p.x < -200) {
          projectilesRef.current.splice(i,1);
          
          setLives(l => {
            const nl = Math.max(0, l - 1);
            if (nl === 0 && !gameOverRef.current) {
              gameOverRef.current = true;
              setTimeout(() => { try { onBack(scoreRef.current); } catch (e) {} }, 900);
            }
            return nl;
          });
          try { if (splashSndRef.current) { splashSndRef.current.currentTime = 0; splashSndRef.current.play().then(()=>{}).catch(err=>console.warn('splash play failed',err)); } } catch (e) { console.warn('splash play error', e); }
          continue;
        }
      }

      if (enemiesRef.current.length === 0) {
        const next = levelRef.current + 1;
        setTimeout(() => { setLevel(next); }, 900);
      }

      enemiesRef.current.forEach(e => {
        if (typeof e.vx === 'number' && e.vx !== 0) {
          e.x += e.vx * dt * 1.8;
          const minX = 420; const maxX = W - 120;
          if (e.x < minX) { e.x = minX; e.vx = Math.abs(e.vx); }
          if (e.x > maxX) { e.x = maxX; e.vx = -Math.abs(e.vx); }
        }

        if (typeof e.vy === 'number' && e.vy !== 0) {
          e.baseY = (typeof e.baseY === 'number') ? e.baseY : e.y;
          e.baseY += e.vy * dt * 1.8;
          const minY = 80; const maxY = groundY - 80;
          if (e.baseY < minY) { e.baseY = minY; e.vy = Math.abs(e.vy); }
          if (e.baseY > maxY) { e.baseY = maxY; e.vy = -Math.abs(e.vy); }
        }
          
          if (typeof e.changeTimer === 'number') {
            e.changeTimer -= msDelta;
            if (e.changeTimer <= 0) {
              
              const speedFactor = 0.6 + Math.random() * 1.0;
              if (typeof e.vx === 'number') e.vx = (Math.random() < 0.5 ? -1 : 1) * Math.abs(e.vx) * speedFactor;
              if (typeof e.vy === 'number') e.vy = (Math.random() < 0.5 ? -1 : 1) * Math.abs(e.vy) * speedFactor;
              
              const lvl = Math.max(1, levelRef.current || 1);
              const baseNext = Math.random() * 1500 + 400;
              e.changeTimer = Math.max(120, baseNext / (1 + (lvl - 1) * 0.06));
            }
          }

        if (typeof e.phase === 'number') {
          e.phase += dt * 0.12 * ((Math.abs(e.vx) + Math.abs(e.vy)) || 0.8);
          e.y = (e.baseY || e.y) + Math.sin(e.phase) * (e.bob || 6);
        }
      });

      ctx.clearRect(0,0,W,H);
      const g = ctx.createLinearGradient(0,0,0,H);
      g.addColorStop(0, '#aeefff');
      g.addColorStop(0.45, '#7fd8ff');
      g.addColorStop(1, '#4aa8ff');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,W,H);

      const sunR = 36;
      const sunMargin = 60;
      const sunX = W - sunMargin - sunR;
      const sunY = sunMargin + sunR;
      const sunG = ctx.createRadialGradient(sunX, sunY, sunR * 0.1, sunX, sunY, sunR);
      sunG.addColorStop(0, '#fff9b0');
      sunG.addColorStop(0.25, '#fff089');
      sunG.addColorStop(1, '#ffd54a');
      ctx.fillStyle = sunG;
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
      ctx.fill();

      if (showEnableSound) {
        const soundBtnW = 120; const soundBtnH = 28;
        const soundBtnX = sunX - sunR - 12 - soundBtnW; const soundBtnY = sunMargin;
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; roundRect(ctx, soundBtnX, soundBtnY, soundBtnW, soundBtnH, 6, true, false);
        ctx.fillStyle = '#fff'; ctx.font = '14px sans-serif'; ctx.fillText('Enable Sound', soundBtnX + 12, soundBtnY + 18);
        ctx.restore();
      }

      const grassG = ctx.createLinearGradient(0, groundY, 0, H);
      grassG.addColorStop(0, '#70b84a');
      grassG.addColorStop(1, '#3f8a2a');
      ctx.fillStyle = grassG;
      ctx.fillRect(0, groundY, W, H - groundY);
      const lx = 96; const ly = groundY - 24;
      if (avatarImgRef.current) { const img = avatarImgRef.current; const r = 36; const scale = Math.min((r*2)/img.width, (r*2)/img.height); const w = Math.round(img.width*scale); const h = Math.round(img.height*scale); ctx.drawImage(img, lx - w/2, ly - h/2, w, h); } else { drawSlime(ctx, lx, ly, 36, '#7be36b'); }

      ctx.fillStyle = '#fff';

      const scoreText = `Score: ${scoreRef.current}`;
      const livesText = `Lives: ${livesRef.current}`;
      const levelText = `Level: ${levelRef.current}`;

      ctx.font = '18px sans-serif';
      const scoreW = ctx.measureText(scoreText).width;
      ctx.font = '14px sans-serif';
      const livesW = ctx.measureText(livesText).width;
      const leftW = Math.max(scoreW, livesW) + 24;
      const leftX = 8;
      const boxY = 8;
      const boxH = 55;
      ctx.fillStyle = 'rgba(0,0,0,0.45)';
      roundRect(ctx, leftX, boxY, leftW, boxH, 8, true, false);

      ctx.font = '18px sans-serif';
      const levelW = ctx.measureText(levelText).width;
      const rightW = levelW + 24;
      const rightX = W - 8 - rightW;
      roundRect(ctx, rightX, boxY, rightW, 30, 8, true, false);

      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.fillText(scoreText, leftX + 12, 28);
      ctx.font = '14px sans-serif';
      ctx.fillText(livesText, leftX + 12, 50);
      ctx.font = '18px sans-serif';
      ctx.fillText(levelText, rightX + 12, 28);

      const MIN_PWR = 0; const MAX_PWR = 50; const MAX_AIM_LEN = 200; const target = aimTargetRef.current || { x: lx + Math.cos((aimAngleRef.current*Math.PI)/180)*MAX_AIM_LEN, y: ly - Math.sin((aimAngleRef.current*Math.PI)/180)*MAX_AIM_LEN };
      const rawDx = target.x - lx; const rawDy = target.y - ly; const rawDist = Math.sqrt(rawDx*rawDx + rawDy*rawDy); const cappedDist = Math.min(rawDist, MAX_AIM_LEN);
      powerRef.current = MIN_PWR + (MAX_PWR - MIN_PWR) * (cappedDist / MAX_AIM_LEN);

      ctx.save(); ctx.strokeStyle = 'rgba(20,20,20,0.6)'; ctx.lineWidth = 2; ctx.setLineDash([8,6]); ctx.beginPath(); const aimRad = (aimAngleRef.current*Math.PI)/180; ctx.moveTo(lx + Math.cos(aimRad)*10, ly - Math.sin(aimRad)*10); ctx.lineTo(lx + Math.cos(aimRad)*cappedDist, ly - Math.sin(aimRad)*cappedDist); ctx.stroke(); ctx.setLineDash([]); ctx.restore();

      enemiesRef.current.forEach(e => { const img = enemyImgRef.current; if (img) { const diam = e.r*2; const iw = img.width; const ih = img.height; const scale = Math.min(diam/iw, diam/ih); const w = Math.round(iw*scale); const h = Math.round(ih*scale); ctx.drawImage(img, e.x - w/2, e.y - h/2, w, h); } else { drawSlime(ctx, e.x, e.y, e.r, e.color); } });

      projectilesRef.current.forEach(p => drawBubble(ctx, p.x, p.y, p.r));

      setPopups(pops => pops
        .map(pu => ({ ...pu, t: pu.t + msDelta/400, life: pu.life + msDelta }))
        .filter(pu => pu.life < 900)
      );
      if (popups.length) {
        popups.forEach(pu => {
          const alpha = Math.max(0, 1 - pu.t);
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#ffd86b';
          ctx.font = '16px sans-serif';
          const textW = ctx.measureText(pu.text).width;
          const yOff = pu.t * 36;
          ctx.fillText(pu.text, pu.x - textW / 2, pu.y - yOff);
          ctx.restore();
        });
      }

      if (levelPopupRef.current) {
        const lp = levelPopupRef.current;
        lp.t = lp.t + msDelta/600;
        lp.life = lp.life + msDelta;
        if (lp.life >= 1400) {
          levelPopupRef.current = null;
        } else {
          const alpha = Math.max(0, 1 - lp.t);
          const scale = 1 + (1 - alpha) * 0.9;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.fillStyle = '#ffffff';
          ctx.font = `${Math.round(28 * scale)}px sans-serif`;
          const text = `Level ${lp.level}`;
          const tw = ctx.measureText(text).width;
          
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.fillText(text, (W - tw) / 2 + 3, 88 + 3);
          
          ctx.fillStyle = '#ffd86b';
          ctx.fillText(text, (W - tw) / 2, 88);
          ctx.restore();
        }
      }

      const hudH = 36; ctx.save(); ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,H-hudH,W,hudH);
      const meterW=360, meterH=12, meterX=(W-meterW)/2, meterY=H-hudH/2-meterH/2; roundRect(ctx, meterX, meterY, meterW, meterH, 8, true, false);
      const ppc = Math.max(0, Math.min(100, ((powerRef.current - MIN_PWR)/(MAX_PWR-MIN_PWR))*100)); const grad=ctx.createLinearGradient(meterX,0,meterX+meterW,0); grad.addColorStop(0,'#66ccff'); grad.addColorStop(1,'#7be36b'); ctx.fillStyle=grad; roundRect(ctx, meterX+2, meterY+2, (meterW-4)*(ppc/100), meterH-4,6,true,false);
      ctx.fillStyle='#fff'; ctx.font='14px sans-serif'; ctx.fillText(`Angle: ${Math.round(aimAngleRef.current)}°`, meterX-90, meterY+meterH/2+5);
      const btnW=90, btnH=28, startX=W-14-btnW;
      ctx.save();
      let btnY = H-hudH/2-btnH/2;
      ctx.save();
      if (menuHoverRef.current) {
        ctx.fillStyle = '#4d8ed6';
        ctx.shadowColor = 'rgba(44,56,120,0.18)';
        ctx.shadowBlur = 8;
      } else {
        ctx.fillStyle = 'rgba(255,255,255,0.08)';
        ctx.shadowBlur = 0;
      }
      roundRect(ctx, startX, btnY, btnW, btnH, 8, true, false);
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#fff';
      ctx.font = '18px sans-serif';
      ctx.fillText('Menu', startX + (btnW - ctx.measureText('Menu').width) / 2, H - hudH / 2 + 6);
      ctx.restore();
      ctx.restore();

      animationRef.current = requestAnimationFrame(update);
    }

    animationRef.current = requestAnimationFrame(update);
    return () => { if (animationRef.current) cancelAnimationFrame(animationRef.current); };
  }, [slimeSprites, selectedAvatar]);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return; const getMousePos = e => { const rect = canvas.getBoundingClientRect(); return { x: e.clientX - rect.left, y: e.clientY - rect.top }; };
      const onMove = e => {
      const pos = getMousePos(e);
      const lx=96, groundY=520-60, ly=groundY-24;
      const dx = pos.x - lx; const dy = pos.y - ly;
      let deg = Math.atan2(-dy,dx)*180/Math.PI; if (deg<0) deg+=360; if (deg>180) deg=180; deg = Math.max(10, Math.min(80, deg));
      aimAngleRef.current = deg; aimTargetRef.current = pos;

      const W=900, H=520, hudH=36, btnW=90, startX=W-14-btnW, by=H-hudH/2-28/2;
      const hovering = (pos.x >= startX && pos.x <= startX+btnW && pos.y >= by && pos.y <= by+28);
      if (menuHoverRef.current !== hovering) {
        menuHoverRef.current = hovering;
      }
    };
    const onClick = e => {
      const pos = getMousePos(e);
      const W=900, H=520, hudH=36; const btnW=90, startX=W-14-btnW, by=H-hudH/2-28/2;
      if (pos.x >= startX && pos.x <= startX+btnW && pos.y >= by && pos.y <= by+28) { onBack(scoreRef.current); return; }
      if (showEnableSound) {
        const sunR = 36; const sunMargin = 18;
        const sunX = W - sunMargin - sunR; const soundBtnW = 120; const soundBtnH = 28;
        const soundBtnX = sunX - sunR - 12 - soundBtnW; const soundBtnY = sunMargin;
        if (pos.x >= soundBtnX && pos.x <= soundBtnX + soundBtnW && pos.y >= soundBtnY && pos.y <= soundBtnY + soundBtnH) {
          try {
            if (bgSndRef.current && !bgStartedRef.current) {
              bgSndRef.current.currentTime = 0;
              bgSndRef.current.play().then(() => { bgStartedRef.current = true; setShowEnableSound(false); }).catch(err => { console.warn('bg play failed on enable', err); });
            }
          } catch (e) { console.warn('bg enable play error', e); }
          return;
        }
      }
      try {
        if (clickSndRef.current) {
          clickSndRef.current.currentTime = 0;
          clickSndRef.current.play().then(()=>{ /* played */ }).catch(err => console.warn('click play failed', err));
        }
      } catch (e) { console.warn('click play error', e); }
      try {
        if (bgSndRef.current && !bgStartedRef.current) {
          bgSndRef.current.play().then(() => { bgStartedRef.current = true; console.log('[audio] bg started'); setShowEnableSound(false); }).catch(err => { bgStartedRef.current = false; setShowEnableSound(true); console.warn('bg play failed', err); });
        }
      } catch (e) {}
      const startXpos = 96;
      const startY = canvas.height / (window.devicePixelRatio || 1) - 60 - 24;
      const rad = (aimAngleRef.current*Math.PI)/180;
      const speed = powerRef.current/1.8;
      const vx = Math.cos(rad)*speed;
      const vy = -Math.sin(rad)*speed;
      projectilesRef.current.push({ x: startXpos, y: startY, vx, vy, r: 14 });
    };
    canvas.addEventListener('mousemove', onMove); canvas.addEventListener('click', onClick);
    return () => { menuHoverRef.current = false; canvas.removeEventListener('mousemove', onMove); canvas.removeEventListener('click', onClick); };
  }, []);

  return (
    <div>
      <canvas ref={canvasRef} className="game-canvas" />
    </div>
  );
}
