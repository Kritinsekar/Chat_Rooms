let handleMemberJoined = async (MemberId) => {
    console.log('A new member has joined the room:', MemberId);
    addMemberToDom(MemberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);

    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name']);
    addBotMessageToDom(`Welcome to the room, ${name}! 👋`);
};

let addMemberToDom = async (MemberId) => {
    let { name } = await rtmClient.getUserAttributesByKeys(MemberId, ['name']);
    let membersWrapper = document.getElementById('member__list');

    let memberItem = `<div class="member__wrapper" id="member__${MemberId}__wrapper">
                        <span class="green__icon"></span>
                        <p class="member_name">${name}</p>
                    </div>`;

    membersWrapper.insertAdjacentHTML('beforeend', memberItem);
};

let updateMemberTotal = async (members) => {
    document.getElementById('members__count').innerText = members.length;
};

let handleMemberLeft = async (MemberId) => {
    removeMemberFromDom(MemberId);

    let members = await channel.getMembers();
    updateMemberTotal(members);
};

let removeMemberFromDom = async (MemberId) => {
    let memberWrapper = document.getElementById(`member__${MemberId}__wrapper`);
    if (memberWrapper) {
        let name = memberWrapper.querySelector('.member_name').textContent;
        addBotMessageToDom(`${name} has left the room.`);
        memberWrapper.remove();
    }
};

let getMembers = async () => {
    let members = await channel.getMembers();
    updateMemberTotal(members);
    members.forEach(addMemberToDom);
};

let handleChannelMessage = async (messageData, MemberId) => {
    console.log('A new message was received');
    let data = JSON.parse(messageData.text);

    if (data.type === 'chat') {
        addMessageToDom(data.displayName, data.message);
    }

    if (data.type === 'user_left') {
        let userElement = document.getElementById(`user-container-${data.uid}`);
        if (userElement) userElement.remove();

        if (userIdInDisplayFrame === `user-container-${data.uid}`) {
            hideDisplayFrame();
        }
    }
};

let sendMessage = async (e) => {
    e.preventDefault();
    let message = e.target.message.value.trim();
    if (!message) return;

    channel.sendMessage({ text: JSON.stringify({ type: 'chat', message, displayName }) });
    addMessageToDom(displayName, message);
    e.target.reset();
};

let addMessageToDom = (name, message) => {
    let messagesWrapper = document.getElementById('messages');
    let newMessage = `<div class="message__wrapper">
                        <div class="message__body">
                            <strong class="message__author">${name}</strong>
                            <p class="message__text">${message}</p>
                        </div>
                    </div>`;
    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);
    messagesWrapper.lastChild.scrollIntoView();
};

let addBotMessageToDom = (botMessage) => {
    let messagesWrapper = document.getElementById('messages');
    let newMessage = `<div class="message__wrapper">
                        <div class="message__body__bot">
                            <strong class="message__author__bot">🤖 Mumble Bot</strong>
                            <p class="message__text__bot">${botMessage}</p>
                        </div>
                    </div>`;
    messagesWrapper.insertAdjacentHTML('beforeend', newMessage);
    messagesWrapper.lastChild.scrollIntoView();
};

let leaveChannel = async () => {
    await channel.leave();
    await rtmClient.logout();
};

window.addEventListener('beforeunload', leaveChannel);
document.getElementById('message__form').addEventListener('submit', sendMessage);
