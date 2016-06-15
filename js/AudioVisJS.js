var audioVis = {
};  // Fancy namespace stuff.
(function()
{

	
	// Internal handle for 'this' within the current object's scope.
	
	var me = this;

	// Global Attributes
	
	this.canvasid;	
	this.canvas;
	this.playing = false;
	this.paused = false;
	this.stopped = true;
	
	me.url;
	me.ctx;
	me.audio;
	me.source;
	me.audioCtx;
	me.dataArray;
	me.bufferLength;
	me.analyser;
	
	// Callbacks

	this.callback_play;
	this.callback_pause;
	this.callback_stop;
	this.callback_next;
	this.callback_prev;
	this.callback_nextSong;
	this.callback_prevSong;

	var initialized = false;

	// Visualizer Settings
	
	this.settings = {
		"bgcolor": "#001b33"
		,"fgcolor": "#f1f1f1"
		,"fadeout_alpha": 0.3
		,"fftSize": 128
		,"width": 256
		,"height": 150
		,"bar_height": 150
		,"seek_speed": 5
	}

	this.play = function ()
	{
		if (!me.playing)
		{
			me.audio.play();

			me.playing = true;
			me.stopped = false;
			me.paused = false;

			if (me.callback_play != undefined && typeof me.callback_play == "function")
			{
				me.callback_play(me);
			}
		}
	}
	this.pause = function ()
	{
		if (me.playing)
		{
			me.audio.pause();

			me.playing = false;
			me.stopped = false;
			me.paused = true;

			if (me.callback_pause != undefined && typeof me.callback_pause == "function")
			{
				me.callback_pause(me);
			}
		}
	}
	this.toStart = function ()
	{
		me.audio.currentTime = 0;
	}
	this.toEnd = function ()
	{
		// Go to the end of the audio less 100 miliseconds.
		// This is so that if the song is paused and toEnd()
		// is called, the toNext() callback won't yet be
		// called.
		
		me.audio.currentTime = me.audio.duration - 0.1;
	}
	this.toNext = function ()
	{
		if (me.callback_next != undefined && typeof me.callback_next == "function")
		{
			me.callback_next(me);
		}
	}
	this.toPrev = function ()
	{
		if (me.callback_prev != undefined && typeof me.callback_prev == "function")
		{
			me.callback_prev(me);
		}
	}
	this.fastforward = function ()
	{
		me.audio.currentTime += me.settings.seek_speed;
	}
	this.rewind = function ()
	{
		me.audio.currentTime -= me.settings.seek_speed;
	}
	this.stop = function ()
	{
		if (me.playing || me.paused)
		{
			me.audio.pause();
			me.audio.currentTime = 0;

			me.playing = false;
			me.stopped = true;
			me.paused = false;

			if (me.callback_stop != undefined && typeof me.callback_stop == "function")
			{
				me.callback_stop(me);
			}
		}
	}
	
	// Getters and Setters
	
	this.getURL = function()
	{
		return me.url;
	}
	this.setURL = function(audio_url)
	{
		initialized = false;
		me.url = audio_url;
		me.audio.src = me.url;
	}
		
	this.drawVis = function ()
	{
		if (!me.analyser)
		{
			return;
		}
		if (!me.audio.paused || (me.audio.currentTime == 0 || me.audio.currentTime == me.audio.duration))
		{
			me.analyser.getByteFrequencyData(me.dataArray);
		}
	
		var bgcolor = me.settings.bgcolor;
	
		me.ctx.fillStyle = bgcolor;
		var g = me.ctx.globalAlpha;
		me.ctx.globalAlpha = me.settings.fadeout_alpha;
		me.ctx.fillRect(0, 0, me.settings.width, me.settings.height);
		me.ctx.globalAlpha = g;

		me.ctx.fillStyle = me.settings.fgcolor;
		var dx = 0;
		var step = me.settings.width / me.dataArray.length;
		var ratio = me.analyser.fftSize / me.settings.height;

		var ratioY;
		if (me.settings.height < 255)
		{
			ratioY = me.settings.height / 255; 
		}
		else
		{
			ratioY = 255 / me.settings.height;
		}
	
		for (var i = 0; i < me.dataArray.length; i++)
		{
			var offset = parseInt(me.dataArray[i] * ratioY);
			me.ctx.fillRect(dx, (me.settings.height) - offset, step, me.settings.bar_height);
			dx += step;
		}
		requestAnimationFrame(me.drawVis);
	}
	
	this.init = function(canvasid, audio_url)
	{
		if (!initialized)
		{
			this.canvasid = canvasid;
			
			me.url = audio_url;

			this.canvas = document.getElementById(canvasid);
						
			if (!this.canvas)
			{
				console.error("ERROR in AudioVisJS.js: Element Id '", canvasid, "' was not found in the DOM.");
			}
			else if (this.canvas.tagName.toUpperCase() != "CANVAS")
			{
				console.error("ERROR in AudioVisJS.js: Element Id '", canvasid, "' must be a <canvas> element, not a <" + this.canvas.tagName.toLowerCase() + "> element.");
			}
			else
			{
				
			
				me.audioCtx = new (window.webkitAudioContext || window.AudioContext)();
				me.ctx = this.canvas.getContext("2d");

				me.audio = new Audio();
				document.body.appendChild(me.audio);
				
				this.setURL(me.url);
				
				this.canvas.width = me.settings.width;
				this.canvas.style.width = me.settings.width;
				this.canvas.height = me.settings.height;
				this.canvas.style.height = me.settings.height;

				me.audio.addEventListener("canplay", function () {
					// Ready to play, enable any related audio controls.
					if (!initialized)
					{
						me.source = me.audioCtx.createMediaElementSource(me.audio); 

						me.analyser = me.audioCtx.createAnalyser();

						me.analyser.fftSize = me.settings.fftSize;
						me.bufferLength = me.analyser.frequencyBinCount;
						me.dataArray = new Uint8Array(me.bufferLength);

						me.source.connect(me.analyser);
						me.source.connect(me.audioCtx.destination);
						
						me.drawVis();
						
						initialized = true;
					}
					if (me.playing)
					{
						me.playing = true;
						me.stopped = false;
						me.paused = false;
						me.audio.play();
					}
				});
				me.audio.addEventListener("ended", function () {
					// Song has ended normally, call the toNext() function to trigger
					// any callbacks that the calling page may have already hooked up.
					
					me.toNext();
				});

			}
		}
	}
	
}).apply(audioVis);
