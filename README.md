# HTML5 Audio Visualizer

This is a small JavaScript library that you can include in an HTML page
with a <canvas> tag to produce a "WinAmp" style audio visualization
effect.

## Library

Copy the AudioVisJS.js to your project's folder and then include it like
this:

    <script src="js/AudioVisJS.js"></script>
    
Then, initialize it in your page's onload() function ( $(document).ready()
if you're using jQuery) passing the <canvas> element's id attribute and the
url of the audio file you want to load:

    audioVis.init("audiovis", "audio/song1.mp3");
    
The library will create a new audio element and load the URL specified.  When
that URL loads, an audio context will be created that takes that URL as a source
and hooks it up to an audio analyser.

The analyser is used every browser refresh frame to draw the visualizer bars'
height according to the intensity of each freaquency for that audio frame.

### Settings Object

You can access some visualizer settings in the settings object:

    console.log(audioVis.settings);
    
That command will list the controls.
    
    { bgcolor: "#001b33", fgcolor: "#f1f1f1", fadeout_alpha: 0.3, fftSize: 128, width: 256, height: 150, bar_height: 150, seek_speed: 5 }

- bgcolor / fgcolor

Fairly self-explanatory, I think.

- fadeout_alpha

This property lets you control how translucent the background colour clear will be each frame. Leaving it a little bit translucent gives
the visualization a little bit of blurrienes by 'preserving' a bit of the last frame.  Value ranges from 0.0 to 1.0.

- fftSize

Fast Fourier Transform Size specifies the length of the sample we want from the audio file.  It is represented as an array of UInt8 variables
(between 0 and 255) and the length of the array is set by fftSize.

Must be set prior to audioVis.init(), shouldn'y affect anything if you change it on the fly (untested).

- width / height

Sets both the HTML attribute versions of the width and height and CSS versions so that it's scaled properly (no stretching).  Changing after
init() shouldn't affect anything. (TODO: resize() method for when you want to change the width/height arbitrarily after initialization).

- bar_height

How far down from the top of the sample the bar will be drawn.  Setting it to 1 will draw a line at the sample value.  This can be changed on
the fly.

- seek_speed

How many seconds forward or back to jump.


### Callback Functions

There are some callbacks for player control systems so that you could hook in
your own functions to update the DOM, or pull the next song from
a list and change the URL, etc.

Example: Show the URL of the current song if the audioVis.stop() function is called.

    audioVis.callback_stop = function (d) { alert("Stopped '" + d.getURL() + "'."); };

The parameter passed to the function when it's called is a copy of the library object itself so that you can access any property that you
might need to implement control logic (see 'Controls' section below).

The following callbacks are available to overload this way:

- audioVis.callback_play
- audioVis.callback_pause
- audioVis.callback_stop
- audioVis.callback_next
- audioVis.callback_prev
- audioVis.callback_nextSong
- audioVis.callback_prevSong

# Controls

The library provides a few helper functions to mimic the behaviour of
standard audio controls like play, stop, pause, rewind, start/end, and
fast-forward.  To hook them up to an interface you've created, point the
onclick="" attribute to the corresponding function below:

- audioVis.play();

Play the song.

- audioVis.pause();

Pause the song.

- audioVis.toStart();

Rewind to the beginning of the song.

- audioVis.toEnd();

Rewind to the end.

- audioVis.toNext();

Skip to the next song.

- audioVis.toPrev();

Go back to the previous song.

- audioVis.fastforward();

Skip forward by the amount set in audioVis.settings.seek_speed.

- audioVis.rewind();

Rewind by the amount set in audioVis.settings.seek_speed.

- audioVis.stop();

Stop playing the song.

So to hook it up to an HTML <input> button element:

    <input type='button' value='Play' onclick='audioVis.play();' />

## Resources

MDN Javascript Web API Documentation - AudioContext

https://developer.mozilla.org/en/docs/Web/API/AudioContext
