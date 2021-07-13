import { Schema, model } from "mongoose";

export type Endereco = {
  cidade: string;
  logradouro: string;
  uf: string;
  cep: string;
  numero: string;
  pais: string;
};

export type Cliente = {
  nome: string;
  telefone: string;
  email: string;
  senha: string;
  foto: string;
  status: string;
  sexo: string;
  dataNascimento: string;
  documento: {
    tipo: string;
    numero: string;
  };
  endereco: Endereco;
  customerId: string;
  dataCadastro: Date;
};

const cliente = new Schema<Cliente>({
  nome: {
    type: String,
    required: [true, "Nome é obrigatório"],
  },
  telefone: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    required: [true, "E-mail é obrigatório"],
  },
  senha: {
    type: String,
    default: null,
  },
  foto: {
    type: String,
  },
  status: {
    type: String,
    enum: ["A", "I"],
    required: true,
    default: "A",
  },
  sexo: {
    type: String,
    enum: ["M", "F"],
    required: true,
  },
  dataNascimento: {
    type: String,
    required: true,
  },
  documento: {
    tipo: {
      type: String,
      enum: ["cpf", "cnpj"],
      required: true,
    },
    numero: {
      type: String,
      required: true,
    },
  },
  endereco: {
    cidade: String,
    logradouro: String,
    uf: String,
    cep: String,
    numero: String,
    pais: String,
  },
  customerId: {
    type: String,
    required: true,
  },
  dataCadastro: {
    type: Date,
    default: Date.now,
  },
});

export default model<Cliente>("Cliente", cliente);
