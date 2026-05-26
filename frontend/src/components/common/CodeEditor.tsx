import React from 'react';

export interface CodeEditorProps {
  /** 代码内容 */
  value: string;
  /** 内容变化回调 */
  onChange: (value: string) => void;
  /** 代码语言类型（可选） */
  language?: 'python' | 'sql';
  /** 占位符文本（可选） */
  placeholder?: string;
  /** 文件名标识（可选） */
  filename?: string;
  /** 自定义类名（可选） */
  className?: string;
}

/**
 * CodeEditor 组件
 * 
 * 简洁的代码编辑器组件，使用原生 textarea 实现
 * 提供深色主题、等宽字体和可选的文件名显示
 * 
 * 需求: 7.1, 7.2, 7.3, 7.4, 7.6, 10.7
 */
const CodeEditor: React.FC<CodeEditorProps> = ({
  value,
  onChange,
  language = 'python',
  placeholder = '// 在此输入代码...',
  filename,
  className = '',
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* 可选的文件名标识 */}
      {filename && (
        <div className="
          flex 
          items-center 
          px-3 sm:px-4 
          py-2 
          bg-gray-800/80 
          border-b 
          border-gray-700/50
          rounded-t-lg
        ">
          <span className="text-xs sm:text-sm text-gray-400 font-mono truncate">
            {filename}
          </span>
        </div>
      )}

      {/* 代码编辑区域 */}
      <textarea
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className={`
          w-full
          min-h-[200px] sm:min-h-[300px]
          p-3 sm:p-4
          bg-gray-900/90
          text-gray-100
          font-mono
          text-xs sm:text-sm
          leading-relaxed
          border
          border-gray-700/50
          hover:border-gray-600/50
          focus:border-blue-500/50
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500/20
          resize-y
          transition-all
          duration-200
          placeholder:text-gray-600
          ${filename ? 'rounded-b-lg' : 'rounded-lg'}
        `}
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        data-language={language}
      />
    </div>
  );
};

export default CodeEditor;
