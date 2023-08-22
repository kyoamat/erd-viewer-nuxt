<script setup lang="ts">
import type { Table } from '@/types/table';

const isLoading = ref(false);
const connStr = ref('');
const src = ref('');

const buttonClass = computed(() =>
  isLoading.value ? 'button is-loading' : 'button'
);

const handleSubmit = async () => {
  try {
    isLoading.value = true;
    const res = await useFetch('/api/show-tables', {
      method: 'post',
      body: {
        connStr: connStr.value,
      },
    });
    if (res.error.value) {
      alert(res.error.value?.statusMessage);
    } else {
      src.value = createMermaidSrc(res.data.value as Table[]);
    }
  } catch {
    alert('ERROR!');
  } finally {
    isLoading.value = false;
  }
};

const createMermaidSrc = (tables: Table[]) => {
  let srcTxt = 'classDiagram';
  for (const table of tables) {
    srcTxt += `\n  class ${table.name} {\n`;
    for (const column of table.columns) {
      srcTxt += `    ${column.Null === 'NO' ? '*' : ''}${
        column.Field
      }: ${column.Type.replace('(', '<').replace(')', '>')} ${
        column.Key === 'PRI' ? '[PK]' : ''
      }\n`; // カッコはメソッドとみなされるため変換している
    }
    srcTxt += '  }\n';
    for (const constraint of table.constraints) {
      if (constraint.REFERENCED_TABLE_NAME) {
        srcTxt += `${constraint.REFERENCED_TABLE_NAME} <|-- ${table.name}\n`;
      }
    }
    srcTxt += '\n';
  }

  return srcTxt;
};
</script>

<template>
  <div class="mx-3">
    <div class="my-2">Connection String</div>
    <input v-model="connStr" class="input my-2" type="text" />
    <button :class="buttonClass" @click="handleSubmit">Submit</button>
    <div style="overflow: hidden">
      <Diagram v-if="!isLoading" ref="diagram" :src="src" />
    </div>
  </div>
</template>
