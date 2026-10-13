// 资讯排序：按发布时间（默认）/ 浏览量 / 下载量
export function sortInfos(list, sort) {
  const key = { 按浏览量: 'views', 按下载量: 'downloads' }[sort]
  return [...list].sort((a, b) => (key ? b[key] - a[key] : b.publishTime.localeCompare(a.publishTime)))
}
