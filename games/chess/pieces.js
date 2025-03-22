class Piece {
    constructor(color, position) {
        this.color = color; // 'white' 或 'black'
        this.position = position; // {x, y}
        this.hasMoved = false;
    }

    getValidMoves(board) {
        console.log('Getting valid moves for piece:', this);
        return [];
    }

    move(newPosition) {
        this.position = newPosition;
        this.hasMoved = true;
    }
}

class Pawn extends Piece {
    getValidMoves(board) {
        console.log('Getting valid moves for pawn at:', this.position);
        const moves = [];
        const direction = this.color === 'white' ? -1 : 1;
        const startRow = this.color === 'white' ? 6 : 1;

        // 前进一步
        const oneStep = { x: this.position.x, y: this.position.y + direction };
        if (board.isValidPosition(oneStep) && !board.getPiece(oneStep)) {
            moves.push(oneStep);
            console.log('Valid one step move:', oneStep);
            
            // 首次移动可以前进两步
            if (!this.hasMoved && this.position.y === startRow) {
                const twoStep = { x: this.position.x, y: this.position.y + 2 * direction };
                if (!board.getPiece(twoStep)) {
                    moves.push(twoStep);
                    console.log('Valid two step move:', twoStep);
                }
            }
        }

        // 吃子
        const captures = [
            { x: this.position.x - 1, y: this.position.y + direction },
            { x: this.position.x + 1, y: this.position.y + direction }
        ];

        for (const capture of captures) {
            if (board.isValidPosition(capture)) {
                const piece = board.getPiece(capture);
                if (piece && piece.color !== this.color) {
                    moves.push(capture);
                    console.log('Valid capture move:', capture);
                }
            }
        }

        console.log('All valid moves for pawn:', moves);
        return moves;
    }
}

class Rook extends Piece {
    getValidMoves(board) {
        const moves = [];
        const directions = [
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 0 }, { x: -1, y: 0 }
        ];

        for (const dir of directions) {
            let currentPos = {
                x: this.position.x + dir.x,
                y: this.position.y + dir.y
            };

            while (board.isValidPosition(currentPos)) {
                const piece = board.getPiece(currentPos);
                if (!piece) {
                    moves.push({ ...currentPos });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ ...currentPos });
                    }
                    break;
                }
                currentPos.x += dir.x;
                currentPos.y += dir.y;
            }
        }

        return moves;
    }
}

class Knight extends Piece {
    getValidMoves(board) {
        const moves = [];
        const offsets = [
            { x: 2, y: 1 }, { x: 2, y: -1 },
            { x: -2, y: 1 }, { x: -2, y: -1 },
            { x: 1, y: 2 }, { x: 1, y: -2 },
            { x: -1, y: 2 }, { x: -1, y: -2 }
        ];

        for (const offset of offsets) {
            const newPos = {
                x: this.position.x + offset.x,
                y: this.position.y + offset.y
            };

            if (board.isValidPosition(newPos)) {
                const piece = board.getPiece(newPos);
                if (!piece || piece.color !== this.color) {
                    moves.push(newPos);
                }
            }
        }

        return moves;
    }
}

class Bishop extends Piece {
    getValidMoves(board) {
        const moves = [];
        const directions = [
            { x: 1, y: 1 }, { x: 1, y: -1 },
            { x: -1, y: 1 }, { x: -1, y: -1 }
        ];

        for (const dir of directions) {
            let currentPos = {
                x: this.position.x + dir.x,
                y: this.position.y + dir.y
            };

            while (board.isValidPosition(currentPos)) {
                const piece = board.getPiece(currentPos);
                if (!piece) {
                    moves.push({ ...currentPos });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ ...currentPos });
                    }
                    break;
                }
                currentPos.x += dir.x;
                currentPos.y += dir.y;
            }
        }

        return moves;
    }
}

class Queen extends Piece {
    getValidMoves(board) {
        const moves = [];
        const directions = [
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 1, y: 1 }, { x: 1, y: -1 },
            { x: -1, y: 1 }, { x: -1, y: -1 }
        ];

        for (const dir of directions) {
            let currentPos = {
                x: this.position.x + dir.x,
                y: this.position.y + dir.y
            };

            while (board.isValidPosition(currentPos)) {
                const piece = board.getPiece(currentPos);
                if (!piece) {
                    moves.push({ ...currentPos });
                } else {
                    if (piece.color !== this.color) {
                        moves.push({ ...currentPos });
                    }
                    break;
                }
                currentPos.x += dir.x;
                currentPos.y += dir.y;
            }
        }

        return moves;
    }
}

class King extends Piece {
    getValidMoves(board) {
        const moves = [];
        const directions = [
            { x: 0, y: 1 }, { x: 0, y: -1 },
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 1, y: 1 }, { x: 1, y: -1 },
            { x: -1, y: 1 }, { x: -1, y: -1 }
        ];

        for (const dir of directions) {
            const newPos = {
                x: this.position.x + dir.x,
                y: this.position.y + dir.y
            };

            if (board.isValidPosition(newPos)) {
                const piece = board.getPiece(newPos);
                if (!piece || piece.color !== this.color) {
                    moves.push(newPos);
                }
            }
        }

        // 王车易位
        if (!this.hasMoved && !board.isKingInCheck(this.color)) {
            const rooks = board.getPiecesByType(this.color, Rook);
            for (const rook of rooks) {
                if (!rook.hasMoved) {
                    const canCastle = board.canCastle(this, rook);
                    if (canCastle) {
                        moves.push({
                            x: rook.position.x,
                            y: this.position.y,
                            isCastle: true
                        });
                    }
                }
            }
        }

        return moves;
    }
}

// 将类赋值给全局变量
Piece = Piece;
Pawn = Pawn;
Rook = Rook;
Knight = Knight;
Bishop = Bishop;
Queen = Queen;
King = King; 