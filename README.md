## 简介

基于 HTML 和 CSS 实现 Canvas 绘图。

## 原理

构建虚拟DOM 树，依据 CSS 规范计算样式，使用 CSS 盒模型对 DOM 进行布局，计算出所有元素的位置。最后将 DOM 树通过 Canvas Api 进行绘制。

## 小程序开发工具内运行 demo

[小程序代码片段：https://developers.weixin.qq.com/s/9zFHKdmh7De2](https://developers.weixin.qq.com/s/9zFHKdmh7De2)

``` bash
git clone https://github.com/alexayan/html-canvas.git
npm i
npm run watch
```

## 小程序内使用

[example](./tools/demo/pages/index/index.js)

## Node 环境中使用

[example](./example/node/index.js)

`html-canvas` 默认环境为小程序环境，其他环境中使用需要添加图片加载函数 `loadImage` 到 Node 类上, 返回的图片对象 `image` 会通过 `ctx.drawImage(image)` 画到 canvas 上

```
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
```

## 待支持的 CSS 属性

- [ ] flex
- [ ] flex-basis
- [ ] flex-direction
- [ ] flex-flow
- [ ] flex-grow
- [ ] flex-shrink
- [ ] flex-wrap

## 已支持的 CSS 属性

margin，margin-left，margin-top，margin-right，margin-bottom，padding，padding-left，padding-top，padding-right，padding-bottom，width，height，border，border-left，border-top，border-right，border-bottom，border-width，border-style，border-color，border-left-style，border-left-color，border-left-width，border-top-style，border-top-color，border-top-width，border-right-style，border-right-color，border-right-width，border-bottom-style，border-bottom-color，border-bottom-width，color，display，background-color，border-radius，border-top-left-radius，border-top-right-radius，border-bottom-left-radius，border-bottom-right-radius，box-sizing，font，font-style，font-variant，font-weight，font-stretch，font-size，line-height，font-family，text-align，position，overflow，overflow-x，overflow-y，top，left，right，bottom，z-index

## style html

一个工具库，将 style 样式文件应用到 html 行内样式。

[html-style](https://github.com/alexayan/html-style)
[example](./tools/demo/pages/index/index.js)

## demo

[canvas-draw.html](./canvas-draw.html)

![canvas-draw](canvas-draw.png)