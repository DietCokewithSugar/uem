// 权限：岗位决定功能是否可用（config/access.js），首页卡片按权限出现（config/homeCards.js）
import { describe, it, expect } from 'vitest'
import { currentUser } from '@/config/user'
import { persons } from '@/mock/system'
import { can, FEATURES } from '@/config/access'
import { defaultKeys } from '@/config/homeCards'
import { visibleMenus, visibleNav } from '@/config/menus'

function loginAs(id) {
  const p = persons.find((x) => x.id === id)
  Object.assign(currentUser, { id: p.id, name: p.name, dept: p.org })
}

describe('功能权限', () => {
  it('提交建议、方法培训、资讯和声音分析智能工具对所有人开放', () => {
    loginAs('001820001')
    for (const f of [undefined, 'suggest.submit', 'voice.tool']) expect(can(f)).toBe(true)
    const ai = visibleMenus('ai').map((m) => m.title)
    expect(ai).toContain('声音分析智能工具')
    expect(visibleMenus('knowledge').map((m) => m.title)).toContain('方法培训')
  })

  it('全量导出、统计视图、声音看板需要单独授权', () => {
    loginAs('001820001')
    for (const f of ['suggest.export', 'suggest.stat', 'voice.board']) expect(can(f)).toBe(false)
    loginAs('001700110')
    for (const f of ['suggest.export', 'suggest.stat', 'voice.board']) expect(can(f)).toBe(true)
  })

  it('系统管理员可使用全部功能', () => {
    loginAs('001700001')
    for (const f of Object.keys(FEATURES)) expect(can(f)).toBe(true)
  })

  it('分行用户看不到系统管理', () => {
    loginAs('001820001')
    expect(visibleNav.value.map((n) => n.key)).not.toContain('system')
  })
})

describe('首页卡片', () => {
  it('分行用户默认看到提交建议、提交进度和声音分析智能工具，看不到统计类卡片', () => {
    loginAs('001820001')
    const keys = defaultKeys()
    expect(keys).toEqual(expect.arrayContaining(['todo', 'quickSubmit', 'mySubmit', 'voiceTool', 'news', 'training']))
    expect(keys).not.toContain('suggestStats')
    expect(keys).not.toContain('voiceAlert')
  })

  it('领导默认看到统计概览、部门进展、声音异动和品牌 NPS', () => {
    loginAs('001700110')
    expect(defaultKeys()).toEqual(expect.arrayContaining(['todo', 'suggestStats', 'deptProgress', 'voiceAlert', 'nps']))
  })

  it('业务人员默认看到待办、声音异动和灵犀旅程', () => {
    loginAs('001700101')
    expect(defaultKeys()).toEqual(expect.arrayContaining(['todo', 'voiceAlert', 'journeys']))
    expect(defaultKeys()).not.toContain('deptProgress')
  })
})
