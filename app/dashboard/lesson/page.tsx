'use client'

import { useState } from 'react'
import { useLessonStore } from '@/store/lessonStore'
import type { TextbookVersion, Lesson } from '@/types'
import LessonViewer from '@/components/LessonViewer'
import TeachingPlanEditor from '@/components/TeachingPlanEditor'
import AnnotationTool from '@/components/AnnotationTool'
import { FileText, BookOpen, ExternalLink, Download } from 'lucide-react'

const TEXTBOOK_VERSIONS: TextbookVersion[] = ['部编人教版', '苏教版', '北师大版']
const GRADES = [1, 2, 3, 4, 5, 6]
const SEMESTERS = ['上册', '下册'] as const

// 四年级下册教材数据（来自PDF）
const MOCK_LESSONS: Lesson[] = [
  // 第一单元
  {
    id: '1',
    unitId: '1',
    lessonNumber: 1,
    title: '古诗词三首',
    content: `四时田园杂兴（其二十五）
[宋] 范成大
梅子金黄杏子肥，
麦花雪白菜花稀。
日长篱落无人过，
惟有蜻蜓蛱蝶飞。

注释
① 〔杂兴〕随兴而写的诗。"兴"，这里读xìng。
② 〔蛱蝶〕蝴蝶的一种。

宿新市徐公店
[宋] 杨万里
篱落疏疏一径深，
树头新绿未成阴。
儿童急走追黄蝶，
飞入菜花无处寻。

注释
① 〔疏疏〕稀疏。
② 〔阴〕树荫。

清平乐·村居
[宋] 辛弃疾
茅檐低小，溪上青青草。
醉里吴音相媚好，白发谁家翁媪？
大儿锄豆溪东，中儿正织鸡笼。
最喜小儿亡赖，溪头卧剥莲蓬。

注释
① 〔清平乐〕词牌名。"乐"，这里读yuè。
② 〔村居〕词题。
③ 〔吴音〕这首词是辛弃疾闲居带湖（今属江西）时写的。此地古代属吴地，所以称当地的方言为"吴音"。
④ 〔翁媪〕老翁和老妇。
⑤ 〔亡赖〕同"无赖"，这里指顽皮、淘气。"亡"，这里读wú。`,
  },
  {
    id: '2',
    unitId: '1',
    lessonNumber: 2,
    title: '乡下人家',
    content: `乡下人家总爱在屋前搭一瓜架，或种南瓜，或种丝瓜，让那些瓜藤攀上棚架，爬上屋檐。当花儿落了的时候，藤上便结出了青的、红的瓜，它们一个个挂在房前，衬着那长长的藤，绿绿的叶。青、红的瓜，碧绿的藤和叶，构成了一道别有风趣的装饰，比那高楼门前蹲着一对石狮子或是竖着两根大旗杆，可爱多了。

有些人家，还在门前的场地上种几株花，芍药，凤仙，鸡冠花，大丽菊，它们依着时令，顺序开放，朴素中带着几分华丽，显出一派独特的农家风光。还有些人家，在屋后种几十枝竹，绿的叶，青的竿，投下一片浓浓的绿荫。

几场春雨过后，到那里走走，你常常会看见许多鲜嫩的笋，成群地从土里探出头来。

鸡，乡下人家照例总要养几只的。从他们的房前屋后走过，你肯定会瞧见一只母鸡，率领一群小鸡，在竹林中觅食；或是瞧见耸着尾巴的雄鸡，在场地上大踏步地走来走去。

他们的屋后倘若有一条小河，那么在石桥旁边，在绿树荫下，你会见到一群鸭子游戏水中，不时地把头扎到水下去觅食。即使附近的石头上有妇女在捣衣，它们也从不吃惊。

若是在夏天的傍晚出去散步，你常常会瞧见乡下人家吃晚饭的情景。他们把桌椅饭菜搬到门前，天高地阔地吃起来。天边的红霞，向晚的微风，头上飞过的归巢的鸟儿，都是他们的好友。它们和乡下人家一起，绘成了一幅自然、和谐的田园风景画。

秋天到了，纺织娘寄住在他们屋前的瓜架上。月明人静的夜里，它们便唱起歌来："织，织，织，织啊！织，织，织，织啊！"那歌声真好听，赛过催眠曲，让那些辛苦一天的人们，甜甜蜜蜜地进入梦乡。

乡下人家，不论什么时候，不论什么季节，都有一道独特、迷人的风景。`,
  },
  {
    id: '3',
    unitId: '1',
    lessonNumber: 3,
    title: '天窗',
    content: `乡下的房子只有前面一排木板窗。暖和的晴天，木板窗扇扇打开，光线和空气都有了。

碰着大风大雨，或者北风呼呼叫的冬天，木板窗只好关起来，屋子里就黑得像地洞似的。

于是乡下人在屋顶开一个小方洞，装一块玻璃，叫作"天窗"。

夏天阵雨来了时，孩子们顶喜欢在雨里跑跳，仰着脸看闪电，然而大人们偏就不许。"到屋里来啊！"随着木板窗的关闭，孩子们也就被关在地洞似的屋里了。这时候，小小的天窗是你唯一的慰藉。

从那小小的玻璃，你会看见雨脚在那里卜落卜落跳，你会看见带子似的闪电一瞥；你想象到这雨，这风，这雷，这电，怎样猛厉地扫荡了这世界，你想象它们的威力比你在露天真实感到的要大十倍百倍。小小的天窗会使你的想象锐利起来！

晚上，当你被逼着上床去"休息"的时候，也许你还忘不了月光下的草地河滩。你偷偷地从帐子里伸出头来，仰起了脸。这时候，小小的天窗又是你唯一的慰藉！

你会从那小玻璃上面的一粒星，一朵云，想象到无数闪闪烁烁可爱的星，无数像山似的、马似的、巨人似的奇幻的云彩；你会从那小玻璃上面掠过的一条黑影，想象到这也许是灰色的蝙蝠，也许是会唱歌的夜莺，也许是霸气十足的猫头鹰……总之，夜的美丽神奇，立刻会在你的想象中展开。

发明这天窗的大人们，是应得感谢的。因为活泼会想的孩子们知道怎样从"无"中看出"有"，从"虚"中看出"实"，比任何他们看到的都更真切，更阔达，更复杂，更确实！`,
  },
  {
    id: '4',
    unitId: '1',
    lessonNumber: 4,
    title: '三月桃花水',
    content: `是什么声音，像一串小铃铛，轻轻地走过村边？是什么光芒，像一匹明洁的丝绸，映照着蓝天？

啊，河流醒来了！三月的桃花水，舞动着绮丽的朝霞，向前流啊。有一千朵桃花，点点洒在河面，有一万个小酒窝，在水中回旋。

三月的桃花水，是春天的竖琴。

那忽大忽小的水声，应和着拖拉机的鸣响；那纤细的低语，是在和刚刚从雪被里伸出头来的麦苗谈心；那碰着岸边石块的叮当声，像是大路上车轮滚过的铃声……

三月的桃花水，是春天的明镜。

它看见燕子飞过天空，翅膀上裹着白云；它看见垂柳披上了长发，如雾如烟；它看见一群姑娘来到河边，水底立刻浮起一朵朵红莲，她们捧起了水，像抖落一片片花瓣……

啊，地上草如茵，两岸柳如眉，三月桃花水，叫人多沉醉。`,
  },
  // 第二单元
  {
    id: '5',
    unitId: '2',
    lessonNumber: 5,
    title: '琥珀',
    content: `这个故事发生在很久很久以前，约莫算来，总有几万年了。

一个夏日，太阳暖暖地照着，海在很远的地方翻腾怒吼，绿叶在树上飒飒地响。

一只小苍蝇展开柔嫩的绿翅膀，在阳光下快乐地飞舞。它嗡嗡地穿过草地，飞进树林。`,
  },
  {
    id: '6',
    unitId: '2',
    lessonNumber: 6,
    title: '飞向蓝天的恐龙',
    content: `说到恐龙，人们往往想到凶猛的霸王龙或者笨重、迟钝的马门溪龙；谈起鸟类，我们头脑中自然会浮现轻灵的鸽子或者五彩斑斓的孔雀。二者似乎毫不相干，但近年来发现的大量化石显示：在中生代时期，恐龙的一支经过漫长的演化，最终变成了凌空翱翔的鸟儿。`,
  },
  {
    id: '7',
    unitId: '2',
    lessonNumber: 7,
    title: '纳米技术就在我们身边',
    content: `纳米技术是20世纪90年代兴起的高新技术。如果说20世纪是微米的世纪，21世纪必将是纳米的世纪。

什么是纳米技术呢？这得从纳米说起。纳米是非常非常小的长度单位，1纳米等于十亿分之一米。`,
  },
  {
    id: '8',
    unitId: '2',
    lessonNumber: 8,
    title: '千年梦圆在今朝',
    content: `飞离地球、遨游太空是中华民族很久以来的梦想。在中国的古代，早就流传着"嫦娥奔月"的神话，人飞于天、车走空中的传说，鲲鹏展翅、九天揽月的奇妙想象。`,
  },
  // 第三单元
  {
    id: '9',
    unitId: '3',
    lessonNumber: 9,
    title: '短诗三首',
    content: `《繁星》（七一）
这些事——
是永不漫灭的回忆：
月明的园中，
藤萝的叶下，
母亲的膝上。

《繁星》（一三一）
大海啊！
哪一颗星没有光？
哪一朵花没有香？
哪一次我的思潮里
没有你波涛的清响？

《繁星》（一五九）
母亲啊！
天上的风雨来了，
鸟儿躲到它的巢里；
心中的风雨来了，
我只躲到你的怀里。`,
  },
  {
    id: '10',
    unitId: '3',
    lessonNumber: 10,
    title: '绿',
    content: `好像绿色的墨水瓶倒翻了，
到处是绿的……

到哪儿去找这么多的绿：
墨绿、浅绿、嫩绿、
翠绿、淡绿、粉绿……
绿得发黑、绿得出奇。`,
  },
  {
    id: '11',
    unitId: '3',
    lessonNumber: 11,
    title: '白桦',
    content: `在我的窗前，
有一棵白桦，
仿佛涂上银霜，
披了一身雪花。

毛茸茸的枝头，
雪绣的花边潇洒，
串串花穗齐绽，
洁白的流苏如画。`,
  },
  {
    id: '12',
    unitId: '3',
    lessonNumber: 12,
    title: '在天晴了的时候',
    content: `在天晴了的时候，
该到小径中去走走：
给雨润过的泥路，
一定是凉爽又温柔；
炫耀着新绿的小草，
已一下子洗净了尘垢。`,
  },
  // 第四单元
  {
    id: '13',
    unitId: '4',
    lessonNumber: 13,
    title: '猫',
    content: `猫的性格实在有些古怪。

说它老实吧，它的确有时候很乖。它会找个暖和的地方，成天睡大觉，无忧无虑，什么事也不过问。可是，它决定要出去玩玩，就会出走一天一夜，任凭谁怎么呼唤，它也不肯回来。`,
  },
  {
    id: '14',
    unitId: '4',
    lessonNumber: 14,
    title: '母鸡',
    content: `我一向讨厌母鸡。听吧，它由前院嘎嘎到后院，由后院再嘎嘎到前院，没完没了，并且没有什么理由，讨厌！有的时候，它不这样乱叫，而是细声细气的，有什么心事似的，颤颤巍巍的，顺着墙根，或沿着田坝，那么扯长了声如怨如诉，使人心中立刻结起个小疙瘩来。`,
  },
  {
    id: '15',
    unitId: '4',
    lessonNumber: 15,
    title: '白鹅',
    content: `这白鹅，是一位即将远行的朋友送给我的。我抱着这雪白的"大鸟"回家，放在院子里。它伸长了头颈，左顾右盼，我一看这姿态，想道："好一个高傲的动物！"`,
  },
  // 第五单元
  {
    id: '16',
    unitId: '5',
    lessonNumber: 16,
    title: '海上日出',
    content: `为了看日出，我常常早起。那时天还没有大亮，周围非常清静，船上只有机器的响声。

天空还是一片浅蓝，颜色很浅。转眼间天边出现了一道红霞，慢慢地在扩大它的范围，加强它的亮光。我知道太阳要从天边升起来了，便不转眼地望着那里。`,
  },
  {
    id: '17',
    unitId: '5',
    lessonNumber: 17,
    title: '记金华的双龙洞',
    content: `4月14日，我在浙江金华，游北山的双龙洞。

出金华城大约五公里到罗店，过了罗店就渐渐入山。公路盘曲而上。山上开满了映山红，无论花朵还是叶子，都比盆栽的杜鹃显得有精神。`,
  },
  // 第六单元
  {
    id: '18',
    unitId: '6',
    lessonNumber: 18,
    title: '文言文二则',
    content: `《囊萤夜读》
胤恭勤不倦，博学多通。家贫不常得油，夏月则练囊盛数十萤火以照书，以夜继日焉。

《铁杵成针》
磨针溪，在象耳山下。世传李太白读书山中，未成，弃去。过是溪，逢老媪方磨铁杵。问之，曰："欲作针。"太白感其意，还卒业。`,
  },
  {
    id: '19',
    unitId: '6',
    lessonNumber: 19,
    title: '小英雄雨来（节选）',
    content: `晋察冀边区的北部有一条还乡河，河里长着很多芦苇。河边有个小村庄。芦花开的时候，远远望去，黄绿的芦苇上好像盖了一层厚厚的的白雪。风一吹，鹅毛般的苇絮就飘飘悠悠地飞起来，把这几十家小房屋都罩在柔软的芦花里。`,
  },
  {
    id: '20',
    unitId: '6',
    lessonNumber: 20,
    title: '我们家的男子汉',
    content: `近来，我忽然觉得我们家的男子汉长大了。他不再像过去那样爱哭，那样依恋妈妈了。他已经开始有了自己的主张，自己的事情要自己做，不再愿意别人干涉。`,
  },
  {
    id: '21',
    unitId: '6',
    lessonNumber: 21,
    title: '芦花鞋',
    content: `青铜一家住在油麻地，他们一家有六口人：爸爸、妈妈、奶奶、青铜、葵花，还有一头老牛。青铜是葵花的哥哥，葵花是青铜的妹妹。青铜是一个哑巴，但他很聪明，很能干。`,
  },
  // 第七单元
  {
    id: '22',
    unitId: '7',
    lessonNumber: 22,
    title: '古诗三首',
    content: `《芙蓉楼送辛渐》
[唐] 王昌龄
寒雨连江夜入吴，平明送客楚山孤。
洛阳亲友如相问，一片冰心在玉壶。

《塞下曲》
[唐] 卢纶
月黑雁飞高，单于夜遁逃。
欲将轻骑逐，大雪满弓刀。

《墨梅》
[元] 王冕
我家洗砚池头树，朵朵花开淡墨痕。
不要人夸好颜色，只留清气满乾坤。`,
  },
  {
    id: '23',
    unitId: '7',
    lessonNumber: 23,
    title: '"诺曼底号"遇难记',
    content: `1870年3月17日夜晚，哈尔威船长照例走着从南安普敦到格恩西岛这条航线。大海上夜色正浓，薄雾弥漫。

船长站在驾驶室里，小心翼翼地驾驶着他的"诺曼底号"。乘客们都进入了梦乡。`,
  },
  {
    id: '24',
    unitId: '7',
    lessonNumber: 24,
    title: '黄继光',
    content: `1952年10月，上甘岭战役打响了。这是朝鲜战场上最激烈的一次阵地战。

黄继光所在的营已经持续战斗了四天四夜，第五天夜晚接到上级的命令，要在黎明之前夺下被敌人占领的597.9高地。`,
  },
  {
    id: '25',
    unitId: '7',
    lessonNumber: 25,
    title: '挑山工',
    content: `在泰山上，随处都可以碰到挑山工。他们肩上架一根光溜溜的扁担，扁担两头的绳子挂着沉甸甸的货物。

登山的时候，他们一条胳膊搭在扁担上，另一条胳膊随着步子有节奏地一甩一甩，使身体保持平衡。`,
  },
  // 第八单元
  {
    id: '26',
    unitId: '8',
    lessonNumber: 26,
    title: '宝葫芦的秘密（节选）',
    content: `我来给你们讲个故事。可是我先得介绍介绍我自己：我姓王，叫王葆。我要讲的，正是我自己的一件事情，是我和宝葫芦的故事。`,
  },
  {
    id: '27',
    unitId: '8',
    lessonNumber: 27,
    title: '巨人的花园',
    content: `从前，一个小村子里有座漂亮的花园。那里，春天鲜花盛开，夏天绿树成阴，秋天鲜果飘香，冬天白雪一片。村里的孩子都喜欢到那里玩。`,
  },
  {
    id: '28',
    unitId: '8',
    lessonNumber: 28,
    title: '海的女儿',
    content: `在海的远处，水是那么蓝，像最美丽的矢车菊花瓣，同时又是那么清，像最明亮的玻璃。然而它很深很深，深得任何锚链都达不到底。`,
  },
]

// PDF教材资源
const PDF_RESOURCES = [
  {
    id: 'pdf-1',
    title: '四年级下册语文教材',
    description: '部编人教版四年级下册完整教材PDF，包含全部课文、生字表、词语表等教学资源',
    fileName: 'sample-teaching-material.pdf',
    size: '16.6 MB',
    pages: 151,
    grade: 4,
    semester: '下册',
    version: '部编人教版',
  }
]

export default function LessonPage() {
  const [selectedVersion, setSelectedVersion] = useState<TextbookVersion>('部编人教版')
  const [selectedGrade, setSelectedGrade] = useState<number>(4)
  const [selectedSemester, setSelectedSemester] = useState<'上册' | '下册'>('下册')
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null)
  const [activeTab, setActiveTab] = useState<'content' | 'plan' | 'annotation' | 'pdf'>('content')

  const { setCurrentLesson } = useLessonStore()

  const usageInstructions = "备课中心提供各版本教材资源，支持查看教材 PDF、编写教案和课文标注。选择年级、学期和教材版本后，点击单元可查看课文详情，支持一键生成教案和在线标注功能。"

  const handleSelectLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson)
    setCurrentLesson(lesson)
    setActiveTab('content')
  }

  // 打开PDF
  const handleViewPDF = () => {
    window.open('/resources/sample-teaching-material.pdf', '_blank')
  }

  // 按单元分组课文
  const getLessonsByUnit = (unitId: string) => {
    return MOCK_LESSONS.filter(lesson => lesson.unitId === unitId)
  }

  const units = [
    { id: '1', name: '第一单元' },
    { id: '2', name: '第二单元', pending: true },
    { id: '3', name: '第三单元', pending: true },
    { id: '4', name: '第四单元', pending: true },
    { id: '5', name: '第五单元', pending: true },
    { id: '6', name: '第六单元', pending: true },
    { id: '7', name: '第七单元', pending: true },
    { id: '8', name: '第八单元', pending: true },
  ]

  return (
    <div className="h-[calc(100vh-6rem)] flex gap-4 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative">
      {/* 左侧教材选择 */}
      <div className="w-72 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex flex-col shadow-lg">
        {/* 筛选器和说明 */}
        <div className="p-3 border-b border-white/10 space-y-2">
          {/* 使用说明 - 简化版 */}
          <div className="bg-white/10 rounded-lg p-2 border border-white/20">
            <div className="flex items-start gap-2">
              <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-teal-500 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                <BookOpen className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-xs mb-0.5">使用说明</h3>
                <p className="text-xs text-white/70 leading-tight line-clamp-2">{usageInstructions}</p>
              </div>
            </div>
          </div>
          
          <h1 className="text-base font-semibold text-white px-1">备课中心</h1>
          
          {/* 版本选择 */}
          <select
            value={selectedVersion}
            onChange={(e) => setSelectedVersion(e.target.value as TextbookVersion)}
            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
          >
            {TEXTBOOK_VERSIONS.map((v) => (
              <option key={v} value={v} className="bg-slate-900 text-white">{v}</option>
            ))}
          </select>

          {/* 年级和学期 */}
          <div className="flex gap-2">
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(Number(e.target.value))}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
            >
              {GRADES.map((g) => (
                <option key={g} value={g} className="bg-slate-900 text-white">{g}年级</option>
              ))}
            </select>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value as '上册' | '下册')}
              className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white focus:ring-2 focus:ring-blue-500"
            >
              {SEMESTERS.map((s) => (
                <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
              ))}
            </select>
          </div>
        </div>

        {/* 课文列表 */}
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {units.map((unit) => (
            <div key={unit.id}>
              <div className="text-sm font-medium text-white/70 mb-2 flex items-center gap-2">
                {unit.name}
                {unit.pending && (
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 text-xs rounded-full">待更新</span>
                )}
              </div>
              <div className="space-y-1">
                {getLessonsByUnit(unit.id).map((lesson) => (
                  <button
                    key={lesson.id}
                    onClick={() => handleSelectLesson(lesson)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      selectedLesson?.id === lesson.id && activeTab !== 'pdf'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-l-4 border-white shadow-md'
                        : 'text-white/90 hover:bg-white/10'
                    }`}
                  >
                    <span className="text-xs text-white/60 mr-2">{lesson.lessonNumber}.</span>
                    <span className="font-medium text-sm">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* PDF 教材资源 */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="text-sm font-medium text-white/70 mb-2">PDF 教材资源</div>
            {PDF_RESOURCES.map((pdf) => (
              <button
                key={pdf.id}
                onClick={() => {
                  setActiveTab('pdf')
                  setSelectedLesson(null)
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors mb-2 ${
                  activeTab === 'pdf'
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white border-l-4 border-white shadow-md'
                    : 'text-white/90 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="font-medium text-sm">{pdf.title}</span>
                </div>
                <div className="text-xs text-white/60 mt-1 ml-6">
                  {pdf.grade}年级{pdf.semester} · {pdf.pages}页
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 右侧内容区 */}
      <div className="flex-1 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 flex flex-col shadow-lg">
        {selectedLesson || activeTab === 'pdf' ? (
          <>
            {/* 标签页 */}
            <div className="flex items-center gap-2 p-4 border-b border-white/10">
              {selectedLesson && (
                <>
                  <button
                    onClick={() => setActiveTab('content')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'content'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    课文内容
                  </button>
                  <button
                    onClick={() => setActiveTab('plan')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'plan'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    教案设计
                  </button>
                  <button
                    onClick={() => setActiveTab('annotation')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'annotation'
                        ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                        : 'text-white/80 hover:bg-white/10'
                    }`}
                  >
                    备课标注
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setActiveTab('pdf')
                  setSelectedLesson(null)
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  activeTab === 'pdf'
                    ? 'bg-gradient-to-r from-blue-500 to-teal-500 text-white shadow-md'
                    : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                教材 PDF
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 overflow-y-auto p-6">
              {activeTab === 'content' && selectedLesson && <LessonViewer lesson={selectedLesson} />}
              {activeTab === 'plan' && selectedLesson && <TeachingPlanEditor lesson={selectedLesson} />}
              {activeTab === 'annotation' && selectedLesson && <AnnotationTool lesson={selectedLesson} />}
              {activeTab === 'pdf' && (
                <div className="h-full flex flex-col">
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-white mb-2">{PDF_RESOURCES[0].title}</h2>
                        <p className="text-white/80 mb-4">{PDF_RESOURCES[0].description}</p>
                        <div className="flex items-center gap-4 text-sm text-white/70 mb-4">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-4 h-4" />
                            {PDF_RESOURCES[0].version}
                          </span>
                          <span>{PDF_RESOURCES[0].grade}年级{PDF_RESOURCES[0].semester}</span>
                          <span>{PDF_RESOURCES[0].pages}页</span>
                          <span>{PDF_RESOURCES[0].size}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={handleViewPDF}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:from-blue-600 hover:to-teal-600 transition-colors shadow-md"
                          >
                            <ExternalLink className="w-4 h-4" />
                            在线查看
                          </button>
                          <a
                            href="/resources/sample-teaching-material.pdf"
                            download="四年级下册语文教材.pdf"
                            className="flex items-center gap-2 px-4 py-2 border border-white/30 text-white rounded-lg hover:bg-white/10 transition-colors"
                          >
                            <Download className="w-4 h-4" />
                            下载 PDF
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* PDF 内容预览提示 */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 flex-1 border border-white/20">
                    <h3 className="font-semibold text-white mb-4">教材目录预览</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2">第一单元</h4>
                        <ul className="space-y-1 text-white/70">
                          <li>1. 古诗词三首</li>
                          <li>2. 乡下人家</li>
                          <li>3. 天窗</li>
                          <li>4. 三月桃花水</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2 flex items-center gap-2">
                          第二单元
                          <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 text-xs rounded-full">待更新</span>
                        </h4>
                        <ul className="space-y-1 text-white/70">
                          <li>5. 琥珀</li>
                          <li>6. 飞向蓝天的恐龙</li>
                          <li>7. 纳米技术就在我们身边</li>
                          <li>8. 千年梦圆在今朝</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2">第三单元</h4>
                        <ul className="space-y-1 text-white/70">
                          <li>9. 短诗三首</li>
                          <li>10. 绿</li>
                          <li>11. 白桦</li>
                          <li>12. 在天晴了的时候</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2">第四单元</h4>
                        <ul className="space-y-1 text-white/70">
                          <li>13. 猫</li>
                          <li>14. 母鸡</li>
                          <li>15. 白鹅</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2">第五单元</h4>
                        <ul className="space-y-1 text-white/70">
                          <li>16. 海上日出</li>
                          <li>17. 记金华的双龙洞</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2">第六单元</h4>
                        <ul className="space-y-1 text-white/70">
                          <li>18. 文言文二则</li>
                          <li>19. 小英雄雨来（节选）</li>
                          <li>20. 我们家的男子汉</li>
                          <li>21. 芦花鞋</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2">第七单元</h4>
                        <ul className="space-y-1 text-white/70">
                          <li>22. 古诗三首</li>
                          <li>23. &quot;诺曼底号&quot;遇难记</li>
                          <li>24. 黄继光</li>
                          <li>25. 挑山工</li>
                        </ul>
                      </div>
                      <div className="bg-white/10 p-4 rounded-lg border border-white/20">
                        <h4 className="font-medium text-white mb-2">第八单元</h4>
                        <ul className="space-y-1 text-white/70">
                          <li>26. 宝葫芦的秘密（节选）</li>
                          <li>27. 巨人的花园</li>
                          <li>28. 海的女儿</li>
                        </ul>
                      </div>
                    </div>
                    <div className="mt-6 text-center text-white/60 text-sm">
                      <p>点击"在线查看"按钮在浏览器中查看完整 PDF 教材</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white/60">
            <div className="text-center">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <p className="text-white/80">请选择左侧课文或 PDF 教材开始备课</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
