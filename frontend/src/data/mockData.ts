/**
 * Mock 数据文件
 * 
 * 包含应用中使用的所有模拟数据
 * 用于 MVP 阶段的前端开发和测试
 */

import type {
  User,
  KnowledgeCard,
  DebugChallenge,
  HCMScenario
} from '../types';

/**
 * Mock 用户数据
 * 
 * 全局写死的模拟用户，用于本地单机运行模式
 */
export const mockUser: User = {
  id: 'user_001',
  name: '学习者',
  avatar: '/avatar.png'
};

/**
 * 知识卡片数据
 * 
 * 用于知识补给站页面的学习内容推送
 * 至少包含 3 个卡片，涵盖不同技术主题
 */
export const knowledgeCards: KnowledgeCard[] = [
  {
    id: 'k1',
    title: '秒懂前后端通信',
    tags: ['前后端', '基础'],
    content: `前后端通信是 Web 应用的核心机制。前端（浏览器）通过 HTTP 协议向后端（服务器）发送请求，后端处理请求后返回响应。

常见的通信方式：
- REST API：使用 HTTP 方法（GET、POST、PUT、DELETE）操作资源
- JSON 格式：前后端数据交换的标准格式
- CORS：跨域资源共享，允许前端访问不同域名的后端 API

在本应用中，我们使用 FastAPI 构建后端 API，React 前端通过 fetch 发送请求，实现代码执行功能。`
  },
  {
    id: 'k2',
    title: 'CPU vs GPU：谁更强？',
    tags: ['硬件', '性能'],
    content: `CPU（中央处理器）和 GPU（图形处理器）各有所长：

CPU 特点：
- 少量核心（通常 4-16 个），但每个核心性能强大
- 适合串行计算和复杂逻辑处理
- 擅长处理分支预测、缓存优化等复杂任务

GPU 特点：
- 大量核心（数千个），但每个核心相对简单
- 适合并行计算和大规模数据处理
- 擅长图形渲染、机器学习、科学计算

选择建议：通用计算用 CPU，大规模并行计算用 GPU。现代应用常常结合两者优势。`
  },
  {
    id: 'k3',
    title: '数据库索引的秘密',
    tags: ['数据库', '优化'],
    content: `数据库索引是提升查询性能的关键技术，就像书籍的目录一样。

索引原理：
- B+ 树结构：平衡树，保证查询时间复杂度为 O(log n)
- 空间换时间：索引占用额外存储空间，但大幅提升查询速度
- 选择性：高选择性的列（如用户 ID）更适合建立索引

使用建议：
- WHERE 子句中频繁查询的列应建立索引
- JOIN 操作的关联列应建立索引
- 避免过度索引：每个索引都会降低写入性能
- 定期分析和优化索引使用情况

在 HCM 实战模块中，你将练习如何使用索引优化查询性能。`
  },
  {
    id: 'k4',
    title: 'Python 异常处理最佳实践',
    tags: ['Python', '编程规范'],
    content: `正确的异常处理能让代码更健壮、更易维护。

最佳实践：
1. 具体捕获异常：避免使用 except Exception，应捕获具体异常类型
2. 使用 finally 清理资源：确保文件、连接等资源被正确释放
3. 不要吞掉异常：至少记录日志，让问题可追踪
4. 自定义异常：为业务逻辑定义专门的异常类

示例：
try:
    result = risky_operation()
except ValueError as e:
    logger.error(f"Invalid value: {e}")
    raise
except IOError as e:
    logger.error(f"IO error: {e}")
    return default_value
finally:
    cleanup_resources()

在代码扫雷模块中，你将遇到各种异常处理场景。`
  }
];

/**
 * 代码扫雷关卡数据
 * 
 * 用于代码扫雷页面的调试挑战
 * 包含预填充代码和提示信息
 */
export const debugChallenges: DebugChallenge[] = [
  {
    level: 1,
    totalLevels: 10,
    code: `def greet(name):
    print("Hello, " + name)

# 测试代码
greet("World")
greet(123)  # 这里有问题！`,
    hint: '提示：检查函数参数类型，字符串拼接时需要确保所有操作数都是字符串类型。'
  },
  {
    level: 2,
    totalLevels: 10,
    code: `def calculate_average(numbers):
    total = 0
    for num in numbers:
        total += num
    return total / len(numbers)

# 测试数据
scores = [85, 90, 78, 92, 88]
print(f"平均分: {calculate_average(scores)}")

# 边界情况
empty_list = []
print(f"空列表平均分: {calculate_average(empty_list)}")`,
    hint: '提示：考虑空列表的情况，除以零会导致错误。需要添加边界条件检查。'
  },
  {
    level: 3,
    totalLevels: 10,
    code: `def calculate_salary(base, bonus):
    return base + bonus

# 员工薪资数据
employees = [
    {"name": "张三", "base": 5000, "bonus": 1000},
    {"name": "李四", "base": 6000, "bonus": None},  # 注意这里
    {"name": "王五", "base": 5500, "bonus": 1200}
]

for emp in employees:
    salary = calculate_salary(emp["base"], emp["bonus"])
    print(f"{emp['name']} 的总薪资: {salary}")`,
    hint: '当前数据中存在空值（None），需要处理。提示：在计算前检查 bonus 是否为 None，如果是则使用默认值 0。'
  },
  {
    level: 4,
    totalLevels: 10,
    code: `def find_duplicates(items):
    duplicates = []
    for i in range(len(items)):
        for j in range(i + 1, len(items)):
            if items[i] == items[j]:
                duplicates.append(items[i])
    return duplicates

# 测试数据
data = [1, 2, 3, 2, 4, 3, 5, 2]
result = find_duplicates(data)
print(f"重复元素: {result}")`,
    hint: '提示：当前实现会重复添加相同的元素。考虑使用集合（set）来去重，或者在添加前检查元素是否已存在。'
  },
  {
    level: 5,
    totalLevels: 10,
    code: `import json

def load_config(filename):
    with open(filename, 'r') as f:
        config = json.load(f)
    return config

# 加载配置
config = load_config('config.json')
print(f"数据库地址: {config['database']['host']}")
print(f"端口: {config['database']['port']}")`,
    hint: '提示：文件可能不存在，或 JSON 格式可能有误，或配置项可能缺失。需要添加异常处理和键存在性检查。'
  }
];

/**
 * HCM 实战场景数据
 * 
 * 用于 HCM 实战页面的 SQL 练习
 * 包含业务场景描述、员工数据和初始 SQL 代码
 */
export const hcmScenarios: HCMScenario[] = [
  {
    description: '找出生效日期冲突的人员：在 HCM 系统中，同一员工不应该有重叠的生效期。请编写 SQL 查询找出所有存在日期冲突的员工记录。',
    employees: [
      {
        id: 'E001',
        name: '张三',
        position: '工程师',
        effectiveDate: '2023-01-01',
        expirationDate: '2023-12-31'
      },
      {
        id: 'E001',
        name: '张三',
        position: '高级工程师',
        effectiveDate: '2023-06-01',
        expirationDate: '2024-06-01'
      },
      {
        id: 'E002',
        name: '李四',
        position: '产品经理',
        effectiveDate: '2023-03-01',
        expirationDate: '2023-09-30'
      },
      {
        id: 'E002',
        name: '李四',
        position: '高级产品经理',
        effectiveDate: '2023-10-01',
        expirationDate: '2024-03-31'
      },
      {
        id: 'E003',
        name: '王五',
        position: '设计师',
        effectiveDate: '2023-02-01',
        expirationDate: '2023-08-31'
      },
      {
        id: 'E003',
        name: '王五',
        position: '高级设计师',
        effectiveDate: '2023-07-01',
        expirationDate: '2024-01-31'
      },
      {
        id: 'E004',
        name: '赵六',
        position: '测试工程师',
        effectiveDate: '2023-04-01',
        expirationDate: '2023-10-31'
      },
      {
        id: 'E004',
        name: '赵六',
        position: '高级测试工程师',
        effectiveDate: '2023-11-01',
        expirationDate: '2024-04-30'
      },
      {
        id: 'E005',
        name: '孙七',
        position: '运维工程师',
        effectiveDate: '2023-05-01',
        expirationDate: '2023-11-30'
      },
      {
        id: 'E005',
        name: '孙七',
        position: '高级运维工程师',
        effectiveDate: '2023-10-01',
        expirationDate: '2024-05-31'
      }
    ],
    initialCode: `-- 编写 SQL 查询找出生效日期冲突的员工
-- 提示：使用自连接（self join）比较同一员工的不同记录
-- 冲突条件：记录 A 的生效日期在记录 B 的生效期内

SELECT 
    e1.id AS employee_id,
    e1.name,
    e1.position AS position1,
    e1.effectiveDate AS start1,
    e1.expirationDate AS end1,
    e2.position AS position2,
    e2.effectiveDate AS start2,
    e2.expirationDate AS end2
FROM employees e1
JOIN employees e2 
    ON e1.id = e2.id 
    AND e1.effectiveDate < e2.effectiveDate
WHERE 
    -- 在这里添加日期重叠的条件
    -- 提示：e1 的失效日期应该在 e2 的生效日期之前才不冲突
    ;`
  },
  {
    description: '统计员工职位变动次数：分析每个员工的职位变动历史，统计每个员工有多少条职位记录，以及他们的最新职位。',
    employees: [
      {
        id: 'E001',
        name: '张三',
        position: '工程师',
        effectiveDate: '2023-01-01',
        expirationDate: '2023-05-31'
      },
      {
        id: 'E001',
        name: '张三',
        position: '高级工程师',
        effectiveDate: '2023-06-01',
        expirationDate: '2023-12-31'
      },
      {
        id: 'E001',
        name: '张三',
        position: '技术专家',
        effectiveDate: '2024-01-01',
        expirationDate: '2024-12-31'
      },
      {
        id: 'E002',
        name: '李四',
        position: '产品经理',
        effectiveDate: '2023-03-01',
        expirationDate: '2024-12-31'
      },
      {
        id: 'E003',
        name: '王五',
        position: '设计师',
        effectiveDate: '2023-02-01',
        expirationDate: '2023-08-31'
      },
      {
        id: 'E003',
        name: '王五',
        position: '高级设计师',
        effectiveDate: '2023-09-01',
        expirationDate: '2024-12-31'
      }
    ],
    initialCode: `-- 统计每个员工的职位变动次数和最新职位
-- 提示：使用 GROUP BY 和聚合函数

SELECT 
    id AS employee_id,
    name,
    -- 在这里添加统计逻辑
FROM employees
GROUP BY id, name
ORDER BY employee_id;`
  }
];

/**
 * 导出所有 mock 数据
 * 
 * 便于在其他模块中统一导入
 */
export default {
  mockUser,
  knowledgeCards,
  debugChallenges,
  hcmScenarios
};
