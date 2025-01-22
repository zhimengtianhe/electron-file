<template>
  <div class="file-renam-map">
    <div class="select-row">
      <!--上传文件区域-->
      <a-upload-dragger
        :multiple="true"
        :fileList="fileList"
        :beforeUpload="beforeUpload"
        :showUploadList="false"
        @change="handleChange"
      >
        点击选择文件
      </a-upload-dragger>

      <!--上传文件区域 end-->
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
        已选择的文件：
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

    <button @click="goFileRenam">批量修改文件夹页面</button>
  </div>
</template>
<script lang="ts" setup name="fileRenam">
declare var require: any
import { ref } from 'vue'
import { Row, Col, Input, Checkbox, Button, Divider, InputNumber, Upload } from 'ant-design-vue'

import { CloseOutlined, CheckOutlined } from '@ant-design/icons-vue'

const fs = require('fs')
const path = require('path')

import bluebird from 'bluebird'
bluebird.promisifyAll(fs)

//路由
import { useRouter } from 'vue-router'
const router = useRouter()
const goFileRenam = () => {
  router.push('/pdfToImg')
}

interface FileListType {
  uid: string
  name: string
  path: string
  type: string
  changed: number
  size?: number
}

const columns = [
  {
    title: '文件名',
    dataIndex: 'name'
  },
  {
    title: '文件路径',
    dataIndex: 'path'
  },
  {
    title: '类型',
    dataIndex: 'type'
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

//选中的文件
const fileList = ref([] as FileListType[])
//文件名称
const filenameInput = ref('')
//文件名称 后缀
const filenameSuffix = ref('')

//起始值
const fillStart = ref(0)
//序号增量：
const fillStep = ref(0)

const handleChange = () => {}

//选择文件上传
const beforeUpload = (file: FileListType) => {
  let has = fileList.value.find((item) => item.path === file.path)
  let obj = {
    name: file.name,
    path: file.path,
    size: file.size,
    type: file.type,
    uid: file.uid,
    changed: -1
  }
  if (!has) fileList.value = [...fileList.value, obj]
  return false
}

//全部清除
const removeAll = () => {
  fileList.value = []
}

//单条删除
const removeRow = (file: FileListType) => {
  let list = fileList.value.filter((item) => item.uid !== file.uid)
  fileList.value = list
}

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
.file-renam-map {
  padding: 40px;
}
.select-row {
  margin-bottom: 30px;
  height: 200px;
}
.start-rename {
  margin-top: 20px;
}
</style>
