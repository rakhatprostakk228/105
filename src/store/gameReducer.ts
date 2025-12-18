import type { GameState, GameAction, Player, RoundScore } from '../types/game'

const updatePlayerStatus = (total: number, targetScore: number): Player['status'] => {
    if (total > targetScore) {
        return 'out'
    }
    if (total === targetScore) {
        return 'playing'
    }
    return 'playing'
}

const calculateNewTotal = (currentTotal: number, newScore: number, targetScore: number): number => {
    const newTotal = currentTotal + newScore
    if (newTotal === targetScore) {
        return 0
    }
    return newTotal
}

const updatePlayersAfterRound = (players: Player[], roundScores: RoundScore[], targetScore: number): Player[] => {
    return players.map(player => {
        const roundScore = roundScores.find(rs => rs.playerId === player.id)
        if (!roundScore) {
            return player
        }

        const newTotal = calculateNewTotal(player.total, roundScore.score, targetScore)
        const newScores = [...player.scores, roundScore.score]
        const status = updatePlayerStatus(newTotal, targetScore)

        return {
            ...player,
            scores: newScores,
            total: newTotal,
            status
        }
    })
}

const markWinner = (players: Player[]): Player[] => {
    const activePlayers = players.filter(p => p.status === 'playing')
    if (activePlayers.length === 1) {
        return players.map(player =>
            player.id === activePlayers[0].id
                ? { ...player, status: 'winner' as const }
                : player
        )
    }
    return players
}

export const initialState: GameState = {
    players: [],
    currentRound: 0,
    maxPlayers: 5,
    targetScore: 105
}

export const gameReducer = (state: GameState, action: GameAction): GameState => {
    switch (action.type) {
        case 'ADD_PLAYER': {
            if (state.players.length >= state.maxPlayers) {
                return state
            }

            const newPlayer: Player = {
                id: crypto.randomUUID(),
                name: action.payload.name.trim(),
                scores: [],
                total: 0,
                status: 'playing'
            }

            return {
                ...state,
                players: [...state.players, newPlayer]
            }
        }

        case 'REMOVE_PLAYER': {
            return {
                ...state,
                players: state.players.filter(p => p.id !== action.payload.id)
            }
        }

        case 'ADD_ROUND': {
            if (state.players.length === 0) {
                return state
            }

            const updatedPlayers = updatePlayersAfterRound(
                state.players,
                action.payload.roundScores,
                state.targetScore
            )

            const playersWithWinner = markWinner(updatedPlayers)

            return {
                ...state,
                players: playersWithWinner,
                currentRound: state.currentRound + 1
            }
        }

        default:
            return state
    }
}

