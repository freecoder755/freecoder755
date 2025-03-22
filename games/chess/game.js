class ChessGame {
    constructor() {
        console.log('ChessGame constructor called');
        this.board = new ChessBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.initializeUI();
        this.setupEventListeners();
    }

    initializeUI() {
        console.log('Initializing UI');
        this.chessBoard = document.getElementById('chess-board');
        if (!this.chessBoard) {
            console.error('Chess board element not found!');
            return;
        }
        console.log('Chess board element found:', this.chessBoard);
        
        this.currentPlayerDisplay = document.getElementById('current-player');
        this.gameStatusDisplay = document.getElementById('game-status');
        this.whiteCapturedDisplay = document.getElementById('white-captured');
        this.blackCapturedDisplay = document.getElementById('black-captured');

        this.renderBoard();
        this.updateCapturedPieces();
        this.updateGameStatus();
    }

    setupEventListeners() {
        console.log('Setting up event listeners');
        if (!this.chessBoard) {
            console.error('Cannot set up event listeners: chess board not found');
            return;
        }

        this.chessBoard.addEventListener('click', (e) => {
            console.log('Click event triggered');
            const square = e.target.closest('.square');
            
            if (!square) {
                console.log('Click was not on a square');
                return;
            }

            const x = parseInt(square.dataset.x);
            const y = parseInt(square.dataset.y);
            const position = { x, y };
            console.log('Clicked position:', position);

            const clickedPiece = this.board.getPiece(position);
            console.log('Clicked piece:', clickedPiece);

            // 清除之前的选择
            this.clearSelection();

            if (clickedPiece && clickedPiece.color === this.currentPlayer) {
                console.log('Selecting piece at:', position);
                this.selectPiece(position);
            }
        });

        const newGameBtn = document.getElementById('new-game');
        const undoMoveBtn = document.getElementById('undo-move');

        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.startNewGame());
        } else {
            console.error('New game button not found');
        }

        if (undoMoveBtn) {
            undoMoveBtn.addEventListener('click', () => this.undoMove());
        } else {
            console.error('Undo move button not found');
        }
    }

    renderBoard() {
        this.chessBoard.innerHTML = '';
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                const square = document.createElement('div');
                square.className = `square ${(x + y) % 2 === 0 ? 'white' : 'black'}`;
                square.dataset.x = x;
                square.dataset.y = y;

                const piece = this.board.getPiece({ x, y });
                if (piece) {
                    const pieceElement = document.createElement('div');
                    pieceElement.className = 'piece';
                    pieceElement.textContent = this.getPieceSymbol(piece);
                    square.appendChild(pieceElement);
                }

                this.chessBoard.appendChild(square);
            }
        }
    }

    getPieceSymbol(piece) {
        const symbols = {
            'white': {
                'King': '♔',
                'Queen': '♕',
                'Rook': '♖',
                'Bishop': '♗',
                'Knight': '♘',
                'Pawn': '♙'
            },
            'black': {
                'King': '♚',
                'Queen': '♛',
                'Rook': '♜',
                'Bishop': '♝',
                'Knight': '♞',
                'Pawn': '♟'
            }
        };
        return symbols[piece.color][piece.constructor.name];
    }

    selectPiece(position) {
        console.log('Selecting piece at position:', position);
        this.selectedPiece = position;
        const piece = this.board.getPiece(position);
        console.log('Selected piece:', piece);
        
        if (!piece) {
            console.error('No piece found at position:', position);
            return;
        }

        this.validMoves = piece.getValidMoves(this.board);
        console.log('Valid moves:', this.validMoves);
        
        // 高亮选中的棋子和有效移动
        const squares = this.chessBoard.querySelectorAll('.square');
        squares.forEach(square => {
            const x = parseInt(square.dataset.x);
            const y = parseInt(square.dataset.y);
            if (x === position.x && y === position.y) {
                console.log('Adding selected class to square:', square);
                square.classList.add('selected');
            } else if (this.validMoves.some(move => move.x === x && move.y === y)) {
                console.log('Adding valid-move class to square:', square);
                square.classList.add('valid-move');
            }
        });
    }

    clearSelection() {
        this.selectedPiece = null;
        this.validMoves = [];
        this.chessBoard.querySelectorAll('.square').forEach(square => {
            square.classList.remove('selected', 'valid-move');
        });
    }

    isValidMove(position) {
        return this.validMoves.some(move => {
            if (move.isCastle) {
                return position.x === move.x && position.y === move.y;
            }
            return move.x === position.x && move.y === position.y;
        });
    }

    makeMove(to) {
        console.log('Making move to:', to);
        const from = this.selectedPiece;
        const piece = this.board.getPiece(from);
        
        if (!piece) {
            console.error('No piece found at from position:', from);
            return;
        }

        // 处理王车易位
        if (piece instanceof King && this.validMoves.some(move => 
            move.x === to.x && move.y === to.y && move.isCastle)) {
            console.log('Performing castling');
            const rook = this.board.getPiece({ x: to.x, y: to.y });
            const rookFrom = { ...rook.position };
            const rookTo = {
                x: from.x + (to.x > from.x ? -2 : 2),
                y: from.y
            };
            this.board.movePiece(rookFrom, rookTo);
        }

        // 执行移动
        if (this.board.movePiece(from, to)) {
            console.log('Move successful');
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            this.selectedPiece = null;
            this.validMoves = [];
            
            // 更新界面
            this.renderBoard();
            this.updateCapturedPieces();
            this.updateGameStatus();
        } else {
            console.error('Move failed');
        }
    }

    updateCapturedPieces() {
        this.whiteCapturedDisplay.innerHTML = this.board.capturedPieces.white
            .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`)
            .join('');
        
        this.blackCapturedDisplay.innerHTML = this.board.capturedPieces.black
            .map(piece => `<span class="captured-piece">${this.getPieceSymbol(piece)}</span>`)
            .join('');
    }

    updateGameStatus() {
        this.currentPlayerDisplay.textContent = `当前回合: ${this.currentPlayer === 'white' ? '白方' : '黑方'}`;
        
        if (this.board.isCheckmate(this.currentPlayer)) {
            const winner = this.currentPlayer === 'white' ? '黑方' : '白方';
            this.gameStatusDisplay.textContent = `将军！${winner}获胜！`;
        } else if (this.board.isKingInCheck(this.currentPlayer)) {
            this.gameStatusDisplay.textContent = '将军！';
        } else {
            this.gameStatusDisplay.textContent = '';
        }
    }

    startNewGame() {
        this.board = new ChessBoard();
        this.currentPlayer = 'white';
        this.selectedPiece = null;
        this.validMoves = [];
        this.renderBoard();
        this.updateCapturedPieces();
        this.updateGameStatus();
    }

    undoMove() {
        if (this.board.undoLastMove()) {
            this.currentPlayer = this.currentPlayer === 'white' ? 'black' : 'white';
            this.selectedPiece = null;
            this.validMoves = [];
            this.renderBoard();
            this.updateCapturedPieces();
            this.updateGameStatus();
        }
    }
}

// 将类赋值给全局变量
ChessGame = ChessGame;

// 初始化游戏
console.log('Waiting for DOM to load...');
window.addEventListener('load', () => {
    console.log('DOM loaded, initializing game...');
    new ChessGame();
}); 