export default function Notification(type, message, redirect) {
  const types = {
    success: {
      className: 'shadow-green-100 bg-green-300/50 border-green-400',
      iconPath: '../assets/icons/ti_success.svg'
    },
    error: {
      className: 'shadow-red-100 bg-red-300/50 border-red-400',
      iconPath: '../assets/icons/ti_error.svg'
    }
  }

  if (!types[type]) return

  const bodyNode = document.querySelector('body')
  const newNotification = document.createElement('div')
  newNotification.className = `
  flex items-center max-w-[300px] duration-300 ease-in-out shadow-md gap-4 backdrop-blur w-max px-4 py-2 
  rounded-lg border text-textPrimary font-medium fixed top-4 left-1/2 transform -translate-x-1/2 animate-notification
  ${types[type].className}
  `
  newNotification.innerHTML = `
   <div class="">
      <img class="size-8" src="${types[type].iconPath}" alt="">
    </div>
    <div class="">${message}</div>
  `
  bodyNode.appendChild(newNotification)
  setTimeout(() => {
    newNotification.style.top = '-100%'
  }, 2000)
  setTimeout(() => {
    newNotification.remove()
  }, 2300)
  if (redirect) {
    setTimeout(() => {
      window.location.href = redirect
    }, 2300)
  }
}
