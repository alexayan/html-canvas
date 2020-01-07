import _set from "set-value";
import {
  INHERITED_PROPERTIES,
  CssValue,
  defaultCssValue,
  AVALIABLE_PROP,
  BOX_PROP
} from "./css";
import {BLOCK_TAGS} from "./html";
import htmlparser from "./htmlparser";

import Flows from "./flow";
import {
  parseStyleStr, findIndex, forIn, parseClassName
} from "./tools";

export default class Node {
  constructor(name, props, children = []) {
    if (typeof name === "object") {
      this.nodeName = name.nodeName;
      this.text = name.text;
      this.type = name.text ? "text" : name.type;
      this.props = name.props || {};
      children = name.childNodes || [];
    } else if (typeof props === "string") {
      this.nodeName = name;
      this.text = props;
      this.type = "text";
      this.props = children || {};
      children = arguments[3] || [];
    } else {
      this.nodeName = name;
      this.props = props || {};
    }
    this.parentNode = null;
    this.previousSibling = null;
    this.nextSibling = null;
    this.childNodes = [];
    this._posRelativeToParent = {
      left: new CssValue("0px"),
      top: new CssValue("0px")
    };
    this._style = {};
    this._box = {
      border: {
        left: {
          width: defaultCssValue("border-left-width"),
          style: defaultCssValue("border-left-style"),
          color: defaultCssValue("border-left-color")
        },
        top: {
          width: defaultCssValue("border-top-width"),
          style: defaultCssValue("border-top-style"),
          color: defaultCssValue("border-top-color")
        },
        right: {
          width: defaultCssValue("border-right-width"),
          style: defaultCssValue("border-right-style"),
          color: defaultCssValue("border-right-color")
        },
        bottom: {
          width: defaultCssValue("border-bottom-width"),
          style: defaultCssValue("border-bottom-style"),
          color: defaultCssValue("border-bottom-color")
        }
      },
      padding: {
        left: defaultCssValue("padding-left"),
        top: defaultCssValue("padding-top"),
        right: defaultCssValue("padding-right"),
        bottom: defaultCssValue("padding-bottom")
      },
      margin: {
        left: defaultCssValue("margin-left"),
        top: defaultCssValue("margin-top"),
        right: defaultCssValue("margin-right"),
        bottom: defaultCssValue("margin-bottom")
      },
      width: defaultCssValue("width"),
      height: defaultCssValue("height")
    };
    children.forEach(node => {
      if (node instanceof Node) {
        this.appendChild(node);
      } else {
        this.appendChild(new Node(node));
      }
    });
    if (typeof this.props.style !== "object") {
      this.props.style = parseStyleStr(this.props.style);
    }
    forIn(this.props.style, (value, key) => {
      this.style(key, value);
    });
  }

  insertBefore(node, target) {
    if (this.isTextNode() || node._isEmptyText()) {
      return this;
    }
    node._unMount();
    const index = this._childIndex(target);
    this._insert(index - 1, node);
    return node;
  }

  insertAfter(node, target) {
    if (this.isTextNode() || node._isEmptyText()) {
      return this;
    }
    node._unMount();
    const index = this._childIndex(target);
    this._insert(index, node);
    return node;
  }

  appendChild(node) {
    if (this.isTextNode() || node._isEmptyText()) {
      return this;
    }
    node._unMount();
    const index = this.childNodes.length - 1;
    this._insert(index, node);
    return node;
  }

  cloneNode(deep) {
    if (!deep) {
      return new Node(this.nodeName, this.text || this.props, []);
    } else {
      return new Node(
        this.nodeName,
        this.text || this.props,
        this.childNodes.map(node => node.cloneNode(deep))
      );
    }
  }

  removeChild(node) {
    if (this.isTextNode() || node._isEmptyText()) {
      return this;
    }
    const index = this._childIndex(node);
    if (index > -1) {
      node._unMount();
    }
    return node;
  }

  getElementById(id) {
    let node;
    this.trevel((n) => {
      if (n.props.id === id) {
        node = n;
        return true;
      }
      return false;
    }, true)
    return node;
  }

  getElementsByClassName(className) {
    const eles = [];
    this.trevel((n) => {
      if (parseClassName(n.props.class).indexOf(className) > -1) {
        eles.push(n);
      }
    }, true);
    return eles;
  }

  getElementsByTagName(tagName) {
    const eles = [];
    this.trevel((n) => {
      if (n.nodeName === tagName) {
        eles.push(n);
      }
    }, true);
    return eles;
  }

  relativePostion() {
    const position = this.style('position').value();
    const relativeNode = this._relativeNode();
    if (position === 'static') {
      return this._posRelativeToParent;
    }
    let top = this.style("top");
    let right = this.style("right");
    let bottom = this.style("bottom");
    let left = this.style("left");
    const fontSize = this.style("font-size").value();

    if (top.unit === "%" && relativeNode) {
      top = new CssValue(
        `${(top.value() * relativeNode.style("height").value()) / 100}px`
      );
    }
    if (top.unit === "em" && relativeNode) {
      top = new CssValue(`${top.value() * fontSize}px`);
    }

    if (bottom.unit === "%" && relativeNode) {
      bottom = new CssValue(
        `${(bottom.value() * relativeNode.style("height").value()) / 100}px`
      );
    }
    if (bottom.unit === "em" && relativeNode) {
      bottom = new CssValue(`${bottom.value() * fontSize}px`);
    }

    if (left.unit === "%" && relativeNode) {
      left = new CssValue(
        `${(left.value() * relativeNode.style("width").value()) / 100}px`
      );
    }
    if (left.unit === "em" && relativeNode) {
      left = new CssValue(`${left.value() * fontSize}px`);
    }

    if (right.unit === "%" && relativeNode) {
      right = new CssValue(
        `${(right.value() * relativeNode.style("width").value()) / 100}px`
      );
    }
    if (right.unit === "em" && relativeNode) {
      right = new CssValue(`${right.value() * fontSize}px`);
    }

    if (position === 'relative') {
      // eslint-disable-next-line no-empty
      if (top.isAbsolute()) {
      } else if (bottom.isAbsolute() && relativeNode) {
        top = new CssValue(`-${bottom.value()}px`);
      } else {
        top = new CssValue("0px");
      }
      // eslint-disable-next-line no-empty
      if (left.isAbsolute()) {
      } else if (right.isAbsolute()) {
        left = new CssValue(`-${right.value()}px`);
      } else {
        left = new CssValue("0px");
      }
      return {
        top: this._posRelativeToParent.top.minus(top),
        left: this._posRelativeToParent.left.minus(left),
      }
    } else {
      // eslint-disable-next-line no-empty
      if (top.isAbsolute()) {
      } else if (bottom.isAbsolute() && relativeNode) {
        top = relativeNode.style("height").minus(bottom.plus(this._boxHeight()));
      } else {
        top = new CssValue("0px");
      }
      // eslint-disable-next-line no-empty
      if (left.isAbsolute()) {
      } else if (right.isAbsolute()) {
        left = relativeNode.style("width").minus(right.plus(this._boxWidth()));
      } else {
        left = new CssValue("0px");
      }

      return {
        top,
        left
      };
    }
  }

  rootPosition() {
    let top = new CssValue("0px");
    let left = new CssValue("0px");
    let parentNode = this._relativeNode();
    const relativePos = this.relativePostion();
    top = top.plus(relativePos.top);
    left = left.plus(relativePos.left);
    while (parentNode) {
      const box = parentNode._box;
      top = box.border.top.width
        .plus(box.margin.top)
        .plus(box.padding.top)
        .plus(top);
      left = box.border.left.width
        .plus(box.margin.left)
        .plus(box.padding.left)
        .plus(left);
      const relativePos = parentNode.relativePostion();
      top = top.plus(relativePos.top);
      left = left.plus(relativePos.left);
      parentNode = parentNode._relativeNode();
    }
    return {
      top,
      left
    };
  }

  setStyle(name, value) {
    this.props.style[name] = value;
    this.style(name, value);
  }

  style(name, value) {
    if (typeof name === "object") {
      forIn(name, (v, k) => {
        this.style(k, v);
      });
      return this;
    }
    if (value !== undefined) {
      name = name.toLowerCase().replace(/^\s+|\s+$/g, "");
      value = new CssValue(value);
      const propDef = AVALIABLE_PROP[name];
      if (!propDef) {
        this._logUnsupportCssProp(name);
      }
      if (propDef && propDef.parseParts) {
        const parts = propDef.parseParts(value._v);
        forIn(parts, (v, k) => {
          this.style(k, v);
        });
      } else if (BOX_PROP[name]) {
        this._changeBox(name, value);
      }
      this._setStyle(name, value);
      return this;
    }
    let v = this._getStyle(name);
    if (
      v === undefined &&
      INHERITED_PROPERTIES.indexOf(name) > -1 &&
      this.parentNode
    ) {
      name = name.toLowerCase().replace(/^\s+|\s+$/g, "");
      if (!AVALIABLE_PROP[name]) {
        this._logUnsupportCssProp(name);
      }
      return this.parentNode.style(name);
    }
    v = v || defaultCssValue(name);
    if (v instanceof CssValue && v.value() === "inherit" && this.parentNode) {
      return this.parentNode.style(name);
    }
    return v;
  }

  isTextNode() {
    return this.type === "text";
  }

  isStaticNode() {
    return ['static'].indexOf(this.style("position").value()) > -1;
  }

  textContent() {
    if (this.isTextNode()) {
      return this.text;
    } else {
      return this.childNodes.map(node => node.textContent()).join("");
    }
  }

  lookUp(func, self) {
    let stop = false;
    if (self) {
      stop = func(this);
    }
    if (!stop && this.parentNode) {
      this.parentNode.lookUp(func, true);
    }
  }

  trevel(func, self, hooks = {}) {
    let stop = false;
    if (self) {
      stop = func(this);
    }
    if (!stop) {
      this.childNodes.forEach(node => {
        node.trevel(func, self, hooks);
      });
      if (hooks.afterTrevelChildren) {
        hooks.afterTrevelChildren(this);
      }
    }
  }

  layout(ctx) {
    let root;
    return this.loadResource().then(() => {
      this.lookUp(node => {
        if (!node.parentNode) {
          root = node;
          return true;
        }
        return false;
      }, true);
      if (root) {
        root._layout(ctx);
      }
    });
  }

  wxLoadImage(src) {
    return new Promise((resolve, reject) => {
      wx.getImageInfo({
        src,
        success: (res) => {
          res.src = res.path;
          resolve(res);
        },
        fail: (e) => {
          reject(e);
        }
      })
    })
  }

  loadImage(src) {
    if (typeof wx !== 'undefined') {
      return this.wxLoadImage(src);
    }
    throw new Error('node.loadImage() not implement')
  }

  loadResource() {
    const tasks = [];
    this.trevel((node) => {
      if (node.nodeName === "img" && node.props.src && !node._resource) {
        tasks.push({
          type: 'img',
          src: node.props.src,
          node
        })
      }
    }, true);
    return Promise.all(tasks.map((task) => {
      return this.loadImage(task.src);
    })).then((results) => {
      results.forEach((res, index) => {
        tasks[index].node._resource = res;
      });
      return results;
    });
  }

  _layout(ctx) {
    if (this.isTextNode()) {
      return;
    }

    const isBlockNode = this._isBlockNode();
    const boxSizing = this.style("box-sizing").value();
    const originWidth = this.props.style.width || "";
    const originHeight = this.props.style.height || "";
    let cssWidth = originWidth
      ? new CssValue(originWidth)
      : defaultCssValue("width");
    let cssHeight = originHeight
      ? new CssValue(originHeight)
      : defaultCssValue("height");
    let widthComputed = false;
    let heightComputed = false;

    if (cssWidth.isAbsolute()) {
      if (boxSizing === "border-box") {
        cssWidth = cssWidth
          .minus(this._box.padding.left)
          .minus(this._box.padding.right);
      }
      widthComputed = true;
    } else if (isBlockNode && this.parentNode) {
      const parentCssWidth = this.parentNode.style("width");
      if (parentCssWidth.isAbsolute()) {
        if (cssWidth.isPercentage()) {
          cssWidth = new CssValue(
            `${(parentCssWidth.value() * cssWidth.value()) / 100}${
              parentCssWidth.unit
            }`
          );
        } else {
          cssWidth = new CssValue(
            `${parentCssWidth.value()}${parentCssWidth.unit}`
          ).minus(this._boxWidth(true));
        }
        if (boxSizing === "border-box") {
          cssWidth = cssWidth
            .minus(this._box.padding.left)
            .minus(this._box.padding.right);
        }
        widthComputed = true;
      }
    } else if (this.parentNode && cssWidth.isPercentage()) {
      const parentCssWidth = this.parentNode.style("width");
      if (parentCssWidth.isAbsolute()) {
        cssWidth = new CssValue(
          `${(parentCssWidth.value() * cssWidth.value()) / 100}${
            parentCssWidth.unit
          }`
        );
        if (boxSizing === "border-box") {
          cssWidth = cssWidth
            .minus(this._box.padding.left)
            .minus(this._box.padding.right);
        }
        widthComputed = true;
      }
    }

    if (cssHeight.isAbsolute()) {
      if (boxSizing === "border-box") {
        cssHeight = cssHeight
          .minus(this._box.padding.top)
          .minus(this._box.padding.bottom);
      }
      heightComputed = true;
    } else if (cssHeight.isPercentage() && this.parentNode) {
      const percent = cssHeight.value();
      const parentCssHeight = this.parentNode.style("height");
      if (parentCssHeight.isAbsolute()) {
        cssHeight = new CssValue(
          `${(parentCssHeight.value() * percent) / 100}${parentCssHeight.unit}`
        );
        if (boxSizing === "border-box") {
          cssHeight = cssHeight
            .minus(this._box.padding.top)
            .minus(this._box.padding.bottom);
        }
        heightComputed = true;
      }
    }

    if (this.isImageNode()) {
      if (!widthComputed) {
        if (this.parentNode && this.parentNode.style('width').isAbsolute()) {
          cssWidth = new CssValue(`${Math.min(this._resource.width, this.parentNode.style('width'))}px`);
        } else {
          cssWidth = new CssValue(`${this._resource.width}px`);
        }
        widthComputed = true;
      }
      if (!heightComputed) {
        cssHeight = new CssValue(`${cssWidth.value() * this._resource.height / this._resource.width}px`);
        heightComputed = true;
      }
    }

    if (widthComputed) {
      this.style("width", cssWidth);
      this._box.width = cssWidth;
      if (this.parentNode && isBlockNode) {
        const remainingHorizontalSpace = this.parentNode._box.width.minus(
          this._boxWidth()
        );
        let autoSize = new CssValue("0px");
        let autoCount = 0;
        let isMarginLeftAuto = false;
        let isMarginRightAuto = false;
        if (this._box.margin.left.value() === "auto") {
          isMarginLeftAuto = true;
          autoCount++;
        }
        if (this._box.margin.right.value() === "auto") {
          isMarginRightAuto = true;
          autoCount++;
        }
        if (autoCount > 0) {
          autoSize = remainingHorizontalSpace.divide(autoCount);
        }
        if (isMarginLeftAuto) {
          this._changeBox("margin-left", autoSize.clone());
        }
        if (isMarginRightAuto) {
          this._changeBox("margin-right", autoSize.clone());
        }
      }
    }

    if (heightComputed) {
      this.style("height", cssHeight);
    }

    this.childNodes.forEach(childNode => {
      childNode._layout(ctx);
    });

    this._flows = new Flows(this);
    this._absolutes = [];
    this.childNodes.forEach(node => {
      const position = node.style("position").value();
      if (
        position === "static" ||
        position === "relative" ||
        !node.parentNode
      ) {
        this._flows.addNode(node, ctx);
        return;
      }
      let relativeNode;
      node.lookUp(n => {
        relativeNode = n;
        if (
          position === "absolute" &&
          ["relative", "absolute", "fixed"].indexOf(
            n.style("position").value()
          ) > -1
        ) {
          return true;
        }
        return false;
      }, false);
      relativeNode._absolutes.push(node);
    });

    if (!widthComputed) {
      cssWidth = this._flows.getWidth();
      this.style("width", cssWidth);
      widthComputed = true;
    }

    if (!heightComputed) {
      cssHeight = this._flows.getHeight();
      this.style("height", cssHeight);
      heightComputed = true;
    }
  }

  _initflowInfo() {
    return {
      direction: "row",
      justifyContent: "start",
      alignItems: "start",
      nodes: []
    };
  }

  _relativeNode() {
    const position = this.style('position').value();
    if (position === 'static' || position === 'relative') {
      return this.parentNode;
    }
    let node;
    this.lookUp(n => {
      node = n;
      if (!n.isStaticNode()) {
        return true;
      }
      return false;
    }, false);
    return node;
  }

  boxWidth() {
    return this._boxWidth();
  }

  _boxWidth(skipContent) {
    const box = this._box;
    const width = box.border.left.width
      .plus(box.margin.left)
      .plus(box.padding.left)
      .plus(box.padding.right)
      .plus(box.margin.right)
      .plus(box.border.right.width);
    if (skipContent) {
      return width;
    }
    return width.plus(box.width);
  }

  boxHeight() {
    return this._boxHeight();
  }

  _boxHeight(skipContent) {
    const box = this._box;
    const height = box.border.top.width
      .plus(box.margin.top)
      .plus(box.padding.top)
      .plus(box.padding.bottom)
      .plus(box.margin.bottom)
      .plus(box.border.bottom.width);
    if (skipContent) {
      return height;
    }
    return height.plus(box.height);
  }

  _getStyle(name) {
    const propDesc = AVALIABLE_PROP[name];
    if (propDesc && propDesc.computed) {
      return propDesc.computed.reduce((rtn, v) => {
        rtn[v] = this.style(v);
        return rtn;
      }, {});
    }
    let style = this._style[name];
    if (style) {
      style = style.clone();
    }
    return style;
  }

  _setStyle(name, value) {
    this._style[name] = value;
  }

  _changeBox(prop, cssValue) {
    this._setStyle(prop, cssValue);
    _set(this._box, prop.replace(/-/g, "."), cssValue);
  }

  isImageNode() {
    return this.nodeName === "img";
  }

  _isEmptyText() {
    if (this.type === 'text' && /^[\s↵ ]+$/.test(this.text)) {
      return true;
    }
    return false;
  }

  _isBlockNode() {
    const cssDisplay = this.style("display").value();
    if (cssDisplay === "inline-block" || cssDisplay === "inline-flex" || cssDisplay === "inline") {
      return false;
    }
    if (cssDisplay === 'block') {
      return true;
    }
    if (BLOCK_TAGS.indexOf(this.nodeName) > -1) {
      return true;
    }
    return false;
  }

  _isFlexChild() {
    return this.parentNode ? this.parentNode._isFlexContainer() : false;
  }

  _isFlexContainer() {
    const cssDisplay = this.style("display").value();
    if (cssDisplay === "flex") {
      return true;
    }
    return false;
  }

  _isFlex() {
    return this._isFlexContainer() || this.parentNode
      ? this.parentNode._isFlexContainer()
      : false;
  }

  _insert(index, node) {
    node.parentNode = this;
    const prev = this.childNodes[index] || null;
    const next = this.childNodes[index + 1] || null;
    if (prev) {
      prev.nextSibling = node;
    }
    if (next) {
      next.previousSibling = node;
    }
    node.previousSibling = this.childNodes[index] || null;
    node.nextSibling = next;
    this.childNodes.splice(index + 1, 0, node);
  }

  _childIndex(child) {
    return findIndex(this.childNodes, node => node === child);
  }

  _unMount() {
    if (this.parentNode) {
      const index = this.parentNode._childIndex(this);
      if (index > -1) {
        this.parentNode.children.splice(index, 1);
      }
    }
    const prev = this.previousSibling;
    const next = this.nextSibling;
    if (prev) {
      prev.nextSibling = next;
    }
    if (next) {
      next.previousSibling = prev;
    }
  }

  _nodeId() {
    let id = this.nodeName;
    if (this.props.id) {
      id += `#${this.props.id}`;
    }
    if (this.props.class) {
      id += this.props.class.split(/\s+/g).join(".");
    }
    return id;
  }

  _nodePath() {
    let path = "";
    this.lookUp(node => {
      if (node.parentNode) {
        path =
          "[" +
          node.parentNode._childIndex(node) +
          "] > " +
          node._nodeId() +
          path;
      } else {
        path = node._nodeId() + path;
      }
    }, true);
    return path;
  }

  _logUnsupportCssProp(prop) {
    console.warn(`${this._nodePath()}: unsupport css property: ${prop}`);
    console.warn(`css property support list: `, Object.keys(AVALIABLE_PROP));
  }

  _logDisplaySupportList() {
    console.warn(
      `${this._nodePath()}: display support list: block, inline-block, flex`
    );
  }
}

function transformNode(node) {
  node.nodeName = node.name;
  node.props = node.attribs;
  node.text = node.type === "text" ? node.data : "";
  node.childNodes = node.children;
  (node.children || []).forEach(node => {
    transformNode(node);
  });
}

Node.fromHtml = function(html) {
  html = html.replace(/^\s+|\s+$/g, '');
  const handler = new htmlparser.DefaultHandler((error, dom) => {
    if (error) {
      console.error(error);
    } else {
      dom.forEach(node => {
        transformNode(node);
      });
    }
  });
  const parser = new htmlparser.Parser(handler);
  parser.parseComplete(html);
  return new Node(handler.dom[0]);
};
