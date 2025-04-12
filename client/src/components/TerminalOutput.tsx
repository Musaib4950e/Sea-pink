interface TerminalOutputProps {
  command?: string;
  commands?: string[];
  output?: string[];
  multipleOutputs?: string[][];
  error?: string;
}

export default function TerminalOutput({
  command,
  commands,
  output,
  multipleOutputs,
  error
}: TerminalOutputProps) {
  return (
    <div className="bg-[#1E1E1E] text-[#F0F0F0] p-3 rounded font-mono text-sm overflow-x-auto">
      {command && (
        <>
          <span className="text-[#50FA7B]">$</span>{" "}
          <span className="text-[#8BE9FD]">{command}</span>
          <br />
        </>
      )}
      
      {commands && commands.map((cmd, index) => (
        <div key={index}>
          <span className="text-[#50FA7B]">$</span>{" "}
          <span className="text-[#8BE9FD]">{cmd}</span>
          <br />
          {multipleOutputs && multipleOutputs[index] && multipleOutputs[index].map((line, lineIndex) => (
            <span key={lineIndex} className="text-[#F8F8F2]">
              {line}
              <br />
            </span>
          ))}
        </div>
      ))}
      
      {output && output.map((line, index) => (
        <span key={index} className="text-[#F8F8F2]">
          {line}
          <br />
        </span>
      ))}
      
      {error && (
        <span className="text-[#FF5555]">
          {error}
          <br />
        </span>
      )}
    </div>
  );
}
