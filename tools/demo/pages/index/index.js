import {Node, Canvas} from '../../components/index';

const systemInfo = wx.getSystemInfoSync();

const demo = `
<div style="line-height: 1.5; background-color: #f1f1f1; padding: 30px 20px;  box-sizing: border-box;">
  <img style="display: block; width: 50px; border-radius: 25px; margin: 0px auto;" src="https://thirdwx.qlogo.cn/mmopen/vi_32/XlDTibpygpfmrTjIs97A4qXOAN91HHFuDQHo0uP3fBeibciaUSdTrXspC5C42oMD8fIiasb5RD72d4QxsL3AFiclBQg/132"/>
  <div style="font-size: 18px; text-align: center; margin-top: 20px; color: rgba(0, 0, 0, 0.9);">author: alexayan</div>
  <div style="margin: 20px 10px; font-size: 16px; color: rgba(0, 0, 0, 0.4);">
    <p>使用 HTML 构建易于理解的 UI 结构，使用 CSS 来描述 UI 样式和布局，一种优雅的 Canvas 绘图实现。</p>
  </div>
  <div style="margin-top: 20px; font-size: 16px;">
    <div style="display: inline-block; width: 35%; text-align: right; color: rgba(0, 0, 0, 0.9);">
      实现原理：
    </div>
    <div style="display: inline-block; width: 64%; padding-left: 15px; box-sizing: border-box; text-align: left; color: rgba(0, 0, 0, 0.5);">
      构建虚拟<span style="font-weight: bold; margin: 0px 4px; font-style: italic; border-bottom: 1px dashed #aaaaaa; height: 19px;">DOM 树</span>，依据 CSS 规范计算样式，使用 CSS <span style="font-weight: bold; margin: 0px 4px; font-style: italic; border-bottom: 1px dashed #aaaaaa; height: 19px;">盒模型</span>对 DOM 进行布局，计算出所有元素的位置。最后将 DOM 树通过 Canvas Api 进行绘制。
    </div>
  </div>
  <div style="margin-top: 20px; font-size: 16px;">
    <div style="display: inline-block; width: 35%; text-align: right; color: rgba(0, 0, 0, 0.9);">
      兼容性：
    </div>
    <div style="display: inline-block; width: 64%; padding-left: 15px; box-sizing: border-box; text-align: left; color: rgba(0, 0, 0, 0.5);">
      HTML 样式和布局计算不依赖于特定 JavaScript 宿主环境，因此可以在 <span style="font-weight: bold; margin: 0px 4px; font-style: italic; border-bottom: 1px dashed #aaaaaa; height: 19px;">Node</span>，<span style="font-weight: bold; margin: 0px 4px; font-style: italic; border-bottom: 1px dashed #aaaaaa; height: 19px;">游览器</span>，<span style="font-weight: bold; margin: 0px 4px; font-style: italic; border-bottom: 1px dashed #aaaaaa; height: 19px;">小程序</span>等环境上使用
    </div>
  </div>
  <div style="margin: 20px 10px ; font-size: 15px; color: rgba(0, 0, 0, 0.3)">
    <div style="color: rgba(0, 0, 0, 0.9); margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #eaecef;">待支持的 CSS 属性</div>
    <div style="padding-left: 15px;">
      <div style="position: relative;"><span style="position: absolute; width: 5px; height: 5px; background-color: #aaaaaa; top: 5px; left: -15px; border-radius: 2.5px;"></span>flex</div>
      <div style="position: relative;"><span style="position: absolute; width: 5px; height: 5px; background-color: #aaaaaa; top: 5px; left: -15px; border-radius: 2.5px;"></span>flex-basis</div>
      <div style="position: relative;"><span style="position: absolute; width: 5px; height: 5px; background-color: #aaaaaa; top: 5px; left: -15px; border-radius: 2.5px;"></span>flex-direction</div>
      <div style="position: relative;"><span style="position: absolute; width: 5px; height: 5px; background-color: #aaaaaa; top: 5px; left: -15px; border-radius: 2.5px;"></span>flex-flow</div>
      <div style="position: relative;"><span style="position: absolute; width: 5px; height: 5px; background-color: #aaaaaa; top: 5px; left: -15px; border-radius: 2.5px;"></span>flex-grow</div>
      <div style="position: relative;"><span style="position: absolute; width: 5px; height: 5px; background-color: #aaaaaa; top: 5px; left: -15px; border-radius: 2.5px;"></span>flex-shrink</div>
      <div style="position: relative;"><span style="position: absolute; width: 5px; height: 5px; background-color: #aaaaaa; top: 5px; left: -15px; border-radius: 2.5px;"></span>flex-wrap</div>
    </div>
  </div>
  <div style="margin: 20px 10px ; font-size: 15px; color: rgba(0, 0, 0, 0.3)">
    <div style="color: rgba(0, 0, 0, 0.9); margin-bottom: 10px; padding-bottom: 5px; border-bottom: 2px solid #eaecef;">已支持的 CSS 属性</div>
    margin，margin-left，margin-top，margin-right，margin-bottom，padding，padding-left，padding-top，padding-right，padding-bottom，width，height，border，border-left，border-top，border-right，border-bottom，border-width，border-style，border-color，border-left-style，border-left-color，border-left-width，border-top-style，border-top-color，border-top-width，border-right-style，border-right-color，border-right-width，border-bottom-style，border-bottom-color，border-bottom-width，color，display，background-color，border-radius，border-top-left-radius，border-top-right-radius，border-bottom-left-radius，border-bottom-right-radius，box-sizing，font，font-style，font-variant，font-weight，font-stretch，font-size，line-height，font-family，text-align，position，overflow，overflow-x，overflow-y，top，left，right，bottom，z-index
  </div>
</div>`;

Page({
  data: {
    canvasStyle: `width: ${systemInfo.screenWidth}px; height: ${systemInfo.screenHeight}px;`
  },

  onReady() {
    const ctx = wx.createCanvasContext('canvas');
    const canvas = new Canvas(ctx);
    const tree = Node.fromHtml(demo);
    tree.setStyle('width', `${systemInfo.screenWidth}px`)
    // eslint-disable-next-line promise/catch-or-return
    tree.layout(ctx).then(() => {
      this.setData({
        canvasStyle: `width: ${systemInfo.screenWidth}px; height: ${tree.boxHeight().value()}px;`
      })
      canvas.draw(tree);
      ctx.draw(false, () => {
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: tree.boxWidth().value(),
          height: tree.boxHeight().value(),
          canvasId: 'canvas',
          success(res) {
            console.log(res);
          }
        })
      })
    });
  }
});
