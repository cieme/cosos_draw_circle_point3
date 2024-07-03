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
  @property(Node)
  startNode: Node = null;
  @property(Node)
  endNode: Node = null;
  @property(UITransform)
  uiTransform: UITransform = null;
  isDown = false;

  pointStart = new Vec2(90, 10);
  pointEnd = new Vec2(-180, -30);
  pointMove = new Vec2(-30, 100);

  onLoad() {
    this.startNode.position.set(this.pointStart.x, this.pointStart.y);
    this.endNode.position.set(this.pointEnd.x, this.pointEnd.y);
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
    this.startNode.on("drag", this.onStartMove, this);
    this.endNode.on("drag", this.onEndMove, this);
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
  onStartMove(e: Vec3) {
    this.pointStart = new Vec2(e.x, e.y);
    this.runCode();
  }
  onEndMove(e: Vec3) {
    this.pointEnd = new Vec2(e.x, e.y);
    this.runCode();
  }
  onMouseDown(e: EventMouse) {
    if (e.getButton() == EventMouse.BUTTON_LEFT) {
      this.isDown = true;
    }
  }
  onTouchMove(e: EventTouch) {
    if (this.isDown) {
      const x = e.getUILocation().x;
      const y = e.getUILocation().y;
      const xx = this.uiTransform.convertToNodeSpaceAR(new Vec3(x, y, 0));
      this.pointMove = new Vec2(xx.x, xx.y);
      this.runCode();
    }
  }
  runCode() {
    this.draw();
    this.drawCircle();
    console.log(
      this.getDirection(this.pointStart, this.pointEnd, this.pointMove),
    );
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
    this.graphics.circle(x1, y1, 4);
    this.graphics.fillColor.fromHEX("#ff0000");
    this.graphics.fill();
    this.graphics.circle(X, Y, 4);
    this.graphics.fillColor.fromHEX("#B946F0");
    this.graphics.fill();
    this.graphics.circle(pointMove.x, pointMove.y, 4);
    this.graphics.fillColor.fromHEX("#00FF00");
    this.graphics.fill();
    /*  */
    this.graphics.moveTo(X, Y);
    this.graphics.lineTo(pointStart.x, pointStart.y);
    this.graphics.moveTo(X, Y);
    this.graphics.lineTo(pointEnd.x, pointEnd.y);
    this.graphics.strokeColor.fromHEX("#ecf11c");
    this.graphics.stroke();

    /*  */
    return [X, Y, R];
  }

  getArcLength(
    pointStart: Vec2,
    pointEnd: Vec2,
    X: number,
    Y: number,
    R: number,
  ) {
    const distance = Vec2.distance(pointStart, pointEnd);
    const distanceHalf = distance / 2; // 一条边的长
    const radianHalf = Math.acos(distanceHalf / R); // 一条边的弧度
    const radian = 2 * radianHalf; // 两条边的弧度
    const angle = (radian * 180) / Math.PI; // 弧度转角度
    const L = R * radian; // 弧长L 不太对，似乎要判断正负
    return {
      angle,
      radian,
      distance,
      L,
    };
  }
  // 判断方向，向上还是向下
  getDirection(pointStart: Vec2, pointEnd: Vec2, pointMove: Vec2) {
    const k = (pointEnd.y - pointStart.y) / (pointEnd.x - pointStart.x); // 以y轴为基准，计算斜率 （）
    const b = pointStart.y - k * pointStart.x;
    const y = pointMove.y;
    const x = pointMove.x;
    const result = y - k * x - b;
    return result < 0 ? "down" : "up";
  }
}
