import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GripVertical, Plus, Trash2, Edit2, FileText, Save } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface Question {
  id: string;
  texto: string;
  tipo: "sim_nao" | "texto" | "descricao";
  ativa: boolean;
  ordem: number;
}

const defaultQuestions: Question[] = [
  {
    id: "q1",
    texto: "Data de Nascimento",
    tipo: "texto",
    ativa: true,
    ordem: 1,
  },
  {
    id: "q2",
    texto: "Você possui alguma alergia?",
    tipo: "sim_nao",
    ativa: true,
    ordem: 2,
  },
  {
    id: "q3",
    texto: "Você faz uso de medicamentos contínuos?",
    tipo: "sim_nao",
    ativa: true,
    ordem: 3,
  },
  {
    id: "q4",
    texto: "Você possui alguma doença de pele ou condição especial?",
    tipo: "sim_nao",
    ativa: true,
    ordem: 4,
  },
  {
    id: "q5",
    texto: "Você está grávida ou amamentando?",
    tipo: "sim_nao",
    ativa: true,
    ordem: 5,
  },
  {
    id: "q6",
    texto: "Deseja adicionar alguma observação?",
    tipo: "sim_nao",
    ativa: true,
    ordem: 6,
  },
];

const questionTypeLabels = {
  sim_nao: "Sim/Não",
  texto: "Texto curto",
  descricao: "Texto longo",
};

export default function AnamnesisSettings() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [newQuestion, setNewQuestion] = useState<Partial<Question>>({
    texto: "",
    tipo: "sim_nao",
    ativa: true,
  });

  const handleToggleQuestion = (id: string) => {
    setQuestions(
      questions.map((q) =>
        q.id === id ? { ...q, ativa: !q.ativa } : q
      )
    );
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
    toast.success("Pergunta removida com sucesso");
  };

  const handleAddQuestion = () => {
    if (!newQuestion.texto || !newQuestion.tipo) {
      toast.error("Preencha todos os campos");
      return;
    }

    const newQ: Question = {
      id: `q${Date.now()}`,
      texto: newQuestion.texto,
      tipo: newQuestion.tipo as Question["tipo"],
      ativa: true,
      ordem: questions.length + 1,
    };

    setQuestions([...questions, newQ]);
    setNewQuestion({ texto: "", tipo: "sim_nao", ativa: true });
    setIsAddDialogOpen(false);
    toast.success("Pergunta adicionada com sucesso");
  };

  const handleUpdateQuestion = () => {
    if (!editingQuestion) return;

    setQuestions(
      questions.map((q) =>
        q.id === editingQuestion.id ? editingQuestion : q
      )
    );
    setEditingQuestion(null);
    toast.success("Pergunta atualizada com sucesso");
  };

  const handleSaveConfiguration = () => {
    // Aqui seria salvo no backend
    toast.success("Configurações da ficha salvas com sucesso!");
  };

  const moveQuestion = (index: number, direction: "up" | "down") => {
    const newQuestions = [...questions];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newQuestions.length) return;

    [newQuestions[index], newQuestions[targetIndex]] = [
      newQuestions[targetIndex],
      newQuestions[index],
    ];

    // Atualizar ordem
    newQuestions.forEach((q, i) => {
      q.ordem = i + 1;
    });

    setQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-primary/10 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-primary-dark">
                Configurações da Ficha de Anamnese
              </h1>
              <p className="text-sm text-muted-foreground">
                Personalize as perguntas da ficha de anamnese dos seus clientes
              </p>
            </div>
            <Button onClick={handleSaveConfiguration} className="shadow-lg">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="space-y-6">
          {/* Info Card */}
          <Card className="bg-blue-50/50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-blue-900">
                    💡 Como funciona
                  </p>
                  <p className="text-sm text-blue-700">
                    As perguntas configuradas aqui aparecerão na ficha de anamnese que você
                    preenche para cada cliente. Você pode ativar/desativar, adicionar novas
                    perguntas e reorganizar a ordem.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Add Question Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary-dark">
              Perguntas da Ficha ({questions.length})
            </h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Pergunta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Nova Pergunta</DialogTitle>
                  <DialogDescription>
                    Adicione uma nova pergunta à ficha de anamnese
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="question-text">Texto da Pergunta</Label>
                    <Input
                      id="question-text"
                      placeholder="Ex: Você possui tatuagens?"
                      value={newQuestion.texto}
                      onChange={(e) =>
                        setNewQuestion({ ...newQuestion, texto: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="question-type">Tipo de Resposta</Label>
                    <Select
                      value={newQuestion.tipo}
                      onValueChange={(value) =>
                        setNewQuestion({
                          ...newQuestion,
                          tipo: value as Question["tipo"],
                        })
                      }
                    >
                      <SelectTrigger id="question-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sim_nao">Sim/Não</SelectItem>
                        <SelectItem value="texto">Texto curto</SelectItem>
                        <SelectItem value="descricao">Texto longo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleAddQuestion}>Adicionar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Questions List */}
          <div className="space-y-3">
            {questions.map((question, index) => (
              <Card
                key={question.id}
                className={`shadow-card transition-all ${
                  !question.ativa ? "opacity-50 bg-muted/30" : ""
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Drag Handle */}
                    <div className="flex flex-col gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveQuestion(index, "up")}
                        disabled={index === 0}
                      >
                        ▲
                      </Button>
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => moveQuestion(index, "down")}
                        disabled={index === questions.length - 1}
                      >
                        ▼
                      </Button>
                    </div>

                    {/* Question Info */}
                    <div className="flex-1">
                      <p className="font-medium text-primary-dark">
                        {question.texto}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Tipo: {questionTypeLabels[question.tipo]}
                      </p>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`toggle-${question.id}`} className="text-sm">
                          {question.ativa ? "Ativa" : "Inativa"}
                        </Label>
                        <Switch
                          id={`toggle-${question.id}`}
                          checked={question.ativa}
                          onCheckedChange={() => handleToggleQuestion(question.id)}
                        />
                      </div>

                      <Dialog
                        open={editingQuestion?.id === question.id}
                        onOpenChange={(open) => {
                          if (!open) setEditingQuestion(null);
                          else setEditingQuestion(question);
                        }}
                      >
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Editar Pergunta</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label>Texto da Pergunta</Label>
                              <Input
                                value={editingQuestion?.texto || ""}
                                onChange={(e) =>
                                  setEditingQuestion(
                                    editingQuestion
                                      ? { ...editingQuestion, texto: e.target.value }
                                      : null
                                  )
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo de Resposta</Label>
                              <Select
                                value={editingQuestion?.tipo}
                                onValueChange={(value) =>
                                  setEditingQuestion(
                                    editingQuestion
                                      ? {
                                          ...editingQuestion,
                                          tipo: value as Question["tipo"],
                                        }
                                      : null
                                  )
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="sim_nao">Sim/Não</SelectItem>
                                  <SelectItem value="texto">Texto curto</SelectItem>
                                  <SelectItem value="descricao">Texto longo</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingQuestion(null)}
                            >
                              Cancelar
                            </Button>
                            <Button onClick={handleUpdateQuestion}>Salvar</Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {questions.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6">
            <Button variant="outline" onClick={() => navigate("/dashboard")}>
              Voltar ao Dashboard
            </Button>
            <Button onClick={handleSaveConfiguration} size="lg">
              <Save className="h-4 w-4 mr-2" />
              Salvar Configurações
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
