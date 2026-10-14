// 法定节假日及调休安排（国务院办公厅每年发布的放假安排）
// statutoryHolidays：放假日期（含与周末连休的日期），name 为节日名称
// makeupWorkdays：调休上班的周六、周日（从非工作日中扣除）
// 依据国务院英文网站发布的年度放假安排，并以 China Briefing、timeanddate.com/holidays/china/<年份> 交叉核对
// 跨年的元旦归入次年安排；中秋与国庆合并放假时，中秋当天记为中秋节，其余记为国庆节
export const statutoryHolidays = [
  // 2019：https://english.www.gov.cn/policies/latest_releases/2018/12/06/content_281476422057966.htm ; https://english.www.gov.cn/policies/latest_releases/2019/03/22/content_281476573885344.htm ; https://www.china-briefing.com/news/chinas-2019-holiday-schedule/
  // 元旦为 2018-12-30 至 2019-01-01（2018-12-29 周六上班），仅收录 2019 年内日期；劳动节为 2019-03-22 调整后的 4 天方案
  { date: '2019-01-01', name: '元旦' },
  { date: '2019-02-04', name: '春节' }, { date: '2019-02-05', name: '春节' }, { date: '2019-02-06', name: '春节' }, { date: '2019-02-07', name: '春节' },
  { date: '2019-02-08', name: '春节' }, { date: '2019-02-09', name: '春节' }, { date: '2019-02-10', name: '春节' },
  { date: '2019-04-05', name: '清明节' }, { date: '2019-04-06', name: '清明节' }, { date: '2019-04-07', name: '清明节' },
  { date: '2019-05-01', name: '劳动节' }, { date: '2019-05-02', name: '劳动节' }, { date: '2019-05-03', name: '劳动节' }, { date: '2019-05-04', name: '劳动节' },
  { date: '2019-06-07', name: '端午节' }, { date: '2019-06-08', name: '端午节' }, { date: '2019-06-09', name: '端午节' },
  { date: '2019-09-13', name: '中秋节' }, { date: '2019-09-14', name: '中秋节' }, { date: '2019-09-15', name: '中秋节' },
  { date: '2019-10-01', name: '国庆节' }, { date: '2019-10-02', name: '国庆节' }, { date: '2019-10-03', name: '国庆节' }, { date: '2019-10-04', name: '国庆节' },
  { date: '2019-10-05', name: '国庆节' }, { date: '2019-10-06', name: '国庆节' }, { date: '2019-10-07', name: '国庆节' },
  // 2020：https://english.www.gov.cn/policies/latestreleases/201911/21/content_WS5dd65afbc6d0bcf8c4c178bd.html ; https://english.www.gov.cn/policies/latestreleases/202001/27/content_WS5e2e34e4c6d019625c603f9b.html ; https://www.china-briefing.com/news/chinas-2020-holiday-schedule-released/
  // 春节原定 01-24 至 01-30，国办 2020-01-27 通知延长至 02-02，原 02-01 周六上班随之取消；中秋与国庆同在 10-01，整段记为国庆节
  { date: '2020-01-01', name: '元旦' },
  { date: '2020-01-24', name: '春节' }, { date: '2020-01-25', name: '春节' }, { date: '2020-01-26', name: '春节' }, { date: '2020-01-27', name: '春节' },
  { date: '2020-01-28', name: '春节' }, { date: '2020-01-29', name: '春节' }, { date: '2020-01-30', name: '春节' }, { date: '2020-01-31', name: '春节' },
  { date: '2020-02-01', name: '春节' }, { date: '2020-02-02', name: '春节' },
  { date: '2020-04-04', name: '清明节' }, { date: '2020-04-05', name: '清明节' }, { date: '2020-04-06', name: '清明节' },
  { date: '2020-05-01', name: '劳动节' }, { date: '2020-05-02', name: '劳动节' }, { date: '2020-05-03', name: '劳动节' }, { date: '2020-05-04', name: '劳动节' },
  { date: '2020-05-05', name: '劳动节' },
  { date: '2020-06-25', name: '端午节' }, { date: '2020-06-26', name: '端午节' }, { date: '2020-06-27', name: '端午节' },
  { date: '2020-10-01', name: '国庆节' }, { date: '2020-10-02', name: '国庆节' }, { date: '2020-10-03', name: '国庆节' }, { date: '2020-10-04', name: '国庆节' },
  { date: '2020-10-05', name: '国庆节' }, { date: '2020-10-06', name: '国庆节' }, { date: '2020-10-07', name: '国庆节' }, { date: '2020-10-08', name: '国庆节' },
  // 2021：https://english.www.gov.cn/policies/latestreleases/202011/25/content_WS5fbe5fabc6d0f72576940a94.html ; https://www.china-briefing.com/news/chinas-2021-holiday-schedule/
  { date: '2021-01-01', name: '元旦' }, { date: '2021-01-02', name: '元旦' }, { date: '2021-01-03', name: '元旦' },
  { date: '2021-02-11', name: '春节' }, { date: '2021-02-12', name: '春节' }, { date: '2021-02-13', name: '春节' }, { date: '2021-02-14', name: '春节' },
  { date: '2021-02-15', name: '春节' }, { date: '2021-02-16', name: '春节' }, { date: '2021-02-17', name: '春节' },
  { date: '2021-04-03', name: '清明节' }, { date: '2021-04-04', name: '清明节' }, { date: '2021-04-05', name: '清明节' },
  { date: '2021-05-01', name: '劳动节' }, { date: '2021-05-02', name: '劳动节' }, { date: '2021-05-03', name: '劳动节' }, { date: '2021-05-04', name: '劳动节' },
  { date: '2021-05-05', name: '劳动节' },
  { date: '2021-06-12', name: '端午节' }, { date: '2021-06-13', name: '端午节' }, { date: '2021-06-14', name: '端午节' },
  { date: '2021-09-19', name: '中秋节' }, { date: '2021-09-20', name: '中秋节' }, { date: '2021-09-21', name: '中秋节' },
  { date: '2021-10-01', name: '国庆节' }, { date: '2021-10-02', name: '国庆节' }, { date: '2021-10-03', name: '国庆节' }, { date: '2021-10-04', name: '国庆节' },
  { date: '2021-10-05', name: '国庆节' }, { date: '2021-10-06', name: '国庆节' }, { date: '2021-10-07', name: '国庆节' },
  // 2022：https://english.www.gov.cn/policies/latestreleases/202110/26/content_WS617764f4c6d0df57f98e3d00.html ; https://www.china-briefing.com/news/china-public-holiday-2022-schedule/
  { date: '2022-01-01', name: '元旦' }, { date: '2022-01-02', name: '元旦' }, { date: '2022-01-03', name: '元旦' },
  { date: '2022-01-31', name: '春节' }, { date: '2022-02-01', name: '春节' }, { date: '2022-02-02', name: '春节' }, { date: '2022-02-03', name: '春节' },
  { date: '2022-02-04', name: '春节' }, { date: '2022-02-05', name: '春节' }, { date: '2022-02-06', name: '春节' },
  { date: '2022-04-03', name: '清明节' }, { date: '2022-04-04', name: '清明节' }, { date: '2022-04-05', name: '清明节' },
  { date: '2022-04-30', name: '劳动节' }, { date: '2022-05-01', name: '劳动节' }, { date: '2022-05-02', name: '劳动节' }, { date: '2022-05-03', name: '劳动节' },
  { date: '2022-05-04', name: '劳动节' },
  { date: '2022-06-03', name: '端午节' }, { date: '2022-06-04', name: '端午节' }, { date: '2022-06-05', name: '端午节' },
  { date: '2022-09-10', name: '中秋节' }, { date: '2022-09-11', name: '中秋节' }, { date: '2022-09-12', name: '中秋节' },
  { date: '2022-10-01', name: '国庆节' }, { date: '2022-10-02', name: '国庆节' }, { date: '2022-10-03', name: '国庆节' }, { date: '2022-10-04', name: '国庆节' },
  { date: '2022-10-05', name: '国庆节' }, { date: '2022-10-06', name: '国庆节' }, { date: '2022-10-07', name: '国庆节' },
  // 2023：https://english.www.gov.cn/policies/latestreleases/202212/09/content_WS63920eafc6d0a757729e422c.html ; https://www.china-briefing.com/news/china-public-holiday-2023-schedule/
  // 元旦含 2022-12-31；中秋、国庆合并 09-29 至 10-06，09-29 中秋当天记为中秋节
  { date: '2022-12-31', name: '元旦' }, { date: '2023-01-01', name: '元旦' }, { date: '2023-01-02', name: '元旦' },
  { date: '2023-01-21', name: '春节' }, { date: '2023-01-22', name: '春节' }, { date: '2023-01-23', name: '春节' }, { date: '2023-01-24', name: '春节' },
  { date: '2023-01-25', name: '春节' }, { date: '2023-01-26', name: '春节' }, { date: '2023-01-27', name: '春节' },
  { date: '2023-04-05', name: '清明节' },
  { date: '2023-04-29', name: '劳动节' }, { date: '2023-04-30', name: '劳动节' }, { date: '2023-05-01', name: '劳动节' }, { date: '2023-05-02', name: '劳动节' },
  { date: '2023-05-03', name: '劳动节' },
  { date: '2023-06-22', name: '端午节' }, { date: '2023-06-23', name: '端午节' }, { date: '2023-06-24', name: '端午节' },
  { date: '2023-09-29', name: '中秋节' },
  { date: '2023-09-30', name: '国庆节' }, { date: '2023-10-01', name: '国庆节' }, { date: '2023-10-02', name: '国庆节' }, { date: '2023-10-03', name: '国庆节' },
  { date: '2023-10-04', name: '国庆节' }, { date: '2023-10-05', name: '国庆节' }, { date: '2023-10-06', name: '国庆节' },
  // 2024：https://english.www.gov.cn/policies/latestreleases/202310/25/content_WS65387be8c6d0868f4e8e0a04.html ; https://www.china-briefing.com/news/china-public-holiday-2024-schedule/
  // 元旦含 2023-12-30、31；除夕 02-09 非放假日（仅鼓励安排休假）
  { date: '2023-12-30', name: '元旦' }, { date: '2023-12-31', name: '元旦' }, { date: '2024-01-01', name: '元旦' },
  { date: '2024-02-10', name: '春节' }, { date: '2024-02-11', name: '春节' }, { date: '2024-02-12', name: '春节' }, { date: '2024-02-13', name: '春节' },
  { date: '2024-02-14', name: '春节' }, { date: '2024-02-15', name: '春节' }, { date: '2024-02-16', name: '春节' }, { date: '2024-02-17', name: '春节' },
  { date: '2024-04-04', name: '清明节' }, { date: '2024-04-05', name: '清明节' }, { date: '2024-04-06', name: '清明节' },
  { date: '2024-05-01', name: '劳动节' }, { date: '2024-05-02', name: '劳动节' }, { date: '2024-05-03', name: '劳动节' }, { date: '2024-05-04', name: '劳动节' },
  { date: '2024-05-05', name: '劳动节' },
  { date: '2024-06-08', name: '端午节' }, { date: '2024-06-09', name: '端午节' }, { date: '2024-06-10', name: '端午节' },
  { date: '2024-09-15', name: '中秋节' }, { date: '2024-09-16', name: '中秋节' }, { date: '2024-09-17', name: '中秋节' },
  { date: '2024-10-01', name: '国庆节' }, { date: '2024-10-02', name: '国庆节' }, { date: '2024-10-03', name: '国庆节' }, { date: '2024-10-04', name: '国庆节' },
  { date: '2024-10-05', name: '国庆节' }, { date: '2024-10-06', name: '国庆节' }, { date: '2024-10-07', name: '国庆节' },
  // 2025：https://english.www.gov.cn/policies/latestreleases/202411/12/content_WS67331db5c6d0868f4e8ecd92.html ; https://www.china-briefing.com/news/china-public-holiday-2025-schedule/
  // 自 2025 年起春节增加除夕、劳动节增加 5 月 2 日（全年 13 天）；国庆、中秋合并 10-01 至 10-08，10-06 中秋当天记为中秋节
  { date: '2025-01-01', name: '元旦' },
  { date: '2025-01-28', name: '春节' }, { date: '2025-01-29', name: '春节' }, { date: '2025-01-30', name: '春节' }, { date: '2025-01-31', name: '春节' },
  { date: '2025-02-01', name: '春节' }, { date: '2025-02-02', name: '春节' }, { date: '2025-02-03', name: '春节' }, { date: '2025-02-04', name: '春节' },
  { date: '2025-04-04', name: '清明节' }, { date: '2025-04-05', name: '清明节' }, { date: '2025-04-06', name: '清明节' },
  { date: '2025-05-01', name: '劳动节' }, { date: '2025-05-02', name: '劳动节' }, { date: '2025-05-03', name: '劳动节' }, { date: '2025-05-04', name: '劳动节' },
  { date: '2025-05-05', name: '劳动节' },
  { date: '2025-05-31', name: '端午节' }, { date: '2025-06-01', name: '端午节' }, { date: '2025-06-02', name: '端午节' },
  { date: '2025-10-01', name: '国庆节' }, { date: '2025-10-02', name: '国庆节' }, { date: '2025-10-03', name: '国庆节' }, { date: '2025-10-04', name: '国庆节' },
  { date: '2025-10-05', name: '国庆节' },
  { date: '2025-10-06', name: '中秋节' },
  { date: '2025-10-07', name: '国庆节' }, { date: '2025-10-08', name: '国庆节' },
  // 2026：https://english.www.gov.cn/policies/featured/202511/04/content_WS6909c915c6d00ca5f9a074f7.html ; https://www.china-briefing.com/news/china-2026-public-holiday-schedule/
  { date: '2026-01-01', name: '元旦' }, { date: '2026-01-02', name: '元旦' }, { date: '2026-01-03', name: '元旦' },
  { date: '2026-02-15', name: '春节' }, { date: '2026-02-16', name: '春节' }, { date: '2026-02-17', name: '春节' }, { date: '2026-02-18', name: '春节' },
  { date: '2026-02-19', name: '春节' }, { date: '2026-02-20', name: '春节' }, { date: '2026-02-21', name: '春节' }, { date: '2026-02-22', name: '春节' },
  { date: '2026-02-23', name: '春节' },
  { date: '2026-04-04', name: '清明节' }, { date: '2026-04-05', name: '清明节' }, { date: '2026-04-06', name: '清明节' },
  { date: '2026-05-01', name: '劳动节' }, { date: '2026-05-02', name: '劳动节' }, { date: '2026-05-03', name: '劳动节' }, { date: '2026-05-04', name: '劳动节' },
  { date: '2026-05-05', name: '劳动节' },
  { date: '2026-06-19', name: '端午节' }, { date: '2026-06-20', name: '端午节' }, { date: '2026-06-21', name: '端午节' },
  { date: '2026-09-25', name: '中秋节' }, { date: '2026-09-26', name: '中秋节' }, { date: '2026-09-27', name: '中秋节' },
  { date: '2026-10-01', name: '国庆节' }, { date: '2026-10-02', name: '国庆节' }, { date: '2026-10-03', name: '国庆节' }, { date: '2026-10-04', name: '国庆节' },
  { date: '2026-10-05', name: '国庆节' }, { date: '2026-10-06', name: '国庆节' }, { date: '2026-10-07', name: '国庆节' },
]

export const makeupWorkdays = [
  '2019-02-02', '2019-02-03', '2019-04-28', '2019-05-05', '2019-09-29', '2019-10-12', // 2019
  '2020-01-19', '2020-04-26', '2020-05-09', '2020-06-28', '2020-09-27', '2020-10-10', // 2020
  '2021-02-07', '2021-02-20', '2021-04-25', '2021-05-08', '2021-09-18', '2021-09-26', '2021-10-09', // 2021
  '2022-01-29', '2022-01-30', '2022-04-02', '2022-04-24', '2022-05-07', '2022-10-08', '2022-10-09', // 2022
  '2023-01-28', '2023-01-29', '2023-04-23', '2023-05-06', '2023-06-25', '2023-10-07', '2023-10-08', // 2023
  '2024-02-04', '2024-02-18', '2024-04-07', '2024-04-28', '2024-05-11', '2024-09-14', '2024-09-29', '2024-10-12', // 2024
  '2025-01-26', '2025-02-08', '2025-04-27', '2025-09-28', '2025-10-11', // 2025
  '2026-01-04', '2026-02-14', '2026-02-28', '2026-05-09', '2026-09-20', '2026-10-10', // 2026
]
