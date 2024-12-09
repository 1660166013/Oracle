<template>
  <div id="chat-container">
    <el-container style="height: 100vh;">
      <el-main>
        <div class="chat-messages">
          <el-scrollbar ref="messagesScrollbar">
            <transition-group name="fade">
              <div
                v-for="(message, index) in messages"
                :key="index"
                :class="message.type"
                @animationend="removeMessage(index)"
              >
                <img v-if="message.type === 'bot'" src="../../assets/ml.png" alt="Bot" class="chat-avatar">
                <div class="message-content">{{ message.content }}</div>
              </div>
            </transition-group>
          </el-scrollbar>
        </div>
        <div class="chat-input">
          <el-input
            v-model="inputMessage"
            placeholder="请输入消息..."
            @keyup.enter.native="sendMessage"
          ></el-input>
          <el-button type="primary" @click="resetChat">开始新会话</el-button>
          <el-button type="primary" @click="openHistoryDialog">历史记录</el-button>
          <el-button type="primary" @click="sendMessage">发送</el-button>
        </div>
      </el-main>
    </el-container>
    <!-- 历史记录对话框 -->
    <el-dialog :visible.sync="historyDialogVisible" title="历史记录">
      <el-table :data="messageHistory" @row-click="loadHistory">
        <el-table-column
          property="firstUserMessage"
          label="选择历史对话"
          width="200"
        ></el-table-column>
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'ChatApp',   ////////////修改这里的名称
  data() {
    return {
      inputMessage: '',
      messages: [
        { type: 'bot', content: '你好，我是聊天机器人。有什么可以帮助你的吗？' }
      ],
      messageHistory: [], // 存储历史聊天记录
      historyDialogVisible: false, // 是否显示历史对话框
      sessionId: null // 后端会话ID
    };
  },
  methods: {
    async startSession() {
      // 开始会话，获取后端会话ID
      try {
        const response = await axios.post('后端api', { message: '开始会话' });
        this.sessionId = response.data.sessionId; // 获取后端会话ID
      } catch (error) {
        console.error('Error starting session:', error);
      }
    },
    async sendMessage() {
  if (this.inputMessage.trim() === '') {
    return;
  }

  const userMessage = { type: 'user', content: this.inputMessage, sessionId: this.sessionId };
  this.messages.push(userMessage); // 将用户消息添加到聊天记录中

  // 判断是否需要添加到历史记录
  if (this.messageHistory.length === 0 || !this.messagesEqual(this.messageHistory[this.messageHistory.length - 1].messages, this.messages)) {
    // 将当前会话添加到历史记录
    this.messageHistory.push({
      firstUserMessage: userMessage.content,
      messages: this.messages.slice()
    });
  }

  this.getBotResponse(userMessage.content);
  this.inputMessage = '';
  this.scrollToBottom();
},

// 辅助方法：比较两个消息数组是否相等
messagesEqual(messages1, messages2) {
  if (messages1.length !== messages2.length) {
    return false;
  }
  for (let i = 0; i < messages1.length; i++) {
    if (messages1[i].type !== messages2[i].type || messages1[i].content !== messages2[i].content) {
      return false;
    }
  }
  return true;
},

// 辅助方法：滚动到聊天记录底部
scrollToBottom() {
  this.$nextTick(() => {
    this.$refs.messagesScrollbar.wrap.scrollTop = this.$refs.messagesScrollbar.wrap.scrollHeight;
  });
},

    async getBotResponse(message) {
      try {
        const response = await axios.post('后端api', { message, sessionId: this.sessionId });
        const botResponse = { type: 'bot', content: response.data.response };
        this.messages.push(botResponse);

        this.$nextTick(() => {
          this.$refs.messagesScrollbar.wrap.scrollTop = this.$refs.messagesScrollbar.wrap.scrollHeight;
        });
      } catch (error) {
        console.error('Error fetching bot response:', error);
      }
    },
    resetChat() {
  const firstUserMessage = this.messages.find(message => message.type === 'user');
  if (firstUserMessage) {
    this.messageHistory.push({
      firstUserMessage: firstUserMessage.content,
      messages: this.messages.slice()
    });
  }
  this.messages = [
    { type: 'bot', content: '你好，我是聊天机器人。有什么可以帮助你的吗？' }
  ];
},

loadHistory(row) {
  // 假设 row 是一个包含历史消息数组的对象
  this.messages = row.messages; // 替换当前的聊天记录为所选历史记录
  this.historyDialogVisible = false; // 关闭历史记录对话框
}
,
    openHistoryDialog() {
      this.historyDialogVisible = true;
    },

  },
  mounted() {
    this.startSession(); // 初始化时开始会话
  }
}
</script>

<style scoped>
#chat-container {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
}

.chat-messages {
  height: calc(100vh - 100px);
  overflow: auto;
  padding: 10px;
}

.chat-messages .user {
  text-align: right;
}

.chat-messages .bot {
  text-align: left;
}

.chat-messages .message-content {
  display: inline-block;
  padding: 10px;
  margin: 5px 0;
  border-radius: 10px;
  background-color: #f3f3f3;
  max-width: 70%;
}

.chat-input {
  position: fixed;
  bottom: 0;
  width: 96%;      /* 根据需要调整宽度 */
  background-color: #fff;
  padding: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.1);
}

/* 调整输入框样式，使其居左 */
.chat-input .el-input {
  flex-grow: 1;
  margin-left: 10px;

}

/* 调整按钮样式，使其与输入框对齐 */
.chat-input .el-button {
  /* 根据需要调整宽度 */
  width: 150px;
}

.chat-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 10px;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s;
}

.fade-enter, .fade-leave-to {
  opacity: 0;
}
</style>
