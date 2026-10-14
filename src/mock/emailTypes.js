// 邮件类型（邮件模板编码）：「邮件记录」的邮件类型与「字典维护」中的 EMAIL_TYPE 共用
// 每种邮件由对应的定时任务发送
export const emailTypes = [
  { code: 'dealSuggestion', label: '优化建议待办提醒', job: 'overdueRemindEmail' },
  { code: 'activityEmail', label: '体验活动超期提醒', job: 'activityEmail' },
  { code: 'uvsiWarning', label: '实时监测预警', job: 'calcUvsiAndWarn' }
]
