// Inspired By
// https://codepen.io/abeatrize/pen/LJqYey

// Bongo Cat originally created by @StrayRogue and @DitzyFlama

const ID = "bongo-cat";
const s = (selector: string) => `#${ID} ${selector}`;
const notes = document.querySelectorAll(".note");

for (let note of notes) {
  note?.parentElement?.appendChild(note.cloneNode(true));
  note?.parentElement?.appendChild(note.cloneNode(true));
}

const music = { note: s(".music .note") };
const cat = {
  pawRight: {
    up: s(".paw-right .up"),
    down: s(".paw-right .down"),
  },
  pawLeft: {
    up: s(".paw-left .up"),
    down: s(".paw-left .down"),
  },
};

const style = getComputedStyle(document.documentElement);

const green = style.getPropertyValue("--green");
const pink = style.getPropertyValue("--pink");
const blue = style.getPropertyValue("--blue");
const orange = style.getPropertyValue("--orange");
const cyan = style.getPropertyValue("--cyan");

gsap.set(music.note, { scale: 0, autoAlpha: 1 });

const animatePawState = (selector: string) =>
  gsap.fromTo(
    selector,
    { autoAlpha: 0 },
    {
      autoAlpha: 1,
      duration: 0.01,
      repeatDelay: 0.19,
      yoyo: true,
      repeat: -1,
    }
  );

const tl = gsap.timeline();

tl.add(animatePawState(cat.pawLeft.up), "start")
  .add(animatePawState(cat.pawRight.down), "start")
  .add(animatePawState(cat.pawLeft.down), "start+=0.19")
  .add(animatePawState(cat.pawRight.up), "start+=0.19")
  .timeScale(1.6);

gsap.from(".terminal-code line", {
  drawSVG: "0%",
  duration: 0.1,
  stagger: 0.1,
  ease: "none",
  repeat: -1,
});

// typing for pipe function doesn't seem to be working for usage when partially applied?
const noteElFn: Function = gsap.utils.pipe(gsap.utils.toArray, gsap.utils.shuffle);
const noteEls: HTMLElement[] = noteElFn(music.note);

const numNotes = noteEls.length / 3;
const notesG1 = noteEls.splice(0, numNotes);
const notesG2 = noteEls.splice(0, numNotes);
const notesG3 = noteEls;

const colorizer = gsap.utils.random([green, pink, blue, orange, cyan, "#a3a4ec", "#67b5c0", "#fd7c6e"], true);
const rotator = gsap.utils.random(-50, 50, 1, true);
const dir = (amt: number) => `${gsap.utils.random(["-", "+"])}=${amt}`;

const animateNotes = (els: HTMLElement[]): GSAPTween => {
  els.forEach((el) => {
    gsap.set(el, {
      stroke: colorizer(),
      rotation: rotator(),
      x: gsap.utils.random(-25, 25, 1),
    });
  });

  return gsap.fromTo(
    els,
    {
      autoAlpha: 1,
      y: 0,
      scale: 0,
    },
    {
      duration: 2,
      autoAlpha: 0,
      scale: 1,
      ease: "none",
      stagger: {
        from: "random",
        each: 0.5,
      },
      rotation: dir(gsap.utils.random(20, 30, 1)),
      x: dir(gsap.utils.random(40, 60, 1)),
      y: gsap.utils.random(-200, -220, 1),
      onComplete: () => animateNotes(els),
    }
  );
};

tl.add(animateNotes(notesG1)).add(animateNotes(notesG2), ">0.05").add(animateNotes(notesG3), ">0.25");





//  .o88b. db    db d8888b. .d8888.  .d88b.  d8888b. 
// d8P  Y8 88    88 88  `8D 88'  YP .8P  Y8. 88  `8D 
// 8P      88    88 88oobY' `8bo.   88    88 88oobY' 
// 8b      88    88 88`8b     `Y8b. 88    88 88`8b   
// Y8b  d8 88b  d88 88 `88. db   8D `8b  d8' 88 `88. 
// ` Y88P' ~Y8888P' 88   YD `8888Y'  `Y88P'  88   YD 



class ArrowPointer {
  constructor() {
    this.root = document.body
    this.cursor = document.querySelector(".curzr")

    this.position = {
      distanceX: 0, 
      distanceY: 0,
      distance: 0,
      pointerX: 0,
      pointerY: 0,
    },
    this.previousPointerX = 0
    this.previousPointerY = 0
    this.angle = 0
    this.previousAngle = 0
    this.angleDisplace = 0
    this.degrees = 57.296
    this.cursorSize = 20

    this.cursorStyle = {
      boxSizing: 'border-box',
      position: 'fixed',
      top: '0px',
      left: `${ -this.cursorSize / 2 }px`,
      zIndex: '2147483647',
      width: `${ this.cursorSize }px`,
      height: `${ this.cursorSize }px`,
      transition: '250ms, transform 100ms',
      userSelect: 'none',
      pointerEvents: 'none'
    }

    this.init(this.cursor, this.cursorStyle)
  }

  init(el, style) {
    Object.assign(el.style, style)
    this.cursor.removeAttribute("hidden")
    
    document.body.style.cursor = 'none'
    document.body.querySelectorAll("button, label, input, textarea, select, a").forEach((el) => {
      el.style.cursor = 'inherit'
    })
  }

  move(event) {
    this.previousPointerX = this.position.pointerX
    this.previousPointerY = this.position.pointerY
    this.position.pointerX = event.pageX + this.root.getBoundingClientRect().x
    this.position.pointerY = event.pageY + this.root.getBoundingClientRect().y
    this.position.distanceX = this.previousPointerX - this.position.pointerX
    this.position.distanceY = this.previousPointerY - this.position.pointerY
    this.distance = Math.sqrt(this.position.distanceY ** 2 + this.position.distanceX ** 2)
  
    this.cursor.style.transform = `translate3d(${this.position.pointerX}px, ${this.position.pointerY}px, 0)`

    if (this.distance > 1) {
      this.rotate(this.position)
    } else {
      this.cursor.style.transform += ` rotate(${this.angleDisplace}deg)`
    }
  }

  rotate(position) {
    let unsortedAngle = Math.atan(Math.abs(position.distanceY) / Math.abs(position.distanceX)) * this.degrees
    let modAngle
    const style = this.cursor.style
    this.previousAngle = this.angle

    if (position.distanceX <= 0 && position.distanceY >= 0) {
      this.angle = 90 - unsortedAngle + 0
    } else if (position.distanceX < 0 && position.distanceY < 0) {
      this.angle = unsortedAngle + 90
    } else if (position.distanceX >= 0 && position.distanceY <= 0) {
      this.angle = 90 - unsortedAngle + 180
    } else if (position.distanceX > 0 && position.distanceY > 0) {
      this.angle = unsortedAngle + 270
    }

    if (isNaN(this.angle)) {
      this.angle = this.previousAngle
    } else {
      if (this.angle - this.previousAngle <= -270) {
        this.angleDisplace += 360 + this.angle - this.previousAngle
      } else if (this.angle - this.previousAngle >= 270) {
        this.angleDisplace += this.angle - this.previousAngle - 360
      } else {
        this.angleDisplace += this.angle - this.previousAngle
      }
    }
    style.transform += ` rotate(${this.angleDisplace}deg)`

    setTimeout(() => {
      modAngle = this.angleDisplace >= 0 ? this.angleDisplace % 360 : 360 + this.angleDisplace % 360
      if (modAngle >= 45 && modAngle < 135) {
        style.left = `${ -this.cursorSize }px`
        style.top = `${ -this.cursorSize / 2 }px`
      } else if (modAngle >= 135 && modAngle < 225) {
        style.left = `${ -this.cursorSize / 2 }px`
        style.top = `${ -this.cursorSize }px`
      } else if (modAngle >= 225 && modAngle < 315) {
        style.left = '0px'
        style.top = `${ -this.cursorSize / 2 }px`
      } else {
        style.left = `${ -this.cursorSize / 2 }px`
        style.top = '0px'
      }
    }, 0)
  }

  remove() {
    this.cursor.remove()
  }
}

(() => {
  const cursor = new ArrowPointer()
  if(!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {    
    document.onmousemove = function (event) {
      cursor.move(event)
    }
  } else {
    cursor.remove()
  }
})()
