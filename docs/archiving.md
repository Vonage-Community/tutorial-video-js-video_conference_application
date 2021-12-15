# Archiving

Sometimes we might want to record our call of prosterity. Vonage video API has an archiving API that allows us to save a video call to a cloud storage. In our application we are using a S3 bucket to store the video.

## HTML

In `call.html` replace `<!-- Recording button goes here -->` with the following:

```html
<span class="icon" id="record">
  <i class="fas fa-dot-circle fa-2x"></i>
</span>
```

## JS

Towards the top on `js/call.js` add the following:

```js
const recordButton = document.getElementById('record');
let archiveId;
let recording = false;
```

We get a reference to the `record` button, `archiveId` to store the archive id when it start and set `recording` to `false`. We will use this to determine if we are recording or not.

In `initializeSession` replace `// Archive events go here` with the following:

```js
session.on("archiveStarted", function(event){
  console.log("archive started");
  archiveId = event.id;
  recording = true;
  recordButton.style.color = "red"; 
})

session.on("archiveStopped", function() {
  console.log("archive stopped");
  archiveId = null;
  recording = false;
  recordButton.style.color = "black";
})
```

With this we can get events when the archive starts and stops. We can use this to change the color of the record button to red when recording and black when not recording.

Towards the bottom of the file we add the `onclick` event listener on the `record` button.

```js
recordButton.onclick = async() => {
  console.log("record clicked");
  if(!recording) {
    const response = await fetch(`/api/archive/start/${sessionId}`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const json = await response.json();
    console.log(json);
  } else if(recording && archiveId) {
    const response = await fetch(`/api/archive/${archiveId}/stop`, {
      method: "post",
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const json = await response.json();
    console.log(json);
  }
}
```

If recording was not on we call our `/api/archive/start/${sessionId}` endpoint to start the archive. We get the archive id from the response and store it in `archiveId`. If recording was on we call our `/api/archive/${archiveId}/stop` endpoint to stop the archive. We will get events from Opentok when archive starts and stops which we already setup in `initializeSession`.

## Running it

If you are already running it from the previous steps, you can just refresh the page and you should be able to see the record controls in the bottom of the screen. If you already setup the storage in you opentok dashboard you should be able to find the video in you S3 bucket. If you haven't already [setup S3 Storage](https://tokbox.com/developer/guides/archiving/using-s3.html). You will need to do that before you can run this example.