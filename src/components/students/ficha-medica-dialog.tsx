"use client";

import { useState } from "react";
import { toast } from "sonner";
import { HeartPulse, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Student, StudentMedicalInfo } from "@/types";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Não sei"];

interface Props {
  student: Student;
  onSave: (id: string, data: Partial<Student>) => Promise<void>;
}

export function FichaMedicaDialog({ student, onSave }: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const med = student.medicalInfo ?? {};
  const [bloodType, setBloodType] = useState(med.bloodType ?? "");
  const [allergies, setAllergies] = useState(med.allergies ?? "");
  const [medications, setMedications] = useState(med.medications ?? "");
  const [specialConditions, setSpecialConditions] = useState(med.specialConditions ?? "");
  const [healthInsurance, setHealthInsurance] = useState(med.healthInsurance ?? "");
  const [emergencyName, setEmergencyName] = useState(med.emergencyContactName ?? "");
  const [emergencyPhone, setEmergencyPhone] = useState(med.emergencyContactPhone ?? "");
  const [parentAuth, setParentAuth] = useState(med.parentAuthorization ?? false);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const raw: Record<string, unknown> = {
        bloodType: bloodType || null,
        allergies: allergies.trim() || null,
        medications: medications.trim() || null,
        specialConditions: specialConditions.trim() || null,
        healthInsurance: healthInsurance.trim() || null,
        emergencyContactName: emergencyName.trim() || null,
        emergencyContactPhone: emergencyPhone.trim() || null,
        parentAuthorization: parentAuth,
      };
      // Remove null values so Firestore doesn't complain
      const medicalInfo = Object.fromEntries(
        Object.entries(raw).filter(([, v]) => v !== null)
      ) as StudentMedicalInfo;
      await onSave(student.id, { medicalInfo });
      toast.success("Ficha médica salva!");
      setOpen(false);
    } catch {
      toast.error("Erro ao salvar ficha médica.");
    } finally {
      setSaving(false);
    }
  }

  const hasData = !!(med.bloodType || med.allergies || med.emergencyContactName);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Ficha Médica"
        className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
          hasData
            ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
            : "bg-muted/40 border border-border/30 text-muted-foreground hover:bg-muted/60"
        }`}
      >
        <HeartPulse className="w-3.5 h-3.5" />
        {hasData ? "Ver ficha" : "Ficha médica"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <HeartPulse className="w-5 h-5 text-rose-400" />
              Ficha Médica — {student.name}
            </DialogTitle>
            <DialogDescription>
              Informações de saúde e contato de emergência. Visível apenas para a equipe.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-5 mt-1">
            {/* Tipo sanguíneo */}
            <div className="space-y-2">
              <Label>Tipo Sanguíneo</Label>
              <Select value={bloodType} onValueChange={setBloodType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Não informado</SelectItem>
                  {BLOOD_TYPES.map((bt) => (
                    <SelectItem key={bt} value={bt}>{bt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Alergias */}
            <div className="space-y-2">
              <Label htmlFor="allergies">Alergias</Label>
              <Input
                id="allergies"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="Ex: amendoim, penicilina, poeira..."
              />
            </div>

            {/* Medicamentos */}
            <div className="space-y-2">
              <Label htmlFor="medications">Medicamentos em uso</Label>
              <Input
                id="medications"
                value={medications}
                onChange={(e) => setMedications(e.target.value)}
                placeholder="Ex: Ritalina 10mg (manhã)"
              />
            </div>

            {/* Condições especiais */}
            <div className="space-y-2">
              <Label htmlFor="conditions">Condições especiais</Label>
              <Input
                id="conditions"
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                placeholder="Ex: asma, diabetes, epilepsia..."
              />
            </div>

            {/* Plano de saúde */}
            <div className="space-y-2">
              <Label htmlFor="insurance">Plano de Saúde</Label>
              <Input
                id="insurance"
                value={healthInsurance}
                onChange={(e) => setHealthInsurance(e.target.value)}
                placeholder="Ex: Unimed, SUS, Bradesco Saúde..."
              />
            </div>

            {/* Contato de emergência */}
            <div className="rounded-lg border border-border/40 bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-semibold text-foreground uppercase tracking-wide">Contato de Emergência</p>
              <div className="space-y-2">
                <Label htmlFor="emergName">Nome</Label>
                <Input
                  id="emergName"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="Nome do responsável de emergência"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergPhone">Telefone</Label>
                <Input
                  id="emergPhone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            {/* Autorização dos pais */}
            <div className="flex items-start gap-3 rounded-lg border border-border/40 bg-muted/20 p-4">
              <input
                type="checkbox"
                id="parentAuth"
                checked={parentAuth}
                onChange={(e) => setParentAuth(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-primary rounded"
              />
              <label htmlFor="parentAuth" className="text-sm text-foreground leading-snug cursor-pointer">
                <span className="flex items-center gap-1.5 font-medium mb-0.5">
                  <Shield className="w-3.5 h-3.5 text-primary" />
                  Autorização dos pais
                </span>
                Os responsáveis autorizaram a participação do aluno em treinos e jogos, e o atendimento médico de emergência quando necessário.
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={saving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Salvando...</> : "Salvar Ficha"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
