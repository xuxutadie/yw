import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PDFParse } from 'pdf-parse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function extractPDFContent() {
  const pdfPath = path.join(__dirname, '..', 'public', 'resources', 'sample-teaching-material.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('PDF文件不存在:', pdfPath);
    return;
  }
  
  const dataBuffer = fs.readFileSync(pdfPath);
  
  try {
    // 创建PDFParse实例
    const parser = new PDFParse({ data: dataBuffer });
    
    // 获取文本内容
    const textResult = await parser.getText();
    const text = textResult.text;
    
    // 保存提取的文本
    const outputPath = path.join(__dirname, '..', 'scripts', 'extracted-text.txt');
    fs.writeFileSync(outputPath, text);
    
    console.log('PDF内容已提取到:', outputPath);
    console.log('总页数:', textResult.total);
    console.log('总字数:', text.length);
    
    // 显示前10000字符
    console.log('\n前10000字符预览:');
    console.log(text.substring(0, 10000));
    
    // 清理
    await parser.destroy();
    
  } catch (error) {
    console.error('PDF解析失败:', error);
  }
}

extractPDFContent();
