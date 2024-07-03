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

@ccclass("DragCcontroller")
export class DragCcontroller extends Component {
  isDown = false;
  protected onEnable(): void {
    this.setEvent();
  }

  protected onDisable(): void {
    this.removeEvent();
  }
  setEvent() {
    this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.on(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }
  removeEvent() {
    this.node.on(Node.EventType.MOUSE_DOWN, this.onMouseDown, this);
    input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
    input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    input.off(Input.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
  }
  onMouseDown(e: EventMouse) {
    this.isDown = true;
  }
  onTouchMove(e: EventTouch) {
    if (this.isDown) {
      const { x, y } = e.getUIDelta();
      const position = this.node.position;
      this.node.position = new Vec3(position.x + x, position.y + y, 0);
      this.node.emit("drag", this.node.position);
    }
  }
  onTouchEnd() {
    this.isDown = false;
  }
}
