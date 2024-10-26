import apiClient from "./axiosConfig.js"
const $ = document.querySelector.bind(document)
const formCreateGroup = $("#form__create-group")
const formMessage = $("#form__message")
const imgInput = $("#img__message")
const textInput = $("#text__message")
const imagePreview = $("#imagePreview")
const myMessage = $("#my__message")
const listGroups = $("#list__groups")
const chatWrapperNode = $('#chat-wrapper')
const moreChatLoadingNode = $('#more-chat-loading')
const chatContainerNode = $('#chat-container')
const myAvatar = $('#my-avatar')
const roomInfoNode = $('#room-info')

let MY_ID = ''
let MY_INFO = {
  username: '',
  avatar: '',
}

// Kiểm tra User
const checkUser = async () => {
  try {
    const res = await apiClient.get('/users/verify_token')
    localStorage.setItem("userInfo", JSON.stringify(res.data.data))
    myAvatar.src = res.data.data?.avatar
    MY_ID = res.data.data?._id
    MY_INFO = {
      username: res.data.data?.username,
      avatar: res.data.data?.avatar,
    }
  } catch (error) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    window.location.href = '../../src/pages/signin.html'
  }
}

// RENDER GIAO DIỆN
let CURRENT_ROOM_ID = ''
let currentPage = 1
let hasMore = true
let isLoading = false

// 1, Get Groups
const getGroups = async () => {
  try {
    const response = await apiClient.get("/rooms/get_all");
    const groups = response.data.data;
    CURRENT_ROOM_ID = groups[0]?._id
    await renderMessagesInRoom(CURRENT_ROOM_ID)
    const htmls = groups.reduce((acc, room) => {
      const timestamp = room.createAt;
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "pm" : "am";
      const formattedHours = hours % 12 || 12;
      const formattedTime = `${formattedHours}.${minutes}${period}`;
      return acc + `
       <li id="${room._id}" class="flex items-center border-b border-[#b4abab34] py-[14px] cursor-pointer hover:bg-gray-100 px-3 first:bg-[#e5efff]/80 rounded" >
               <div class="size-12 border-[0.5px] mr-[16px] rounded-full flex-shrink-0 overflow-hidden">
                  <img src=${room.avatarRoom} class="img-cover" alt="no img">
               </div>
               <div class="flex items-center justify-between w-full">
                     <div class="flex flex-col">
                        <h4 class="text-lg text-textPrimary font-semibold line-clamp-1">${room.roomName}</h4>
                        <p class="text-textPrimary font-light text-sm max-w-[185px] line-clamp-1">${room?.latestMessage?.content || "Chưa có tin nhắn nào"}
                       </p>
                     </div>
                     <div class="flex flex-col items-end">
                        <p class="text-[12px] text-textPrimary font-light">${formattedTime}</p>
                     </div>
               </div>
            </li>
      `
    }, '')
    listGroups.innerHTML = htmls;

    [...listGroups.children].forEach(item => {
      item.addEventListener('click', async () => {
        [...listGroups.children].forEach(child => {
          child.classList.remove('bg-[#e5efff]/80')
          child.classList.remove('first:bg-[#e5efff]/80')
          child.classList.add('hover:bg-gray-100')
        })
        item.classList.add('bg-[#e5efff]/80')
        item.classList.remove('hover:bg-gray-100')
        CURRENT_ROOM_ID = item.id
        chatWrapperNode.innerHTML = ''
        currentPage = 1
        hasMore = true
        isLoading = false
        await renderMessagesInRoom(CURRENT_ROOM_ID)
      })
    })

  } catch (error) {
    console.log(err)
  }
}

// 2, Render thông tin group
const renderRoomInfo = async (data) => {
  console.log(data);
  roomInfoNode.innerHTML = `
  <div class="flex items-center">
      <img src="${data.avatarRoom}" class="w-[55px] h-[55px] mr-[24px] rounded-full" alt="">
      <div>
        <h5 class="font-semibold text-textPrimary text-2xl">${data.roomName}</h5>
        <p class="font-light text-textPrimary">${data.members.length} thành viên</p>
      </div>
    </div>
  `
}

// 3, Render tin nhắn trong group
const renderMessagesInRoom = async (roomId, page = 1) => {
  if (isLoading || !hasMore || !MY_ID || !roomId) return
  try {
    isLoading = true
    moreChatLoadingNode.style.display = 'block'
    const res = await apiClient.get(`/messages/${roomId}?page=${page}`)
    renderRoomInfo(res.data.roomInfo)
    const messagesData = res.data.data
    if (!messagesData.length) {
      page === 1 && (chatWrapperNode.innerHTML = '<p class="text-center text-textPrimary font-light mt-4 text-lg">Chưa có tin nhắn nào trong group này</p>')
      hasMore = false
      isLoading = false
      moreChatLoadingNode.style.display = 'none'
      return
    }
    hasMore = true
    messagesData.forEach(item => {
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
    if (page === 1) {
      chatContainerNode.scrollTo({
        top: chatContainerNode.scrollHeight,
        behavior: "smooth",
      })
    }
    isLoading = false
    moreChatLoadingNode.style.display = 'none'
  } catch (error) {
    console.log(error)
  }
}

// 4, Render giao diện
const render = async () => {
  await checkUser()
  await getGroups()
}
render()

// 5, Hiển thị thêm tin nhắn
chatContainerNode.addEventListener('scroll', () => {
  if (chatContainerNode.scrollTop === 0 && hasMore && !isLoading && CURRENT_ROOM_ID) {
    ++currentPage
    renderMessagesInRoom(CURRENT_ROOM_ID, currentPage)
  }
})
// END RENDER GIAO DIỆN

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
  if (!CURRENT_ROOM_ID) return
  e.preventDefault();
  const formData = new FormData();
  const messageInput = textInput.value;
  formData.append("content", messageInput);
  let urlImg = ''
  let messageType = 'text'
  if (imgInput.files.length > 0) {
    messageType = 'image'
    urlImg = URL.createObjectURL(imgInput.files[0]);
    console.log(urlImg);
    formData.append("image", imgInput.files[0]);
    formData.delete("content");
  }
  const messageElement = document.createElement('div')
  messageElement.className = 'flex mb-4 gap-2.5 cursor-pointer text-white *:bg-primary flex-row-reverse animate-pulse'
  messageElement.innerHTML = `
        <div class="size-9 rounded-full">
           <img src="${MY_INFO.avatar}"
                 alt="My Avatar" class="size-full object-cover rounded-full">
        </div>
        <div class="max-w-96 rounded-lg p-3">
           ${messageType === 'text' ? `<p>${textInput.value}</p>` : `<img class="max-w-60" src="${urlImg}" alt="">`}
        </div>
  `
  chatWrapperNode.append(messageElement)
  if (messageType === 'image') {
    textInput.classList.remove("hidden")
    imagePreview.innerHTML = ''
  }
  formMessage.reset()
  chatContainerNode.scrollTo({
    top: chatContainerNode.scrollHeight,
    behavior: "smooth",
  })
  try {
    const response = await apiClient.post(
      `/messages/${CURRENT_ROOM_ID}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    )
    messageElement.classList.remove('animate-pulse')
  } catch (err) {
    messageElement.remove()
    console.log(err);
  }
});

// Handle logout
$('#logout')?.addEventListener('click', (e) => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userInfo')
  window.location.href = '../../src/pages/signin.html'
})
