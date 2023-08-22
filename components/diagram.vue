<script setup lang="ts">
import mermaid from 'mermaid';
import panzoom from 'panzoom';

const props = defineProps<{
  src: string;
}>();

const divRef = ref<HTMLDivElement>();

onMounted(() => {
  if (props.src && divRef.value) {
    mermaid.initialize({ fontSize: 32 });
    mermaid.run({ nodes: [divRef.value] });
    panzoom(divRef.value);
  }
});
</script>

<template>
  <div ref="divRef">{{ props.src }}</div>
</template>
