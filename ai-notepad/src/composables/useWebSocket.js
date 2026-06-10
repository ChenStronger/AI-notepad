import { ref, onUnmounted } from 'vue'

export function useWebSocket(url = 'ws://localhost:8080/ws') {
  const socket = ref(null)
  const isConnected = ref(false)
  const lastMessage = ref(null)
  const error = ref(null)

  const connect = () => {
    if (socket.value) {
      socket.value.close()
    }

    socket.value = new WebSocket(url)

    socket.value.onopen = () => {
      isConnected.value = true
      error.value = null
    }

    socket.value.onmessage = (event) => {
      lastMessage.value = JSON.parse(event.data)
    }

    socket.value.onerror = (e) => {
      error.value = e
      isConnected.value = false
    }

    socket.value.onclose = () => {
      isConnected.value = false
    }
  }

  const send = (data) => {
    if (socket.value && isConnected.value) {
      socket.value.send(JSON.stringify(data))
    }
  }

  const disconnect = () => {
    if (socket.value) {
      socket.value.close()
      socket.value = null
    }
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    socket,
    isConnected,
    lastMessage,
    error,
    connect,
    send,
    disconnect
  }
}