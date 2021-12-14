# Adding Control

Most video application will allow you to enable and disable video and audio input. There is also a dedicated button to leave the call. 

## HTML

In `call.html` replace `<!-- call control goes here -->` with the following code:

```html
  <div class="controls">
    <span class="icon" id="audio">
      <i class="fas fa-microphone fa-2x" id="audio-on"></i>
    </span>
    <span class="icon" id="video">
      <i class="fas fa-video fa-2x" id="video-on"></i>
    </span>
    <!-- Share button goes here -->
    <!-- Chat button goes here -->
    <!-- Recording button goes here -->
    <span class="icon" id="end">
      <i class="fas fa-times fa-2x"></i>
    </span>
  </div>
```

## JS

In `js/call.js` we need to add the necessary code to access the buttons and add event listeners to them. 

At the top of the file add the code to access the buttons:

```js
const audioButton = document.getElementById('audio');
const videoButton = document.getElementById('video');
const disconnect = document.getElementById('end');
```

Add the `onclick` event listeners to the buttons:

```js
audioButton.onclick = () => {
  const audioSource = publisher.getAudioSource();
  if(audioSource.enabled === false) {
    audioButton.innerHTML = '<i class="fas fa-microphone fa-2x" id="audio-on"></i>';
    publisher.publishAudio(true);
    localStorage.setItem('audioEnabled', JSON.stringify(true));
  } else {
    audioButton.innerHTML = '<i class="fas fa-microphone-slash fa-2x" id="audio-off"></i>';
    publisher.publishAudio(false);
    localStorage.setItem('audioEnabled', JSON.stringify(false));
  }
}

videoButton.onclick = () => {
  const videoSource = publisher.getVideoSource();
  if(!videoSource.track) {
    videoButton.innerHTML = '<i class="fas fa-video fa-2x" id="video-on"></i>';
    publisher.publishVideo(true);
    localStorage.setItem('videoEnabled', JSON.stringify(true));
  } else {
    videoButton.innerHTML = '<i class="fas fa-video-slash fa-2x" id="video-off"></i>';
    publisher.publishVideo(false);
    localStorage.setItem('videoEnabled', JSON.stringify(false));
  }
}

disconnect.onclick = () => {
  if(publisher) {
    publisher.destroy();
  }
  if(scPublisher) {
    scPublisher.destroy();
  }

  setTimeout(() => {
    window.location.href = `/`;
  }, 200)
};
```

In `audio` and `video` button, depending on the state of the button, we change the icon to the appropriate one. In `end` button, we call the `destroy` method on the publisher to stop publishing. 

## Running it

If you are already running it from the previous steps, you can just refresh the page and you should be able to see the controls in the bottom of the screen.

![Controls](https://i.ibb.co/4WDd02c/video-controls.png)

## Next Steps

In the next step of the tutorial, we will add the Screen share feature.