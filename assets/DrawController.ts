import { _decorator, Component, Node, Graphics, Vec2 } from "cc";
const { ccclass, property } = _decorator;
const point1 = new Vec2(40, 80);
const point2 = new Vec2(200, 30);
const point3 = new Vec2(100, 100);
@ccclass("draw")
export class draw extends Component {
  @property(Graphics)
  graphics: Graphics = null;
  start() {
    this.draw();
    this.drawCircle();
  }

  draw() {
    const graphics = this.graphics;
    graphics.moveTo(point1.x, point1.y);
    graphics.lineTo(point2.x, point2.y);
    graphics.lineTo(point3.x, point3.y);
    graphics.strokeColor.fromHEX("#ff0000");
    graphics.stroke();
  }
  drawCircle() {
    // 已知三点在圆上，求圆心 和半径,绘制圆
    const a = point1.clone().subtract(point2);
    const b = point2.clone().subtract(point3);
    const c = a.clone().cross(b.clone());
    const d = a.clone().length();
    const e = b.clone().length();
    const f = c / (d * e);
    const point4 = new Vec2(f * point1.x, f * point1.y);
    const radius =
      Math.sin(Math.PI / 4) * point1.clone().subtract(point4.clone()).length();
    const graphics = this.graphics;
    graphics.strokeColor.fromHEX("#0000ff");
    graphics.circle(point4.x, point4.y, radius);
    graphics.stroke();
  }
}
