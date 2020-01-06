import { CssValue } from "./css";
import { measureText, stringifyFont } from "./tools";

const OpenTagRegex = /[({[<（【《「]/;
const EnglishRegex = /[^\w]*(\w+)$/;
const PunctuationRegex = /[,，、.。?？!！;；:：>》」）】@#$%~^&*/]/;
const PunctuationEndRegex = /([^,，、.。?？!！;；:：>》」）】@#$%~^&*/][,，、.。?？!！;；:：>》」）】@#$%~^&*/]*)$/;

function processEnglish(lines) {
  if (lines.length === 0) {
    return lines;
  }
  const last = lines[lines.length - 1];
  if (last) {
    const match = EnglishRegex.exec(last);
    if (match && match[1].length < 20) {
      lines = lines.slice(0, lines.length - 1);
      lines.push(last.slice(0, last.length - match[1].length));
      lines.push(match[1]);
    }
  }
  return lines;
}

function processPunctuation(lines) {
  if (lines.length === 0) {
    return lines;
  }
  const last = lines[lines.length - 1];
  if (last) {
    const match = PunctuationEndRegex.exec(last);
    if (match && match[1].length < 20) {
      lines = lines.slice(0, lines.length - 1);
      lines.push(last.slice(0, last.length - match[1].length));
    }
    const prevLinesCount = lines.length;
    if (/\w/.test(match[1][0])) {
      lines = processEnglish(lines);
      const currentLinesCount = lines.length;
      if (prevLinesCount !== currentLinesCount) {
        lines[lines.length - 1] = lines[lines.length - 1] + match[1];
      } else {
        lines.push(match[1]);
      }
    } else {
      lines.push(match[1]);
    }
  }
  return lines;
}

function processEndOpenTag(lines, index) {
  if (lines.length === 0) {
    return lines;
  }
  const line = lines[index];
  const endLetter = line[line.length - 1];
  if (line && OpenTagRegex.test(endLetter)) {
    lines[index] = line.slice(0, -1);
    lines[index + 1] = endLetter + (lines[index + 1] || "");
  }
  return lines;
}

class Flow {
  constructor(container, direction, justifyContent, alignItems, top, left) {
    this.flowContainer = container;
    this.direction = direction;
    this.justifyContent = justifyContent || "flex-start";
    this.alignItems = alignItems || "flex-start";
    this.top = top || new CssValue("0px");
    this.left = left || new CssValue("0px");
    this.width = new CssValue("0px");
    this.height = new CssValue("0px");
    this.items = [];
  }

  canAccommodate(node) {
    const isEmpty = this.items.length === 0;
    if (isEmpty) {
      return true;
    }
    const isBlock = node._isBlockNode();
    if (isBlock || this.items[this.items.length - 1]._isBlockNode()) {
      return false;
    }
    const containerWidth = this.flowContainer.width;
    if (!containerWidth.isAbsolute()) {
      return true;
    }
    if (
      containerWidth
        .minus(this.width)
        .minus(node._boxWidth())
        .value() >= 0
    ) {
      return true;
    }
    if (node.isTextNode()) {
      const remainingSpace = containerWidth.minus(this.width).value();
      const fontSize = node.style("font-size").value();
      if (remainingSpace >= fontSize) {
        return true;
      }
    }
    return false;
  }

  getContentWidth() {
    return this.items.reduce((value, node) => {
      return value.plus(node._boxWidth());
    }, new CssValue("0px"));
  }

  getContentHeight() {
    let height = new CssValue("0px");
    this.items.forEach(node => {
      const nodeHeight = node._boxHeight();
      if (nodeHeight.minus(height).value() > 0) {
        height = nodeHeight;
      }
    });
    return height;
  }

  addNode(node) {
    this.items.push(node);
    this.layout();
  }

  layout() {
    let width = new CssValue("0px");
    let height = new CssValue("0px");
    this.items.forEach(node => {
      const nodeHeight = node._boxHeight();
      const nodeWidth = node._boxWidth();
      node._posRelativeToParent = {
        top: this.top,
        left: width
      };
      if (nodeHeight.minus(height).value() > 0) {
        height = nodeHeight;
      }
      width = width.plus(nodeWidth);
    });
    this.width = width;
    this.height = height;
  }
}

export default class Flows {
  constructor(container, direction, wrap) {
    this.container = container;
    this.width = container.style("width");
    this.height = container.style("height");
    this.direction = direction || "row";
    this.wrap = wrap || true;
    this._flows = [];
  }

  newFlow() {
    const currentFlow = this._flows[this._flows.length - 1];
    let top = new CssValue("0px");
    const left = new CssValue("0px");
    if (currentFlow) {
      top = currentFlow.top.plus(currentFlow.height);
    }
    return new Flow(this, this.direction, "", "", top, left);
  }

  forEach(func) {
    this._flows.forEach(flow => {
      flow.items.forEach(node => {
        func(node);
      });
    });
  }

  getWidth() {
    let width = new CssValue("0px");
    this._flows.forEach(flow => {
      const flowWidth = flow.getContentWidth();
      if (flowWidth.minus(width).value() > 0) {
        width = flowWidth;
      }
    });
    return width;
  }

  getHeight() {
    let height = new CssValue("0px");
    this._flows.forEach(flow => {
      height = height.plus(flow.getContentHeight());
    });
    return height;
  }

  addNode(node, ctx) {
    let maxWidth;
    if (this.width.isAbsolute()) {
      maxWidth = this.width.value();
    }
    if (maxWidth === 0) {
      return;
    }
    if (!maxWidth) {
      maxWidth = Infinity;
    }
    let currentFlow = this._flows[this._flows.length - 1];
    if (!currentFlow || !currentFlow.canAccommodate(node)) {
      currentFlow = this.newFlow();
      this._flows.push(currentFlow);
    }
    if (!node.isTextNode()) {
      currentFlow.addNode(node);
      return;
    }

    const text = node.text;
    const textLength = text.length;
    const font = node.style("font");
    const fontSize = font["font-size"].value();
    const cssLineHeight = font["line-height"];
    let lineHeight = cssLineHeight.value();
    if (!cssLineHeight.unit) {
      lineHeight *= fontSize;
    }
    const fontStr = stringifyFont(font);

    let partBefore = false;
    if (currentFlow.width.value() > 0) {
      partBefore = true;
    }

    let width = maxWidth - currentFlow.width.value();
    let lines = [];
    let lineIndex = 0;
    let prevLetter = "";
    let letter = "";
    let lineWidth = 0;
    for (let i = 0; i < textLength; i++) {
      letter = text[i];
      lineWidth = measureText(ctx, (lines[lineIndex] || "") + letter, fontStr)
        .width;
      if (lineWidth > width) {
        if (PunctuationRegex.test(letter)) {
          lines = processPunctuation(lines);
        } else if (/\w/.test(letter) && /\w/.test(prevLetter)) {
          lines = processEnglish(lines);
        }
        lines = processEndOpenTag(lines, lineIndex);
        lineIndex++;
        width = maxWidth;
      }
      lines[lineIndex] = (lines[lineIndex] || "") + letter;
      prevLetter = letter;
    }
    lines.forEach((line, index) => {
      line = line.replace(/^\s+|\s+$/g, "");
      const lineWidth = measureText(ctx, line, fontStr).width;
      const partNode = node.cloneNode();
      partNode.text = line;
      partNode.style('width', `${lineWidth}px`);
      partNode.style('height', `${lineHeight}px`);
      partNode.parentNode = node.parentNode;
      if (!partBefore || index !== 0) {
        currentFlow = this.newFlow();
        this._flows.push(currentFlow);
      }
      currentFlow.addNode(partNode)
    });
  }
}
