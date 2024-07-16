const radius = 10;
const threshold = 30;
const levelX = threshold;
const levelY = threshold;

$(document).ready(() => {
    const input = document.querySelector("#input");
    const svg = document.querySelector("#tree-svg");

    // Example tree data
    $("#input").val(`1
2 1
3 1
4 2
5 2`);

    trigger(input, svg);

    $("#input").on('change keyup paste', () => {
        trigger(input, svg);
    });

    $("#download-btn").on("click", function() {
        const svgString = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const DOMURL = window.URL || window.webkitURL || window;
        const img = new Image();
        const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
        const url = DOMURL.createObjectURL(svgBlob);

        img.onload = function() {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            const pngBlob = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.href = pngBlob;
            downloadLink.download = "tree.png";
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            DOMURL.revokeObjectURL(pngBlob);
        };

        img.src = url;
    });
});

const trigger = (input, svg) => {
    clearSVG(svg);
    parseInput(input.value, svg);
}

const parseInput = (text, svg) => {
    const tree = {};
    const location = {};
    const level = [];
    const lines = text.split(/\r?\n/);

    for (let line of lines) {
        const words = line.split(" ");
        const arr = [];
        
        for (let word of words) {
            let num = parseInt(word);
            if (!isNaN(num)) {
                arr.push(num);
            }
        }

        let len = arr.length;
        
        if (len == 1) {
            initializeNodes(tree, arr[0]);
        } else if (len == 2) {
            initializeNodes(tree, arr[0]);
            tree[arr[0]].push(arr[1]);
        }
    }

    let index = 0;

    for (let node in tree) {
        if (!location.hasOwnProperty(node)) {
            visit(svg, tree, level, location, node);
        }

        index++;
    }

    for (let node in tree) {
        drawNode(svg, location[node][0], location[node][1], node);
    }
}

const visit = (svg, tree, level, location, start, parent = -1) => {
    const queue = [];
    queue.push(start);

    while (queue.length > 0) {
        const node = queue.shift();
        const row = tree[node];
        const currLevel = row.length > 0 ? node + 1 : 0;
        const currY = currLevel * threshold;

        if (!location.hasOwnProperty(node)) {
            drawNode(svg, currY, currY, node);
            location[node] = [currY, currY];
        }

        for (let child of row) {
            if (!location.hasOwnProperty(child)) {
                drawNode(svg, currY + threshold, currY + threshold, child);
                location[child] = [currY + threshold, currY + threshold];
            }

            drawEdge(svg, location[node][0], location[node][1], location[child][0], location[child][1]);
            queue.push(child);
        }
    }
}

const initializeNodes = (tree, node) => {
    if (!tree.hasOwnProperty(node)) {
        tree[node] = [];
    }
}

const drawNode = (svg, x, y, text) => {
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", radius);
    circle.setAttribute("fill", "rgb(0,200,100)");

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", x);
    label.setAttribute("y", y + 3);
    label.setAttribute("font-size", "7pt");
    label.setAttribute("fill", "white");
    label.setAttribute("text-anchor", "middle");
    label.textContent = text;

    svg.appendChild(circle);
    svg.appendChild(label);
}

const drawEdge = (svg, x1, y1, x2, y2) => {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "black");

    svg.appendChild(line);
}

const clearSVG = (svg) => {
    while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
    }
}
