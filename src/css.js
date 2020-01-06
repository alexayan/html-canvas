import parseFont from "css-font-parser";
import {
  parseMarginValue,
  parseBorderValue,
  isArray,
  parseOverflowValue
} from "./tools";

export const INHERITED_PROPERTIES = [
  "--*",
  "-ms-high-contrast-adjust",
  "-ms-hyphenate-limit-chars",
  "-ms-hyphenate-limit-lines",
  "-ms-hyphenate-limit-zone",
  "-ms-overflow-style",
  "-ms-scrollbar-3dlight-color",
  "-ms-scrollbar-arrow-color",
  "-ms-scrollbar-base-color",
  "-ms-scrollbar-darkshadow-color",
  "-ms-scrollbar-face-color",
  "-ms-scrollbar-highlight-color",
  "-ms-scrollbar-shadow-color",
  "-ms-scrollbar-track-color",
  "-ms-scroll-translation",
  "-ms-touch-select",
  "-moz-context-properties",
  "-moz-image-region",
  "-moz-stack-sizing",
  "-moz-user-input",
  "-moz-user-modify",
  "-webkit-border-before",
  "-webkit-border-before-color",
  "-webkit-border-before-style",
  "-webkit-border-before-width",
  "-webkit-overflow-scrolling",
  "-webkit-text-fill-color",
  "-webkit-text-stroke",
  "-webkit-text-stroke-color",
  "-webkit-text-stroke-width",
  "-webkit-touch-callout",
  "-webkit-user-modify",
  "azimuth",
  "block-overflow",
  "border-collapse",
  "border-spacing",
  "caption-side",
  "caret-color",
  "color",
  "color-adjust",
  "cursor",
  "direction",
  "empty-cells",
  "font",
  "font-family",
  "font-feature-settings",
  "font-kerning",
  "font-language-override",
  "font-optical-sizing",
  "font-variation-settings",
  "font-size",
  "font-size-adjust",
  "font-stretch",
  "font-style",
  "font-synthesis",
  "font-variant",
  "font-variant-alternates",
  "font-variant-caps",
  "font-variant-east-asian",
  "font-variant-ligatures",
  "font-variant-numeric",
  "font-variant-position",
  "font-weight",
  "hanging-punctuation",
  "hyphens",
  "image-orientation",
  "image-rendering",
  "image-resolution",
  "letter-spacing",
  "line-height",
  "line-height-step",
  "list-style",
  "list-style-image",
  "list-style-position",
  "list-style-type",
  "object-position",
  "orphans",
  "overflow-wrap",
  "paint-order",
  "pointer-events",
  "quotes",
  "ruby-align",
  "ruby-merge",
  "ruby-position",
  "scrollbar-color",
  "tab-size",
  "text-align",
  "text-align-last",
  "text-combine-upright",
  "text-decoration-skip",
  "text-decoration-skip-ink",
  "text-indent",
  "text-justify",
  "text-orientation",
  "text-rendering",
  "text-shadow",
  "text-size-adjust",
  "text-transform",
  "text-underline-offset",
  "text-underline-position",
  "visibility",
  "white-space",
  "widows",
  "word-break",
  "word-spacing",
  "word-wrap",
  "writing-mode"
];

export const BOX_PROP = {
  margin: {
    inherited: false,
    initial: ["margin-bottom", "margin-left", "margin-right", "margin-top"],
    computed: ["margin-bottom", "margin-left", "margin-right", "margin-top"],
    parseParts: v => {
      const values = parseMarginValue(v);
      return {
        "margin-top": values[0],
        "margin-right": values[1],
        "margin-bottom": values[2],
        "margin-left": values[3]
      };
    }
  },
  "margin-left": { inherited: false, initial: "0px" },
  "margin-top": { inherited: false, initial: "0px" },
  "margin-right": { inherited: false, initial: "0px" },
  "margin-bottom": { inherited: false, initial: "0px" },
  padding: {
    inherited: false,
    initial: ["padding-bottom", "padding-left", "padding-right", "padding-top"],
    computed: [
      "padding-bottom",
      "padding-left",
      "padding-right",
      "padding-top"
    ],
    parseParts: v => {
      const values = parseMarginValue(v);
      return {
        "padding-top": values[0],
        "padding-right": values[1],
        "padding-bottom": values[2],
        "padding-left": values[3]
      };
    }
  },
  "padding-left": { inherited: false, initial: "0px" },
  "padding-top": { inherited: false, initial: "0px" },
  "padding-right": { inherited: false, initial: "0px" },
  "padding-bottom": { inherited: false, initial: "0px" },
  width: { inherited: false, initial: "auto" },
  height: { inherited: false, initial: "auto" },
  border: {
    inherited: false,
    initial: ["border-width", "border-style", "border-color"],
    computed: ["border-width", "border-style", "border-color"],
    parseParts: v => ({
      "border-top": v,
      "border-right": v,
      "border-bottom": v,
      "border-left": v
    })
  },
  "border-left": {
    inherited: false,
    initial: ["border-left-width", "border-left-style", "border-left-color"],
    computed: ["border-left-width", "border-left-style", "border-left-color"],
    parseParts: v => {
      const values = parseBorderValue(v);
      return {
        "border-left-width": values.width,
        "border-left-style": values.style,
        "border-left-color": values.color
      };
    }
  },
  "border-top": {
    inherited: false,
    initial: ["border-top-width", "border-top-style", "border-top-color"],
    computed: ["border-top-width", "border-top-style", "border-top-color"],
    parseParts: v => {
      const values = parseBorderValue(v);
      return {
        "border-top-width": values.width,
        "border-top-style": values.style,
        "border-top-color": values.color
      };
    }
  },
  "border-right": {
    inherited: false,
    initial: ["border-right-width", "border-right-style", "border-right-color"],
    computed: [
      "border-right-width",
      "border-right-style",
      "border-right-color"
    ],
    parseParts: v => {
      const values = parseBorderValue(v);
      return {
        "border-right-width": values.width,
        "border-right-style": values.style,
        "border-right-color": values.color
      };
    }
  },
  "border-bottom": {
    inherited: false,
    initial: [
      "border-bottom-width",
      "border-bottom-style",
      "border-bottom-color"
    ],
    computed: [
      "border-bottom-width",
      "border-bottom-style",
      "border-bottom-color"
    ],
    parseParts: v => {
      const values = parseBorderValue(v);
      return {
        "border-bottom-width": values.width,
        "border-bottom-style": values.style,
        "border-bottom-color": values.color
      };
    }
  },
  "border-width": {
    inherited: false,
    initial: [
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width"
    ],
    computed: [
      "border-top-width",
      "border-right-width",
      "border-bottom-width",
      "border-left-width"
    ],
    parseParts: v => {
      const values = parseMarginValue(v);
      return {
        "border-top-width": values[0],
        "border-right-width": values[1],
        "border-bottom-width": values[2],
        "border-left-width": values[3]
      };
    }
  },
  "border-style": {
    inherited: false,
    initial: [
      "border-top-style",
      "border-right-style",
      "border-bottom-style",
      "border-left-style"
    ],
    computed: [
      "border-top-style",
      "border-right-style",
      "border-bottom-style",
      "border-left-style"
    ],
    parseParts: v => {
      const values = parseMarginValue(v);
      return {
        "border-top-style": values[0],
        "border-right-style": values[1],
        "border-bottom-style": values[2],
        "border-left-style": values[3]
      };
    }
  },
  "border-color": {
    inherited: false,
    initial: [
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color"
    ],
    computed: [
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color"
    ],
    parseParts: v => {
      const values = parseMarginValue(v);
      return {
        "border-top-color": values[0],
        "border-right-color": values[1],
        "border-bottom-color": values[2],
        "border-left-color": values[3]
      };
    }
  },
  "border-left-style": { inherited: false, initial: "none" },
  "border-left-color": { inherited: false, initial: "transparent" },
  "border-left-width": { inherited: false, initial: "0px" },
  "border-top-style": { inherited: false, initial: "none" },
  "border-top-color": { inherited: false, initial: "transparent" },
  "border-top-width": { inherited: false, initial: "0px" },
  "border-right-style": { inherited: false, initial: "none" },
  "border-right-color": { inherited: false, initial: "transparent" },
  "border-right-width": { inherited: false, initial: "0px" },
  "border-bottom-style": { inherited: false, initial: "none" },
  "border-bottom-color": { inherited: false, initial: "transparent" },
  "border-bottom-width": { inherited: false, initial: "0px" }
};

export const FLEX_PROP = {
  flex: {
    inherited: false,
    initial: ["flex-grow", "flex-shrink", "flex-basis"]
  },
  "flex-basis": {
    inherited: false,
    initial: "auto"
  },
  "flex-direction": {
    inherited: false,
    initial: "row"
  },
  "flex-flow": {
    inherited: false,
    initial: ["flex-direction", "flex-wrap"]
  },
  "flex-grow": {
    inherited: false,
    initial: "0"
  },
  "flex-shrink": {
    inherited: false,
    initial: "1"
  },
  "flex-wrap": {
    inherited: false,
    initial: "nowrap"
  }
};

export const AVALIABLE_PROP = Object.assign({}, BOX_PROP, {
  color: { inherited: true, initial: "#000000" },
  display: { inherited: false, initial: "initial" },
  "background-color": {
    inherited: false,
    initial: "transparent"
  },
  "border-radius": {
    inherited: false,
    initial: [
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius"
    ],
    computed: [
      "border-bottom-left-radius",
      "border-bottom-right-radius",
      "border-top-left-radius",
      "border-top-right-radius"
    ],
    parseParts: v => {
      const values = parseMarginValue(v);
      return {
        "border-top-left-radius": values[0],
        "border-top-right-radius": values[1],
        "border-bottom-right-radius": values[2],
        "border-bottom-left-radius": values[3]
      };
    }
  },
  "border-top-left-radius": {
    inherited: false,
    initial: "0px"
  },
  "border-top-right-radius": {
    inherited: false,
    initial: "0px"
  },
  "border-bottom-left-radius": {
    inherited: false,
    initial: "0px"
  },
  "border-bottom-right-radius": {
    inherited: false,
    initial: "0px"
  },
  "box-sizing": {
    inherited: false,
    initial: "content-box"
  },
  font: {
    inherited: true,
    initial: [
      "font-style",
      "font-variant",
      "font-weight",
      "font-stretch",
      "font-size",
      "line-height",
      "font-family"
    ],
    computed: [
      "font-style",
      "font-variant",
      "font-weight",
      "font-stretch",
      "font-size",
      "line-height",
      "font-family"
    ],
    parseParts: v => {
      const parts = parseFont(v);
      if (parts["font-family"]) {
        parts["font-family"] = parts["font-family"].join(",");
      }
      return parts;
    }
  },
  "font-style": {
    media: "visual",
    inherited: true,
    initial: "normal"
  },
  "font-variant": {
    inherited: true,
    initial: "normal"
  },
  "font-weight": { inherited: true, initial: "normal" },
  "font-stretch": {
    inherited: true,
    initial: "normal"
  },
  "font-size": { inherited: true, initial: "16px" },
  "line-height": {
    inherited: true,
    initial: "1.2"
  },
  "font-family": {
    inherited: true,
    initial: "PingFang SC"
  },
  "text-align": {
    inherited: true,
    initial: "left"
  },
  position: {
    inherited: false,
    initial: "static"
  },
  overflow: {
    inherited: false,
    initial: [
      "overflow-x",
      "overflow-y",
    ],
    computed: [
      "overflow-x",
      "overflow-y",
    ],
    parseParts: v => {
      const values = parseOverflowValue(v);
      return {
        "overflow-x": values[0],
        "overflow-y": values[1]
      };
    }
  },
  "overflow-x": {
    inherited: false,
    initial: "visible"
  },
  "overflow-y": {
    inherited: false,
    initial: "visible"
  },
  top: {
    inherited: false,
    initial: "auto"
  },
  left: {
    inherited: false,
    initial: "auto"
  },
  right: {
    inherited: false,
    initial: "auto"
  },
  bottom: {
    inherited: false,
    initial: "auto"
  },
  "z-index": {
    inherited: false,
    initial: "0"
  },
});

const rCssNumberValue = /^(-?[\d.]+)\s*([a-z%]*)$/i;

function pFloat(v) {
  v = parseFloat(v);
  // eslint-disable-next-line no-restricted-globals
  if (isNaN(v)) {
    v = 0;
  }
  return v;
}

export class CssValue {
  constructor(v) {
    if (v._v) {
      v = v._v;
    }
    this._v = v.replace(/^\s+|\s+$/g, "");
    const match = rCssNumberValue.exec(v);
    if (match) {
      this._value = parseFloat(match[1]);
      this.unit = match[2];
    } else {
      this._value = v.replace(/^\s+|\s+$/g, "");
    }
  }

  isAbsolute() {
    return typeof this._value === "number" && this.unit !== "%";
  }

  isPercentage() {
    return this.unit === "%" && typeof this._value === "number";
  }

  // transform unit
  value() {
    return this._value;
  }

  plus() {
    let rtn = pFloat(this._value);
    const items = [].slice.call(arguments);
    items.forEach(item => {
      if (item instanceof CssValue) {
        rtn += pFloat(item.value());
      }
    });
    return new CssValue(`${rtn}${this.unit}`);
  }

  minus() {
    let rtn = pFloat(this._value);
    const items = [].slice.call(arguments);
    items.forEach(item => {
      if (item instanceof CssValue) {
        rtn -= pFloat(item.value());
      }
    });
    return new CssValue(`${rtn}${this.unit}`);
  }

  divide(target) {
    if (target instanceof CssValue) {
      target = target.value();
    }
    return new CssValue(`${this._value / target}${this.unit}`);
  }

  clone() {
    return new CssValue(this._v);
  }
}

CssValue.min = function () {
  const items = [].slice.call(arguments);
  let value;
  items.forEach((item) => {
    if (!value || item.minus(value).value() < 0) {
      value = item;
    }
  })
  return value;
}

CssValue.max = function () {
  const items = [].slice.call(arguments);
  let value;
  items.forEach((item) => {
    if (!value || item.minus(value).value() > 0) {
      value = item;
    }
  })
  return value;
}

export function defaultCssValue(prop) {
  if (!AVALIABLE_PROP[prop]) {
    return new CssValue("initial");
  }
  const initial = AVALIABLE_PROP[prop].initial;
  if (typeof initial === "string") {
    return new CssValue(initial);
  } else if (isArray(initial)) {
    return initial.reduce((res, v) => {
      return new CssValue(
        res ? res + " " + defaultCssValue(v)._v : defaultCssValue(v)._v
      );
    }, "");
  }
  return new CssValue("initial");
}
