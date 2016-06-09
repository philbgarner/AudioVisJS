var audioVis = {
};
(function()
{

	// Global Attributes
	
	this.canvasid;	
	this.canvas;
	this.playing = false;
	this.paused = false;
	this.stopped = true;
	
	this.analyser;
	
	// Callbacks

	this.callback;
	this.callback_play;
	this.callback_pause;
	this.callback_stop;
	this.callback_next;
	this.callback_prev;
	this.callback_nextSong;
	this.callback_prevSong;

	
	// Internal handle for 'this' within the current object's scope.
	
	var me = this;
	
	// Private Attributes
	
	var url;
	var ctx;
	var audio;
	var source;
	var audioCtx;
	var dataArray;
	var bufferLength;
	
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
			audio.play();

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
			audio.pause();

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
		audio.currentTime = 0;
	}
	this.toEnd = function ()
	{
		// Go to the end of the audio less 100 miliseconds.
		// This is so that if the song is paused and toEnd()
		// is called, the toNext() callback won't yet be
		// called.
		
		audio.currentTime = audio.duration - 0.1;
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
		audio.currentTime += me.settings.seek_speed;
	}
	this.rewind = function ()
	{
		audio.currentTime -= me.settings.seek_speed;
	}
	this.stop = function ()
	{
		if (me.playing || me.paused)
		{
			audio.pause();
			audio.currentTime = 0;

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
		return url;
	}
	this.setURL = function(audio_url)
	{
		initialized = false;
		url = audio_url;
		audio.src = url;
	}
		
	this.drawVis = function ()
	{
		if (!me.analyser)
		{
			return;
		}
		if (!audio.paused || (audio.currentTime == 0 || audio.currentTime == audio.duration))
		{
			me.analyser.getByteFrequencyData(dataArray);
		}
	
		var bgcolor = me.settings.bgcolor;
	
		ctx.fillStyle = bgcolor;
		var g = ctx.globalAlpha;
		ctx.globalAlpha = me.settings.fadeout_alpha;
		ctx.fillRect(0, 0, me.settings.width, me.settings.height);
		ctx.globalAlpha = g;

		ctx.fillStyle = me.settings.fgcolor;
		var dx = 0;
		var step = me.settings.width / dataArray.length;
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
	
		for (var i = 0; i < dataArray.length; i++)
		{
			var offset = parseInt(dataArray[i] * ratioY);
			ctx.fillRect(dx, (me.settings.height) - offset, step, me.settings.bar_height);
			dx += step;
		}
		requestAnimationFrame(me.drawVis);
	}
	
	this.init = function(canvasid, audio_url)
	{
		if (!initialized)
		{
			this.canvasid = canvasid;
			url = audio_url;

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
				
			
				audioCtx = new (window.webkitAudioContext || window.AudioContext)();
				ctx = this.canvas.getContext("2d");

				audio = new Audio();
				
				this.setURL(url);
				
				this.canvas.width = me.settings.width;
				this.canvas.style.width = me.settings.width;
				this.canvas.height = me.settings.height;
				this.canvas.style.height = me.settings.height;

				audio.addEventListener("canplay", function () {
					// Ready to play, enable any related audio controls.

					if (!initialized && me.analyser == undefined)
					{
						source = audioCtx.createMediaElementSource(audio); 
						
						me.analyser = audioCtx.createAnalyser();

						me.analyser.fftSize = me.settings.fftSize;
						bufferLength = me.analyser.frequencyBinCount;
						dataArray = new Uint8Array(bufferLength);
		
						source.connect(me.analyser);
						source.connect(audioCtx.destination);
						
						me.drawVis();
					}
					if (me.playing)
					{
						me.playing = true;
						me.stopped = false;
						me.paused = false;
						audio.play();
					}
				});
				audio.addEventListener("ended", function () {
					// Song has ended normally, call the toNext() function to trigger
					// any callbacks that the calling page may have already hooked up.
					
					me.toNext();
				});

			}
		}
	}
	
}).apply(audioVis);
