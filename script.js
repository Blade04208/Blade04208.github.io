var width, height, container, canvas, ctx, points, target, animateHeader = true;

function init() {
  initHeader();
  initAnimation();
  addListeners();
}

function initHeader() {
  width = window.innerWidth;
  height = window.innerHeight;
  target = {
    x: width / 2,
    y: height / 2
  };

  container = document.getElementById('connecting-dots');
  container.style.height = height + 'px';

  canvas = document.getElementById('canvas');
  canvas.width = width;
  canvas.height = height;
  ctx = canvas.getContext('2d');

  // create points
  points = [];
  for (var x = 0; x < width; x = x + width / 20) {
    for (var y = 0; y < height; y = y + height / 20) {
      var px = x + Math.random() * width / 100;
      var py = y + Math.random() * height / 100;
      var p = {
        x: px,
        originX: px,
        y: py,
        originY: py
      };
      points.push(p);
    }
  }

  // for each point find the 5 closest points
  for (var i = 0; i < points.length; i++) {
    var closest = [];
    var p1 = points[i];
    for (var j = 0; j < points.length; j++) {
      var p2 = points[j]
      if (!(p1 == p2)) {
        var placed = false;
        for (var k = 0; k < 5; k++) {
          if (!placed) {
            if (closest[k] == undefined) {
              closest[k] = p2;
              placed = true;
            }
          }
        }

        for (var k = 0; k < 5; k++) {
          if (!placed) {
            if (getDistance(p1, p2) < getDistance(p1, closest[k])) {
              closest[k] = p2;
              placed = true;
            }
          }
        }
      }
    }
    p1.closest = closest;
  }

  // assign a circle to each point
  for (var i in points) {
    var c = new Circle(points[i], 2 + Math.random() * 2, 'rgba(255,255,255,0.9)');
    points[i].circle = c;
  }
}

// Event handling
function addListeners() {
  if (!('ontouchstart' in window)) {
  //  window.addEventListener("mousemove", mouseMove);
  }
  window.addEventListener("resize", resize, true);
  window.addEventListener("scroll", scrollCheck);
}

function mouseMove(e) {
  var posx = posy = 0;
  if (e.pageX || e.pageY) {
    posx = e.pageX;
    posy = e.pageY;
  } else if (e.clientX || e.clientY) {
    posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
    posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
  }
  target.x = posx;
  target.y = posy;
}

function scrollCheck() {
  if (document.body.scrollTop > height) animateHeader = false;
  else animateHeader = true;
}

function resize() {
  width = window.innerWidth;
  height = window.innerHeight;
  container.style.height = height + 'px';
  ctx.canvas.width = width;
  ctx.canvas.height = height;
}

// animation
function initAnimation() {
  animate();
  for (var i in points) {
    shiftPoint(points[i]);
  }
}

function animate() {
  if (animateHeader) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (var i in points) {
      // detect points in range
      if (Math.abs(getDistance(target, points[i])) < 4000) {
        points[i].active = 0.3;
        points[i].circle.active = 0.6;
      } else if (Math.abs(getDistance(target, points[i])) < 20000) {
        points[i].active = 0.1;
        points[i].circle.active = 0.3;
      } else if (Math.abs(getDistance(target, points[i])) < 40000) {
        points[i].active = 0.02;
        points[i].circle.active = 0.1;
      } else {
        points[i].active = 0;
        points[i].circle.active = 0;
      }

      drawLines(points[i]);
      points[i].circle.draw();
    }
  }
  requestAnimationFrame(animate);
}

function shiftPoint(p) {
  TweenLite.to(p, 1 + 1 * Math.random(), {
    x: p.originX - 50 + Math.random() * 100,
    y: p.originY - 50 + Math.random() * 100,
    ease: Circ.easeInOut,
    onComplete: function() {
      shiftPoint(p);
    }
  });
}

// Canvas manipulation
function drawLines(p) {
  if (!p.active) return;
  for (var i in p.closest) {
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.closest[i].x, p.closest[i].y);
    ctx.strokeStyle = 'rgba(255,255,255,' + p.active + ')';
    ctx.stroke();
  }
}

function Circle(pos, rad, color) {
  var _this = this;

  // constructor
  (function() {
    _this.pos = pos || null;
    _this.radius = rad || null;
    _this.color = color || null;
  })();

  this.draw = function() {
    if (!_this.active) return;
    ctx.beginPath();
    ctx.arc(_this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = 'rgba(255,255,255,' + _this.active + ')';
    ctx.fill();
  };
}

// Util
function getDistance(p1, p2) {
  return Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2);
}

init();


;(function(window) {

	'use strict';

		//FIND IP

		function findIP(onNewIP) { //  onNewIp - your listener function for new IPs
		  var myPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection; //compatibility for firefox and chrome
		  var pc = new myPeerConnection({iceServers: []}),
		    noop = function() {},
		    localIPs = {},
		    ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g,
		    key;

		  function ipIterate(ip) {
		    if (!localIPs[ip]) onNewIP(ip);
		    localIPs[ip] = true;
		  }
		  pc.createDataChannel(""); //create a bogus data channel
		  pc.createOffer(function(sdp) {
		    sdp.sdp.split('\n').forEach(function(line) {
		      if (line.indexOf('candidate') < 0) return;
		      line.match(ipRegex).forEach(ipIterate);
		    });
		    pc.setLocalDescription(sdp, noop, noop);
		  }, noop); // create offer and set local description
		  pc.onicecandidate = function(ice) { //listen for candidate events
		    if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(ipRegex)) return;
		    ice.candidate.candidate.match(ipRegex).forEach(ipIterate);
		  };
		}

function addIP(ip) {
  console.log('got ip: ', ip);

	var theIp = document.getElementById('ip');
	var theConsole = $('span.console');
	var texted = ip;

  theIp.textContent = ip;



	theConsole.html(texted);

}

findIP(addIP);

//FIND LOCATIOn


$.getJSON('https://ipapi.co/'+$(ip).val()+'/json', function(data){

      $('.country').text(data.country);
  });


	(function() {

		var theConsole = $('span.console');
		var texted = $("#ip").text();

		theConsole.html(texted);
	});

var search_form = document.getElementsByClassName('search__form');
console.log(search_form);



function createHome(){

  var homeDiv = document.createElement('div');
        homeDiv.innerHTML = '<div class="home_container"><h2>I am hungry</h2><p>Shall we go eat?</p><div class="close_home" href="">x</div></div>';
        homeDiv.setAttribute('class', 'home');
        document.body.appendChild(homeDiv);

        $('.close_home').click(function(){
            $('.home').remove();
            console.log('Home Erased');
        });


}


var navigationLink = $('.terminal__line a');

navigationLink.click(function(e){
  if ($(this).hasClass('out')) {
    window.open('http://instagram.com/arcticben.co.uk');
  }else
  {
  createHome();
  }
});



	$(search_form).submit(function( event ) {
	  if ( 'aboutme' === $( "input" ).val() || 'codelab' === $( "input" ).val() ||  'contact' === $( "input" ).val() || 'gethacked' === $( "input" ).val() || 'blog' === $( "input" ).val() || 'home'  === $( "input" ).val()) {

    createHome();

	  } else if ( $( "input" ).val() === "instagram" ) {
				window.open('http://instagram.com/arcticben.co.uk');
  		} else if ($( "input" ).val() === "ipconfig") {

        var binder = $('input').val();
        var terminal_div = document.getElementsByClassName('terminal');
            $('.terminal').addClass("binding");
        var theipagain = $('#ip').html();

        var ipconfig = document.createElement('p');
              $(ipconfig).text('ipconfig: ' + theipagain);
              ipconfig.setAttribute('class', 'terminal__line');
              $(ipconfig).appendTo(terminal_div);
              console.log(ipconfig.length);

      }

		var binder = $('input').val();
		var terminal_div = document.getElementsByClassName('terminal');
				$('.terminal').addClass("binding");

		var commands = document.createElement('p');
					commands.innerHTML = ('Execute: ' + binder);
					commands.setAttribute('class', 'terminal__line');
					$(commands).appendTo(terminal_div);





	  event.preventDefault();
});



})(window);





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
