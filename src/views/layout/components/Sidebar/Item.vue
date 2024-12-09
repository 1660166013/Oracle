<template>
  <span>
    <svg-icon v-if="icon" :icon-class="icon"/>
    <span v-if="!isSidebarCollapse() && title" slot="title">{{ title }}</span>
  </span>
</template>

<script>
export default {
  name: 'MenuItem',
  functional: true,
  props: {
    isSidebarCollapse: {
      type: Boolean,
      default: false
    },
    icon: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  render(h, context) {
    const { icon, title } = context.props
    const vnodes = []

    if (icon) {
      vnodes.push(<svg-icon icon-class={icon}/>)
    }

    if (title) {
      vnodes.push(<span slot='title'>{(title)}</span>)
    }
    return vnodes
  }
}
</script>
