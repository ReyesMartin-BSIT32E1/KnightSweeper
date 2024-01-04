import './Game.css'
import './Styles.css'
import React, { useRef, useState, useEffect} from 'react';
import ScrollContainer from 'react-indiana-drag-scroll'

export default function Game({ onBack }) {
    const [board, setBoard] = useState(() => Array.from({ length: 1 }, () => Array.from({ length: 1 }, () => ({isMine: false, isCleared: false, isFlagged: false, isExit: false, number: ""}))));
    const [player, setPlayer] = useState({x: 0,y: 0, hovering: false, lastDirection: '', facing: "right", deployed: false});
    const container = useRef(null);
    const [currentLevel, setCurrentLevel] = useState(1);
    const [cleared, setCleared] = useState(false);
    const [won, setWon] = useState(false);
    const [lost, setLost] = useState(false);
    const [hide, setHide] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [lastPosition, setLastPosition] = useState({x: 0, y: 0});
    const [indicator, setIndicator] = useState(false)
    const[moveCounter, setMoveCounter] = useState(-1);

    var temporaryScreen = document.getElementById("temporary-screen");

    window.onclick = function(event) {
        if (event.target == temporaryScreen) {
            temporaryScreen.style.display = "none";
        }
      }

    const updateCell = (rowIndex, colIndex, variableToUpdate, newValue) => {
        setBoard((prevBoard) => {
        const newBoard = [...prevBoard];
        const newRow = [...newBoard[rowIndex]];
        newRow[colIndex][variableToUpdate] = newValue;
        newBoard[rowIndex] = newRow;
        return newBoard;
        });
    };
    
    const CreateMine = (board, x, y) => {
        board[x][y].isMine = true;
        board[x][y].number = "X";
    }

    const NumberSquares = (board) => {
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (board[i][j].isMine) continue;
                board[i][j].number = CountAdjacentMines(i, j, board);
            }
        }
    }
    
    const CountAdjacentMines = (x, y, board) => {
        let counter = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (!(nx >= 0 && nx < board.length && ny >= 0 && ny < board.length && board[nx][ny].isMine)) continue;
                counter++;
            }
        }
        return counter === 0 ? "" : counter;
    }
    
    const CountAdjacentFlagged = (x, y) => {
        let counter = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (!(nx >= 0 && nx < board.length && ny >= 0 && ny < board.length && board[nx][ny].isFlagged)) continue;
                counter++;
            }
        }
        return counter === 0 ? "" : counter;
    }
    
    const CountAdjacentUncleared = (x, y) => {
        let counter = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue
                const nx = x + i;
                const ny = y + j;
                if (!(nx >= 0 && nx < board.length && ny >= 0 && ny < board.length && !board[nx][ny].isCleared)) continue;
                counter++;
            }
        }
        return counter === 0 ? "" : counter;
    }

    const CheckUnflagged = () => {
        let counter = 0;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (!board[i][j].isMine) continue;
                counter += board[i][j].isFlagged ? 0 : 1;
            }
        }
        return counter;
    }

    const CheckUncleared = () => {
        let counter = 0;
        for (let i = 0; i < board.length; i++) {
            for (let j = 0; j < board.length; j++) {
                if (board[i][j].isMine) continue;
                counter += board[i][j].isCleared ? 0 : 1;
            }
        }
        return counter;
    }
    
    const Cascade = (x, y) => {
        if (board[x][y].number !== '') return
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (!(nx >= 0 && nx < board.length && ny >= 0 && ny < board.length && !board[nx][ny].isCleared && !board[nx][ny].isFlagged)) continue;
                updateCell(nx, ny, 'isCleared', true)
                board[nx][ny].isCleared = true;
                if (board[nx][ny].number !== "") continue;
                Cascade(nx, ny);
            }
        }
    }
    
    const ClearSquares = (x, y) => {
        updateCell(x, y, 'isCleared', true)
        if (board[x][y].number !== CountAdjacentFlagged(x, y)) return;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (!(nx >= 0 && nx < board.length && ny >= 0 && ny < board.length && !board[nx][ny].isCleared && !board[nx][ny].isFlagged)) continue;
                updateCell(nx, ny, 'isCleared', true)
                Cascade(nx, ny);
            }
        }
    }
    
    const FlagSquares = (x, y) => {
        if (board[x][y].number !== CountAdjacentUncleared(x, y)) return;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (i === 0 && j === 0) continue;
                const nx = x + i;
                const ny = y + j;
                if (!(nx >= 0 && nx < board.length && ny >= 0 && ny < board.length && !board[nx][ny].isCleared && !board[nx][ny].isFlagged)) continue;
                updateCell(nx, ny, 'isFlagged', true)
            }
        }
    }
    
    const LandOnSquare = (x, y) => {
        if (lastPosition.x === x && lastPosition.y === y) return;
        setMoveCounter((prevCounter) => {return prevCounter + 1});
        if (board[x][y].isMine) {
            setLost(true);
            alert("You Lost");
            return;
        }
        setLastPosition({x: x, y: y})
        ClearSquares(x, y);
        FlagSquares(x, y);
        if (board[x][y].isExit && cleared && !won) {
            setWon((prevWon) => {
                if (!prevWon) {
                    setCurrentLevel((prevLevel) => prevLevel + 1);
                }
                return true;
            });
        }
    }

    const DrawTile = (x, y) => {
        return board[x][y].isFlagged ? "/sprites/tileFlagged.gif" : board[x][y].isCleared ? board[x][y].isExit ? cleared ? "/sprites/exitOpen.png" : "/sprites/exitClosed.png" : `/sprites/tile${board[x][y].number}.png` : "/sprites/tileUncleared.png";
    }

    const DrawKnight = () => {
        player.facing = player.lastDirection === "left" ? "left" : player.lastDirection === "right" ? "right" : player.facing;
        if (player.hovering) return player.facing === "left" ? "/sprites/HoverL.gif" : "/sprites/HoverR.gif";
        return player.facing === "left" ? "/sprites/KnightL.gif" : "/sprites/KnightR.gif";
    }

    const CenterCamera = () => {
        const playerElement = document.querySelector('.player');
        if (container.current && playerElement) {
            const playerHorizontalCenter = playerElement.offsetLeft - (container.current.offsetWidth - playerElement.offsetWidth) / 2;;
            const playerVericalCenter = playerElement.offsetTop - (container.current.offsetHeight - playerElement.offsetHeight) / 2;
            container.current.scrollTo(playerHorizontalCenter, playerVericalCenter)
        }
    }

    const ChangeZoom = (operation) => {
        switch (operation) {
            case "plus":
                setZoom(zoom === 4 ? zoom : zoom + 1);
                break;
            case "minus":
                setZoom(zoom === 1 ? zoom : zoom - 1);
                break;
        }
    }

    const ToggleIndicator = () => {
        setIndicator(indicator ? false : true);
    }

    const BackgroundColor = () => {
        return `rgba(${135 - 10 * currentLevel}, ${206 - 10 * currentLevel}, ${235 - 10 * currentLevel}, 1)`;
    }

    const PlayerMovement = (direction) => {
        let ran = false;
        setPlayer((prevPlayer) => {
            let updatedPlayer;
            let skip = false;
            switch (direction) {
                case 'up':
                    if (!player.hovering && player.y > 1) {
                        updatedPlayer = { ...prevPlayer, y: prevPlayer.y - 2, hovering: true, lastDirection: 'up' };
                    } else if (player.hovering && player.y > 0 && (prevPlayer.lastDirection === 'left' || prevPlayer.lastDirection === 'right') && !(board[player.x][player.y - 1].isFlagged)) {
                        updatedPlayer = { ...prevPlayer, y: prevPlayer.y - 1, hovering: false, lastDirection: 'up' };
                    } else if (player.hovering && prevPlayer.lastDirection === 'down') {
                        updatedPlayer = { ...prevPlayer, y: prevPlayer.y - 2, hovering: false, lastDirection: '' };
                    } else {
                        skip = true;
                        updatedPlayer = prevPlayer;
                    }
                    break;
                case 'left':
                    if (!player.hovering && player.x > 1) {
                        updatedPlayer = { ...prevPlayer, x: prevPlayer.x - 2, hovering: true, lastDirection: 'left' };
                    } else if (player.hovering && player.x > 0 && (prevPlayer.lastDirection === 'up' || prevPlayer.lastDirection === 'down') && !(board[player.x - 1][player.y].isFlagged)) {
                        updatedPlayer = { ...prevPlayer, x: prevPlayer.x - 1, hovering: false, lastDirection: 'left' };
                    } else if (player.hovering && prevPlayer.lastDirection === 'right') {
                        updatedPlayer = { ...prevPlayer, x: prevPlayer.x - 2, hovering: false, lastDirection: '' };
                    } else {
                        skip = true;
                        updatedPlayer = prevPlayer;
                    }
                    break;
                case 'right':
                    if (!player.hovering && player.x < (board.length - 2)) {
                        updatedPlayer = { ...prevPlayer, x: prevPlayer.x + 2, hovering: true, lastDirection: 'right' };
                    } else if (player.hovering && player.x < (board.length - 1) && (prevPlayer.lastDirection === 'up' || prevPlayer.lastDirection === 'down') && !(board[player.x + 1][player.y].isFlagged)) {
                        updatedPlayer = { ...prevPlayer, x: prevPlayer.x + 1, hovering: false, lastDirection: 'right' };
                    } else if (player.hovering && prevPlayer.lastDirection === 'left') {
                        updatedPlayer = { ...prevPlayer, x: prevPlayer.x + 2, hovering: false, lastDirection: '' };
                    } else {
                        skip = true;
                        updatedPlayer = prevPlayer;
                    }
                    break;
                case 'down':
                    if (!player.hovering && player.y < (board.length - 2)) {
                        updatedPlayer = { ...prevPlayer, y: prevPlayer.y + 2, hovering: true, lastDirection: 'down' };
                    } else if (player.hovering && player.y < (board.length - 1) && (prevPlayer.lastDirection === 'left' || prevPlayer.lastDirection === 'right')  && !(board[player.x][player.y + 1].isFlagged)) {
                        updatedPlayer = { ...prevPlayer, y: prevPlayer.y + 1, hovering: false, lastDirection: 'down' };
                    } else if (player.hovering && prevPlayer.lastDirection === 'up') {
                        updatedPlayer = { ...prevPlayer, y: prevPlayer.y + 2, hovering: false, lastDirection: '' };
                    } else {
                        skip = true;
                        updatedPlayer = prevPlayer;
                    }
                    break;
                default:
                    updatedPlayer = prevPlayer;
            }
            if (!updatedPlayer.hovering && !skip && updatedPlayer.lastDirection !== '' && !ran) {
                ran = true;
                LandOnSquare(updatedPlayer.x, updatedPlayer.y, "");
            }
            return updatedPlayer;
        });
    };

    const DrawBoard = (image) => {
        setBoard((prevBoard) => {
            const boardSize = image.width;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = image.width;
            canvas.height = image.height;
            context.drawImage(image, 0, 0);
            const updatedBoard = Array.from({ length: boardSize }, () => Array.from({ length: boardSize }, () => ({ isMine: false, isCleared: false, isFlagged: false, number: "" })));
            for (let y = 0; y < boardSize; y++) {
                for (let x = 0; x < boardSize; x++) {
                    const pixel = context.getImageData(x, y, 1, 1).data;
                    if (pixel[3] === 0) continue
                    if (pixel[0] >= 252) {
                        setPlayer((prevPlayer) => {
                            const updatedPlayer = { ...prevPlayer, x: x, y: y,};
                            return updatedPlayer;
                        });
                    } else if (pixel[0] >= 124 && pixel[0] <= 130) {
                        updatedBoard[x][y].isExit = true;
                    } else if (pixel[0] <= 3) {
                        CreateMine(updatedBoard, x, y);
                    }
                }
            }
            NumberSquares(updatedBoard);
            return updatedBoard;
        });
        setPlayer((prevPlayer) => {
            const updatedPlayer = { ...prevPlayer, deployed: true,};
            return updatedPlayer;
        });
    }
    
    const LoadLevel = (level) => {
        const image = new Image();
        image.src = `./levels/level${level}.png`
        image.onload = () => {
            DrawBoard(image);
        }
    }

    const Indicate = (move1, move2) => {
        let skip = false;
        let IndicatorX = lastPosition.x ? lastPosition.x : 0;
        let IndicatorY = lastPosition.y ? lastPosition.y : 0;
        switch (move1) {
            case 'up':
                if ((!player.hovering && lastPosition.y > 1) || (player.hovering && player.lastDirection === 'up')) {
                    IndicatorY = lastPosition.y - 2;
                } else {
                    skip = true;
                }
                break;
            case 'left':
                if ((!player.hovering && lastPosition.x > 1 ) || (player.hovering && player.lastDirection === 'left')) {
                    IndicatorX = lastPosition.x - 2;
                } else {
                    skip = true;
                }
                break;
            case 'right':
                if ((!player.hovering && lastPosition.x < (board.length - 2)) || (player.hovering && player.lastDirection === 'right')) {
                    IndicatorX = lastPosition.x + 2;
                } else {
                    skip = true;
                }
                break;
            case 'down':
                if ((!player.hovering && lastPosition.y < (board.length - 2)) || (player.hovering && player.lastDirection === 'down')) {
                    IndicatorY = lastPosition.y + 2;
                } else {
                    skip = true;
                }
                break;
        }
        switch (move2) {
            case 'up':
                if (lastPosition.y > 0) {
                    IndicatorY = lastPosition.y - 1;
                } else {
                    skip = true;
                }
                break;
            case 'left':
                if (lastPosition.x > 0) {
                    IndicatorX = lastPosition.x - 1;
                } else {
                    skip = true;
                }
                break;
            case 'right':
                if (lastPosition.x < (board.length - 1)) {
                    IndicatorX = lastPosition.x + 1;
                } else {
                    skip = true;
                }
                break;
            case 'down':
                if (lastPosition.y < (board.length - 1)) {
                    IndicatorY = lastPosition.y + 1;
                } else {
                    skip = true;
                }
                break;
        }
        skip = board[IndicatorX][IndicatorY].isFlagged || !indicator || (move1 === "" && move2 === "" && !player.hovering) ? true : skip;
        return {
            display: `${skip ? "none" : "block"}`,
            position: 'absolute',
            left: `calc(clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%) * ${IndicatorX})`,
            top: `calc(clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%) * ${IndicatorY})`,
            width: `clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%)`,
            height: `clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, ${zoom * 16 + 16}px)`,
            textAlign: 'center',
            lineHeight: `max(${zoom + 1}vw, ${zoom * 16 + 16}px)`,
            boxSizing: "border-box",
            border: `2px dotted white`
        }
    }

    useEffect(() => {
        LoadLevel(currentLevel);
        setZoom(2);
    }, []);

    useEffect(() => {
        if (currentLevel === 1) return;
        if (currentLevel === 5) {
            alert("You Won in " + moveCounter + " Moves");
            onBack();
        }
        setWon(false);
        setCleared(false);
        LoadLevel(currentLevel);
        setZoom(1);
    }, [currentLevel, won]);

    useEffect(() => {
        if (!(CheckUncleared() === 0 && CheckUnflagged() === 0)) return;
        setCleared(true);
    }, [board, player]);

    useEffect(() => {
        if(!lost) return;
        LoadLevel(currentLevel);
        setLost(false);
    }, [lost]);

    useEffect(() => {
        if (!player.deployed) return;
        LandOnSquare(player.x, player.y)
        setPlayer((prevPlayer) => {
            const updatedPlayer = { ...prevPlayer, deployed: false,};
            return updatedPlayer;
        });
        CenterCamera();
    }, [player.deployed]);

    return (
        <div className="page" tabIndex="0" onKeyDown={(e) => {
            switch (e.key) {
                case 'w': case 'W':
                    PlayerMovement('up');
                    break;
                case 'a': case 'A':
                    PlayerMovement('left');
                    break;
                case 'd': case 'D':
                    PlayerMovement('right');
                    break;
                case 's': case 'S':
                    PlayerMovement('down');
                    break;
                case 'q': case 'Q':
                    ChangeZoom("minus");
                    break;
                case 'e': case 'E':
                    ChangeZoom("plus");
                    break;
                case 'z': case 'Z':
                    ToggleIndicator();
                    break;
                case 'Shift':
                    setHide(true);
                    break;
                case ' ':
                    CenterCamera();
                    break;
                default:
                    break;
            }
        }} onKeyUp={(e) => {
            switch (e.key) {
                case 'Shift':
                    setHide(false);
                    break;
                default:
                    break;
            }
        }} style={{
            display: 'grid',
            justifyItems: 'center',
            alignItems: 'top',
            gridTemplateRows: 'repeat(3, min-content)',
            backgroundColor: `${BackgroundColor()}`,
        }}>
        <div id='temporary-screen'>Click to Start</div>
        <h1 id='knightsweeper'></h1>
        <div className='stats'>
            <div className='stat-text'>Level: {currentLevel}</div>
            <div className='stat-text'>Moves: {moveCounter}</div>
            <img src='./sprites/tileUncleared.png' className='stat-icon'/>
            <div className='stat-text'>: {CheckUncleared()}</div>
            <img src='./sprites/bomb.png' className='stat-icon'/>
            <div className='stat-text'>: {CheckUnflagged()}</div>
        </div>
        <ScrollContainer className="box" innerRef={container}>
            <div className="board" style={{
                position: 'relative',
                display: 'grid',
                width: `clamp(${2 * board.length}vw, ${32 * board.length}, 100%)`,
                height: `clamp(${2 * board.length}vw, ${32 * board.length}, 100%)`,
                gridTemplateColumns: `repeat(${board.length}, clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, ${zoom * 16 + 16}px))`,
                gridTemplateRows: `repeat(${board.length}, clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, ${zoom * 16 + 16}px))`,
            }}>
                <div className="player" style={{
                    backgroundImage: `url(${hide ? "" : DrawKnight()})`,
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: 'contain',
                    imageRendering: 'pixelated',
                    position: 'absolute',
                    left: `calc(clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%) * ${player.x})`,
                    top: `calc(clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%) * ${player.y})`,
                    width: `clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%)`,
                    height: `clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, ${zoom * 16 + 16}px)`,
                    textAlign: 'center',
                    lineHeight: `max(${zoom + 1}vw, ${zoom * 16 + 16}px)`,
                    boxSizing: `${hide ? "border-box" : ""}`,
                    border: `${hide ? `2px solid white` : ""}`,
                }}>
                </div> 
                <div className='indicator' style={Indicate("up", "left")}></div>
                <div className='indicator' style={Indicate("up", "right")}></div>
                <div className='indicator' style={Indicate("left", "up")}></div>
                <div className='indicator' style={Indicate("left", "down")}></div>
                <div className='indicator' style={Indicate("right", "up")}></div>
                <div className='indicator' style={Indicate("right", "down")}></div>
                <div className='indicator' style={Indicate("down", "left")}></div>
                <div className='indicator' style={Indicate("down", "right")}></div>
                <div className='indicator' style={Indicate("", "")}></div>
                {board[0].map((_, colIndex) => (
                    board.map((row, rowIndex) => (
                        <div key={`${rowIndex}-${colIndex}`} className="square" style={{
                            fontSize: `clamp(1vw, 20px, 100%)`,
                            backgroundImage: `url(${DrawTile(rowIndex, colIndex)})`,
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: 'contain',
                            imageRendering: 'pixelated',
                            width: `clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%)`,
                            height: `clamp(${zoom + 1}vw, ${zoom * 16 + 16}px, 100%)`,
                            textAlign: 'center',
                            lineHeight: `max(${zoom + 1}vw, ${zoom * 16 + 16}px)`,
                        }}>
                        </div>
                    ))
                ))}
            </div>
        </ScrollContainer>
        <button className='back-button' onClick={onBack}>◀</button>
        <button className='zoomin-button' onClick={() => ChangeZoom('plus')}>+</button>
        <button className='zoomout-button' onClick={() => ChangeZoom('minus')}>-</button>
        <button className='indicator-button' onClick={() => ToggleIndicator()}>👁</button>
        <div className="keypad-left">
            <div></div>
            <button className="key" onClick={() => PlayerMovement('up')}>▲</button>
            <div></div>
            <button className="key" onClick={() => PlayerMovement('left')}>◀</button>
            <button className="key" onMouseDown={() => setHide(true)} onMouseUp={() => setHide(false)}>●</button>
            <button className="key" onClick={() => PlayerMovement('right')}>▶</button>
            <div></div>
            <button className="key" onClick={() => PlayerMovement('down')}>▼</button>
            <div></div>
        </div>
        <div className="keypad-right">
            <div></div>
            <div></div>
            <div></div>
            <div></div>
            <button className="key" onMouseDown={() => CenterCamera()}>●</button>
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        </div>
        </div>
    );
}