interface AIOutputProps {
  text: string
}

const AIOutput = ({ text }: AIOutputProps) => {
  if (!text) return null

  return (
    <div className="p-6 border rounded-xl shadow bg-background space-y-4">
      <h3 className="text-lg font-semibold">AI Summary</h3>
      {text.includes("Please wait") ? (
        <p className="animate-pulse text-muted-foreground">{text}</p>
      ) : (
        <p className="whitespace-pre-line text-muted-foreground">{text}</p>
      )}
    </div>
  )
}

export default AIOutput
