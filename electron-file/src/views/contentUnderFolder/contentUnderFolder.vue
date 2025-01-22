<template>
  <div class="content-under-folder-map">
    <div class="select-row" @click="getFolderContents">
      <p @click="getFolderContents">选择文件夹</p>
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
          <a-col :span="6">
            文件序号起始值 (数字)
            <a-input :precision="0" :min="1" type="number" v-model:value="fillStart" />
          </a-col>
          <a-col :span="6">
            序号增量 (数字)
            <a-input :precision="0" :min="0" type="number" :max="10" v-model:value="fillStep" />
          </a-col>
          <a-col :span="6">
            文件名
            <a-input v-model:value="filenameInput" />
          </a-col>
          <a-col :span="6">
            后缀
            <a-input v-model:value="filenameSuffix" />
          </a-col>

          <a-col :span="24" class="start-rename">
            <a-button @click="startRename" type="primary" size="large" block> 开始 </a-button>
          </a-col>
        </a-row>
      </template>
    </a-table>
  </div>
</template>
<script lang="ts" setup name="contentUnderFolder">
declare var require: any
import { ipcRenderer } from 'electron'
const fs = require('fs')
const path = require('path')
import { ref } from 'vue'
import { Row, Col, Input, Checkbox, Button, Divider, InputNumber, Upload } from 'ant-design-vue'

import { CloseOutlined, CheckOutlined } from '@ant-design/icons-vue'
const columns = [
  {
    title: '文件路径',
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
  path: string
  changed: number
}

const fileList = ref([] as FileListType[])

const getFolderContents = () => {
  ipcRenderer.send('open-directory-dialog')
  ipcRenderer.once('selected-directory', async (event, directories) => {
    if (directories) {
      directories.forEach((oldPath: string) => {
        fs.readdir(oldPath, (err: Error, files: string[]) => {
          if (err) {
            console.error(err)
            return
          }
          const allFiles = files.map((file: string) => path.join(oldPath, file))
          allFiles.map((v) => {
            fileList.value.push({
              path: v,
              changed: -1
            })
          })
        })
      })
    }
  })
}

//单条删除
const removeRow = (file: FileListType) => {
  let list = fileList.value.filter((item) => item.path !== file.path)
  fileList.value = list
}

//全部清除
const removeAll = () => {
  fileList.value = []
}

//文件名称
const filenameInput = ref('')
//文件名称 后缀
const filenameSuffix = ref('')

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

  fileList.value.forEach(async (file, index) => {
    try {
      let { dir, ext } = path.parse(file.path)
      let newFilename = createNewFilename(index)
      let oldPath = file.path
      let newExt = filenameSuffix.value !== '' ? `.${filenameSuffix.value}` : ext
      let newPath = path.format({
        dir,
        base: newFilename + newExt
      })
      fs.renameSync(oldPath, newPath)
      file.changed = 1
    } catch (err) {
      file.changed = 0
      console.log(err)
    }
  })
}
</script>
<style scoped>
.content-under-folder-map {
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
