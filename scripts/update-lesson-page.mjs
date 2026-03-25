import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取清理后的课文
const lessonsPath = path.join(__dirname, 'cleaned-lessons.json');
const lessons = JSON.parse(fs.readFileSync(lessonsPath, 'utf-8'));

// 读取当前的lesson/page.tsx
const pagePath = path.join(__dirname, '..', 'app', 'dashboard', 'lesson', 'page.tsx');
let pageContent = fs.readFileSync(pagePath, 'utf-8');

// 定义要更新的课文映射
const updates = [
  { key: '古诗词三首', title: '古诗词三首' },
  { key: '乡下人家', title: '乡下人家' },
  { key: '天窗', title: '天窗' },
  { key: '三月桃花水', title: '三月桃花水' },
  { key: '琥珀', title: '琥珀' },
  { key: '飞向蓝天的恐龙', title: '飞向蓝天的恐龙' },
  { key: '纳米技术就在我们身边', title: '纳米技术就在我们身边' },
  { key: '千年梦圆在今朝', title: '千年梦圆在今朝' },
  { key: '短诗三首', title: '短诗三首' },
  { key: '绿', title: '绿' },
  { key: '白桦', title: '白桦' },
  { key: '在天晴了的时候', title: '在天晴了的时候' },
  { key: '猫', title: '猫' },
  { key: '母鸡', title: '母鸡' },
  { key: '白鹅', title: '白鹅' },
  { key: '海上日出', title: '海上日出' },
  { key: '记金华的双龙洞', title: '记金华的双龙洞' },
  { key: '文言文二则', title: '文言文二则' },
  { key: '小英雄雨来', title: '小英雄雨来（节选）' },
  { key: '我们家的男子汉', title: '我们家的男子汉' },
  { key: '芦花鞋', title: '芦花鞋' },
  // 第七单元的古诗三首需要特殊处理
  { key: '古诗三首', title: '古诗三首', isSecond: true },
  { key: '黄继光', title: '黄继光' },
  { key: '"诺曼底号"遇难记', title: '"诺曼底号"遇难记' },
  { key: '挑山工', title: '挑山工' },
  { key: '宝葫芦的秘密', title: '宝葫芦的秘密（节选）' },
  { key: '巨人的花园', title: '巨人的花园' },
  { key: '海的女儿', title: '海的女儿' },
];

// 转义内容用于模板字符串
function escapeContent(content) {
  if (!content) return '';
  return content
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$/g, '\\$');
}

// 更新每一课的内容
for (const update of updates) {
  let content = lessons[update.key];
  if (!content) {
    console.log(`跳过: ${update.title} (无内容)`);
    continue;
  }

  // 对于第七单元的古诗三首，提取相关内容
  if (update.isSecond) {
    // 从内容中提取第七单元的三首诗
    const lines = content.split('\n');
    const startIdx = lines.findIndex(l => l.includes('芙蓉楼送辛渐'));
    if (startIdx !== -1) {
      content = lines.slice(startIdx, startIdx + 40).join('\n');
    }
  }

  // 限制内容长度
  if (content.length > 2500) {
    content = content.substring(0, 2500) + '\n\n...';
  }

  const escapedContent = escapeContent(content);
  const escapedTitle = update.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 构建更灵活的正则表达式
  // 匹配 title: 'xxx', 后面跟着换行和 content: `...`,
  const pattern = new RegExp(
    `(title: '${escapedTitle}',\\s*\\n\\s*content: \\`)([\\s\\S]*?)(\\\\`,\\s*\\n\\s*\\},)`,
    'g'
  );

  if (pageContent.match(pattern)) {
    pageContent = pageContent.replace(pattern, `$1${escapedContent}$3`);
    console.log(`✓ 已更新: ${update.title}`);
  } else {
    // 尝试更简单的模式
    const simplePattern = new RegExp(
      `(title: '${escapedTitle}',[\\s\\S]*?content: \\`)([\\s\\S]*?)(\\\\
  \\},)`,
    );
    if (pageContent.match(simplePattern)) {
      pageContent = pageContent.replace(simplePattern, `$1${escapedContent}\n  },`);
      console.log(`✓ 已更新: ${update.title} (简单模式)`);
    } else {
      console.log(`✗ 未找到: ${update.title}`);
    }
  }
}

// 保存更新后的文件
fs.writeFileSync(pagePath, pageContent);
console.log(`\n已保存到: ${pagePath}`);
