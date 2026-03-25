import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取提取的课文
const lessonsPath = path.join(__dirname, 'full-lessons.json');
const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8'));

// 清理课文内容
function cleanLessonContent(content, title) {
  // 移除拼音标注（单个字母行）
  let cleaned = content
    .split('\n')
    .filter(line => !line.match(/^[a-zA-Z]+$/)) // 移除纯拼音行
    .filter(line => !line.includes('朗读课文'))
    .filter(line => !line.includes('默读课文'))
    .filter(line => !line.includes('阅读链接'))
    .filter(line => !line.includes('资料袋'))
    .filter(line => !line.includes('小练笔'))
    .filter(line => !line.includes('选 做'))
    .filter(line => !line.includes('口语交际'))
    .filter(line => !line.includes('转 述'))
    .filter(line => !line.includes('◎'))
    .filter(line => !line.includes('◇'))
    .filter(line => !line.match(/^\d+$/)) // 移除纯数字行
    .join('\n');
  
  // 移除连续的空白行
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
  
  // 限制长度
  if (cleaned.length > 3000) {
    cleaned = cleaned.substring(0, 3000) + '\n\n...';
  }
  
  return cleaned.trim();
}

// 清理所有课文
const cleanedLessons = {};
for (const [title, content] of Object.entries(lessons)) {
  cleanedLessons[title] = cleanLessonContent(content, title);
  console.log(`✓ 已清理: ${title} (${cleanedLessons[title].length} 字符)`);
}

// 保存清理后的课文
const outputPath = path.join(__dirname, 'cleaned-lessons.json');
fs.writeFileSync(outputPath, JSON.stringify(cleanedLessons, null, 2));
console.log(`\n已保存到: ${outputPath}`);

// 显示示例
console.log('\n示例 - 古诗词三首:');
console.log(cleanedLessons['古诗词三首'].substring(0, 800));
