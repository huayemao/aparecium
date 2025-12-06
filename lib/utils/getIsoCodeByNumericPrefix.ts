
const numericToIsoMap: Record<string, string> = {
  '11': 'CN-BJ', // 北京
  '12': 'CN-TJ', // 天津
  '13': 'CN-HE', // 河北
  '14': 'CN-SX', // 山西
  '15': 'CN-NM', // 内蒙古
  '21': 'CN-LN', // 辽宁
  '22': 'CN-JL', // 吉林
  '23': 'CN-HL', // 黑龙江
  '31': 'CN-SH', // 上海
  '32': 'CN-JS', // 江苏
  '33': 'CN-ZJ', // 浙江
  '34': 'CN-AH', // 安徽
  '35': 'CN-FJ', // 福建
  '36': 'CN-JX', // 江西
  '37': 'CN-SD', // 山东
  '41': 'CN-HA', // 河南
  '42': 'CN-HB', // 湖北
  '43': 'CN-HN', // 湖南
  '44': 'CN-GD', // 广东
  '45': 'CN-GX', // 广西
  '46': 'CN-HI', // 海南
  '50': 'CN-CQ', // 重庆
  '51': 'CN-SC', // 四川
  '52': 'CN-GZ', // 贵州
  '53': 'CN-YN', // 云南
  '54': 'CN-XZ', // 西藏
  '61': 'CN-SN', // 陕西
  '62': 'CN-GS', // 甘肃
  '63': 'CN-QH', // 青海
  '64': 'CN-NX', // 宁夏
  '65': 'CN-XJ', // 新疆
  '71': 'CN-TW', // 台湾
  '81': 'CN-HK', // 香港
  '82': 'CN-MO'  // 澳门
};

export function getIsoCodeByNumericPrefix(prefix: string) {
  return numericToIsoMap[prefix] || prefix;
}