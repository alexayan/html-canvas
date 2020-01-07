/* eslint-disable import/no-extraneous-dependencies */
const NodeCanvas = require("canvas");
const fs = require("fs");
const path = require("path");
const htmlStyle = require('html-style');

const out = fs.createWriteStream(path.join(__dirname, "./render.png"));
const HtmlCanvas = require("../../miniprogram_dist/index");

const demoHtml = fs.readFileSync(path.resolve(__dirname, '../demo.html'), {
  encoding: 'utf8'
});

const demoCss = fs.readFileSync(path.resolve(__dirname, '../demo.css'), {
  encoding: 'utf8'
});

const demo = htmlStyle(demoHtml, demoCss);

const canvasWidth = 350;
let nodeCanvas = NodeCanvas.createCanvas(canvasWidth, canvasWidth);
let ctx = nodeCanvas.getContext("2d");
const Node = HtmlCanvas.Node;

const Image = NodeCanvas.Image;

Node.prototype.loadImage = function (src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(img);
    }
    img.onerror = err => {
      reject(err);
    }
    img.src = src;
  })
}

const tree = Node.fromHtml(demo);
tree.setStyle('width', `${canvasWidth}px`)
tree
  .layout(ctx)
  .then(() => {
    nodeCanvas = NodeCanvas.createCanvas(canvasWidth, tree.boxHeight().value());
    ctx = nodeCanvas.getContext("2d");
    const canvas = new HtmlCanvas.Canvas(ctx);

    canvas.draw(tree, false, () => {
      const stream = nodeCanvas.createPNGStream()
      stream.pipe(out)
      out.on('finish', () => console.log('The png file was created.'))
    });
  })
  .catch(e => {
    console.error(e);
  });
