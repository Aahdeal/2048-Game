document.addEventListener('DOMContentLoaded', () => {
    const grid = document.querySelector('.grid');
    const size = 4;
    let board = [];
    let currentScore = 0;
    const currentScoreElem = document.getElementById('current-score');

    //get high score from local storage or set to 0 if not found.
    let highScore = localStorage.getItem('2048-highScore') || 0;
    const highScoreElem = document.getElementById('high-score');
    highScoreElem.textContent = highScore;

    const gameOverElem = document.getElementById('game-over');

    function updateScore(value){
        currentScore += value;
        currentScoreElem.textContent = currentScore;
        if (currentScore > highScore){
            highScore = currentScore;
            highScoreElem.textContent = highScore;
            localStorage.setItem('2048-highScore',highScore);

        }
    }

    // function to restart game
    function restartGame(){
        currentScore = 0;
        currentScoreElem.textContent = '0';
        gameOverElem.style.display = 'none';
        initializeGame();
    }

    //fuinction to start game
    function initializeGame(){
        board = [...Array(size)].map(e=>Array(size).fill(0));
        placeRandom();
        placeRandom();
        renderBoard();
    }

    // Function to render board
    function renderBoard(){
        for(let i =0; i <size; i++){
            for(let j = 0; j < size; j++){
                const cell = document.querySelector(`[data-row="${i}"][data-col="${j}"]`);
                const prevValue = cell.dataset.value;
                const currentValue = board[i][j];
                if(currentValue !== 0){
                    cell.dataset.value = currentValue;
                    cell.textContent = currentValue;
                    //Animation Handling
                    if(currentValue !== parseInt(prevValue) &&  !cell.classList.contains('new-tile')){
                        cell.classList.add('merged-tile');
                    }
                }else{
                    cell.textContent = '';
                    delete cell.dataset.value;
                    cell.classList.remove('merged-tile', 'new-tile');
                }
            }   
        }
        //cleanup animation classes
        setTimeout(()=>{
            const cells = document.querySelectorAll('.grid-cell');
            cells.forEach(cell=>{
                cell.classList.remove('merged-tile','new-tile');

            });
        }, 300);
    }

    // Function to place a random tile on the board
    function placeRandom(){
        const available = [];
        for(let i = 0; i <size; i++){
            for(let j = 0; j<size; j++){
                if(board[i][j] === 0){
                    available.push({x: i, y:j});
                }
            }
        }

        if(available.length >0){
            const randomCell = available[Math.floor(Math.random()*available.length)];
            board[randomCell.x][randomCell.y] = Math.random() < 0.9 ? 2 : 4;
            const cell = document.querySelector(`[data-row="${randomCell.x}"][data-col="${randomCell.y}"]`);
            cell.classList.add('new-tile'); // New tile animation
        }
    }

    // Function to move tiles based on arrows
    function move(direction){
        let hasChanged = false;
        if (direction === 'ArrowUp' || direction === 'ArrowDown'){
            for(let j = 0; j < size; j++){
                const column = [...Array(size)].map((_,i)=> board[i][j]);
                const newColumn = transform(column, direction === 'ArrowUp');
                for(let i =0; i<size; i++){
                    if(board[i][j] !== newColumn[i]){
                        hasChanged = true;
                        board[i][j] = newColumn[i];
                    }
                }
            }
        }
        else if(direction === 'ArrowLeft' || direction === 'ArrowRight'){
            for(let i = 0; i<size; i++){
                const row = board[i];
                const newRow =transform(row, direction === 'ArrowLeft');
                if(row.join(',') !== newRow.join(',')){
                    hasChanged = true;
                    board[i] = newRow;
                }
            }
        }
        if(hasChanged){
            placeRandom();
            renderBoard();
            checkGameOver();
        }
    }

    //function to transform a line
    function transform(line, moveTowardsStart){
        let newLine = line.filter(cell => cell !== 0);
        if(!moveTowardsStart){
            newLine.reverse();
        }
        for(let i = 0; i < newLine.length - 1; i++){
            if(newLine[i] === newLine[i+1]){
                newLine[i] *= 2;
                updateScore(newLine[i]); // Update score when tiles merge
                newLine.splice(i +1,1);
            }
        }
        while(newLine.length < size){
            newLine.push(0);
        }
        if(!moveTowardsStart){
            newLine.reverse();
        }
        return newLine;
    }

    // Function to check game over
    function checkGameOver(){
        for(let i = 0; i < size; i++){
            for(let j = 0; j<size; j++){
                if(board[i][j] ==0){
                    return; // a cell is still empty so game not over
                }
                if(j , size - 1 && board[i][j] === board[i][j+1]){
                    return; //horizontal adjacent equal cells, move possible
                }
                if(i < size - 1 && board[i][j] === board[i+1][j]){
                    return; // vertical move possible
                }
            }
        }

        // at this point no move possible 
        gameOverElem.style.display = 'flex';

    }

    document.addEventListener('keydown', event => {
        if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(event.key)){
            move(event.key);
        }
    });
    document.getElementById('restart-btn').addEventListener('click', restartGame);
    document.getElementById('reset-btn').addEventListener('click', restartGame);

    initializeGame();
})