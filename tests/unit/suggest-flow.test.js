// 优化建议流转规则（docs/优化建议.md 第 4 节）的单元测试
import { describe, it, expect } from 'vitest'
import { currentUser } from '@/config/user'
import { persons, rdLines } from '@/mock/system'
import {
  createSuggestion, approveBranch, assignReplier, replySuggestion, auditSuggestion, followUp, returnToSubmitter,
  suggestions, sorterOf, auditorOf, handlersOf, routeOfProduct, UX_DEPT, UX_LINE
} from '@/mock/suggest'

const IDS = { admin: '001700001', leader: '001700110', business: '001700101', branch: '001820001', approver: '001801001', ux: '001700107' }
const person = (id) => persons.find((p) => p.id === id)
function loginAs(id) {
  const p = person(id)
  Object.assign(currentUser, { id: p.id, name: p.name, dept: p.org })
  return p
}
const form = (product) => ({
  desc: '【现象】测试现象\n【建议】测试建议',
  source: '员工：日常走查',
  product,
  channels: ['手机APP-个人手机银行'],
  impact: '中（该问题对用户操作造成一定阻碍）',
  category: '功能流程'
})
const lastLog = (s) => s.logs[0]
// 种子数据（其他用例会新增建议，统计演示身份的待办时只看种子数据）
const seeded = new Set(suggestions.map((s) => s.id))

describe('提交与自动分配', () => {
  it('分行员工提交进入本行分行科技审核岗「待审批」', () => {
    loginAs(IDS.branch)
    const s = createSuggestion(form('个人手机银行基础业务'))
    expect(s.status).toBe('待审批')
    expect(s.currentHandlerId).toBe(IDS.approver)
    expect(person(IDS.approver).org).toBe(person(IDS.branch).org)
  })

  it('审批通过后按产品分类分配到对应产品线分拣岗', () => {
    loginAs(IDS.branch)
    const s = createSuggestion(form('个人手机银行基础业务'))
    const approver = loginAs(IDS.approver)
    approveBranch(s, approver)
    expect(s.status).toBe('待分拣')
    expect(s.bizDept).toBe('业务研发四部')
    expect(s.productLine).toBe('个人手机银行')
    expect(s.currentHandlerId).toBe(sorterOf('个人手机银行').id)
    expect(lastLog(s).action).toBe('自动分配')
    expect(s.logs[1].action).toBe('审批通过')
  })

  it('总行人员提交直接分配，不经过审批', () => {
    loginAs(IDS.leader)
    const s = createSuggestion(form('柜面服务'))
    expect(s.status).toBe('待分拣')
    expect(s.logs.map((l) => l.action)).not.toContain('审批通过')
    expect(s.currentHandlerId).toBe(sorterOf(routeOfProduct('柜面服务').productLine).id)
  })

  it('研发一体化产品分配时直接转 e键通', () => {
    loginAs(IDS.leader)
    const s = createSuggestion(form('智能柜员机'))
    expect(s.status).toBe('待开发中心处理')
    expect(s.ekeyNo).toMatch(/^E\d{12}/)
  })

  it('分行员工提交研发一体化产品：先审批，审批通过后转 e键通', () => {
    loginAs(IDS.branch)
    const s = createSuggestion(form('智能柜员机'))
    expect(s.status).toBe('待审批')
    approveBranch(s, loginAs(IDS.approver))
    expect(s.status).toBe('待开发中心处理')
  })

  it('没有产品分类的产品统一分配到用户体验部分拣岗', () => {
    loginAs(IDS.leader)
    const s = createSuggestion(form('远程银行'))
    expect(s.status).toBe('待分拣')
    expect(s.unclassified).toBe(true)
    expect(s.bizDept).toBe(UX_DEPT)
    expect(s.productLine).toBe(UX_LINE)
    expect(s.currentHandlerId).toBe(IDS.ux)
  })

  it('分行审批岗可以退回提交人，提交人在「待修改」中处理', () => {
    loginAs(IDS.branch)
    const s = createSuggestion(form('个人手机银行基础业务'))
    returnToSubmitter(s, '请补充截图', loginAs(IDS.approver))
    expect(s.status).toBe('待修改')
    expect(s.currentHandlerId).toBe(IDS.branch)
  })
})

describe('处理环节', () => {
  it('每条产品线的分拣岗与审核岗由不同人员担任', () => {
    for (const line of rdLines) {
      const sorter = sorterOf(line)
      const auditor = auditorOf({ productLine: line, vip: false })
      expect(sorter, `${line} 缺少分拣岗`).toBeTruthy()
      expect(auditor, `${line} 缺少审核岗`).toBeTruthy()
      expect(sorter.id, `${line} 的分拣岗兼任了审核岗`).not.toBe(auditor.id)
    }
  })

  it('答复后必须审核；审核不通过退回答复人，通过后按解决方式流转', () => {
    loginAs(IDS.leader)
    const s = createSuggestion(form('个人手机银行基础业务'))
    const sorter = loginAs(sorterOf('个人手机银行').id)
    const replier = handlersOf('个人手机银行')[0]
    assignReplier(s, replier, sorter)
    expect(s.status).toBe('待答复')

    loginAs(replier.id)
    replySuggestion(s, { adoptResult: '不采纳', rejectReason: '已有替代方案或功能', replyOpinion: '已有替代入口' }, replier)
    expect(s.status).toBe('待审核')
    const auditor = auditorOf(s)
    expect(s.currentHandlerId).toBe(auditor.id)

    auditSuggestion(s, false, '请说明替代入口位置', loginAs(auditor.id))
    expect(s.status).toBe('待答复')
    expect(s.currentHandlerId).toBe(replier.id)

    replySuggestion(s, { adoptResult: '采纳', solution: '业务科技协同解决（需求项）', replyOpinion: '采纳', priority: '二级（常用功能影响中等或小，或非常用功能影响大）', reqNo: 'I20261103-0001', planTime: '2026-12-31' }, loginAs(replier.id))
    auditSuggestion(s, true, '', loginAs(auditor.id))
    expect(s.status).toBe('待跟进')
    followUp(s, { implemented: '是', actualTime: '2026-12-20' }, loginAs(replier.id))
    expect(s.status).toBe('已完成')
  })
})

describe('演示身份的待办', () => {
  const count = (id, status) => suggestions.filter((s) => seeded.has(s.id) && s.currentHandlerId === id && s.status === status).length
  it('系统管理员的待办数量与截图一致', () => {
    expect(count(IDS.admin, '待审批')).toBe(17)
    expect(count(IDS.admin, '待答复')).toBe(7)
    expect(count(IDS.admin, '待跟进')).toBe(1)
  })
  it('其他身份都有对应环节的待办', () => {
    expect(count(IDS.leader, '待审核')).toBeGreaterThanOrEqual(4)
    expect(count(IDS.business, '待分拣')).toBeGreaterThanOrEqual(3)
    expect(count(IDS.business, '待答复')).toBeGreaterThanOrEqual(4)
    expect(count(IDS.approver, '待审批')).toBeGreaterThanOrEqual(5)
    expect(count(IDS.ux, '待分拣')).toBeGreaterThanOrEqual(3)
    expect(count(IDS.branch, '待修改')).toBe(1)
  })
})

describe('用户声音转优化建议', () => {
  it('来源固定为「客户：用户声音智能分析」，不经分行审批直接进入待分拣', async () => {
    const { VOICE_SOURCE } = await import('@/mock/suggest')
    loginAs(IDS.branch)
    const s = createSuggestion({ ...form('个人手机银行基础业务'), source: VOICE_SOURCE }, undefined, { direct: true })
    expect(s.source).toBe('客户：用户声音智能分析')
    expect(s.status).toBe('待分拣')
    expect(s.currentHandlerId).toBe(sorterOf('个人手机银行').id)
  })
})
