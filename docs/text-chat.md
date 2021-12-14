# Text Chat

In most modern video chat application we also have ways to communicate with other participants via chat messages. This is a great way to post questions without interrupting the video call. Vonage video API has a signaling mechanism that we can use to send and receive chat messages. 

## HTML

In `call.html` replce `<!-- chat-container goes here -->` with the following code:

```html
<div class="chat-container">
  <div id="chat-text">
    <ul id="chat-list">  
    </ul>
  </div>
  <div class="send-chat">
    <input type="text" id="chat-data" placeholder="Send Text">
    <button id="send">Send</button>
  </div>
</div>
```

Then replace `<!-- Chat button goes here -->` with the following:

```html
<span class="icon" id="chat">
  <i class="fas fa-comment-alt fa-2x"></i>
  <div id="message-notification"></div>
</span>
```

## JS

In `call.js` we will need to add a number of variables towards the top of the file. 

```js
const chat = document.getElementById('chat');
const chatInput = document.getElementById('chat-data');
const chatContainer = document.querySelector('.chat-container');
const chatList = document.getElementById('chat-list');
const chatSendButton = document.getElementById('send');
const messageNotification = document.getElementById('message-notification');
let chatVisible = false;
let messageCount = 0;
```

`chatVisible` and `messageCount` are used to keep track of the chat window and the number of unread messages.

Inside `initializeSession` function replace `// Text chat events go here` with the following code:

```js
session.on("signal:text", function(event) {
  const message = JSON.parse(event.data);
  let listEl = document.createElement('li');
  const isMe = event.from.connectionId === session.connection.id ? "me" : "other";
  if(isMe === "other" && chatVisible === false){
    messageCount += 1;
    messageNotification.innerHTML = messageCount;
    messageNotification.style.display = "flex";
  }
  listEl.classList.add(isMe);
  listEl.innerHTML = `<div class="bubble">
  <span class="user">${message.username}</span>
  <span class="time">${message.timestamp}</span>
  <p class="message">${message.data}</p>
  </div>`
  chatList.appendChild(listEl);
})
```

We then add the `onclick` events for the `chat` button and `chatSendButton`. We also add the `onkeyup` event for the `chatInput` to send the message when the user presses the `enter` key.

```js
chat.onclick = () => {
  if(chatVisible) {
    chatVisible = false;
    layoutEl.style.width = '100%';
    chatContainer.style.display = 'none'
  } else {
    messageNotification.innerHTML = "";
    messageNotification.style.display = 'none';
    chatVisible = true;
    layoutEl.style.width = '75%';
    chatContainer.style.display = 'block'
  }

  layout();
}

chatSendButton.onclick = () => {
  const chat = chatInput.value;
  const time = new Date().toLocaleTimeString();
  if(chat && chat !== ""){
    session.signal({
      type: "text",
      data: JSON.stringify({data: chat, timestamp: time, username: username})
    }, function(error) {
      if(error) {
        console.log(error);
      } else {
        console.log("signal sent");
      }
    })
    chatInput.value = "";
  }
}

chatInput.addEventListener("keyup", function(event) {
  if(event.key === "Enter") {
    event.preventDefault();
    chatSendButton.click();
  }
})
```

## Running it

If you are already running it from the previous steps, you can just refresh the page and you should be able to see the chat controls in the bottom of the screen. Clicking it will open the chat window in the side and you can send messages to other participants. While the chat window is closed, the chat icon will show a number of unread messages which will go away upon clicking the chat icon.

![](https://i.ibb.co/txy83kN/chat.png)

## Next Steps

In the next part we will enable archiving of the call. 