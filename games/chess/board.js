class ChessBoard {
    constructor() {
        this.board = Array(8).fill().map(() => Array(8).fill(null));
        this.initializeBoard();
        this.moveHistory = [];
        this.capturedPieces = {
            white: [],
            black: []
        };
    }

    initializeBoard() {
        // 初始化白方棋子
        this.placePiece(new Rook('white', { x: 0, y: 7 }));
        this.placePiece(new Knight('white', { x: 1, y: 7 }));
        this.placePiece(new Bishop('white', { x: 2, y: 7 }));
        this.placePiece(new Queen('white', { x: 3, y: 7 }));
        this.placePiece(new King('white', { x: 4, y: 7 }));
        this.placePiece(new Bishop('white', { x: 5, y: 7 }));
        this.placePiece(new Knight('white', { x: 6, y: 7 }));
        this.placePiece(new Rook('white', { x: 7, y: 7 }));
        for (let i = 0; i < 8; i++) {
            this.placePiece(new Pawn('white', { x: i, y: 6 }));
        }

        // 初始化黑方棋子
        this.placePiece(new Rook('black', { x: 0, y: 0 }));
        this.placePiece(new Knight('black', { x: 1, y: 0 }));
        this.placePiece(new Bishop('black', { x: 2, y: 0 }));
        this.placePiece(new Queen('black', { x: 3, y: 0 }));
        this.placePiece(new King('black', { x: 4, y: 0 }));
        this.placePiece(new Bishop('black', { x: 5, y: 0 }));
        this.placePiece(new Knight('black', { x: 6, y: 0 }));
        this.placePiece(new Rook('black', { x: 7, y: 0 }));
        for (let i = 0; i < 8; i++) {
            this.placePiece(new Pawn('black', { x: i, y: 1 }));
        }
    }

    placePiece(piece) {
        this.board[piece.position.y][piece.position.x] = piece;
    }

    getPiece(position) {
        if (!this.isValidPosition(position)) return null;
        return this.board[position.y][position.x];
    }

    isValidPosition(position) {
        return position.x >= 0 && position.x < 8 && position.y >= 0 && position.y < 8;
    }

    movePiece(from, to) {
        console.log('Moving piece from:', from, 'to:', to);
        const piece = this.getPiece(from);
        if (!piece) {
            console.error('No piece found at from position:', from);
            return false;
        }

        const capturedPiece = this.getPiece(to);
        if (capturedPiece) {
            console.log('Capturing piece:', capturedPiece);
            this.capturedPieces[piece.color].push(capturedPiece);
        }

        // 更新棋盘状态
        this.board[from.y][from.x] = null;
        this.board[to.y][to.x] = piece;
        
        // 更新棋子位置
        piece.position = to;
        piece.hasMoved = true;

        // 记录移动历史
        this.moveHistory.push({
            piece,
            from,
            to,
            captured: capturedPiece
        });

        console.log('Move completed successfully');
        return true;
    }

    undoLastMove() {
        const lastMove = this.moveHistory.pop();
        if (!lastMove) return false;

        const { piece, from, to, captured } = lastMove;
        this.board[from.y][from.x] = piece;
        this.board[to.y][to.x] = captured;
        piece.position = from;
        piece.hasMoved = false;

        if (captured) {
            this.capturedPieces[piece.color].pop();
        }

        return true;
    }

    isKingInCheck(color) {
        const king = this.findKing(color);
        if (!king) return false;

        const opponentPieces = this.getAllPieces(color === 'white' ? 'black' : 'white');
        for (const piece of opponentPieces) {
            const moves = piece.getValidMoves(this);
            for (const move of moves) {
                if (move.x === king.position.x && move.y === king.position.y) {
                    return true;
                }
            }
        }

        return false;
    }

    findKing(color) {
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y][x];
                if (piece instanceof King && piece.color === color) {
                    return piece;
                }
            }
        }
        return null;
    }

    getAllPieces(color) {
        const pieces = [];
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const piece = this.board[y][x];
                if (piece && piece.color === color) {
                    pieces.push(piece);
                }
            }
        }
        return pieces;
    }

    getPiecesByType(color, type) {
        return this.getAllPieces(color).filter(piece => piece instanceof type);
    }

    canCastle(king, rook) {
        const direction = rook.position.x > king.position.x ? 1 : -1;
        const startX = king.position.x;
        const endX = rook.position.x;

        // 检查中间是否有其他棋子
        for (let x = startX + direction; x !== endX; x += direction) {
            if (this.board[king.position.y][x] !== null) {
                return false;
            }
        }

        return true;
    }

    isCheckmate(color) {
        if (!this.isKingInCheck(color)) return false;

        const pieces = this.getAllPieces(color);
        for (const piece of pieces) {
            const moves = piece.getValidMoves(this);
            for (const move of moves) {
                // 尝试移动
                const originalPosition = { ...piece.position };
                const capturedPiece = this.getPiece(move);
                this.movePiece(originalPosition, move);

                // 检查移动后是否仍被将军
                const stillInCheck = this.isKingInCheck(color);

                // 撤销移动
                this.undoLastMove();

                if (!stillInCheck) {
                    return false;
                }
            }
        }

        return true;
    }
}

// 将类赋值给全局变量
ChessBoard = ChessBoard; 