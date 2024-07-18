import { prepareRunChecker } from "../utils/utils";

const { shouldRun: scrollShouldRun } = prepareRunChecker({ timerDelay: 200 });
const { shouldRun: clickShouldRun } = prepareRunChecker({ timerDelay: 1000 });
export default class HandGestureController {
  #view;
  #service;
  #camera;
  #lastDirection = {
    direction: "",
    y: 0,
  };
  constructor({ view, service, camera }) {
    this.#view = view;
    this.#service = service;
    this.#camera = camera;
  }

  async init() {
    await this.#service.initializeDetector();
    await this.#loop();
    return this;
  }

  #scrollPage(direction) {
    const scrollSpeed = 100;
    const maxTop = 0;
    const maxBottom = window.innerHeight * 3;
    const shouldLockScrollDown =
      direction === "scroll-down" &&
      this.#lastDirection.y + scrollSpeed > maxBottom;
    const shouldLockScrollTop =
      direction === "scroll-up" && this.#lastDirection.y - scrollSpeed < maxTop;
    if (this.#lastDirection.direction === direction) {
      if (shouldLockScrollTop || shouldLockScrollDown) return;
      this.#lastDirection.y +=
        direction === "scroll-down" ? scrollSpeed : scrollSpeed * -1;
    } else {
      this.#lastDirection.direction = direction;
    }
    this.#view.scrollPage(this.#lastDirection.y);
  }

  async #estimateHands() {
    try {
      const hands = await this.#service.estimateHands(this.#camera.video);
      this.#view.clearCanvas();
      if (hands?.length) this.#view.drawHands(hands);
      for await (const { event, x, y } of this.#service.detectGestures(hands)) {
        if (event.includes("scroll")) {
          if (!scrollShouldRun()) continue;
          this.#scrollPage(event);
        }
        if (event.includes("click")) {
          if (!clickShouldRun()) continue;
          this.#view.clickOnElement(x, y);
        }
      }
      return hands;
    } catch (error) {
      console.log("something went wrong", { error });
      return 0;
    }
  }

  async #loop() {
    await this.#service.initializeDetector();
    await this.#estimateHands();
    this.#view.loop(this.#loop.bind(this));
  }

  static async initialize(deps) {
    const controller = new HandGestureController(deps);
    return controller.init();
  }
}