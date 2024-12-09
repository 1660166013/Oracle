<!-- src/components/CursiveRecognition.vue -->
<template>
    <div class="cursive-recognition-container">
      <el-container class="main-container">
        <!-- 主内容区域：上传和预览，识别结果 -->
        <el-main class="main-content">
          <el-card class="box-card">
            <div slot="header" class="card-header">
              <el-avatar icon="el-icon-edit"></el-avatar>
              <span class="header-title">草书识别</span>
            </div>
            <el-row :gutter="20" class="content-row">
              <!-- 上传和识别区域 -->
              <el-col :span="24" class="left-panel">
                <div class="upload-section">
                  <el-upload
                    class="upload-demo"
                    drag
                    action=""  
                    :before-upload="beforeUpload"
                    :on-change="handleChange"
                    :show-file-list="false"
                    :limit="1"
                    accept="image/png, image/jpeg"
                  >
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div slot="tip" class="el-upload__tip">只能上传 JPG/PNG 文件，且不超过 5MB</div>
                  </el-upload>
                  <el-button
                    type="primary"
                    :loading="loading"
                    @click="recognizeText"
                    :disabled="!imageFile || loading"
                    class="recognize-button"
                  >
                    识别文字
                  </el-button>
                </div>
                <div class="image-preview" v-if="imageUrl">
                  <el-card shadow="hover">
                    <img :src="imageUrl" alt="Uploaded Image" class="preview-img" />
                  </el-card>
                </div>
              </el-col>
              <!-- 识别结果 -->
              <el-col :span="24" class="right-panel" v-if="recognizedText">
                <div class="result-section">
                  <el-divider></el-divider>
                  <div class="result-box">
                    <h3>识别结果</h3>
                    <el-input
                      type="textarea"
                      :value="recognizedText"
                      readonly
                      placeholder="识别结果将显示在这里..."
                      rows="6"
                    ></el-input>
                  </div>
                </div>
              </el-col>
            </el-row>
          </el-card>
        </el-main>
  
        <!-- 侧边栏：历史记录 -->
        <el-aside width="400px" class="aside-history">
          <div class="history-section">
            <h3>历史记录</h3>
            <el-button
              type="danger"
              size="mini"
              @click="clearHistory"
              class="clear-history-button"
              :disabled="messageHistory.length === 0"
            >
              清空历史
            </el-button>
            <div class="history-list">
              <el-scrollbar style="height: calc(100% - 60px); margin-top: 10px;">
                <el-card
                  v-for="(record, index) in messageHistory"
                  :key="index"
                  class="history-card"
                  @click="loadHistory(record)"
                  :shadow="'hover'"
                >
                  <el-row :gutter="10">
                    <el-col :span="6">
                      <img :src="record.imageUrl" alt="Thumbnail" class="thumbnail-img" />
                    </el-col>
                    <el-col :span="18">
                      <div class="record-info">
                        <p class="timestamp">{{ record.timestamp }}</p>
                        <p class="filename">{{ record.originalName }}</p>
                        <p class="recognized-text">{{ record.recognizedText }}</p>
                      </div>
                    </el-col>
                  </el-row>
                  <el-button
                    type="text"
                    size="mini"
                    class="delete-button"
                    @click.stop="deleteHistory(index)"
                  >
                    删除
                  </el-button>
                </el-card>
                <p v-if="messageHistory.length === 0" class="no-history">暂无历史记录</p>
              </el-scrollbar>
            </div>
          </div>
        </el-aside>
      </el-container>
  
      <!-- 成功提示 -->
      <el-dialog
        :visible.sync="successDialogVisible"
        :modal-append-to-body="false"
        title="识别成功"
        width="30%"
        :before-close="handleClose"
        center
      >
        <span>草书文字识别完成！</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="successDialogVisible = false">确定</el-button>
        </span>
      </el-dialog>
  
      <!-- 错误提示 -->
      <el-dialog
        :visible.sync="errorDialogVisible"
        :modal-append-to-body="false"
        title="识别失败"
        width="30%"
        :before-close="handleClose"
        center
      >
        <span>草书文字识别过程中出错，请稍后重试。</span>
        <span slot="footer" class="dialog-footer">
          <el-button type="primary" @click="errorDialogVisible = false">确定</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script>
  export default {
    name: 'CursiveRecognition',
    data() {
      return {
        imageFile: null,               // 上传的文件对象
        imageUrl: '',                  // 上传图片的URL
        recognizedText: '',            // 识别出的文字
        loading: false,                // 识别过程中的加载状态
        messageHistory: [],            // 历史记录
        selectedHistory: null,         // 当前选中的历史记录
        successDialogVisible: false,   // 识别成功提示框
        errorDialogVisible: false,     // 识别失败提示框
      };
    },
    methods: {
      beforeUpload(file) {
        const isJPG = file.type === 'image/jpeg' || file.type === 'image/png';
        const isLt5M = file.size / 1024 / 1024 < 5;
  
        if (!isJPG) {
          this.$message.error('上传图片只能是 JPG/PNG 格式!');
        }
        if (!isLt5M) {
          this.$message.error('上传图片大小不能超过 5MB!');
        }
        return isJPG && isLt5M;
      },
      handleChange(file, fileList) {
        this.imageFile = file.raw;
        this.previewImage(file.raw);
      },
      previewImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageUrl = e.target.result;
        };
        reader.readAsDataURL(file);
      },
      recognizeText() {
        if (!this.imageFile) {
          this.$message.warning('请先上传一张草书图片。');
          return;
        }
  
        this.loading = true;
        this.recognizedText = '';
  
        // 模拟识别过程
        setTimeout(() => {
          // 模拟成功和失败
          const isSuccess = Math.random() > 0.2; // 80% 成功率
          if (isSuccess) {
            // 模拟识别结果
            this.recognizedText = '这是一个模拟的草书识别结果。';
            this.successDialogVisible = true;
  
            // 保存到历史记录，包括 imageUrl
            const newRecord = {
              timestamp: new Date().toLocaleString(),
              originalName: this.imageFile.name,
              recognizedText: this.recognizedText,
              imageUrl: this.imageUrl, // 保存图片的 Data URL
            };
            this.messageHistory.unshift(newRecord);
            this.saveHistory();
          } else {
            // 模拟识别失败
            this.errorDialogVisible = true;
          }
          this.loading = false;
        }, 2000);
      },
      handleClose(done) {
        done();
      },
      saveHistory() {
        // 将历史记录保存到 localStorage
        localStorage.setItem('cursiveRecognitionHistory', JSON.stringify(this.messageHistory));
      },
      loadHistoryFromStorage() {
        const history = localStorage.getItem('cursiveRecognitionHistory');
        if (history) {
          this.messageHistory = JSON.parse(history);
        }
      },
      loadHistory(record) {
        if (record && record.recognizedText && record.imageUrl) {
          this.imageUrl = record.imageUrl; // 加载对应的图片
          this.recognizedText = record.recognizedText;
          this.$message.success('历史识别结果已加载。');
        }
      },
      onCurrentChange(row) {
        this.selectedHistory = row;
      },
      deleteHistory(index) {
        this.$confirm('确定要删除这条历史记录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.messageHistory.splice(index, 1);
          this.saveHistory();
          this.$message({
            type: 'success',
            message: '删除成功!',
          });
          if (this.selectedHistory && this.messageHistory[index] !== this.selectedHistory) {
            this.selectedHistory = null;
          }
        }).catch(() => {
          // 取消删除
        });
      },
      clearHistory() {
        if (this.messageHistory.length === 0) {
          this.$message.info('没有历史记录可清空。');
          return;
        }
  
        this.$confirm('确定要清空所有历史记录吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }).then(() => {
          this.messageHistory = [];
          this.saveHistory();
          this.$message({
            type: 'success',
            message: '所有历史记录已清空!',
          });
          this.selectedHistory = null;
        }).catch(() => {
          // 取消清空
        });
      },
    },
    mounted() {
      this.loadHistoryFromStorage();
    },
  };
  </script>
  
  <style scoped>
  .cursive-recognition-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0; /* 去除外边距 */
    height: 100vh; /* 填满整个视口高度 */
    box-sizing: border-box;
  }
  
  .main-container {
    width: 100%;
    height: 100%;
  }
  
  .box-card {
    width: 100%;
    height: 100%;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    border-radius: 10px;
    background-color: #ffffff;
    display: flex;
    flex-direction: column;
  }
  
  .card-header {
    display: flex;
    align-items: center;
  }
  
  .header-title {
    margin-left: 10px;
    font-size: 24px;
    font-weight: bold;
    color: #409EFF;
  }
  
  .main-content {
    margin-top: 20px;
    flex-grow: 1; /* 使主内容区域填满剩余空间 */
    overflow: hidden; /* 防止主内容区域出现滚动条 */
  }
  
  .content-row {
    height: 100%;
  }
  
  .left-panel, .right-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .upload-section {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .upload-demo {
    width: 100%;
    height: 220px;
    border: 2px dashed #d9d9d9;
    border-radius: 10px;
    cursor: pointer;
    margin-bottom: 15px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s;
  }
  
  .upload-demo:hover {
    border-color: #409EFF;
  }
  
  .el-upload__text em {
    color: #409EFF;
    cursor: pointer;
  }
  
  .recognize-button {
    width: 150px;
  }
  
  .image-preview {
    text-align: center;
    margin-top: 15px;
    flex-grow: 1;
    overflow: hidden;
  }
  
  .preview-img {
    max-width: 100%;
    max-height: 400px;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
  }
  
  .preview-img:hover {
    transform: scale(1.02);
  }
  
  .result-section {
    margin-bottom: 20px;
  }
  
  .result-box {
    padding: 15px;
    background-color: #f9f9f9;
    border-radius: 10px;
  }
  
  .result-box h3 {
    margin-bottom: 15px;
    color: #303133;
  }
  
  /* 侧边栏样式 */
  .aside-history {
    background-color: #f9f9f9;
    border-left: 1px solid #ebeef5;
    overflow: hidden;
    padding: 20px;
  }
  
  .history-section {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  
  .history-section h3 {
    margin-bottom: 10px;
    color: #303133;
  }
  
  .clear-history-button {
    align-self: flex-end;
  }
  
  .history-list {
    flex-grow: 1;
  }
  
  .history-card {
    margin-bottom: 10px;
    cursor: pointer;
    position: relative;
  }
  
  .history-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
  
  .thumbnail-img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: 5px;
  }
  
  .record-info {
    display: flex;
    flex-direction: column;
  }
  
  .record-info p {
    margin: 2px 0;
    font-size: 14px;
    color: #303133;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .record-info .timestamp {
    font-weight: bold;
  }
  
  .recognized-text {
    font-size: 12px;
    color: #606266;
  }
  
  .delete-button {
    position: absolute;
    top: 5px;
    right: 5px;
  }
  
  .selected-history {
    margin-top: 20px;
  }
  
  .selected-history h4 {
    margin-bottom: 10px;
    color: #303133;
  }
  
  .selected-history .preview-img {
    max-width: 100%;
    max-height: 200px;
    margin-bottom: 10px;
  }
  
  .no-history {
    text-align: center;
    color: #606266;
    margin-top: 20px;
  }
  
  /* 响应式设计 */
  @media (max-width: 1024px) {
    .aside-history {
      display: none; /* 隐藏侧边栏，在小屏幕上可以考虑弹出对话框 */
    }
  
    .main-container {
      max-width: 1000px;
    }
  }
  
  @media (max-width: 768px) {
    .box-card {
      max-width: 100%;
    }
  
    .el-row {
      flex-direction: column;
    }
  
    .el-col {
      span: 24 !important;
    }
  
    .image-preview {
      margin-top: 10px;
    }
  
    .result-section {
      margin-top: 10px;
    }
  }
  </style>
  