let xStart = 0;
let yStart = 0;
let xStartForMoving = 0;
let yStartForMoving = 0;

let svgEditor = document.getElementById("svgEditor");

// let rectGeneral;
// let lineGeneral ;
// let ellipseGeneral; 
// let diamondGeneral ;

// localStorage.clear();

// window.onbeforeunload = (e) => {
//     localStorage.setItem('svgElementsAsHTML', svgEditor.innerHTML);
// }

// window.onload = () => {
//     let x = localStorage.getItem('svgElementsAsHTML');
//     if (x != null || x != '') {
//         svgEditor.innerHTML = x;
//     }

//     // rectGeneral = svgEditor.getElementById('rectGeneral');
//     // lineGeneral = svgEditor.getElementById('lineGeneral');
//     // ellipseGeneral = svgEditor.getElementById('ellipseGeneral');
//     // diamondGeneral = svgEditor.getElementById('diamondGeneral');
// }


let MOUSE_LEFT = 0;

let currentShapeSelection = "none";
let currentSvgElementSelected = null;
let currentShapeSelectedForMoving = null;

let btnLine = document.getElementById('btnDrawLine');
let btnEllipse = document.getElementById('btnDrawEllipse');
let btnRectangle = document.getElementById('btnDrawRectangle');
let btnDiamond = document.getElementById('btnDrawDiamond');
let btnClearSVG = document.getElementById('btnClearSVG');
let btnFillShape = document.getElementById('btnFillShape');
let btnMirror = document.getElementById('btnMirror');
let btnDownloadPNG = document.getElementById('btnDownloadPNG');
let btnDownloadSVG = document.getElementById('btnDownloadSVG');
let btnUndo = document.getElementById('btnUndo');

let thicknessSlider = document.getElementById('thicknessSlider');
let colorSelector = document.getElementById('colorPickerElement');

let rectGeneral = svgEditor.getElementById('rectGeneral');
let lineGeneral = svgEditor.getElementById('lineGeneral');
let ellipseGeneral = svgEditor.getElementById('ellipseGeneral');
let diamondGeneral = svgEditor.getElementById('diamondGeneral');

let dontDraw = false;
let allActions = [];
let drawTemplate = false;


thicknessSlider.onchange = function () {
    if (document.getElementsByClassName('selectat')[0] != undefined) {

        allActions.push(['thickness',
            document.getElementsByClassName('selectat')[0],
            document.getElementsByClassName('selectat')[0].style.strokeWidth]);

        document.getElementsByClassName('selectat')[0].style.strokeWidth = thicknessSlider.value;
    }
}


colorSelector.onchange = function () {
    if (document.getElementsByClassName('selectat')[0] != undefined) {

        allActions.push(['stroke',
            document.getElementsByClassName('selectat')[0],
            document.getElementsByClassName('selectat')[0].style.stroke]);

        document.getElementsByClassName('selectat')[0].style.stroke = colorSelector.value;
    }
}


btnFillShape.onclick = function () {
    if (document.getElementsByClassName('selectat')[0] != undefined) {

        allActions.push(['fill',
            document.getElementsByClassName('selectat')[0],
            document.getElementsByClassName('selectat')[0].style.fill]);

        document.getElementsByClassName('selectat')[0].style.fill = colorSelector.value;
    }
}


btnLine.onclick = function () {
    currentShapeSelection = 'line'
}


btnRectangle.onclick = function () {
    currentShapeSelection = 'rectangle'
}


btnEllipse.onclick = function () {
    currentShapeSelection = 'ellipse'
}


btnDiamond.onclick = function () {
    currentShapeSelection = 'diamond'
}


btnClearSVG.onclick = function () {
    allActions.push(['clear', []]);

    while (svgEditor.lastChild) {
        if (!(svgEditor.lastChild.classList.contains('selectieForma'))) {
            allActions[allActions.length - 1][1].push(svgEditor.lastChild);
            svgEditor.removeChild(svgEditor.lastChild);
        }
    }
}


btnMirror.onclick = function () {
    let svgWidth = parseInt(svgEditor.getAttributeNS(null, 'width'));
    let allSvgElements = document.querySelectorAll("#svgEditor *");

    for (let svgElement of allSvgElements) {
        if (svgElement.className.baseVal != "selectieForma") {
            if (svgElement.nodeName == 'rect') {
                svgElement.setAttributeNS(null, "x", svgWidth - (parseInt(svgElement.getAttributeNS(null, 'width')) + parseInt(svgElement.getAttributeNS(null, 'x'))));
            }

            else if (svgElement.nodeName == 'line') {
                svgElement.setAttributeNS(null, 'x1', svgWidth - parseInt(svgElement.getAttributeNS(null, 'x1')));
                svgElement.setAttributeNS(null, 'x2', svgWidth - parseInt(svgElement.getAttributeNS(null, 'x2')));
            }

            else if (svgElement.nodeName == 'polygon') {
                let pointsAsString = svgElement.getAttributeNS(null, 'points').split(" ");
                let pointsAsArrayofArrays = [];

                for (point of pointsAsString) {
                    pointsAsArrayofArrays.push(point.split(","));
                }

                for (let i = 0; i < pointsAsArrayofArrays.length; i++) {
                    for (let j = 0; j < pointsAsArrayofArrays[0].length; j++) {
                        pointsAsArrayofArrays[i][j] = parseFloat(pointsAsArrayofArrays[i][j]);
                    }
                    pointsAsArrayofArrays[i][0] = svgWidth - pointsAsArrayofArrays[i][0];
                }

                for (let i = 0; i < pointsAsArrayofArrays.length - 1; i++) {
                    pointsAsArrayofArrays[i] = pointsAsArrayofArrays[i].join(",");
                }

                pointsAsString = pointsAsArrayofArrays.join(" ");

                svgElement.setAttributeNS(null, 'points', pointsAsString);
            }

            else if (svgElement.nodeName == 'ellipse') {
                svgElement.setAttributeNS(null, 'cx', svgWidth - parseInt(svgElement.getAttributeNS(null, 'cx')));
            }
        }
    }
}


btnUndo.onclick = () => {
    if (allActions.length != 0) {
        if (allActions[allActions.length - 1][0] === 'draw') {
            allActions[allActions.length - 1][1].remove();
        }

        else if (allActions[allActions.length - 1][0] === 'remove') {
            svgEditor.appendChild(allActions[allActions.length - 1][1]);
        }

        else if (allActions[allActions.length - 1][0] === 'fill') {
            allActions[allActions.length - 1][1].style.fill = allActions[allActions.length - 1][2];
        }

        else if (allActions[allActions.length - 1][0] === 'stroke') {
            allActions[allActions.length - 1][1].style.stroke = allActions[allActions.length - 1][2];
        }

        else if (allActions[allActions.length - 1][0] === 'thickness') {
            allActions[allActions.length - 1][1].style.strokeWidth = allActions[allActions.length - 1][2];
        }

        else if (allActions[allActions.length - 1][0] === 'clear') {
            for (let element of allActions[allActions.length - 1][1]) {
                svgEditor.appendChild(element);
            }
        }

        else if (allActions[allActions.length - 1][0] === 'move') {
            if (allActions[allActions.length - 1][1].nodeName == 'rect') {
                allActions[allActions.length - 1][1].setAttributeNS(null, 'x', allActions[allActions.length - 1][2]);
                allActions[allActions.length - 1][1].setAttributeNS(null, 'y', allActions[allActions.length - 1][3]);
            }

            else if (allActions[allActions.length - 1][1].nodeName == 'line') {
                allActions[allActions.length - 1][1].setAttributeNS(null, 'x1', allActions[allActions.length - 1][2]);
                allActions[allActions.length - 1][1].setAttributeNS(null, 'y1', allActions[allActions.length - 1][3]);
                allActions[allActions.length - 1][1].setAttributeNS(null, 'x2', allActions[allActions.length - 1][4]);
                allActions[allActions.length - 1][1].setAttributeNS(null, 'y2', allActions[allActions.length - 1][5]);
            }

            else if (allActions[allActions.length - 1][1].nodeName == 'polygon') {
                allActions[allActions.length - 1][1].setAttributeNS(null, 'points', allActions[allActions.length - 1][2]);
            }

            else if (allActions[allActions.length - 1][1].nodeName == 'ellipse') {
                allActions[allActions.length - 1][1].setAttributeNS(null, 'cx', allActions[allActions.length - 1][2]);
                allActions[allActions.length - 1][1].setAttributeNS(null, 'cy', allActions[allActions.length - 1][3]);
            }
        }
    	allActions.pop();
    }
}


function setLineCoordonates(object, xStart, yStart, xEnd, yEnd) {
    object.setAttributeNS(null, 'x1', xStart);
    object.setAttributeNS(null, 'y1', yStart);
    object.setAttributeNS(null, 'x2', xEnd);
    object.setAttributeNS(null, 'y2', yEnd);
    object.style.strokeWidth = thicknessSlider.value;
}


function setRectangleCoordonates(object, xStart, yStart, xEnd, yEnd) {
    object.setAttributeNS(null, 'width', Math.max(xStart, xEnd) - Math.min(xStart, xEnd));
    object.setAttributeNS(null, 'height', Math.max(yStart, yEnd) - Math.min(yStart, yEnd));
    object.setAttributeNS(null, 'x', Math.min(xStart, xEnd));
    object.setAttributeNS(null, 'y', Math.min(yStart, yEnd));
}


function setEllipseCoordonates(object, xStart, yStart, xEnd, yEnd) {
    object.setAttributeNS(null, 'cx', Math.abs((xEnd + xStart)) / 2);
    object.setAttributeNS(null, 'cy', Math.abs((yEnd + yStart)) / 2);
    object.setAttributeNS(null, 'rx', Math.abs((xStart - xEnd)) / 2);
    object.setAttributeNS(null, 'ry', Math.abs((yStart - yEnd)) / 2);
}


function setDiamondCoordonates(object, xStart, yStart, xEnd, yEnd) {
    object.setAttributeNS(null, 'points', Math.abs((xStart + ((xEnd - xStart) / 2))).toString() + "," + yStart + " " +
        xEnd + "," + Math.abs((yStart + ((yEnd - yStart) / 2))).toString() + " " +
        Math.abs((xStart + ((xEnd - xStart) / 2))).toString() + "," + yEnd + " " +
        xStart + "," + Math.abs((yStart + ((yEnd - yStart) / 2))).toString()
    );
}


svgEditor.onmousedown = function (e) {
    if (currentShapeSelectedForMoving == null) {
        dontDraw = false;

        if (e.button == MOUSE_LEFT) {
            xStart = e.pageX - this.getBoundingClientRect().left;
            yStart = e.pageY - this.getBoundingClientRect().top;
            drawTemplate = true;

            if (currentShapeSelection == 'rectangle') {
                setRectangleCoordonates(rectGeneral, xStart, yStart, xStart, yStart);
            }

            else if (currentShapeSelection == 'line') {
                setLineCoordonates(lineGeneral, xStart, yStart, xStart, yStart);
            }

            else if (currentShapeSelection == 'ellipse') {
                setEllipseCoordonates(ellipseGeneral, xStart, yStart, xStart, yStart);
            }

            else if (currentShapeSelection == 'diamond') {
                setDiamondCoordonates(diamondGeneral, xStart, yStart, xStart, yStart);
            }
        }
    }
}


svgEditor.onmouseup = function (e) {
    if (e.button == MOUSE_LEFT) {
        let xEnd = e.pageX - this.getBoundingClientRect().left;
        let yEnd = e.pageY - this.getBoundingClientRect().top;
        let newShape;
        drawTemplate = false;

        if (dontDraw == false) {
            if (Math.abs(xEnd - xStart) > 5 || Math.abs(yEnd - yStart) > 5) {
                if (currentShapeSelection == 'line') {
                    lineGeneral.style.display = "none";
                    newShape = document.createElementNS("http://www.w3.org/2000/svg", "line");
                    setLineCoordonates(newShape, xStart, yStart, xEnd, yEnd);
                    newShape.style.stroke = document.getElementById("colorPickerElement").value;
                    newShape.style.strokeWidth = thicknessSlider.value;

                    allActions.push(['draw', newShape]);

                    newShape.ondblclick = function (e) {
                        let allSvgElements = document.querySelectorAll("#svgEditor *");
                        allSvgElements.forEach(el => el.classList.remove("selectat"));
                        newShape.classList.add("selectat");
                        currentSvgElementSelected = newShape;
                    }

                    newShape.onmousedown = function (e) {
                        currentShapeSelectedForMoving = newShape;
                        xStartForMoving = e.pageX - this.getBoundingClientRect().left
                        yStartForMoving = e.pageY - this.getBoundingClientRect().top;

                        allActions.push(['move',
                            currentShapeSelectedForMoving,
                            currentShapeSelectedForMoving.getAttributeNS(null, 'x1'),
                            currentShapeSelectedForMoving.getAttributeNS(null, 'y1'),
                            currentShapeSelectedForMoving.getAttributeNS(null, 'x2'),
                            currentShapeSelectedForMoving.getAttributeNS(null, 'y2'),
                        ])
                    }

                    newShape.onmousemove = function (e) {
                        if (currentShapeSelectedForMoving != null) {
                            let xEndForMoving = e.pageX - this.getBoundingClientRect().left;
                            let yEndForMoving = e.pageY - this.getBoundingClientRect().top;

                            x1Line = currentShapeSelectedForMoving.getAttributeNS(null, 'x1');
                            y1Line = currentShapeSelectedForMoving.getAttributeNS(null, 'y1');
                            x2Line = currentShapeSelectedForMoving.getAttributeNS(null, 'x2');
                            y2Line = currentShapeSelectedForMoving.getAttributeNS(null, 'y2');

                            currentShapeSelectedForMoving.setAttributeNS(null, 'x1', parseInt(x1Line) + parseInt(xEndForMoving - xStartForMoving));
                            currentShapeSelectedForMoving.setAttributeNS(null, 'y1', parseInt(y1Line) + parseInt(yEndForMoving - yStartForMoving));
                            currentShapeSelectedForMoving.setAttributeNS(null, 'x2', parseInt(x2Line) + parseInt(xEndForMoving - xStartForMoving));
                            currentShapeSelectedForMoving.setAttributeNS(null, 'y2', parseInt(y2Line) + parseInt(yEndForMoving - yStartForMoving));
                        }
                    }

                    newShape.onmouseup = function (e) {
                        currentShapeSelectedForMoving = null;
                        dontDraw = true;
                    }

                    svgEditor.appendChild(newShape);
                }

                else if (currentShapeSelection == 'rectangle') {
                    rectGeneral.style.display = "none";
                    newShape = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                    setRectangleCoordonates(newShape, xStart, yStart, xEnd, yEnd);
                    newShape.style.fill = "white";
                    newShape.style.stroke = document.getElementById("colorPickerElement").value;
                    newShape.style.strokeWidth = thicknessSlider.value;

                    allActions.push(['draw', newShape]);

                    newShape.ondblclick = function (e) {
                        let allSvgElements = document.querySelectorAll("#svgEditor *");
                        allSvgElements.forEach(el => el.classList.remove("selectat"));
                        newShape.classList.add("selectat");
                        currentSvgElementSelected = newShape;
                    }

                    newShape.onmousedown = function (e) {
                        currentShapeSelectedForMoving = newShape;

                        xStartForMoving = e.pageX - this.getBoundingClientRect().left
                        yStartForMoving = e.pageY - this.getBoundingClientRect().top;

                        allActions.push(['move',
                            currentShapeSelectedForMoving,
                            currentShapeSelectedForMoving.getAttributeNS(null, 'x'),
                            currentShapeSelectedForMoving.getAttributeNS(null, 'y')
                        ])
                    }

                    newShape.onmousemove = function (e) {
                        if (currentShapeSelectedForMoving != null) {
                            let xEndForMoving = e.pageX - this.getBoundingClientRect().left;
                            let yEndForMoving = e.pageY - this.getBoundingClientRect().top;

                            xRect = currentShapeSelectedForMoving.getAttributeNS(null, 'x');
                            yRect = currentShapeSelectedForMoving.getAttributeNS(null, 'y');

                            currentShapeSelectedForMoving.setAttributeNS(null, 'x', parseInt(xRect) + parseInt(xEndForMoving - xStartForMoving));
                            currentShapeSelectedForMoving.setAttributeNS(null, 'y', parseInt(yRect) + parseInt(yEndForMoving - yStartForMoving));
                        }
                    }

                    newShape.onmouseup = function (e) {
                        currentShapeSelectedForMoving = null;
                        dontDraw = true;
                    }

                    svgEditor.appendChild(newShape);
                }

                else if (currentShapeSelection == 'ellipse') {
                    ellipseGeneral.style.display = "none";
                    newShape = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
                    setEllipseCoordonates(newShape, xStart, yStart, xEnd, yEnd);
                    newShape.style.fill = "white";
                    newShape.style.stroke = document.getElementById("colorPickerElement").value;
                    newShape.style.strokeWidth = thicknessSlider.value;

                    allActions.push(['draw', newShape]);

                    newShape.ondblclick = function (e) {
                        let allSvgElements = document.querySelectorAll("#svgEditor *");
                        allSvgElements.forEach(el => el.classList.remove("selectat"));
                        newShape.classList.add("selectat");
                        currentSvgElementSelected = newShape;
                    }

                    newShape.onmousedown = function (e) {
                        currentShapeSelectedForMoving = newShape;
                        xStartForMoving = e.pageX - this.getBoundingClientRect().left
                        yStartForMoving = e.pageY - this.getBoundingClientRect().top;

                        allActions.push(['move',
                            currentShapeSelectedForMoving,
                            currentShapeSelectedForMoving.getAttributeNS(null, 'cx'),
                            currentShapeSelectedForMoving.getAttributeNS(null, 'cy')]);
                    }

                    newShape.onmousemove = function (e) {
                        if (currentShapeSelectedForMoving != null) {
                            let xEndForMoving = e.pageX - this.getBoundingClientRect().left;
                            let yEndForMoving = e.pageY - this.getBoundingClientRect().top;

                            cxEllipse = currentShapeSelectedForMoving.getAttributeNS(null, 'cx');
                            cyEllipse = currentShapeSelectedForMoving.getAttributeNS(null, 'cy');

                            currentShapeSelectedForMoving.setAttributeNS(null, 'cx', parseInt(cxEllipse) + parseInt(xEndForMoving - xStartForMoving));
                            currentShapeSelectedForMoving.setAttributeNS(null, 'cy', parseInt(cyEllipse) + parseInt(yEndForMoving - yStartForMoving));
                        }
                    }

                    newShape.onmouseup = function (e) {
                        currentShapeSelectedForMoving = null;
                        dontDraw = true;
                    }

                    svgEditor.appendChild(newShape);
                }

                else if (currentShapeSelection == 'diamond') {
                    diamondGeneral.style.display = "none";
                    newShape = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
                    setDiamondCoordonates(newShape, xStart, yStart, xEnd, yEnd);
                    newShape.style.fill = "white";
                    newShape.style.stroke = document.getElementById("colorPickerElement").value;
                    newShape.style.strokeWidth = thicknessSlider.value;

                    allActions.push(['draw', newShape]);

                    newShape.ondblclick = function (e) {
                        let allSvgElements = document.querySelectorAll("#svgEditor *");
                        allSvgElements.forEach(el => el.classList.remove("selectat"));
                        newShape.classList.add("selectat");
                        currentSvgElementSelected = newShape;
                    }

                    newShape.onmousedown = function (e) {
                        currentShapeSelectedForMoving = newShape;
                        xStartForMoving = e.pageX - this.getBoundingClientRect().left
                        yStartForMoving = e.pageY - this.getBoundingClientRect().top;

                        allActions.push(['move', currentShapeSelectedForMoving, currentShapeSelectedForMoving.getAttributeNS(null, 'points')]);
                    }

                    newShape.onmousemove = function (e) {
                        if (currentShapeSelectedForMoving != null) {
                            let xEndForMoving = e.pageX - this.getBoundingClientRect().left;
                            let yEndForMoving = e.pageY - this.getBoundingClientRect().top;

                            let pointsAsString = currentShapeSelectedForMoving.getAttributeNS(null, 'points').split(" ");
                            let pointsAsArrayofArrays = [];

                            for (point of pointsAsString) {
                                pointsAsArrayofArrays.push(point.split(","));
                            }

                            for (let i = 0; i < pointsAsArrayofArrays.length; i++) {
                                for (let j = 0; j < pointsAsArrayofArrays[0].length; j++) {
                                    pointsAsArrayofArrays[i][j] = parseFloat(pointsAsArrayofArrays[i][j]);
                                }
                                pointsAsArrayofArrays[i][0] = pointsAsArrayofArrays[i][0] + (xEndForMoving - xStartForMoving);
                                pointsAsArrayofArrays[i][1] = pointsAsArrayofArrays[i][1] + (yEndForMoving - yStartForMoving);
                            }

                            for (let i = 0; i < pointsAsArrayofArrays.length - 1; i++) {
                                pointsAsArrayofArrays[i] = pointsAsArrayofArrays[i].join(",");
                            }

                            pointsAsString = pointsAsArrayofArrays.join(" ");

                            currentShapeSelectedForMoving.setAttributeNS(null, 'points', pointsAsString);
                        }
                    }

                    newShape.onmouseup = function (e) {
                        currentShapeSelectedForMoving = null;
                        dontDraw = true;
                    }

                    svgEditor.appendChild(newShape);
                }
            }
        }
    }
}


svgEditor.onmousemove = function (e) {
    if (currentShapeSelectedForMoving == null) {
        let xEnd = e.pageX - this.getBoundingClientRect().left;
        let yEnd = e.pageY - this.getBoundingClientRect().top;

        if (drawTemplate == true) {
            if (currentShapeSelection == 'rectangle') {
                rectGeneral.style.display = "block";
                setRectangleCoordonates(rectGeneral, xStart, yStart, xEnd, yEnd);
            }

            else if (currentShapeSelection == 'line') {
                lineGeneral.style.display = "block";
                setLineCoordonates(lineGeneral, xStart, yStart, xEnd, yEnd);
            }

            else if (currentShapeSelection == 'ellipse') {
                ellipseGeneral.style.display = "block";
                setEllipseCoordonates(ellipseGeneral, xStart, yStart, xEnd, yEnd);
            }

            else if (currentShapeSelection == 'diamond') {
                diamondGeneral.style.display = "block";
                setDiamondCoordonates(diamondGeneral, xStart, yStart, xEnd, yEnd);
            }
        }
    }
}


document.onkeydown = function (e) {
    if (currentSvgElementSelected != null) {
        if (e.keyCode == 46) {
            allActions.push(['remove', currentSvgElementSelected]);
            currentSvgElementSelected.remove();
        }
    }

    if (e.keyCode == 27) {
        let allSvgElements = document.querySelectorAll("#svgEditor *");
        allSvgElements.forEach(el => el.classList.remove("selectat"));
    }
}


btnDownloadPNG.onclick = () => {
    let canvas = document.getElementById('canvasForPngDownload');
    let canvasContext = canvas.getContext('2d');
    let data = (new XMLSerializer()).serializeToString(svgEditor);
    let DOMURL = window.URL || window.webkitURL || window;

    let img = new Image();
    let svgBlob = new Blob([data], { type: 'image/svg+xml;charset=utf-8' });
    let url = DOMURL.createObjectURL(svgBlob);

    img.onload = function () {
        canvasContext.drawImage(img, 0, 0);
        DOMURL.revokeObjectURL(url);

        let imgURI = canvas
            .toDataURL('image/png')
            .replace('image/png', 'image/octet-stream');

        let evt = new MouseEvent('click', {
            view: window,
            bubbles: false,
            cancelable: true
        });

        let aElement = document.createElement('a');
        aElement.setAttribute('download', 'exportedPNG.png');
        aElement.setAttribute('href', imgURI);
        aElement.setAttribute('target', '_blank');

        aElement.dispatchEvent(evt);
    };

    img.src = url;
};


btnDownloadSVG.onclick = () => {
    let svgData = svgEditor.outerHTML;
    let svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    let svgUrl = URL.createObjectURL(svgBlob);
    
    let aElement = document.createElement("a");
    aElement.href = svgUrl;
    aElement.download = "exportedSVG.svg";
    aElement.click();
}

