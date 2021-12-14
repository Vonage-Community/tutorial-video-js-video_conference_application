# Starting or Joining a session

In this tutorial, we will show how we can start or join an exisiting session.

## HTML

In `index.html` replace `<!-- Start / Join Control goes here -->` with the following:

```html
<div class="control-container">
  <h1>Welcome To Vonage Video</h1>

  <div class="join control">
    <p>Your Full Name</p>
    <input type="text" id="name" placeholder="Name" />
  </div>
  <div class="join control">
    <p>Join a Session</p>
    <input type="text" id="session" placeholder="Session ID" />
    <button id="join">Join</button>
  </div>
  <div class="create control">
    <p>Or Create a Session</p>
    <button id="create">Create</button>
  </div>
</div>
```

We have couple of input fields for taking in username and session id. And buttons for either joining a session with the given session id or creating a new session and joining it.

We will also populate the `call.html` file with the following:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../css/call.css">
  <script src="https://static.opentok.com/v2/js/opentok.min.js"></script>
  <script src="https://kit.fontawesome.com/8eeb1d6532.js" crossorigin="anonymous"></script>
  <script src="../js/opentok-layout.js"></script>
  <title>Vongae Video</title>
</head>
<body>
  <div id="layout"></div>
  <!-- chat-container goes here -->
  <!-- call control goes here -->
  <script src="../js/call.js"></script>
</body>
</html>
```

## JS
In `js/script.js` replace `// Start/Join component initialization goes here` with the following:

```js
var sessionIdText = document.getElementById('session');
var joinButton = document.getElementById('join');
var createButton = document.getElementById('create');
var nameText = document.getElementById('name');
```

And add the following at the end of the file:

```js
async function onCreateClicked() {
  try {
    const response = await fetch('/api/create', {method: 'post'})
    const data = await response.json();
    const name = nameText.value;
    if(name !== "") {
      if(publisher) {
        setDevicePreference();
      }
      window.location.href = `/session/${data.sessionId}?name=${name}`;
    } else {
      alert("Name required");
    }
  } 
  catch (e) {
    console.log(e);
  }
}

function onJoinClicked() {
  const sessionId = sessionIdText.value;
  const name = nameText.value;
  if(sessionId !== "" && name !== "") {
    if(publisher) {
      setDevicePreference();
    }
    window.location.href = `/session/${sessionId}?name=${name}`;
  } else {
    alert("Name and SessionID required");
  }
}

createButton.addEventListener('click', onCreateClicked);
joinButton.addEventListener('click', onJoinClicked);
```

In `js/call.js` add the following:

```js
const layoutEl = document.getElementById('layout');
const sessionId = window.location.pathname.split('/')[2].split('?')[0];

let username;
let layout;
let publisher;
let scPublisher;
let session;

async function getCredentials() {
  const response = await fetch('/api/credentials', {
    method: "post",
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      sessionId: sessionId
    })
  });
  const credentials = await response.json();
  return credentials;
}

function updateLayoutValues() {
  const opts = {
    maxRatio: 3 / 2,
    minRatio: 9 / 16,
    fixedRatio: false,
    alignItems: 'center',
    bigPercentage: 0.8,
    bigFixedRatio: false,
    bigMaxRatio: 3 / 2,
    bigMinRatio: 9 / 16,
    bigFirst: true,
    scaleLastRow: true,
    smallMaxWidth: Infinity,
    smallMaxHeight: Infinity,
    bigMaxWidth: Infinity,
    bigMaxHeight: Infinity,
    bigAlignItems: 'center',
    smallAlignItems: 'center',
  };
  layout = initLayoutContainer(layoutEl, opts).layout;
}

updateLayoutValues();
async function initializeSession() {
  const credentials = await getCredentials();
  session = OT.initSession(credentials.apiKey, credentials.sessionId);
  var pubEl = document.createElement('div');
  const params = new URLSearchParams(window.location.search)
  username = params.get('name');

  if(!username) {
    let _name = window.prompt("Enter your name?");
    if(_name) {
      window.location.href = `/session/${sessionId}?name=${_name}`;
    }
  }
  publisher = OT.initPublisher(pubEl, {
    resolution: '1280x720',
    name: username,
  }, function(err) {
    layout();
  })

  var videoSourceId = localStorage.getItem('videoSourceId');
  if(videoSourceId) {
    publisher.setVideoSource(videoSourceId);
  }
  var audioSourceId = localStorage.getItem('audioSourceId');
  if(audioSourceId) {
    publisher.setVideoSource(videoSourceId);
  }

  var audioEnabled = localStorage.getItem('audioEnabled');
  if(audioEnabled) {
    publisher.publishAudio(JSON.parse(audioEnabled));
  }

  var videoEnabled = localStorage.getItem('videoEnabled');
  if(videoEnabled) {
    publisher.publishVideo(JSON.parse(videoEnabled));
  }

  session.connect(credentials.token, function(error) {
    if(error) {
      alert(error);
    } else {
      session.publish(publisher);
    }
  })

  session.on("streamCreated", function(event) {
    var subEl = document.createElement('div');
    let isScreenShare = event.stream.videoType === 'screen';
    if (isScreenShare) {
      subEl.classList.add('OT_big');
    }
    subscriber = session.subscribe(event.stream, subEl, {
      resolution: '1280x720'
    }, function(err) {
      if(!err) {
        layoutEl.appendChild(subEl);
      }
      layout();
    })
  })

  session.on("streamDestroyed", function(){
    console.log("stream destroyed")
    setTimeout(function () {
      layout();
    }, 200);
  });
  // Text chat events go here
  // Archive events go here

  layoutEl.appendChild(pubEl);
  layout();
}

var resizeTimeout;

window.onresize = function () {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(function () {
    layout();
  }, 20);
};

initializeSession();
```

We make use of `opentok-layout` to layout the video streams. Copy the code from [Opentok Layout JS](https://raw.githubusercontent.com/aullman/opentok-layout-js/master/opentok-layout.min.js) and paste it in `js/opentok-layout.js`. To learn more about OpenTok Layout, see [this blog post](https://learn.vonage.com/blog/2021/11/18/auto-layout-for-vonage-video-application/). 

## CSS

The css for `call.html` goes in `css/call.css`. You can copy the css from [Github Repository](https://raw.githubusercontent.com/Vonage-Community/tutorial-video-js-video_conference_application/main/public/css/call.css) and paste it in `css/call.css`.

## Running it

At this point we have done enough to test this out. If you already started the server in the previous step, it should still be running. Since we used nodemon, the server should have restarted automatically when we saved the code. You can go to [http://localhost:3000](http://localhost:3000) to see the preview page. The page should look something like this:

![Preview Page](https://i.ibb.co/Zznvfjd/preview-page.png)

You can give a name for the video participant and click `Create` to start a new session. 

Once you join you should see the video of the camera that selected (Or just a placeholder if you didn't select a camera). As of now there is no controls available. We will add them in the next steps.

## Next steps

Next we will will be adding video controls for enabling and disabling the camera and microphone. We will also add a button to leave the call. 