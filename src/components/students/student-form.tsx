"use client";

import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Loader2, Camera, X } from "lucide-react";
import type { Student, StudentCategory } from "@/types";

const categories: StudentCategory[] = ["babyfoot", "sub6", "sub7", "sub8", "sub9", "sub10", "sub11", "sub12", "sub13", "sub14", "sub15"];

interface StudentFormProps {
  student?: Student;
  onSubmit: (data: Omit<Student, "id" | "schoolId" | "createdAt" | "updatedAt" | "active">) => Promise<void>;
  trigger?: React.ReactNode;
}

export function StudentForm({ student, onSubmit, trigger }: StudentFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(student?.name ?? "");
  const [age, setAge] = useState(student?.age?.toString() ?? "");
  const [birthDate, setBirthDate] = useState(student?.birthDate ?? "");
  const [category, setCategory] = useState<StudentCategory>(student?.category ?? "sub9");
  const [guardian, setGuardian] = useState(student?.guardian ?? "");
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState(student?.email ?? "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(student?.photoUrl ?? null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (student && open) {
      setName(student.name);
      setAge(student.age?.toString() ?? "");
      setBirthDate(student.birthDate ?? "");
      setCategory(student.category);
      setGuardian(student.guardian);
      setPhone(student.phone);
      setEmail(student.email);
      setPhotoPreview(student.photoUrl ?? null);
      setPhotoFile(null);
    }
  }, [student, open]);

  const isEditing = !!student;

  function resetForm() {
    if (!student) {
      setName(""); setAge(""); setBirthDate(""); setCategory("sub9");
      setGuardian(""); setPhone(""); setPhoneError(""); setEmail("");
      setPhotoFile(null); setPhotoPreview(null);
    }
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Foto muito grande. Máximo 5MB."); return; }
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function compressImage(file: File): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX = 800;
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width > height) { height = Math.round((height * MAX) / width); width = MAX; }
          else { width = Math.round((width * MAX) / height); height = MAX; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("canvas error")); return; }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else reject(new Error("compression failed"));
        }, "image/jpeg", 0.75);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("image load error")); };
      img.src = url;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedGuardian = guardian.trim();
    const digitsOnly = phone.replace(/\D/g, "");

    if (!trimmedName) { toast.error("Preencha o nome do aluno."); return; }
    if (!age || parseInt(age, 10) < 3 || parseInt(age, 10) > 18) { toast.error("A idade deve ser entre 3 e 18 anos."); return; }
    if (!trimmedGuardian) { toast.error("Preencha o nome do responsável."); return; }
    if (digitsOnly.length === 0) { setPhoneError("O telefone é obrigatório."); return; }
    if (digitsOnly.length < 10 || digitsOnly.length > 11) { setPhoneError("Digite um número válido com DDD (10 ou 11 dígitos)."); return; }
    setPhoneError("");

    setLoading(true);
    try {
      let photoUrl = student?.photoUrl ?? "";
      if (photoFile) {
        const compressed = await compressImage(photoFile);
        const storageRef = ref(storage, `students/${Date.now()}.jpg`);
        const uploadPromise = uploadBytes(storageRef, compressed, { contentType: "image/jpeg" });
        const timeoutPromise = new Promise<never>((_, rej) => setTimeout(() => rej(new Error("timeout")), 30000));
        const snap = await Promise.race([uploadPromise, timeoutPromise]);
        photoUrl = await getDownloadURL(snap.ref);
      }

      await onSubmit({
        name: trimmedName,
        age: parseInt(age, 10),
        birthDate: birthDate || undefined,
        photoUrl: photoUrl || undefined,
        category,
        guardian: trimmedGuardian,
        phone: digitsOnly,
        email: email.trim(),
      });
      setOpen(false);
      resetForm();
      toast.success(isEditing ? `Dados de ${trimmedName} atualizados!` : `${trimmedName} cadastrado com sucesso!`);
    } catch (err: unknown) {
      console.error("Erro ao salvar aluno:", err);
      const msg = err instanceof Error ? err.message : "";
      if (msg === "timeout") toast.error("Upload da foto demorou muito. Verifique sua conexão e tente novamente.");
      else toast.error("Erro ao salvar aluno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger className="inline-flex items-center" onClick={() => setOpen(true)}>
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          Novo Aluno
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar Aluno" : "Novo Aluno"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Photo upload */}
          <div className="flex items-center gap-4">
            <div className="relative w-16 h-16 rounded-full overflow-hidden bg-muted border border-border shrink-0">
              {photoPreview
                ? <img src={photoPreview} alt="Foto" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex items-center justify-center text-muted-foreground"><Camera className="w-6 h-6" /></div>
              }
            </div>
            <div className="flex flex-col gap-1.5">
              <button type="button" onClick={() => fileRef.current?.click()} className="text-sm text-primary hover:underline font-medium text-left">
                {photoPreview ? "Trocar foto" : "Adicionar foto"}
              </button>
              {photoPreview && (
                <button type="button" onClick={() => { setPhotoFile(null); setPhotoPreview(null); }} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1">
                  <X className="w-3 h-3" /> Remover foto
                </button>
              )}
              <p className="text-xs text-muted-foreground">JPG ou PNG, máx. 5MB</p>
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handlePhotoChange} className="hidden" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome do aluno" autoFocus disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade <span className="text-destructive">*</span></Label>
              <Input id="age" type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="10" min="3" max="18" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input id="birthDate" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} disabled={loading} />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Categoria</Label>
              <Select value={category} onValueChange={(val) => { if (val) setCategory(val as StudentCategory); }} disabled={loading}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="guardian">Responsável <span className="text-destructive">*</span></Label>
              <Input id="guardian" value={guardian} onChange={(e) => setGuardian(e.target.value)} placeholder="Nome do responsável" required disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone <span className="text-destructive">*</span></Label>
              <Input
                id="phone" value={phone}
                onChange={(e) => { setPhone(e.target.value); if (phoneError) setPhoneError(""); }}
                placeholder="(11) 99999-9999" disabled={loading}
                aria-invalid={!!phoneError}
                className={phoneError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {phoneError && <p className="text-xs text-destructive">{phoneError}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" disabled={loading} />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : isEditing ? "Salvar Alterações" : "Cadastrar Aluno"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
