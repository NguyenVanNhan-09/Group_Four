import apiClient from "./axiosConfig.js"
import Notification from "./notification.js"

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
const formAddMember = $('#form__add-member')
const listAddMember = $('#list__add-member')
const formSeachGroup = $('#form__search-group')
const roomId = $('#input-group-2')
const listSearchGroup = $('#listSearchGroup')
const modalSearch = $('#modalSearch')
const btnLeaveGroup = $('#btn-leave-group')
const modalGroupInfo = $('#modal-group-info')
const roomInfoNode = $('#room-info')
const roomInfoDetailNode = $('#room-info__detail')

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
let LATEST_MESS_MEMORY = ''
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
      let formattedTime = ''
      if (room.latestMessage?.createAt) {
        const timestamp = room.latestMessage.createAt;
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes().toString().padStart(2, "0");
        const period = hours >= 12 ? " pm" : " am";
        const formattedHours = hours % 12 || 12;
        formattedTime = `${formattedHours}:${minutes}${period}`;
      }
      let latestMess = 'Chưa có tin nhắn nào'
      if (room.latestMessage?.message) {
        latestMess = room.latestMessage.message.type === 'text' ? room.latestMessage.message.content : 'Đã gửi hình ảnh'
      }
      return acc + `
       <li id="${room._id}" class="flex items-center border-b border-[#b4abab34] py-[14px] cursor-pointer hover:bg-gray-100 px-3 first:bg-[#e5efff]/80 rounded" >
               <div class="size-12 border-[0.5px] mr-[16px] rounded-full flex-shrink-0 overflow-hidden">
                  <img src=${room.avatarRoom} class="img-cover" alt="no img">
               </div>
               <div class="flex items-center justify-between w-full">
                     <div class="flex flex-col">
                        <h4 class="text-lg text-textPrimary font-semibold line-clamp-1">${room.roomName}</h4>
                        <p class="text-textPrimary font-light text-sm max-w-[185px] line-clamp-1">${latestMess}
                       </p>
                     </div>
                     <div class="flex flex-col items-end flex-shrink-0">
                        <p class="text-[12px] text-textPrimary">${formattedTime}</p>
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
    console.log(error)
  }
}

// 2, Render thông tin group
const renderRoomInfo = async (data) => {
  console.log(data);
  roomInfoNode.innerHTML = `
  <div class="flex items-center cursor-pointer">
      <img src="${data.avatarRoom}" class="w-[55px] h-[55px] mr-[24px] rounded-full" alt="">
      <div>
        <h5 class="font-semibold text-textPrimary text-2xl">${data.roomName}</h5>
        <p class="font-light text-textPrimary">${data.members.length} thành viên</p>
      </div>
    </div>
  `
  roomInfoDetailNode.innerHTML = `
  <div class="flex flex-col items-center gap-2 py-2">
                    <div class="size-20 rounded-full overflow-hidden">
                        <img class="img-cover"
                            src="${data.avatarRoom}" alt="">
                    </div>
                    <div class="text-2xl font-semibold text-textPrimary">${data.roomName}</div>
                </div>
                <div class="border-b-4 border-t-4 p-3">
                    <div class="">Thành viên (${data.members.length})</div>
                    <ul class="max-h-[200px] overflow-y-auto mt-2">
                        <li class="flex items-center gap-4 border-b py-1">
                            <div class="size-12 rounded-full overflow-hidden">
                                <img src="https://media-cdn-v2.laodong.vn/storage/newsportal/2023/7/25/1220914/Rose.jpg"
                                    class="img-cover" alt="">
                            </div>
                            <p class="text-gray-600 text-base">Nhóm 444</p>
                        </li>
                    </ul>
                </div>
                <div class="py-3 px-1 space-y-1">
                    <div class="flex items-center gap-4 hover:bg-gray-100 cursor-pointer p-2 rounded-md">
                        <img class="size-8" src="../assets/icons/link-alt-1-svgrepo-com.svg" alt="">
                        <div class="flex flex-col justify-between text-textPrimary">
                            <div class="text-lg font-medium">Id nhóm</div>
                            <div class="text-primary">${data._id}</div>
                        </div>
                    </div>
                    <div id="btn-leave-group" class="flex items-center gap-4 hover:bg-gray-100 cursor-pointer p-2 rounded-md">
                        <img class="size-8" src="../assets/icons/session-leave-svgrepo-com.svg" alt="">
                        <div class="text-lg font-medium text-red-500">Rời nhóm</div>
                    </div>
                </div>

  `
  const renderMembersHtmlStr = data.members.reduce((acc, member) => {
    return acc + `
    <li class="flex items-center gap-4 border-b py-1">
        <div class="size-12 rounded-full overflow-hidden">
            <img src="https://media-cdn-v2.laodong.vn/storage/newsportal/2023/7/25/1220914/Rose.jpg"
                class="img-cover" alt="">
        </div>
        <p class="text-gray-600 text-base">${member.userName}</p>
    </li>
    `
  }, '')
  roomInfoDetailNode.querySelector('ul').innerHTML = renderMembersHtmlStr
  roomInfoDetailNode.querySelector('#btn-leave-group').addEventListener('click', async (e) => {
    try {
      const res = await apiClient.put(`/rooms/leave/${CURRENT_ROOM_ID}`)
      Notification('success', res.data.message)
      getGroups()
    } catch (error) {
      console.log(error)
      Notification('error', error.response.data.message)
    }
  })
}

roomInfoNode.addEventListener('click', () => {
  modalGroupInfo.style.display = 'flex'
})

// 3, Render tin nhắn trong group
const renderMessagesInRoom = async (roomId, page = 1) => {
  if (isLoading || !hasMore || !MY_ID || !roomId) return
  try {
    isLoading = true
    moreChatLoadingNode.style.display = 'block'
    const res = await apiClient.get(`/messages/${roomId}?page=${page}`)
    renderRoomInfo(res.data.roomInfo)
    const messagesData = res.data.data
    if (page === 1) LATEST_MESS_MEMORY = messagesData[0]?._id
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

// Realtime
const handleUpdateMessageRealTime = async (roomId) => {
  if (currentPage !== 1) return
  try {
    const res = await apiClient.get(`/messages/${roomId}?page=1`)
    const data = res.data.data
    let currentLatestMessage = data[0]?._id
    if (!LATEST_MESS_MEMORY || currentLatestMessage === LATEST_MESS_MEMORY) {
      LATEST_MESS_MEMORY = currentLatestMessage
      return
    }
    console.log('Update');
    const index = res.data.data.findIndex(item => item._id === LATEST_MESS_MEMORY)
    if (index === -1) return
    data.splice(index)
    data.forEach(item => {
      const messageElement = document.createElement('div')
      if (MY_ID === item.userInfo.userId) return
      messageElement.className = `flex mb-4 gap-2.5 cursor-pointer text-white *:bg-gray-400`
      messageElement.innerHTML = `
            <div class="size-9 rounded-full">
               <img src="${item.userInfo.avatar}"
                     alt="My Avatar" class="size-full object-cover rounded-full">
            </div>
            <div class="max-w-96 rounded-lg p-3">
               ${item.message.type === 'text' ? `<p>${item.message.content}</p>` : `<img class="max-w-60" src="${item.message.content}" alt="">`}
            </div>
      `
      chatWrapperNode.append(messageElement)
      chatContainerNode.scrollTo({
        top: chatContainerNode.scrollHeight,
        behavior: "smooth",
      })
    })
    LATEST_MESS_MEMORY = currentLatestMessage
  } catch (error) {
    console.log(error);
  }
}

let REAL_TIME_UPDATE_MESSAGE = setInterval(() => {
  handleUpdateMessageRealTime(CURRENT_ROOM_ID)
}, 2000)
// clearInterval(REAL_TIME_UPDATE_MESSAGE)

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
      Notification("success", response.data.message);
      getGroups()
    } catch (err) {
      console.log(err);
      Notification("error", err.response.data.message);
    }
  }
  createGroup(data);
});


// Search group
formSeachGroup.addEventListener('submit', async (e) => {
  e.preventDefault()
  console.log(roomId.value);
  try {
    const res = await apiClient.get(`/rooms//detail/${roomId.value}`)
    let rooms = res.data.data
    listSearchGroup.innerHTML = `
        <li id="${rooms._id}" class="flex justify-between items-center cursor-pointer">
          <div class="flex items-center gap-4">
            <img src="${rooms.avatarRoom}"
                class="w-10 h-10 rounded-full" alt="">
            <p class="text-gray-600 text-base">${rooms.roomName}</p>
          </div>
          <span id="btn-join-group"><img src="../assets/icons/ti-arrow-r.svg" alt=""></span>
        </li>
    `
    const btnJoinGroup = listSearchGroup.querySelector('#btn-join-group')
    btnJoinGroup.addEventListener('click', async () => {
      try {
        const res = await apiClient.put(`/rooms/join/${rooms._id}`, {
          userId: MY_ID
        })
        Notification('success', 'Thành viên đã tham gia thành công')
        getGroups()
        modalSearch.style.display = 'none';
      } catch (error) {
        Notification('error', error?.response?.data?.message)
      }
    })

  } catch (error) {
    Notification('error', "Không tìm thấy group nào")
  }

})

// Thêm thành viên
const handleAddMember = async (userId) => {
  try {
    const res = await apiClient.put(`/rooms/join/${CURRENT_ROOM_ID}`, {
      userId: userId
    })
    Notification('success', 'Thành viên đã tham gia thành công')
  } catch (error) {
    console.log(error);
    Notification('error', error?.response?.data?.message)
  }
}

// Tìm thành viên
formAddMember.addEventListener('submit', async (e) => {
  e.preventDefault()
  const keyWord = formAddMember.querySelector('input').value
  const response = await apiClient.get(`/users/search?q=${keyWord}`)

  console.log(response.data.data)

  const users = response.data.data
  if (users.length === 0) {
    Notification('error', 'Không tìm thấy user nào')
    listAddMember.innerHTML = `<div class="text-center text-textPrimary font-light mt-4 text-lg">Không tìm thấy user nào</div>`
    return
  }
  const htmls = users.reduce((acc, user) => {
    return acc + `
      <li id="${user.id}" class="flex items-center gap-3 mb-2 text-lg hover:bg-gray-200 p-2 rounded-md">
        <div class="size-12 rounded-full overflow-hidden">
          <img src="${user.avatar}" class="img-cover" alt="">
        </div>
        <div>${user.username}</div>
        <img id="btn_add_this_member" src="../assets/icons/add.svg" alt="" class="size-10 rounded-full hover:bg-primary/10 ml-auto">
      </li>
    `
  }, '')
  listAddMember.innerHTML = htmls;

  [...listAddMember.children].forEach(item => {
    item.querySelector('#btn_add_this_member').addEventListener('click', () => {
      handleAddMember(item.id)
    })
  })

})

// Ròi nhóm
// btnLeaveGroup.addEventListener('click', async (e) => {
//   try {
//     const res = await apiClient.put(`/rooms/leave/${CURRENT_ROOM_ID}`)
//     Notification('success', res.data.data.message)
//     getGroups()
//   } catch (error) {
//     console.log(error)
//     Notification('error', error.response.data.message)
//   }
// })

// Handle logout
$('#logout')?.addEventListener('click', (e) => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('userInfo')
  window.location.href = '../../src/pages/signin.html'
})
