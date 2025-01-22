import { createRouter, createWebHashHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/fileRenam',
      children: [
        {
          path: '/fileRenam',
          name: 'fileRenam',
          component: () => import('@/views/fileRenam/fileRenam.vue'),
          meta: {
            title: '批量命名文件'
          }
        },
        {
          path: '/foldersRenaming',
          name: 'foldersRenaming',
          component: () => import('@/views/foldersRenaming/foldersRenaming.vue'),
          meta: {
            title: '批量修改文件夹名称'
          }
        },
        {
          path: '/contentUnderFolder',
          name: 'contentUnderFolder',
          component: () => import('@/views/contentUnderFolder/contentUnderFolder.vue'),
          meta: {
            title: '通过文件夹路径修改文件名称'
          }
        },

        {
          path: '/pdfToImg',
          name: 'pdfToImg',
          component: () => import('@/views/pdfToImg/pdfToImg.vue'),
          meta: {
            title: 'pdf转图片'
          }
        }
      ]
    }
  ]
})

export default router
