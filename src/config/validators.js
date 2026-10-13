// 行内统一认证号：9 位纯数字
export const isStaffId = (v) => /^\d{9}$/.test(String(v ?? '').trim())
export const staffIdRule = {
  validator: (_, v, cb) => (!v ? cb(new Error('请输入统一认证号')) : isStaffId(v) ? cb() : cb(new Error('统一认证号应为 9 位数字'))),
  trigger: 'blur'
}
