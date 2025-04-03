import path from "path";
import * as vscode from 'vscode';
import { ContextData, IssueData } from "../types/types";


export function getContext(editor: vscode.TextEditor | undefined): ContextData | undefined {
    if (!editor) {
        vscode.window.showInformationMessage("No active code editor - please open a file to review.");
        return;
    }
    const input = editor.selection.isEmpty ? editor.document.getText() : editor.document.getText(editor.selection);
    const language = editor.document.languageId;
    const file_name = path.basename(editor.document.fileName);
    const line_count = editor.document.lineCount;
    return { input, language, file_name, line_count };
}

export function createEditorAnnotations(issues: any): vscode.Diagnostic[] | undefined {
    let parsedIssues;

    // parse input
    if (typeof issues === "string") {
        try {
            parsedIssues = JSON.parse(issues);
        } catch (error) {
            console.error("Invalid JSON string:", error);
            return;
        }
    } else {
        parsedIssues = issues;
    }

    // ensure parsedIssues is valid
    if (!parsedIssues || !Array.isArray(parsedIssues.issues)) {
        console.error("Parsed issues are not in the expected format:", parsedIssues);
        return;
    }

    const diagnostics: vscode.Diagnostic[] = [];

    parsedIssues.issues.forEach((issue: IssueData) => {
        const line = issue.line - 1;
        const range = new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER);
        const diagnostic = new vscode.Diagnostic(range, issue.title.toString(), vscode.DiagnosticSeverity.Warning);
        diagnostics.push(diagnostic);
    });
    return diagnostics;

}