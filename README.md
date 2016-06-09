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

### Callback Functions

There are some callbacks for player control systems so that you could hook in
your own functions to update the DOM, or pull the next song from
a list and change the URL, etc.

Example: Show the URL of the current song if the audioVis.stop() function is called.

    audioVis.callback_stop = function (d) { alert("Stopped '" + d.getURL() + "'."); };

# Controls

The library provides a few helper functions to mimic the behaviour of
standard audio controls like play, stop, pause, rewind, start/end, and
fast-forward.  To hook them up to an interface you've created, point the
onclick="" attribute to the corresponding function below:



## Tutorial

The original tutorial this was created for can also be found online at:

http://www.philbgarner.com/posts/audio.html

## Resources

MDN Javascript Web API Documentation - AudioContext

https://developer.mozilla.org/en/docs/Web/API/AudioContext
