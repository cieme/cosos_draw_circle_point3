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

@ccclass("DrawController")
export class DrawController extends Component {
  @property(Graphics)
  graphics: Graphics = null;
  @property(Node)
  startNode: Node = null;
  @property(Node)
  endNode: Node = null;
  @property(UITransform)
  uiTransform: UITransform = null;
  isDown = false;

  pointStart = new Vec2(90, -100);
  pointEnd = new Vec2(90, 100);
  pointMove = new Vec2(50, 150);

  onLoad() {
    this.startNode.position.set(this.pointStart.x, this.pointStart.y);
    this.endNode.position.set(this.pointEnd.x, this.pointEnd.y);
    this.runCode();
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
      const localPos = this.uiTransform.convertToNodeSpaceAR(new Vec3(x, y, 0));
      this.pointMove = new Vec2(localPos.x, localPos.y);
      this.runCode();
    }
  }

  onTouchEnd() {
    this.isDown = false;
  }

  runCode() {
    this.draw();
    this.drawCircle();
  }
  /**
   * 绘制
   * @author cieme
   * @date 2024-07-04
   * @returns {any}
   */
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
  /**
   * 绘制圆
   * @author cieme
   * @date 2024-07-04
   * @returns {any}
   */
  drawCircle() {
    const [X, Y, R] = this.getCenterAndRadius(
      this.pointStart,
      this.pointEnd,
      this.pointMove,
    );
    const graphics = this.graphics;
    graphics.strokeColor.fromHEX("#0000ff");
    const radian = this.getRadianByPointAndCenter(
      this.pointStart,
      new Vec2(X, Y),
    );
    const radian2 = this.getRadianByPointAndCenter(
      this.pointEnd,
      new Vec2(X, Y),
    );
    const quadrant = this.getQuadrant(
      this.pointStart,
      this.pointEnd,
      this.pointMove,
    );
    const k = this.getSlope(this.pointStart, this.pointEnd);
    let counterclockwise = true;
    if (k === Infinity) {
      counterclockwise = quadrant === 1 || quadrant === 4 ? true : false;
    } else if (k === -Infinity) {
      counterclockwise = quadrant === 2 || quadrant === 3 ? true : false;
    } else {
      counterclockwise = quadrant === 1 || quadrant === 2 ? true : false;
    }

    graphics.arc(X, Y, R, radian, radian2, counterclockwise); // false代表顺时针
    graphics.stroke();

    // console.log(this.getArcLength(this.pointStart, this.pointEnd, R));
  }
  /**
   * 计算中心点和半径
   * @author cieme
   * @date 2024-07-04
   * @param {any} pointStart
   * @param {any} pointEnd
   * @param {any} pointMove
   * @returns {any}
   */
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

  /**
   * 获取弧长
   * @author cieme
   * @date 2024-07-04
   * @param {any} pointStart:Vec2
   * @param {any} pointEnd:Vec2
   * @param {any} R:number
   * @returns {any}
   */
  getArcLength(pointStart: Vec2, pointEnd: Vec2, R: number) {
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
  /**
   * 根据中心建立直角坐标系,求其夹角
   * @author cieme
   * @date 2024-07-03
   * @param {any} point
   * @param {any} center
   * @returns {any}
   */
  getRadianByPointAndCenter(point, center) {
    const x = point.x - center.x;
    const y = point.y - center.y;
    return Math.atan2(y, x);
  }
  /**
   * 判断象限
   * @author cieme
   * @date 2024-07-04
   * @param {any} pointStart:Vec2
   * @param {any} pointEnd:Vec2
   * @param {any} pointMove:Vec2
   * @returns {any}
   */
  getQuadrant(pointStart: Vec2, pointEnd: Vec2, pointMove: Vec2) {
    const k = this.getSlope(pointStart, pointEnd);

    let quadrant: 1 | 2 | 3 | 4 = 1;
    // 为垂线
    if (k === Infinity) {
      if (pointMove.x - pointStart.x > 0 && pointMove.y - pointStart.y > 0) {
        quadrant = 1; //1
      } else if (
        pointMove.x - pointStart.x < 0 &&
        pointMove.y - pointStart.y > 0
      ) {
        quadrant = 2; // 2
      } else if (
        pointMove.x - pointStart.x < 0 &&
        pointMove.y - pointStart.y < 0
      ) {
        quadrant = 3; //3
      } else {
        quadrant = 4; //4
      }

      return quadrant;
    } else if (k === -Infinity) {
      if (pointMove.x - pointStart.x > 0 && pointMove.y - pointStart.y > 0) {
        quadrant = 1; // 1
      } else if (
        pointMove.x - pointStart.x < 0 &&
        pointMove.y - pointStart.y > 0
      ) {
        quadrant = 2; // 2
      } else if (
        pointMove.x - pointStart.x < 0 &&
        pointMove.y - pointStart.y < 0
      ) {
        quadrant = 3; // 3
      } else {
        quadrant = 4; // 4
      }
      return quadrant;
    }
    const b = pointStart.y - k * pointStart.x;

    const resultY = pointMove.y - k * pointMove.x - b;
    const resultX = pointMove.x - (pointMove.y - b) / k;
    // 判断在哪个象限

    if (pointStart.x > pointEnd.x) {
      if (resultY > 0) {
        quadrant = 2;
      } else {
        quadrant = 3;
      }
    }
    if (pointStart.x < pointEnd.x) {
      if (resultY > 0) {
        quadrant = 4;
      } else {
        quadrant = 1;
      }
    }
    return quadrant;
  }
  /**
   * 获取斜率
   * @author cieme
   * @date 2024-07-04
   * @param {any} pointStart
   * @param {any} pointEnd
   * @returns {any}
   */
  getSlope(pointStart, pointEnd) {
    const k = (pointEnd.y - pointStart.y) / (pointEnd.x - pointStart.x); // 以y轴为基准，计算斜率 （）
    return k;
  }
  /**
   * 获取两点中心
   * @author cieme
   * @date 2024-07-04
   * @param {any} pointStart:Vec2
   * @param {any} pointEnd:Vec2
   * @returns {any}
   */
  getCenter(pointStart: Vec2, pointEnd: Vec2) {
    const x = (pointStart.x + pointEnd.x) / 2;
    const y = (pointStart.y + pointEnd.y) / 2;
    return new Vec2(x, y);
  }
}
