"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { Plus, Loader2 } from "lucide-react";
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
  const [category, setCategory] = useState<StudentCategory>(
    student?.category ?? "sub9"
  );
  const [guardian, setGuardian] = useState(student?.guardian ?? "");
  const [phone, setPhone] = useState(student?.phone ?? "");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState(student?.email ?? "");

  // Sync form when editing and student data changes
  useEffect(() => {
    if (student && open) {
      setName(student.name);
      setAge(student.age?.toString() ?? "");
      setCategory(student.category);
      setGuardian(student.guardian);
      setPhone(student.phone);
      setEmail(student.email);
    }
  }, [student, open]);

  const isEditing = !!student;

  function resetForm() {
    if (!student) {
      setName("");
      setAge("");
      setCategory("sub9");
      setGuardian("");
      setPhone("");
      setPhoneError("");
      setEmail("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedGuardian = guardian.trim();
    const digitsOnly = phone.replace(/\D/g, "");

    if (!trimmedName) {
      toast.error("Preencha o nome do aluno.");
      return;
    }
    if (!age || parseInt(age, 10) < 3 || parseInt(age, 10) > 18) {
      toast.error("A idade deve ser entre 3 e 18 anos.");
      return;
    }
    if (!trimmedGuardian) {
      toast.error("Preencha o nome do responsável.");
      return;
    }
    if (digitsOnly.length === 0) {
      setPhoneError("O telefone é obrigatório.");
      return;
    }
    if (digitsOnly.length < 10 || digitsOnly.length > 11) {
      setPhoneError("Digite um número válido com DDD (10 ou 11 dígitos).");
      return;
    }
    setPhoneError("");

    setLoading(true);
    try {
      await onSubmit({
        name: trimmedName,
        age: parseInt(age, 10),
        category,
        guardian: trimmedGuardian,
        phone: digitsOnly,
        email: email.trim(),
      });
      setOpen(false);
      resetForm();
      toast.success(
        isEditing
          ? `Dados de ${trimmedName} atualizados!`
          : `${trimmedName} cadastrado com sucesso!`
      );
    } catch (err) {
      console.error("Erro ao salvar aluno:", err);
      toast.error("Erro ao salvar aluno. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger
          className="inline-flex items-center"
          onClick={() => setOpen(true)}
        >
          {trigger}
        </DialogTrigger>
      ) : (
        <DialogTrigger
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Aluno
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Aluno" : "Novo Aluno"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="name">Nome completo <span className="text-destructive">*</span></Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nome do aluno"
                autoFocus
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Idade <span className="text-destructive">*</span></Label>
              <Input
                id="age"
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="10"
                min="3"
                max="18"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={category}
                onValueChange={(val) => { if (val != null) setCategory(val as StudentCategory); }}
                disabled={loading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="guardian">Responsável <span className="text-destructive">*</span></Label>
              <Input
                id="guardian"
                value={guardian}
                onChange={(e) => setGuardian(e.target.value)}
                placeholder="Nome do responsável"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">
                Telefone <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  if (phoneError) setPhoneError("");
                }}
                placeholder="(11) 99999-9999"
                disabled={loading}
                aria-invalid={!!phoneError}
                aria-describedby={phoneError ? "phone-error" : undefined}
                className={phoneError ? "border-destructive focus-visible:ring-destructive" : ""}
              />
              {phoneError && (
                <p id="phone-error" className="text-xs text-destructive">
                  {phoneError}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@exemplo.com"
                disabled={loading}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Cadastrar Aluno"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
