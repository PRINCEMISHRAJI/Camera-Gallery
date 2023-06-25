let db; 
let openRequest = indexedDB.open("myDatabase");

openRequest.addEventListener("success", (e) => {
    console.log("success");
    db = openRequest.result;
})

openRequest.addEventListener("error", (e) => {
    console.log("error");
})

openRequest.addEventListener("upgradeneeded", (e)=> {
    console.log("upgraded");
    db = openRequest.result;

    db.createObjectStore("video", {keyPath : "id"});
    db.createObjectStore("image", {keyPath : "id"});
})