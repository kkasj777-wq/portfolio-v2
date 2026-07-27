import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(() => {
  const repository = process.env.GITHUB_REPOSITORY?.split('/')[1]
  const isUserSite = repository?.endsWith('.github.io')
  const base = process.env.GITHUB_ACTIONS === 'true' && repository && !isUserSite
    ? `/${repository}/`
    : '/'

  return {
    base,
    plugins: [react()],
    build: {
      // 本沙箱不支持回收站删除，Vite 清空 outDir 会失败；改为手动 rm -rf 后构建
      emptyOutDir: false,
      chunkSizeWarningLimit: 900,
    },
  }
})
