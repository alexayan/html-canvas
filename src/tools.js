export function parseMarginValue(value) {
  value = "" + value;
  const values = value.split(/\s+/);
  if (!values[0]) {
    return values;
  }
  if (!values[1]) {
    values[1] = values[0];
  }
  if (!values[2]) {
    values[2] = values[0];
  }
  if (!values[3]) {
    values[3] = values[1];
  }
  return values;
}

const rBorderWidth = /\d+[a-z]+/i;

export function parseBorderValue(value) {
  const values = value.split(/\s+/);
  const hasWidth = rBorderWidth.test(value);
  const len = values.length;
  let width;
  let style;
  let color;
  switch (len) {
    case 1:
      style = values[0];
      break;
    case 2:
      if (hasWidth) {
        width = values[0];
        style = values[1];
      } else {
        style = values[1];
        color = values[1];
      }
      break;
    case 3:
      width = values[0];
      style = values[1];
      color = values[2];
      break;
    default:
      break;
  }
  return {
    width,
    style,
    color
  };
}

export function isArray(v) {
  return Object.prototype.toString.call(v) === "[object Array]";
}

export function measureText(ctx, text, font) {
  ctx.font = font;
  return ctx.measureText(text);
}

export function stringifyFont(font) {
  return `${font["font-style"].value()} ${font["font-variant"].value()} ${font[
    "font-weight"
  ].value()} ${font["font-stretch"].value()} ${font[
    "font-size"
  ].value()}px/${font["line-height"].value()} ${font["font-family"].value()}`;
}

export function parseOverflowValue(value) {
  value = "" + value;
  const values = value.split(/\s+/);
  if (!values[0]) {
    return values;
  }
  if (!values[1]) {
    values[1] = values[0];
  }
  return values;
}

export function parseStyleStr(style = '') {
  const rtn = {};
  const parts = style.split(';');
  parts.forEach((part) => {
    const items = part.split(':');
    const key = (items[0] || '').replace(/^\s+|\s+$/g, '');
    const value = (items[1] || '').replace(/^\s+|\s+$/g, '');
    if (key) {
      rtn[key] = value;
    }
  })
  return rtn;
}

export function findIndex(arr, compare) {
  let index = -1;
  for (let i = 0, len = arr.length; i < len; i++) {
    if (compare(arr[i])) {
      index = i;
      break;
    }
  }
  return index;
}

export function forIn(obj, func) {
  Object.keys(obj).forEach((key) => {
    func(obj[key], key);
  })
}

export function downloadFile(url) {
  return new Promise((resolve, reject) => {
    wx.downloadFile({
      url,
      success: res => {
        if (res.statusCode === 200) {
          return resolve(res.tempFilePath)
        } else {
          return reject(new Error(`download ${url} fail`))
        }
      },
      fail(e) {
        reject(e);
      }
    });
  });
}

export function parseClassName(className) {
  return className.split(/\s+/g).filter((name) => {
    return !!name;
  })
}
