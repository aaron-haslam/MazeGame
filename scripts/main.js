let inputBuffer = {};
let canvas = null;
let context = null;

let prevTime = performance.now();
let cancelNextRequest = false;
let firstRun = true;
let gameSolved = false;

let gameBoardSize = 10;
let pixelSize = 700;

let HIGHSCORES = [];
let addToScore = true;

let gameOver = false;

let imgFloor = new Image();
imgFloor.isReady = false;
imgFloor.onload = function() {
    this.isReady = true;
};
imgFloor.src = 'images/floor.jpg';

let imgBread = new Image();
imgBread.isReady = false;
imgBread.onload = function() {
    this.isReady = true;
};
imgBread.src = 'images/bread.png';

let imgStart = new Image();
imgStart.isReady = false;
imgStart.onload = function() {
    this.isReady = true;
};
imgStart.src = 'images/start.png';

let imgEnd = new Image();
imgEnd.isReady = false;
imgEnd.onload = function() {
    this.isReady = true;
};
imgEnd.src = 'images/end.png';


let character_left_source = 'images/character_left.png';
let character_right_source = 'images/character_right.png';






class Location{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Cell{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
    edges = {
        n: null,
        s: null,
        e: null,
        w: null,
    };
    visitedBySolver = false;
}

let maze = [];
let frontier = [];
let breadCrumbs = [];
let shortestPath = [];

let showBreadCrumbs = false;
let showShortestPath = false;
let showHelp = false;

let score = gameBoardSize*50;



///////////////////////////////////
// Maze Creation
///////////////////////////////////

function newMaze(){
    PrimsAlgorithm();
}

function PrimsAlgorithm(){
    let startingLocation = new Location(Math.floor(Math.random()*gameBoardSize),Math.floor(Math.random()*gameBoardSize));
    let startingPoint = new Cell(startingLocation.x, startingLocation.y);

    addToMaze(startingPoint);
    
    addNeighborsToFrontier(startingPoint);

    while(!frontier.length == 0){
        let randomCellinFrontier = getRandomCellinFrontier();

        addToMaze(randomCellinFrontier);
        
        connectToRandomWallOnMaze(randomCellinFrontier);

        addNeighborsToFrontier(randomCellinFrontier);

    }

    console.log('Maze Created');
}

function addToMaze(cell){
    maze.push(cell);
}

function addNeighborsToFrontier(pointOnMaze){

    if(pointOnMaze.y - 1 >= 0){
        let newPoint = new Cell(pointOnMaze.x, pointOnMaze.y - 1);
        if(!isInMaze(newPoint) && !isInFrontier(newPoint)){
            frontier.push(newPoint);
        }
        
    }
    if(pointOnMaze.y + 1 < gameBoardSize){
        let newPoint = new Cell(pointOnMaze.x, pointOnMaze.y + 1);
        if(!isInMaze(newPoint) && !isInFrontier(newPoint)){
            frontier.push(newPoint);
        }
    }
    if(pointOnMaze.x + 1 < gameBoardSize){
        let newPoint = new Cell(pointOnMaze.x + 1, pointOnMaze.y);
        if(!isInMaze(newPoint) && !isInFrontier(newPoint)){
            frontier.push(newPoint);
        }
    }
    if(pointOnMaze.x - 1 >= 0){
        let newPoint = new Cell(pointOnMaze.x - 1, pointOnMaze.y);
        if(!isInMaze(newPoint) && !isInFrontier(newPoint)){
            frontier.push(newPoint);
        }
    }

}

function isInMaze(cell){
    for(let i = 0; i < maze.length;i++){
        if(cell.x == maze[i].x && cell.y == maze[i].y){
            return true;
        }
    }
    return false;
}

function isInFrontier(cell){
    for(let i = 0; i < frontier.length;i++){
        if(cell.x == frontier[i].x && cell.y == frontier[i].y){
            return true;
        }
    }
    return false;
}

function getRandomCellinFrontier(){
    let randomIndex = Math.floor(Math.random()*frontier.length);

    let randomLocation = frontier.splice(randomIndex, 1)[0];

    return randomLocation;
}

function connectToRandomWallOnMaze(pointOnFrontier){
    let wallList = [];

    for(let i = 0; i < maze.length;i++){
        if(pointOnFrontier.x     == maze[i].x && pointOnFrontier.y - 1 == maze[i].y){
            wallList.push({cell: maze[i], direction:'s'});
        }
        if(pointOnFrontier.x     == maze[i].x && pointOnFrontier.y + 1 == maze[i].y){
            wallList.push({cell: maze[i], direction:'n'});  
        }
        if(pointOnFrontier.x + 1 == maze[i].x && pointOnFrontier.y     == maze[i].y){
            wallList.push({cell: maze[i], direction:'w'});   
        }
        if(pointOnFrontier.x - 1 == maze[i].x && pointOnFrontier.y     == maze[i].y){
            wallList.push({cell: maze[i], direction:'e'});
        }
    }



    let randomIndex = Math.floor(Math.random()*wallList.length);

    let randomWall = wallList.splice(randomIndex, 1)[0];


    
    if(randomWall.direction == 'n'){
        randomWall.cell.edges.n = pointOnFrontier;
        pointOnFrontier.edges.s = randomWall.cell;
    }
    else if(randomWall.direction == 's'){
        randomWall.cell.edges.s = pointOnFrontier;
        pointOnFrontier.edges.n = randomWall.cell;
    }
    else if(randomWall.direction == 'e'){
        randomWall.cell.edges.e = pointOnFrontier;
        pointOnFrontier.edges.w = randomWall.cell;
    }
    else if(randomWall.direction == 'w'){
        randomWall.cell.edges.w = pointOnFrontier;
        pointOnFrontier.edges.e = randomWall.cell;
    }



}

///////////////////////////////////
// Object Initialization
///////////////////////////////////

function findStartPoint(){
    for(let i = 0; i<maze.length;i++){
        if(maze[i].x == 0 && maze[i].y == 0){
            return maze[i];
        }
    }
    return maze[0];
}

function renderCharacter(character) {
    if (character.image.isReady) {
        context.drawImage(character.image,
        character.location.x * (pixelSize / gameBoardSize), character.location.y * (pixelSize / gameBoardSize), (pixelSize / gameBoardSize), (pixelSize / gameBoardSize));
    }
}

let myCharacter = function(imageSource, location) {
    let image = new Image();
    image.isReady = false;
    image.onload = function() {
        this.isReady = true;
    };
    image.src = imageSource;
    return {
        location: location,
        image: image
    };
}('images/character_right.png', findStartPoint());

let myCharacter_left = function(imageSource, location) {
    let image = new Image();
    image.isReady = false;
    image.onload = function() {
        this.isReady = true;
    };
    image.src = imageSource;
    return {
        location: location,
        image: image
    };
}('images/character_left.png', maze[0]);

let myCharacter_right = function(imageSource, location) {
    let image = new Image();
    image.isReady = false;
    image.onload = function() {
        this.isReady = true;
    };
    image.src = imageSource;
    return {
        location: location,
        image: image
    };
}('images/character_right.png', maze[0]);


///////////////////////////////////
// Render Game Objects
///////////////////////////////////

function drawPixel(x, y, color) {
    let deltaX = canvas.width / gameBoardSize;
    let deltaY = canvas.height / gameBoardSize;

    x = Math.trunc(x);
    y = Math.trunc(y);

    context.fillStyle = color;
    //context.strokeStyle = 'rgba(0, 0, 0, 1)';
    
    context.fillRect((x * deltaX)+deltaX/4, y * deltaY+deltaX/4, deltaX/2, deltaY/2);
}

function renderHelp(){
    if(shortestPath.length > 0){
        drawPixel(shortestPath[0].x,shortestPath[0].y,'rgba(255, 0, 0,0.4)');
    }
}

function renderShortestPath(){
    for(let i = 0; i < shortestPath.length; i++){
        drawPixel(shortestPath[i].x,shortestPath[i].y,'rgba(0, 0, 0,0.5)');
    }
}

function renderBreadCrumbs(){
    for(let i = 0; i < breadCrumbs.length;i++){
        if (imgBread.isReady) {
            context.drawImage(imgBread,
            breadCrumbs[i].x * (pixelSize / gameBoardSize), breadCrumbs[i].y * (pixelSize / gameBoardSize), (pixelSize / gameBoardSize)/2, (pixelSize / gameBoardSize)/2);
        }
    }
}

function renderStartandEnd(){
    if (imgStart.isReady) {
        context.drawImage(imgStart,
        0, 0, (pixelSize / gameBoardSize), (pixelSize / gameBoardSize));
    }

    if (imgEnd.isReady) {
        context.drawImage(imgEnd,
        (gameBoardSize - 1) * (pixelSize / gameBoardSize), (gameBoardSize - 1) * (pixelSize / gameBoardSize), (pixelSize / gameBoardSize), (pixelSize / gameBoardSize));
    }
    
}

function drawCell(cell) {

    if (imgFloor.isReady) {
        context.drawImage(imgFloor,
        cell.x * (pixelSize / gameBoardSize), cell.y * (pixelSize / gameBoardSize),
        pixelSize / gameBoardSize, pixelSize / gameBoardSize);
    }

    if (cell.edges.n === null) {
        context.moveTo(cell.x * (pixelSize / gameBoardSize), cell.y * (pixelSize / gameBoardSize));
        context.lineTo((cell.x + 1) * (pixelSize / gameBoardSize), cell.y * (pixelSize / gameBoardSize));
        // context.stroke();
    }

    if (cell.edges.s === null) {
        context.moveTo(cell.x * (pixelSize / gameBoardSize), (cell.y + 1) * (pixelSize / gameBoardSize));
        context.lineTo((cell.x + 1) * (pixelSize / gameBoardSize), (cell.y + 1) * (pixelSize / gameBoardSize));
        // context.stroke();
    }

    if (cell.edges.e === null) {
        context.moveTo((cell.x + 1) * (pixelSize / gameBoardSize), cell.y * (pixelSize / gameBoardSize));
        context.lineTo((cell.x + 1) * (pixelSize / gameBoardSize), (cell.y + 1) * (pixelSize / gameBoardSize));
        // context.stroke();
    }

    if (cell.edges.w === null) {
        context.moveTo(cell.x * (pixelSize / gameBoardSize), cell.y * (pixelSize / gameBoardSize));
        context.lineTo(cell.x * (pixelSize / gameBoardSize), (cell.y + 1) * (pixelSize / gameBoardSize));
        // context.stroke();
    }

    //
    // Can do all the moveTo and lineTo commands and then render them all with a single .stroke() call.
    // context.stroke();
}

function renderMaze() {
    context.strokeStyle = '#C2B28F';
    context.lineWidth = 100/gameBoardSize;

    context.beginPath();

    for(let i = 0; i<maze.length;i++){
        drawCell(maze[i]);
    }
    context.stroke();
    context.closePath();

    // context.beginPath();
    // context.moveTo(0, 0);
    // context.lineTo(999, 0);
    // context.lineTo(999, 999);
    // context.lineTo(0, 999);
    // context.closePath();
    // context.strokeStyle = 'rgb(0, 0, 0)';
    // context.stroke();
}

function addToBreadCrumbs(character){
    let newLocation = {x: character.location.x, y: character.location.y};

    if(breadCrumbs.length == 0){
        breadCrumbs.push(newLocation);
    }
    else{
        if(!alreadyBeenHere(newLocation)){
            breadCrumbs.push(newLocation);
        }
    }  

}

function alreadyBeenHere(newLocation){
    for(let i = 0; i<breadCrumbs.length;i++){
        if(breadCrumbs[i].x == newLocation.x && breadCrumbs[i].y == newLocation.y){
            return true;
        }
    }

    return false;
}

///////////////////////////////////
// Maze Solver
///////////////////////////////////


let shortestPathFound = false;

function findShortestPath(position, directionCameIn, pathLength, path){
    let newLocation = {x: position.x, y: position.y};
    
    pathLength ++;

    path.push(newLocation);

    if(position.x == gameBoardSize-1 && position.y == gameBoardSize - 1){
        for(let i = 0; i < path.length; i++){
            let x = path[i].x;
            let y = path[i].y;
            
            
            shortestPath.push({x: x, y: y});

        }
        shortestPathFound == true;
    }

    if(position.edges.n != null && directionCameIn != 'n'){
        findShortestPath(position.edges.n, 's', pathLength, path);
    }
    if(position.edges.s != null && directionCameIn != 's'){
        findShortestPath(position.edges.s, 'n', pathLength, path);
    }
    if(position.edges.e != null && directionCameIn != 'e'){
        findShortestPath(position.edges.e, 'w', pathLength, path);
    }
    if(position.edges.w != null && directionCameIn != 'w'){
        findShortestPath(position.edges.w, 'e', pathLength, path);
    }
    if(!shortestPathFound){
        path.pop();
    }
    
}

function checkIfOnShortestPath(){

    if(shortestPath.length > 0){
        if(myCharacter.location.x == shortestPath[0].x && myCharacter.location.y == shortestPath[0].y){
            shortestPath.shift();
        }
    }
}
///////////////////////////////////
// Output to HTML
///////////////////////////////////
let timer = 0;

function updateTimer(time){
    time = time/1000;

    timer += time;

    document.getElementById("timer").innerHTML = (Math.trunc(timer));
}

function renderScore(){
    document.getElementById("currentScore").innerHTML = (Math.trunc(score));
}

function printScoreList(){

    let list = document.getElementById("scoreList");

    list.innerHTML = "";

    for(let i=0;i<HIGHSCORES.length;i++){

        let newList = document.createElement("li");

        newList.appendChild(document.createTextNode(
            "Name: "+
            HIGHSCORES[i].name
            +" || Score: "+
            HIGHSCORES[i].score            
        ))
        
        list.appendChild(newList);
    }
}

///////////////////////////////////
// Controls
///////////////////////////////////
function checkIfOffPath(lastLocation){

    if(myCharacter.location.x != shortestPath[0].x || myCharacter.location.y != shortestPath[0].y){
        let x = lastLocation.x;
        let y = lastLocation.y;

        shortestPath.unshift({x: x, y: y});
    }
}

function moveCharacter(key, character) {
    let x = character.location.x;
    let y = character.location.y;

    let lastLocation = {x: x, y: y};

    if (key === 'ArrowDown' || key === 's' || key === 'k') {
        score --;

        if (character.location.edges.s) {
            character.location = character.location.edges.s;
        }

        checkIfOffPath(lastLocation);
    }
    if (key == 'ArrowUp' || key === 'w' || key === 'i') {
        score --;

        if (character.location.edges.n) {
            character.location = character.location.edges.n;
        }

        checkIfOffPath(lastLocation);
    }
    if (key == 'ArrowRight' || key === 'd' || key === 'l') {
        score --;

        if (character.location.edges.e) {
            character.location = character.location.edges.e;
        }
        myCharacter_right.location = myCharacter.location;
        myCharacter = myCharacter_right;

        checkIfOffPath(lastLocation);
    }
    if (key == 'ArrowLeft' || key === 'a' || key === 'j') {
        score --;
        
        if (character.location.edges.w) {
            character.location = character.location.edges.w;
        }
        myCharacter_left.location = myCharacter.location;
        myCharacter = myCharacter_left;

        checkIfOffPath(lastLocation);
    }
    if(key == 'b'){
        toggleBreadCrumbs();
    }
    if(key == 'p'){
        toggleShortestPath();
    }
    if(key == 'h'){
        toggleHelp();
    }
}

function toggleBreadCrumbs(){
    if(!showBreadCrumbs){
        score -= gameBoardSize*5;
    }
    showBreadCrumbs = !showBreadCrumbs;
}

function toggleShortestPath(){
    if(!showShortestPath){
        score -= gameBoardSize*20;
    }
    showShortestPath = !showShortestPath;
} 

function toggleHelp(){
    if(!showHelp){
        score -= gameBoardSize*10;
    }
    showHelp = !showHelp;
} 

function processInput() {
    for (input in inputBuffer) {
        moveCharacter(inputBuffer[input], myCharacter);
    }
    inputBuffer = {};
}

///////////////////////////////////
// Scoring
///////////////////////////////////
let scoringInterval = 1000;

function computeScore(time){
    scoringInterval -= time;

    

    let multiplier = 1;



    if(scoringInterval <= 0){
        if(showBreadCrumbs){
            multiplier++;
        }
        if(showHelp){
            multiplier += 5;
        }
        if(showShortestPath){
            multiplier += 5;
        }
    
        score -= multiplier;

        scoringInterval = 1000;
    }

    

    
}

function addToHighScores(){  
    let addedToHighScores = false;

    if(addToScore){
        addToScore = false;

        let newScore = {
            name: document.getElementById("name").value,
            score: score
        }

        if(HIGHSCORES.length == 0){
            HIGHSCORES.push(newScore);
        }else{
            for(let i=0; i<HIGHSCORES.length; i++){
                if(newScore.score >= HIGHSCORES[i].score){                
                    HIGHSCORES.splice(i,0,newScore);
                    addedToHighScores = true;
                    break;
                }
            }
            if(HIGHSCORES.length < 3 && !addedToHighScores){
                HIGHSCORES.push(newScore);
                return;
            }
            if(HIGHSCORES.length > 3){
                HIGHSCORES.pop();
                return;
            }
        }
        
    }  
}

///////////////////////////////////
// Timer
///////////////////////////////////

function getTime(){
    let currentTime = performance.now();
    let time = currentTime - prevTime;

    prevTime = currentTime;

    
    return time;
}

///////////////////////////////////
// Game Over
///////////////////////////////////
function printMazeSolved(){
    context.font="50pt Comic Sans MS";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText("Maze Solved", canvas.width/2, canvas.height/2);   
}

function printGameOver(){
    context.font="50pt Comic Sans MS";
    context.fillStyle = "#000000";
    context.textAlign = "center";
    context.fillText("Game Over", canvas.width/2, canvas.height/2);   
}

function foundExit(){
    let endLocation = {x:gameBoardSize-1, y:gameBoardSize-1};

    if(myCharacter.location.x == endLocation.x && myCharacter.location.y == endLocation.y){
        return true;
    }

    return false;
}

function checkScore(){
    if(score <= 0){
        score = 0;
        gameOver = true;
        console.log("Game Over!!");
    }
}



///////////////////////////////////
// Game Loop
///////////////////////////////////


function update(){
    let elapsedTime = getTime();

    addToBreadCrumbs(myCharacter);
    updateTimer(elapsedTime);
    processInput();

    computeScore(elapsedTime);

    checkScore();
    
    checkIfOnShortestPath();
    
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    renderMaze();

    renderStartandEnd();

    renderScore();

    if(showBreadCrumbs){
        renderBreadCrumbs();
    }
    if(showShortestPath){
        renderShortestPath();
    }
    if(showHelp){
        renderHelp();
    }

    renderCharacter(myCharacter);

    if(gameOver){
        printGameOver();
    }

    if(foundExit()){
        printMazeSolved();
        addToHighScores();
        printScoreList();
    }
    
}


function gameLoop(time) {
    let elapsedTime = time - prevTime;
    lastTimeStamp = time;

    if(!foundExit() && !gameOver){
        update(elapsedTime);
    }

    render();

    requestAnimationFrame(gameLoop);
    
}

function initialize() {
    canvas = document.getElementById('id-canvas');
    context = canvas.getContext('2d');

    window.addEventListener('keydown', function(event) {
        inputBuffer[event.key] = event.key;
    });

    requestAnimationFrame(gameLoop);
}

///////////////////////////////////
// Game Start
///////////////////////////////////
function startNewGame(){
    maze = [];
    frontier = [];
    breadCrumbs = [];
    shortestPath = [];

    timer = 0;
    cancelNextRequest = false;
    inputBuffer = {};
    prevTime = performance.now();
    score = gameBoardSize*50;
    addToScore = true;
    gameOver = false;
    showHelp = false;

    showBreadCrumbs = false;
    showShortestPath = false;

    newMaze();

    findShortestPath(findStartPoint(),'', 0, []);


    myCharacter.location = findStartPoint();

    if(!firstRun){
        requestAnimationFrame(gameLoop);
    }
    firstRun = false;

}
startNewGame();

function initMaze(){
    maze = [];
    frontier = [];
    breadCrumbs = [];
    shortestPath = [];
    timer = 0;
    prevTime = performance.now();
    cancelNextRequest = false;
    inputBuffer = {};
    score = gameBoardSize*50;
    addToScore = true;
    gameOver = false;
    showHelp = false;

    showBreadCrumbs = false;
    showShortestPath = false;

    newMaze();

    myCharacter.location = findStartPoint();

    findShortestPath(findStartPoint(),'', 0, []);

    requestAnimationFrame(gameLoop);
}

function startNewGame_5x5(){
    gameBoardSize = 5;

    initMaze();
    

}
function startNewGame_10x10(){
    gameBoardSize = 10;

    initMaze();

}
function startNewGame_15x15(){
    gameBoardSize = 15;

    initMaze();

}
function startNewGame_20x20(){
    gameBoardSize = 20;

    initMaze();

}