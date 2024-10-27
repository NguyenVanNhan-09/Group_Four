import apiClient from "./axiosConfig.js";
import Notification from "./notification.js";

(async () => {
   try {
      const res = await apiClient.get('v1/users/verify_token')
      localStorage.setItem("userInfo", JSON.stringify(res.data.data));
   } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userInfo')
      window.location.href = '../../src/pages/signin.html'
   }
})();

const $ = document.querySelector.bind(document);

const formCreateGroup = $("#form__create-group");
const formMessage = $("#form__message");
const imgInput = $("#img__message");
const textInput = $("#text__message");
const imagePreview = $("#imagePreview");
const myMessage = $("#my__message");
const listGroups = $("#list__groups");

(async () => {
   try {
      const res = await apiClient.get('/users/verify_token')
      localStorage.setItem("userInfo", JSON.stringify(res.data.data))
      MY_ID = res.data.data._id
      console.log(MY_ID);
   } catch (error) {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('userInfo')
      window.location.href = '../../src/pages/signin.html'
   }
})();

// Get Grops
async function getGroups() {
   try {
      const response = await apiClient.get("/rooms/get_all");
      const groups = response.data.data;
      CURRENT_ROOM_ID = groups[0]._id
      console.log(CURRENT_ROOM_ID);
      groups.forEach((room) => {
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
         const response = await apiClient.post("/rooms/create", data, {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         });
         console.log("Group created:", response.data);
         if (response) {
            Notification(success, "Tạo Phòng Thành công");
         } else {
            Notification(error, "Tạo Phòng thất bại");
         }
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

// Render tin nhắn
const chatWrapperNode = $('#chat-wrapper')
const moreChatLoadingNode = $('#more-chat-loading')
const chatContainerNode = $('#chat-container')
let currentPage = 1
let hasMore = true
let isLoading = false

const getMessagesInRoom = async (page = 1, roomId) => {
   try {
      const res = await apiClient.get(`/messages/${roomId}?page=${page}`)
      const data = res.data.data
      if(page === 1) {
         console.log('first', data[data.length - 1])
      }
      return data;
   } catch (error) {
      console.log(error);
   }
};
const renderMessages = async (page) => {
   if (isLoading || !hasMore || !MY_ID || !CURRENT_ROOM_ID) return
   isLoading = true
   moreChatLoadingNode.style.display = 'block'
   const list = await getMessagesInRoom(page, CURRENT_ROOM_ID)
   if (list.length === 0) {
      hasMore = false;
      isLoading = false;
      moreChatLoadingNode.style.display = "none";
      return;
   }
   hasMore = true;
   console.log(list);
   list.forEach((item) => {
      const messageElement = document.createElement("div");
      const class1 =
         MY_ID === item.userInfo.userId
            ? "*:bg-primary flex-row-reverse"
            : "*:bg-gray-400";
      messageElement.className = `flex mb-4 gap-2.5 cursor-pointer text-white ${class1}`;
      messageElement.innerHTML = `
            <div class="size-9 rounded-full">
               <img src="${item.userInfo.avatar}"
                     alt="My Avatar" class="size-full object-cover rounded-full">
            </div>
            <div class="max-w-96 rounded-lg p-3">
               ${
                  item.message.type === "text"
                     ? `<p>${item.message.content}</p>`
                     : `<img class="max-w-60" src="${item.message.content}" alt="">`
               }
            </div>
      `;
      chatWrapperNode.prepend(messageElement);
   });
   isLoading = false;
   moreChatLoadingNode.style.display = "none";
};
renderMessages(1);
chatContainerNode.addEventListener("scroll", () => {
   if (chatContainerNode.scrollTop === 0 && hasMore && !isLoading) {
      ++currentPage;
      renderMessages(currentPage);
   }
});

// let realTimeUpdateMessage = setInterval(() => {
//    renderMessages(1)
// }, 100000)

// tin nhắn mới
formMessage.addEventListener("submit", async (e) => {
   if (!CURRENT_ROOM_ID) return
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
         `/messages/${CURRENT_ROOM_ID}`,
         formData,
         {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         }
      );
      console.log("Group created:", response.data);
      // const htmls = (myMessage.textContent = messageInput);
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
                           room?.latestMessage?.content ||
                           "chưa có tin nhắn nào"
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

//button logout
$("#logout")?.addEventListener("click", (e) => {
   localStorage.removeItem("accessToken");
   localStorage.removeItem("userInfo");
   Notification(
      "success",
      "Đăng xuất thành công!",
      "../../src/pages/signin.html"
   );
});
