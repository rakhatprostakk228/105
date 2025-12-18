export type PlayerStatus = 'playing' | 'out' | 'winner'

export type Player = {
    id: string
    name: string
    scores: number[]
    total: number
    status: PlayerStatus
}

export type RoundScore = {
    playerId: string
    score: number
}

export type GameState = {
    players: Player[]
    currentRound: number
    maxPlayers: number
    targetScore: number
}

export type GameAction =
    | { type: 'ADD_PLAYER'; payload: { name: string } }
    | { type: 'REMOVE_PLAYER'; payload: { id: string } }
    | { type: 'ADD_ROUND'; payload: { roundScores: RoundScore[] } }