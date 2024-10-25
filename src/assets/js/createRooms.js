import apiClient from "./axiosConfig.js";

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

// localStorage.setItem(
//    "accessToken",
//    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3MWE2MDAyOWRmNTBlMzg1MjRkZDk3MyIsImVtYWlsIjoibmhpbWM5eEBnbWFpbC5jb20iLCJ1c2VybmFtZSI6Ikxpc2EiLCJpYXQiOjE3Mjk3ODE4NjMsImV4cCI6MTcyOTg2ODI2M30.AmaSHp13kh9ufsnnXRd9jdER4BzUzvGiz9uDdkUz-LI"
// );
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

// Render tin nhắn
const chatWrapperNode = $('#chat-wrapper')
const moreChatLoadingNode = $('#more-chat-loading')
const chatContainerNode = $('#chat-container')
// let MY_ID = '671a60029df50e38524dd973'
let MY_ID = '671a60289df50e38524dd975'
let currentPage = 1
let hasMore = true
let isLoading = false

const getMessagesInRoom = async (page = 1) => {
   try {
      const res = await apiClient.get(`v1/messages/671a60b59df50e38524dd976?page=${page}`)
      const data = res.data.data
      if(page === 1) {
         console.log('first', data[data.length - 1])
      }
      return data
   } catch (error) {
      console.log(error)
   }
}
const renderMessages = async (page) => {
   if (isLoading || !hasMore) return
   isLoading = true
   moreChatLoadingNode.style.display = 'block'
   const list = await getMessagesInRoom(page)
   if (list.length === 0) {
      hasMore = false
      isLoading = false
      moreChatLoadingNode.style.display = 'none'
      return
   }
   hasMore = true
   console.log(list)
   list.forEach(item => {
      const messageElement = document.createElement('div')
      const class1 = MY_ID === item.userInfo.userId ? '*:bg-primary flex-row-reverse' : '*:bg-gray-400'
      messageElement.className = `flex mb-4 gap-2.5 cursor-pointer text-white ${class1}`
      messageElement.innerHTML = `
            <div class="size-9 rounded-full">
               <img src="${item.userInfo.avatar}"
                     alt="My Avatar" class="size-full object-cover rounded-full">
            </div>
            <div class="max-w-96 rounded-lg p-3">
               ${item.message.type === 'text' ? `<p>${item.message.content}</p>` : `<img class="max-w-60" src="${item.message.content}" alt="">`}
            </div>
      `
      chatWrapperNode.prepend(messageElement)
   })
   isLoading = false
   moreChatLoadingNode.style.display = 'none'
}
renderMessages(1)
chatContainerNode.addEventListener('scroll', () => {
   if (chatContainerNode.scrollTop === 0 && hasMore && !isLoading) {
      ++currentPage
      renderMessages(currentPage)
   }
})

// let realTimeUpdateMessage = setInterval(() => {
//    renderMessages(1)
// }, 100000)

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
         "v1/messages/671a60b59df50e38524dd976",
         formData,
         {
            headers: {
               "Content-Type": "multipart/form-data",
            },
         }
      );
      console.log("Group created:", response.data);
      console.log(messageInput);
      myMessage.innerText = messageInput
   } catch (err) {
      console.log(err);
   }
});

// Get Grops

async function getGroups() {
   try {
      const response = await apiClient.get("v1/rooms/get_all");
      console.log("Groups:", response.data.data);
        listGroups.innerHTML = "";
        response.data.data.forEach((group) => {
           listGroups.innerHTML += `
              <div class="group-item" data-room-id="${group.id}">
                  <h3>${group.roomName}</h3>
                  <p>${group.users.length} members</p>
              </div>
           `;
        });
   } catch (err) {
      console.log(err);
   }
}

getGroups();

//button logout
$('#logout').addEventListener('click', (e) => {
   localStorage.removeItem('accessToken')
   localStorage.removeItem('userInfo')
   window.location.href = '../../src/pages/signin.html'
})