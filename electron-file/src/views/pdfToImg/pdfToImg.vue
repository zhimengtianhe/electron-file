<template>
  <div>
    <div style="width: 800px; margin: auto">
      <div
        style="
          width: 800px;
          text-shadow: 2px 2px 5px #777;
          line-height: 28px;
          font-size: 28px;
          color: rgb(90, 90, 90);
          margin-top: 20px;
        "
      >
        pdf转图片
      </div>
      <div style="width: 800px; margin-top: 20px">
        <div>
          选择pdf:
          <input
            type="file"
            ref="hiddenfile"
            accept="application/pdf"
            @change="handlePdf"
            class="hiddenInput"
          />
        </div>

        <div style="width: 800px; font-size: 12px; margin-top: 10px">单击图片可下载一页</div>
        <div style="width: 800px; font-size: 12px; margin-top: 10px">全部图片打zip包下载</div>
        <div
          v-for="(item, i) in imgFiles"
          :key="i"
          style="width: 800px; position: relative; margin-top: 10px"
        >
          <canvas
            :id="`pdf_canvas_${item}`"
            style="border: 1px solid #eeeeee; float: left"
            @click="downJpg(item)"
          ></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="pdfToImg">
import * as pdfjs from 'pdfjs-dist'
import * as pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs'
;(window as any).pdfjsWorker = pdfjsWorker
import { ref } from 'vue'

const imgFiles = ref([])

//pdf的名字，记录下来
const pdfName = ref('')

//处理pdf
const handlePdf = (e: Event) => {
  const eTarget = e.target as HTMLInputElement
  if (eTarget.files) {
    let file = eTarget.files[0]
    pdfName.value = file.name.substring(0, file.name.lastIndexOf('.'))
    const reader = new FileReader()
    reader.readAsDataURL(file) //将文件读取为 DataURL
    reader.onload = function () {
      //文件读取成功完成时触发
      const loadingTask = pdfjs.getDocument(reader.result as any)
      loadingTask.promise.then((pdf) => {
        var pageNum = pdf.numPages
        //准备图片
        for (let i = 1; i <= pageNum; i++) {
          let one = i as never
          imgFiles.value.push(one)
        }
        //处理
        for (let i = 1; i <= pageNum; i++) {
          pdf.getPage(i).then((page) => {
            const canvas = document.getElementById('pdf_canvas_' + i) as HTMLCanvasElement
            const ctx = canvas.getContext('2d')
            const viewport = page.getViewport({ scale: 3 })
            // 画布大小,默认值是width:300px,height:150px
            canvas.height = viewport.height
            canvas.width = viewport.width
            // 画布的dom大小, 设置移动端,宽度设置铺满整个屏幕
            //const clientWidth = document.body.clientWidth;
            const destWidth = 398
            canvas.style.width = destWidth + 'px'
            // 根据pdf每页的宽高比例设置canvas的高度
            canvas.style.height = destWidth * (viewport.height / viewport.width) + 'px'
            page.render({
              canvasContext: ctx!,
              viewport
            })
          })
        }
      })
    }
  }
}

//下载图片
const downJpg = (i: number) => {
  const canvas = document.getElementById('pdf_canvas_' + i) as HTMLCanvasElement
  let oA = document.createElement('a')
  oA.download = pdfName.value + '_' + i + '.jpg' // 设置下载的文件名，默认是'下载'
  oA.href = canvas.toDataURL('image/jpeg')
  document.body.appendChild(oA)
  oA.click()
  oA.remove()
}
</script>

<style scoped></style>
