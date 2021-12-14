# Get a preview of Audio and Video devices for Video Conference

In this tutorial we will see one way to setup a preview of the video and audio devices for a video conference. 

In any video conference application, we usually have a page that previews our audio video devices.

## Setup

We will be building this using vanilla HTML, CSS and JavaScript. But the same can be done with any framework.

## Goal

We want to a have a component that shows currently selected audio and video device preview and a way for us to change the devices.

This is what we want to get in the end.

![Preview window with dropdown for selecting devides](https://i.ibb.co/J7GkQRy/preview.png)

> Note: This is part of a larger tutorial. Some of the code is not shown here. For the full code, visit [Vonage Community Github Repo](https://github.com/Vonage-Community/tutorial-video-js-video_conference_application)

## HTML

In `index.html` in the `head` element, we will add the opentok library. This makes `OT` available globally to our frontend JS.

```html
<script src="https://static.opentok.com/v2/js/opentok.min.js"></script>
```

With the script our html head looks like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="stylesheet" href="css/style.css">
    <script src="https://static.opentok.com/v2/js/opentok.min.js"></script>
    <title>Vonage Video</title>
  </head>
```

The body of the html has two main parts. We will only focus on the `preview` part for now.

```html
<body>
    <div class="container">
      <!-- Start / Join Control goes here -->
      <div class="preview-container">
        <div id="preview-wrapper">
          <div id="preview"></div>
        </div>
        <div id="preview-control">
          <div>
            <label for="video-source">Video</label>
            <select class="selector" id="video-source"></select>
          </div>
          <div>
            <label for="audio-source">Audio</label>
            <select class="selector" id="audio-source"></select>
          </div>
        </div>
        <button id="start-preview">Preview</button>
      </div>
    </div>
    <script src="js/script.js"></script>
  </body>
```

We have an empty div with `id` of `preview`. This is the `div` where we will inject the video and audio preview using Opentok Client. We also have two `selector` for selecting the audio and video devices. There is a `button` to start the preview. We also add the `script` tag to load out `script.js` file.

## JS
In the `script.js` file in the `js` folder, we create reference to the `dom` elements for the `selectors`, `preview` and `button`. We also create a global reference to `publisher`. 

```js
var previewContainer = document.getElementById('preview');
var previewButton = document.getElementById('start-preview');
var audioSelector = document.getElementById('audio-source');
var videoSelector = document.getElementById('video-source');
let publisher;

// Start/Join component initialization goes here
```

Using `OT.getDevices()` we will get a list of all the audio and video devices. From this we will populate the selector for audio and video devices. We will also add an empty option to the selector so that the user can choose to not use any device

```js
function loadAVSources() {
  OT.getDevices((err, devices) => {
    if (err) {
      alert('Not a supported browser');
    }
    devices.forEach(device => {
      if (device.kind.toLowerCase() === 'audioinput') {
        audioSelector.innerHTML += `<option value="${device.deviceId}">${device.label}</option>`;
      }
      if (device.kind.toLowerCase() === 'videoinput') {
        videoSelector.innerHTML += `<option value="${device.deviceId}">${device.label}</option>`;
      }
    });
    audioSelector.innerHTML += `<option value="">No audio</option>`;
    videoSelector.innerHTML += `<option value="">No video</option>`; 
  })
}

loadAVSources();
```

Next we will add event listenter to the `previewButton`. When the user clicks the button, we will start the preview.

```js
previewButton.addEventListener('click', () => {
  publisher = OT.initPublisher(previewContainer, {height: '100%', width: '100%'})
  if(audioSelector.value === "") {
    publisher.publishAudio(false);
  } else {
    publisher.setAudioSource(audioSelector.value);
    publisher.publishAudio(true);
  }

  if(videoSelector.value === "") {
    publisher.publishVideo(false);
  } else {
    publisher.setVideoSource(audioSelector.value);
    publisher.publishVideo(true);
  }
})
```

After that we add `onChange` listener on the selectors.

```js
audioSelector.addEventListener('change', e => {
  if(publisher) {
    if(audioSelector.value === "") {
      publisher.publishAudio(false);
    } else {
      publisher.setAudioSource(audioSelector.value);
      publisher.publishAudio(true);
    }
  }
})

videoSelector.addEventListener('change', () => {
  if(publisher) {
    if(videoSelector.value === "") {
      publisher.publishVideo(false);
    } else {
      publisher.setVideoSource(audioSelector.value);
      publisher.publishVideo(true);
    }
  }
})
```

## CSS

The css for this page is located in [here](https://raw.githubusercontent.com/Vonage-Community/tutorial-video-js-video_conference_application/main/public/css/style.css). Copy that css in `css/style.css` in the public folder.

> Note: The html file is incomplete here. The full page also has some extra html that is used for getting session id and username, which we will get into in a later tutorial.

## Next Steps

After the preview is done we would want to start the meeting. We would need to store the device preference somehow. We can store it in local storage.

```js
function setDevicePreference() {
  const audioSourceId = publisher.getAudioSource().id;
  const videoSourceId = publisher.getVideoSource().deviceId;
  const videoEnabled = publisher.getVideoSource().track ? true : false;
  const audioEnabled = publisher.getAudioSource().enabled;

  localStorage.setItem('audioSourceId', audioSourceId);
  localStorage.setItem('videoSourceId', videoSourceId);
  localStorage.setItem('audioEnabled', JSON.stringify(audioEnabled));
  localStorage.setItem('videoEnabled', JSON.stringify(videoEnabled));
}
```

`setDevicePreference` will set the device preference in local storage. We will use this in our next tutorial. 

