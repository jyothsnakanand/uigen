import { Loader2 } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args?: any;
  state: string;
}

function getToolDisplayMessage(toolName: string, args?: any): string {
  const path = args?.path || "";
  const fileName = path.split("/").pop() || path;

  if (toolName === "str_replace_editor") {
    const command = args?.command;
    switch (command) {
      case "create":
        return fileName ? `Creating ${fileName}` : "Creating file";
      case "view":
        return fileName ? `Viewing ${fileName}` : "Viewing file";
      case "str_replace":
        return fileName ? `Editing ${fileName}` : "Editing file";
      case "insert":
        return fileName ? `Inserting into ${fileName}` : "Inserting content";
      default:
        return fileName ? `Editing ${fileName}` : "Editing file";
    }
  }

  if (toolName === "file_manager") {
    const command = args?.command;
    const newPath = args?.new_path || "";
    const newFileName = newPath.split("/").pop() || newPath;

    switch (command) {
      case "rename":
        return fileName && newFileName
          ? `Renaming ${fileName} to ${newFileName}`
          : "Renaming file";
      case "delete":
        return fileName ? `Deleting ${fileName}` : "Deleting file";
      default:
        return fileName ? `Managing ${fileName}` : "Managing file";
    }
  }

  return toolName;
}

export function ToolInvocationBadge({
  toolName,
  args,
  state,
}: ToolInvocationBadgeProps) {
  const displayMessage = getToolDisplayMessage(toolName, args);
  const isComplete = state === "result";

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {isComplete ? (
        <>
          <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
          <span className="text-neutral-700">{displayMessage}</span>
        </>
      ) : (
        <>
          <Loader2 className="w-3 h-3 animate-spin text-blue-600" />
          <span className="text-neutral-700">{displayMessage}</span>
        </>
      )}
    </div>
  );
}
