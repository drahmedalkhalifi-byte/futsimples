"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { storage, db } from "@/lib/firebase";
import { FileText, Upload, Loader2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Student } from "@/types";

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

function validateFile(file: File): string | null {
  if (file.type !== "application/pdf") {
    return "Apenas arquivos PDF são aceitos.";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "O arquivo deve ter no máximo 5MB.";
  }
  return null;
}

interface StudentDocumentsProps {
  student: Student;
  trigger?: React.ReactNode;
}

export function StudentDocuments({ student, trigger }: StudentDocumentsProps) {
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = student.documents ?? [];

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      toast.error(error);
      e.target.value = "";
      return;
    }

    // Capture input reference before entering async context
    const input = fileInputRef.current;

    setUploading(true);
    try {
      const safeName = file.name.replace(/\s+/g, "_");
      const storageRef = ref(
        storage,
        `students/${student.id}/documents/${Date.now()}_${safeName}`
      );

      // Upload with 30s timeout
      const uploadPromise = uploadBytes(storageRef, file);
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Tempo esgotado (30s). Verifique sua conexão.")), 30000)
      );
      const snapshot = await Promise.race([uploadPromise, timeout]);
      const url = await getDownloadURL(snapshot.ref);

      await updateDoc(doc(db, "students", student.id), {
        documents: arrayUnion({
          name: file.name,
          url,
          createdAt: new Date().toISOString(),
        }),
      });

      toast.success("Documento enviado com sucesso!");
    } catch (err) {
      console.error("UPLOAD ERROR:", err);
      // Show the real Firebase error code to help debug
      const code = (err as { code?: string }).code ?? "";
      if (code === "storage/unauthorized") {
        toast.error("Sem permissão para enviar arquivos. Verifique as regras do Firebase Storage.");
      } else if (code === "storage/bucket-not-found" || code === "storage/no-default-bucket") {
        toast.error("Firebase Storage não está ativado neste projeto. Ative em console.firebase.google.com.");
      } else {
        const msg = err instanceof Error ? err.message : String(err);
        toast.error(`Erro no upload: ${msg}`);
      }
    } finally {
      setUploading(false);
      if (input) input.value = "";
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={handleFileChange}
        disabled={uploading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        {trigger ? (
          <span onClick={() => setOpen(true)} className="inline-flex items-center cursor-pointer">
            {trigger}
          </span>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors"
            title="Documentos"
          >
            <FileText className="w-4 h-4 text-muted-foreground" />
          </button>
        )}

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Documentos — {student.name}</DialogTitle>
            <DialogDescription>
              Documentos em PDF enviados para este aluno.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {documents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum documento enviado ainda.
              </p>
            ) : (
              <ul className="space-y-2">
                {documents.map((doc, i) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border/50 bg-muted/30 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="text-sm text-foreground truncate">{doc.name}</span>
                    </div>
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors shrink-0"
                      title="Abrir documento"
                    >
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </a>
                  </li>
                ))}
              </ul>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Enviar PDF
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
