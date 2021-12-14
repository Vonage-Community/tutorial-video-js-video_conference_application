# Screen Sharing

Screen sharing is a feature that allows you to share your screen as a video feed to other participants in a call. Using vonage video API sharing your screen is as simple as creating a publisher with video source as `screen`. 

## HTML

In `call.html` replace `<!-- Share button goes here -->` with the following:

```html
<span class="icon" id="share">
  <i class="fas fa-desktop fa-2x"></i>
</span>
```

## JS

In `js/call.js` we create a global variable `sharing` that tracks whether it is currently screen sharing. We also create a variable that tracks the screen share control button.

```js
const shareButton = document.getElementById('share');

let sharing;
```

Then we add the `onclick` listener to the `shareButton` that will toggle the screen sharing state.

```js
shareButton.onclick = () => {
  var pubEl = document.createElement('div');

  if(!sharing) {
    OT.checkScreenSharingCapability(response => {
      if(!response.supported || response.extensionRegistered === false) {
        alert('screen share not supported by browser');
        return false;
      } else if(response.extensionInstalled === false) {
        alert('install the extension');
        return false;
      }
    })
    let ssEl = layoutEl.querySelector('.OT_big')
    if(ssEl) {
      alert('screen is being shared')
      return false;
    }
  
    pubEl.classList.add('OT_big');
    scPublisher = OT.initPublisher(pubEl, {
      videoSource: 'screen'
    }, function(err) {
      layout();
    })

    scPublisher.on('mediaStopped', function(event){
      scPublisher.destroy();
      layout();
    })
  
    layoutEl.appendChild(pubEl);
    session.publish(scPublisher)
    shareButton.style.color = 'green';
    sharing = true;
    layout();
  } else {
    // this is the case when we are screen sharing
    // 
    scPublisher.destroy();
    shareButton.style.color = 'black';
    sharing = false;
    layout();
  }
}
```

> This function does a number of different things. First it checks whether the browser is capable of screen sharing. Some older browser can not screen share. Most modern browser can do it, so usually its not a problem. Second it checks whether the extension is installed. If it is not installed, it will alert the user to install the extension. After that we initialize a new publisher with the source being `screen`. Since the user can stop the screen share outside our application from the broswer, we have a event listener on `mediaStopped` that will destroy the publisher and we can reset our layout. Finally we add the publisher to the layout and publish it. If screen share was already running, we can destroy the publisher and reset the layout.

## Running it

If you are already running it from the previous steps, you can just refresh the page and you should be able to see the screen share controls in the bottom of the screen. 

## Next steps

In the next step we will add text chat functionality.
