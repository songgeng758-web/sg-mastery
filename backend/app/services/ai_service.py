"""
AI 服务层

封装 DeepSeek API 调用，提供技术概念的类比讲解功能。
使用 OpenAI SDK（兼容 DeepSeek 接口）。
"""

# 标准库
import logging
import os

# 第三方库
from dotenv import load_dotenv
from openai import OpenAI

# 本地模块
from app.models.schemas import ExplainData, ExplainResponse, UsageInfo

load_dotenv()

logger = logging.getLogger(__name__)

# ── API Key 校验（模块加载时立即检测，早于第一次调用）────────────────────────

_PLACEHOLDER = "sk-your-deepseek-api-key-here"
_api_key = os.getenv("DEEPSEEK_API_KEY", "")

if not _api_key or _api_key.strip() == _PLACEHOLDER:
    raise ValueError(
        "DEEPSEEK_API_KEY 未配置或仍为占位符。"
        "请在 backend/.env 中填入真实的 DeepSeek API Key。"
    )

# ── DeepSeek 客户端（单例，模块级别）────────────────────────────────────────

client = OpenAI(
    api_key=_api_key,
    base_url="https://api.deepseek.com/v1",
    timeout=30.0,
)

# ── 系统提示词 ────────────────────────────────────────────────────────────────

SYSTEM_PROMPT = """你是宋庚的私人技术导师。他正在通过 SGMastery 这个 APP 系统补技术基础。
请严格按照下面的人设和输出规则给他讲解每一个技术概念。

【关于宋庚】

身份：郑州轻工业大学应届毕业生，目前在浪潮信息技术公司做实施顾问实习。
日常工作：在客户现场部署人事云 HCM 系统，配置参数，导入数据,解决报错,培训客户使用,处理客户反馈的 bug。
技术现状：大学没好好学编程，目前主要靠 AI 给代码。会基础 Python、pandas、简单 SQL，能看懂代码大意但写不出来。
真实痛点：看不懂报错日志在说什么；不知道一个系统的前端、后端、数据库各自负责什么；客户问"为什么这么慢""为什么报错"时答不上来；看 AI 给的代码会用，但改不动、扩展不了。
目标：先在实施岗站稳脚跟，能独立处理客户问题，转正拿到 5000 底薪。

【讲解每个概念时，按下面五段输出】

第一段【类比】：一句话给出核心类比，格式："[概念] 就像 [生活场景]"。优先用餐厅、快递、办公室协作、档案柜、找人办事、装修、客户现场调试设备这类场景。不要用工厂、机器这种工业感强的类比。

第二段【展开】：用 3-5 句话借助这个场景把原理讲透。每个角色都要明确对应到技术里的什么。

第三段【联系实施工作】：用一段话告诉他这个概念在他实施工作中可能怎么遇到。比如讲数据库联系 HCM 员工表、讲网络通信联系客户现场服务器和浏览器、讲日志联系怎么查报错、讲 SQL 联系给客户跑临时查询。如果概念跟实施工作挂不上，就说"这个概念你在实施工作里直接遇到的不多，但在排查 bug 时偶尔会看到"，不要硬扯。

第四段【差异】：以"不过，和[场景]不同的是"开头，说明类比的局限。

第五段【遇到 AI 给的代码时】这一段最关键。告诉他当 AI 给他涉及这个概念的代码时，要重点看哪几个地方、改哪里能适应自己需求、报错时该看什么。举一个具体的例子。

【风格硬性要求】

全程中文，朋友聊天的口气，但保持专业。
不要轻浮，禁止"亲""哦""哈哈""嘿"这种口气词。
不要说"很简单""一学就会""不难理解"。
不要用"在计算机科学领域""从理论上讲"这种学术腔。
总字数 250-350 字，五段都要有。
术语首次出现时用括号简单解释。
禁止使用任何 Markdown 格式：不要 # 标题、** 加粗 **、- 列表、` 代码块 `。
段落之间用一个空行分隔，纯文字输出。

【绝对不做】

不要假设他懂 Java、C、数据结构、操作系统。
不要让他"自己去查文档"。
不要回避"AI 给代码"这件事——这是他真实工作方式，要直面并教他怎么用得更好。
不要每次都用同一个类比场景，要换着用。"""


# ── 核心函数 ──────────────────────────────────────────────────────────────────

def generate_explanation(topic: str) -> ExplainResponse:
    """
    调用 DeepSeek 生成技术概念的类比讲解。

    Args:
        topic: 要讲解的技术概念名称，来自知识卡片标题。

    Returns:
        ExplainResponse: 包含讲解内容和 token 消耗的响应对象。

    Raises:
        openai.APITimeoutError: DeepSeek 接口超过 30 秒未响应。
        openai.APIConnectionError: 网络连接失败。
        openai.AuthenticationError: API Key 无效。
        openai.RateLimitError: 触发频率限制。
        Exception: 其他未预期错误，统一向上抛出由路由层处理。
    """
    logger.info("DeepSeek 调用开始 | topic: %s", topic)

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            temperature=0.7,
            max_tokens=400,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": topic},
            ],
        )

        content = response.choices[0].message.content or ""
        tokens = response.usage.total_tokens

        logger.info(
            "DeepSeek 调用成功 | topic: %s | tokens: %d",
            topic,
            tokens,
        )

        return ExplainResponse(
            success=True,
            data=ExplainData(content=content),
            usage=UsageInfo(tokens=tokens),
        )

    except Exception as e:
        logger.error(
            "DeepSeek 调用失败 | topic: %s | error: %s",
            topic,
            str(e),
        )
        raise
