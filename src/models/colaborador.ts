import { Schema, model } from "mongoose";

export type ContaBancaria = {
  titular: string;
  cpfCnpj: string;
  banco: string;
  tipo:
    | "conta_corrente"
    | "conta_poupanca"
    | "conta_corrente_conjunta"
    | "conta_poupanca_conjunta";
  agencia: string;
  numero: string;
  dv: string;
};

export type Colaborador = {
  nome: string;
  telefone: string;
  senha: string;
  email: string;
  dataNascimento: string;
  sexo: string;
  foto: string;
  status: string;
  contaBancaria: ContaBancaria;
  recipientId: string;
  dataCadastro: Date;
};

const colaborador = new Schema<Colaborador>({
  nome: {
    type: String,
    required: [true, "Nome é obrigatório"],
  },
  telefone: {
    type: String,
    required: true,
  },
  senha: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: [true, "E-mail é obrigatório"],
  },
  dataNascimento: {
    type: String,
    required: true,
  },
  sexo: {
    type: String,
    enum: ["M", "F"],
    required: true,
  },
  foto: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ["A", "I"],
    required: true,
    default: "A",
  },
  contaBancaria: {
    titular: {
      type: String,
      required: true,
    },
    cpfCnpj: {
      type: String,
      required: true,
    },
    banco: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: [
        "conta_corrente",
        "conta_poupanca",
        "conta_corrente_conjunta",
        "conta_poupanca_conjunta",
      ],
      required: true,
    },
    agencia: {
      type: String,
      required: true,
    },
    numero: {
      type: String,
      required: true,
    },
    dv: {
      type: String,
      required: true,
    },
  },
  recipientId: {
    type: String,
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

export default model<Colaborador>("Colaborador", colaborador);
