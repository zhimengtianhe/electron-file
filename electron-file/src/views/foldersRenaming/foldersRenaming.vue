<template>
  <div class="folders-renaming-map">
    <div class="select-row" @click="renameFolders">
      <p @click="renameFolders">批量修改文件夹名称</p>
    </div>

    <a-table :columns="columns" :data-source="fileList" :pagination="false" bordered>
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'operation'">
          <a @click="removeRow(record)">删除</a>
        </template>

        <template v-if="column.dataIndex === 'changed'">
          <!--成功-->
          <CheckOutlined
            v-if="record.changed === 1"
            :style="{ fontSize: '20px' }"
            theme="twoTone"
          />
          <!--成功 end-->
          <!--失败-->
          <CloseOutlined
            v-if="record.changed === 0"
            :style="{ fontSize: '20px' }"
            theme="twoTone"
          />
          <!--失败 end-->
          <div v-else></div>
        </template>
      </template>
      <template #title>
        已选择的文件夹：
        <a-button @click="removeAll"> 移除所有 </a-button>
      </template>

      <template #footer>
        <a-row type="flex" justify="space-between" :gutter="10">
          <a-col :span="8">
            新文件序号起始值 (数字)
            <a-input :precision="0" type="number" :min="1" v-model:value="fillStart" />
          </a-col>
          <a-col :span="8">
            序号增量 (数字)
            <a-input :precision="0" type="number" :min="0" :max="10" v-model:value="fillStep" />
          </a-col>
          <a-col :span="8">
            新文件夹名称
            <a-input v-model:value="filenameInput" />
          </a-col>

          <a-col :span="24" class="start-rename">
            <a-button @click="startRename" type="primary" size="large" block> 开始 </a-button>
          </a-col>
        </a-row>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup name="foldersRenaming">
declare var require: any
import { ref } from 'vue'
import { Row, Col, Input, Checkbox, Button, Divider, InputNumber, Upload } from 'ant-design-vue'
import { CloseOutlined, CheckOutlined } from '@ant-design/icons-vue'
const fs = require('fs')
const path = require('path')
import { ipcRenderer } from 'electron'

const columns = [
  {
    title: '文件夹名称',
    dataIndex: 'name'
  },
  {
    title: '文件夹路径',
    dataIndex: 'path'
  },
  {
    title: '操作',
    dataIndex: 'operation'
  },
  {
    title: '结果',
    dataIndex: 'changed'
  }
]

interface FileListType {
  name: string
  path: string
  changed: number
}

//选中的文件
const fileList = ref([] as FileListType[])

//单条删除
const removeRow = (file: FileListType) => {
  let list = fileList.value.filter((item) => item.path !== file.path)
  fileList.value = list
}

//所有选中的文件夹数据
const renameFolders = () => {
  ipcRenderer.send('open-directory-dialog')
  ipcRenderer.once('selected-directory', (event, directories) => {
    if (directories) {
      directories.forEach((oldPath: string) => {
        fileList.value.push({
          name: path.basename(oldPath),
          path: oldPath,
          changed: -1
        })
      })
    }
  })
}

//全部清除
const removeAll = () => {
  fileList.value = []
}

//文件名称
const filenameInput = ref('')

//起始值
const fillStart = ref(0)
//序号增量：
const fillStep = ref(0)

const createNewFilename = (index: number) => {
  //设置 递增序号
  const order = Number(fillStart.value) + Number(fillStep.value * index)
  const name = order.toString() + filenameInput.value
  return name
}

const startRename = () => {
  if (fileList.value.length === 0) {
    alert('请添加文件')
    return false
  }

  fileList.value.forEach((file: FileListType, index: number) => {
    //新名称
    const newFilename = createNewFilename(index)

    // 使用新文件夹名称来构建新路径
    const newPath = path.join(path.dirname(file.path), newFilename)
    // 重命名文件夹
    fs.rename(file.path, newPath, (err: Error) => {
      if (err) {
        file.changed = -1
        console.error(err)
      } else {
        file.changed = 1
      }
    })
  })
}
</script>
<style scoped>
.folders-renaming-map {
  padding: 40px;
}

.select-row {
  margin-bottom: 30px;
  height: 200px;
  text-align: center;
  background: rgba(0, 0, 0, 0.02);
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  padding: 16px 0;
}
.start-rename {
  margin-top: 20px;
}
</style>
