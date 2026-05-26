interface CodeBlockProps {
  code: string;
  selectedLines: Set<number>;
  onLineClick: (line: number) => void;
}

export default function CodeBlock({ code, selectedLines, onLineClick }: CodeBlockProps) {
  const lines = code.split('\n');

  return (
    <div className="bg-gray-900 rounded-lg overflow-x-auto font-mono text-sm leading-6">
      {lines.map((lineContent, idx) => {
        const lineNum = idx + 1;
        const isSelected = selectedLines.has(lineNum);

        return (
          <div
            key={lineNum}
            onClick={() => onLineClick(lineNum)}
            className={`flex cursor-pointer select-none whitespace-pre ${
              isSelected
                ? 'bg-blue-600/30 border-l-2 border-blue-400'
                : 'hover:bg-gray-700/40 border-l-2 border-transparent'
            }`}
          >
            {/* 行号 */}
            <span className="w-10 shrink-0 pr-3 text-right text-gray-500 pointer-events-none">
              {lineNum}
            </span>
            {/* 代码内容 */}
            <span className="text-gray-200 pr-4">{lineContent}</span>
          </div>
        );
      })}
    </div>
  );
}
