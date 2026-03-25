import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取清理后的课文
const lessonsPath = path.join(__dirname, 'cleaned-lessons.json');
const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8'));

// 定义课文映射（标题 -> 单元和课号）
const lessonMap = [
  { title: '古诗词三首', unitId: '1', lessonNumber: 1, id: '1' },
  { title: '乡下人家', unitId: '1', lessonNumber: 2, id: '2' },
  { title: '天窗', unitId: '1', lessonNumber: 3, id: '3' },
  { title: '三月桃花水', unitId: '1', lessonNumber: 4, id: '4' },
  { title: '琥珀', unitId: '2', lessonNumber: 5, id: '5' },
  { title: '飞向蓝天的恐龙', unitId: '2', lessonNumber: 6, id: '6' },
  { title: '纳米技术就在我们身边', unitId: '2', lessonNumber: 7, id: '7' },
  { title: '千年梦圆在今朝', unitId: '2', lessonNumber: 8, id: '8' },
  { title: '短诗三首', unitId: '3', lessonNumber: 9, id: '9' },
  { title: '绿', unitId: '3', lessonNumber: 10, id: '10' },
  { title: '白桦', unitId: '3', lessonNumber: 11, id: '11' },
  { title: '在天晴了的时候', unitId: '3', lessonNumber: 12, id: '12' },
  { title: '猫', unitId: '4', lessonNumber: 13, id: '13' },
  { title: '母鸡', unitId: '4', lessonNumber: 14, id: '14' },
  { title: '白鹅', unitId: '4', lessonNumber: 15, id: '15' },
  { title: '海上日出', unitId: '5', lessonNumber: 16, id: '16' },
  { title: '记金华的双龙洞', unitId: '5', lessonNumber: 17, id: '17' },
  { title: '文言文二则', unitId: '6', lessonNumber: 18, id: '18' },
  { title: '小英雄雨来', unitId: '6', lessonNumber: 19, id: '19' },
  { title: '我们家的男子汉', unitId: '6', lessonNumber: 20, id: '20' },
  { title: '芦花鞋', unitId: '6', lessonNumber: 21, id: '21' },
  // 第七单元的古诗三首（注意区分）
  { title: '古诗三首', unitId: '7', lessonNumber: 22, id: '22', isSecond: true },
  { title: '"诺曼底号"遇难记', unitId: '7', lessonNumber: 23, id: '23' },
  { title: '黄继光', unitId: '7', lessonNumber: 24, id: '24' },
  { title: '挑山工', unitId: '7', lessonNumber: 25, id: '25' },
  { title: '宝葫芦的秘密', unitId: '8', lessonNumber: 26, id: '26' },
  { title: '巨人的花园', unitId: '8', lessonNumber: 27, id: '27' },
  { title: '海的女儿', unitId: '8', lessonNumber: 28, id: '28' },
];

// 转义字符串用于模板字面量
function escapeTemplate(content) {
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

// 生成课文数组代码
let code = '// 四年级下册教材数据（来自PDF）\nconst MOCK_LESSONS: Lesson[] = [\n';

// 按单元分组
const units = ['1', '2', '3', '4', '5', '6', '7', '8'];

for (const unitId of units) {
  const unitLessons = lessonMap.filter(l => l.unitId === unitId);
  
  if (unitLessons.length > 0) {
    code += `  // 第${['一', '二', '三', '四', '五', '六', '七', '八'][parseInt(unitId) - 1]}单元\n`;
    
    for (const lesson of unitLessons) {
      let content = lessons[lesson.title] || '';
      
      // 对于第七单元的古诗三首，使用特殊处理
      if (lesson.isSecond && lesson.title === '古诗三首') {
        // 从内容中提取第七单元的三首古诗
        content = extractSecondPoems(lessons['古诗三首']);
      }
      
      const escapedContent = escapeTemplate(content);
      
      code += `  {\n`;
      code += `    id: '${lesson.id}',\n`;
      code += `    unitId: '${lesson.unitId}',\n`;
      code += `    lessonNumber: ${lesson.lessonNumber},\n`;
      code += `    title: '${lesson.title}',\n`;
      code += `    content: \`${escapedContent}\`,\n`;
      code += `  },\n`;
    }
  }
}

code += ']\n';

// 保存生成的代码
const outputPath = path.join(__dirname, 'generated-lessons-code.txt');
fs.writeFileSync(outputPath, code);
console.log(`已生成课文代码: ${outputPath}`);
console.log(`共生成 ${lessonMap.length} 课`);

// 辅助函数：提取第七单元的古诗
function extractSecondPoems(content) {
  // 第七单元的古诗是：芙蓉楼送辛渐、塞下曲、墨梅
  if (!content) return '';
  
  const lines = content.split('\n');
  let result = [];
  let inPoem = false;
  
  for (const line of lines) {
    if (line.includes('芙蓉楼送辛渐') || line.includes('塞下曲') || line.includes('墨梅')) {
      inPoem = true;
    }
    if (inPoem) {
      result.push(line);
    }
  }
  
  return result.slice(0, 30).join('\n'); // 限制长度
}
