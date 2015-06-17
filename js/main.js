Array.prototype.fill = function(value) {
	if (this == null) {
	  throw new TypeError('this is null or not defined');
	}
	var O = Object(this);
	var len = O.length >>> 0;
	var start = arguments[1];
	var relativeStart = start >> 0;
	var k = relativeStart < 0 ?
	  Math.max(len + relativeStart, 0) :
	  Math.min(relativeStart, len);
	var end = arguments[2];
	var relativeEnd = end === undefined ?
	  len : end >> 0;
	var final = relativeEnd < 0 ?
	  Math.max(len + relativeEnd, 0) :
	  Math.min(relativeEnd, len);
	while (k < final) {
	  O[k] = value;
	  k++;
	}
	return O;
};

function Miner(width, height, bombs) {
	this.width = width;
	this.height = height;
	this.bombs = bombs;
	this.plate = [];
	this.sec = 0;
	this.mins = 0;
	this.closed = width * height;
	var tmp;
	for(var i = 0; i < height; i++) {
		tmp = new Array(width);
		tmp.fill('');
		this.plate.push(tmp);
	}
	window.addEventListener('resize', function() {
			var height = document.getElementById('plate').offsetWidth / width + 'px';
			[].forEach.call(document.querySelectorAll('td'), function(value) {
				value.style.height = height;
			});
		});
	this.render();
	this._generateBombs(bombs);
	this.timer;
}

Miner.prototype._generateBombs = function(count) {
	var plate = this.plate;

	var width = this.width;
	var height = this.height;
	var i, j, x, y, w, h;

	var given = [];
	for(i = 0; i < height; i++) {
		for(j = 0; j < width; j++) {
			given.push({x: j, y: i});
		}
	}
	for(i = 0; i < count; i++) {
		j = Math.floor(Math.random() * given.length);
		x = given[j].x;
		y = given[j].y;
		plate[y][x] = 'b';
		for(h = -1; h <= 1; h++) {
			for (w = -1; w <= 1; w++) {
				if(y + h >= 0 && y + h < height && x + w >= 0 && x + w < width && plate[y + h][x + w] != 'b') {
					plate[y + h][x + w]++;
				}
			};
		}
		given.splice(j, 1);
	}
	this.plate = plate;
};

Miner.prototype.render = function() {
	var tr, td,
		table = document.getElementById('plate'),
		width = this.width,
		height = table.offsetWidth / width + 'px',
		bombs = this.bombs,
		i, j, that = this;
	table.innerHTML = "";
	document.getElementById('bomb_count').innerText = bombs;
	i = 0;
	this.plate.forEach(function(value) {
		tr = document.createElement("tr");
		j = 0;
		value.forEach(function(value) {
			td = document.createElement('td');
			td.style.height = height;
			td.innerText = " ";
			td.setAttribute("x", j);
			td.setAttribute("y", i);
			td.setAttribute('width', (100 / that.width) + '%');
			tr.appendChild(td);
			j++;
		});
		table.appendChild(tr);
		i++;
	});
};

Miner.prototype.time = function() {
	this.sec++;
	if (this.sec / 60 >= 1) {
		this.mins++;
	}
	this.sec = this.sec % 60;
	document.getElementById('curr_time').innerText = (this.mins < 10 ? "0" : "") + this.mins + ":" + (this.sec < 10 ? "0" : "") + this.sec;
};

var game;

function newGame(width, height, bombs) {
	document.getElementById('plate').onclick = open;
	document.getElementById('plate').oncontextmenu = function(event) {
		event = event || window.event;
    	event.cancelBubble = true;
    	var target = event.target;
		if (event.preventDefault) {
			event.preventDefault();
		}
		else {
			event.returnValue= false;
		}
		if(target.classList.contains('selected')) {
			return;
		}
		if(target.classList.contains('flag')) {
			target.classList.remove('flag');
			document.getElementById('bomb_count').innerText -= -1;
		}
		else {
			target.classList.add('flag');
			document.getElementById('bomb_count').innerText -= 1;
		}
		return false
	}
	if(game) {
		if(game.timer){
			clearInterval(game.timer);
		}
	}
	game = new Miner(width, height, bombs);
	document.getElementById('curr_time').innerText = "00:00";
	game.timer = setInterval('game.time()', 1000);
}

function open(event) {
	var target = event.target;
	var width = game.width;
	var height = game.height;
	if(target.classList.length != 0) {
		return;
	}
	var x = parseInt(target.getAttribute('x')),
		y = parseInt(target.getAttribute('y')),
		i, j;
	game.closed--;
	if(game.closed <= game.bombs) {
		alert("You win!!!");
		clearInterval(game.timer);
		document.getElementById('plate').onclick = null;
		document.getElementById('plate').oncontextmenu = null;
	}
	if(game.plate[y][x] != 'b') {
		target.classList.add('selected');
		target.innerText = game.plate[y][x];
		if(game.plate[y][x] == '') {
			for(i = -1; i <= 1; i++) {
				for (j = -1; j <= 1; j++) {
					if(y + i >= 0 && y + i < height && x + j >= 0 && x + j < width) {
						open({target: document.querySelector("td[x='" + (x + j) + "'][y='" + (y + i) + "']")});
					}
				};
			}
		}
	}
	else {
		alert("BOOOOOOOOOMB!!!!!!!!");
		clearInterval(game.timer);
		document.getElementById('plate').onclick = null;
		document.getElementById('plate').oncontextmenu = null;
		for(i = 0; i < game.height; i++) {
			for (j = 0; j < game.width; j++) {
				if(game.plate[i][j] == 'b') {
					document.querySelector("td[x='" + j + "'][y='" + i + "']").classList.add('bomba');
				}
			};
		}
	}
};

window.onload = function() {
	newGame(9, 9, 10);
	document.getElementById("new").onclick = function() {
		newGame(game.width, game.height, game.bombs);
	}
	document.getElementById("edit").onclick = function() {
		document.getElementById("set").style.display = 'block';
	}
	document.getElementById("set").onclick = function(event) {
		var target = event.target;
		switch(target.id) {
			case 'cancel':
				this.style.display = null;
				break;
			case 'ok':
				var level = document.querySelector("input:checked");
				switch(level.value) {
					case 'easy':
						newGame(9, 9, 10);
						this.style.display = null;
						break;
					case 'hard':
						newGame(16, 16, 40);
						this.style.display = null;
						break;
					case 'professional':
						newGame(16, 30, 99);
						this.style.display = null;
						break;
					case 'custom':
						var w = parseInt(document.getElementById('custom_width').value),
							h = parseInt(document.getElementById('custom_height').value),
							b = parseInt(document.getElementById('custom_bomb').value);
						if(!(w >= 9 && w <=24)) {
							alert("Width should be in interval from 9 to 24");
							return;
						}
						if(!(h >= 9 && h <=30)) {
							alert("Height should be in interval from 9 to 24");
							return;
						}
						if(!(b >= 10 && b <=668)) {
							alert("Bombs should be in interval from 10 to 668");
							return;
						}
						if(b >= w * h) {
							alert("Uncurrect bomb count");
							return;
						}
						newGame(w, h, b);
						this.style.display = null;
						break;
				}
				break;
		}
	}
}

