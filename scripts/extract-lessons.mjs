import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取提取的文本
const textPath = path.join(__dirname, 'extracted-text.txt');
const text = fs.readFileSync(textPath, 'utf-8');

// 定义要提取的课文
const lessons = [
  { title: '古诗词三首', unit: '1' },
  { title: '乡下人家', unit: '1' },
  { title: '天窗', unit: '1' },
  { title: '三月桃花水', unit: '1' },
  { title: '琥珀', unit: '2' },
  { title: '飞向蓝天的恐龙', unit: '2' },
  { title: '纳米技术就在我们身边', unit: '2' },
  { title: '千年梦圆在今朝', unit: '2' },
  { title: '短诗三首', unit: '3' },
  { title: '绿', unit: '3' },
  { title: '白桦', unit: '3' },
  { title: '在天晴了的时候', unit: '3' },
  { title: '猫', unit: '4' },
  { title: '母鸡', unit: '4' },
  { title: '白鹅', unit: '4' },
  { title: '海上日出', unit: '5' },
  { title: '记金华的双龙洞', unit: '5' },
  { title: '文言文二则', unit: '6' },
  { title: '小英雄雨来', unit: '6' },
  { title: '我们家的男子汉', unit: '6' },
  { title: '芦花鞋', unit: '6' },
  { title: '古诗三首', unit: '7' },
  { title: '黄继光', unit: '7' },
  { title: '"诺曼底号"遇难记', unit: '7' },
  { title: '挑山工', unit: '7' },
  { title: '宝葫芦的秘密', unit: '8' },
  { title: '巨人的花园', unit: '8' },
  { title: '海的女儿', unit: '8' },
];

// 提取课文内容
function extractLessonContent(text, lessonTitle) {
  // 清理标题中的特殊字符以便搜索
  const searchTitle = lessonTitle.replace(/[（\(].*?[）\)]/g, '').trim();
  
  // 在文本中查找课文标题
  const patterns = [
    new RegExp(`${searchTitle}[^\\n]*\\n([^\\n]+)`, 'i'),
    new RegExp(`\\n${searchTitle}\\s*\\n`, 'i'),
  ];
  
  let startIndex = -1;
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      startIndex = text.indexOf(match[0]);
      break;
    }
  }
  
  if (startIndex === -1) {
    console.log(`未找到: ${lessonTitle}`);
    return null;
  }
  
  // 提取约3000字符的内容
  const content = text.substring(startIndex, startIndex + 3000);
  
  // 清理内容
  const lines = content.split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.match(/^-- \d+ of \d+ --$/))
    .filter(line => !line.match(/^\d+$/))
    .slice(0, 50); // 限制行数
  
  return lines.join('\n');
}

// 提取所有课文
const extractedLessons = {};
for (const lesson of lessons) {
  const content = extractLessonContent(text, lesson.title);
  if (content) {
    extractedLessons[lesson.title] = content;
    console.log(`✓ 已提取: ${lesson.title}`);
  }
}

// 保存提取的课文
const outputPath = path.join(__dirname, 'extracted-lessons.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedLessons, null, 2));
console.log(`\n已保存到: ${outputPath}`);
console.log(`共提取 ${Object.keys(extractedLessons).length} 篇课文`);
