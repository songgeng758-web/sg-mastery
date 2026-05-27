import type { HcmProblemDetail } from '../../types';
import { CodeEditor } from './CodeEditor';

interface ProblemCardProps {
  problem: HcmProblemDetail;
}

export function ProblemCard({ problem }: ProblemCardProps) {
  const isMultiTable =
    problem.sample_data.length > 0 && 'table' in problem.sample_data[0];

  // Group rows by table name, stripping the 'table' meta-key from each row
  const tableGroups: Record<string, Record<string, unknown>[]> = {};
  if (isMultiTable) {
    for (const row of problem.sample_data) {
      const tableName = row['table'] as string;
      if (!tableGroups[tableName]) tableGroups[tableName] = [];
      tableGroups[tableName].push(
        Object.fromEntries(Object.entries(row).filter(([k]) => k !== 'table'))
      );
    }
  }

  // Derive display column names from schema (strip 'tablename.' prefix)
  const schemaColumns = problem.schema.map((f) => {
    const dot = f.column.indexOf('.');
    return dot >= 0 ? f.column.slice(dot + 1) : f.column;
  });

  return (
    <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4 space-y-5">

      {/* ── Title + Tags ─────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <h2 className="text-lg font-bold text-white leading-snug">{problem.title}</h2>
          <span className="text-xs text-gray-500 font-mono shrink-0 mt-0.5">{problem.id}</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {problem.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* ── Scenario ─────────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1.5">场景描述</p>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {problem.scenario}
        </p>
      </div>

      {/* ── Schema Table ─────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1.5">表结构</p>
        <div className="overflow-x-auto rounded-lg border border-gray-700">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-gray-700/50 text-gray-400">
                <th className="px-3 py-2 font-medium">字段</th>
                <th className="px-3 py-2 font-medium">类型</th>
                <th className="px-3 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {problem.schema.map((field, i) => (
                <tr key={i} className="border-t border-gray-700/50 hover:bg-gray-700/20">
                  <td className="px-3 py-2 font-mono text-blue-300 whitespace-nowrap">
                    {field.column}
                  </td>
                  <td className="px-3 py-2 font-mono text-green-300 whitespace-nowrap">
                    {field.type}
                  </td>
                  <td className="px-3 py-2 text-gray-400">{field.comment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Sample Data ───────────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1.5">样例数据</p>
        {isMultiTable ? (
          <div className="space-y-3">
            {Object.entries(tableGroups).map(([tableName, rows]) => {
              const cols = rows.length > 0 ? Object.keys(rows[0]) : [];
              return (
                <div key={tableName}>
                  <p className="text-xs text-gray-500 font-mono mb-1">{tableName}</p>
                  <SampleTable cols={cols} rows={rows} />
                </div>
              );
            })}
          </div>
        ) : (
          <SampleTable cols={schemaColumns} rows={problem.sample_data} />
        )}
      </div>

      {/* ── Expected Output ───────────────────────────────────────────────── */}
      <div>
        <p className="text-xs text-gray-500 font-medium mb-1.5">预期输出</p>
        <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
          {problem.expected_output}
        </p>
      </div>

      {/* ── Code（Python 题：有问题的原始代码）───────────────────────────── */}
      {problem.code && (
        <div>
          <p className="text-xs text-gray-500 font-medium mb-1.5">原始代码（有问题）</p>
          <CodeEditor
            value={problem.code}
            onChange={() => {}}
            language="python"
            readOnly
          />
        </div>
      )}
    </div>
  );
}

// ── helper ───────────────────────────────────────────────────────────────────

function SampleTable({
  cols,
  rows,
}: {
  cols: string[];
  rows: Record<string, unknown>[];
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700">
      <table className="w-full text-xs text-left">
        <thead>
          <tr className="bg-gray-700/50 text-gray-400">
            {cols.map((col) => (
              <th key={col} className="px-3 py-2 font-medium font-mono whitespace-nowrap">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-t border-gray-700/50 hover:bg-gray-700/20">
              {cols.map((col) => (
                <td key={col} className="px-3 py-2 text-gray-300 font-mono whitespace-nowrap">
                  {row[col] === null || row[col] === undefined ? (
                    <span className="text-gray-600 italic">NULL</span>
                  ) : (
                    String(row[col])
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
