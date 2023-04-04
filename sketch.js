let jsonresponse = {}
let boxIToIsSelected = {} // int to bool
let imageWidth = null;
let imageHeight = null;
let canvasWidth = 800;
let canvasHeight = 1000;
let mouseMarkerRadius = 5;
let imageXOffset = 0;
let imageYOffset = 0;
let imageScaler = 1;
let fpsLastSec = 0;

let maxUndoStates = 30;
let undoStates = [];

function undoRecord(prevText){
    undoStates.push({
        'boxIToIsSelected' : JSON.parse(JSON.stringify(boxIToIsSelected)),
        'lastInsertFunctionText': lastInsertFunctionText, 
        'lastInsertFunctionTextAdded': lastInsertFunctionTextAdded, 
        'lastSelectionIndex': lastSelectionIndex,
        'textValue': prevText
    });
    if (undoStates.length > maxUndoStates)
        undoStates.splice(0, 1);
}

function undoDequeue(){
    if (undoStates.length === 0)
        return;

    let states = undoStates.pop();
    boxIToIsSelected = JSON.parse(JSON.stringify(states. boxIToIsSelected))
    lastInsertFunctionText = states.lastInsertFunctionText
    lastInsertFunctionTextAdded = states.lastInsertFunctionTextAdded
    lastSelectionIndex = states.lastSelectionIndex
    document.querySelector('#texttocopy').value = states.textValue
}

function resetVars() {
    boxIToIsSelected = {}
    
    lastInsertFunctionTextlet = 'jeremymattheudamonthegreat'
    lastInsertFunctionTextAdded = ''
    undoStates = []
    lastSelectionIndex = -1
}

function setup(){
    let cnv = createCanvas(canvasWidth, canvasHeight);
    cnv.parent('imageholder');
    cnv.style('position', 'absolute');
    cnv.style('left', '0');
    cnv.style('right', '0');
    cnv.style('top', '0');
    cnv.style('bottom', '0');

    rectMode(CORNERS);
}

function draw() {
    clear();
    fill(0, 255, 0);
    ellipse(mouseX, mouseY, mouseMarkerRadius, mouseMarkerRadius);

    push();
        translate(imageXOffset, imageYOffset);
        scale(imageScaler, imageScaler);
        showBoxes()
    pop();
    
    fill(0);
    if (frameCount % 60 == 0){
        fpsLastSec = round(frameRate());
        // console.log(document.querySelector('#texttocopy').textContent);
    }
    text(fpsLastSec, 50, 50);

    // LOGIC
    boxesLogic()
    
}

function showBoxes(){
    noStroke()
    for (let i = 0; i < jsonresponse.length; i++){
        let boxdata = jsonresponse[i];
        let bbox = boxdata.bounding_box;

        if (boxIToIsSelected[i] === true)
            fill(0, 255, 0, 200)
        else
            fill(0, 255, 0, 50)
        rect(bbox.x1, bbox.y1, bbox.x2, bbox.y2);
    }
}

function boxesLogic(){
    let mouseXWarped = (mouseX - imageXOffset) / imageScaler;
    let mouseYWarped = (mouseY - imageYOffset) / imageScaler;
    for (let i = 0; i < jsonresponse.length; i++){
        let boxdata = jsonresponse[i];
        let bbox = boxdata.bounding_box;
        
        if (mouseIsPressed){
            if (mouseXWarped > bbox.x1 - mouseMarkerRadius && mouseXWarped < bbox.x2 + mouseMarkerRadius && 
                mouseYWarped > bbox.y1 - mouseMarkerRadius && mouseYWarped < bbox.y2 + mouseMarkerRadius){
                    if (boxIToIsSelected[i] !== true){
                        insertAtCursor(document.querySelector('#texttocopy'), boxdata.text)
                        // document.querySelector('#texttocopy').value += ' ' + boxdata.text;
                        boxIToIsSelected[i] = true;
                    }
                }
        }
    }
}

let lastInsertFunctionText = 'jeremymattheudamonthegreat'
let lastInsertFunctionTextAdded = '';
let lastSelectionIndex = -1;
function insertAtCursor(myField, myValue) {
    let lastEditWasThisFunction = true;
    if (lastInsertFunctionText !== myField.value || myField.selectionStart !== lastSelectionIndex + lastInsertFunctionTextAdded.length)
        lastEditWasThisFunction = false;
    
    let initialTextValue = myField.value

    //IE support
    if (document.selection) {
        myField.focus();
        sel = document.selection.createRange();
        sel.text = myValue;
    }
    //MOZILLA and others
    else if (myField.selectionStart || myField.selectionStart == '0') {
        let startPos;
        let endPos;
        if (lastEditWasThisFunction) {
            startPos = lastSelectionIndex + lastInsertFunctionTextAdded.length;
            endPos = lastSelectionIndex + lastInsertFunctionTextAdded.length;
        }
        else {
            startPos = myField.selectionStart;
            endPos = myField.selectionEnd;
        }

        let lastChar = myField.value[startPos - 1]
        if (startPos !== 0 && lastChar !== '\n' && lastChar !== ' ')
            myValue = " " + myValue

        lastSelectionIndex = endPos;
        myField.value = myField.value.substring(0, startPos)
            + myValue
            + myField.value.substring(endPos, myField.value.length);
    } else {
        myField.value += myValue;
    }

    lastInsertFunctionText = myField.value;
    lastInsertFunctionTextAdded = myValue;
    undoRecord(initialTextValue)
}

function addImageData(width, height) {
    imageWidth = width;
    imageHeight = height;

    if (imageWidth/imageHeight > canvasWidth/canvasHeight){ // Translate down, horizontal
        imageYOffset = (canvasHeight - ((canvasWidth * imageHeight) / (imageWidth))) * 0.5;
        imageScaler = canvasWidth / imageWidth
    }
    else{ // Translate right, vertical
        imageXOffset = (canvasWidth - ((canvasHeight * imageWidth) / (imageHeight))) * 0.5;
        imageScaler = canvasHeight / imageHeight
    }
}

function addJsonResponse(res){
    jsonresponse = res;
}

