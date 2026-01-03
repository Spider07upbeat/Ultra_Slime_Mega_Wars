import React, { useEffect, useState } from 'react';
import './App.css';
import MenuView from './components/MenuView';
import GameCanvas from './components/GameCanvas';
import { supabase } from './supabaseClient';

// carregar todas as imagens de slime
let slimeSprites = [];
try {
  const ctx = require.context('./assets/img', false, /\.png$/);
  slimeSprites = ctx.keys().map(k => ctx(k));
} catch (e) {
  slimeSprites = [];
}

function App() {
  const [mode, setMode] = useState('menu');
  const [score, setScore] = useState(0);
  const [, setLevel] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [highScores, setHighScores] = useState([]);

  // atualizar score do jogo
  function addScore(n) { setScore(s => s + n); }
  function resetScore() { setScore(0); }

  // carregar highscores do Supabase
  async function loadHighScores() {
    const { data, error } = await supabase
      .from('highscores')
      .select('*')
      .order('score', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Erro a carregar highscores:', error);
      return [];
    }

    return data;
  }

  // adicionar highscore no Supabase
  async function addHighScore(name, value) {
    if (value <= 0) return;

    const { error } = await supabase
      .from('highscores')
      .insert([{ name: name || 'Player', score: value }]);

    if (error) {
      console.error('Erro a guardar highscore:', error);
      return;
    }

    // atualizar lista
    const updated = await loadHighScores();
    setHighScores(updated);
  }

  // iniciar jogo
  function startGame() {
    resetScore();
    setMode('play');
  }

  // voltar ao menu
  function backToMenu(finalScore) {
    const toSave = typeof finalScore === 'number' ? finalScore : score;
    if (toSave > 0) {
      const name = window.prompt('Enter your name for the high score (leave blank for "Player")', 'Player') || 'Player';
      addHighScore(name, toSave);
    }
    resetScore();
    setMode('menu');
  }
  useEffect(() => {
    if (mode === 'highscore') {
      loadHighScores().then(setHighScores);
    }
  }, [mode]);

  return (
    <div className="App game-root">
      <header className="App-header game-header">

        {mode === 'menu' && (
          <MenuView
            onStart={startGame}
            onHighscore={() => setMode('highscore')}
            sprites={slimeSprites}
            selectedAvatar={selectedAvatar}
            setSelectedAvatar={setSelectedAvatar}
          />
        )}

        {mode === 'highscore' && (
          <div className="menu">
            <h2>High Scores</h2>
            {highScores.length === 0 && <p>No high scores yet. Play and submit your score!</p>}
            {highScores.length > 0 && (
              <ol style={{ textAlign:'left', maxWidth:420, margin:'8px auto' }}>
                {highScores.map((h, idx) => (
                  <li key={idx} style={{ marginBottom:6 }}>
                    <strong>{h.name}</strong> — {h.score}{" "}
                    <span style={{ color:'#888', fontSize:12 }}>
                      ({h.created_at ? new Date(h.created_at).toLocaleString() : '-'})
                    </span>
                  </li>
                ))}
              </ol>
            )}
            <div className="menu-buttons">
              <button onClick={() => setMode('menu')}>Back</button>
            </div>
          </div>
        )}

        {mode === 'play' && (
          <>
            <div className="game-top">
              <div className="title">Ultra Slime Mega Wars</div>
            </div>
            <GameCanvas
              slimeSprites={slimeSprites}
              selectedAvatar={selectedAvatar}
              onBack={backToMenu}
              onScoreAdd={addScore}
              onLevelChange={setLevel}
            />
          </>
        )}

      </header>
    </div>
  );
}

export default App;
