<template>
  <el-scrollbar wrap-class="scrollbar-wrapper">
    <el-menu
      :show-timeout="200"
      :default-active="$route.path"
      :collapse="isCollapse"
      mode="vertical"
      background-color="#ffffff"
      text-color="#000000"
      active-text-color="#c9daf8"
    >
      <sidebar-item v-for="route in routes" :key="route.path" :item="route" :base-path="route.path"/>
    </el-menu>
  </el-scrollbar>
</template>

<script>
import { mapGetters } from 'vuex'
import SidebarItem from './SidebarItem'

export default {
  components: { SidebarItem },
  computed: {
    ...mapGetters([
      'sidebar'
    ]),
    routes() {
      return this.$router.options.routes
    },
    isCollapse() {
      return !this.sidebar.opened
    }
  }
}
</script>
<style scoped>
.sidebar-container {
  transition: width 0.28s;
  width: 180px; /* 正常状态下的宽度 */
  height: 100%;
  position: fixed;
  font-size: 0px;
  top: 0;
  bottom: 0;
  left: 0;
  z-index: 1001;
  overflow: hidden;
}

.sidebar-container.collapse {
  width: 64px; /* 折叠状态下的宽度 */
}

/* 确保在折叠状态下内容不溢出 */
.el-menu--vertical.collapse {
  width: 64px; /* 折叠状态下的宽度 */
}

/* 其他样式... */
</style>
