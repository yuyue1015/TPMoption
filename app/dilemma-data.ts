// src/app/dilemma-data.ts

export interface DilemmaRecord {
  id: string;
  dilemma: string;    // 困境名称
  option: string;     // 选项名称
  result: string;     // 结果
  map: string;        // 出现的地图
  evaluation: string; // 评价 (正面/负面/中性)
}

// 这里需要你把 CSV 的数据转换成这种格式
// 提示：你可以用 Excel 把 CSV 另存为 JSON，或者用 GPT 帮你写个转换脚本
export const DILEMMA_DATA: DilemmaRecord[] = [
  {
    id: "1",
    dilemma: "聪慧的头颅",
    option: "专心执行任务",
    result: "探险行动时长：-4天, 经验奖励+10%",
    map: "白骨带",
    evaluation: "正面"
  },
  {
    id: "2",
    dilemma: "直升机失窃案",
    option: "随便修修",
    result: "直升机受损",
    map: "白骨带",
    evaluation: "负面"
  },
  {
    id: "3",
    dilemma: "巢摇过市",
    option: "帮忙",
    result: "随行物品（无敌药水）",
    map: "焦土世界",
    evaluation: "正面"
  },
  {
    id: "4",
    dilemma: "上古战场",
    option: "帮忙",
    result: "特质：打工牛马",
    map: "焦土世界",
    evaluation: "正面"
  },
  {
    id: "5",
    dilemma: "上古战场", // 同一个困境的第二个选项
    option: "不帮忙",
    result: "无事发生",
    map: "焦土世界",
    evaluation: "中性"
  },
  // ... 请在此处填入更多数据
];