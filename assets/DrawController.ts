import {
  _decorator,
  Component,
  Node,
  Graphics,
  UITransform,
  Vec2,
  Vec3,
  input,
  Input,
  EventMouse,
  EventTouch,
} from "cc";
const { ccclass, property } = _decorator;

@ccclass("draw")
export class draw extends Component {
  @property(Graphics)
  graphics: Graphics = null;
  @property(UITransform)
  uiTransform: UITransform = null;
  isDown = false;

  pointStart = new Vec2();
  pointEnd = new Vec2();
  pointMove = new Vec2();

  start() {
    this.draw();
    this.drawCircle();
  }
  protected onEnable(): void {
    this.setEvent();
  }

  protected onDisable(): void {
    this.removeEvent();
  }
  setEvent() {
    input.on(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }
  removeEvent() {
    input.off(Input.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }
  onMouseDown(e: EventMouse) {
    this.isDown = true;
  }
  onTouchMove(e: EventTouch) {
    if (this.isDown) {
      const x = e.getUILocation().x;
      const y = e.getUILocation().y;
      const xx = this.uiTransform.convertToNodeSpaceAR(new Vec3(x, y, 0));
      this.pointMove = new Vec2(xx.x, xx.y);
      this.draw();
      this.drawCircle();
    }
  }
  onTouchEnd() {
    this.isDown = false;
  }
  draw() {
    const graphics = this.graphics;
    graphics.clear();
    graphics.moveTo(this.pointStart.x, this.pointStart.y);
    graphics.strokeColor.fromHEX("#ff0000");

    graphics.lineTo(this.pointEnd.x, this.pointEnd.y);
    graphics.stroke();
    graphics.moveTo(this.pointEnd.x, this.pointEnd.y);
    graphics.strokeColor.fromHEX("#00ff00");
    graphics.lineTo(this.pointMove.x, this.pointMove.y);
    graphics.stroke();
  }
  drawCircle() {
    const [X, Y, R] = this.getCenterAndRadius(
      this.pointStart,
      this.pointEnd,
      this.pointMove,
    );
    const graphics = this.graphics;
    graphics.strokeColor.fromHEX("#0000ff");
    graphics.circle(X, Y, R);
    graphics.stroke();
    console.log(this.getArcLength(this.pointStart, this.pointEnd, X, Y, R));
  }
  getCenterAndRadius(pointStart, pointEnd, pointMove) {
    let x1, y1, x2, y2, x3, y3;
    let a, b, c, g, e, f;
    x1 = pointStart.x;
    y1 = pointStart.y;
    x2 = pointEnd.x;
    y2 = pointEnd.y;
    x3 = pointMove.x;
    y3 = pointMove.y;
    e = 2 * (x2 - x1);
    f = 2 * (y2 - y1);
    g = x2 * x2 - x1 * x1 + y2 * y2 - y1 * y1;
    a = 2 * (x3 - x2);
    b = 2 * (y3 - y2);
    c = x3 * x3 - x2 * x2 + y3 * y3 - y2 * y2;
    let X, Y, R;
    X = (g * b - c * f) / (e * b - a * f);
    Y = (a * g - c * e) / (a * f - b * e);
    R = Math.sqrt((X - x1) * (X - x1) + (Y - y1) * (Y - y1));
    /*  */
    this.graphics.circle(X, Y, 2);
    this.graphics.fillColor.fromHEX("#ff0000");
    this.graphics.fill();
    this.graphics.moveTo(X, Y);
    this.graphics.lineTo(pointStart.x, pointStart.y);
    this.graphics.moveTo(X, Y);
    this.graphics.lineTo(pointEnd.x, pointEnd.y);
    this.graphics.strokeColor.fromHEX("#ecf11c");
    this.graphics.stroke();
    /*  */
    return [X, Y, R];
  }

  getArcLength(poi1: Vec2, poi2: Vec2, X, Y, R) {
    const distance = Vec2.distance(poi1, poi2);
    const distanceHalf = distance / 2; // 一条边的长
    const radianHalf = Math.acos(distanceHalf / R); // 一条边的弧度
    const radian = 2 * radianHalf; // 两条边的弧度
    const angle = (radian * 180) / Math.PI; // 弧度转角度
    return {
      angle,
      radian,
      distance,
    };
  }
}
