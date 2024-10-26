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

let MY_ID = ''
let CURRENT_ROOM_ID = ''
let MY_INFO = {
  username: '',
  avatar: '',
  id: ''
}

// Kiểm tra User
const checkUser = async () => {
  try {
    const res = await apiClient.get('/users/verify_token')
    localStorage.setItem("userInfo", JSON.stringify(res.data.data))
    MY_ID = res.data.data?._id
    MY_INFO = {
      username: res.data.data?.username,
      avatar: res.data.data?.avatar,
      id: res.data.data?._id
    }
  } catch (error) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    window.location.href = '../../src/pages/signin.html'
  }
}

// RENDER GIAO DIỆN
// 1, Get Groups
const getGroups = async () => {
  try {
    const response = await apiClient.get("/rooms/get_all");
    const groups = response.data.data;
    CURRENT_ROOM_ID = groups[0]?._id
    const htmls = groups.reduce((acc, room) => {
      const timestamp = room.createAt;
      const date = new Date(timestamp);
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, "0");
      const period = hours >= 12 ? "pm" : "am";
      const formattedHours = hours % 12 || 12;
      const formattedTime = `${formattedHours}.${minutes}${period}`;
      return acc + `
       <li class="flex items-center border-b border-[#B4ABAB] py-[14px]" >
               <img src=${room.avatarRoom} class="w-[45px] h-[45px] mr-[16px]"
                     alt="no img">
               <div class="flex items-center justify-between w-full">
                     <div class="flex flex-col">
                        <h4 class="text-base text-textPrimary font-semibold">${room.roomName
        }</h4>
                        <p class="text-textPrimary font-light text-sm max-w-[185px] line-clamp-1">${room?.latestMessage?.content || "chưa có tin nhắn nào"
        }
                       </p>
                     </div>
                     <div class="flex flex-col items-end">
                        <p class="text-[12px] text-textPrimary font-light">${formattedTime}</p>
                     </div>
               </div>
            </li>
      `
    }, '')
    listGroups.innerHTML = htmls
  } catch (error) {
    console.log(err)
  }
}

// 2, Render tin nhắn trong group
let currentPage = 1
let hasMore = true
let isLoading = false

const renderMessagesInRoom = async (roomId, page = 1) => {
  if (isLoading || !hasMore || !MY_ID || !roomId) return
  try {
    isLoading = true
    moreChatLoadingNode.style.display = 'block'
    const res = await apiClient.get(`/messages/${roomId}?page=${page}`)
    const messagesData = res.data.data
    if (messagesData.length === 0) {
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
    isLoading = false
    moreChatLoadingNode.style.display = 'none'
  } catch (error) {
    console.log(error)
  }
}

// 3, Render giao diện
const render = async () => {
  await checkUser()
  await getGroups()
  await renderMessagesInRoom(CURRENT_ROOM_ID)
  chatContainerNode.scrollTo({
    top: chatContainerNode.scrollHeight,
    behavior: "smooth",
  })
}
render()

// Hiển thị thêm tin nhắn
chatContainerNode.addEventListener('scroll', () => {
  if (chatContainerNode.scrollTop === 0 && hasMore && !isLoading && CURRENT_ROOM_ID) {
    ++currentPage
    renderMessagesInRoom(CURRENT_ROOM_ID, currentPage)
  }
})

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
    // renderMessagesInRoom(CURRENT_ROOM_ID)
    let messageType = 'text'
    const messageElement = document.createElement('div')
    messageElement.className = 'flex mb-4 gap-2.5 cursor-pointer text-white *:bg-primary flex-row-reverse'
    messageElement.innerHTML = `
          <div class="size-9 rounded-full">
             <img src="${MY_INFO.avatar}"
                   alt="My Avatar" class="size-full object-cover rounded-full">
          </div>
          <div class="max-w-96 rounded-lg p-3">
             ${messageType === 'text' ? `<p>${textInput.value}</p>` : `<img class="max-w-60" src="${messageType}" alt="">`}
          </div>
    `
    chatWrapperNode.append(messageElement)
    chatContainerNode.scrollTo({
      top: chatContainerNode.scrollHeight,
      behavior: "smooth",
    })

  } catch (err) {
    console.log(err);
  }
});

// Handle logout
$('#logout')?.addEventListener('click', (e) => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userInfo')
  window.location.href = '../../src/pages/signin.html'
})
