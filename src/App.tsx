import { useReducer, useState } from 'react'
import { gameReducer, initialState } from './store/gameReducer'
import type { Player, RoundScore } from './types/game'
import './App.css'

function App() {
    const [state, dispatch] = useReducer(gameReducer, initialState)
    const [playerName, setPlayerName] = useState('')
    const [roundScores, setRoundScores] = useState<Record<string, string>>({})

    const handleAddPlayer = () => {
        if (playerName.trim() && state.players.length < state.maxPlayers) {
            dispatch({ type: 'ADD_PLAYER', payload: { name: playerName } })
            setPlayerName('')
        }
    }

    const handleRemovePlayer = (id: string) => {
        dispatch({ type: 'REMOVE_PLAYER', payload: { id } })
    }

    const handleScoreChange = (playerId: string, value: string) => {
        setRoundScores(prev => ({
            ...prev,
            [playerId]: value
        }))
    }

    const handleAddRound = () => {
        const scores: RoundScore[] = state.players
            .filter(player => player.status === 'playing')
            .map(player => {
                const scoreValue = roundScores[player.id] || '0'
                const score = parseInt(scoreValue, 10) || 0
                return {
                    playerId: player.id,
                    score
                }
            })

        if (scores.length > 0) {
            dispatch({ type: 'ADD_ROUND', payload: { roundScores: scores } })
            setRoundScores({})
        }
    }

    const getStatusClass = (status: Player['status']): string => {
        switch (status) {
            case 'out':
                return 'player-out'
            case 'winner':
                return 'player-winner'
            default:
                return ''
        }
    }

    const getStatusText = (status: Player['status']): string => {
        switch (status) {
            case 'out':
                return 'Проиграл'
            case 'winner':
                return 'Победитель!'
            default:
                return 'В игре'
        }
    }

    const activePlayers = state.players.filter(p => p.status === 'playing')
    const canAddRound = activePlayers.length > 1 && 
        activePlayers.every(player => roundScores[player.id] !== undefined && roundScores[player.id] !== '')
    const gameStarted = state.currentRound > 0

    return (
        <div className="app">
            <h1>Игра 105</h1>

            <div className="setup-section">
                <h2>Игроки</h2>
                <div className={`add-player-form ${gameStarted ? 'hidden' : ''}`}>
                    <input
                        type="text"
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                        placeholder="Имя игрока"
                        maxLength={20}
                        disabled={state.players.length >= state.maxPlayers || gameStarted}
                    />
                    <button
                        onClick={handleAddPlayer}
                        disabled={!playerName.trim() || state.players.length >= state.maxPlayers || gameStarted}
                    >
                        Добавить игрока ({state.players.length}/{state.maxPlayers})
                    </button>
                </div>

                <div className="players-list">
                    {state.players.map(player => (
                        <div key={player.id} className={`player-card ${getStatusClass(player.status)}`}>
                            <div className="player-header">
                                <h3>{player.name}</h3>
                                {!gameStarted && player.status !== 'winner' && (
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemovePlayer(player.id)}
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <div className="player-stats">
                                <div className="total-score">
                                    Общий счет: <strong>{player.total}</strong>
                                </div>
                                <div className="status-badge">
                                    {getStatusText(player.status)}
                                </div>
                            </div>
                            {player.scores.length > 0 && (
                                <div className="scores-history">
                                    Раунды: {player.scores.join(', ')}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {state.players.length >= 2 && (
                <div className="round-section">
                    <h2>Раунд {state.currentRound + 1}</h2>
                    <div className="round-scores">
                        {activePlayers.map(player => (
                            <div key={player.id} className="score-input-group">
                                <label>{player.name}</label>
                                <input
                                    type="number"
                                    value={roundScores[player.id] || ''}
                                    onChange={(e) => handleScoreChange(player.id, e.target.value)}
                                    placeholder="0"
                                />
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleAddRound}
                        disabled={!canAddRound}
                        className="add-round-btn"
                    >
                        Добавить раунд
                    </button>
                </div>
            )}

            {state.players.some(p => p.status === 'winner') && (
                <div className="winner-announcement">
                    <h2>🎉 Игра завершена! 🎉</h2>
                    <p>
                        Победитель: {state.players.find(p => p.status === 'winner')?.name}
                    </p>
                </div>
            )}
        </div>
    )
}

export default App
