<template>
  <section class="app-main">
    <!-- 顶部图片 -->
    <div class="top-image-container">
      <img src="@/assets/top.png" alt="Top Image" class="top-image" />
    </div>

    <transition name="fade-transform" mode="out-in">
      <router-view :key="key" class="router-view-content" />
    </transition>

    <!-- 底部图片 -->
    <div class="bottom-image-container">
      <img src="@/assets/below.png" alt="Bottom Image" class="bottom-image" />
    </div>
  </section>
</template>

<script>
export default {
  name: 'AppMain',
  computed: {
    key() {
      return this.$route.name !== undefined ? this.$route.name + +new Date() : this.$route + +new Date()
    }
  }
}
</script>

<style scoped>
.app-main {
  /* 确保内容不会被图片覆盖 */
  min-height: calc(100vh - 50px); /* 50px 是导航栏的高度 */
  position: relative;
  padding: 60px 20px 60px; /* 增加 padding 以避免内容与图片重叠 */
  overflow: hidden;
  z-index: 1; /* 确保内容层次较高 */
}

.top-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0; /* 设置较低的层级，避免覆盖内容 */
}

.top-image {
  width: 100%;
  height: auto;
}

.bottom-image-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 0; /* 设置较低的层级，避免覆盖内容 */
}

.bottom-image {
  width: 100%;
  height: auto;
}

.router-view-content {
  position: relative;
  z-index: 1; /* 确保内容在图片上方 */
}
</style>
