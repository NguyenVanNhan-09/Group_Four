import apiClient from "./axiosConfig.js";
localStorage.setItem(
   "accessToken",
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MThhMDQ2NTE1MmY1ZjNhNTAxNDA1NCIsImVtYWlsIjoibmhpMTIzQGdtYWlsLmNvbSIsImlhdCI6MTcyOTczNDQ1NywiZXhwIjoxNzI5ODIwODU3fQ.0PSE5X1vJSGhYF2AdYtke_8nhTVSThMeO9m82l1pr2w"
);
const $ = document.querySelector.bind(document);

const formCreateGroup = $("#form__create-group");
const formMessage = $("#form__message");
const imgInput = $("#img__message");
const textInput = $("#text__message");
const imagePreview = $("#imagePreview");
const myMessage = $("#my__message");
const listGroups = $("#list__groups");

// Tạo group chat
formCreateGroup.addEventListener("submit", (e) => {
   e.preventDefault();
   const formData = new FormData(formCreateGroup);
   const groupName = formData.get("group-name");
   const file = formData.get("file-upload");
   const data = new FormData();
   data.append("image", file);
   data.append("roomName", groupName);
   async function createGroup(data) {
      try {
         const response = await apiClient.post("v1/rooms/create", data, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });
         console.log("Group created:", response.data);
      } catch (err) {
         console.log(err);
      }
   }
   createGroup(data);
});

imgInput.addEventListener("change", (event) => {
   const file = event.target.files[0];
   textInput.classList.add("hidden");
   if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
         imagePreview.innerHTML = `<div style="width: 80px; height: 80px; overflow: hidden; border-radius: 8px; margin-left: 8px;">
                <img src="${e.target.result}" alt="Image preview" style="width: 100%; height: 100%; object-fit: cover;">
            </div>`;
      };
      reader.readAsDataURL(file);
   }
});

// tin nhắn mới
formMessage.addEventListener("submit", async (e) => {
   e.preventDefault();
   const formData = new FormData();
   const messageInput = textInput.value;
   formData.append("content", messageInput);
   if (imgInput.files.length > 0) {
      formData.append("image", imgInput.files[0]);
      formData.delete("content");
   }
   try {
      const response = await apiClient.post(
         "v1/messages/671a027622329f6f981f0758",
         formData,
         {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         }
      );
      console.log("Group created:", response.data);
      myMessage.textContent = messageInput;
   } catch (err) {
      console.log(err);
   }
});

// Get Grops

async function getGroups() {
   try {
      const response = await apiClient.get("v1/rooms/get_all");
      console.log("Groups:", response);
      //   listGroups.innerHTML = "";
      //   response.data.forEach((group) => {
      //      listGroups.innerHTML += `
      //         <div class="group-item" data-room-id="${group.id}">
      //             <h3>${group.roomName}</h3>
      //             <p>${group.users.length} members</p>
      //         </div>
      //      `;
      //   });
   } catch (err) {
      console.log(err);
   }
}

getGroups();
