const AGORA_APP_ID = "7c9918e0a10443398852e5a5405924a6";  
const AGORA_TOKEN = null;  

let client;
let localTracks = {
    audioTrack: null,
    videoTrack: null,
    screenTrack: null
};
let remoteUsers = {};
let isJoined = false;
let isMicOn = true;
let isCamOn = true;
let isSharingScreen = false;

const joinRoom = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get("room") || "default-room";

    client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

    const uid = Math.floor(Math.random() * 10000);
    await client.join(AGORA_APP_ID, roomId, AGORA_TOKEN, uid);

    client.on("user-published", handleUserPublished);
    client.on("user-unpublished", handleUserUnpublished);
    client.on("user-joined", updateMemberCount);
    client.on("user-left", updateMemberCount);

    document.getElementById("join-btn").addEventListener("click", async () => {
        if (isJoined) return;

        try {
            localTracks.audioTrack = await AgoraRTC.createMicrophoneAudioTrack();
            localTracks.videoTrack = await AgoraRTC.createCameraVideoTrack();

            await client.publish([localTracks.audioTrack, localTracks.videoTrack]);

            addVideoStream(uid);
            localTracks.videoTrack.play(`user-${uid}`);

            document.getElementById("join-btn").style.display = "none";
            document.querySelector(".stream__actions").style.display = "flex";
            isJoined = true;

            updateMemberCount();
        } catch (error) {
            console.error("Error accessing camera/mic:", error);
            alert("Failed to access camera. Please allow permissions.");
        }
    });

    document.getElementById("mic-btn").addEventListener("click", toggleMic);
    document.getElementById("camera-btn").addEventListener("click", toggleCamera);
    document.getElementById("screen-btn").addEventListener("click", toggleScreenShare);
};

const handleUserPublished = async (user, mediaType) => {
    await client.subscribe(user, mediaType);

    if (mediaType === "video") {
        addVideoStream(user.uid);
        user.videoTrack.play(`user-${user.uid}`);
    }

    if (mediaType === "audio") {
        user.audioTrack.play();
    }

    remoteUsers[user.uid] = user;
    updateMemberCount();
};

const handleUserUnpublished = (user) => {
    removeVideoStream(user.uid);
    updateMemberCount();
};

const addVideoStream = (uid) => {
    let streamsContainer = document.getElementById("streams__container");

    if (!document.getElementById(`user-${uid}`)) {
        let streamDiv = document.createElement("div");
        streamDiv.id = `user-${uid}`;
        streamDiv.className = "video__container";
        streamsContainer.appendChild(streamDiv);
    }
};

const removeVideoStream = (uid) => {
    let streamDiv = document.getElementById(`user-${uid}`);
    if (streamDiv) {
        streamDiv.remove();
    }
};

const toggleMic = async () => {
    if (localTracks.audioTrack) {
        isMicOn = !isMicOn;
        await localTracks.audioTrack.setMuted(!isMicOn);
        document.getElementById("mic-btn").classList.toggle("active", isMicOn);
    }
};

const toggleCamera = async () => {
    if (localTracks.videoTrack) {
        isCamOn = !isCamOn;
        await localTracks.videoTrack.setMuted(!isCamOn);
        document.getElementById("camera-btn").classList.toggle("active", isCamOn);
    }
};

const toggleScreenShare = async () => {
    if (!isSharingScreen) {
        try {
            localTracks.screenTrack = await AgoraRTC.createScreenVideoTrack();
            await client.unpublish(localTracks.videoTrack);
            await client.publish(localTracks.screenTrack);

            localTracks.screenTrack.play(`user-${client.uid}`);
            isSharingScreen = true;
            document.getElementById("screen-btn").classList.add("active");
        } catch (error) {
            console.error("Error sharing screen:", error);
        }
    } else {
        await client.unpublish(localTracks.screenTrack);
        localTracks.screenTrack.close();
        await client.publish(localTracks.videoTrack);
        localTracks.videoTrack.play(`user-${client.uid}`);

        isSharingScreen = false;
        document.getElementById("screen-btn").classList.remove("active");
    }
};

document.getElementById("leave-btn").addEventListener("click", async () => {
    if (!isJoined) return;

    localTracks.audioTrack.stop();
    localTracks.videoTrack.stop();
    localTracks.audioTrack.close();
    localTracks.videoTrack.close();

    if (localTracks.screenTrack) {
        localTracks.screenTrack.stop();
        localTracks.screenTrack.close();
    }

    await client.leave();
    document.getElementById("join-btn").style.display = "block";
    document.querySelector(".stream__actions").style.display = "none";
    
    for (let uid in remoteUsers) {
        removeVideoStream(uid);
    }

    remoteUsers = {};
    isJoined = false;
    updateMemberCount();
});

const updateMemberCount = () => {
    document.getElementById("members__count").innerText = Object.keys(remoteUsers).length + (isJoined ? 1 : 0);
    
    let memberList = document.getElementById("member__list");
    memberList.innerHTML = "";

    Object.keys(remoteUsers).forEach((uid) => {
        let memberItem = document.createElement("div");
        memberItem.className = "member";
        memberItem.innerText = `User ${uid}`;
        memberList.appendChild(memberItem);
    });

    if (isJoined) {
        let selfItem = document.createElement("div");
        selfItem.className = "member";
        selfItem.innerText = "You";
        memberList.appendChild(selfItem);
    }
};

joinRoom();






