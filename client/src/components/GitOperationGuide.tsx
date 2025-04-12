import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Github } from "lucide-react";
import TerminalOutput from "./TerminalOutput";

export default function GitOperationGuide() {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 text-white p-6">
        <h1 className="text-2xl md:text-3xl font-bold">Git Repository Cloning Guide</h1>
        <p className="mt-2 text-gray-300">How to clone a repository without creating a new folder</p>
      </div>

      {/* Instructions Content */}
      <div className="p-6">
        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Repository Information</h2>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-4">
                  <Github className="h-8 w-8 text-gray-700" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-800">Repository URL</h3>
                  <a 
                    href="https://github.com/Musaib4950e/Chat-app.git" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-blue-600 hover:underline break-all"
                  >
                    https://github.com/Musaib4950e/Chat-app.git
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Standard Cloning vs. Cloning Without Creating a Folder</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Standard Clone */}
            <Card className="border border-gray-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Standard Clone (Creates a New Folder)</CardTitle>
              </CardHeader>
              <CardContent>
                <TerminalOutput 
                  command="git clone https://github.com/Musaib4950e/Chat-app.git"
                  output={[
                    "Cloning into 'Chat-app'...",
                    "remote: Enumerating objects: 100, done.",
                    "remote: Counting objects: 100% (100/100), done.",
                    "remote: Compressing objects: 100% (80/80), done.",
                    "Receiving objects: 100% (100/100), 10.5 KiB | 5.25 MiB/s, done.",
                    "Resolving deltas: 100% (20/20), done."
                  ]}
                />
                <p className="mt-2 text-sm text-gray-600">This creates a new folder named 'Chat-app' containing the repository.</p>
              </CardContent>
            </Card>
            
            {/* Clone without folder */}
            <Card className="border border-gray-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Clone Without Creating a Folder</CardTitle>
              </CardHeader>
              <CardContent>
                <TerminalOutput 
                  command="git clone https://github.com/Musaib4950e/Chat-app.git ."
                  output={[
                    "Cloning into '.'...",
                    "remote: Enumerating objects: 100, done.",
                    "remote: Counting objects: 100% (100/100), done.",
                    "remote: Compressing objects: 100% (80/80), done.",
                    "Receiving objects: 100% (100/100), 10.5 KiB | 5.25 MiB/s, done.",
                    "Resolving deltas: 100% (20/20), done."
                  ]}
                />
                <div className="mt-2 text-sm text-gray-800 bg-yellow-100 p-2 rounded">
                  <strong>Note:</strong> The dot (.) after the repository URL tells Git to clone into the current directory.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Important Considerations</h2>
          <Alert className="bg-blue-50 border-l-4 border-blue-500">
            <AlertDescription>
              <ul className="list-disc ml-5 space-y-2">
                <li>The target directory (current directory in this case) should be empty or Git will refuse to clone.</li>
                <li>If there are files in the directory, you may get an error like: <span className="font-mono text-red-600">fatal: destination path '.' already exists and is not an empty directory.</span></li>
                <li>This method adds all repository files directly to your current working directory.</li>
                <li>All Git history and configuration is preserved.</li>
              </ul>
            </AlertDescription>
          </Alert>
        </section>

        <section className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Alternative Method: Clone and Move Contents</h2>
          <TerminalOutput 
            commands={[
              "git clone https://github.com/Musaib4950e/Chat-app.git temp_folder",
              "mv temp_folder/* temp_folder/.* .",
              "rm -rf temp_folder"
            ]}
            multipleOutputs={[
              ["Cloning into 'temp_folder'..."],
              [],
              []
            ]}
          />
          <p className="mt-2 text-sm text-gray-600">
            This creates a temporary folder, then moves all contents (including hidden files) to the current directory, 
            and finally removes the temporary folder.
          </p>
        </section>
      </div>

      {/* Error Handling */}
      <div className="p-6 bg-gray-50 border-t border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Troubleshooting</h2>
        
        <div className="mb-4">
          <h3 className="font-medium text-gray-800 mb-2">Directory Not Empty Error</h3>
          <TerminalOutput 
            command="git clone https://github.com/Musaib4950e/Chat-app.git ."
            error="fatal: destination path '.' already exists and is not an empty directory."
          />
          <div className="mt-2 p-2 bg-red-50 text-red-700 rounded text-sm">
            To resolve this error, either:
            <ul className="list-disc ml-5 mt-1">
              <li>Clear the contents of the current directory</li>
              <li>Use a different directory that is empty</li>
              <li>Use git init and git pull commands instead (advanced)</li>
            </ul>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Advanced Git Solution</h3>
          <TerminalOutput 
            commands={[
              "git init",
              "git remote add origin https://github.com/Musaib4950e/Chat-app.git",
              "git pull origin main"
            ]}
            multipleOutputs={[
              ["Initialized empty Git repository in /current/directory/.git/"],
              [],
              ["From https://github.com/Musaib4950e/Chat-app", " * branch            main       -> FETCH_HEAD"]
            ]}
          />
          <p className="mt-2 text-sm text-gray-600">
            This initializes a Git repository, adds the remote, and pulls all content - useful if you need more 
            control or if the directory has some existing files.
          </p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-800 text-white p-6">
        <div className="text-sm text-gray-400">
          <p>
            Note: These commands are for demonstration purposes. The exact output may vary depending 
            on your system, Git version, and repository details.
          </p>
          <p className="mt-2">
            Always ensure you have proper permissions and backups before performing Git operations.
          </p>
        </div>
      </div>
    </div>
  );
}
