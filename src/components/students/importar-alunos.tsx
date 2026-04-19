"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  FileSpreadsheet,
  Type,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Student, StudentCategory } from "@/types";

type ImportStudent = Omit<Student, "id" | "schoolId" | "createdAt" | "updatedAt" | "active">;

const VALID_CATEGORIES: StudentCategory[] = [
  "babyfoot","sub6","sub7","sub8","sub9","sub10",
  "sub11","sub12","sub13","sub14","sub15",
];

function normalizeCategory(raw: string): StudentCategory {
  const s = raw.toLowerCase().replace(/\s/g, "").replace("sub-", "sub").replace("sub_", "sub");
  if (VALID_CATEGORIES.includes(s as StudentCategory)) return s as StudentCategory;
  return "sub10"; // fallback
}

function normalizePhone(raw: string): string {
  return raw.replace(/\D/g, "");
}

// ── Parse pasted text (one name per line) ────────────────────────────────────
function parseTextList(text: string): ImportStudent[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 1)
    .map((name) => ({
      name,
      age: 10,
      category: "sub10" as StudentCategory,
      guardian: "",
      phone: "",
      email: "",
    }));
}

// ── Parse CSV rows ────────────────────────────────────────────────────────────
function parseCsvRow(row: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < row.length; i++) {
    const ch = row[i];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if ((ch === "," || ch === ";") && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSV(text: string): ImportStudent[] {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];

  const headers = parseCsvRow(lines[0]).map((h) => h.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  const nameIdx     = headers.findIndex((h) => h.includes("nome"));
  const guardianIdx = headers.findIndex((h) => h.includes("responsavel") || h.includes("responsável"));
  const phoneIdx    = headers.findIndex((h) => h.includes("telefone") || h.includes("fone") || h.includes("celular"));
  const emailIdx    = headers.findIndex((h) => h.includes("email") || h.includes("e-mail"));
  const ageIdx      = headers.findIndex((h) => h.includes("idade"));
  const catIdx      = headers.findIndex((h) => h.includes("categoria"));

  if (nameIdx === -1) return [];

  return lines.slice(1).map((line) => {
    const cols = parseCsvRow(line);
    const raw: ImportStudent = {
      name:     cols[nameIdx]?.trim() || "",
      age:      ageIdx !== -1 ? parseInt(cols[ageIdx]) || 10 : 10,
      category: catIdx !== -1 ? normalizeCategory(cols[catIdx] || "") : "sub10",
      guardian: guardianIdx !== -1 ? cols[guardianIdx]?.trim() || "" : "",
      phone:    phoneIdx !== -1 ? normalizePhone(cols[phoneIdx] || "") : "",
      email:    emailIdx !== -1 ? cols[emailIdx]?.trim() || "" : "",
    };
    return raw;
  }).filter((s) => s.name.length > 1);
}

// ── Parse XLSX using the xlsx library (loaded lazily) ─────────────────────────
async function parseXLSX(buffer: ArrayBuffer): Promise<ImportStudent[]> {
  const XLSX = await import("xlsx");
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_csv(ws);
  return parseCSV(rows);
}

// ── Generate template XLSX ────────────────────────────────────────────────────
async function downloadTemplate() {
  const XLSX = await import("xlsx");
  const data = [
    ["Nome*", "Responsável", "Telefone", "Email", "Idade", "Categoria"],
    ["João Silva", "Carlos Silva", "11999998888", "carlos@email.com", "10", "sub10"],
    ["Pedro Oliveira", "Ana Oliveira", "11988887777", "", "8", "sub8"],
    ["Lucas Santos", "", "", "", "12", "sub12"],
  ];
  const ws = XLSX.utils.aoa_to_sheet(data);
  ws["!cols"] = [
    { wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 8 }, { wch: 12 }
  ];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Alunos");
  XLSX.writeFile(wb, "modelo-importacao-alunos.xlsx");
}

// ── Preview card ─────────────────────────────────────────────────────────────
function PreviewList({ students }: { students: ImportStudent[] }) {
  if (students.length === 0) return null;
  return (
    <div className="rounded-lg border border-border/50 overflow-hidden">
      <div className="bg-muted/30 px-3 py-2 text-xs font-medium text-muted-foreground flex items-center justify-between">
        <span>Pré-visualização</span>
        <span className="text-primary font-semibold">{students.length} aluno{students.length !== 1 ? "s" : ""} encontrado{students.length !== 1 ? "s" : ""}</span>
      </div>
      <div className="max-h-48 overflow-y-auto divide-y divide-border/30">
        {students.slice(0, 50).map((s, i) => (
          <div key={i} className="flex items-center justify-between px-3 py-2 text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span className="font-medium truncate">{s.name}</span>
              {s.guardian && <span className="text-muted-foreground text-xs truncate hidden sm:block">· {s.guardian}</span>}
            </div>
            <span className="text-xs text-muted-foreground shrink-0 ml-2">{s.category}</span>
          </div>
        ))}
        {students.length > 50 && (
          <div className="px-3 py-2 text-xs text-muted-foreground text-center">
            +{students.length - 50} mais...
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
interface ImportarAlunosProps {
  onImport: (student: ImportStudent) => Promise<void>;
}

export function ImportarAlunos({ onImport }: ImportarAlunosProps) {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"texto" | "excel">("texto");
  const [textValue, setTextValue] = useState("");
  const [preview, setPreview] = useState<ImportStudent[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function reset() {
    setTextValue("");
    setPreview([]);
    setFileName(null);
    setImportError(null);
  }

  function handleClose() {
    setOpen(false);
    reset();
  }

  // Live preview while typing
  function handleTextChange(val: string) {
    setTextValue(val);
    setPreview(parseTextList(val));
    setImportError(null);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setImportError(null);
    setPreview([]);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "xlsx" || ext === "xls") {
        const buf = await file.arrayBuffer();
        const students = await parseXLSX(buf);
        if (students.length === 0) {
          setImportError("Nenhum aluno encontrado. Verifique se o arquivo segue o modelo.");
        } else {
          setPreview(students);
        }
      } else if (ext === "csv") {
        const text = await file.text();
        const students = parseCSV(text);
        if (students.length === 0) {
          setImportError("Nenhum aluno encontrado. Verifique se o arquivo segue o modelo.");
        } else {
          setPreview(students);
        }
      } else {
        setImportError("Formato não suportado. Use .xlsx ou .csv");
      }
    } catch {
      setImportError("Erro ao ler o arquivo. Tente novamente.");
    }

    // Reset input so same file can be re-selected
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleImport() {
    if (preview.length === 0) return;
    setImporting(true);
    let ok = 0;
    let fail = 0;
    for (const student of preview) {
      try {
        await onImport(student);
        ok++;
      } catch {
        fail++;
      }
    }
    setImporting(false);
    if (fail === 0) {
      toast.success(`✅ ${ok} aluno${ok !== 1 ? "s" : ""} importado${ok !== 1 ? "s" : ""} com sucesso!`);
    } else {
      toast.warning(`${ok} importado${ok !== 1 ? "s" : ""}, ${fail} com erro.`);
    }
    handleClose();
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-accent transition-colors"
      >
        <Upload className="w-4 h-4" />
        Importar Alunos
      </button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Importar Alunos
            </DialogTitle>
            <DialogDescription>
              Importe vários alunos de uma vez. Dados como telefone e responsável podem ser preenchidos depois.
            </DialogDescription>
          </DialogHeader>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl">
            <button
              onClick={() => { setTab("texto"); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "texto" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Type className="w-4 h-4" />
              Lista de nomes
            </button>
            <button
              onClick={() => { setTab("excel"); reset(); }}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === "excel" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Excel / CSV
            </button>
          </div>

          {/* Tab: Lista de nomes */}
          {tab === "texto" && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Cole ou digite os nomes dos alunos, <strong>um por linha</strong>. Categoria e idade padrão (sub10, 10 anos) — ajuste depois se precisar.
              </p>
              <textarea
                value={textValue}
                onChange={(e) => handleTextChange(e.target.value)}
                placeholder={"João Silva\nPedro Oliveira\nLucas Santos\nMatheus Costa"}
                className="w-full h-36 rounded-lg border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <PreviewList students={preview} />
            </div>
          )}

          {/* Tab: Excel / CSV */}
          {tab === "excel" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Baixe o modelo, preencha no Excel e faça o upload.
                </p>
                <button
                  onClick={downloadTemplate}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  Baixar modelo
                </button>
              </div>

              {/* Drop zone */}
              <label className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors cursor-pointer py-8 px-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                  <FileSpreadsheet className="w-6 h-6 text-muted-foreground" />
                </div>
                {fileName ? (
                  <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    {fileName}
                    <button
                      onClick={(e) => { e.preventDefault(); reset(); }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">Clique para selecionar</p>
                    <p className="text-xs text-muted-foreground mt-1">.xlsx ou .csv</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {importError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {importError}
                </div>
              )}

              <PreviewList students={preview} />
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between gap-3 pt-2 border-t border-border/50">
            <button
              onClick={handleClose}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
            <Button
              onClick={handleImport}
              disabled={preview.length === 0 || importing}
              className="gap-2"
            >
              {importing
                ? <><Loader2 className="w-4 h-4 animate-spin" />Importando...</>
                : <><Upload className="w-4 h-4" />Importar {preview.length > 0 ? `${preview.length} aluno${preview.length !== 1 ? "s" : ""}` : "alunos"}</>
              }
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
