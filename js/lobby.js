// let form = document.getElementById('lobby__form')

// let displayName = sessionStorage.getItem('display_name')
// if(displayName){
//     form.name.value = displayName
// }

// form.addEventListener('submit', (e) => {
//     e.preventDefault()

//     sessionStorage.setItem('display_name', e.target.name.value)

//     let inviteCode = e.target.room.value
//     if(!inviteCode){
//         inviteCode = String(Math.floor(Math.random() * 10000))
//     }
//     window.location = `room.html?room=${inviteCode}`
// })

let form = document.getElementById('lobby__form');

let displayName = sessionStorage.getItem('display_name');
if (displayName) {
    form.name.value = displayName;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();

    sessionStorage.setItem('display_name', e.target.name.value);

    let inviteCode = e.target.room.value.trim();
    if (!inviteCode) {
        inviteCode = "default-room"; // Ensure users join the same room if left empty
    }

    window.location = `room.html?room=${inviteCode}`;
});
