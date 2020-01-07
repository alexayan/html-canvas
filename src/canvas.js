import { stringifyFont } from "./tools";

export default class Canvas {
  constructor(ctx) {
    if (!ctx) {
      throw new Error("new Canvas(ctx, width) require ctx");
    }
    this.ctx = ctx;
  }

  draw(node, reserve, func, isChild) {
    if (!node) {
      return;
    }
    const ctx = this.ctx;
    ctx.save();
    const pos = node.rootPosition();
    this.drawNodeBorder(node, pos);
    this.processNodeBorderRadius(node, pos);
    this.drawNodeBackgroundColor(node, pos);
    this.drawNodeImage(node, pos);
    ctx.restore();
    this.processOverFlow(node, pos);
    this.drawNodeText(node, pos);
    (node._flows || []).forEach(node => {
      this.draw(node, "", "", true);
    });
    (node._absolutes || [])
      .sort((a, b) => {
        const az = a.style("z-index").value();
        const bz = b.style("z-index").value();
        return az - bz;
      })
      .forEach(node => {
        this.draw(node, "", "", true);
      });
    const overFlow = node.style("overflow");
    const overflowX = overFlow["overflow-x"].value();
    const overflowY = overFlow["overflow-y"].value();
    if (overflowX === "hidden" || overflowY === "hidden") {
      ctx.restore();
    }
    ctx.restore();
    if (!isChild) {
      console.log("draw node to canvas", node);
      func = func || function noop() {};
      setTimeout(() => {
        if (ctx.draw) {
          ctx.draw(reserve, func)
        } else {
          func();
        }
      }, 250);
    }
  }

  drawNodeImage(node, pos) {
    if (!node.isImageNode() || !node._resource) {
      return;
    }
    const ctx = this.ctx;
    const top = pos.top
      .plus(
        node._box.margin.top,
        node._box.padding.top,
        node._box.border.top.width
      )
      .value();
    const left = pos.left
      .plus(
        node._box.margin.left,
        node._box.padding.left,
        node._box.border.left.width
      )
      .value();
    ctx.drawImage(
      typeof wx !== "undefined" ? node._resource.src : node._resource,
      0,
      0,
      node._resource.width,
      node._resource.height,
      left,
      top,
      node.style("width").value(),
      node.style("height").value()
    );
  }

  drawNodeText(node, pos) {
    if (!node.isTextNode()) {
      return;
    }
    const top = pos.top.value();
    let left = pos.left.value();
    const ctx = this.ctx;
    const width = node.parentNode ? node.parentNode.style("width").value() : 0;
    const font = node.style("font");
    const color = node.style("color").value();
    const textAlign = node.style("text-align").value();
    if (textAlign === "center") {
      left += width / 2;
    }
    if (textAlign === "right") {
      left += width;
    }
    ctx.textAlign = textAlign;
    ctx.textBaseline = "top";
    ctx.font = stringifyFont(font);
    ctx.fillStyle = color;
    ctx.fillText(node.text, left, top);
  }

  drawNodeBackgroundColor(node, pos) {
    pos = pos || node.rootPosition();
    const top = pos.top;
    const left = pos.left;
    const width = node._boxWidth();
    const height = node._boxHeight();
    const bgColor = node.style("background-color");
    if (bgColor.value() !== "transparent") {
      const bgTop = top
        .plus(node._box.margin.top)
        .plus(node._box.border.top.width);
      const bgLeft = left
        .plus(node._box.margin.left)
        .plus(node._box.border.left.width);
      const bgWidth = width
        .minus(node._box.margin.left)
        .minus(node._box.border.left.width)
        .minus(node._box.margin.right)
        .minus(node._box.border.right.width);
      const bgHeight = height
        .minus(node._box.margin.top)
        .minus(node._box.border.top.width)
        .minus(node._box.margin.bottom)
        .minus(node._box.border.bottom.width);
      this.ctx.fillStyle = bgColor.value();
      this.ctx.fillRect(
        bgLeft.value(),
        bgTop.value(),
        bgWidth.value(),
        bgHeight.value()
      );
    }
  }

  processOverFlow(node, pos) {
    const overFlow = node.style("overflow");
    const overflowX = overFlow["overflow-x"].value();
    const overflowY = overFlow["overflow-y"].value();
    if (overflowX !== "hidden" && overflowY !== "hidden") {
      return false;
    }
    let width = node._boxWidth();
    let height = node._boxHeight();
    if (
      overflowX !== "hidden" &&
      node._flows &&
      node._flows
        .getWidth()
        .minus(width)
        .value() > 0
    ) {
      width = node._flows.getWidth();
    }
    if (
      overflowY !== "hidden" &&
      node._flows &&
      node._flows
        .getHeight()
        .minus(height)
        .value() > 0
    ) {
      height = node._flows.getHeight();
    }
    const ctx = this.ctx;
    const conetntLeftPos = pos.left.plus(
      node._box.margin.left,
      node._box.border.left.width,
      node._box.padding.left
    );
    const conetntTopPos = pos.top.plus(
      node._box.margin.top,
      node._box.border.top.width,
      node._box.padding.top
    );
    const conetntRightPos = pos.left
      .plus(width)
      .minus(
        node._box.margin.right,
        node._box.border.right.width,
        node._box.padding.right
      );
    const conetntBottomPos = pos.top
      .plus(height)
      .minus(
        node._box.margin.bottom,
        node._box.border.bottom.width,
        node._box.padding.bottom
      );
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(conetntLeftPos.value(), conetntTopPos.value());
    ctx.lineTo(conetntRightPos.value(), conetntTopPos.value());
    ctx.lineTo(conetntRightPos.value(), conetntBottomPos.value());
    ctx.lineTo(conetntLeftPos.value(), conetntBottomPos.value());
    ctx.lineTo(conetntLeftPos.value(), conetntTopPos.value());
    ctx.clip();
    return true;
  }

  processNodeBorderRadius(node, pos) {
    pos = pos || node.rootPosition();
    const ctx = this.ctx;

    const borderRadius = node.style("border-radius");
    const borderTopLeftRadius = borderRadius["border-top-left-radius"];
    const borderTopRightRadius = borderRadius["border-top-right-radius"];
    const borderBottomLeftRadius = borderRadius["border-bottom-left-radius"];
    const borderBottomRightRadius = borderRadius["border-bottom-right-radius"];
    const borderTop = node._box.border.top;
    const borderRight = node._box.border.right;
    const borderBottom = node._box.border.bottom;
    const borderLeft = node._box.border.left;
    const borderLeftPos = pos.left
      .plus(node._box.margin.left)
      .plus(borderLeft.width);
    const borderTopPos = pos.top
      .plus(node._box.margin.top)
      .plus(borderTop.width);
    const borderRightPos = pos.left
      .plus(node._boxWidth())
      .minus(node._box.margin.right)
      .minus(borderRight.width);
    const borderBottomPos = pos.top
      .plus(node._boxHeight())
      .minus(node._box.margin.bottom)
      .minus(borderBottom.width);

    ctx.save();
    ctx.beginPath();

    let cx = borderLeftPos.plus(borderTopLeftRadius);
    let cy = borderTopPos.plus(borderTopLeftRadius);
    ctx.moveTo(borderLeftPos.value(), cy.value());
    if (borderTopLeftRadius.value() > 0) {
      ctx.arc(
        cx.value(),
        cy.value(),
        borderTopLeftRadius.value(),
        Math.PI,
        Math.PI * 1.5
      );
    } else {
      ctx.lineTo(borderLeftPos.value(), borderTopPos.value());
      ctx.lineTo(cx.value(), borderTopPos.value());
    }

    cx = borderRightPos.minus(borderTopRightRadius);
    cy = borderTopPos.plus(borderTopRightRadius);
    ctx.lineTo(cx.value(), borderTopPos.value());

    if (borderTopRightRadius.value() > 0) {
      ctx.arc(
        cx.value(),
        cy.value(),
        borderTopRightRadius.value(),
        Math.PI * 1.5,
        0
      );
    } else {
      ctx.lineTo(borderRightPos.value(), borderTopPos.value());
      ctx.lineTo(borderRightPos.value(), cy.value());
    }

    cx = borderRightPos.minus(borderBottomRightRadius);
    cy = borderBottomPos.minus(borderBottomRightRadius);
    ctx.lineTo(borderRightPos.value(), cy.value());

    if (borderBottomRightRadius.value() > 0) {
      ctx.arc(
        cx.value(),
        cy.value(),
        borderBottomRightRadius.value(),
        0,
        0.5 * Math.PI
      );
    } else {
      ctx.lineTo(borderRightPos.value(), borderBottomPos.value());
      ctx.lineTo(cx.value(), borderBottomPos.value());
    }

    cx = borderLeftPos.plus(borderBottomLeftRadius);
    cy = borderBottomPos.minus(borderBottomLeftRadius);
    ctx.lineTo(cx.value(), borderBottomPos.value());

    if (borderBottomLeftRadius.value() > 0) {
      ctx.arc(
        cx.value(),
        cy.value(),
        borderBottomLeftRadius.value(),
        0.5 * Math.PI,
        Math.PI
      );
    } else {
      ctx.lineTo(borderLeftPos.value(), borderBottomPos.value());
      ctx.lineTo(borderLeftPos.value(), cy.value());
    }

    cx = borderLeftPos.plus(borderTopLeftRadius);
    cy = borderTopPos.plus(borderTopLeftRadius);
    ctx.lineTo(borderLeftPos.value(), cy.value());

    ctx.clip();
  }

  drawNodeBorder(node, pos) {
    pos = pos || node.rootPosition();
    const ctx = this.ctx;

    const borderRadius = node.style("border-radius");
    const borderTopLeftRadius = borderRadius["border-top-left-radius"];
    const borderTopRightRadius = borderRadius["border-top-right-radius"];
    const borderBottomLeftRadius = borderRadius["border-bottom-left-radius"];
    const borderBottomRightRadius = borderRadius["border-bottom-right-radius"];
    const borderTop = node._box.border.top;
    const borderRight = node._box.border.right;
    const borderBottom = node._box.border.bottom;
    const borderLeft = node._box.border.left;
    const borderLeftPos = pos.left
      .plus(node._box.margin.left)
      .plus(borderLeft.width);
    const borderTopPos = pos.top
      .plus(node._box.margin.top)
      .plus(borderTop.width);
    const borderRightPos = pos.left
      .plus(node._boxWidth())
      .minus(node._box.margin.right)
      .minus(borderRight.width);
    const borderBottomPos = pos.top
      .plus(node._boxHeight())
      .minus(node._box.margin.bottom)
      .minus(borderBottom.width);

    let cx = borderLeftPos.plus(borderTopLeftRadius);
    let cy = borderTopPos.plus(borderTopLeftRadius);
    if (borderTop.width.value() > 0) {
      ctx.beginPath();
      ctx.lineWidth = borderTop.width.value();
      ctx.strokeStyle = borderTop.color.value();
      if (borderTop.style.value() === "dashed") {
        ctx.setLineDash([6, 3]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.moveTo(borderLeftPos.value(), cy.value());
      if (borderTopLeftRadius.value() > 0) {
        ctx.arc(
          cx.value(),
          cy.value(),
          borderTopLeftRadius.value(),
          Math.PI,
          Math.PI * 1.5
        );
      } else {
        ctx.lineTo(borderLeftPos.value(), borderTopPos.value());
        ctx.lineTo(cx.value(), borderTopPos.value());
      }

      cx = borderRightPos.minus(borderTopRightRadius);
      cy = borderTopPos.plus(borderTopRightRadius);
      ctx.lineTo(cx.value(), borderTopPos.value());
      ctx.stroke();
    } else {
      cx = borderRightPos.minus(borderTopRightRadius);
      cy = borderTopPos.plus(borderTopRightRadius);
    }

    if (borderRight.width.value() > 0) {
      ctx.beginPath();
      ctx.moveTo(cx.value(), borderTopPos.value());
      ctx.strokeStyle = borderRight.color.value();
      ctx.lineWidth = borderRight.width.value();
      if (borderRight.style.value() === "dashed") {
        ctx.setLineDash([6, 3]);
      } else {
        ctx.setLineDash([]);
      }
      if (borderTopRightRadius.value() > 0) {
        ctx.arc(
          cx.value(),
          cy.value(),
          borderTopRightRadius.value(),
          Math.PI * 1.5,
          0
        );
      } else {
        ctx.lineTo(borderRightPos.value(), borderTopPos.value());
        ctx.lineTo(borderRightPos.value(), cy.value());
      }

      cx = borderRightPos.minus(borderBottomRightRadius);
      cy = borderBottomPos.minus(borderBottomRightRadius);
      ctx.lineTo(borderRightPos.value(), cy.value());
      ctx.stroke();
    } else {
      cx = borderRightPos.minus(borderBottomRightRadius);
      cy = borderBottomPos.minus(borderBottomRightRadius);
    }

    if (borderBottom.width.value() > 0) {
      ctx.beginPath();
      ctx.moveTo(borderRightPos.value(), cy.value());
      ctx.strokeStyle = borderBottom.color.value();
      ctx.lineWidth = borderBottom.width.value();
      if (borderBottom.style.value() === "dashed") {
        ctx.setLineDash([6, 3]);
      } else {
        ctx.setLineDash([]);
      }
      if (borderBottomRightRadius.value() > 0) {
        ctx.arc(
          cx.value(),
          cy.value(),
          borderBottomRightRadius.value(),
          0,
          0.5 * Math.PI
        );
      } else {
        ctx.lineTo(borderRightPos.value(), borderBottomPos.value());
        ctx.lineTo(cx.value(), borderBottomPos.value());
      }

      cx = borderLeftPos.plus(borderBottomLeftRadius);
      cy = borderBottomPos.minus(borderBottomLeftRadius);
      ctx.lineTo(cx.value(), borderBottomPos.value());
      ctx.stroke();
    } else {
      cx = borderLeftPos.plus(borderBottomLeftRadius);
      cy = borderBottomPos.minus(borderBottomLeftRadius);
    }

    if (borderLeft.width.value() > 0) {
      ctx.beginPath();
      ctx.moveTo(cx.value(), borderBottomPos.value());
      ctx.strokeStyle = borderLeft.color.value();
      ctx.lineWidth = borderLeft.width.value();
      if (borderLeft.style.value() === "dashed") {
        ctx.setLineDash([6, 3]);
      } else {
        ctx.setLineDash([]);
      }
      if (borderBottomLeftRadius.value() > 0) {
        ctx.arc(
          cx.value(),
          cy.value(),
          borderBottomLeftRadius.value(),
          0.5 * Math.PI,
          Math.PI
        );
      } else {
        ctx.lineTo(borderLeftPos.value(), borderBottomPos.value());
        ctx.lineTo(borderLeftPos.value(), cy.value());
      }

      cx = borderLeftPos.plus(borderTopLeftRadius);
      cy = borderTopPos.plus(borderTopLeftRadius);
      ctx.lineTo(
        borderLeftPos.value(),
        cy.value() - borderLeft.width.divide(2).value()
      );

      ctx.stroke();
    }
  }
}
