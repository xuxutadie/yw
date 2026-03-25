const fs = require('fs');
const path = require('path');
const PDFParser = require('pdf-parse');

async function extractPDFContent() {
  const pdfPath = path.join(__dirname, '..', 'public', 'resources', 'sample-teaching-material.pdf');
  
  if (!fs.existsSync(pdfPath)) {
    console.log('PDF文件不存在:', pdfPath);
    return;
  }
  
  const dataBuffer = fs.readFileSync(pdfPath);
  
  try {
    const data = await PDFParser(dataBuffer);
    
    // 保存提取的文本
    const outputPath = path.join(__dirname, '..', 'scripts', 'extracted-text.txt');
    fs.writeFileSync(outputPath, data.text);
    
    console.log('PDF内容已提取到:', outputPath);
    console.log('总页数:', data.numpages);
    console.log('总字数:', data.text.length);
    
    // 显示前2000字符
    console.log('\n前2000字符预览:');
    console.log(data.text.substring(0, 2000));
    
  } catch (error) {
    console.error('PDF解析失败:', error);
  }
}

extractPDFContent();
