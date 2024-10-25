import apiClient from "./axiosConfig.js";
localStorage.setItem(
   "accessToken",
   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MWE2MDAyOWRmNTBlMzg1MjRkZDk3MyIsImVtYWlsIjoibmhpbWM5eEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6Ikxpc2EiLCJpYXQiOjE3Mjk3ODE4NjMsImV4cCI6MTcyOTg2ODI2M30.AmaSHp13kh9ufsnnXRd9jdER4BzUzvGiz9uDdkUz-LI"
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
      const htmls = (myMessage.textContent = messageInput);
   } catch (err) {
      console.log(err);
   }
});

// Get Grops

async function getGroups() {
   try {
      const response = await apiClient.get("v1/rooms/get_all");
      const groups = response.data.data;
      groups.forEach((room) => {
         console.log(room);
         const timestamp = room.createAt;
         const date = new Date(timestamp);
         const hours = date.getHours();
         const minutes = date.getMinutes().toString().padStart(2, "0");
         const period = hours >= 12 ? "pm" : "am";
         const formattedHours = hours % 12 || 12;
         const formattedTime = `${formattedHours}.${minutes}${period}`;
         const htmls = `
            <li class="flex items-center border-b border-[#B4ABAB] py-[14px]" >
               <img src=${room.avatarRoom} class="w-[45px] h-[45px] mr-[16px]"
                     alt="no img">
               <div class="flex items-center justify-between w-full">
                     <div class="flex flex-col">
                        <h4 class="text-base text-textPrimary font-semibold">${
                           room.roomName
                        }</h4>
                        <p class="text-textPrimary font-light text-sm max-w-[185px] line-clamp-1">${
                           room?.latestMessage?.content || "chưa có tin nhắn nào"
                        }
                       </p>
                     </div>
                     <div class="flex flex-col items-end">
                        <p class="text-[12px] text-textPrimary font-light">${formattedTime}</p>
                     </div>
               </div>
            </li>
         `;
         listGroups.innerHTML += htmls;
      });
   } catch (err) {
      console.log(err);
   }
}

getGroups();
