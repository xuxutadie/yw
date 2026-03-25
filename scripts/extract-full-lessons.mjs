import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取提取的文本
const textPath = path.join(__dirname, 'extracted-text.txt');
const text = fs.readFileSync(textPath, 'utf-8');

// 定义要提取的课文及其页码范围（根据PDF页码）
const lessons = [
  { title: '古诗词三首', startPage: 6, endPage: 7 },
  { title: '乡下人家', startPage: 8, endPage: 10 },
  { title: '天窗', startPage: 11, endPage: 13 },
  { title: '三月桃花水', startPage: 14, endPage: 15 },
  { title: '琥珀', startPage: 21, endPage: 24 },
  { title: '飞向蓝天的恐龙', startPage: 25, endPage: 28 },
  { title: '纳米技术就在我们身边', startPage: 29, endPage: 31 },
  { title: '千年梦圆在今朝', startPage: 32, endPage: 33 },
  { title: '短诗三首', startPage: 41, endPage: 43 },
  { title: '绿', startPage: 44, endPage: 45 },
  { title: '白桦', startPage: 46, endPage: 47 },
  { title: '在天晴了的时候', startPage: 48, endPage: 49 },
  { title: '猫', startPage: 53, endPage: 55 },
  { title: '母鸡', startPage: 56, endPage: 58 },
  { title: '白鹅', startPage: 59, endPage: 62 },
  { title: '海上日出', startPage: 68, endPage: 70 },
  { title: '记金华的双龙洞', startPage: 71, endPage: 75 },
  { title: '文言文二则', startPage: 80, endPage: 81 },
  { title: '小英雄雨来', startPage: 82, endPage: 91 },
  { title: '我们家的男子汉', startPage: 92, endPage: 96 },
  { title: '芦花鞋', startPage: 97, endPage: 101 },
  { title: '古诗三首', startPage: 106, endPage: 108 },
  { title: '黄继光', startPage: 108, endPage: 113 },
  { title: '"诺曼底号"遇难记', startPage: 114, endPage: 119 },
  { title: '挑山工', startPage: 120, endPage: 122 },
  { title: '宝葫芦的秘密', startPage: 127, endPage: 130 },
  { title: '巨人的花园', startPage: 131, endPage: 134 },
  { title: '海的女儿', startPage: 135, endPage: 138 },
];

// 提取指定页码范围的内容
function extractPages(text, startPage, endPage) {
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    const pattern = new RegExp(`-- ${i} of 151 --\\n([\\s\\S]*?)(?=-- \\d+ of 151 --|$)`);
    const match = text.match(pattern);
    if (match) {
      pages.push(match[1].trim());
    }
  }
  return pages.join('\n\n');
}

// 清理课文内容
function cleanContent(content) {
  return content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line)
    .filter(line => !line.match(/^\d+$/)) // 移除纯数字行
    .filter(line => !line.includes('本文作者'))
    .filter(line => !line.includes('选作课文时有改动'))
    .filter(line => !line.includes('义务教育教科书'))
    .filter(line => !line.includes('教育部组织编写'))
    .filter(line => !line.includes('总主编'))
    .filter(line => !line.includes('全国优秀教材特等奖'))
    .join('\n');
}

// 提取所有课文
const extractedLessons = {};
for (const lesson of lessons) {
  const content = extractPages(text, lesson.startPage, lesson.endPage);
  if (content) {
    const cleanedContent = cleanContent(content);
    extractedLessons[lesson.title] = cleanedContent;
    console.log(`✓ 已提取: ${lesson.title} (${lesson.endPage - lesson.startPage + 1}页)`);
  } else {
    console.log(`✗ 未找到: ${lesson.title}`);
  }
}

// 保存提取的课文
const outputPath = path.join(__dirname, 'full-lessons.json');
fs.writeFileSync(outputPath, JSON.stringify(extractedLessons, null, 2));
console.log(`\n已保存到: ${outputPath}`);
console.log(`共提取 ${Object.keys(extractedLessons).length} 篇课文`);

// 显示第一篇课文的内容作为示例
const firstLesson = Object.keys(extractedLessons)[0];
console.log(`\n示例 - ${firstLesson}:`);
console.log(extractedLessons[firstLesson].substring(0, 500));
